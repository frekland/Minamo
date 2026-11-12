import type {Family,WorkspaceRecord} from './contracts';
import {FAMILIES} from './contracts';
import {DomainError,readRecord,readRecordRevision} from './domain';
import {buildRecordLink} from './reading-links';
import {assertGenerationCurrent} from './generations';

/** Saved events, not inferred sessions, achievements, or an Activity feed. */
const short=(s:string,n=135)=>s.replace(/\s+/g,' ').trim().slice(0,n);
const preview=(s:string)=>short(s)||'(empty)';
/** Anchor each bounded excerpt at the actual first divergence, rather than
 * giving identical-looking beginnings when a long Note gains a late section. */
function focusedPair(before:string,after:string){
 let prefix=0;while(prefix<before.length&&prefix<after.length&&before[prefix]===after[prefix])prefix++;
 const around=(value:string)=>{
  const start=Math.max(0,prefix-24),end=Math.min(value.length,prefix+135);
  return (start?'…':'')+preview(value.slice(start,end))+(end<value.length?'…':'');
 };
 const a=around(before),b=around(after);
 if(a===b&&before!==after)return {before:'Text differs in whitespace or a bounded region; open exact edition.',after:'Text differs in whitespace or a bounded region; open exact edition.'};
 return {before:a,after:b};
}
const key=(r:WorkspaceRecord)=>({family:r.family,id:r.id,rev:r.rev,rendition:r.rendition});
type Difference={field:string;before?:string;after?:string};

function literalDifferences(newer:WorkspaceRecord,older?:WorkspaceRecord):Difference[]{
 const diffs:Difference[]=[];
 const add=(field:string,before:string|undefined,after:string|undefined)=>{if(before!==after)diffs.push({field,...(before!==undefined&&after!==undefined?focusedPair(before,after):{...(before!==undefined?{before:preview(before)}:{}),...(after!==undefined?{after:preview(after)}:{})})});};
 add('title',older?.title,newer.title);
 add('body',older?.body,newer.body);
 const parts=(r?:WorkspaceRecord)=>new Map((r?.sections??[]).flatMap(section=>section.parts.map(part=>[section.id+'/'+part.id,{label:section.title+' / '+part.id,text:part.text}] as const)));
 const before=parts(older),after=parts(newer);
 for(const id of new Set([...before.keys(),...after.keys()])){
  const a=before.get(id),b=after.get(id);
  if(a?.text!==b?.text)add('section '+(b?.label??a?.label??id),a?.text,b?.text);
 }
 const linked=(r?:WorkspaceRecord)=>JSON.stringify({links:r?.links??[],pagePins:r?.pagePins??[],anchor:r?.anchor??null});
 if(older&&linked(older)!==linked(newer))diffs.push({field:'saved relationships',before:`${older.links.length} links · ${older.pagePins?.length??0} pins`,after:`${newer.links.length} links · ${newer.pagePins?.length??0} pins`});
 if(older&&JSON.stringify((older.sections??[]).map(s=>[s.id,s.title,s.parts.map(p=>p.id)]))!==JSON.stringify((newer.sections??[]).map(s=>[s.id,s.title,s.parts.map(p=>p.id)])))diffs.push({field:'section arrangement',before:`${older.sections?.length??0} sections`,after:`${newer.sections?.length??0} sections`});
 return diffs;
}
export async function readRecordChanges(env:Cloudflare.Env,owner:string,f:Family,id:string,beforeRevision?:number,requestedLimit=8){
 if(!FAMILIES.includes(f)||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(id))throw new DomainError(400,'invalid_target','Choose a valid record identity.');
 if(beforeRevision!==undefined&&(!Number.isSafeInteger(beforeRevision)||beforeRevision<1))throw new DomainError(400,'invalid_revision','Choose a valid earlier saved revision.');
 if(!Number.isSafeInteger(requestedLimit)||requestedLimit<1||requestedLimit>20)throw new DomainError(400,'invalid_limit','Choose 1–20 saved revisions.');
 const start=Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
 const current=await readRecord(env,owner,f,id);
 if(!current)throw new DomainError(404,'record_unavailable','The saved record is unavailable.');
 if(beforeRevision!==undefined&&beforeRevision>current.rev)throw new DomainError(400,'invalid_revision','The requested revision is newer than the current record.');
 // One additional older row permits an accurate comparison for the last
 // displayed event; a second deferred row gives an honest continuation cue.
 const rows=(await env.DB!.prepare('SELECT revision FROM v2_revisions WHERE owner=? AND family=? AND id=? AND revision<=? ORDER BY revision DESC LIMIT ?').bind(owner,f,id,beforeRevision??current.rev,requestedLimit+2).all<{revision:number}>()).results;
 const saved=await Promise.all(rows.slice(0,requestedLimit+1).map(row=>readRecordRevision(env,owner,f,id,row.revision)));
 const entries=saved.slice(0,requestedLimit).map((record,index)=>{
  if(!record)throw new DomainError(409,'record_history_changed','A retained revision is unavailable. Retry.');
  const prior=saved[index+1]??undefined;
  const changes=literalDifferences(record,prior??undefined);
  const link=record.rendition?buildRecordLink(record,{rendition:record.rendition}):undefined;
  const destination=link?link+'&revision='+record.rev:undefined;
  return {...key(record),at:record.updatedAt,actor:record.actor,synthetic:record.synthetic,fictionalEvent:record.fictionalEvent??null,
   changes:changes.slice(0,4),changesOmitted:changes.length>4,unchangedContent:!!prior&&!changes.length,
   ...(destination?{destination}:{})};
 });
 await assertGenerationCurrent(env);
 const end=Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
 if(start!==end)throw new DomainError(409,'record_history_changed','Saved work or permissions changed during the history read. Retry.');
 return {contract:'minamo.record-changes.v1' as const,family:f,id,currentRevision:current.rev,entries,
  nextBeforeRevision:rows.length>requestedLimit?rows[requestedLimit].revision:null,
  notice:'Exact saved revisions with real save times and saved actor/synthetic labels. Differences are literal bounded excerpts from currently eligible material. No reasons, learner progress, external observations or GPT memory are inferred. Read each exact revision for full context.'};
}
