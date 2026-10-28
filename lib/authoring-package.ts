import {resourceQuality} from './resource-quality';
import {prepareCatalogue} from './catalogue';
import {catalogueBatchStatements} from './catalogue-batch';
import {manuscriptEditionDigest} from './manuscript-source';
import {buildRecordLink} from './reading-links';
import {DomainError,authoringDomain,validateCommand,readRecord,queryRecords} from './domain';
import {generationContext,generationGuard,requireGeneration,assertGenerationCurrent} from './generations';
import {editorialPolicy,validateEditorialIntent,editorialFindings,EDITORIAL_POLICY_VERSION,type EditorialIntent} from './editorial-policy';
import type {Actor,Family,WorkspaceRecord,RecordLink} from './contracts';
export {editorialPolicy};
export type AuthoringMutation={key:string;family:'journey'|'article'|'area'|'investigation';id:string;action:'create'|'update';expectedRev:number;data:Record<string,any>;catalogue?:{summary?:string;references?:any[];expectedRev?:number}};
export type AuthoringPackage={operationId:string;expectedGeneration:string;records:AuthoringMutation[];editorial:EditorialIntent;detail?:boolean};
type ManuscriptAdapter={manuscript:Record<string,any>;warnings:{code:string;documentKey:string;message:string}[];sourceMap?:Record<string,unknown[]>};
const object=(x:unknown):x is Record<string,any>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const ident=(x:unknown)=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(x);
function manifest(input:unknown,compiledManuscript=false):AuthoringPackage{
 if(!object(input)||Object.keys(input).some(k=>!['operationId','expectedGeneration','records','editorial','detail'].includes(k))||!ident(input.operationId)||typeof input.expectedGeneration!=='string'||!Array.isArray(input.records)||input.records.length>16||input.detail!==undefined&&typeof input.detail!=='boolean')throw new DomainError(400,'invalid_package','Use one operation ID, exact generation, at most 16 record mutations and editorial intent.','package');
 if(new TextEncoder().encode(JSON.stringify(input)).length>(compiledManuscript?1024*1024:220000))throw new DomainError(413,'payload_too_large','Authoring package exceeds 220 KB.','package');
 const ids=new Set(),keys=new Set();let linkCount=0;
 for(const [i,r] of input.records.entries()){
  const path=`records[${i}]`;if(!object(r)||Object.keys(r).some(k=>!['key','family','id','action','expectedRev','data','catalogue'].includes(k))||!ident(r.key)||!ident(r.id)||!['journey','article','area','investigation'].includes(r.family)||!['create','update'].includes(r.action)||!object(r.data)||!Number.isSafeInteger(r.expectedRev)||(r.action==='create'?r.expectedRev!==0:r.expectedRev<1)||keys.has(r.key)||ids.has(r.family+':'+r.id))throw new DomainError(400,'invalid_package_record','Use unique record keys and targets, a permitted family and exact revision.',path);
  if(r.catalogue!==undefined&&r.family!=='article'||r.data.patch!==undefined||r.data.anchor!==undefined||r.data.source!==undefined||r.data.output!==undefined||r.data.evidence!==undefined)throw new DomainError(400,'package_scope','Packages author original learning records and explicit relationships only.',path+'.data');
  if((r.data.sections??[]).some((s:any)=>(s.parts??[]).some((p:any)=>['image','media','excerpt'].includes(p.kind))))throw new DomainError(400,'package_scope','Private assets and excerpts use their existing separately admitted command pathways.',path+'.data.sections');
  linkCount+=Array.isArray(r.data.links)?r.data.links.length:0;keys.add(r.key);ids.add(r.family+':'+r.id);
 }
 if(linkCount>64)throw new DomainError(400,'package_link_budget','Use at most 64 explicit relationships.','records');
 const editorial=validateEditorialIntent(input.editorial);
 if(!input.records.length&&!editorial.decisions.some(d=>['no-write','reuse-link'].includes(d.action)))throw new DomainError(400,'empty_package','An empty package needs an explicit no-write/reuse decision.','editorial.decisions');
 return {...input,editorial} as AuthoringPackage;
}
function located(error:unknown,index:number,key:string):never{if(error instanceof DomainError){if(error.path?.startsWith('data.'))error.path=`records[${index}].${error.path}`;else if(!error.path)error.path=`records[${index}].data`;error.recordKey=key;throw error;}throw error;}
async function prepare(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor,adapter?:ManuscriptAdapter,includeCandidates=false){
 const pkg=manifest(input,!!adapter),ctx=generationContext(env);if(ctx)requireGeneration(ctx,pkg.expectedGeneration);
 const findings=editorialFindings(pkg.records,pkg.editorial),coverage=[];
 for(const [i,r] of pkg.records.entries())for(const f of resourceQuality({family:r.family,...r.data,concepts:r.catalogue?.references??r.data.concepts}).findings)findings.push({...f,path:'records['+i+'].data.'+f.path,recordKey:r.key});
 for(const [i,ref] of pkg.editorial.coverage.examined.entries()){const current=await readRecord(env,owner,ref.family,ref.id);if(!current||current.rev!==ref.rev)throw new DomainError(409,'coverage_changed','An inspected coverage record changed or is unavailable. Read its current eligible sections and preview again.',`editorial.coverage.examined[${i}]`);coverage.push({family:ref.family,id:ref.id,rev:ref.rev});}
 const targets=new Map<string,WorkspaceRecord>();
 for(const [i,r] of pkg.records.entries())try{
  const c=validateCommand({operationId:pkg.operationId,action:r.action,family:r.family,id:r.id,expectedRev:r.expectedRev,data:{...r.data,links:[]}});
  const result=await authoringDomain.prepared(env,owner,c,actor,undefined,{skipCatalogue:true,skipReferencePolicy:true});
  if(r.action==='create'&&await authoringDomain.rawReadRecord(env,owner,r.family,r.id,true)||r.action==='update'&&result.existing?.rev!==r.expectedRev)throw new DomainError(409,'revision_conflict','A package member changed. Refresh before saving.');
  targets.set(r.family+':'+r.id,result.record);
 }catch(error){located(error,i,r.key);}
 const proposals=[];
 for(const [i,r] of pkg.records.entries())try{
  const data=structuredClone(r.data);
  if(adapter&&r.action==='update'){
   const raw=await authoringDomain.rawReadRecord(env,owner,r.family,r.id);
   // Independently accepted memberships are not owned by this manuscript's inline links.
   if(raw){const independent=raw.links.filter(l=>l.family==='area'&&!l.sourceContext);data.links=[...(data.links??[]),...independent.filter(l=>!(data.links??[]).some((n:RecordLink)=>n.family===l.family&&n.id===l.id&&!n.sourceContext))];}
  }
  if(Array.isArray(data.links))data.links=data.links.map((link:RecordLink)=>{const target=targets.get(link.family+':'+link.id);if(!target)return link;if(link.rendition&&link.rendition!==target.rendition)throw new DomainError(409,'destination_changed','An internal destination must use its prospective canonical rendition.','data.links');return {...link,...((link.sectionId||link.partId)?{rendition:target.rendition}:{})};});
  const c=validateCommand({operationId:pkg.operationId,action:r.action,family:r.family,id:r.id,expectedRev:r.expectedRev,data});const result=await authoringDomain.prepared(env,owner,c,actor,targets,{skipCatalogue:true,skipReferencePolicy:true});const catalogue=r.family==='article'?await prepareCatalogue(env,owner,result.record,r.catalogue,adapter?pkg.operationId:undefined):undefined;proposals.push({key:r.key,command:c,...result,catalogue});
 }catch(error){located(error,i,r.key);}
 const candidates=[];for(const r of (includeCandidates?pkg.records:[]).filter(r=>r.family==='article').slice(0,4)){const q=String(r.data.learningShape?.subject??r.data.title??'').slice(0,200);if(q){const found=await queryRecords(env,owner,{query:q,family:'article',limit:4});candidates.push({recordKey:r.key,query:q,candidates:found.records.map(v=>({family:v.family,id:v.id,rev:v.rev,title:v.title,rendition:v.rendition})),truncated:found.truncated});}}
 return {pkg,proposals,coverage,findings,candidates};
}
export async function previewAuthoringPackage(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='user',adapter?:ManuscriptAdapter){
 const p=await prepare(env,owner,input,actor,adapter,!adapter);return {valid:!p.findings.some(f=>f.severity==='block'||!adapter&&f.severity==='needs-review'),policyVersion:EDITORIAL_POLICY_VERSION,findings:p.findings,coverageCandidates:p.candidates,records:p.proposals.map(p=>({key:p.key,family:p.record.family,id:p.record.id,rev:p.record.rev,rendition:p.record.rendition,sectionCount:p.record.sections?.length??0,linkCount:p.record.links.length,...(p.catalogue?{catalogueRev:p.catalogue.rev,catalogue:p.catalogue.edition}:{})})),...(p.pkg.detail?{proposedRecords:p.proposals.map(p=>p.record)}:{}),summary:'Read-only canonical proposal; no record, activity, history or receipt was written. Preview does not grant write authority.'};
}
export async function applyAuthoringPackage(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='user',adapter?:ManuscriptAdapter){
 const pkg=manifest(input,!!adapter),ctx=generationContext(env);if(ctx)requireGeneration(ctx,pkg.expectedGeneration);
 const {detail,...immutable}=pkg,digest=await authoringDomain.hash(adapter?{kind:'manuscript-v1',request:adapter.manuscript}:{kind:'learning-package-v1',...immutable}),db=authoringDomain.db(env);
 const previous=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,pkg.operationId).first<{hash:string,response:string}>();
 if(previous){if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This package operation ID belongs to another payload.');return {...JSON.parse(previous.response),replayed:true};}
 const replayAfterRace=async()=>{const saved=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,pkg.operationId).first<{hash:string,response:string}>();if(!saved)return null;if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This package operation identity belongs to another payload.');return {...JSON.parse(saved.response),replayed:true};};
 let p:Awaited<ReturnType<typeof prepare>>;try{p=await prepare(env,owner,pkg,actor,adapter)}catch(error){const replay=await replayAfterRace();if(replay)return replay;throw error;}if(p.findings.some(f=>f.severity==='block'||!adapter&&f.severity==='needs-review'))throw new DomainError(409,'editorial_revision_required','Editorial preflight requires revision; inspect preview findings and correct the proposal.','editorial');
 const nonce=crypto.randomUUID();
 const conditions=[`NOT EXISTS(SELECT 1 FROM json_each(?) m WHERE (json_extract(m.value,'$.action')='create' AND EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id'))) OR (json_extract(m.value,'$.action')='update' AND NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id') AND r.rev=json_extract(m.value,'$.expectedRev') AND r.trashed_at IS NULL)))`];
 const args:unknown[]=[JSON.stringify(p.pkg.records.map(({family,id,action,expectedRev})=>({family,id,action,expectedRev}))),owner,owner];
 const guards=[...p.coverage,...p.proposals.flatMap(p=>p.guardedTargets)];
 if(guards.length){conditions.push(`NOT EXISTS(SELECT 1 FROM json_each(?) g WHERE NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(g.value,'$.family') AND r.id=json_extract(g.value,'$.id') AND r.rev=json_extract(g.value,'$.rev') AND r.trashed_at IS NULL))`);args.push(JSON.stringify(guards),owner);}
 const generation=generationGuard(env);conditions.push('1=1'+generation.sql);args.push(...generation.args);
 const refs=p.proposals.map(({key,record,catalogue})=>({key,family:record.family,id:record.id,rev:record.rev,rendition:record.rendition,...(catalogue?{catalogueRev:catalogue.rev,referenceCount:catalogue.edition.references.length}:{})}));
 const sourceDigest=adapter?await manuscriptEditionDigest(adapter.manuscript.manuscript,refs):null;
 const sourceEdition=adapter?{digest:sourceDigest,available:true,operationId:pkg.operationId,readTool:'read_minamo_manuscript_source'}:undefined;
 const receipt={...(adapter?{kind:'manuscript-v1',sourceEdition,sourceMap:adapter.sourceMap,coverageCandidates:p.candidates,warnings:[...adapter.warnings,...p.findings.filter(f=>f.severity!=='block').map(f=>({code:f.code,documentKey:f.recordKey??'',message:f.message,path:f.path,severity:f.severity,remediation:f.remediation}))],records:refs.map(ref=>({...ref,href:buildRecordLink(ref,{rendition:ref.rendition})}))}:{}),operationId:pkg.operationId,status:'committed',kind:adapter?'manuscript-v1':'learning-package-v1',policyVersion:EDITORIAL_POLICY_VERSION,recordRefs:refs,editorial:{decisions:pkg.editorial.decisions,coverage:pkg.editorial.coverage,sourcePlan:pkg.editorial.sourcePlan},replayed:false};
 // json('stale package') deliberately raises a SQLite error on failed preconditions.
 // D1 batch rollback then includes the operation claim, all records, histories and activity.
 const claim=db.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) VALUES(?,?,?,?,200,json(CASE WHEN ${conditions.join(' AND ')} THEN ? ELSE 'stale package' END))`).bind(owner,pkg.operationId,digest,nonce,...args,JSON.stringify(receipt));
 const winning='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',win=[owner,pkg.operationId,nonce],statements=[claim];
 const publicationRows=JSON.stringify(p.proposals.map(({record,command})=>({family:record.family,id:record.id,data:JSON.stringify(record),rev:record.rev,rendition:record.rendition??null,action:command.action,synthetic:record.synthetic?1:0,at:record.updatedAt})));
 statements.push(db.prepare(`INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.data'),json_extract(value,'$.rev'),NULL,? FROM json_each(?) WHERE ${winning} ON CONFLICT(owner,family,id) DO UPDATE SET data=excluded.data,rev=excluded.rev,last_operation=excluded.last_operation`).bind(owner,pkg.operationId,publicationRows,...win));
 statements.push(db.prepare(`INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.rev'),json_extract(value,'$.data'),json_extract(value,'$.rendition') FROM json_each(?) WHERE ${winning}`).bind(owner,publicationRows,...win));
 statements.push(db.prepare(`INSERT INTO v2_activity(owner,id,family,record_id,verb,actor,synthetic,at) SELECT ?,?||':'||json_extract(value,'$.family')||':'||json_extract(value,'$.id'),json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.action'),?,json_extract(value,'$.synthetic'),json_extract(value,'$.at') FROM json_each(?) WHERE ${winning}`).bind(owner,pkg.operationId,actor,publicationRows,...win));
 statements.push(...catalogueBatchStatements(env,owner,p.proposals,pkg.operationId,winning,win,adapter?pkg.operationId:undefined));
 if(adapter)statements.push(db.prepare(`INSERT INTO v2_manuscript_editions(owner,id,digest,source,refs,created_at) SELECT ?,?,?,?,?,? WHERE ${winning}`).bind(owner,pkg.operationId,sourceDigest,JSON.stringify(adapter.manuscript.manuscript),JSON.stringify(refs),new Date().toISOString(),...win));
 try{await db.batch(statements);}catch{const replay=await replayAfterRace();if(replay)return replay;await assertGenerationCurrent(env);throw new DomainError(409,'package_conflict','The atomic package could not commit. No package changes were saved; inspect operation status and refresh affected revisions before deliberate retry.');}
 const saved=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,pkg.operationId).first<{hash:string,response:string}>();if(!saved)throw new DomainError(503,'uncertain_result','Retain this exact package operation and check its status.');if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This operation identity belongs to another package.');return {...JSON.parse(saved.response),replayed:false};
}
