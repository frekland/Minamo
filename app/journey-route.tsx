"use client";
import {useEffect,useState,type MouseEvent} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,MessageSquare,Network} from 'lucide-react';
import type {WorkspaceRecord,RecordLink} from '../lib/contracts';
import type {ProjectOutline,ProjectQuestion,ProjectContinuation} from '../lib/project-contracts';
import LearningDevelopments from './learning-developments';
import LearningActivity from './learning-activity';
import Reader,{type ReaderProps,type ReadingTarget} from './reader';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import ProjectCover from './project-cover';
import {ContinuitySourcesView,useContinuityEvidence} from './continuity-sources';
import GptHandoff from './gpt-handoff';
import type {GptContextRecord} from '../lib/gpt-context';
import type {LearningWorkTarget} from '../lib/contracts';
import ProjectDialog from './project-dialog';
import {ProjectResourcesSheet,ProjectMapDialog} from './project-overlays';
import {useProjectContext} from './project-context-client';
import {contextualProjectHref,openProjectDestination} from './project-navigation';
import './learning-experience.css';
import './journey-route.css';
export type RouteStage={id:string;sectionId:string;title:string;intent?:string;outcome?:string;checkpoint?:string;optional?:boolean};
export function journeyStages(record:WorkspaceRecord):RouteStage[]{
 const shape=record.learningShape;
 if(shape?.kind==='journey')return shape.stages;
 return(record.sections??[]).map(section=>({id:section.id,sectionId:section.id,title:section.title}));
}
export function stageLinks(record:WorkspaceRecord,stage:RouteStage){return record.links.filter(link=>{const source=link.sourceContext;return source?(source.stageId===stage.id||source.sectionId===stage.sectionId):false});}
export function linkReadingTarget(link:RecordLink):ReadingTarget{return{recordFamily:link.family,...(link.rendition?{rendition:link.rendition}:{}),...(link.sectionId?{sectionId:link.sectionId}:{}),...(link.partId?{partId:link.partId}:{})};}
/** Only an exact authored declaration suppresses generated framing. Canonical bytes stay untouched. */
export function stageFraming(record:WorkspaceRecord,stage:RouteStage){
 const section=record.sections?.find(item=>item.id===stage.sectionId);
 const covered=(label:string,value?:string)=>!!value&&!!section?.parts.some(part=>(part.kind==='paragraph'||part.kind==='callout')&&part.text===`${label}: ${value}`);
 return{canonicalTitle:section?.title===stage.title,intent:covered('Intent',stage.intent),outcome:covered('Outcome',stage.outcome),checkpoint:covered('Checkpoint',stage.checkpoint)};
}
const viewFor=(family:string)=>family==='journey'?'journeys':family==='investigation'?'investigations':family==='source'?'sources':'library';
export function ContextualLearningLinks({links,records,onNavigate,onPreview,returnContext,label="Linked Articles and Questions"}:{links:RecordLink[];records:WorkspaceRecord[];onNavigate:NonNullable<ReaderProps['onNavigate']>;onPreview?:ReaderProps['onPreview'];returnContext?:{id:string;stageId?:string};label?:string}){
 const selection=useLearningSpace();
 if(!links.length)return null;
 return <aside className="le-context" aria-label={label}>{links.map((link,index)=>{
  const target=records.find(r=>r.family===link.family&&r.id===link.id&&!r.trashedAt),p=new URLSearchParams({view:viewFor(link.family),family:link.family,id:link.id});
  if(link.rendition)p.set('rendition',link.rendition);if(link.sectionId)p.set('section',link.sectionId);if(link.partId)p.set('part',link.partId);
  const path='/?'+p,href=learningSpaceHref(returnContext?contextualProjectHref(path,returnContext.id,returnContext.stageId):path,selection);
  return <div className="le-context-item" key={link.relationId??`${link.family}:${link.id}:${index}`}><a className="le-context-link" href={href} onClick={event=>openProjectDestination(event,href,onNavigate)}>{link.family==='investigation'?<MessageSquare size={17}/>:<BookOpen size={17}/>}<span><small>{link.family==='investigation'?'Question':link.family==='journey'?'Project':'Library'}</small><strong>{target?.title??'Open linked material'}</strong>{link.reason&&<span>{link.reason}</span>}</span><ArrowRight size={16}/></a>{onPreview&&(link.family==='article'||link.family==='area')&&<button type="button" className="v2-text-button le-reference-preview" onClick={()=>onPreview({family:link.family as 'article'|'area',id:link.id,...(link.rendition?{rendition:link.rendition}:{}),...(link.sectionId?{sectionId:link.sectionId}:{}),...(link.partId?{partId:link.partId}:{})})}>Preview</button>}</div>;
 })}</aside>;
}
export function generalJourneyLinks(record:WorkspaceRecord){return record.links.filter(link=>!link.sourceContext&&['article','area','source','investigation','journey'].includes(link.family));}
/** The overview excerpt never replaces the original selectable canonical body. */
export function ProjectIntroductionReading(props:ReaderProps){
 const stages=journeyStages(props.article),openingSections=(props.article.sections??[]).filter(section=>!stages.some(stage=>stage.sectionId===section.id));
 return <Reader {...props} visibleSectionId={undefined} visibleSectionIds={stages.length?openingSections.map(section=>section.id):undefined} compactHeader={false} titleHeadingLevel={2} sectionHeadingLevel={2} learningTarget={undefined}/>;
}
export function journeyStageDestination(record:WorkspaceRecord,stageId?:string){const params=new URLSearchParams({view:'journeys',family:'journey',id:record.id});if(record.rendition)params.set('rendition',record.rendition);if(stageId)params.set('stage',stageId);return '/?'+params;}
export function projectContinueChoice(continuation:ProjectContinuation|undefined,record:WorkspaceRecord,last?:string,coverageComplete=true){
 if(!continuation&&!coverageComplete)return undefined;
 const steps=journeyStages(record),remembered=steps.find(step=>step.id===last);
 if(continuation&&continuation.basis!=='start')return {destination:continuation.destination,label:'Continue',basis:continuation.basis==='checkpoint'?'Latest saved checkpoint':'Recent Note',title:continuation.title};
 if(remembered)return {destination:journeyStageDestination(record,remembered.id),label:'Continue',basis:'Last opened on this device',title:remembered.title};
 if(continuation?.basis==='start')return {destination:continuation.destination,label:continuation.label,basis:'',title:continuation.title};
 if(steps[0])return {destination:journeyStageDestination(record,steps[0].id),label:'Start first step',basis:'',title:steps[0].title};
 return undefined;
}
/** The overview handoff follows exactly the same chosen destination as Continue. */
export function projectContinuationContext(destination:string,record:WorkspaceRecord,title:string){
 if(!destination.startsWith('/?')||destination.startsWith('//'))return undefined;
 const params=new URL(destination,'https://minamo.invalid').searchParams,family=params.get('family'),id=params.get('id');
 if(!id||!['journey','investigation','note'].includes(family??'')||family==='journey'&&id!==record.id)return undefined;
 const stageId=params.get('stage')??undefined;
 const learningTarget:LearningWorkTarget|undefined=family==='investigation'?{kind:'investigation',investigationId:id}:family==='journey'&&id===record.id&&stageId&&record.learningShape?.kind==='journey'&&record.learningShape.stages.some(stage=>stage.id===stageId)?{kind:'journey-stage',journeyId:id,stageId}:undefined;
 return {record:{family:family as GptContextRecord['family'],id,title,...(params.get('rendition')?{rendition:params.get('rendition')!}:{})},learningTarget,returnContext:{journeyId:record.id,...(params.get('returnStage')??stageId?{stageId:params.get('returnStage')??stageId}:{})}};
}
export function ProjectQuestionLinks({questions,projectId,stageId,onNavigate,limit}:{questions:ProjectQuestion[];projectId:string;stageId?:string;onNavigate?:ReaderProps['onNavigate'];limit?:number}){
 const selection=useLearningSpace();
 if(!questions.length)return null;
 return <ul className="project-question-links">{questions.slice(0,limit).map(question=>{const href=learningSpaceHref(contextualProjectHref(question.destination,projectId,stageId),selection);return <li key={question.id}><a href={href} onClick={event=>openProjectDestination(event,href,onNavigate)}><MessageSquare size={14} aria-hidden="true"/><span>{question.title}</span><ArrowRight size={14} aria-hidden="true"/></a></li>;})}</ul>;
}
export default function JourneyRoute(props:ReaderProps&{stageId?:string;onStage:(id?:string)=>void;currentHead?:WorkspaceRecord|null}){
 const selection=useLearningSpace();
 const {article,stageId,onStage,onNavigate}=props,stages=journeyStages(article),stage=stages.find(s=>s.id===stageId),index=stage?stages.indexOf(stage):-1;
 const evidence=useContinuityEvidence({scope:props.draftScope,serverReads:!!props.currentHead&&!stageId,focus:{family:'journey',id:article.id}});
 const showLegacyContinuation=!!evidence.read.error||(!evidence.read.page&&!evidence.read.loading);
 const stageHref=(id?:string)=>learningSpaceHref(journeyStageDestination(article,id),selection),openStage=(event:MouseEvent<HTMLAnchorElement>,id?:string)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onStage(id);};
 const openingSections=(article.sections??[]).filter(section=>!stages.some(item=>item.sectionId===section.id));
 const [lastPosition,setLastPosition]=useState<{key:string;id?:string}>(),[panel,setPanel]=useState<'resources'|'map'|'introduction'|null>(null);
 const storageKey=`minamo-journey-position:${props.draftScope}:${article.id}`,last=lastPosition?.key===storageKey?lastPosition.id:undefined;
 const read=useProjectContext<ProjectOutline>({scope:props.draftScope,projectId:article.id,revision:props.currentHead?.rev??article.rev,mode:'outline'}),outline=read.data?.project.rendition===article.rendition?read.data:undefined;
 useEffect(()=>{try{const id=sessionStorage.getItem(storageKey);setLastPosition({key:storageKey,id:id&&stages.some(s=>s.id===id)?id:undefined})}catch{setLastPosition({key:storageKey});}},[storageKey]);
 useEffect(()=>{if(stage){setLastPosition({key:storageKey,id:stage.id});try{sessionStorage.setItem(storageKey,stage.id)}catch{}}},[stage?.id,storageKey]);
 useEffect(()=>setPanel(null),[article.id,article.rendition,stageId,props.draftScope]);
 const continuationUncertain=!!outline&&!outline.continuation&&outline.continuationCoverage?.complete===false,continuation=projectContinueChoice(outline?.continuation,article,last,!continuationUncertain),stepsAnchor='project-steps-'+encodeURIComponent(article.id),purpose=article.body.trim().split(/\n\s*\n/)[0]??'',excerpt=purpose.length>240?purpose.slice(0,240).trimEnd()+'…':purpose;
 const continuationContext=continuation?projectContinuationContext(continuation.destination,article,continuation.title):undefined;
 const contextualStep=outline?.steps.find(item=>item.stageId===stage?.id),questions=contextualStep?.questions??[];
 const overlay=panel==='resources'&&outline?<ProjectResourcesSheet key={props.draftScope+article.id+stageId} outline={outline} scope={props.draftScope} stageId={stageId} onNavigate={onNavigate} onClose={()=>setPanel(null)}/>:panel==='map'&&outline?<ProjectMapDialog onMore={read.more} loading={read.loading} key={props.draftScope+article.id} outline={outline} scope={props.draftScope} onNavigate={onNavigate} onClose={()=>setPanel(null)}/>:panel==='introduction'?<ProjectDialog title={stages.length?'Project introduction':'Project content'} kind="reading" onClose={()=>setPanel(null)}><ProjectIntroductionReading {...props}/></ProjectDialog>:null;
 const coverage=<>{continuationUncertain&&<p className="project-links-status">Saved work could not be fully checked. Choose a step to open.</p>}{read.loading&&<p className="project-links-status" role="status">Loading linked questions…</p>}{read.error&&<p className="project-links-status" role="alert">{read.error} <button type="button" className="v2-text-button" onClick={read.retry}>Retry</button></p>}{read.data&&!outline&&<p className="project-links-status">This is an earlier project edition. Its original steps are shown; current project links are separate.</p>}{outline&&!outline.relationshipCoverage.complete&&<div className="project-coverage"><p>More links can be checked.</p><button type="button" className="v2-secondary" disabled={read.loading} onClick={read.more}>More questions</button></div>}</>;
 const tools=<div className="project-secondary-actions">{!stage&&showLegacyContinuation&&continuationContext&&<GptHandoff label="Continue with GPT" {...continuationContext}/>}<button type="button" className="v2-secondary" disabled={!outline} onClick={()=>setPanel('resources')}><BookOpen size={16}/>Resources</button><button type="button" className="v2-secondary" disabled={!outline} onClick={()=>setPanel('map')}><Network size={16}/>Project map</button>{(article.body.trim()||openingSections.length>0)&&stages.length>0&&<button type="button" className="v2-text-button" onClick={()=>setPanel('introduction')}>Read introduction</button>}</div>;
 if(stageId&&!stage)return <section className="le-overview"><h1>That step is unavailable</h1><p className="le-hint">No other step has replaced it.</p><button type="button" className="v2-secondary" onClick={()=>onStage()}>Project overview</button></section>;
 if(!stage)return <section className="le-overview project-overview"><ProjectCover record={props.currentHead??article} scope={props.draftScope} onCommand={props.onCommand}/><h1>{article.title}</h1>{excerpt&&<p className="project-purpose">{excerpt}</p>}<ContinuitySourcesView read={evidence.read} selection={evidence.selection} focus={{family:"journey",id:article.id}} title="Recorded work in this Project" emptyText="No linked saved sources found in this bounded scan. You can still open the authored steps or write an independent Note." onOpen={(event,href)=>openProjectDestination(event,href,onNavigate)} onRefresh={evidence.refresh} onMore={()=>void evidence.more()} onMoreTargets={evidence.moreTargets}/>{showLegacyContinuation&&<div className="project-continue"><div>{read.loading&&!outline?<button type="button" className="v2-primary" disabled>Checking saved work…</button>:continuationUncertain&&stages.length>0?<a className="v2-primary" href={'#'+stepsAnchor}>Choose a step<ArrowRight size={16}/></a>:continuation?<a className="v2-primary" href={learningSpaceHref(continuation.destination,selection)} onClick={event=>openProjectDestination(event,learningSpaceHref(continuation.destination,selection),onNavigate)}>{continuation.label}<ArrowRight size={16}/></a>:<button type="button" className="v2-primary" onClick={()=>setPanel('introduction')}>Open Project content <ArrowRight size={16}/></button>}{continuation&&<p><span>{continuation.basis}{continuation.basis?' · ':''}</span>{continuation.title}</p>}</div>{outline?.continuation?.basis==='recent-note'&&outline.continuation.checkpoint&&<small className="project-checkpoint-distinction">{outline.continuation.checkpoint.destination?<a href={learningSpaceHref(outline.continuation.checkpoint.destination,selection)} onClick={event=>openProjectDestination(event,learningSpaceHref(outline.continuation!.checkpoint!.destination!,selection),onNavigate)}>Latest saved checkpoint{outline.continuation.checkpoint.title?' · '+outline.continuation.checkpoint.title:''}</a>:'A saved checkpoint is also retained in My work.'}</small>}</div>}{tools}{stages.length>0&&<><h2 className="le-route-heading" id={stepsAnchor}>Steps</h2><ol className="le-roadmap project-step-list">{stages.map((item,position)=>{const linked=outline?.steps.find(step=>step.stageId===item.id)?.questions??[];return <li key={item.id}><a href={stageHref(item.id)} onClick={event=>openStage(event,item.id)}><span className="le-step-number" aria-hidden="true">{position+1}</span><span className="le-stage-label"><strong>{item.title}</strong>{item.intent&&<span>{item.intent}</span>}{item.optional&&<small>Optional</small>}</span><ArrowRight size={16} aria-hidden="true"/></a><ProjectQuestionLinks questions={linked} projectId={article.id} stageId={item.id} onNavigate={onNavigate} limit={3}/>{linked.length>3&&<a className="project-more-questions" href={stageHref(item.id)} onClick={event=>openStage(event,item.id)}>See all questions for this step ({linked.length}) <ArrowRight size={13}/></a>}</li>;})}</ol></>}{outline?.projectQuestions.length? <section className="project-level-questions"><h2>Project questions</h2><ProjectQuestionLinks questions={outline.projectQuestions} projectId={article.id} onNavigate={onNavigate}/></section>:null}{coverage}{overlay}</section>;
 const framing=stageFraming(article,stage),scopeId=`stage-${encodeURIComponent(article.id)}-${encodeURIComponent(stage.id)}`,structured=article.learningShape?.kind==='journey';
 return <div className="le-journey"><header className="le-stage-nav"><a className="v2-text-button" href={stageHref()} title={article.title} aria-label={`Project overview: ${article.title}`} onClick={event=>openStage(event)}><ArrowLeft size={14}/>Project overview</a><label>Step {index+1} of {stages.length}<select aria-label="Choose a step" value={stage.id} onChange={e=>onStage(e.target.value)}>{stages.map(s=><option key={s.id} value={s.id}>{s.title}{s.optional?' (optional)':''}</option>)}</select></label></header>{!framing.canonicalTitle&&<div className="le-stage-heading"><h1>{stage.title}</h1></div>}<nav className="le-task-locations" aria-label="Step workspace sections"><a href={`#${scopeId}-guide`}>Guide</a><a href={`#${scopeId}-work`}>My work</a></nav><div className="le-task-workspace"><section className="le-task-guide" id={`${scopeId}-guide`} aria-label="Step guide"><Reader {...props} {...(structured?{learningTarget:{kind:'journey-stage' as const,journeyId:article.id,stageId:stage.id}}:{})} visibleSectionId={stage.sectionId} sectionHeadingLevel={framing.canonicalTitle?1:2} compactHeader/>{(stage.intent&&!framing.intent||stage.outcome&&!framing.outcome)&&<aside className="project-step-purpose">{stage.intent&&!framing.intent&&<p>{stage.intent}</p>}{stage.outcome&&!framing.outcome&&stage.outcome!==stage.intent&&<p>{stage.outcome}</p>}</aside>}{stage.checkpoint&&!framing.checkpoint&&<aside className="le-checkpoint"><strong>Check your understanding</strong><p>{stage.checkpoint}</p></aside>}{questions.length>0&&<section className="project-step-questions"><h2>Questions</h2><ProjectQuestionLinks questions={questions} projectId={article.id} stageId={stage.id} onNavigate={onNavigate}/></section>}{coverage}{tools}</section><aside className="le-task-saved" id={`${scopeId}-work`} aria-label="My work">{structured?<><LearningActivity scope={props.draftScope} record={article} target={{kind:'journey-stage',journeyId:article.id,stageId:stage.id}} onOpenNotes={props.onOpenNotes}/><LearningDevelopments scope={props.draftScope} record={article} target={{kind:'journey-stage',journeyId:article.id,stageId:stage.id}}/></>:props.onOpenNotes&&<button className="v2-secondary" type="button" onClick={props.onOpenNotes}>Open Notes</button>}</aside></div><nav className="le-stage-footer" aria-label="Adjacent steps">{index>0?<a className="v2-secondary" href={stageHref(stages[index-1].id)} onClick={event=>openStage(event,stages[index-1].id)}><ArrowLeft size={15}/>Previous step</a>:<span/>}<a className="v2-secondary" href={stageHref(index+1<stages.length?stages[index+1].id:undefined)} onClick={event=>openStage(event,index+1<stages.length?stages[index+1].id:undefined)}>{index+1<stages.length?'Next step':'Project overview'}<ArrowRight size={15}/></a></nav>{overlay}</div>;
}
