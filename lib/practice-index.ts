import {z} from 'zod';
import type {Family,RecordLink,WorkspaceRecord} from './contracts';
import {DomainError,authoringDomain,readRecord,readRendition} from './domain';
import {activityStudioEnabled} from './activity/schema';
import {assertGenerationCurrent,generationContext} from './generations';
import {learningScopeSql,matchesLearningScope,parseLearningScopeQuery} from './learning-spaces';
import {reviewSchedule} from './practice';
import {foundryDigest} from './foundry/digest';
import {atlasRecordLinks} from './atlas/project';

const identity=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const rendition=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,239}$/);
const querySchema=z.object({
 kind:z.enum(['activities','attempts','reviews']).default('activities'),
 q:z.string().max(200).default(''),
 activityId:identity.optional(),activityRendition:rendition.optional(),
 sourceFamily:z.enum(['article','area','source','journey','investigation']).optional(),sourceId:identity.optional(),sourceRendition:rendition.optional(),sourceSection:identity.optional(),sourcePart:identity.optional(),
 learningSpace:z.enum(['all','computing','languages','unclassified']).optional(),
 language:z.enum(['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']).optional(),
 limit:z.number().int().min(1).max(30).default(20),cursor:z.string().max(1800).optional(),
 includeSynthetic:z.boolean().default(false)
}).strict().refine(q=>!q.activityRendition||!!q.activityId,{message:'An exact Activity edition also needs its Activity identity.'})
 .refine(q=>[q.sourceFamily,q.sourceId,q.sourceRendition].every(Boolean)||[q.sourceFamily,q.sourceId,q.sourceRendition,q.sourceSection,q.sourcePart].every(v=>v===undefined),{message:'Source discovery requires a family, ID and retained edition.'})
 .refine(q=>!q.sourcePart||!!q.sourceSection,{message:'A source part also needs its exact section.'})
 .refine(q=>!q.sourceFamily||q.kind==='activities',{message:'Source discovery is only available for authored Activities.'});
const cursorSchema=z.object({v:z.literal(1),scope:z.string().regex(/^[a-f0-9]{64}$/),updatedAt:z.string().datetime(),id:identity,asOf:z.string().datetime()}).strict();
type PageKey={updatedAt:string;id:string};
export type SourceActivityMatch={
 basis:'typed-activity-reference'|'saved-record-link';
 quality:'exact-part'|'exact-section'|'exact-edition'|'older-edition'|'newer-edition'|'different-edition'|'unversioned-saved-link';
 scope:'exact-part'|'section'|'edition';
 /** An unpinned authored link never inherits the edition being viewed. */
 sourceRendition?:string;
 sourceRef?:RecordLink;
 opensCurrentSource:boolean;
 reason:string;
};
export type PracticeIndexItem={record:WorkspaceRecord;activityTitle?:string;dueReviewCount:number;pendingReviewCount:number;nextReviewAt?:string;sourceMatch?:SourceActivityMatch};
const encode=(value:unknown)=>btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const namespaceVersion=async(env:Cloudflare.Env,owner:string)=>Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
type SourceSelector={family:Family;id:string;rendition:string;sectionId?:string;partId?:string};
const matchRank:Record<SourceActivityMatch['quality'],number>={'unversioned-saved-link':0,'older-edition':1,'newer-edition':1,'different-edition':1,'exact-edition':2,'exact-section':3,'exact-part':4};
/** Pure classification only. browsePractice separately admits every pinned edition under
 * current owner/rights before using the result. No lexical/same-session inference. */
