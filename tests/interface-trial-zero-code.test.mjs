import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// Original TEST ONLY data. No frontend, registry, runtime, or SDK implementation imports.
const purpose='TEST ONLY original synthetic tide-clock composition; no learner achievement.';
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const originalText='TEST ONLY — In the invented harbor of Luma, a paper tide clock repeats every twelve hours. This fictional description is supplied text, not an observation or an executed simulation.';
const originalTex='h(t)=2+\\cos(\\pi t/6)';
function artefact(kind,format,source,payload){
 return {contract:'minamo.artefact.v1',kind,canonical:{format,source,sha256:createHash('sha256').update(source).digest('hex')},provenance:{classification:'authored',execution:'not-executed'},payload};
}
function originalRequest(){
 return {purpose,operationId:'synthetic-zero-code-tide-clock-publish',id:'synthetic-zero-code-tide-clock',title:'TEST ONLY — Luma paper tide clock',synthetic:true,activity:{
  contract:'minamo.activity.v1',template:'mathematics',intent:'Inspect a fictional harbor description beside an independently authored periodic model.',authorship:'original-exercise',
  blocks:[
   {id:'question',kind:'instruction',text:'Compare the invented harbor description with the displayed model. Identify one assumption without running anything.'},
   {id:'harbor',kind:'foundry',artefact:artefact('text/plain-v1','text',originalText,{text:originalText})},
   {id:'tide-model',kind:'foundry',artefact:artefact('math/tex-v1','tex',originalTex,{contract:'minamo.math.v1',id:'luma-periodic-model',format:'tex',source:originalTex,display:'block',description:'Original fictional model; no measured data or computation receipt.'})},
   {id:'assumption',kind:'reflection',text:'Which assumption connects the fictional prose to the formula? A saved attempt is optional.'},
  ],
  presentation:{contract:'minamo.presentation.v1',version:1,pattern:'mathematics-science',slots:[{slot:'task',blockId:'question'},{slot:'source',blockId:'harbor'},{slot:'explore',blockId:'tide-model'},{slot:'evidence',blockId:'assumption'}],preferredFocus:'explore',fallback:'accessible-source'},
 }};
}
async function rpc(client,name,input={}){
 const response=await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...input}}});
 assert.equal(response.status,200,JSON.stringify(response.data));
 assert.notEqual(response.data.result.isError,true,JSON.stringify(response.data));
 return JSON.parse(response.data.result.content[0].text);
}
async function learningCounts(db){
 const counts={run:(await db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,checkpointRecords:(await db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='checkpoint'").first()).n};
 const {results}=await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
 for(const {name} of results.filter(row=>/checkpoint|learning_developments/i.test(row.name))){
  counts[name]=(await db.prepare('SELECT COUNT(*) n FROM "'+name.replaceAll('"','""')+'"').first()).n;
 }
 assert.ok(Object.hasOwn(counts,'v2_learning_developments'));
 return counts;
}

test('fresh zero-code synthetic composition uses typed local MCP, exact retained source, and owner isolation',{timeout:60000},async t=>{
 t.diagnostic('Starting isolated fixture at frozen trial source; no hosted endpoint.');
 const f=await privateStorageFixture(worker);
 try{
  const owner=f.client('TEST-ONLY-zero-code-tide-owner'),foreign=f.client('TEST-ONLY-zero-code-tide-foreign');
  const caps=await rpc(owner,'get_minamo_activity_capabilities');
  for(const kind of ['text/plain-v1','math/tex-v1'])assert.ok(caps.presentation.foundryKinds.includes(kind),kind+' must already be registered');
  const patternIds=caps.presentation.patterns.map(pattern=>pattern.id);
  assert.ok(patternIds.includes('mathematics-science'));
  assert.ok(patternIds.includes('predict-explore-compare'));
  t.diagnostic('Discovered both existing kinds and both recipe patterns through actual typed MCP.');
  const request=originalRequest(),baseline=await learningCounts(f.db);
  assert.ok(Object.values(baseline).every(count=>count===0));
  const preview=await rpc(owner,'preview_minamo_activity_package',request);
  assert.equal(preview.valid,true);
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,0);
  const published=await rpc(owner,'publish_minamo_activity_package',request);
  assert.equal(published.receipt.status,'committed');
  assert.equal(published.learningDevelopmentCreated,false);
  assert.deepEqual(published.record.activity,request.activity);
  const first=await rpc(owner,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});
  assert.deepEqual(first.record.activity.presentation,request.activity.presentation);
  for(const id of ['harbor','tide-model'])assert.deepEqual(first.record.activity.blocks.find(block=>block.id===id).artefact,request.activity.blocks.find(block=>block.id===id).artefact);
  const revised=structuredClone(request);
  revised.operationId='synthetic-zero-code-tide-clock-rearrange';
  revised.expectedRev=published.record.rev;
  revised.activity.presentation.pattern='predict-explore-compare';
  const next=await rpc(owner,'publish_minamo_activity_package',revised);
  assert.equal(next.receipt.status,'committed');
  assert.notEqual(next.record.rendition,published.record.rendition);
  assert.deepEqual(next.record.activity,revised.activity);
  const retained=await rpc(owner,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});
  assert.deepEqual(retained.record.activity,request.activity);
  for(const rendition of [published.record.rendition,next.record.rendition]){
   const denied=await foreign.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'read_minamo_activity',arguments:{purpose,id:published.record.id,rendition}}});
   assert.equal(denied.status,200);
   assert.equal(denied.data.result.isError,true);
   assert.doesNotMatch(JSON.stringify(denied.data),/In the invented harbor|h\(t\)=2|luma-periodic-model/);
  }
  assert.equal((await foreign.request('/api/activities/read',{id:published.record.id})).status,404);
  assert.deepEqual(await learningCounts(f.db),baseline);
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,1);
  t.diagnostic('Preview made no Activity; publication and recipe revision retained exact source; both editions were isolated; Run/checkpoint/learning counts remained zero.');
 }finally{await f.dispose();t.diagnostic('Disposed isolated synthetic D1/R2 fixture.');}
});
