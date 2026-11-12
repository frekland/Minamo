import {admitPythonResult,interruptedPythonResult,type PythonLabRun} from './python-results';
import {z} from 'zod';
import {foundryDigest} from './digest';
import {clientId} from '../client-id';
const assetSchema=z.object({file:z.string().regex(/^[A-Za-z0-9_+.-]+$/),sha256:z.string().regex(/^[a-f0-9]{64}$/),bytes:z.number().int().positive().max(60*1024*1024),role:z.enum(['runtime','lock','package'])}).strict();
const manifestSchema=z.object({contract:z.literal('minamo.python-assets.v1'),runtime:z.object({engine:z.literal('pyodide'),version:z.literal('0.28.3'),abi:z.string(),python:z.string()}).strict(),requested:z.array(z.string().max(80)).max(6),packages:z.array(z.object({name:z.string(),version:z.string(),file:z.string(),sha256:z.string(),dependencies:z.array(z.string().max(80)).max(40)}).strict()).max(40),source:z.literal('https://cdn.jsdelivr.net/pyodide/v0.28.3/full/'),lockSha256:z.string(),assets:z.array(assetSchema).max(40),totalBytes:z.number().int().positive().max(180*1024*1024)}).strict();
const approvedRoots=['numpy','matplotlib','sympy','pandas','pillow','scipy'];
export async function digestBytes(bytes:Uint8Array){return foundryDigest(bytes);}
export function admitScienceManifest(value:unknown){if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid offline manifest');const raw=value as Record<string,unknown>;if(!Array.isArray(raw.requested)||raw.requested.length>6||!Array.isArray(raw.packages)||raw.packages.length>40||!Array.isArray(raw.assets)||raw.assets.length>40||raw.packages.some(p=>!p||typeof p!=='object'||!Array.isArray(p.dependencies)||p.dependencies.length>40))throw Error('Manifest collection budget exceeded');const m=manifestSchema.parse(value);if(m.requested.some(n=>!approvedRoots.includes(n))||new Set(m.assets.map(a=>a.file)).size!==m.assets.length||m.assets.some(a=>a.file.includes('..'))||m.assets.reduce((n,a)=>n+a.bytes,0)!==m.totalBytes)throw Error('Invalid offline asset manifest');return m;}
export async function readResponseBounded(response:Response,maxBytes:number){
 const declared=response.headers.get('Content-Length');if(declared!==null&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw Error('Response exceeds byte budget');
 if(!response.body)throw Error('Response body unavailable');const reader=response.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maxBytes)throw Error('Response exceeds byte budget');chunks.push(value);}}catch(e){await reader.cancel();throw e;}finally{reader.releaseLock();}
 const merged=new Uint8Array(size);let offset=0;for(const chunk of chunks){merged.set(chunk,offset);offset+=chunk.length;}return merged;
}
export async function loadScienceAssets(packages:string[]=approvedRoots,signal?:AbortSignal){
 const path='/runtime/foundry-python/',r=await fetch(path+'manifest.json',{signal,credentials:'same-origin'});if(!r.ok)throw Error('Offline scientific assets unavailable. Run the explicit build-time staging task.');
 const manifest=admitScienceManifest(JSON.parse(new TextDecoder().decode(await readResponseBounded(r,50000)))),assets:Record<string,ArrayBuffer>={};
 const selected=new Set<string>(),byName=new Map(manifest.packages.map(p=>[p.name,p]));
 const visit=(name:string)=>{if(selected.has(name))return;const p=byName.get(name);if(!p)throw Error('Unstaged package dependency: '+name);selected.add(name);for(const dep of p.dependencies)visit(dep);};
 for(const name of packages){if(!manifest.requested.includes(name))throw Error('Requested package was not staged');visit(name);}
 const files=new Set([...selected].map(name=>byName.get(name)!.file));
 for(const item of manifest.assets.filter(a=>a.role!=='package'||files.has(a.file))){const response=await fetch(path+item.file,{signal,credentials:'same-origin'});if(!response.ok)throw Error('Missing science asset: '+item.file);const bytes=await readResponseBounded(response,item.bytes);if(bytes.byteLength!==item.bytes||await digestBytes(bytes)!==item.sha256)throw Error('Science asset integrity mismatch: '+item.file);assets[item.file]=bytes.buffer as ArrayBuffer;}
 const ctrl=await fetch('/foundry-python-isolate.js',{signal,credentials:'same-origin'});if(!ctrl.ok)throw Error('Trusted science controller unavailable');
 return {manifest,assets,controller:new TextDecoder().decode(await readResponseBounded(ctrl,50000))};
}
/** Deliberate lab execution only; no persistence, record identity, or production Run authority. */
export async function executeScientificPython(code:string,packages:string[],options:{signal?:AbortSignal;onPhase?:(text:string)=>void}={}):Promise<PythonLabRun>{
 if(typeof window==='undefined')throw Error('Scientific execution requires a browser');
 if(Array.from(code).some(c=>{const n=c.codePointAt(0)!;return n>=0xd800&&n<=0xdfff;})||code.length>30000||!packages.length||packages.length>6||packages.some(p=>!approvedRoots.includes(p)))throw Error('Invalid captured science input');
 const began=performance.now(),runId=clientId(),capturedCode=code,inputSha256=await digestBytes(new TextEncoder().encode(code));
 options.onPhase?.('Verifying pinned local scientific assets');
 const {manifest,assets,controller}=await loadScienceAssets(packages,options.signal);
 if(packages.some(p=>!manifest.requested.includes(p)))throw Error('Requested package was not staged');
 const frame=document.createElement('iframe');frame.sandbox.add('allow-scripts');frame.hidden=true;frame.title='Isolated scientific Python';
 return new Promise((resolve,reject)=>{
  let done=false,sent=false;const token=clientId();
  const finish=(result:ReturnType<typeof admitPythonResult>,status:PythonLabRun['status'])=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',receive);options.signal?.removeEventListener('abort',cancel);frame.remove();resolve({contract:'minamo.python-lab-run.v1',runId,status,capturedCode,inputSha256,observedAt:new Date().toISOString(),durationMs:performance.now()-began,provenance:'local-lab-execution',result});};
  const cancel=()=>finish(interruptedPythonResult(),'interrupted');
  const timer=setTimeout(()=>finish(interruptedPythonResult('Scientific Python exceeded 30 seconds; runtime removed.'),'interrupted'),30000);
  const receive=(event:MessageEvent)=>{if(event.source!==frame.contentWindow)return;if(event.data?.ready&&!sent){sent=true;frame.contentWindow?.postMessage({token,assets,code:capturedCode,packages},'*');return;}if(event.data?.token!==token)return;if(typeof event.data.phase==='string'){options.onPhase?.(event.data.phase.slice(0,200));return;}try{if(event.data.result){const result=admitPythonResult(event.data.result);finish(result,result.error?'error':'completed');}else if(event.data.error)finish(interruptedPythonResult(String(event.data.error).slice(0,10000)),'error');}catch(e){finish(interruptedPythonResult('Rejected invalid runtime output: '+String(e).slice(0,300)),'error');}};
  window.addEventListener('message',receive);options.signal?.addEventListener('abort',cancel,{once:true});if(options.signal?.aborted){cancel();return;}
  const nonce=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(18))));
  frame.srcdoc=`<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}' blob: 'unsafe-eval' 'wasm-unsafe-eval'; worker-src blob:; connect-src blob:; style-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'"><script nonce="${nonce}">${controller.replace(/<\/script/gi,'<\\/script')}</script>`;
  document.body.appendChild(frame);
 });
}
