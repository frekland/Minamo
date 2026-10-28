/** Ephemeral admitted Library reads. No browser storage, credentials or cross-principal reuse. */
export class LibraryReadFailure extends Error{
 constructor(message:string,readonly status=0,readonly code=''){super(message);this.name='LibraryReadFailure';}
}
export function libraryReadRequiresClear(error:unknown){return error instanceof LibraryReadFailure&&([401,403,404,409].includes(error.status)||/generation|authority|source_unavailable|permission/.test(error.code));}
export type LibraryCached<T>={value:T;at:number};
export function createLibraryReadCache({now=Date.now,maxEntries=24,maxBytes=4_000_000,maxAgeMs=120_000}:{now?:()=>number;maxEntries?:number;maxBytes?:number;maxAgeMs?:number}={}){
 let authority='',epoch=0,bytes=0;
 const entries=new Map<string,LibraryCached<unknown>&{bytes:number}>(),flights=new Map<string,{controller:AbortController;promise:Promise<unknown>}>();
 const remove=(key:string)=>{const old=entries.get(key);if(old){bytes-=old.bytes;entries.delete(key);}};
 const clear=()=>{epoch++;for(const flight of flights.values())flight.controller.abort();flights.clear();entries.clear();bytes=0;};
 function activate(scope:string){if(scope!==authority){clear();authority=scope;}}
 function peek<T>(scope:string,key:string):LibraryCached<T>|undefined{if(scope!==authority)return;const entry=entries.get(key);if(!entry)return;if(now()-entry.at>maxAgeMs){remove(key);return;}entries.delete(key);entries.set(key,entry);return {value:entry.value as T,at:entry.at};}
 function put<T>(scope:string,key:string,value:T){if(scope!==authority)return;let size:number;try{size=new TextEncoder().encode(JSON.stringify(value)).byteLength;}catch{return;}remove(key);if(size>maxBytes)return;entries.set(key,{value,at:now(),bytes:size});bytes+=size;while(entries.size>maxEntries||bytes>maxBytes)remove(entries.keys().next().value!);}
 function read<T>(scope:string,key:string,load:(signal:AbortSignal)=>Promise<T>,{reuseMs=15000,force=false}:{reuseMs?:number;force?:boolean}={}):Promise<T>{
  activate(scope);const cached=peek<T>(scope,key);if(cached&&!force&&now()-cached.at<reuseMs)return Promise.resolve(cached.value);
  const existing=flights.get(key);if(existing)return existing.promise as Promise<T>;
  const captured=epoch,controller=new AbortController();let promise:Promise<T>;
  promise=Promise.resolve().then(()=>load(controller.signal)).then(value=>{if(captured!==epoch||authority!==scope||controller.signal.aborted)throw new LibraryReadFailure('The Library authority changed.',409,'library_authority_changed');put(scope,key,value);return value;}).finally(()=>{if(flights.get(key)?.promise===promise)flights.delete(key);});
  flights.set(key,{controller,promise});return promise;
 }
 return {activate,peek,put,read,invalidate(scope:string){if(scope===authority)clear();},stats(){return {entries:entries.size,bytes,pending:flights.size,authority};}};
}

/** Keep permission invalidation active while the Library itself is unmounted. */
export function bindLibraryCacheInvalidation(cache:ReturnType<typeof createLibraryReadCache>,target:Pick<EventTarget,'addEventListener'|'removeEventListener'>){
 const invalidate=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string;command?:{family?:string}}>).detail;if(typeof detail?.ownerScope!=='string')return;if(event.type==='minamo-record-committed'&&!['article','area','source'].includes(detail.command?.family??''))return;cache.invalidate(detail.ownerScope);};
 for(const type of ['minamo-source-unavailable','minamo-image-unavailable','minamo-record-committed'])target.addEventListener(type,invalidate);
 return()=>{for(const type of ['minamo-source-unavailable','minamo-image-unavailable','minamo-record-committed'])target.removeEventListener(type,invalidate);};
}
