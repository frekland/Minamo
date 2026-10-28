import type {WorkspaceRecord} from './contracts';
import {DomainError} from './domain-error';
import {generationContext,generationGuard,requireGeneration,assertGenerationCurrent} from './generations';
import {FAMILIES,type Family} from './contracts';

export const LEARNING_SPACES=['computing','languages'] as const;
export const LEARNING_LANGUAGES=['ja','zh-Hans','zh-Hant','fr','es','el','de','sv'] as const;
export type LearningSpace=typeof LEARNING_SPACES[number];
export type SupportedLanguage=typeof LEARNING_LANGUAGES[number];
export type LearningScope={version:1;spaces:LearningSpace[];languages?:SupportedLanguage[];provenance:'authored'|'classification'};
export type LearningScopeQuery={learningSpace?:LearningSpace|'all'|'unclassified';language?:SupportedLanguage};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
export function validateLearningScope(value:unknown):LearningScope{
 if(!object(value)||Object.keys(value).some(k=>!['version','spaces','languages','provenance'].includes(k))||value.version!==1||!Array.isArray(value.spaces)||value.spaces.length<1||value.spaces.length>2||new Set(value.spaces).size!==value.spaces.length||!value.spaces.every(s=>(LEARNING_SPACES as readonly unknown[]).includes(s))||(typeof value.provenance!=='string'||!['authored','classification'].includes(value.provenance)))throw new DomainError(400,'invalid_learning_scope','Use learningScope {version:1,spaces:["computing" or "languages"],provenance:"authored" or "classification"}.','data.learningScope');
 if(value.languages!==undefined&&(!Array.isArray(value.languages)||!value.languages.length||value.languages.length>8||new Set(value.languages).size!==value.languages.length||!value.languages.every(l=>(LEARNING_LANGUAGES as readonly unknown[]).includes(l))||!value.spaces.includes('languages')))throw new DomainError(400,'invalid_learning_language','Use supported BCP-47 source tags ja, zh-Hans, zh-Hant, fr, es, el, de, sv with the Languages space. These are subject tags, not UI locale.','data.learningScope.languages');
 return {version:1,spaces:[...value.spaces] as LearningSpace[],...(value.languages?{languages:[...(value.languages as SupportedLanguage[])]}:{}),provenance:value.provenance as LearningScope['provenance']};
}
export function parseLearningScopeQuery(input:LearningScopeQuery|Record<string,unknown>={}):LearningScopeQuery{
 const {learningSpace,language}=input;
 if(learningSpace!==undefined&&(typeof learningSpace!=='string'||!['all','computing','languages','unclassified'].includes(learningSpace)))throw new DomainError(400,'invalid_learning_space','Choose learningSpace all, computing, languages or unclassified.');
 if(language!==undefined&&!(LEARNING_LANGUAGES as readonly unknown[]).includes(language))throw new DomainError(400,'invalid_learning_language','Choose source language ja, zh-Hans, zh-Hant, fr, es, el, de or sv.');
 if(language!==undefined&&learningSpace!==undefined&&!['all','languages'].includes(String(learningSpace)))throw new DomainError(400,'incompatible_learning_scope','A language filter requires learningSpace languages or all.');
 return {learningSpace:(learningSpace??(language?'languages':'all')) as LearningScopeQuery['learningSpace'],...(language?{language:language as SupportedLanguage}:{})};
}
/** Only explicit metadata is classified. Older records remain discoverable under All/Unclassified; no title guessing. */
export function effectiveLearningScope(record:Pick<WorkspaceRecord,'learningScope'>):LearningScope|undefined{return record.learningScope;}
export function matchesLearningScope(record:Pick<WorkspaceRecord,'learningScope'>,input:LearningScopeQuery={}):boolean{
 const q=parseLearningScopeQuery(input),scope=effectiveLearningScope(record);
 if(q.learningSpace==='unclassified')return !scope;
 if(q.learningSpace!=='all'&&!scope?.spaces.includes(q.learningSpace!))return false;
 return !q.language||!!scope?.languages?.includes(q.language);
}
function scopeJson(alias:string){return `coalesce((SELECT scope_sidecar.scope_json FROM v2_learning_scopes scope_sidecar WHERE scope_sidecar.owner=${alias}.owner AND scope_sidecar.family=${alias}.family AND scope_sidecar.id=${alias}.id),json_extract(${alias}.data,'$.learningScope'))`;}
function directSql(alias:string,q:LearningScopeQuery):{sql:string;args:unknown[]}{
 const args:unknown[]=[],tests:string[]=[];
 if(q.learningSpace==='unclassified')tests.push(`${scopeJson(alias)} IS NULL`);
 else if(q.learningSpace!=='all'){tests.push(`EXISTS(SELECT 1 FROM json_each(${scopeJson(alias)},'$.spaces') scope_space WHERE scope_space.value=?)`);args.push(q.learningSpace);}
 if(q.language){tests.push(`EXISTS(SELECT 1 FROM json_each(${scopeJson(alias)},'$.languages') scope_language WHERE scope_language.value=?)`);args.push(q.language);}
 return {sql:tests.length?'('+tests.join(' AND ')+')':'1=1',args};
}
/** Organisational filtering only. Owner, current rights and generation guards remain mandatory at callers. */
export function learningScopeSql(alias:string,input:LearningScopeQuery={},options:{inheritPersonal?:boolean}={}):{sql:string;args:unknown[]}{
 if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(alias))throw new Error('Invalid internal SQL alias.');
 const q=parseLearningScopeQuery(input),direct=directSql(alias,q);if(q.learningSpace==='all'&&!q.language||options.inheritPersonal===false)return direct;
 const target=directSql('scope_target',q),refs=`SELECT json_extract(link.value,'$.family') family,json_extract(link.value,'$.id') id FROM json_each(${alias}.data,'$.links') link UNION SELECT coalesce(json_extract(${alias}.data,'$.anchor.recordFamily'),'article'),json_extract(${alias}.data,'$.anchor.articleId') UNION SELECT json_extract(${alias}.data,'$.anchor.displayReturn.recordFamily'),json_extract(${alias}.data,'$.anchor.displayReturn.id') UNION SELECT json_extract(${alias}.data,'$.flagTarget.family'),json_extract(${alias}.data,'$.flagTarget.id') WHERE json_extract(${alias}.data,'$.flagTarget.kind')='record' UNION SELECT 'experiment',json_extract(${alias}.data,'$.attempt.activity.id')`;
 const inherited=`EXISTS(SELECT 1 FROM v2_records scope_target WHERE scope_target.owner=${alias}.owner AND scope_target.trashed_at IS NULL AND scope_target.family IN ('journey','investigation','article','area','experiment','source') AND EXISTS(SELECT 1 FROM (${refs}) scope_ref WHERE scope_ref.family=scope_target.family AND scope_ref.id=scope_target.id) AND ${target.sql})`;
 // A personal record's own classification wins. No recursive or lexical relationships are invented.
 if(q.learningSpace==='unclassified'){
  const classified=`EXISTS(SELECT 1 FROM v2_records scope_target WHERE scope_target.owner=${alias}.owner AND scope_target.trashed_at IS NULL AND ${scopeJson('scope_target')} IS NOT NULL AND EXISTS(SELECT 1 FROM (${refs}) scope_ref WHERE scope_ref.family=scope_target.family AND scope_ref.id=scope_target.id))`;
  return {sql:`(${direct.sql} AND (${alias}.family NOT IN ('note','annotation','flag','run') OR NOT ${classified}))`,args:direct.args};
 }
 return {sql:`(${direct.sql} OR (${scopeJson(alias)} IS NULL AND ${alias}.family IN ('note','annotation','flag','run') AND ${inherited}))`,args:[...direct.args,...target.args]};
}

