import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};";
test('PR79 optional Site-only change attaches reviewed meaning to one saved original, not another Note or progress card',async t=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('site-meaning-learner'),save=async(id,body)=>{
   const response=await client.command({action:'create',family:'note',id,data:{title:id,body}});
   assert.equal(response.status,200,JSON.stringify(response.data));return response.data.record;
  };
  const original='Claim A: I thought HEAD downloads a body.\nClaim B: I think caching may differ.';
  const before=await save('meaning-original',original),after=await save('meaning-reconsidered','I now distinguish HEAD headers from the body. The cache question is still open.');
  const quote='HEAD downloads a body.',anchor={kind:'record-passage',family:'note',id:before.id,revision:before.rev,...(before.rendition?{rendition:before.rendition}:{}),sectionId:'__article',partId:'__body',start:original.indexOf(quote),end:original.indexOf(quote)+quote.length,quote};
  const input={purpose:'Learner explicitly reviewed the change in their own Note',intent:'explicit-user-meaning',expectedGeneration:client.generation,operationId:'pr79-meaning-review',target:{kind:'record',family:'note',id:after.id},expectedTargetRev:after.rev,development:{kind:'correction',summary:'HEAD has headers but no response body; caching remains open.',facts:[{role:'correction',basis:'learner-reported',text:'I corrected the HEAD response-body claim.'}],claimCorrections:[{prior:anchor,accepted:true,reason:'I inspected headers and the body separately.'}],nextQuestions:['Does a cache layer alter those headers?'],nextAction:'Repeat against another endpoint.'}};
  let devId;
  await t.test('one exact original and one reviewed v2 meaning, independent Site/MCP readback',async()=>{
   const written=await client.request('/api/learning-developments',input);
   assert.equal(written.status,200,JSON.stringify(written.data));devId=written.data.developmentRef.id;
   assert.equal(written.data.development.schemaVersion,2);
   assert.deepEqual(written.data.development.claimCorrections[0].prior,anchor);
   const replay=await client.request('/api/learning-developments',input);
   assert.equal(replay.status,200);assert.equal(replay.data.replayed,true);assert.equal(replay.data.developmentRef.id,devId);
   const read=await client.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(input.target)}));
   assert.equal(read.status,200,JSON.stringify(read.data));assert.equal(read.data.developments.length,1);
   assert.equal(read.data.developments[0].nextAction,'Repeat against another endpoint.');
   assert.equal(read.data.developments[0].claimCorrections[0].prior.quote,quote);
   const untouched=await client.context('note',after.id);
   assert.equal(untouched.data.record.body,after.body);assert.equal(untouched.data.record.rev,after.rev);
   const all=await client.request('/api/query?study=1&family=note&limit=20');
   assert.equal(all.status,200);assert.equal(all.data.records.filter(item=>['meaning-original','meaning-reconsidered'].includes(item.id)).length,2);
  });
  await t.test('exact source and target CAS, immutable operation identity, no semantic inference',async()=>{
   const mismatch=structuredClone(input);mismatch.development.summary='Different payload with the old operation ID';
   assert.equal((await client.request('/api/learning-developments',mismatch)).status,409);
   const forged=structuredClone(input);forged.operationId='meaning-forged';forged.development.claimCorrections[0].prior={...anchor,quote:'A different claim'};
   assert.notEqual((await client.request('/api/learning-developments',forged)).status,200);
   const wrong=structuredClone(input);wrong.operationId='meaning-missing';wrong.target.id='foreign-note';
   assert.equal((await client.request('/api/learning-developments',wrong)).status,409);
   const incompatible=structuredClone(input);incompatible.operationId='meaning-other';incompatible.intent='explicit-user-checkpoint';
   assert.equal((await client.request('/api/learning-developments',incompatible)).status,400);
   const changed=await client.command({action:'update',family:'note',id:after.id,expectedRev:after.rev,data:{body:after.body+' A new paragraph.'}});
   assert.equal(changed.status,200,JSON.stringify(changed.data));
   const stale=structuredClone(input);stale.operationId='meaning-stale';
   assert.equal((await client.request('/api/learning-developments',stale)).status,409);
  });
  await t.test('loss of the old original suppresses that precise quotation, preserving the new original',async()=>{
   const trashed=await client.command({action:'trash',family:'note',id:before.id,expectedRev:before.rev});
   assert.equal(trashed.status,200,JSON.stringify(trashed.data));
   const read=await client.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(input.target)}));
   assert.equal(read.status,200,JSON.stringify(read.data));
   assert.deepEqual(read.data.developments[0].claimCorrections,[]);
   assert.equal(read.data.developments[0].evidenceUnavailable,true);
   assert.equal((await client.context('note',after.id)).status,200);
  });
 }finally{await fixture.dispose();}
});

test('PR79 optional change can attach to an already saved genuine Attempt with no required Project',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('site-meaning-attempt');
  const saved=await client.command({action:'create',family:'run',id:'meaning-attempt',data:{title:'My first exploration',body:'I checked the first hypothesis and noticed an unexpected result.',engine:'regex',code:'a+',output:'aaa',evidence:'illustrative',synthetic:false}});
  assert.equal(saved.status,200,JSON.stringify(saved.data));
  const original=saved.data.record;
  const response=await client.request('/api/learning-developments',{intent:'explicit-user-meaning',purpose:'Learner described the change in their saved Attempt',operationId:'site-attempt-meaning',expectedGeneration:client.generation,target:{kind:'record',family:'run',id:original.id},expectedTargetRev:original.rev,development:{kind:'learning-update',summary:'I no longer expect one regex to work for every input.',facts:[],nextQuestions:['What changes with a newline?'],nextAction:'Try a second sample.'}});
  assert.equal(response.status,200,JSON.stringify(response.data));assert.equal(response.data.development.schemaVersion,2);
  const read=await client.context('run',original.id);
  assert.equal(read.status,200);assert.equal(read.data.record.rev,original.rev);assert.equal(read.data.record.body,original.body);
  const meaning=await client.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify({kind:'record',family:'run',id:original.id})}));
  assert.equal(meaning.status,200);assert.equal(meaning.data.developments.length,1);assert.equal(meaning.data.developments[0].nextAction,'Try a second sample.');
 }finally{await fixture.dispose();}
});
