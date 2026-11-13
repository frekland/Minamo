import {repairProjectEmphasis} from './project-presentation';
import {projectReadingTopics} from './project-reading-topics';
import {testRunDescriptor,fictionalEventSchema} from './test-run-contract';
import {imageAdmissionGuard,imageAttachmentStatements} from './assets';
import {mediaAdmissionGuard,mediaAttachmentStatements} from './media';
import {z} from 'zod';
import {DomainError,authoringDomain,executeCommand,readRecord,readRendition,operationStatus} from './domain';
import {compositionSchema,adaptedComposition,layoutCapabilities,projectRefSchema,patterns,workThreadSchema} from './project-composition';
import {generationContext,requireGeneration,generationGuard,assertGenerationCurrent} from './generations';
import {buildRecordLink} from './reading-links';
import {projectCodePackageArchive,projectCodePackageInventory,ProjectCodePackageError} from './project-code-package';
import type {Actor,WorkspaceRecord,ArticleSection,PassagePart} from './contracts';
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const block=compositionSchema.shape.blocks.element;
const section=compositionSchema.shape.sections.element;
const content=z.object({id,title:z.string().max(180),parts:z.array(z.record(z.unknown())).max(40)}).strict();
export const updateSchema=z.object({repairMarkdownEmphasis:z.boolean().optional(),globalStructure:z.literal(true).optional(),operationId:id,expectedGeneration:z.string().max(160),projectId:id,expectedProjectRev:z.number().int().min(0),title:z.string().min(1).max(180).optional(),description:z.string().max(600).optional(),body:z.string().max(24000).optional(),synthetic:z.boolean().optional(),testRunId:id.optional(),testRun:testRunDescriptor.optional(),fictionalEvent:fictionalEventSchema.optional(),learningScope:z.unknown().optional(),projectCover:z.unknown().optional(),contentSections:z.array(content).max(30).optional(),noteChanges:z.array(z.object({id,expectedRev:z.number().int().min(0),title:z.string().min(1).max(180),body:z.string().max(24000),sections:z.array(content).max(30).optional()}).strict()).max(8).optional(),composition:compositionSchema.optional(),changes:z.array(z.discriminatedUnion('op',[
 z.object({op:z.literal('upsertSection'),section}).strict(),z.object({op:z.literal('upsertBlock'),sectionId:id,slotId:id,block,content:content.optional()}).strict(),
 z.object({op:z.literal('moveBlock'),id,sectionId:id,slotId:id,index:z.number().int().min(0).max(128)}).strict(),
 z.object({op:z.literal('setSection'),id,title:z.string().max(180).optional(),hidden:z.boolean().optional(),collapsed:z.boolean().optional(),index:z.number().int().min(0).max(31).optional()}).strict(),
 z.object({op:z.literal('setBlockPresentation'),id,pinned:z.boolean().optional(),width:z.enum(['full','split','compact']).optional()}).strict(),
 z.object({op:z.literal('setFavourite'),id,favourite:z.boolean()}).strict(),
 z.object({op:z.literal('setBlockVisibility'),id,hidden:z.boolean()}).strict(),z.object({op:z.literal('setLayoutLock'),id,lock:z.enum(['position','content','both']).optional()}).strict(),
 z.object({op:z.literal('upsertWorkThread'),thread:workThreadSchema}).strict(),z.object({op:z.literal('removeWorkThread'),id}).strict()
])).max(64).optional(),restoreRevision:z.number().int().min(1).optional(),explicitOverrideIds:z.array(z.string().max(180)).max(160).optional()}).strict();
export {layoutCapabilities};
export async function getProjectComposition(env:Cloudflare.Env,owner:string,projectId:string,revision?:number){
 const current=await readRecord(env,owner,'journey',projectId);if(!current)throw new DomainError(404,'project_unavailable','Project unavailable.');
 let record=current;
 if(revision!==undefined){if(!Number.isSafeInteger(revision)||revision<1)throw new DomainError(400,'invalid_revision','Choose an exact record revision.');const row=await env.DB!.prepare("SELECT data FROM v2_revisions WHERE owner=? AND family='journey' AND id=? AND revision=?").bind(owner,projectId,revision).first<{data:string}>();if(!row)throw new DomainError(404,'revision_unavailable','That Project revision is unavailable.');record=(await authoringDomain.projectRecord(env,owner,JSON.parse(row.data),false,true))!;}
 const composition=adaptedComposition(record),references=[];let bytes=0;
 for(const b of composition.blocks){if(!b.ref)continue;const r=b.ref;const current=await readRecord(env,owner,r.family,r.id);const target=r.rendition?await readRendition(env,owner,r.id,r.rendition,r.family):current;const size=JSON.stringify(target).length;bytes+=size;references.push({blockId:b.id,ref:r,record:bytes<=200000?target:null,unavailable:!target,omitted:!!target&&bytes>200000,...(target&&current&&r.rendition&&current.rev>target.rev?{newerEdition:{family:current.family,id:current.id,rev:current.rev,rendition:current.rendition,destination:buildRecordLink(current)}}:{})});}
 const history=await env.DB!.prepare("SELECT revision FROM v2_revisions WHERE owner=? AND family='journey' AND id=? ORDER BY revision DESC LIMIT 12").bind(owner,projectId).all<{revision:number}>();
 const pins=await listPagePins(env,owner,{family:'journey',id:projectId});
 const workThreadReferenceIssues=(composition.workThreads??[]).flatMap(thread=>thread.items.filter(item=>item.unresolvedRef).map(item=>({threadId:thread.id,sectionId:item.sectionId,partId:item.partId,revision:item.revision??null,...item.unresolvedRef})));
 return {record,composition,presentation:{basis:'Shared frontend topic projection; not a screenshot or interaction test',topics:projectReadingTopics(composition,record.sections,Object.fromEntries(references.filter(r=>r.record).map(r=>[r.blockId,r.record!.title]))),sectionNavigationCount:composition.sections.filter(s=>!s.hidden).length},currentProjectRev:current.rev,revision:record.rev,references,history:history.results.map(r=>r.revision),historyLimit:12,pins,workThreadReferenceIssues,codePackageInventory:await projectCodePackageInventory(record),href:'/?view=journeys&family=journey&id='+encodeURIComponent(projectId)};
}
/** Download a pinned edition, not a potentially changed current Project. */
export async function downloadProjectCodePackage(env:Cloudflare.Env,owner:string,projectId:string,packageId:string,revision:number){
 if(!id.safeParse(projectId).success||!id.safeParse(packageId).success||!Number.isSafeInteger(revision)||revision<1)
  throw new DomainError(400,'invalid_code_package_request','Choose exact Project, package and saved revision identities.');
 const {record}=await getProjectComposition(env,owner,projectId,revision);
 try{
  const bytes=await projectCodePackageArchive(record,packageId);
  const name=projectId.toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,80);
  return {bytes,filename:`${name}-r${revision}.zip`};
 }catch(error){
  if(error instanceof ProjectCodePackageError)throw new DomainError(error.status,error.code,error.message);
  throw error;
 }
}
type CapturedWorkLink={threadIds:string[];source:{sectionId:string;partId:string};definitionMatchesSavedEdition:boolean};
const partIdentity=(sectionId:string,partId:string)=>JSON.stringify([sectionId,partId]);
type SourceBinding={packageId:string;path:string;role:'source'|'test'|'documentation';sectionId:string;partId:string;sourceRevision:number};
/** File names are exact author-declared package mappings, not guessed from code or prose. */
function sourceBindings(record:WorkspaceRecord|undefined){
 const byPart=new Map<string,SourceBinding[]>(),all:SourceBinding[]=[];
 if(!record)return {byPart,all};
 for(const pkg of record.projectComposition?.codePackages??[])for(const file of pkg.files){
  const binding={packageId:pkg.id,path:file.path,role:file.role,sectionId:file.sectionId,partId:file.partId,sourceRevision:record.rev};
  const key=partIdentity(file.sectionId,file.partId);
  if(!byPart.has(key))byPart.set(key,[]);
  byPart.get(key)!.push(binding);all.push(binding);
 }
 return {byPart,all};
}
const bindingIdentity=(file:SourceBinding)=>JSON.stringify([file.packageId,file.path,file.role,file.sectionId,file.partId]);
/** Read-only relationship supplied by the existing Project observation format.
 * Require the exact adjacent callout/JSON pair, an interactive source and the
 * recorded source identity. Never reinterpret general prose as a capture. */
