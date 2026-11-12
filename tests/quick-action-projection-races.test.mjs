import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/workspace-command-client.ts'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const ui=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const row=(id,rev=1,extra={})=>({family:'annotation',id,title:'TEST ONLY '+id,body:'Independent writing',rev,createdAt:'2026-10-26T12:00:00Z',updatedAt:'2026-10-26T12:00:00Z',actor:'user',links:[],trashedAt:null,...extra});
const cmd=(id,extra={})=>({operationId:'race-'+id,action:'update',family:'annotation',id,expectedRev:1,data:{body:'Revised own writing'},...extra});
const ack=(command,record)=>({operationId:command.operationId,status:'committed',replayed:false,record,recordRef:{family:record.family,id:record.id,rev:record.rev}});

test('permission changes fence full delayed projections while preserving exact committed identity',()=>{
 const command=cmd('a'),record=row('a',2),receipt={...ack(command,record),records:[row('b')]};
 assert.deepEqual(ui.clientReceiptAtPermissionEpoch(receipt,4,4),receipt);
 const fenced=ui.clientReceiptAtPermissionEpoch(receipt,4,5);
 assert.equal(fenced.record,undefined);assert.equal(fenced.records,undefined);
 assert.deepEqual(fenced.recordRef,receipt.recordRef);assert.equal(fenced.operationId,command.operationId);assert.equal(fenced.status,'committed');
 assert.equal(receipt.record,record,'fencing must not mutate the original response or its other consumers');
});

test('a pre-write search page cannot resurrect deleted or earlier edited rows and retains fresh server-only results',()=>{
 const overlay=ui.createClientCommitOverlay(),edit=cmd('edited'),saved=row('edited',2,{body:edit.data.body}),deleted=row('deleted'),remove=cmd('deleted',{action:'trash',data:undefined});
 overlay.remember(edit,ack(edit,saved));overlay.remember(remove,{operationId:remove.operationId,status:'committed',replayed:false,recordRef:{family:'annotation',id:'deleted',rev:2}});
 const fresh=row('server-only'),page=overlay.reconcilePage([row('edited'),deleted,fresh],[saved]);
 assert.equal(page.find(record=>record.id==='edited')?.body,edit.data.body);
 assert.equal(page.some(record=>record.id==='deleted'),false);assert.ok(page.some(record=>record.id==='server-only'));
 const newer=row('edited',3,{body:'Later independent revision'});
 assert.equal(overlay.reconcilePage([newer],[saved]).find(record=>record.id==='edited')?.rev,3);
 assert.equal(overlay.reconcilePage([{...newer,trashedAt:'2026-10-26T13:00:00Z'}],[saved]).some(record=>record.id==='edited'),false,'a newer server tombstone cannot be replaced by an older acknowledged live row');
 overlay.clear();assert.ok(overlay.reconcilePage([deleted],[]).some(record=>record.id==='deleted'),'a fresh scope/generation cannot inherit a previous scope tombstone');
});

test('Flag target clocks fence same-record-revision stale pages and out-of-order replay tombstones',()=>{
 const overlay=ui.createClientCommitOverlay(),flag=row('flag',2,{family:'flag',bookmark:{active:true,targetKey:'exact-target',targetRev:7,available:true}}),off=cmd('flag',{action:'setFlag',family:undefined,id:undefined,target:{kind:'record',family:'article',id:'target'},active:false,expectedTargetRev:3});
 const receipt={operationId:off.operationId,status:'committed',replayed:true,recordRef:{family:'flag',id:'flag',rev:2},bookmark:{active:false,targetKey:'exact-target',targetRev:4,available:true,flagRef:{family:'flag',id:'flag',rev:2}}};
 overlay.remember(off,receipt);
 const page=overlay.reconcilePage([{...flag,bookmark:{...flag.bookmark,targetRev:3}}],[flag]);
 assert.equal(page.length,1);assert.equal(page[0].bookmark.targetRev,7);assert.equal(page[0].bookmark.active,true);
});

test('generic workspace reconciliation preserves unseen recoverable Trash without reviving stale live rows',()=>{
 const overlay=ui.createClientCommitOverlay(),trashed=row('unseen-trash',3,{trashedAt:'2026-10-26T13:00:00Z'});
 assert.deepEqual(overlay.reconcilePage([trashed],[],{includeTrash:true}),[trashed]);
 assert.deepEqual(overlay.reconcilePage([trashed],[]),[],'search and selected active-record reads still omit Trash');
 const remove=cmd('deleted',{action:'trash',data:undefined}),savedTrash=row('deleted',2,{trashedAt:'2026-10-26T13:00:00Z'});
 overlay.remember(remove,ack(remove,savedTrash));
 assert.deepEqual(overlay.reconcilePage([row('deleted')],[],{includeTrash:true}),[],'an earlier active workspace page cannot resurrect the acknowledged deletion');
 assert.deepEqual(overlay.reconcilePage([savedTrash],[],{includeTrash:true}),[savedTrash],'the actual acknowledged trashed projection stays recoverable');
 const restored=row('deleted',3);
 assert.deepEqual(overlay.reconcilePage([restored],[savedTrash],{includeTrash:true}),[restored],'a genuinely newer restore remains authoritative');
});

