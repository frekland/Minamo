import {test} from 'node:test';import assert from 'node:assert/strict';import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const content=(id,text)=>({id,title:'Actual work',parts:[{id:'p-'+id,kind:'paragraph',text}]});
const composition={version:1,sections:[{id:'workspace',title:'',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['work']}]}],blocks:[{id:'work',sectionId:'work'}]};
async function setup(){const f=await privateStorageFixture(worker),c=f.client('project-owner');return {f,c,request:{operationId:'create-project',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:0,title:'TCP investigation',description:'Byte streams and connection failures',body:'An open investigation.',contentSections:[content('work','Learner-reported output; not independently verified.')],composition}};}
async function apply(c,r){return c.request('/api/projects/update',r);}
async function mcp(c,name,args){return c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Owner requested Project update',...args}}});}
function value(result){return result.data.result?.structuredContent??JSON.parse(result.data.result?.content?.find(c=>c.type==='text')?.text??'{}');}
test('PR83 composition metadata uses MCP CAS, preserves rendition and rejects unknown shortcuts atomically',async()=>{const {f,c,request}=await setup();try{
 const made=value(await mcp(c,'apply_project_update',request));assert.equal(made.status,'committed');
 const r=made.record,update={operationId:'arrange-v83',expectedGeneration:c.generation,projectId:r.id,expectedProjectRev:r.rev,changes:[{op:'setSection',id:'workspace',title:'Experiments',collapsed:true},{op:'setBlockPresentation',id:'work',pinned:true,width:'compact'},{op:'setFavourite',id:'work',favourite:true},{op:'setBlockVisibility',id:'work',hidden:true}]};
 const saved=value(await mcp(c,'apply_project_update',update));assert.equal(saved.status,'committed',JSON.stringify(saved));assert.equal(saved.record.rendition,r.rendition);assert.equal(saved.record.projectComposition.sections[0].collapsed,true);assert.equal(saved.record.projectComposition.blocks[0].hidden,true);assert.equal(saved.record.projectComposition.blocks[0].pinned,true);assert.deepEqual(saved.record.projectComposition.favourites,['work']);
 assert.equal(value(await mcp(c,'apply_project_update',update)).replayed,true);
 const bad=value(await mcp(c,'apply_project_update',{...update,operationId:'invalid-shortcut',expectedProjectRev:2,changes:[{op:'setFavourite',id:'missing',favourite:true}]}));assert.equal(bad.code,'shortcut_unavailable');assert.equal((await c.context('journey',r.id)).data.record.rev,2);
 const restored=value(await mcp(c,'apply_project_update',{...update,operationId:'reveal-v83',expectedProjectRev:2,changes:[{op:'setBlockVisibility',id:'work',hidden:false},{op:'setSection',id:'workspace',collapsed:false}]}));assert.equal(restored.status,'committed');assert.equal(restored.record.rendition,r.rendition);
 }finally{await f.dispose();}});
test('PR83 learner section changes are protected against a later GPT replacement',async()=>{const {f,c,request}=await setup();try{
 const made=value(await mcp(c,'apply_project_update',request));assert.equal(made.status,'committed');
 const saved=await apply(c,{operationId:'learner-section',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:1,changes:[{op:'setSection',id:'workspace',title:'My arrangement',hidden:true}]});assert.equal(saved.data.status,'committed',JSON.stringify(saved.data));
 const changed=value(await mcp(c,'apply_project_update',{operationId:'gpt-section',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:2,changes:[{op:'setSection',id:'workspace',title:'Replacement'}]}));assert.equal(changed.code,'learner_edit_preserved');
 }finally{await f.dispose();}});
