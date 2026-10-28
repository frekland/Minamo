import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export*from"./lib/interface-practical.ts";export*from"./lib/activity/practical-foundry-examples.ts";export*from"./app/interface-view-practical.ts";export*from"./app/interface-view-registry.ts";export{plainTextArtefact}from"./lib/foundry/core-adapters.ts";export{admitActivityContent}from"./lib/activity/admission.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const dir=mkdtempSync(join(tmpdir(),'pr49-foundry-')),file=join(dir,'sdk.cjs');writeFileSync(file,built.outputFiles[0].text);const sdk=require(file);rmSync(dir,{recursive:true,force:true});
class Element{constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.style={};this.listeners=new Map();this.value='';this._text='';this.disabled=false;}set textContent(value){this._text=value??'';this.children=[];}get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}appendChild(child){this.children.push(child);return child;}replaceChildren(...children){this._text='';this.children=children;}setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k]??null;}addEventListener(type,handler){this.listeners.set(type,handler);}removeEventListener(type,handler){if(this.listeners.get(type)===handler)this.listeners.delete(type);}click(){if(!this.disabled)this.listeners.get('click')?.();}}
const elements=(root,tag)=>root.children.flatMap(child=>[...(child.tagName.toLowerCase()===tag?[child]:[]),...elements(child,tag)]);
const rights={canRead:()=>true,verifyRun:()=>false};
test('practical source parsers reject executable/extra/malformed JSON and retain finite deterministic boundaries',()=>{
 for(const example of sdk.PRACTICAL_VIEW_EXAMPLES){sdk.validatePracticalViewSource(example.viewId,example.source);if(example.viewId!=='source.diff-v1'){assert.throws(()=>sdk.validatePracticalViewSource(example.viewId,'alert(1)'));assert.throws(()=>sdk.validatePracticalViewSource(example.viewId,JSON.stringify({...JSON.parse(example.source),callback:'arbitrary code'})));}}
 const graph=JSON.parse(sdk.PRACTICAL_VIEW_EXAMPLES[1].source),steps=sdk.parseGraphSource(JSON.stringify(graph)).steps;assert.equal(steps.at(-1).distance.server,2);graph.algorithm='bfs';assert.equal(sdk.parseGraphSource(JSON.stringify(graph)).steps.at(-1).distance.server,1);
 const sudoku=JSON.parse(sdk.PRACTICAL_VIEW_EXAMPLES[3].source);sudoku.maxSteps=2;const trace=sdk.parseSudokuSource(JSON.stringify(sudoku));assert.equal(trace.steps.length,2);assert.equal(trace.steps.at(-1).event,'budget');sudoku.board[1]=5;assert.throws(()=>sdk.parseSudokuSource(JSON.stringify(sudoku)),/violate/);
 assert.throws(()=>sdk.validatePracticalViewSource('source.diff-v1','--- a/a\n+++ b/a\n@@ -1 +1 @@\n+wrong count\n'));
 assert.throws(()=>sdk.parseMazeSource(JSON.stringify({version:1,rows:['###','#S#','###']})),/start and goal/);
 assert.throws(()=>sdk.parseLifeSource(JSON.stringify({version:1,grid:[[0,1],[1]]})),/rectangular/);
});
test('explicit practical views expose native controls, source-exact state and remove all listeners on disposal',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{for(const example of sdk.PRACTICAL_VIEW_EXAMPLES){const registry=await sdk.interfaceActivityRegistry(example.viewId),artefact=await sdk.plainTextArtefact(example.source),admitted=await registry.admit(artefact,rights),host=new Element('div'),instance=await registry.activate(admitted,host,rights);assert.match(host.textContent,/session-only/);assert.ok(host.textContent.includes(example.source));const buttons=elements(host,'button'),inputs=elements(host,'input');assert.ok(buttons.length);for(const button of buttons)button.click();assert.equal(elements(host,'script').length,0);assert.ok(elements(host,'div').some(node=>node.attributes.role==='region'&&node.style.overflowX==='auto'));instance.dispose();assert.equal(host.textContent,'');for(const node of [...buttons,...inputs])assert.equal(node.listeners.size,0);}}
 finally{globalThis.document=previous;}
});
test('practical content gives exact new-view validation at Activity admission and ordinary prose remains available',async()=>{
 const examples=await sdk.practicalFoundryActivities();assert.equal(examples.length,9);for(const example of examples)await sdk.admitActivityContent(example.activity);
 const invalid=structuredClone(examples[0].activity),block=invalid.blocks.find(block=>block.kind==='foundry');block.artefact=await sdk.plainTextArtefact('Not a unified patch');await assert.rejects(sdk.admitActivityContent(invalid),/header|source/i);
 delete invalid.presentation.slots.find(slot=>slot.viewId).viewId;await sdk.admitActivityContent(invalid);
 for(const file of ['app/interface-view-practical.ts','lib/interface-practical.ts'])assert.doesNotMatch(readFileSync(file,'utf8'),/innerHTML|outerHTML|insertAdjacentHTML|\beval\(|new Function|\bfetch\(|localStorage|sessionStorage|getUserMedia/);
});
test('Life view oscillates deterministically, stops at its deliberate generation budget, and resets exact supplied state',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{const example=sdk.PRACTICAL_VIEW_EXAMPLES.find(example=>example.viewId==='systems.life-v1'),artefact=await sdk.plainTextArtefact(example.source),host=new Element('div'),registry=await sdk.interfaceActivityRegistry(example.viewId),instance=await registry.activate(await registry.admit(artefact,rights),host,rights),buttons=elements(host,'button'),next=buttons.find(button=>button.textContent==='Next generation'),reset=buttons.find(button=>button.textContent==='Reset simulation'),initial=elements(host,'tbody')[0].textContent;
 next.click();assert.notEqual(elements(host,'tbody')[0].textContent,initial);next.click();assert.equal(elements(host,'tbody')[0].textContent,initial);for(let i=2;i<256;i++)next.click();assert.equal(next.disabled,true);assert.match(host.textContent,/Generation 256 of at most 256/);next.click();assert.match(host.textContent,/Generation 256 of at most 256/);reset.click();assert.equal(next.disabled,false);assert.equal(elements(host,'tbody')[0].textContent,initial);assert.match(host.textContent,/Generation 0 of/);instance.dispose();assert.equal(host.textContent,'');
 }finally{globalThis.document=previous;}
});
test('nine original practical Activities publish through isolated typed MCP with exact source and recoverable cleanup',{timeout:90000},async()=>{
 const f=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}');
 const owner=f.client('TEST-ONLY-pr49-practical-owner'),other=f.client('TEST-ONLY-pr49-practical-other'),purpose='TEST ONLY PR49 original practical Foundry acceptance; no learner evidence.';
 async function rpc(client,name,input={}){const response=await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...input}}});assert.equal(response.status,200);assert.notEqual(response.data.result.isError,true,JSON.stringify(response.data));return JSON.parse(response.data.result.content[0].text);}
 try{const examples=await sdk.practicalFoundryActivities();for(const [index,example] of examples.entries()){
  const request={purpose,operationId:'test-only-pr49-foundry-publish-'+index,id:example.id,title:example.title,synthetic:true,activity:example.activity};
  const preview=await rpc(owner,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);
  const saved=await rpc(owner,'publish_minamo_activity_package',request);assert.equal(saved.receipt.status,'committed');assert.equal(saved.learningDevelopmentCreated,false);
  const replay=await rpc(owner,'publish_minamo_activity_package',request);assert.equal(replay.receipt.replayed,true);
  const read=await rpc(owner,'read_minamo_activity',{id:example.id,rendition:saved.record.rendition});assert.deepEqual(read.record.activity,example.activity);
  for(const block of example.activity.blocks.filter(block=>block.kind==='foundry'))assert.deepEqual(read.record.activity.blocks.find(item=>item.id===block.id).artefact.canonical,block.artefact.canonical);
  assert.equal((await other.request('/api/activities/read',{id:example.id})).status,404);
  const cleanup=await owner.command({action:'trash',family:'experiment',id:example.id,expectedRev:saved.record.rev});assert.equal(cleanup.status,200);assert.equal(cleanup.data.status,'committed');
 }
 assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment' AND trashed_at IS NULL").first()).n,0);
 assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment' AND trashed_at IS NOT NULL").first()).n,9);
 assert.equal((await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='run'").first()).n,0);
 assert.equal((await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first()).n,0);
 }finally{await f.dispose();}
});
