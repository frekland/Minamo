import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const purpose='TEST ONLY original synthetic lantern-fold Activity; no learner achievement.';
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const originalText='TEST ONLY — At the fictional Nacre workshop, a paper lantern starts with 3 folds. Each imagined round adds 4 folds. Label: A😀e\u0301.\r\nThis is original supplied prose, not measured work or executed code.';
const originalTex='F(n)=3+4n,\\quad n\\in\\{0,1,2,3\\}';
const hash=source=>createHash('sha256').update(source,'utf8').digest('hex');
function artefact(kind,format,source,payload){return {contract:'minamo.artefact.v1',kind,canonical:{format,source,sha256:hash(source)},provenance:{classification:'authored',execution:'not-executed'},payload};}
function originalRequest(){return {
 purpose,operationId:'synthetic-nacre-lantern-fold-publish',id:'synthetic-nacre-lantern-fold',title:'TEST ONLY — Nacre paper lantern folds',synthetic:true,
 activity:{contract:'minamo.activity.v1',template:'mathematics',intent:'Compare original fictional lantern-fold prose with a finite authored linear expression.',authorship:'original-exercise',blocks:[
  {id:'task',kind:'instruction',text:'Inspect the supplied description and formula. Identify the initial value and per-round increment without executing anything.'},
  {id:'lantern-prose',kind:'foundry',artefact:artefact('text/plain-v1','text',originalText,{text:originalText})},
  {id:'fold-model',kind:'foundry',artefact:artefact('math/tex-v1','tex',originalTex,{contract:'minamo.math.v1',id:'nacre-finite-fold-model',format:'tex',source:originalTex,display:'block',description:'Original finite fictional expression; no execution receipt or learning claim.'})},
  {id:'question',kind:'reflection',text:'Which words support the constants in the expression? No attempt is requested.'},
 ],presentation:{contract:'minamo.presentation.v1',version:1,pattern:'mathematics-science',slots:[{slot:'task',blockId:'task'},{slot:'source',blockId:'lantern-prose'},{slot:'explore',blockId:'fold-model'},{slot:'evidence',blockId:'question'}],preferredFocus:'explore',fallback:'accessible-source'}}
};}
async function rpc(client,name,input={}){
 const response=await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...input}}});
 assert.equal(response.status,200,JSON.stringify(response.data));
 assert.notEqual(response.data.result.isError,true,JSON.stringify(response.data));
 return JSON.parse(response.data.result.content[0].text);
}
const quoted=name=>'"'+name.replaceAll('"','""')+'"';
async function storageSnapshot(f){
 const {results:tables}=await f.db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
 const database={};
 for(const {name} of tables.filter(row=>!/^_cf_/i.test(row.name))){const {results}=await f.db.prepare('SELECT * FROM '+quoted(name)).all();database[name]=results.map(row=>JSON.stringify(row)).sort();}
 const objects=await f.bucket.list();
 assert.equal(objects.truncated,false);
 return {database,objects:objects.objects.map(object=>({key:object.key,etag:object.etag,size:object.size})).sort((a,b)=>a.key.localeCompare(b.key))};
}
async function noAchievementCounts(db){
 const counts={};
 for(const family of ['attempt','run','checkpoint','learning','achievement'])counts['record:'+family]=(await db.prepare('SELECT COUNT(*) n FROM v2_records WHERE family=?').bind(family).first()).n;
 const {results}=await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
 for(const {name} of results.filter(row=>/attempt|run|checkpoint|learning|achievement/i.test(row.name)))counts['table:'+name]=(await db.prepare('SELECT COUNT(*) n FROM '+quoted(name)).first()).n;
 assert.ok(Object.hasOwn(counts,'table:v2_learning_developments'));
 return counts;
}
function assertExact(activity,expected){
 assert.deepEqual(activity,expected);
 assert.deepEqual(activity.presentation,expected.presentation);
 for(const [id,source] of [['lantern-prose',originalText],['fold-model',originalTex]]){
  const saved=activity.blocks.find(block=>block.id===id).artefact;
  assert.equal(saved.canonical.source,source);
  assert.equal(saved.canonical.sha256,hash(source));
  assert.equal(saved.payload[id==='lantern-prose'?'text':'source'],source);
 }
}

