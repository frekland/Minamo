import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Worker} from 'node:worker_threads';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const bundled=await build({entryPoints:['lib/tool-runtime.ts'],bundle:true,platform:'node',format:'esm',write:false});
const runtime=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const source=readFileSync('public/tools/tool-worker.js','utf8');
async function workerRun(engine,input,timeout=2000){
 const loader=`const {parentPort}=require('node:worker_threads');global.self=global;self.postMessage=v=>parentPort.postMessage(v);const init=require(${JSON.stringify(require.resolve('sql.js'))});global.importScripts=()=>{global.initSqlJs=options=>init({...options,locateFile:()=>${JSON.stringify(require.resolve('sql.js/dist/sql-wasm.wasm'))}})};\n${source}\nparentPort.on('message',data=>self.onmessage({data}));`;
 const worker=new Worker(loader,{eval:true});
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{worker.terminate();reject(Error('worker watchdog elapsed'))},timeout);worker.on('message',value=>{clearTimeout(timer);worker.terminate();resolve(value)});worker.on('error',error=>{clearTimeout(timer);worker.terminate();reject(error)});worker.postMessage({engine,input});});
}
test('Unicode offsets distinguish UTF-16, codepoints, UTF-8 and normalization',()=>{
 const result=runtime.inspectUnicode('A😀e\u0301');assert.equal(result.utf16CodeUnits,5);assert.equal(result.codePoints,4);assert.equal(result.utf8Bytes,8);assert.equal(result.NFC,'A😀é');assert.equal(result.points[1].utf16Start,1);assert.equal(result.points[1].utf16Length,2);assert.equal(result.points[2].utf16Start,3);
});
test('bounded Web accepts real event example and rejects script, network and malformed attributes',()=>{
 assert.ok(runtime.validateWeb(runtime.toolExamples.web));
 for(const html of ['<script>alert(1)</script>','<button onclick="alert(1)">Go</button>','<iframe src="https://example.com"></iframe>','<p class=x>bad</p>'])assert.throws(()=>runtime.validateWeb({code:'',html,css:''}));
 for(const css of ['@import "https://example.com/a.css";','body{background:url(https://example.com/a)}'])assert.throws(()=>runtime.validateWeb({code:'',html:'<p>safe</p>',css}));
});
test('actual RegExp worker returns UTF-16 positions and advances empty Unicode matches safely',async()=>{
 let response=await workerRun('regex',{code:'😀',text:'a😀b😀',flags:'gu'});assert.deepEqual(response.result.matches.map(x=>x.utf16Start),[1,4]);
 response=await workerRun('regex',{code:'(?=.)',text:'😀x',flags:'gu'});assert.deepEqual(response.result.matches.map(x=>x.utf16Start),[0,2]);
 response=await workerRun('regex',{code:'(',text:'x',flags:'g'});assert.match(response.error,/regular expression|unterminated/i);
});
test('actual SQL Worker runs real SQLite and reports error with prior rows',async()=>{
 const response=await workerRun('sql',{code:"CREATE TABLE t (v INTEGER); INSERT INTO t VALUES(4),(8); SELECT SUM(v) AS total FROM t;"},10000);
 assert.deepEqual(response.result.rows,[{columns:['total'],values:[[12]]}]);assert.match(response.result.runtime,/SQLite/);
 const failed=await workerRun('sql',{code:'SELECT 2 AS before_error; SELECT * FROM missing;'},10000);assert.match(failed.result.error,/no such table/);assert.equal(failed.result.rows[0].values[0][0],2);
});
test('actual bundled Python package executes Python and Unicode without network asset downloads',async()=>{
 const {loadPyodide}=await import('pyodide');
 const root=require.resolve('pyodide/package.json').replace(/package\.json$/,'');
 const py=await loadPyodide({indexURL:root});
 assert.equal(await py.runPythonAsync('sum([12, 18, 24]) / 3'),18);
 assert.equal(await py.runPythonAsync('len("café".encode("utf-8"))'),5);
});

test('opaque Web preview receives safe canonical theme without changing authored input',()=>{
 const css=runtime.webPreviewThemeCss({'canvas':' #1B1B1B ','interactive':'#8CAED1','text':'</style><script>bad</script>'});assert.match(css,/--mn-canvas:#1B1B1B/);assert.match(css,/--mn-interactive:#8CAED1/);assert.match(css,/--mn-text:#F5F5F5/);assert.doesNotMatch(css,/<|>/);assert.match(css,/outline-offset:3px/);assert.match(css,/color-scheme:dark/);assert.match(css,/forced-colors/);
 const input=structuredClone(runtime.toolExamples.web);runtime.webPreviewThemeCss();assert.deepEqual(runtime.validateWeb(input),{html:input.html,css:input.css});
});
