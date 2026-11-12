"use client";
import {useEffect,useState} from 'react';
import type {LearningDevelopment,LearningPerspective,LearningWorkTarget,WorkspaceRecord,EvidenceRef,LearningFact} from '../lib/contracts';
import {projectLearningResume,learningEvidenceDestination,type LearningResume,type ResumeFact} from '../lib/learning-perspective-view';
import {generationFetch} from '../lib/workspace-generation';
import {learnerFamilyLabel} from '../lib/learner-labels';

type Context={developments:LearningDevelopment[];resume?:LearningResume;perspective?:LearningPerspective;recent?:{lastDevelopmentId:string;supersededBy?:string}[];nextCursor?:string};

/**
 * Legacy development records are retained, readable and source-linked, but
 * there is no new checkpoint authoring or correction form. New work belongs
 * in the canonical Project, independent Notes and their source relationships.
 */
export default function LearningDevelopments({scope,record,target,management=false}:{scope:string;record:WorkspaceRecord;target:LearningWorkTarget;management?:boolean;showEmpty?:boolean}){
 const [data,setData]=useState<Context|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[review,setReview]=useState(false),[moreBusy,setMoreBusy]=useState(false);
 const key=JSON.stringify(target);
 useEffect(()=>{const controller=new AbortController();setData(null);setLoading(true);setError('');
  void (async()=>{try{const response=await generationFetch(scope,'/api/learning-context?'+new URLSearchParams({scope:'target',target:key}),{cache:'no-store',signal:controller.signal});const value=await response.json() as Context&{error?:string};if(!response.ok)throw Error(value.error??'Earlier saved work is unavailable.');if(!controller.signal.aborted)setData(value);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Earlier work unavailable.')}finally{if(!controller.signal.aborted)setLoading(false)}})();
  return()=>controller.abort();
 },[scope,key,record.rev]);
 async function older(){if(!data?.nextCursor||moreBusy)return;setMoreBusy(true);try{const response=await generationFetch(scope,'/api/learning-context?'+new URLSearchParams({scope:'target',target:key,cursor:data.nextCursor}),{cache:'no-store'}),value=await response.json() as Context&{error?:string};if(!response.ok)throw Error(value.error??'Older work unavailable.');setData(previous=>previous?{...previous,developments:[...previous.developments,...value.developments.filter((item:LearningDevelopment)=>!previous.developments.some(old=>old.id===item.id))],nextCursor:value.nextCursor}:value);}catch(e){setError(e instanceof Error?e.message:'Older work unavailable.')}finally{setMoreBusy(false);}}
 async function exact(id:string){try{const response=await generationFetch(scope,'/api/learning-context?'+new URLSearchParams({scope:'target',target:key,developmentId:id}),{cache:'no-store'}),value=await response.json() as Context&{error?:string};if(!response.ok||!value.developments?.[0])throw Error(value.error??'Exact saved evidence unavailable.');setData(previous=>previous?{...previous,developments:previous.developments.map(d=>d.id===id?value.developments[0]:d)}:value);}catch(e){setError(e instanceof Error?e.message:'Exact evidence unavailable.');}}
 if(!data?.developments?.length&&!data?.perspective&&!error)return null;
 const superseded=data?.recent?.filter(item=>item.supersededBy).map(item=>item.lastDevelopmentId)??[];
 const resume=data?.resume??(data?projectLearningResume(data.developments,superseded):undefined),active=resume&&data?.developments.find(item=>item.id===resume.source.id);
 const history=<div className="le-learning-management">
  <p className="le-hint">Earlier saved interpretations are retained as historical sources. They may be superseded by newer Notes or revised Project work.</p>
  {data?.developments.map(item=><article key={item.id} className="le-checkpoint-history">
   <header><strong>{item.withdrawn?'Withdrawn historical record':item.kind==='correction'?'Earlier correction':'Earlier saved interpretation'}</strong><small> <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString('en-GB')}</time> · revision {item.revision}</small></header>
   {item.detailsDeferred?<button className="v2-secondary" onClick={()=>void exact(item.id)}>Read exact retained evidence</button>:<><p>{item.summary}</p>{item.decisions?.map((d,i)=><p key={i}><strong>{d.status==='provisional'?'Working choice':'Saved decision'}:</strong> {d.choice} — {d.reason}</p>)}{item.facts.map((fact,i)=><div key={i}><small>{fact.role.replaceAll('-',' ')} · {basisLabel(fact.basis)}</small><p>{fact.text}</p><EvidenceLinks refs={fact.refs} target={target}/></div>)}{item.nextQuestions.length>0&&<p>Open at the time: {item.nextQuestions.join(' · ')}</p>}{item.nextAction&&<p>Next intention at the time: {item.nextAction}</p>}</>}
  </article>)}
  {data?.nextCursor&&<button className="v2-secondary" disabled={moreBusy} onClick={()=>void older()}>{moreBusy?'Loading…':'Read older records'}</button>}
  {error&&<p role="alert">{error}</p>}
 </div>;
 if(management)return <section aria-label="Earlier saved interpretations"><h3>Earlier saved interpretations</h3>{history}</section>;
 return <section className="le-resume" aria-label="Earlier saved learning">
  <header><h2>Earlier saved interpretation</h2><button className="v2-text-button" onClick={()=>setReview(value=>!value)}>{review?'Hide history':'Read history'}</button></header>
  {loading&&<p role="status">Checking earlier work…</p>}
  {resume&&!resume.detailsDeferred?<p>{resume.summary}</p>:<p>Retained work may have deferred or unavailable supporting evidence.</p>}
  {data?.perspective?.stale&&<p className="le-hint">An earlier interpretation has changed evidence and is not presented as current understanding.</p>}
  {review&&history}
 </section>;
}

export type EarlierLearningChoice={id:string;revision:number;at:string;decisions:NonNullable<LearningDevelopment['decisions']>};
export function earlierChoice(developments:LearningDevelopment[],currentId?:string,supersededIds:Iterable<string>=[]):EarlierLearningChoice|undefined{
 const superseded=new Set(supersededIds);for(const item of developments)if(!item.withdrawn&&item.supersedesId)superseded.add(item.supersedesId);
 const prior=developments.filter(item=>item.id!==currentId&&!item.withdrawn&&!item.evidenceUnavailable&&!item.detailsDeferred&&!superseded.has(item.id)&&item.decisions?.length).sort((a,b)=>(b.revisedAt??b.createdAt).localeCompare(a.revisedAt??a.createdAt)||b.id.localeCompare(a.id))[0];
 return prior?{id:prior.id,revision:prior.revision,at:prior.revisedAt??prior.createdAt,decisions:prior.decisions!}:undefined;
}
/** Compatibility display used by the retained-data reading fixture. */
export function LearningResumeView({resume,perspective,status,activeCheckpoint,target,onReview,earlierChoice:priorChoice,children}:{resume?:LearningResume;perspective?:LearningPerspective;status?:string;activeCheckpoint?:LearningDevelopment;target:LearningWorkTarget;onReview:()=>void;earlierChoice?:EarlierLearningChoice;children?:React.ReactNode}){
 return <section className="le-resume" aria-label="Earlier saved interpretation">
  <header><h2>Earlier saved interpretation</h2><button className="v2-text-button" onClick={onReview}>Read saved history</button></header>
  {perspective&&!perspective.stale&&!perspective.detailsDeferred&&<p>{perspective.summary}</p>}
  {perspective?.stale&&<p role="status">Earlier interpretation needs review because its evidence changed.</p>}
  {resume&&!resume.detailsDeferred?<><p className="le-resume-summary">{resume.summary}</p>{resume.decisions.map((decision,i)=><div key={i}><h3>{decision.status==='provisional'?'Earlier working choice':'Earlier decision'}</h3><p>{decision.choice}</p><p>{decision.reason}</p><EvidenceLinks refs={decision.refs} target={target}/></div>)}{priorChoice&&<div><h3>Earlier choice</h3>{priorChoice.decisions.map((d,i)=><p key={i}>{d.choice} — {d.reason}</p>)}</div>}<ResumeFacts title="Reported attempts" facts={resume.attempts} target={target}/><ResumeFacts title="Reported observations" facts={resume.observations} target={target}/><ResumeFacts title="Corrections" facts={resume.corrections} target={target}/><ResumeFacts title="Unresolved interpretations" facts={resume.interpretations} target={target}/>{!!resume.openQuestions.length&&<p>Questions open then: {resume.openQuestions.join(' · ')}</p>}{resume.nextAction&&<p>Next action saved then: {resume.nextAction}</p>}{activeCheckpoint?.noteEvidence?.map(ref=><a className="le-evidence-link" key={ref.id+ref.rev} href={ref.destination}>Read original Note · revision {ref.rev}</a>)}</>:<p>Supporting evidence requires an exact historical read.</p>}
  {status&&<p role="status">{status}</p>}{children}
 </section>;
}
function basisLabel(basis:LearningFact['basis']){return ({'learner-reported':'your report','supplied-artifact':'supplied evidence','minamo-observed':'observed by Minamo','gpt-interpretation':'GPT interpretation','provisional':'provisional','illustrative':'illustrative example'})[basis];}
function EvidenceLinks({refs,target}:{refs?:EvidenceRef[];target?:LearningWorkTarget}){return <>{refs?.map((ref,index)=>{const destination=learningEvidenceDestination(ref,target);return destination?<a className="le-evidence-link" key={index} href={destination} {...(ref.kind==='repository'?{target:'_blank',rel:'noreferrer noopener'}:{})}>{ref.kind==='repository'?'Read repository evidence':`Read ${ref.kind==='record'?learnerFamilyLabel(ref.family,{lowercase:true}):'saved'} evidence`}{ref.kind==='record'?` · revision ${ref.rev}`:''}</a>:ref.kind==='owner-statement'?<small className="le-evidence-claim" key={index}>Owner statement: {ref.text}</small>:null;})}</>;}
function ResumeFacts({title,facts,target}:{title:string;facts:ResumeFact[];target:LearningWorkTarget}){if(!facts.length)return null;return <div className="le-resume-facts"><h3>{title}</h3><ul>{facts.slice(0,3).map((fact,index)=><li key={index}><p>{fact.text}</p><small>{basisLabel(fact.basis)}</small><EvidenceLinks target={target} refs={fact.refs}/></li>)}</ul></div>;}
