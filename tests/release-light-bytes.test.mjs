import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// Original synthetic source. These escapes are actual combining/CRLF characters at runtime.
const literal='TEST ONLY — byte observatory.\r\nA😀e\u0301\r\n'+Array.from({length:37},(_,i)=>`TEST ONLY row ${String(i+1).padStart(2,'0')}: moon 🌙; cafe\u0301; exact line ending.\r\n`).join('');
// Independent Node UTF-8 encoding; never use the renderer's inspectTextEncoding/byteRows.
const expectedBytes=[...Buffer.from(literal,'utf8')];
const originalFormula='(x+1)^2=x^2+2x+1';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export*from"./app/interface-view-registry.ts";export{plainTextArtefact}from"./lib/foundry/core-adapters.ts";export{deriveActivityPresentation}from"./lib/interface-foundry.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const sdkDirectory=mkdtempSync(join(tmpdir(),'release-light-bytes-sdk-'));
let sdk;
try{const modulePath=join(sdkDirectory,'sdk.cjs');writeFileSync(modulePath,built.outputFiles[0].text);sdk=require(modulePath);}finally{rmSync(sdkDirectory,{recursive:true,force:true});}

// Minimal native-DOM harness: executes real mount and native event handlers, no browser claims.
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.listeners=new Map();this.value='';this._text='';this.disabled=false;}
 set textContent(value){this._text=value??'';this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 appendChild(child){this.children.push(child);return child;}replaceChildren(...children){this._text='';this.children=children;}
 setAttribute(key,value){this.attributes[key]=String(value);}
 querySelector(tag){return elements(this,tag)[0]??null;}
 addEventListener(type,handler){this.listeners.set(type,handler);}removeEventListener(type,handler){if(this.listeners.get(type)===handler)this.listeners.delete(type);}
 click(){if(!this.disabled)this.listeners.get('click')?.();}
 change(value){this.value=String(value);this.listeners.get('change')?.();}
}
const elements=(root,tag)=>root.children.flatMap(child=>[...(child.tagName.toLowerCase()===tag?[child]:[]),...elements(child,tag)]);
const visibleBytes=host=>elements(host,'tbody').flatMap(body=>elements(body,'tr').flatMap(row=>elements(row,'td')[0].textContent.trim().split(' ').map(hex=>parseInt(hex,16))));
const rowOffsets=host=>elements(host,'tbody').flatMap(body=>elements(body,'tr').map(row=>parseInt(elements(row,'th')[0].textContent,16)));

