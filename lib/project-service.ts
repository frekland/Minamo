import {imageAdmissionGuard,imageAttachmentStatements} from './assets';
import {mediaAdmissionGuard,mediaAttachmentStatements} from './media';
import {z} from 'zod';
import {DomainError,authoringDomain,executeCommand,readRecord,readRendition,operationStatus} from './domain';
import {compositionSchema,adaptedComposition,layoutCapabilities,projectRefSchema,patterns} from './project-composition';
import {generationContext,requireGeneration,generationGuard,assertGenerationCurrent} from './generations';
import type {Actor,WorkspaceRecord,ArticleSection} from './contracts';
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const block=compositionSchema.shape.blocks.element;
const section=compositionSchema.shape.sections.element;
const content=z.object({id,title:z.string().max(180),parts:z.array(z.record(z.unknown())).max(40)}).strict();
export const updateSchema=z.object({operationId:id,expectedGeneration:z.string().max(160),projectId:id,expectedProjectRev:z.number().int().min(0),title:z.string().min(1).max(180).optional(),description:z.string().max(600).optional(),body:z.string().max(24000).optional(),learningScope:z.unknown().optional(),projectCover:z.unknown().optional(),contentSections:z.array(content).max(64).optional(),noteChanges:z.array(z.object({id,expectedRev:z.number().int().min(0),title:z.string().min(1).max(180),body:z.string().max(24000)}).strict()).max(8).optional(),composition:compositionSchema.optional(),changes:z.array(z.discriminatedUnion('op',[
 z.object({op:z.literal('upsertSection'),section}).strict(),z.object({op:z.literal('upsertBlock'),sectionId:id,slotId:id,block,content:content.optional()}).strict(),
 z.object({op:z.literal('moveBlock'),id,sectionId:id,slotId:id,index:z.number().int().min(0).max(128)}).strict(),
 z.object({op:z.literal('setSection'),id,title:z.string().max(180).optional(),hidden:z.boolean().optional(),collapsed:z.boolean().optional(),index:z.number().int().min(0).max(31).optional()}).strict(),
 z.object({op:z.literal('setBlockPresentation'),id,pinned:z.boolean().optional(),width:z.enum(['full','split','compact']).optional()}).strict(),
 z.object({op:z.literal('setFavourite'),id,favourite:z.boolean()}).strict(),
 z.object({op:z.literal('setBlockVisibility'),id,hidden:z.boolean()}).strict(),z.object({op:z.literal('setLayoutLock'),id,lock:z.enum(['position','content','both']).optional()}).strict()
])).max(64).optional(),restoreRevision:z.number().int().min(1).optional(),explicitOverrideIds:z.array(z.string().max(180)).max(160).optional()}).strict();
export {layoutCapabilities};
export async function getProjectComposition(env:Cloudflare.Env,owner:string,projectId:string,revision?:number){
 const current=await readRecord(env,owner,'journey',projectId);if(!current)throw new DomainError(404,'project_unavailable','Project unavailable.');
 let record=current;
 if(revision!==undefined){if(!Number.isSafeInteger(revision)||revision<1)throw new DomainError(400,'invalid_revision','Choose an exact record revision.');const row=await env.DB!.prepare("SELECT data FROM v2_revisions WHERE owner=? AND family='journey' AND id=? AND revision=?").bind(owner,projectId,revision).first<{data:string}>();if(!row)throw new DomainError(404,'revision_unavailable','That Project revision is unavailable.');record=(await authoringDomain.projectRecord(env,owner,JSON.parse(row.data),false,true))!;}
 const composition=adaptedComposition(record),references=[];let bytes=0;
 for(const b of composition.blocks){if(!b.ref)continue;const r=b.ref;const target=r.rendition?await readRendition(env,owner,r.id,r.rendition,r.family):await readRecord(env,owner,r.family,r.id);const size=JSON.stringify(target).length;bytes+=size;references.push({blockId:b.id,ref:r,record:bytes<=200000?target:null,unavailable:!target,omitted:!!target&&bytes>200000});}
 const history=await env.DB!.prepare("SELECT revision FROM v2_revisions WHERE owner=? AND family='journey' AND id=? ORDER BY revision DESC LIMIT 12").bind(owner,projectId).all<{revision:number}>();
 const pins=await listPagePins(env,owner,{family:'journey',id:projectId});
 return {record,composition,currentProjectRev:current.rev,revision:record.rev,references,history:history.results.map(r=>r.revision),historyLimit:12,pins,href:'/?view=journeys&family=journey&id='+encodeURIComponent(projectId)};
}
async function projectCommand(env:Cloudflare.Env,owner:string,input:unknown){
 let request:z.infer<typeof updateSchema>;try{request=updateSchema.parse(input);}catch(e){throw new DomainError(400,'invalid_project_update',(e as Error).message);}
 if(new TextEncoder().encode(JSON.stringify(request)).byteLength>220000)throw new DomainError(413,'project_update_too_large','Use a bounded update under 220 KB.');
 const ctx=generationContext(env);if(ctx)requireGeneration(ctx,request.expectedGeneration);
 const existing=await authoringDomain.rawReadRecord(env,owner,'journey',request.projectId);if(request.expectedProjectRev===0?!!existing:!existing||existing.rev!==request.expectedProjectRev)throw new DomainError(409,'revision_conflict','Read the current Project before updating it.');
 let composition=structuredClone(request.composition??(existing?adaptedComposition(existing):{version:1 as const,sections:[],blocks:[]}));
 if(request.restoreRevision){if(!existing||request.composition||request.changes||request.contentSections||request.noteChanges||request.body!==undefined)throw new DomainError(400,'restore_scope','Restore arrangement separately from content edits.');const old=await getProjectComposition(env,owner,request.projectId,request.restoreRevision);composition=old.composition;/* Current canonical sources remain untouched. */}
 let contents=[...(existing?.sections??[])];
 for(const s of request.contentSections??[]){const i=contents.findIndex(v=>v.id===s.id);if(i<0)contents.push(s as ArticleSection);else contents[i]=s as ArticleSection;}
 for(const change of request.changes??[]){
  if(change.op==='setSection'){const at=composition.sections.findIndex(s=>s.id===change.id);if(at<0)throw new DomainError(400,'section_unavailable','Unknown section.');const target=composition.sections[at];for(const key of ['title','hidden','collapsed'] as const)if(change[key]!==undefined)(target as any)[key]=change[key];if(change.index!==undefined){composition.sections.splice(at,1);composition.sections.splice(change.index,0,target);}continue;}
  if(change.op==='setFavourite'){if(!composition.blocks.some(b=>b.id===change.id)&&!composition.sections.some(s=>s.id===change.id))throw new DomainError(400,'shortcut_unavailable','Unknown shortcut destination.');composition.favourites=(composition.favourites??[]).filter(v=>v!==change.id);if(change.favourite)composition.favourites.push(change.id);continue;}
  if(change.op==='upsertSection'){const at=composition.sections.findIndex(s=>s.id===change.section.id);if(at<0)composition.sections.push(change.section);else composition.sections[at]=change.section;continue;}
  if(change.op==='upsertBlock'){
   if(change.content){const at=contents.findIndex(s=>s.id===change.content!.id);if(at<0)contents.push(change.content as ArticleSection);else contents[at]=change.content as ArticleSection;}
   const old=composition.blocks.findIndex(b=>b.id===change.block.id);if(old<0)composition.blocks.push(change.block);else composition.blocks[old]=change.block;
  }
  const blockId=change.op==='upsertBlock'?change.block.id:change.id,b=composition.blocks.find(b=>b.id===blockId);if(!b)throw new DomainError(400,'block_unavailable','Unknown Project block.');
  if(change.op==='setBlockPresentation'){if(change.pinned!==undefined)b.pinned=change.pinned;if(change.width!==undefined)b.width=change.width;}
  else if(change.op==='setBlockVisibility')b.hidden=change.hidden;
  else if(change.op==='setLayoutLock')b.layoutLock=change.lock;
  else {const slot=composition.sections.find(s=>s.id===change.sectionId)?.slots.find(s=>s.id===change.slotId);if(!slot)throw new DomainError(400,'slot_unavailable','Unknown section/slot destination.');const keep=change.op==='upsertBlock'&&slot.blockIds.includes(blockId);if(!keep){for(const s of composition.sections)for(const slot of s.slots)slot.blockIds=slot.blockIds.filter(v=>v!==blockId);slot.blockIds.splice(change.op==='moveBlock'?change.index:slot.blockIds.length,0,blockId);}}
 }
 const data:Record<string,unknown>={projectComposition:composition,...(!existing?{body:request.body??'',title:request.title??request.projectId}:{})};
 for(const [key,value] of Object.entries({title:request.title,body:request.body,projectDescription:request.description,learningScope:request.learningScope,projectCover:request.projectCover}))if(value!==undefined)data[key]=value;
 if(request.contentSections||request.changes?.some(c=>c.op==='upsertBlock'&&c.content))data.sections=contents;
 return {request,command:{operationId:request.operationId,expectedGeneration:request.expectedGeneration,action:existing?'update' as const:'create' as const,family:'journey' as const,id:request.projectId,expectedRev:request.expectedProjectRev,data},existing};
}
export async function applyProjectUpdate(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='gpt',preview=false){
 // Hash the semantic request before adaptation: identical retries must survive changed heads.
 const digest=await authoringDomain.hash({kind:'project-update-v1',input});const op=(input as any)?.operationId;
 const previous=typeof op==='string'?await env.DB!.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,op).first<{hash:string;response:string}>():null;
 // executeCommand hashes the exact semantic request through its internal options.
 if(previous&&!preview){if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This operation ID belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(previous.response));}
 const {request,command}=await projectCommand(env,owner,input);
 const options={projectAuthoring:true as const,overrideIds:request.explicitOverrideIds,digest};
 if(request.noteChanges?.length)return applyProjectBatch(env,owner,command as any,request,actor,digest,preview);
 if(preview){const p=await authoringDomain.prepared(env,owner,command as any,actor,undefined,options);return {valid:true,currentRev:request.expectedProjectRev,proposed:await authoringDomain.projectRecord(env,owner,p.record,true),summary:'Read-only proposal. Sources are retained; directly edited content remains protected unless explicitly targeted.'};}
 return executeCommand(env,owner,command as any,actor,undefined,options);
}
export async function setNotePagePin(env:Cloudflare.Env,owner:string,input:any,actor:Actor){
 const schema=z.object({operationId:id,expectedGeneration:z.string(),noteId:id,expectedNoteRev:z.number().int().min(1),target:projectRefSchema,pinned:z.boolean()}).strict();let r:z.infer<typeof schema>;try{r=schema.parse(input);}catch(e){throw new DomainError(400,'invalid_note_pin',(e as Error).message);}
 const digest=await authoringDomain.hash({kind:'note-pin-v1',request:r}),previous=await env.DB!.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,r.operationId).first<{hash:string;response:string}>();if(previous){if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This pin operation belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(previous.response));}
 const note=await readRecord(env,owner,'note',r.noteId);if(!note||note.rev!==r.expectedNoteRev)throw new DomainError(409,'revision_conflict','Save and refresh this Note before pinning.');
 const key=authoringDomain.stable(r.target),pins=(note.pagePins??[]).filter(p=>authoringDomain.stable(p)!==key);if(r.pinned)pins.push(r.target);
 return executeCommand(env,owner,{operationId:r.operationId,expectedGeneration:r.expectedGeneration,action:'update',family:'note',id:r.noteId,expectedRev:r.expectedNoteRev,data:{pagePins:pins}},actor,undefined,{projectAuthoring:true,digest});
}
export async function listPagePins(env:Cloudflare.Env,owner:string,target:unknown){
 const t=projectRefSchema.parse(target);const rows=await env.DB!.prepare("SELECT data FROM v2_records WHERE owner=? AND family='note' AND trashed_at IS NULL AND EXISTS(SELECT 1 FROM json_each(data,'$.pagePins') p WHERE json_extract(p.value,'$.family')=? AND json_extract(p.value,'$.id')=?) ORDER BY id LIMIT 33").bind(owner,t.family,t.id).all<{data:string}>();
 const notes=[];for(const row of rows.results.slice(0,32)){const raw=JSON.parse(row.data) as WorkspaceRecord;if(raw.pagePins?.some(p=>authoringDomain.stable(p)===authoringDomain.stable(t))){const note=await readRecord(env,owner,'note',raw.id);if(note)notes.push(note);}}
 return {notes,truncated:rows.results.length>32,limit:32};
}

