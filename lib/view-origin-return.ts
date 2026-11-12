import {canonicalReadingParts} from './contracts';
import type {WorkspaceRecord,ReadingSelection} from './contracts';
import {buildLinkedReadingLink,buildRecordLink} from './reading-links';
import type {RouteReading,RouteTask,ViewOrigin} from './navigation-origin';

export type ReturnSlot='source'|'activity'|'task';
export type VerifiedReturn={slot:ReturnSlot;title:string;label:string;href:string};
type ContextResponse={record?:WorkspaceRecord|null;selection?:unknown};
/** An origin is untrusted browsing metadata. Only fresh, admitted exact reads create return actions. */
export function verifiedOriginReturn(slot:ReturnSlot,origin:ViewOrigin,context:ContextResponse,projectStageEligible=false):VerifiedReturn|undefined{
 const ref=origin[slot] as RouteReading|RouteTask|undefined,record=context.record;
 if(!ref||!record||record.trashedAt||record.family!==ref.family||record.id!==ref.id||ref.rendition&&record.rendition!==ref.rendition)return;
 let href:string,label:string;
 if(slot==='source'){
  const source=ref as RouteReading,hasRange=source.start!==undefined;
  if(source.sectionId&&!canonicalReadingParts(record).some(item=>item.sectionId===source.sectionId&&(!source.partId||item.part.id===source.partId)&&!item.part.unavailable))return;
  if(hasRange&&!context.selection)return; // The server must verify the exact UTF-16 bytes/retained rendition.
  href=hasRange?buildRecordLink(source,{rendition:source.rendition,selection:source as ReadingSelection}):buildLinkedReadingLink({family:source.family,id:source.id,rendition:source.rendition,sectionId:source.sectionId,partId:source.partId});
  label=hasRange?'Back to exact source passage':'Back to source edition';
 }else if(slot==='activity'){
  if(!record.activity)return;const activity=ref as RouteReading;
  href=buildLinkedReadingLink({family:activity.family,id:activity.id,rendition:activity.rendition,sectionId:activity.sectionId,partId:activity.partId});label='Back to Activity';
 }else{
  const task=ref as RouteTask;
  if(task.family==='journey'&&(!task.stageId||record.learningShape?.kind!=='journey'||!record.learningShape.stages.some(stage=>stage.id===task.stageId)))return;
  href=buildRecordLink(task,{rendition:task.rendition});
  if(task.family==='journey'&&task.stageId)href+='&stage='+encodeURIComponent(task.stageId);
  if(task.family==='investigation'&&projectStageEligible&&task.projectId&&task.stageId)href+='&returnJourney='+encodeURIComponent(task.projectId)+'&returnStage='+encodeURIComponent(task.stageId);
  label=task.family==='investigation'?'Back to originating Question':'Back to originating Project Step';
 }
 return {slot,title:record.title,label,href};
}
