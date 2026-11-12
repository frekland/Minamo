import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';export {readWorkbenchFiles,retainWorkbenchFiles,readWorkbenchView} from './app/interface-workbench-state';import {InterfaceWorkbench} from './app/interface-workbench';export function render(props){return renderToStaticMarkup(React.createElement(InterfaceWorkbench,{...props,blocks:Object.fromEntries(Object.entries(props.blocks).map(([key,text])=>[key,React.createElement('p',null,text)])),evidence:React.createElement('p',null,'SUPPLIED ATTEMPT ONLY')}));}`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}'}});
const dir=mkdtempSync(join(tmpdir(),'interface-workbench-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
const activity={contract:'minamo.activity.v1',template:'debugging',intent:'Original synthetic source inspection.',authorship:'original-exercise',blocks:[{id:'task',kind:'instruction',text:'ORIGINAL TASK'},{id:'files',kind:'source-browser',bundle:{}},{id:'hints',kind:'hint-ladder',hints:[{id:'h1',tier:'concept',text:''}]}]};
const props={activity,eligible:true,blocks:{task:'ORIGINAL TASK',files:'EXACT SOURCE <script> inert',hints:'REVEALED HINT CONTENT'}};
test('one-content initial workbench uses exact source and unmounts inactive hint/evidence content',()=>{
 const html=ui.render(props);assert.match(html,/data-if-primary="source"/);assert.match(html,/EXACT SOURCE &lt;script&gt;/);assert.doesNotMatch(html,/REVEALED HINT CONTENT|SUPPLIED ATTEMPT ONLY|<script/);assert.equal((html.match(/EXACT SOURCE/g)||[]).length,1);assert.match(html,/role="tablist" aria-label="Activity sections"/);assert.match(html,/role="tab"[^>]*aria-selected="true"[^>]*tabindex="0"/);assert.match(html,/data-if-pane="guidance"[^>]*|hidden=""/);assert.doesNotMatch(html,/Compare working layouts/,'Dev experimentation controls must be excluded in production.');
});
test('denied workbench mounts no trusted block or source content, actions or personal attempt',()=>{
 const html=ui.render({...props,eligible:false});assert.match(html,/source is unavailable/);assert.doesNotMatch(html,/EXACT SOURCE|ORIGINAL TASK|REVEALED HINT|SUPPLIED ATTEMPT|role="tab"|Open Notes/);
});
test('unsupported recipe preserves accessible source with an explicit status and no recipe HTML execution',()=>{
 const html=ui.render({...props,recipe:{contract:'newer',html:'<iframe src=x>'}});assert.match(html,/presentation is unsupported/);assert.match(html,/EXACT SOURCE &lt;script&gt;/);assert.doesNotMatch(html,/<iframe|src=x/);
});
test('newer unknown Activity kind degrades without crashing or inventing a renderer',()=>{
 const html=ui.render({...props,activity:{...activity,blocks:[{id:'future',kind:'future-canvas'}]},blocks:{future:'AVAILABLE CANONICAL FALLBACK'}});assert.match(html,/needs a newer presentation interface/);assert.match(html,/AVAILABLE CANONICAL FALLBACK/);assert.doesNotMatch(html,/<canvas|<iframe/);
});
test('device-local file choice is per block, Unicode exact, bounded and prototype-safe',()=>{
 const first=ui.retainWorkbenchFiles({},'source-a','a/日本語😀.py'),second=ui.retainWorkbenchFiles(first,'source-b','b/日本語😀.py');assert.equal(second['source-a'],'a/日本語😀.py');assert.equal(second['source-b'],'b/日本語😀.py');assert.deepEqual(ui.readWorkbenchFiles(JSON.stringify(second)),second);assert.deepEqual(ui.readWorkbenchFiles('not json'),{});assert.deepEqual(ui.readWorkbenchFiles(JSON.stringify({source:'x'.repeat(301),bad:'\ud83d'})),{});const protectedObject=ui.readWorkbenchFiles('{"__proto__":{"polluted":true},"constructor":"original.txt"}');assert.equal({}.polluted,undefined);assert.equal(Object.getPrototypeOf(protectedObject),Object.prototype);assert.equal(protectedObject.constructor,'original.txt');
});

test('pane return state contains presentation only, rejects unknown slots and broken storage',()=>{assert.deepEqual(ui.readWorkbenchView('{\"selected\":\"evidence\",\"expanded\":true,\"source\":\"ignored\"}'),{selected:'evidence',expanded:true});assert.deepEqual(ui.readWorkbenchView('{\"selected\":\"remote-component\",\"expanded\":\"true\"}'),{selected:null,expanded:false});assert.deepEqual(ui.readWorkbenchView('broken'),{selected:null,expanded:false});});
