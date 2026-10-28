import type {RecordLink,WorkspaceRecord} from './contracts';
import {buildLinkedReadingLink,buildRecordLink} from './reading-links';
import type {SearchEvidence} from './search-evidence';

type Head=Pick<WorkspaceRecord,'family'|'id'|'rev'|'rendition'|'trashedAt'>;
export type ResultNavigationIntent={kind:'current-title'|'exact-title'|'exact-passage'|'activity-field'|'exact-record';destination:RecordLink;href:string;exactHref:string;currentHref?:string};
const wholeTitleFamilies=new Set(['journey','investigation','article','area']);
const titleMatch=(match:SearchEvidence)=>match.field==='title'&&match.sectionId==='__article'&&match.partId==='__title'&&wholeTitleFamilies.has(match.record.family);
function sameHead(match:SearchEvidence,head?:Head|null){return !!head&&!head.trashedAt&&head.family===match.record.family&&head.id===match.record.id&&head.rev===match.record.rev&&!!head.rendition&&head.rendition===match.record.rendition;}
/** A title may open the whole current workspace only after an eligible current
 * read proves that it is still the matched edition. The URL carries the same
 * guard for server resolution on new tabs, copy/paste and reload. */
export function resultNavigationIntent(record:Pick<WorkspaceRecord,'family'|'id'|'rendition'>,match?:SearchEvidence,options:{currentHead?:Head|null;history?:boolean}={}):ResultNavigationIntent{
 if(match&&(match.record.family!==record.family||match.record.id!==record.id))throw Error('Search evidence must name the same family-qualified result.');
 const destination=match?.destination??{family:record.family,id:record.id,...(record.rendition?{rendition:record.rendition}:{})};
 const exactHref=match?.href??buildLinkedReadingLink(destination);
 const current=options.currentHead;
 const currentHref=current&&!current.trashedAt&&current.family===record.family&&current.id===record.id?buildRecordLink(current):undefined;
 if(match&&titleMatch(match)&&!options.history){
  const params=new URLSearchParams(exactHref.slice(2));params.set('resultIntent','current-title');params.set('resultRev',String(match.record.rev));
  const verified=sameHead(match,current);
  return {kind:verified?'current-title':'exact-title',destination:verified?{family:record.family,id:record.id}:destination,href:'/?'+params,exactHref,...(currentHref?{currentHref}:{})};
 }
 return {kind:match?.projection?'activity-field':match?.partId?'exact-passage':'exact-record',destination,href:exactHref,exactHref,...(currentHref?{currentHref}:{})};
}
/** Resolve only the bounded title intent, never a capture/history/passage link.
 * Call with an independently read current-rights head, not a search summary. */
export function resolveTitleResultRequest(params:URLSearchParams,currentHead?:Head|null):boolean{
 if(params.get('resultIntent')!=='current-title'||!currentHead||currentHead.trashedAt||!wholeTitleFamilies.has(currentHead.family)||params.get('capture')||params.get('stage')||params.get('section')!=='__article'||params.get('part')!=='__title')return false;
 const revision=params.get('resultRev');
 return !!revision&&/^[1-9]\d*$/.test(revision)&&Number(revision)===currentHead.rev&&params.get('family')===currentHead.family&&params.get('id')===currentHead.id&&!!currentHead.rendition&&params.get('rendition')===currentHead.rendition;
}
/** Only after successful guarded resolution. This turns the history entry into
 * the current workspace it actually opened, so Back cannot revive title focus. */
export function clearResolvedTitleResult(params:URLSearchParams):URLSearchParams{
 const result=new URLSearchParams(params);for(const key of ['resultIntent','resultRev','rendition','section','part','start','end','segments'])result.delete(key);return result;
}
/** Client navigation uses the very same selection as the anchor URL. */
export function resultNavigationTarget(intent:ResultNavigationIntent){
 const target=intent.destination,params=new URLSearchParams(intent.exactHref.slice(2));
 const start=Number(params.get('start')),end=Number(params.get('end'));
 const selection=intent.kind!=='current-title'&&params.has('start')&&params.has('end')&&Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&end>start?{start,end}:{};
 return {recordFamily:target.family,rendition:target.rendition,sectionId:target.sectionId,partId:target.partId,...selection};
}
