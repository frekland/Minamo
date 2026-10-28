import {FAMILIES} from './contracts';
import type {LearningWorkTarget,CommandReceipt,Family,PassageAnchor,RecordLink,WorkspaceRecord,ReadingSelection} from './contracts';
export type {ReadingSelection} from './contracts';
export type CaptureRef={family:'flag'|'annotation';id:string};
export type ReadingLinkOptions={rendition?:string;selection?:ReadingSelection;captureRef?:CaptureRef};
// Deployment origin is maintainer-configured, never derived from untrusted Host headers.
export const MINAMO_SITE_ORIGIN=(typeof process!=='undefined'&&process.env?.NEXT_PUBLIC_MINAMO_SITE_ORIGIN)||'https://minamo.example';
/** Stable import alias for older callers. The product hostname is Minamo. */
export const MINAMO_V2_ORIGIN=MINAMO_SITE_ORIGIN;
/** Historical V2 origin may be rewritten only for validated saved reading links. */
export const RETIRED_MINAMO_SITE_ORIGIN='https://previous.minamo.example';
function boundedIdentity(value:unknown,label:string):string{if(typeof value!=='string'||!value.length||value.length>240||/[\u0000-\u001f\u007f]/.test(value))throw Error(`A bounded ${label} is required.`);return value;}
export function qualifiedRef(ref:RecordLink):RecordLink{if(!ref||typeof ref.family!=='string'||!(FAMILIES as readonly string[]).includes(ref.family))throw Error('A valid record family is required.');return {family:ref.family,id:boundedIdentity(ref.id,'record ID')};}
export function readingView(family:Family){switch(family){case'journey':return'journeys';case'investigation':return'investigations';case'article':case'area':return'library';case'source':return'sources';case'experiment':return'tools';default:return'work';}}
function segment(value:ReadingSelection):ReadingSelection{const sectionId=boundedIdentity(value.sectionId,'section ID'),partId=boundedIdentity(value.partId,'part ID');if(!Number.isSafeInteger(value.start)||!Number.isSafeInteger(value.end)||value.start<0||value.end<=value.start)throw Error('An exact non-empty UTF-16 range is required.');return {sectionId,partId,start:value.start,end:value.end};}
/** Copy only selector identity. Quoted text, prose and permission claims never enter URLs or briefs. */
export function readingSelection(value:ReadingSelection):ReadingSelection{
 if(!value||typeof value!=='object')throw Error('An exact content selector is required.');
 const first=segment(value),out:ReadingSelection={...first};
 if(value.segments!==undefined){if(!Array.isArray(value.segments)||!value.segments.length||value.segments.length>40)throw Error('A passage selection needs 1–40 exact segments.');const segments=value.segments.map(segment);const start=segments[0];if(start.sectionId!==first.sectionId||start.partId!==first.partId||start.start!==first.start||start.end!==first.end)throw Error('The primary passage coordinates must match the first segment.');out.segments=segments;}
 if(JSON.stringify(out).length>12000)throw Error('This selection is too complex for a compact handoff. Save it as a Flag or Annotation and discuss that capture instead.');return out;
}
export function selectionFromAnchor(anchor:PassageAnchor):ReadingSelection{return readingSelection(anchor);}
/** Canonical relative Site link. Every target is family-qualified; no caller URL or view is accepted. */
export function buildRecordLink(ref:RecordLink,options:ReadingLinkOptions={}):string{
 const target=qualifiedRef(ref),params=new URLSearchParams({view:readingView(target.family),family:target.family,id:target.id});
 if(options.rendition)params.set('rendition',boundedIdentity(options.rendition,'rendition ID'));
 if(options.selection){if(!options.rendition)throw Error('An exact selection needs its retained rendition.');const selection=readingSelection(options.selection);params.set('section',selection.sectionId);params.set('part',selection.partId);params.set('start',String(selection.start));params.set('end',String(selection.end));if(selection.segments)params.set('segments',JSON.stringify(selection.segments));}
 if(options.captureRef){const capture=qualifiedRef(options.captureRef);if(capture.family!=='flag'&&capture.family!=='annotation')throw Error('A saved capture is a Flag or Annotation.');params.set('capture',capture.id);params.set('captureFamily',capture.family);}
 const link='/?'+params.toString();if(link.length>20000)throw Error('This return link exceeds the bounded handoff size. Open the saved capture by its record identity instead.');return link;
}
export function buildAnchorLink(anchor:PassageAnchor,captureRef?:CaptureRef):string{return buildRecordLink({family:anchor.recordFamily??'article',id:anchor.articleId},{rendition:anchor.rendition,...(captureRef?{captureRef}:{selection:selectionFromAnchor(anchor)})});}
/** A saved relation may identify a section/part without a selected text range. */
export function buildLinkedReadingLink(ref:RecordLink):string{
 const params=new URLSearchParams(buildRecordLink(ref,{rendition:ref.rendition}).slice(2));
 if(ref.sectionId){if(!ref.rendition)throw Error('A section destination needs its exact rendition.');params.set('section',boundedIdentity(ref.sectionId,'section ID'));}
 if(ref.partId){if(!ref.sectionId)throw Error('A part destination needs its section.');params.set('part',boundedIdentity(ref.partId,'part ID'));}
 return '/?'+params;
}
/** The containing reading is a separate destination; it never changes source coordinates. */
export function buildDisplayReturnLink(anchor:PassageAnchor,captureRef?:CaptureRef):string|undefined{
 const display=(anchor as PassageAnchor & {displayReturn?:{recordFamily:Family;id:string;rendition:string;sectionId:string;partId:string;start:number;end:number}}).displayReturn;
 if(!display)return undefined;
 return buildRecordLink({family:display.recordFamily,id:display.id},{rendition:display.rendition,selection:readingSelection(display),...(captureRef?{captureRef}:{})});
}
export function absoluteReadingLink(relative:string,siteOrigin=MINAMO_V2_ORIGIN):string{
 const origin=new URL(siteOrigin);if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash||origin.origin!==MINAMO_SITE_ORIGIN)throw Error('The verified Minamo HTTPS Site origin is required.');
 if(!relative.startsWith('/?')||relative.startsWith('//'))throw Error('A canonical relative content link is required.');return origin.origin+relative;
}
/** Add exact stage navigation only to a canonical link for that same Journey. Reading coordinates stay intact. */
export function stageReadingLink(relative:string,target?:LearningWorkTarget):string{
 if(target?.kind!=='journey-stage'||!relative.startsWith('/?')||relative.startsWith('//'))return relative;
 const params=new URLSearchParams(relative.slice(2));if(params.get('family')!=='journey'||params.get('id')!==target.journeyId)return relative;
 params.set('stage',boundedIdentity(target.stageId,'stage ID'));return '/?'+params.toString();
}
/** Keep the general record destination an overview; only exact reading destinations carry stage context. */
export function stageContextLinks<T extends {record:string;reading:string;returnTo:string;displayReturn?:string;origin?:string}>(links:T,target?:LearningWorkTarget):T{
 return {...links,reading:stageReadingLink(links.reading,target),returnTo:stageReadingLink(links.returnTo,target),...(links.displayReturn?{displayReturn:stageReadingLink(links.displayReturn,target)}:{}),...(links.origin?{origin:stageReadingLink(links.origin,target)}:{})};
}
/** Link metadata only: callers still perform current permission/rendition checks before reading. */
export function contextDeepLinks(record:Pick<WorkspaceRecord,'family'|'id'|'rendition'|'anchor'|'flagTarget'>,selection?:PassageAnchor|null){
 const recordLink=buildRecordLink(record),captureRef=record.family==='flag'||record.family==='annotation'?{family:record.family,id:record.id} as CaptureRef:undefined;
 const origin=record.anchor?buildAnchorLink(record.anchor,captureRef):record.family==='flag'&&record.flagTarget?.kind==='record'?buildRecordLink(record.flagTarget):undefined;
 const reading=selection?buildAnchorLink(selection,captureRef):record.family==='flag'&&origin?origin:buildRecordLink(record,{rendition:record.rendition});
 const displayReturn=record.anchor?buildDisplayReturnLink(record.anchor,captureRef):selection?buildDisplayReturnLink(selection,captureRef):undefined;
 return {record:recordLink,reading,returnTo:reading,...(origin?{origin}:{}),...(displayReturn?{displayReturn}:{})};
}
/** Enrich response projections, never stored idempotency payloads or authority. */
export function commandReceiptLinks(receipt:CommandReceipt){
 const record=receipt.record?contextDeepLinks(receipt.record).returnTo:receipt.recordRef?buildRecordLink(receipt.recordRef):undefined;
 const refs=receipt.records??receipt.recordRefs;
 return {...(record?{record}:{}),...(refs?.length?{records:refs.slice(0,40).map(ref=>({family:ref.family,id:ref.id,url:buildRecordLink(ref)}))}:{})};
}
