import {DomainError,authoringDomain,readRecord} from './domain';
import {readCatalogue,prepareCatalogue,catalogueStatements,cataloguePrecondition,type CatalogueIntent} from './catalogue';
import {generationContext,generationGuard,requireGeneration,assertGenerationCurrent} from './generations';
import type {WorkspaceCommand,CommandReceipt} from './contracts';
/** Catalogue-only CAS never rewrites the canonical Article or its historical reading. */
export async function executeCatalogueCommand(env:Cloudflare.Env,owner:string,c:WorkspaceCommand,digest:string):Promise<CommandReceipt>{
 const data=c.data as Record<string,unknown>;if(c.action!=='update'||c.family!=='article'||Object.keys(data).some(k=>k!=='catalogue'))throw new DomainError(400,'invalid_catalogue_command','Catalogue edits update one Article catalogue only.');
 const intent=data.catalogue as CatalogueIntent;if(!intent||!Number.isSafeInteger(intent.expectedRev)||(intent.expectedRev??-1)<0)throw new DomainError(400,'catalogue_revision_required','Use the current explicit catalogue revision, including zero for legacy entries.');
 const generation=generationContext(env);if(generation)requireGeneration(generation,c.expectedGeneration);
 const record=await authoringDomain.rawReadRecord(env,owner,'article',c.id!);if(!record||record.rev!==c.expectedRev)throw new DomainError(409,'revision_conflict','The Article changed. Retain the catalogue proposal.');
 const prepared=await prepareCatalogue(env,owner,record,intent),nonce=crypto.randomUUID(),fence=generationGuard(env),pre=cataloguePrecondition(owner,record.id,prepared.expectedRev);
 const win='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',args=[owner,c.operationId,nonce];
 const receipt={operationId:c.operationId,status:'committed',recordRef:{family:'article',id:record.id,rev:record.rev},catalogueRev:prepared.rev,replayed:false};
 await env.DB!.batch([
  env.DB!.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) SELECT ?,?,?,?,200,? WHERE EXISTS(SELECT 1 FROM v2_records WHERE owner=? AND family='article' AND id=? AND rev=? AND trashed_at IS NULL) AND ${pre.sql}${fence.sql}`).bind(owner,c.operationId,digest,nonce,JSON.stringify(receipt),owner,record.id,record.rev,...pre.args,...fence.args),
  ...catalogueStatements(env,owner,record,prepared,c.operationId,{winningSQL:win,winningArgs:args})
 ]);
 const saved=await env.DB!.prepare('SELECT hash,nonce,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,c.operationId).first<{hash:string;nonce:string;response:string}>();if(!saved){await assertGenerationCurrent(env);throw new DomainError(409,'catalogue_conflict','The catalogue or Article changed. Retain the proposal and read current revisions.');}if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This operation belongs to another immutable payload.');
 return {...JSON.parse(saved.response),...(saved.nonce===nonce?{record:await readRecord(env,owner,'article',record.id)}:{}),replayed:saved.nonce!==nonce};
}
