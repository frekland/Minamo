import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async promise=>{const response=await promise;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const data=(title,body,links=[])=>({title,body,links,synthetic:true});

test('independent Note, Question and Library Article histories expose actual saves and exact numeric identities',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('standalone-owner'),foreign=f.client('standalone-foreign');
  for(const [family,id,older,newer] of [
   ['note','framing-notes','The proposed visual arrangement has not been built or viewed. '.repeat(15)+'The leading line might help attention.','The proposed visual arrangement has not been built or viewed. '.repeat(15)+'The leading line may compete with the main subject.'],
   ['investigation','cherwell-question','The illustrative phosphate contrast might be stable.','The illustrative contrast is confounded by an assumed sampling gap.'],
   ['article','grammar-reference','〜たあとで: after doing something.','〜たあとで: after the completed action, the following event occurs.']
  ]){
   const first=(await ok(c.command({action:'create',family,id,data:data(id,older)}))).record;
   const same=(await ok(c.command({action:'update',family,id,expectedRev:1,data:{links:[]}}))).record;
   assert.equal(first.rendition,same.rendition,'link-only saves may share canonical reading identity');
   const latest=(await ok(c.command({action:'update',family,id,expectedRev:2,data:{body:newer}}))).record;
   const history=await ok(c.request('/api/records/changes?'+new URLSearchParams({family,id,limit:'2'})));
   assert.equal(history.currentRevision,3);assert.deepEqual(history.entries.map(e=>e.rev),[3,2]);
   assert.notEqual(history.entries[0].changes[0].before,history.entries[0].changes[0].after,'show the changed span, not a shared long prefix');
   if(family==='note'){assert.match(history.entries[0].changes[0].before,/might help attention/);assert.match(history.entries[0].changes[0].after,/may compete/);}
   assert.equal(history.entries[1].rendition,first.rendition);assert.equal(history.entries[1].unchangedContent,true);
   assert.equal(history.entries[0].actor,'user');assert.equal(history.entries[0].synthetic,true);
   const olderRead=await ok(c.request('/api/records/revision?'+new URLSearchParams({family,id,revision:'1',rendition:first.rendition})));
   assert.equal(olderRead.record.rev,1);assert.equal(olderRead.record.body,older);
   const secondRead=await ok(c.request('/api/records/revision?'+new URLSearchParams({family,id,revision:'2',rendition:first.rendition})));
   assert.equal(secondRead.record.rev,2);assert.equal(secondRead.record.body,older);
   assert.equal(new URLSearchParams(history.entries[0].destination.slice(2)).get('revision'),'3');
   const selected=await ok(c.request('/api/learning-context',{scope:'working',selectedRefs:[{family,id}]}));
   assert.equal(selected.selectedChanges[0].currentRevision,3);
   assert.equal(selected.selectedChanges[0].entries[0].rev,3);
   assert.equal(selected.relations.length,0,'saved changes do not invent relationships');
   assert.equal((await foreign.request('/api/records/changes?'+new URLSearchParams({family,id}))).status,404);
   assert.equal((await foreign.request('/api/records/revision?'+new URLSearchParams({family,id,revision:'1'}))).status,404);
   assert.equal((await c.request('/api/records/revision?'+new URLSearchParams({family,id,revision:'3',rendition:first.rendition}))).status,404);
   assert.notEqual(latest.rendition,first.rendition);
  }
 }finally{await f.dispose();}
});

test('a trashed record and invalid revision cannot leak historical prose',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('history-trash');
  const first=(await ok(c.command({action:'create',family:'note',id:'private-note',data:data('Temporary','Never reveal a trashed note.')}))).record;
  await ok(c.command({action:'trash',family:'note',id:first.id,expectedRev:first.rev}));
  for(const path of ['/api/records/changes?family=note&id=private-note','/api/records/revision?family=note&id=private-note&revision=1']){
   const result=await c.request(path);assert.equal(result.status,404);assert.doesNotMatch(JSON.stringify(result.data),/Never reveal/);
  }
  assert.equal((await c.request('/api/records/revision?family=note&id=private-note&revision=-1')).status,400);
 }finally{await f.dispose();}
});
