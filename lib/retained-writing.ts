import {NOTE_DRAFT_PREFIX,LEGACY_NOTE_DRAFT_PREFIX} from './note-draft-keys';
import {validWorkspaceGeneration,workspaceGenerationFromScope,workspaceOwnerScope} from './workspace-generation';
export type RetainedWritingKind='note'|'annotation';
export type RetainedWritingItem={id:string;kind:RetainedWritingKind;generation:string;text:string;truncated:boolean;originalLength:number};
export type RetainedWritingStorage=Pick<Storage,'length'|'key'|'getItem'>;
export type RetainedWritingReview={items:RetainedWritingItem[];scanned:number;nextIndex:number|null;limited:boolean;unreadable:number};
const prefixes={note:NOTE_DRAFT_PREFIX,legacyNote:LEGACY_NOTE_DRAFT_PREFIX,capture:'minamo-v2-capture-draft-v2:',annotation:'minamo-v2-inline-annotation-v1:'} as const;
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/;
/** Strict exact-owner matching: no broad prefix scan, unscoped keys, other-owner keys or current generation. */
export function retainedWritingKey(key:string,currentScope:string):{kind:keyof typeof prefixes;generation:string}|null{
 const owner=workspaceOwnerScope(currentScope),current=workspaceGenerationFromScope(currentScope);if(!/^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}$/.test(owner)||owner==="signed-out")throw Error("An authenticated owner-scoped browser review is required.");
 for(const [kind,prefix] of Object.entries(prefixes) as [keyof typeof prefixes,string][]){if(!key.startsWith(prefix))continue;const rest=key.slice(prefix.length);let token:string|null=null;
  if(kind==='annotation'){
   const legacy=owner+':';if(!rest.startsWith(legacy))return null;const tail=rest.slice(legacy.length);
   if(tail.startsWith('generation:')){const match=/^generation:(.+@[0-9]+):([A-Za-z0-9][A-Za-z0-9_.:-]{0,159})$/.exec(tail);if(!match||!validWorkspaceGeneration(match[1]))return null;token=match[1];}
   else if(idPattern.test(tail))token='legacy@0';
  }else if(rest===owner||(kind==='note'&&rest.startsWith(owner+':writer:')&&idPattern.test(rest.slice((owner+':writer:').length))))token='legacy@0';else if(rest.startsWith(owner+':generation:')){const candidate=rest.slice((owner+':generation:').length);const match=/^(.+@[0-9]+)(?::writer:([A-Za-z0-9][A-Za-z0-9_.:-]{0,159}))?$/.exec(candidate);if(match&&validWorkspaceGeneration(match[1])&&(kind==='note'||!match[2]))token=match[1];}
  return token&&token!==current&&Number(token.slice(token.lastIndexOf("@")+1))<Number(current.slice(current.lastIndexOf("@")+1))?{kind,generation:token}:null;
 }return null;
}
function safePrefix(text:string,length:number){let end=Math.min(text.length,length);if(end>0&&end<text.length&&text.charCodeAt(end-1)>=0xD800&&text.charCodeAt(end-1)<=0xDBFF&&text.charCodeAt(end)>=0xDC00&&text.charCodeAt(end)<=0xDFFF)end--;return text.slice(0,end);}
/** Read-only, bounded projection of known independently authored browser fields. Never traverses pending/source/selection objects. */
export function reviewRetainedWriting(storage:RetainedWritingStorage,currentScope:string,options:{startIndex?:number;maxKeys?:number;maxItems?:number;maxBodyChars?:number;maxTotalChars?:number;maxEntryChars?:number;maxParseChars?:number}={}):RetainedWritingReview{
 const integer=(value:number|undefined,fallback:number,max:number)=>Number.isSafeInteger(value)&&value!>0?Math.min(value!,max):fallback;
 const start=Number.isSafeInteger(options.startIndex)&&options.startIndex!>=0?options.startIndex!:0,maxKeys=integer(options.maxKeys,256,1024),maxItems=integer(options.maxItems,40,80),maxBody=integer(options.maxBodyChars,20000,40000),maxTotal=integer(options.maxTotalChars,160000,320000),maxEntry=integer(options.maxEntryChars,262144,524288),maxParse=integer(options.maxParseChars,1048576,2097152);
 const items:RetainedWritingItem[]=[],duplicates=new Set<string>();let scanned=0,unreadable=0,total=0,parsed=0,limited=false,index=start;
 const count=storage.length;workspaceOwnerScope(currentScope);
 const add=(key:string,suffix:string,kind:RetainedWritingKind,token:string,body:unknown)=>{if(typeof body!=='string'||!body.trim())return;const duplicate=JSON.stringify([kind,token,suffix,body]);if(duplicates.has(duplicate))return;duplicates.add(duplicate);if(items.length>=maxItems||total>=maxTotal){limited=true;return;}const text=safePrefix(body,Math.min(maxBody,maxTotal-total));if(!text){limited=true;return;}const truncated=text.length<body.length;if(truncated)limited=true;items.push({id:key+'\0'+suffix,kind,generation:token,text,truncated,originalLength:body.length});total+=text.length;};
 for(;index<count&&scanned<maxKeys;index++){scanned++;let key:string|null;try{key=storage.key(index);}catch{unreadable++;continue;}if(!key)continue;const match=retainedWritingKey(key,currentScope);if(!match)continue;let value:unknown;try{const raw=storage.getItem(key);if(raw===null)continue;if(raw.length>maxEntry){limited=true;continue;}if(parsed+raw.length>maxParse){limited=true;break;}parsed+=raw.length;value=JSON.parse(raw);}catch{unreadable++;continue;}if(!object(value))continue;
  if(match.kind==='note'||match.kind==='legacyNote'){if(!object(value.drafts))continue;let seen=0;for(const draftId in value.drafts){if(!Object.hasOwn(value.drafts,draftId))continue;if(++seen>80){limited=true;break;}const draft=value.drafts[draftId];if(object(draft))add(key,draftId,'note',match.generation,draft.body);}}
  else if(match.kind==='capture')add(key,'prose','annotation',match.generation,value.prose);
  else add(key,'body','annotation',match.generation,value.body);
 }
 const nextIndex=index<count?index:null;if(nextIndex!==null)limited=true;return{items,scanned,nextIndex,limited,unreadable};
}
