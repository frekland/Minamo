import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const purpose='TEST ONLY isolated UX practice discovery; no learner achievement.';
const scope=language=>({version:1,spaces:['languages'],languages:[language],provenance:'authored'});
const empty=()=>({version:1,responses:[],feedback:[],corrections:[],reviewEvents:[],interactions:[]});
async function publish(c,id,language,{synthetic=false,source}={}){
 return ok(await c.request('/api/activities/publish',{purpose,operationId:'publish-'+id,id,title:'TEST ONLY '+id,synthetic,learningScope:scope(language),activity:{contract:'minamo.activity.v1',template:'language',intent:'Read one exact original sentence and compare a useful variation.',authorship:'original-exercise',blocks:[{id:'question',kind:'practice',exercise:{version:1,id:'question',kind:'open-response',language,prompt:'Write a useful original sentence.',rubric:'Preserve the intended meaning and explain contextual uncertainty.',modelAnswer:'MODEL ANSWER SHOULD BE WITHHELD',...(source?{source:{family:'article',id:source.id,rendition:source.rendition,sectionId:'s',partId:'p'}}:{})}}]}})).record;
}
async function save(c,activity,id,{synthetic=false,corrections=[],events=[],feedback=[]}={}){
 const practice=empty();practice.responses=[{id:'answer',itemId:'question',revision:1,input:'Original independent answer'}];practice.feedback=feedback;practice.corrections=corrections;practice.reviewEvents=events;
 return ok(await c.request('/api/activities/attempt',{purpose,operationId:'save-'+id,id,title:'TEST ONLY '+id,synthetic,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:activity.id,rendition:activity.rendition},state:'submitted',hintsRevealed:[],evidence:[],practice}})).record;
}
const correction=(id='correction',revision=1,status='retained')=>({id,responseId:'answer',responseRevision:1,revision,original:'Original independent answer',corrected:'Contextual alternative',reason:'A useful optional alternative, not a universal error.',status,modality:'production'});
const review=(id='review',correctionId='correction',at='2020-01-01T10:00:00.000Z',rating='good',correctionRevision=1)=>({id,correctionId,correctionRevision,at,timezone:'Europe/London',rating});

