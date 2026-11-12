import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const source=[{id:'source',title:'Original',parts:[{id:'original',kind:'paragraph',text:'Exact learner example'}]}];
const composition={version:1,sections:[
 {id:'messages',title:'Messages',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['b']}]},
 {id:'practice',title:'Practice',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:[]}]}
],blocks:[{id:'b',sectionId:'source',readingPages:[{id:'original',title:'Original',purpose:'source',partIds:['original']}]}]};
const invoke=(c,name,args)=>c.request('/mcp',{jsonrpc:'2.0',id:'learning-'+name,method:'tools/call',params:{name,arguments:{purpose:'Test an exact and owner-authorised Project learning operation',...args}}});
test('MCP outline/read and bounded append maintain canonical identities and retry-safe Project rights',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=f.client('learning-owner'),other=f.client('other-owner'),pid='learning-example';
  assert.equal((await owner.command({action:'create',family:'journey',id:pid,data:{title:'Music',body:'Reading',sections:source,projectComposition:composition}})).status,200);
  const outline=await invoke(owner,'get_project_learning_outline',{projectId:pid});
  const plan=outline.data.result?.structuredContent;
  assert.equal(plan?.project?.rev,1,JSON.stringify(outline.data));
  assert.equal(plan?.topics?.length,1);
  assert.ok(!JSON.stringify(plan).includes('Exact learner example'),'Outline must not duplicate full source text');
  const page=await invoke(owner,'get_project_learning_reading',{projectId:pid,topicIds:[plan.topics[0].id]});
  assert.equal(page.data.result?.structuredContent?.pages?.[0]?.parts?.[0]?.text,'Exact learner example');
  const missing=await invoke(other,'get_project_learning_outline',{projectId:pid});
  assert.ok(missing.data.result?.isError||missing.data.error||missing.data.result?.structuredContent?.code);
  const params={mode:'preview',projectId:pid,expectedGeneration:owner.generation,expectedProjectRev:1,
   operationId:'music-followup-new',layoutId:'messages',title:'Music follow-up',
   parts:[{id:'try',kind:'paragraph',text:'Play a new short phrase'}],
   pages:[{id:'try',title:'Short practice',layoutId:'practice',purpose:'practice',contextId:'music',
    contextTitle:'Music and interests',partIds:['try'],
    relations:[{kind:'practises',target:{sectionId:'source',partId:'original'}}],
    continuation:{target:{sectionId:'learning-music-followup-new',partId:'try'},label:'Try this next'}}]
  };
  const preview=await invoke(owner,'append_project_learning_material',params);
  assert.equal(preview.data.result?.structuredContent?.valid,true,JSON.stringify(preview.data));
  const unchanged=await owner.request('/api/projects/composition?projectId='+pid);
  assert.equal(unchanged.data.revision,1);
  const committed=await invoke(owner,'append_project_learning_material',{...params,mode:'apply'});
  assert.equal(committed.data.result?.structuredContent?.status,'committed',JSON.stringify(committed.data));
  const replay=await invoke(owner,'append_project_learning_material',{...params,mode:'apply'});
  assert.equal(replay.data.result?.structuredContent?.replayed,true,JSON.stringify(replay.data));
  const saved=await owner.request('/api/projects/composition?projectId='+pid);
  assert.equal(saved.data.revision,2);
  assert.deepEqual(saved.data.record.sections.find(s=>s.id==='source'),source[0]);
  assert.equal(saved.data.record.sections.find(s=>s.id==='learning-music-followup-new').parts[0].text,'Play a new short phrase');
  const again=await invoke(owner,'get_project_learning_outline',{projectId:pid});
  assert.equal(again.data.result?.structuredContent?.contexts.some(x=>x.id==='music'),true);
  const current=again.data.result.structuredContent;
  const context=await invoke(owner,'get_project_learning_reading',{projectId:pid,contextId:'music'});
  assert.equal(context.data.result?.structuredContent?.pages?.length,1);
  const stale=await invoke(owner,'append_project_learning_material',{...params,operationId:'stale-new',mode:'apply'});
  assert.ok(stale.data.result?.isError||stale.data.error||stale.data.result?.structuredContent?.code);
  const old=await invoke(owner,'get_project_learning_outline',{projectId:pid,revision:1});
  assert.equal(old.data.result?.structuredContent?.project.rev,1);
  const bad=await invoke(owner,'get_project_learning_reading',{projectId:pid,topicIds:['unknown:page']});
  assert.ok(bad.data.result?.isError||bad.data.error||bad.data.result?.structuredContent?.code);
 }finally{await f.dispose();}
});
