import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:"1"})}}';
test('every complete Foundry catalogue example passes actual typed MCP preview without writes, and a stale digest still rejects',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('synthetic-capability-examples');
 async function call(name,args={}){const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY catalogue authoring acceptance',...args}}});assert.equal(r.status,200);return r.data.result;}
 try{
 const capsResult=await call('get_minamo_activity_capabilities');assert.notEqual(capsResult.isError,true);const caps=JSON.parse(capsResult.content[0].text),examples=caps.foundryAuthoring.examples;assert.equal(Object.keys(examples).length,12);
 const blocks=Object.entries(examples).map(([kind,artefact],i)=>({id:'example-'+i,kind:'foundry',artefact}));
 const request={operationId:'examples-preview',id:'examples-preview',title:'TEST ONLY catalogue examples',synthetic:true,activity:{contract:'minamo.activity.v1',template:'diagnostic',intent:'Inspect inert supplied catalogue examples, not execution or learner progress.',authorship:'original-exercise',blocks}};
 const result=await call('preview_minamo_activity_package',request);assert.notEqual(result.isError,true,JSON.stringify(result));assert.equal(JSON.parse(result.content[0].text).valid,true);
 request.activity.blocks[0].artefact.canonical.sha256='0'.repeat(64);const rejected=await call('preview_minamo_activity_package',request);assert.equal(rejected.isError,true);
 for(const table of ['v2_records','v2_operations','v2_activity','v2_learning_developments'])assert.equal((await f.db.prepare('SELECT count(*) n FROM '+table).first()).n,0);
 }finally{await f.dispose();}
});
