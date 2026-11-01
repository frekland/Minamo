import type {Family,RecordLink,ReadingSelection,SelectedContextRef,WorkspaceRecord} from './contracts';
import {FAMILIES} from './contracts';
import {DomainError,readContext,readRecord,readRendition} from './domain';
import {assertGenerationCurrent,generationContext} from './generations';
import {parseLearningScopeQuery,matchesLearningScope,type LearningScopeQuery} from './learning-spaces';
import {readContinuityEvidence,type ContinuityInput} from './continuity-evidence';
import {atlasRecordLinks} from './atlas/project';
import {buildLinkedReadingLink,buildRecordLink} from './reading-links';

/** Read-side only. Selection, navigation history and source co-visits are never
 * saved links, inferred intentions, learner episodes or command permission. */
type ExactRef=SelectedContextRef;
export type WorkingContextInput=LearningScopeQuery&{
 selectedRefs?:ExactRef[];
 focus?:ContinuityInput['focus'];
 limit?:number;cursor?:string;focusCursor?:string;
};
type SourceReceipt={family:Family;id:string;rev:number;rendition?:string};
type SelectedReceipt={requested:ExactRef;status:'available'|'unavailable';source?:SourceReceipt;title?:string;actor?:WorkspaceRecord['actor'];at?:string;preview?:{text:string;complete:boolean};selection?:ReadingSelection;destination?:string};
type ContextRelation={from:SourceReceipt;to:SourceReceipt;quality:'saved-record-link'|'exact-edition'|'older-edition'|'derived-bounded-path';reason:string;path:RecordLink[];destination:string;opensCurrentSource:boolean};
const MAX_SELECTION=6,MAX_EDGES=12,MAX_EXPLORED=36,MAX_BYTES=65536;
const ident=(v:unknown)=>typeof v==='string'&&v.length<=160&&/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(v);
const pinned=(v:unknown)=>typeof v==='string'&&v.length<=240&&/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(v);
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const fail=(code:string,message:string,status=400):never=>{throw new DomainError(status,code,message);};
const snapshot=async(env:Cloudflare.Env,owner:string)=>Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
const receipt=(record:WorkspaceRecord):SourceReceipt=>({family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})});
function checkedRef(raw:unknown):ExactRef{
 if(!object(raw))return fail('invalid_working_selection','Select an exact eligible record identity.');
 if(Object.keys(raw).some(k=>!['family','id','rendition','selection'].includes(k))||!FAMILIES.includes(raw.family as Family)||!ident(raw.id)||raw.rendition!==undefined&&!pinned(raw.rendition))fail('invalid_working_selection','Select an exact eligible record identity.');
 if(raw.selection!==undefined&&(!raw.rendition||!object(raw.selection)||JSON.stringify(raw.selection).length>12000))fail('pinned_selection_required','Passage selection requires a specific retained rendition.');
 return {family:raw.family as Family,id:raw.id as string,...(raw.rendition?{rendition:raw.rendition as string}:{}),...(raw.selection?{selection:raw.selection as ReadingSelection}:{})};
}
function checkedInput(input:WorkingContextInput){
 if(!object(input)||Object.keys(input).some(k=>!['selectedRefs','focus','limit','cursor','focusCursor','learningSpace','language'].includes(k)))fail('invalid_working_context','Use a bounded selection, optional Project/Question focus and evidence cursors.');
 if(input.selectedRefs!==undefined&&(!Array.isArray(input.selectedRefs)||input.selectedRefs.length>MAX_SELECTION))fail('working_selection_budget','Choose at most six explicit sources.');
 const refs=(input.selectedRefs??[]).map(checkedRef),seen=new Set<string>(),unique:ExactRef[]=[];
 for(const ref of refs){const key=JSON.stringify(ref);if(!seen.has(key)){unique.push(ref);seen.add(key);}}
 return unique;
}
function eligible(record:WorkspaceRecord,scope:LearningScopeQuery){return matchesLearningScope(record,scope)&&!record.source?.excerpt?.unavailable&&!record.sections?.some(section=>section.parts.some(part=>part.unavailable));}
function sourceLinks(record:WorkspaceRecord){
 const links=atlasRecordLinks(record);
 if(record.anchor)links.push({family:record.anchor.recordFamily??'article',id:record.anchor.articleId,rendition:record.anchor.rendition,sectionId:record.anchor.sectionId,partId:record.anchor.partId});
 return links;
}
function pinnedTargetEligible(record:WorkspaceRecord,link:RecordLink){
 if(link.sectionId){const section=record.sections?.find(s=>s.id===link.sectionId);if(!section||link.partId&&!section.parts.some(part=>part.id===link.partId&&!part.unavailable))return false;}
 return true;
}

/** One bounded canonical projection reusable by the website and MCP. Recent evidence
 * is joined by readContinuityEvidence, including its independent Project→Question
 * frontier. Selected source paths are independently rights-checked up to two hops. */
