import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,readFile,readdir,rm,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

// This is a commissioned, synthetic E2E fixture, not a Sites publication or an
// alternative production preview. The source components and domain adapters are
// bundled unchanged; native identity/SSR/production guards are separate gates.
const root=resolve(fileURLToPath(new URL('..',import.meta.url))),require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild'),{Miniflare}=wr('miniflare');
const args=process.argv.slice(2),receiptAt=args.indexOf('--source-receipt'),receiptPath=receiptAt>=0?args[receiptAt+1]:undefined;
if(receiptAt>=0){if(!receiptPath)throw Error('A source receipt path is required.');args.splice(receiptAt,2);}
if(args.some(value=>value==='--url'||value.startsWith('--url=')))throw Error('The isolated fixture owns its local URL. Do not provide or rewrite one.');
await mkdir(join(root,'.sites-runtime'),{recursive:true});
const output=await mkdtemp(join(root,'.sites-runtime/interface-e2e-'));
let mf,server,child,stopping=false;
async function close(){if(stopping)return;stopping=true;child?.kill('SIGTERM');await new Promise(done=>server?server.close(done):done());await mf?.dispose();await rm(output,{recursive:true,force:true});}
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>void close().finally(()=>process.exit(1)));
try{
 const client=await build({stdin:{contents:"import React from 'react';import{createRoot}from'react-dom/client';import'./app/globals.css';import'./app/theme.css';import'./app/workspace.css';import InterfaceLab from'./app/interface-lab.tsx';createRoot(document.getElementById('root')).render(React.createElement(InterfaceLab,{embedded:location.pathname.endsWith('/workspace')}));",resolveDir:root,sourcefile:'isolated-interface-entry.tsx'},absWorkingDir:root,bundle:true,format:'esm',platform:'browser',external:['/identity/*'],splitting:true,write:true,outdir:output,entryNames:'assets/entry-[hash]',chunkNames:'assets/chunk-[hash]',assetNames:'assets/[name]-[hash]',metafile:true,jsx:'automatic',conditions:['style','browser'],target:'es2022',define:{'import.meta.env.DEV':'true','process.env.NODE_ENV':'"production"'},loader:{'.woff':'file','.woff2':'file','.ttf':'file','.svg':'file','.wasm':'file'}});
 const postcss=createRequire(require.resolve('@tailwindcss/postcss'))('postcss'),tailwind=require('@tailwindcss/postcss');
 for(const [path]of Object.entries(client.metafile.outputs).filter(([path])=>path.endsWith('.css'))){const filename=resolve(root,path),processed=await postcss([tailwind()]).process(await readFile(filename,'utf8'),{from:filename});await writeFile(filename,processed.css);}
 const files=Object.entries(client.metafile.outputs),entry=files.find(([,value])=>value.entryPoint==='isolated-interface-entry.tsx'||value.entryPoint==='<stdin>'),main=entry?.[0];
 if(!main)throw Error('The real component fixture entry was not emitted.');
 const toUrl=path=>'/'+resolve(root,path).slice(output.length+1).replaceAll('\\','/');
 const css=files.filter(([path])=>path.endsWith('.css')).map(([path])=>'<link rel="stylesheet" href="'+toUrl(path)+'">').join('');
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Minamo · A space for understanding</title>'+css+'</head><body><div id="root"></div><script type="module" src="'+toUrl(main)+'"></script></body></html>';
 const backend=await build({stdin:{contents:"import{interfaceLabPreviewHandler}from'./lib/interface-lab-preview.ts';export default{fetch:interfaceLabPreviewHandler}",resolveDir:root},absWorkingDir:root,bundle:true,format:'esm',platform:'neutral',write:false,loader:{'.sql':'text'},define:{'import.meta.env.DEV':'true'},metafile:true});
 if(receiptPath){
  const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),inputs={};
  const paths=[...new Set([...Object.keys(client.metafile.inputs),...Object.keys(backend.metafile.inputs),'package.json','pnpm-lock.yaml','scripts/interface-browser-isolated.mjs','scripts/interface-browser.mjs','scripts/interface-browser.config.mjs','tests/interface-browser/workspace.spec.mjs','tests/interface-browser/notes-editor.spec.mjs'])].filter(path=>!path.includes('node_modules/')&&!path.startsWith('<')).sort();
  for(const path of paths){try{inputs[path]=hash(await readFile(resolve(root,path)));}catch(error){if(error.code!=='ENOENT')throw error;}}
  const assets={};for(const [path]of files)assets[toUrl(path)]=hash(await readFile(resolve(root,path)));
  const receipt={sourceCommit:spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).stdout.trim(),sourceInputs:inputs,sourceDigest:hash(JSON.stringify(inputs)),backendSHA256:hash(backend.outputFiles[0].text),assets,assertionSuite:'Current interface-browser specs; actual selected count is recorded by Playwright; no suppressions',wrapper:'client createRoot; actual InterfaceLab/Workspace and root CSS; real compiled domain under synthetic Miniflare D1/R2',separateGates:['production SSR/hydration','native Sites identity/dispatch','compiled production lab404']};
  await writeFile(resolve(root,receiptPath),JSON.stringify(receipt,null,2)+'\n');
 }
 mf=new Miniflare({modules:true,script:backend.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET']});
 await mf.ready;
 const mime={'.js':'text/javascript','.css':'text/css','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.wasm':'application/wasm','.map':'application/json'};
 server=createServer(async(req,res)=>{try{
  const origin='http://'+req.headers.host,url=new URL(req.url,origin);
  if(url.pathname==='/preview-interface/api'){
   const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>230000){res.writeHead(413).end('Payload too large');return;}chunks.push(chunk);}
   const response=await mf.dispatchFetch(url.toString(),{method:req.method,headers:req.headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(['/','/preview-interface','/preview-interface/workspace'].includes(url.pathname)){res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}).end(html);return;}
  const base=url.pathname.startsWith('/assets/')?output:url.pathname.startsWith('/identity/')?join(root,'public'):null;
  const path=base&&resolve(base,'.'+decodeURIComponent(url.pathname));
  if(!path||!path.startsWith(base+'/')||url.pathname.includes('..')){res.writeHead(404).end('Not found');return;}
  const data=await readFile(path);res.writeHead(200,{'content-type':mime[extname(path)]??'application/octet-stream','cache-control':'no-store'}).end(data);
 }catch{res.writeHead(500).end('Synthetic fixture request failed.');}});
 await new Promise((done,reject)=>server.once('error',reject).listen(0,'127.0.0.1',done));
 const address=server.address(),url='http://127.0.0.1:'+address.port+'/';
 console.log(JSON.stringify({fixture:'actual-components-and-compiled-domain',url,syntheticOwner:'TEST-ONLY-interface-browser',react:'production',backend:'ephemeral Miniflare D1/R2',identity:'synthetic only; no Sites authentication',assertions:'Current interface-browser specs; no assertion suppression'}));
 child=spawn(process.execPath,[join(root,'scripts/interface-browser.mjs'),'--url',url,...args],{cwd:root,env:process.env,stdio:'inherit'});
 const code=await new Promise((done,reject)=>{child.once('error',reject);child.once('exit',(status)=>done(status??1));});child=undefined;process.exitCode=code;
}finally{await close();}
