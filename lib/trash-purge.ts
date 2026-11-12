import {drainAssetDeletions} from './asset-deletions';
import {DomainError} from './domain-error';
import {FAMILIES} from './contracts';
import {generationContext,generationGuard,requireGeneration,assertGenerationCurrent} from './generations';
type Ref={family:string;id:string;rev:number};
const LIMIT=2000;
function fail(code:string,message:string,status=400):never{throw new DomainError(status,code,message)}
export async function trashSnapshot(env:Cloudflare.Env,owner:string){
 const rows=await env.DB!.prepare('SELECT family,id,rev FROM v2_records WHERE owner=? AND trashed_at IS NOT NULL ORDER BY family,id LIMIT ?').bind(owner,LIMIT+1).all<Ref>();
 if(rows.results.length>LIMIT)fail('trash_budget','Trash exceeds the supported permanent-delete batch.',413);
 return {snapshot:{records:rows.results,count:rows.results.length},physicalDeletion:await drainAssetDeletions(env,owner)};
}
export async function emptyTrash(env:Cloudflare.Env,owner:string,input:any){
 const ctx=generationContext(env);if(ctx)requireGeneration(ctx,input?.expectedGeneration);
 if(!input||Object.keys(input).some(k=>!['operationId','expectedGeneration','snapshot'].includes(k))||!/^[-\w:.]{1,160}$/.test(input.operationId??''))fail('invalid_trash_operation','Use one permanent-delete operation identity.');
 const snapshot=input.snapshot;
 if(!snapshot||Object.keys(snapshot).some(k=>!['records','count'].includes(k))||!Array.isArray(snapshot.records)||snapshot.records.length>LIMIT||snapshot.count!==snapshot.records.length)fail('invalid_trash_snapshot','Use the exact Trash snapshot shown for confirmation.');
 const refs:Ref[]=snapshot.records.map((r:any)=>{if(!r||Object.keys(r).some(k=>!['family','id','rev'].includes(k))||!FAMILIES.includes(r.family)||typeof r.id!=='string'||!r.id.length||r.id.length>160||!Number.isSafeInteger(r.rev)||r.rev<1)fail('invalid_trash_snapshot','Use exact Trash record identities and revisions.');return {family:r.family,id:r.id,rev:r.rev}}).sort((a:Ref,b:Ref)=>a.family.localeCompare(b.family)||a.id.localeCompare(b.id));
 if(new Set(refs.map(r=>r.family+':'+r.id)).size!==refs.length)fail('invalid_trash_snapshot','Trash identities must be unique.');
 const bytes=new TextEncoder().encode(JSON.stringify({kind:'empty-trash',expectedGeneration:input.expectedGeneration,records:refs})),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 const db=env.DB!,old=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,input.operationId).first<{hash:string;response:string}>();
 if(old){if(old.hash!==hash)fail('idempotency_mismatch','This operation identity belongs to another change.',409);return {...JSON.parse(old.response),replayed:true,physicalDeletion:await drainAssetDeletions(env,owner,input.operationId)};}
 const nonce=crypto.randomUUID(),json=JSON.stringify(refs),receipt={kind:'empty-trash',operationId:input.operationId,status:'committed',purged:refs.map(({family,id})=>({family,id})),count:refs.length,replayed:false};
 const fence=generationGuard(env),valid=`(SELECT count(*) FROM v2_records WHERE owner=? AND trashed_at IS NOT NULL)=? AND NOT EXISTS(SELECT 1 FROM json_each(?) t WHERE NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(t.value,'$.family') AND r.id=json_extract(t.value,'$.id') AND r.rev=json_extract(t.value,'$.rev') AND r.trashed_at IS NOT NULL))${fence.sql}`;
 const claim=db.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) VALUES(?,?,?,?,200,json(CASE WHEN ${valid} THEN ? ELSE 'stale Trash snapshot' END))`).bind(owner,input.operationId,hash,nonce,owner,refs.length,json,owner,...fence.args,JSON.stringify(receipt));
 const win='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',args=[owner,input.operationId,nonce],matches=(family:string,id:string)=>`EXISTS(SELECT 1 FROM json_each(?) p WHERE json_extract(p.value,'$.family')=${family} AND json_extract(p.value,'$.id')=${id})`;
 const assets=await db.prepare(`SELECT 'image' kind,a.asset_id id FROM v2_image_attachments a WHERE owner=? AND ${matches('family','record_id')} UNION SELECT 'media',asset_id FROM v2_media_attachments WHERE owner=? AND ${matches('family','record_id')}`).bind(owner,json,owner,json).all<{kind:string;id:string}>();
 const statements=[claim];
 // Old receipts retain hashes/idempotency but no longer expose permanently removed record bytes.
 statements.push(db.prepare(`UPDATE v2_operations SET response=json_object('operationId',id,'status','purged','replayed',json('false')),status=410 WHERE owner=? AND id<>? AND ${win} AND EXISTS(SELECT 1 FROM json_tree(v2_operations.response) j WHERE j.type='object' AND ${matches("json_extract(j.value,'$.family')","json_extract(j.value,'$.id')")})`).bind(owner,input.operationId,...args,json));
 for(const [table,family,id] of [['v2_revisions','family','id'],['v2_activity','family','record_id'],['v2_learning_scopes','family','id'],['v2_image_attachments','family','record_id'],['v2_media_attachments','family','record_id']] as const)statements.push(db.prepare(`DELETE FROM ${table} WHERE owner=? AND ${matches(table+'.'+family,table+'.'+id)} AND ${win}`).bind(owner,json,...args));
 for(const table of ['v2_catalogue_terms','v2_catalogue_revisions','v2_catalogue_heads'])statements.push(db.prepare(`DELETE FROM ${table} WHERE owner=? AND ${matches("'article'",'article_id')} AND ${win}`).bind(owner,json,...args));
 statements.push(db.prepare(`DELETE FROM v2_bookmarks WHERE owner=? AND (${matches("json_extract(target,'$.family')","json_extract(target,'$.id')")} OR ${matches("'flag'",'flag_id')}) AND ${win}`).bind(owner,json,json,...args));
 const targetMatch=matches("CASE json_extract(event_json,'$.primaryTarget.kind') WHEN 'investigation' THEN 'investigation' ELSE 'journey' END","coalesce(json_extract(event_json,'$.primaryTarget.investigationId'),json_extract(event_json,'$.primaryTarget.journeyId'))");
 statements.push(db.prepare(`DELETE FROM v2_learning_development_revisions WHERE owner=? AND development_id IN(SELECT id FROM v2_learning_developments WHERE owner=? AND ${targetMatch}) AND ${win}`).bind(owner,owner,json,...args));
 statements.push(db.prepare(`DELETE FROM v2_learning_perspectives WHERE owner=? AND target_key IN(SELECT target_key FROM v2_learning_developments WHERE owner=? AND ${targetMatch}) AND ${win}`).bind(owner,owner,json,...args));
 statements.push(db.prepare(`DELETE FROM v2_learning_developments WHERE owner=? AND ${targetMatch} AND ${win}`).bind(owner,json,...args));
 // Only source editions with no surviving canonical member are discarded. Mixed editions
 // are separate historical source artifacts and stay immutable for their active members.
 statements.push(db.prepare('DROP TRIGGER v2_manuscript_editions_immutable_delete'));
 statements.push(db.prepare(`DELETE FROM v2_manuscript_editions WHERE owner=? AND ${win} AND EXISTS(SELECT 1 FROM json_each(refs)) AND NOT EXISTS(SELECT 1 FROM json_each(refs) r WHERE NOT ${matches("json_extract(r.value,'$.family')","json_extract(r.value,'$.id')")})`).bind(owner,...args,json));
 statements.push(db.prepare("CREATE TRIGGER v2_manuscript_editions_immutable_delete BEFORE DELETE ON v2_manuscript_editions BEGIN SELECT RAISE(ABORT,'immutable manuscript edition'); END"));
 for(const kind of ['image','media']){
  const ids=JSON.stringify(assets.results.filter(a=>a.kind===kind).map(a=>a.id)),table='v2_'+(kind==='image'?'images':'media');
  const eligible=`owner=? AND id IN(SELECT value FROM json_each(?)) AND NOT EXISTS(SELECT 1 FROM v2_${kind}_attachments a WHERE a.owner=${table}.owner AND a.asset_id=${table}.id) AND ${win}`;
  // The durable key survives even if R2 deletion or the response fails after commit.
  statements.push(db.prepare(`INSERT OR IGNORE INTO v2_asset_deletions(owner,kind,asset_id,object_key,operation_id) SELECT owner,?,id,object_key,? FROM ${table} WHERE ${eligible}`).bind(kind,input.operationId,owner,ids,...args));
  statements.push(db.prepare(`DELETE FROM ${table} WHERE ${eligible}`).bind(owner,ids,...args));
 }
 statements.push(db.prepare(`DELETE FROM v2_records WHERE owner=? AND ${matches('v2_records.family','v2_records.id')} AND ${win}`).bind(owner,json,...args));
 try{await db.batch(statements)}catch{const replay=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,input.operationId).first<{hash:string;response:string}>();if(replay&&replay.hash===hash)return {...JSON.parse(replay.response),replayed:true,physicalDeletion:await drainAssetDeletions(env,owner,input.operationId)};await assertGenerationCurrent(env);fail('trash_changed','Trash changed. Review it and confirm again.',409)}
 return {...receipt,physicalDeletion:await drainAssetDeletions(env,owner,input.operationId)};
}
