"use client";
import {useEffect,useId,useRef,useState} from 'react';
import {returnDialogFocus} from './dialog-focus';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ProjectReturnContext} from '../lib/project-return-context';
import {buildTaskGptBrief,exactTaskTarget} from '../lib/layout-gpt-intents';

/** Clipboard-only task intent. The single Notes coordinator remains its own authority. */
export default function TaskGptAction({record,stageId,siteOrigin,returnContext}:{record:WorkspaceRecord;stageId?:string;siteOrigin?:string;returnContext?:ProjectReturnContext}){
 const [open,setOpen]=useState(false),[text,setText]=useState(''),[status,setStatus]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),textarea=useRef<HTMLTextAreaElement>(null),details=useRef<HTMLDetailsElement>(null),heading=useId();
 const identity=JSON.stringify([record.family,record.id,record.rendition,stageId,returnContext]);
 useEffect(()=>{setOpen(false);setText('');setStatus('')},[identity]);
 useEffect(()=>{if(!open)return;const node=dialog.current;node?.showModal();return()=>node?.close()},[open]);
 function close(){dialog.current?.close();setOpen(false);returnDialogFocus(trigger.current)}
 function prepare(){
  try{const brief=buildTaskGptBrief({record,stageId,siteOrigin,returnContext});setText(brief.text);setOpen(true);setStatus('Request prepared. Use Copy task request when you are ready.');}catch(error){setStatus(error instanceof Error?error.message:'The task request could not be prepared.')}
 }
 async function copy(){try{await navigator.clipboard.writeText(text);setStatus('Task request copied. Paste it into a conversation with Minamo connected.')}catch{setStatus('Copy was unavailable. Select the request below to copy it manually.')}}
 const target=exactTaskTarget(record,stageId);
 return <div className="ml-task-gpt"><button ref={trigger} type="button" className="v2-text-button" onClick={prepare} disabled={!target} title={target?undefined:'Choose an exact Project Step or Question'} aria-haspopup="dialog" aria-expanded={open}>Continue with GPT <span aria-hidden>↗</span></button>
  {open&&<dialog ref={dialog} className="v2-dialog ml-gpt-dialog" aria-labelledby={heading} onCancel={event=>{event.preventDefault();close()}}><div className="v2-dialog-header"><h2 id={heading}>Continue with GPT</h2><button type="button" className="v2-icon" onClick={close} aria-label="Close task request">×</button></div><p className="ml-gpt-target">{record.title}</p><p className="ml-gpt-summary">Copy this request into a GPT chat with Minamo connected. Unsaved drafts stay here.</p><details ref={details} className="ml-gpt-request-details"><summary>Inspect the prepared request</summary><label>Task request<textarea ref={textarea} readOnly rows={10} value={text} onFocus={event=>event.currentTarget.select()}/></label></details><p role="status">{status}</p><button type="button" className="v2-secondary" onClick={copy}>Copy task request</button><button type="button" className="v2-text-button" onClick={()=>{if(details.current)details.current.open=true;textarea.current?.focus();textarea.current?.select()}}>Select for manual copy</button><button type="button" className="v2-text-button" onClick={close}>Close</button></dialog>}
 </div>;
}
