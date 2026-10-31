import {env} from "cloudflare:workers";
import {getChatGPTUser} from "./chatgpt-auth";
import {headers} from 'next/headers';
import {readWorkspace,readContext} from "../lib/domain";
import {resolveGeneration,withGeneration} from "../lib/generations";
import {requireScenarioOwner,scenarioState} from '../lib/scenario-control';
import {FAMILIES} from "../lib/contracts";
import {resolveTitleResultRequest} from '../lib/result-intent';
import Workspace from "./workspace";
import StartupRetry from "./startup-retry";
import {deferInitialWorkspaceCollection} from "../lib/workspace-bootstrap";
import {learningSpaceSelection} from "../lib/learning-space-navigation";
import {captureReturnTarget} from "../lib/capture-return";
import type {Family,WorkspaceSnapshot,WorkspaceRecord,PassageAnchor} from "../lib/contracts";
import type {ReadingTarget} from "./reader";
export const dynamic="force-dynamic";
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const user=await getChatGPTUser();const params=await searchParams;
 let generation;try{generation=user?await resolveGeneration(env,user.userId):null;}catch{return <StartupRetry/>;}const owner=generation?.namespace;const scopedEnv=generation?withGeneration(env,generation):env;
 const scalar=(key:string)=>typeof params?.[key]==='string'?params[key] as string:undefined;
 const learningSelection=learningSpaceSelection({learningSpace:scalar('learningSpace'),language:scalar('language')});
 const family=scalar('family')&&(FAMILIES as readonly string[]).includes(scalar('family')!)?scalar('family') as Family:undefined;
 let ownerTestScenario:{projectId:string;title:string;phase:string;epoch:number}|undefined;
 if(user&&owner)try{
  const requestHeaders=await headers(),host=requestHeaders.get('host');
  if(host){
   requireScenarioOwner(scopedEnv as Parameters<typeof requireScenarioOwner>[0],new Request(`https://${host}/`,{headers:requestHeaders}));
   const state=await scenarioState(scopedEnv as Parameters<typeof scenarioState>[0],owner);
   if(state.phase&&!state.pending_json&&Number.isSafeInteger(state.epoch)&&state.epoch>0){
    const projectId=`TEST-ONLY-m2m-r${state.epoch}-project`;
    const record=(await readContext(scopedEnv,owner,'journey',projectId)).record;
    if(record?.synthetic===true&&record.id===projectId)
     ownerTestScenario={projectId,title:record.title,phase:state.phase,epoch:state.epoch};
   }
  }
 }catch{/* Test access is optional, strictly owner-scoped, and never blocks ordinary Home. */}
 let snapshot:WorkspaceSnapshot={records:[],activity:[]},error='',targetError:string|undefined;
 // Exact content and the Library catalogue load independently of the general collection.
 // Legacy ID-only links retain their existing bounded family-resolution path.
 const initialCollectionPending=!!user&&!(scalar('id')&&!family)&&deferInitialWorkspaceCollection(scalar('view')??'home',!!(family&&scalar('id')&&(!scalar('capture')||['flag','annotation'].includes(scalar('captureFamily')??''))));
 if(user&&!initialCollectionPending)try{snapshot=await readWorkspace(scopedEnv,owner!,{includeTrash:params?.view==='trash',...learningSelection})}catch{error='Your workspace collection could not be loaded. Your existing work has not been changed.'}
 const addRecord=(record:WorkspaceRecord)=>{snapshot.records=[...snapshot.records.filter(r=>!(r.family===record.family&&r.id===record.id)),record]};
 let retained:WorkspaceRecord|null=null;let rendition=scalar('rendition');let target:(ReadingTarget & {recordFamily?:Family;captureId?:string;captureFamily?:'flag'|'annotation'})|undefined;
 const captureId=scalar('capture');const rawCaptureFamily=scalar('captureFamily');
 const snapshotCaptures=captureId?snapshot.records.filter(r=>r.id===captureId&&!r.trashedAt&&(r.family==='annotation'||r.family==='flag')&&(!rawCaptureFamily||r.family===rawCaptureFamily)&&r.anchor):[];
 const captureFamily=rawCaptureFamily==='flag'||rawCaptureFamily==='annotation'?rawCaptureFamily:snapshotCaptures.length===1?snapshotCaptures[0].family:undefined;
 let capture:WorkspaceRecord|undefined;
 if(user&&captureId&&captureFamily)try{const context=await readContext(scopedEnv,owner!,captureFamily,captureId);if(context.record?.anchor){capture=context.record;addRecord(capture)}}catch{}
 const captureTarget=captureReturnTarget(capture?.anchor,scalar('id'),family);
 if(captureId&&!captureTarget){error='The saved capture is unavailable or does not match this material. Your other work remains available.';target={captureId,recordFamily:family,...(rendition?{rendition}:{})};}
 else if(captureTarget&&capture){target={...captureTarget,captureId,captureFamily:capture.family as 'flag'|'annotation'};rendition=captureTarget.rendition;}
 else if(rendition||scalar('stage')||scalar('section')||scalar('part')||scalar('returnJourney'))target={...(rendition?{rendition}:{}),stageId:scalar('stage'),returnJourney:scalar('returnJourney'),returnStage:scalar('returnStage'),recordFamily:family,sectionId:scalar('section'),partId:scalar('part'),...(scalar('start')?{start:Number(scalar('start'))}:{}),...(scalar('end')?{end:Number(scalar('end'))}:{}),...(captureId?{captureId}:{})};
 const loadedTargets=snapshot.records.filter(r=>r.id===scalar('id')&&!r.trashedAt);
 const selectedFamily=family??target?.recordFamily??(loadedTargets.length===1?loadedTargets[0].family:undefined);
 let related:WorkspaceRecord[]=[];
 if(user&&scalar('id')){
  if(!selectedFamily)targetError='This direct link needs an explicit record family. A record absent from the loaded collection has not been guessed or treated as deleted.';
  else try{const context=await readContext(scopedEnv,owner!,selectedFamily,scalar('id'));if(context.record){addRecord(context.record);related=context.related}}catch{targetError='This exact record could not be read. It may be unavailable; your retained drafts are unchanged.'}
 }
 const titleParams=new URLSearchParams(Object.entries(params).flatMap(([key,value])=>typeof value==='string'?[[key,value]]:[]));
 const freshHead=snapshot.records.find(record=>record.family===selectedFamily&&record.id===scalar('id'));
 const titleResultResolved=resolveTitleResultRequest(titleParams,freshHead);
 if(titleResultResolved){rendition=undefined;target=undefined;}
 if(user&&rendition&&scalar('id')&&(!captureId||capture?.anchor))try{retained=(await readContext(scopedEnv,owner!,target?.recordFamily??selectedFamily??'article',scalar('id'),rendition)).record}catch{error='The exact retained version is unavailable. Your captured words remain in Your work.'}
 const draftScope=user?'v2-'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user.userId)))).map(n=>n.toString(16).padStart(2,'0')).join(''):'signed-out';
 const flags=env as unknown as {MINAMO_ACTIVITY_STUDIO?:string};
 return <Workspace initialTestScenario={ownerTestScenario} initialCollectionPending={initialCollectionPending} initialTitleResultResolved={titleResultResolved} initialLearningScope={learningSelection} activityStudioEnabled={flags.MINAMO_ACTIVITY_STUDIO==='1'} initialWorkTab={scalar('tab')==='notes'?'note':scalar('tab')==='runs'?'run':'all'} draftScope={draftScope} initialGeneration={generation?.generation??"legacy@0"} initialArticle={retained} initialRendition={rendition} initialReadingTarget={target} initialFamily={selectedFamily} initialRecords={snapshot.records} initialActivity={snapshot.activity} initialNextCursor={snapshot.nextCursor??null} initialTruncated={!!snapshot.truncated} initialRelated={related} initialTargetError={targetError} authenticated={!!user} initialError={error} initialView={scalar('view')==='atlas'?'library':scalar('view')??'home'} initialId={scalar('id')}/>;
}
