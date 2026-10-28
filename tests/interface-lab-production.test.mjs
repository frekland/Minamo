import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare'),{unstable_getMiniflareWorkerOptions}=require('wrangler');
test('production Worker makes Interface lab, embedded document and synthetic API unavailable',{timeout:30000},async()=>{
 const options=unstable_getMiniflareWorkerOptions('dist/server/wrangler.json'),root=resolve('dist/server'),files=readdirSync(root,{recursive:true}).filter(name=>name.endsWith('.js'));
 const mf=new Miniflare({...options.workerOptions,bindings:{...options.workerOptions.bindings,MINAMO_OWNER_ID:'TEST-ONLY-interface-compiled',MINAMO_SITE_HOSTS:'127.0.0.1,localhost'},modules:['index.js',...files.filter(name=>name!=='index.js')].map(name=>({type:'ESModule',path:resolve(root,name)})),modulesRoot:root,cf:false});
 try{
  const base=(await mf.ready).origin,db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  for(const path of ['/preview-interface','/preview-interface?embedded=1','/preview-interface/workspace','/preview-interface/api','/preview-interface/api?path=/mcp']){const response=await mf.dispatchFetch(base+path,{headers:{'oai-authenticated-user-id':'TEST-ONLY-interface-compiled','oai-authenticated-user-email':'synthetic@example.invalid'}});assert.equal(response.status,404,path);assert.doesNotMatch(await response.text(),/source-aware maker|Interface Foundry laboratory|TEST-ONLY-interface-reading/);}
  const count=await db.prepare('SELECT count(*) AS n FROM v2_records').first();assert.equal(count.n,0,'No lab data was initialized by production requests.');
 }finally{await mf.dispose();}
});
