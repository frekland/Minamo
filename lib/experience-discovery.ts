import type {WorkspaceRecord,PassagePart,Family} from './contracts';
export type ExperienceRef={family:Family;id:string;rendition:string;sectionId:string;partId:string};
export type ExperienceEntry={key:string;ref:ExperienceRef;sourceTitle:string;heading:string;kind:string;text:string;subItem?:string;sourceRevision:number;attribution:string};
const strings=(value:unknown):string=>typeof value==='string'?value:Array.isArray(value)?value.map(strings).join(' '):value&&typeof value==='object'?Object.entries(value).filter(([key])=>!['id','version','assetId','digest'].includes(key)).map(([,v])=>strings(v)).join(' '):'';
export function experienceEntries(records:WorkspaceRecord[]):ExperienceEntry[]{
 const entries:ExperienceEntry[]=[];
 for(const record of records){if(record.trashedAt||record.synthetic||!record.rendition||!['journey','article','work','investigation'].includes(record.family))continue;
  for(const section of record.sections??[])for(const part of section.parts){if(part.unavailable)continue;
   const ref={family:record.family,id:record.id,rendition:record.rendition,sectionId:section.id,partId:part.id};
   const base={ref,sourceTitle:record.title,heading:section.title,sourceRevision:record.rev,attribution:'Attribution is as saved in the source; no learner authorship is inferred.'};
   entries.push({...base,key:JSON.stringify(ref),kind:part.kind==='interactive'?part.interactive?.type??part.kind:part.kind,text:strings(part)});
   const interactive=part.interactive;
   const children=interactive?.type==='flashcards'?interactive.cards:interactive?.type==='language-dialogue'?interactive.turns:[];
   for(const child of children)entries.push({...base,key:JSON.stringify([ref,child.id]),kind:interactive?.type==='flashcards'?'card':'turn',subItem:child.id,text:strings(child)});
  }
 }
 return entries;
}
export function findExperienceEntries(entries:ExperienceEntry[],query:string,kind='all'){
 const terms=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return entries.filter(entry=>(kind==='all'||kind==='practice'&&['flashcards','language-dialogue','language-reveal','language-pattern'].includes(entry.kind)||entry.kind===kind)&&terms.every(term=>(entry.heading+' '+entry.sourceTitle+' '+entry.text).toLocaleLowerCase().includes(term)));
}
export function experiencePart(record:WorkspaceRecord,ref:ExperienceRef):PassagePart|null{
 if(record.trashedAt||record.family!==ref.family||record.id!==ref.id||record.rendition!==ref.rendition)return null;
 return record.sections?.find(section=>section.id===ref.sectionId)?.parts.find(part=>part.id===ref.partId&&!part.unavailable)??null;
}
