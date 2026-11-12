import {z} from 'zod';
import {DomainError,authoringDomain,readRecord} from './domain';
import {generationContext,requireGeneration,generationGuard,assertGenerationCurrent} from './generations';

const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const targetSchema=z.object({projectId:id,sectionId:id,partId:id}).strict();
const kindSchema=z.enum(['table','dialogue','code','example','observation']);
const cellsSchema=z.array(z.string().max(12000)).min(1).max(8);
const reviewSchema=z.object({result:z.enum(['accepted','suggestion','uncertain']),explanation:z.string().min(1).max(3000)}).strict();
export const contributionCommandSchema=z.object({
 operationId:id,expectedGeneration:z.string().max(160),expectedProjectRev:z.number().int().min(1),
 target:targetSchema,id,expectedRevision:z.number().int().min(0),action:z.enum(['save','remove','review']),
 kind:kindSchema.optional(),columns:z.array(z.string().min(1).max(180)).min(1).max(8).optional(),cells:cellsSchema.optional(),review:reviewSchema.optional(),
}).strict();
const listSchema=z.object({projectId:id,sectionId:id.optional(),partId:id.optional(),after:z.string().max(40).optional(),cursor:z.string().max(210).optional(),limit:z.number().int().min(1).max(40).default(40)}).strict();
type Row={owner:string;project_id:string;section_id:string;part_id:string;id:string;revision:number;kind:string;columns_json:string;cells_json:string;review_json:string|null;deleted:number;updated_at:string;last_operation:string};
const shape=(row:Row)=>({id:row.id,target:{projectId:row.project_id,sectionId:row.section_id,partId:row.part_id},revision:row.revision,kind:row.kind,columns:JSON.parse(row.columns_json) as string[],cells:JSON.parse(row.cells_json) as string[],review:row.review_json?JSON.parse(row.review_json):null,deleted:!!row.deleted,updatedAt:row.updated_at});

async function project(env:Cloudflare.Env,owner:string,id:string){
 const record=await readRecord(env,owner,'journey',id);
 if(!record||record.trashedAt)throw new DomainError(404,'project_unavailable','This Project is unavailable.');
 return record;
}

/** An exact Project read (including synthetic lab histories) precedes every list. */
export async function readProjectContributions(env:Cloudflare.Env,owner:string,input:unknown){
 const parsed=listSchema.safeParse(input);if(!parsed.success)throw new DomainError(400,'invalid_contribution_query',parsed.error.message);
 const q=parsed.data,record=await project(env,owner,q.projectId);
 if(q.after&&!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(q.after))throw new DomainError(400,'invalid_cursor','Use the exact updatedAt returned from a previous Project contribution read.');
 const cursor=q.cursor?.split('|');if(q.cursor&&(cursor?.length!==2||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(cursor[0])||!id.safeParse(cursor[1]).success))throw new DomainError(400,'invalid_cursor','Use an exact nextCursor returned by the contribution reader.');
 const clauses=['owner=?','project_id=?',...(q.sectionId?['section_id=?']:[]),...(q.partId?['part_id=?']:[]),...(q.after?['updated_at>=?']:[]),...(cursor?['(updated_at>? OR (updated_at=? AND id>?))']:[])];
 const binds=[owner,q.projectId,...(q.sectionId?[q.sectionId]:[]),...(q.partId?[q.partId]:[]),...(q.after?[q.after]:[]),...(cursor?[cursor[0],cursor[0],cursor[1]]:[])];
 const rows=await env.DB!.prepare(`SELECT * FROM v2_project_contributions WHERE ${clauses.join(' AND ')} ORDER BY updated_at,id LIMIT ?`).bind(...binds,q.limit+1).all<Row>();
 const all=rows.results,visible=all.slice(0,q.limit);
 return {contract:'minamo.project-contributions.v1',project:{id:record.id,title:record.title,revision:record.rev},entries:visible.map(shape),truncated:all.length>q.limit,nextCursor:all.length>q.limit?visible.at(-1)!.updated_at+'|'+visible.at(-1)!.id:null,
  guidance:'Learner entries are separate from canonical Project content. Review is GPT-provisional, tied to one exact entry revision; editing invalidates the current review. Use an exact id/revision and expected Project revision for writes. No automatic review or canonical merge.'};
}

