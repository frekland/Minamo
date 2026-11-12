'use client';
import {useEffect,useRef,useState} from 'react';
import {generationFetch} from '../lib/workspace-generation';
import {subscribeForeground,retainContentAfterReadFailure} from '../lib/foreground-session';
import {useContextualHref} from './navigation-context';
import {routeDestination,type ViewOrigin} from '../lib/navigation-origin';
import {verifiedOriginReturn,type VerifiedReturn,type ReturnSlot} from '../lib/view-origin-return';
import type {ReaderProps} from './reader';
import type {WorkspaceRecord} from '../lib/contracts';
import './view-origin-return.css';

type Context={record?:WorkspaceRecord|null;selection?:unknown};
const ordinary=(event:React.MouseEvent<HTMLAnchorElement>)=>event.button===0&&!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey;

/** Navigation history may suggest a return, but only exact current-rights reads may display it. */
export default function ViewOriginReturn({origin,scope,onNavigate}:{origin:ViewOrigin;scope:string;onNavigate?:ReaderProps['onNavigate']}){
 const contextualHref=useContextualHref(),key=JSON.stringify([scope,origin]);
 const [state,setState]=useState<{key:string;items:VerifiedReturn[];pending:boolean;checked:boolean;error?:string;unavailable:boolean}>({key:'',items:[],pending:true,checked:false,unavailable:false});
 const sequence=useRef(0),live=useRef(key),controller=useRef<AbortController|null>(null),stateRef=useRef(state),retryRef=useRef<()=>void>(()=>{});live.current=key;stateRef.current=state;
 useEffect(()=>{
  let closed=false;
  const read=async(quiet=false)=>{
   if(quiet&&stateRef.current.pending)return;
   const serial=++sequence.current;controller.current?.abort();const abort=new AbortController();controller.current=abort;
   setState(previous=>({key,items:quiet&&previous.key===key?previous.items:[],checked:quiet&&previous.key===key?previous.checked:false,unavailable:false,pending:true}));
   const slots=(['source','activity','task'] as const).filter(slot=>!!origin[slot]);
   try{
    const requested=await Promise.all(slots.map(async slot=>{
     const ref=origin[slot]!;
     const params=new URLSearchParams({family:ref.family,id:ref.id,...(ref.rendition?{rendition:ref.rendition}:{})});
     if(slot==='source'&&origin.source?.start!==undefined){const s=origin.source;params.set('selection',JSON.stringify({sectionId:s.sectionId,partId:s.partId,start:s.start,end:s.end,...(s.segments?{segments:s.segments}:{})}));}
     const response=await generationFetch(scope,'/api/context?'+params,{cache:'no-store',signal:abort.signal});
     if(!response.ok){if(response.status===404||response.status===409||response.status===403)return {slot,context:null};throw Object.assign(Error('Return source could not be refreshed.'),{status:response.status});}
     return {slot,context:await response.json() as Context};
    }));
    let projectEligible=false;
    const task=origin.task;
    if(task?.family==='investigation'&&task.projectId&&task.stageId){
     const params=new URLSearchParams({family:'journey',id:task.projectId});
     const projectResponse=await generationFetch(scope,'/api/context?'+params,{cache:'no-store',signal:abort.signal});
     if(projectResponse.ok){const data=await projectResponse.json() as Context;projectEligible=!!data.record&&data.record.family==='journey'&&data.record.learningShape?.kind==='journey'&&data.record.learningShape.stages.some(s=>s.id===task.stageId);}
     else if(![403,404,409].includes(projectResponse.status))throw Object.assign(Error('Original Project could not be checked.'),{status:projectResponse.status});
    }
    if(closed||serial!==sequence.current||live.current!==key)return;
    const items=requested.flatMap(({slot,context})=>{const item=context?verifiedOriginReturn(slot as ReturnSlot,origin,context,projectEligible):undefined;return item?[item]:[];});
    setState({key,items,pending:false,checked:true,unavailable:items.length<slots.length});
   }catch(error){
    if(closed||abort.signal.aborted||serial!==sequence.current||live.current!==key)return;
    const status=(error as {status?:number}).status;
    setState(previous=>retainContentAfterReadFailure(status,previous.key===key&&previous.checked)?{...previous,pending:false,error:'Could not refresh original return destinations. Retry before relying on them.'}:{key,items:[],pending:false,checked:false,unavailable:false,error:'Original return destinations could not be checked.'});
   }
  };
  retryRef.current=()=>void read();void read();const unsubscribe=subscribeForeground(()=>void read(true)),changed=()=>void read(true);
  const unavailable=(event:Event)=>{if((event as CustomEvent<{ownerScope?:string}>).detail?.ownerScope===scope)void read();};
  window.addEventListener('minamo-learning-changed',changed);window.addEventListener('minamo-source-unavailable',unavailable);
  return()=>{closed=true;sequence.current++;controller.current?.abort();unsubscribe();window.removeEventListener('minamo-learning-changed',changed);window.removeEventListener('minamo-source-unavailable',unavailable);retryRef.current=()=>{};};
 },[key]);
 const current=state.key===key?state:{key,items:[],pending:true,checked:false,unavailable:false};
 return <nav className="v2-origin-return" aria-label="Return through your browsing path">
  <strong>Return through this browsing path</strong>
  {current.items.length>0&&<ul>{current.items.map(item=>{const path=contextualHref(item.href);return <li key={item.slot}><a href={path} onClick={event=>{if(!ordinary(event)||!onNavigate)return;const target=routeDestination(path);if(!target)return;event.preventDefault();onNavigate(target.view,target.id,target.target);}}>{item.label}: {item.title}</a></li>})}</ul>}
  {current.pending?<small role="status">Checking exact destinations…</small>:current.unavailable?<small>Some earlier destinations are unavailable. No newer edition or different task has been substituted.</small>:null}
  {current.error&&<small role="status">{current.error} <button type="button" onClick={()=>retryRef.current()}>Retry</button></small>}
 </nav>;
}
