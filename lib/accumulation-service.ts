import {DomainError,readRecord,readRendition,readRecordRevision,executeCommand,queryRecords,authoringDomain} from './domain';
import type {Actor,WorkspaceRecord,PassagePart} from './contracts';
import {retainInputSchema,saveArrangementInputSchema,type MaterialRef,type Accumulation} from './accumulation-contract';
import {discoverMaterial} from './accumulation-index';
function parseInput<T>(schema:{parse:(value:unknown)=>T},value:unknown):T{try{return schema.parse(value)}catch(error){throw new DomainError(400,'invalid_experience_input',String((error as Error).message).slice(0,1200));}}
const withoutPurpose=(input:Record<string,unknown>)=>Object.fromEntries(Object.entries(input).filter(([key])=>key!=='requestPurpose'&&key!=='purpose'));
export async function retainMaterial(env:Cloudflare.Env,owner:string,raw:Record<string,unknown>,actor:Actor){
 const input=parseInput(retainInputSchema,withoutPurpose(raw)),digest=await authoringDomain.hash({tool:'retain_minamo_material',actor,input});
 const id=input.materialId??'material-'+(await authoringDomain.hash({owner,op:input.operationId})).slice(0,40);
 const existing=input.materialId?await readRecord(env,owner,'work',id):null;
 if(input.materialId&&existing?.experience?.kind!=='material')throw new DomainError(409,'material_unavailable','Choose an existing retained material record.');
 if(!input.materialId&&input.expectedRevision!==0)throw new DomainError(400,'create_revision','New material needs expectedRevision zero.');
 const prefix='capture-'+digest.slice(0,16);
 const sections=input.items.map((item,i)=>({id:prefix+'-'+i,title:item.title,parts:item.parts.map((part,j)=>{if(!part||typeof part!=='object'||Array.isArray(part))throw new DomainError(400,'invalid_part','Use typed content parts.');return {...part,id:(part as {id?:string}).id??prefix+'-'+i+'-p'+j} as PassagePart})}));
 const experience:Accumulation={version:1,kind:'material',attribution:[...(existing?.experience?.kind==='material'?existing.experience.attribution:[]),...input.items.map((item,i)=>({sectionId:sections[i].id,author:item.author,role:item.role,...(item.origin?{origin:item.origin}:{})}))]};
 const receipt=await executeCommand(env,owner,{operationId:input.operationId,expectedGeneration:input.expectedGeneration,action:input.materialId?'update':'create',family:'work',id,...(input.materialId?{expectedRev:input.expectedRevision}:{}),data:{title:input.title,body:existing?.body??'Deliberately retained material. Attribution records supplied authorship, not independent verification.',sections:[...(existing?.sections??[]),...sections],experience,...(!existing?{synthetic:input.synthetic??false,...(input.language?{learningScope:{version:1,spaces:['languages'],languages:[input.language],provenance:'authored'}}:{})}:{})}},actor,undefined,{projectAuthoring:true,digest});
 return {...receipt,materialId:id,exactRead:{family:'work',id},notice:'Original retained sections are immutable; corrections append. No Project or Note was created.'};
}
export async function saveArrangement(env:Cloudflare.Env,owner:string,raw:Record<string,unknown>,actor:Actor){
 const input=parseInput(saveArrangementInputSchema,Object.fromEntries(Object.entries(raw).filter(([key])=>key!=='requestPurpose'))),digest=await authoringDomain.hash({tool:'save_minamo_arrangement',actor,input});
 const id=input.arrangementId??'arrangement-'+(await authoringDomain.hash({owner,op:input.operationId})).slice(0,40);
 if(input.arrangementId&&(await readRecord(env,owner,'work',id))?.experience?.kind!=='arrangement')throw new DomainError(409,'arrangement_unavailable','Choose an existing saved arrangement.');
 if(!input.arrangementId&&input.expectedRevision!==0)throw new DomainError(400,'create_revision','New arrangements need expectedRevision zero.');
 return {...await executeCommand(env,owner,{operationId:input.operationId,expectedGeneration:input.expectedGeneration,action:input.arrangementId?'update':'create',family:'work',id,...(input.arrangementId?{expectedRev:input.expectedRevision}:{}),data:{title:input.title,body:input.purpose,experience:{version:1,kind:'arrangement',purpose:input.purpose,presentation:input.presentation,entries:input.entries,...(input.plan?{plan:input.plan}:{})},...(!input.arrangementId?{synthetic:input.synthetic??false}:{})}},actor,undefined,{projectAuthoring:true,digest}),arrangementId:id,experienceUrl:'/?view=home&experienceId='+encodeURIComponent(id)};
}
export async function resolveMaterialRef(env:Cloudflare.Env,owner:string,ref:MaterialRef){
 const head=await readRecord(env,owner,ref.family,ref.id);if(!head)return {ref,status:'unavailable' as const,reason:'Source is unavailable under current rights.'};
 const source=ref.policy==='pin'?await readRendition(env,owner,ref.id,ref.rendition,ref.family):head;
 const section=source?.sections?.find(s=>s.id===ref.sectionId),part=section?.parts.find(p=>p.id===ref.partId&&!p.unavailable);
 if(!source||!part)return {ref,status:'unavailable' as const,reason:'Exact source part or pinned edition is unavailable. No replacement was guessed.'};
 const attribution=source.experience?.kind==='material'?source.experience.attribution.find(a=>a.sectionId===ref.sectionId):undefined;
 return {ref,status:'available' as const,sourceTitle:source.title,sourceRevision:source.rev,currentRevision:head.rev,newerAvailable:head.rev!==source.rev,changedSinceSaved:head.rev!==ref.sourceRevision,sectionTitle:section!.title,part,attribution,sourceRendition:source.rendition};
}
export async function readArrangement(env:Cloudflare.Env,owner:string,input:{id:string;revision?:number;offset?:number;limit?:number}){
 if(input.revision!==undefined&&(!Number.isSafeInteger(input.revision)||input.revision<1))throw new DomainError(400,'invalid_revision','Use an exact positive saved revision.');
 const record=input.revision?await readRecordRevision(env,owner,'work',input.id,input.revision):await readRecord(env,owner,'work',input.id);
 if(!record||record.experience?.kind!=='arrangement')throw new DomainError(404,'arrangement_unavailable','Saved arrangement unavailable.');
 const offset=Number(input.offset??0),limit=Number(input.limit??4);if(!Number.isInteger(offset)||offset<0||!Number.isInteger(limit)||limit<1||limit>8)throw new DomainError(400,'reading_budget','Read one to eight arrangement entries at a time.');
 const entries=await Promise.all(record.experience.entries.slice(offset,offset+limit).map(ref=>resolveMaterialRef(env,owner,ref)));
 const {inspectPresentation}=await import('./presentation-inspection');
 const {__mcpImage,...presentationInspection}=await inspectPresentation(env,owner,{view:'workspace',id:input.id,...(input.revision?{revision:input.revision}:{}),detail:offset===0?'visual':'structure'});

 return {record,entries,presentationInspection,...(__mcpImage?{__mcpImage}:{}),offset,nextOffset:offset+limit<record.experience.entries.length?offset+limit:null,notice:'Arrangements reference eligible canonical sources; pin retains an edition, follow resolves current content. Unavailable sources are not replaced.'};
}
export async function listExperiences(env:Cloudflare.Env,owner:string,cursor?:string){const page=await queryRecords(env,owner,{family:'work',limit:24,includeSynthetic:false,cursor});return {...page,records:page.records.filter(r=>r.experience)};}
export {discoverMaterial};
