import {validWorkspaceGeneration,workspaceOwnerScope} from './workspace-generation';
export type RecoveryOperation={action:'checkpoint'|'stage'|'activate';operationId:string;expectedGeneration:string;archiveId?:string;stagedId?:string};
const id=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
export function recoveryOperationKey(scope:string){return 'minamo-recovery-operation-v1:'+workspaceOwnerScope(scope);}
/** Whitelist reconstruction excludes file bytes, passphrases, tokens and arbitrary fields. */
export function recoveryOperation(value:unknown):RecoveryOperation|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(!['checkpoint','stage','activate'].includes(String(v.action))||!id(v.operationId)||!validWorkspaceGeneration(v.expectedGeneration))return null;
 if(v.action==='stage'&&!id(v.archiveId)||v.action==='activate'&&!id(v.stagedId))return null;
 return {action:v.action as RecoveryOperation['action'],operationId:v.operationId,expectedGeneration:v.expectedGeneration,...(v.action==='stage'?{archiveId:v.archiveId as string}:{}),...(v.action==='activate'?{stagedId:v.stagedId as string}:{})};
}
export function readRecoveryOperation(storage:Pick<Storage,'getItem'>,scope:string){try{const raw=storage.getItem(recoveryOperationKey(scope));return raw?recoveryOperation(JSON.parse(raw)):null;}catch{return null;}}
export function retainRecoveryOperation(storage:Pick<Storage,'setItem'>,scope:string,request:unknown){const safe=recoveryOperation(request);if(!safe)throw Error('The recovery operation identity is invalid.');storage.setItem(recoveryOperationKey(scope),JSON.stringify(safe));return safe;}
