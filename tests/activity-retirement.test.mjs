import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

test('C1: legacy Activity/Attempt submission surfaces are retired while Project contributions remain available',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('c1-retirement-owner');
  for(const path of ['/api/activities/capabilities','/api/activities/browse']){
   const response=await owner.request(path);assert.equal(response.status,404,path);
  }
  for(const path of ['/api/activities/preview','/api/activities/publish','/api/activities/hint','/api/activities/attempt','/api/activities/context']){
   const response=await owner.request(path,{});assert.equal(response.status,404,path);
  }
  const catalogue=await owner.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
  assert.equal(catalogue.status,200);
  const names=catalogue.data.result.tools.map(tool=>tool.name);
  for(const retired of ['get_minamo_activity_capabilities','preview_minamo_activity_package','publish_minamo_activity_package','read_minamo_activity','reveal_minamo_activity_hint','record_minamo_activity_attempt','get_minamo_activity_context'])assert.ok(!names.includes(retired),retired);
  assert.ok(names.includes('read_project_contributions'));
  const cartridge={contract:'minamo.activity.v1',template:'walkthrough',intent:'Earlier prompt',authorship:'original-exercise',blocks:[{id:'task',kind:'instruction',text:'An earlier prompt'}]};
  const legacy=await owner.command({action:'create',family:'experiment',id:'c1-new-activity-denied',data:{title:'Retired',body:'',activity:cartridge}});
  assert.equal(legacy.status,410,JSON.stringify(legacy.data));assert.equal(legacy.data.code,'activity_attempt_retired');
  const project=await owner.command({action:'create',family:'journey',id:'c1-project-stays',data:{title:'Living Project',body:'',sections:[{id:'topic',title:'Topic',parts:[{id:'source',kind:'paragraph',language:'ja',text:'日本語の例です。'}]}]}});
  assert.equal(project.status,200,JSON.stringify(project.data));
  const contribution=await owner.request('/api/projects/contributions',{operationId:'c1-contribution',expectedGeneration:owner.generation,expectedProjectRev:1,target:{projectId:'c1-project-stays',sectionId:'topic',partId:'source'},id:'my-example',expectedRevision:0,action:'save',kind:'example',columns:['Example','Notes'],cells:['A learner example','Separate from authored text']});
  assert.equal(contribution.status,200,JSON.stringify(contribution.data));
 }finally{await fixture.dispose();}
});
