import {DomainError,readRecord} from './domain';
import {generationContext,generationGuard,assertGenerationCurrent,requireGeneration} from './generations';

/** A collaboration preference is an instruction about *presentation of eligible
 * context*, never authority to create links, rewrite records or take actions. */
export type CollaborationPreferences={
 version:1;
 contextDepth:'concise'|'balanced'|'detailed';
 relatedMaterial:'none'|'saved';
 initiative:'requested'|'offer';
 authoringDetail:'concise'|'balanced'|'detailed';
 projectEditing:'direct'|'preview-only';
 /** Owner-global MCP catalogue and call fence; never a grant of authoring consent. */
 mcpTools:'authoring'|'read-only';
};
export type CollaborationOverrides=Partial<Omit<CollaborationPreferences,'version'>>;
export const defaultCollaborationPreferences:CollaborationPreferences={version:1,contextDepth:'balanced',relatedMaterial:'saved',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'};
type Scope='global'|'project';
type PreferenceRow={revision:number;data:string;updated_at:string};
type SettingKey=keyof CollaborationOverrides;
const fields=['contextDepth','relatedMaterial','initiative','authoringDetail','projectEditing','mcpTools'] as const;
const choices={contextDepth:['concise','balanced','detailed'],relatedMaterial:['none','saved'],initiative:['requested','offer'],authoringDetail:['concise','balanced','detailed'],projectEditing:['direct','preview-only'],mcpTools:['authoring','read-only']} as const;
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/;
const isObject=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const conflict=(code:string,message:string):never=>{throw new DomainError(409,code,message);};
function parseValues(value:unknown,scope:Scope,fromStorage=false):CollaborationOverrides{
 // Older global rows contain three or five options. Read those with safe defaults,
 // but require a complete six-field set for any new global write.
 if(!isObject(value)||Object.keys(value).some(key=>!fields.includes(key as SettingKey))||scope==='global'&&!fromStorage&&Object.keys(value).length!==fields.length)throw new DomainError(400,'invalid_collaboration_preferences','Use all six named global options; Project overrides may omit an option.');
 const parsed:CollaborationOverrides={};
 if(scope==='project'&&value.mcpTools!==undefined)throw new DomainError(400,'invalid_collaboration_preferences','MCP tool exposure is global; a Project cannot override the workspace tool catalogue.');
 for(const field of fields){if(value[field]===undefined)continue;if(!(choices[field] as readonly unknown[]).includes(value[field]))throw new DomainError(400,'invalid_collaboration_preferences',`Unsupported ${field} preference.`);(parsed as Record<string,unknown>)[field]=value[field];}
 return parsed;
}
function ownerScope(env:Cloudflare.Env,owner:string,scope:Scope,projectId?:string){
 const context=generationContext(env);
 return {rootOwner:context?.rootOwner??owner,namespace:scope==='global'?'*':context?.namespace??owner,targetId:scope==='global'?'*':projectId!};
}
async function projectEligible(env:Cloudflare.Env,owner:string,projectId:unknown){
 if(typeof projectId!=='string'||!idPattern.test(projectId))throw new DomainError(400,'invalid_project_preference','Choose an exact Project ID.');
 const record=await readRecord(env,owner,'journey',projectId);
 if(!record)throw new DomainError(404,'project_unavailable','This Project is not available in the current workspace.');
}
async function row(env:Cloudflare.Env,rootOwner:string,namespace:string,scope:Scope,targetId:string){
 return env.DB!.prepare('SELECT revision,data,updated_at FROM v2_collaboration_preferences WHERE owner=? AND namespace=? AND scope=? AND target_id=?').bind(rootOwner,namespace,scope,targetId).first<PreferenceRow>();
}
const stored=(saved:PreferenceRow|null,scope:Scope)=>saved?parseValues(JSON.parse(saved.data),scope,true):{};

export function authoringGuidance(value:CollaborationPreferences){
 const detail={concise:'Keep authored sections focused and economical; retain essential explanations, exact source attribution and working examples.',balanced:'Use enough explanation, examples and context to make the work independently understandable without padding.',detailed:'Develop substantive explanations and worked examples where useful; preserve clear navigation and avoid repetitive filler.'}[value.authoringDetail];
 return {detail,projectEditing:value.mcpTools==='read-only'?'The owner has set the MCP connection to read-only. You may inspect eligible records and prepare previews, but all MCP save tools are unavailable until the owner changes this in the website Settings.':value.projectEditing==='preview-only'?'You may prepare read-only Project previews, but the server will decline GPT Project saves until the owner changes this preference.':'Project changes still require a specific owner request, exact revisions and existing source permissions.',notice:'These instructions govern future authoring, not the length or content of retained work. No achievements, checkpoints or progress tracking are implied.'};
}

/** Discovery is a convenience; every excluded call is also denied at dispatch.
 * Operation receipts and read-only previews remain available for recovery. */
export const MCP_MUTATING_TOOLS=new Set([
 'retain_minamo_material','save_minamo_arrangement',
 'upload_minamo_project_image','manage_minamo_test_run','review_project_contribution','apply_project_update',
 'set_note_page_pin','set_minamo_collaboration_preferences','confirm_minamo_relationship',
 'record_minamo_learning_update','publish_minamo_manuscript','apply_minamo_authoring_package',
 'manage_minamo_recovery','apply_minamo_command',
 'manage_minamo_test_scenario','append_minamo_test_transcript','manage_minamo_test_observation'
]);
export async function assertMcpToolAccess(env:Cloudflare.Env,owner:string,name:string){
 if(!MCP_MUTATING_TOOLS.has(name))return;
 if((await readCollaborationPreferences(env,owner)).effective.mcpTools==='read-only')
  throw new DomainError(403,'mcp_read_only','The owner has set this Minamo MCP connection to read-only. Read and preview tools remain available. Change GPT tool access in Minamo website Settings to allow new MCP saves.');
}

/** Project editing is a server-enforced MCP choice, not permission to write.
 * A new Project inherits the global value; an existing one can override it. */
export async function assertGptProjectEditing(env:Cloudflare.Env,owner:string,projectId:string,actor:string){
 if(actor!=='gpt')return;
 const current=await readRecord(env,owner,'journey',projectId);
 const policy=await readCollaborationPreferences(env,owner,current?projectId:undefined);
 if(policy.effective.projectEditing==='preview-only')throw new DomainError(403,'project_preview_only','GPT Project saves are paused by the owner’s collaboration preference. A read-only preview is allowed; the owner can deliberately change this setting in Minamo Settings.');
}

/** Global settings belong to the signed-in owner across workspace generations;
 * Project overrides are further fenced to one actual generation namespace. */
export async function readCollaborationPreferences(env:Cloudflare.Env,owner:string,projectId?:string){
 if(projectId)await projectEligible(env,owner,projectId);
 const globalKey=ownerScope(env,owner,'global'),globalRow=await row(env,globalKey.rootOwner,globalKey.namespace,'global','*');
 const global={...defaultCollaborationPreferences,...stored(globalRow,'global')};
 const projectKey=projectId?ownerScope(env,owner,'project',projectId):null;
 const projectRow=projectKey?await row(env,projectKey.rootOwner,projectKey.namespace,'project',projectId!):null;
 const overrides=stored(projectRow,'project');
 await assertGenerationCurrent(env);
 return {contract:'minamo.collaboration-preferences.v1' as const,
  global:{revision:globalRow?.revision??0,values:global,updatedAt:globalRow?.updated_at??null},
  ...(projectId?{project:{id:projectId,revision:projectRow?.revision??0,overrides,updatedAt:projectRow?.updated_at??null}}:{}),
  effective:{...global,...overrides},authoring:authoringGuidance({...global,...overrides}),
  notice:'These settings control eligible context, authoring guidance, the MCP tool catalogue/call restriction and Project saves. They never grant permission to write, infer achievements or access unavailable sources.'};
}

export async function saveCollaborationPreferences(env:Cloudflare.Env,owner:string,input:unknown){
 if(!isObject(input)||Object.keys(input).some(k=>!['scope','projectId','values','expectedRevision','operationId','expectedGeneration','purpose','intent'].includes(k)))throw new DomainError(400,'invalid_collaboration_write','Use one exact revisioned collaboration setting update.');
 if(input.intent!=='explicit-owner-preferences')throw new DomainError(400,'collaboration_write_intent','Only an explicitly requested preference change may be saved.');
 const scope=input.scope;
 const context=generationContext(env);
 if(context)requireGeneration(context,input.expectedGeneration);
 if(scope!=='global'&&scope!=='project')throw new DomainError(400,'invalid_collaboration_scope','Choose global settings or one exact Project.');
 if(scope==='global'&&input.projectId!==undefined)throw new DomainError(400,'invalid_collaboration_scope','Global settings cannot target a Project.');
 if(scope==='project')await projectEligible(env,owner,input.projectId);
 if(!Number.isSafeInteger(input.expectedRevision)||(input.expectedRevision as number)<0||typeof input.operationId!=='string'||!idPattern.test(input.operationId))throw new DomainError(400,'invalid_collaboration_write','Use the exact saved revision and a retry-stable operation ID.');
 const values=parseValues(input.values,scope),scopeKey=ownerScope(env,owner,scope,input.projectId as string|undefined);
 const canonical=JSON.stringify({scope,projectId:scope==='project'?input.projectId:undefined,expectedRevision:input.expectedRevision,values});
 const hashBytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical));
 const hash=Array.from(new Uint8Array(hashBytes)).map(n=>n.toString(16).padStart(2,'0')).join('');
 const db=env.DB!,operationId=input.operationId as string,expected=input.expectedRevision as number;
 const findOperation=()=>db.prepare('SELECT payload_hash,nonce,receipt_json FROM v2_collaboration_preference_operations WHERE owner=? AND operation_id=?').bind(scopeKey.rootOwner,operationId).first<{payload_hash:string;nonce:string;receipt_json:string}>();
 const prior=await findOperation();
 if(prior){if(prior.payload_hash!==hash)conflict('idempotency_mismatch','This operation ID belongs to a different collaboration change.');return {...JSON.parse(prior.receipt_json),replayed:true};}
 const current=await row(env,scopeKey.rootOwner,scopeKey.namespace,scope,scopeKey.targetId);
 if((current?.revision??0)!==expected)conflict('collaboration_preferences_conflict','Settings changed elsewhere. Reload them before saving.');
 const now=new Date().toISOString(),nonce=crypto.randomUUID(),receipt={status:'committed',operationId,scope,...(scope==='project'?{projectId:scopeKey.targetId}:{}),revision:expected+1,values,replayed:false};
 const gate='EXISTS(SELECT 1 FROM v2_collaboration_preference_operations WHERE owner=? AND operation_id=? AND nonce=?)',guard=generationGuard(env);
 try{await db.batch([
  db.prepare(`INSERT OR IGNORE INTO v2_collaboration_preference_operations(owner,operation_id,payload_hash,nonce,receipt_json) SELECT ?,?,?,?,? WHERE COALESCE((SELECT revision FROM v2_collaboration_preferences WHERE owner=? AND namespace=? AND scope=? AND target_id=?),0)=?${guard.sql}`).bind(scopeKey.rootOwner,operationId,hash,nonce,JSON.stringify(receipt),scopeKey.rootOwner,scopeKey.namespace,scope,scopeKey.targetId,expected,...guard.args),
  db.prepare(`INSERT INTO v2_collaboration_preferences(owner,namespace,scope,target_id,revision,data,updated_at,last_operation) SELECT ?,?,?,?,?,?,?,? WHERE ${gate} ON CONFLICT(owner,namespace,scope,target_id) DO UPDATE SET revision=excluded.revision,data=excluded.data,updated_at=excluded.updated_at,last_operation=excluded.last_operation WHERE v2_collaboration_preferences.revision=?`).bind(scopeKey.rootOwner,scopeKey.namespace,scope,scopeKey.targetId,expected+1,JSON.stringify(values),now,operationId,scopeKey.rootOwner,operationId,nonce,expected)
 ]);}catch{const saved=await findOperation();if(saved){if(saved.payload_hash!==hash)conflict('idempotency_mismatch','This operation ID belongs to another change.');return {...JSON.parse(saved.receipt_json),replayed:true};}conflict('collaboration_preferences_conflict','Settings changed during the save. Reload them and retry deliberately.');}
 const saved=await findOperation();
 if(!saved)throw new DomainError(409,'collaboration_preferences_conflict','Settings changed during the save. Reload before retrying.');
 if(saved.payload_hash!==hash)conflict('idempotency_mismatch','This operation ID belongs to another change.');
 return {...JSON.parse(saved.receipt_json),replayed:saved.nonce!==nonce};
}
