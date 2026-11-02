import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};";
test('PR79 Study Find discovers original writing and substantive passages in one rights-checked query',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('pr79-find-owner');
  const save=async(family,id,title,body,extra={})=>{
   const response=await client.command({action:'create',family,id,data:{title,body,...extra}});
   assert.equal(response.status,200,JSON.stringify(response.data));
   return response.data.record;
  };
  const article=await save('article','pr79-find-reading','An explanation to explore','Introduction to a real question.',{sections:[{id:'explain',title:'The mechanism',parts:[{id:'explain-this',kind:'paragraph',text:'A curious-sentinel example belongs in the explanatory passage, not merely its heading.'}]}]});
  const note=await save('note','pr79-find-note','My experiment','I wrote a curious-sentinel observation before I knew why.');
  const work=await save('work','pr79-find-work','Another question','The curious-sentinel idea might relate to my longer inquiry.');
  const hidden=await save('journey','pr79-find-old','Old curious-sentinel title','Historical work.',{sections:[{id:'phase',title:'Old section',parts:[{id:'old-text',kind:'paragraph',text:'An old excerpt.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage',sectionId:'phase',title:'Historical stage'}]}});
  assert.ok(article&&note&&work&&hidden);
  const response=await client.request('/api/query?study=1&q=curious-sentinel&limit=20&includeLegacyJourneys=0');
  assert.equal(response.status,200,JSON.stringify(response.data));
  const {records,matchEvidence}=response.data;
  assert.deepEqual(new Set(records.map(item=>item.family+':'+item.id)),new Set(['article:'+article.id,'note:'+note.id,'work:'+work.id]));
  assert.equal(matchEvidence.length,records.length);
  for(const [index,record] of records.entries()){
   assert.deepEqual(matchEvidence[index].record.id,record.id);
   assert.match(matchEvidence[index].excerpt,/curious-sentinel/i);
   assert.equal(matchEvidence[index].record.rev,record.rev);
  }
  const passage=matchEvidence[records.findIndex(item=>item.id===article.id)];
  assert.equal(passage.field,'passage');
  assert.equal(passage.sectionId,'explain');
  assert.equal(passage.partId,'explain-this');
  const other=fixture.client('pr79-find-foreign');
  const isolated=await other.request('/api/query?study=1&q=curious-sentinel&limit=20&includeLegacyJourneys=0');
  assert.equal(isolated.status,200);
  assert.deepEqual(isolated.data.records,[]);
 }finally{await fixture.dispose();}
});
