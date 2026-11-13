'use client';
import {useEffect,useMemo,useState,type KeyboardEvent,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,ChevronLeft,ChevronRight,Pencil,X} from 'lucide-react';
import type {PassagePart,WorkspaceRecord} from '../lib/contracts';
import type {ProjectComposition} from '../lib/project-composition';
import {projectReadingTopics} from '../lib/project-reading-topics';
import {projectLearningMap} from '../lib/project-learning-map';
import ProjectContextOverview from './project-context-overview';
import {isProjectObservationEvidencePart} from '../lib/project-observation-display';
import {buildLinkedReadingLink} from '../lib/reading-links';
import Reader,{type ReaderProps} from './reader';
import ProjectContributions from './project-contributions';
import './project-reading.css';

export default function ProjectReading({reader,record,composition,onEdit,reference,referenceTitles,onVisibleTopic}:{reader:ReaderProps;record:WorkspaceRecord;composition:ProjectComposition;onEdit:(blockId:string)=>void;reference:(block:ProjectComposition['blocks'][number])=>ReactNode;referenceTitles?:Readonly<Record<string,string>>;onVisibleTopic?:(location:{rendition:string;sectionId?:string;partId?:string})=>void}){
 const topics=useMemo(()=>projectReadingTopics(composition,record.sections,referenceTitles),[composition,record.sections,referenceTitles]);
 const learning=useMemo(()=>projectLearningMap(composition,record.sections,referenceTitles),[composition,record.sections,referenceTitles]);
 const [exploring,setExploring]=useState(false);
 const layouts=composition.sections.filter(s=>!s.hidden&&topics.some(t=>t.layoutId===s.id));
 const anchor=reader.anchorTarget;
 const initial=topics.find(t=>t.sectionId===anchor?.sectionId&&(!anchor?.partId||t.partIds.includes(anchor.partId)));
 const [chosenLayout,setChosenLayout]=useState(initial?.layoutId??''),[chosenTopic,setChosenTopic]=useState(initial?.id??'');
 const layout=layouts.find(s=>s.id===chosenLayout)??layouts[0];
 const layoutTopics=topics.filter(t=>t.layoutId===layout?.id);
 const topic=layoutTopics.find(t=>t.id===chosenTopic)??layoutTopics[0];
 const currentIndex=layouts.findIndex(s=>s.id===layout?.id);
 const lastLocationKey='minamo-last-project-location:'+reader.draftScope+':'+record.id+':'+record.rendition;
 const [lastOpened,setLastOpened]=useState<(typeof topics)[number]|null>(null);
 useEffect(()=>{setLastOpened(null);if(initial)return;try{const id=localStorage.getItem(lastLocationKey),saved=topics.find(item=>item.id===id);if(saved&&saved.id!==topic?.id)setLastOpened(saved);}catch{}},[lastLocationKey]);
 useEffect(()=>{if(topic)try{localStorage.setItem(lastLocationKey,topic.id);}catch{}},[lastLocationKey,topic?.id]);
 useEffect(()=>{setChosenLayout(initial?.layoutId??'');setChosenTopic(initial?.id??'');},[record.id]);
 useEffect(()=>{if(initial){setChosenLayout(initial.layoutId);setChosenTopic(initial.id);}},[anchor?.sectionId,anchor?.partId]);
 // Report the *visible* native topic, rather than the original URL entry or
 // an inferred learning position. Reference-only topics have no canonical
 // Project content part, so they intentionally return to the Project itself.
 useEffect(()=>{if(topic&&record.rendition)onVisibleTopic?.({rendition:record.rendition,...(topic.kind==='content'?{sectionId:topic.sectionId,partId:topic.partIds[0]}:{})});},[topic?.id,topic?.kind,topic?.sectionId,topic?.partIds[0],record.rendition,onVisibleTopic]);
 function selectLayout(id:string){setLastOpened(null);setChosenLayout(id);setChosenTopic('');}
 function keys(event:KeyboardEvent<HTMLButtonElement>,ids:string[],current:string,select:(id:string)=>void){
  const delta=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:0;
  if(!delta&&event.key!=='Home'&&event.key!=='End')return;
  event.preventDefault();const at=ids.indexOf(current),next=event.key==='Home'?0:event.key==='End'?ids.length-1:(at+delta+ids.length)%ids.length;
  select(ids[next]);const buttons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]');buttons?.[next]?.focus({preventScroll:true});
 }
 function contribution(part:PassagePart,sectionId:string){
  if(part.unavailable||!topic||topic.kind!=='content'||isProjectObservationEvidencePart(part))return null;
  const language=part.language??(part.semantic?.kind==='ruby'?part.semantic.language.language:part.interactive?.type==='language-dialogue'||part.interactive?.type==='language-reveal'||part.interactive?.type==='language-pattern'?part.interactive.language:undefined);
  const japanese=/^ja(?:-|$)/i.test(language??'');
  const kind=part.kind==='table'&&part.table&&part.table.headers.length<=8?'table':part.kind==='code'?'code':part.interactive?.type==='language-dialogue'?'dialogue':part.kind==='interactive'&&['python-canvas','parameter-explorer','pygbag'].includes(part.interactive?.type??'')?'observation':(part.kind==='paragraph'||part.kind==='callout')&&part.semantic?.kind==='ruby'&&/^(ja|zh)(-|$)/i.test(language??'')?'example':null;
  if(!kind)return null;
  const columns=kind==='table'?part.table!.headers:kind==='code'?['Code variation','Observation']:kind==='dialogue'?[japanese?'Japanese response':'Your response','Translation / notes']:kind==='observation'?['Observation','Context / interpretation']:[japanese?'Japanese example':'Your example','Translation / notes'];
  return <ProjectContributions key={record.id+':'+sectionId+':'+part.id} target={{projectId:record.id,sectionId,partId:part.id}} kind={kind} columns={columns} language={language} scope={reader.draftScope} projectRev={record.rev}/>;
 }
 if(!layout||!topic)return <section className="pc-reading-empty"><p>{record.body||'This Project is ready for its first section.'}</p><button type="button" onClick={()=>onEdit('')}>Edit Project content</button></section>;
 const openTopic=(topicId:string)=>{const destination=topics.find(t=>t.id===topicId);if(!destination)return;setChosenLayout(destination.layoutId);setChosenTopic(destination.id);setExploring(false);};
 if(exploring)return <div className="pc-native-reading pc-explore-reading">
  <div className="pc-project-mode"><button type="button" onClick={()=>setExploring(false)}><ArrowLeft size={15} aria-hidden="true"/> Back to reading</button></div>
  <ProjectContextOverview map={learning} onOpen={openTopic}/>
 </div>;
 const block=composition.blocks.find(b=>b.id===topic.blockId);
 const context=topic.contextId?learning.contexts.find(c=>c.id===topic.contextId):undefined;
 return <div className={'pc-native-reading pc-reading-'+layout.pattern}>
  <div className="pc-project-mode"><button type="button" onClick={()=>setExploring(true)} aria-label="Explore subjects and learning material in this Project">Explore project</button></div>
  {lastOpened&&<div className="pc-last-opened"><span>Last opened: {lastOpened.title}</span><button type="button" onClick={()=>{setChosenLayout(lastOpened.layoutId);setChosenTopic(lastOpened.id);setLastOpened(null);}}>Return to section</button><button type="button" aria-label="Dismiss last opened section" onClick={()=>setLastOpened(null)}><X size={15}/></button></div>}
  <nav className="pc-reading-mobile-nav" aria-label="Project section navigation">
   <label className="pc-reading-mobile-label" htmlFor="pc-reading-mobile-section">Project section</label>
   <select id="pc-reading-mobile-section" aria-label="Project section" value={layout.id} onChange={event=>selectLayout(event.target.value)}>{layouts.map((section,i)=><option key={section.id} value={section.id}>{i+1}. {section.title||section.pattern[0].toUpperCase()+section.pattern.slice(1)}</option>)}</select>
   <button type="button" aria-label="Previous Project section" title="Previous section" disabled={currentIndex<=0} onClick={()=>selectLayout(layouts[currentIndex-1].id)}><ChevronLeft size={18}/></button>
   <button type="button" aria-label="Next Project section" title="Next section" disabled={currentIndex>=layouts.length-1} onClick={()=>selectLayout(layouts[currentIndex+1].id)}><ChevronRight size={18}/></button>
   <button type="button" aria-label="Edit this Project section" title="Edit section" onClick={()=>onEdit(topic.blockId)}><Pencil size={16}/></button>
  </nav>
  <nav className="pc-reading-sections" aria-label="Project sections" role="tablist">{layouts.map((section,i)=><button key={section.id} type="button" role="tab" aria-selected={layout.id===section.id} tabIndex={layout.id===section.id?0:-1} onKeyDown={event=>keys(event,layouts.map(s=>s.id),layout.id,selectLayout)} onClick={()=>selectLayout(section.id)}><span>{String(i+1).padStart(2,'0')}</span>{section.title||section.pattern[0].toUpperCase()+section.pattern.slice(1)}</button>)}</nav>
  <div className="pc-reading-body">
   {layoutTopics.length>1?<div className="pc-reading-topic-row"><nav className="pc-reading-topics" aria-label="Topics in this section" role="tablist">{layoutTopics.map(t=><button key={t.id} type="button" role="tab" aria-selected={topic.id===t.id} tabIndex={topic.id===t.id?0:-1} onKeyDown={event=>keys(event,layoutTopics.map(t=>t.id),topic.id,setChosenTopic)} onClick={()=>setChosenTopic(t.id)} title={t.title}>{t.title}</button>)}</nav><button className="pc-reading-topic-edit" type="button" aria-label="Edit this Project section" title="Edit section" onClick={()=>onEdit(topic.blockId)}><Pencil size={17} aria-hidden="true"/></button></div>:<div className="pc-reading-section-actions"><button type="button" aria-label="Edit this Project section" title="Edit section" onClick={()=>onEdit(topic.blockId)}><Pencil size={17} aria-hidden="true"/></button></div>}
   {(topic.provenance||topic.source)&&<div className="pc-reading-section-actions">{topic.provenance&&<small>{({'user-reported':'User-reported material','gpt-authored':'GPT-authored material','hypothetical':'Practice example','source-excerpt':'Source excerpt'} as Record<string,string>)[topic.provenance]}</small>}{topic.source&&topics.some(t=>t.sectionId===topic.source!.sectionId&&t.partIds.includes(topic.source!.partId))&&<button type="button" onClick={()=>{const source=topics.find(t=>t.sectionId===topic.source!.sectionId&&t.partIds.includes(topic.source!.partId));if(source){setChosenLayout(source.layoutId);setChosenTopic(source.id);}}}>Source passage</button>}</div>}
   {topic.references?.length? <nav className="pc-context-related" aria-label="Exact related Project and Library material"><strong>Related material</strong>{topic.references.map((ref,index)=><a key={`${ref.family}:${ref.id}:${ref.rendition}:${ref.sectionId??''}:${ref.partId??''}:${index}`} href={buildLinkedReadingLink(ref)} title={ref.reason}>{ref.relation}: {ref.family} · {ref.id}{ref.sectionId?` · ${ref.sectionId}${ref.partId?` / ${ref.partId}`:''}`:''}</a>)}</nav>:null}
   {context&&context.topicIds.length>1&&<details className="pc-context-related"><summary>Related material in {context.title}</summary><nav aria-label="Related Project material">{context.topicIds.filter(id=>id!==topic.id).map(id=>{const item=topics.find(x=>x.id===id);return item?<button key={id} type="button" onClick={()=>openTopic(id)}>{item.title}</button>:null;})}</nav></details>}
   <div className="pc-reading-material" role="tabpanel" aria-label={topic.title}>
    {topic.kind==='reference'&&block?.ref?reference(block):<Reader {...reader} article={record} compactHeader arrangeSections={nodes=>nodes} visibleSectionIds={[topic.sectionId]} visiblePartIds={topic.partIds} renderAfterPart={contribution}/>}
   </div>
   <nav className="pc-reading-next" aria-label="Move between Project sections"><button type="button" disabled={currentIndex<=0} onClick={()=>selectLayout(layouts[currentIndex-1].id)}><ArrowLeft size={16}/> Previous</button><span>Section {currentIndex+1} of {layouts.length}</span><button type="button" disabled={currentIndex>=layouts.length-1} onClick={()=>selectLayout(layouts[currentIndex+1].id)}>Next <ArrowRight size={16}/></button></nav>
  </div>
 </div>;
}
