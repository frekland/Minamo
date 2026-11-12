import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
/** Actual compiled app adapters and real local D1/R2; synthetic principals only. */
export async function privateStorageFixture(worker,{bindings={}}={}){
 const built=await build({stdin:{contents:worker,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
 const mf=new Miniflare({modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET'],bindings});
 const db=await mf.getD1Database('DB'),bucket=await mf.getR2Bucket('BUCKET');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const client=owner=>{let generation='legacy@0',serial=0;
  const request=async(path,data,options={})=>{const raw=options.raw,headers={'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid','x-minamo-generation':generation,...options.headers};if(data!==undefined&&!raw)headers['content-type']='application/json';const response=await mf.dispatchFetch('https://storage.test'+path,{method:data===undefined?'GET':'POST',...options,headers,body:data===undefined?undefined:raw?data:JSON.stringify(data)});return{status:response.status,headers:response.headers,data:response.headers.get('content-type')?.includes('application/json')?await response.json():new Uint8Array(await response.arrayBuffer())}};
  return{owner,request,get generation(){return generation},setGeneration:g=>generation=g,command:data=>request('/api/commands',{operationId:'storage-op-'+(++serial),expectedGeneration:generation,...data}),recover:(action,data={})=>request('/api/recovery',{action,expectedGeneration:generation,...data}),context:(family,id,rendition)=>request('/api/context?'+new URLSearchParams({family,id,...(rendition?{rendition}:{})}))};
 };
 return{mf,db,bucket,client,dispose:()=>mf.dispose()};
}
