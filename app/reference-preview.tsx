"use client";
import {useContextualHref} from './navigation-context';
import {useEffect,useRef,useState} from 'react';
import {X,ExternalLink,NotebookPen,RefreshCw} from 'lucide-react';
import {useLearningSpace} from './learning-space-ui';
import {matchesLearningScope,type LearningScopeQuery} from '../lib/learning-spaces';
import {appendLearningSpace,learningSpaceKey} from '../lib/learning-space-navigation';
import {withLibraryReturn} from '../lib/library-return';
import {generationFetch} from '../lib/workspace-generation';
import {canonicalReadingParts} from '../lib/contracts';
import type {PassagePart,WorkspaceRecord} from '../lib/contracts';
import type {ReferenceDestination} from '../lib/workspace-presentation';
import {putTask,type LayoutTask} from '../lib/layout-workspace';
import GptHandoff from './gpt-handoff';
import './reference-preview.css';

/** Deliberately passive: no canonical IDs, selection hooks or captured coordinates. */
export function previewParts(record:WorkspaceRecord,target:ReferenceDestination){
 const sections=record.sections??[],section=sections.find(s=>s.id===target.sectionId);
 if(target.sectionId&&target.sectionId!=='__article'&&!section)return {parts:[] as PassagePart[],omitted:true,missing:true};
 const candidates=target.sectionId==='__article'?canonicalReadingParts(record).filter(p=>p.sectionId==='__article').map(p=>p.part):section?.parts??sections.flatMap(s=>s.parts);
 const exact=target.partId?candidates.find(p=>p.id===target.partId):undefined;
 if(target.partId&&!exact)return {parts:[] as PassagePart[],omitted:true,missing:true};
 const selected:PassagePart[]=[];let bytes=0;
 for(const part of exact?[exact]:candidates){
  if(part.unavailable||part.excerpt||!['paragraph','callout','code'].includes(part.kind))continue;
  const cost=new TextEncoder().encode(part.text).byteLength;
  if(selected.length>=4||bytes+cost>7000)continue;
  selected.push(part);bytes+=cost;
 }
 return {parts:selected,omitted:selected.length<candidates.length||!!record.body,missing:false};
}
export function eligibleReferencePreview(record:WorkspaceRecord,target:ReferenceDestination,selection:LearningScopeQuery){return record.family===target.family&&record.id===target.id&&(!target.rendition||record.rendition===target.rendition)&&matchesLearningScope(record,selection);}
export default function ReferencePreview({target,scope,onClose,onOpen,onNote,localRecord,task,revalidateKey=0}:{task?:LayoutTask|null;revalidateKey?:number;localRecord?:WorkspaceRecord;target:ReferenceDestination;scope:string;onClose:()=>void;onOpen:(target:ReferenceDestination)=>void;onNote:(record:WorkspaceRecord,target:ReferenceDestination)=>void}){
 const contextualHref=useContextualHref(),selection=useLearningSpace(),learningKey=learningSpaceKey(selection),itemLabel=target.family==='article'?'Article':'topic';
 const identity=JSON.stringify([scope,target,learningKey]);
 const matches=(record:WorkspaceRecord)=>eligibleReferencePreview(record,target,selection);
 const [read,setRead]=useState<{identity:string;record:WorkspaceRecord|null;error:string;loading:boolean}>(()=>({identity,record:localRecord&&matches(localRecord)?localRecord:null,error:localRecord&&!matches(localRecord)?'This reference is outside the selected learning space.':'',loading:!localRecord}));
 const [retry,setRetry]=useState(0),lastCheck=useRef(0),heading=useRef<HTMLHeadingElement>(null);
 const current=read.identity===identity?read:{identity,record:null,error:'',loading:true};
 const {record,error,loading}=current;
 useEffect(()=>{heading.current?.focus()},[identity]);
 useEffect(()=>{
  if(localRecord){setRead({identity,record:matches(localRecord)?localRecord:null,error:matches(localRecord)?'':'This reference is unavailable in the selected learning space.',loading:false});return;}
  let live=true;const controller=new AbortController();setRead({identity,record:null,error:'',loading:true});
  const params=new URLSearchParams({family:target.family,id:target.id});if(target.rendition)params.set('rendition',target.rendition);
  generationFetch(scope,'/api/context?'+params,{cache:'no-store',signal:controller.signal}).then(async response=>{
   const data=await response.json() as {record?:WorkspaceRecord;error?:string};
   if(!response.ok||!data.record)throw Error(data.error??'This reference is unavailable.');
   if(!matches(data.record))throw Error('This reference is unavailable in the selected learning space.');
   if(live&&!controller.signal.aborted)setRead({identity,record:data.record,error:'',loading:false});
  }).catch(e=>{if(live&&!controller.signal.aborted)setRead({identity,record:null,error:e instanceof Error?e.message:'Reference could not be read.',loading:false})});
  const revoke=(e:Event)=>{const detail=(e as CustomEvent<{ownerScope?:string}>).detail;if(detail?.ownerScope!==scope)return;live=false;controller.abort();setRead({identity,record:null,error:'Reference eligibility changed. Reopen it to check current access.',loading:false})};
  window.addEventListener('minamo-source-unavailable',revoke);window.addEventListener('minamo-image-unavailable',revoke);
  return()=>{live=false;controller.abort();window.removeEventListener('minamo-source-unavailable',revoke);window.removeEventListener('minamo-image-unavailable',revoke)};
 },[identity,retry,localRecord,revalidateKey]);
 useEffect(()=>{if(localRecord)return;const check=()=>{if(document.visibilityState!=='visible'||Date.now()-lastCheck.current<15000)return;lastCheck.current=Date.now();setRetry(n=>n+1)};window.addEventListener('focus',check);document.addEventListener('visibilitychange',check);return()=>{window.removeEventListener('focus',check);document.removeEventListener('visibilitychange',check)}},[identity,localRecord]);
 const projection=record?previewParts(record,target):null;
 const exactUrl=appendLearningSpace(new URLSearchParams({view:'library',family:target.family,id:target.id}),selection);
 if(record?.rendition)exactUrl.set('rendition',record.rendition);else if(target.rendition)exactUrl.set('rendition',target.rendition);
 const currentParams=typeof window==='undefined'?new URLSearchParams():new URLSearchParams(window.location.search);if(target.sectionId)exactUrl.set('section',target.sectionId);if(target.partId)exactUrl.set('part',target.partId);putTask(exactUrl,task??null);
 return <aside className="wp-reference" onKeyDown={e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){e.stopPropagation();onClose()}}} aria-labelledby="reference-preview-title"><header><div><h2 ref={heading} id="reference-preview-title" tabIndex={-1}>Reference preview</h2>{record&&<a className="wp-preview-open v2-text-button" href={contextualHref(withLibraryReturn('/?'+exactUrl,currentParams.get('returnLibrary')))} onClick={event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpen({...target,rendition:record.rendition})}}>Open exact {itemLabel} <ExternalLink size={14}/></a>}</div><button className="v2-icon" aria-label="Close reference and return" onClick={onClose}><X size={19}/></button></header>{loading?<p role="status">Loading reference…</p>:error?<div role="alert"><p>{error}</p><button className="v2-secondary" onClick={()=>setRetry(n=>n+1)}><RefreshCw size={15}/>Retry reference</button></div>:record&&<><p className="v2-eyebrow">{record.family==='area'?'Subject':'Article'} · revision {record.rev}</p><h3>{record.title}</h3>{projection?.missing?<p>The requested part is unavailable in this edition. No similar passage has been substituted.</p>:<div className="wp-reference-body">{record.body&&!target.sectionId&&<p>{record.body.length<=1600?record.body:`The opening is longer than this preview. Open the exact ${itemLabel} for the complete introduction.`}</p>}{projection?.parts.map(part=>part.kind==='code'?<pre key={part.id} tabIndex={0}><code>{part.text}</code></pre>:<p key={part.id} className={part.kind==='callout'?'wp-preview-callout':undefined}>{part.text}</p>)}</div>}<p className="wp-preview-notice">{projection?.omitted?`Partial preview. Open the full ${itemLabel} for diagrams and media. `:''}Open the full {itemLabel} to Flag or Annotate a passage.</p><div className="wp-reference-actions"><button className="v2-text-button" disabled={!!projection?.missing} onClick={()=>onNote(record,{...target,rendition:record.rendition})}><NotebookPen size={14}/>Note on this reference</button></div></>}</aside>;
}
