import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {isDomainPath,domainMethodAllowed} from '../lib/domain-routes.ts';

function unzipStored(bytes){
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),decoder=new TextDecoder(),files={};let offset=0;
 while(offset+4<=bytes.length&&view.getUint32(offset,true)===0x04034b50){
  const nameLength=view.getUint16(offset+26,true),extraLength=view.getUint16(offset+28,true),size=view.getUint32(offset+18,true);
  const name=decoder.decode(bytes.subarray(offset+30,offset+30+nameLength)),at=offset+30+nameLength+extraLength;
  files[name]=decoder.decode(bytes.subarray(at,at+size));offset=at+size;
 }
 assert.equal(view.getUint32(offset,true),0x02014b50,'ZIP central directory present');
 return files;
}
const sections=[{id:'code',title:'Code',parts:[
 {id:'module',kind:'code',language:'python',text:'def result():\n    return 1\n'},
 {id:'suite',kind:'code',language:'python',text:'from radio import result\nassert result() == 1\n'}
]}];
const composition={version:1,sections:[{id:'main',title:'Source',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['code-block']}]}],blocks:[{id:'code-block',sectionId:'code'}],codePackages:[{
 id:'python-source',title:'Python source',runtime:'python',entrypoint:'radio.py',files:[
  {path:'radio.py',sectionId:'code',partId:'module',role:'source'},
  {path:'tests/test_radio.py',sectionId:'code',partId:'suite',role:'test'}
 ]
}]};

test('Source package download route is read-only',()=>{
 assert.equal(isDomainPath('/api/projects/code-package'),true);
 assert.equal(domainMethodAllowed('/api/projects/code-package','POST'),false);
});

test('Exact owner-scoped Project source ZIP preserves history, hashes and honest unavailable files',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('native-source-owner'),stranger=fixture.client('native-source-other'),projectId='native-source-project';
  const update=(operationId,expectedProjectRev,fields)=>owner.request('/api/projects/update',{operationId,expectedGeneration:owner.generation,projectId,expectedProjectRev,...fields});
  const created=await update('native-create',0,{title:'Python work',contentSections:sections,composition});
  assert.equal(created.status,200,JSON.stringify(created.data));
  const toolList=await owner.request('/mcp',{jsonrpc:'2.0',id:'tools',method:'tools/list',params:{}});
  const projectWriter=toolList.data.result.tools.find(tool=>tool.name==='apply_project_update');
  assert.match(JSON.stringify(projectWriter?.inputSchema),/codePackages/,'MCP authoring schema includes native package declarations');
  for(const [i,path] of ['../private.py','/etc/passwd','tests/../radio.py','tests\\test.py','.env','MINAMO-SOURCE-MANIFEST.json','CON.py','source.zip','tests//x.py'].entries()){
   const invalid=structuredClone(composition);invalid.codePackages[0].files[0].path=path;
   const denied=await update('native-path-denied-'+i,1,{composition:invalid});
   assert.equal(denied.status,400,path);
  }
  const collision=structuredClone(composition);collision.codePackages[0].files[1].path='RADIO.PY';
  assert.equal((await update('native-case-collision',1,{composition:collision})).status,400);
  const read=await owner.request('/api/projects/composition?projectId='+projectId);
  assert.equal(read.status,200);
  assert.equal(read.data.codePackageInventory[0].files.length,2);
  assert.equal(read.data.codePackageInventory[0].downloadable,true);
  assert.equal(read.data.codePackageInventory[0].files[0].sha256.length,64);
  assert.equal(read.data.codePackageInventory[0].files[0].sha256,createHash('sha256').update(sections[0].parts[0].text).digest('hex'));
  assert.equal(read.data.codePackageInventory[0].sourceRevision,1);
  const fetchZip=(client,rev)=>client.request('/api/projects/code-package?'+new URLSearchParams({projectId,packageId:'python-source',revision:String(rev)}));
  const first=await fetchZip(owner,1);
  assert.equal(first.status,200,JSON.stringify(first.data));
  assert.equal(first.headers.get('content-type'),'application/zip');
  assert.match(first.headers.get('content-disposition'),/native-source-project-r1\.zip/);
  const zipped=new DataView(first.data.buffer,first.data.byteOffset,first.data.byteLength);
  assert.equal(zipped.getUint16(12,true),0x0021,'fixed valid 1980-01-01 DOS date in ZIP local header');
  const original=unzipStored(first.data),manifest=JSON.parse(original['MINAMO-SOURCE-MANIFEST.json']);
  assert.equal(original['radio.py'],sections[0].parts[0].text);
  assert.equal(original['tests/test_radio.py'],sections[0].parts[1].text);
  assert.equal(manifest.contract,'minamo.project-source.v1');
  assert.equal(manifest.project.revision,1);
  assert.equal(manifest.files[0].sectionId,'code');
  assert.equal(manifest.execution,'Not executed or verified by Minamo during export.');
  assert.deepEqual(first.data,(await fetchZip(owner,1)).data,'ZIP is deterministic for one saved edition');
  const replay=await update('native-create',0,{title:'Python work',contentSections:sections,composition});
  assert.equal(replay.data.replayed,true,'retry-stable source-manifest authoring does not create a duplicate revision');
  assert.equal((await fetchZip(stranger,1)).status,404);
  const changed=structuredClone(sections);changed[0].parts[0].text='def result():\n    return 2\n';
  assert.equal((await update('native-revise',1,{contentSections:changed})).status,200);
  const historical=await owner.request('/api/projects/composition?projectId='+projectId+'&revision=1');
  assert.equal(historical.status,200);
  assert.equal(historical.data.currentProjectRev,2);
  assert.equal(historical.data.revision,1);
  assert.equal(historical.data.codePackageInventory[0].sourceRevision,1);
  assert.equal(historical.data.codePackageInventory[0].downloadable,true);
  assert.equal(unzipStored((await fetchZip(owner,1)).data)['radio.py'],sections[0].parts[0].text,'historical source remains exact');
  assert.equal(unzipStored((await fetchZip(owner,2)).data)['radio.py'],changed[0].parts[0].text);
  // Removal is allowed: the canonical Project can evolve without a package
  // pin blocking the save, but the current ZIP fails closed.
  assert.equal((await update('native-withdraw',2,{contentSections:[{...changed[0],parts:[changed[0].parts[0]]}]})).status,200);
  const missing=await owner.request('/api/projects/composition?projectId='+projectId);
  assert.equal(missing.data.codePackageInventory[0].downloadable,false);
  assert.equal(missing.data.codePackageInventory[0].files[1].status,'missing');
  assert.equal((await fetchZip(owner,3)).status,409);
  assert.equal((await fetchZip(owner,2)).status,200,'saved edition still exports with original test source');
  assert.equal((await fetchZip(owner,999)).status,404);
  assert.equal((await owner.request('/api/projects/code-package?projectId='+projectId+'&packageId=python-source&revision=0')).status,400);
  assert.equal((await stranger.request('/api/projects/composition?projectId='+projectId)).status,404);
  const mcp=await owner.request('/mcp',{jsonrpc:'2.0',id:'package',method:'tools/call',params:{name:'get_project_composition',arguments:{purpose:'Source package inspection',projectId}}});
  assert.equal(mcp.status,200);assert.equal(mcp.data.result.structuredContent.codePackageInventory[0].files[1].status,'missing');
 }finally{await fixture.dispose();}
});
