import type {Family,RecordLink,WorkspaceRecord} from './contracts';

export type ReferenceDestination={family:'article'|'area';id:string;rendition?:string;sectionId?:string;partId?:string};
const refKeys=['refFamily','refId','refRendition','refSection','refPart'] as const;
const identity=(value:string|null,max=160,passage=false)=>!!value&&value.length<=max&&(/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value)||passage&&(/^__(article|title|body|heading|code|output|excerpt)$/.test(value)||/^__body-(?:0|[1-9][0-9]{0,2})$/.test(value)));
/** URL state carries exact identities only, never private questions or Note prose. */
export function referenceFromUrl(params:URLSearchParams):ReferenceDestination|null{
 const family=params.get('refFamily'),id=params.get('refId');
 if(!['article','area'].includes(family??'')||!identity(id))return null;
 const rendition=params.get('refRendition'),sectionId=params.get('refSection'),partId=params.get('refPart');
 if(rendition!==null&&!identity(rendition,240)||sectionId!==null&&!identity(sectionId,160,true)||partId!==null&&!identity(partId,160,true)||partId&&!sectionId)return null;
 return {family:family as 'article'|'area',id:id!,...(rendition?{rendition}:{}),...(sectionId?{sectionId}:{}),...(partId?{partId}:{})};
}
export function referenceUrl(url:URL,destination:ReferenceDestination|null){
 const result=new URL(url);for(const key of refKeys)result.searchParams.delete(key);
 if(destination){result.searchParams.set('refFamily',destination.family);result.searchParams.set('refId',destination.id);if(destination.rendition)result.searchParams.set('refRendition',destination.rendition);if(destination.sectionId)result.searchParams.set('refSection',destination.sectionId);if(destination.partId)result.searchParams.set('refPart',destination.partId);}
 return result.pathname+result.search+result.hash;
}
export type WorkspaceEntry={scope:string;mainScroll:number;referencePushed?:boolean;libraryReturn?:{path:string;state:unknown}};
export function workspaceEntry(state:unknown,scope:string):WorkspaceEntry|null{
 const e=(state as {minamoWorkspace?:WorkspaceEntry}|null)?.minamoWorkspace;
 return e?.scope===scope&&Number.isFinite(e.mainScroll)&&e.mainScroll>=0?e:null;
}
export function readingContextLink(record:WorkspaceRecord,stageId?:string):RecordLink{
 const stage=record.learningShape?.kind==='journey'?record.learningShape.stages.find(item=>item.id===stageId):undefined;
 return {family:record.family,id:record.id,...(record.rendition?{rendition:record.rendition}:{}),...(stage?{sectionId:stage.sectionId}: {})};
}
export function isReferenceFamily(family:Family|undefined):family is ReferenceDestination['family']{return family==='article'||family==='area';}