test('fresh Nacre lantern Activity: real isolated typed MCP, zero-write preview, exact editions, no achievements',{timeout:60000},async t=>{
 const f=await privateStorageFixture(worker);
 try{
  const owner=f.client('TEST-ONLY-nacre-lantern-owner'),foreign=f.client('TEST-ONLY-nacre-lantern-foreign');
  const caps=await rpc(owner,'get_minamo_activity_capabilities');
  for(const kind of ['text/plain-v1','math/tex-v1'])assert.ok(caps.presentation.foundryKinds.includes(kind));
  for(const id of ['mathematics-science','predict-explore-compare'])assert.ok(caps.presentation.patterns.some(pattern=>pattern.id===id));
  const request=originalRequest();
  const baselineCounts=await noAchievementCounts(f.db);
  assert.ok(Object.values(baselineCounts).every(n=>n===0));
  const before=await storageSnapshot(f);
  const preview=await rpc(owner,'preview_minamo_activity_package',request);
  assert.equal(preview.valid,true);
  assert.deepEqual(await storageSnapshot(f),before,'dry-run preview must write no D1 rows or R2 objects');
  t.diagnostic('Preview valid; all accessible D1 tables (Cloudflare protected _cf_ metadata excluded) and all R2 object keys/etags/sizes unchanged.');
  const published=await rpc(owner,'publish_minamo_activity_package',request);
  assert.equal(published.receipt.status,'committed');
  assert.equal(published.learningDevelopmentCreated,false);
  assertExact(published.record.activity,request.activity);
  const first=await rpc(owner,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});
  assertExact(first.record.activity,request.activity);
  const revised=structuredClone(request);
  revised.operationId='synthetic-nacre-lantern-fold-recipe-revision';
  revised.expectedRev=published.record.rev;
  revised.activity.presentation.pattern='predict-explore-compare';
  revised.activity.presentation.preferredFocus='source';
  const revisedBefore=await storageSnapshot(f);
  assert.equal((await rpc(owner,'preview_minamo_activity_package',revised)).valid,true);
  assert.deepEqual(await storageSnapshot(f),revisedBefore,'revision dry run must also write nothing');
  const next=await rpc(owner,'publish_minamo_activity_package',revised);
  assert.equal(next.receipt.status,'committed');
  assert.equal(next.learningDevelopmentCreated,false);
  assert.notEqual(next.record.rendition,published.record.rendition);
  assertExact(next.record.activity,revised.activity);
  const current=await rpc(owner,'read_minamo_activity',{id:published.record.id});
  assertExact(current.record.activity,revised.activity);
  const retained=await rpc(owner,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});
  assertExact(retained.record.activity,request.activity);
  for(const rendition of [published.record.rendition,next.record.rendition]){
   const denied=await foreign.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'read_minamo_activity',arguments:{purpose,id:published.record.id,rendition}}});
   assert.equal(denied.status,200);assert.equal(denied.data.result.isError,true);
   assert.doesNotMatch(JSON.stringify(denied.data),/fictional Nacre|F\(n\)=3|nacre-finite-fold-model/);
  }
  assert.equal((await foreign.request('/api/activities/read',{id:published.record.id})).status,404);
  const counts=await noAchievementCounts(f.db);
  assert.deepEqual(counts,baselineCounts);
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,1);
  t.diagnostic('Exact UTF-8 source hashes: '+JSON.stringify({text:hash(originalText),tex:hash(originalTex)}));
  t.diagnostic('Editions: '+JSON.stringify({id:published.record.id,first:published.record.rendition,revised:next.record.rendition,firstRev:published.record.rev,revisedRev:next.record.rev}));
  t.diagnostic('No-achievement counts: '+JSON.stringify(counts));
  t.diagnostic('Local compiled Worker + Miniflare D1/R2 + typed /mcp only. No browser or hosted evidence.');
 }finally{await f.dispose();t.diagnostic('Disposed owned synthetic Miniflare D1/R2 fixture in finally.');}
});
