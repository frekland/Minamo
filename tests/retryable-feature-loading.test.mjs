import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React,{Suspense}from'react';import{renderToReadableStream}from'react-dom/server';import{retryableFeature}from'./app/retryable-feature';
export async function run(){let loads=0;const Feature=retryableFeature(async()=>{if(++loads>4)throw Error('Lazy identity recreated during suspense');await new Promise(resolve=>setTimeout(resolve,1));return{default:({name})=>React.createElement('strong',null,name+' ready')}},'Your work');const stream=await renderToReadableStream(React.createElement(Suspense,{fallback:'Loading your work'},React.createElement(Feature,{name:'Organiser'})),{onError(){}});await stream.allReady;const html=await new Response(stream).text();return{html,loads}}`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false});
const module={exports:{}};new Function('require','module','exports',compiled.outputFiles[0].text)(require,module,module.exports);
test('first lazy load settles after Suspense retry instead of recreating the loader forever',async()=>{
 const result=await module.exports.run();assert.equal(result.loads,1);assert.match(result.html,/Organiser ready/);assert.doesNotMatch(result.html,/Lazy identity recreated/);
});
