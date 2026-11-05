import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';import {mediaHandler} from './lib/media-handler.ts';export default {fetch(r,e){return new URL(r.url).pathname.startsWith('/api/media')?mediaHandler(r,e):domainHandler(r,e)}}`;
const bindings={MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_OWNER_ID:'owner',MINAMO_SITE_HOSTS:'storage.test'};
const MIMETYPE='application/vnd.minamo.pygbag+html';
const source=readFileSync('tests/pr83-pygbag-standalone.html');
const part=definition=>({id:'game',kind:'interactive',text:'Authored fallback: this package runs only inside an isolated frame.',interactive:definition});
const section=definition=>({id:'runtime',title:'Packaged experiment',parts:[part(definition)]});
const project=(c,id,definition)=>({operationId:'make-'+id,expectedGeneration:c.generation,projectId:id,expectedProjectRev:0,title:'TEST isolated runtime',body:'Package validation fixture',contentSections:[section(definition)],composition:{version:1,sections:[{id:'main',title:'Package',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['runtime']}]}],blocks:[{id:'runtime',sectionId:'runtime'}]}});
async function mcp(c,name,args){const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Bounded isolated package admission regression',...args}}});assert.equal(r.status,200);return r.data.result.structuredContent;}

test('PR88 standalone Pygbag package admits exact pinned HTML with owner-scoped bytes and digest, never directory loaders',async()=>{
 const f=await privateStorageFixture(worker,{bindings}),c=f.client('owner');try{
  const staged=await c.request('/api/media/stage?uploadId=pr88-pygbag',source,{raw:true,headers:{'Content-Type':MIMETYPE}});assert.equal(staged.status,200,JSON.stringify(staged.data));const asset=staged.data.asset;
  assert.equal(asset.mime,MIMETYPE);assert.equal(asset.kind,'document');
  const d={version:1,type:'pygbag',assetId:asset.assetId,digest:asset.digest,profile:'standalone-html-v1',runtime:'pygame-web/archives/0.9/cpython312'};
  const created=await mcp(c,'apply_project_update',project(c,'package-boundary',d));assert.equal(created.status,'committed',JSON.stringify(created));
  const read=await mcp(c,'get_project_composition',{projectId:'package-boundary'});assert.deepEqual(read.record.sections[0].parts[0].interactive,d);
  const bytes=await c.request('/api/media/'+asset.assetId);assert.equal(bytes.status,200);assert.match(bytes.headers.get('content-disposition')??'',/^attachment/);
  assert.equal((await f.client('other').request('/api/media/'+asset.assetId)).status,404);
  const wrongDigest=await mcp(c,'apply_project_update',{operationId:'bad-digest',expectedGeneration:c.generation,projectId:'package-boundary',expectedProjectRev:1,contentSections:[section({...d,digest:'0'.repeat(64)})]});assert.equal(wrongDigest.code,'invalid_package_reference');
  const wrongRuntime=await mcp(c,'apply_project_update',{operationId:'bad-runtime',expectedGeneration:c.generation,projectId:'package-boundary',expectedProjectRev:1,contentSections:[section({...d,runtime:'another-runtime'})]});assert.equal(wrongRuntime.code,'invalid_package_reference');
  assert.equal((await c.context('journey','package-boundary')).data.record.rev,1);
  const invalid=await c.request('/api/media/stage?uploadId=pr88-directory-package',Buffer.from('<html><script src="local/main.js"></script></html>'),{raw:true,headers:{'Content-Type':MIMETYPE}});assert.equal(invalid.status,400);
  const revoke=await c.request('/api/media/'+asset.assetId+'/revoke',{expectedRevision:asset.revision});assert.equal(revoke.status,200,JSON.stringify(revoke.data));
  const unavailable=await mcp(c,'get_project_composition',{projectId:'package-boundary'});assert.equal(unavailable.record.sections[0].parts[0].unavailable,true);
  assert.equal((await c.request('/api/media/'+asset.assetId)).status,404);
 }finally{await f.dispose();}
});
