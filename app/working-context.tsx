"use client";
import {useEffect,useMemo,useRef,useState,type MouseEvent} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Compass,GitCompareArrows,NotebookPen,RefreshCw,Search,ShieldCheck} from 'lucide-react';
import type {Family,SelectedContextRef,WorkspaceRecord} from '../lib/contracts';
import {generationFetch} from '../lib/workspace-generation';
import {learningSpaceHref,learningSpaceKey,learningSpaceLabel,learningSpaceParams,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {routeDestination} from '../lib/navigation-origin';
import {subscribeForeground} from '../lib/foreground-session';
import {contextHref,explicitContextSelection,workingContextReadKey} from '../lib/contextual-workspace-state';
import type {EvidenceItem,EvidencePage} from './continuity-sources';
import ContinuityGptHandoff from './continuity-gpt-handoff';
import './working-context.css';

type Focus={family:'journey'|'investigation';id:string};
type Source={family:Family;id:string;rev:number;rendition?:string};
export type WorkingSelected={requested:SelectedContextRef;status:'available'|'unavailable';source?:Source;title?:string;actor?:string;at?:string;preview?:{text:string;complete:boolean};destination?:string};
export type WorkingRelation={from:Source;to:Source;quality:'saved-record-link'|'exact-edition'|'older-edition'|'derived-bounded-path';reason:string;destination:string;opensCurrentSource:boolean};
export type WorkingRead={contract:'minamo.working-context.v1';snapshotVersion:number;generation:string;selectionIsSaved:false;selected:WorkingSelected[];relations:WorkingRelation[];evidence:EvidencePage;coverage:{completeWithinScope:boolean;moreRelations:boolean;gaps:string[];notice:string};lastSeenByGpt:'unknown'};
type ReadState={key:string;loading:boolean;page?:WorkingRead;error?:string};
export function admittedWorkingRead(state:ReadState,key:string,enabled:boolean):ReadState{
 return !enabled?{key,loading:false}:state.key===key?state:{key,loading:true};
}
/** Rights-changing errors, including changed generations, never retain old source excerpts. */
export function failedWorkingRead(key:string,error:unknown):ReadState{
 return {key,loading:false,error:error instanceof Error?error.message:'Working sources could not be checked.'};
}
export function combineWorkingEvidence(first:WorkingRead,later:WorkingRead):WorkingRead{
 if(first.contract!==later.contract||first.generation!==later.generation||first.snapshotVersion!==later.snapshotVersion||JSON.stringify(first.selected)!==JSON.stringify(later.selected))throw Error('Saved work changed during this scan. Restart the source read.');
 const seen=new Set<string>();
 const items=[...first.evidence.items,...later.evidence.items].filter(item=>{const key=JSON.stringify([item.basis,item.checkpoint?.id??null,item.source.family,item.source.id,item.source.rev]);if(seen.has(key))return false;seen.add(key);return true;});
 return {...later,evidence:{...later.evidence,items}};
}
function statusError(response:Response,value:{error?:{message?:string}|string}){
 return new Error(typeof value.error==='string'?value.error:value.error?.message??`Context read unavailable (${response.status}).`);
}
function useWorkingContext({scope,selection,serverReads,refs,focus}:{scope:string;selection:LearningSpaceSelection;serverReads:boolean;refs:SelectedContextRef[];focus?:Focus}){
 const selectionKey=learningSpaceKey(selection),key=workingContextReadKey(scope,selectionKey,refs,focus);
 const [read,setRead]=useState<ReadState>({key:'',loading:serverReads}),[epoch,setEpoch]=useState(0);
 const liveKey=useRef(key),sequence=useRef(0),refJson=JSON.stringify(refs);liveKey.current=key;
 const current=admittedWorkingRead(read,key,serverReads);
 const refresh=()=>{sequence.current++;setRead({key:liveKey.current,loading:true});setEpoch(value=>value+1);};
 useEffect(()=>{const changed=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string}>).detail;if(detail?.ownerScope===scope)refresh();};const foreground=subscribeForeground(refresh);window.addEventListener('minamo-learning-changed',changed);window.addEventListener('minamo-record-committed',changed);window.addEventListener('minamo-source-unavailable',changed);return()=>{foreground();window.removeEventListener('minamo-learning-changed',changed);window.removeEventListener('minamo-record-committed',changed);window.removeEventListener('minamo-source-unavailable',changed);};},[scope]);
 useEffect(()=>{const run=++sequence.current;if(!serverReads){setRead({key,loading:false});return;}const controller=new AbortController();setRead({key,loading:true});
  const params=new URLSearchParams({scope:'working',limit:'8',...learningSpaceParams(selection),...(refs.length?{selectedRefs:refJson}:{}),...(focus?{focus:JSON.stringify(focus)}:{})});
  generationFetch(scope,'/api/learning-context?'+params,{cache:'no-store',signal:controller.signal}).then(async response=>{const value=await response.json() as WorkingRead&{error?:string};if(!response.ok||value.contract!=='minamo.working-context.v1')throw statusError(response,value);if(!controller.signal.aborted&&liveKey.current===key&&sequence.current===run)setRead({key,loading:false,page:value});}).catch(error=>{if(!controller.signal.aborted&&liveKey.current===key&&sequence.current===run)setRead(failedWorkingRead(key,error));});return()=>{controller.abort();sequence.current++;};
 },[scope,key,serverReads,epoch]);
 async function more(){const cursor=current.page?.evidence.coverage.nextCursor;if(!cursor||current.loading)return;const run=++sequence.current;const first=current.page!;setRead({key,loading:true,page:first});try{
  const params=new URLSearchParams({scope:'working',limit:'8',cursor,...learningSpaceParams(selection),...(refs.length?{selectedRefs:refJson}:{}),...(focus?{focus:JSON.stringify(focus)}:{})});
  const response=await generationFetch(scope,'/api/learning-context?'+params,{cache:'no-store'}),value=await response.json() as WorkingRead&{error?:string};if(!response.ok||value.contract!=='minamo.working-context.v1')throw statusError(response,value);
  const combined=combineWorkingEvidence(first,value);if(liveKey.current===key&&sequence.current===run)setRead({key,loading:false,page:combined});
 }catch(error){if(liveKey.current===key&&sequence.current===run)setRead(failedWorkingRead(key,error));}}
 return {read:current,refresh,more};
}
const label=(family:string)=>({note:'Note',run:'Activity result',experiment:'Activity',article:'Library article',journey:'Project',investigation:'Question',flag:'Bookmark',annotation:'Annotation'} as Record<string,string>)[family]??'Source';
const date=(value?:string)=>value&&Number.isFinite(Date.parse(value))?new Date(value).toLocaleString('en-GB'):'Date unavailable';
const exactRef=(item:EvidenceItem):SelectedContextRef=>({family:item.source.family as Family,id:item.source.id,...(item.source.rendition?{rendition:item.source.rendition}:{})});
const refKey=(ref:SelectedContextRef)=>JSON.stringify([ref.family,ref.id,ref.rendition??null]);