export function sourceActivityCandidates(record:WorkspaceRecord,source:SourceSelector):SourceActivityMatch[]{
 const results:SourceActivityMatch[]=[];
 for(const ref of atlasRecordLinks(record)){
  if(ref.family!==source.family||ref.id!==source.id)continue;
  const pinned=!!ref.rendition,current=ref.rendition===source.rendition;
  const sameSection=current&&!!ref.sectionId&&!!source.sectionId&&ref.sectionId===source.sectionId;
  const scope:SourceActivityMatch['scope']=sameSection&&ref.partId&&source.partId&&ref.partId===source.partId?'exact-part':sameSection?'section':'edition';
  const quality:SourceActivityMatch['quality']=!pinned?'unversioned-saved-link':!current?'different-edition':scope==='exact-part'?'exact-part':scope==='section'?'exact-section':'exact-edition';
  const saved=record.links.some(link=>link.family===ref.family&&link.id===ref.id&&link.rendition===ref.rendition&&link.sectionId===ref.sectionId&&link.partId===ref.partId);
  results.push({basis:saved?'saved-record-link':'typed-activity-reference',quality,scope,
   ...(pinned?{sourceRendition:ref.rendition,sourceRef:{family:ref.family,id:ref.id,rendition:ref.rendition,...(ref.sectionId?{sectionId:ref.sectionId}:{}),...(ref.partId?{partId:ref.partId}:{})}}:{}),
   opensCurrentSource:current,
   reason:!pinned?'Saved source relationship without an edition; it does not identify the current text.':!current?'Authored reference to a different retained source edition; it does not establish a link to this edition.':scope==='exact-part'?'Authored reference to this retained part.':scope==='section'?'Authored reference to this retained section.':'Authored reference to this source edition, not necessarily this passage.'});
 }
 return results.sort((a,b)=>matchRank[b.quality]-matchRank[a.quality]||(a.basis==='typed-activity-reference'?-1:1));
}
export function sourceActivityMatch(record:WorkspaceRecord,source:SourceSelector){return sourceActivityCandidates(record,source)[0];}
function sourceEditionEligible(record:WorkspaceRecord,ref:RecordLink){
 if(record.source?.excerpt?.unavailable||record.sections?.some(section=>section.parts.some(part=>part.unavailable)))return false;
 if(ref.sectionId){const section=record.sections?.find(section=>section.id===ref.sectionId);if(!section)return false;if(ref.partId&&!section.parts.some(part=>part.id===ref.partId&&!part.unavailable))return false;}
 return true;
}

/** Read-only owner/generation projection. No learning record is created by browsing.
 * Bounded identity scans may produce a continuation before finding a match; callers
 * must follow nextCursor before presenting a complete-empty state. */
