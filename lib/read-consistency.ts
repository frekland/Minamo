import {DomainError} from './domain-error';

const changedSnapshots=new Set(['query_changed','library_changed','activity_context_changed']);
export function isChangedSnapshot(error:unknown):error is DomainError{return error instanceof DomainError&&changedSnapshots.has(error.code);}

/** Retry the entire composition, never a continuation or a mutation. Caches and
 * fences belong inside read(), so the second attempt starts from fresh authority. */
export async function freshFirstPageRead<T>(cursor:unknown,read:()=>Promise<T>):Promise<T>{
 try{return await read();}catch(error){if(cursor||!isChangedSnapshot(error))throw error;}
 return read();
}

/** Public MCP detail uses ordinary structuredContent JSON, without inventing a
 * host-specific outer error enum. Keep the historical code/message in text too. */
export function readErrorDetail(error:unknown,code:string){
 const changed=isChangedSnapshot(error),continuation=/cursor/.test(code),authority=/generation|permission|revok|unavailable/.test(code),uncertain=code==='uncertain_result';
 return {contract:'minamo.tool-error.v1',category:changed?'snapshot-changed':continuation?'continuation-invalid':uncertain?'mutation-uncertain':authority?'authority-unavailable':error instanceof DomainError&&error.status===400?'validation':'operation-failed',retryable:changed,recovery:changed?'restart-first-page':continuation?'restart-first-page-without-cursor':uncertain?'reconcile-original-operation':authority?'refresh-authority':error instanceof DomainError&&error.status===400?'correct-input':'inspect-before-retry',...(changed?{automaticRetryLimit:1,partialSnapshotReturned:false}:{})};
}
