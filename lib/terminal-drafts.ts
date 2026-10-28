import {createTerminalCapture,type TerminalCapture} from './note-terminal';
export type TerminalDraft={coordinateMode?:'rich'|'source';identity:string;scope:string;position:number;replaceId?:string;capture:TerminalCapture;open:boolean;error?:string};
type DraftStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
const key=(scope:string,identity:string)=>'minamo-terminal-draft:'+scope+':'+identity;
function ids(storage:DraftStorage,base:string):string[]{const value=JSON.parse(storage.getItem(base+':ids')||'[]');if(!Array.isArray(value)||value.length>256||value.some(id=>typeof id!=='string'||!/^[-A-Za-z0-9_.:]{1,160}$/.test(id)))throw Error('Invalid terminal draft index.');return value;}
export function readTerminalDrafts(storage:DraftStorage,scope:string,identity:string):TerminalDraft[]{
 const base=key(scope,identity),list=ids(storage,base),latest=JSON.parse(storage.getItem(base)||'null');if(latest?.capture?.id&&!list.includes(latest.capture.id))list.push(latest.capture.id);
 return list.flatMap(id=>{const value=JSON.parse(storage.getItem(base+':'+id)||'null')??(latest?.capture?.id===id?latest:null);if(!value||value.scope!==scope||value.identity!==identity||!Number.isSafeInteger(value.position)||value.position<0)return[];return [{...value,capture:{...createTerminalCapture({...value.capture,output:value.capture?.output===''?' ':value.capture?.output}),output:value.capture.output},open:false}];});
}
export function persistTerminalDraft(storage:DraftStorage,draft:TerminalDraft){const base=key(draft.scope,draft.identity),value=JSON.stringify({...draft,open:false,error:undefined}),list=ids(storage,base);storage.setItem(base+':'+draft.capture.id,value);storage.setItem(base,value);storage.setItem(base+':ids',JSON.stringify([...new Set([...list,draft.capture.id])]));}
/** Publish every destination entry before removing any origin. A failed copy is retryable. */
export function migrateTerminalDrafts(storage:DraftStorage,scope:string,from:string,to:string){
 if(from===to)return;const previous=readTerminalDrafts(storage,scope,from);for(const draft of previous){const raw=storage.getItem(key(scope,to)+':'+draft.capture.id),existing=raw?JSON.parse(raw):null;if(existing?.scope===scope&&existing.identity===to&&existing.capture?.id===draft.capture.id&&JSON.stringify(existing.capture)!==JSON.stringify(draft.capture))throw Error('Terminal draft identity conflict; both originals are retained.');persistTerminalDraft(storage,existing?.scope===scope&&existing.identity===to&&existing.capture?.id===draft.capture.id?existing:{...draft,identity:to});}
 const base=key(scope,from);for(const draft of previous)storage.removeItem(base+':'+draft.capture.id);storage.removeItem(base);storage.removeItem(base+':ids');
}
export function removeTerminalDraft(storage:DraftStorage,draft:TerminalDraft){const base=key(draft.scope,draft.identity),list=ids(storage,base);storage.setItem(base+':ids',JSON.stringify(list.filter(id=>id!==draft.capture.id)));const latest=JSON.parse(storage.getItem(base)||'null');if(latest?.capture?.id===draft.capture.id)storage.removeItem(base);storage.removeItem(base+':'+draft.capture.id);}
