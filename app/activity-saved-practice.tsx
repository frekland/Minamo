'use client';
import {subscribeForeground,retainContentAfterReadFailure} from '../lib/foreground-session';
import {useEffect,useRef,useState} from 'react';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ActivityCartridge} from '../lib/activity/schema';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref,learningSpaceKey,learningSpaceParams} from '../lib/learning-space-navigation';
import {matchesLearningScope} from '../lib/learning-spaces';
import {generationFetch} from '../lib/workspace-generation';
import type {ActivityReadingTarget} from './activity-studio';

type SavedPracticeItem={record:WorkspaceRecord;activityTitle?:string;dueReviewCount?:number;pendingReviewCount?:number;nextReviewAt?:string};
type SavedPracticePage={generation?:string;items:SavedPracticeItem[];nextCursor?:string|null};
type Navigate=(target:ActivityReadingTarget)=>void;
export function savedPracticeHref(record:WorkspaceRecord){return '/?'+new URLSearchParams({view:'work',family:record.family,id:record.id,...(record.rendition?{rendition:record.rendition}:{})});}
function follow(event:React.MouseEvent<HTMLAnchorElement>,record:WorkspaceRecord,onOpenReading?:Navigate){if(!onOpenReading||!record.rendition||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpenReading({family:record.family,id:record.id,rendition:record.rendition});}

/** Saved answers remain separate records and keep the exact Activity edition they used. */
export function savedPracticeCardTitle(record:WorkspaceRecord,activity:ActivityCartridge){
 const responses=record.attempt?.practice?.responses??[],ids=new Set(responses.map(response=>response.itemId));
 const prompts=activity.blocks.flatMap(block=>block.kind==='practice'&&ids.has(block.exercise.id)?[block.exercise.prompt]:[]);
 if(prompts.length===1)return prompts[0];
 if(responses.length)return prompts.length>1?'Answers to '+prompts.length+' questions':'Saved answers';
 return record.attempt?.practice?.interactions?.length?'Saved exploration and reflection':'Saved reflection and next step';
}
export function SavedPracticeCard({item,activity,edition,onOpenReading}:{item:SavedPracticeItem;activity:ActivityCartridge;edition:string;onOpenReading?:Navigate}){
 const selection=useLearningSpace();
 const {record}=item,attempt=record.attempt;if(!attempt)return null;const responses=attempt.practice?.responses??[],retained=attempt.activity.rendition!==edition;
 const title=retained?(responses.length?'Saved answers from an earlier edition':'Saved exploration from an earlier edition'):savedPracticeCardTitle(record,activity);
 return <article className="as-saved-practice-card"><div className="as-saved-practice-heading"><h4>{title}</h4><span>{responses.length?responses.length+' saved answer revision'+(responses.length===1?'':'s'):'Reflection / exploration'}</span></div>
  <p className="as-muted">{retained?'Earlier Activity edition · exact source retained':'This Activity edition'}{record.synthetic?' · Test only':''}</p>
  {!!item.pendingReviewCount&&<p>{item.pendingReviewCount} answer{item.pendingReviewCount===1?' is':'s are'} awaiting selected feedback.</p>}
  {!!item.dueReviewCount&&<p>{item.dueReviewCount} optional correction review{item.dueReviewCount===1?' is':'s are'} due.</p>}
  {!item.dueReviewCount&&item.nextReviewAt&&<p className="as-muted">Next optional review: {new Date(item.nextReviewAt).toLocaleString()}</p>}
  <div className="as-actions"><a href={learningSpaceHref(savedPracticeHref(record),selection)} onClick={event=>follow(event,record,onOpenReading)}>{responses.length?'Open saved answers and feedback':'Open saved exploration'}</a><a href={learningSpaceHref('/?'+new URLSearchParams({view:'tools',family:'experiment',id:attempt.activity.id,rendition:attempt.activity.rendition}),selection)} onClick={event=>{if(!onOpenReading||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();onOpenReading({family:'experiment',id:attempt.activity.id,rendition:attempt.activity.rendition});}}>Open its exact Activity source</a></div>
 </article>;
}

export default function ActivitySavedPractice({scope,record,activity,onOpenReading}:{scope:string;record:WorkspaceRecord;activity:ActivityCartridge;onOpenReading?:Navigate}){
 const selection=useLearningSpace(),learningKey=learningSpaceKey(selection);
 const [items,setItems]=useState<SavedPracticeItem[]>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[allEditions,setAllEditions]=useState(false),[epoch,setEpoch]=useState(0);
 const admittedKey=useRef(''),sequence=useRef(0),abort=useRef<AbortController|null>(null);
 async function load(next?:string){const serial=++sequence.current;abort.current?.abort();const controller=new AbortController();abort.current=controller;setLoading(true);setError('');let status:number|undefined;try{
  const params=new URLSearchParams({kind:'attempts',activityId:record.id,limit:'20',...learningSpaceParams(selection)});if(!allEditions&&record.rendition)params.set('activityRendition',record.rendition);if(record.synthetic)params.set('includeSynthetic','true');if(next)params.set('cursor',next);
  const response=await generationFetch(scope,'/api/activities/browse?'+params,{cache:'no-store',signal:controller.signal}),value=await response.json() as SavedPracticePage&{error?:string;message?:string};status=response.status;if(!response.ok)throw Error(value.message??value.error??'Saved answers could not be read.');if(serial!==sequence.current)return;
  const eligible=(value.items??[]).filter(item=>item.record?.attempt?.activity.id===record.id&&matchesLearningScope(item.record,selection)&&(allEditions||item.record.attempt.activity.rendition===record.rendition));
  setItems(previous=>[...new Map([...(next?previous:[]),...eligible].map(item=>[item.record.family+':'+item.record.id,item])).values()]);setCursor(value.nextCursor??null);
 }catch(cause){if(!controller.signal.aborted&&serial===sequence.current){if(!retainContentAfterReadFailure(status,true))setItems([]);setError(cause instanceof Error?cause.message:'Saved answers could not be read.');}}finally{if(serial===sequence.current)setLoading(false);}}
 useEffect(()=>{const key=JSON.stringify([scope,record.id,record.rendition,allEditions,learningKey]);if(admittedKey.current!==key){admittedKey.current=key;setItems([]);setCursor(null);}void load();return()=>{sequence.current++;abort.current?.abort();};},[scope,record.id,record.rendition,allEditions,epoch,learningKey]);
 useEffect(()=>{const refresh=()=>setEpoch(value=>value+1),unsubscribe=subscribeForeground(refresh);window.addEventListener('minamo-learning-changed',refresh);return()=>{unsubscribe();window.removeEventListener('minamo-learning-changed',refresh);};},[]);
 return <section className="as-saved-practice" aria-label="Saved answers for this Activity"><div className="as-section-heading"><div><h3>Saved answers and feedback</h3><p className="as-muted">Open a saved answer for its history and feedback.</p></div><button type="button" disabled={loading} onClick={()=>setEpoch(value=>value+1)}>Refresh saved answers</button></div>
  <label className="as-edition-choice"><input type="checkbox" checked={allEditions} onChange={event=>setAllEditions(event.target.checked)}/>Include earlier Activity editions</label>
  {items.map(item=><SavedPracticeCard key={item.record.family+':'+item.record.id} item={item} activity={activity} edition={record.rendition??''} onOpenReading={onOpenReading}/>)}
  {loading&&<p role="status">Reading saved answers…</p>}{error&&<p role="alert">{error} <button type="button" onClick={()=>void load()}>Retry saved answers</button></p>}
  {!loading&&!error&&!items.length&&!cursor&&<p>No answers saved for {allEditions?'this Activity':'this edition'} yet. Use <strong>Save answer</strong> on a question when you want to keep it.</p>}
  {!!cursor&&<button type="button" disabled={loading} onClick={()=>void load(cursor)}>{loading?'Reading…':items.length?'More saved answers':'Continue looking for saved answers'}</button>}
 </section>;
}
