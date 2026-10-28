import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/personal-work-organiser.ts'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const row=(family,id,extra={})=>({family,id,title:'TEST ONLY '+id,body:'Independent writing',links:[],rev:3,createdAt:'2026-10-26T10:00:00.000Z',updatedAt:'2026-10-26T10:00:00.000Z',trashedAt:null,actor:'user',synthetic:true,...extra});
const receipt=(command,extra={})=>({operationId:command.operationId,status:'committed',recordRef:{family:command.family,id:command.id,rev:command.expectedRev+1},replayed:false,...extra});

test('independent quick changes append while a different row is saving; duplicate same-record change stays fenced',()=>{
 const a={...api.disposalTask(row('annotation','one'),'op-one'),quick:true,state:'saving'},b={...api.disposalTask(row('flag','two'),'op-two'),quick:true};
 const queue=api.appendOrganiserTask([a],b);assert.equal(queue.length,2);assert.deepEqual(queue[0].command,a.command);assert.equal(queue[0].state,'saving');assert.ok(api.taskBlocksRecord(queue[0],row('annotation','one')));assert.equal(api.taskBlocksRecord(queue[0],row('annotation','two')),false);assert.throws(()=>api.appendOrganiserTask(queue,api.disposalTask(row('annotation','one'),'different-op')),/retained change/);
 const old=Array.from({length:30},(_,i)=>({...api.disposalTask(row('note','old-'+i),'old-op-'+i),state:'committed'}));const bounded=api.appendOrganiserTask(old,b);assert.equal(bounded.length,30);assert.equal(bounded.at(-1).command.operationId,'op-two');
 const busy=old.map(task=>({...task,state:'uncertain'}));assert.throws(()=>api.appendOrganiserTask(busy,b),/pending change/);
});
test('acknowledged removal patches only its family/id and never restores stale rows after late receipt replay',()=>{
 const a=row('annotation','shared'),note=row('note','shared'),task=api.disposalTask(a,'remove-one');
 const after=api.applyOrganiserReceipt([a,note],task.command,receipt(task.command));assert.equal(after[0].rev,4);assert.ok(after[0].trashedAt);assert.deepEqual(after[1],note);assert.deepEqual(api.workRows(after).map(api.workKey),['note:shared']);
 const newer={...a,rev:6,body:'Later independently acknowledged writing'};assert.deepEqual(api.applyOrganiserReceipt([newer],task.command,receipt(task.command)),[newer]);
 const restored={...a,rev:7,body:'Current restored writing'};const historical=receipt(task.command,{record:restored,replayed:true});assert.deepEqual(api.applyOrganiserReceipt([a],task.command,historical),[restored]);
 assert.deepEqual(api.applyOrganiserReceipt([a],task.command,{...receipt(task.command),operationId:'wrong'}),[a]);assert.deepEqual(api.applyOrganiserReceipt([a],task.command,{...receipt(task.command),status:'conflict'}),[a]);
});
test('unflag and restore use acknowledged actions without refetching unrelated saved work',()=>{
 const flag=row('flag','flag',{bookmark:{active:true,target:{kind:'record',family:'article',id:'source'}}}),off=api.disposalTask(flag,'unflag');const values=api.applyOrganiserReceipt([flag],off.command,receipt(off.command));assert.equal(api.flagIsActive(values[0]),false);assert.equal(api.workRows(values).length,0);assert.equal(api.workRows(values,{tab:'trash'}).length,1);
 const deleted=row('annotation','deleted',{trashedAt:'2026-10-26T11:00:00.000Z'}),restore=api.disposalTask(deleted,'restore',true),restored=api.applyOrganiserReceipt([deleted],restore.command,receipt(restore.command));assert.equal(restored[0].trashedAt,null);assert.equal(api.workRows(restored).length,1);
});
test('annotation edit recovery keeps exact independent prose/base revision, not captured source words or arbitrary Note bodies',()=>{
 const annotation=row('annotation','a',{anchor:{articleId:'source',recordFamily:'article',rendition:'source-edition',sectionId:'s',partId:'p',start:0,end:6,quote:'PRIVATE SOURCE QUOTE'}}),task=api.annotationEditTask(annotation,'New independent writing','edit-operation');assert.equal(task.command.expectedRev,3);assert.equal(task.command.data.body,'New independent writing');assert.equal(task.quick,true);assert.doesNotMatch(JSON.stringify(task),/PRIVATE SOURCE QUOTE/);
 const retained=api.retainableTasks([{...task,state:'saving'}]);const again=api.restoreOrganiserTasks(retained);assert.deepEqual(again[0].command,task.command);assert.equal(again[0].state,'uncertain');assert.equal(again[0].quick,true);assert.doesNotMatch(JSON.stringify(retained),/PRIVATE SOURCE QUOTE/);
 const committed=api.applyOrganiserReceipt([annotation],task.command,receipt(task.command));assert.equal(committed[0].body,'New independent writing');assert.deepEqual(committed[0].anchor,annotation.anchor);
 for(const command of [{...task.command,family:'note'},{...task.command,data:{body:'Writing',anchor:annotation.anchor}},{...task.command,data:{body:'x'.repeat(4001)}}])assert.equal(api.restoreOrganiserTasks({version:1,tasks:[{...task,command}]}).length,0);
});

