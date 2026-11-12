'use client';
import {useEffect,useMemo,useRef,useState,type MouseEvent,type ReactNode} from 'react';
import {ArrowRight,Link2,RefreshCw,X} from 'lucide-react';
import type {WorkspaceRecord} from '../lib/contracts';
import {subscribeForeground} from '../lib/foreground-session';
import {generationFetch} from '../lib/workspace-generation';
import {routeDestination} from '../lib/navigation-origin';
import {withExactProjectReturn,type ProjectReturnLocation} from '../lib/project-return-location';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import {matchingIncomingLocations,projectCitationLocation,relationDescription,relationTitle,relationKind} from '../lib/working-relation-presentation';
import {recordDisplayTitle,savedConnectionPreview,savedWorkCardPreview} from '../lib/record-display';
import {useLearningSpace} from './learning-space-ui';
import type {NavigateReading} from './reader';
import type {WorkingRead,WorkingRelation} from './working-context';
import type {EvidenceItem} from './continuity-sources';
import './project-connections.css';

function ConnectionsSheet({id,onClose,children}:{id:string;onClose:()=>void;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const previous=document.activeElement instanceof HTMLElement?document.activeElement:null,element=dialog.current;if(element&&!element.open)element.showModal();return()=>{if(element?.open)element.close();if(previous?.isConnected)previous.focus();};},[]);
 return <dialog ref={dialog} id={id} className="pc-connect-panel" aria-label="Saved connections" onCancel={event=>{event.preventDefault();onClose();}}><button className="pc-connect-close rn-subtle" type="button" aria-label="Close connections and return" onClick={onClose}><X size={18}/></button>{children}</dialog>;
}

type Result={key:string;loading:boolean;page?:WorkingRead;error?:string};
const label=(family:string)=>({journey:'Project',investigation:'Question',note:'Note',annotation:'Annotation',flag:'Bookmark',article:'Article',area:'Library topic',source:'Source',work:'Saved work',run:'Run result'} as Record<string,string>)[family]??'Saved source';
export const projectWriting=(items:EvidenceItem[])=>items.filter(item=>item.basis==='authored-writing'||item.basis==='bookmark');
export function projectLinks(relations:WorkingRelation[],projectId:string){
 const seen=new Set<string>();
 return relations.filter(item=>{
  if(item.to.family==='journey'&&item.to.id===projectId)return false;
  // An incoming citation and an outgoing citation may address the same
  // edition. They are different authored facts and must not collapse.
  const key=JSON.stringify([item.direction??'outgoing',item.to.family,item.to.id,item.to.rendition??null,item.destination,item.citedProject?.rendition??null,item.citedDestination??null,item.path?.[0]?.sectionId??null,item.path?.[0]?.partId??null]);
  if(seen.has(key))return false;
  seen.add(key);return true;
 });
}
export function readableProjectLinks(relations:WorkingRelation[],projectId:string,visibleWriting:EvidenceItem[]){
 return projectLinks(relations,projectId).filter(item=>item.direction!=='incoming'||!visibleWriting.some(entry=>entry.source.family===item.to.family&&entry.source.id===item.to.id&&entry.source.rev===item.to.rev));
}
/** Group only an admitted source's identity; never infer a relationship from
 * a shared title, or discard one of its independent edition citations. */
export function projectLinkGroups(relations:WorkingRelation[]){
 const groups:{family:string;id:string;title?:string;items:WorkingRelation[]}[]=[],byIdentity=new Map<string,typeof groups[number]>();
 for(const relation of relations){
  const key=JSON.stringify([relation.to.family,relation.to.id]);
  let group=byIdentity.get(key);
  if(!group){group={family:relation.to.family,id:relation.to.id,title:relation.title,items:[]};byIdentity.set(key,group);groups.push(group);}
  group.items.push(relation);
 }
 return groups;
}
const date=(value:string)=>Number.isFinite(Date.parse(value))?new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'';

/** The same owner-scoped read as GPT, surfaced only on request. Nothing about
 * opening this panel records a session, completion, intention or relationship. */
