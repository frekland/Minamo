import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from'react';import{renderToReadableStream}from'react-dom/server';import Workspace from'./app/workspace';export async function render(props){const stream=await renderToReadableStream(React.createElement(Workspace,props));await stream.allReady;return new Response(stream).text()}`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
test('real Your work and Trash lazy children settle into the organiser on a fresh streamed render',async()=>{
 const record={family:'note',id:'synthetic-loading-note',title:'SYNTHETIC loading check',body:'Independent synthetic writing.',links:[],rev:1,actor:'user',synthetic:true,createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-27T00:00:00Z'};
 for(const view of ['work','trash']){
  const html=await mod.exports.render({initialView:view,initialRecords:[record],authenticated:true,draftScope:'synthetic-loading-owner'});
  assert.match(html,/role="tablist"/);assert.match(html,/Annotations/);assert.match(html,/Attempts &amp; runs/);assert.match(html,/aria-label="Personal work organiser"/);assert.doesNotMatch(html,/Switched to client rendering because the server rendering errored/);
 }
});
