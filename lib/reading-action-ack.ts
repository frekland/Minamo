import type {BookmarkState,CommandReceipt,WorkspaceCommand,WorkspaceRecord} from './contracts';
export function definitiveReadingRejection(error:unknown,operationId?:string){const e=error as {status?:number;receipt?:CommandReceipt};return e?.receipt?.status==='conflict'&&(!operationId||e.receipt.operationId===operationId)||e?.status===400||e?.status===422;}
export function bookmarkAcknowledgement(known:BookmarkState,command:WorkspaceCommand,receipt:CommandReceipt){
 const next=receipt.bookmark;if(receipt.operationId!==command.operationId||receipt.status!=='committed'||!next||next.targetKey!==known.targetKey||!Number.isSafeInteger(next.targetRev)||next.targetRev<Number(command.expectedTargetRev)||next.active!==command.active||typeof next.available!=='boolean')throw Error('The exact bookmark acknowledgement is unavailable. Keep the original change for recovery.');
 return receipt.replayed&&known.targetRev>=next.targetRev?known:next;
}
export function removeRetainedReadingAction(key:string,operationId:string){
 try{const raw=localStorage.getItem(key);if(!raw)return;const saved=JSON.parse(raw) as {command?:WorkspaceCommand;pending?:WorkspaceCommand;operationId?:string};if(saved.command?.operationId===operationId||saved.pending?.operationId===operationId||saved.operationId===operationId)localStorage.removeItem(key);}catch{}
}
/** A delayed failure belongs only to the payload still retained under this key. */
export function retainReadingActionFailure(key:string,operationId:string,value:unknown){
 try{const raw=localStorage.getItem(key);if(!raw)return false;const saved=JSON.parse(raw) as {command?:WorkspaceCommand;pending?:WorkspaceCommand;operationId?:string};if(saved.command?.operationId!==operationId&&saved.pending?.operationId!==operationId&&saved.operationId!==operationId)return false;localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
/** Merge a confirmed revision without letting a replay overwrite a later edit. */
export function annotationAcknowledgement(base:WorkspaceRecord,command:WorkspaceCommand,receipt:CommandReceipt){
 if(receipt.operationId!==command.operationId||receipt.status!=='committed'||receipt.recordRef?.family!=='annotation'||receipt.recordRef.id!==base.id||!Number.isSafeInteger(receipt.recordRef.rev)||receipt.recordRef.rev!==command.expectedRev!+1)throw Error('The exact committed annotation revision could not be verified. Keep the retained operation for status recovery.');
 const revision=receipt.recordRef.rev,current=receipt.record;
 if(current&&(current.family!=='annotation'||current.id!==base.id))throw Error('Annotation readback did not match this record.');
 const committed=current?.rev===revision?current:{...base,rev:revision,...(command.action==='update'?{body:String(command.data?.body??base.body)}:{})};
 return{committed,current:current&&current.rev>revision?current:null};
}