test('Flag target revisions protect a later reflag even when canonical record revision is unchanged',()=>{
 const original=row('flag','bookmark',{bookmark:{targetKey:'target-key',targetRev:4,active:true}}),command=api.disposalTask(original,'off').command;
 const off=receipt(command,{recordRef:{family:'flag',id:'bookmark',rev:3},bookmark:{targetKey:'target-key',targetRev:5,active:false,available:true}});
 const values=api.applyOrganiserReceipt([original],command,off);assert.equal(values[0].rev,3);assert.equal(values[0].bookmark.targetRev,5);assert.equal(values[0].bookmark.active,false);
 const reflagged={...original,bookmark:{targetKey:'target-key',targetRev:6,active:true}};assert.deepEqual(api.applyOrganiserReceipt([reflagged],command,{...off,replayed:true}),[reflagged]);assert.equal(api.preferOrganiserRecord(reflagged,values[0]),false);
 assert.deepEqual(api.applyOrganiserReceipt([original],command,{...off,recordRef:{family:'note',id:'different',rev:4}}),[original]);
});

test('actual D1 independent removals acknowledge separately; explicit fresh pagination recovers stale cursor without resurrecting removed rows',async()=>{
 const {privateStorageFixture}=await import('./private-storage-fixture.mjs');
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:(request,env)=>domainHandler(request,env)}");
 try{
  const client=fixture.client('TEST-ONLY-fast-organiser');const notes=[];
  for(let n=0;n<3;n++){const created=await client.command({action:'create',family:'note',id:'fast-note-'+n,data:{title:'TEST ONLY fast Note '+n,body:'Independent original test writing '+n,bodyFormat:'markdown-v1',synthetic:true}});assert.equal(created.status,200,JSON.stringify(created.data));notes.push(created.data.record??(await client.context('note','fast-note-'+n)).data.record);}
  const first=await client.request('/api/query?personal=1&family=note&limit=2');assert.equal(first.status,200);assert.equal(first.data.records.length,2);assert.ok(first.data.nextCursor);const cursor=first.data.nextCursor;
  const tasks=first.data.records.map((record,n)=>({...api.disposalTask(record,'fast-remove-'+n),quick:true}));let requests=0;
  const acknowledgements=await Promise.all(tasks.map(async task=>{requests++;const result=await client.command(task.command);assert.equal(result.status,200,JSON.stringify(result.data));return {task,receipt:result.data};}));assert.equal(requests,2);
  let visible=first.data.records;for(const {task,receipt} of acknowledgements){assert.equal(api.taskReceipt(task,receipt).state,'committed');visible=api.applyOrganiserReceipt(visible,task.command,receipt);}assert.equal(api.workRows(visible).length,0);
  const stale=await client.request('/api/query?'+new URLSearchParams({personal:'1',family:'note',limit:'2',cursor}));assert.ok([400,409].includes(stale.status),'a mutation invalidates the old namespace-bound cursor');
  // The organiser waits for an explicit Load more, restarts this same finite
  // query and merges it with retained receipt projections instead of clearing UI.
  const fresh=await client.request('/api/query?personal=1&family=note&limit=2');assert.equal(fresh.status,200);assert.equal(fresh.data.records.length,1);const merged=[...visible,...fresh.data.records];assert.equal(api.workRows(merged).length,1);assert.ok(!tasks.some(task=>task.command.id===api.workRows(merged)[0].id));
 }finally{await fixture.dispose()}
});
