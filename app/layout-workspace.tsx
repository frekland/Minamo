'use client';
import {taskInLearningSpace} from '../lib/ux-navigation';
import {learningSpaceKey,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {useEffect,useRef,useState,type RefObject} from 'react';
import type {WorkspaceRecord} from '../lib/contracts';
import type {NavigateReading,ReadingTarget} from './reader';
import type {RecentThinking} from './learning-activity';
import {exactTaskTarget} from '../lib/layout-gpt-intents';
import {generationFetch} from '../lib/workspace-generation';
import {emptyLayoutSession,layoutPositionKey,primaryTaskFromParams,putTask,readingPositionIdentity,readingPositions,rememberedResource,resourceKey,semanticReadingPosition,taskFromParams,taskKey,readingSupportsTask,validTaskRecord,resolveTaskRecord,reconcileReadingContext,type LayoutResource,type LayoutSession,type LayoutTask,type SemanticReadingPosition,type WorkspaceLayout} from '../lib/layout-workspace';
import './layout-workspace.css';

function visibleParts(main:HTMLElement){return [...main.querySelectorAll<HTMLElement>('.rn-reader [data-reading-part]')].filter(node=>node.getClientRects().length&&node.getBoundingClientRect().height>0);}
function caretAt(x:number,y:number):{node:Node;offset:number}|null{
 const documentWithCaret=document as Document&{caretPositionFromPoint?:(x:number,y:number)=>{offsetNode:Node;offset:number}|null;caretRangeFromPoint?:(x:number,y:number)=>Range|null};
 const position=documentWithCaret.caretPositionFromPoint?.(x,y);if(position)return {node:position.offsetNode,offset:position.offset};
 const range=documentWithCaret.caretRangeFromPoint?.(x,y);return range?{node:range.startContainer,offset:range.startOffset}:null;
}
/** Scope all lookup to the canonical interactive Reader; passive previews never own these positions. */
function capture(main:HTMLElement|null):SemanticReadingPosition|null{
 if(!main||!main.getClientRects().length)return null;const rect=main.getBoundingClientRect(),parts=visibleParts(main);
 const part=parts.find(node=>node.getBoundingClientRect().bottom>rect.top+12);if(!part?.dataset.readingPart||!part.dataset.sectionId)return null;
 const bounds=part.getBoundingClientRect(),anchor:SemanticReadingPosition={part:part.dataset.readingPart,section:part.dataset.sectionId,offset:bounds.top-rect.top,top:main.scrollTop};
 // Native caret hit-testing preserves a useful line inside a long prose/code part.
 // Offsets are UTF-16, as in canonical passage anchors; no reading text is stored.
 const caret=caretAt(Math.max(rect.left+12,bounds.left+4),Math.max(rect.top+12,bounds.top+2));
 if(caret&&part.contains(caret.node)){try{const range=document.createRange();range.selectNodeContents(part);range.setEnd(caret.node,caret.offset);const local=range.toString().length,start=Number(part.dataset.canonicalStart??0);const point=document.createRange();point.setStart(caret.node,caret.offset);point.collapse(true);const pointRect=point.getBoundingClientRect();if(Number.isFinite(start)&&pointRect.height>0){anchor.textOffset=start+local;anchor.offset=pointRect.top-rect.top;}}catch{/* Part/section restoration remains valid without native caret support. */}}
 return anchor;
}
function textPoint(container:HTMLElement,offset:number):{node:Text;offset:number}|null{
 const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);let node:Text|null;let remaining=offset;
 while((node=walker.nextNode() as Text|null)){if(remaining<=node.length){let at=remaining;if(at>0&&at<node.length&&/[\uD800-\uDBFF]/.test(node.data[at-1])&&/[\uDC00-\uDFFF]/.test(node.data[at]))at--;return {node,offset:at};}remaining-=node.length;}
 return null;
}
function restore(main:HTMLElement|null,anchor:SemanticReadingPosition|null){
 if(!main||!anchor||!main.getClientRects().length)return false;const parts=visibleParts(main).filter(node=>node.dataset.readingPart===anchor.part&&node.dataset.sectionId===anchor.section);let target=parts[0];if(!target)return false;
 let top=target.getBoundingClientRect().top;
 if(anchor.textOffset!==undefined){const offset=anchor.textOffset;target=parts.find(node=>{const start=Number(node.dataset.canonicalStart??0),end=Number(node.dataset.canonicalEnd??start+(node.textContent?.length??0));return offset>=start&&offset<=end})??target;const point=textPoint(target,offset-Number(target.dataset.canonicalStart??0));if(point){const range=document.createRange();range.setStart(point.node,point.offset);range.collapse(true);const rect=range.getBoundingClientRect();top=rect.height>0?rect.top:target.getBoundingClientRect().top;}else top=target.getBoundingClientRect().top;}
 main.scrollTo({top:main.scrollTop+top-main.getBoundingClientRect().top-anchor.offset,behavior:'instant'});return true;
}
type HistoryPosition={scope:string;resource:string;anchor:SemanticReadingPosition};
function historyPosition(scope:string,identity:string):SemanticReadingPosition|null{
 const saved=history.state?.minamoReadingPosition as HistoryPosition|undefined;return saved?.scope===scope&&saved.resource===identity?semanticReadingPosition(saved.anchor):null;
}
export function useLayoutWorkspace({enabled=true,active=true,learningSelection={learningSpace:'all'},scope,dataScope,records,current,stageId,readingTarget,mainRef,onNavigate}:{enabled?:boolean;active?:boolean;learningSelection?:LearningSpaceSelection;scope:string;dataScope:string;records:WorkspaceRecord[];current:WorkspaceRecord|null;stageId?:string;readingTarget?:ReadingTarget;mainRef:RefObject<HTMLElement|null>;onNavigate:NavigateReading}){
 const [session,setSession]=useState<LayoutSession>(emptyLayoutSession),[ready,setReady]=useState(false);
 const mode='classic' as WorkspaceLayout,rail='expanded' as const,focusTreatment='book' as const,error='';
 const selectionRef=useRef(learningSelection);selectionRef.current=learningSelection;const selectedScopeKey=learningSpaceKey(learningSelection);
 const sessionRef=useRef(session);sessionRef.current=session;
 const recordsRef=useRef(records);recordsRef.current=records;
 const positionScope=useRef(dataScope);
 const positions=useRef(new Map<string,SemanticReadingPosition>()),stopRestore=useRef<()=>void>(()=>{}),rememberTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),restoring=useRef(false),restorationAnchor=useRef<SemanticReadingPosition|null>(null);
 const activeRef=useRef(active);activeRef.current=active;
 const resource:LayoutResource|null=current?{family:current.family,id:current.id,rendition:current.rendition,...(stageId?{stageId}:{}),...(readingTarget?.sectionId?{sectionId:readingTarget.sectionId}:{}),...(readingTarget?.partId?{partId:readingTarget.partId}:{})}:null;
 const resourceIdentity=resource?resourceKey(resource):'',identity=resource?readingPositionIdentity(resource):'';
 const currentRef=useRef({resource,identity,readingTarget});currentRef.current={resource,identity,readingTarget};
 function rememberAnchor(key:string,anchor:SemanticReadingPosition){positions.current.delete(key);positions.current.set(key,anchor);if(positions.current.size>64)positions.current.delete(positions.current.keys().next().value!);try{sessionStorage.setItem(layoutPositionKey(dataScope),JSON.stringify([...positions.current].map(([resource,anchor])=>({resource,anchor}))));}catch{/* Same-tab positions still work with denied storage. */}}
 function capturePosition(){
  if(!enabled||positionScope.current!==dataScope||!activeRef.current||!currentRef.current.identity||restoring.current)return null;
  const anchor=capture(mainRef.current);if(!anchor)return null;rememberAnchor(currentRef.current.identity,anchor);
  try{history.replaceState({...history.state,minamoReadingPosition:{scope:dataScope,resource:currentRef.current.identity,anchor}},'',location.href);}catch{/* Browser history may be unavailable in restricted contexts. */}return anchor;
 }
 function scheduleRestore(anchor:SemanticReadingPosition){
  stopRestore.current();restoring.current=true;restorationAnchor.current=anchor;let frame=0,stopped=false,timer:ReturnType<typeof setTimeout>|undefined;const main=mainRef.current;
  const stop=()=>{if(stopped)return;stopped=true;restoring.current=false;restorationAnchor.current=null;cancelAnimationFrame(frame);if(timer)clearTimeout(timer);observer?.disconnect();main?.removeEventListener('load',queue,true);for(const event of ['wheel','touchstart','pointerdown','keydown'])main?.removeEventListener(event,stop,true);};
  const attempt=()=>{if(!stopped&&activeRef.current)restore(main,anchor);};
  const queue=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(attempt);};
  const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(queue);if(main){observer?.observe(main);const reader=main.querySelector('.rn-reader');if(reader)observer?.observe(reader);main.addEventListener('load',queue,true);for(const event of ['wheel','touchstart','pointerdown','keydown'])main.addEventListener(event,stop,{capture:true,passive:true});}
  // Allow React layout and delayed intrinsic image/diagram geometry to settle.
  frame=requestAnimationFrame(()=>{attempt();frame=requestAnimationFrame(attempt)});timer=setTimeout(stop,1500);stopRestore.current=stop;
 }
 function reflowPosition(){
  if(!enabled||!ready||!active||!identity)return;const anchor=restoring.current?restorationAnchor.current:capture(mainRef.current);if(anchor){rememberAnchor(identity,anchor);scheduleRestore(anchor);}
 }
 /** Called by Workspace's existing history-restoration effect before its numeric fallback. */
 function restorePosition(){
  if(!enabled||!ready||!active||!identity)return false;
  // Explicit section/passage/capture links belong to Reader, including reloads.
  if(readingTarget?.sectionId||readingTarget?.partId||readingTarget?.captureId||location.hash)return false;
  const anchor=historyPosition(dataScope,identity)??positions.current.get(identity);if(!anchor)return false;scheduleRestore(anchor);return true;
 }
 useEffect(()=>{if(!enabled)return;setReady(false);positions.current.clear();positionScope.current=dataScope;setSession(emptyLayoutSession());
  try{const raw=sessionStorage.getItem(layoutPositionKey(dataScope));if(raw&&raw.length<=150000)for(const item of readingPositions(JSON.parse(raw)))positions.current.set(item.resource,item.anchor)}catch{/* No session position promise when storage is disabled. */}
  const p=new URLSearchParams(location.search);if(current&&!p.has('id')&&!p.has('view')){p.set('view',current.family==='journey'?'journeys':current.family==='investigation'?'investigations':'library');p.set('family',current.family);p.set('id',current.id)}const initialTask=primaryTaskFromParams(p,current)??taskFromParams(p);setSession(old=>({...old,task:initialTask,pinned:!!initialTask&&p.get('taskPinned')==='1'}));putTask(p,initialTask);history.replaceState(history.state,'',location.pathname+(p.size?'?'+p:'')+location.hash);setReady(true);
  const pop=()=>{stopRestore.current();const p=new URLSearchParams(location.search),record=recordsRef.current.find(r=>r.family===p.get('family')&&r.id===p.get('id'));const task=primaryTaskFromParams(p,record)??taskFromParams(p);setSession(old=>({...old,task,pinned:!!task&&p.get('taskPinned')==='1',resources:taskKey(old.task)===taskKey(task)?old.resources:[]}));};

  const save=()=>capturePositionRef.current();window.addEventListener('popstate',pop);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',save);return()=>{stopRestore.current();clearTimeout(rememberTimer.current);window.removeEventListener('popstate',pop);window.removeEventListener('pagehide',save);document.removeEventListener('visibilitychange',save)};
  // URL is authoritative; no previous task or generation's local destination is restored.
 },[enabled,scope,dataScope]);
 const capturePositionRef=useRef(capturePosition);capturePositionRef.current=capturePosition;
 function decorate(params:URLSearchParams){
  if(!enabled)return;stopRestore.current();capturePosition();params.delete('taskClosed');const nextRecord=records.find(record=>record.family===params.get('family')&&record.id===params.get('id'));
  const targetIdentity=nextRecord??(params.get('family')&&params.get('id')?{family:params.get('family') as WorkspaceRecord['family'],id:params.get('id')!,rendition:params.get('rendition')??undefined,links:[]}:null);
  const primary=primaryTaskFromParams(params,nextRecord),candidate=primary??sessionRef.current.task,known=primary?nextRecord:taskRecord;
  const eligible=known?taskInLearningSpace(candidate,known,selectionRef.current):candidate;
  const nextTask=primary?eligible:sessionRef.current.pinned||readingSupportsTask(eligible,known,targetIdentity)?eligible:null;
  const pinned=!!nextTask&&!primary&&!!sessionRef.current.pinned;
  putTask(params,nextTask);if(pinned)params.set('taskPinned','1');else params.delete('taskPinned');
  sessionRef.current={...sessionRef.current,task:nextTask,pinned,...(taskKey(nextTask)!==taskKey(sessionRef.current.task)?{resources:[]}: {})};setSession(sessionRef.current);
 }
 useEffect(()=>{if(!enabled||!identity||!active)return;const node=mainRef.current;const remember=()=>{if(restoring.current)return;clearTimeout(rememberTimer.current);rememberTimer.current=setTimeout(()=>capturePositionRef.current(),150)};node?.addEventListener('scroll',remember,{passive:true});return()=>{node?.removeEventListener('scroll',remember);clearTimeout(rememberTimer.current)}},[enabled,identity,active]);
 useEffect(()=>{stopRestore.current();},[identity,dataScope]);
 useEffect(()=>{if(!active)stopRestore.current();},[active]);
 const task=session.task;
 const localTaskRecord=resolveTaskRecord(task,records,current);
 const [exactTask,setExactTask]=useState<{key:string;record:WorkspaceRecord}|null>(null),[taskReadState,setTaskReadState]=useState<{key:string;state:'loading'|'unavailable'}|null>(null),[thinking,setThinking]=useState<RecentThinking[]>([]),[nextAction,setNextAction]=useState(''),[directionKey,setDirectionKey]=useState(''),[savedDirectionState,setSavedDirectionState]=useState('');
 const exactTaskKey=JSON.stringify([dataScope,taskKey(task)]),taskRecord=localTaskRecord??(exactTask?.key===exactTaskKey?exactTask.record:null);const compatibleTask=taskInLearningSpace(task,taskRecord,learningSelection);
 useEffect(()=>{if(!enabled||!ready||!resource||!current)return;const params=new URLSearchParams(location.search);
  // A prior exact read can finish after a newer URL selection; it cannot own that transition.
  if(params.has('id')&&(params.get('id')!==current.id||params.get('family')!==current.family)||params.has('rendition')&&params.get('rendition')!==current.rendition)return;
  const primary=primaryTaskFromParams(params,current),resolved=primary?taskInLearningSpace(primary,current,selectionRef.current):null,old=sessionRef.current;
  const candidate=primary?resolved:old.task,known=resolveTaskRecord(candidate,recordsRef.current,current,taskRecord);
  const next=reconcileReadingContext(primary&&!resolved?{...old,task:null,pinned:false}:old,mode,resource,resolved,known,current);
  putTask(params,next.task);if(next.pinned)params.set('taskPinned','1');else params.delete('taskPinned');history.replaceState(history.state,'',location.pathname+(params.size?'?'+params:'')+location.hash);
  sessionRef.current=next;setSession(next);
 },[enabled,ready,resourceIdentity,taskKey(task),taskRecord?.rev]);
 useEffect(()=>{if(task&&(taskRecord&&(!compatibleTask||!validTaskRecord(task,taskRecord))||!taskRecord&&taskReadState?.key===exactTaskKey&&taskReadState.state==='unavailable'))clearTask();},[taskKey(task),taskRecord?.rev,selectedScopeKey,taskReadState?.key,taskReadState?.state]);
 useEffect(()=>{if(!enabled||!task)return;let disposed=false;const controller=new AbortController();setExactTask(null);setTaskReadState({key:exactTaskKey,state:'loading'});if(!localTaskRecord){generationFetch(dataScope,'/api/context?'+new URLSearchParams({family:task.family,id:task.id,...(task.rendition?{rendition:task.rendition}:{})}),{signal:controller.signal,cache:'no-store'}).then(async response=>{const value=await response.json() as {record?:WorkspaceRecord};if(!response.ok||value.record?.trashedAt||value.record?.family!==task.family||value.record?.id!==task.id||(task.rendition&&value.record?.rendition!==task.rendition)){if(!disposed)setTaskReadState({key:exactTaskKey,state:'unavailable'});return;}if(!disposed)setExactTask({key:exactTaskKey,record:value.record})}).catch(()=>{if(!disposed)setTaskReadState({key:exactTaskKey,state:'unavailable'})});}return()=>{disposed=true;controller.abort()};},[enabled,dataScope,exactTaskKey,localTaskRecord?.rev]);
 useEffect(()=>{
  setNextAction('');setThinking([]);setDirectionKey(exactTaskKey);
  if(!enabled||!task){setSavedDirectionState('Open an Investigation or exact Journey stage to see saved continuation.');return;}
  if(!taskRecord){setSavedDirectionState('Checking saved continuation…');return;}
  const target=exactTaskTarget(taskRecord,task.stageId);if(!target){setSavedDirectionState('Choose an exact stage to read saved continuation.');return;}
  let disposed=false,sequence=0,controller:AbortController|null=null,lastForeground=0;
  const run=()=>{controller?.abort();controller=new AbortController();const attempt=++sequence;setNextAction('');setDirectionKey(exactTaskKey);setSavedDirectionState('Checking saved continuation…');generationFetch(dataScope,'/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target),profile:'tutor'}),{signal:controller.signal,cache:'no-store'}).then(async response=>{const value=await response.json() as {resume?:{nextAction?:string};activity?:{items:RecentThinking[]}};if(!response.ok)throw Error();if(!disposed&&attempt===sequence){setThinking((value.activity?.items??[]).slice(0,2));setNextAction(typeof value.resume?.nextAction==='string'?value.resume.nextAction:'');setSavedDirectionState('No saved next action for this task.');}}).catch(()=>{if(!disposed&&attempt===sequence)setSavedDirectionState('Saved continuation unavailable; authored direction remains separate.');});};
  const foreground=()=>{if(document.visibilityState==='visible'&&Date.now()-lastForeground>15000){lastForeground=Date.now();run()}};
  run();window.addEventListener('minamo-learning-changed',run);window.addEventListener('focus',foreground);document.addEventListener('visibilitychange',foreground);
  return()=>{disposed=true;sequence++;controller?.abort();window.removeEventListener('minamo-learning-changed',run);window.removeEventListener('focus',foreground);document.removeEventListener('visibilitychange',foreground)};
 },[enabled,dataScope,exactTaskKey,taskRecord?.rev]);
 const remembered=rememberedResource(session,mode),canRestore=remembered&&resourceKey(remembered)!==resourceIdentity;
 const open=(r:LayoutResource)=>onNavigate(r.family==='journey'?'journeys':r.family==='investigation'?'investigations':r.family==='note'?'work':r.family==='source'?'sources':'library',r.id,{recordFamily:r.family,rendition:r.rendition,stageId:r.stageId,sectionId:r.sectionId,partId:r.partId});
 function clearTask(){const p=new URLSearchParams(location.search);putTask(p,null);p.delete('taskPinned');p.set('taskClosed','1');history.replaceState(history.state,'',location.pathname+(p.size?'?'+p:'')+location.hash);sessionRef.current={...sessionRef.current,task:null,pinned:false,resources:[]};setSession(sessionRef.current);}
 function togglePin(){const pinned=!sessionRef.current.pinned;const next=pinned||readingSupportsTask(task,taskRecord,current)?task:null;const p=new URLSearchParams(location.search);putTask(p,next);if(pinned&&next)p.set('taskPinned','1');else p.delete('taskPinned');history.replaceState(history.state,'',location.pathname+(p.size?'?'+p:'')+location.hash);sessionRef.current={...sessionRef.current,task:next,pinned:pinned&&!!next};setSession(sessionRef.current);}
 function selectLearningSpace(_selection:LearningSpaceSelection,params:URLSearchParams){const ended=!!sessionRef.current.task;putTask(params,null);params.delete('taskPinned');sessionRef.current={...sessionRef.current,task:null,pinned:false,resources:[]};setSession(sessionRef.current);return ended;}
 const visibleResource=(r:LayoutResource)=>learningSelection.learningSpace==='all'||records.some(record=>record.family===r.family&&record.id===r.id);
 return {clearTask,togglePin,pinned:!!session.pinned,supportsTask:readingSupportsTask(compatibleTask,taskRecord,current),selectLearningSpace,mode,session:{...session,resources:session.resources.filter(visibleResource)},task:compatibleTask,taskRecord:compatibleTask?taskRecord:null,thinking:directionKey===exactTaskKey?thinking:[],nextAction:directionKey===exactTaskKey?nextAction:'',savedDirectionState:!taskRecord&&taskReadState?.key===exactTaskKey&&taskReadState.state==='unavailable'?'Task context unavailable; no saved continuation is shown.':directionKey===exactTaskKey?savedDirectionState:'Checking saved continuation…',decorate,capturePosition,restorePosition,reflowPosition,ready,rail,focusTreatment,error,open,remembered:canRestore&&visibleResource(remembered)?remembered:null,closeResource:(r:LayoutResource)=>setSession(old=>({...old,resources:old.resources.filter(item=>resourceKey(item)!==resourceKey(r))}))};
}
export type LayoutController=ReturnType<typeof useLayoutWorkspace>;
