'use client';
import {useEffect,useRef,useState} from 'react';
import {generationFetch} from '../lib/workspace-generation';
import {subscribeForeground,retainContentAfterReadFailure} from '../lib/foreground-session';
import {learningSpaceParams} from '../lib/learning-space-navigation';
import {buildRecordLink} from '../lib/reading-links';
import {routeDestination} from '../lib/navigation-origin';
import {useContextualHref} from './navigation-context';
import {useLearningSpace} from './learning-space-ui';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ReaderProps} from './reader';
import './source-activities.css';

type Item={record:WorkspaceRecord;sourceMatch:{scope:'exact-part'|'section'|'edition';rendition:string}};
type Page={items:Item[];nextCursor?:string|null;scanIncomplete:boolean;notice:string};
export function sourceActivityDescription(match:Item['sourceMatch']){
 return match.scope==='exact-part'?'Linked to this exact part':match.scope==='section'?'Linked to this section':'Linked to this source edition';
}
const ordinary=(event:React.MouseEvent<HTMLAnchorElement>)=>event.button===0&&!event.defaultPrevented&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey;

/** Real native hrefs are rendered even when JavaScript click interception is unavailable. */
export function SourceActivityItems({items,onNavigate}:{items:Item[];onNavigate?:ReaderProps['onNavigate']}){
 const contextualHref=useContextualHref();
 return <ul>{items.map(item=>{
  const path=contextualHref(buildRecordLink({family:'experiment',id:item.record.id},{rendition:item.record.rendition}));
  return <li key={item.record.id}><a href={path} onClick={event=>{if(!ordinary(event)||!onNavigate)return;const destination=routeDestination(path);if(!destination)return;event.preventDefault();onNavigate(destination.view,destination.id,destination.target);}}>Activity · {item.record.title}</a><small>{sourceActivityDescription(item.sourceMatch)} · Retained source edition</small></li>;
 })}</ul>;
}

/** A compact read-only source action. Paging is honest: an empty partial scan is not absence. */
export default function SourceActivities({record,scope,sectionId,partId,onNavigate}:{record:WorkspaceRecord;scope:string;sectionId?:string;partId?:string;onNavigate?:ReaderProps['onNavigate']}){
 const selection=useLearningSpace();
 const key=JSON.stringify([scope,record.family,record.id,record.rev,record.rendition,sectionId,partId,selection]);
 const [state,setState]=useState<{key:string;items:Item[];cursor?:string|null;pending:boolean;error?:string;checked:boolean}>({key:'',items:[],pending:true,checked:false});
 const live=useRef(key),sequence=useRef(0),controller=useRef<AbortController|null>(null),stateRef=useRef(state);live.current=key;stateRef.current=state;
 const label=record.family==='article'?'Article':record.family==='area'?'topic':'source';
 useEffect(()=>{
  let closed=false;
  async function read(cursor?:string,quiet=false){
   if(quiet&&stateRef.current.pending)return;
   const serial=++sequence.current;controller.current?.abort();const abort=new AbortController();controller.current=abort;
   setState(previous=>({key,items:cursor&&previous.key===key?previous.items:quiet&&previous.key===key?previous.items:[],cursor:cursor??undefined,checked:quiet&&previous.key===key?previous.checked:false,pending:true}));
   try{
    const params=new URLSearchParams({kind:'activities',limit:'12',sourceFamily:record.family,sourceId:record.id,sourceRendition:record.rendition!,...learningSpaceParams(selection),...(record.synthetic?{includeSynthetic:'true'}:{}),...(sectionId?{sourceSection:sectionId}:{}),...(partId?{sourcePart:partId}:{}),...(cursor?{cursor}:{})});
    const response=await generationFetch(scope,'/api/activities/browse?'+params,{cache:'no-store',signal:abort.signal});
    const page=await response.json() as Page&{error?:string};if(!response.ok)throw Object.assign(Error(page.error??'Linked Activities could not be checked.'),{status:response.status});
    if(closed||serial!==sequence.current||live.current!==key)return;
    setState(previous=>({key,items:cursor&&previous.key===key?[...new Map([...previous.items,...page.items].map(item=>[item.record.id,item])).values()]:page.items,cursor:page.nextCursor,checked:true,pending:false}));
   }catch(error){
    if(closed||abort.signal.aborted||serial!==sequence.current||live.current!==key)return;
    const status=(error as {status?:number}).status;
    setState(previous=>retainContentAfterReadFailure(status,previous.key===key&&previous.checked)?{...previous,pending:false,error:'Could not refresh linked Activities. Retry to check changes.'}:{key,items:[],cursor:undefined,checked:false,pending:false,error:'Linked Activities are unavailable. Retry to check.'});
   }
  }
  void read();const refresh=()=>void read(undefined,true),unsubscribe=subscribeForeground(refresh);
  const change=()=>void read(undefined,true),sourceUnavailable=(event:Event)=>{if((event as CustomEvent<{ownerScope?:string}>).detail?.ownerScope===scope)void read();};
  window.addEventListener('minamo-learning-changed',change);window.addEventListener('minamo-source-unavailable',sourceUnavailable);
  // The next-page action is deliberately outside the effect; a key change discards its cursor.
  (requestRef.current as {read?:(cursor?:string)=>void}).read=cursor=>void read(cursor);
  return()=>{closed=true;sequence.current++;controller.current?.abort();unsubscribe();window.removeEventListener('minamo-learning-changed',change);window.removeEventListener('minamo-source-unavailable',sourceUnavailable);requestRef.current.read=undefined;};
 },[key]);
 const requestRef=useRef<{read?:(cursor?:string)=>void}>({});
 const current=state.key===key?state:{key,items:[],pending:true,checked:false},visible=current.items;
 if(!current.pending&&!current.error&&!current.cursor&&!visible.length)return null;
 return <section className="v2-source-activities" aria-label={'Activities for this '+label}>
  <h2>Activities for this {label}</h2>
  {visible.length>0?<SourceActivityItems items={visible} onNavigate={onNavigate}/>:current.pending?<p role="status">Checking linked Activities…</p>:null}
  {current.cursor&&<button type="button" className="v2-text-button" disabled={current.pending} onClick={()=>requestRef.current.read?.(current.cursor!)}>{current.pending?'Checking…':'Check older linked Activities'}</button>}
  {current.error&&<p role="status">{current.error} <button type="button" onClick={()=>requestRef.current.read?.()}>Retry</button></p>}
  {current.pending&&visible.length>0&&<small role="status">Refreshing linked Activities…</small>}
  {current.cursor&&!visible.length&&!current.pending&&<p>More saved Activities may be linked; the checked page is incomplete.</p>}
 </section>;
}
