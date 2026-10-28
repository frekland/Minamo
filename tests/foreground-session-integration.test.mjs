import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),React=require('react'),{create,act}=require('react-test-renderer');
const built=await wr('esbuild').build({stdin:{contents:"export {default} from './app/beta-center.tsx';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},external:['react'],define:{'process.env.NODE_ENV':'"test"'}});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const BetaCenter=mod.exports.default;
const settle=()=>new Promise(resolve=>setTimeout(resolve,160));

test('mounted session guard retains an open feedback draft through transport failure and fences concurrent late reads on confirmed principal change',async()=>{
 const names=['window','document','location','fetch','sessionStorage','IS_REACT_ACT_ENVIRONMENT'],previous=Object.fromEntries(names.map(key=>[key,globalThis[key]])),previousNow=Date.now;
 const browser=new EventTarget(),doc=new EventTarget(),storage=new Map();let requests=0,clears=0,redirects=0,clock=100000,renderer,resolveLate;
 const scope='a'.repeat(64),generation='legacy@0',identity={scope,generation,role:'owner'};
 const nodes=[];Object.assign(doc,{visibilityState:'visible',createElement:tag=>{const node={tag,style:{},children:[],appendChild(child){this.children.push(child);},focus(){this.focused=true;}};nodes.push(node);return node;},body:{style:{},replaceChildren(){clears++;},appendChild(){}}});
 Object.assign(browser,{location:{href:'https://synthetic.test/?view=library',origin:'https://synthetic.test',replace(){redirects++;}},fetch:async input=>{
  const path=new URL(String(input),'https://synthetic.test').pathname;
  if(path==='/api/beta/session'){requests++;return requests===1?new Response('temporarily unavailable',{status:503}):requests===2?new Response('<html>retry later</html>',{status:200}):Response.json(identity,{headers:{'X-Minamo-Principal':scope,'X-Minamo-Generation':generation}});}
  if(path==='/api/context-late')return new Promise(resolve=>{resolveLate=resolve;});
  if(path==='/api/record-denied')return Response.json({code:'source_unavailable'},{status:403,headers:{'X-Minamo-Principal':scope,'X-Minamo-Generation':generation}});
  return Response.json({code:'principal_changed'},{status:409,headers:{'X-Minamo-Principal':'b'.repeat(64)}});
 }});
 Object.assign(globalThis,{window:browser,document:doc,location:browser.location,fetch:(...args)=>browser.fetch(...args),sessionStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},IS_REACT_ACT_ENVIRONMENT:true});Date.now=()=>clock;
 try{
  await act(async()=>{renderer=create(React.createElement(BetaCenter,{scope:'v2-'+scope,generation}));});
  assert.equal(requests,1);assert.equal(clears,0);assert.equal(redirects,0);
  await act(async()=>browser.dispatchEvent(new CustomEvent('minamo-beta-open',{detail:'feedback'})));
  await act(async()=>renderer.root.findByType('textarea').props.onChange({target:{value:'SYNTHETIC independent unsent feedback draft'}}));
  const assertRetained=()=>{assert.equal(renderer.root.findByType('textarea').props.value,'SYNTHETIC independent unsent feedback draft');assert.equal(clears,0);assert.equal(redirects,0);};
  for(const expected of [2,3]){clock+=16000;await act(async()=>{browser.dispatchEvent(new Event('focus'));doc.dispatchEvent(new Event('visibilitychange'));await settle();});assert.equal(requests,expected,'one focus/visibility burst produces one session read');assertRetained();}
  const denied=await browser.fetch('/api/record-denied');assert.equal(denied.status,403);assertRetained();
  const late=browser.fetch('/api/context-late');assert.equal(typeof resolveLate,'function');
  await assert.rejects(browser.fetch('/api/confirmed-wrong-principal'),/workspace changed/);assert.equal(clears,1);assert.equal(redirects,0);assert.ok(nodes.some(node=>node.textContent==='Minamo — session changed'));const reload=nodes.find(node=>node.textContent==='Reload workspace');assert.equal(reload.focused,true);reload.onclick();assert.equal(redirects,1);
  resolveLate(Response.json({private:'must never be admitted after the fence'},{headers:{'X-Minamo-Principal':scope,'X-Minamo-Generation':generation}}));
  await assert.rejects(late,/session ended/,'an old in-flight response cannot repopulate the fenced workspace');
 }finally{if(renderer)await act(async()=>renderer.unmount());Date.now=previousNow;for(const key of names){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});
