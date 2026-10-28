import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Workspace from './app/workspace.tsx';import {LibraryCatalogueView} from './app/library-browser.tsx';import {LearningSpaceContext} from './app/learning-space-ui.tsx';export const render=props=>renderToStaticMarkup(React.createElement(Workspace,props));export const references=selection=>renderToStaticMarkup(React.createElement(LearningSpaceContext.Provider,{value:selection},React.createElement(LibraryCatalogueView,{browse:{facet:'references',kind:'',query:'',areaId:'',areaTitle:''},page:{items:[]},loading:false,error:'',onChange:()=>{},onOpen:()=>{},onMore:()=>{},onRetry:()=>{}})));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"','import.meta.env.DEV':'false'}});
const dir=mkdtempSync(join(tmpdir(),'learning-spaces-workspace-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const api=require(file);rmSync(dir,{recursive:true,force:true});
const record=(id,title,learningScope)=>({id,family:'journey',title,body:'Original TEST ONLY route.',rev:1,updatedAt:'2026-10-26T10:00:00.000Z',actor:'gpt',synthetic:true,links:[],rendition:'r-'+id,...(learningScope?{learningScope}:{})});
const computing={version:1,spaces:['computing'],provenance:'authored'},japanese={version:1,spaces:['languages'],languages:['ja'],provenance:'authored'};
const records=[record('computing','TEST ONLY scoped Bash route',computing),record('japanese','TEST ONLY scoped Japanese route',japanese),record('legacy','TEST ONLY unclassified route')];
const render=(selection,extra={})=>api.render({initialRecords:records,authenticated:true,draftScope:'TEST-ONLY-scope-SSR',initialView:'journeys',initialLearningScope:selection,...extra});
test('newly compiled Workspace SSR respects exact server scope and copied navigation semantics',()=>{
 const html=render({learningSpace:'computing'});assert.ok(html.includes('TEST ONLY scoped Bash route'));assert.ok(!html.includes('TEST ONLY scoped Japanese route'));assert.ok(!html.includes('TEST ONLY unclassified route'));assert.match(html,/view=journeys&amp;learningSpace=computing/);assert.match(html,/aria-label="Learning space"/);
 const ja=render({learningSpace:'languages',language:'ja'});assert.ok(ja.includes('TEST ONLY scoped Japanese route'));assert.ok(!ja.includes('TEST ONLY scoped Bash route'));assert.match(ja,/language=ja/);
 const all=render({learningSpace:'all'});for(const row of records)assert.ok(all.includes(row.title));
});
test('copied cross-space reading withholds foreign title and prose while retaining exact target identity',()=>{
 const html=render({learningSpace:'languages',language:'ja'},{initialId:'computing',initialFamily:'journey'});assert.doesNotMatch(html,/TEST ONLY scoped Bash route|Original TEST ONLY route/);assert.match(html,/This material belongs to another learning space/);assert.match(html,/return to this space’s Home/);assert.match(html,/aria-label="Japanese. Switch to Computing"/);
 // Selecting the correct space exposes the unchanged original canonical reading.
 const correct=render({learningSpace:'computing'},{initialId:'computing',initialFamily:'journey'});assert.match(correct,/TEST ONLY scoped Bash route/);assert.match(correct,/Original TEST ONLY route/);
});
test('Languages Library presents language reference controls without computing command shortcuts',()=>{
 const html=render({learningSpace:'languages',language:'ja'},{initialView:'library'});assert.match(html,/aria-label="Show Library entries"/);assert.match(html,/<option value="references">Reference entries<\/option>/);assert.doesNotMatch(html,/>Commands<\/button>/);assert.doesNotMatch(html,/>Functions &amp; APIs<\/button>/);
 const references=api.references({learningSpace:'languages',language:'ja'});assert.match(references,/aria-label="Reference kind"/);assert.match(references,/<option value="language-syntax">Language syntax<\/option>/);assert.doesNotMatch(references,/<option value="(?:shell-command|functions|python-function|api)"/);
 const computingReferences=api.references({learningSpace:'computing'});assert.match(computingReferences,/<option value="shell-command">Commands<\/option>/);assert.match(computingReferences,/<option value="functions">Functions &amp; APIs<\/option>/);
});
