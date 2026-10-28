import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {decodeBundleFixture} from './portable-bundle-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export*from"./lib/interface-foundry.ts";export{validatePortableManifest}from"./lib/recovery-bundle.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false});
const dir=mkdtempSync(join(tmpdir(),'interface-contract-domain-')),file=join(dir,'sdk.cjs');writeFileSync(file,built.outputFiles[0].text);const sdk=require(file);rmSync(dir,{recursive:true,force:true});
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const purpose='TEST ONLY original synthetic Interface Foundry typed recipe acceptance; no learner achievement.';
const okay=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
async function rpc(c,name,input){const response=okay(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...input}}}));assert.notEqual(response.result.isError,true,response.result.content[0].text);return JSON.parse(response.result.content[0].text);}
const source=(kind,format,text,payload)=>({contract:'minamo.artefact.v1',kind,canonical:{format,source:text,sha256:createHash('sha256').update(text).digest('hex')},provenance:{classification:'authored',execution:'not-executed'},payload});
function cartridge(){const text='Original Japanese 😀 source. No execution.',formula='1+1=2';const activity={contract:'minamo.activity.v1',template:'mathematics',intent:'Inspect two existing trusted components using only admitted Activity data.',authorship:'original-exercise',blocks:[{id:'task',kind:'instruction',text:'Compare an original text and an authored formula.'},{id:'text',kind:'foundry',artefact:source('text/plain-v1','text',text,{text})},{id:'formula',kind:'foundry',artefact:source('math/tex-v1','tex',formula,{contract:'minamo.math.v1',id:'simple-sum',format:'tex',source:formula,display:'block'})},{id:'hints',kind:'hint-ladder',hints:[{id:'h1',tier:'concept',text:'PRIVATE INTERFACE HINT CANARY'}]},{id:'reflection',kind:'reflection',text:'An authored equality is not a verified execution or learner achievement.'}]};activity.presentation={...sdk.deriveActivityPresentation(activity),slots:sdk.deriveActivityPresentation(activity).slots.map(slot=>slot.blockId==='text'?{...slot,viewId:'source.bytes-v1'}:slot)};return activity;}
test('real local MCP admits data-only custom recipe, retains exact editions, rights and encrypted recovery',{timeout:60000},async t=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-interface-recipe-owner'),other=f.client('TEST-ONLY-interface-recipe-foreign');
 let published;
 try{
  const activity=cartridge(),request={purpose,operationId:'interface-recipe-publish',id:'interface-composition',title:'TEST ONLY two-component Interface composition',synthetic:true,activity};
  await t.test('actual MCP capability/schema describes optional recipe and existing engine catalogue',async()=>{
   const caps=await rpc(c,'get_minamo_activity_capabilities',{});assert.equal(caps.presentation.contract,sdk.PRESENTATION_CONTRACT);assert.equal(caps.presentation.patterns.length,11);assert.deepEqual(caps.presentation.foundryKinds,[...sdk.PRESENTATION_FOUNDRY_KINDS]);assert.ok(caps.presentation.views.some(view=>view.id==='source.bytes-v1'&&view.sourceKind==='text/plain-v1'));assert.match(caps.presentation.viewSelection,/Omitted viewId always retains/);
   const list=okay(await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/list'}));const tool=list.result.tools.find(tool=>tool.name==='publish_minamo_activity_package'),schema=tool.inputSchema.properties.activity.properties.presentation;
   assert.equal(schema.additionalProperties,false);assert.equal(schema.properties.slots.items.additionalProperties,false);assert.equal(schema.properties.pattern.enum.length,11);assert.ok(!tool.inputSchema.properties.activity.required.includes('presentation'));assert.ok(schema.properties.slots.items.properties.viewId.enum.includes('source.bytes-v1'));assert.ok(!schema.properties.slots.items.required.includes('viewId'));
  });
  await t.test('preview and publish use shared server admission; every source and recipe roundtrips',async()=>{
   const preview=await rpc(c,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,0);
   const saved=await rpc(c,'publish_minamo_activity_package',request);published=saved.record;assert.equal(saved.receipt.status,'committed');assert.equal(saved.learningDevelopmentCreated,false);assert.deepEqual(published.activity.presentation,activity.presentation);assert.equal(published.activity.blocks[2].artefact.canonical.source,'1+1=2');assert.doesNotMatch(JSON.stringify(saved),/PRIVATE INTERFACE HINT CANARY/);
   const read=await rpc(c,'read_minamo_activity',{id:published.id,rendition:published.rendition});assert.deepEqual(read.record.activity.presentation,activity.presentation);assert.deepEqual(read.record.activity.blocks[1].artefact,activity.blocks[1].artefact);
   assert.equal((await other.request('/api/activities/read',{id:published.id})).status,404);assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,0);
  });
  await t.test('malicious recipes fail on typed MCP and generic domain write with no receipt/record',async()=>{
   const invalidView=viewId=>({...activity.presentation,slots:activity.presentation.slots.map(slot=>slot.blockId==='text'?{...slot,viewId}:slot)});
   for(const bad of [{...activity.presentation,html:'<script>alert(1)</script>'},{...activity.presentation,pattern:'https://invalid/component'},{...activity.presentation,version:2},{...activity.presentation,slots:activity.presentation.slots.slice(1)},{...activity.presentation,slots:activity.presentation.slots.map(slot=>slot.blockId==='hints'?{...slot,slot:'source'}:slot)},invalidView('source.bytes-v2'),invalidView('trace.signal-ledger-v1'),invalidView('https://invalid/component'),{...activity.presentation,slots:activity.presentation.slots.map(slot=>slot.blockId==='task'?{...slot,viewId:'source.bytes-v1'}:slot)}]){
    const id='invalid-'+randomUUID();const response=await c.request('/api/activities/publish',{...request,operationId:id,id,activity:{...activity,presentation:bad}});assert.equal(response.status,400,JSON.stringify(response.data));assert.equal((await c.request('/api/operations?operationId='+id)).status,404);
    const generic=await c.command({action:'create',family:'experiment',id:id+'-generic',data:{title:'TEST ONLY rejected direct recipe',synthetic:true,activity:{...activity,presentation:bad}}});assert.equal(generic.status,400,JSON.stringify(generic.data));
   }
   assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,1);
  });
  await t.test('presentation changes make a new immutable edition and stale CAS cannot replace original',async()=>{
   const changed={...activity,presentation:{...activity.presentation,pattern:'predict-explore-compare',preferredFocus:'task'}};
   const revised=await rpc(c,'publish_minamo_activity_package',{...request,operationId:'interface-recipe-revise',expectedRev:published.rev,activity:changed});assert.notEqual(revised.record.rendition,published.rendition);
   assert.equal((await rpc(c,'read_minamo_activity',{id:published.id,rendition:published.rendition})).record.activity.presentation.pattern,'mathematics-science');
   const stale=okay(await c.request('/api/activities/publish',{...request,operationId:'interface-recipe-stale',expectedRev:published.rev}));assert.equal(stale.receipt.status,'conflict');
  });
  await t.test('linked-source rights loss retains an inert marker in the original supporting slot',async()=>{
   const reference=okay(await c.command({action:'create',family:'note',id:'interface-reading',data:{title:'TEST ONLY exact supporting reference',body:'PRIVATE LINKED READING CANARY',synthetic:true}})).record;
   const linked={...cartridge(),blocks:[...cartridge().blocks,{id:'reading',kind:'reading',ref:{family:'note',id:reference.id,rendition:reference.rendition}}]};linked.presentation=sdk.deriveActivityPresentation(linked);
   const saved=(await rpc(c,'publish_minamo_activity_package',{...request,operationId:'interface-recipe-linked-publish',id:'interface-linked',activity:linked})).record;
   okay(await c.command({action:'trash',family:'note',id:reference.id,expectedRev:reference.rev}));
   const projection=(await rpc(c,'read_minamo_activity',{id:saved.id,rendition:saved.rendition})).record.activity;
   assert.equal(projection.blocks.at(-1).kind,'instruction');assert.match(projection.blocks.at(-1).text,/unavailable/);assert.doesNotMatch(JSON.stringify(projection),/PRIVATE LINKED READING CANARY/);
   assert.deepEqual(sdk.admitPresentationRecipe(projection.presentation,projection),linked.presentation);assert.equal(projection.presentation.slots.at(-1).slot,'supporting');
  });
  await t.test('encrypted recovery validates recipe references, restores exact editions and fences old generation',async()=>{
   const passphrase='Synthetic-interface-recovery-only';const exported=await c.request('/api/recovery/export',{operationId:'interface-recipe-export',expectedGeneration:c.generation,passphrase});assert.equal(exported.status,200,JSON.stringify(exported.data));
   const decoded=decodeBundleFixture(Buffer.from(exported.data),passphrase),manifest=structuredClone(decoded.manifest);
   if(manifest.format==='minamo-v2-checkpoint@2'){manifest.format='minamo-v2-checkpoint@1';for(const page of manifest.pages)manifest.tables[page.table].push(...JSON.parse(decoded.pages.get(page.key).toString()));delete manifest.pages;}
   await sdk.validatePortableManifest(manifest);const row=manifest.tables.v2_records.find(row=>row.id===published.id),record=JSON.parse(row.data);record.activity.presentation.slots[0].blockId='missing-source';row.data=JSON.stringify(record);await assert.rejects(sdk.validatePortableManifest(manifest),error=>error.code==='bundle_schema');
   const metadata=Buffer.from(JSON.stringify({operationId:'interface-recipe-import',expectedGeneration:c.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);
   const staged=okay(await c.request('/api/recovery/import',Buffer.concat([prefix,metadata,Buffer.from(exported.data)]),{raw:true,headers:{'content-type':'application/octet-stream'}}));assert.equal(staged.staged.state,'ready');const activated=okay(await c.recover('activate',{operationId:'interface-recipe-activate',stagedId:staged.staged.id}));c.setGeneration(activated.generation);
   const old=await rpc(c,'read_minamo_activity',{id:published.id,rendition:published.rendition});assert.deepEqual(old.record.activity.presentation,activity.presentation);assert.doesNotMatch(JSON.stringify(old),/PRIVATE INTERFACE HINT CANARY/);
   const stale=await c.request('/api/activities/publish',{...request,operationId:'interface-recipe-old-generation',expectedGeneration:'legacy@0'},{headers:{'x-minamo-generation':'legacy@0'}});assert.equal(stale.status,409);
  });
 }finally{await f.dispose();}
});
