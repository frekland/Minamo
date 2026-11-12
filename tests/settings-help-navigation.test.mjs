import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Workspace from './app/workspace';import Help,{mcpCapabilities}from'./app/workspace-help';import Settings from './app/presentation-settings';import{defaultPresentation}from'./lib/presentation-preferences';export const header=()=>renderToStaticMarkup(React.createElement(Workspace,{initialRecords:[],initialActivity:[],authenticated:true,draftScope:'TEST-ONLY-settings'}));export const help=()=>renderToStaticMarkup(React.createElement(Help,{onClose:()=>{}}));export const settings=()=>renderToStaticMarkup(React.createElement(Settings,{value:defaultPresentation,onChange:()=>{},onClose:()=>{}}));export{mcpCapabilities};`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'settings-help-')),file=join(dir,'test.cjs');writeFileSync(file,result.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
test('workspace exposes one Settings control and direct primary destinations without recovery scaffolding',()=>{
 const html=ui.header(),header=html.slice(html.indexOf('<header'),html.indexOf('</header>'));
 assert.equal((header.match(/aria-label="Settings"/g)||[]).length,1);
 assert.doesNotMatch(html,/aria-label="Workspace recovery"|Reading and workspace settings|Create checkpoint|Prepare isolated restore/);
 assert.match(header,/aria-label="Top navigation"/);
 for(const [view,label] of [['home','Home'],['journeys','Projects'],['library','Library'],['work','Your work']])assert.match(header,new RegExp('href="/\\?view='+view+'[^" ]*"[^>]*>'+label+'</a>'));
 assert.match(header,/aria-label="Minamo — Home"/);assert.match(header,/minamo-icon.svg/);
});
test('Settings offers meaningful display categories without recovery actions on the appearance tab',()=>{const html=ui.settings();for(const label of ['Settings','Appearance','Colour theme','Interface density','Reading','Languages','Workspace','Data'])assert.ok(html.includes(label),label);assert.match(html,/role="tablist"/);assert.match(html,/role="tabpanel"/);assert.doesNotMatch(html,/<select|Save Changes|checkpoint|restore/i)});
test('Help is a breakdown of supported GPT operations rather than workspace orientation',()=>{const html=ui.help();assert.equal(ui.mcpCapabilities.length,6);for(const section of ui.mcpCapabilities)assert.ok(html.includes(section.title));assert.match(html,/furigana or Pinyin/);assert.doesNotMatch(html,/Choose a layout|Make this space|Choose Computing|Create checkpoint|Foundation diagnostics/)});
