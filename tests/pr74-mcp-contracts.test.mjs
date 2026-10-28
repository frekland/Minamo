import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:'1'})}}`;
const purpose='TEST ONLY PR74 contract regression; synthetic fixtures, no learner achievement.';
const activity={contract:'minamo.activity.v1',template:'debugging',intent:'Inspect an original synthetic example.',authorship:'original-exercise',blocks:[{id:'prompt',kind:'prediction',text:'Predict the exact synthetic result.'}]};
test('outer MCP envelopes agree for nested CAS conflicts, replay, validation and exact scopes',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-mcp-contract');
 const call=async(name,args={})=>(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...args}}})).data.result;
 try{
  const input={operationId:'activity-create',id:'activity',title:'TEST ONLY Activity',synthetic:true,activity};
  const created=await call('publish_minamo_activity_package',input);assert.equal(created.isError,false);assert.deepEqual(created.structuredContent,JSON.parse(created.content[0].text));
  assert.equal((await call('publish_minamo_activity_package',input)).structuredContent.receipt.replayed,true);
  const revised=await call('publish_minamo_activity_package',{...input,operationId:'activity-update',expectedRev:1,title:'TEST ONLY revised'});assert.equal(revised.isError,false);
  const stale=await call('publish_minamo_activity_package',{...input,operationId:'activity-stale',expectedRev:1});assert.equal(stale.isError,true);assert.equal(stale.structuredContent.receipt.status,'conflict');assert.equal(stale.structuredContent.code,'operation_conflict');
  const attempt={operationId:'attempt-create',id:'attempt',title:'TEST ONLY supplied attempt',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:'activity',rendition:created.structuredContent.record.rendition},state:'editing',prediction:'Synthetic prediction.'}};
  const saved=await call('record_minamo_activity_attempt',attempt);assert.equal(saved.isError,false,saved.content[0].text);
  assert.equal((await call('record_minamo_activity_attempt',{...attempt,operationId:'attempt-update',expectedRev:1})).isError,false);
  const staleAttempt=await call('record_minamo_activity_attempt',{...attempt,operationId:'attempt-stale',expectedRev:1});assert.equal(staleAttempt.isError,true);assert.equal(staleAttempt.structuredContent.receipt.status,'conflict');
  const invalid=await call('publish_minamo_activity_package',{...input,operationId:'invalid',activity:{}});assert.equal(invalid.isError,true);assert.ok(invalid.structuredContent.code);
  const tools=(await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/list'})).data.result.tools;assert.ok(tools.find(t=>t.name==='read_minamo_activity').inputSchema.required.includes('purpose'));
  assert.ok(tools.find(t=>t.name==='get_minamo_relationship_candidates').inputSchema.properties.cursor);
  const full=await call('get_minamo_activity_capabilities'),small=await call('get_minamo_activity_capabilities',{detail:'summary'});assert.ok(JSON.stringify(small).length<JSON.stringify(full).length/3);assert.ok(small.structuredContent.versions.contentContract);
  await c.command({action:'create',family:'note',id:'scoped',data:{title:'TEST ONLY computing',body:'Synthetic exact identity.',synthetic:true,learningScope:{version:1,spaces:['computing'],provenance:'authored'}}});
  const exact=await call('read_minamo_record',{family:'note',id:'scoped',learningSpace:'languages',language:'ja'});assert.equal(exact.isError,false);assert.equal(exact.structuredContent.scope.inRequestedScope,false);assert.deepEqual(exact.structuredContent.scope.effective.spaces,['computing']);
 }finally{await f.dispose();}
});
test('candidate pagination filters before limit and fences cursor scope and saved-work changes',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-candidate-pages');
 const call=async(args)=>(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_relationship_candidates',arguments:{purpose,query:'TESTONLYCANDIDATE',limit:1,...args}}})).data.result;
 try{
  for(const [family,id] of [['journey','a'],['investigation','b'],['article','c'],['area','d'],['note','newer-one'],['note','newer-two']])await c.command({action:'create',family,id,data:{title:'TESTONLYCANDIDATE '+id,body:'Synthetic candidate pagination coverage.',synthetic:true}});
  const badLimit=await call({limit:41});assert.equal(badLimit.isError,true);assert.equal(badLimit.structuredContent.code,'invalid_limit');
  const first=await call({});assert.equal(first.isError,false);assert.equal(first.structuredContent.candidates.length,1);assert.ok(first.structuredContent.nextCursor);
  const mismatch=await call({cursor:first.structuredContent.nextCursor,learningSpace:'computing'});assert.equal(mismatch.isError,true);assert.equal(mismatch.structuredContent.code,'cursor_scope_mismatch');
  const refs=[];let page=first;for(let i=0;i<10;i++){assert.equal(page.isError,false,page.content[0].text);refs.push(...page.structuredContent.candidates.map(x=>x.ref.family+':'+x.ref.id));if(!page.structuredContent.nextCursor)break;page=await call({cursor:page.structuredContent.nextCursor});}
  assert.deepEqual(new Set(refs),new Set(['journey:a','investigation:b','article:c','area:d']));assert.equal(refs.length,4);
  await c.command({action:'create',family:'note',id:'mutation',data:{title:'TEST ONLY cursor mutation',body:'Synthetic.',synthetic:true}});const changed=await call({cursor:first.structuredContent.nextCursor});assert.equal(changed.isError,true);assert.match(changed.structuredContent.code,/query_changed|cursor/);
 }finally{await f.dispose();}
});