test('practice index: actual D1 owner/scope/edition discovery, review status, rights and stable continuations',{timeout:60000},async t=>{
 const fixture=await privateStorageFixture(worker),c=fixture.client('ux-practice-index-owner'),other=fixture.client('ux-practice-index-other');
 try{
  const source=ok(await c.command({action:'create',family:'article',id:'source',data:{title:'TEST ONLY original source',body:'Independent source.',synthetic:false,learningScope:scope('ja'),sections:[{id:'s',title:'Source',parts:[{id:'p',kind:'paragraph',text:'水をください。'}]}]}})).record;
  const ja=await publish(c,'ja-practice','ja',{source}),de=await publish(c,'de-practice','de'),synthetic=await publish(c,'synthetic-practice','ja',{synthetic:true});
  let due,future,disputed,stale,pending;
  await t.test('source-scoped Activities are discoverable without title guessing and synthetic records stay opt-in',async()=>{
   const page=ok(await c.request('/api/activities/browse?kind=activities&learningSpace=languages&language=ja'));
   assert.deepEqual(page.items.map(i=>i.record.id),[ja.id]);assert.equal(page.generation,'legacy@0');assert.equal(page.nextCursor,null);
   assert.equal(JSON.stringify(page).includes('modelAnswer'),false);
   assert.doesNotMatch(JSON.stringify(page),/MODEL ANSWER SHOULD BE WITHHELD/);
   const included=ok(await c.request('/api/activities/browse?kind=activities&language=ja&includeSynthetic=true'));
   assert.deepEqual(new Set(included.items.map(i=>i.record.id)),new Set([ja.id,synthetic.id]));
   assert.deepEqual(ok(await other.request('/api/activities/browse')).items,[]);
   assert.equal((await c.request('/api/activities/browse?kind=unknown')).status,400);
   assert.equal((await c.request('/api/activities/browse?limit=31')).status,400);
   assert.equal((await c.request('/api/activities/browse?activityRendition=retained-alone')).status,400);
   assert.equal((await c.request('/api/activities/browse?q='+encodeURIComponent('x'.repeat(201)))).status,400);
   assert.equal((await c.request('/api/activities/browse',undefined,{headers:{'oai-authenticated-user-id':''}})).status,401);
   assert.equal((await c.request('/api/activities/browse',undefined,{headers:{'sec-fetch-site':'cross-site'}})).status,403);
  });
  await t.test('due review excludes future, disputed and stale descendants; pending resolves only on its exact response',async()=>{
   due=await save(c,ja,'due',{corrections:[correction()],events:[review()]});
   future=await save(c,ja,'future',{corrections:[correction()],events:[review('future-event','correction','2040-01-01T10:00:00.000Z')]});
   disputed=await save(c,ja,'disputed',{corrections:[correction('correction',1,'disputed')],events:[]});
   stale=await save(c,ja,'stale',{corrections:[correction('correction',2)],events:[review()]});
   pending=await save(c,ja,'pending',{feedback:[{id:'pending-review',responseId:'answer',responseRevision:1,basis:'gpt-provisional',verdict:'pending',explanation:'Selected for contextual review.'}]});
   const duePage=ok(await c.request('/api/activities/browse?kind=reviews&language=ja'));
   assert.deepEqual(duePage.items.map(i=>i.record.id),[due.id]);assert.equal(duePage.items[0].dueReviewCount,1);assert.equal(duePage.items[0].activityTitle,ja.title);
   const attempts=ok(await c.request('/api/activities/browse?kind=attempts&activityId='+ja.id+'&activityRendition='+ja.rendition));
   assert.equal(attempts.items.length,5);assert.equal(attempts.items.find(i=>i.record.id===pending.id).pendingReviewCount,1);
   const byActivityTitle=ok(await c.request('/api/activities/browse?kind=attempts&q=JA-PRACTICE'));
   assert.equal(byActivityTitle.items.length,5,'title lookup includes the resolved retained Activity title');
   assert.equal(ok(await c.request('/api/activities/browse?kind=attempts&q=Contextual%20alternative')).items.length,0,'title lookup does not silently search private response/correction prose');
   const next=structuredClone(pending.attempt);next.practice.feedback.push({id:'returned-review',responseId:'answer',responseRevision:1,basis:'learner',verdict:'uncertain',explanation:'Context remains uncertain.'});
   pending=ok(await c.request('/api/activities/attempt',{purpose,operationId:'resolve-pending',id:pending.id,expectedRev:pending.rev,title:pending.title,attempt:next})).record;
   const after=ok(await c.request('/api/activities/browse?kind=attempts&activityId='+ja.id));assert.equal(after.items.find(i=>i.record.id===pending.id).pendingReviewCount,0);
   assert.deepEqual(ok(await c.request('/api/activities/browse?kind=attempts&language=de')).items,[]);
   assert.equal((await c.request('/api/activities/browse?kind=attempts&activityId='+ja.id+'&activityRendition=not-a-retained-edition')).status,404);
  });
  await t.test('pagination is complete, query-bound and invalidated by saved-work changes',async()=>{
   let path='/api/activities/browse?kind=attempts&limit=2',seen=[];
   do{const page=ok(await c.request(path));seen.push(...page.items.map(i=>i.record.id));path=page.nextCursor?'/api/activities/browse?kind=attempts&limit=2&cursor='+page.nextCursor:null;}while(path);
   assert.equal(seen.length,5);assert.equal(new Set(seen).size,5);
   const first=ok(await c.request('/api/activities/browse?kind=attempts&limit=1'));
   assert.ok(first.nextCursor);
   assert.equal((await c.request('/api/activities/browse?kind=attempts&limit=1&q=other&cursor='+first.nextCursor)).status,409);
   assert.equal((await c.request('/api/activities/browse?kind=reviews&limit=1&cursor='+first.nextCursor)).status,409);
   ok(await c.command({action:'update',family:'article',id:source.id,expectedRev:source.rev,data:{body:'Source explanation extended while its exact old edition remains eligible.'}}));
   assert.equal((await c.request('/api/activities/browse?kind=attempts&limit=1&cursor='+first.nextCursor)).status,409);
  });
  await t.test('revoked source hides ready Activity and all derived review data while retaining independent answers',async()=>{
   const current=ok(await c.context('article',source.id)).record;ok(await c.command({action:'trash',family:'article',id:source.id,expectedRev:current.rev}));
   const activities=ok(await c.request('/api/activities/browse?kind=activities&language=ja'));assert.deepEqual(activities.items,[]);
   const reviews=ok(await c.request('/api/activities/browse?kind=reviews'));assert.deepEqual(reviews.items,[]);
   const answers=ok(await c.request('/api/activities/browse?kind=attempts&activityId='+ja.id));
   assert.equal(answers.items.length,5);for(const item of answers.items){assert.equal(item.dueReviewCount,0);assert.equal(item.pendingReviewCount,0);assert.deepEqual(item.record.attempt.practice.feedback,[]);assert.deepEqual(item.record.attempt.practice.corrections,[]);assert.equal(item.record.attempt.practice.responses[0].input,'Original independent answer');}
   assert.equal((await fixture.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);
  });
  await t.test('bounded review scan advertises continuation instead of claiming complete absence',async()=>{
   const base=await save(c,de,'scan-template');
   const statements=[];for(let i=0;i<65;i++){const clone={...base,id:'scan-'+String(i).padStart(3,'0'),updatedAt:'2026-10-25T10:00:00.000Z',title:'TEST ONLY scan '+i};statements.push(fixture.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(c.owner,'run',clone.id,JSON.stringify(clone),clone.rev,null,'synthetic-index-fixture'));}await fixture.db.batch(statements);
   const page=ok(await c.request('/api/activities/browse?kind=reviews&language=de&limit=1'));
   assert.deepEqual(page.items,[]);assert.ok(page.nextCursor);assert.equal(page.scanIncomplete,true);
   const next=ok(await c.request('/api/activities/browse?kind=reviews&language=de&limit=1&cursor='+page.nextCursor));assert.deepEqual(next.items,[]);assert.equal(next.nextCursor,null);
  });
  await t.test('generation changes reject old headers and old continuations',async()=>{
   const first=ok(await c.request('/api/activities/browse?kind=attempts&limit=1'));
   await fixture.db.prepare('INSERT INTO v2_generation_heads(owner,generation_id,revision,namespace) VALUES(?,?,?,?)').bind(c.owner,'ux-index-generation',1,'ux-index-empty-namespace').run();
   assert.equal((await c.request('/api/activities/browse')).status,409);
   c.setGeneration('ux-index-generation@1');
   assert.equal((await c.request('/api/activities/browse?kind=attempts&limit=1&cursor='+first.nextCursor)).status,409);
   assert.deepEqual(ok(await c.request('/api/activities/browse')).items,[]);
  });
 }finally{await fixture.dispose();}
});

test('practice discovery respects the independently disabled feature gate',{timeout:30000},async()=>{
 const fixture=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch:domainHandler}');
 try{assert.equal((await fixture.client('ux-index-feature-off').request('/api/activities/browse')).status,404);}finally{await fixture.dispose();}
});
