"use client";
import {useEffect,useRef,useState} from 'react';
import type {ProjectOutline,ProjectResources} from '../lib/project-contracts';
import {generationFetch} from '../lib/workspace-generation';
import {learningSpaceParams} from '../lib/learning-space-navigation';
import {useLearningSpace} from './learning-space-ui';

function mergeProvenance<T extends {provenance:unknown[]}>(previous:T,next:T):T{return {...next,provenance:[...new Map([...previous.provenance,...next.provenance].map(item=>[JSON.stringify(item),item])).values()]};}
export function mergeProjectOutline(previous:ProjectOutline,next:ProjectOutline):ProjectOutline{
 if(previous.project.id!==next.project.id||previous.project.rev!==next.project.rev||previous.generation!==next.generation)throw Error('Project links changed. Refresh the project.');
 const questions=(a:ProjectOutline['projectQuestions'],b:ProjectOutline['projectQuestions'])=>{const result=new Map(a.map(item=>[item.id,item]));for(const item of b){const prior=result.get(item.id);result.set(item.id,prior?mergeProvenance(prior,item):item);}return [...result.values()];};
 const steps=next.steps.map(step=>({...step,questions:questions(previous.steps.find(item=>item.stageId===step.stageId)?.questions??[],step.questions)})),precise=new Set(steps.flatMap(step=>step.questions.map(question=>question.id)));
 return {...next,steps,projectQuestions:questions(previous.projectQuestions,next.projectQuestions).filter(question=>!precise.has(question.id))};
}
export function mergeProjectResources(previous:ProjectResources,next:ProjectResources):ProjectResources{
 if(previous.project.id!==next.project.id||previous.project.rev!==next.project.rev||previous.generation!==next.generation)throw Error('Project links changed. Reopen resources.');
 const resources=new Map(previous.resources.map(item=>[item.destination,item]));for(const item of next.resources){const prior=resources.get(item.destination);resources.set(item.destination,prior?mergeProvenance(prior,item):item);}return {...next,resources:[...resources.values()]};
}

/** Each read is scoped to the mounted principal, generation, language and current record. */
export function useProjectContext<T extends ProjectOutline|ProjectResources>({scope,projectId,revision,mode,enabled=true}:{scope:string;projectId:string;revision:number;mode:'outline'|'resources';enabled?:boolean}){
 const selection=useLearningSpace(),key=JSON.stringify([scope,projectId,revision,selection,mode]),liveKey=useRef(key);liveKey.current=key;
 const [state,setState]=useState<{key:string;data?:T;loading:boolean;error?:string}>({key,loading:enabled}),[retry,setRetry]=useState(0),flight=useRef(0),controller=useRef<AbortController|null>(null);
 const current=state.key===key?state:{key,loading:enabled};
 async function read(cursor?:string,retain=false){
  const attempt=++flight.current;controller.current?.abort();const signal=new AbortController();controller.current=signal;
  setState(old=>({...((old.key===key&&(cursor||retain))?old:{key}),loading:true,error:undefined}));
  try{
   const params=new URLSearchParams({mode,projectId,...learningSpaceParams(selection),...(cursor?{cursor}:{})});
   const response=await generationFetch(scope,'/api/project-context?'+params,{cache:'no-store',signal:signal.signal}),data=await response.json() as T&{error?:string};
   if(!response.ok)throw Error(data.error??'Project links could not be read.');
   if(signal.signal.aborted||liveKey.current!==key||flight.current!==attempt)return;
   setState(old=>{if(cursor&&old.key===key&&old.data){try{return {key,data:(mode==='outline'?mergeProjectOutline(old.data as ProjectOutline,data as ProjectOutline):mergeProjectResources(old.data as ProjectResources,data as ProjectResources)) as T,loading:false};}catch(error){return {key,loading:false,error:(error as Error).message};}}return {key,data,loading:false};});
  }catch(error){if(!signal.signal.aborted&&liveKey.current===key&&flight.current===attempt)setState(old=>({...((old.key===key&&cursor)?old:{key}),loading:false,error:error instanceof Error?error.message:'Project links could not be read.'}));}
 }
 useEffect(()=>{
  if(!enabled)return;void read();
  const invalidate=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string}>).detail;if(detail?.ownerScope&&detail.ownerScope!==scope)return;void read();};
  const changed=()=>void read(undefined,true);
  const committed=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string;command?:{family?:string;id?:string}}>).detail;if(detail?.ownerScope&&detail.ownerScope!==scope)return;const family=detail?.command?.family;if(family==='journey'&&detail.command?.id!==projectId||family&&!['journey','investigation','note','article','area','source'].includes(family))return;void read(undefined,true);};
  window.addEventListener('minamo-source-unavailable',invalidate);window.addEventListener('minamo-image-unavailable',invalidate);window.addEventListener('minamo-learning-changed',changed);window.addEventListener('minamo-record-committed',committed);
  return()=>{flight.current++;controller.current?.abort();window.removeEventListener('minamo-source-unavailable',invalidate);window.removeEventListener('minamo-image-unavailable',invalidate);window.removeEventListener('minamo-learning-changed',changed);window.removeEventListener('minamo-record-committed',committed);};
 },[key,enabled,retry]);
 return {...current,retry:()=>setRetry(value=>value+1),more:()=>{const cursor=current.data?.relationshipCoverage.nextCursor;if(cursor&&!current.loading)void read(cursor);}};
}