test('fresh Light B: selected banked bytes exact Unicode/CRLF pages, denial, revalidation, disposal, omitted prose',async()=>{
 assert.deepEqual(sdk.interfaceViewCatalogue().find(entry=>entry.id==='source.bytes-v1'),{id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true});
 assert.ok(literal.includes('A😀e\u0301\r\n'));
 assert.deepEqual([...Buffer.from('A😀e\u0301\r\n')],[0x41,0xf0,0x9f,0x98,0x80,0x65,0xcc,0x81,0x0d,0x0a]);
 const previousDocument=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{
  const registry=await sdk.interfaceActivityRegistry('source.bytes-v1'),artefact=await sdk.plainTextArtefact(literal);
  artefact.sourceRef={family:'article',id:'TEST-ONLY-release-byte-source',rendition:'r1',sectionId:'source',partId:'part'};
  let allowed=false;const rights={canRead:()=>allowed,verifyRun:()=>false};
  await assert.rejects(registry.admit(artefact,rights));allowed=true;
  const admitted=await registry.admit(artefact,rights),host=new Element('div');assert.equal(admitted.fallback,literal);assert.equal(host.textContent,'');
  // Revoke after admission but before explicit activation: inherited activation gate denies.
  allowed=false;await assert.rejects(registry.activate(admitted,host,rights));assert.equal(host.textContent,'');allowed=true;
  const live=await registry.activate(admitted,host,rights);
  assert.equal(elements(host,'table').length,1);assert.match(elements(host,'caption')[0].textContent,/Exact source UTF-8 bytes/);
  const headings=elements(elements(host,'thead')[0],'th');assert.deepEqual(headings.map(h=>h.scope),['col','col','col']);
  const region=elements(host,'div').find(e=>e.attributes.role==='region');assert.equal(region.tabIndex,0);assert.equal(region.style.overflowX,'auto');assert.equal(region.style.maxWidth,'100%');
  const select=elements(host,'select')[0],buttons=elements(host,'button'),back=buttons.find(b=>b.textContent==='Previous rows'),next=buttons.find(b=>b.textContent==='Next rows');
  assert.equal(select.attributes['aria-label'],'Bytes per inspector row');assert.equal(back.disabled,true);assert.equal(next.disabled,false);
  assert.equal(rowOffsets(host).length,48);assert.deepEqual(rowOffsets(host),Array.from({length:48},(_,i)=>i*8));
  const paged=[];
  do{assert.ok(rowOffsets(host).length<=48);paged.push(...visibleBytes(host));if(next.disabled)break;next.click();}while(true);
  assert.deepEqual(paged,expectedBytes);assert.equal(next.disabled,true);assert.equal(back.disabled,false);
  back.click();assert.equal(rowOffsets(host)[0],Math.max(0,(Math.ceil(Math.ceil(expectedBytes.length/8)/48)-2))*48*8);
  select.change(16);assert.equal(rowOffsets(host)[0],0);assert.equal(back.disabled,true);assert.deepEqual(visibleBytes(host),expectedBytes.slice(0,48*16));
  assert.deepEqual(rowOffsets(host),Array.from({length:48},(_,i)=>i*16));
  const widePages=[];do{assert.ok(rowOffsets(host).length<=48);widePages.push(...visibleBytes(host));if(next.disabled)break;next.click();}while(true);
  assert.deepEqual(widePages,expectedBytes);
  allowed=false;assert.equal(await live.revalidate(),false);assert.equal(host.textContent,'');
  for(const control of [...buttons,select])assert.equal(control.listeners.size,0);
  next.click();select.change(8);assert.equal(host.textContent,'');live.dispose();live.dispose();assert.equal(host.textContent,'');
  allowed=true;const second=await registry.activate(await registry.admit(artefact,rights),host,rights);const secondControls=[...elements(host,'button'),...elements(host,'select')];second.dispose();second.dispose();assert.equal(host.textContent,'');for(const control of secondControls)assert.equal(control.listeners.size,0);
  const ordinaryRegistry=await sdk.interfaceActivityRegistry(),ordinary=await ordinaryRegistry.admit(await sdk.plainTextArtefact(literal),rights),plainHost=new Element('div');
  const plain=await ordinaryRegistry.activate(ordinary,plainHost,rights);assert.equal(plainHost.textContent,literal);assert.equal(elements(plainHost,'table').length,0);plain.dispose();
  const forged=structuredClone(artefact);forged.payload.text+='forged';await assert.rejects(registry.admit(forged,rights),/differs/);
  console.log(JSON.stringify({evidence:'native-DOM only',utf16Units:literal.length,utf8Bytes:expectedBytes.length,sha256:createHash('sha256').update(literal).digest('hex'),rows8:Math.ceil(expectedBytes.length/8),rows16:Math.ceil(expectedBytes.length/16),maxVisibleRows:48}));
 }finally{globalThis.document=previousDocument;}
});

