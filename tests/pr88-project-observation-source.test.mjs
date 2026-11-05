import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const definition={version:1,type:'python-canvas',width:640,height:360,seed:1,code:'from minamo_canvas import clear\nclear()'};
async function mcp(c,name,args){const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Explicit source-level Project observation test',...args}}});assert.equal(r.status,200);return r.data.result?.structuredContent;}
const project=c=>({operationId:'create-observation-project',expectedGeneration:c.generation,projectId:'observation-source-project',expectedProjectRev:0,title:'TEST interactive output',body:'Independent introduction',contentSections:[{id:'lab',title:'Lab',parts:[{id:'visual',kind:'interactive',text:'Authored Python',interactive:definition}]},{id:'neighbour',title:'Neighbour',parts:[{id:'prose',kind:'paragraph',text:'Preserve this independent writing'}]}],composition:{version:1,sections:[{id:'main',title:'Work',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['lab','neighbour']}]}],blocks:[{id:'lab',sectionId:'lab'},{id:'neighbour',sectionId:'neighbour'}]}});

test('browser-reported Project observation saves once as ordinary rich content, never Note or execution proof',async()=>{
 const f=await privateStorageFixture(worker),c=f.client('owner');
 try{
  const created=await mcp(c,'apply_project_update',project(c));assert.equal(created.status,'committed',JSON.stringify(created));
  const r={operationId:'save-source-observation',expectedGeneration:c.generation,projectId:'observation-source-project',expectedProjectRev:1,sectionId:'lab',partId:'visual',definitionDigest:createHash('sha256').update(JSON.stringify(definition)).digest('hex'),observedAt:'2026-11-04T08:00:00.000Z',inputs:{speed:4,enabled:true},seed:1,output:'Browser reported a completed run',description:'The learner saw a faster trace.',classification:'browser-reported'};
  const saved=await c.request('/api/projects/observation',r);assert.equal(saved.status,200);assert.equal(saved.data.status,'committed',JSON.stringify(saved.data));
  const current=(await c.context('journey','observation-source-project')).data.record;
  assert.equal(current.rev,2);assert.equal(current.body,'Independent introduction');
  assert.deepEqual(current.sections[0].parts[0].interactive,definition);assert.deepEqual(current.sections[1],created.record.sections[1]);
  assert.equal(current.sections[0].parts.length,3);assert.match(current.sections[0].parts[1].text,/Browser-reported/);
  const captured=JSON.parse(current.sections[0].parts[2].text);assert.deepEqual(captured.inputs,r.inputs);assert.equal(captured.classification,'browser-reported');
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='note'").first()).n,0);
  const retry=await c.request('/api/projects/observation',r);assert.equal(retry.status,200);assert.equal(retry.data.replayed,true);
  assert.equal((await c.request('/api/projects/observation',{...r,description:'Changed captured evidence'})).data.code,'idempotency_mismatch');
  assert.equal((await c.request('/api/projects/observation',{...r,operationId:'stale-observation'})).data.code,'revision_conflict');
  assert.equal((await c.request('/api/projects/observation',{...r,operationId:'changed-definition',expectedProjectRev:2,definitionDigest:'0'.repeat(64)})).data.code,'observation_definition_changed');
  assert.equal((await c.request('/api/projects/observation',{...r,operationId:'false-authority',expectedProjectRev:2,classification:'server-verified'})).data.code,'invalid_observation');
  assert.equal((await f.client('other').request('/api/projects/observation',{...r,operationId:'foreign-observation'})).data.code,'revision_conflict');
  assert.equal((await c.context('journey','observation-source-project')).data.record.rev,2);
 }finally{await f.dispose();}
});
