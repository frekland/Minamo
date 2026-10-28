import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare');
const bundled=await wr('esbuild').build({stdin:{contents:`import{domainHandler}from './lib/domain-handler';export default{fetch(request,env){const fail=request.headers.get('x-fail');if(fail==='r2'){env={...env,BUCKET:{delete(){throw Error('synthetic unavailable')}}};}if(fail==='sql'){const db=env.DB;env={...env,DB:{prepare:db.prepare.bind(db),batch:s=>db.batch([...s,db.prepare('SELECT deliberately_missing_column FROM v2_records')])}};}return domainHandler(request,env)}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('synthetic D1/R2 purge outbox is atomic, shared-reference safe and retries failed physical deletion on replay',async()=>{
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB'),bucket=await mf.getR2Bucket('BUCKET');
  for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const call=async(body,fail)=>{const r=await mf.dispatchFetch('https://synthetic.invalid/api/trash/empty',{method:body?'POST':'GET',headers:{'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'synthetic@example.invalid','x-minamo-generation':'legacy@0','content-type':'application/json',...(fail?{'x-fail':fail}:{})},...(body?{body:JSON.stringify(body)}:{})});return{status:r.status,data:await r.json()}};
  for(const id of ['remove','keep'])await db.prepare("INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES('owner','note',?,?,1,?,'setup')").bind(id,JSON.stringify({family:'note',id,title:id,body:'synthetic',rev:1}),id==='remove'?'now':null).run();
  for(const [kind,id,shared] of [['image','sole-image',false],['media','sole-media',false],['image','shared-image',true],['media','shared-media',true]]){
   const key='synthetic/'+id;await bucket.put(key,'synthetic original');
   if(kind==='image')await db.prepare("INSERT INTO v2_images VALUES('owner',?,?,'digest','image/png',18,1,1,'attached',1,NULL,?)").bind(id,id,key).run();
   else await db.prepare("INSERT INTO v2_media VALUES('owner',?,?,'digest','text/plain','document',18,'{}','attached',1,NULL,?)").bind(id,id,key).run();
   for(const record of shared?['remove','keep']:['remove'])await db.prepare(`INSERT INTO v2_${kind}_attachments VALUES('owner',?,'note',?)`).bind(id,record).run();
  }
  const snapshot=(await call()).data.snapshot,body={operationId:'purge-originals',expectedGeneration:'legacy@0',snapshot};
  let result=await call(body,'sql');assert.equal(result.status,409);assert.equal((await db.prepare('SELECT count(*) n FROM v2_asset_deletions').first()).n,0);assert.ok(await bucket.head('synthetic/sole-image'));
  result=await call(body,'r2');assert.equal(result.status,200);assert.equal(result.data.status,'committed');assert.deepEqual({status:result.data.physicalDeletion.status,pending:result.data.physicalDeletion.pending},{status:'pending',pending:2});
  assert.equal((await db.prepare("SELECT count(*) n FROM v2_records WHERE id='remove'").first()).n,0);
  assert.equal((await db.prepare("SELECT count(*) n FROM v2_images WHERE id='sole-image'").first()).n,0);
  assert.equal((await db.prepare("SELECT count(*) n FROM v2_media WHERE id='sole-media'").first()).n,0);
  assert.equal((await db.prepare("SELECT count(*) n FROM v2_asset_deletions WHERE last_error='storage_deletion_failed'").first()).n,2);
  for(const kind of ['image','media'])assert.ok(await bucket.head('synthetic/sole-'+kind));
  result=await call(body);assert.equal(result.data.replayed,true);assert.equal(result.data.physicalDeletion.status,'complete');
  for(const kind of ['image','media']){assert.equal(await bucket.head('synthetic/sole-'+kind),null);assert.ok(await bucket.head('synthetic/shared-'+kind));}
  assert.equal((await db.prepare("SELECT count(*) n FROM v2_asset_deletions WHERE state='complete'").first()).n,2);
  // Simulate termination after a delayed PUT but before the live upload's post-PUT cleanup.
  await bucket.put('synthetic/sole-image','late bytes after complete tombstone');
  assert.equal((await call()).data.physicalDeletion.pending,0);
  assert.equal(await bucket.head('synthetic/sole-image'),null);
  // A repeated receipt neither changes the original outcome nor deletes shared bytes.
  assert.equal((await call(body)).data.count,1);assert.equal((await call()).data.physicalDeletion.pending,0);
  // More completed tombstones than the bounded reconciliation page must rotate.
  await db.batch(Array.from({length:105},(_,i)=>db.prepare("INSERT INTO v2_asset_deletions(owner,kind,asset_id,object_key,operation_id,state) VALUES('owner','image',?,?,'rotation','complete')").bind('rotation-'+String(i).padStart(3,'0'),'synthetic/rotation-'+i)));
  await bucket.put('synthetic/rotation-104','crash residue');
  await call();assert.ok(await bucket.head('synthetic/rotation-104'));
  await call();assert.equal(await bucket.head('synthetic/rotation-104'),null);

 }finally{await mf.dispose();}
});
const lateBundled=await wr('esbuild').build({stdin:{contents:`
import{stageImage}from './lib/assets';import{stageMedia}from './lib/media';import{emptyTrash,trashSnapshot}from './lib/trash-purge';
export default{async fetch(request,env){
 const kind=new URL(request.url).searchParams.get('kind'),owner='late-'+kind,table=kind==='image'?'v2_images':'v2_media',base=env.BUCKET;
 const bytes=kind==='image'?Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAAFElEQVR4nGMUCWhiYGBgYmBgQFAAEPgA7OnJpxEAAAAASUVORK5CYII='),c=>c.charCodeAt(0)):new TextEncoder().encode('synthetic text');
 const late={...env,BUCKET:{delete:key=>base.delete(key),async put(key,body,options){
  const row=await env.DB.prepare('SELECT id FROM '+table+' WHERE owner=?').bind(owner).first();
  await env.DB.prepare("UPDATE "+table+" SET state='attached',expires_at=NULL WHERE owner=?").bind(owner).run();
  await env.DB.prepare("INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,'note','late-note','{}',1,'now','setup')").bind(owner).run();
  await env.DB.prepare('INSERT INTO v2_'+kind+"_attachments VALUES(?,?,'note','late-note')").bind(owner,row.id).run();
  await emptyTrash(env,owner,{operationId:'late-purge',snapshot:(await trashSnapshot(env,owner)).snapshot});
  // Outstanding PUT finishes after purge metadata and its first physical cleanup.
  return base.put(key,body,options);
 }}};
 try{const selected=request.headers.has('x-retry')?env:late;const value=kind==='image'?await stageImage(selected,owner,'same-upload',bytes,'image/png'):await stageMedia(selected,owner,'same-upload',bytes,'text/plain');return Response.json(value);}catch(e){return Response.json({code:e.code,error:e.message},{status:e.status??500});}
}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('late image and media PUTs cannot resurrect purged originals; purged upload identities stay tombstoned',async()=>{
 const mf=new Miniflare({modules:true,script:lateBundled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB'),bucket=await mf.getR2Bucket('BUCKET');for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  for(const kind of ['image','media']){
   const response=await mf.dispatchFetch('https://synthetic.invalid/late?kind='+kind);assert.equal(response.status,410,JSON.stringify(await response.json()));
   const row=await db.prepare('SELECT state,attempts,object_key FROM v2_asset_deletions WHERE owner=?').bind('late-'+kind).first();assert.equal(row.state,'complete');assert.equal(row.attempts,2);assert.equal(await bucket.head(row.object_key),null);
   const retry=await mf.dispatchFetch('https://synthetic.invalid/late?kind='+kind,{headers:{'x-retry':'1'}});assert.equal(retry.status,409);assert.equal((await retry.json()).code,'upload_identity_purged');assert.equal(await bucket.head(row.object_key),null);
  }
 }finally{await mf.dispose();}
});
