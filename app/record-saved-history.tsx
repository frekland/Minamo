"use client";
import {useEffect,useRef,useState} from 'react';
import {ArrowRight} from 'lucide-react';
import type {WorkspaceRecord} from '../lib/contracts';
import {generationFetch} from '../lib/workspace-generation';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import {useLearningSpace} from './learning-space-ui';
import {routeDestination} from '../lib/navigation-origin';
import './record-saved-history.css';

type Entry={rev:number;rendition?:string;at:string;actor:string;synthetic:boolean;unchangedContent:boolean;changes:{field:string;before?:string;after?:string}[];changesOmitted:boolean;destination?:string};
type Changes={contract:'minamo.record-changes.v1';currentRevision:number;entries:Entry[];nextBeforeRevision:number|null;notice:string};

/** Optional, exact record history. Only opening it performs the bounded read. */
export default function RecordSavedHistory({record,scope,onNavigate}:{record:WorkspaceRecord;scope:string;onNavigate:(view:string,id?:string,target?:any)=>void}){
 const selection=useLearningSpace(),identity=record.family+':'+record.id+':'+scope;
 const [opened,setOpened]=useState(false),[state,setState]=useState<{identity:string;items:Entry[];next:number|null;loading:boolean;error?:string}>({identity:'',items:[],next:null,loading:false});
 const seq=useRef(0);
 useEffect(()=>{seq.current++;setOpened(false);setState({identity,items:[],next:null,loading:false})},[identity]);
 async function load(before?:number){const run=++seq.current;setState(previous=>({...previous,identity,loading:true,error:undefined}));try{
  const response=await generationFetch(scope,'/api/records/changes?'+new URLSearchParams({family:record.family,id:record.id,limit:'6',...(before!==undefined?{beforeRevision:String(before)}:{})}),{cache:'no-store'});
  const value=await response.json() as Changes&{error?:string};
  if(!response.ok||value.contract!=='minamo.record-changes.v1')throw Error(value.error??'Saved editions are unavailable.');
  if(seq.current===run)setState(previous=>({identity,items:before!==undefined?[...previous.items,...value.entries]:value.entries,next:value.nextBeforeRevision,loading:false}));
 }catch(error){if(seq.current===run)setState(previous=>({...previous,loading:false,error:error instanceof Error?error.message:'Saved editions are unavailable.'}));}}
 function toggle(open:boolean){setOpened(open);if(open&&!state.items.length&&!state.loading)void load();}
 return <details className="mn-record-history" open={opened} onToggle={event=>{if(opened!==event.currentTarget.open)toggle(event.currentTarget.open)}}>
  <summary>Saved editions <small>· exact revisions</small></summary>
  {opened&&<div className="mn-record-history-content">
   <p>Actual saves to this {record.family==='investigation'?'Question':record.family==='article'?'Library article':record.family==='note'?'Note':'record'}. Differences are literal, not explanations of why someone changed their work.</p>
   {state.error&&<p role="alert">{state.error} <button type="button" onClick={()=>void load()}>Retry</button></p>}
   <ol>{state.items.map(item=>{const route=item.destination?routeDestination(item.destination):undefined;return <li key={item.rev}><div className="mn-record-history-head"><strong>Revision {item.rev}</strong><time dateTime={item.at}>{new Date(item.at).toLocaleString('en-GB')}</time><small>{item.actor==='gpt'?'GPT-authored':item.actor==='user'?'User-authored':'System save'}{item.synthetic?' · synthetic':''}</small></div>
    {item.changes.length?<ul>{item.changes.map((change,index)=><li key={index}><strong>{change.field}</strong>{change.before&&<span>Before: {change.before}</span>}{change.after&&<span>After: {change.after}</span>}</li>)}</ul>:<p>Same retained material as the preceding edition, or first saved edition.</p>}
    {item.changesOmitted&&<small>Further differences are available in the full edition.</small>}
    {route&&item.destination&&<a href={learningSpaceHref(item.destination,selection)} onClick={event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onNavigate(route.view,route.id,route.target)}}>Open exact revision <ArrowRight size={13} aria-hidden="true"/></a>}
   </li>})}</ol>
   {state.loading&&<p role="status">Reading retained editions…</p>}
   {!state.loading&&state.next!==null&&<button type="button" className="v2-secondary" onClick={()=>void load(state.next!)}>Earlier editions</button>}
  </div>}
 </details>;
}
