import type {ArticleSection, WorkspaceRecord} from './contracts';
import {DomainError} from './domain';
/** Carry exact unique source identities across ordinary manuscript insertions/reorders.
 * A repeated destination is ambiguous rather than a licence to choose by position. */
export function preserveManuscriptIdentity(previous:WorkspaceRecord,next:{sections:ArticleSection[];learningShape?:any;links:any[]},sourceMap:any[]=[]){
 const oldSections=previous.sections??[],sectionMap=new Map<string,string>(),partMap=new Map<string,string>();
 const allocatedSections=new Set(oldSections.map(s=>s.id)),allocatedParts=new Set(oldSections.flatMap(s=>s.parts.map(p=>p.id)));
 const fresh=(prefix:string,used:Set<string>)=>{let i=1;while(used.has(prefix+i))i++;const id=prefix+i;used.add(id);return id};
 const oldTitles=new Map<string,ArticleSection[]>();for(const s of oldSections)oldTitles.set(s.title,[...(oldTitles.get(s.title)??[]),s]);
 const nextTitles=new Map<string,number>();for(const s of next.sections)nextTitles.set(s.title,(nextTitles.get(s.title)??0)+1);
 const stable=(v:any):string=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
 const key=(p:any)=>stable({...p,id:undefined}),content=(section:ArticleSection)=>stable(section.parts.map(key));
 const oldContent=new Map<string,ArticleSection[]>(),nextContent=new Map<string,number>(),claimed=new Set<string>();
 for(const section of oldSections)oldContent.set(content(section),[...(oldContent.get(content(section))??[]),section]);
 for(const section of next.sections)nextContent.set(content(section),(nextContent.get(content(section))??0)+1);
 for(const section of next.sections){
  const originalId=section.id,candidates=oldTitles.get(section.title)??[];
  if(candidates.length>1||candidates.length&&nextTitles.get(section.title)!==1)throw new DomainError(409,'anchor_migration_required','Repeated section headings make this destination ambiguous. Give sections distinct headings before targeted replacement.');
  let old=candidates[0];
  if(!old&&section.parts.length){
   const renamed=(oldContent.get(content(section))??[]).filter(s=>!nextTitles.has(s.title));
   if(renamed.length>1||renamed.length&&nextContent.get(content(section))!==1)throw new DomainError(409,'anchor_migration_required','A renamed section matches multiple identical sections. Declare distinct section content before replacement.');
   old=renamed[0];
  }
  if(old&&claimed.has(old.id))throw new DomainError(409,'anchor_migration_required','Two prospective sections claim the same historical destination.');
  if(old)claimed.add(old.id);section.id=old?.id??fresh('s',allocatedSections);sectionMap.set(originalId,section.id);
  const oldParts=new Map<string,typeof section.parts>();for(const p of old?.parts??[])oldParts.set(key(p),[...(oldParts.get(key(p))??[]),p]);
  const counts=new Map<string,number>();for(const p of section.parts)counts.set(key(p),(counts.get(key(p))??0)+1);
  const unmatchedOld=(old?.parts??[]).filter(p=>!counts.has(key(p))),unmatchedNew=section.parts.filter(p=>!oldParts.has(key(p)));
  // One changed part between otherwise exact anchors is an ordinary wording edit.
  const replacement=unmatchedOld.length===1&&unmatchedNew.length===1&&unmatchedOld[0].kind===unmatchedNew[0].kind?unmatchedOld[0]:undefined;
  for(const p of section.parts){const originalPart=p.id,matches=oldParts.get(key(p))??[];
   if(matches.length>1||matches.length&&counts.get(key(p))!==1)throw new DomainError(409,'anchor_migration_required','Repeated identical parts make destination carryover ambiguous. Make the intended paragraphs distinct before replacement.');
   p.id=matches[0]?.id??(replacement&&p===unmatchedNew[0]?replacement.id:fresh('p',allocatedParts));partMap.set(originalId+':'+originalPart,p.id);
  }
 }
 for(const m of sourceMap){const old=m.sectionId;m.sectionId=sectionMap.get(old)??old;m.partId=partMap.get(old+':'+m.partId)??m.partId;}
 for(const l of next.links){if(l.sourceContext?.sectionId){const old=l.sourceContext.sectionId;l.sourceContext.sectionId=sectionMap.get(old)??old;}}
 if(next.learningShape?.kind==='journey')for(const stage of next.learningShape.stages){const oldId=stage.sectionId;stage.sectionId=sectionMap.get(oldId)??oldId;const oldStage=previous.learningShape?.kind==='journey'?previous.learningShape.stages.find(s=>s.sectionId===stage.sectionId):undefined;stage.id=oldStage?.id??'stage-'+stage.sectionId;for(const l of next.links)if(l.sourceContext?.sectionId===stage.sectionId)l.sourceContext.stageId=stage.id;}
 return {sectionMap:Object.fromEntries(sectionMap),partMap:Object.fromEntries(partMap)};
}
