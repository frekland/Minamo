import {workspaceGenerationFromScope} from '../lib/workspace-generation';

export type ActivityDraft = {prediction:string;reflection:string;nextIntention:string;terminal:string;selectedPath:string};
export type ActivityPending = {operationId:string;scope:string;activityId:string;rendition:string;payload:string};
export const emptyActivityDraft=():ActivityDraft=>({prediction:'',reflection:'',nextIntention:'',terminal:'',selectedPath:''});
/** The edition and generation are part of identity. A new edition never silently adopts a stale attempt. */
export function activityDraftKey(scope:string,id:string,rendition:string){
 workspaceGenerationFromScope(scope);
 return 'minamo.activity-draft.v1:'+JSON.stringify([scope,id,rendition]);
}
/** Preserve Unicode scalar boundaries while respecting existing UTF-16 server budgets. */
function boundedDraftText(value:string,limit:number){const cut=value.slice(0,limit);return cut.length&&/[\uD800-\uDBFF]/.test(cut.at(-1)!)?cut.slice(0,-1):cut;}
export function readActivityDraft(raw:string|null):ActivityDraft{
 if(!raw||raw.length>60000)return emptyActivityDraft();
 try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))return emptyActivityDraft();const draft=emptyActivityDraft(),limits:Record<keyof ActivityDraft,number>={prediction:4000,reflection:8000,nextIntention:2000,terminal:20000,selectedPath:300};for(const key of Object.keys(draft) as (keyof ActivityDraft)[]){if(typeof value[key]==='string')draft[key]=boundedDraftText(value[key],limits[key]);}return draft;}catch{return emptyActivityDraft();}
}
export function makeActivityPending(scope:string,activityId:string,rendition:string,operationId:string,payload:unknown):ActivityPending{
 workspaceGenerationFromScope(scope);
 const serialized=JSON.stringify(payload);if(new TextEncoder().encode(serialized).length>220000)throw Error('Attempt exceeds the supported size. Keep the draft and shorten the supplied evidence.');
 return Object.freeze({operationId,scope,activityId,rendition,payload:serialized});
}
export function readActivityPending(raw:string|null,scope:string,activityId:string,rendition:string):ActivityPending|null{
 if(!raw||raw.length>230000)return null;try{const value=JSON.parse(raw);if(value?.scope!==scope||value?.activityId!==activityId||value?.rendition!==rendition||typeof value?.operationId!=='string'||typeof value?.payload!=='string')return null;const payload=JSON.parse(value.payload);if(payload?.operationId!==value.operationId)return null;return makeActivityPending(scope,activityId,rendition,value.operationId,payload);}catch{return null;}
}
export function retryActivityPayload(pending:ActivityPending,scope:string,activityId:string,rendition:string){
 if(pending.scope!==scope||pending.activityId!==activityId||pending.rendition!==rendition)throw Error('This pending attempt belongs to another workspace or Activity edition. Its draft is retained.');
 return JSON.parse(pending.payload) as Record<string,unknown>;
}