export async function readWorkingContext(env:Cloudflare.Env,owner:string,input:WorkingContextInput={}){
 const refs=checkedInput(input),scope=parseLearningScopeQuery(input),start=await snapshot(env,owner),generation=generationContext(env)?.generation??'legacy@0';
 const selected:SelectedReceipt[]=[],relations:ContextRelation[]=[],seenRelations=new Set<string>();
 const recordCache=new Map<string,Promise<WorkspaceRecord|null>>();
 async function admit(link:RecordLink){
  const key=link.family+':'+link.id+':'+(link.rendition??'@current');
  if(!recordCache.has(key))recordCache.set(key,(async()=>{
   const current=await readRecord(env,owner,link.family,link.id);if(!current||!eligible(current,scope))return null;
   const target=link.rendition?await readRendition(env,owner,link.id,link.rendition,link.family):current;
   return target&&eligible(target,scope)&&pinnedTargetEligible(target,link)?target:null;
  })());
  return recordCache.get(key)!;
 }
 const queue:{root:SourceReceipt;record:WorkspaceRecord;path:RecordLink[];depth:number}[]=[];
 for(const requested of refs){
  const record=await admit(requested);
  if(!record){selected.push({requested,status:'unavailable'});continue;}
  let selection:ReadingSelection|undefined;
  if(requested.selection){const exact=await readContext(env,owner,requested.family,requested.id,requested.rendition,{selection:requested.selection,...scope});selection=exact.selection?{sectionId:exact.selection.sectionId,partId:exact.selection.partId,start:exact.selection.start,end:exact.selection.end,...(exact.selection.segments?{segments:exact.selection.segments}:{})}:undefined;}
  const text=record.body.slice(0,450);
  selected.push({requested,status:'available',source:receipt(record),title:record.title,actor:record.actor,at:record.updatedAt,preview:{text,complete:record.body.length<=450&&!record.sections?.length},...(selection?{selection}:{}),destination:buildRecordLink(record,{rendition:record.rendition})});
  queue.push({root:receipt(record),record,path:[],depth:0});
 }
 let explored=0,moreRelations=false;
 for(let i=0;i<queue.length;i++){
  const entry=queue[i];if(entry.depth>=2)continue;
  const links=sourceLinks(entry.record);
  for(let j=0;j<links.length;j++){
   if(explored>=MAX_EXPLORED||relations.length>=MAX_EDGES){moreRelations=true;break;}
   explored++;
   const link=links[j];if(!FAMILIES.includes(link.family)||!ident(link.id))continue;
   const target=await admit(link);if(!target)continue;
   const path=[...entry.path,link],key=JSON.stringify([entry.root,path]);
   if(seenRelations.has(key))continue;seenRelations.add(key);
   const current=link.rendition?await admit({family:link.family,id:link.id}):target;
   const isCurrent=!!link.rendition&&current?.rendition===target.rendition;
   const quality:ContextRelation['quality']=entry.depth>0?'derived-bounded-path':!link.rendition?'saved-record-link':isCurrent?'exact-edition':'older-edition';
   relations.push({from:entry.root,to:receipt(target),quality,path,destination:buildLinkedReadingLink(link),opensCurrentSource:isCurrent,
    reason:entry.depth>0?'Two independently admitted saved references; their path does not establish an episode or intent.':!link.rendition?'Saved broad record link without a pinned source edition.':isCurrent?'Saved reference to this retained edition.':'Saved reference to a different retained edition.'});
   if(entry.depth===0&&target.family==='note')queue.push({root:entry.root,record:target,path,depth:1});
  }
  if(moreRelations)break;
 }
 const evidence=await readContinuityEvidence(env,owner,{focus:input.focus,limit:input.limit,cursor:input.cursor,focusCursor:input.focusCursor,...scope});
 await assertGenerationCurrent(env);
 if(evidence.snapshotVersion!==start||await snapshot(env,owner)!==start)fail('working_context_changed','Saved work or rights changed during this contextual read. Restart.',409);
 const unavailableSelected=selected.some(item=>item.status==='unavailable');
 const gaps=[...new Set([...evidence.coverage.gaps,...(moreRelations?['relations-deferred']:[]),...(unavailableSelected?['selected-source-unavailable']:[])])];
 const coverage={...evidence.coverage,completeWithinScope:evidence.coverage.completeWithinScope&&!moreRelations&&!unavailableSelected,moreRelations,gaps,
  notice:moreRelations||unavailableSelected||!evidence.coverage.completeWithinScope?'Only bounded, currently admitted sources are shown. Additional links or records may be missing or unavailable; do not infer a settled task.':'This declared read completed; it does not establish learner intent, an observed external action or GPT memory.'};
 const value={contract:'minamo.working-context.v1' as const,asOf:evidence.asOf,generation,snapshotVersion:start,selectionIsSaved:false,selected,relations,evidence,coverage,lastSeenByGpt:'unknown' as const};
 if(new TextEncoder().encode(JSON.stringify(value)).byteLength>MAX_BYTES)fail('working_context_budget','Context exceeds the bounded read budget. Reduce the explicit selection or evidence page.',503);
 return value;
}
