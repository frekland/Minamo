import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {DRAWING_MIME,drawingAssetUrl} from '../lib/drawing-document.ts';

const worker=`import {domainHandler} from './lib/domain-handler.ts';import {assetHandler} from './lib/asset-handler.ts';import {mediaHandler} from './lib/media-handler.ts';export default {fetch(r,e){const p=new URL(r.url).pathname;return p.startsWith('/api/assets')?assetHandler(r,e):p.startsWith('/api/media')?mediaHandler(r,e):domainHandler(r,e)}}`;
const bindings={MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_OWNER_ID:'owner',MINAMO_SITE_HOSTS:'storage.test'};
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAAFElEQVR4nGMUCWhiYGBgYmBgQFAAEPgA7OnJpxEAAAAASUVORK5CYII=','base64');
const drawing=noteId=>({version:1,type:'drawing',noteId});
const section=(id,interactive)=>({id,title:id,parts:[{id:'part-'+id,kind:'interactive',text:'Accessible explanation of the authored activity.',interactive}]});
function request(c,projectId,parts,notes=[]){return{operationId:'make-'+projectId,expectedGeneration:c.generation,projectId,expectedProjectRev:0,title:'PR88 drawing read',body:'Technical fixture',contentSections:parts,composition:{version:1,sections:[{id:'main',title:'Contents',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:parts.map(p=>p.id)}]}],blocks:parts.map(p=>({id:p.id,sectionId:p.id}))},noteChanges:notes.map(id=>({id,expectedRev:0,title:'Drawing state',body:'Retained state Note prose'}))};}
async function mcp(c,name,args){const result=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Scoped PR88 drawing reconciliation',...args}}});assert.equal(result.status,200);return result.data.result;}
function document(shapes=[],assets=[]){return{schema:{schemaVersion:2,sequences:{}},store:{'page:one':{id:'page:one',typeName:'page',name:'A page',index:'a1'},...Object.fromEntries(shapes.map(shape=>[shape.id,shape])),...Object.fromEntries(assets.map(asset=>[asset.id,asset]))}};}

test('PR88 drawing editor runtime configuration is generation-scoped and GET-only',async()=>{
 const f=await privateStorageFixture(worker,{bindings:{...bindings,TLDRAW_LICENSE_KEY:'test-only-license'}}),c=f.client('owner');try{
  const read=await c.request('/api/projects/runtime-config');assert.equal(read.status,200,JSON.stringify(read.data));assert.equal(read.data.tldrawLicenseKey,'test-only-license');
  assert.equal(read.data.generation,c.generation);
  const forbidden=await c.request('/api/projects/runtime-config',{});assert.equal(forbidden.status,405);
  const stale=await c.request('/api/projects/runtime-config',undefined,{headers:{'x-minamo-generation':'outdated-generation'}});assert.equal(stale.status,409);
 }finally{await f.dispose();}
});

test('PR88 typed Project drawing and nested flashcard images are admitted and redacted under current owner rights',async()=>{
 const f=await privateStorageFixture(worker,{bindings}),c=f.client('owner');try{
  const upload=await c.request('/api/assets/stage?uploadId=pr88-card',png,{raw:true,headers:{'Content-Type':'image/png'}});assert.equal(upload.status,200,JSON.stringify(upload.data));const image=upload.data.asset;
  const cards={version:1,type:'flashcards',cards:[{id:'first',front:{text:'Bonjour',image:{assetId:image.assetId,alt:'Private image'}},back:{text:'Hello'},language:'fr'}]};
  const created=await mcp(c,'apply_project_update',request(c,'interactive-project',[section('cards',cards),section('board',drawing('state-note'))],['state-note']));assert.equal(created.structuredContent.status,'committed',JSON.stringify(created));
  const initial=await mcp(c,'get_project_composition',{projectId:'interactive-project'});assert.deepEqual(initial.structuredContent.record.sections.map(s=>s.parts[0].interactive.type),['flashcards','drawing']);
  assert.equal((await c.request('/api/assets/'+image.assetId)).status,200);
  const wrong=await mcp(c,'apply_project_update',{operationId:'bad-card',expectedGeneration:c.generation,projectId:'interactive-project',expectedProjectRev:1,contentSections:[section('cards',{version:1,type:'unknown'})]});assert.equal(wrong.structuredContent.code,'invalid_interactive');
  assert.equal((await f.client('different-owner').request('/api/assets/'+image.assetId)).status,404);
  assert.equal((await c.request('/api/assets/'+image.assetId+'/revoke',{expectedRevision:image.revision})).status,200);
  const after=await mcp(c,'get_project_composition',{projectId:'interactive-project'});assert.equal(after.structuredContent.record.sections[0].parts[0].interactive.cards[0].front.image,undefined);
  assert.equal((await c.context('journey','interactive-project')).data.record.rev,1);
 }finally{await f.dispose();}
});

test('PR88 Project-linked drawing MCP returns paged shapes and an explicit private preview with Note revision fencing',async()=>{
 const f=await privateStorageFixture(worker,{bindings}),c=f.client('owner');try{
  const made=await mcp(c,'apply_project_update',request(c,'linked-project',[section('board',drawing('linked-note'))],['linked-note']));assert.equal(made.structuredContent.status,'committed');
  const shape={id:'shape:note',typeName:'shape',type:'text',parentId:'page:one',index:'a1',x:24,y:52,props:{richText:{type:'doc',content:[{type:'paragraph',content:[{type:'text',text:'Inspect me'}]}]}}};
  const snap=await c.request('/api/media/stage?uploadId=pr88-drawing-doc',Buffer.from(JSON.stringify(document([shape]))),{raw:true,headers:{'Content-Type':DRAWING_MIME}});assert.equal(snap.status,200,JSON.stringify(snap.data));
  const raster=await c.request('/api/assets/stage?uploadId=pr88-preview',png,{raw:true,headers:{'Content-Type':'image/png'}});assert.equal(raster.status,200,JSON.stringify(raster.data));
  const image={assetId:raster.data.asset.assetId,alt:'Saved canvas preview'};
  const changed=await c.command({action:'update',family:'note',id:'linked-note',expectedRev:1,data:{sections:[{id:'drawing-document',title:'Editable drawing',parts:[{id:'snapshot',kind:'media',media:{assetId:snap.data.asset.assetId,kind:'document',description:'Canvas document'},text:'Canvas document'},{id:'drawing-preview',kind:'image',image,text:image.alt}]}]}});
  assert.equal(changed.data.status,'committed',JSON.stringify(changed.data));
  const read=await mcp(c,'get_project_drawing',{projectId:'linked-project',noteId:'linked-note',expectedNoteRev:2,includePreview:true,limit:1});
  assert.equal(read.isError,false);assert.equal(read.structuredContent.noteRev,2);assert.equal(read.structuredContent.shapes[0].text,'Inspect me');assert.equal(read.structuredContent.previewStatus,'included');assert.equal(read.content[1].type,'image');assert.equal(read.content[1].mimeType,'image/png');assert.ok(!JSON.stringify(read.structuredContent).includes(read.content[1].data));
  const stale=await mcp(c,'get_project_drawing',{projectId:'linked-project',noteId:'linked-note',expectedNoteRev:1});assert.equal(stale.structuredContent.code,'revision_conflict');
  const wrong=await mcp(c,'get_project_drawing',{projectId:'linked-project',noteId:'not-linked'});assert.equal(wrong.structuredContent.code,'drawing_unavailable');
  const other=await mcp(f.client('different-owner'),'get_project_drawing',{projectId:'linked-project',noteId:'linked-note',includePreview:true});assert.equal(other.structuredContent.code,'project_unavailable');
 }finally{await f.dispose();}
});

test('PR88 drawing state rejects an unlisted private image and never mutates the Note on rejection',async()=>{
 const f=await privateStorageFixture(worker,{bindings}),c=f.client('owner');try{
  assert.equal((await c.command({action:'create',family:'note',id:'inventory-note',data:{title:'State',body:'Untouched'}})).data.status,'committed');
  const uploaded=await c.request('/api/assets/stage?uploadId=pr88-inventory-image',png,{raw:true,headers:{'Content-Type':'image/png'}});assert.equal(uploaded.status,200);
  const image=uploaded.data.asset;
  const asset={id:'asset:one',typeName:'asset',type:'image',props:{src:drawingAssetUrl(image.assetId)}};
  const snap=await c.request('/api/media/stage?uploadId=pr88-unlisted-image',Buffer.from(JSON.stringify(document([], [asset]))),{raw:true,headers:{'Content-Type':DRAWING_MIME}});assert.equal(snap.status,200);
  const part={id:'snapshot',kind:'media',media:{assetId:snap.data.asset.assetId,kind:'document',description:'Editable canvas'},text:'Editable canvas'};
  const command={action:'update',family:'note',id:'inventory-note',expectedRev:1,data:{sections:[{id:'drawing-document',title:'Drawing state',parts:[part]}]}};
  const refused=await c.command(command);assert.equal(refused.status,400,JSON.stringify(refused.data));assert.equal(refused.data.code,'drawing_asset_inventory');
  const retained=(await c.context('note','inventory-note')).data.record;assert.equal(retained.rev,1);assert.equal(retained.body,'Untouched');
 }finally{await f.dispose();}
});
