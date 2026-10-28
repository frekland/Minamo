/** Durable purge outbox. Exact keys are captured atomically before metadata removal.
 * This operational ledger is excluded from recovery/export: restoring a checkpoint
 * must never schedule deletion of its originals. Historical checkpoint copies and
 * inactive generations have independent retention, not Empty Trash semantics.
 * Completed tombstones are revisited in oldest-checked order: a crash after an
 * already-running PUT cannot permanently hide resurrected bytes. Each Trash check
 * or exact purge replay reconciles at most 100 exact authorized keys. */
export async function drainAssetDeletions(env:Cloudflare.Env,owner:string,operationId?:string){
 const db=env.DB!,filter=operationId?' AND operation_id=?':'',args=operationId?[owner,operationId]:[owner];
 const rows=await db.prepare(`SELECT kind,asset_id,object_key,state FROM v2_asset_deletions WHERE owner=?${filter} AND NOT EXISTS(SELECT 1 FROM v2_images i WHERE i.object_key=v2_asset_deletions.object_key) AND NOT EXISTS(SELECT 1 FROM v2_media m WHERE m.object_key=v2_asset_deletions.object_key) ORDER BY checked_at,kind,asset_id LIMIT 100`).bind(...args).all<{kind:string;asset_id:string;object_key:string;state:string}>();
 for(const row of rows.results){
  // A different retained namespace may still own this exact physical object.
  const shared=await db.prepare('SELECT 1 ok FROM v2_images WHERE object_key=? UNION ALL SELECT 1 FROM v2_media WHERE object_key=? LIMIT 1').bind(row.object_key,row.object_key).first();
  if(shared)continue;
  try{
   if(!env.BUCKET)throw Error('bucket unavailable');
   if(row.state==='complete'&&!await env.BUCKET.head(row.object_key)){await db.prepare("UPDATE v2_asset_deletions SET checked_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE owner=? AND kind=? AND asset_id=?").bind(owner,row.kind,row.asset_id).run();continue;}
   await env.BUCKET.delete(row.object_key);
   await db.prepare("UPDATE v2_asset_deletions SET state='complete',attempts=attempts+1,last_error=NULL,completed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),checked_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE owner=? AND kind=? AND asset_id=?").bind(owner,row.kind,row.asset_id).run();
  }catch{
   // No provider text or private object keys enter a receipt/error message.
   await db.prepare("UPDATE v2_asset_deletions SET state='pending',completed_at=NULL,attempts=attempts+1,last_error='storage_deletion_failed',checked_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE owner=? AND kind=? AND asset_id=?").bind(owner,row.kind,row.asset_id).run();
  }
 }
 const counts=await db.prepare(`SELECT count(*) total,sum(CASE WHEN state='pending' THEN 1 ELSE 0 END) pending FROM v2_asset_deletions WHERE owner=?${filter}`).bind(...args).first<{total:number;pending:number|null}>();
 return {status:counts?.pending?'pending':'complete',pending:counts?.pending??0,total:counts?.total??0,retention:'Originals for the purged records only. Protected checkpoints and other retained generations keep independent copies.'};
}

/** A PUT already in flight at purge may finish after the first cleanup. Reopen its
 * durable tombstone and remove the late bytes before acknowledging that upload. */
export async function cleanupPurgedUpload(env:Cloudflare.Env,owner:string,kind:'image'|'media',assetId:string){
 const result=await env.DB!.prepare("UPDATE v2_asset_deletions SET state='pending',completed_at=NULL,checked_at='' WHERE owner=? AND kind=? AND asset_id=?").bind(owner,kind,assetId).run();
 if(!result.meta.changes)return false;
 await drainAssetDeletions(env,owner);
 return true;
}