export type WorkingContextProps={scope:string;selection:LearningSpaceSelection;serverReads:boolean;home:boolean;current?:WorkspaceRecord|null;activeRef?:SelectedContextRef;returnLabel?:string;onReturn?:()=>void;onStartNote:()=>void;onOpenNote?:()=>void;onNavigate:(view:string,id?:string,target?:any)=>void};
/** The one integrated view layer. It owns only transient selection, not commands or Notes drafts. */
export function WorkingContextHost({scope,selection,serverReads,home,current,activeRef,returnLabel,onReturn,onStartNote,onOpenNote,onNavigate}:WorkingContextProps){
 const [compared,setCompared]=useState<SelectedContextRef[]>([]),[guideOpen,setGuideOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false);
 const focus=guideOpen&&current&&['journey','investigation'].includes(current.family)?{family:current.family as Focus['family'],id:current.id}:undefined;
 const selected=useMemo(()=>explicitContextSelection(activeRef,compared),[JSON.stringify(activeRef),JSON.stringify(compared)]);
 const {read,refresh,more}=useWorkingContext({scope,selection,serverReads,refs:selected,focus});
 // No source or comparison from another owner, generation or learning space survives a switch.
 useEffect(()=>{setCompared([]);setGuideOpen(false);},[scope,learningSpaceKey(selection)]);
 const {page,error,loading}=read,items=page?.evidence.items??[],selectedCurrent=page?.selected.find(item=>activeRef&&item.requested.family===activeRef.family&&item.requested.id===activeRef.id),available=page?.selected.filter(item=>item.status==='available')??[];
 const navigateHref=(event:MouseEvent<HTMLAnchorElement>,href:string)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const target=routeDestination(href);if(!target)return;event.preventDefault();onNavigate(target.view,target.id,target.target);};
 const sourceLink=(href:string|undefined,text:string)=>href&&routeDestination(href)?<a className="wc-open" href={contextHref(learningSpaceHref(href,selection))} onClick={event=>navigateHref(event,href)}>{text}<ArrowRight size={14} aria-hidden="true"/></a>:<span className="wc-unavailable">Original currently unavailable</span>;
 const toggleCompared=(ref:SelectedContextRef)=>{setCompared(previous=>previous.some(item=>refKey(item)===refKey(ref))?previous.filter(item=>refKey(item)!==refKey(ref)):[...previous,ref].slice(-2));};
 const explorer=[{view:'library',title:'Read',description:'Library sources',Icon:BookOpen},{view:'practice',title:'Practise',description:'Activities and review',Icon:Search},{view:'journeys',title:'Projects',description:'Optional guidance',Icon:Compass}];
 return <div className={'wc-host '+(home?'wc-home':'wc-with-source')} data-working-context="v1" data-history-open={historyOpen}>
  {home?<section className="wc-start" aria-labelledby="wc-title"><div><p className="wc-kicker">WORKING SPACE · {learningSpaceLabel(selection)}</p><h1 id="wc-title">What would you like to work on?</h1><p>Write directly, return to an exact saved source, or explore freely. A Project is optional.</p></div><button type="button" className="v2-primary wc-capture" onClick={onStartNote}><NotebookPen size={18}/>Start writing a Note</button></section>:<div className="wc-source-bar"><div>{onReturn&&<button type="button" className="v2-text-button" onClick={onReturn}><ArrowLeft size={14}/>Return to {returnLabel??'previous work'}</button>}<span className="wc-kicker">CURRENT MATERIAL · {current?label(current.family):'Checking source'}</span><strong>{current?.title??'Exact linked material'}</strong></div><div className="wc-source-actions"><button type="button" className="v2-secondary" onClick={onStartNote}><NotebookPen size={15}/>Blank Note</button>{current?.family==='note'&&onOpenNote&&<button type="button" className="v2-primary" onClick={onOpenNote}>Edit this Note</button>}</div></div>}
  {home&&<nav className="wc-explore" aria-label="Explore learning materials">{explorer.map(({view,title,description,Icon})=><a key={view} href={contextHref(learningSpaceHref('/?view='+view,selection))} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onNavigate(view);}}><Icon size={19}/><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16}/></a>)}</nav>}
  <section className="wc-continuity" aria-label={home?'Resume from saved sources':'Context around current material'}><div className="wc-section-heading"><div><h2>{home?'Resume from recorded work':'Source and saved connections'}</h2><p>{home?'Choose the original to resume. Recent writing and checkpoints are sources, not a prescribed next step.':'This panel reads exact eligible records; being open together does not create a saved relationship.'}</p></div><div className="wc-source-actions">{!home&&<button type="button" className="v2-text-button" onClick={()=>setHistoryOpen(value=>!value)} aria-expanded={historyOpen}>{historyOpen?'Hide recorded history':'Browse recorded history'}</button>}<button type="button" className="v2-icon" onClick={refresh} disabled={loading} aria-label="Refresh working context"><RefreshCw size={17}/></button></div></div>
   {loading&&!page&&<p role="status">Checking recorded work and current access…</p>}{!serverReads&&<p>Sign in to read saved work.</p>}{error&&<p role="alert" className="v2-form-error">{error} <button type="button" className="v2-text-button" onClick={refresh}>Retry exact read</button></p>}
   {!home&&selectedCurrent?.status==='unavailable'&&<p role="alert" className="wc-gap">The selected source is no longer eligible for this context read. Its earlier excerpt and links have been removed.</p>}
   {!home&&page&&<div className="wc-context-details"><details><summary>Related saved sources {page.relations.length?`· ${page.relations.length}`:''}</summary>{page.relations.length?<ul className="wc-related">{page.relations.map((relation,index)=><li key={index}><small>{relation.quality==='derived-bounded-path'?'Two saved links (bounded)':relation.quality==='older-edition'?'Older retained edition':relation.quality==='exact-edition'?'Exact edition':'Saved broad link'}</small>{sourceLink(relation.destination,`${label(relation.to.family)} · ${relation.to.id}`)}<p>{relation.reason}</p></li>)}</ul>:<p>No eligible saved links found in this bounded read. Other work may exist.</p>}</details><details><summary>Compare exact sources {compared.length?`· ${compared.length}`:''}</summary>{available.length?<div className="wc-comparison">{available.map(item=><article key={refKey(item.requested)}><small>{label(item.source?.family??item.requested.family)} · revision {item.source?.rev??'unknown'}</small><h3>{item.title??'Untitled source'}</h3><p>{item.preview?.text||'Only the original has the full content.'}</p>{!item.preview?.complete&&<small>Excerpt only; open the original for complete content.</small>}{sourceLink(item.destination,'Open exact source')}</article>)}</div>:<p>Select up to two sources from the recorded work below to compare with the current material. Comparison does not save a link.</p>}{compared.length>0&&<button type="button" className="v2-text-button" onClick={()=>setCompared([])}>Clear comparison</button>}</details>{current&&['journey','investigation'].includes(current.family)&&<details onToggle={event=>setGuideOpen(event.currentTarget.open)}><summary>Optional {current.family==='journey'?'Project':'Question'} guide</summary><p>Show recorded evidence associated with this {current.family==='journey'?'Project':'question'}. This does not turn it into your current task.</p></details>}</div>}
   {page&&<><div className="wc-evidence" aria-label="Recorded source history">{items.length?items.map(item=>{const href=item.destination&&routeDestination(item.destination)?item.destination:undefined,ref=exactRef(item),comparedNow=compared.some(chosen=>refKey(chosen)===refKey(ref));return <article key={JSON.stringify([item.basis,item.checkpoint?.id??null,item.source.family,item.source.id,item.source.rev])} className="wc-evidence-card"><div className="wc-evidence-meta"><span>{item.checkpoint?'Saved checkpoint':label(item.source.family)}</span><time dateTime={item.at}>{date(item.at)}</time>{item.checkpoint?.status&&item.checkpoint.status!=='active'&&<span>{item.checkpoint.status}</span>}</div>{sourceLink(href,item.title)}{item.preview.text&&<p>{item.preview.text}</p>}{item.checkpoint?.status==='active'&&item.checkpoint.nextAction&&<small>Intention recorded then: {item.checkpoint.nextAction}</small>}{item.detailsDeferred&&<small>Further source detail is deferred.</small>}{href&&<button type="button" className="v2-text-button wc-compare-button" onClick={()=>toggleCompared(ref)} aria-pressed={comparedNow} disabled={!comparedNow&&compared.length>=2}><GitCompareArrows size={13}/>{comparedNow?'Remove from comparison':'Compare source'}</button>}</article>;}):!loading?<p>There are no eligible sources on this page. This does not imply that other work or drafts do not exist.</p>:null}</div>
    {(page.evidence.coverage.moreAvailable||page.evidence.coverage.moreTargetsAvailable)&&<div className="wc-more">{page.evidence.coverage.moreAvailable?<button type="button" className="v2-secondary" disabled={loading} onClick={()=>void more()}>Earlier recorded sources</button>:<p>More linked tasks exist beyond this target window; open a Project or Question to inspect its sources.</p>}</div>}
    <p className="wc-coverage" role="status"><ShieldCheck size={14}/>{page.coverage.notice} GPT last-seen state is unknown. {page.evidence.coverage.moreAvailable?'More history is available.':''}</p>
    {!loading&&!error&&<div className="wc-gpt"><ContinuityGptHandoff page={page.evidence} selection={selection} focus={focus}/><small>Discuss only the sources you deliberately choose; no automatic conversation is sent.</small></div>}
   </>}
  </section>
 </div>;
}
