import type {JapaneseToken} from './japanese-token-readings';
let worker:Worker|undefined,failed=false,serial=0;
const cache=new Map<string,Promise<JapaneseToken[]>>(),pending=new Map<number,{resolve:(tokens:JapaneseToken[])=>void;reject:()=>void;timer:ReturnType<typeof setTimeout>}>();
function stop(){failed=true;worker?.terminate();worker=undefined;for(const p of pending.values()){clearTimeout(p.timer);p.reject();}pending.clear();cache.clear();}
/** In-memory only. Text stays in a same-origin worker; no remote service or storage. */
export function tokenizeJapanese(text:string):Promise<JapaneseToken[]>{
 if(failed||typeof Worker==='undefined'||text.length>12000)return Promise.reject(Error('Tokenizer unavailable'));
 const saved=cache.get(text);if(saved)return saved;
 if(!worker){try{worker=new Worker('/japanese-tokenizer.worker.js');worker.onmessage=event=>{const p=pending.get(event.data?.id);if(!p)return;clearTimeout(p.timer);pending.delete(event.data.id);if(Array.isArray(event.data.tokens)&&event.data.tokens.length<=12000)p.resolve(event.data.tokens);else p.reject();};worker.onerror=stop;}catch{stop();return Promise.reject(Error('Tokenizer unavailable'));}}
 const id=++serial;
 const result=new Promise<JapaneseToken[]>((resolve,reject)=>{const timer=setTimeout(stop,60000);pending.set(id,{resolve,reject:()=>reject(Error('Tokenizer unavailable')),timer});worker!.postMessage({id,text});});
 if(cache.size>=256)cache.delete(cache.keys().next().value!);cache.set(text,result);return result;
}
