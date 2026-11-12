import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LibraryCatalogueView,LibrarySearchResults} from './app/library-browser.tsx';export {libraryQueryChange,libraryFilterChange,librarySearchFromParams,librarySearchHref,localLibraryItems,libraryItemDestination} from './app/library-browser.tsx';export const render=props=>renderToStaticMarkup(React.createElement(LibraryCatalogueView,{loading:false,error:'',onChange:()=>{},onOpen:()=>{},onMore:()=>{},onRetry:()=>{},...props}));export const results=items=>renderToStaticMarkup(React.createElement(LibrarySearchResults,{items,onOpen:()=>{}}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'ux-library-search-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
const browse={facet:'areas',kind:'',query:'',areaId:'',areaTitle:''};
test('ordinary Library typing searches all entries while explicit explanation and reference filters retain their scope',()=>{
 for(const query of ['NC','ss','git','"git"'])assert.deepEqual(ui.libraryQueryChange(browse,query),{query,facet:'search',kind:''});
 assert.deepEqual(ui.libraryQueryChange({...browse,facet:'topics',areaId:'networking'},'ss'),{query:'ss'});
 assert.deepEqual(ui.libraryQueryChange({...browse,facet:'references',kind:'shell-command'},'git'),{query:'git'});
 const saved=ui.librarySearchFromParams(new URLSearchParams(ui.librarySearchHref('"git"').split('?')[1]),browse);assert.equal(saved.facet,'search');assert.equal(saved.query,'"git"');
 const filtered=ui.libraryFilterChange(saved,'references','shell-command');assert.equal(filtered.query,'"git"');assert.equal(filtered.kind,'shell-command');
});
test('Library distinguishes loaded match counts, incomplete scans, and truly empty filters',()=>{
 const search={...browse,facet:'search',query:'ss'};
 const pending=ui.render({browse:search,page:{items:[],nextCursor:'next',searchIncomplete:true}});assert.doesNotMatch(pending,/No Library entries match|No references match/);assert.match(pending,/More Library material remains to be searched/);assert.match(pending,/Search more Library material/);
 const empty=ui.render({browse:{...search,facet:'references',kind:'api'},page:{items:[]}});assert.match(empty,/Search all Library entries for “ss”/);assert.match(empty,/Clear search and filters/);assert.match(empty,/0 matches loaded/);assert.match(empty,/APIs/);
 const loading=ui.render({browse:search,page:{items:[]},loading:true});assert.doesNotMatch(loading,/No Library entries match/);assert.match(loading,/aria-busy="true"/);
});
test('canonical match cards expose highlighted evidence and exact independently usable reading links',()=>{
 const match={record:{family:'article',id:'git-guide',rev:1,rendition:'retained-edition'},query:'"git"',matchedTerm:'git',field:'concept-term',kind:'exact-term',excerpt:'git',excerptStart:0,excerptEnd:3,matchStart:0,matchEnd:3,partial:false,complete:true,sectionId:'basics',partId:'first',destination:{family:'article',id:'git-guide',rendition:'retained-edition',sectionId:'basics',partId:'first'},href:'/?view=library&family=article&id=git-guide&rendition=retained-edition&section=basics&part=first'};
 const item={family:'article',id:'git-guide',title:'Version control foundations',rendition:'retained-edition',matchEvidence:match,reference:{id:'git',term:'git',aliases:[],kind:'shell-command',definition:'Track snapshots and inspect changes.',target:{rendition:'retained-edition',sectionId:'basics',partId:'first'}}};
 const html=ui.results([item]);assert.match(html,/<mark>git<\/mark>/);assert.match(html,/Command/);assert.match(html,/Track snapshots/);assert.match(html,/rendition=retained-edition&amp;section=basics&amp;part=first/);assert.match(html,/In Version control foundations/);assert.match(html,/>Open</);assert.deepEqual(ui.libraryItemDestination(item),match.destination);
});
test('ordinary NC, ss, git and quoted git produce visible canonical entries ahead of incidental prose in the local acceptance corpus',()=>{
 const base={rev:1,actor:'gpt',synthetic:true,createdAt:'2026-10-26T10:00:00Z',updatedAt:'2026-10-26T10:00:00Z',trashedAt:null,body:'',links:[],rendition:'test-edition'};
 const records=[{...base,family:'article',id:'a-incidental',title:'Assessment process',body:'Success comes from assessing a concise passage.'},...['nc','ss','git'].map(term=>({...base,family:'article',id:'z-'+term,title:term==='git'?'Version control foundations':'Network tools: '+term,body:'An independent explanation with practical examples.',sections:[{id:'usage',title:'Use '+term,parts:[{id:'example',kind:'paragraph',text:'Inspect '+term+' before choosing an operation.'}]}],concepts:[{id:term,term,aliases:term==='nc'?['netcat']:[],caseSensitive:true,kind:'shell-command',definition:'A source-bound explanation of '+term+'.',sectionId:'usage',partId:'example'}]}))];
 for(const [query,term] of [['NC','nc'],['ss','ss'],['git','git'],['"git"','git']]){
  const items=ui.localLibraryItems(records,{...browse,facet:'search',query});assert.equal(items[0].reference?.term,term,query);assert.ok(!items.some(item=>item.id==='a-incidental'),query);const html=ui.results(items);assert.match(html,new RegExp('<mark>'+term+'<\\/mark>'));assert.match(html,/rendition=test-edition&amp;section=usage&amp;part=example/);
 }
 const flags={...records[1],id:'flags',concepts:[{id:'lower',term:'-a',aliases:[],caseSensitive:true,definition:'Lowercase flag.',sectionId:'usage',partId:'example'}]};assert.equal(ui.localLibraryItems([flags],{...browse,facet:'references',query:'-A'}).length,0);
});
