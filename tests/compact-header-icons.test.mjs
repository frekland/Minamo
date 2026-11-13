import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import HeaderLearningSpace from './app/header-learning-space.tsx';export const render=value=>renderToStaticMarkup(React.createElement(HeaderLearningSpace,{value,onChange:()=>{}}));export const choose=(value)=>{let selected;const element=HeaderLearningSpace({value,onChange:next=>{selected=next}});element.props.onClick();return selected;};`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'compact-space-icons-')),file=join(dir,'ui.cjs');writeFileSync(file,compiled.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
test('header names the current scope, exposes its next action and places the full label before the icon',()=>{
 const languages=ui.render({learningSpace:'languages',language:'ja'}),computing=ui.render({learningSpace:'computing'});
 for(const html of [languages,computing]){assert.equal((html.match(/<button/g)||[]).length,1);assert.doesNotMatch(html,/<details|<summary|aria-pressed/);}
 assert.match(languages,/aria-label="Languages scope. Switch to Other"/);assert.match(languages,/lucide-languages/);assert.ok(languages.indexOf('Languages<')<languages.indexOf('<svg'));
 assert.match(computing,/aria-label="Computing scope. Switch to Languages"/);assert.match(computing,/lucide-monitor/);assert.ok(computing.indexOf('Computing<')<computing.indexOf('<svg'));
});
test('scope cycling does not carry a language into another scope',()=>{
 assert.deepEqual(ui.choose({learningSpace:'languages',language:'ja'}),{learningSpace:'unclassified'});
 assert.deepEqual(ui.choose({learningSpace:'computing'}),{learningSpace:'languages',language:undefined});
 assert.deepEqual(ui.choose({learningSpace:'all'}),{learningSpace:'computing'});
 assert.deepEqual(ui.choose({learningSpace:'unclassified'}),{learningSpace:'all'});
});
test('owner-provided icon assets retain attribution and only inert vector geometry',()=>{
 for(const [name,creator,count] of [['computing','Taufik-76',1],['languages','tezar tantular',2]]){const svg=readFileSync('public/identity/learning-spaces/'+name+'.svg','utf8');assert.match(svg,new RegExp(creator));assert.match(svg,/Noun Project/);assert.equal((svg.match(/<path /g)||[]).length,count);assert.doesNotMatch(svg,/<script|<foreignObject|<image|\bon\w+=|\bhref=|javascript:/i);assert.match(svg,/fill="currentColor"/);}
});
