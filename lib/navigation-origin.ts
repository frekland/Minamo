import {FAMILIES} from './contracts';
import type {Family,ReadingSelection} from './contracts';
import {readingSelection,readingView} from './reading-links';

/** Portable *view history*, never a RecordLink, command payload or permission grant. */
export type RouteReading={family:Family;id:string;rendition:string;sectionId?:string;partId?:string;start?:number;end?:number;segments?:ReadingSelection['segments']};
export type RouteTask={family:'journey'|'investigation';id:string;rendition?:string;projectId?:string;stageId?:string};
export type ViewOrigin={v:1;source?:RouteReading;activity?:RouteReading;task?:RouteTask};
export type RouteTarget={recordFamily?:Family;rendition?:string;stageId?:string;sectionId?:string;partId?:string;start?:number;end?:number;segments?:ReadingSelection['segments'];returnJourney?:string;returnStage?:string;captureId?:string;captureFamily?:'flag'|'annotation';origin?:ViewOrigin};

const identifier=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
const family=(value:unknown):value is Family=>typeof value==='string'&&(FAMILIES as readonly string[]).includes(value);
const routeKeys=['family','id','rendition','stage','section','part','start','end','segments','returnJourney','returnStage','capture','captureFamily','origin'];
function selector(value:{sectionId?:string;partId?:string;start?:number;end?:number;segments?:ReadingSelection['segments']}){
 const anyRange=value.start!==undefined||value.end!==undefined||value.segments!==undefined;
 if(value.partId&&!value.sectionId||anyRange&&(!value.sectionId||!value.partId||value.start===undefined||value.end===undefined))return false;
 if(value.sectionId&&!identifier(value.sectionId)||value.partId&&!identifier(value.partId))return false;
 if(anyRange){try{readingSelection(value as ReadingSelection);}catch{return false;}}
 return true;
}
function exactReading(value:unknown):value is RouteReading{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const r=value as Record<string,unknown>;
 if(Object.keys(r).some(key=>!['family','id','rendition','sectionId','partId','start','end','segments'].includes(key)))return false;
 return family(r.family)&&identifier(r.id)&&identifier(r.rendition)&&selector(r as RouteReading);
}
function exactTask(value:unknown):value is RouteTask{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const t=value as Record<string,unknown>;
 return Object.keys(t).every(key=>['family','id','rendition','projectId','stageId'].includes(key))&&
 (t.family==='journey'||t.family==='investigation')&&identifier(t.id)&&
 (t.rendition===undefined||identifier(t.rendition))&&
 (t.projectId===undefined||identifier(t.projectId))&&(t.stageId===undefined||identifier(t.stageId))&&
 (t.stageId===undefined||t.family==='journey'||t.projectId!==undefined)&&
 (t.family!=='journey'||t.projectId===undefined);
}
/** This deliberately accepts only the known fixed slots; a nested URL or prose is rejected. */
export function parseViewOrigin(raw:unknown):ViewOrigin|undefined{
 if(typeof raw!=='string'||raw.length>6000||!raw.length)return;
 try{
  const value=JSON.parse(raw) as Record<string,unknown>;
  if(!value||typeof value!=='object'||Array.isArray(value)||value.v!==1||Object.keys(value).some(key=>!['v','source','activity','task'].includes(key)))return;
  if(value.source!==undefined&&!exactReading(value.source)||value.activity!==undefined&&!exactReading(value.activity)||value.task!==undefined&&!exactTask(value.task))return;
  if(value.activity&&(value.activity as RouteReading).family!=='experiment')return;
  if(value.source&&!['article','area','source'].includes((value.source as RouteReading).family))return;
  return value as ViewOrigin;
 }catch{return;}
}
export function encodeViewOrigin(origin:ViewOrigin):string{
 const serialized=JSON.stringify(origin);
 if(!parseViewOrigin(serialized))throw Error('The view origin is invalid or too large.');
 return serialized;
}
/** Parse exact URLs once for native and intercepted navigation. No rights are inferred. */
export function routeTarget(params:URLSearchParams):RouteTarget|undefined{
 if(routeKeys.some(key=>params.getAll(key).length>1))return;
 const rawFamily=params.get('family'),recordFamily=family(rawFamily)?rawFamily:undefined;
 if(rawFamily&&!recordFamily)return;
 const id=params.get('id');if(id!==null&&!identifier(id))return;
 const rendition=params.get('rendition')??undefined,stageId=params.get('stage')??undefined,sectionId=params.get('section')??undefined,partId=params.get('part')??undefined;
 const returnJourney=params.get('returnJourney')??undefined,returnStage=params.get('returnStage')??undefined;
 const captureId=params.get('capture')??undefined,rawCaptureFamily=params.get('captureFamily');
 if([rendition,stageId,sectionId,partId,returnJourney,returnStage,captureId].some(v=>v!==undefined&&!identifier(v))||returnStage&&!returnJourney||captureId&&rawCaptureFamily!=='flag'&&rawCaptureFamily!=='annotation'||rawCaptureFamily&&!captureId)return;
 const startRaw=params.get('start'),endRaw=params.get('end'),start=startRaw===null?undefined:Number(startRaw),end=endRaw===null?undefined:Number(endRaw);
 if(startRaw!==null&&!/^\d+$/.test(startRaw)||endRaw!==null&&!/^\d+$/.test(endRaw))return;
 let segments:ReadingSelection['segments'];if(params.has('segments'))try{segments=JSON.parse(params.get('segments')!);}catch{return;}
 if(!selector({sectionId,partId,start,end,segments})||(sectionId||partId||start!==undefined||segments)&&!rendition)return;
 const origin=params.has('origin')?parseViewOrigin(params.get('origin')):undefined;
 if(params.has('origin')&&!origin)return;
 const target:RouteTarget={...(recordFamily?{recordFamily}:{}),...(rendition?{rendition}:{}),...(stageId?{stageId}:{}),...(sectionId?{sectionId}:{}),...(partId?{partId}:{}),...(start!==undefined?{start}:{}),...(end!==undefined?{end}:{}),...(segments?{segments}:{}),...(returnJourney?{returnJourney}:{}),...(returnStage?{returnStage}:{}),...(captureId?{captureId,captureFamily:rawCaptureFamily as 'flag'|'annotation'}:{}),...(origin?{origin}:{})};
 return Object.keys(target).length?target:undefined;
}
export function routeDestination(path:string):{view:string;id:string;target:RouteTarget}|undefined{
 if(!path.startsWith('/?')||path.startsWith('//')||path.length>20000)return;
 const params=new URLSearchParams(path.slice(2)),id=params.get('id');if(!identifier(id))return;
 const target=routeTarget(params);if(!target?.recordFamily)return;
 return {view:params.get('view')??readingView(target.recordFamily),id,target};
}
/** The first genuine source/activity and originating task survive detours independently. */
export function extendViewOrigin(previous:ViewOrigin|undefined,current:{family:Family;id:string;rendition?:string;sectionId?:string;partId?:string;start?:number;end?:number;segments?:ReadingSelection['segments']},project?:{journeyId:string;stageId?:string}):ViewOrigin|undefined{
 if(!identifier(current.id)||!family(current.family))return previous;
 const next:ViewOrigin={v:1,...previous};
 if(!next.source&&current.rendition&&['article','area','source'].includes(current.family)){
  const source={family:current.family,id:current.id,rendition:current.rendition,...(current.sectionId?{sectionId:current.sectionId}:{}),...(current.partId?{partId:current.partId}:{}),...(current.start!==undefined?{start:current.start}:{}),...(current.end!==undefined?{end:current.end}:{}),...(current.segments?{segments:current.segments}:{})};
  if(exactReading(source))next.source=source;
 }
 if(!next.activity&&current.family==='experiment'&&current.rendition)next.activity={family:'experiment',id:current.id,rendition:current.rendition};
 if(current.family==='investigation'&&(!next.task||next.task.family==='journey'))next.task={family:'investigation',id:current.id,...(current.rendition?{rendition:current.rendition}:{}),...(project?{projectId:project.journeyId,...(project.stageId?{stageId:project.stageId}:{})}:{})};
 if(!next.task&&current.family==='journey'&&project?.stageId)next.task={family:'journey',id:current.id,stageId:project.stageId,...(current.rendition?{rendition:current.rendition}:{})};
 return next.source||next.activity||next.task?next:undefined;
}
export function withViewOrigin(href:string,origin:ViewOrigin|undefined):string{
 if(!origin||!href.startsWith('/?')||href.startsWith('//'))return href;
 const p=new URLSearchParams(href.slice(2));if(p.has('origin'))return parseViewOrigin(p.get('origin'))?href:href;
 try{p.set('origin',encodeViewOrigin(origin));const result='/?'+p;if(result.length<=20000)return result;}catch{}
 return href; // A missing optional return is safer than a truncated exact selector.
}
