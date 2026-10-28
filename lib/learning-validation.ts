import {DomainError,wellFormed} from './domain';
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const id=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(v);
const text=(v:unknown,max=1000)=>typeof v==='string'&&wellFormed(v)&&!!v.trim()&&v.length<=max;
export function validateLearning(data:any,family:string,existing:any){
 const shape=data.learningShape!==undefined?data.learningShape:existing?.learningShape,sections=Array.isArray(data.sections)?data.sections:existing?.sections??[];
 if(shape!==undefined){
  const fail=(path:string,msg:string):never=>{throw new DomainError(400,'invalid_learning_shape',msg,'data.learningShape'+path)};
  if(!object(shape)||!(shape.version===1||shape.version===2&&family==='investigation'))fail('','Use a versioned learning presentation contract.');
  const kinds:Record<string,string>={journey:'journey',investigation:'investigation',article:'library-topic',area:'area'};
  if(shape.kind!==kinds[family])fail('.kind','Learning role must match its record family.');
  const keys:Record<string,string[]>={journey:['version','kind','stages'],investigation:shape.version===2?['version','kind','question']:['version','kind','question','mode','provenance'],'library-topic':['version','kind','subject','reusableBeyondProject'],area:['version','kind','subject','categoryPurpose']};
  if(Object.keys(shape).some(k=>!keys[shape.kind]?.includes(k)))fail('','Unsupported learning presentation field.');
  if(shape.kind==='journey'){
   if(!Array.isArray(shape.stages)||!shape.stages.length||shape.stages.length>30)fail('.stages','Use 1–30 ordered stages.');const ids=new Set();const sectionIds=new Set();
   for(const [i,s] of shape.stages.entries()){if(!object(s)||Object.keys(s).some(k=>!['id','sectionId','title','intent','outcome','checkpoint','optional','prerequisites'].includes(k))||!id(s.id)||ids.has(s.id)||!id(s.sectionId)||sectionIds.has(s.sectionId)||!sections.some((v:any)=>v.id===s.sectionId)||!text(s.title,180)||s.intent!==undefined&&!text(s.intent)||s.outcome!==undefined&&!text(s.outcome)||s.checkpoint!==undefined&&!text(s.checkpoint)||s.optional!==undefined&&typeof s.optional!=='boolean'||s.prerequisites!==undefined&&(!Array.isArray(s.prerequisites)||s.prerequisites.length>30||!s.prerequisites.every(id)))fail(`.stages[${i}]`,'Stages need unique stable IDs, canonical sections, short intent/outcome/checkpoint and valid prerequisites.');ids.add(s.id);sectionIds.add(s.sectionId);}
   for(const [i,s] of shape.stages.entries())if(s.prerequisites?.some((p:string)=>!ids.has(p)||p===s.id))fail(`.stages[${i}].prerequisites`,'Prerequisites must identify other declared stages.');
  }
  if(shape.kind==='investigation'&&(!text(shape.question)||shape.version===1&&(!['suggested','active'].includes(shape.mode)||!['gpt-prompt','owner-created'].includes(shape.provenance))))fail('','Declare an open question; legacy version 1 preserves its historical fields.');
  if(shape.kind==='library-topic'&&(!text(shape.subject,240)||typeof shape.reusableBeyondProject!=='boolean'))fail('','Declare a reusable topic subject.');
  if(shape.kind==='area'&&(!text(shape.subject,240)||!text(shape.categoryPurpose)))fail('','Declare a subject and grouping purpose.');
 }
 const links=Array.isArray(data.links)?data.links:existing?.links??[];const relationIds=new Set();for(const [i,l] of links.entries()){
  if(!object(l))throw new DomainError(400,'invalid_links','Each relationship must be an object.',`data.links[${i}]`);
  if(l.relationId!==undefined&&(!id(l.relationId)||relationIds.has(l.relationId)))throw new DomainError(400,'invalid_relation_identity','Contextual relationship IDs must be unique and stable.',`data.links[${i}].relationId`);if(l.relationId)relationIds.add(l.relationId);
  if(l.sourceContext!==undefined){const c=l.sourceContext;if(!object(c)||Object.keys(c).some(k=>!['sectionId','stageId'].includes(k))||!c.sectionId&&!c.stageId||c.sectionId!==undefined&&(!id(c.sectionId)||!sections.some((s:any)=>s.id===c.sectionId))||c.stageId!==undefined&&(!id(c.stageId)||shape?.kind!=='journey'||!shape.stages.some((s:any)=>s.id===c.stageId&&(!c.sectionId||s.sectionId===c.sectionId))))throw new DomainError(400,'source_context_unavailable','Repair or remove the source-stage relationship before removing its section or stage.',`data.links[${i}].sourceContext`);}
 }
 for(const [i,c] of (Array.isArray(data.concepts)?data.concepts:existing?.concepts??[]).entries()){
  if(!object(c))throw new DomainError(400,'invalid_concept','Each canonical entry must be an object.',`data.concepts[${i}]`);
  if(c.kind!==undefined&&!['concept','python-function','shell-command','api','language-syntax'].includes(c.kind)||c.signature!==undefined&&!text(c.signature,500)||c.usage!==undefined&&!text(c.usage,1000)||c.examplePartId!==undefined&&(!id(c.examplePartId)||!sections.some((s:any)=>s.id===c.sectionId&&s.parts.some((p:any)=>p.id===c.examplePartId&&p.kind==='code'))))throw new DomainError(400,'invalid_concept','Use a supported reference kind and an exact canonical code example.',`data.concepts[${i}]`);
 }
}
