import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:'export*from"./lib/interface-foundry.ts";export{foundryAdapters}from"./lib/foundry/specimens.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const dir=mkdtempSync(join(tmpdir(),'interface-contract-')),file=join(dir,'sdk.cjs');writeFileSync(file,result.outputFiles[0].text);const sdk=require(file);rmSync(dir,{recursive:true,force:true});
const block=(id,kind)=>({id,kind,text:'Original supplied synthetic prose. No learning progress.'});
const activity=(template='debugging',blocks=[block('task','instruction'),block('predict','prediction'),block('reflect','reflection'),{id:'hints',kind:'hint-ladder',hints:[{id:'concept',tier:'concept',text:''}]}])=>({contract:'minamo.activity.v1',template,intent:'TEST ONLY original synthetic composition',authorship:'original-exercise',blocks});
const valid=()=>sdk.deriveActivityPresentation(activity());
test('all eleven active patterns and thirteen actual templates select deterministic full compositions',()=>{
 assert.equal(sdk.PRESENTATION_PATTERNS.length,11);assert.equal(new Set(sdk.PRESENTATION_PATTERNS.map(p=>p.id)).size,11);
 for(const template of ['debugging','fill-gap','predict-compare','code-archaeology','test-mutation','diagnostic','walkthrough','language','mathematics','data','game','music','visual']){
  const a=activity(template),recipe=sdk.deriveActivityPresentation(a);assert.deepEqual(recipe,sdk.deriveActivityPresentation(a));assert.equal(recipe.slots.length,a.blocks.length);
  assert.ok(recipe.slots.some(slot=>slot.slot===recipe.preferredFocus));assert.ok(sdk.PRESENTATION_PATTERNS.some(pattern=>pattern.id===recipe.pattern));
  for(const pattern of sdk.PRESENTATION_PATTERNS){const admitted=sdk.admitPresentationRecipe({...recipe,pattern:pattern.id},a);assert.equal(admitted.pattern,pattern.id);}
 }
});
test('recipes carry IDs only; snapshot cannot mutate caller payload or disclose hidden hints',()=>{
 const a=activity(),input=JSON.parse(JSON.stringify(valid()));a.blocks.at(-1).hints[0].text='SECRET SERVER HINT';
 const recipe=sdk.admitPresentationRecipe(input,a);input.slots[0].blockId='mutated';
 assert.equal(recipe.slots[0].blockId,'task');assert.ok(Object.isFrozen(recipe));assert.ok(Object.isFrozen(recipe.slots));
 assert.doesNotMatch(JSON.stringify(recipe),/SECRET SERVER HINT|Original supplied|<script|provenance|owner/);
 assert.throws(()=>recipe.slots.push({slot:'task',blockId:'forged'}),TypeError);
});
test('strict admission rejects executable objects, unregistered versions, dropped/duplicated/cross-edition references',()=>{
 const a=activity(),good=valid();
 for(const change of [
  {contract:'minamo.presentation.v2'},{version:2},{pattern:'remote-code'},{fallback:'html'},
  {component:'https://invalid/script.js'},{style:'position:fixed'},{onClick:()=>{}},
  {slots:good.slots.slice(1)},{slots:[...good.slots,good.slots[0]]},
  {slots:good.slots.map((slot,i)=>i===0?{...slot,blockId:'other-edition'}:slot)},
  {slots:good.slots.map((slot,i)=>i===0?{...slot,slot:'iframe'}:slot)},
  {slots:good.slots.map((slot,i)=>i===0?{...slot,text:'copied source'}:slot)},
  {slots:good.slots.map(slot=>slot.blockId==='hints'?{...slot,slot:'source'}:slot)},
  {preferredFocus:'supporting'},
 ])assert.throws(()=>sdk.admitPresentationRecipe({...good,...change},a),sdk.PresentationError);
 assert.throws(()=>sdk.admitPresentationRecipe(good,activity('debugging',[block('task','instruction'),block('task','instruction')])));
 let touched=0;const hostile={...good};Object.defineProperty(hostile,'pattern',{enumerable:true,get(){touched++;return 'debug-and-repair';}});
 assert.throws(()=>sdk.admitPresentationRecipe(hostile,a));assert.equal(touched,0,'Do not invoke accessor before inert JSON admission.');
 const cycle={...good};cycle.cycle=cycle;assert.throws(()=>sdk.admitPresentationRecipe(cycle,a));
 const proto=Object.assign(Object.create({injected:true}),good);assert.throws(()=>sdk.admitPresentationRecipe(proto,a));
});
test('measured container adaptation retains exact block identity at every required width and mode',()=>{
 const a=activity(),recipe=valid();
 for(const width of [320,360,390,430,700,768,1024,1280,1440])for(const mode of ['classic','focus','task'])for(const notesDock of ['left','right','top','bottom',null]){
  const view=sdk.resolvePresentation(recipe,a,{eligible:true,width,mode,notesDock});
  assert.deepEqual(view.panes.flatMap(pane=>pane.blockIds).sort(),a.blocks.map(block=>block.id).sort());
  assert.equal(view.layout,width<720||mode==='focus'?'single':width<1120?'split':'wide');
  assert.ok(view.actions.includes('open-note'));assert.ok(view.actions.includes('reveal-hint'));assert.ok(!view.actions.includes('run'));
 }
 for(const width of [0,-1,NaN,Infinity])assert.equal(sdk.resolvePresentation(recipe,a,{eligible:true,width,mode:'task'}).layout,'single');
});
test('denied authority withholds source identifiers and all action capabilities before inspecting stale recipe',()=>{
 const denied=sdk.resolvePresentation({slots:[{blockId:'PRIVATE-SOURCE'}]},activity(),{eligible:false,width:1440,mode:'task'});
 assert.equal(denied.state,'unavailable');assert.deepEqual(denied.panes,[]);assert.deepEqual(denied.actions,[]);assert.doesNotMatch(JSON.stringify(denied),/PRIVATE|hints|debug/);
});
test('trusted format catalogue exactly matches existing Foundry adapters and unknown engines stay static',()=>{
 assert.deepEqual([...sdk.PRESENTATION_FOUNDRY_KINDS].sort(),sdk.foundryAdapters.map(adapter=>adapter.kind).sort());
 const a=activity('visual',[{id:'unknown',kind:'foundry',artefact:{kind:'not-registered-v1',canonical:{source:'retain this exact source'}}}]);
 const view=sdk.resolvePresentation(sdk.deriveActivityPresentation(a),a,{eligible:true,width:390,mode:'task'});
 assert.ok(!view.actions.includes('activate-view'));assert.deepEqual(view.panes,[{slot:'explore',blockIds:['unknown']}]);assert.equal(view.fallback,'accessible-source');
});
test('source and reading references inherit finite actions without URL/owner or save authority',()=>{
 const a=activity('walkthrough',[{id:'files',kind:'source-browser',bundle:{}},{id:'reading',kind:'reading',ref:{family:'article',id:'source',rendition:'r1'}}]);
 const recipe=sdk.deriveActivityPresentation(a),view=sdk.resolvePresentation(recipe,a,{eligible:true,width:1024,mode:'classic'});
 assert.deepEqual(recipe.slots,[{slot:'source',blockId:'files'},{slot:'supporting',blockId:'reading'}]);
 assert.ok(view.actions.includes('open-locally'));assert.ok(!view.actions.includes('activate-view'));assert.ok(!view.actions.includes('save'));
});
test('ephemeral display identity cannot cross owner/generation/Activity/rendition or delimiter collisions',()=>{
 const base=sdk.presentationStateKey('owner:a:generation:1','activity','r1');
 for(const fields of [['owner:b:generation:1','activity','r1'],['owner:a:generation:2','activity','r1'],['owner:a:generation:1','other','r1'],['owner:a:generation:1','activity','r2']])assert.notEqual(base,sdk.presentationStateKey(...fields));
 assert.notEqual(sdk.presentationStateKey('a:b','c','d'),sdk.presentationStateKey('a','b:c','d'));
 assert.throws(()=>sdk.presentationStateKey('','a','r'));assert.throws(()=>sdk.presentationStateKey('a','b','r'.repeat(1001)));
});
