import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync,mkdirSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export*from"./app/interface-view-registry.ts";export*from"./lib/interface-extension.ts";export{mount as bytesMount}from"./app/interface-view-bytes.ts";export{finiteTraceView}from"./app/interface-view-finite-template.ts";export{plainTextArtefact}from"./lib/foundry/core-adapters.ts";export{dataTraceArtefact}from"./lib/foundry/data-platform.ts";export{validateActivityCartridge}from"./lib/activity/schema.ts";export{PRACTICAL_VIEW_EXAMPLES}from"./lib/interface-practical.ts";export{admitActivityContent}from"./lib/activity/admission.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const dir=mkdtempSync(join(tmpdir(),'interface-extension-')),file=join(dir,'sdk.cjs');writeFileSync(file,built.outputFiles[0].text);const sdk=require(file);rmSync(dir,{recursive:true,force:true});
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.listeners=new Map();this.value='';this._text='';this.disabled=false;}
 set textContent(value){this._text=value??'';this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 appendChild(child){this.children.push(child);return child;}replaceChildren(...children){this._text='';this.children=children;}
 setAttribute(key,value){this.attributes[key]=String(value);}getAttribute(key){return this.attributes[key]??null;}querySelector(tag){for(const child of this.children){if(child.tagName.toLowerCase()===tag)return child;const nested=child.querySelector(tag);if(nested)return nested;}return null;}
 addEventListener(type,handler){this.listeners.set(type,handler);}removeEventListener(type,handler){if(this.listeners.get(type)===handler)this.listeners.delete(type);}
 click(){if(!this.disabled)this.listeners.get('click')?.();}
}
const elements=(root,tag)=>root.children.flatMap(child=>[...(child.tagName.toLowerCase()===tag?[child]:[]),...elements(child,tag)]);
const authority={canRead:()=>true,verifyRun:()=>false};
test('default bank registration is dormant; registry keeps original source/payload admission and lazy activation',async()=>{
 assert.ok(sdk.interfaceViewCatalogue().some(view=>view.id==='source.bytes-v1'));
 let loaded=0,mounted=0,disposed=0;const view={id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true,load:async()=>{loaded++;return{mount(host,payload){mounted++;host.textContent=payload.text;return()=>disposed++;}}}};
 const registry=await sdk.interfaceActivityRegistry(view.id,[view]),original=await sdk.plainTextArtefact('TEST ONLY original 😀'),admitted=await registry.admit(original,authority);assert.equal(loaded,0);assert.equal(admitted.fallback,original.canonical.source);
 const bad=structuredClone(original);bad.payload.text='forged display';await assert.rejects(registry.admit(bad,authority),/differs/);assert.equal(loaded,0);
 const host=new Element('div'),instance=await registry.activate(admitted,host,authority);assert.equal(loaded,1);assert.equal(mounted,1);assert.equal(host.textContent,original.canonical.source);instance.dispose();instance.dispose();assert.equal(disposed,1);assert.equal(host.textContent,'');
});
test('omitted view ID always retains ordinary prose even when a bytes registration is enabled',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};let loaded=0;
 try{const view={id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true,load:async()=>{loaded++;return{mount(){throw Error('Omitted view must not replace prose.');}}}},registry=await sdk.interfaceActivityRegistry(undefined,[view]),artefact=await sdk.plainTextArtefact('Ordinary original prose 😀'),admitted=await registry.admit(artefact,authority),host=new Element('div'),instance=await registry.activate(admitted,host,authority);
  assert.equal(loaded,0);assert.equal(host.textContent,artefact.canonical.source);assert.equal(elements(host,'table').length,0);instance.dispose();
  const wrong=await sdk.interfaceActivityRegistry('source.bytes-v2',[view]),fallback=await wrong.admit(artefact,authority),other=new Element('div'),stopped=await wrong.activate(fallback,other,authority);assert.equal(loaded,0);assert.equal(other.textContent,artefact.canonical.source);stopped.dispose();
 }finally{globalThis.document=previous;}
});
test('unregistered/duplicate kinds and IDs or data-supplied callbacks cannot alter build-time registry',async()=>{
 const base={id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true,load:async()=>({mount(){}})};
 for(const registrations of [[{...base,sourceKind:'remote/script-v1'}],[base,{...base}],[base,{...base,id:'other.view-v1'}],[{...base,url:'https://invalid/script'}],[{...base,load:'https://invalid/script'}]])await assert.rejects(sdk.interfaceActivityRegistry('source.bytes-v1',registrations));
 let loaded=false;const registry=await sdk.interfaceActivityRegistry('source.bytes-v1',[{...base,enabled:false,load:async()=>{loaded=true;throw Error('must not load');}}]);await registry.admit(await sdk.plainTextArtefact('Original source'),authority);assert.equal(loaded,false);
});
test('extension inherits source revocation, failed loader and exactly-once cleanup guarantees',async()=>{
 let allowed=true,cleaned=0;const registry=await sdk.interfaceActivityRegistry('source.bytes-v1',[{id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true,load:async()=>({mount(host){host.textContent='permitted';return()=>cleaned++;}})}]);
 const source=await sdk.plainTextArtefact('PRIVATE SOURCE');source.sourceRef={family:'article',id:'source',rendition:'r1',sectionId:'s',partId:'p'};const rights={...authority,canRead:()=>allowed},admitted=await registry.admit(source,rights),host=new Element('div'),instance=await registry.activate(admitted,host,rights);
 allowed=false;assert.equal(await instance.revalidate(),false);assert.equal(host.textContent,'');assert.equal(cleaned,1);instance.dispose();assert.equal(cleaned,1);
 let lateMounted=false;const lateRegistry=await sdk.interfaceActivityRegistry('source.bytes-v1',[{id:'source.bytes-v1',sourceKind:'text/plain-v1',enabled:true,load:async()=>{allowed=false;return{mount(){lateMounted=true;}};}}]);allowed=true;const late=await lateRegistry.admit(source,rights);await assert.rejects(lateRegistry.activate(late,host,rights));assert.equal(lateMounted,false);assert.equal(host.textContent,'');
});
test('banked byte inspector uses exact Unicode UTF-8 bytes, bounded rows, responsive scroll region and teardown',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{const source='A😀e\u0301\r\n<script>inert</script>',artefact=await sdk.plainTextArtefact(source),host=new Element('div'),dispose=await sdk.bytesMount(host,artefact.payload,artefact);
  assert.match(host.textContent,/41 f0 9f 98 80 65 cc 81/);assert.match(host.textContent,/UTF-16 units/);assert.match(host.textContent,/d83d de00 0065 0301/);assert.ok(host.textContent.includes(Buffer.from(source,'utf8').toString('base64')));assert.match(host.textContent,/NFC differs/);assert.equal(elements(host,'script').length,0);assert.equal(elements(host,'table').length,1);assert.ok(elements(host,'div').some(element=>element.attributes.role==='region'&&element.style.overflowX==='auto'));
  const buttons=elements(host,'button');dispose();assert.equal(host.textContent,'');for(const button of buttons)assert.equal(button.listeners.size,0);
  const long=await sdk.plainTextArtefact('x'.repeat(2000)),other=new Element('div'),stop=await sdk.bytesMount(other,long.payload,long);assert.ok(elements(other,'tr').length<=49);elements(other,'button').find(button=>button.textContent==='Next rows').click();assert.match(other.textContent,/page 2/);stop();
 }finally{globalThis.document=previous;}
});
test('finite trace template is source-bound, deliberate, inert and safely disposes controls',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{const trace=await sdk.dataTraceArtefact({format:'minamo.trace.v1',classification:'supplied-artifact',redacted:false,events:[{sequence:0,timeMs:null,kind:'command',text:'<script>never execute</script>'},{sequence:1,timeMs:12,kind:'stdout',text:'Supplied result'}]}),host=new Element('div'),view=sdk.finiteTraceView('Supplied event steps'),stop=await view.mount(host,trace.payload,trace);
  assert.match(host.textContent,/Event 1 of 2/);assert.equal(elements(host,'script').length,0);const next=elements(host,'button').find(button=>button.textContent==='Next event');next.click();assert.match(host.textContent,/Event 2 of 2/);assert.match(host.textContent,/Supplied result/);const buttons=elements(host,'button');stop();for(const button of buttons)assert.equal(button.listeners.size,0);assert.equal(host.textContent,'');
  assert.throws(()=>view.mount(new Element('div'),{...trace.payload,redacted:true},trace),/match exact/);
 }finally{globalThis.document=previous;}
});
test('all enabled build-time registrations mount representative admitted sources with inherited lifecycle',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{for(const entry of sdk.interfaceViews.filter(entry=>entry.enabled)){
  const artefact=entry.sourceKind==='text/plain-v1'?await sdk.plainTextArtefact(sdk.PRACTICAL_VIEW_EXAMPLES.find(example=>example.viewId===entry.id)?.source??'TEST ONLY 😀 exact UTF-8'):entry.sourceKind==='trace/external-v1'?await sdk.dataTraceArtefact({format:'minamo.trace.v1',classification:'supplied-artifact',redacted:false,events:[{sequence:0,timeMs:null,kind:'stdout',text:'TEST ONLY supplied trace'}]}):null;
  assert.ok(artefact,'Add a source fixture before enabling '+entry.sourceKind);const registry=await sdk.interfaceActivityRegistry(entry.id),admitted=await registry.admit(artefact,authority),host=new Element('div'),instance=await registry.activate(admitted,host,authority);assert.ok(host.textContent);instance.dispose();assert.equal(host.textContent,'');
 }}finally{globalThis.document=previous;}
});
test('extension source has no remote import, innerHTML, fetch, recording or ambient script execution',()=>{
 for(const file of ['app/interface-view-bytes.ts','app/interface-view-finite-template.ts']){const source=readFileSync(file,'utf8');assert.doesNotMatch(source,/innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|\bfetch\(|getUserMedia|localStorage|sessionStorage|https?:\/\//);}
});
test('finite module scaffold produces an actually admitted trace fixture and refuses overwrites or injected paths',async()=>{
 const directory=mkdtempSync(join(tmpdir(),'interface-scaffold-')),script=resolve('scripts/interface-view-scaffold.mjs');mkdirSync(join(directory,'app'));
 try{
  const args=[script,'--id','trace.safe-steps-v1','--title','Supplied event steps'],output=execFileSync(process.execPath,args,{cwd:directory,encoding:'utf8'});assert.match(output,/No publication or registration performed/);
  const fixture=JSON.parse(readFileSync(join(directory,'.sites-runtime/interface-view-trace-safe-steps-v1.json'),'utf8'));assert.equal(fixture.activity.presentation.slots[1].viewId,'trace.safe-steps-v1');assert.throws(()=>sdk.validateActivityCartridge(fixture.activity),/Invalid enum|known versioned|Invalid/,'A new scaffold must not bypass server metadata admission.');delete fixture.activity.presentation.slots[1].viewId;sdk.validateActivityCartridge(fixture.activity);await sdk.admitActivityContent(fixture.activity);assert.match(output,/interface-extension-catalogue/);
  const module=readFileSync(join(directory,'app/interface-view-trace-safe-steps-v1.ts'),'utf8');assert.match(module,/finiteTraceView\("Supplied event steps"\)/);assert.ok(!existsSync(join(directory,'app/interface-view-registry.ts')),'Scaffold cannot silently modify registration.');
  assert.throws(()=>execFileSync(process.execPath,args,{cwd:directory,stdio:'pipe'}),/Command failed/);
  for(const id of ['../escape','trace.unsafe/escape-v1','trace.bad;eval-v1'])assert.throws(()=>execFileSync(process.execPath,[script,'--id',id],{cwd:directory,stdio:'pipe'}));
  assert.throws(()=>execFileSync(process.execPath,[script,'--id','trace.other-v1','--title','<script>'],{cwd:directory,stdio:'pipe'}));
 }finally{rmSync(directory,{recursive:true,force:true});}
});
