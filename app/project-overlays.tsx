"use client";
import {Component,lazy,Suspense,useState,type ReactNode} from 'react';
import {ArrowRight,BookOpen,List,Network} from 'lucide-react';
import type {ProjectOutline,ProjectResource,ProjectResources} from '../lib/project-contracts';
import type {ReaderProps} from './reader';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import ProjectDialog from './project-dialog';
import {useProjectContext} from './project-context-client';
import {contextualProjectHref,openProjectDestination} from './project-navigation';

const ProjectMapCanvas=lazy(()=>import('./project-map-canvas'));
class MapFailureBoundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?this.props.fallback:this.props.children;}}

export function projectResourceOrigins(resource:ProjectResource,outline:ProjectOutline){
 const origins=new Set<string>();
 for(const origin of resource.provenance){
  const step=outline.steps.find(item=>item.stageId===origin.stageId||item.sectionId===origin.sectionId);
  const question=origin.questionId?[...outline.projectQuestions,...outline.steps.flatMap(item=>item.questions)].find(item=>item.id===origin.questionId):undefined;
  if(question)origins.add('From question: '+question.title);else if(origin.questionId)origins.add('Linked through a question');else if(step)origins.add('Step '+(outline.steps.indexOf(step)+1)+' · '+step.title);else origins.add('Project reference');
 }
 return [...origins];
}
function ResourceCards({resources,outline,stageId,onNavigate,onClose}:{resources:ProjectResource[];outline:ProjectOutline;stageId?:string;onNavigate?:ReaderProps['onNavigate'];onClose:()=>void}){
 const selection=useLearningSpace();
 return <ul className="project-resource-cards">{resources.map(resource=>{
  const href=learningSpaceHref(contextualProjectHref(resource.destination,outline.project.id,stageId),selection);
  return <li key={resource.destination}><BookOpen size={18} aria-hidden="true"/><div><h3>{resource.title}</h3><p className="project-resource-origin">{projectResourceOrigins(resource,outline).join(' · ')}</p>{resource.description&&<p className="project-resource-description">{resource.description}</p>}<a href={href} onClick={event=>{openProjectDestination(event,href,onNavigate);if(event.defaultPrevented)onClose();}}>Open in Library <ArrowRight size={15}/></a></div></li>;
 })}</ul>;
}
export function ProjectResourcesSheet({outline,scope,stageId,onNavigate,onClose}:{outline:ProjectOutline;scope:string;stageId?:string;onNavigate?:ReaderProps['onNavigate'];onClose:()=>void}){
 const selection=useLearningSpace(),read=useProjectContext<ProjectResources>({scope,projectId:outline.project.id,revision:outline.project.rev,mode:'resources'}),[filter,setFilter]=useState<'auto'|'all'|'step'>(stageId?'auto':'all');
 const eligible=read.data?.project.rendition===outline.project.rendition?read.data:undefined;
 const stepResources=eligible?.resources.filter(resource=>resource.provenance.some(origin=>origin.stageId===stageId||!!origin.sectionId&&outline.steps.find(step=>step.stageId===stageId)?.sectionId===origin.sectionId))??[],effectiveFilter=filter==='auto'?(stepResources.length?'step':'all'):filter,resources=effectiveFilter==='all'?eligible?.resources??[]:stepResources;
 return <ProjectDialog title="Project resources" onClose={onClose}>
  {stageId&&<div className="project-segmented" role="group" aria-label="Filter resources"><button type="button" aria-pressed={effectiveFilter==='all'} onClick={()=>setFilter('all')}>All</button><button type="button" aria-pressed={effectiveFilter==='step'} onClick={()=>setFilter('step')}>This step</button></div>}
  {read.error?<div role="alert" className="project-panel-notice"><p>{read.error}</p><button className="v2-secondary" onClick={read.retry}>Retry</button></div>:read.data&&!eligible?<p role="status">This project edition has changed. Reopen the current project to view its resources.</p>:null}
  {eligible&&resources.length>0&&<ResourceCards resources={resources} outline={outline} stageId={stageId} onNavigate={onNavigate} onClose={onClose}/>}
  {read.loading&&<p role="status">Loading linked resources…</p>}
  {eligible&&!read.loading&&!resources.length&&<div className="project-panel-empty"><p>{!eligible.relationshipCoverage.complete?'No resources in the links loaded so far.':effectiveFilter==='step'?'No Library resources are linked to this step.':'No Library resources are linked to this project.'}</p><a href={learningSpaceHref('/?view=library',selection)}>Open Library <ArrowRight size={15}/></a></div>}
  {eligible&&!eligible.relationshipCoverage.complete&&<div className="project-coverage"><p>More links can be checked.</p><button type="button" className="v2-secondary" disabled={read.loading} onClick={read.more}>More resources</button></div>}
 </ProjectDialog>;
}

