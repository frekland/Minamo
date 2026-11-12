import type {WorkspaceRecord} from './contracts';
/** A current eligibility projection may redact media without changing authored revision. */
export function planReadingRefresh(previous:WorkspaceRecord|null,incoming:WorkspaceRecord){
 if(!previous||previous.family!==incoming.family||previous.id!==incoming.id)return {display:incoming,newer:false,needsRetained:false};
 if(incoming.rev<previous.rev)return {display:previous,newer:false,needsRetained:!!previous.rendition&&previous.rendition!==incoming.rendition};
 if(!previous.rendition||previous.rendition===incoming.rendition)return {display:incoming,newer:false,needsRetained:false};
 return {display:previous,newer:true,needsRetained:true};
}
