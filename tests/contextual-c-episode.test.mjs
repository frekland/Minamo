import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const ok=async pending=>{const response=await pending;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const activity=blocks=>({contract:'minamo.activity.v1',template:'walkthrough',intent:'Inspect TCP listener/connection evidence.',authorship:'original-exercise',blocks});
const discover=source=>'/api/activities/browse?'+new URLSearchParams({kind:'activities',sourceFamily:'article',sourceId:source.id,sourceRendition:source.rendition,sourceSection:'tcp',sourcePart:'socket'});
const working=(client,input={})=>client.request('/api/learning-context',{scope:'working',...input});

test('C1–C3/C7 non-browser episode: current TCP edition, older/unpinned Activity, independent and linked Notes, Attempt, Flag and a revoked source',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('contextual-c-tcp-owner'),other=f.client('contextual-c-tcp-other');
  const e1=(await ok(c.command({action:'create',family:'article',id:'tcp-current-source',data:{title:'TCP listener and connections',body:'Edition one.',synthetic:false,sections:[{id:'tcp',title:'Connection evidence',parts:[{id:'socket',kind:'paragraph',text:'A listener accepts connections, not a complete sequence of application messages.'}]}]}}))).record;
  const older=(await ok(c.command({action:'create',family:'experiment',id:'tcp-old-stream',data:{title:'TCP stream Activity',synthetic:false,activity:activity([{id:'old',kind:'reading',ref:{family:'article',id:e1.id,rendition:e1.rendition,sectionId:'tcp',partId:'socket'}}])}}))).record;
  const e2=(await ok(c.command({action:'update',family:'article',id:e1.id,expectedRev:e1.rev,data:{body:'Edition two.'}}))).record;
  const current=(await ok(c.command({action:'update',family:'article',id:e1.id,expectedRev:e2.rev,data:{body:'Current TCP edition three.'}}))).record;
  assert.equal(current.rev,3);
  const unpinned=(await ok(c.command({action:'create',family:'experiment',id:'tcp-guided-listener',data:{title:'Process / Listener / Connection',synthetic:false,links:[{family:'article',id:current.id}],activity:activity([{id:'guide',kind:'instruction',text:'Predict the listener result before checking.'}])}}))).record;
  const matched=(await ok(c.request(discover(current)))).items;
  assert.deepEqual(new Set(matched.map(item=>item.record.id)),new Set([older.id,unpinned.id]));
  assert.equal(matched.find(item=>item.record.id===older.id).sourceMatch.quality,'older-edition');
  assert.equal(matched.find(item=>item.record.id===unpinned.id).sourceMatch.quality,'unversioned-saved-link');
  assert.equal(matched.every(item=>item.sourceMatch.opensCurrentSource===false),true,'neither related Activity asserts exact current passage');

  const project=(await ok(c.command({action:'create',family:'journey',id:'tcp-optional-project',data:{title:'Optional TCP Project',body:'A guide, not current learner state.',synthetic:false,sections:[{id:'first',title:'Optional first step',parts:[{id:'p',kind:'paragraph',text:'Observe an actual connection.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'s1',sectionId:'first',title:'Plan an observation'}]}}}))).record;
  const question=(await ok(c.command({action:'create',family:'investigation',id:'tcp-open-question',data:{title:'What was actually accepted?',body:'Evidence is still uncertain.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record;
  const independent=(await ok(c.command({action:'create',family:'note',id:'tcp-blank-note',data:{title:'Independent capture',body:'I am unsure which socket I observed.',links:[],synthetic:false}}))).record;
  const linked=(await ok(c.command({action:'create',family:'note',id:'tcp-prediction',data:{title:'Saved prediction',body:'Before checking, I predict only the listener accepted the connection.',links:[{family:'article',id:current.id,rendition:current.rendition,sectionId:'tcp',partId:'socket'},{family:'investigation',id:question.id}],synthetic:false}}))).record;
  const revised=(await ok(c.command({action:'update',family:'note',id:linked.id,expectedRev:linked.rev,data:{body:'After checking, the message boundary remains uncertain.'}}))).record;
  assert.equal(revised.rev,2,'a real CAS edit returns the canonical next revision');
  assert.equal((await c.command({action:'update',family:'note',id:revised.id,expectedRev:linked.rev,data:{body:'Stale overwrite rejected.'}})).status,409);
  await ok(c.command({action:'setFlag',target:{kind:'record',family:'article',id:current.id},active:true,expectedTargetRev:0}));
  const published=(await ok(c.request('/api/activities/publish',{purpose:'TEST ONLY independent authored Activity',operationId:'c-tcp-publish',id:'tcp-prediction-activity',title:'TCP prediction Activity',synthetic:false,activity:{contract:'minamo.activity.v1',template:'predict-compare',intent:'Compare prediction with supplied evidence.',authorship:'original-exercise',blocks:[{id:'answer',kind:'practice',exercise:{version:1,id:'answer',kind:'open-response',prompt:'What would you observe?',rubric:'State uncertainty.',modelAnswer:'Observation remains independent.'}}]}}))).record;
  const attempt=(await ok(c.request('/api/activities/attempt',{purpose:'TEST ONLY supplied response fixture',operationId:'c-tcp-attempt',id:'tcp-supplied-attempt',title:'Supplied TCP prediction',synthetic:false,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:published.id,rendition:published.rendition},state:'submitted',hintsRevealed:[],evidence:[],practice:{version:1,responses:[{id:'r1',itemId:'answer',revision:1,input:'The connection appears accepted, but I cannot infer a full message.'}],feedback:[],corrections:[],reviewEvents:[],interactions:[]}}}))).record;
  assert.equal(attempt.family,'run');

  const countBefore=(await f.db.prepare('SELECT count(*) AS n FROM v2_operations').first()).n;
  const page=await ok(working(c,{selectedRefs:[{family:'note',id:revised.id},{family:'article',id:current.id,rendition:current.rendition}]}));
  assert.equal(page.selectionIsSaved,false);assert.equal(page.lastSeenByGpt,'unknown');
  assert.ok(page.relations.some(rel=>rel.from.id===revised.id&&rel.to.id===current.id&&rel.quality==='exact-edition'));
  assert.ok(page.relations.some(rel=>rel.from.id===revised.id&&rel.to.id===question.id&&rel.quality==='saved-record-link'));
  assert.deepEqual(new Set([independent.id,revised.id,attempt.id].filter(id=>page.evidence.items.some(item=>item.source.id===id))),new Set([independent.id,revised.id,attempt.id]));
  assert.ok(page.evidence.items.some(item=>item.basis==='bookmark'));
  assert.equal((await f.db.prepare('SELECT count(*) AS n FROM v2_operations').first()).n,countBefore,'opening context and comparing sources cannot create a saved relationship');
  const focused=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.ok(focused.evidence.items.some(item=>item.source.id===revised.id),'Question-mediated Note can be found with optional Project guide');
  assert.equal(focused.evidence.items.some(item=>item.source.id===independent.id),false,'projectless writing is not assigned to a Project');
  const denied=await ok(working(other,{selectedRefs:[{family:'note',id:revised.id},{family:'article',id:current.id,rendition:current.rendition}]}));
  assert.deepEqual(denied.selected.map(item=>item.status),['unavailable','unavailable']);
  assert.doesNotMatch(JSON.stringify(denied),/message boundary remains uncertain|TCP listener and connections/);

  await ok(c.command({action:'trash',family:'article',id:current.id,expectedRev:current.rev}));
  const revoked=await ok(working(c,{selectedRefs:[{family:'note',id:revised.id},{family:'article',id:current.id,rendition:current.rendition}]}));
  assert.equal(revoked.selected[1].status,'unavailable');
  assert.equal(revoked.relations.some(rel=>rel.to.id===current.id),false);
  assert.doesNotMatch(JSON.stringify(revoked),/A listener accepts connections/);
  assert.equal((await c.request(discover(current))).status,404);
  assert.equal((await ok(c.context('note',revised.id))).record.body,'After checking, the message boundary remains uncertain.','independent saved Note text survives source revocation');
 }finally{await f.dispose();}
});

test('C4/C5 non-browser return: later contradictory Mood Note and sparse Cap/Plant Questions never inherit a checkpoint intention',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('contextual-c-returns-owner');
  const mood=(await ok(c.command({action:'create',family:'journey',id:'mood-review',data:{title:'Mood documentation review',body:'Optional prior plan.',synthetic:false,sections:[{id:'review',title:'Compare sources',parts:[{id:'p',kind:'paragraph',text:'Read one reported result.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'review-stage',sectionId:'review',title:'Read and assess'}]}}}))).record;
  const checkpoint=(await ok(c.request('/api/learning-developments',{operationId:'c-mood-old-checkpoint',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target:{kind:'journey-stage',journeyId:mood.id,stageId:'review-stage'},expectedTargetRev:mood.rev,development:{summary:'Earlier plan before reading newer documentation.',nextAction:'Adopt the original recommendation.'}}))).development;
  const moodQuestion=(await ok(c.command({action:'create',family:'investigation',id:'mood-reliability',data:{title:'Which version is actually verified?',body:'Provider verification remains an open question.',synthetic:false,links:[{family:'journey',id:mood.id,rendition:mood.rendition}]}}))).record;
  const sceptical=(await ok(c.command({action:'create',family:'note',id:'mood-reassessment',data:{title:'Later sceptical reassessment',body:'Do not adopt the earlier plan; the provider v7 check remains unverified.',synthetic:false,links:[{family:'investigation',id:moodQuestion.id}]}}))).record;
  const moodRead=await ok(working(c,{focus:{family:'journey',id:mood.id}}));
  const earlier=moodRead.evidence.items.find(item=>item.checkpoint?.id===checkpoint.id),later=moodRead.evidence.items.find(item=>item.source.id===sceptical.id);
  assert.ok(earlier&&later,'both contradictory canonical receipts survive the same Project focus');
  assert.equal(earlier.checkpoint.nextAction,'Adopt the original recommendation.');
  assert.match(later.preview.text,/remains unverified/);
  assert.equal(earlier.source.rendition,mood.rendition);
  assert.notEqual(earlier.at,later.at,'a saved earlier checkpoint has its own time');
  assert.equal(moodRead.lastSeenByGpt,'unknown');
  assert.match(moodRead.coverage.notice,/does not establish learner intent|do not infer a settled task/);

  for(const subject of ['cap','plant']){
   const question=(await ok(c.command({action:'create',family:'investigation',id:subject+'-open',data:{title:subject+' unresolved evidence',body:'What is still unknown?',synthetic:false}}))).record;
   const note=(await ok(c.command({action:'create',family:'note',id:subject+'-restart',data:{title:subject+' restart',body:subject==='cap'?'Instance state is unknown; no physical observation was supplied.':'Careful plant status is an open question; no physical measurement was supplied.',synthetic:false,links:[{family:'investigation',id:question.id}]}}))).record;
   const sparse=await ok(working(c,{focus:{family:'investigation',id:question.id}}));
   assert.ok(sparse.evidence.items.some(item=>item.source.id===note.id&&item.basis==='authored-writing'));
   assert.equal(sparse.evidence.items.some(item=>item.basis==='saved-checkpoint'),false,'sparse Question needs no Stage or fabricated checkpoint');
   assert.equal(sparse.lastSeenByGpt,'unknown');
  }
 }finally{await f.dispose();}
});