type ScopeHead={rev:number|null;scope_json:string|null;data:string};
const scopeHeads=new WeakMap<object,Map<string,Promise<ScopeHead|null>>>();
function readScopeHead(env:Cloudflare.Env,owner:string,family:string,id:string){const key=JSON.stringify([owner,family,id]);let cache=generationContext(env)?scopeHeads.get(env):undefined;if(generationContext(env)&&!cache){cache=new Map();scopeHeads.set(env,cache);}let result=cache?.get(key);if(!result){result=env.DB!.prepare('SELECT r.data,s.rev,s.scope_json FROM v2_records r LEFT JOIN v2_learning_scopes s ON s.owner=r.owner AND s.family=r.family AND s.id=r.id WHERE r.owner=? AND r.family=? AND r.id=?').bind(owner,family,id).first<ScopeHead>();cache?.set(key,result);}return result;}
export async function prefetchLearningScopes(env:Cloudflare.Env,owner:string,records:WorkspaceRecord[]){
 if(!generationContext(env)||!records.length)return;
 let cache=scopeHeads.get(env);if(!cache){cache=new Map();scopeHeads.set(env,cache);}
 const refs=new Map<string,{family:string;id:string}>();
 for(const record of records){refs.set(JSON.stringify([owner,record.family,record.id]),record);if(['note','annotation','flag','run'].includes(record.family)){for(const ref of [...record.links,...(record.anchor?[{family:record.anchor.recordFamily??'article',id:record.anchor.articleId}]:[]),...(record.anchor?.displayReturn?[{family:record.anchor.displayReturn.recordFamily,id:record.anchor.displayReturn.id}]:[]),...(record.flagTarget?.kind==='record'?[record.flagTarget]:[]),...(record.attempt?[{family:'experiment',id:record.attempt.activity.id}]:[])])refs.set(JSON.stringify([owner,ref.family,ref.id]),ref);}}
 const missing=[...refs].filter(([key])=>!cache!.has(key));if(!missing.length)return;
 const rows=(await env.DB!.prepare(`SELECT r.family,r.id,r.data,s.rev,s.scope_json FROM v2_records r LEFT JOIN v2_learning_scopes s ON s.owner=r.owner AND s.family=r.family AND s.id=r.id WHERE r.owner=? AND EXISTS(SELECT 1 FROM json_each(?) ref WHERE json_extract(ref.value,'$.family')=r.family AND json_extract(ref.value,'$.id')=r.id)`).bind(owner,JSON.stringify(missing.map(([,ref])=>({family:ref.family,id:ref.id})))).all<ScopeHead & {family:string;id:string}>()).results;
 for(const [key] of missing)cache.set(key,Promise.resolve(null));for(const row of rows)cache.set(JSON.stringify([owner,row.family,row.id]),Promise.resolve(row));
}
export async function projectLearningScope(env:Cloudflare.Env,owner:string,record:WorkspaceRecord):Promise<WorkspaceRecord>{
 const head=await readScopeHead(env,owner,record.family,record.id);
 if(head?.scope_json)return {...record,learningScope:validateLearningScope(JSON.parse(head.scope_json)),learningScopeRev:head.rev!};
 const current=head?(JSON.parse(head.data) as WorkspaceRecord):record;
 if(current.learningScope)return {...record,learningScope:current.learningScope,learningScopeRev:0};
 if(record.learningScope){record={...record};delete record.learningScope;}
 if(!['note','annotation','flag','run'].includes(record.family))return record;
 const refs=[...record.links,...(record.anchor?[{family:record.anchor.recordFamily??'article',id:record.anchor.articleId}]:[]),...(record.anchor?.displayReturn?[{family:record.anchor.displayReturn.recordFamily,id:record.anchor.displayReturn.id}]:[]),...(record.flagTarget?.kind==='record'?[record.flagTarget]:[]),...(record.attempt?[{family:'experiment',id:record.attempt.activity.id}]:[])];
 if(!refs.length)return record;
 const unique=[...new Map(refs.filter(ref=>['journey','investigation','article','area','experiment','source'].includes(ref.family)).map(ref=>[ref.family+':'+ref.id,ref])).values()];
 const rows=await Promise.all(unique.map(ref=>readScopeHead(env,owner,ref.family,ref.id)));
 const scopes=rows.filter((row):row is ScopeHead=>!!row&&!JSON.parse(row.data).trashedAt).map(row=>row.scope_json?validateLearningScope(JSON.parse(row.scope_json)):(JSON.parse(row.data) as WorkspaceRecord).learningScope).filter((scope):scope is LearningScope=>!!scope);
 if(!scopes.length)return record;
 const spaces=[...new Set(scopes.flatMap(s=>s.spaces))],languages=[...new Set(scopes.flatMap(s=>s.languages??[]))];
 return {...record,learningScope:{version:1,spaces,...(languages.length?{languages}:{}),provenance:'classification'},learningScopeInherited:true};
}
export type ClassifyLearningScopeInput={operationId:string;expectedGeneration?:string;family:Family;id:string;expectedRecordRev:number;expectedScopeRev:number;learningScope:LearningScope};
/** Deliberate CAS classification sidecar: never rewrites canonical records, editions or personal progress. */
export async function classifyLearningScope(env:Cloudflare.Env,owner:string,input:ClassifyLearningScopeInput){
 const ident=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
 if(!object(input)||Object.keys(input).some(k=>!['operationId','expectedGeneration','family','id','expectedRecordRev','expectedScopeRev','learningScope'].includes(k))||!ident(input.operationId)||!ident(input.id)||!(FAMILIES as readonly unknown[]).includes(input.family)||!Number.isSafeInteger(input.expectedRecordRev)||input.expectedRecordRev<1||!Number.isSafeInteger(input.expectedScopeRev)||input.expectedScopeRev<0)throw new DomainError(400,'invalid_scope_classification','Use exact family/id, expectedRecordRev, expectedScopeRev (zero when absent), operationId and learningScope.');
 const scope=validateLearningScope(input.learningScope),generation=generationContext(env);if(generation)requireGeneration(generation,input.expectedGeneration);
 const canonical=JSON.stringify({kind:'classify-learning-scope',operationId:input.operationId,family:input.family,id:input.id,expectedRecordRev:input.expectedRecordRev,expectedScopeRev:input.expectedScopeRev,learningScope:scope,expectedGeneration:input.expectedGeneration??null});
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical)))].map(b=>b.toString(16).padStart(2,'0')).join(''),db=env.DB!;
 const prior=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,input.operationId).first<{hash:string;response:string}>();if(prior){if(prior.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Keep the immutable classification payload for this operation ID.');return {...JSON.parse(prior.response),replayed:true};}
 const nonce=crypto.randomUUID(),now=new Date().toISOString(),next=input.expectedScopeRev+1,receipt={operationId:input.operationId,status:'committed',recordRef:{family:input.family,id:input.id,rev:input.expectedRecordRev},learningScope:scope,learningScopeRev:next,replayed:false},conflict={operationId:input.operationId,status:'conflict',error:'The record, classification or generation changed. Refresh before making a new deliberate classification.',replayed:false},fence=generationGuard(env),winning='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',guard=[owner,input.operationId,nonce];
 await db.batch([
  db.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) SELECT ?,?,?,?,0,? WHERE 1=1${fence.sql}`).bind(owner,input.operationId,digest,nonce,JSON.stringify(conflict),...fence.args),
  db.prepare(`INSERT INTO v2_learning_scopes(owner,family,id,rev,scope_json,last_operation,updated_at) SELECT ?,?,?,?,?,?,? WHERE ${winning} AND EXISTS(SELECT 1 FROM v2_records WHERE owner=? AND family=? AND id=? AND rev=? AND trashed_at IS NULL) AND coalesce((SELECT rev FROM v2_learning_scopes WHERE owner=? AND family=? AND id=?),0)=? ON CONFLICT(owner,family,id) DO UPDATE SET rev=excluded.rev,scope_json=excluded.scope_json,last_operation=excluded.last_operation,updated_at=excluded.updated_at WHERE v2_learning_scopes.rev=?`).bind(owner,input.family,input.id,next,JSON.stringify(scope),input.operationId,now,...guard,owner,input.family,input.id,input.expectedRecordRev,owner,input.family,input.id,input.expectedScopeRev,input.expectedScopeRev),
  db.prepare(`UPDATE v2_operations SET status=CASE WHEN EXISTS(SELECT 1 FROM v2_learning_scopes WHERE owner=? AND family=? AND id=? AND last_operation=?) THEN 200 ELSE 409 END,response=CASE WHEN EXISTS(SELECT 1 FROM v2_learning_scopes WHERE owner=? AND family=? AND id=? AND last_operation=?) THEN ? ELSE ? END WHERE owner=? AND id=? AND nonce=?`).bind(owner,input.family,input.id,input.operationId,owner,input.family,input.id,input.operationId,JSON.stringify(receipt),JSON.stringify(conflict),...guard)
 ]);
 const saved=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,input.operationId).first<{hash:string;response:string}>();if(!saved){await assertGenerationCurrent(env);throw new DomainError(503,'uncertain_result','Retain the operation ID and use operation status before retrying.');}if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This operation ID belongs to another payload.');scopeHeads.get(env)?.delete(JSON.stringify([owner,input.family,input.id]));return JSON.parse(saved.response);
}
