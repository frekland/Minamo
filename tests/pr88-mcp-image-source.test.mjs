import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';import {assetHandler} from './lib/asset-handler.ts';export default {fetch(r,e){return new URL(r.url).pathname.startsWith('/api/assets')?assetHandler(r,e):domainHandler(r,e)}}`;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAAFElEQVR4nGMUCWhiYGBgYmBgQFAAEPgA7OnJpxEAAAAASUVORK5CYII=','base64');
async function mcp(c,name,args){
 const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Explicit private image source reconciliation',...args}}});
 assert.equal(r.status,200,JSON.stringify(r.data));
 return r.data.result?.structuredContent??JSON.parse(r.data.result?.content?.find(x=>x.type==='text')?.text??'{}');
}
const project=c=>({operationId:'create-image-project',expectedGeneration:c.generation,projectId:'mcp-image-project',expectedProjectRev:0,title:'TEST raster upload',body:'The text must survive cover changes.'});

test('MCP image upload stages private validated raster bytes and attaches only through Project CAS',async()=>{
 const f=await privateStorageFixture(worker),c=f.client('owner');
 try{
  const upload={uploadId:'mcp-image-source',expectedGeneration:c.generation,mime:'image/png',base64:png.toString('base64')};
  const a=await mcp(c,'upload_minamo_project_image',upload);
  assert.equal(a.attached,false);assert.equal(a.asset.state,'staged');assert.equal(a.asset.mime,'image/png');
  assert.equal(a.transportLimitBytes,120000);assert.match(a.next,/apply_project_update/);
  assert.equal((await mcp(c,'upload_minamo_project_image',upload)).asset.assetId,a.asset.assetId);
  assert.equal((await c.request('/api/assets/'+a.asset.assetId)).status,404);
  assert.equal((await f.client('other').request('/api/assets/'+a.asset.assetId)).status,404);

  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,mime:'image/jpeg'})).code,'image_mime_mismatch');
  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,base64:'!!!!'})).code,'invalid_image_base64');
  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,base64:'data:image/png;base64,'+upload.base64})).code,'invalid_image_base64');
  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,base64:Buffer.alloc(120003).toString('base64')})).code,'invalid_image_upload');
  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,expectedGeneration:'not-this-generation'})).code,'generation_conflict');
  assert.equal((await mcp(c,'upload_minamo_project_image',{...upload,remoteUrl:'https://example.invalid/pixel.png'})).code,'invalid_image_upload');

  const made=await mcp(c,'apply_project_update',project(c));assert.equal(made.status,'committed',JSON.stringify(made));
  const cover={operationId:'attach-private-cover',expectedGeneration:c.generation,projectId:'mcp-image-project',expectedProjectRev:1,projectCover:{assetId:a.asset.assetId,decorative:false,alt:'A test raster'}};
  const attached=await mcp(c,'apply_project_update',cover);assert.equal(attached.status,'committed',JSON.stringify(attached));
  assert.equal(attached.record.rendition,made.record.rendition);
  assert.equal((await c.request('/api/assets/'+a.asset.assetId)).status,200);
  assert.equal((await f.client('other').request('/api/assets/'+a.asset.assetId)).status,404);
  assert.equal((await mcp(c,'apply_project_update',{...cover,operationId:'stale-cover'})).code,'revision_conflict');
  assert.equal((await c.context('journey','mcp-image-project')).data.record.body,'The text must survive cover changes.');
  const foreign=f.client('other');
  assert.equal((await mcp(foreign,'apply_project_update',project(foreign))).status,'committed');
  assert.equal((await mcp(foreign,'apply_project_update',{...cover,expectedGeneration:foreign.generation})).code,'image_unavailable');
 }finally{await f.dispose();}
});