/** One nonce-owned D1 batch for a Project and explicitly requested canonical Notes. */
async function applyProjectBatch(env:Cloudflare.Env,owner:string,command:any,request:z.infer<typeof updateSchema>,actor:Actor,digest:string,preview:boolean){
 const notes=request.noteChanges??[];if(new Set(notes.map(n=>n.id)).size!==notes.length)throw new DomainError(400,'duplicate_note','Each changed Note must appear once.');
 const proposals=[],internal=new Map<string,WorkspaceRecord>();
 for(const note of notes){const c={operationId:request.operationId,action:note.expectedRev?'update' as const:'create' as const,family:'note' as const,id:note.id,expectedRev:note.expectedRev,data:{title:note.title,body:note.body}};const p=await authoringDomain.prepared(env,owner,c,actor);if(note.expectedRev?p.existing?.rev!==note.expectedRev:await authoringDomain.rawReadRecord(env,owner,'note',note.id,true))throw new DomainError(409,'revision_conflict','A changed Note is unavailable or its revision changed.');proposals.push({command:c,...p});internal.set('note:'+note.id,p.record);}
 const p=await authoringDomain.prepared(env,owner,command,actor,internal,{projectAuthoring:true,overrideIds:request.explicitOverrideIds});proposals.push({command,...p});
 if(preview)return {valid:true,records:await Promise.all(proposals.map(p=>authoringDomain.projectRecord(env,owner,p.record,true))),summary:'Read-only atomic Project and Note proposal.'};
 const db=env.DB!,nonce=crypto.randomUUID(),win='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',winArgs=[owner,request.operationId,nonce];
 const checks=proposals.map(p=>({family:p.record.family,id:p.record.id,expectedRev:p.existing?.rev??0})),guards=proposals.flatMap(p=>p.guardedTargets),generation=generationGuard(env),image=imageAdmissionGuard(proposals.flatMap(p=>p.imageGuards),owner),media=mediaAdmissionGuard(proposals.flatMap(p=>p.mediaGuards),owner);
 const condition=`NOT EXISTS(SELECT 1 FROM json_each(?) m WHERE (json_extract(m.value,'$.expectedRev')=0 AND EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id'))) OR (json_extract(m.value,'$.expectedRev')>0 AND NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id') AND r.rev=json_extract(m.value,'$.expectedRev') AND r.trashed_at IS NULL))) AND NOT EXISTS(SELECT 1 FROM json_each(?) g WHERE NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(g.value,'$.family') AND r.id=json_extract(g.value,'$.id') AND r.rev=json_extract(g.value,'$.rev') AND r.trashed_at IS NULL)) AND 1=1${generation.sql}${image.sql}${media.sql}`;
 const recordRefs=proposals.map(p=>({family:p.record.family,id:p.record.id,rev:p.record.rev})),receipt={operationId:request.operationId,status:'committed',recordRef:recordRefs.at(-1),recordRefs,replayed:false},rows=JSON.stringify(proposals.map(p=>({family:p.record.family,id:p.record.id,rev:p.record.rev,data:JSON.stringify(p.record),rendition:p.record.rendition??null,at:p.record.updatedAt,synthetic:p.record.synthetic?1:0,action:p.command.action})));
 const statements=[db.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) VALUES(?,?,?,?,200,json(CASE WHEN ${condition} THEN ? ELSE 'project batch conflict' END))`).bind(owner,request.operationId,digest,nonce,JSON.stringify(checks),owner,owner,JSON.stringify(guards),owner,...generation.args,...image.args,...media.args,JSON.stringify(receipt)),
 db.prepare(`INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.data'),json_extract(value,'$.rev'),NULL,? FROM json_each(?) WHERE ${win} ON CONFLICT(owner,family,id) DO UPDATE SET data=excluded.data,rev=excluded.rev,last_operation=excluded.last_operation`).bind(owner,request.operationId,rows,...winArgs),
 db.prepare(`INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.rev'),json_extract(value,'$.data'),json_extract(value,'$.rendition') FROM json_each(?) WHERE ${win}`).bind(owner,rows,...winArgs),
 db.prepare(`INSERT INTO v2_activity(owner,id,family,record_id,verb,actor,synthetic,at) SELECT ?,?||':'||json_extract(value,'$.family')||':'||json_extract(value,'$.id'),json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.action'),?,json_extract(value,'$.synthetic'),json_extract(value,'$.at') FROM json_each(?) WHERE ${win}`).bind(owner,request.operationId,actor,rows,...winArgs)];
 for(const p of proposals){statements.push(...imageAttachmentStatements(env,owner,p.images,p.record,request.operationId),...mediaAttachmentStatements(env,owner,p.media,p.record,request.operationId));}
 try{await db.batch(statements);}catch{const saved=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,request.operationId).first<{hash:string;response:string}>();if(saved){if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(saved.response));}await assertGenerationCurrent(env);throw new DomainError(409,'project_transaction_conflict','The Project or a Note changed; the complete update was rolled back.');}
 const saved=await db.prepare('SELECT hash,nonce,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,request.operationId).first<{hash:string;nonce:string;response:string}>();if(!saved)throw new DomainError(503,'uncertain_result','Retain this operation and inspect its receipt.');if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation belongs to another payload.');return saved.nonce===nonce?{...receipt,record:await authoringDomain.projectRecord(env,owner,p.record)}:authoringDomain.receiptMetadata(JSON.parse(saved.response));
}
