import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
export const PYODIDE_VERSION='0.28.3';
export const SCIENCE_ROOTS=Object.freeze(['numpy','matplotlib','sympy','pandas','pillow','scipy']);
export const CORE_FILES=Object.freeze(['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip']);
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export function dependencyClosure(lock,requested){
 if(!Array.isArray(requested)||requested.length<1||requested.length>SCIENCE_ROOTS.length)throw Error('Invalid science package list');
 const selected=new Set(),visiting=new Set(),ordered=[];
 function visit(name){
  if(selected.has(name))return;
  if(visiting.has(name))throw Error('Cyclic package dependency: '+name);
  const p=lock.packages[name];
  if(!p||!/^[A-Za-z0-9_+.-]+\.(whl|zip)$/.test(p.file_name)||p.file_name.includes('..')||!/^[a-f0-9]{64}$/.test(p.sha256)||!Array.isArray(p.depends))throw Error('Untrusted lock entry: '+name);
  visiting.add(name);for(const dep of p.depends)visit(dep);visiting.delete(name);selected.add(name);ordered.push(name);
 }
 for(const name of requested){if(!SCIENCE_ROOTS.includes(name))throw Error('Package is outside the pinned allowlist: '+name);visit(name);}
 return ordered;
}
export function makeScienceManifest(lock,requested,version=PYODIDE_VERSION){
 if(version!==PYODIDE_VERSION)throw Error('Runtime package version mismatch');
 const names=dependencyClosure(lock,requested);
 return {contract:'minamo.python-assets.v1',runtime:{engine:'pyodide',version,abi:lock.info.abi_version,python:lock.info.python},requested:[...requested],packages:names.map(name=>({name,version:lock.packages[name].version,file:lock.packages[name].file_name,sha256:lock.packages[name].sha256,dependencies:lock.packages[name].depends})),source:'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/'};
}
/** Explicit optional staging only; the authored controller never lives in public/. */
export async function stageScienceController({root=resolve(dirname(fileURLToPath(import.meta.url)),'..')}={}){
 const source=join(root,'vendor/foundry-python-isolate.js'),destination=join(root,'public/foundry-python-isolate.js');
 const bytes=await readFile(source);await mkdir(join(root,'public'),{recursive:true});await writeFile(destination,bytes);
 return {path:'public/foundry-python-isolate.js',sha256:sha256(bytes),bytes:bytes.length};
}
export async function stageScienceAssets({root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),requested=SCIENCE_ROOTS,download=false}={}){
 const core=dirname(require.resolve('pyodide/package.json')),runtime=JSON.parse(await readFile(join(core,'package.json'),'utf8'));
 const lockBytes=await readFile(join(core,'pyodide-lock.json')),lock=JSON.parse(lockBytes),manifest=makeScienceManifest(lock,requested,runtime.version);
 const destination=join(root,'public/runtime/foundry-python');await mkdir(destination,{recursive:true});
 manifest.lockSha256=sha256(lockBytes);manifest.assets=[];
 for(const file of CORE_FILES){const bytes=await readFile(join(core,file));await copyFile(join(core,file),join(destination,file));manifest.assets.push({file,sha256:sha256(bytes),bytes:bytes.length,role:'runtime'});}
 const filtered={...lock,packages:Object.fromEntries(manifest.packages.map(p=>[p.name,lock.packages[p.name]]))};
 const filteredBytes=Buffer.from(JSON.stringify(filtered));await writeFile(join(destination,'pyodide-lock.json'),filteredBytes);manifest.assets.push({file:'pyodide-lock.json',sha256:sha256(filteredBytes),bytes:filteredBytes.length,role:'lock'});
 let total=manifest.assets.reduce((n,a)=>n+a.bytes,0);
 for(const p of manifest.packages){
  const target=join(destination,p.file);let bytes;try{bytes=await readFile(target);}catch{}
  if(!bytes&&download){const result=spawnSync('curl',['--fail','--silent','--show-error','--location','--max-time','45','--output',target,manifest.source+p.file],{encoding:'utf8'});if(result.status!==0)throw Error('Package download failed: '+p.name+' '+result.stderr.slice(0,300));bytes=await readFile(target);}
  if(!bytes)throw Error('Missing pinned wheel '+p.file+'. Re-run with --download for explicit build-time retrieval.');
  if(sha256(bytes)!==p.sha256)throw Error('Package hash mismatch: '+p.name);
  total+=bytes.length;if(total>180*1024*1024)throw Error('Science asset bundle exceeds 180 MiB');
  manifest.assets.push({file:p.file,sha256:p.sha256,bytes:bytes.length,role:'package'});
 }
 manifest.totalBytes=total;
 await writeFile(join(destination,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await writeFile(join(root,'docs/capability-foundry/python/science-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await stageScienceController({root});
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const download=process.argv.includes('--download');const subset=process.argv.find(x=>x.startsWith('--packages='))?.slice(11).split(',')??SCIENCE_ROOTS;
 const m=await stageScienceAssets({requested:subset,download});console.log(JSON.stringify({packages:m.packages.length,totalBytes:m.totalBytes,manifest:'public/runtime/foundry-python/manifest.json'}));
}
