import {z} from 'zod';
import {DomainError,authoringDomain,executeCommand} from './domain';
import {generationContext,requireGeneration} from './generations';

const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
export const projectObservationSchema=z.object({
 operationId:id,expectedGeneration:z.string().max(160),projectId:id,
 expectedProjectRev:z.number().int().min(1),sectionId:id,partId:id,
 definitionDigest:z.string().regex(/^[a-f0-9]{64}$/),observedAt:z.string().datetime(),
 inputs:z.record(z.union([z.number().finite(),z.boolean(),z.string().max(80)])).refine(v=>Object.keys(v).length<=8,'At most eight captured inputs.'),
 seed:z.number().int().nullable(),output:z.string().max(8000),description:z.string().min(1).max(1000),
 classification:z.literal('browser-reported')
}).strict();

/** A bounded ordinary Project patch: no Note, independent ledger, or execution attestation. */
export async function saveProjectObservation(env:Cloudflare.Env,owner:string,input:unknown){
 let r:z.infer<typeof projectObservationSchema>;
 try{r=projectObservationSchema.parse(input);}catch(e){throw new DomainError(400,'invalid_observation',(e as Error).message);}
 const ctx=generationContext(env);if(ctx)requireGeneration(ctx,r.expectedGeneration);
 const digest=await authoringDomain.hash({kind:'project-observation-v1',request:r});
 const old=await env.DB!.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,r.operationId).first<{hash:string;response:string}>();
 if(old){if(old.hash!==digest)throw new DomainError(409,'idempotency_mismatch','The operation identity belongs to different captured input.');return authoringDomain.receiptMetadata(JSON.parse(old.response));}
 const record=await authoringDomain.rawReadRecord(env,owner,'journey',r.projectId),part=record?.sections?.find(s=>s.id===r.sectionId)?.parts.find(p=>p.id===r.partId);
 if(!record||record.trashedAt||record.rev!==r.expectedProjectRev)throw new DomainError(409,'revision_conflict','Refresh the Project before saving the retained captured observation.');
 if(!part?.interactive||!['python-canvas','parameter-explorer'].includes(part.interactive.type))throw new DomainError(409,'observation_target_unavailable','The selected interactive material is unavailable.');
 const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(part.interactive))))).map(n=>n.toString(16).padStart(2,'0')).join('');
 if(actual!==r.definitionDigest)throw new DomainError(409,'observation_definition_changed','The activity definition changed after execution. Retain this observation and review its source.');
 const key='observation-'+(await authoringDomain.hash({operationId:r.operationId})).slice(0,32),data={version:1,classification:r.classification,observedAt:r.observedAt,source:{sectionId:r.sectionId,partId:r.partId,definitionDigest:r.definitionDigest},inputs:r.inputs,seed:r.seed,output:r.output};
 return executeCommand(env,owner,{operationId:r.operationId,expectedGeneration:r.expectedGeneration,action:'update',family:'journey',id:r.projectId,expectedRev:r.expectedProjectRev,data:{patch:[
  {op:'insertBlock',sectionId:r.sectionId,afterPartId:r.partId,block:{id:key,kind:'callout',callout:{tone:'note',label:'Observation'},text:r.description+'\nBrowser-reported · '+r.observedAt}},
  {op:'insertBlock',sectionId:r.sectionId,afterPartId:key,block:{id:key+'-inputs',kind:'code',language:'json',text:JSON.stringify(data,null,2)}}
 ]}},'user',undefined,{projectAuthoring:true,digest});
}
