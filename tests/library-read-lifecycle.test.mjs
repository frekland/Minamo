import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),React=require('react'),{create,act}=require('react-test-renderer');
const built=await wr('esbuild').build({stdin:{contents:"export {ServerLibraryIndex,LibraryCatalogueView} from './app/library-browser.tsx';export {LearningSpaceContext} from './app/learning-space-ui.tsx';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},external:['react'],define:{'process.env.NODE_ENV':'"test"'}});
const settle=(ms=25)=>new Promise(resolve=>setTimeout(resolve,ms));
const item=(id,title)=>({family:'article',id,title,rendition:'exact-'+id,destination:{family:'article',id,rendition:'exact-'+id,sectionId:'s',partId:'p'},summary:'Independent canonical summary.'});

test('mounted Library coalesces reads, restores warm entries, retains failed refreshes and fences permission/query/principal changes',async()=>{
 const names=['window','document','fetch','requestAnimationFrame','cancelAnimationFrame','CSS','IS_REACT_ACT_ENVIRONMENT'],previous=Object.fromEntries(names.map(key=>[key,globalThis[key]])),previousNow=Date.now;
 const browser=new EventTarget(),doc=new EventTarget(),reads=[],navigations=[],scrolls=[],focuses=[];let clock=100000,first,second;
 Object.assign(doc,{visibilityState:'visible',getElementById:()=>null,querySelector:selector=>({focus:options=>focuses.push({selector,options})})});
 Object.assign(browser,{location:{search:'?view=library'},scrollY:324,scrollTo:options=>scrolls.push(options),history:{state:null,pushState(value){this.state=value;},replaceState(value){this.state=value;}}});
 Object.assign(globalThis,{window:browser,document:doc,requestAnimationFrame:callback=>setTimeout(callback,0),cancelAnimationFrame:clearTimeout,CSS:{escape:value=>value},IS_REACT_ACT_ENVIRONMENT:true,fetch:(path,options)=>new Promise(resolve=>reads.push({path:String(path),options,resolve}))});Date.now=()=>clock;
 const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const ui=mod.exports;
 const props={draftScope:'TEST-only-library-A',initialFacet:'topics',onNavigate:(...args)=>navigations.push(args)};
 const view=tree=>tree.root.findByType(ui.LibraryCatalogueView).props;
 const render=(next=props,selection={learningSpace:'all'})=>React.createElement(ui.LearningSpaceContext.Provider,{value:selection},React.createElement(ui.ServerLibraryIndex,next));
 const reply=(read,items,status=200,indexEpoch=1,generation='legacy@0')=>read.resolve(Response.json({generation,indexEpoch,items,...(status!==200?{error:'Synthetic refresh temporarily unavailable.'}:{})},{status,headers:{'X-Minamo-Generation':generation}}));
 try{
  await act(async()=>{first=create(render());second=create(render());await settle();});
  // Effects schedule their first page on a zero-delay timer after commit.
  await act(async()=>{await settle();});assert.equal(reads.length,1,'two mounted consumers share the protected page flight');
  await act(async()=>{reply(reads[0],[item('A','SYNTHETIC owner A reading')]);await settle();});assert.equal(view(first).page.items[0].id,'A');assert.equal(view(second).page.items[0].id,'A');
  await act(async()=>view(first).onOpen(view(first).page.items[0]));assert.deepEqual(navigations[0],['library','A',{recordFamily:'article',rendition:'exact-A',sectionId:'s',partId:'p',start:undefined,end:undefined}]);
  assert.ok(!JSON.stringify(browser.history.state).includes('SYNTHETIC owner A reading'),'history stores position and identity, not admitted card bodies');
  await act(async()=>{first.unmount();second.unmount();first=create(render());await settle();});await act(async()=>{await settle();});assert.equal(reads.length,1,'warm reentry reuses an admitted fresh page');assert.equal(view(first).page.items[0].id,'A');
  await act(async()=>{await settle();});assert.deepEqual(scrolls.at(-1),{top:324,behavior:'instant'});assert.deepEqual(focuses.at(-1),{selector:'[data-library-key="article:A:"]',options:{preventScroll:true}},'Back restores the saved row focus without moving the restored scroll position');
  clock+=16000;await act(async()=>{browser.dispatchEvent(new Event('focus'));doc.dispatchEvent(new Event('visibilitychange'));await settle(160);});assert.equal(reads.length,2);assert.equal(view(first).page.items[0].id,'A','background refresh retains the existing row');
  await act(async()=>{reply(reads[1],[],503);await settle();});assert.equal(view(first).page.items[0].id,'A');assert.match(view(first).error,/temporarily unavailable/);
  await act(async()=>{view(first).onRetry();await settle();});await act(async()=>{await settle();});assert.equal(reads.length,3,'explicit Retry bypasses fresh reuse');
  await act(async()=>{browser.dispatchEvent(new CustomEvent('minamo-source-unavailable',{detail:{ownerScope:props.draftScope}}));await settle();});await act(async()=>{await settle();});assert.equal(reads.length,4);assert.deepEqual(view(first).page.items,[],'confirmed permission change clears old projections immediately');
  await act(async()=>{reply(reads[2],[item('revoked','MUST NEVER REAPPEAR')]);await settle();});assert.deepEqual(view(first).page.items,[],'aborted but transport-completed old flight cannot refill the page');
  await act(async()=>{reply(reads[3],[item('fresh','Fresh after permission check')],200,2);await settle();});assert.equal(view(first).page.items[0].id,'fresh');
  await act(async()=>{view(first).onChange({facet:'search',query:'different'},true);await settle();});assert.deepEqual(view(first).page.items,[],'a new query never paints prior query rows');await act(async()=>{await settle(210);});assert.equal(reads.length,5);
  await act(async()=>{first.update(render({...props,draftScope:'TEST-only-library-B'}));await settle();});await act(async()=>{await settle();});assert.equal(reads.length,6);assert.deepEqual(view(first).page.items,[],'principal change does not restore the old admitted page');
  await act(async()=>{reply(reads[4],[item('late-A','MUST NOT CROSS PRINCIPALS')]);reply(reads[5],[item('B','SYNTHETIC owner B reading')]);await settle();});assert.deepEqual(view(first).page.items.map(row=>row.id),['B']);assert.equal(new URL(reads[5].path,'https://local.invalid').searchParams.get('q'),'','old principal query is not restored into a new principal');
  await act(async()=>{first.update(render({...props,draftScope:'TEST-only-library-B'},{learningSpace:'languages',language:'ja'}));await settle();});assert.deepEqual(view(first).page.items,[],'a different learning language never paints the prior selection');await act(async()=>{await settle();});assert.equal(reads.length,7);assert.match(reads[6].path,/learningSpace=languages/);assert.match(reads[6].path,/language=ja/);
  await act(async()=>{first.update(render({...props,draftScope:'TEST-only-library-B:generation:restored@1'},{learningSpace:'languages',language:'ja'}));await settle();});assert.deepEqual(view(first).page.items,[],'a restored generation cannot display its previous generation cache');await act(async()=>{await settle();});assert.equal(reads.length,8);assert.equal(reads[7].options.headers.get('x-minamo-generation'),'restored@1');
  await act(async()=>{reply(reads[6],[item('old-generation','MUST NOT CROSS GENERATIONS')]);reply(reads[7],[item('restored','Current restored generation')],200,3,'restored@1');await settle();});assert.deepEqual(view(first).page.items.map(row=>row.id),['restored']);
  const scrollsAtExit=scrolls.length;await act(async()=>{first.unmount();first=undefined;});await settle();assert.equal(scrolls.length,scrollsAtExit,'a pending restoration frame cannot scroll the next route after Library unmount');
  await act(async()=>{browser.dispatchEvent(new CustomEvent('minamo-source-unavailable',{detail:{ownerScope:'TEST-only-library-B:generation:restored@1'}}));first=create(render({...props,draftScope:'TEST-only-library-B:generation:restored@1'},{learningSpace:'languages',language:'ja'}));await settle();});await act(async()=>{await settle();});assert.equal(reads.length,9);assert.deepEqual(view(first).page.items,[],'permission changes while Library is unmounted invalidate its warm metadata before return');
 }finally{if(first)await act(async()=>first.unmount());await settle();Date.now=previousNow;for(const key of names){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key];}}
});
