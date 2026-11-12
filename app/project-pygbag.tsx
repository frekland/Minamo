"use client";
import {useEffect,useRef,useState} from 'react';
import {isolatedPygbagDocument} from '../lib/pygbag-package';
import {generationFetch} from '../lib/workspace-generation';
import {clientId} from '../lib/client-id';
import {privateMediaUrl} from '../lib/media-client';
export default function ProjectPygbag({assetId,digest,scope}:{assetId:string;digest:string;scope:string}){const [src,setSrc]=useState<string>(),[status,setStatus]=useState('Press Run to load this packaged artefact.'),[busy,setBusy]=useState(false),[problem,setProblem]=useState(''),frame=useRef<HTMLIFrameElement>(null),serial=useRef(0),timeout=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),startup=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),runtimeToken=useRef('');
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.source!==frame.current?.contentWindow||event.data?.minamoPygbag!==runtimeToken.current)return;const phase=event.data.phase;if(phase==='error'){stop();setStatus('The game could not open. Try again, or inspect the details.');setProblem(String(event.data.detail||'Runtime startup failed.').slice(0,1000));}else if(phase==='surface'){clearTimeout(startup.current);setStatus('Game surface opened. Click inside to interact.');}else if(phase==='loader')setStatus('Runtime downloaded. Preparing the game…');};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[]);
 function stop(){runtimeToken.current='';setProblem('');serial.current++;clearTimeout(timeout.current);clearTimeout(startup.current);setSrc(undefined);setBusy(false);setStatus('Stopped.');}
 useEffect(()=>()=>{serial.current++;clearTimeout(timeout.current);clearTimeout(startup.current);},[]);
 async function run(){stop();setProblem('');const seq=serial.current;setBusy(true);setStatus('Loading admitted package…');try{const r=await generationFetch(scope,privateMediaUrl(assetId,scope));if(!r.ok)throw Error('Package unavailable.');const bytes=await r.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');if(hash!==digest)throw Error('Package digest does not match its saved definition.');runtimeToken.current=clientId();const html=isolatedPygbagDocument(new TextDecoder('utf-8',{fatal:true}).decode(bytes),runtimeToken.current);if(seq!==serial.current)return;setSrc(html);startup.current=setTimeout(()=>{if(serial.current!==seq)return;stop();setStatus('The game did not open within one minute. Try again when the runtime is available.');setProblem('No game surface was reported by the isolated frame before the startup deadline. Execution is unconfirmed.');},60000);setStatus('Runtime loading. The package may require a click in its canvas to start. Stop removes the isolated frame.');timeout.current=setTimeout(()=>{if(serial.current===seq){stop();setStatus('Runtime stopped at the five-minute budget. Restart to run again.');}},300000);}catch(e){if(seq===serial.current)setStatus((e as Error).message);}finally{if(seq===serial.current)setBusy(false);}}
 return <div className="pi-pygbag">
  <div className="pi-pygbag-stage">
   {src?<iframe key={serial.current} ref={frame} title="Isolated packaged pygame-ce artefact" sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={src} />:
    <div className="pi-artifact-placeholder">
     <span className="pi-artifact-symbol" aria-hidden="true">▷</span>
     <strong>{busy?'Preparing the game…':problem?'Game unavailable':'Ready to play'}</strong>
     <span>{busy?'Checking the saved package before it starts.':'Open this packaged pygame-ce artefact in an isolated game frame.'}</span>
     <button type="button" disabled={busy} onClick={()=>void run()}>{busy?'Loading…':'Run game'}</button>
    </div>}
  </div>
  <div className="pi-toolbar pi-artifact-toolbar">
   <button type="button" disabled={busy||!src} onClick={()=>void run()}>Restart</button>
   <button type="button" disabled={!src&&!busy} onClick={stop}>Stop</button>
   <button type="button" disabled={!src} onClick={()=>frame.current?.focus()}>Focus game</button>
  </div>
  <p className="pi-artifact-status" role={problem?'alert':'status'}>{status}</p>{problem&&<details className="pi-artifact-details"><summary>Game startup details</summary><p>{problem}</p></details>}
  <p className="pi-artifact-footnote">Escape leaves browser pointer/fullscreen modes. The frame stops after five minutes; in-game state is not saved.</p>
 </div>;}
