import type {RecordLink,WorkspaceRecord} from './contracts';
import type {LayoutTask} from './layout-workspace';
import type {ViewOrigin} from './navigation-origin';
import {exactTaskTarget} from './layout-gpt-intents';
import {readingContextLink} from './workspace-presentation';
export type OptionalNoteConnection={title:string;link:RecordLink};
/** Snapshot at deliberate capture time. Subsequent navigation cannot retarget a draft. */
export function noteCaptureLinks(reading:RecordLink|undefined,task:LayoutTask|null|undefined,taskRecord:WorkspaceRecord|null|undefined):RecordLink[]{
 // Only the actual reading is implicit. A task beside an unrelated reading is
 // an optional, deliberate second link owned by the Notes coordinator.
 if(!reading)return [];
 const isTask=task&&taskRecord&&reading.family===task.family&&reading.id===task.id;
 return [{...reading,relation:isTask?'supports':'related',reason:isTask?'Task when this Note was created':'Exact material when this Note was created'}];
}
/** Offer, never write, the provenance of an Activity detour. Route history is
 * not a permission grant: only source/task records returned by the current
 * authorised Activity context may become candidates. The command endpoint
 * rechecks every accepted relation under current rights. */
export function optionalActivityNoteConnections(activity:WorkspaceRecord,origin:ViewOrigin|undefined,eligibleRelated:WorkspaceRecord[]):OptionalNoteConnection[]{
 if(activity.family!=='experiment'||!origin)return [];
 const options:OptionalNoteConnection[]=[];
 const source=origin.source;
 if(source&&activity.links.some(link=>link.family===source.family&&link.id===source.id)){
  const verified=eligibleRelated.find(record=>record.family===source.family&&record.id===source.id&&record.rendition===source.rendition&&!record.trashedAt);
  if(verified)options.push({title:`originating ${source.family==='article'?'Article':source.family==='area'?'subject':'source'}`,link:{family:source.family,id:source.id,rendition:source.rendition,...(source.sectionId?{sectionId:source.sectionId}:{}),...(source.partId?{partId:source.partId}:{}),relation:'related',reason:'Originating source deliberately linked from this Activity Note'}});
 }
 const task=origin.task;
 if(task&&activity.links.some(link=>link.family===task.family&&link.id===task.id)){
  const verified=eligibleRelated.find(record=>record.family===task.family&&record.id===task.id&&(!task.rendition||record.rendition===task.rendition)&&!record.trashedAt);
  if(verified&&exactTaskTarget(verified,task.stageId))options.push({title:task.family==='journey'?'originating Project Step':'originating Question',link:{...readingContextLink(verified,task.stageId),relation:'supports',reason:'Originating task deliberately linked from this Activity Note'}});
 }
 return options;
}
