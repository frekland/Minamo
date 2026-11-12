import type {WorkspaceRecord} from './contracts';
import type {RouteTarget} from './navigation-origin';

/** A selected canonical part can open in the modern Project reader only when it
 * belongs to the current exact edition. Historical/capture/range reads remain
 * in the immutable passage reader, without borrowing current-head controls. */
export function nativeProjectReturnEligible(record:WorkspaceRecord,current:WorkspaceRecord|null|undefined,target:RouteTarget|undefined):boolean{
 if(!target||record.family!=='journey'||current?.family!=='journey'||current.id!==record.id||!target.rendition||target.rendition!==record.rendition||current.rendition!==record.rendition||target.stageId||target.captureId||target.start!==undefined||target.end!==undefined||target.segments?.length||!target.sectionId)return false;
 const section=record.sections?.find(s=>s.id===target.sectionId);
 return !!section&&(!target.partId||section.parts.some(p=>p.id===target.partId&&!p.unavailable));
}
