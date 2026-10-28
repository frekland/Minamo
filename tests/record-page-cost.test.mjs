import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
// Only this isolated synthetic test Worker exposes query metrics.
const bundled=await build({stdin:{contents:`import {domainHandler} from './lib/domain-handler.ts';
export default {async fetch(request,env){const metrics=[];const prepare=sql=>{let statement=env.DB.prepare(sql);const wrapped={bind(...args){statement=statement.bind(...args);return wrapped},async all(){const start=performance.now(),result=await statement.all();metrics.push({sql,rowsRead:result.meta.rows_read,rowsReturned:result.results.length,milliseconds:performance.now()-start});return result},first(...args){return statement.first(...args)},run(){return statement.run()},raw(...args){return statement.raw(...args)}};return wrapped};const response=await domainHandler(request,{...env,DB:{prepare,batch:statements=>env.DB.batch(statements)}});return Response.json({status:response.status,payload:await response.json(),metrics})}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('indexed bounded collection pages keep measured work independent of corpus size',async t=>{
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  for(const count of [100,5000]){
   const owner='synthetic-query-cost-'+count;
   for(let start=0;start<count;start+=100)await db.batch(Array.from({length:Math.min(100,count-start)},(_,offset)=>{const id='note-'+String(start+offset).padStart(6,'0');const record={id,family:'note',title:'SYNTHETIC query cost',body:'Bounded local performance fixture.',links:[],rev:1,createdAt:'2026-10-27T00:00:00.000Z',updatedAt:'2026-10-27T00:00:00.000Z',trashedAt:null,actor:'system',synthetic:true};return db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,1,NULL,?)').bind(owner,'note',id,JSON.stringify(record),'fixture-'+id)}));
   const plan=await db.prepare("EXPLAIN QUERY PLAN SELECT data FROM v2_records WHERE owner=? AND trashed_at IS NULL ORDER BY json_extract(data,'$.updatedAt') DESC,family,id LIMIT 41").bind(owner).all();
   assert.ok(plan.results.some(row=>/v2_records_active_owner_updated/.test(row.detail)),JSON.stringify(plan.results));assert.ok(!plan.results.some(row=>/TEMP B-TREE/.test(row.detail)));
   const samples=[];let first;
   for(let repeat=0;repeat<5;repeat++){
    const response=await mf.dispatchFetch('https://cost.invalid/api/workspace?limit=40',{headers:{'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid'}});const {status,payload,metrics}=await response.json();assert.equal(status,200);assert.equal(payload.records.length,40);assert.equal(payload.truncated,true);assert.ok(payload.nextCursor);first??=payload;
    const queries=metrics.filter(metric=>metric.sql.startsWith('WITH candidates AS'));assert.equal(queries.length,1,'one collection statement, with no remaining-count statement');const metric=queries[0];assert.equal(metric.rowsReturned,41);assert.ok(metric.rowsRead<=500,'indexed page must not read the full 5,000-row corpus: '+JSON.stringify(metric));assert.ok(!/COUNT\(/i.test(metric.sql));samples.push(metric);
   }
   const next=await mf.dispatchFetch('https://cost.invalid/api/workspace?limit=40&cursor='+encodeURIComponent(first.nextCursor),{headers:{'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid'}});const continuation=await next.json();assert.equal(continuation.status,200);assert.equal(continuation.payload.records.length,40);assert.equal(new Set([...first.records,...continuation.payload.records].map(record=>record.id)).size,80);
   const times=samples.map(sample=>sample.milliseconds).sort((a,b)=>a-b);t.diagnostic(JSON.stringify({syntheticLocal:true,corpusRecords:count,pageRecords:40,collectionStatements:1,rowsRead:samples.map(sample=>sample.rowsRead),latencyMilliseconds:{min:times[0],median:times[2],max:times[4]}}));
  }
 }finally{await mf.dispose()}
});
