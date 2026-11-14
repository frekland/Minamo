import {z} from 'zod';
import {workspacePlanSchema,validateWorkspacePlan} from './composed-presentation';
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/),text=z.string().min(1).max(180);
export const materialOriginSchema=z.object({description:z.string().min(1).max(1000),conversationUrl:z.string().url().max(2000).optional(),occurredAt:z.string().datetime().optional()}).strict();
export const materialAttributionSchema=z.object({sectionId:id,author:z.enum(['user','gpt','unknown']),role:z.enum(['attempt','correction','explanation','practice','observation','question','other']),origin:materialOriginSchema.optional()}).strict();
export const materialRefSchema=z.object({family:z.enum(['journey','work','article','investigation']),id,sectionId:id,partId:id,rendition:z.string().min(1).max(240),policy:z.enum(['pin','follow']),sourceRevision:z.number().int().positive(),label:z.string().max(240).optional(),group:z.string().max(100).optional(),annotation:z.string().max(1000).optional()}).strict();
export const arrangementSchema=z.object({version:z.literal(1),kind:z.literal('arrangement'),purpose:z.string().max(2000),presentation:z.enum(['reading','practice','compare']),entries:z.array(materialRefSchema).min(1).max(32),plan:workspacePlanSchema.optional()}).strict();
export const accumulationSchema=z.union([z.object({version:z.literal(1),kind:z.literal('material'),attribution:z.array(materialAttributionSchema).min(1).max(30)}).strict(),arrangementSchema]);
export type Accumulation=z.infer<typeof accumulationSchema>;
export type MaterialRef=z.infer<typeof materialRefSchema>;
export function validateAccumulation(value:unknown,family:string,existing?:{experience?:Accumulation;sections?:unknown[]},sections?:unknown[]){
 if(family!=='work')throw Error('Independent material and arrangements belong to work records.');
 const parsed=accumulationSchema.parse(value);
 if(existing?.experience&&existing.experience.kind!==parsed.kind)throw Error('Material and arrangement identities cannot be converted.');
 if(parsed.kind==='material'){
  const next=(sections??existing?.sections??[]) as {id:string}[];
  if(next.length!==parsed.attribution.length||new Set(parsed.attribution.map(a=>a.sectionId)).size!==next.length||next.some((s,i)=>s.id!==parsed.attribution[i].sectionId))throw Error('Each ordered material section needs its exact attribution.');
  if(existing?.experience?.kind==='material'){
   const prior=existing.sections??[];
   if(prior.some((section,i)=>JSON.stringify(section)!==JSON.stringify(next[i]))||existing.experience.attribution.some((a,i)=>JSON.stringify(a)!==JSON.stringify(parsed.attribution[i])))throw Error('Retained originals and attribution are append-only. Add a correction as new material.');
  }
 }else if(parsed.plan)validateWorkspacePlan(parsed.plan,parsed.entries.length);
 if(parsed.kind==='arrangement'&&(sections??existing?.sections??[]).length)throw Error('Arrangements contain references, not copied source parts.');
 return parsed;
}
export const retainInputSchema=z.object({materialId:id.optional(),expectedRevision:z.number().int().min(0),expectedGeneration:z.string().max(160),operationId:id,title:text,language:z.string().max(48).optional(),items:z.array(z.object({author:z.enum(['user','gpt','unknown']),role:z.enum(['attempt','correction','explanation','practice','observation','question','other']),title:text,origin:materialOriginSchema.optional(),parts:z.array(z.unknown()).min(1).max(20)}).strict()).min(1).max(8),synthetic:z.boolean().optional()}).strict();
export const saveArrangementInputSchema=z.object({arrangementId:id.optional(),expectedRevision:z.number().int().min(0),expectedGeneration:z.string().max(160),operationId:id,title:text,purpose:z.string().max(2000),presentation:z.enum(['reading','practice','compare']),entries:z.array(materialRefSchema).min(1).max(32),plan:workspacePlanSchema.optional(),synthetic:z.boolean().optional()}).strict();

export const composeWorkspaceInputSchema=saveArrangementInputSchema.omit({presentation:true}).extend({plan:workspacePlanSchema});
