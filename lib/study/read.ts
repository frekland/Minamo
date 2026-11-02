import type {Family,LearningClaimCorrection,LearningDevelopment,WorkspaceRecord} from '../contracts';
import {readContext} from '../domain';
import {getLearningContext} from '../learning-work';

type OriginalRef={family:Family;id:string;rev:number;rendition?:string};
export type SavedUpdate={id:string;revision:number;author:string;savedAt:string;summary:string;nextAction?:string;nextQuestions:string[];decisions:Array<{choice:string;reason?:string;status:string;basis:string}>;claimCorrections:LearningClaimCorrection[];partial:boolean;withdrawn:boolean;supersedesId?:string};
export type WorkSourceEntry={source:OriginalRef;title:string;kind:'note'|'attempt'|'question'|'reference';savedAt:string;excerpt:string;via?:{family:'investigation';id:string;title:string};updates:SavedUpdate[]};
export type StudyWorkRead={work:{source:OriginalRef;title:string;body:string};entries:WorkSourceEntry[];directUpdates:SavedUpdate[];coverage:{partial:boolean;notes:string};asOf:string};

function ref(record:WorkspaceRecord):OriginalRef{return {family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})}}
function excerpt(body:string){return body.length>620?body.slice(0,620).trimEnd()+'…':body}
function updates(data:{developments?:LearningDevelopment[]}):SavedUpdate[]{return (data.developments??[]).filter(e=>!e.synthetic).map(event=>({id:event.id,revision:event.revision,author:event.author,savedAt:event.revisedAt??event.createdAt,summary:event.detailsDeferred||event.evidenceUnavailable?'This saved update needs an exact evidence check.':event.summary,partial:!!(event.detailsDeferred||event.evidenceUnavailable),withdrawn:!!event.withdrawn,claimCorrections:event.detailsDeferred||event.evidenceUnavailable?[]:event.claimCorrections??[],...(event.supersedesId?{supersedesId:event.supersedesId}:{}),...(event.detailsDeferred||event.evidenceUnavailable?{nextQuestions:[],decisions:[]}:{nextQuestions:event.nextQuestions??[],decisions:(event.decisions??[]).map(d=>({choice:d.choice,reason:d.reason,status:d.status,basis:d.basis})),...(event.nextAction?{nextAction:event.nextAction}:{})})})).sort((a,b)=>b.savedAt.localeCompare(a.savedAt)||a.id.localeCompare(b.id))}
function isConnected(a:WorkspaceRecord,b:WorkspaceRecord){return a.links.some(l=>l.family===b.family&&l.id===b.id)||b.links.some(l=>l.family===a.family&&l.id===a.id)}
/** Rights-checked bounded original read; no generated status, title matching or new state table. */
export async function readStudyWork(env:Cloudflare.Env,owner:string,id:string):Promise<StudyWorkRead>{
 const context=await readContext(env,owner,'work',id),work=context.record;
 if(!work||work.family!=='work')throw Error('This Work is unavailable.');
 const eligible=(record:WorkspaceRecord)=>!record.trashedAt&&!record.synthetic;
 const direct=context.related.filter((record:WorkspaceRecord)=>eligible(record)&&isConnected(record,work));
 let partial=!!context.relatedTruncated;
 const indirect:WorkSourceEntry[]=[];
 // A two-hop Question is admitted only if both explicit saved relation edges exist.
 const questions=direct.filter((record:WorkspaceRecord)=>record.family==='investigation').slice(0,5);
 for(const question of questions){try{
  const connected=await readContext(env,owner,'investigation',question.id);
  partial=partial||!!connected.relatedTruncated;
  for(const other of connected.related){
   if(!eligible(other)||!['note','run'].includes(other.family)||!isConnected(other,question)||isConnected(other,work))continue;
   indirect.push({source:ref(other),title:other.title,kind:other.family==='note'?'note':'attempt',savedAt:other.updatedAt,excerpt:excerpt(other.body),via:{family:'investigation',id:question.id,title:question.title},updates:[]});
  }
 }catch{partial=true}}
 const entries:WorkSourceEntry[]=[...direct.map((other:WorkspaceRecord)=>({source:ref(other),title:other.title,kind:other.family==='note'?'note' as const:other.family==='run'?'attempt' as const:other.family==='investigation'?'question' as const:'reference' as const,savedAt:other.updatedAt,excerpt:excerpt(other.body),updates:[]})),...indirect];
 const deduped=[...new Map(entries.map(entry=>[entry.source.family+':'+entry.source.id,entry])).values()];
 deduped.sort((a,b)=>b.savedAt.localeCompare(a.savedAt)||a.source.id.localeCompare(b.source.id));
 const retained=deduped.slice(0,24);if(deduped.length>retained.length)partial=true;
 const withUpdates=await Promise.all(retained.map(async entry=>{
  if(entry.source.family!=='note')return entry;
  try{const data=await getLearningContext(env,owner,{scope:'target',target:{kind:'record',family:'note',id:entry.source.id},limit:4});return {...entry,updates:updates(data)};}
  catch{partial=true;return entry}
 }));
 let directUpdates:SavedUpdate[]=[];
 try{directUpdates=updates(await getLearningContext(env,owner,{scope:'target',target:{kind:'record',family:'work',id:work.id},limit:4}));}catch{partial=true}
 return {work:{source:ref(work),title:work.title,body:work.body},entries:withUpdates,directUpdates,coverage:{partial,notes:partial?'Some linked material was not checked. Open an exact Note or Question to continue.':'A bounded set of explicitly connected originals, not a complete account of learning.'},asOf:new Date().toISOString()};
}
