import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import HeaderLearningSpace from './app/header-learning-space.tsx';export const render=value=>renderToStaticMarkup(React.createElement(HeaderLearningSpace,{value,onChange:()=>{}}));export const choose=(value)=>{let selected;const element=HeaderLearningSpace({value,onChange:next=>{selected=next}});element.props.children[0].props.onClick();return selected;};`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'compact-space-icons-')),file=join(dir,'ui.cjs');writeFileSync(file,compiled.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
test('header exposes one current-space line icon that names its next action',()=>{
 const languages=ui.render({learningSpace:'languages',language:'ja'}),computing=ui.render({learningSpace:'computing'});
 for(const html of [languages,computing]){assert.equal((html.match(/<button/g)||[]).length,1);assert.match(html,/aria-label="Learning space"/);assert.doesNotMatch(html,/<details|<summary|aria-pressed/);}
 assert.match(languages,/aria-label="Japanese. Switch to Computing"/);assert.match(languages,/lucide-languages/);assert.match(languages,/<select aria-label="Learning space and study language"/);assert.match(languages,/<option value="languages:ja" selected="">Languages · Japanese/);assert.match(computing,/aria-label="Computing. Switch to Languages"/);assert.match(computing,/lucide-monitor/);
});
test('single toggle switches scope without carrying an incompatible language',()=>{
 assert.deepEqual(ui.choose({learningSpace:'languages',language:'ja'}),{learningSpace:'computing'});
 assert.deepEqual(ui.choose({learningSpace:'computing'}),{learningSpace:'languages'});
 assert.deepEqual(ui.choose({learningSpace:'all'}),{learningSpace:'languages'});
 assert.deepEqual(ui.choose({learningSpace:'unclassified'}),{learningSpace:'languages'});
});
test('public learning-space icons contain only inert local vector geometry',()=>{
 for(const name of ['computing','languages']){const svg=readFileSync('public/identity/learning-spaces/'+name+'.svg','utf8');assert.match(svg,/<svg /);assert.match(svg,/stroke="currentColor"/);assert.doesNotMatch(svg,/<script|<foreignObject|<image|\bon\w+=|\bhref=|javascript:/i);}
});
