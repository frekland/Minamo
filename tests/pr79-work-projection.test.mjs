import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};`;
test('PR79 Work read is a source-attributed learning thread, including honest two-hop Questions',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const c=fixture.client('pr79-work-reader'),ok=value=>{assert.equal(value.status,200,JSON.stringify(value.data));return value.data};
  const work=ok(await c.command({action:'create',family:'work',id:'work-to-return-to',data:{title:'Why headers differ',body:'Compare the responses directly'}})).record;
  const question=ok(await c.command({action:'create',family:'investigation',id:'related-question',data:{title:'Does HEAD return a body?',body:'One exact question',links:[{family:'work',id:work.id,relation:'related',reason:'I am exploring this within the Work.'}]}})).record;
  const indirect=ok(await c.command({action:'create',family:'note',id:'question-linked-note',data:{title:'Result I still need to check',body:'I have not run the second command.',links:[{family:'investigation',id:question.id,relation:'related',reason:'I wrote this for my question.'}]}})).record;
  const unrelated=ok(await c.command({action:'create',family:'note',id:'unlinked-note',data:{title:'Another topic',body:'Not connected to headers'}})).record;
  ok(await c.command({action:'create',family:'note',id:'synthetic-note',data:{title:'TEST-ONLY synthetic claim',body:'Do not appear in owner learning',synthetic:true,links:[{family:'work',id:work.id,relation:'related',reason:'Synthetic fixture'}]}}));
  const update=async(operationId,body,nextAction)=>ok(await c.request('/api/learning-updates',{purpose:'Learner explicitly asked to save this update',intent:'explicit-user-update',operationId,expectedGeneration:c.generation,proposed:{note:{title:'Original update '+operationId,body},development:{summary:'A provisional interpretation from '+operationId,facts:[{role:'interpretation',text:body,basis:'learner-reported'}],nextAction},proposedRelations:[{to:{family:'work',id:work.id},accepted:true,relation:'related',reason:'I chose to keep this update with this Work.'}]}}));
  const first=await update('first-explanation','I expect one response to include the header.','Try the same endpoint with -I.');
  const second=await update('second-explanation','I need to compare another endpoint first.','Compare the two server addresses.');
  const read=ok(await c.request('/api/study/work?'+new URLSearchParams({id:work.id})));
  assert.equal(read.work.source.family,'work');
  const ids=read.entries.map(entry=>entry.source.id);
  assert.ok(ids.includes(first.note.id));assert.ok(ids.includes(second.note.id));assert.ok(ids.includes(indirect.id));
  assert.ok(!ids.includes(unrelated.id));assert.ok(!ids.includes('synthetic-note'));
  assert.equal(ids.filter(id=>id===first.note.id).length,1,'atomic Note+Development is one entry, not duplicate cards');
  const original=read.entries.find(entry=>entry.source.id===first.note.id);
  assert.match(original.excerpt,/I expect one response/);
  assert.equal(original.updates[0].summary,'A provisional interpretation from first-explanation');
  assert.equal(original.updates[0].nextAction,'Try the same endpoint with -I.');
  assert.equal(read.entries.find(entry=>entry.source.id===second.note.id).updates[0].nextAction,'Compare the two server addresses.');
  assert.equal(read.entries.find(entry=>entry.source.id===indirect.id).via.id,question.id);
  assert.ok(!read.directUpdates.length,'no inferred Work-level semantic state');
  assert.equal((await c.request('/api/study/work?id='+work.id)).status,200);
  assert.notEqual((await fixture.client('another-owner').request('/api/study/work?id='+work.id)).status,200);
 }finally{await fixture.dispose()}
});
