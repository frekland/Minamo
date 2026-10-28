import {canonicalReadingParts,type WorkspaceRecord,type RecordLink} from '../contracts';
import {buildLinkedReadingLink,buildRecordLink} from '../reading-links';
import type {AtlasLens,AtlasNode,AtlasEdge,LearningGraph} from './types';
export const recordNodeId=(record:Pick<WorkspaceRecord,'family'|'id'>)=>record.family+':'+record.id;
/** Typed references are already owned, validated relationships. Do not require a
 * producer to duplicate them in links or let a legacy unpinned link retarget an Attempt. */
export function atlasRecordLinks(record:WorkspaceRecord):RecordLink[]{
 const attempt=record.attempt?.activity;
 const links=record.links.map(link=>attempt&&link.family===attempt.family&&link.id===attempt.id?{...link,rendition:attempt.rendition}:link);
 const add=(ref:RecordLink,reason:string)=>{if(!links.some(link=>link.family===ref.family&&link.id===ref.id&&link.rendition===ref.rendition&&link.sectionId===ref.sectionId&&link.partId===ref.partId))links.push({...ref,reason});};
 if(attempt)add(attempt,'Explicit saved Attempt for this immutable Activity edition; no outcome is inferred.');
 for(const block of record.activity?.blocks??[]){if(block.kind==='reading')add(block.ref,'Explicit connected material in the saved Activity.');if(block.kind==='practice'&&block.exercise.source)add(block.exercise.source,'Exact authored source for this practice item; not a mastery assertion.');if(block.kind==='listening')add(block.transcript.ref,'Exact aligned transcript for this listening Activity; playback is not comprehension evidence.');if(block.kind==='character'&&block.source)add(block.source,'Exact contextual word or passage for character inspection.');}
 return links;
}
export function atlasRecordEligible(record:WorkspaceRecord):boolean{return !record.trashedAt&&!(record.family==='source'&&record.source?.excerpt?.unavailable);}
export function atlasNode(record:WorkspaceRecord):AtlasNode{
 const typed=record as WorkspaceRecord & {activity?:{contract?:string};attempt?:{contract?:string}};
 return {id:recordNodeId(record),kind:typed.activity?.contract==='minamo.activity.v1'?'activity':typed.attempt?.contract==='minamo.attempt.v1'?'attempt':record.family,title:record.title,destination:{family:record.family,id:record.id,...(record.rendition?{rendition:record.rendition}:{})},href:buildRecordLink(record,{rendition:record.rendition}),rev:record.rev,updatedAt:record.updatedAt,basis:'saved-record',...(record.status?{status:{basis:'authored',value:record.status}}:{}),...(record.family==='run'?{evidence:record.evidence==='observed'?'saved observed Run; execution is not mastery':'supplied or illustrative output'}:{}),synthetic:record.synthetic};
}
/** Only permission-projected records and independently validated saved destinations enter here. */
export function projectLearningGraph(records:WorkspaceRecord[],links:{source:WorkspaceRecord;destination:RecordLink;target:WorkspaceRecord;index:number;anchor?:boolean}[],lens:AtlasLens):Pick<LearningGraph,'nodes'|'edges'>{
 const eligible=records.filter(atlasRecordEligible),nodes=eligible.map(atlasNode),edges:AtlasEdge[]=[],known=new Set(nodes.map(n=>n.id));
 const add=(edge:AtlasEdge)=>{if(edges.length<240&&known.has(edge.from)&&known.has(edge.to)&&!edges.some(e=>e.id===edge.id))edges.push(edge);};
 for(const {source,destination,target,index,anchor} of links){
  const from=recordNodeId(source),to=recordNodeId(target);if(!known.has(from)||!known.has(to))continue;
  const saved=atlasRecordLinks(source)[index],reason=anchor?'Saved exact passage anchor; this is a reference, not a learning outcome.':saved?.reason??'Explicit saved relation; no causal or proficiency claim.';
  add({id:`${from}:link:${index}:${to}${anchor?':anchor':''}`,from,to,relation:anchor?'references-passage':saved?.relation??'related',basis:anchor?'saved-anchor':'authored-link',accepted:true,reason,source:{family:source.family,id:source.id,rev:source.rev,...(source.rendition?{rendition:source.rendition}:{})},destination,href:buildLinkedReadingLink(destination),historical:!!destination.rendition&&destination.rendition!==eligible.find(r=>recordNodeId(r)===to)?.rendition});
 }
 for(const record of eligible){
  if(nodes.length>=120)break;const parent=recordNodeId(record),source={family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})};
  if(record.learningShape?.kind==='journey'&&record.rendition&&(lens==='route'||lens==='galaxy')){
   let previous:string|undefined;
   for(const stage of record.learningShape.stages){if(nodes.length>=120||!record.sections?.some(s=>s.id===stage.sectionId))break;
    const id=parent+':stage:'+stage.id,destination:RecordLink={family:record.family,id:record.id,rendition:record.rendition,sectionId:stage.sectionId},href=buildLinkedReadingLink(destination)+'&stage='+encodeURIComponent(stage.id);
    nodes.push({id,kind:'stage',title:stage.title,destination,href,rev:record.rev,updatedAt:record.updatedAt,basis:'authored-stage',evidence:stage.optional?'Optional authored direction':'Authored direction; not completion',synthetic:record.synthetic});known.add(id);
    add({id:id+':contains',from:parent,to:id,relation:'authored-stage',basis:'authored-stage',accepted:true,reason:stage.intent??'Authored Journey direction; no completion is inferred.',source,destination,href,historical:false});
    if(previous)add({id:previous+':next:'+id,from:previous,to:id,relation:'authored-order',basis:'authored-stage',accepted:true,reason:'Order in the saved Journey, not a mandatory prerequisite.',source,destination,href,historical:false});previous=id;
   }
  }
  if(record.attempt?.practice&&record.rendition){
   for(const correction of record.attempt.practice.corrections){if(nodes.length>=120)break;
    const id=parent+':correction:'+correction.id,destination:RecordLink={family:record.family,id:record.id,rendition:record.rendition},href=buildLinkedReadingLink(destination)+'#correction-'+encodeURIComponent(correction.id);
    nodes.push({id,kind:'correction',title:correction.corrected.slice(0,120)+(correction.corrected.length>120?'…':''),destination,href,rev:correction.revision,updatedAt:record.updatedAt,basis:'saved-correction',evidence:correction.status+' · '+correction.modality+' · retained feedback, not certified correctness',synthetic:record.synthetic});known.add(id);
    add({id:id+':attempt',from:parent,to:id,relation:'retained-correction',basis:'saved-correction',accepted:true,reason:'Explicit '+correction.status+' correction revision '+correction.revision+' for response '+correction.responseId+' revision '+correction.responseRevision+'. Disputed or withdrawn material is not current teaching authority.',source,destination,href,historical:false});
   }
  }
  if(lens==='constellation'&&record.rendition){
   const parts=canonicalReadingParts(record);
   for(const concept of record.concepts??[]){if(nodes.length>=120)break;if(!parts.some(p=>p.sectionId===concept.sectionId&&(!concept.partId||p.part.id===concept.partId)&&!p.part.unavailable))continue;
    const id=parent+':concept:'+concept.id,destination:RecordLink={family:record.family,id:record.id,rendition:record.rendition,sectionId:concept.sectionId,...(concept.partId?{partId:concept.partId}:{})},href=buildLinkedReadingLink(destination);
    nodes.push({id,kind:'concept',title:concept.term,destination,href,rev:record.rev,updatedAt:record.updatedAt,basis:'canonical-concept',synthetic:record.synthetic});known.add(id);
    add({id:id+':catalogue',from:parent,to:id,relation:concept.kind??'concept',basis:'canonical-concept',accepted:true,reason:'Canonical saved catalogue entry; no lexical relationship inferred.',source,destination,href,historical:false});
   }
  }
 }
 if(lens==='river')nodes.sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt)||a.id.localeCompare(b.id));
 return {nodes,edges};
}
