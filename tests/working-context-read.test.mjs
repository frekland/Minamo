import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async pending=>{const response=await pending;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const working=(client,input={})=>client.request('/api/learning-context',{scope:'working',...input});
const mcp=(client,input={})=>client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_working_context',arguments:{purpose:'Inspect explicitly selected evidence',...input}}});

test('A-READ: a blank or projectless selection reads independent writing without creating an episode, link or operation',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-independent'),other=f.client('working-other');
  const note=(await ok(c.command({action:'create',family:'note',id:'capture-free',data:{title:'An independent observation',body:'An unresolved question.',synthetic:false}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const blank=await ok(working(c));
  assert.equal(blank.contract,'minamo.working-context.v1');assert.deepEqual(blank.selected,[]);assert.equal(blank.selectionIsSaved,false);
  assert.ok(blank.evidence.items.some(item=>item.source.id===note.id));assert.equal(blank.lastSeenByGpt,'unknown');
  const selected=await ok(working(c,{selectedRefs:[{family:'note',id:note.id}]}));
  assert.equal(selected.selected[0].title,note.title);assert.equal(selected.selected[0].source.rev,note.rev);
  assert.equal(selected.selected[0].status,'available');assert.deepEqual(selected.relations,[]);
  assert.equal((await working(c,{selectedRefs:[{family:'note',id:note.id}],origin:{v:1,task:{family:'investigation',id:'invented'}}})).status,400,'navigation metadata is not accepted as an authored graph relationship');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
  assert.equal((await ok(working(other))).selected.length,0);
  assert.deepEqual((await ok(working(other,{selectedRefs:[{family:'note',id:note.id}]}))).selected.map(item=>item.status),['unavailable']);
 }finally{await f.dispose();}
});

test('A-PATH: an admitted Project→Question→Note, two explicit Note targets and selected Note→Note→Question remain distinct',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-path-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'working-project',data:{title:'Optional Project guide',body:'Authored route.',synthetic:false,sections:[{id:'intro',title:'Stage',parts:[{id:'p',kind:'paragraph',text:'A stage.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage',sectionId:'intro',title:'Stage'}]}}}))).record;
  const q=(await ok(c.command({action:'create',family:'investigation',id:'working-question',data:{title:'Open task',body:'No settled answer.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record;
  const second=(await ok(c.command({action:'create',family:'note',id:'working-second',data:{title:'Second saved Note',body:'A later interpretation.',synthetic:false,links:[{family:'investigation',id:q.id}]}}))).record;
  const first=(await ok(c.command({action:'create',family:'note',id:'working-first',data:{title:'First saved Note',body:'A competing interpretation.',synthetic:false,links:[{family:'note',id:second.id},{family:'investigation',id:q.id}]}}))).record;
  const unrelated=(await ok(c.command({action:'create',family:'note',id:'working-unrelated',data:{title:'Not a relation',body:'Different notes.',synthetic:false}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const page=await ok(working(c,{focus:{family:'journey',id:project.id},selectedRefs:[{family:'note',id:first.id}]}));
  assert.deepEqual(new Set(page.evidence.items.map(item=>item.source.id)),new Set([first.id,second.id]));
  assert.deepEqual(new Set(page.evidence.items.find(item=>item.source.id===first.id).paths.map(path=>path.target.investigationId)),new Set([q.id]));
  assert.ok(page.relations.some(relation=>relation.to.id===second.id&&relation.path.length===1));
  assert.ok(page.relations.some(relation=>relation.to.id===q.id&&relation.path.length===2),'bounded Note→Note→Question is a verified path, not a guessed edge');
  assert.equal(page.relations.some(relation=>relation.to.id===unrelated.id),false);
  assert.equal(page.selectionIsSaved,false);assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
  const rpc=await ok(mcp(c,{focus:{family:'journey',id:project.id},selectedRefs:[{family:'note',id:first.id}]}));
  assert.equal(rpc.result.isError,false,JSON.stringify(rpc));assert.match(JSON.stringify(rpc),/minamo.working-context.v1/);
 }finally{await f.dispose();}
});

test('A-RIGHTS: pinned edition/selection, partial cursor, revised history and denied links fail closed',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-rights-owner'),other=f.client('working-rights-other');
  const e1=(await ok(c.command({action:'create',family:'article',id:'working-source',data:{title:'Edition source',body:'Edition one.',synthetic:false,sections:[{id:'s',title:'Reading',parts:[{id:'p',kind:'paragraph',text:'A 😀 retained statement.'}]}]}}))).record;
  const linked=(await ok(c.command({action:'create',family:'note',id:'working-linked',data:{title:'Saved exact relationship',body:'My interpretation.',synthetic:false,links:[{family:'article',id:e1.id,rendition:e1.rendition}]}}))).record;
  const e2=(await ok(c.command({action:'update',family:'article',id:e1.id,expectedRev:e1.rev,data:{body:'New edition.'}}))).record;
  await ok(c.command({action:'create',family:'note',id:'working-second-page',data:{title:'Another recorded Note',body:'This is not a link.',synthetic:false}}));
  const selectedRefs=[{family:'article',id:e1.id,rendition:e1.rendition,selection:{sectionId:'s',partId:'p',start:2,end:4}},{family:'article',id:e2.id,rendition:e2.rendition}];
  const page=await ok(working(c,{selectedRefs}));
  assert.equal(page.selected.length,2);assert.notEqual(page.selected[0].source.rendition,page.selected[1].source.rendition);
  assert.equal(page.selected[0].status,'available');assert.equal(page.selected[0].selection.start,2);
  assert.equal((await working(c,{selectedRefs:[{family:'article',id:e1.id,selection:selectedRefs[0].selection}]})).status,400);
  assert.equal((await working(c,{selectedRefs:[{family:'article',id:e1.id,rendition:e1.rendition,selection:{...selectedRefs[0].selection,start:3}}]})).status,409);
  assert.deepEqual((await ok(working(other,{selectedRefs}))).selected.map(x=>x.status),['unavailable','unavailable']);
  const start=await ok(working(c,{limit:1,selectedRefs:[{family:'note',id:linked.id}]}));assert.ok(start.evidence.coverage.nextCursor);
  await ok(c.command({action:'trash',family:'article',id:e2.id,expectedRev:e2.rev}));
  assert.equal((await working(c,{limit:1,cursor:start.evidence.coverage.nextCursor,selectedRefs:[{family:'note',id:linked.id}]})).status,409);
  const denied=await ok(working(c,{selectedRefs:[{family:'note',id:linked.id},{family:'article',id:e1.id,rendition:e1.rendition}]}));
  assert.equal(denied.selected[1].status,'unavailable');assert.equal(denied.relations.some(x=>x.to.id===e1.id),false);
  assert.doesNotMatch(JSON.stringify(denied),/A 😀 retained statement/);
 }finally{await f.dispose();}
});

test('A-BOUND: selected relation fan-out stays within query/byte limits and never claims complete coverage',{timeout:120000},async()=>{
 const measured=`import {domainHandler} from './lib/domain-handler.ts';export default {async fetch(request,env){let count=0;const db=env.DB;const response=await domainHandler(request,{...env,DB:{prepare(sql){count++;return db.prepare(sql)},batch(statements){return db.batch(statements)},exec(sql){return db.exec(sql)}}});response.headers.set('X-Test-Queries',String(count));return response;}};`;
 const f=await privateStorageFixture(measured);try{
  const c=f.client('working-bounded-owner'),links=[];
  for(let i=0;i<13;i++){
   const item=(await ok(c.command({action:'create',family:'note',id:'bounded-target-'+i,data:{title:'Target '+i,body:'A distinct saved observation.',synthetic:false}}))).record;
   links.push({family:'note',id:item.id});
  }
  const hub=(await ok(c.command({action:'create',family:'note',id:'bounded-hub',data:{title:'Hub Note',body:'The learner has selected this exact Note.',synthetic:false,links}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const response=await c.request('/api/learning-context',{scope:'working',selectedRefs:[{family:'note',id:hub.id}],limit:1});
  const page=await ok(Promise.resolve(response));
  assert.equal(page.relations.length,12);assert.equal(page.coverage.moreRelations,true);assert.equal(page.coverage.completeWithinScope,false);
  assert.ok(page.coverage.gaps.includes('relations-deferred'));
  assert.ok(Number(response.headers.get('X-Test-Queries'))<=250,'one bounded view cannot issue unbounded D1 reads');
  assert.ok(new TextEncoder().encode(JSON.stringify(page)).length<=65536,'combined response is byte bounded');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
 }finally{await f.dispose();}
});
