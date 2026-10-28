import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const hash=text=>createHash('sha256').update(text).digest('hex');
const file=(path,role,text)=>({path,role,text,sha256:hash(text)});
const bundle={contract:'minamo.project.v1',id:'scratch-proof',title:'Original scratch proof',runtime:'python',commands:{kali:'python3 -m unittest -v',powershell:'py -3 -m unittest -v'},files:[file('main.py','editable-starter','def solve(values):\n    return 0\n'),file('test_main.py','visible-test','import unittest\n')]};
test('actual Worker/D1 scratch save, immutable replay, changed tests, edition retention, rights and recovery',{timeout:60000},async()=>{
 const fixture=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:"1"})}}'),client=fixture.client('TEST-ONLY-scratch-owner'),other=fixture.client('TEST-ONLY-foreign-scratch');
 const purpose='Synthetic scratch durable acceptance; no learner execution or progress.';
 const call=async(path,data)=>{const result=await client.request(path,data);assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
 try{const published=await call('/api/activities/publish',{purpose,operationId:'scratch-publish',id:'scratch-activity',title:'TEST ONLY scratch identity',synthetic:true,activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'Inspect exact bytes and preserve starter.',blocks:[{id:'starter',kind:'source-browser',bundle}]}}),activity=published.record;
  // projectDigest serializes canonical sorted package properties in the admitted original order.
  const sorted={contract:bundle.contract,id:bundle.id,title:bundle.title,runtime:bundle.runtime,files:[...bundle.files].sort((a,b)=>a.path.localeCompare(b.path)),commands:{...bundle.commands}},submission={contract:'minamo.scratch-submission.v1',blockId:'starter',starterDigest:hash(JSON.stringify(sorted)),files:bundle.files.map(f=>({path:f.path,text:f.text+(f.role==='visible-test'?'# test changed\n':'# scratch edit\n'),sha256:hash(f.text+(f.role==='visible-test'?'# test changed\n':'# scratch edit\n'))})),execution:'not-executed-by-minamo'};
  const input={purpose,operationId:'scratch-submit',id:'scratch-attempt',title:'TEST ONLY exact scratch return',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:activity.id,rendition:activity.rendition},state:'submitted',hintsRevealed:[],evidence:[],submission}};
  const saved=await call('/api/activities/attempt',input);assert.equal(saved.receipt.status,'committed');assert.deepEqual(saved.record.attempt.submission,submission);
  const retry=await call('/api/activities/attempt',input);assert.equal(retry.receipt.replayed,true);assert.equal(retry.record.id,saved.record.id);
  const changed={...bundle,files:[file('main.py','editable-starter','def solve(values):\n    return max(values)\n'),bundle.files[1]]};await call('/api/activities/publish',{purpose,operationId:'scratch-new-edition',id:activity.id,expectedRev:activity.rev,title:activity.title,synthetic:true,activity:{...activity.activity,blocks:[{id:'starter',kind:'source-browser',bundle:changed}]}});
  const retained=await call('/api/activities/read',{id:activity.id,rendition:activity.rendition});assert.equal(retained.record.activity.blocks[0].bundle.files[0].text,bundle.files[0].text);
  assert.equal((await other.request('/api/context',{family:'run',id:saved.record.id})).status,404);
  const bad=await client.request('/api/activities/attempt',{...input,operationId:'forged-scratch',id:'forged-scratch',attempt:{...input.attempt,submission:{...submission,starterDigest:'0'.repeat(64)}}});assert.ok([400,409].includes(bad.status));assert.match(JSON.stringify(bad.data),/starter/);
  const exported=await client.recover('export');assert.equal(exported.status,200);assert.ok(JSON.stringify(exported.data).includes('scratch-submission'));
 }finally{await fixture.dispose();}
});
