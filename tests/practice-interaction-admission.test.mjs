import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import{domainHandler}from'./lib/domain-handler.ts';import{japaneseDialogue}from'./lib/practice-language-exemplars.ts';import{characterExamples}from'./lib/practice-character-data.ts';export default{fetch(r,e){if(new URL(r.url).pathname==='/test/fixtures')return Response.json({scenario:japaneseDialogue,character:characterExamples['ja-人']});return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:'1'});}}`;
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const purpose='TEST ONLY real isolated interaction admission; no achievement.';
test('real D1 enforces exact scenario replay and bounded character event semantics before saving supplied traces',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-exact-interaction-admission');try{
  const fixtures=ok(await c.request('/test/fixtures')),activity=ok(await c.request('/api/activities/publish',{purpose,operationId:'publish',id:'interactions',title:'TEST ONLY exact interactions',synthetic:true,activity:{contract:'minamo.activity.v1',template:'language',authorship:'original-exercise',intent:'Retain only deliberately supplied finite original interactions.',blocks:[{id:'dialogue',kind:'scenario',scenario:fixtures.scenario},{id:'character',kind:'character',title:'Original character fixture',data:fixtures.character}]}})).record;
  const interaction=(blockId,kind,events,edition=activity.rendition)=>({blockId,kind,edition,events});let serial=0;
  const submit=interactions=>c.request('/api/activities/attempt',{purpose,operationId:'attempt-'+(++serial),id:'attempt-'+serial,title:'TEST ONLY trace',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:activity.id,rendition:activity.rendition},state:'submitted',practice:{version:1,interactions}}});
  const valid=[interaction('dialogue','scenario',[{type:'choose',value:'uncertain'},{type:'choose',value:'recover'}]),interaction('character','character',[{type:'stroke',value:'[[0,0],[40,60]]'},{type:'keyboard-recall',value:'2'}])];
  const saved=ok(await submit(valid)).record;assert.deepEqual(saved.attempt.practice.interactions,valid);assert.equal(saved.attempt.state,'submitted','a finite branch trace remains supplied interaction, not achievement');
  const invalid=[
   [interaction('dialogue','scenario',[{type:'choose',value:'does-not-exist'}])],
   [interaction('dialogue','scenario',[{type:'choose',value:'recover'}])],
   [interaction('dialogue','scenario',[{type:'move',value:'book:1:0'}])],
   [interaction('dialogue','scenario',[{type:'choose',value:'uncertain'}],'foreign-edition')],
   [interaction('dialogue','character',[{type:'model-replay',value:'all'}])],
   [interaction('character','character',[{type:'stroke',value:'[[0,0],[101,1]]'}])],
   [interaction('character','character',[{type:'keyboard-recall',value:'999'}])],
   [interaction('character','character',[{type:'mastered',value:'true'}])],
   [interaction('character','character',Array.from({length:129},()=>({type:'guides',value:'true'})))]
  ];
  for(const traces of invalid){const rejected=await submit(traces);assert.equal(rejected.status,409,JSON.stringify(rejected.data));assert.equal(rejected.data.code,'activity_context_unavailable');}
  assert.equal((await f.db.prepare("SELECT count(*) n FROM v2_records WHERE owner=? AND family='run'").bind(c.owner).first()).n,1,'only the valid deliberately supplied trace is saved');assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments WHERE owner=?').bind(c.owner).first()).n,0);
 }finally{await f.dispose();}
});
