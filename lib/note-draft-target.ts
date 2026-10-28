import type {WorkspaceCommand} from './contracts';
/** Resolve a retained Note draft without guessing durable identity from its ID spelling. */
export type NoteDraftTarget =
 | {kind:'pending';command:WorkspaceCommand}
 | {kind:'update';id:string;expectedRev:number}
 | {kind:'create'}
 | {kind:'unavailable';id:string};
export function resolveNoteDraftTarget(input:{selectedId:string;baseRev:number;saved?:{id:string;rev:number}|null;createIntent?:boolean;pending?:WorkspaceCommand|null}):NoteDraftTarget {
 // An uncertain operation already has its frozen target, payload and identity.
 if(input.pending)return{kind:'pending',command:input.pending};
 const hasSavedRevision=Number.isSafeInteger(input.baseRev)&&input.baseRev>0;
 if(hasSavedRevision){
  if(input.saved?.id===input.selectedId)return{kind:'update',id:input.saved.id,expectedRev:input.baseRev};
  return{kind:'unavailable',id:input.selectedId};
 }
 // Only the reserved initial composer or a deliberate New draft action is creation intent.
 if(input.selectedId==='new'||input.createIntent===true)return{kind:'create'};
 // Missing from a bounded/filtered snapshot never authorises recreation, regardless of prefix.
 return{kind:'unavailable',id:input.selectedId};
}
/** A targeted response may resolve only the exact eligible Note requested by this composer. */
export function eligibleNoteFromContext(value:unknown,expectedId:string):import('./contracts').WorkspaceRecord|null {
 if(!value||typeof value!=='object')return null;
 const record=(value as {record?:unknown}).record;
 if(!record||typeof record!=='object')return null;
 const r=record as import('./contracts').WorkspaceRecord;
 if(r.id!==expectedId||r.family!=='note'||r.trashedAt!==null||!Number.isSafeInteger(r.rev)||r.rev<1||typeof r.title!=='string'||typeof r.body!=='string'||!Array.isArray(r.links)||typeof r.updatedAt!=='string')return null;
 return r;
}
