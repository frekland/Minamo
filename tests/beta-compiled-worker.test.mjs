import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFileSync,readdirSync} from 'node:fs';import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare'),{unstable_getMiniflareWorkerOptions}=require('wrangler');
test('production artifact beta: SSR/MCP/API admission and browser-session fences over actual isolated D1',async()=>{
 const options=unstable_getMiniflareWorkerOptions('dist/server/wrangler.json'),root=resolve('dist/server'),files=readdirSync(root,{recursive:true}).filter(n=>n.endsWith('.js'));
 const mf=new Miniflare({...options.workerOptions,bindings:{...options.workerOptions.bindings,MINAMO_OWNER_ID:'compiled-A',MINAMO_SITE_HOSTS:'beta.test',MINAMO_BETA_ENABLED:'1',MINAMO_BETA_KEY:'compiled-fixture-only'},modules:['index.js',...files.filter(n=>n!=='index.js')].map(n=>({type:'ESModule',path:resolve(root,n)})),modulesRoot:root,cf:false});
 try{
 const db=await mf.getD1Database('DB');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
 const send=(id,path,body,extra={})=>mf.dispatchFetch('https://beta.test'+path,{method:body===undefined?'GET':'POST',headers:{...(id?{'oai-authenticated-user-id':id,'oai-authenticated-user-email':'fixture@example.invalid'}:{}),...(body===undefined?{}:{origin:'https://beta.test','content-type':'application/json'}),...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
 for(const path of ['/','/foundation','/reading','/api/workspace','/api/context?family=note&id=known','/api/operations?operationId=known','/api/assets/capabilities','/api/media/capabilities','/api/recovery','/api/lab']){assert.equal((await send(null,path)).status,401,path);assert.equal((await send('compiled-C',path)).status,403,path);}
 for(const method of ['initialize','tools/list','server/discover'])assert.equal((await send('compiled-C','/mcp',{jsonrpc:'2.0',id:1,method})).status,403);
 for(const path of ['/preview-beta','/preview-beta/api'])assert.equal((await send('compiled-A',path)).status,404);
 const aSession=await (await send('compiled-A','/api/beta/session')).json();assert.equal(aSession.role,'owner');
 const request=await(await send('compiled-B','/api/beta/request',{})).json();assert.ok(request.admissionCode);assert.equal((await send('compiled-A','/api/beta/members',{code:request.admissionCode,state:'accepted'})).status,200);
 const bSession=await(await send('compiled-B','/api/beta/session')).json();assert.notEqual(aSession.scope,bSession.scope);
 assert.equal((await send('compiled-B','/api/workspace',undefined,{'X-Minamo-Workspace':aSession.scope})).status,409);
 assert.equal((await send('compiled-B','/api/beta/read',{kind:'workspace'},{'X-Minamo-Workspace':aSession.scope})).status,409);
 for(const who of ['compiled-A','compiled-B']){const r=await send(who,'/api/commands',{action:'create',operationId:'shared-op',family:'note',id:'shared-note',data:{title:'Synthetic fixture',body:who}});assert.equal(r.status,200,await r.clone().text());}
 for(const who of ['compiled-A','compiled-B']){const r=await send(who,'/api/context?family=note&id=shared-note');assert.equal((await r.json()).record.body,who);assert.equal(r.headers.get('Cache-Control'),'private, no-store');assert.ok(r.headers.get('X-Minamo-Principal'));}
 const html=await send('compiled-B','/');assert.equal(html.status,200);const page=await html.text();assert.doesNotMatch(page,/compiled-A/);assert.match(page,/Make this space yours|Your work|Minamo/);
 const tools=await(await send('compiled-A','/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'})).json();assert.ok(tools.result.tools.some(t=>t.name==='preview_minamo_manuscript'));
 await send('compiled-A','/api/beta/members',{code:request.admissionCode,state:'revoked'});assert.equal((await send('compiled-B','/api/workspace')).status,403);assert.equal((await send('compiled-A','/api/workspace')).status,200);
 }finally{await mf.dispose();}
});
