import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const ok=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const purpose='TEST ONLY independent UX release challenge; isolated owner data.';
const learningScope={version:1,spaces:['languages'],languages:['ja'],provenance:'authored'};
const activity=label=>({contract:'minamo.activity.v1',template:'language',intent:'Compare an original sentence and preserve uncertainty.',authorship:'original-exercise',blocks:[{id:'question',kind:'practice',exercise:{version:1,id:'question',kind:'open-response',language:'ja',prompt:'Write an original sentence: '+label,rubric:'Discuss meaning, context and uncertainty.',modelAnswer:'WITHHELD MODEL '+label}}]});
const empty=()=>({version:1,responses:[],feedback:[],corrections:[],reviewEvents:[],interactions:[]});

test('independent UX challenge: retained-edition discovery and stale-write recovery keep immutable answer history',{timeout:60000},async()=>{
 const fixture=await privateStorageFixture(worker),c=fixture.client('independent-ux-owner');
 try{
  const first=ok(await c.request('/api/activities/publish',{purpose,operationId:'publish-first',id:'activity',title:'TEST ONLY original edition',synthetic:false,learningScope,activity:activity('original')})).record;
  const raw=await fixture.db.prepare('SELECT data FROM v2_records WHERE owner=? AND family=? AND id=?').bind(c.owner,'experiment',first.id).first();
  assert.equal(JSON.parse(raw.data).rendition,first.rendition,'exact current-edition SQL filters use a persisted rendition');
  const page=ok(await c.request('/api/activities/browse?kind=activities&activityId=activity&activityRendition='+first.rendition));
  assert.deepEqual(page.items.map(item=>item.record.rendition),[first.rendition]);assert.doesNotMatch(JSON.stringify(page),/WITHHELD MODEL/);

  const practice=empty();practice.responses.push({id:'answer-1',itemId:'question',revision:1,input:'Original independent answer'});
  practice.feedback.push({id:'old-feedback',responseId:'answer-1',responseRevision:1,basis:'gpt-provisional',verdict:'pending',explanation:'Selected for later contextual feedback.'});
  const saved=ok(await c.request('/api/activities/attempt',{purpose,operationId:'save-original',id:'saved',title:'TEST ONLY immutable answer',synthetic:false,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:first.id,rendition:first.rendition},state:'submitted',hintsRevealed:[],evidence:[],practice}})).record;
  const concurrent=structuredClone(saved.attempt);concurrent.nextIntention='Keep this explicit newer intention.';
  const newer=ok(await c.request('/api/activities/attempt',{purpose,operationId:'concurrent-change',id:saved.id,expectedRev:saved.rev,title:saved.title,attempt:concurrent})).record;
  const attempted=structuredClone(saved.attempt);attempted.practice.responses.push({id:'answer-2',itemId:'question',revision:2,input:'A separate revised answer'});
  const stalePayload={purpose,operationId:'stale-answer-save',id:saved.id,expectedRev:saved.rev,title:saved.title,attempt:attempted};
  const conflict=await c.request('/api/activities/attempt',stalePayload);assert.equal(conflict.status,409);assert.equal(conflict.data.receipt.status,'conflict');
  const receipt=ok(await c.request('/api/operations?operationId=stale-answer-save'));assert.equal(receipt.status,'conflict');
  const replay=await c.request('/api/activities/attempt',stalePayload);assert.equal(replay.status,409);assert.equal(replay.data.receipt.replayed,true);
  assert.equal(ok(await c.context('run',saved.id)).record.rev,newer.rev,'retrying the immutable conflict cannot mutate the head');

  const latest=ok(await c.context('run',saved.id)).record,next=structuredClone(latest.attempt);next.practice.responses.push({id:'answer-2',itemId:'question',revision:2,input:'A separate revised answer'});
  const revised=ok(await c.request('/api/activities/attempt',{purpose,operationId:'deliberate-reconciled-save',id:saved.id,expectedRev:latest.rev,title:latest.title,attempt:next})).record;
  assert.equal(revised.id,saved.id);assert.equal(revised.attempt.activity.rendition,first.rendition);assert.equal(revised.attempt.nextIntention,'Keep this explicit newer intention.');
  assert.deepEqual(revised.attempt.practice.responses[0],saved.attempt.practice.responses[0]);assert.deepEqual(revised.attempt.practice.feedback,saved.attempt.practice.feedback);
  assert.equal(revised.attempt.practice.responses[1].revision,2);

  const updated=ok(await c.request('/api/activities/publish',{purpose,operationId:'publish-updated',id:first.id,expectedRev:first.rev,title:'TEST ONLY newer edition',synthetic:false,learningScope,activity:activity('newer')})).record;
  assert.notEqual(updated.rendition,first.rendition);
  const exact=ok(await c.request('/api/activities/browse?kind=attempts&activityId=activity&activityRendition='+first.rendition));
  assert.equal(exact.items[0].record.attempt.activity.rendition,first.rendition);assert.equal(exact.items[0].activityTitle,first.title,'older answers use their retained Activity title');
  assert.deepEqual(ok(await c.request('/api/activities/browse?kind=attempts&activityId=activity&activityRendition='+updated.rendition)).items,[]);
  assert.equal(ok(await c.context('run',saved.id,saved.rendition)).record.attempt.practice.responses.length,1,'retained original answer is unchanged');
  assert.equal((await fixture.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0,'discovery/revisions create no achievement/checkpoint');
 }finally{await fixture.dispose();}
});