async function capturedWorkLinks(record:WorkspaceRecord,linkedThreads:Map<string,string[]>){
 const links=new Map<string,CapturedWorkLink>(),hashes=new Map<string,string>();
 for(const section of record.sections??[])for(let index=0;index<section.parts.length;index++){
  const sourcePart=section.parts[index],threadIds=linkedThreads.get(partIdentity(section.id,sourcePart.id));
  if(!threadIds?.length||sourcePart.kind!=='interactive'||sourcePart.unavailable||!sourcePart.interactive||!['python-canvas','parameter-explorer'].includes(sourcePart.interactive.type))continue;
  let sourceDigest=hashes.get(partIdentity(section.id,sourcePart.id));
  if(!sourceDigest){const bytes=new TextEncoder().encode(JSON.stringify(sourcePart.interactive));sourceDigest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');hashes.set(partIdentity(section.id,sourcePart.id),sourceDigest);}
  for(let at=index+1;at+1<section.parts.length;at+=2){
   const note=section.parts[at],inputs=section.parts[at+1];
   if(note.kind!=='callout'||note.callout?.label!=='Observation'||note.unavailable||!/^observation-[a-f0-9]{32}$/.test(note.id)||inputs.id!==note.id+'-inputs'||inputs.kind!=='code'||inputs.language!=='json'||inputs.unavailable)break;
   let data:unknown;try{data=JSON.parse(inputs.text);}catch{break;}
   if(!data||typeof data!=='object'||Array.isArray(data))break;
   const capture=data as Record<string,unknown>,origin=capture.source;
   if(capture.version!==1||capture.classification!=='browser-reported'||!origin||typeof origin!=='object'||Array.isArray(origin))break;
   const from=origin as Record<string,unknown>;
   if(from.sectionId!==section.id||from.partId!==sourcePart.id||typeof from.definitionDigest!=='string'||!/^[a-f0-9]{64}$/.test(from.definitionDigest))break;
   const link:CapturedWorkLink={threadIds,source:{sectionId:section.id,partId:sourcePart.id},definitionMatchesSavedEdition:from.definitionDigest===sourceDigest};
   links.set(partIdentity(section.id,note.id),link);links.set(partIdentity(section.id,inputs.id),link);
  }
 }
 return links;
}
/** Exact, owner-scoped saved-record diffs; not an inferred session or execution log. */
function exactMaterialLabel(part:PassagePart):string|undefined{
 let label:string|undefined;
 if(part.kind==='table'&&part.table)label=part.table.caption||'Columns: '+part.table.headers.join(' · ');
 else if(part.kind==='image'&&part.image)label=part.image.caption||part.image.alt;
 else if(part.kind==='media'&&part.media)label=part.media.caption||part.media.description;
 else if(part.kind==='reference'&&part.reference)label=part.reference.label;
 else if(part.kind==='diagram'&&part.diagram)label=part.diagram.format==='grid-v1'?part.diagram.title:part.diagram.presentation?.description||part.diagram.nodes.slice(0,3).map(node=>node.label).join(' · ');
 else if(part.kind==='interactive'&&part.interactive){
  const item=part.interactive;
  label=item.type==='flashcards'?`Flashcards · ${item.cards.length} cards`:item.type==='language-dialogue'?`Dialogue · ${item.turns.length} turns`:item.type==='language-pattern'?`Sentence patterns · ${item.examples.length} examples`:item.type==='language-reveal'?`Language reveal · ${item.source.text}`:item.type==='drawing'?'Drawing board':item.type==='python-canvas'?'Python Canvas':item.type==='parameter-explorer'?'Parameter explorer':'Packaged game';
 }else if(part.kind==='code'&&part.language)label=part.language+' source';
 else if(part.kind==='callout'&&part.callout?.label)label=part.callout.label;
 return label?.replace(/\s+/g,' ').trim().slice(0,160)||undefined;
}
type FieldChange={field:string;before:string;after:string};
/** Bounded, literal comparisons of saved authoring. No semantic judgement, learning
 * event, Work relationship or inferred cause is added to a revision. */
function exactFieldChanges(before:PassagePart|undefined,after:PassagePart|undefined):FieldChange[]{
 if(!before||!after||before.kind!==after.kind)return [];
 const changes:FieldChange[]=[];
 const differingSnippets=(oldValue:string,newValue:string)=>{
  const oldText=oldValue.replace(/\s+/g,' ').trim(),newText=newValue.replace(/\s+/g,' ').trim();
  let offset=0;
  while(offset<Math.min(oldText.length,newText.length)&&oldText[offset]===newText[offset])offset++;
  // Both excerpts begin at the same real difference, even when most of a
  // retained paragraph is unchanged. A front-only preview can hide the edit.
  const start=Math.max(0,offset-40);
  const excerpt=(value:string)=>{
   const from=Math.min(start,value.length),to=from+140;
   return (from>0?'…':'')+value.slice(from,to)+(value.length>to?'…':'');
  };
  return {before:excerpt(oldText),after:excerpt(newText)};
 };
 const add=(field:string,oldValue:unknown,newValue:unknown)=>{
  if(changes.length>=3||typeof oldValue!=='string'||typeof newValue!=='string'||oldValue===newValue)return;
  changes.push({field,...differingSnippets(oldValue,newValue)});
 };
 if(before.kind==='interactive'&&before.interactive&&after.interactive&&before.interactive.type===after.interactive.type){
  const old=before.interactive,newer=after.interactive;
  if(old.type==='language-dialogue'&&newer.type==='language-dialogue'){
   const byId=new Map(old.turns.map(turn=>[turn.id,turn]));
   newer.turns.forEach((turn,index)=>{
    const prior=byId.get(turn.id);if(!prior)return;
    add(`Turn ${index+1} · Japanese`,prior.source.text,turn.source.text);
    add(`Turn ${index+1} · translation`,prior.source.translation,turn.source.translation);
   });
  }else if(old.type==='language-reveal'&&newer.type==='language-reveal'){
   add('Japanese',old.source.text,newer.source.text);
   add('Translation',old.source.translation,newer.source.translation);
   add('Explanation',old.explanation,newer.explanation);
  }else if(old.type==='flashcards'&&newer.type==='flashcards'){
   const byId=new Map(old.cards.map(card=>[card.id,card]));
   newer.cards.forEach((card,index)=>{
    const prior=byId.get(card.id);if(!prior)return;
    add(`Card ${index+1} · front`,prior.front.text,card.front.text);
    add(`Card ${index+1} · back`,prior.back.text,card.back.text);
   });
  }
 }else if(before.kind==='table'&&before.table&&after.table){
  add('Table caption',before.table.caption,after.table.caption);
  for(let row=0;row<Math.max(before.table.rows.length,after.table.rows.length)&&changes.length<3;row++){
   for(let col=0;col<Math.max(before.table.rows[row]?.length??0,after.table.rows[row]?.length??0)&&changes.length<3;col++){
    add(`Row ${row+1} · ${after.table.headers[col]??'column '+(col+1)}`,before.table.rows[row]?.[col],after.table.rows[row]?.[col]);
   }
  }
 }
 // Canonical text for rich interactive material is often an unchanged display
 // label. Do not show it as a false representation of an edited dialogue.
 if(before.kind!=='interactive'&&before.kind!=='table')add('Text',before.text,after.text);
 return changes;
}
/** Only actual reader presentation changes count as arrangement, not optional empty
 * authoring metadata, Work summaries, source packages or protection bookkeeping. */
function presentationSignature(record:WorkspaceRecord){
 const composition=adaptedComposition(record);
 return JSON.stringify({
  sections:composition.sections.map(section=>({id:section.id,title:section.title,pattern:section.pattern,hidden:!!section.hidden,collapsed:!!section.collapsed,slots:section.slots.map(slot=>({id:slot.id,role:slot.role,blockIds:slot.blockIds}))})),
  blocks:composition.blocks.map(block=>({id:block.id,sectionId:block.sectionId,hidden:!!block.hidden,pinned:!!block.pinned,width:block.width??'auto'})),
  favourites:composition.favourites??[]
 });
}
export async function readProjectChanges(env:Cloudflare.Env,owner:string,projectId:string,beforeRevision?:number,limit=8){
 const current=await readRecord(env,owner,'journey',projectId);
 if(!current)throw new DomainError(404,'project_unavailable','Project unavailable.');
 if(!Number.isSafeInteger(limit)||limit<1||limit>20)throw new DomainError(400,'invalid_limit','Read 1–20 saved changes at a time.');
 if(beforeRevision!==undefined&&(!Number.isSafeInteger(beforeRevision)||beforeRevision<1||beforeRevision>current.rev))throw new DomainError(400,'invalid_revision','Choose a retained Project revision at or before the current head.');
 const rows=await env.DB!.prepare("SELECT revision,data FROM v2_revisions WHERE owner=? AND family='journey' AND id=? AND revision<=? ORDER BY revision DESC LIMIT ?").bind(owner,projectId,beforeRevision??current.rev,limit+1).all<{revision:number;data:string}>();
 const records=await Promise.all(rows.results.map(async row=>({revision:row.revision,record:(await authoringDomain.projectRecord(env,owner,JSON.parse(row.data) as WorkspaceRecord,false,true))!})));
 const index=(record:WorkspaceRecord|undefined)=>{const map=new Map<string,{sectionId:string;partId:string;kind:string;sectionTitle:string;text:string;data:string;part:PassagePart}>();for(const s of record?.sections??[])for(const p of s.parts)map.set(JSON.stringify([s.id,p.id]),{sectionId:s.id,partId:p.id,kind:p.kind,sectionTitle:s.title,text:p.text,data:JSON.stringify(p),part:p});return map;};
 // This is an identity match against the *current* authored Work references,
 // never a semantic relationship or a claim that a summary is still correct.
 // Historical pins and unresolved references deliberately do not participate.
 const linkedThreads=new Map<string,string[]>();
 for(const thread of current.projectComposition?.workThreads??[])for(const item of thread.items){
  if(item.revision!==undefined||item.unresolvedRef||item.role==='earlier')continue;
  const part=JSON.stringify([item.sectionId,item.partId]);
  if(!linkedThreads.has(part))linkedThreads.set(part,[]);
  linkedThreads.get(part)!.push(thread.id);
 }
 const captureLinks=await Promise.all(records.map(row=>capturedWorkLinks(row.record,linkedThreads)));
 const sourceIndexes=records.map(row=>sourceBindings(row.record));
 const revisions=records.slice(0,limit).map((entry,at)=>{
  const older=records[at+1]?.record,before=index(older),after=index(entry.record),changes:Array<{change:'added'|'revised'|'removed';sectionId:string;partId:string;kind:string;sectionTitle:string}>=[];
  for(const [key,part] of after)if(!before.has(key)||before.get(key)!.data!==part.data)changes.push({change:before.has(key)?'revised':'added',sectionId:part.sectionId,partId:part.partId,kind:part.kind,sectionTitle:part.sectionTitle});
  for(const [key,part] of before)if(!after.has(key))changes.push({change:'removed',sectionId:part.sectionId,partId:part.partId,kind:part.kind,sectionTitle:part.sectionTitle});
  const nowFiles=sourceIndexes[at],oldFiles=sourceIndexes[at+1]??{byPart:new Map<string,SourceBinding[]>(),all:[] as SourceBinding[]};
  const oldKeys=new Set(oldFiles.all.map(bindingIdentity)),nowKeys=new Set(nowFiles.all.map(bindingIdentity));
  const sourceMappingChanges=[...nowFiles.all.filter(file=>!oldKeys.has(bindingIdentity(file))).map(file=>({change:'linked' as const,...file})),...oldFiles.all.filter(file=>!nowKeys.has(bindingIdentity(file))).map(file=>({change:'unlinked' as const,...file}))].map(file=>({...file,linkedThreadIds:linkedThreads.get(partIdentity(file.sectionId,file.partId))??[],linkBasis:'authored-part' as const}));
  const sectionChanges=[...new Set(changes.map(change=>change.sectionId))].map(sectionId=>{
   const matching=changes.filter(change=>change.sectionId===sectionId);
   return {sectionId,sectionTitle:matching.find(change=>change.change!=='removed')?.sectionTitle??matching[0].sectionTitle,added:matching.filter(change=>change.change==='added').length,revised:matching.filter(change=>change.change==='revised').length,removed:matching.filter(change=>change.change==='removed').length};
  });
  return {revision:entry.revision,rendition:entry.record.rendition,at:entry.record.updatedAt,actor:entry.record.actor,synthetic:!!entry.record.synthetic,fictionalEvent:entry.record.fictionalEvent??null,titleChanged:!!older&&entry.record.title!==older.title,descriptionChanged:!!older&&entry.record.projectDescription!==older.projectDescription,arrangementChanged:!!older&&presentationSignature(entry.record)!==presentationSignature(older),sectionChanges,changes:changes.slice(0,80).map(change=>{
   const key=partIdentity(change.sectionId,change.partId),direct=linkedThreads.get(key)??[],capture=(change.change==='removed'?captureLinks[at+1]:captureLinks[at])?.get(key);
   const exactPart=(change.change==='removed'?before:after).get(key);
   const excerpt=capture&&change.kind==='callout'?exactPart?.text.split('\nBrowser-reported · ')[0].trim():undefined;
   const textPreview=exactPart&&['paragraph','callout','reference'].includes(change.kind)&&exactPart.text.trim()?exactPart.text.trim().replace(/\s+/g,' ').slice(0,180):undefined;
   const materialLabel=exactPart&&exactMaterialLabel(exactPart.part);
   const oldPart=before.get(key)?.part,newPart=after.get(key)?.part;
   const fieldChanges=change.change==='revised'?exactFieldChanges(oldPart,newPart):[];
   return {...change,...(textPreview?{textPreview}:{}),...(materialLabel?{materialLabel}:{}),...(fieldChanges.length?{fieldChanges}:{}),sourceFilesBefore:oldFiles.byPart.get(key)??[],sourceFilesAfter:nowFiles.byPart.get(key)??[],linkedThreadIds:[...new Set([...direct,...(capture?.threadIds??[])])],...(capture?{captureSource:captureSourceDetail(capture),linkBasis:direct.length?'authored-part-and-saved-capture':'saved-capture-source',...(excerpt?{captureExcerpt:excerpt.length>280?excerpt.slice(0,277)+'…':excerpt}:{})}:direct.length?{linkBasis:'authored-part'}:{linkBasis:'unlinked'})};
  }),changesTruncated:changes.length>80,sourceMappingChanges:sourceMappingChanges.slice(0,80),sourceMappingChangesTruncated:sourceMappingChanges.length>80,exactRead:{tool:'get_project_composition',projectId,revision:entry.revision}};
 });
 return {projectId,currentProjectRev:current.rev,revisions,nextBeforeRevision:records.length>limit?records[limit].revision:null,threadMatchBasis:'Exact current authored part identities, plus structurally paired saved browser-report observations carrying an explicit matching source identity next to a linked interactive part. Python source file paths are exact author-declared mappings, not inferred relationships between files. Captures are supplied reports, not independently observed execution. General unlinked parts, historical pins and unresolved references are not automatically attributed to Work; authored summaries are not rewritten.',provenance:'Differences between exact saved Project records. File mapping changes are structural, not proof of code execution. Fictional event dates are not actual sessions; code and output are not independently executed by this read.'};
}
function captureSourceDetail(capture:CapturedWorkLink){return {...capture.source,definitionMatchesSavedEdition:capture.definitionMatchesSavedEdition,classification:'browser-reported' as const};}
async function projectCommand(env:Cloudflare.Env,owner:string,input:unknown){
 let request:z.infer<typeof updateSchema>;try{request=updateSchema.parse(input);}catch(e){throw new DomainError(400,'invalid_project_update',(e as Error).message);}
 if(new TextEncoder().encode(JSON.stringify(request)).byteLength>220000)throw new DomainError(413,'project_update_too_large','Use a bounded update under 220 KB.');
 const ctx=generationContext(env);if(ctx)requireGeneration(ctx,request.expectedGeneration);
 const existing=await authoringDomain.rawReadRecord(env,owner,'journey',request.projectId);if(request.expectedProjectRev===0?!!existing:!existing||existing.rev!==request.expectedProjectRev)throw new DomainError(409,'revision_conflict','Read the current Project before updating it.');
 let composition=structuredClone(request.composition??(existing?adaptedComposition(existing):{version:1 as const,sections:[],blocks:[]}));
 if(request.restoreRevision){if(!existing||request.composition||request.changes||request.contentSections||request.noteChanges||request.body!==undefined)throw new DomainError(400,'restore_scope','Restore arrangement separately from content edits.');const old=await getProjectComposition(env,owner,request.projectId,request.restoreRevision);composition=old.composition;/* Current canonical sources remain untouched. */}
 if(request.globalStructure){
  if(!existing||!request.composition)throw new DomainError(400,'existing_project_required','Global structure editing requires an existing Project and complete composition.');
  for(const proposed of request.contentSections??[]){const source=existing.sections?.find(s=>s.id===proposed.id);if(source)for(const part of source.parts){const retained=proposed.parts.find(p=>p.id===part.id);if(!retained||retained.kind!==part.kind)throw new DomainError(400,'passage_identity_changed','Retain every existing part ID and kind in each revised content section.');}}
  const old=adaptedComposition(existing);
  for(const block of old.blocks){const next=composition.blocks.find(b=>b.id===block.id);if(!next||next.sectionId!==block.sectionId||authoringDomain.stable(next.ref??null)!==authoringDomain.stable(block.ref??null)||next.layoutLock!==block.layoutLock)throw new DomainError(400,'structure_identity_changed','Retain every existing block ID, canonical source/reference and layout lock.');}
  for(const key of ['favourites','protectedIds','workThreads','codePackages'] as const){
   if(composition[key]!==undefined&&authoringDomain.stable(composition[key])!==authoringDomain.stable(old[key]??[]))throw new DomainError(400,'structure_metadata_changed','Retain favourites, protections, work threads and code packages in a structural edit.');
   if(old[key]!==undefined)(composition as any)[key]=old[key];
  }
 }
 let contents=[...(existing?.sections??[])];
 for(const s of request.contentSections??[]){const i=contents.findIndex(v=>v.id===s.id);if(i<0)contents.push(s as ArticleSection);else contents[i]=s as ArticleSection;}
 for(const change of request.changes??[]){
  if(change.op==='upsertWorkThread'){const threads=composition.workThreads??[];const at=threads.findIndex(t=>t.id===change.thread.id);if(at<0)threads.push(change.thread);else threads[at]=change.thread;composition.workThreads=threads;continue;}
  if(change.op==='removeWorkThread'){composition.workThreads=(composition.workThreads??[]).filter(t=>t.id!==change.id);continue;}
  if(change.op==='setSection'){const at=composition.sections.findIndex(s=>s.id===change.id);if(at<0)throw new DomainError(400,'section_unavailable','Unknown section.');const target=composition.sections[at];for(const key of ['title','hidden','collapsed'] as const)if(change[key]!==undefined)(target as any)[key]=change[key];if(change.index!==undefined){composition.sections.splice(at,1);composition.sections.splice(change.index,0,target);}continue;}
  if(change.op==='setFavourite'){if(!composition.blocks.some(b=>b.id===change.id)&&!composition.sections.some(s=>s.id===change.id))throw new DomainError(400,'shortcut_unavailable','Unknown shortcut destination.');composition.favourites=(composition.favourites??[]).filter(v=>v!==change.id);if(change.favourite)composition.favourites.push(change.id);continue;}
  if(change.op==='upsertSection'){const at=composition.sections.findIndex(s=>s.id===change.section.id);if(at<0)composition.sections.push(change.section);else composition.sections[at]=change.section;continue;}
  if(change.op==='upsertBlock'){
   if(change.content){const at=contents.findIndex(s=>s.id===change.content!.id);if(at<0)contents.push(change.content as ArticleSection);else contents[at]=change.content as ArticleSection;}
   const old=composition.blocks.findIndex(b=>b.id===change.block.id);if(old<0)composition.blocks.push(change.block);else composition.blocks[old]=change.block;
  }
  const blockId=change.op==='upsertBlock'?change.block.id:change.id,b=composition.blocks.find(b=>b.id===blockId);if(!b)throw new DomainError(400,'block_unavailable','Unknown Project block.');
  if(change.op==='setBlockPresentation'){if(change.pinned!==undefined)b.pinned=change.pinned;if(change.width!==undefined)b.width=change.width;}
  else if(change.op==='setBlockVisibility')b.hidden=change.hidden;
  else if(change.op==='setLayoutLock')b.layoutLock=change.lock;
  else {const slot=composition.sections.find(s=>s.id===change.sectionId)?.slots.find(s=>s.id===change.slotId);if(!slot)throw new DomainError(400,'slot_unavailable','Unknown section/slot destination.');const keep=change.op==='upsertBlock'&&slot.blockIds.includes(blockId);if(!keep){for(const s of composition.sections)for(const slot of s.slots)slot.blockIds=slot.blockIds.filter(v=>v!==blockId);slot.blockIds.splice(change.op==='moveBlock'?change.index:slot.blockIds.length,0,blockId);}}
 }
 if(request.repairMarkdownEmphasis)contents=repairProjectEmphasis(contents);
 const data:Record<string,unknown>={projectComposition:composition,...(existing?.testRunId?{testRunId:existing.testRunId}:{}),...(!existing?{body:request.body??'',title:request.title??request.projectId}:{})};
 for(const [key,value] of Object.entries({title:request.title,body:request.body,synthetic:request.synthetic,testRunId:request.testRunId,testRun:request.testRun,fictionalEvent:request.fictionalEvent,projectDescription:request.description,learningScope:request.learningScope,projectCover:request.projectCover}))if(value!==undefined)data[key]=value;
 if(request.repairMarkdownEmphasis||request.contentSections||request.changes?.some(c=>c.op==='upsertBlock'&&c.content))data.sections=contents;
 return {request,command:{operationId:request.operationId,expectedGeneration:request.expectedGeneration,action:existing?'update' as const:'create' as const,family:'journey' as const,id:request.projectId,expectedRev:request.expectedProjectRev,data},existing};
}
export async function applyProjectUpdate(env:Cloudflare.Env,owner:string,input:unknown,actor:Actor='gpt',preview=false){
 // Hash the semantic request before adaptation: identical retries must survive changed heads.
 const digest=await authoringDomain.hash({kind:'project-update-v1',input});const op=(input as any)?.operationId;
 const previous=typeof op==='string'?await env.DB!.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,op).first<{hash:string;response:string}>():null;
 // executeCommand hashes the exact semantic request through its internal options.
 if(previous&&!preview){if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This operation ID belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(previous.response));}
 const {request,command}=await projectCommand(env,owner,input);
 if(!preview)await (await import('./collaboration-preferences')).assertGptProjectEditing(env,owner,request.projectId,actor);
 const options={projectAuthoring:true as const,overrideIds:request.explicitOverrideIds,digest};
 if(request.noteChanges?.length)return applyProjectBatch(env,owner,command as any,request,actor,digest,preview);
 if(preview){const p=await authoringDomain.prepared(env,owner,command as any,actor,undefined,options);return {valid:true,currentRev:request.expectedProjectRev,proposed:await authoringDomain.projectRecord(env,owner,p.record,true),summary:'Read-only proposal. Sources are retained; directly edited content remains protected unless explicitly targeted.'};}
 return executeCommand(env,owner,command as any,actor,undefined,options);
}
export async function setNotePagePin(env:Cloudflare.Env,owner:string,input:any,actor:Actor){
 const schema=z.object({operationId:id,expectedGeneration:z.string(),noteId:id,expectedNoteRev:z.number().int().min(1),target:projectRefSchema,pinned:z.boolean()}).strict();let r:z.infer<typeof schema>;try{r=schema.parse(input);}catch(e){throw new DomainError(400,'invalid_note_pin',(e as Error).message);}
 const digest=await authoringDomain.hash({kind:'note-pin-v1',request:r}),previous=await env.DB!.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,r.operationId).first<{hash:string;response:string}>();if(previous){if(previous.hash!==digest)throw new DomainError(409,'idempotency_mismatch','This pin operation belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(previous.response));}
 const note=await readRecord(env,owner,'note',r.noteId);if(!note||note.rev!==r.expectedNoteRev)throw new DomainError(409,'revision_conflict','Save and refresh this Note before pinning.');
 const key=authoringDomain.stable(r.target),pins=(note.pagePins??[]).filter(p=>authoringDomain.stable(p)!==key);if(r.pinned)pins.push(r.target);
 return executeCommand(env,owner,{operationId:r.operationId,expectedGeneration:r.expectedGeneration,action:'update',family:'note',id:r.noteId,expectedRev:r.expectedNoteRev,data:{pagePins:pins}},actor,undefined,{projectAuthoring:true,digest});
}
export async function listPagePins(env:Cloudflare.Env,owner:string,target:unknown){
 const t=projectRefSchema.parse(target);const rows=await env.DB!.prepare("SELECT data FROM v2_records WHERE owner=? AND family='note' AND trashed_at IS NULL AND EXISTS(SELECT 1 FROM json_each(data,'$.pagePins') p WHERE json_extract(p.value,'$.family')=? AND json_extract(p.value,'$.id')=?) ORDER BY id LIMIT 33").bind(owner,t.family,t.id).all<{data:string}>();
 const notes=[];for(const row of rows.results.slice(0,32)){const raw=JSON.parse(row.data) as WorkspaceRecord;if(raw.pagePins?.some(p=>authoringDomain.stable(p)===authoringDomain.stable(t))){const note=await readRecord(env,owner,'note',raw.id);if(note)notes.push(note);}}
 return {notes,truncated:rows.results.length>32,limit:32};
}

/** One nonce-owned D1 batch for a Project and explicitly requested canonical Notes. */
async function applyProjectBatch(env:Cloudflare.Env,owner:string,command:any,request:z.infer<typeof updateSchema>,actor:Actor,digest:string,preview:boolean){
 const notes=request.noteChanges??[];if(new Set(notes.map(n=>n.id)).size!==notes.length)throw new DomainError(400,'duplicate_note','Each changed Note must appear once.');
 const proposals=[],internal=new Map<string,WorkspaceRecord>();if(command.action==='create'&&command.data.testRun)internal.set('journey:'+command.id,{...command.data,id:command.id,family:'journey',rev:1,trashedAt:null} as WorkspaceRecord);
 for(const note of notes){const c={operationId:request.operationId,action:note.expectedRev?'update' as const:'create' as const,family:'note' as const,id:note.id,expectedRev:note.expectedRev,data:{title:note.title,body:note.body,...(!note.expectedRev&&(request.testRunId??command.data.testRunId)?{synthetic:true,testRunId:request.testRunId??command.data.testRunId}:{}),...(note.sections?{sections:note.sections as ArticleSection[]}:{})}};const p=await authoringDomain.prepared(env,owner,c,actor,internal);if(note.expectedRev?p.existing?.rev!==note.expectedRev:await authoringDomain.rawReadRecord(env,owner,'note',note.id,true))throw new DomainError(409,'revision_conflict','A changed Note is unavailable or its revision changed.');proposals.push({command:c,...p});internal.set('note:'+note.id,p.record);}
 const p=await authoringDomain.prepared(env,owner,command,actor,internal,{projectAuthoring:true,overrideIds:request.explicitOverrideIds});proposals.push({command,...p});
 if(preview)return {valid:true,records:await Promise.all(proposals.map(p=>authoringDomain.projectRecord(env,owner,p.record,true))),summary:'Read-only atomic Project and Note proposal.'};
 const db=env.DB!,nonce=crypto.randomUUID(),win='EXISTS(SELECT 1 FROM v2_operations WHERE owner=? AND id=? AND nonce=?)',winArgs=[owner,request.operationId,nonce];
 const checks=proposals.map(p=>({family:p.record.family,id:p.record.id,expectedRev:p.existing?.rev??0})),guards=proposals.flatMap(p=>p.guardedTargets),generation=generationGuard(env),image=imageAdmissionGuard(proposals.flatMap(p=>p.imageGuards),owner),media=mediaAdmissionGuard(proposals.flatMap(p=>p.mediaGuards),owner);
 const condition=`NOT EXISTS(SELECT 1 FROM json_each(?) m WHERE (json_extract(m.value,'$.expectedRev')=0 AND EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id'))) OR (json_extract(m.value,'$.expectedRev')>0 AND NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(m.value,'$.family') AND r.id=json_extract(m.value,'$.id') AND r.rev=json_extract(m.value,'$.expectedRev') AND r.trashed_at IS NULL))) AND NOT EXISTS(SELECT 1 FROM json_each(?) g WHERE NOT EXISTS(SELECT 1 FROM v2_records r WHERE r.owner=? AND r.family=json_extract(g.value,'$.family') AND r.id=json_extract(g.value,'$.id') AND r.rev=json_extract(g.value,'$.rev') AND r.trashed_at IS NULL)) AND 1=1${generation.sql}${image.sql}${media.sql}`;
 const recordRefs=proposals.map(p=>({family:p.record.family,id:p.record.id,rev:p.record.rev})),receipt={operationId:request.operationId,status:'committed',recordRef:recordRefs.at(-1),recordRefs,replayed:false},rows=JSON.stringify(proposals.map(p=>({family:p.record.family,id:p.record.id,rev:p.record.rev,data:JSON.stringify(p.record),rendition:p.record.rendition??null,at:p.record.updatedAt,synthetic:p.record.synthetic?1:0,action:p.command.action})));
 const statements=[db.prepare(`INSERT OR IGNORE INTO v2_operations(owner,id,hash,nonce,status,response) VALUES(?,?,?,?,200,json(CASE WHEN ${condition} THEN ? ELSE 'project batch conflict' END))`).bind(owner,request.operationId,digest,nonce,JSON.stringify(checks),owner,owner,JSON.stringify(guards),owner,...generation.args,...image.args,...media.args,JSON.stringify(receipt)),
 db.prepare(`INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.data'),json_extract(value,'$.rev'),NULL,? FROM json_each(?) WHERE ${win} ON CONFLICT(owner,family,id) DO UPDATE SET data=excluded.data,rev=excluded.rev,last_operation=excluded.last_operation`).bind(owner,request.operationId,rows,...winArgs),
 db.prepare(`INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) SELECT ?,json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.rev'),json_extract(value,'$.data'),json_extract(value,'$.rendition') FROM json_each(?) WHERE ${win}`).bind(owner,rows,...winArgs),
 db.prepare(`INSERT INTO v2_activity(owner,id,family,record_id,verb,actor,synthetic,at) SELECT ?,?||':'||json_extract(value,'$.family')||':'||json_extract(value,'$.id'),json_extract(value,'$.family'),json_extract(value,'$.id'),json_extract(value,'$.action'),?,json_extract(value,'$.synthetic'),json_extract(value,'$.at') FROM json_each(?) WHERE ${win}`).bind(owner,request.operationId,actor,rows,...winArgs)];
 for(const p of proposals){statements.push(...imageAttachmentStatements(env,owner,p.images,p.record,request.operationId),...mediaAttachmentStatements(env,owner,p.media,p.record,request.operationId));}
 try{await db.batch(statements);}catch{const saved=await db.prepare('SELECT hash,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,request.operationId).first<{hash:string;response:string}>();if(saved){if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation belongs to another payload.');return authoringDomain.receiptMetadata(JSON.parse(saved.response));}await assertGenerationCurrent(env);throw new DomainError(409,'project_transaction_conflict','The Project or a Note changed; the complete update was rolled back.');}
 const saved=await db.prepare('SELECT hash,nonce,response FROM v2_operations WHERE owner=? AND id=?').bind(owner,request.operationId).first<{hash:string;nonce:string;response:string}>();if(!saved)throw new DomainError(503,'uncertain_result','Retain this operation and inspect its receipt.');if(saved.hash!==digest)throw new DomainError(409,'idempotency_mismatch','Operation belongs to another payload.');return saved.nonce===nonce?{...receipt,record:await authoringDomain.projectRecord(env,owner,p.record)}:authoringDomain.receiptMetadata(JSON.parse(saved.response));
}

