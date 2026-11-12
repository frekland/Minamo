import type {Family,RecordLink,ReadingSelection,SelectedContextRef,WorkspaceRecord} from './contracts';
import {FAMILIES} from './contracts';
import {DomainError,readContext,readRecord,readRendition} from './domain';
import {assertGenerationCurrent,generationContext} from './generations';
import {parseLearningScopeQuery,matchesLearningScope,type LearningScopeQuery} from './learning-spaces';
import {readContinuityEvidence,type ContinuityInput} from './continuity-evidence';
import {readSavedRelationships,type SavedRelationship} from './saved-relationships';
import {buildRecordLink} from './reading-links';
import {readCollaborationPreferences,authoringGuidance} from './collaboration-preferences';
import {readProjectChanges} from './project-service';
import {compactProjectChanges} from './project-continuity';
import {readRecordChanges} from './record-continuity';

/** Read-side only. Selection, navigation history and source co-visits are never
 * saved links, inferred intentions, learner episodes or command permission. */
type ExactRef=SelectedContextRef;
export type WorkingContextInput=LearningScopeQuery&{
 selectedRefs?:ExactRef[];
 focus?:ContinuityInput['focus'];
 limit?:number;cursor?:string;focusCursor?:string;
};
type SourceReceipt={family:Family;id:string;rev:number;rendition?:string};
type SelectedReceipt={requested:ExactRef;status:'available'|'unavailable';source?:SourceReceipt;title?:string;actor?:WorkspaceRecord['actor'];at?:string;synthetic?:boolean;preview?:{text:string;complete:boolean};selection?:ReadingSelection;destination?:string};
type ContextRelation=SavedRelationship;
const MAX_SELECTION=6,MAX_BYTES=65536;
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
function pinnedTargetEligible(record:WorkspaceRecord,link:RecordLink){
 if(link.sectionId){const section=record.sections?.find(s=>s.id===link.sectionId);if(!section||link.partId&&!section.parts.some(part=>part.id===link.partId&&!part.unavailable))return false;}
 return true;
}
/** Authored Projects often store all writing in canonical sections and have an
 * intentionally empty legacy body. Return a bounded, verbatim orientation to
 * the material; never infer an accomplishment, conclusion or current task. */
function sourcePreview(record:WorkspaceRecord,maxChars:number){
 const body=record.body.trim(),sections=record.sections??[];
 if(!sections.length)return {text:record.body.slice(0,maxChars),complete:record.body.length<=maxChars};
 const names=sections.slice(0,6).map(s=>s.title).filter(Boolean);
 const fullOutline='Sections: '+names.join(' · ')+(sections.length>6?' · (+'+(sections.length-6)+' more)':'');
 const outlineMax=Math.floor(maxChars*.52),outline=fullOutline.length>outlineMax?fullOutline.slice(0,outlineMax-1)+'…':fullOutline;
 const first=sections.flatMap(s=>s.parts).find(part=>['paragraph','callout'].includes(part.kind)&&!!part.text.trim());
 const tail=sections.at(-1)?.parts.find(part=>['paragraph','callout'].includes(part.kind)&&!!part.text.trim());
 const pieces=[body,outline,first?.text.trim()??'',...(tail&&tail!==first&&maxChars>450?['Last section: '+tail.text.trim()]:[])].filter(Boolean);
 return {text:pieces.join('\n').slice(0,maxChars),complete:false};
}

/** One bounded canonical projection reusable by the website and MCP. Recent evidence
 * is joined by readContinuityEvidence, including its independent Project→Question
 * frontier. Selected source paths are independently rights-checked up to two hops. */
