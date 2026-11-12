import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const bundled=await build({entryPoints:['lib/project-canvas.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {validateFrames}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const controller=readFileSync('public/tools/python-isolate.js','utf8');
const runtimeSource=controller.slice(controller.indexOf('function runtime(){'),controller.indexOf("window.addEventListener('message'"));

test('real Python drawing data survives console truncation and retains frame validation',async()=>{
 const {loadPyodide}=await import('pyodide');
 const py=await loadPyodide({indexURL:require.resolve('pyodide/package.json').replace(/package\.json$/,'')});
 const messages=[],self={postMessage:value=>messages.push(value)};
 const context=vm.createContext({self,TextDecoder,Blob,URL,Response,importScripts:()=>{},loadPyodide:async options=>{py.setStdout({batched:options.stdout});py.setStderr({batched:options.stderr});return py;}});
 vm.runInContext(runtimeSource+'runtime();',context);
 const assets=Object.fromEntries(['pyodide.js','pyodide.asm.js','pyodide-lock.json'].map(name=>[name,new TextEncoder().encode(name.endsWith('json')?'{}':'')]));
 await self.onmessage({data:{assets,input:{canvasOutput:true,code:`import json
print('x' * 25000)
_mc_payload=json.dumps([{'duration':33,'commands':[{'op':'text','args':['A'*400,10,20,16,'#ffffff']}]} for _ in range(120)])`}}});
 const result=messages.at(-1).result;
 assert.equal(result.error,null);assert.equal(result.stdout.length,20000);assert.equal(result.truncated,true);
 assert.ok(result.canvasJson.length>39000,'drawing data exceeds both old console limits');
 const frames=validateFrames(JSON.parse(result.canvasJson));assert.equal(frames.length,120);assert.equal(frames[119].commands[0].args[0].length,400);
 assert.throws(()=>validateFrames([{duration:33,commands:[{op:'text',args:['bad',0,0,16,'red']}]}]),/colour/);
 await self.onmessage({data:{assets,input:{canvasOutput:true,code:"_mc_payload='x'*1048577"}}});
 assert.match(messages.at(-1).result.error,/1 MiB/);assert.equal(messages.at(-1).result.canvasJson,undefined);
 await self.onmessage({data:{assets,input:{code:"print('ordinary console')"}}});
 assert.equal(messages.at(-1).result.canvasJson,undefined);
 assert.match(messages.at(-1).result.stdout,/ordinary console/);
});
