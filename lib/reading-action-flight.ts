import {useSyncExternalStore} from 'react';

type Flight={operationId:string;promise:Promise<unknown>};
const flights=new Map<string,Flight>(),listeners=new Set<()=>void>();
const publish=()=>{for(const listener of listeners)listener();};
/** Client-only transient locks complement retained operation payloads. Keys include
 * owner/generation and exact target identity; unrelated marks never share a lock. */
export function readingActionBusy(key:string){return flights.has(key);}
export function runReadingAction<T>(key:string,operationId:string,work:()=>Promise<T>):Promise<T>{
 const existing=flights.get(key);if(existing){if(existing.operationId===operationId)return existing.promise as Promise<T>;return Promise.reject(Error('This mark already has a change awaiting acknowledgement.'));}
 const promise=Promise.resolve().then(work).finally(()=>{if(flights.get(key)?.promise===promise){flights.delete(key);publish();}});
 flights.set(key,{operationId,promise});publish();return promise;
}
export function useReadingActionBusy(key:string){return useSyncExternalStore(listener=>{listeners.add(listener);return()=>{listeners.delete(listener)}},()=>readingActionBusy(key),()=>false);}
