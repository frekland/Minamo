import type {Actor,Family,LearningDevelopment,LearningWorkTarget,RecordLink,WorkspaceRecord} from './contracts';
import {DomainError,readRecord,readRendition} from './domain';
import {generationContext,assertGenerationCurrent} from './generations';
import {learningScopeSql,matchesLearningScope,parseLearningScopeQuery,type LearningScopeQuery} from './learning-spaces';
import {getProjectContext} from './project-context';
import {learningDestination,readContinuityDevelopment} from './learning-work';
import {buildRecordLink} from './reading-links';
import {parseNoteTerminalPlacements} from './note-terminal';

/** One read-model page, not a progress ledger or an interpretation of intent.
 * SQL chooses bounded identities; every displayed record and checkpoint is
 * independently admitted under the current owner and edition rights. */
type Focus={family:'journey'|'investigation';id:string};
export type ContinuityInput=LearningScopeQuery&{focus?:Focus;cursor?:string;limit?:number};
type Cursor={scope:string;at:string;key:string};
type Candidate={kind:'record'|'checkpoint';family:string;id:string;at:string;key:string;data:string};
type Path={edges:RecordLink[];target?:LearningWorkTarget};
type Item={title:string;source:{family:Family;id:string;rev:number;rendition?:string};author:Actor;at:string;destination?:string;basis:'authored-writing'|'saved-checkpoint'|'supplied-attempt'|'bookmark';preview:{text:string;complete:boolean};paths:Path[];checkpoint?:{id:string;revision:number;target:LearningWorkTarget;recordedRev:number;nextAction?:string;status:'active'|'superseded'|'withdrawn'|'unavailable'};exactRead:object;detailsDeferred:boolean};
const LIMITS={targets:12,identities:80,items:20,bytes:65536} as const;
const ident=(v:unknown):v is string=>typeof v==='string'&&v.length<=160&&/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(v);
function fail(code:string,message:string,status=400):never{throw new DomainError(status,code,message);}
const snapshot=async(env:Cloudflare.Env,owner:string)=>Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
const digest=async(value:unknown)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(b=>b.toString(16).padStart(2,'0')).join('');
function cursorOf(raw:unknown,scope:string):Cursor|undefined{
 if(raw===undefined)return undefined;
 if(typeof raw!=='string'||raw.length>2000)fail('invalid_evidence_cursor','Use the returned continuity cursor.');
 let parsed:any;try{parsed=JSON.parse(atob(raw));}catch{fail('invalid_evidence_cursor','Use the returned continuity cursor.');}
 if(parsed?.scope!==scope)fail('stale_evidence_cursor','Evidence or access changed; restart this scoped read.',409);
 if(typeof parsed.at!=='string'||!Number.isFinite(Date.parse(parsed.at))||typeof parsed.key!=='string'||parsed.key.length>340)fail('invalid_evidence_cursor','Use the returned continuity cursor.');
 return parsed as Cursor;
}
function prose(record:WorkspaceRecord){
 let text='',at=0;for(const block of record.family==='note'?parseNoteTerminalPlacements(record.body):[]){text+=record.body.slice(at,block.from)+'\n[External terminal capture; open the exact Note to inspect.]\n';at=block.to;}text+=record.body.slice(at);
 return {text:text.slice(0,700),complete:text.length<=700&&at===0,detailsDeferred:text.length>700||at>0||!!record.sections?.length};
}
function source(record:WorkspaceRecord){return {family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})};}
function refLink(record:WorkspaceRecord):RecordLink[]{
 const refs=[...record.links];if(record.anchor)refs.push({family:record.anchor.recordFamily??'article',id:record.anchor.articleId,...(record.anchor.rendition?{rendition:record.anchor.rendition}:{}),...(record.anchor.sectionId?{sectionId:record.anchor.sectionId}:{}),...(record.anchor.partId?{partId:record.anchor.partId}:{})});
 if(record.flagTarget?.kind==='record')refs.push({family:record.flagTarget.family,id:record.flagTarget.id});
 return refs;
}
async function admittedLink(env:Cloudflare.Env,owner:string,link:RecordLink,scope:LearningScopeQuery){
 const current=await readRecord(env,owner,link.family,link.id);if(!current||!matchesLearningScope(current,scope))return null;
 const selected=link.rendition?await readRendition(env,owner,link.id,link.rendition,link.family):current;
 if(!selected||!matchesLearningScope(selected,scope))return null;
 if(link.sectionId){const section=selected.sections?.find(s=>s.id===link.sectionId);if(!section)return null;const parts=link.partId?section.parts.filter(p=>p.id===link.partId):section.parts;if(!parts.length||parts.some(p=>p.unavailable))return null;}
 else if(selected.source?.excerpt?.unavailable||selected.sections?.some(s=>s.parts.some(p=>p.unavailable)))return null;
 return selected;
}
type AdmittedFocus={focus:Focus;head:WorkspaceRecord;questionPaths:Map<string,RecordLink[]>;stages:Set<string>;deferred:boolean;count:number};
async function readFocus(env:Cloudflare.Env,owner:string,focus:Focus|undefined,scope:LearningScopeQuery):Promise<AdmittedFocus|undefined>{
 if(!focus)return undefined;
 const head=await readRecord(env,owner,focus.family,focus.id);if(!head||!matchesLearningScope(head,scope))fail('evidence_focus_unavailable','The selected task is unavailable.',404);
 if(focus.family==='investigation')return {focus,head,questionPaths:new Map(),stages:new Set(),deferred:false,count:1};
 const outline:any=await getProjectContext(env,owner,{...scope,mode:'outline',projectId:focus.id,limit:50});
 const stages=new Set<string>(),questionPaths=new Map<string,RecordLink[]>();let deferred=!outline.relationshipCoverage.complete;
 for(const step of outline.steps){if(stages.size+questionPaths.size<LIMITS.targets-1)stages.add(step.stageId);else deferred=true;}
 const questions=[...outline.projectQuestions,...outline.steps.flatMap((step:any)=>step.questions)];
 for(const question of questions){if(questionPaths.has(question.id))continue;if(stages.size+questionPaths.size>=LIMITS.targets-1){deferred=true;continue;}
  const q=await readRecord(env,owner,'investigation',question.id);
  const relations=[...head.links.filter(l=>l.family==='investigation'&&l.id===question.id),...(q?.links.filter(l=>l.family==='journey'&&l.id===head.id)??[])];
  for(const relation of relations)if(await admittedLink(env,owner,relation,scope)){questionPaths.set(question.id,[relation]);break;}
 }
 return {focus,head,questionPaths,stages,deferred,count:1+stages.size+questionPaths.size};
}
async function recordPaths(env:Cloudflare.Env,owner:string,record:WorkspaceRecord,focus:AdmittedFocus|undefined,scope:LearningScopeQuery):Promise<{paths:Path[];deferred:boolean}>{
 const paths:Path[]=[],seen=new Set<string>(),links=refLink(record);let deferred=links.length>24;
 for(const link of links.slice(0,24)){
  if(!focus){
   if(!await admittedLink(env,owner,link,scope))continue;
   const path:Path={edges:[link]};if(link.family==='investigation')path.target={kind:'investigation',investigationId:link.id};
   else if(link.family==='journey'&&link.sourceContext?.stageId)path.target={kind:'journey-stage',journeyId:link.id,stageId:link.sourceContext.stageId};
   const key=JSON.stringify(path);if(!seen.has(key)){seen.add(key);paths.push(path);}
   if(paths.length===LIMITS.targets){deferred ||= links.length>LIMITS.targets;break;}
   continue;
  }
  const isFocus=link.family===focus.focus.family&&link.id===focus.focus.id;
  const q=link.family==='investigation'?focus.questionPaths.get(link.id):undefined;
  if(!isFocus&&!q)continue;
  if(!await admittedLink(env,owner,link,scope))continue;
  if(isFocus&&focus.focus.family==='journey'&&link.sourceContext?.stageId){
   if(!focus.stages.has(link.sourceContext.stageId))continue;
   const stage=focus.head.learningShape?.kind==='journey'?focus.head.learningShape.stages.find(s=>s.id===link.sourceContext?.stageId):undefined;
   if(!stage||(link.sectionId&&link.sectionId!==stage.sectionId)||(link.sourceContext.sectionId&&link.sourceContext.sectionId!==stage.sectionId))continue;
  }
  const path:Path={edges:[link,...(q??[])]};
  if(isFocus&&focus.focus.family==='investigation')path.target={kind:'investigation',investigationId:focus.focus.id};
  if(isFocus&&focus.focus.family==='journey'&&link.sourceContext?.stageId)path.target={kind:'journey-stage',journeyId:focus.focus.id,stageId:link.sourceContext.stageId};
  if(q)path.target={kind:'investigation',investigationId:link.id};
  const key=JSON.stringify(path);if(!seen.has(key)){seen.add(key);paths.push(path);}
  if(paths.length===LIMITS.targets){deferred ||= links.length>LIMITS.targets;break;}
 }
 return {paths,deferred};
}
function checkpointPaths(event:LearningDevelopment,focus:AdmittedFocus|undefined):Path[]{
 if(!focus)return [{edges:[],target:event.primaryTarget}];
 const targets=[event.primaryTarget,...(event.relatedContexts??[]).filter(c=>c.relevance==='explicit'||c.relevance==='accepted-relation').map(c=>c.target).filter((t):t is LearningWorkTarget=>t.kind==='investigation'||t.kind==='journey-stage')];
 const paths:Path[]=[];
 for(const target of targets){
  if(target.kind==='investigation'&&focus.focus.family==='investigation'&&target.investigationId===focus.focus.id)paths.push({edges:[],target});
  if(focus.focus.family==='journey'){
   if(target.kind==='journey-stage'&&target.journeyId===focus.focus.id&&focus.stages.has(target.stageId))paths.push({edges:[],target});
   if(target.kind==='investigation'&&focus.questionPaths.has(target.investigationId))paths.push({edges:focus.questionPaths.get(target.investigationId)!,target});
  }
 }
 return [...new Map(paths.map(p=>[JSON.stringify(p),p])).values()];
}
export async function readContinuityEvidence(env:Cloudflare.Env,owner:string,input:ContinuityInput={}){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['focus','cursor','limit','learningSpace','language'].includes(k)))fail('invalid_evidence_input','Use an optional exact focus, learning space and bounded cursor.');
 if(input.focus!==undefined&&(!input.focus||typeof input.focus!=='object'||Array.isArray(input.focus)||Object.keys(input.focus).some(k=>!['family','id'].includes(k))||!['journey','investigation'].includes(input.focus.family)||!ident(input.focus.id)))fail('invalid_evidence_focus','Choose an exact Project or Question.');
 const limit=input.limit??12;if(!Number.isSafeInteger(limit)||limit<1||limit>LIMITS.items)fail('invalid_evidence_limit','Choose 1–20 evidence items.');
 const selection=parseLearningScopeQuery(input),before=await snapshot(env,owner),generation=generationContext(env)?.generation??'legacy@0';
 const scope=await digest({contract:1,owner,generation,before,selection,focus:input.focus??null,limit});
 const cursor=cursorOf(input.cursor,scope),focus=await readFocus(env,owner,input.focus,selection);
 const recordScope=learningScopeSql('r',selection),targetScope=learningScopeSql('target',selection);
 const candidateSql=`SELECT * FROM (
 SELECT 'record' kind,r.family family,r.id id,json_extract(r.data,'$.updatedAt') at,r.family||':'||r.id key,r.data data FROM v2_records r
 WHERE r.owner=? AND r.trashed_at IS NULL AND r.family IN ('note','annotation','flag','run') AND (${recordScope.sql}) ${focus?'':"AND coalesce(json_extract(r.data,'$.synthetic'),0)=0"}
 UNION ALL
 SELECT 'checkpoint' kind,'development' family,d.id id,d.updated_at at,'development:'||d.id key,d.event_json data FROM v2_learning_developments d
 WHERE d.owner=? ${focus?'':"AND coalesce(json_extract(d.event_json,'$.synthetic'),0)=0"}
 AND EXISTS(SELECT 1 FROM v2_records target WHERE target.owner=d.owner AND target.trashed_at IS NULL AND target.family=CASE json_extract(d.event_json,'$.primaryTarget.kind') WHEN 'investigation' THEN 'investigation' ELSE 'journey' END AND target.id=coalesce(json_extract(d.event_json,'$.primaryTarget.investigationId'),json_extract(d.event_json,'$.primaryTarget.journeyId')) AND (${targetScope.sql}))
 ) candidates WHERE (? IS NULL OR at<? OR (at=? AND key<?)) ORDER BY at DESC,key DESC LIMIT 81`;
 const rows=(await env.DB!.prepare(candidateSql).bind(owner,...recordScope.args,owner,...targetScope.args,cursor?.at??null,cursor?.at??'',cursor?.at??'',cursor?.key??'').all<Candidate>()).results;
 const items:Item[]=[];let examined=0,checked=0,bytes=0,detailsDeferred=false,pathsDeferred=false;
 for(const row of rows.slice(0,LIMITS.identities)){
  if(items.length>=limit)break;
  examined++;
  let item:Item|undefined;
  if(row.kind==='record'){
   const record=await readRecord(env,owner,row.family as Family,row.id);
   if(!record||!matchesLearningScope(record,selection)||(!focus&&record.synthetic))continue;
   const linked=await recordPaths(env,owner,record,focus,selection),paths=linked.paths;pathsDeferred ||= linked.deferred;if(focus&&!paths.length)continue;
   if(record.family==='flag'&&(!record.bookmark?.active||record.bookmark.available===false))continue;
   checked++;const preview=record.family==='flag'?{text:'',complete:true,detailsDeferred:false}:prose(record);
   item={title:record.title,source:source(record),author:record.actor,at:record.updatedAt,destination:buildRecordLink(record,record.rendition?{rendition:record.rendition}:{}),basis:record.family==='flag'?'bookmark':record.family==='run'?'supplied-attempt':'authored-writing',preview:{text:preview.text,complete:preview.complete},paths,exactRead:{family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})},detailsDeferred:preview.detailsDeferred};
  }else{
   const event=JSON.parse(row.data) as LearningDevelopment;if(focus&&!checkpointPaths(event,focus).length)continue;
   const admitted=await readContinuityDevelopment(env,owner,event,selection);if(!admitted||(!focus&&event.synthetic))continue;
   const e=admitted.event,paths=checkpointPaths(e,focus);if(focus&&!paths.length)continue;
   checked++;const corrected=(await env.DB!.prepare("SELECT 1 found FROM v2_learning_developments WHERE owner=? AND withdrawn=0 AND json_extract(event_json,'$.supersedesId')=? LIMIT 1").bind(owner,e.id).first())!==null;
   const status=e.withdrawn?'withdrawn':corrected?'superseded':admitted.invalid||!admitted.recordedTarget?'unavailable':'active';
   const summary=!admitted.recordedTarget?'The checkpoint\'s pinned target edition is unavailable. Its original reading has not been replaced.':status==='withdrawn'?'This checkpoint was withdrawn.':e.summary;
   const preview={text:summary.slice(0,700),complete:summary.length<=700};
   item={title:(admitted.recordedTarget??admitted.targetHead).title,source:source(admitted.recordedTarget??admitted.targetHead),author:e.author,at:e.revisedAt??e.createdAt,...(admitted.recordedTarget?{destination:learningDestination(e.primaryTarget,e.targetRenditionAtRecording)}:{}),basis:'saved-checkpoint',preview,paths,checkpoint:{id:e.id,revision:e.revision,target:e.primaryTarget,recordedRev:e.targetRevAtRecording,...(status==='active'&&e.nextAction?{nextAction:e.nextAction}:{}),status},exactRead:{scope:'target',target:e.primaryTarget,developmentId:e.id},detailsDeferred:!preview.complete||!!e.detailsDeferred||!!e.evidenceUnavailable||!admitted.recordedTarget};
  }
  const size=JSON.stringify(item).length;if(bytes+size>LIMITS.bytes-4500){examined--;break;}bytes+=size;items.push(item);detailsDeferred ||= item.detailsDeferred;
 }
 const moreAvailable=examined<rows.length,at=rows[examined-1];
 const nextCursor=moreAvailable&&at?btoa(JSON.stringify({scope,at:at.at,key:at.key})):undefined;
 const gaps:('targets-deferred'|'records-deferred'|'details-deferred'|'external-unobserved')[]=[];
 if(focus?.deferred||pathsDeferred)gaps.push('targets-deferred');if(moreAvailable)gaps.push('records-deferred');if(detailsDeferred)gaps.push('details-deferred');gaps.push('external-unobserved');
 await assertGenerationCurrent(env);if(await snapshot(env,owner)!==before)fail('evidence_changed','Learning records or rights changed during this evidence read. Restart.',409);
 return {contract:'minamo.continuity-evidence.v1' as const,asOf:new Date().toISOString(),generation,snapshotVersion:before,scope:{...(focus?{focus:focus.focus}:{}),...selection},items,coverage:{completeWithinScope:!moreAvailable&&!focus?.deferred&&!pathsDeferred,moreAvailable,...(nextCursor?{nextCursor}:{}),checked:{targets:focus?.count??0,records:checked},limits:LIMITS,gaps,notice:moreAvailable||focus?.deferred||pathsDeferred?'This is a bounded page of eligible saved evidence. More linked work may exist; do not infer absence or resolution from missing items.':'Eligible saved evidence in this declared scan has been enumerated. This does not establish learner intent, completion, or what GPT last saw.'},lastSeenByGpt:'unknown' as const};
}
