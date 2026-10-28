import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts"; export default {fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const activity=text=>({contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'TEST ONLY retained edition regression',blocks:[{id:'task',kind:'instruction',text},{id:'hints',kind:'hint-ladder',hints:[{id:'concept',tier:'concept',text:'Inspect one assumption.'}]}]});
test('a new Attempt may bind a retained Activity without weakening generic link/current-rights guards',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('synthetic-retained-attempt'),other=f.client('synthetic-retained-other');
 try{
  const publish={purpose:'TEST ONLY retained attempt',operationId:'publish-one',id:'retained-activity',title:'TEST ONLY retained',synthetic:true,activity:activity('First edition')};
  const first=ok(await c.request('/api/activities/publish',publish)).record;
  const annotation=ok(await c.command({operationId:'synthetic-capture',action:'create',family:'annotation',id:'synthetic-capture',data:{title:'TEST ONLY annotation',body:'Independent supplied interpretation.',synthetic:false,anchor:{recordFamily:'experiment',articleId:first.id,rendition:first.rendition,sectionId:'activity',partId:'task',start:0,end:13,quote:'First edition'}}})).record;assert.equal(annotation.synthetic,true,'New captures inherit an explicitly synthetic origin even if a client omits the marker.');
  const current=ok(await c.request('/api/activities/publish',{...publish,operationId:'publish-two',expectedRev:first.rev,activity:activity('Second edition')})).record;
  const request={purpose:'Explicit TEST ONLY supplied evidence',operationId:'attempt-old',id:'attempt-old',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:first.id,rendition:first.rendition},state:'submitted',hintsRevealed:['concept'],evidence:[{classification:'supplied-terminal',text:'TEST ONLY supplied output; not executed.\n'}]}};
  const saved=ok(await c.request('/api/activities/attempt',request));assert.equal(saved.receipt.status,'committed');assert.equal(saved.record.attempt.activity.rendition,first.rendition);
  assert.equal(new URL(saved.deepLink,'https://example.invalid').searchParams.get('view'),'work');
  const replay=ok(await c.request('/api/activities/attempt',request));assert.equal(replay.receipt.replayed,true);assert.equal(replay.record.id,saved.record.id);
  const repin=await c.request('/api/activities/attempt',{...request,operationId:'repin',expectedRev:saved.record.rev,attempt:{...request.attempt,activity:{...request.attempt.activity,rendition:current.rendition}}});assert.equal(repin.status,409);
  const invalid=await c.request('/api/activities/attempt',{...request,operationId:'invented',id:'invented',attempt:{...request.attempt,activity:{...request.attempt.activity,rendition:'r-'+'f'.repeat(64)}}});assert.equal(invalid.status,409);
  const hint=await c.request('/api/activities/attempt',{...request,operationId:'bad-hint',id:'bad-hint',attempt:{...request.attempt,hintsRevealed:['unknown']}});assert.equal(hint.status,409);
  const generic=await c.command({operationId:'stale-link',action:'create',family:'note',id:'stale-link',data:{title:'TEST ONLY stale link',synthetic:true,links:[{family:'experiment',id:first.id,rendition:first.rendition}]}});assert.equal(generic.status,409);assert.equal(generic.data.code,'destination_changed');
  assert.equal((await other.request('/api/activities/attempt',{...request,operationId:'foreign',id:'foreign'})).status,409);
  const route=ok(await c.command({operationId:'route',action:'create',family:'journey',id:'route',data:{title:'TEST ONLY exact route',body:'Synthetic route.',synthetic:true,links:[{family:'experiment',id:first.id}]}})).record;
  ok(await c.command({operationId:'linked-note',action:'create',family:'note',id:'linked-note',data:{title:'TEST ONLY linked note',body:'Synthetic commentary.',synthetic:true,links:[{family:'journey',id:route.id}]}}));
  const context=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_activity_context',arguments:{purpose:'TEST ONLY canonical links',query:route.title,includeSynthetic:true}}}));const resumed=JSON.parse(context.result.content[0].text);assert.equal(new URL(resumed.targets[0].deepLink,'https://example.invalid').searchParams.get('view'),'journeys');assert.equal(new URL(resumed.notes[0].deepLink,'https://example.invalid').searchParams.get('view'),'work');
  ok(await c.command({operationId:'trash',action:'trash',family:'experiment',id:first.id,expectedRev:current.rev}));
  assert.equal((await c.request('/api/activities/attempt',{...request,operationId:'trashed',id:'trashed'})).status,409);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n,0);
 }finally{await f.dispose();}
});
