import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import{domainHandler}from"./lib/domain-handler.ts";import{reviewSchedule}from"./lib/practice.ts";export default{async fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const purpose='TEST ONLY synthetic practice admission and revision evidence; no learner achievement.';
const policy={normalization:'NFC',trim:true,caseSensitive:true,pinyin:'literal'};
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const rpc=async(c,name,args)=>{const r=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...args}}}));assert.notEqual(r.result.isError,true,r.result.content?.[0]?.text);return JSON.parse(r.result.content[0].text);};
const base=(id,kind,extra)=>({id,kind:'practice',exercise:{version:1,id,prompt:'Original source-bound '+kind+' task',kind,...extra}});
const empty=()=>({version:1,responses:[],feedback:[],corrections:[],reviewEvents:[],interactions:[]});
test('real D1 practice: typed checks, hidden answer boundary, immutable answer revisions, deferred return, correction descendants and rights',{timeout:60000},async t=>{
 const fixture=await privateStorageFixture(worker),c=fixture.client('synthetic-practice-owner');let published,source,attempt,request;
 try{
  source=ok(await c.command({action:'create',family:'article',id:'practice-source',data:{title:'TEST ONLY original request source',body:'Independent source explanation.',synthetic:true,sections:[{id:'s',title:'Requests',parts:[{id:'p',kind:'paragraph',text:'水をください。',joinBefore:'\n'}]}]}})).record;
  const ref={family:'article',id:source.id,rendition:source.rendition,sectionId:'s',partId:'p',selection:{start:0,end:7,text:'水をください。'}};
  const blocks=[base('choice','choice',{options:[{id:'a',label:'First'},{id:'b',label:'Second'}],correctIds:['b'],multiple:false,explanation:'CHOICE ANSWER CANARY'}),base('cloze','cloze',{accepted:['PRIVATE ANSWER CANARY'],comparison:policy}),base('order','ordering',{options:[{id:'a',label:'A'},{id:'b',label:'B'}],acceptedOrders:[['b','a']]}),base('match','matching',{left:[{id:'x',label:'X'},{id:'y',label:'Y'}],right:[{id:'a',label:'A'},{id:'b',label:'B'}],pairs:[{left:'x',right:'b'},{left:'y',right:'a'}]}),base('greek','transformation',{language:'el',original:'που',accepted:['πού'],comparison:policy}),base('mandarin','dictation',{language:'zh-Hans',accepted:['nǚ hǎo'],comparison:{...policy,pinyin:'tone-numbers'}}),base('open','open-response',{language:'ja',source:ref,rubric:'Consider politeness and the supplied request context. Explain alternatives and uncertainty.',modelAnswer:'OPEN MODEL ANSWER CANARY'})];
  await t.test('publication/readback redacts complete answers and checks exact declared typed rules',async()=>{
   const result=await c.request('/api/activities/publish',{purpose,operationId:'publish-practice',id:'practice-all',title:'TEST ONLY request practice',synthetic:true,activity:{contract:'minamo.activity.v1',template:'language',intent:'Use exact original text and compare declared alternatives.',authorship:'original-exercise',blocks}});published=ok(result).record;
   assert.doesNotMatch(JSON.stringify(published),/PRIVATE ANSWER CANARY|OPEN MODEL ANSWER CANARY|CHOICE ANSWER CANARY/);
   for(const [blockId,input,expected]of [['choice',['b'],'accepted'],['cloze','PRIVATE ANSWER CANARY','accepted'],['order',['b','a'],'accepted'],['match',[{left:'x',right:'b'},{left:'y',right:'a'}],'accepted'],['greek','που\u0301','accepted'],['mandarin','nv3 hao3','accepted'],['open','水をください。','pending']]){const checked=ok(await c.request('/api/activities/read',{id:published.id,rendition:published.rendition,check:{blockId,input}}));assert.equal(checked.practiceResult.verdict,expected,blockId);}
   assert.equal((await c.request('/api/activities/read',{id:published.id,check:{blockId:'order',input:['a','a']}})).status,400);
   const revealed=ok(await c.request('/api/activities/hint',{purpose,id:published.id,rendition:published.rendition,hintId:'answer:cloze'}));assert.deepEqual(revealed.answer.answer,['PRIVATE ANSWER CANARY']);assert.equal(revealed.saved,false);
  });
  await t.test('pending review returns to exact response revision; newer answer does not adopt old feedback',async()=>{
   const practice=empty();practice.responses=[{id:'answer-1',itemId:'open',revision:1,input:'水をください。'}];practice.feedback=[{id:'pending-1',responseId:'answer-1',responseRevision:1,basis:'gpt-provisional',verdict:'pending',explanation:'Selected answer awaits contextual review.'}];
   request={purpose,operationId:'save-answer',id:'practice-attempt',title:'TEST ONLY saved request',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:published.id,rendition:published.rendition},state:'submitted',hintsRevealed:[],evidence:[],practice}};
   attempt=ok(await c.request('/api/activities/attempt',request)).record;const duplicate=ok(await c.request('/api/activities/attempt',request));assert.equal(duplicate.record.rev,attempt.rev);
   const next=structuredClone(attempt.attempt);next.practice.responses.push({id:'answer-2',itemId:'open',revision:2,input:'お水をください。'});attempt=ok(await c.request('/api/activities/attempt',{...request,operationId:'revise-answer',expectedRev:attempt.rev,attempt:next})).record;
   const returned=structuredClone(attempt.attempt);returned.practice.feedback.push({id:'gpt-feedback',responseId:'answer-1',responseRevision:1,basis:'gpt-provisional',verdict:'uncertain',explanation:'Original request is grammatical; context determines appropriate register.'});
   const payload={...request,operationId:'return-old-feedback',expectedRev:attempt.rev,attempt:returned};attempt=(await rpc(c,'record_minamo_activity_attempt',payload)).record;assert.equal(attempt.attempt.practice.feedback.at(-1).responseId,'answer-1');assert.equal(attempt.attempt.practice.responses.at(-1).id,'answer-2');assert.match(attempt.attempt.practice.feedback.at(-1).author,/provisional/);
   const replay=(await rpc(c,'record_minamo_activity_attempt',payload)).record;assert.equal(replay.rev,attempt.rev,'GPT feedback retry uses stable server provenance stamping');
   const altered=structuredClone(attempt.attempt);altered.practice.responses[0].input='silently changed';assert.equal((await c.request('/api/activities/attempt',{...request,operationId:'rewrite-old-answer',expectedRev:attempt.rev,attempt:altered})).status,409);
   const removed={...attempt.attempt};delete removed.practice;assert.equal((await c.request('/api/activities/attempt',{...request,operationId:'drop-history',expectedRev:attempt.rev,attempt:removed})).status,409);
  });
  await t.test('retained corrections and review chronology preserve original answer and reject forged rule results',async()=>{
   const next=structuredClone(attempt.attempt);next.practice.corrections=[{id:'correction',responseId:'answer-1',responseRevision:1,revision:1,original:'水をください。',corrected:'お水をください。',reason:'A contextual politeness alternative; original is not universally wrong.',status:'retained',modality:'production'}];next.practice.reviewEvents=[{id:'review-1',correctionId:'correction',correctionRevision:1,at:'2026-10-25T10:00:00.000Z',timezone:'Europe/London',rating:'good'}];attempt=ok(await c.request('/api/activities/attempt',{...request,operationId:'retain-correction',expectedRev:attempt.rev,attempt:next})).record;
   const disputed=structuredClone(attempt.attempt);disputed.practice.corrections[0].status='disputed';disputed.practice.corrections[0].revision=2;const changed=ok(await c.request('/api/activities/attempt',{...request,operationId:'dispute-correction',expectedRev:attempt.rev,attempt:disputed}));attempt=changed.record;assert.equal(changed.review[0].suspended,true);assert.equal(changed.review[0].stale,true);assert.equal(attempt.attempt.practice.reviewEvents[0].correctionRevision,1);
   const forged=structuredClone(attempt.attempt);forged.practice.feedback.push({id:'fake-check',responseId:'answer-1',responseRevision:1,basis:'deterministic',verdict:'accepted',explanation:'This was not a trusted semantic check.'});assert.equal((await c.request('/api/activities/attempt',{...request,operationId:'forge-rule',expectedRev:attempt.rev,attempt:forged})).status,409);
   const data=await fixture.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first();assert.equal(data.n,0);
  });
  await t.test('current source rights fence keys, deferred feedback and correction descendants while independent input survives',async()=>{
   ok(await c.command({action:'trash',family:'article',id:source.id,expectedRev:source.rev}));
   const read=ok(await c.request('/api/activities/read',{id:published.id}));assert.equal(read.record.activity.blocks.find(b=>b.id==='open').kind,'instruction');assert.doesNotMatch(JSON.stringify(read),/OPEN MODEL ANSWER CANARY/);
   assert.equal((await c.request('/api/activities/hint',{purpose,id:published.id,hintId:'answer:open'})).status,404);
   const visible=ok(await c.context('run',attempt.id)).record;assert.deepEqual(visible.attempt.practice.corrections,[]);assert.deepEqual(visible.attempt.practice.feedback,[]);assert.equal(visible.attempt.practice.responses[0].input,'水をください。');
   assert.equal((await c.request('/api/activities/attempt',{...request,operationId:'save-revoked-derived',expectedRev:attempt.rev,attempt:attempt.attempt})).status,409);
  });
 }finally{await fixture.dispose();}
});