export async function browsePractice(env:Cloudflare.Env,owner:string,input:unknown={}){
 if(!activityStudioEnabled(env))throw new DomainError(404,'activity_disabled','Practice is unavailable while Activity Studio is disabled.');
 const parsed=querySchema.safeParse(input);if(!parsed.success)throw new DomainError(400,'invalid_practice_query',parsed.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));
 const q=parsed.data,learningScope=parseLearningScopeQuery(q),generation=generationContext(env)?.generation??'legacy@0',version=await namespaceVersion(env,owner);
 const source=q.sourceFamily?{family:q.sourceFamily,id:q.sourceId!,rendition:q.sourceRendition!,...(q.sourceSection?{sectionId:q.sourceSection}:{}),...(q.sourcePart?{partId:q.sourcePart}:{})}:undefined;
 let sourceRevision=0;
 if(source){
  const current=await readRecord(env,owner,source.family,source.id),retained=await readRendition(env,owner,source.id,source.rendition,source.family);
  if(!current||!retained||!matchesLearningScope(current,learningScope)||!matchesLearningScope(retained,learningScope)||(!q.includeSynthetic&&current.synthetic)||retained.sections?.some(section=>section.parts.some(part=>part.unavailable))||retained.source?.excerpt?.unavailable)throw new DomainError(404,'source_unavailable','The exact source is unavailable for Activity discovery.');
  sourceRevision=retained.rev;
  if(source.sectionId&&(!retained.sections?.some(section=>section.id===source.sectionId&&(!source.partId||section.parts.some(part=>part.id===source.partId&&!part.unavailable)))))throw new DomainError(404,'source_unavailable','The exact source section is unavailable.');
 }
 let after:z.infer<typeof cursorSchema>|undefined;
 if(q.cursor){try{if(!/^[A-Za-z0-9_-]+$/.test(q.cursor))throw Error();after=cursorSchema.parse(JSON.parse(atob(q.cursor.replaceAll('-','+').replaceAll('_','/'))));}catch{throw new DomainError(400,'invalid_practice_cursor','Use the exact practice continuation cursor.');}}
 const now=Date.now(),asOf=after?.asOf??new Date(now).toISOString();
 if(Date.parse(asOf)>now+1000)throw new DomainError(400,'invalid_practice_cursor','The review continuation time is invalid. Start a fresh read.');
 const titleQuery=q.q.trim().toLowerCase();
 const scope=await foundryDigest(new TextEncoder().encode(JSON.stringify({owner,generation,version,kind:q.kind,titleQuery,learningScope,activityId:q.activityId??null,activityRendition:q.activityRendition??null,source:source??null,limit:q.limit,includeSynthetic:q.includeSynthetic,asOf})));
 if(after&&after.scope!==scope)throw new DomainError(409,'practice_changed','Practice scope, saved work or permissions changed. Refresh this list.');
 if(q.activityId){const target=q.activityRendition?await readRendition(env,owner,q.activityId,q.activityRendition,'experiment'):await readRecord(env,owner,'experiment',q.activityId);if(!target?.activity||(!q.includeSynthetic&&target.synthetic))throw new DomainError(404,'activity_unavailable','This exact Activity is unavailable in the selected practice list.');}
 const filter=learningScopeSql('r',learningScope),args:unknown[]=[owner,q.kind==='activities'?'experiment':'run',...filter.args];
 let where=`r.owner=? AND r.family=? AND r.trashed_at IS NULL AND (${filter.sql}) AND json_type(r.data,'$.${q.kind==='activities'?'activity':'attempt'}')='object'`;
 if(!q.includeSynthetic)where+=" AND coalesce(json_extract(r.data,'$.synthetic'),0)=0";
 if(q.activityId){where+=q.kind==='activities'?' AND r.id=?':" AND json_extract(r.data,'$.attempt.activity.id')=?";args.push(q.activityId);}
 if(q.activityRendition){where+=q.kind==='activities'?" AND json_extract(r.data,'$.rendition')=?":" AND json_extract(r.data,'$.attempt.activity.rendition')=?";args.push(q.activityRendition);}
 if(after){where+=" AND (json_extract(r.data,'$.updatedAt')<? OR (json_extract(r.data,'$.updatedAt')=? AND r.id>?))";args.push(after.updatedAt,after.updatedAt,after.id);}
 const scanLimit=Math.min(120,Math.max(60,q.limit*4));
 const rows=(await env.DB!.prepare(`SELECT r.id,json_extract(r.data,'$.updatedAt') updatedAt FROM v2_records r WHERE ${where} ORDER BY json_extract(r.data,'$.updatedAt') DESC,r.id ASC LIMIT ?`).bind(...args,scanLimit+1).all<PageKey>()).results;
 const items:PracticeIndexItem[]=[],activityCache=new Map<string,Promise<WorkspaceRecord|null>>(),editionCache=new Map<string,Promise<WorkspaceRecord|null>>();
 let last:PageKey|undefined,scanned=0,bytes=0,stopped=false;
 for(const row of rows.slice(0,scanLimit)){
  const record=await readRecord(env,owner,q.kind==='activities'?'experiment':'run',row.id);
  let item:PracticeIndexItem|undefined;
  if(record&&(q.includeSynthetic||!record.synthetic)){
   if(q.kind==='activities'&&record.activity){
    // A revoked source block is projected to an unavailable instruction by the
    // domain. Do not advertise that formerly interactive Activity as ready.
    const raw=await authoringDomain.rawReadRecord(env,owner,'experiment',record.id);
    if(raw?.activity&&raw.activity.blocks.every(block=>record.activity!.blocks.some(visible=>visible.id===block.id&&visible.kind===block.kind))){
     let sourceMatch:SourceActivityMatch|undefined;
     if(source)for(const candidate of sourceActivityCandidates(record,source)){
      if(candidate.sourceRef){const ref=candidate.sourceRef,key=ref.family+':'+ref.id+':'+ref.rendition;
       if(!editionCache.has(key))editionCache.set(key,readRendition(env,owner,ref.id,ref.rendition!,ref.family));
       const linkedEdition=await editionCache.get(key)!;
       if(!linkedEdition||!matchesLearningScope(linkedEdition,learningScope)||!sourceEditionEligible(linkedEdition,ref))continue;
       if(candidate.quality==='different-edition')candidate.quality=linkedEdition.rev<sourceRevision?'older-edition':linkedEdition.rev>sourceRevision?'newer-edition':'different-edition';
      }
      sourceMatch=candidate;break;
     }
     if(!source||sourceMatch)item={record,dueReviewCount:0,pendingReviewCount:0,...(sourceMatch?{sourceMatch}:{})};
    }
   }else if(record.attempt){
    const target=record.attempt.activity,key=JSON.stringify([target.id,target.rendition]);
    if(!activityCache.has(key))activityCache.set(key,readRendition(env,owner,target.id,target.rendition,'experiment'));
    const activity=await activityCache.get(key)!;
    if(q.includeSynthetic||!activity?.synthetic){
     const practice=record.attempt.practice,activeSchedules=(practice?.corrections??[]).map(c=>reviewSchedule(practice!,c.id)).filter(s=>!!s&&!s.suspended&&!s.stale&&!!s.due),dueReviewCount=activeSchedules.filter(s=>Date.parse(s!.due!)<=Date.parse(asOf)).length;
     const nextReviewAt=activeSchedules.map(s=>s!.due!).sort()[0];
     // Only the newest feedback for the exact immutable response controls its
     // pending state. Later feedback on another answer cannot resolve it.
     const pendingReviewCount=(practice?.responses??[]).filter(response=>[...(practice?.feedback??[])].reverse().find(f=>f.responseId===response.id&&f.responseRevision===response.revision)?.verdict==='pending').length;
     if(q.kind!=='reviews'||dueReviewCount>0)item={record,...(activity?.activity?{activityTitle:activity.title}:{}),dueReviewCount,pendingReviewCount,...(nextReviewAt?{nextReviewAt}:{})};
    }
   }
  }
  if(item&&titleQuery&&![item.record.title,item.activityTitle??''].some(title=>title.toLowerCase().includes(titleQuery)))item=undefined;
  if(item){const size=new TextEncoder().encode(JSON.stringify(item)).byteLength;if(bytes+size>2000000){if(!last)throw new DomainError(503,'practice_read_budget','This saved practice exceeds the bounded list budget. Open its exact saved record.');stopped=true;break;}items.push(item);bytes+=size;}
  last=row;scanned++;
  if(items.length>=q.limit){stopped=scanned<rows.length;break;}
 }
 const more=stopped||rows.length>scanLimit;
 await assertGenerationCurrent(env);if(await namespaceVersion(env,owner)!==version)throw new DomainError(409,'practice_changed','Saved work changed during practice discovery. Refresh this list.');
 return {generation,kind:q.kind,asOf,...(source?{source}:{}),items,nextCursor:more&&last?encode({v:1,scope,...last,asOf}):null,truncated:more,scanIncomplete:more&&items.length<q.limit,limit:q.limit,byteLimit:2000000,notice:source?'Read-only authored Activity relationships for this eligible source. Exact, older-edition and unpinned links are labelled separately; a relationship is not proof about the currently displayed passage. An incomplete scan cannot establish absence.':q.kind==='reviews'?'Optional reviews are drawn only from your retained, current corrections. They do not measure proficiency.':'Existing Activities and saved answers; browsing creates no learning record.'};
}
