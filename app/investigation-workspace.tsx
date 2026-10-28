"use client";
import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import Reader,{type ReaderProps} from './reader';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ProjectCoverage,ProjectIdentity,ProjectQuestion} from '../lib/project-contracts';
import {ContextualLearningLinks} from './journey-route';
import LearningDevelopments from './learning-developments';
import LearningActivity from './learning-activity';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref,learningSpaceParams} from '../lib/learning-space-navigation';
import {generationFetch} from '../lib/workspace-generation';
import {openProjectDestination} from './project-navigation';
import './learning-experience.css';
import './journey-route.css';
/** Only explicitly linked, currently admitted personal writing is projected here. */
export function investigationNotes(record:WorkspaceRecord,records:WorkspaceRecord[]){return records.filter(item=>item.family==='note'&&!item.trashedAt&&item.links.some(link=>link.family==='investigation'&&link.id===record.id));}
/** Suppress only an exact authored question; never edit canonical reading bytes. */
export function investigationQuestionIsInReading(record:WorkspaceRecord,question:string){return record.title===question||record.body.trim()===question||(record.sections??[]).some(section=>section.title===question||section.parts.some(part=>['paragraph','callout'].includes(part.kind)&&[question,'Question: '+question].includes(part.text??'')));}

type QuestionParents={version:1;generation:string;question:ProjectQuestion;parents:{project:ProjectIdentity;step?:{stageId:string;title:string;destination:string}}[];relationshipCoverage:ProjectCoverage};
function QuestionProjects({record,scope,onNavigate}:{record:WorkspaceRecord;scope:string;onNavigate?:ReaderProps['onNavigate']}){
 const selection=useLearningSpace(),key=JSON.stringify([record.id,record.rev,scope,selection]),live=useRef(key);live.current=key;
 const [state,setState]=useState<{key:string;data?:QuestionParents;loading:boolean;error?:string}>({key,loading:true}),[retry,setRetry]=useState(0),controller=useRef<AbortController|null>(null),sequence=useRef(0);
 async function read(cursor?:string){const run=++sequence.current;controller.current?.abort();const abort=new AbortController();controller.current=abort;setState(old=>({...((cursor&&old.key===key)?old:{key}),loading:true}));try{const params=new URLSearchParams({mode:'question',questionId:record.id,...learningSpaceParams(selection),...(cursor?{cursor}:{})});const response=await generationFetch(scope,'/api/project-context?'+params,{signal:abort.signal,cache:'no-store'}),data=await response.json() as QuestionParents&{error?:string};if(!response.ok)throw Error(data.error??'Linked projects could not be checked.');if(!abort.signal.aborted&&live.current===key&&sequence.current===run)setState(old=>({key,loading:false,data:cursor&&old.key===key&&old.data?{...data,parents:[...new Map([...old.data.parents,...data.parents].map(parent=>[parent.project.id+':'+(parent.step?.stageId??''),parent])).values()]}:data}));}catch(error){if(!abort.signal.aborted&&live.current===key&&sequence.current===run)setState({key,loading:false,error:error instanceof Error?error.message:'Linked projects could not be checked.'});}}
 useEffect(()=>{void read();const changed=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string;command?:{family?:string}}>).detail;if(detail?.ownerScope&&detail.ownerScope!==scope)return;if(event.type==='minamo-record-committed'&&detail?.command?.family&&!['journey','investigation'].includes(detail.command.family))return;void read();};window.addEventListener('minamo-source-unavailable',changed);window.addEventListener('minamo-record-committed',changed);return()=>{sequence.current++;controller.current?.abort();window.removeEventListener('minamo-source-unavailable',changed);window.removeEventListener('minamo-record-committed',changed);};},[key,retry]);
 const current=state.key===key?state:{key,loading:true},parents=current.data?.parents??[];
 if(!current.loading&&!current.error&&!parents.length&&current.data?.relationshipCoverage.complete)return null;
 return <section className="project-question-parents" aria-label="Linked projects">{parents.length>0&&<><h2>Linked projects</h2><ul>{parents.map(parent=>{const href=learningSpaceHref(parent.step?.destination??parent.project.destination,selection);return <li key={parent.project.id+':'+(parent.step?.stageId??'')}><a href={href} onClick={event=>openProjectDestination(event,href,onNavigate)}><span><strong>{parent.project.title}</strong>{parent.step&&<small>{parent.step.title}</small>}</span><ArrowRight size={15}/></a></li>;})}</ul></>}{current.loading&&<p className="project-links-status" role="status">Checking linked projects…</p>}{current.error&&<p className="project-links-status" role="alert">{current.error} <button type="button" onClick={()=>setRetry(value=>value+1)}>Retry</button></p>}{current.data&&!current.data.relationshipCoverage.complete&&<button type="button" className="v2-text-button" disabled={current.loading} onClick={()=>void read(current.data?.relationshipCoverage.nextCursor)}>More linked projects</button>}</section>;
}
export default function InvestigationWorkspace(props:ReaderProps){
 const selection=useLearningSpace();
 const {article,onNavigate,onPreview,records}=props,shape=article.learningShape?.kind==='investigation'?article.learningShape:null;
 const target={kind:'investigation' as const,investigationId:article.id},scopeId=`investigation-${encodeURIComponent(article.id)}`,workUrl='/?'+new URLSearchParams({view:'work',context:`investigation:${article.id}`});
 const separateQuestion=!!shape&&!investigationQuestionIsInReading(article,shape.question);
 return <div className="le-investigation"><QuestionProjects record={article} scope={props.draftScope} onNavigate={onNavigate}/>{separateQuestion&&<header className="le-inquiry-heading"><h1 className="le-inquiry-question">{shape!.question}</h1></header>}<nav className="le-task-locations" aria-label="Question workspace sections"><a href={`#${scopeId}-guide`}>Guide</a><a href={`#${scopeId}-work`}>My work</a></nav><div className="le-task-workspace"><section className="le-task-guide" id={`${scopeId}-guide`} aria-label="Question guide"><Reader {...props} learningTarget={target} titleHeadingLevel={separateQuestion?2:1}/>{onNavigate&&<ContextualLearningLinks links={article.links.filter(link=>['article','area'].includes(link.family))} records={records} onNavigate={onNavigate} onPreview={onPreview} returnContext={props.anchorTarget?.returnJourney?{id:props.anchorTarget.returnJourney,stageId:props.anchorTarget.returnStage}:undefined} label="Related Articles"/>}</section><aside className="le-task-saved" id={`${scopeId}-work`} aria-label="My work"><LearningActivity scope={props.draftScope} record={article} target={target} onOpenNotes={props.onOpenNotes}/><LearningDevelopments scope={props.draftScope} record={article} target={target}/><a className="le-evidence-link" href={learningSpaceHref(workUrl,selection)}>Find all linked work</a></aside></div></div>;
}
