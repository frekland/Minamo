import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;

async function call(c,name,args={}){
 const response=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY verify synthetic isolation',...args}}});
 assert.equal(response.status,200,JSON.stringify(response.data));
 assert.notEqual(response.data.result.isError,true,JSON.stringify(response.data));
 return response.data.result.structuredContent??JSON.parse(response.data.result.content[0].text);
}

test('MCP ordinary discovery hides synthetic records but explicit TEST ONLY opt-in and exact handoffs keep working',async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('synthetic-discovery-owner');
  const real=await c.command({action:'create',family:'journey',id:'ordinary-route',data:{title:'Ordinary Bandit Route',body:'A genuine learning project.',synthetic:false}});
  assert.equal(real.status,200,JSON.stringify(real.data));
  const synthetic=await c.command({action:'create',family:'journey',id:'test-only-mood',data:{title:'TEST ONLY Mood-to-Music',body:'An explicit acceptance Project.',synthetic:true}});
  assert.equal(synthetic.status,200,JSON.stringify(synthetic.data));
  const note=await c.command({action:'create',family:'note',id:'test-only-note',data:{title:'TEST ONLY Mood-to-Music journal',body:'Synthetic private note.',synthetic:true}});
  assert.equal(note.status,200,JSON.stringify(note.data));
  const article=await c.command({action:'create',family:'article',id:'test-only-library',data:{title:'TEST ONLY Mood-to-Music library',body:'Synthetic reference.',synthetic:true}});
  assert.equal(article.status,200,JSON.stringify(article.data));
  const bookmark=await c.command({action:'setFlag',target:{kind:'record',family:'article',id:'test-only-library'},active:true,expectedTargetRev:0});
  assert.equal(bookmark.status,200,JSON.stringify(bookmark.data));

  const ordinaryWorkspace=await call(c,'get_minamo_workspace');
  assert.deepEqual(ordinaryWorkspace.records.map(r=>r.id),['ordinary-route']);
  assert.ok(ordinaryWorkspace.activity.every(a=>a.synthetic===false));
  const explicitWorkspace=await call(c,'get_minamo_workspace',{includeSynthetic:true});
  assert.ok(explicitWorkspace.records.some(r=>r.id==='test-only-mood'));
  assert.ok(explicitWorkspace.records.some(r=>r.id==='test-only-note'));

  for(const name of ['query_minamo_records','get_minamo_relationship_candidates']){
   const search={query:'Mood-to-Music'};
   const hidden=await call(c,name,search);
   assert.ok(!JSON.stringify(hidden).includes('test-only-mood'),name+' ordinary query leaked a synthetic Project');
   const shown=await call(c,name,{...search,includeSynthetic:true});
   assert.match(JSON.stringify(shown),/test-only-mood/,name+' explicit TEST ONLY query failed');
  }
  const defaultLibrary=await call(c,'query_minamo_library',{facet:'search',query:'Mood-to-Music'});
  assert.ok(!JSON.stringify(defaultLibrary).includes('test-only-library'));
  const optInLibrary=await call(c,'query_minamo_library',{facet:'search',query:'Mood-to-Music',includeSynthetic:true});
  assert.match(JSON.stringify(optInLibrary),/test-only-library/);

  const defaultResume=await call(c,'get_minamo_learning_context',{scope:'resume',query:'Mood-to-Music'});
  assert.equal(defaultResume.resolution.status,'not-found');
  const explicitResume=await call(c,'get_minamo_learning_context',{scope:'resume',query:'Mood-to-Music',includeSynthetic:true});
  assert.equal(explicitResume.resolution.status,'resolved');
  assert.equal(explicitResume.journey.id,'test-only-mood');
  const exact=await call(c,'get_minamo_learning_context',{scope:'journey',journeyId:'test-only-mood'});
  assert.equal(exact.journey.id,'test-only-mood');
  const selectedHandoff=await call(c,'get_minamo_context',{family:'journey',id:'test-only-mood'});
  assert.equal(selectedHandoff.record.id,'test-only-mood','the exact browser-selected TEST ONLY target remains accessible');
  const ordinaryHome=await call(c,'get_minamo_learning_context',{scope:'home'});
  assert.ok(!JSON.stringify(ordinaryHome.favourites).includes('test-only-library'),'ordinary MCP Home does not suggest a synthetic favourite');

  const browserWorkspace=await c.request('/api/workspace?limit=20');
  assert.equal(browserWorkspace.status,200,JSON.stringify(browserWorkspace.data));
  assert.ok(browserWorkspace.data.records.some(r=>r.id==='test-only-mood'),'website UI still displays TEST ONLY content');
  const browserHome=await c.request('/api/learning-context?scope=home');
  assert.ok(browserHome.data.favourites.some(r=>r.target.id==='test-only-library'),'browser Home retains explicit synthetic favourite');
 }finally{await f.dispose();}
});

test('MCP synthetic filtering occurs before pagination and continuation cursors cannot cross scopes',async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('synthetic-page-owner');
  await c.command({action:'create',family:'article',id:'ordinary-entry',data:{title:'Ordinary entry',body:'Usable material.',synthetic:false}});
  for(let i=0;i<8;i++)await c.command({action:'create',family:'article',id:'test-only-'+i,data:{title:'TEST ONLY Fixture '+i,body:'Acceptance only.',synthetic:true}});
  const workspace=await call(c,'get_minamo_workspace',{limit:1});
  assert.deepEqual(workspace.records.map(r=>r.id),['ordinary-entry']);
  const search=await call(c,'query_minamo_records',{limit:1});
  assert.deepEqual(search.records.map(r=>r.id),['ordinary-entry']);
  const opted=await call(c,'query_minamo_records',{limit:1,includeSynthetic:true});
  assert.ok(opted.nextCursor,'there are additional eligible records in the opt-in page');
  const switched=await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'query_minamo_records',arguments:{purpose:'TEST ONLY scope cursor misuse',limit:1,cursor:opted.nextCursor}}});
  assert.equal(switched.data.result.isError,true,'an opt-in cursor cannot be replayed in an ordinary query');
 }finally{await f.dispose();}
});
