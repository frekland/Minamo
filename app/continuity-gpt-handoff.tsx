"use client";
import {useEffect,useRef,useState} from 'react';
import {buildContinuityGptBrief,evidenceChoiceKey} from '../lib/continuity-gpt-brief';
import type {LearningSpaceSelection} from '../lib/learning-space-navigation';
import type {EvidenceFocus,EvidencePage} from './continuity-sources';
import {closeOnDialogBackdrop} from '../lib/overlay-interactions';

/** Explicit owner selection; no prose is sent, persisted, fetched or copied on navigation. */
export default function ContinuityGptHandoff({page,selection,focus}:{page:EvidencePage;selection:LearningSpaceSelection;focus?:EvidenceFocus}){
 const [open,setOpen]=useState(false),[chosen,setChosen]=useState<string[]>([]),[brief,setBrief]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),trigger=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDialogElement>(null);
 const sourceKey=JSON.stringify([page.asOf,page.generation,page.snapshotVersion,focus,selection,page.items.map(item=>[evidenceChoiceKey(item),item.source.rev,item.source.rendition,item.checkpoint?.status])]);
 const previous=useRef(sourceKey);
 useEffect(()=>{if(previous.current===sourceKey)return;previous.current=sourceKey;setChosen([]);setBrief('');setStatus('');setOpen(false);},[sourceKey]);
 useEffect(()=>{if(!open)return;dialog.current?.showModal();return()=>dialog.current?.close();},[open]);
 function close(){dialog.current?.close();setOpen(false);trigger.current?.focus();}
 function toggle(key:string,checked:boolean){setChosen(old=>checked?[...old.filter(x=>x!==key),key].slice(0,6):old.filter(x=>x!==key));setBrief('');setStatus('Source selection changed. Prepare the new request.');}
 async function prepare(copy:boolean){setBusy(true);try{const result=buildContinuityGptBrief(page,selection,chosen,focus);setBrief(result);if(copy){try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(result);setStatus('Request copied. Paste it into ChatGPT with Minamo tools connected.');}catch{setStatus('Clipboard unavailable. Select and copy the request manually.');}}else setStatus('Request prepared. No learning record or relationship was changed.');}catch(error){setStatus(error instanceof Error?error.message:'The selected sources could not be prepared.');}finally{setBusy(false);}}
 if(!page.items.length)return null;
 return <div className="continuity-gpt">
  <button ref={trigger} type="button" className="v2-text-button" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>Discuss selected sources with GPT</button>
  {open&&<dialog ref={dialog} className="v2-dialog continuity-gpt-dialog" aria-label="Discuss recorded sources with GPT" onCancel={event=>{event.preventDefault();close();}} onClick={event=>closeOnDialogBackdrop(event,close)}><div className="continuity-gpt-body">
   <h2>Choose recorded sources</h2><p>Select up to six sources for a bounded GPT discussion. The request contains exact identities and coverage limits—not copied private Note text. GPT must reread eligible originals through Minamo.</p>
   <div className="continuity-gpt-choices" role="group" aria-label="Recorded sources to discuss">{page.items.slice(0,24).map(item=>{const key=evidenceChoiceKey(item),checked=chosen.includes(key);return <label key={key}><input type="checkbox" checked={checked} disabled={!checked&&chosen.length>=6} onChange={event=>toggle(key,event.currentTarget.checked)}/><span>{item.title} <small>{item.checkpoint?'Saved checkpoint · '+item.checkpoint.status:item.source.family} · {new Date(item.at).toLocaleDateString('en-GB')}</small></span></label>;})}</div>
   {page.items.length>24&&<p>Only the first 24 displayed sources can be selected here. Open another source directly for a focused discussion.</p>}
   <p className="continuity-gpt-coverage">{page.coverage.moreAvailable||page.coverage.moreTargetsAvailable||!page.coverage.completeWithinScope?'Evidence is partial; do not infer absence from this page.':'The declared scan is enumerated; external and unsaved activity remain unknown.'}</p>
   <div className="continuity-gpt-actions"><button type="button" className="v2-secondary" disabled={!chosen.length||busy} onClick={()=>void prepare(false)}>Prepare request</button><button type="button" className="v2-primary" disabled={!chosen.length||busy} onClick={()=>void prepare(true)}>{busy?'Preparing…':'Prepare and copy'}</button></div>
   {brief&&<label>Discussion request<textarea readOnly value={brief} rows={8} onFocus={event=>event.currentTarget.select()}/></label>}
   {status&&<p role="status">{status}</p>}
   <div className="continuity-gpt-actions"><a href="https://chatgpt.com/" rel="noopener noreferrer" target="_blank">Open ChatGPT</a><button type="button" className="v2-text-button" onClick={close}>Close</button></div>
  </div></dialog>}
 </div>;
}
