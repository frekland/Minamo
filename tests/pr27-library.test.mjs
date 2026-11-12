import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LibraryCatalogueView} from './app/library-browser.tsx';export {restoreLibraryEntry,libraryItemDestination,libraryDestinationHref,areaHubModel,localLibraryItems} from './app/library-browser.tsx';export const render=(props)=>renderToStaticMarkup(React.createElement(LibraryCatalogueView,{loading:false,error:'',onChange:()=>{},onOpen:()=>{},onMore:()=>{},onRetry:()=>{},...props}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'pr27-library-')),path=join(dir,'ui.cjs');writeFileSync(path,built.outputFiles[0].text);const ui=require(path);rmSync(dir,{recursive:true,force:true});
const stamp='2026-10-24T01:00:00Z';
const base={rev:1,actor:'gpt',synthetic:true,createdAt:stamp,updatedAt:stamp,trashedAt:null,body:'',links:[],rendition:'test-edition'};
const article={...base,id:'returns',family:'article',title:'Returned values',links:[{family:'area',id:'values'}],sections:[{id:'s1',title:'The returned value',parts:[{id:'p1',kind:'paragraph',text:'A return supplies a value to the caller; printing is a separate effect.'}]}]};
const area={...base,id:'values',family:'area',title:'Working with values',body:'Follow a value through an expression and a call.',links:[{family:'article',id:article.id,sourceContext:{sectionId:'calls'},rendition:article.rendition,sectionId:'s1',partId:'p1',reason:'Trace the value the caller receives.'}],sections:[{id:'calls',title:'Follow a function call',parts:[{id:'group-intro',kind:'paragraph',text:'Inspect the boundary before building a larger interface.'},{id:'restricted',kind:'excerpt',text:'WITHHELD_SOURCE_CANARY',unavailable:true}]}]};
const browse={facet:'topics',kind:'',query:'',areaId:area.id,areaTitle:area.title};
test('curated Area overview and independent member results retain different roles and exact links',()=>{
 const model=ui.areaHubModel(area,[article]);assert.equal(model.groups[0].links[0].title,article.title);assert.equal(model.groups[0].links[0].link.partId,'p1');assert.doesNotMatch(JSON.stringify(model),/WITHHELD_SOURCE_CANARY/);
 const members=ui.localLibraryItems([area,article],browse);assert.equal(members.length,1);const html=ui.render({browse,page:{items:members,nextCursor:'next-eligible-page'},areaRecord:area,records:[article],onPreview:()=>{}});
 assert.match(html,/Subject overview/);assert.match(html,/Follow a function call/);assert.match(html,/Trace the value the caller receives/);assert.match(html,/Follow a function call articles/);assert.match(html,/More articles/);assert.match(html,/>Preview</);assert.match(html,/rendition=test-edition&amp;section=s1&amp;part=p1/);assert.doesNotMatch(html,/WITHHELD_SOURCE_CANARY|data-reading-part|id="section-/);
 const unclassified={...article,id:'curated-only',links:[]};const contextualArea={...area,links:[{family:'article',id:unclassified.id,sourceContext:{sectionId:'calls'}}]};assert.equal(ui.localLibraryItems([contextualArea,unclassified],browse).length,0);assert.equal(ui.areaHubModel(contextualArea,[unclassified]).groups.length,1);
});
test('a topic match opens its exact prose destination and retains a real full-reading link',()=>{
 const item={family:'article',id:'returns',title:'Returned values',rendition:'whole-edition',destination:{family:'article',id:'returns',rendition:'match-edition',sectionId:'s2',partId:'failure'}};
 assert.deepEqual(ui.libraryItemDestination(item),item.destination);const html=ui.render({browse,page:{items:[item]},onPreview:()=>{}});assert.match(html,/href="\/\?view=library&amp;family=article&amp;id=returns&amp;rendition=match-edition&amp;section=s2&amp;part=failure&amp;learningSpace=all(?:&amp;returnLibrary=[^"]*)?"/);assert.match(html,/>Open</);assert.match(html,/>Preview</);
});
test('browse history belongs to its owner/generation and primary subject, never a global last-open subject',()=>{
 const defaults={...browse,query:''},saved={scope:'owner:g1',browse:{...browse,query:'missing return',facet:'references',kind:'language-syntax'},scrollTop:738,pages:4};assert.deepEqual(ui.restoreLibraryEntry(saved,'owner:g1',defaults),saved);
 assert.deepEqual(ui.restoreLibraryEntry(saved,'other:g1',defaults),{scope:'other:g1',browse:defaults,scrollTop:0,pages:1});assert.equal(ui.restoreLibraryEntry(saved,'owner:g2',defaults).browse.query,'');assert.equal(ui.restoreLibraryEntry(saved,'owner:g1',{...defaults,areaId:''}).browse.areaId,'');
 const corrupted=ui.restoreLibraryEntry({...saved,pages:900,scrollTop:NaN,browse:{...saved.browse,query:'x'.repeat(201),kind:'unsupported'}},'owner:g1',defaults);assert.equal(corrupted.pages,20);assert.equal(corrupted.scrollTop,0);assert.equal(corrupted.browse.query,'');assert.equal(corrupted.browse.kind,'');
});
test('Library offers three primary views and reachable exact command/function/concept filters without flattening content',()=>{
 const root={facet:'areas',kind:'',query:'',areaId:'',areaTitle:''},html=ui.render({browse:root,page:{items:ui.localLibraryItems([area,article],root)}});assert.match(html,/>Subjects</);assert.match(html,/>Articles</);assert.match(html,/>Reference entries</);assert.match(html,/Show Library entries/);assert.doesNotMatch(html,/The returned value|A return supplies/);
 const refs=ui.render({browse:{...root,facet:'references'},page:{items:[]}});assert.match(refs,/aria-label="Reference kind"/);assert.match(refs,/Language syntax/);assert.doesNotMatch(refs,/including meaningful case and punctuation/);assert.match(refs,/Find a name or alias/);
});
test('manuscript-style empty body cards use eligible canonical prose with excerpt provenance',()=>{
 const items=ui.localLibraryItems([area,article],browse);assert.equal(items[0].summaryOrigin,'canonical-excerpt');assert.match(items[0].summary,/return supplies a value/);const html=ui.render({browse,page:{items}});assert.match(html,/data-summary-origin="canonical-excerpt"/);
});
