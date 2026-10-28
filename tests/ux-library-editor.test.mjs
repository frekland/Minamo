import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LibraryCatalogueView} from './app/library-browser.tsx';import {RichSectionsEditor} from './app/rich-authoring.tsx';import ReferencePreview from './app/reference-preview.tsx';export {libraryFilterChange,librarySearchFromParams,librarySearchHref} from './app/library-browser.tsx';export {readingEditImpacts,readingEditReviewToken} from './lib/content-edit-preview.ts';export const library=(props)=>renderToStaticMarkup(React.createElement(LibraryCatalogueView,{loading:false,error:'',onChange:()=>{},onOpen:()=>{},onMore:()=>{},onRetry:()=>{},...props}));export const editor=(props)=>renderToStaticMarkup(React.createElement(RichSectionsEditor,{ownerScope:'test',onChange:()=>{},...props}));export const preview=(props)=>renderToStaticMarkup(React.createElement(ReferencePreview,{scope:'test',onClose:()=>{},onOpen:()=>{},onNote:()=>{},...props}));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'ux-library-editor-')),file=join(dir,'ui.cjs');writeFileSync(file,compiled.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
const browse={facet:'areas',kind:'',query:'nc',areaId:'',areaTitle:''};
test('facet and exact-reference filter changes preserve a typed query',()=>{
 assert.deepEqual(ui.libraryFilterChange(browse,'topics'),{facet:'topics',kind:'',query:'nc'});
 assert.deepEqual(ui.libraryFilterChange(browse,'references','shell-command'),{facet:'references',kind:'shell-command',query:'nc'});
 const html=ui.library({browse,page:{items:[]}});assert.match(html,/Search the Library/);assert.doesNotMatch(html,/type above to search the whole Library/);assert.match(html,/Search all Library entries for “nc”/);
});
test('topic and exact-name searches state their distinct scope without changing result semantics',()=>{
 const topics=ui.library({browse:{...browse,facet:'topics'},page:{items:[]}});assert.match(topics,/Search Library articles/);assert.doesNotMatch(topics,/Searching explanation text/);
 const exact=ui.library({browse:{...browse,facet:'references'},page:{items:[]}});assert.match(exact,/Find a name or alias/);assert.doesNotMatch(exact,/Searching reference names and aliases/);assert.match(exact,/Search all Library entries for “nc”/);assert.match(exact,/value="nc"/);
});
test('the exact reading action precedes long reference content and retains the pinned destination',()=>{
 const record={family:'article',id:'source',rendition:'edition-one',rev:2,title:'Exact source',body:'',sections:[{id:'s1',title:'Long reference',parts:[{id:'p1',kind:'paragraph',text:'PREVIEW_BODY_SENTINEL'}]}],links:[]};
 const html=ui.preview({target:{family:'article',id:'source',rendition:'edition-one',sectionId:'s1',partId:'p1'},localRecord:record});
 assert.ok(html.indexOf('Open exact Article')<html.indexOf('PREVIEW_BODY_SENTINEL'));assert.match(html,/rendition=edition-one&amp;section=s1&amp;part=p1/);assert.match(html,/Close reference and return/);
});
const language={contract:'minamo.semantic.v1',kind:'ruby',language:{version:1,text:'今日は読む。',language:'ja',direction:'ltr',spans:[{start:0,end:2,base:'今日',reading:'きょう',origin:'author-verified'}],phrases:[{start:0,end:2,base:'今日',explanation:'Today'}],translation:{text:'Read today.',language:'en',direction:'ltr',provenance:'authored-translation'}}};
const original=[{id:'s1',title:'Source',parts:[{id:'p1',kind:'paragraph',text:'今日は読む。',semantic:language,inline:[{start:2,end:3,kind:'link',url:'https://example.com/explanation'}]}]}];
test('text editing losses are projected exactly and require a separate review before saving',()=>{
 const next=[{id:'s1',title:'Source',parts:[{id:'p1',kind:'paragraph',text:'明日は読む。',inline:[]}]}];
 const impacts=ui.readingEditImpacts(original,next);assert.equal(impacts.length,1);assert.equal(impacts[0].readingsRemoved,1);assert.equal(impacts[0].phrasesRemoved,1);assert.equal(impacts[0].linksRemoved,1);assert.equal(impacts[0].beforeText,'今日は読む。');assert.equal(impacts[0].afterText,'明日は読む。');
 const html=ui.editor({sections:next,originalSections:original});assert.match(html,/Review changes to pronunciation aids/);assert.match(html,/Saved text/);assert.match(html,/New edition/);assert.match(html,/type="checkbox" required=""/);assert.doesNotMatch(html,/type="checkbox"[^>]*checked=/);assert.match(html,/original saved edition stays available/);
 assert.equal(original[0].parts[0].semantic.language.spans[0].reading,'きょう');assert.equal(next[0].parts[0].semantic,undefined);
 const changed=structuredClone(next);changed[0].parts[0].text='昨日は読む。';assert.notEqual(ui.readingEditReviewToken(impacts),ui.readingEditReviewToken(ui.readingEditImpacts(original,changed)));
});
test('unchanged aids and unavailable passages never create a loss warning or expose withheld text',()=>{
 assert.deepEqual(ui.readingEditImpacts(original,structuredClone(original)),[]);
 const hidden=[{id:'s',title:'Restricted',parts:[{id:'p',kind:'paragraph',text:'WITHHELD_SENTINEL',semantic:language,unavailable:true}]}];assert.deepEqual(ui.readingEditImpacts(hidden,[]),[]);
 const html=ui.editor({sections:structuredClone(original),originalSections:original});assert.doesNotMatch(html,/Review changes to pronunciation aids/);
 const deleted=ui.readingEditImpacts(original,[]);assert.equal(deleted[0].afterText,null);assert.equal(deleted[0].readingsRemoved,1);
});

test('an explicit all-Library link retains its query on reload without importing an old subject or record identity',()=>{const href=ui.librarySearchHref('nc');assert.equal(href,'/?view=library&libraryFacet=search&libraryQuery=nc');const next=ui.librarySearchFromParams(new URLSearchParams(href.split('?')[1]),browse);assert.equal(next.facet,'search');assert.equal(next.query,'nc');assert.equal(next.areaId,'');assert.equal(ui.librarySearchFromParams(new URLSearchParams('view=library&libraryFacet=topics&libraryQuery=nc&id=old-record'),browse),browse);assert.equal(ui.librarySearchFromParams(new URLSearchParams('view=library&libraryFacet=topics&libraryQuery=nc'),{...browse,areaId:'old-area'}).areaId,'old-area');});
