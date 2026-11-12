import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare'),{unstable_getMiniflareWorkerOptions}=require('wrangler');

test('independent production-compiled Worker refuses galleries, synthetic fixture proxy and disabled activity writes',{timeout:30000},async()=>{
 const options=unstable_getMiniflareWorkerOptions('dist/server/wrangler.json'),root=resolve('dist/server'),files=readdirSync(root,{recursive:true}).filter(n=>n.endsWith('.js'));
 const mf=new Miniflare({...options.workerOptions,bindings:{...options.workerOptions.bindings,MINAMO_OWNER_ID:'synthetic-compiled-security',MINAMO_SITE_HOSTS:'127.0.0.1,localhost'},modules:['index.js',...files.filter(n=>n!=='index.js')].map(n=>({type:'ESModule',path:resolve(root,n)})),modulesRoot:root,cf:false});
 try{
  const base=(await mf.ready).origin,db=await mf.getD1Database('DB');
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'synthetic-compiled-security','oai-authenticated-user-email':'synthetic@example.invalid'};
  for(const path of ['/capability-foundry','/capability-foundry-phone','/preview-activity','/preview-activity/api','/preview-activity/api?path=/api/workspace']){
   const response=await mf.dispatchFetch(base+path,{headers});assert.equal(response.status,404,path);assert.doesNotMatch(await response.text(),/TEST ONLY.*TCP|PRIVATE NONSPOILER HINT|Admit all twelve specimens/);
  }
  const body={operationId:'compiled-disabled-activity',action:'create',family:'experiment',id:'compiled-security-activity',data:{title:'TEST ONLY forbidden disabled Activity',synthetic:true,activity:{contract:'minamo.activity.v1',template:'debugging',intent:'Original synthetic test.',authorship:'original-exercise',blocks:[{id:'prompt',kind:'instruction',text:'Inert source only.'}]}}};
  const denied=await mf.dispatchFetch(base+'/api/commands',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify(body)});assert.equal(denied.status,404);assert.equal((await denied.json()).code,'activity_disabled');
  assert.equal(existsSync('dist/client/runtime/foundry-python'),false,'Default package excludes scientific package payloads.');
  assert.equal(existsSync('dist/client/foundry-python-isolate.js'),false,'Default package excludes science controller.');
 }finally{await mf.dispose();}
});
