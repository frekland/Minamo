import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";

test('PR28 Home distinguishes changed whole-Journey reading from saved learning and metadata-only edits',async()=>{
 const f=await privateStorageFixture(worker);try{
  // These non-synthetic records live only in an isolated synthetic principal:
  // production synthetic checkpoints are deliberately excluded from Home.
  const c=f.client('TEST-ONLY-pr28-home'),target={kind:'journey-stage',journeyId:'TEST-ONLY-route',stageId:'first'};
  const created=await c.command({action:'create',family:'journey',id:target.journeyId,data:{title:'TEST ONLY decoder route',body:'An independent practical route.',synthetic:false,sections:[{id:'one',title:'Predict bytes',parts:[{id:'p',kind:'paragraph',text:'Predict the UTF-8 byte count.'}]},{id:'two',title:'Inspect failure',parts:[{id:'p',kind:'paragraph',text:'Inspect one decoding exception.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'first',sectionId:'one',title:'Predict bytes'},{id:'second',sectionId:'two',title:'Inspect failure'}]}}});assert.equal(created.status,200);
  const saved=await c.request('/api/learning-developments',{operationId:'TEST-ONLY-home-save',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1,development:{summary:'TEST ONLY preserve original bytes before choosing a decoder.',facts:[{role:'prediction',basis:'learner-reported',text:'I predict a decoding error before counting.'}],nextQuestions:['Which boundary stopped the program?'],nextAction:'Inspect the smallest invalid fixture.'}});assert.equal(saved.status,200);
  const home=async()=>{const r=await c.request('/api/learning-context',{scope:'home'});assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
  const initial=await home(),original=initial.continue[0];assert.equal(original.readingChangedSinceCheckpoint,undefined);assert.equal(initial.recent[0].readingChangedSinceCheckpoint,undefined);
  const account=card=>({summary:card.shortSummary,next:card.nextAction,question:card.nextQuestion,at:card.lastMeaningfulAt,basis:card.basisLabels,target:card.target,destination:card.destination});
  const status=await c.command({action:'update',family:'journey',id:target.journeyId,expectedRev:1,data:{status:'TEST ONLY metadata revision'}});assert.equal(status.status,200);assert.equal(status.data.record.rendition,created.data.record.rendition);assert.equal((await home()).continue[0].readingChangedSinceCheckpoint,undefined);
  const relation=await c.command({action:'update',family:'journey',id:target.journeyId,expectedRev:2,data:{links:[]}});assert.equal(relation.status,200);assert.equal(relation.data.record.rendition,created.data.record.rendition);assert.equal((await home()).recent[0].readingChangedSinceCheckpoint,undefined);
  // Only the OTHER stage changes. The cue must describe the Journey, never
  // assert that this checkpoint's stage changed or infer a new next action.
  const other=await c.command({action:'update',family:'journey',id:target.journeyId,expectedRev:3,data:{patch:[{op:'patchBlock',sectionId:'two',partId:'p',changes:{text:'Inspect the exception byte range before choosing an encoding.'}}]}});assert.equal(other.status,200);assert.notEqual(other.data.record.rendition,created.data.record.rendition);
  const changed=await home();for(const card of [changed.continue[0],changed.recent[0]]){assert.equal(card.readingChangedSinceCheckpoint,true);assert.deepEqual(account(card),account(original));assert.match(card.destination,/stage=first/);assert.equal(card.stageChangedSinceCheckpoint,undefined);}
  const mcp=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{scope:'home',purpose:'TEST ONLY changed reading Home projection'}}});assert.equal(mcp.status,200);assert.equal(JSON.parse(mcp.data.result.content[0].text).continue[0].readingChangedSinceCheckpoint,true);
  const correction=await c.request('/api/learning-developments/revise',{operationId:'TEST-ONLY-correct-home',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:4,id:'TEST-ONLY-home-save',expectedRev:1,development:{kind:'correction',summary:'TEST ONLY corrected interpretation, not a new coding attempt.'}});assert.equal(correction.status,200);
  const corrected=await home();assert.equal(corrected.continue[0].readingChangedSinceCheckpoint,true);assert.equal(corrected.continue[0].nextAction,undefined);assert.equal(corrected.continue[0].shortSummary,'TEST ONLY corrected interpretation, not a new coding attempt.');assert.equal(correction.data.development.targetRenditionAtRecording,created.data.record.rendition);
  const fresh=await c.request('/api/learning-developments',{operationId:'TEST-ONLY-current-reading',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:4,development:{summary:'TEST ONLY a new explicit account against this reading.'}});assert.equal(fresh.status,200);assert.equal((await home()).continue[0].readingChangedSinceCheckpoint,undefined);
  const same=await c.command({action:'update',family:'journey',id:target.journeyId,expectedRev:4,data:{patch:[{op:'patchBlock',sectionId:'one',partId:'p',changes:{text:'Predict bytes separately from Unicode code points.'}}]}});assert.equal(same.status,200);assert.equal((await home()).continue[0].readingChangedSinceCheckpoint,true);
  await c.request('/api/learning-developments/revise',{operationId:'TEST-ONLY-withdraw-fresh',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:5,id:'TEST-ONLY-current-reading',expectedRev:1,withdraw:true});
  await c.request('/api/learning-developments/revise',{operationId:'TEST-ONLY-withdraw-old',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:5,id:'TEST-ONLY-home-save',expectedRev:2,withdraw:true});assert.equal((await home()).continue.length,0);
  assert.equal(Number((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n),2,'reading edits/reads never save new progress');
 }finally{await f.dispose();}
});

test('PR28 keeps synthetic checkpoints out of Home and does not label Investigation edits as Journey changes',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr28-exclusion');
  for(const [id,synthetic] of [['synthetic',true],['ordinary',false]]){await c.command({action:'create',family:'investigation',id,data:{title:'TEST ONLY isolated '+id,body:'Open question',synthetic,learningShape:{version:2,kind:'investigation',question:'Which evidence distinguishes the hypotheses?'}}});await c.request('/api/learning-developments',{operationId:'TEST-ONLY-save-'+id,intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target:{kind:'investigation',investigationId:id},expectedTargetRev:1,development:{summary:'TEST ONLY recorded question '+id}});await c.command({action:'update',family:'investigation',id,expectedRev:1,data:{body:'A revised question guide.'}});}
  const h=await c.request('/api/learning-context',{scope:'home'});assert.equal(h.data.continue.length,1);assert.equal(h.data.continue[0].target.investigationId,'ordinary');assert.equal(h.data.continue[0].readingChangedSinceCheckpoint,undefined);assert.ok(h.data.recent.every(x=>x.readingChangedSinceCheckpoint===undefined));
 }finally{await f.dispose();}
});
