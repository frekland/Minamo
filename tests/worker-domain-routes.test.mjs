import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
// Bundle the real production entry point, with only the framework fallback replaced.
// An omitted API route therefore produces a deliberate HTML 404, just as the audit did.
const bundled=await wr('esbuild').build({stdin:{contents:`import worker from './worker/index';import{DOMAIN_ROUTES}from './lib/domain-routes';export default{fetch(request,env,ctx){if(new URL(request.url).pathname==='/test-route-contract')return Response.json(DOMAIN_ROUTES);return worker.fetch(request,env,ctx)}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',external:['node:async_hooks'],write:false,define:{'import.meta.env.DEV':'false'},plugins:[{name:'framework-fallback',setup(build){build.onResolve({filter:/^vinext\/server\/fetch-handler$/},()=>({path:'fallback',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export default {fetch(){return new Response('<html>Not found</html>',{status:404,headers:{'content-type':'text/html'}})}}`,loader:'js'}));}}]});
test('production Worker dispatches every registered domain API and enforces JSON method contracts',async()=>{
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{MINAMO_OWNER_ID:'owner',MINAMO_SITE_HOSTS:'synthetic.invalid'},cf:false});
 try{
  const routes=await(await mf.dispatchFetch('https://synthetic.invalid/test-route-contract')).json();
  for(const [path,methods] of Object.entries(routes))for(const method of methods){
   const r=await mf.dispatchFetch('https://synthetic.invalid'+path,{method,headers:{'content-type':'application/json'},...(method==='POST'?{body:'{}'}:{})});
   assert.match(r.headers.get('content-type')??'',/application\/json/,`${method} ${path} reached HTML fallback`);
   assert.notEqual(r.status,404,`${method} ${path} was not dispatched`);
  }
  for(const path of ['/api/recovery/export','/api/recovery/import']){
   const anonymous=await mf.dispatchFetch('https://synthetic.invalid'+path);assert.equal(anonymous.status,401);
   const authenticated=await mf.dispatchFetch('https://synthetic.invalid'+path,{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'synthetic@example.invalid'}});assert.equal(authenticated.status,405);assert.equal((await authenticated.json()).code,'method_not_allowed');
  }
  const unknown=await mf.dispatchFetch('https://synthetic.invalid/api/recovery/unknown',{headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'synthetic@example.invalid'}});assert.equal(unknown.status,404);
  for(const path of ['/api/trash/empty','/api/investigation-order']){const r=await mf.dispatchFetch('https://synthetic.invalid'+path,{method:'DELETE'});assert.equal(r.status,401);assert.equal((await r.json()).code,'sign_in_required');}
 }finally{await mf.dispose();}
});

test('actual Vinext production artifact reaches Empty Trash and investigation-order in isolated D1/R2',async()=>{
 const {readFileSync,readdirSync}=await import('node:fs'),{resolve}=await import('node:path');
 const {unstable_getMiniflareWorkerOptions}=require('wrangler'),options=unstable_getMiniflareWorkerOptions('dist/server/wrangler.json'),root=resolve('dist/server'),files=readdirSync(root,{recursive:true}).filter(name=>name.endsWith('.js'));
 const mf=new Miniflare({...options.workerOptions,bindings:{...options.workerOptions.bindings,MINAMO_OWNER_ID:'synthetic-pr74-production-routes',MINAMO_SITE_HOSTS:'compiled.invalid'},modules:['index.js',...files.filter(name=>name!=='index.js')].map(name=>({type:'ESModule',path:resolve(root,name)})),modulesRoot:root,cf:false});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'synthetic-pr74-production-routes','oai-authenticated-user-email':'synthetic@example.invalid','x-minamo-generation':'legacy@0','content-type':'application/json'};
  const snapshotResponse=await mf.dispatchFetch('https://compiled.invalid/api/trash/empty',{headers});assert.equal(snapshotResponse.status,200);assert.match(snapshotResponse.headers.get('content-type'),/application\/json/);const value=await snapshotResponse.json();assert.equal(value.snapshot.count,0);
  const purge=await mf.dispatchFetch('https://compiled.invalid/api/trash/empty',{method:'POST',headers,body:JSON.stringify({operationId:'synthetic-empty-route',expectedGeneration:'legacy@0',snapshot:value.snapshot})});assert.equal(purge.status,200);assert.equal((await purge.json()).status,'committed');
  const order=await mf.dispatchFetch('https://compiled.invalid/api/investigation-order?learningSpace=computing',{headers});assert.equal(order.status,200);assert.match(order.headers.get('content-type'),/application\/json/);assert.ok(await order.json());
 }finally{await mf.dispose()}
});
