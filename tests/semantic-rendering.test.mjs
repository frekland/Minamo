import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {semanticReadingAdapter} from './app/semantic-reading.tsx';export function render(part){return renderToStaticMarkup(semanticReadingAdapter({part,sectionId:'source',article:{},common:{'data-reading-part':part.id,'data-section-id':'source'},renderRange:(start,end)=>part.text.slice(start,end)})??React.createElement('p',null,part.text));}`,resolveDir:process.cwd(),loader:'tsx'},loader:{'.css':'empty'},bundle:true,packages:'external',platform:'node',format:'esm',write:false});
mkdirSync('.sites-runtime',{recursive:true});const modulePath=process.cwd()+'/.sites-runtime/semantic-rendering-'+process.pid+'.mjs';writeFileSync(modulePath,built.outputFiles[0].text);const ui=await import(pathToFileURL(modulePath).href);rmSync(modulePath);
test('native ruby SSR maps only original Unicode base spans; reading metadata stays outside capture ranges',()=>{
 const language={version:1,text:'😀日本語かな',language:'ja',direction:'ltr',spans:[{start:2,end:5,base:'日本語',reading:'にほんご<script>',origin:'author-verified'}]},part={id:'ja',kind:'paragraph',text:language.text,semantic:{contract:'minamo.semantic.v1',kind:'ruby',language}};
 const html=ui.render(part);assert.match(html,/<ruby>/);assert.match(html,/data-canonical-start="0" data-canonical-end="2">😀/);assert.match(html,/data-canonical-start="2" data-canonical-end="5">日本語/);assert.match(html,/data-canonical-start="5" data-canonical-end="7">かな/);assert.match(html,/data-language-decoration="true"/);assert.match(html,/にほんご&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);assert.doesNotMatch(html,/<rt[^>]*data-reading-part/);
 const unavailable=ui.render({...part,unavailable:true});assert.doesNotMatch(unavailable,/<ruby>|にほんご/);
 const stale=ui.render({...part,text:'Changed source'});assert.doesNotMatch(stale,/<ruby>|にほんご/);assert.match(stale,/Changed source/);
});
test('native math SSR retains exact TeX source, gives deliberate typeset control and has no eager rendered equation',()=>{
 const text='\\int_0^1 x^2\\,dx=\\frac{1}{3}',html=ui.render({id:'formula',kind:'code',text,semantic:{contract:'minamo.semantic.v1',kind:'math',expression:{contract:'minamo.math.v1',id:'integral',format:'tex',source:text,display:'block'}}});
 assert.match(html,/Typeset formula/);assert.match(html,/data-reading-part="formula"/);assert.ok(html.includes(text));assert.doesNotMatch(html,/class="katex|<math|<iframe|<script/);
});
