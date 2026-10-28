import type {RecordLink,WorkspaceRecord} from './contracts';
import type {LayoutTask} from './layout-workspace';
/** Snapshot at deliberate capture time. Subsequent navigation cannot retarget a draft. */
export function noteCaptureLinks(reading:RecordLink|undefined,task:LayoutTask|null|undefined,taskRecord:WorkspaceRecord|null|undefined):RecordLink[]{
 // Only the actual reading is implicit. A task beside an unrelated reading is
 // an optional, deliberate second link owned by the Notes coordinator.
 if(!reading)return [];
 const isTask=task&&taskRecord&&reading.family===task.family&&reading.id===task.id;
 return [{...reading,relation:isTask?'supports':'related',reason:isTask?'Task when this Note was created':'Exact material when this Note was created'}];
}
