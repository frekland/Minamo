/** Browser generation fences. A scope change retains old local draft keys; it never migrates or deletes them. */
export const LEGACY_WORKSPACE_GENERATION='legacy@0';
const separator=':generation:';
export function validWorkspaceGeneration(value:unknown):value is string{return typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}@(0|[1-9][0-9]{0,14})$/.test(value);}
function generation(value:string){if(!validWorkspaceGeneration(value))throw new Error('A valid workspace generation token is required.');return value;}
function boundedScope(value:string){if(typeof value!=='string'||!value||value.length>1024||/[\u0000-\u001f\u007f]/.test(value))throw new Error('A bounded authenticated workspace scope is required.');return value;}
export function workspaceGenerationFromScope(scope:string){boundedScope(scope);const at=scope.lastIndexOf(separator);return at<0?LEGACY_WORKSPACE_GENERATION:generation(scope.slice(at+separator.length));}
export function workspaceOwnerScope(scope:string){boundedScope(scope);const at=scope.lastIndexOf(separator);if(at<0)return scope;generation(scope.slice(at+separator.length));return boundedScope(scope.slice(0,at));}
/** Legacy keys are byte-for-byte unchanged. Every later pointer revision gets a distinct scope, including rollback. */
export function workspaceGenerationScope(ownerScope:string,token:string){const owner=workspaceOwnerScope(ownerScope),current=generation(token);return current===LEGACY_WORKSPACE_GENERATION?owner:owner+separator+current;}
export class WorkspaceGenerationChanged extends Error{readonly code='workspace_generation_changed';constructor(){super('The workspace generation changed. The retained draft or operation cannot be sent into the restored workspace.');this.name='WorkspaceGenerationChanged';}}
export function workspaceResponseIsCurrent(capturedScope:string,currentScope:string,responseGeneration:unknown){return boundedScope(capturedScope)===boundedScope(currentScope)&&validWorkspaceGeneration(responseGeneration)&&workspaceGenerationFromScope(capturedScope)===responseGeneration;}
/** Capture the scope when constructing an operation. Never pass the current scope as an old operation's origin. */
export function fenceWorkspaceCommand<T extends {operationId:string;expectedGeneration?:string}>(command:T,capturedScope:string,currentScope:string):T&{expectedGeneration?:string}{
 const expected=workspaceGenerationFromScope(capturedScope);if(boundedScope(capturedScope)!==boundedScope(currentScope)||(command.expectedGeneration!==undefined&&command.expectedGeneration!==expected))throw new WorkspaceGenerationChanged();
 // Existing legacy pending payloads must replay exactly; adding a field would change their idempotency digest.
 return expected===LEGACY_WORKSPACE_GENERATION?{...command}:{...command,expectedGeneration:expected};
}
export function planWorkspaceGenerationTransition(currentScope:string,nextGeneration:string){const nextScope=workspaceGenerationScope(workspaceOwnerScope(currentScope),nextGeneration),changed=nextScope!==currentScope;return{scope:nextScope,previousScope:currentScope,changed,resetProjections:changed,retainPreviousDrafts:true as const};}
/** Adds only the opaque generation token, never the owner scope. No retry, rebinding, reload or automatic adoption. */
export function generationFetch(scope:string,input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 if(scope==='TEST-ONLY-interface-browser'&&import.meta.env?.DEV&&typeof input==='string'&&input.startsWith('/api/'))input='/preview-interface/api?'+new URLSearchParams({path:input});
 if(scope==='TEST-ONLY-activity-browser'&&import.meta.env?.DEV&&typeof input==='string'&&input.startsWith('/api/'))input='/preview-activity/api?'+new URLSearchParams({path:input});
 const headers=new Headers(typeof Request!=='undefined'&&input instanceof Request?input.headers:undefined);new Headers(init?.headers).forEach((value,key)=>headers.set(key,value));const expected=workspaceGenerationFromScope(scope),supplied=headers.get('x-minamo-generation');if(supplied!==null&&supplied!==expected)throw new WorkspaceGenerationChanged();headers.set('x-minamo-generation',expected);const principal=workspaceOwnerScope(scope);if(/^v2-[a-f0-9]{64}$/.test(principal))headers.set('X-Minamo-Workspace',principal.slice(3));return fetch(input,{...init,headers});
}
