import {FAMILIES,type Family,type WorkspaceRecord} from './contracts';
/** Retained session identities may carry historical presentation keys. */
export type WorkspaceLayout='classic'|'focus'|'task';
export type LayoutTask={family:'investigation'|'journey';id:string;stageId?:string;rendition?:string};
export type LayoutResource={family:Family;id:string;rendition?:string;stageId?:string;sectionId?:string;partId?:string};
export const layoutPositionKey=(scope:string)=>`minamo-reading-positions-v1:${scope}`;
/** No text, quote, draft or learning progress belongs in browser position storage. */
export type SemanticReadingPosition={section:string;part:string;offset:number;top:number;textOffset?:number};
export type StoredReadingPosition={resource:string;anchor:SemanticReadingPosition};
const boundedId=(value:unknown,max=240):value is string=>typeof value==='string'&&value.length>0&&value.length<=max&&/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value);
const passageId=(value:unknown):value is string=>boundedId(value,160)||typeof value==='string'&&(/^__(article|title|body|heading|code|output|excerpt)$/.test(value)||/^__body-(?:0|[1-9][0-9]{0,2})$/.test(value));
export function validResourceKey(value:unknown):value is string{
 if(typeof value!=='string'||value.length>1800)return false;
 try{const v:unknown=JSON.parse(value);return Array.isArray(v)&&v.length===6&&FAMILIES.includes(v[0])&&boundedId(v[1],160)&&(v[2]===''||boundedId(v[2],240))&&(v[3]===''||boundedId(v[3],160))&&v.slice(4).every(value=>value===''||passageId(value));}catch{return false;}
}
export function semanticReadingPosition(value:unknown):SemanticReadingPosition|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(!passageId(v.section)||!passageId(v.part)||!Number.isFinite(v.offset)||Math.abs(v.offset as number)>1e7||!Number.isFinite(v.top)||(v.top as number)<0||(v.top as number)>1e8)return null;
 if(v.textOffset!==undefined&&(!Number.isSafeInteger(v.textOffset)||(v.textOffset as number)<0||(v.textOffset as number)>1e7))return null;
 return {section:v.section,part:v.part,offset:v.offset as number,top:v.top as number,...(v.textOffset===undefined?{}:{textOffset:v.textOffset as number})};
}
export function readingPositions(value:unknown):StoredReadingPosition[]{
 if(!Array.isArray(value)||value.length>64)return [];
 const result:StoredReadingPosition[]=[];
 for(const item of value){if(!item||!validResourceKey(item.resource))continue;const anchor=semanticReadingPosition(item.anchor);if(anchor){const previous=result.findIndex(entry=>entry.resource===item.resource);if(previous>=0)result.splice(previous,1);result.push({resource:item.resource,anchor});}}
 return result;
}
/** Position identity is a displayed edition/stage, independent of the link which opened it. */
export const readingPositionIdentity=(resource:LayoutResource)=>JSON.stringify([resource.family,resource.id,resource.rendition??'',resource.stageId??'','','']);
/** An in-flight exact edition must not visit or remember the provisional current head. */
export function layoutReading(record:WorkspaceRecord|null,rendition?:string,loading=false):WorkspaceRecord|null{return loading||rendition&&record?.rendition!==rendition?null:record;}
export const resourceKey=(resource:LayoutResource)=>JSON.stringify([resource.family,resource.id,resource.rendition??'',resource.stageId??'',resource.sectionId??'',resource.partId??'']);
export const taskKey=(task:LayoutTask|null)=>task?JSON.stringify([task.family,task.id,task.stageId??'',task.rendition??'']):'none';
export function taskFromRecord(record:Pick<WorkspaceRecord,'family'|'id'|'rendition'>|null,stageId?:string):LayoutTask|null{
 if(!record||record.family!=='investigation'&&record.family!=='journey')return null;
 return {family:record.family,id:record.id,...(stageId?{stageId}:{}),...(record.rendition?{rendition:record.rendition}:{})};
}
export function taskFromParams(params:URLSearchParams):LayoutTask|null{
 if(params.get('taskClosed')==='1')return null;
 const family=params.get('taskFamily'),id=params.get('taskId');
 if(!boundedId(id,160)||family!=='investigation'&&family!=='journey')return null;
 const stage=params.get('taskStage'),rendition=params.get('taskRendition');
 if(stage!==null&&!boundedId(stage,160)||rendition!==null&&!boundedId(rendition,240))return null;
 return {family,id,...(family==='journey'&&stage?{stageId:stage}:{}),...(rendition?{rendition}:{})};
}
/** Primary task navigation is meaningful even before a bounded collection has loaded that record. */
export function primaryTaskFromParams(params:URLSearchParams,record?:Pick<WorkspaceRecord,'family'|'id'|'rendition'>|null):LayoutTask|null{
 if(params.get('taskClosed')==='1')return null;
 const family=params.get('family'),id=params.get('id');if((family!=='journey'&&family!=='investigation')||!boundedId(id,160))return null;
 const stage=params.get('stage'),requested=params.get('rendition');if(stage!==null&&!boundedId(stage,160)||requested!==null&&!boundedId(requested,240))return null;
 const rendition=requested??(record?.family===family&&record.id===id?record.rendition:undefined);
 return {family,id,...(family==='journey'&&stage?{stageId:stage}:{}),...(rendition?{rendition}:{})};
}
export function putTask(params:URLSearchParams,task:LayoutTask|null){
 for(const key of ['taskFamily','taskId','taskStage','taskRendition'])params.delete(key);
 if(task){params.set('taskFamily',task.family);params.set('taskId',task.id);if(task.stageId)params.set('taskStage',task.stageId);if(task.rendition)params.set('taskRendition',task.rendition);}
 return params;
}
export type LayoutSession={task:LayoutTask|null;pinned?:boolean;resources:LayoutResource[];last:Partial<Record<WorkspaceLayout,{task:string;resource:LayoutResource}>>};
export const emptyLayoutSession=():LayoutSession=>({task:null,resources:[],last:{}});
/** Local viewing history only. No record writes, Note ownership or learning state. */
export function visitResource(state:LayoutSession,mode:WorkspaceLayout,resource:LayoutResource,task:LayoutTask|null):LayoutSession{
 const changed=taskKey(state.task)!==taskKey(task),resources=changed?[]:state.resources;
 const key=resourceKey(resource),next=resources.some(item=>resourceKey(item)===key)?resources:[...resources,resource];
 // Never silently evict a reference: an explicit close makes room at the visible bound.
 return {...state,task,resources:next.length<=12?next:resources,last:{...state.last,[mode]:{task:taskKey(task),resource}}};
}
export function rememberedResource(state:LayoutSession,mode:WorkspaceLayout):LayoutResource|null{
 const last=state.last[mode];return last&&last.task===taskKey(state.task)?last.resource:null;
}

