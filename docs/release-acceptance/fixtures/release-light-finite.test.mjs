import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:'export*from"./app/interface-view-registry.ts";export{foundryAdapters}from"./lib/foundry/specimens.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const temporary=mkdtempSync(join(tmpdir(),'fresh-beacon-')),bundle=join(temporary,'view.cjs');writeFileSync(bundle,result.outputFiles[0].text);const sdk=require(bundle);rmSync(temporary,{recursive:true,force:true});
const request=JSON.parse(readFileSync(fileURLToPath(new URL('../docs/release-acceptance/fixtures/interface-view-trace-fresh-beacon-v1.json',import.meta.url)),'utf8'));
const activity=request.activity,artefact=activity.blocks.find(block=>block.id==='trace').artefact;
const trace=artefact.payload,source=artefact.canonical.source,hash=createHash('sha256').update(source).digest('hex');
class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.listeners=new Map();this._text='';this.disabled=false;}
 set textContent(value){this._text=String(value??'');this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 appendChild(child){this.children.push(child);return child;}replaceChildren(...children){this._text='';this.children=children;}
 setAttribute(name,value){this.attributes[name]=String(value);}querySelector(tag){return walk(this,tag)[0]??null;}
 addEventListener(type,fn){this.listeners.set(type,fn);}removeEventListener(type,fn){if(this.listeners.get(type)===fn)this.listeners.delete(type);}
 click(){if(!this.disabled)this.listeners.get('click')?.();}
}
const walk=(node,tag)=>node.children.flatMap(child=>[...(child.tagName.toLowerCase()===tag?[child]:[]),...walk(child,tag)]);
test('fresh finite registration admits exact generated source, finite boundaries, fallback and revoked identity',async()=>{
 assert.equal(hash,'df72799f0f79a1b0fa13a1e8cef4b839da79e779498563c65c3a36c904cffd95');
 const enabled=sdk.interfaceViewCatalogue().filter(entry=>entry.enabled&&entry.sourceKind==='trace/external-v1');assert.ok(enabled.some(entry=>entry.id==='trace.fresh-beacon-v1'));
 const registry=await sdk.interfaceActivityRegistry('trace.fresh-beacon-v1'),previous=globalThis.document;globalThis.document={createElement:tag=>new Node(tag)};
 assert.equal(artefact.canonical.sha256,hash);
 let allowed=true;const rights={canRead:()=>allowed,verifyRun:()=>false};
 try{
  const linked={...structuredClone(artefact),sourceRef:{family:'article',id:'trial-c-source',rendition:'trial-c-r1',sectionId:'original',partId:'supplied'}};
  await assert.rejects(registry.admit(linked,{...rights,canRead:()=>false}),/source|right|denied|unavailable/i);
  const admitted=await registry.admit(linked,rights),host=new Node('div');assert.equal(admitted.fallback,'Supplied external trace, 3 events.\n'+trace.events.map(event=>`${event.kind}: ${event.text}`).join('\n'));assert.equal(host.textContent,'');
  const forged=structuredClone(linked);forged.payload.events[1].text='forged result';await assert.rejects(registry.admit(forged,rights),/match|differs|source/i);
  const instance=await registry.activate(admitted,host,rights),buttons=walk(host,'button'),button=name=>buttons.find(item=>item.textContent===name),status=walk(host,'p').find(item=>item.attributes.role==='status');
  assert.match(host.textContent,/Supplied beacon events/);assert.match(host.textContent,/executes no code and records no progress/);assert.equal(walk(host,'details').length,1);assert.equal(walk(host,'summary')[0].textContent,'All supplied events as text');assert.equal(button('Previous event').disabled,true);assert.equal(button('First event').disabled,true);button('Previous event').click();button('First event').click();assert.match(status.textContent,/Event 1 of 3.*0 ms/);
  assert.equal(walk(host,'pre').at(-1).textContent,trace.events.map(event=>`${event.sequence} ${event.kind}: ${event.text}`).join('\n'));
  button('Next event').click();assert.match(status.textContent,/Event 2 of 3.*10 ms/);button('Next event').click();assert.equal(button('Next event').disabled,true);assert.match(status.textContent,/Event 3 of 3.*20 ms/);
  button('Next event').click();assert.match(status.textContent,/Event 3 of 3/);button('Previous event').click();assert.match(status.textContent,/Event 2 of 3/);button('First event').click();assert.match(status.textContent,/Event 1 of 3/);
  button('Previous event').click();assert.match(status.textContent,/Event 1 of 3/);
  assert.equal(walk(host,'script').length,0);assert.equal(buttons.length,3);assert.ok(buttons.every(item=>item.type==='button'));
  allowed=false;assert.equal(await instance.revalidate(),false);assert.equal(host.textContent,'');assert.ok(buttons.every(item=>item.listeners.size===0));instance.dispose();instance.dispose();button('Next event').click();assert.equal(host.textContent,'');
  allowed=true;await assert.rejects(registry.activate({...admitted},host,rights),/admitted|registry/i);
 }finally{globalThis.document=previous;}
});