export function ProjectMapOutline({outline,resources=[],onNavigate,onClose}:{outline:ProjectOutline;resources?:ProjectResource[];onNavigate?:ReaderProps['onNavigate'];onClose:()=>void}){
 const selection=useLearningSpace(),open=(event:React.MouseEvent<HTMLAnchorElement>,path:string)=>{openProjectDestination(event,path,onNavigate);if(event.defaultPrevented)onClose();};
 const href=(path:string,stageId?:string)=>learningSpaceHref(contextualProjectHref(path,outline.project.id,stageId),selection);
 return <nav aria-label="Project map outline" className="project-map-outline"><ol>{outline.steps.map((step,index)=><li key={step.stageId}><a href={href(step.destination,step.stageId)} onClick={event=>open(event,href(step.destination,step.stageId))}><span>{index+1}</span>{step.title}</a>{step.questions.length>0&&<ul>{step.questions.map(question=><li key={question.id}><a href={href(question.destination,step.stageId)} onClick={event=>open(event,href(question.destination,step.stageId))}>{question.title}</a></li>)}</ul>}</li>)}</ol>{outline.projectQuestions.length>0&&<section><h3>Project questions</h3><ul>{outline.projectQuestions.map(question=><li key={question.id}><a href={href(question.destination)} onClick={event=>open(event,href(question.destination))}>{question.title}</a></li>)}</ul></section>}{resources.length>0&&<section><h3>Library</h3><ResourceCards resources={resources} outline={outline} onNavigate={onNavigate} onClose={onClose}/></section>}{!outline.steps.length&&!outline.projectQuestions.length&&<p>{outline.relationshipCoverage.complete?'No steps or questions are linked to this project.':'No steps or questions in the links loaded so far.'}</p>}</nav>;
}
export function ProjectMapDialog({outline,scope,onNavigate,onClose,onMore,loading=false}:{outline:ProjectOutline;scope:string;onMore?:()=>void;loading?:boolean;onNavigate?:ReaderProps['onNavigate'];onClose:()=>void}){
 const [view,setView]=useState<'map'|'outline'>(()=>typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce), (max-width:640px)').matches?'outline':'map'),[showLibrary,setShowLibrary]=useState(false);
 const read=useProjectContext<ProjectResources>({scope,projectId:outline.project.id,revision:outline.project.rev,mode:'resources',enabled:showLibrary});
 const resources=showLibrary&&read.data&&read.data.project.rendition===outline.project.rendition?read.data.resources:[];
 return <ProjectDialog title="Project map" onClose={onClose} kind="map"><div className="project-map-toolbar"><div className="project-segmented" role="group" aria-label="Map view"><button type="button" aria-pressed={view==='map'} onClick={()=>setView('map')}><Network size={16}/>Map</button><button type="button" aria-pressed={view==='outline'} onClick={()=>setView('outline')}><List size={16}/>Outline</button></div><label><input type="checkbox" checked={showLibrary} onChange={event=>setShowLibrary(event.target.checked)}/>Show Library</label></div>
  {showLibrary&&read.loading&&<p role="status">Loading linked resources…</p>}{showLibrary&&read.error&&<p role="alert">{read.error} <button type="button" onClick={read.retry}>Retry</button></p>}
  {view==='map'?<><p className="project-map-key">Arrows follow step order. Branches show explicit links.</p><MapFailureBoundary fallback={<div className="project-panel-notice"><p>Map unavailable.</p><button type="button" className="v2-secondary" onClick={()=>setView('outline')}>Open outline</button></div>}><Suspense fallback={<p role="status">Opening map…</p>}><ProjectMapCanvas outline={outline} resources={resources} onNavigate={onNavigate} onClose={onClose}/></Suspense></MapFailureBoundary></>:<ProjectMapOutline outline={outline} resources={resources} onNavigate={onNavigate} onClose={onClose}/>}
  {!outline.relationshipCoverage.complete&&<div className="project-coverage"><p>Some Project links have not been checked.</p><button type="button" className="v2-secondary" disabled={loading||!onMore} onClick={onMore}>Load more Project links</button></div>}
  {showLibrary&&read.data&&!read.data.relationshipCoverage.complete&&<button className="v2-secondary" type="button" disabled={read.loading} onClick={read.more}>More Library links</button>}
 </ProjectDialog>;
}