export default function ProjectConnections({record,records,scope,visibleLocation,onNavigate,exact=false}:{record:WorkspaceRecord;records:WorkspaceRecord[];scope:string;exact?:boolean;visibleLocation?:Omit<ProjectReturnLocation,'id'>|null;onNavigate?:NavigateReading}){
 const [open,setOpen]=useState(false),[epoch,setEpoch]=useState(0),[cursor,setCursor]=useState<string|undefined>(),[visibleCount,setVisibleCount]=useState(6),[state,setState]=useState<Result>({key:'',loading:false});
 const selection=useLearningSpace(),key=JSON.stringify([scope,record.family,record.id,record.rev,exact,selection]);
 useEffect(()=>{setCursor(undefined);setVisibleCount(6);},[key]);
 const current=state.key===key?state:{key,loading:open};
 useEffect(()=>{const changed=(event:Event)=>{const projectId=(event as CustomEvent<{projectId?:string}>).detail?.projectId;if(!projectId||projectId===record.id){setCursor(undefined);setEpoch(n=>n+1);}};const foreground=subscribeForeground(()=>changed(new Event('foreground')));const events=['minamo-collaboration-changed','minamo-record-committed','minamo-source-unavailable'];events.forEach(name=>window.addEventListener(name,changed));return()=>{foreground();events.forEach(name=>window.removeEventListener(name,changed));};},[record.id]);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();
  setState(previous=>cursor&&previous.key===key?{...previous,loading:true}:{key,loading:true});
  const params=new URLSearchParams({scope:'working',limit:'8',...(record.family==='journey'&&!exact?{focus:JSON.stringify({family:'journey',id:record.id})}:{}),selectedRefs:JSON.stringify([{family:record.family,id:record.id,...(exact?{rendition:record.rendition}:{})}]),...(cursor?{cursor}:{})});
  generationFetch(scope,'/api/learning-context?'+params,{cache:'no-store',signal:controller.signal})
   .then(async response=>{const result=await response.json() as WorkingRead&{error?:string};if(!response.ok||result.contract!=='minamo.working-context.v1')throw Error(result.error??'Connected work could not be read.');return result;})
   .then(page=>{if(!controller.signal.aborted)setState(previous=>({key,loading:false,page:cursor&&previous.key===key&&previous.page?{...page,relations:[...previous.page.relations,...page.relations]}:page}));})
   .catch(error=>{if(!controller.signal.aborted)setState({key,loading:false,error:error instanceof Error?error.message:'Connected work is unavailable.'});});
  return()=>controller.abort();
 },[open,key,epoch,scope,record.id,record.family,exact,cursor]);
 const titleById=useMemo(()=>new Map(records.map(item=>[item.family+':'+item.id,item.title])),[records]);
 const entries=current.page&&record.family==='journey'&&!exact?projectWriting(current.page.evidence.items):[],shownEntries=entries.slice(0,visibleCount);
 // Only a Note actually displayed in this bounded writing list suppresses its
 // duplicate incoming citation. A different retained edition remains visible.
 const links=current.page?readableProjectLinks(current.page.relations,record.id,shownEntries):[];
 const groupedLinks=projectLinkGroups(links),visibleGroups=groupedLinks.slice(0,visibleCount);
 const navigate=(event:MouseEvent<HTMLAnchorElement>,href:string)=>{
  if(!onNavigate||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  const target=routeDestination(href);if(!target)return;
  event.preventDefault();setOpen(false);onNavigate(target.view,target.id,target.target);
 };
 const href=(value?:string)=>value&&routeDestination(value)?learningSpaceHref(record.family==='journey'?withExactProjectReturn(value,{id:record.id,rendition:record.rendition,...(visibleLocation?.rendition===record.rendition?visibleLocation:{})}):value,selection):undefined;
 return <div className="pc-connect">
  <button type="button" className="pc-connect-toggle" aria-expanded={open} aria-controls={'pc-connect-'+record.id} onClick={()=>setOpen(v=>!v)} title="Connected work and sources"><Link2 size={16}/><span>Connections</span></button>
  {open&&<ConnectionsSheet id={'pc-connect-'+record.id} onClose={()=>setOpen(false)}>
   <div className="pc-connect-heading"><div><h2>Connected work</h2><p>Notes and saved sources, including references to older editions.</p></div><button type="button" className="rn-subtle" disabled={current.loading} onClick={()=>{setCursor(undefined);setEpoch(value=>value+1)}} aria-label="Refresh saved connections" title="Refresh"><RefreshCw size={16}/></button></div>
   {current.loading&&<p role="status" className="pc-connect-status">Checking saved connections…</p>}
   {current.error&&<p role="alert" className="pc-connect-status">{current.error} <button type="button" onClick={()=>{setCursor(undefined);setEpoch(value=>value+1)}}>Retry</button></p>}
   {current.page&&(entries.length||links.length?<div className="pc-connect-groups" data-single={!entries.length||!links.length}>
    {!!entries.length&&<div><h3>Writing connected here</h3><ul>{shownEntries.map((item,index)=>{const target=href(item.destination),citations=matchingIncomingLocations(current.page!.relations,item.source.family,item.source.id,item.source.rev,record.id),displayTitle=recordDisplayTitle(item.title,item.synthetic),preview=item.source.family==='note'&&item.synthetic?savedWorkCardPreview(item.preview.text,true):savedConnectionPreview(item.preview.text);return <li key={item.source.family+':'+item.source.id+':'+item.source.rev+':'+index}><small>{label(item.source.family)} · r{item.source.rev} · {date(item.at)}{citations.length>0&&<> · <span className="pc-connect-citation">{citations.length} saved {citations.length===1?'reference':'references'}</span></>}</small>{target?<a href={target} onClick={event=>navigate(event,target)}>{displayTitle}<ArrowRight size={14}/></a>:<strong>{displayTitle} · Original unavailable</strong>}{preview&&<p>{preview}</p>}{citations.length>0&&<details className="pc-connect-proof"><summary>References to this Project ({citations.length})</summary><ul className="pc-connect-page-pins" aria-label={`Exact Project references from ${displayTitle}`}>{citations.map((citation,i)=>{const original=href(citation.citedDestination),name=projectCitationLocation(citation,record.id);return <li key={citation.citedDestination??i}>{original?<a href={original} onClick={event=>navigate(event,original)}>{name}<ArrowRight size={12}/></a>:<span>{name} · Unavailable</span>}</li>;})}</ul></details>}</li>;})}</ul>{entries.length>visibleCount&&<button type="button" className="rn-subtle" onClick={()=>setVisibleCount(n=>n+6)}>Show more writing</button>}{current.page.evidence.coverage.moreAvailable&&<small>Older connected work may be available in Your work.</small>}</div>}
    {!!links.length&&<div><h3>Other connected sources</h3><ul>{visibleGroups.map(group=>{const title=recordDisplayTitle(relationTitle(group.items[0],group.title??titleById.get(group.family+':'+group.id)),group.items[0].synthetic??false);return <li key={group.family+':'+group.id} className="pc-connect-source"><small>{label(group.family)}{group.items.length>1?' · '+group.items.length+' saved references':''}</small><a className="pc-connect-source-title" href={href(group.items[0].destination)} onClick={event=>{const target=href(group.items[0].destination);if(target)navigate(event,target);}}>{title}<ArrowRight size={14}/></a><details className="pc-connect-proof"><summary>Saved references{group.items.length>1?` (${group.items.length})`:""}</summary><ul className="pc-connect-editions">{group.items.map((item,index)=>{const target=href(item.destination),latest=href(item.newerEdition?.destination),cited=item.direction==='incoming'&&item.citedTarget?.family!=='journey'?href(item.citedDestination):undefined,alreadyListed=item.newerEdition&&group.items.some(other=>other!==item&&other.to.rendition===item.newerEdition?.source.rendition);return <li key={index}><small>{item.direction==='incoming'?'Incoming':'Outgoing'}</small>{target?<a href={target} onClick={event=>navigate(event,target)}>{relationDescription(item,record.id)}<ArrowRight size={14}/></a>:<span>Original unavailable</span>}{cited&&<a className="pc-connect-latest" href={cited} onClick={event=>navigate(event,cited)}>Open cited {relationKind(item.citedTarget!.family)} · r{item.citedTarget!.rev}<ArrowRight size={12}/></a>}{latest&&!alreadyListed&&<a className="pc-connect-latest" href={latest} onClick={event=>navigate(event,latest)}>Open newer edition · r{item.newerEdition!.source.rev}<ArrowRight size={12}/></a>}</li>;})}</ul>{group.items.some(item=>item.reason)&&<details className="pc-connect-proof"><summary>Why linked</summary>{group.items.map((item,index)=><p key={index}><strong>{item.direction==='incoming'?'Incoming':'Outgoing'}:</strong> {item.reason}</p>)}</details>}</details></li>;})}</ul>{groupedLinks.length>visibleCount&&<button type="button" className="rn-subtle" onClick={()=>setVisibleCount(n=>n+6)}>Show more connections</button>}</div>}
   </div>:<p className="pc-connect-empty-single">{current.page.collaboration?.effective.relatedMaterial==='none'?'Saved links are hidden by your GPT & context preference. No linked writing appeared in this read.':'No linked Notes or sources appeared in this read.'}</p>)}
   {current.page?.coverage.relationships?.nextCursor&&<button type="button" className="rn-subtle" disabled={current.loading} onClick={()=>{setVisibleCount(n=>n+12);setCursor(current.page!.coverage.relationships!.nextCursor)}}>Load more saved connections</button>}
   {current.page&&!current.page.coverage.completeWithinScope&&<p className="pc-connect-caveat">This is a partial view. Some sources or older links may not be included.</p>}
   {current.page&&record.family==='journey'&&<a className="pc-connect-work-link" href={learningSpaceHref('/?view=work&context=journey%3A'+encodeURIComponent(record.id),selection)}>Find connected writing in Your Work <ArrowRight size={13}/></a>}
  </ConnectionsSheet>}
 </div>;
}