test('Source scrubbing removes only affected projected excerpts and preserves editions, own prose and ordinary captures',()=>{
 const article=row('display',8,{family:'article',rendition:'retained-edition',body:'Independent article prose',sections:[{id:'s',title:'Original and interpretation',parts:[{id:'withheld',kind:'excerpt',text:'WithheldCanary',excerpt:{sourceId:'revoked',rendition:'source-edition',start:0,end:14}},{id:'permitted',kind:'excerpt',text:'Still permitted excerpt',excerpt:{sourceId:'other-source',rendition:'other-edition',start:0,end:23}},{id:'own',kind:'paragraph',text:'Independent explanation'}]}]}),ordinary=row('ordinary',3,{anchor:{recordFamily:'article',articleId:'display',rendition:'retained-edition',sectionId:'s',partId:'own',start:0,end:11,quote:'Independent'}});
 const result=ui.scrubSourceQuotes([article,ordinary],new Set(['revoked']));
 assert.ok(!JSON.stringify(result).includes('WithheldCanary'));assert.equal(result[0].sections[0].parts[1].text,'Still permitted excerpt');assert.equal(result[0].sections[0].parts[2].text,'Independent explanation');assert.equal(result[0].rev,8);assert.equal(result[0].rendition,'retained-edition');assert.equal(result[1].anchor.quote,'Independent');assert.equal(article.sections[0].parts[0].text,'WithheldCanary','source caches are copied rather than mutated under other readers');
});

test('real D1 delayed Annotation ACK cannot reintroduce a Source quotation after revocation',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler}");
 try{
  const c=f.client('TEST-ONLY-quick-projection-race'),ok=async promise=>{const result=await promise;assert.equal(result.status,200,JSON.stringify(result.data));return result.data;},secret='SyntheticRaceSourceCanary';
  const source=(await ok(c.command({action:'create',family:'source',id:'race-source',data:{title:'TEST ONLY admitted Source',body:'Independent source context.',synthetic:true,source:{url:'https://example.invalid/race-source',attribution:'Synthetic owner-authored test',rights:'permitted-excerpt',excerpt:{id:'race-grant',text:secret,locator:'Synthetic paragraph 1',edition:'Synthetic edition 1',basis:'owner-authored',permissionNote:'The synthetic owner deliberately admits this original test text.',ownerAttested:true,state:'permitted',exportAllowed:false}}}}))).record;
  const anchor={recordFamily:'source',articleId:source.id,rendition:source.rendition,sectionId:'__article',partId:'__excerpt',start:0,end:secret.length,quote:secret};
  const annotation=(await ok(c.command({action:'create',family:'annotation',id:'race-annotation',data:{title:'TEST ONLY independent writing',body:'My own interpretation remains.',anchor,synthetic:true}}))).record;
  const edit=cmd(annotation.id,{operationId:'race-delayed-save',expectedRev:annotation.rev,data:{body:'Revised own interpretation remains.'}});
  // The write is committed and projected under permission epoch 0. Delivery to
  // the client is deliberately held while another actual command revokes it.
  const delayed=await ok(c.command(edit));assert.equal(delayed.record.anchor.quote,secret);
  await ok(c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}}));
  const scrubbed=ui.scrubSourceQuotes([source,annotation],new Set([source.id]));
  assert.ok(!JSON.stringify(scrubbed).includes(secret));assert.equal(scrubbed[1].body,annotation.body);assert.equal(scrubbed[1].rev,annotation.rev);
  const safe=ui.clientReceiptAtPermissionEpoch(delayed,0,1),merged=ui.reconcileWorkspaceReceipt(scrubbed,edit,safe);
  assert.ok(!JSON.stringify(merged).includes(secret));assert.equal(safe.recordRef.rev,2);
  const current=(await ok(c.context('annotation',annotation.id))).record;
  assert.equal(current.anchor.quote,'');assert.equal(current.body,edit.data.body);assert.equal(current.rev,2);
  const reconciled=ui.reconcileWorkspaceReceipt(merged,edit,{...safe,record:current});assert.equal(reconciled.find(record=>record.id===annotation.id).body,edit.data.body);assert.ok(!JSON.stringify(reconciled).includes(secret));
 }finally{await f.dispose()}
});
