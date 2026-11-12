import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),React=require('react'),{create,act}=require('react-test-renderer');
const built=await wr('esbuild').build({stdin:{contents:`export {default as Activity} from './app/activity-studio';export {default as Practice} from './app/practice-library';export {default as Beta} from './app/beta-center';export {homeRecentNotes} from './app/learning-home';export {newNoteDraft,canDiscardEmptyNote} from './lib/note-sync';export {terminalCaptureMarker} from './lib/note-terminal';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,external:['react'],loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}'}});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const ui=mod.exports;
const settle=()=>new Promise(resolve=>setTimeout(resolve,330));
const activity={contract:'minamo.activity.v1',template:'debugging',intent:'TEST ONLY exact task',authorship:'original-exercise',blocks:[{id:'task',kind:'instruction',text:'TEST ONLY inspect bytes'},{id:'hints',kind:'hint-ladder',hints:[{id:'hint-one',tier:'nudge',text:'TEST ONLY revealed hint'}]}]};
const record={family:'experiment',id:'test-activity',rev:1,rendition:'exact-edition',title:'TEST ONLY Activity',body:'',sections:[],links:[],synthetic:true,activity};
test('Home terminal preview and explicit empty-draft discard preserve original bytes and all nonempty/uncertain drafts',()=>{
 const body=ui.terminalCaptureMarker({id:'test-terminal',output:'exact\r\nbytes 😄',label:'Kali output'})+'\n\n**My observation**';const note={...record,family:'note',id:'note',synthetic:false,body,updatedAt:'2026-10-27T00:00:00Z'};
 const preview=ui.homeRecentNotes([note])[0];assert.match(preview.text,/Terminal output · Kali output/);assert.match(preview.text,/My observation/);assert.doesNotMatch(preview.text,/minamo-terminal|"output"/);assert.equal(note.body,body);
 const empty=ui.newNoteDraft();assert.equal(ui.canDiscardEmptyNote(empty),true);for(const patch of [{body:' ' ,dirty:true},{title:'Named'},{baseRev:1},{sequence:1},{paused:true},{inlineImages:[{}]},{imageReselectRequired:true}])assert.equal(ui.canDiscardEmptyNote({...empty,...patch}),false);assert.equal(ui.canDiscardEmptyNote(empty,{command:{}}),false);
});
test('mounted Practice and Activity keep admitted rows, draft and revealed hint on 503; foreground bursts coalesce; 403 redacts',{timeout:15000},async()=>{
 const keys=['window','document','location','localStorage','sessionStorage','fetch','requestAnimationFrame','cancelAnimationFrame','IS_REACT_ACT_ENVIRONMENT'],previous=Object.fromEntries(keys.map(k=>[k,globalThis[k]])),oldNow=Date.now;
 const browser=new EventTarget(),doc=new EventTarget(),values=new Map();let clock=100000,status=200,activityReads=0,practiceReads=0,renderer;
 const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 Object.assign(browser,{innerWidth:1280,innerHeight:900,location:{href:'https://test.invalid/?view=practice',search:'?view=practice'},matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),history:{state:null,replaceState(){}}});Object.assign(doc,{visibilityState:'visible'});
 const request=async path=>{if(String(path).includes('/api/activities/read')){activityReads++;return status===200?Response.json({record}):Response.json({error:'SYNTHETIC access read failed'},{status});}if(String(path).includes('/api/activities/hint'))return Response.json({hint:{text:'TEST ONLY revealed hint'}});practiceReads++;return status===200?Response.json({items:[{record}]}):Response.json({error:'SYNTHETIC browse failed'},{status});};
 Object.assign(globalThis,{window:browser,document:doc,location:browser.location,localStorage:storage,sessionStorage:storage,fetch:request,requestAnimationFrame:callback=>setTimeout(callback,0),cancelAnimationFrame:clearTimeout,IS_REACT_ACT_ENVIRONMENT:true});Date.now=()=>clock;
 try{
  await act(async()=>{renderer=create(React.createElement(ui.Activity,{record,scope:'TEST-ONLY-client'}));});
  const textOf=node=>typeof node==='string'?node:(node.children??[]).map(textOf).join('');const findButton=text=>renderer.root.findAllByType('button').find(node=>textOf(node).includes(text));
  // The real interface may put hints in its own tab. Activate it before revealing.
  const hintTab=findButton('Hints');if(hintTab)await act(async()=>hintTab.props.onClick());
  await act(async()=>findButton('Reveal hint 1').props.onClick());
  const reflection=renderer.root.findAllByType('textarea').find(node=>String(node.props.id).endsWith('-reflection'));if(reflection)await act(async()=>reflection.props.onChange({target:{value:'TEST ONLY retained draft'}}));
  status=503;clock+=16000;await act(async()=>{browser.dispatchEvent(new Event('focus'));doc.dispatchEvent(new Event('visibilitychange'));await settle();});
  assert.equal(activityReads,2);assert.match(JSON.stringify(renderer.toJSON()),/TEST ONLY exact task/);assert.match(JSON.stringify(renderer.toJSON()),/TEST ONLY revealed hint/);assert.doesNotMatch(JSON.stringify(renderer.toJSON()),/no longer available/);
  status=403;clock+=16000;await act(async()=>{browser.dispatchEvent(new Event('focus'));doc.dispatchEvent(new Event('visibilitychange'));await settle();});assert.doesNotMatch(JSON.stringify(renderer.toJSON()),/TEST ONLY revealed hint/);
  await act(async()=>renderer.unmount());status=200;
  await act(async()=>{renderer=create(React.createElement(ui.Practice,{scope:'TEST-ONLY-client',onOpen(){}}));});await act(settle);const baseline=practiceReads;assert.match(JSON.stringify(renderer.toJSON()),/TEST ONLY Activity/);
  status=503;clock+=16000;await act(async()=>{browser.dispatchEvent(new Event('focus'));doc.dispatchEvent(new Event('visibilitychange'));await settle();});await act(settle);assert.equal(practiceReads,baseline+1);assert.match(JSON.stringify(renderer.toJSON()),/TEST ONLY Activity/);assert.match(JSON.stringify(renderer.toJSON()),/SYNTHETIC browse failed/);
  await act(async()=>renderer.unmount());const scope='v2-'+'a'.repeat(64),draftKey='minamo-gpt-draft:'+scope+':legacy@0',proposalKey='minamo-gpt-proposal:'+scope+':legacy@0';storage.setItem(draftKey,'TEST ONLY previous Markdown');storage.setItem(proposalKey,JSON.stringify({version:1,proposal:{token:'TEST-ONLY-retained-proposal',manuscript:{documents:[]},preview:{records:[],valid:true}}}));browser.fetch=request;
  await act(async()=>{renderer=create(React.createElement(ui.Beta,{scope,generation:'legacy@0'}));});assert.equal(renderer.root.findAllByType('textarea').find(node=>node.props.maxLength===100000).props.value,'TEST ONLY previous Markdown');
  await act(async()=>renderer.root.findAllByType('textarea').find(node=>node.props.maxLength===100000).props.onChange({target:{value:''}}));assert.equal(storage.getItem(draftKey),null);assert.match(storage.getItem(proposalKey),/TEST-ONLY-retained-proposal/);
  await act(async()=>renderer.unmount());await act(async()=>{renderer=create(React.createElement(ui.Beta,{scope,generation:'legacy@0'}));});assert.equal(renderer.root.findAllByType('textarea').find(node=>node.props.maxLength===100000).props.value,'');

 }finally{if(renderer)await act(async()=>renderer.unmount());Date.now=oldNow;for(const key of keys){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});
