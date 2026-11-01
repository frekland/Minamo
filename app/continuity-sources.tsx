"use client";
import {useEffect,useRef,useState,type MouseEvent} from 'react';
import {ArrowRight,RefreshCw} from 'lucide-react';
import {generationFetch,WorkspaceGenerationChanged} from '../lib/workspace-generation';
import {routeDestination} from '../lib/navigation-origin';
import {subscribeForeground} from '../lib/foreground-session';
import {learningSpaceHref,learningSpaceKey,learningSpaceParams,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {useLearningSpace} from './learning-space-ui';
import ContinuityGptHandoff from './continuity-gpt-handoff';
import './continuity-sources.css';

export type EvidenceFocus={family:'journey'|'investigation';id:string};
export type EvidenceItem={title:string;source:{family:string;id:string;rev:number;rendition?:string};author:string;at:string;destination?:string;basis:'authored-writing'|'saved-checkpoint'|'supplied-attempt'|'bookmark';preview:{text:string;complete:boolean};paths:unknown[];checkpoint?:{id:string;status:'active'|'superseded'|'withdrawn'|'unavailable';nextAction?:string};detailsDeferred:boolean};
export type EvidencePage={contract:'minamo.continuity-evidence.v1';asOf:string;generation?:string;snapshotVersion?:number;items:EvidenceItem[];coverage:{completeWithinScope:boolean;moreAvailable:boolean;nextCursor?:string;moreTargetsAvailable?:boolean;targetNextCursor?:string;gaps:string[];notice:string}};
export type EvidenceRead={key:string;loading:boolean;page?:EvidencePage;error?:string;stale?:boolean};

const hardReadError=(error:unknown)=>error instanceof WorkspaceGenerationChanged||[401,403,404,409].includes((error as {status?:number})?.status??0);
/** Only previously admitted same-scope receipts survive an ambiguous transport failure. */
export function failedEvidenceRead(previous:EvidenceRead,key:string,error:unknown):EvidenceRead{
 return {key,loading:false,error:error instanceof Error?error.message:'Recorded sources unavailable.',...(!hardReadError(error)&&previous.key===key&&previous.page?{page:previous.page,stale:true}:{})};
}
function sourceReadError(response:Response,value:{error?:{message?:string}|string},fallback:string){
 const error=new Error(typeof value.error==='string'?value.error:value.error?.message??fallback) as Error&{status:number};error.status=response.status;return error;
}
async function checkedEvidenceResponse(response:Response,fallback:string):Promise<EvidencePage>{
 const value=await response.json().catch(()=>{throw sourceReadError(response,{},fallback);}) as EvidencePage&{error?:{message?:string}|string};
 if(!response.ok||value.contract!=='minamo.continuity-evidence.v1')throw sourceReadError(response,value,fallback);
 return value;
}

/** Fail closed on a changed owner, scope or focus; partial first pages are not empty evidence. */
export function currentEvidenceRead(read:EvidenceRead,key:string,serverReads:boolean):EvidenceRead{
 return !serverReads?{key,loading:false}:read.key===key?read:{key,loading:true};
}
export function evidenceItemHref(item:EvidenceItem,selection:LearningSpaceSelection){
 return item.destination&&routeDestination(item.destination)?learningSpaceHref(item.destination,selection):undefined;
}
const kind=(item:EvidenceItem)=>item.basis==='saved-checkpoint'?'Saved checkpoint':item.basis==='bookmark'?'Bookmark':item.basis==='supplied-attempt'?'Supplied run':item.source.family==='annotation'?'Annotation':item.source.family==='note'?'Note':'Saved writing';
const safeDate=(at:string)=>Number.isFinite(Date.parse(at))?new Date(at).toLocaleString('en-GB'):'Recorded date unavailable';
export function ContinuitySourcesView({read,selection,focus,title,emptyText,onOpen,onRefresh,onMore,onMoreTargets}:{read:EvidenceRead;selection:LearningSpaceSelection;focus?:EvidenceFocus;title:string;emptyText:string;onOpen?:(event:MouseEvent<HTMLAnchorElement>,href:string)=>void;onRefresh:()=>void;onMore:()=>void;onMoreTargets?:()=>void}){
 const {page,loading,error}=read,items=page?.items??[];
 return <section className="continuity-sources" aria-label={title}>
  <div className="continuity-sources-head"><h2>{title}</h2><button type="button" className="v2-icon" onClick={onRefresh} disabled={loading} aria-label={'Refresh '+title}><RefreshCw size={16}/></button></div>
  <p className="continuity-sources-intro">Recorded sources, newest first. Open one to decide what matters now; saved intentions are not instructions or proof of completion.</p>
  {loading&&!page&&<p role="status">Checking recorded sources…</p>}
  {page&&read.stale&&<p className="continuity-sources-coverage" role="status">Previously checked sources are shown while a new read is pending or unavailable. Verify them before relying on current access or ordering.</p>}
  {error&&<p role="alert">{error} <button type="button" className="v2-text-button" onClick={onRefresh}>Restart evidence read</button></p>}
  {page&&<>
   {items.length>0?<ol className="continuity-sources-list">{items.map(item=>{const href=evidenceItemHref(item,selection),status=item.checkpoint?.status,sourceLabel=kind(item);return <li key={`${item.basis}:${item.checkpoint?.id??item.source.family+':'+item.source.id}`}>
    <div className="continuity-source-meta"><span>{sourceLabel}</span><time dateTime={item.at}>{safeDate(item.at)}</time>{status&&status!=='active'&&<span>{status==='unavailable'?'Original edition unavailable':status==='superseded'?'Superseded':'Withdrawn'}</span>}</div>
    {href?<a className="continuity-source-link" href={href} onClick={event=>onOpen?.(event,href)}><strong>{item.title}</strong><ArrowRight size={15} aria-hidden="true"/></a>:<strong>{item.title} · Cannot open original</strong>}
    {item.preview.text&&<p className="continuity-source-excerpt">{item.preview.text}</p>}
    {item.checkpoint?.status==='active'&&item.checkpoint.nextAction&&<p className="continuity-source-intention"><strong>Intention recorded then:</strong> {item.checkpoint.nextAction}</p>}
    {(item.detailsDeferred||!item.preview.complete)&&<small>Only a short source excerpt is shown. Open the original for detail.</small>}
   </li>})}</ol>:!loading&&<p className="v2-muted">{page.coverage.moreAvailable?'No matching sources on this bounded page; later pages may contain relevant work.':emptyText}</p>}
   {page.coverage.moreAvailable&&<button type="button" className="v2-secondary" onClick={onMore} disabled={loading}>{loading?'Checking more…':'Check more recorded sources'}</button>}
   {page.coverage.moreTargetsAvailable&&!page.coverage.moreAvailable&&<button type="button" className="v2-secondary" onClick={onMoreTargets} disabled={loading}>Check more linked tasks</button>}
   <p className="continuity-sources-coverage" role="status">{page.coverage.moreAvailable||page.coverage.moreTargetsAvailable||!page.coverage.completeWithinScope?'This view is partial; more relevant work may exist. ':'This declared scan has no further eligible records. '}External work, unsaved drafts and what GPT last saw remain unknown.</p>
   {!loading&&!error&&<ContinuityGptHandoff page={page} selection={selection} focus={focus}/>}
  </>}
 </section>;
}

/** The UI and its fallback both consume this single owner/focus-fenced read. */
export function useContinuityEvidence({scope,serverReads,focus}:{scope:string;serverReads:boolean;focus?:EvidenceFocus}){
 const selection=useLearningSpace(),selectionKey=learningSpaceKey(selection),focusKey=focus?focus.family+':'+focus.id:'',key=JSON.stringify([scope,selectionKey,focusKey]);
 const [read,setRead]=useState<EvidenceRead>({key:'',loading:serverReads}),[epoch,setEpoch]=useState(0),[next,setNext]=useState<string|null>(null),[targetWindow,setTargetWindow]=useState<{key:string;cursor:string}|null>(null);
 const focusCursor=targetWindow?.key===key?targetWindow.cursor:undefined;
 const liveKey=useRef(key),sequence=useRef(0);liveKey.current=key;
 const current=currentEvidenceRead(read,key,serverReads);
 const refresh=()=>{setNext(null);setTargetWindow(null);setEpoch(n=>n+1);};
 useEffect(()=>{const changed=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string}>).detail;if(detail?.ownerScope===scope)refresh();};const foreground=subscribeForeground(refresh);window.addEventListener('minamo-learning-changed',changed);window.addEventListener('minamo-record-committed',changed);window.addEventListener('minamo-source-unavailable',changed);return()=>{foreground();window.removeEventListener('minamo-learning-changed',changed);window.removeEventListener('minamo-record-committed',changed);window.removeEventListener('minamo-source-unavailable',changed);};},[scope]);
 useEffect(()=>{const run=++sequence.current;if(!serverReads){setRead({key,loading:false});return;}const controller=new AbortController();setRead(previous=>previous.key===key&&previous.page?{...previous,loading:true,stale:true,error:undefined}:{key,loading:true});setNext(null);
  const params=new URLSearchParams({scope:'evidence',limit:'8',...learningSpaceParams(selection),...(focus?{focus:JSON.stringify(focus)}:{}),...(focusCursor?{focusCursor}:{})});
  generationFetch(scope,'/api/learning-context?'+params,{cache:'no-store',signal:controller.signal}).then(async response=>{const value=await checkedEvidenceResponse(response,'Recorded sources could not be checked.');if(!controller.signal.aborted&&liveKey.current===key&&run===sequence.current)setRead({key,loading:false,page:value});}).catch(error=>{if(!controller.signal.aborted&&liveKey.current===key&&run===sequence.current)setRead(previous=>failedEvidenceRead(previous,key,error));});return()=>{controller.abort();sequence.current++;};
 },[scope,key,serverReads,epoch,focusCursor]);
 async function more(){const cursor=current.page?.coverage.nextCursor;if(!cursor||current.loading||next===cursor)return;const run=++sequence.current;setNext(cursor);setRead({...current,loading:true,error:undefined});try{const params=new URLSearchParams({scope:'evidence',limit:'8',cursor,...learningSpaceParams(selection),...(focus?{focus:JSON.stringify(focus)}:{}),...(focusCursor?{focusCursor}:{})});const response=await generationFetch(scope,'/api/learning-context?'+params,{cache:'no-store'}),value=await checkedEvidenceResponse(response,'Recorded sources changed; restart this read.');if(liveKey.current!==key||sequence.current!==run)return;setRead({key,loading:false,page:{...value,items:[...current.page!.items,...value.items]}});}catch(error){if(liveKey.current===key&&sequence.current===run)setRead(failedEvidenceRead(current,key,error));}finally{setNext(null);}}
 function moreTargets(){const cursor=current.page?.coverage.targetNextCursor;if(!cursor||current.loading||current.page?.coverage.moreAvailable)return;setTargetWindow({key,cursor});}
 return {read:current,selection,refresh,more,moreTargets};
}
export default function ContinuitySources({scope,serverReads,focus,title,emptyText,onOpen}:{scope:string;serverReads:boolean;focus?:EvidenceFocus;title:string;emptyText:string;onOpen?:(event:MouseEvent<HTMLAnchorElement>,href:string)=>void}){
 const evidence=useContinuityEvidence({scope,serverReads,focus});
 return <ContinuitySourcesView read={evidence.read} selection={evidence.selection} focus={focus} title={title} emptyText={emptyText} onOpen={onOpen} onRefresh={evidence.refresh} onMore={()=>void evidence.more()} onMoreTargets={evidence.moreTargets}/>;
}
