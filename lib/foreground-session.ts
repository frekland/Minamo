/** Foreground checks are reads. Transport failures never authorize a workspace switch. */
export type SessionIdentity={scope:string;generation:string;role:'owner'|'learner'};
export type SessionDecision={state:'valid';identity:SessionIdentity}|{state:'transient'}|{state:'fenced'};
const identityText=(value:unknown):value is string=>typeof value==='string'&&value.length>0&&value.length<=1024;
/** Only explicit authentication or identity evidence fences a page; an unavailable check retains it. */
export async function sessionResponseDecision(response:Response,expectedScope:string,expectedGeneration:string):Promise<SessionDecision>{
 if(response.status===403||await workspaceResponseInvalidatesSession(response,expectedScope,expectedGeneration))return {state:'fenced'};
 if(!response.ok)return {state:'transient'};
 let value:any;try{value=await response.json();}catch{return {state:'transient'};}
 if(identityText(value?.scope)&&identityText(value?.generation)&&(value.scope!==expectedScope||value.generation!==expectedGeneration))return {state:'fenced'};
 if(!identityText(value?.scope)||!identityText(value?.generation)||!['owner','learner'].includes(value?.role))return {state:'transient'};
 return {state:'valid',identity:{scope:value.scope,generation:value.generation,role:value.role}};
}
/** An ordinary record permission failure is not an account change; explicit session fences remain immediate. */
export async function workspaceResponseInvalidatesSession(response:Response,expectedScope:string,expectedGeneration:string):Promise<boolean>{
 const principal=response.headers.get('X-Minamo-Principal'),generation=response.headers.get('X-Minamo-Generation');
 if(response.status===401||response.status===403&&principal===null||principal!==null&&principal!==expectedScope||generation!==null&&generation!==expectedGeneration)return true;
 if(response.status!==409)return false;
 try{const data=await response.clone().json() as {code?:string};return data.code==='principal_changed'||data.code==='generation_conflict';}catch{return false;}
}
export type SessionCheckResult=SessionDecision['state']|'skipped'|'disposed';
/** A focus/visibility/poll burst shares one request. Failed checks retain data and use a short retry cooldown. */
export function createSessionMonitor({read,expectedScope,expectedGeneration,onValid,onFence,now=Date.now,cooldownMs=15000,retryMs=3000,timeoutMs=10000}:{read:(signal:AbortSignal)=>Promise<Response>;expectedScope:string;expectedGeneration:string;onValid:(identity:SessionIdentity)=>void;onFence:()=>void;now?:()=>number;cooldownMs?:number;retryMs?:number;timeoutMs?:number}){
 let active=true,fenced=false,nextCheck=0,flight:Promise<SessionCheckResult>|undefined,controller:AbortController|undefined,timer:ReturnType<typeof setTimeout>|undefined;
 return {
  check():Promise<SessionCheckResult>{
   if(!active)return Promise.resolve('disposed');if(fenced)return Promise.resolve('fenced');if(flight)return flight;if(now()<nextCheck)return Promise.resolve('skipped');
   const request=new AbortController();controller=request;timer=setTimeout(()=>request.abort(),timeoutMs);
   flight=Promise.resolve().then(()=>read(request.signal)).then(response=>sessionResponseDecision(response,expectedScope,expectedGeneration)).then(decision=>{
    if(!active)return 'disposed' as const;
    if(decision.state==='fenced'){fenced=true;onFence();return 'fenced' as const;}
    nextCheck=now()+(decision.state==='valid'?cooldownMs:retryMs);
    if(decision.state==='valid')onValid(decision.identity);
    return decision.state;
   }).catch(()=>{if(!active)return 'disposed' as const;nextCheck=now()+retryMs;return 'transient' as const;}).finally(()=>{if(timer!==undefined)clearTimeout(timer);timer=undefined;controller=undefined;flight=undefined;});
   return flight;
  },
  dispose(){active=false;controller?.abort();if(timer!==undefined)clearTimeout(timer);timer=undefined;},
 };
}

/** Existing admitted content can survive an unavailable refresh; definitive access/identity failures cannot. */
export function retainContentAfterReadFailure(status:number|undefined,exactContentAvailable:boolean){return exactContentAvailable&&(status===undefined||status===0||status===408||status===429||status>=500);}

type EventSource=Pick<EventTarget,'addEventListener'|'removeEventListener'>;
type ForegroundOptions={cooldownMs?:number};
/** One browser listener pair, debounced across native focus/visibility event ordering. */
export function createForegroundCoordinator({target,visibilityTarget,isVisible,now=Date.now,setTimer=setTimeout,clearTimer=clearTimeout,delayMs=120}:{target:EventSource;visibilityTarget:EventSource;isVisible:()=>boolean;now?:()=>number;setTimer?:typeof setTimeout;clearTimer?:typeof clearTimeout;delayMs?:number}){
 const subscribers=new Set<{callback:()=>void;cooldownMs:number;last:number}>();let timer:ReturnType<typeof setTimeout>|undefined,listening=false;
 const trigger=()=>{if(!isVisible()||timer!==undefined)return;timer=setTimer(()=>{timer=undefined;if(!isVisible())return;const at=now();for(const entry of [...subscribers])if(at-entry.last>=entry.cooldownMs){entry.last=at;try{entry.callback();}catch{/* One view cannot prevent the session fence from checking. */}}},delayMs);};
 const listen=()=>{if(listening)return;listening=true;target.addEventListener('focus',trigger);target.addEventListener('pageshow',trigger);visibilityTarget.addEventListener('visibilitychange',trigger);};
 const stop=()=>{if(!listening)return;listening=false;target.removeEventListener('focus',trigger);target.removeEventListener('pageshow',trigger);visibilityTarget.removeEventListener('visibilitychange',trigger);if(timer!==undefined)clearTimer(timer);timer=undefined;};
 return {subscribe(callback:()=>void,{cooldownMs=15000}:ForegroundOptions={}){const entry={callback,cooldownMs,last:now()};subscribers.add(entry);listen();return()=>{subscribers.delete(entry);if(!subscribers.size)stop();};},dispose(){subscribers.clear();stop();}};
}
let foreground:ReturnType<typeof createForegroundCoordinator>|undefined;
export function subscribeForeground(callback:()=>void,options?:ForegroundOptions){
 if(typeof window==='undefined'||typeof document==='undefined')return()=>{};
 foreground??=createForegroundCoordinator({target:window,visibilityTarget:document,isVisible:()=>document.visibilityState==='visible'});
 return foreground.subscribe(callback,options);
}
