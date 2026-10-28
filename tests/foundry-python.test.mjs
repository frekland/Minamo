import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {dependencyClosure,makeScienceManifest,sha256} from '../scripts/foundry-python-assets.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
async function bundle(file){const r=await build({entryPoints:[file],bundle:true,platform:'node',format:'esm',write:false});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
const api=await bundle('lib/foundry/python-results.ts');
const runtime=await bundle('lib/foundry/python-runtime.ts');
const lock=JSON.parse(await readFile('node_modules/pyodide/pyodide-lock.json','utf8'));
const result=()=>({contract:'minamo.python-results.v1',runtime:'Pyodide 0.28.3',stdout:'4\n',stderr:'',error:null,truncated:false,outputs:[]});
test('science resolver orders complete dependency closure and refuses unknown packages/cycles/path escapes',()=>{
 const names=dependencyClosure(lock,['matplotlib','sympy']);assert.ok(names.indexOf('numpy')<names.indexOf('matplotlib'));assert.ok(names.indexOf('mpmath')<names.indexOf('sympy'));assert.equal(names.length,new Set(names).size);assert.throws(()=>dependencyClosure(lock,['micropip']),/allowlist/);
 const bad=structuredClone(lock);bad.packages.numpy.depends=['numpy'];assert.throws(()=>dependencyClosure(bad,['numpy']),/Cyclic/);bad.packages.numpy.depends=[];bad.packages.numpy.file_name='../escape.whl';assert.throws(()=>dependencyClosure(bad,['numpy']),/Untrusted/);
 assert.throws(()=>makeScienceManifest(lock,['numpy'],'0.29.0'),/version mismatch/);
});
test('typed output rejects foreign keys/observed claims/nonfinite/ragged/unbounded data',()=>{
 assert.deepEqual(api.admitPythonResult(result()),result());
 assert.throws(()=>api.admitPythonResult({...result(),observed:true}));
 for(const rows of [[[Infinity]],[[1,2]],Array.from({length:201},()=>[1])])assert.throws(()=>api.admitPythonResult({...result(),outputs:[{kind:'table',label:'t',columns:['x'],rows}]}));
 assert.throws(()=>api.admitPythonResult({...result(),stdout:'x'.repeat(20001)}));
 assert.equal(api.suppliedPythonOutput(result()).provenance,'supplied-output');assert.deepEqual(api.interruptedPythonResult().outputs,[]);
});
test('PNG admission verifies actual signature, header and declared dimensions; rejects SVG and false geometry',()=>{
 const bytes=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);bytes.write('IHDR',12);bytes.writeUInt32BE(32,16);bytes.writeUInt32BE(16,20);const base64=bytes.toString('base64');
 assert.deepEqual(api.decodePngHeader(base64),{bytes:33,width:32,height:16});
 const png={kind:'png',label:'synthetic header fixture, not a decodable PNG',base64,width:32,height:16};assert.equal(api.admitPythonResult({...result(),outputs:[png]}).outputs.length,1);
 assert.throws(()=>api.admitPythonResult({...result(),outputs:[{...png,width:16}]}),/disagree/);assert.throws(()=>api.decodePngHeader(Buffer.from('<svg/>').toString('base64')));bytes.writeUInt32BE(99999,16);assert.throws(()=>api.decodePngHeader(bytes.toString('base64')),/budget/);
});
test('manifest exact budgets prevent path/duplicate/size shape attacks',()=>{
 const m={...makeScienceManifest(lock,['numpy']),lockSha256:'a'.repeat(64),assets:[{file:'a.wasm',sha256:'a'.repeat(64),bytes:20,role:'runtime'}],totalBytes:20};
 assert.equal(runtime.admitScienceManifest(m).totalBytes,20);assert.throws(()=>runtime.admitScienceManifest({...m,assets:[m.assets[0],m.assets[0]],totalBytes:40}));assert.throws(()=>runtime.admitScienceManifest({...m,totalBytes:21}));assert.throws(()=>runtime.admitScienceManifest({...m,assets:[{...m.assets[0],file:'../x'}]}));
});
test('controller retains opaque-origin no-network bootstrap, bounded collection and explicit failure disposal',async()=>{
 const source=await readFile('vendor/foundry-python-isolate.js','utf8');assert.match(source,/event.source!==parent/);assert.match(source,/Network is disabled/);assert.match(source,/worker.terminate\(\)/);assert.match(source,/URL.revokeObjectURL/);assert.match(source,/_plt.close\('all'\)/);assert.match(source,/checkIntegrity:true/);
});
test('actual stream admission stops dishonest/oversized bodies before full allocation',async()=>{
 const value=await runtime.readResponseBounded(new Response('abc'),3);assert.equal(new TextDecoder().decode(value),'abc');
 await assert.rejects(()=>runtime.readResponseBounded(new Response('abcd'),3),/budget/);
 await assert.rejects(()=>runtime.readResponseBounded(new Response('a',{headers:{'Content-Length':'999'}}),3),/budget/);
});

test('collection bombs reject before schema expansion, including sparse outer collections',()=>{const many=[];many.length=100000000;assert.throws(()=>api.admitPythonResult({...result(),outputs:many}),/collection budget/);assert.throws(()=>api.admitPythonResult({...result(),outputs:[{kind:'table',label:'x',columns:['x'],rows:many}]}),/collection budget/);const m={...makeScienceManifest(lock,['numpy']),requested:many};assert.throws(()=>runtime.admitScienceManifest(m),/collection budget/);});
