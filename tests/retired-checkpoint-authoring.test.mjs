import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';

test('new MCP catalogue has no checkpoint writer, authoring schema or save prompt',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('modern-authoring');
  const response=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
  assert.equal(response.status,200);
  const tools=response.data.result.tools;
  const names=tools.map(t=>t.name);
  for(const name of ['record_minamo_learning_development','revise_minamo_learning_development'])assert.equal(names.includes(name),false);
  for(const name of ['publish_minamo_manuscript','record_minamo_learning_update','get_minamo_working_context'])assert.ok(names.includes(name),name);
  const command=tools.find(t=>t.name==='apply_minamo_command');
  assert.ok(command);
  assert.doesNotMatch(JSON.stringify(command.inputSchema),/"checkpoint"\s*:/i);
  const authoring=tools.filter(t=>/authoring|manuscript|learning_context|editorial_policy/i.test(t.name));
  assert.ok(authoring.every(t=>!/explicit-user-checkpoint|checkpoint this|record a checkpoint/i.test(t.description??'')),'MCP authoring must not suggest legacy saving');
  assert.ok(tools.find(t=>t.name==='get_minamo_learning_context')?.description.includes('historical saved interpretations'));
  const policy=await c.request('/mcp',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'get_minamo_editorial_policy',arguments:{purpose:'Inspect current Project authoring language',detail:'summary'}}});
  assert.equal(policy.status,200);
  assert.doesNotMatch(JSON.stringify(policy.data.result.structuredContent?.standard??policy.data.result),/Create learner tasks only in.*Activities/);
  const oldCall=await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'record_minamo_learning_development',arguments:{purpose:'Attempt cached obsolete call'}}});
  assert.ok(oldCall.data.error||oldCall.data.result?.isError,'cached obsolete tool cannot write');
 }finally{await f.dispose();}
});

test('old checkpoint save endpoints are retired; legitimate historic Step fields stay readable',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('historic-authoring');
  const legacy=await c.command({action:'create',family:'journey',id:'archived-route',data:{title:'Retained original',body:'Earlier canonical content.',sections:[{id:'reading',title:'Original section',parts:[{id:'passage',kind:'paragraph',text:'This is a saved older passage.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'exact-step',sectionId:'reading',title:'Original step'}]}}});
  assert.equal(legacy.status,200,JSON.stringify(legacy.data));
  const newLegacyShape=await c.command({action:'create',family:'journey',id:'cannot-author-checkpoint',data:{title:'New Project',body:'No checkpoint stage',sections:[{id:'reading',title:'A natural section',parts:[]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage-one',sectionId:'reading',title:'Begin here',checkpoint:'Give evidence of completion'}]}}});
  assert.equal(newLegacyShape.status,400,'direct API must not create checkpoint fields even if an old client submits them');
  assert.match(JSON.stringify(newLegacyShape.data),/checkpoint metadata/i);
  // Fixture-only injection represents a genuine pre-migration stored record;
  // it is not admitted through today's authoring API.
  await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.learningShape.stages[0].checkpoint',?) WHERE owner=? AND family='journey' AND id=?").bind('Formerly required evidence prompt',c.owner,'archived-route').run();
  const exact=(await c.context('journey','archived-route')).data.record;
  assert.equal(exact.learningShape.stages[0].checkpoint,'Formerly required evidence prompt','old stored content remains exact');
  const unchangedLegacy=await c.command({action:'update',family:'journey',id:'archived-route',expectedRev:1,data:{title:'Retained original with revised title',learningShape:exact.learningShape}});
  assert.equal(unchangedLegacy.status,200,JSON.stringify(unchangedLegacy.data));
  const revisedShape=structuredClone(exact.learningShape);revisedShape.stages[0].checkpoint='A different mandatory proof';
  const changedLegacy=await c.command({action:'update',family:'journey',id:'archived-route',expectedRev:2,data:{learningShape:revisedShape}});
  assert.equal(changedLegacy.status,400,'replacing historical checkpoint text is not a new supported authoring operation');
  const incoming={purpose:'Old authoring client',intent:'explicit-user-checkpoint',expectedGeneration:c.generation,operationId:'retired-operation',target:{kind:'journey-stage',journeyId:'archived-route',stageId:'exact-step'},expectedTargetRev:1,development:{summary:'Old progress data'}};
  for(const path of ['/api/learning-developments','/api/learning-developments/revise']){
   const rejected=await c.request(path,incoming);
   assert.equal(rejected.status,410,JSON.stringify(rejected.data));
   assert.equal(rejected.data.code,'legacy_authoring_retired');
  }
  const latest=await c.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(incoming.target)}));
  assert.equal(latest.status,200,JSON.stringify(latest.data));
  assert.equal(latest.data.checkpointGuide,undefined,'context must not give GPT an obsolete writing recipe');
  assert.deepEqual(latest.data.developments,[]);
  assert.equal((await f.db.prepare('SELECT count(*) AS n FROM v2_learning_developments WHERE owner=?').bind(c.owner).first()).n,0);
 }finally{await f.dispose();}
});

test('owner-reviewed interpretation uses a distinct route without enabling generic progress writes',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('reviewed-meaning');
  const note=await c.command({action:'create',family:'note',id:'original',data:{title:'Original observation',body:'I saw the command hang; the cause is uncertain.'}});
  assert.equal(note.status,200);
  const input={purpose:'Owner reviewed their own interpretation',intent:'explicit-user-meaning',expectedGeneration:c.generation,operationId:'reviewed-1',target:{kind:'record',family:'note',id:'original'},expectedTargetRev:1,development:{kind:'interpretation',summary:'The delay may be DNS lookup, not packet loss.',facts:[{role:'interpretation',text:'The delay may be DNS lookup, not packet loss.',basis:'learner-reported'}],nextQuestions:['Check a local resolver trace.']}};
  assert.equal((await c.request('/api/learning-interpretations',{...input,intent:'explicit-user-checkpoint'})).status,400);
  const saved=await c.request('/api/learning-interpretations',input);
  assert.equal(saved.status,200,JSON.stringify(saved.data));
  assert.equal(saved.data.status,'committed');
  assert.equal((await c.context('note','original')).data.record.body,'I saw the command hang; the cause is uncertain.','review does not overwrite original Note');
  const replay=await c.request('/api/learning-interpretations',input);
  assert.equal(replay.status,200);assert.equal(replay.data.replayed,true);
 }finally{await f.dispose();}
});
