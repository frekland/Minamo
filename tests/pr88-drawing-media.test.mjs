import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {DRAWING_MIME,drawingAssetUrl} from '../lib/drawing-document.ts';

const worker=`import {domainHandler} from './lib/domain-handler.ts';import {assetHandler} from './lib/asset-handler.ts';import {mediaHandler} from './lib/media-handler.ts';export default {fetch(r,e){const path=new URL(r.url).pathname;return path.startsWith('/api/assets')?assetHandler(r,e):path.startsWith('/api/media')?mediaHandler(r,e):domainHandler(r,e)}}`;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAAFElEQVR4nGMUCWhiYGBgYmBgQFAAEPgA7OnJpxEAAAAASUVORK5CYII=','base64');
const document=(src)=>({schema:{schemaVersion:2,sequences:{}},store:{
 'page:one':{id:'page:one',typeName:'page',name:'One',index:'a1',meta:{}},
 'user:author':{id:'user:author',typeName:'user',name:'Synthetic learner',color:'#5577aa',imageUrl:'',meta:{}},
 'asset:picture':{id:'asset:picture',typeName:'asset',type:'image',props:{src}},
 'shape:picture':{id:'shape:picture',typeName:'shape',type:'image',parentId:'page:one',x:15,y:35,rotation:0,index:'a1',props:{assetId:'asset:picture',w:200,h:120},meta:{}}
}});

test('drawing MIME admission and private read redact revoked nested images without rewriting the original Note',async()=>{
 const fixture=await privateStorageFixture(worker),owner=fixture.client('owner-drawing'),other=fixture.client('other-drawing');
 try{
  const imageStage=await owner.request('/api/assets/stage?uploadId=pr88-drawing-image',png,{raw:true,headers:{'Content-Type':'image/png'}});
  assert.equal(imageStage.status,200,JSON.stringify(imageStage.data));const image=imageStage.data.asset;
  const valid=document(drawingAssetUrl(image.assetId));
  const invalid=await owner.request('/api/media/stage?uploadId=pr88-remote-image',Buffer.from(JSON.stringify(document('https://not-owned.test/picture.png'))),{raw:true,headers:{'Content-Type':DRAWING_MIME}});
  assert.equal(invalid.status,400,'remote raster references must never be admitted');
  const staged=await owner.request('/api/media/stage?uploadId=pr88-drawing-snapshot',Buffer.from(JSON.stringify(valid)),{raw:true,headers:{'Content-Type':DRAWING_MIME}});
  assert.equal(staged.status,200,JSON.stringify(staged.data));const media=staged.data.asset;
  assert.equal((await owner.request('/api/media/'+media.assetId)).status,404,'unattached snapshots are not publicly readable');
  const note=await owner.command({action:'create',family:'note',id:'pr88-drawing-note',data:{title:'Synthetic drawing Note',body:'Independent prose stays unchanged.',synthetic:true,sections:[{id:'drawing-document',title:'Canvas',parts:[
   {id:'snapshot',kind:'media',media:{assetId:media.assetId,kind:'document',description:'Editable synthetic canvas'},text:'Editable synthetic canvas'},
   {id:'drawing-image',kind:'image',image:{assetId:image.assetId,alt:'Synthetic image'},text:'Synthetic image'}
  ]}]}});
  assert.equal(note.status,200,JSON.stringify(note.data));
  assert.equal((await other.request('/api/media/'+media.assetId)).status,404,'another owner cannot read the snapshot');
  const first=await owner.request('/api/media/'+media.assetId);
  assert.equal(first.status,200,JSON.stringify(first.data));
  const visible=JSON.parse(Buffer.from(first.data).toString('utf8'));
  assert.equal(visible.store['asset:picture'].props.src,drawingAssetUrl(image.assetId));
  assert.equal(visible.store['shape:picture'].props.assetId,'asset:picture');
  const revoked=await owner.request('/api/assets/'+image.assetId+'/revoke',{expectedRevision:image.revision});
  assert.equal(revoked.status,200,JSON.stringify(revoked.data));
  const second=await owner.request('/api/media/'+media.assetId);
  assert.equal(second.status,200,JSON.stringify(second.data));
  const redacted=JSON.parse(Buffer.from(second.data).toString('utf8'));
  assert.equal(redacted.store['asset:picture'],undefined,'revoked raster must be absent from saved document delivery');
  assert.equal(redacted.store['shape:picture'].props.assetId,null,'image shape must lose its revoked asset link');
  const retained=await owner.context('note','pr88-drawing-note');
  assert.equal(retained.status,200,JSON.stringify(retained.data));
  assert.equal(retained.data.record.body,'Independent prose stays unchanged.');
  assert.equal(retained.data.record.sections[0].parts[0].media.assetId,media.assetId,'redaction must not overwrite canonical Note identity');
 }finally{await fixture.dispose();}
});
