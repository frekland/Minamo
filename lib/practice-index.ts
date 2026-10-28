import {z} from 'zod';
import type {WorkspaceRecord} from './contracts';
import {DomainError,authoringDomain,readRecord,readRendition} from './domain';
import {activityStudioEnabled} from './activity/schema';
import {assertGenerationCurrent,generationContext} from './generations';
import {learningScopeSql,parseLearningScopeQuery} from './learning-spaces';
import {reviewSchedule} from './practice';
import {foundryDigest} from './foundry/digest';

const identity=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const rendition=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,239}$/);
const querySchema=z.object({
 kind:z.enum(['activities','attempts','reviews']).default('activities'),
 q:z.string().max(200).default(''),
 activityId:identity.optional(),activityRendition:rendition.optional(),
 learningSpace:z.enum(['all','computing','languages','unclassified']).optional(),
 language:z.enum(['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']).optional(),
 limit:z.number().int().min(1).max(30).default(20),cursor:z.string().max(1800).optional(),
 includeSynthetic:z.boolean().default(false)
}).strict().refine(q=>!q.activityRendition||!!q.activityId,{message:'An exact Activity edition also needs its Activity identity.'});
const cursorSchema=z.object({v:z.literal(1),scope:z.string().regex(/^[a-f0-9]{64}$/),updatedAt:z.string().datetime(),id:identity,asOf:z.string().datetime()}).strict();
type PageKey={updatedAt:string;id:string};
export type PracticeIndexItem={record:WorkspaceRecord;activityTitle?:string;dueReviewCount:number;pendingReviewCount:number;nextReviewAt?:string};
const encode=(value:unknown)=>btoa(JSON.stringify(value)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const namespaceVersion=async(env:Cloudflare.Env,owner:string)=>Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);

/** Read-only owner/generation projection. No learning record is created by browsing.
 * Bounded identity scans may produce a continuation before finding a match; callers
 * must follow nextCursor before presenting a complete-empty state. */
export async function browsePractice(env:Cloudflare.Env,owner:string,input:unknown={}){
 if(!activityStudioEnabled(env))throw new DomainError(404,'activity_disabled','Practice is unavailable while Activity Studio is disabled.');
 const parsed=querySchema.safeParse(input);if(!parsed.success)throw new DomainError(400,'invalid_practice_query',parsed.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));
 const q=parsed.data,learningScope=parseLearningScopeQuery(q),generation=generationContext(env)?.generation??'legacy@0',version=await namespaceVersion(env,owner);
 let after:z.infer<typeof cursorSchema>|undefined;
 if(q.cursor){try{if(!/^[A-Za-z0-9_-]+$/.test(q.cursor))throw Error();after=cursorSchema.parse(JSON.parse(atob(q.cursor.replaceAll('-','+').replaceAll('_','/'))));}catch{throw new DomainError(400,'invalid_practice_cursor','Use the exact practice continuation cursor.');}}
 const now=Date.now(),asOf=after?.asOf??new Date(now).toISOString();
 if(Date.parse(asOf)>now+1000)throw new DomainError(400,'invalid_practice_cursor','The review continuation time is invalid. Start a fresh read.');
 const titleQuery=q.q.trim().toLowerCase();
 const scope=await foundryDigest(new TextEncoder().encode(JSON.stringify({owner,generation,version,kind:q.kind,titleQuery,learningScope,activityId:q.activityId??null,activityRendition:q.activityRendition??null,limit:q.limit,includeSynthetic:q.includeSynthetic,asOf})));
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
 const items:PracticeIndexItem[]=[],activityCache=new Map<string,Promise<WorkspaceRecord|null>>();
 let last:PageKey|undefined,scanned=0,bytes=0,stopped=false;
 for(const row of rows.slice(0,scanLimit)){
  const record=await readRecord(env,owner,q.kind==='activities'?'experiment':'run',row.id);
  let item:PracticeIndexItem|undefined;
  if(record&&(q.includeSynthetic||!record.synthetic)){
   if(q.kind==='activities'&&record.activity){
    // A revoked source block is projected to an unavailable instruction by the
    // domain. Do not advertise that formerly interactive Activity as ready.
    const raw=await authoringDomain.rawReadRecord(env,owner,'experiment',record.id);
    if(raw?.activity&&raw.activity.blocks.every(block=>record.activity!.blocks.some(visible=>visible.id===block.id&&visible.kind===block.kind)))item={record,dueReviewCount:0,pendingReviewCount:0};
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
 return {generation,kind:q.kind,asOf,items,nextCursor:more&&last?encode({v:1,scope,...last,asOf}):null,truncated:more,scanIncomplete:more&&items.length<q.limit,limit:q.limit,byteLimit:2000000,notice:q.kind==='reviews'?'Optional reviews are drawn only from your retained, current corrections. They do not measure proficiency.':'Existing Activities and saved answers; browsing creates no learning record.'};
}