/** Context is established by authored links, never by merely opening a resource. */
export function readingSupportsTask(task:LayoutTask|null,taskRecord:WorkspaceRecord|null|undefined,reading:Pick<WorkspaceRecord,'family'|'id'|'rendition'|'links'>|null|undefined):boolean{
 if(!task||!taskRecord||!validTaskRecord(task,taskRecord)||!reading)return false;
 if(reading.family===task.family&&reading.id===task.id)return !task.rendition||reading.rendition===task.rendition;
 const matches=(link:WorkspaceRecord['links'][number],target:{family:string;id:string;rendition?:string})=>link.family===target.family&&link.id===target.id&&(!link.rendition||link.rendition===target.rendition)&&(!link.sourceContext?.stageId||link.sourceContext.stageId===task.stageId);
 return taskRecord.links.some(link=>matches(link,reading))||reading.links.some(link=>matches(link,taskRecord));
}
export function validTaskRecord(task:LayoutTask|null,record:WorkspaceRecord|null|undefined):boolean{
 return !!task&&!!record&&!record.trashedAt&&task.family===record.family&&task.id===record.id&&(!task.rendition||task.rendition===record.rendition)&&(task.family==='investigation'||record.learningShape?.kind==='journey'&&record.learningShape.stages.some(stage=>stage.id===task.stageId));
}
/** A bounded collection is only one source; an exact current/fetched task is equally usable. */
export function resolveTaskRecord(task:LayoutTask|null,records:WorkspaceRecord[],current?:WorkspaceRecord|null,exact?:WorkspaceRecord|null):WorkspaceRecord|null{
 if(!task)return null;
 return [current,...records,exact].find(record=>record&&record.family===task.family&&record.id===task.id&&(!task.rendition||record.rendition===task.rendition))??null;
}
/** Late data resolution must retain a deliberate pin while an explicit navigation releases it. */
export function reconcileReadingContext(state:LayoutSession,mode:WorkspaceLayout,resource:LayoutResource,primary:LayoutTask|null,taskRecord:WorkspaceRecord|null,reading:WorkspaceRecord):LayoutSession{
 const candidate=primary??state.task;
 if(candidate&&!primary&&!state.pinned&&!taskRecord)return visitResource(state,mode,resource,candidate);
 const next=primary||state.pinned||readingSupportsTask(candidate,taskRecord,reading)?candidate:null;
 const samePrimary=!!primary&&!!state.task&&primary.family===state.task.family&&primary.id===state.task.id&&primary.stageId===state.task.stageId&&(!primary.rendition||!state.task.rendition||primary.rendition===state.task.rendition);
 const pinned=!!next&&!!state.pinned&&(!primary||samePrimary);
 return {...visitResource(state,mode,resource,next),pinned};
}
