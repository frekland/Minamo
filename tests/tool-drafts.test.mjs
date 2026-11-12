import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const bundled=await build({entryPoints:['lib/tool-drafts.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {experimentEditorDraft,replaceEditorDraft,validDraftCheckpoint,isToolEngine,isSavedToolRun}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const experiment=(extra={})=>({id:'experiment-test',family:'experiment',title:'A test pattern',body:'Predict first.',engine:'regex',code:'\\b(save|saved)\\b',rev:4,synthetic:true,links:[],createdAt:'2026-10-21T00:00:00Z',updatedAt:'2026-10-21T00:00:00Z',trashedAt:null,actor:'user',...extra});
test('explicit Experiment preparation selects saved engine and exact code without executing it',()=>{
 const source=experiment();const result=experimentEditorDraft(source);assert.equal(result.engine,'regex');assert.equal(result.input.code,source.code);assert.equal(result.source.rev,4);assert.equal(result.synthetic,true);assert.match(result.inputNote,/built-in defaults/);assert.equal(result.input.flags,'giu');
 const python=experimentEditorDraft(experiment({engine:'python',code:'raise RuntimeError("not executed by loading")'}));assert.equal(python.input.code,'raise RuntimeError("not executed by loading")');assert.equal(python.input.stdin,'');
});
test('replacement checkpoint retains complete target-engine draft and restore swaps rather than discards',()=>{
 const previous={code:'my unfinished pattern',text:'actual sample',flags:'gu'},incoming={code:'saved pattern',text:'default sample',flags:'giu'},loaded={id:'prior-experiment',title:'Prior',rev:2,engine:'regex'};
 const first=replaceEditorDraft(previous,incoming,'regex',loaded,false,'2026-10-21T10:00:00Z');
 assert.deepEqual(first.input,incoming);assert.deepEqual(first.checkpoint.input,previous);assert.equal(first.checkpoint.synthetic,false);assert.deepEqual(first.checkpoint.loaded,loaded);assert.equal(validDraftCheckpoint(first.checkpoint),true);
 first.input.code='edited after load';assert.equal(incoming.code,'saved pattern');
 const restore=replaceEditorDraft(first.input,first.checkpoint.input,'regex',undefined,true,'2026-10-21T10:01:00Z');assert.deepEqual(restore.input,previous);assert.equal(restore.checkpoint.input.code,'edited after load');
});
test('Web Experiment admits only explicit bounded HTML/CSS payload with finite handler',()=>{
 const result=experimentEditorDraft(experiment({engine:'web',code:JSON.stringify({html:'<p>Actual HTML</p>',css:'p { color: green; }'})}));assert.equal(result.input.html,'<p>Actual HTML</p>');assert.equal(result.input.css,'p { color: green; }');assert.match(result.inputNote,/finite built-in event handler/);
 for(const code of ['while(true){}',JSON.stringify({html:'<p>safe</p>',css:'',js:'alert(1)'}),JSON.stringify({html:'<script>alert(1)</script>',css:''})])assert.throws(()=>experimentEditorDraft(experiment({engine:'web',code})));
});
test('missing engines/codes and malformed recovered checkpoints are rejected',()=>{
 assert.equal(isToolEngine(['python']),false);assert.equal(isToolEngine({toString:()=> 'python'}),false);
 for(const extra of [{engine:undefined},{engine:['python']},{engine:'shell'},{code:''},{code:'x'.repeat(30001)},{family:'run'}])assert.throws(()=>experimentEditorDraft(experiment(extra)));
 for(const value of [null,{engine:'regex',input:{code:1},synthetic:false,retainedAt:'today'},{engine:'shell',input:{code:'x'},synthetic:false,retainedAt:'today'}])assert.equal(validDraftCheckpoint(value),false);
});

test('only engine-bearing tool Runs can enter the observed-execution editor',()=>{
 const run={family:'run',engine:'python',trashedAt:null};assert.equal(isSavedToolRun(run),true);assert.equal(isSavedToolRun({...run,attempt:{contract:'minamo.attempt.v1'}}),false);assert.equal(isSavedToolRun({...run,engine:undefined}),false);assert.equal(isSavedToolRun({...run,trashedAt:'2026-10-26'}),false);assert.equal(isSavedToolRun({...run,family:'experiment'}),false);
});
