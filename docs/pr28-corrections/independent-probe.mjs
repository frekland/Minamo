import assert from 'node:assert/strict';
import {privateStorageFixture} from '../../tests/private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const f=await privateStorageFixture(worker);
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data};
const mcp=async(c,args)=>{const r=await ok(c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'TEST ONLY independent review probe',...args}}}));assert.notEqual(r.result.isError,true);return JSON.parse(r.result.content[0].text)};
try{
 const c=f.client('TEST-ONLY-independent-review'),other=f.client('TEST-ONLY-independent-other');
 const target={kind:'investigation',investigationId:'TEST-ONLY-paginated'};
 await ok(c.command({action:'create',family:'investigation',id:target.investigationId,data:{title:'TEST ONLY pagination',body:'A bounded question',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Which sample disproves the hypothesis?'}}}));
 for(let i=0;i<6;i++){
  const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-historical-note-'+i,data:{title:'TEST ONLY sample '+i,body:'TEST_ONLY_BODY_CANARY_'+i,synthetic:true}}))).record;
  await ok(c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1,operationId:'TEST-ONLY-event-'+i,development:{summary:'TEST ONLY account '+i,noteRefs:[{id:note.id,rev:1,purpose:'Inspect isolated sample '+i}]}}));
 }
 const current=await mcp(c,{scope:'target',target});assert.equal(current.historyCoverage.returnedCheckpoints,4);assert.ok(current.nextCursor);assert.equal(current.resume.noteEvidence.length,1);assert.equal(current.priorCheckpoints.length,3);assert.ok(current.priorCheckpoints.every(e=>e.noteEvidence.length===1));
 const history=await mcp(c,{scope:'target',target,profile:'tutor',cursor:current.nextCursor});assert.equal(history.pageRole,'history');assert.equal(history.resume,undefined);assert.equal(history.checkpointReading,undefined);assert.equal(history.historyCoverage.returnedCheckpoints,2);assert.ok(history.priorCheckpoints.every(e=>e.noteEvidence.length===1));assert.doesNotMatch(JSON.stringify(history),/TEST_ONLY_BODY_CANARY/);
 await ok(other.command({action:'create',family:'note',id:'TEST-ONLY-foreign',data:{title:'TEST ONLY private fixture',body:'OTHER_OWNER_CANARY',synthetic:true}}));
 const denied=await c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1,operationId:'TEST-ONLY-foreign-denied',development:{summary:'TEST ONLY denied',noteRefs:[{id:'TEST-ONLY-foreign',rev:1,purpose:'TEST ONLY unavailable fixture'}]}});assert.equal(denied.status,409);assert.equal(denied.data.code,'evidence_unavailable');assert.doesNotMatch(JSON.stringify(await mcp(c,{scope:'target',target})),/OTHER_OWNER_CANARY|TEST-ONLY-foreign/);
 const journeyId='TEST-ONLY-reversion',jt={kind:'journey-stage',journeyId,stageId:'s'},body='Original reading';
 const initial=(await ok(c.command({action:'create',family:'journey',id:journeyId,data:{title:'TEST ONLY original route',body,synthetic:false,sections:[{id:'sec',title:'Think',parts:[{id:'p',kind:'paragraph',text:'Original part'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'s',sectionId:'sec',title:'Think'}]}}}))).record;
 await ok(c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target:jt,expectedTargetRev:1,operationId:'TEST-ONLY-reversion-save',development:{summary:'TEST ONLY unchanged learner account',nextQuestions:['Which observation would change your mind?']}}));
 const home=()=>mcp(c,{scope:'home'});
 assert.equal((await home()).continue[0].readingChangedSinceCheckpoint,undefined);
 const changed=(await ok(c.command({action:'update',family:'journey',id:journeyId,expectedRev:1,data:{body:'Changed reading'}}))).record;assert.notEqual(changed.rendition,initial.rendition);assert.equal((await home()).continue[0].readingChangedSinceCheckpoint,true);
 const reverted=(await ok(c.command({action:'update',family:'journey',id:journeyId,expectedRev:2,data:{body}}))).record;assert.equal(reverted.rendition,initial.rendition);const after=await home();assert.equal(after.continue[0].readingChangedSinceCheckpoint,undefined);assert.equal(after.continue[0].shortSummary,'TEST ONLY unchanged learner account');assert.equal(Number((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n),7);
 console.log(JSON.stringify({result:'PASS',probes:['default current versus paginated history with Note refs','no historical resume or Note bodies','cross-owner Note reference denied','changed reading then exact reading reversion clears cue','reads and canonical edits add zero checkpoints'],hosted:false,isolatedPrincipals:2}));
}finally{await f.dispose()}