const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const okay=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
async function rpc(c,name,input={}){
 const response=okay(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY fresh restricted-context banked bytes trial; no learning claim.',...input}}}));
 assert.notEqual(response.result.isError,true,response.result.content[0].text);return JSON.parse(response.result.content[0].text);
}
test('fresh Light B: typed isolated MCP previews/publishes/reads exact selected text+math and ordinary companion',{timeout:60000},async()=>{
 const directory=mkdtempSync(join(tmpdir(),'release-light-bytes-fixtures-'));let f;
 try{
  const selectedPath=join(directory,'selected.json'),ordinaryPath=join(directory,'ordinary.json');
  execFileSync(process.execPath,[resolve('scripts/interface-foundry-template.mjs'),'--id','synthetic-fresh-byte-observatory','--view','source.bytes-v1','--output',selectedPath],{encoding:'utf8'});
  execFileSync(process.execPath,[resolve('scripts/interface-foundry-template.mjs'),'--id','synthetic-fresh-ordinary-observatory','--output',ordinaryPath],{encoding:'utf8'});
  const selected=JSON.parse(readFileSync(selectedPath,'utf8')),ordinary=JSON.parse(readFileSync(ordinaryPath,'utf8'));
  for(const request of [selected,ordinary]){
   const text=request.activity.blocks.find(block=>block.id==='passage').artefact;text.canonical.source=literal;text.canonical.sha256=createHash('sha256').update(literal).digest('hex');text.payload.text=literal;
   writeFileSync(request===selected?selectedPath:ordinaryPath,JSON.stringify(request,null,2)+'\n');
   execFileSync(process.execPath,[resolve('scripts/interface-foundry-template.mjs'),'--validate',request===selected?selectedPath:ordinaryPath],{encoding:'utf8'});
  }
  assert.deepEqual(selected.activity.presentation.slots.filter(slot=>slot.viewId).map(slot=>[slot.blockId,slot.viewId]),[['passage','source.bytes-v1']]);
  assert.equal(ordinary.activity.presentation.slots.some(slot=>slot.viewId),false);
  f=await privateStorageFixture(worker);const c=f.client('TEST-ONLY-fresh-byte-owner'),other=f.client('TEST-ONLY-fresh-byte-foreign');
  const catalogue=okay(await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/list'}));
  for(const name of ['get_minamo_activity_capabilities','preview_minamo_activity_package','publish_minamo_activity_package','read_minamo_activity'])assert.ok(catalogue.result.tools.find(tool=>tool.name===name)?.inputSchema);
  const capabilities=await rpc(c,'get_minamo_activity_capabilities');const view=capabilities.presentation.views.find(view=>view.id==='source.bytes-v1');assert.equal(view.sourceKind,'text/plain-v1');assert.deepEqual([...view.slots],['source','explore']);
  assert.ok(capabilities.presentation.foundryKinds.includes('math/tex-v1'));
  const receipts=[];
  for(const request of [selected,ordinary]){
   const before=(await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n;
   const preview=await rpc(c,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first()).n,before);
   const published=await rpc(c,'publish_minamo_activity_package',request);assert.equal(published.receipt.status,'committed');assert.equal(published.learningDevelopmentCreated,false);
   const read=await rpc(c,'read_minamo_activity',{id:published.record.id,rendition:published.record.rendition});assert.deepEqual(read.record.activity,request.activity);
   const text=read.record.activity.blocks.find(block=>block.id==='passage').artefact,math=read.record.activity.blocks.find(block=>block.id==='formula').artefact;
   assert.equal(text.canonical.source,literal);assert.deepEqual([...Buffer.from(text.canonical.source)],expectedBytes);assert.equal(math.canonical.source,originalFormula);
   assert.equal((await other.request('/api/activities/read',{id:published.record.id})).status,404);
   receipts.push({id:published.record.id,rendition:published.record.rendition,status:published.receipt.status});
  }
  const note=okay(await c.command({action:'create',family:'note',id:'TEST-ONLY-fresh-byte-source',data:{title:'TEST ONLY source gate',body:'TEST ONLY FRESH SOURCE DENIAL CANARY',synthetic:true}})).record;
  const linked=structuredClone(selected.activity);linked.blocks.push({id:'reading',kind:'reading',ref:{family:'note',id:note.id,rendition:note.rendition}});const derived=sdk.deriveActivityPresentation(linked);linked.presentation={...derived,slots:derived.slots.map(slot=>slot.blockId==='passage'?{...slot,viewId:'source.bytes-v1'}:slot)};
  const sourceBound=(await rpc(c,'publish_minamo_activity_package',{...selected,id:'synthetic-fresh-byte-linked',operationId:'synthetic-fresh-byte-linked-publish',activity:linked})).record;
  okay(await c.command({action:'trash',family:'note',id:note.id,expectedRev:note.rev}));
  const denied=await rpc(c,'read_minamo_activity',{id:sourceBound.id,rendition:sourceBound.rendition});assert.equal(denied.record.activity.blocks.at(-1).kind,'instruction');assert.match(denied.record.activity.blocks.at(-1).text,/unavailable/);assert.doesNotMatch(JSON.stringify(denied),/TEST ONLY FRESH SOURCE DENIAL CANARY/);
  assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,0);assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);
  console.log(JSON.stringify({evidence:'real isolated local Worker/D1/R2 typed MCP',receipts,runRecords:0,learningDevelopments:0,ownerDenial:404,sourceDenial:'unavailable instruction'}));
 }finally{if(f)await f.dispose();rmSync(directory,{recursive:true,force:true});}
});
