import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export*from"./app/interface-view-registry.ts";export{plainTextArtefact}from"./lib/foundry/core-adapters.ts";export{deriveActivityPresentation}from"./lib/interface-foundry.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const temporary=mkdtempSync(join(tmpdir(),'trial-bytes-sdk-')),modulePath=join(temporary,'sdk.cjs');writeFileSync(modulePath,built.outputFiles[0].text);const sdk=require(modulePath);rmSync(temporary,{recursive:true,force:true});
const literal='A😀e\u0301\r\nTEST ONLY bytes trial B.';
const expected=[0x41,0xf0,0x9f,0x98,0x80,0x65,0xcc,0x81,0x0d,0x0a];
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const okay=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
async function rpc(c,name,input={}){const response=okay(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY independent bytes trial B; no learner achievement.',...input}}}));assert.notEqual(response.result.isError,true,response.result.content[0].text);return JSON.parse(response.result.content[0].text);}
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.listeners=new Map();this.value='';this._text='';this.disabled=false;}
 set textContent(value){this._text=value??'';this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 appendChild(child){this.children.push(child);return child;}replaceChildren(...children){this._text='';this.children=children;}
 setAttribute(key,value){this.attributes[key]=String(value);}querySelector(tag){for(const child of this.children){if(child.tagName.toLowerCase()===tag)return child;const nested=child.querySelector(tag);if(nested)return nested;}return null;}
 addEventListener(type,handler){this.listeners.set(type,handler);}removeEventListener(type,handler){if(this.listeners.get(type)===handler)this.listeners.delete(type);}
 click(){if(!this.disabled)this.listeners.get('click')?.();}
}
const elements=(root,tag)=>root.children.flatMap(child=>[...(child.tagName.toLowerCase()===tag?[child]:[]),...elements(child,tag)]);
test('Tier1 banked bytes uses the enabled production registry with exact source, denial and disposal',async()=>{
 assert.deepEqual(sdk.interfaceViewCatalogue().find(entry=>entry.id==='source.bytes-v1'),{id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true});
 assert.deepEqual([...Buffer.from(literal)].slice(0,10),expected);
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{
  const registry=await sdk.interfaceActivityRegistry('source.bytes-v1'),artefact=await sdk.plainTextArtefact(literal);artefact.sourceRef={family:'article',id:'TEST-ONLY-bytes-source',rendition:'r1',sectionId:'s',partId:'p'};
  let allowed=false;const rights={canRead:()=>allowed,verifyRun:()=>false};
  await assert.rejects(registry.admit(artefact,rights));allowed=true;
  const admitted=await registry.admit(artefact,rights),host=new Element('div');assert.equal(host.textContent,'');assert.equal(admitted.fallback,literal);
  const instance=await registry.activate(admitted,host,rights);
  assert.equal(elements(host,'table').length,1);assert.deepEqual(elements(host,'td').filter((_,index)=>index%2===0).flatMap(cell=>cell.textContent.trim().split(' ').map(hex=>parseInt(hex,16))),[...Buffer.from(literal)]);
  const buttons=elements(host,'button');assert.ok(buttons.length>0);allowed=false;
  assert.equal(await instance.revalidate(),false);assert.equal(host.textContent,'');for(const button of buttons)assert.equal(button.listeners.size,0);
  instance.dispose();instance.dispose();assert.equal(host.textContent,'');allowed=true;
  const ordinaryRegistry=await sdk.interfaceActivityRegistry(),ordinary=await ordinaryRegistry.admit(await sdk.plainTextArtefact(literal),rights),plainHost=new Element('div'),plain=await ordinaryRegistry.activate(ordinary,plainHost,rights);assert.equal(plainHost.textContent,literal);assert.equal(elements(plainHost,'table').length,0);plain.dispose();
  const forged=structuredClone(artefact);forged.payload.text='forged bytes';allowed=true;await assert.rejects(registry.admit(forged,rights),/differs/);
 }finally{globalThis.document=previous;}
});
test('Tier1 original generator text+math publishes through real local typed MCP, with owner/source denial and zero Attempts',{timeout:60000},async()=>{
 const directory=mkdtempSync(join(tmpdir(),'trial-bytes-source-')),fixture=join(directory,'original.json');
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-trial-bytes-owner'),other=f.client('TEST-ONLY-trial-bytes-foreign');
 try{
  execFileSync(process.execPath,[resolve('scripts/interface-foundry-template.mjs'),'--id','synthetic-bytes-independent','--output',fixture],{encoding:'utf8'});
  const request=JSON.parse(readFileSync(fixture,'utf8')),text=request.activity.blocks.find(block=>block.id==='passage').artefact;
  text.canonical.source=literal;text.canonical.sha256=createHash('sha256').update(literal).digest('hex');text.payload.text=literal;request.activity.presentation.slots.find(slot=>slot.blockId==='passage').viewId='source.bytes-v1';
  const caps=await rpc(c,'get_minamo_activity_capabilities');assert.ok(caps.presentation.foundryKinds.includes('text/plain-v1'));assert.ok(caps.presentation.foundryKinds.includes('math/tex-v1'));
  const preview=await rpc(c,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,0);
  const published=await rpc(c,'publish_minamo_activity_package',request);assert.equal(published.receipt.status,'committed');assert.equal(published.learningDevelopmentCreated,false);
  const read=await rpc(c,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});
  assert.deepEqual(read.record.activity,request.activity);assert.equal(read.record.activity.blocks[1].artefact.canonical.source,literal);assert.deepEqual([...Buffer.from(read.record.activity.blocks[1].artefact.canonical.source)].slice(0,10),expected);
  assert.equal((await other.request('/api/activities/read',{id:published.record.id})).status,404);
  const note=okay(await c.command({action:'create',family:'note',id:'TEST-ONLY-bytes-reading',data:{title:'TEST ONLY bytes source denial',body:'TEST ONLY SOURCE DENIAL CANARY',synthetic:true}})).record;
  const linked=structuredClone(request.activity);linked.blocks.push({id:'reading',kind:'reading',ref:{family:'note',id:note.id,rendition:note.rendition}});linked.presentation=sdk.deriveActivityPresentation(linked);
  const sourceBound=(await rpc(c,'publish_minamo_activity_package',{...request,id:'synthetic-bytes-linked',operationId:'synthetic-bytes-linked-publish',activity:linked})).record;
  okay(await c.command({action:'trash',family:'note',id:note.id,expectedRev:note.rev}));
  const denied=await rpc(c,'read_minamo_activity',{id:sourceBound.id,rendition:sourceBound.rendition});assert.equal(denied.record.activity.blocks.at(-1).kind,'instruction');assert.match(denied.record.activity.blocks.at(-1).text,/unavailable/);assert.doesNotMatch(JSON.stringify(denied),/TEST ONLY SOURCE DENIAL CANARY/);
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,0);assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);
 }finally{await f.dispose();rmSync(directory,{recursive:true,force:true});}
});
