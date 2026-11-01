import type {LearningScope} from './learning-spaces';
import {parseNoteImagePlacements} from './note-image-placement';
import type {ArticleSection,ContentPatch,PassageAnchor,PassagePart,CommandReceipt,RecordLink,WorkspaceCommand,WorkspaceRecord} from './contracts';
export type NoteDraft={learningScope?:LearningScope;body:string;title:string;links:RecordLink[];anchor?:PassageAnchor;baseRev:number;dirty:boolean;syncQueued?:boolean;intent:'create'|'update';bodyFormat?:'markdown-v1';attachmentSections?:ArticleSection[];inlineImages?:PassagePart[];imageReselectRequired?:boolean;sequence:number;dirtySince?:number;editedAt?:number;paused?:boolean;message?:string;creationContext?:{title:string;link:RecordLink};optionalTaskLink?:{title:string;link:RecordLink}};
export function sameNoteContext(a:RecordLink,b:RecordLink){return a.family===b.family&&a.id===b.id&&a.rendition===b.rendition&&a.sectionId===b.sectionId&&a.partId===b.partId;}
/** Freeze author intent when the draft is created; navigation is never a relationship write. */
export function newNoteDraft(context?:WorkspaceRecord|null,link?:RecordLink,links?:RecordLink[],optionalTaskLink?:{title:string;link:RecordLink},anchor?:PassageAnchor):NoteDraft{
 const frozen=structuredClone(links??(context?[link??{family:context.family,id:context.id}]:[]));
 const primary=frozen[0];
 return {body:'',title:'',links:frozen,baseRev:0,dirty:false,intent:'create',bodyFormat:'markdown-v1',sequence:0,...(anchor?{anchor:structuredClone(anchor)}:{}),...(context&&primary?{creationContext:{title:context.title,link:structuredClone(primary)}}:{}),...(context&&!['investigation','journey'].includes(context.family)&&optionalTaskLink?{optionalTaskLink:structuredClone(optionalTaskLink)}:{})};
}
/** The compact status describes the latest buffer, separately from explanatory recovery text. */
export function noteSavePresentation(draft:NoteDraft|undefined,flight:NoteFlight|undefined,locallyRetained:boolean,running=false){
 if(!draft)return 'Ready to write';
 if(flight)return running||!draft.paused?'Saving…':'Save unconfirmed';
 if(draft.paused)return draft.dirty?'Not saved online':'Compare saved versions';
 if(draft.dirty)return !locallyRetained?'In memory only':draft.syncQueued?'Saving…':'On this device';
 return draft.baseRev?'Saved':'Ready to write';
}
/** Local retention happens on every change; remote saves wait for a pause, bounded during long writing. */
export function noteSaveDelay(draft:Pick<NoteDraft,'dirtySince'|'editedAt'>,now=Date.now()){
 return Math.max(0,Math.min(650-(now-(draft.editedAt??draft.dirtySince??now)),4000-(now-(draft.dirtySince??now))));
}
/** Continuing to write cannot resolve or conceal a rejected/uncertain save. */
export function editedNoteDraft(current:NoteDraft,update:Partial<NoteDraft>,now=Date.now()):NoteDraft{
 return {...current,...update,dirty:true,dirtySince:current.dirtySince??now,editedAt:now,sequence:current.sequence+1,
  message:current.paused&&update.paused!==false?current.message:update.message??'Writing is queued for autosave.'};
}
export type NoteFlight={command:WorkspaceCommand;sequence:number;sent:NoteDraft};
/** Editing prose never reclassifies an existing Note's immutable evidence/provenance status. */
export function noteSaveCommand(draft:NoteDraft,id:string,operationId:string,newNoteId:string,attachment:{sections?:ArticleSection[];patch?:ContentPatch[]}={}):WorkspaceCommand{
 return {operationId,action:draft.intent==='create'?'create':'update',family:'note',id:draft.intent==='create'?newNoteId:id,
  ...(draft.intent==='update'?{expectedRev:draft.baseRev}:{}),
  data:{title:draft.title.trim()||'Untitled note',body:draft.body,...(draft.bodyFormat?{bodyFormat:draft.bodyFormat}:{}),links:draft.links,...attachment,
   ...(draft.intent==='create'&&draft.anchor?{anchor:structuredClone(draft.anchor)}:{}),
   ...(draft.intent==='create'?{synthetic:false,...(draft.learningScope?{learningScope:draft.learningScope}:{})}:{})}};
}
export function savedNoteDraft(record:WorkspaceRecord):NoteDraft{return {...(record.learningScope?{learningScope:record.learningScope}:{}),body:record.body,title:record.title,links:record.links??[],baseRev:record.rev,dirty:false,intent:'update',sequence:0,inlineImages:(record.sections??[]).flatMap(section=>section.parts).filter(part=>parseNoteImagePlacements(record.body).some(marker=>marker.partId===part.id)),...(record.bodyFormat?{bodyFormat:record.bodyFormat}:{})};}
/** Opening an eligible current Note never replaces independently retained writing.
 * Even a clean stale editor may own undo history or a pending image; ask for an
 * explicit comparison instead of silently refreshing its source underneath it. */
