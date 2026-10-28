import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Worker} from 'node:worker_threads';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const b=await build({entryPoints:['lib/foundry/python-results.ts'],bundle:true,platform:'node',format:'esm',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));
let staged=true;try{await access('public/runtime/foundry-python/manifest.json');}catch{staged=false;}
async function runController(code,{packages=['numpy','matplotlib'],timeout=20000}={}){
 const source=await readFile('vendor/foundry-python-isolate.js','utf8'),part=source.slice(source.indexOf('function scienceWorker()'),source.indexOf("window.addEventListener"));
 const core=dirname(require.resolve('pyodide/package.json'))+'/',cache=resolve('public/runtime/foundry-python');
 const bootstrap=part.replace("loadScript('pyodide.asm.js');loadScript('pyodide.js');",'').replace('indexURL:runtimeURL,','indexURL:'+JSON.stringify(core)+',packageCacheDir:'+JSON.stringify(cache)+',');
 const workerCode=`const {parentPort}=require('node:worker_threads');global.self=global;self.postMessage=data=>parentPort.postMessage(data);const {loadPyodide}=await import(${JSON.stringify(pathToFileURL(require.resolve('pyodide/pyodide.mjs')).href)});global.loadPyodide=loadPyodide;${bootstrap};scienceWorker();parentPort.on('message',data=>self.onmessage({data}));`;
 const worker=new Worker('(async()=>{'+workerCode+'})()',{eval:true});
 const lock=await readFile(cache+'/pyodide-lock.json');
 return new Promise((resolve,reject)=>{let closed=false;const finish=(value,error)=>{if(closed)return;closed=true;clearTimeout(timer);worker.terminate();error?reject(error):resolve(value);};const timer=setTimeout(()=>finish({interrupted:true}),timeout);worker.on('error',e=>finish(null,e));worker.on('message',data=>{if(!data.phase)finish(data);});worker.postMessage({assets:{'pyodide-lock.json':lock.buffer.slice(lock.byteOffset,lock.byteOffset+lock.byteLength)},packages,code});});
}
test('actual shared controller computes PNG+table and keeps error output partial; next fresh run cannot inherit it',{skip:!staged,timeout:60000},async()=>{
 const code="import matplotlib\nmatplotlib.use('agg')\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(2,1),dpi=100)\nplt.plot([0,1],[0,1])\n_minamo_emit_table('points',['x','y'],[[0,0],[1,1]])\nprint('before-error')\nraise ValueError('synthetic failure')";
 const r=await runController(code);const admitted=api.admitPythonResult(r.result);assert.match(admitted.error,/synthetic failure/);assert.equal(admitted.outputs.length,2);assert.equal(admitted.outputs[1].kind,'png');assert.equal(admitted.outputs[1].width,200);assert.equal(admitted.outputs[1].height,100);assert.match(admitted.stdout,/before-error/);
 const next=api.admitPythonResult((await runController("print('fresh')",{packages:['numpy']})).result);assert.deepEqual(next.outputs,[]);assert.equal(next.error,null);assert.equal(next.stdout,'fresh\n');
});
test('actual shared controller blocks deceptive low-dpi huge raster before savefig',{skip:!staged,timeout:40000},async()=>{
 const r=await runController("import matplotlib\nmatplotlib.use('agg')\nimport matplotlib.pyplot as plt\nplt.figure(figsize=(100,100),dpi=1)\nplt.plot([0,1],[0,1])");const admitted=api.admitPythonResult(r.result);assert.match(admitted.error,/raster budget/);assert.deepEqual(admitted.outputs,[]);
});
test('actual isolated Node worker infinite loop is terminated by parent watchdog',{skip:!staged,timeout:20000},async()=>{
 const r=await runController('while True: pass',{packages:['numpy'],timeout:5000});assert.deepEqual(r,{interrupted:true});
});
