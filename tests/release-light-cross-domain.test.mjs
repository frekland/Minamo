import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const purpose='TEST ONLY original cross-domain seed-dish reading and model; no learner achievement.';
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const reading='TEST ONLY — 🪁雨の庭で、三つの皿に二粒ずつ種を置く。\r\n記録: e\u0301 / é。';
const formula='N(d)=3(2+d),\\quad N(0)=6,\\quad N(1)=9';
const hash=s=>createHash('sha256').update(s,'utf8').digest('hex');
const pairs=[['雨','あめ'],['庭','にわ'],['三つ','みっつ'],['皿','さら'],['二粒','ふたつぶ'],['種','たね'],['置く','おく'],['記録','きろく']];
const language={version:1,text:reading,language:'ja',direction:'ltr',spans:pairs.map(([base,pronunciation])=>({start:reading.indexOf(base),end:reading.indexOf(base)+base.length,base,reading:pronunciation,origin:'author-verified'}))};
function artefact(kind,format,source,payload){return{contract:'minamo.artefact.v1',kind,canonical:{format,source,sha256:hash(source)},provenance:{classification:'authored',execution:'not-executed'},payload};}
const request={purpose,operationId:'synthetic-cross-seed-dishes-publish',id:'synthetic-cross-seed-dishes',title:'TEST ONLY — 雨の庭の種 / seed-dish model',synthetic:true,activity:{contract:'minamo.activity.v1',template:'language',intent:'Read an original Japanese seed-dish sentence and compare its counters with a deliberately authored algebraic model.',authorship:'original-exercise',blocks:[
 {id:'prompt',kind:'instruction',text:'Read the ruby metadata, then compare three dishes containing two seeds each with N(d). The extra d seeds per dish are a model assumption, not measured growth.'},
 {id:'japanese',kind:'foundry',artefact:artefact('language/ruby-v1','language-json',JSON.stringify(language),language)},
 {id:'seed-model',kind:'foundry',artefact:artefact('math/tex-v1','tex',formula,{contract:'minamo.math.v1',id:'seed-dish-linear-model',format:'tex',source:formula,display:'block',description:'Original authored counting model: d extra seeds per dish; no execution or measurement.'})},
 {id:'question',kind:'reflection',text:'Which original words specify the initial six seeds, and which part of N(d) extends beyond the sentence? No saved attempt is required.'}
],presentation:{contract:'minamo.presentation.v1',version:1,pattern:'language-reading',slots:[{slot:'task',blockId:'prompt'},{slot:'source',blockId:'japanese'},{slot:'explore',blockId:'seed-model'},{slot:'evidence',blockId:'question'}],preferredFocus:'explore',fallback:'accessible-source'}}};
async function call(client,name,input={}){return client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...input}}});}
async function rpc(client,name,input={}){const response=await call(client,name,input);assert.equal(response.status,200,JSON.stringify(response.data));assert.notEqual(response.data.result.isError,true,JSON.stringify(response.data));return JSON.parse(response.data.result.content[0].text);}
async function counts(db){const{results}=await db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();const result={};for(const{name}of results.filter(row=>!/^_cf_|^sqlite_/i.test(row.name)))result[name]=(await db.prepare('SELECT COUNT(*) n FROM "'+name.replaceAll('"','""')+'"').first()).n;return result;}
async function savedLearning(db){const{results}=await db.prepare("SELECT family,COUNT(*) n FROM v2_records WHERE family IN ('run','checkpoint') GROUP BY family").all();assert.deepEqual(results,[]);assert.equal((await db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);}

test('fresh cross-domain ruby and counting model authoring via actual isolated typed MCP',{timeout:60000},async t=>{
 const f=await privateStorageFixture(worker),evidence={source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),reading,readingCodeUnits:reading.length,readingCodePoints:[...reading].length,readingUtf8Bytes:Buffer.byteLength(reading),readingSha256:hash(reading),spans:language.spans,canonical:request.activity.blocks.filter(b=>b.kind==='foundry').map(b=>({id:b.id,...b.artefact.canonical})),errors:[]};
 try{
  const owner=f.client('TEST-ONLY-cross-seed-owner'),foreign=f.client('TEST-ONLY-cross-seed-foreign');
  const caps=await rpc(owner,'get_minamo_activity_capabilities');
  assert.equal(caps.catalogue,'integrated-practice-2026-10-26.4');
  for(const kind of ['language/ruby-v1','math/tex-v1'])assert.ok(caps.presentation.foundryKinds.includes(kind));
  assert.ok(caps.presentation.patterns.find(p=>p.id==='language-reading'));
  evidence.catalogue=caps.catalogue;
  const baseline=await counts(f.db);
  evidence.baselineCounts=baseline;
  assert.deepEqual((await f.bucket.list()).objects,[]);
  assert.equal(baseline.v2_records,0);
  const malformed=[
   ['duplicate block slot',r=>r.activity.presentation.slots.push({...r.activity.presentation.slots[0]})],
   ['dropped block',r=>r.activity.presentation.slots.pop()],
   ['foreign block',r=>r.activity.presentation.slots[0].blockId='unowned-block'],
   ['wrong ruby role',r=>r.activity.presentation.slots[1].slot='guidance'],
   ['slot injection',r=>r.activity.presentation.slots[1].component='https://invalid.example/active.js'],
   ['wrong hash',r=>r.activity.blocks[1].artefact.canonical.sha256='0'.repeat(64)],
   ['split astral UTF-16 annotation',r=>{const a=r.activity.blocks[1].artefact;a.payload.spans.unshift({start:12,end:13,base:'🪁',reading:'test',origin:'author-verified'});a.canonical.source=JSON.stringify(a.payload);a.canonical.sha256=hash(a.canonical.source);}],
  ];
  for(const[label,mutate]of malformed){const bad=structuredClone(request);bad.operationId+='-bad-'+evidence.errors.length;mutate(bad);const response=await call(owner,'preview_minamo_activity_package',bad);assert.equal(response.status,200);assert.equal(response.data.result.isError,true,label+' must reject');evidence.errors.push({label,result:response.data.result});assert.deepEqual(await counts(f.db),baseline,label+' wrote rows');assert.deepEqual((await f.bucket.list()).objects,[],label+' wrote R2 objects');}
  t.diagnostic('Seven malformed variants rejected before publication; every application database table count unchanged.');
  const preview=await rpc(owner,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.deepEqual(await counts(f.db),baseline);assert.deepEqual((await f.bucket.list()).objects,[]);evidence.previewNoWrites={allApplicationTableCountsUnchanged:true,r2Objects:0};await savedLearning(f.db);
  t.diagnostic('Repaired original request preview passed with zero writes across every application database table.');
  const published=await rpc(owner,'publish_minamo_activity_package',request);assert.equal(published.receipt.status,'committed');assert.equal(published.learningDevelopmentCreated,false);assert.deepEqual(published.record.activity,request.activity);
  const read=await rpc(owner,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});assert.deepEqual(read.record.activity,request.activity);
  const saved=read.record.activity.blocks.find(b=>b.id==='japanese').artefact;
  assert.equal(saved.payload.text,reading);assert.equal(saved.payload.text.length,reading.length);assert.equal([...saved.payload.text].length,[...reading].length);assert.deepEqual(Buffer.from(saved.payload.text,'utf16le'),Buffer.from(reading,'utf16le'));assert.equal(hash(saved.payload.text),hash(reading));assert.equal(saved.canonical.source,JSON.stringify(language));assert.equal(hash(saved.canonical.source),saved.canonical.sha256);assert.deepEqual(saved.payload.spans,language.spans);
  assert.ok(saved.payload.text.includes('e\u0301'));assert.ok(saved.payload.text.includes('é'));assert.ok(saved.payload.text.includes('\r\n'));assert.notEqual(saved.payload.text,saved.payload.text.normalize('NFC'));
  for(const span of saved.payload.spans)assert.equal(saved.payload.text.slice(span.start,span.end),span.base);
  const maths=read.record.activity.blocks.find(b=>b.id==='seed-model').artefact;assert.equal(maths.canonical.source,formula);assert.equal(hash(formula),maths.canonical.sha256);assert.equal(maths.payload.source,formula);
  const denied=await call(foreign,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});assert.equal(denied.status,200);assert.equal(denied.data.result.isError,true);assert.doesNotMatch(JSON.stringify(denied.data),/雨の庭|seed-dish-linear-model|N\(d\)|ふたつぶ/);assert.equal((await foreign.request('/api/activities/read',{id:published.record.id})).status,404);
  await savedLearning(f.db);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,1);
  evidence.receipt=published.receipt;evidence.record={id:published.record.id,rendition:published.record.rendition,rev:published.record.rev};evidence.finalCounts=await counts(f.db);evidence.denied=denied.data.result;evidence.assertions=['known advertised kinds and pattern','7 rejected malformed variants leave every table unchanged','valid preview leaves every table unchanged','publication exact activity and recipe','readback original reading UTF-16 bytes, Unicode scalar count, CRLF, both accent forms and exact hashes','all 8 original ruby readings and slice offsets unchanged','math source and hash unchanged','foreign owner MCP error without source leakage and API 404','zero run, checkpoint and learning-development records'];
  t.diagnostic('Exact source, all ruby readings, recipe, owner denial and zero learning writes verified.');
 }finally{await f.dispose();evidence.disposed=true;t.diagnostic('Disposed isolated synthetic D1/R2 fixture.');}
});