export async function applyProjectContribution(env:Cloudflare.Env,owner:string,input:unknown,actor:'user'|'gpt'){
 const parsed=contributionCommandSchema.safeParse(input);if(!parsed.success)throw new DomainError(400,'invalid_contribution',parsed.error.message);
 const q=parsed.data,scope=q.target,ctx=generationContext(env);if(ctx)requireGeneration(ctx,q.expectedGeneration);
 if((q.action==='save'&&(!q.cells||!q.columns||q.columns.length!==q.cells.length||!q.cells.some(cell=>cell.trim())||!q.kind))||
    (q.action==='review'&&(!q.review||actor!=='gpt'))||
    (q.action!=='save'&&(q.cells||q.columns||q.kind))||
    (q.action!=='review'&&q.review))throw new DomainError(400,'invalid_contribution_action','Supply only the fields permitted by this action; reviews require an explicit GPT MCP call.');
 const digest=await authoringDomain.hash({contract:'project-contributions-v1',actor,input:q});
 const existingOp=await env.DB!.prepare('SELECT hash,receipt_json FROM v2_project_contribution_operations WHERE owner=? AND id=?').bind(owner,q.operationId).first<{hash:string;receipt_json:string}>();
 if(existingOp){if(existingOp.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation ID belongs to a different contribution change.');return {...JSON.parse(existingOp.receipt_json),replayed:true};}
 const record=await project(env,owner,scope.projectId);
 if(record.rev!==q.expectedProjectRev)throw new DomainError(409,'project_revision_conflict','The Project changed. Read its current content before applying the contribution update.');
 const part=record.sections?.find(s=>s.id===scope.sectionId)?.parts.find(p=>p.id===scope.partId);
 if(!part)throw new DomainError(409,'target_changed','The exact Project section/part is no longer current. Retain the contribution and choose an explicit new target.');
 if(q.action==='save'&&(
  q.kind==='table'&&part.kind!=='table'||
  q.kind==='code'&&part.kind!=='code'||
  q.kind==='dialogue'&&part.interactive?.type!=='language-dialogue'||
  q.kind==='example'&&!(['paragraph','callout'].includes(part.kind)&&/^(ja|zh)(-|$)/i.test(part.language??(part.semantic?.kind==='ruby'?part.semantic.language.language:'')))||
  q.kind==='observation'&&!(part.kind==='interactive'&&['python-canvas','parameter-explorer','pygbag'].includes(part.interactive?.type??''))
 ))throw new DomainError(400,'target_type_mismatch','The selected Project part does not match this contribution kind.');
 const old=await env.DB!.prepare('SELECT * FROM v2_project_contributions WHERE owner=? AND project_id=? AND id=?').bind(owner,scope.projectId,q.id).first<Row>();
 if(old&&[old.section_id,old.part_id].join(':')!==[scope.sectionId,scope.partId].join(':'))throw new DomainError(409,'target_mismatch','This contribution identity already belongs to another exact Project part.');
 if((old?.revision??0)!==q.expectedRevision||q.action!=='save'&&!old||old?.deleted&&q.action!=='save')throw new DomainError(409,'revision_conflict','This contribution changed. Read the current entry before retrying.');
 const revision=q.expectedRevision+1,updatedAt=new Date().toISOString(),nonce=crypto.randomUUID();
 const columns=q.action==='save'?q.columns!:JSON.parse(old!.columns_json),cells=q.action==='save'?q.cells!:JSON.parse(old!.cells_json);
 const review=q.action==='review'?{...q.review!,revision,reviewedContributionRevision:q.expectedRevision,reviewedAt:updatedAt,basis:'gpt-provisional'}:q.action==='save'?null:old?.review_json?JSON.parse(old.review_json):null;
 const entry={id:q.id,target:scope,revision,kind:q.kind??old!.kind,columns,cells,review,deleted:q.action==='remove',updatedAt};
 const receipt={operationId:q.operationId,status:'committed',entryRef:{projectId:scope.projectId,id:q.id,revision},actor,action:q.action,replayed:false};
 const generation=generationGuard(env),db=env.DB!;
 const guard=`EXISTS (SELECT 1 FROM v2_records WHERE owner=? AND family='journey' AND id=? AND rev=? AND trashed_at IS NULL) AND ${q.expectedRevision===0?`NOT EXISTS (SELECT 1 FROM v2_project_contributions WHERE owner=? AND project_id=? AND id=?)`:`EXISTS (SELECT 1 FROM v2_project_contributions WHERE owner=? AND project_id=? AND id=? AND revision=?)`} ${generation.sql}`;
 const guardArgs=[owner,scope.projectId,q.expectedProjectRev,owner,scope.projectId,q.id,...(q.expectedRevision?[q.expectedRevision]:[]),...generation.args];
 const winning='EXISTS (SELECT 1 FROM v2_project_contribution_operations WHERE owner=? AND id=? AND nonce=?)',win=[owner,q.operationId,nonce];
 const sql=`INSERT OR IGNORE INTO v2_project_contribution_operations(owner,id,hash,nonce,receipt_json) SELECT ?,?,?,?,? WHERE ${guard}`;
 const write=`INSERT INTO v2_project_contributions(owner,project_id,section_id,part_id,id,revision,kind,columns_json,cells_json,review_json,deleted,updated_at,last_operation) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE ${winning} ON CONFLICT(owner,project_id,id) DO UPDATE SET revision=excluded.revision,kind=excluded.kind,columns_json=excluded.columns_json,cells_json=excluded.cells_json,review_json=excluded.review_json,deleted=excluded.deleted,updated_at=excluded.updated_at,last_operation=excluded.last_operation`;
 try{await db.batch([
  db.prepare(sql).bind(owner,q.operationId,digest,nonce,JSON.stringify(receipt),...guardArgs),
  db.prepare(write).bind(owner,scope.projectId,scope.sectionId,scope.partId,q.id,revision,entry.kind,JSON.stringify(columns),JSON.stringify(cells),review?JSON.stringify(review):null,entry.deleted?1:0,updatedAt,q.operationId,...win),
  db.prepare(`INSERT INTO v2_project_contribution_revisions(owner,project_id,id,revision,snapshot_json) SELECT ?,?,?,?,? WHERE ${winning}`).bind(owner,scope.projectId,q.id,revision,JSON.stringify(entry),...win),
 ]);}catch{await assertGenerationCurrent(env);throw new DomainError(409,'contribution_conflict','The contribution changed during save; no partial update was committed. Read its current revision.');}
 const result=await db.prepare('SELECT hash,nonce,receipt_json FROM v2_project_contribution_operations WHERE owner=? AND id=?').bind(owner,q.operationId).first<{hash:string;nonce:string;receipt_json:string}>();
 if(!result)throw new DomainError(409,'contribution_conflict','The Project or contribution changed. Read the current entry; your draft has not been discarded.');
 if(result.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation ID belongs to a different request.');
 return {...JSON.parse(result.receipt_json),replayed:result.nonce!==nonce,entry};
}
