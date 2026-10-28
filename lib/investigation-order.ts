import type {WorkspaceRecord} from './contracts';
const instant=(value:string|undefined)=>value&&Number.isFinite(Date.parse(value))?Date.parse(value):0;
/** Editorial updates do not count as learner progress. */
export function compareInvestigationsByRecency(a:Pick<WorkspaceRecord,'id'|'title'|'createdAt'>,b:Pick<WorkspaceRecord,'id'|'title'|'createdAt'>,checkpoints:Record<string,string>={}){
 const at=Math.max(instant(a.createdAt),instant(checkpoints[a.id])),bt=Math.max(instant(b.createdAt),instant(checkpoints[b.id]));
 return bt-at||a.title.localeCompare(b.title,undefined,{numeric:true})||a.id.localeCompare(b.id);
}