export async function readWorkingContext(env:Cloudflare.Env,owner:string,input:WorkingContextInput={}){
 const refs=checkedInput(input),scope=parseLearningScopeQuery(input),start=await snapshot(env,owner),generation=generationContext(env)?.generation??'legacy@0';
 // A specifically focused Project is itself an exact deliberate selection.
 // Seed it only when no separate source selection was supplied; this makes
 // focus-only fresh-chat reads return its canonical artefacts and links.
 if(!refs.length&&input.focus)refs.push({family:input.focus.family,id:input.focus.id});
 const projectId=input.focus?.family==='journey'?input.focus.id:undefined;
 const policy=await readCollaborationPreferences(env,owner,projectId);
 const limits={concise:5,balanced:12,detailed:20},previews={concise:220,balanced:450,detailed:800};
 const evidenceLimit=Math.min(input.limit??limits[policy.effective.contextDepth],limits[policy.effective.contextDepth]);
 const previewLimit=previews[policy.effective.contextDepth];
 const selected:SelectedReceipt[]=[],relations:ContextRelation[]=[];
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
 for(const requested of refs){
  const record=await admit(requested);
  if(!record){selected.push({requested,status:'unavailable'});continue;}
  let selection:ReadingSelection|undefined;
  if(requested.selection){const exact=await readContext(env,owner,requested.family,requested.id,requested.rendition,{selection:requested.selection,...scope});selection=exact.selection?{sectionId:exact.selection.sectionId,partId:exact.selection.partId,start:exact.selection.start,end:exact.selection.end,...(exact.selection.segments?{segments:exact.selection.segments}:{})}:undefined;}
  selected.push({requested,status:'available',source:receipt(record),title:record.title,actor:record.actor,at:record.updatedAt,synthetic:record.synthetic,preview:sourcePreview(record,previewLimit),...(selection?{selection}:{}),destination:buildRecordLink(record,{rendition:record.rendition})});
 }
 const relationshipPage=policy.effective.relatedMaterial==='saved'
  ?await readSavedRelationships(env,owner,refs,scope,start,input.cursor?.startsWith('rel1.')?input.cursor:undefined,JSON.stringify([policy.global.revision,policy.project?.revision??null]))
  :{relations:[],coverage:{complete:false,checked:0,limit:12,scanLimit:24,notice:'Saved links are hidden by preference.'}};
 relations.push(...relationshipPage.relations);
 const moreRelations=policy.effective.relatedMaterial==='saved'&&!relationshipPage.coverage.complete;
 // A focused evidence feed is itself a graph traversal: a saved inbound Note
 // can appear here even when outgoing `relations` is empty. Keep the exact
 // explicitly selected source, but never discover connected writing through
 // this second route when the owner has hidden related material.
 const standaloneSelection=refs.length>0&&!input.focus&&refs.every(ref=>ref.family!=='journey'&&ref.family!=='investigation');
 const hideFocusedEvidence=policy.effective.relatedMaterial==='none'&&!!input.focus;
 if(standaloneSelection&&(input.focusCursor||input.cursor&&!input.cursor.startsWith('rel1.')))fail('working_evidence_scope_changed','This selection uses saved relationships, not the global evidence feed. Restart without an evidence cursor.',409);
 if(hideFocusedEvidence&&(input.cursor||input.focusCursor))fail('working_evidence_disabled','Related evidence is hidden by the current preference; change it deliberately before paging.');
 const evidence:Awaited<ReturnType<typeof readContinuityEvidence>>=hideFocusedEvidence||standaloneSelection?{
  contract:'minamo.continuity-evidence.v1',asOf:new Date().toISOString(),generation,snapshotVersion:start,
  scope:{...scope,...(input.focus?{focus:input.focus}:{})},items:[],lastSeenByGpt:'unknown',
  coverage:{completeWithinScope:false,moreAvailable:false,moreTargetsAvailable:false,
   checked:{targets:0,records:0},limits:{targets:12,identities:80,items:20,bytes:65536},
   gaps:['external-unobserved'],
   notice:standaloneSelection?'This explicit standalone selection includes its admitted sources, revision history and saved relationships. The unrelated workspace-wide evidence feed was not searched. Use a blank working-context read to discover recent work, or focus a Project or Question for its evidence.':'Project-linked evidence was not searched because the owner hid related material. This says nothing about whether saved links exist.'}
 }:await readContinuityEvidence(env,owner,{focus:input.focus,limit:evidenceLimit,cursor:input.cursor?.startsWith('rel1.')?undefined:input.cursor,focusCursor:input.focusCursor,...scope});
 // Perform all source reads before the final generation/rights/snapshot check.
 // Even a mid-read Project edit must invalidate the combined projection.
 const selectedProject=projectId&&selected.find(item=>item.status==='available'&&item.source?.family==='journey'&&item.source.id===projectId);
 const projectChanges=selectedProject?compactProjectChanges(await readProjectChanges(env,owner,projectId,undefined,8),policy.effective.contextDepth==='concise'?3:policy.effective.contextDepth==='detailed'?6:5):undefined;
 // Explicit standalone selections are independent of Projects. Read only the
 // first two (bounded) saved histories; never treat co-selection as a link.
 const standalone=selected.filter(item=>item.status==='available'&&item.source&&item.source.family!=='journey').slice(0,2);
 const selectedChanges=await Promise.all(standalone.map(async item=>{
  const source=item.source!;
  const history=await readRecordChanges(env,owner,source.family,source.id,undefined,policy.effective.contextDepth==='concise'?2:policy.effective.contextDepth==='detailed'?5:3);
  return {requested:item.requested,selectedRevision:source.rev,...history};
 }));
 await assertGenerationCurrent(env);
 const policyAfter=await readCollaborationPreferences(env,owner,projectId);
 if(policyAfter.global.revision!==policy.global.revision||policyAfter.project?.revision!==policy.project?.revision)fail('working_preferences_changed','Collaboration settings changed during the contextual read. Retry.',409);
 if(evidence.snapshotVersion!==start||await snapshot(env,owner)!==start)fail('working_context_changed','Saved work or rights changed during this contextual read. Restart.',409);
 const unavailableSelected=selected.some(item=>item.status==='unavailable');
 // Changes to the explicitly chosen Project are independent of optional
 // related-material discovery. This cannot imply Work or source relationships.
 const relationsMuted=policy.effective.relatedMaterial==='none';
 const gaps=[...new Set([...evidence.coverage.gaps,...(moreRelations?['relations-deferred']:[]),...(unavailableSelected?['selected-source-unavailable']:[]),...(relationsMuted?['related-material-disabled-by-preference']:[])])];
 const coverage={...evidence.coverage,completeWithinScope:evidence.coverage.completeWithinScope&&!moreRelations&&!unavailableSelected&&!relationsMuted,moreRelations,relationships:relationshipPage.coverage,gaps,
  notice:relationsMuted?'Saved links were omitted by the owner’s collaboration preference. This is not evidence that no links exist.':moreRelations||unavailableSelected||!evidence.coverage.completeWithinScope?'Only bounded, currently admitted sources are shown. Additional links or records may be missing or unavailable; do not infer a settled task.':'This declared read completed; it does not establish learner intent, an observed external action or GPT memory.'};
 const value={contract:'minamo.working-context.v1' as const,asOf:evidence.asOf,generation,snapshotVersion:start,selectionIsSaved:false,selected,relations,evidence,coverage,lastSeenByGpt:'unknown' as const,
  ...(projectChanges?{projectChanges}:{}),
  ...(selectedChanges.length?{selectedChanges,selectedHistoryDeferred:selected.filter(item=>item.status==='available'&&item.source?.family!=='journey').length>selectedChanges.length}:{}),
  collaboration:{effective:policy.effective,authoring:authoringGuidance(policy.effective),globalRevision:policy.global.revision,projectRevision:policy.project?.revision??null,evidenceLimit,interpretation:'These preferences govern context projection, authoring guidance and the restriction on GPT Project saves. They do not grant writing permission or establish user intent.'}};
 if(new TextEncoder().encode(JSON.stringify(value)).byteLength>MAX_BYTES)fail('working_context_budget','Context exceeds the bounded read budget. Reduce the explicit selection or evidence page.',503);
 return value;
}