test('fresh finite omitted view keeps the original trace renderer loader',async()=>{
 let extensionLoads=0,originalLoads=0;
 const adapter=sdk.foundryAdapters.find(adapter=>adapter.kind==='trace/external-v1'),original=adapter.load;
 // Replace only the original adapter loader with an identity sentinel: the ordinary renderer
 // uses React, which the explicitly native-DOM harness cannot mount.
 adapter.load=async()=>{originalLoads++;return{mount(host){host.textContent='Original trace renderer sentinel';return()=>host.replaceChildren();}}};
 try{
  const registrations=[{id:'trace.fresh-beacon-v1',sourceKind:'trace/external-v1',enabled:true,load:async()=>{extensionLoads++;throw Error('Omitted view loaded extension');}}];
  const registry=await sdk.interfaceActivityRegistry(undefined,registrations),rights={canRead:()=>true,verifyRun:()=>false};
  const admitted=await registry.admit(artefact,rights),host=new Node('div'),instance=await registry.activate(admitted,host,rights);
  assert.equal(extensionLoads,0);assert.equal(originalLoads,1);assert.equal(host.textContent,'Original trace renderer sentinel');
  instance.dispose();assert.equal(host.textContent,'');
 }finally{adapter.load=original;}
});
test('fresh finite exact generated fixture publishes through real isolated local typed MCP without Run or checkpoint',{timeout:120000},async()=>{
 const fixture=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}'),owner=fixture.client('TEST-ONLY-fresh-beacon-owner'),other=fixture.client('TEST-ONLY-fresh-beacon-outsider');
 const rpc=async(client,name,args={})=>{const response=await client.request('/mcp',{jsonrpc:'2.0',id:name,method:'tools/call',params:{name,arguments:{purpose:request.purpose,...args}}});assert.equal(response.status,200,JSON.stringify(response.data));assert.notEqual(response.data.result.isError,true,response.data.result.content[0].text);return JSON.parse(response.data.result.content[0].text);};
 try{
  const caps=await rpc(owner,'get_minamo_activity_capabilities');assert.ok(caps.presentation.foundryKinds.includes('trace/external-v1'));assert.ok(caps.presentation.views.some(view=>view.id==='trace.fresh-beacon-v1'&&view.sourceKind==='trace/external-v1'));assert.equal(activity.presentation.slots.find(slot=>slot.blockId==='trace').viewId,'trace.fresh-beacon-v1');
  const preview=await rpc(owner,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.equal((await fixture.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,0);
  const saved=await rpc(owner,'publish_minamo_activity_package',request);assert.equal(saved.receipt.status,'committed');assert.equal(saved.learningDevelopmentCreated,false);
  const read=await rpc(owner,'read_minamo_activity',{id:saved.record.id,rendition:saved.record.rendition});assert.deepEqual(read.record.activity,activity);assert.equal(read.record.activity.blocks[1].artefact.canonical.source,source);assert.equal(read.record.activity.blocks[1].artefact.canonical.sha256,hash);
  assert.equal((await other.request('/api/activities/read',{id:saved.record.id,rendition:saved.record.rendition})).status,404);
  assert.equal((await fixture.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,0);assert.equal((await fixture.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);
  const replay=await rpc(owner,'publish_minamo_activity_package',request);assert.equal(replay.record.rev,saved.record.rev);assert.equal((await fixture.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,1);
  console.log('Fresh finite local typed MCP receipt',JSON.stringify({id:saved.record.id,rendition:saved.record.rendition,rev:saved.record.rev,sha256:hash,run:0,learningDevelopment:0}));
 }finally{await fixture.dispose();}
});