export function noteDraftForOpening(record:WorkspaceRecord,retained?:NoteDraft,pending?:NoteFlight):NoteDraft{
 if(!retained)return savedNoteDraft(record);
 if(retained.dirty||retained.paused||pending||retained.baseRev===record.rev)return retained;
 return {...retained,paused:true,message:`Current saved Note is revision ${record.rev}; this retained editor is based on revision ${retained.baseRev}. Compare before writing or choose the saved version.`};
}
export function noteReceiptMatches(flight:NoteFlight,receipt:CommandReceipt){const {command}=flight;if(receipt.operationId!==command.operationId)return false;const ref=receipt.recordRef??(!receipt.replayed&&receipt.record?{family:receipt.record.family,id:receipt.record.id,rev:receipt.record.rev}:undefined);if(!ref||ref.family!=='note'||ref.id!==command.id||!Number.isSafeInteger(ref.rev))return false;if(receipt.record&&(receipt.record.id!==ref.id||receipt.record.family!==ref.family))return false;return ref.rev===(command.action==='create'?1:(command.expectedRev??-2)+1);}
/** A receipt proves the revision committed by THAT operation, never a later fetched head. */
export function reconcileNoteReceipt(local:NoteDraft,flight:NoteFlight,receipt:CommandReceipt):{draft:NoteDraft;conflict:boolean;committedRev?:number}{
 if(!noteReceiptMatches(flight,receipt))return {draft:{...local,paused:true,dirty:true,message:'The receipt did not match the retained Note operation. No revision was inferred.'},conflict:true};
 const committedRev=receipt.recordRef?.rev??(receipt.replayed?undefined:receipt.record?.rev);
 if(receipt.status!=='committed'||!committedRev)return {draft:{...local,paused:true,dirty:true,message:'The exact committed revision is unavailable. Your draft and operation are retained.'},conflict:true};
 const current=receipt.record;
 // Even unchanged body does not allow silently overwriting a concurrent title/link/attachment edit.
 if(current&&current.rev!==committedRev)return {draft:{...local,baseRev:committedRev,intent:'update',paused:true,dirty:true,message:`Your save committed at revision ${committedRev}; current server revision is ${current.rev}. Compare before saving again.`},conflict:true,committedRev};
 const attachments=local.attachmentSections?.map(section=>({...section,parts:section.parts.filter(part=>!flight.sent.attachmentSections?.some(sent=>sent.parts.some(p=>p.id===part.id)))})).filter(section=>section.parts.length);
 const edited=local.sequence!==flight.sequence;
 return {draft:{...local,baseRev:committedRev,intent:'update',dirty:edited,syncQueued:edited,dirtySince:edited?Date.now():undefined,paused:false,attachmentSections:attachments,message:edited?'Newer writing retained · syncing…':`Saved · revision ${committedRev}`},conflict:false,committedRev};
}
export function closeNoteTab(tabs:string[],selected:string|null,id:string){const remaining=tabs.filter(tab=>tab!==id);return {tabs:remaining,selected:selected===id?(remaining.at(-1)??null):selected};}

/** Only a wholly untouched, unsent local draft is eligible for explicit discard. */
export function canDiscardEmptyNote(draft:NoteDraft|undefined,flight?:NoteFlight){return !!draft&&!flight&&!draft.baseRev&&draft.intent==='create'&&!draft.dirty&&!draft.paused&&draft.sequence===0&&!draft.title.trim()&&!draft.body.trim()&&!draft.attachmentSections?.length&&!draft.inlineImages?.length&&!draft.imageReselectRequired;}