/** Whole-Project editing through the existing revisioned writer; no Note or relation writes. */
export const structureEditSchema=updateSchema.pick({operationId:true,expectedGeneration:true,projectId:true,expectedProjectRev:true,composition:true,repairMarkdownEmphasis:true,explicitOverrideIds:true,contentSections:true,title:true,description:true,body:true}).extend({expectedProjectRev:z.number().int().min(1),composition:compositionSchema,mode:z.enum(['preview','apply'])}).strict();
export async function editProjectStructure(env:Cloudflare.Env,owner:string,input:unknown){
 let parsed:z.infer<typeof structureEditSchema>;try{parsed=structureEditSchema.parse(input);}catch(e){throw new DomainError(400,'invalid_structure_edit',(e as Error).message);}
 const {mode,...request}=parsed;
 if(mode==='apply')await (await import('./collaboration-preferences')).assertMcpToolAccess(env,owner,'apply_project_update');
 const result=await applyProjectUpdate(env,owner,{...request,globalStructure:true},'gpt',mode==='preview');
 if(mode==='preview'&&'proposed' in result&&result.proposed){
  const proposed=result.proposed as WorkspaceRecord,composition=adaptedComposition(proposed),topics=projectReadingTopics(composition,proposed.sections);
  const outline=composition.sections.filter(s=>!s.hidden).map(section=>({id:section.id,title:section.title,topics:topics.filter(t=>t.layoutId===section.id).map(t=>({title:t.title,purpose:t.purpose??'unspecified',sectionId:t.sectionId,partIds:t.partIds}))}));
  return {...result,organisationReview:{outline,warnings:outline.flatMap(section=>{
   const roles=new Set(section.topics.map(t=>t.purpose));return roles.has('source')&&(roles.has('practice')||roles.has('explanation'))?[{sectionId:section.id,message:'This section mixes source messages with explanation or practice. Check this against the requested task-based outline.'}]:[];
  }),basis:'Actual shared reading-topic projection. Inspect destinations and purpose grouping, not just page names. No learner performance is inferred.'}};
 }
 return result;
}
