import type {Family,PassageAnchor,WorkspaceRecord} from './contracts';
/** Source identity remains canonical; a separately checked display return is presentation context. */
export function captureReturnTarget(anchor:PassageAnchor|undefined,id:string|undefined,family?:Family){
 if(!anchor?.quote||!id)return undefined;
 const display=anchor.displayReturn;
 if(display&&display.id===id&&(!family||display.recordFamily===family)){
  if(!Number.isSafeInteger(display.start)||!Number.isSafeInteger(display.end)||display.start<0||display.end-display.start!==anchor.quote.length)return undefined;
  return {recordFamily:display.recordFamily,rendition:display.rendition,sectionId:display.sectionId,partId:display.partId,start:display.start,end:display.end,quote:anchor.quote};
 }
 if(anchor.articleId===id&&(!family||(anchor.recordFamily??'article')===family))return {...anchor,recordFamily:anchor.recordFamily??'article'};
 return undefined;
}


export type CaptureReadState={key:string;status:'idle'|'loading'|'ready'|'unavailable';record?:WorkspaceRecord};
/** A completed read owns only its exact requested capture, including before effects start the next read. */
export function captureReadForTarget(read:CaptureReadState,target:{captureId?:string;captureFamily?:'flag'|'annotation'}|undefined,knownCaptures:WorkspaceRecord[]=[]):{record:WorkspaceRecord|undefined;pending:boolean}{
 const id=target?.captureId;if(!id)return {record:undefined,pending:false};
 const candidates=knownCaptures.filter(record=>record.id===id&&(record.family==='flag'||record.family==='annotation')&&(!target.captureFamily||record.family===target.captureFamily)&&!record.trashedAt&&!!record.anchor);
 const family=target.captureFamily??(candidates.length===1?candidates[0].family:undefined);
 // Missing or ambiguous family cannot safely select a saved capture. The caller
 // retains its explicit unavailable state rather than guessing a loaded record.
 if(!family)return {record:undefined,pending:false};
 const matches=read.key===`${family}:${id}`;
 const record=matches&&read.status==='ready'&&read.record?.id===id&&read.record.family===family&&!read.record.trashedAt&&read.record.anchor?read.record:undefined;
 return {record,pending:!matches||read.status==='idle'||read.status==='loading'};
}
