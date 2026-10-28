import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:'import React from "react";import {renderToStaticMarkup} from "react-dom/server";import {ProposedReading} from "./app/authoring-preview.tsx";export const render=record=>renderToStaticMarkup(React.createElement(ProposedReading,{record}));',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'v2-authoring-preview-')),entry=join(dir,'preview.cjs');writeFileSync(entry,compiled.outputFiles[0].text);const {render}=require(entry);rmSync(dir,{recursive:true,force:true});
test('proposed Article uses shared safe blocks without persistent capture or saved-edition controls',()=>{
 const record={id:'proposal',family:'article',title:'An unsaved topic',body:'Original illustrative explanation.',rendition:'must-not-be-a-retained-edition',links:[{family:'article',id:'other-proposal',sectionId:'explanation',reason:'Proposed link only.'}],sections:[{id:'s',title:'Inspect this example',parts:[{id:'code',kind:'code',language:'python',text:'print("<not markup>")'},{id:'reference',kind:'reference',text:'Link-only primary reference.',reference:{url:'https://docs.python.org/3/',label:'Python documentation',rights:'link-only'}}]}],rev:1,createdAt:'',updatedAt:'',trashedAt:null,actor:'gpt',synthetic:true};
 const html=render(record);assert.match(html,/Proposed article/);assert.match(html,/not saved/);assert.match(html,/Copy original code/);assert.match(html,/&lt;not markup&gt;/);assert.match(html,/Link only/);assert.match(html,/Proposed destination/);assert.doesNotMatch(html,/must-not-be-a-retained-edition|Capture this|Annotate|Discuss with GPT|Save annotation|Set Flag|href="\/\?/);
 const source=readFileSync('app/authoring-preview.tsx','utf8');assert.doesNotMatch(source,/\/api\/authoring\/apply/);assert.match(source,/detail:true/);assert.match(source,/localStorage\.setItem/);
});
