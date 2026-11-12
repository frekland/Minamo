"use client";
import {closeOnDialogBackdrop} from "../lib/overlay-interactions";
import {useEffect,useId,useRef,useState} from 'react';
import {journeyGoalRequest} from '../lib/journey-goal-request';
import {returnDialogFocus} from './dialog-focus';
export default function JourneyGoalAction(){
 const [open,setOpen]=useState(false),[goal,setGoal]=useState(''),[status,setStatus]=useState('');const modal=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),heading=useId();
 useEffect(()=>{if(!open)return;modal.current?.showModal();return()=>modal.current?.close()},[open]);
 function close(){modal.current?.close();setOpen(false);returnDialogFocus(trigger.current)}
 async function copy(){try{await navigator.clipboard.writeText(journeyGoalRequest(goal));setStatus('Project request copied. Paste it into GPT with Minamo connected.');}catch(error){setStatus((error as Error).message||'Copy unavailable. Select the prepared request below.')}}
 return <div className="le-goal-action"><button ref={trigger} type="button" className="v2-secondary" onClick={()=>setOpen(true)}>Create a project with GPT</button>{open&&<dialog ref={modal} className="v2-dialog ml-gpt-dialog" aria-labelledby={heading} onClick={event=>{closeOnDialogBackdrop(event,close);}} onCancel={event=>{event.preventDefault();close()}}><div className="v2-dialog-header"><h2 id={heading}>What would you like to build or understand?</h2><button type="button" aria-label="Close Project request" onClick={close}>×</button></div><label>Your goal<textarea autoFocus rows={4} maxLength={2000} value={goal} onChange={event=>{setGoal(event.target.value);setStatus('')}} placeholder="I know Java and want to learn Rust by building a small log-analysis CLI."/></label><p>Copy this request into ChatGPT. If Minamo tools are connected, use them; otherwise ask for Markdown and return to Help → Import Markdown.</p><button type="button" className="v2-primary" disabled={!goal.trim()} onClick={copy}>Copy Project request</button>{goal.trim()&&<details><summary>Prepared request / manual copy</summary><textarea aria-label="Prepared Project request" readOnly rows={9} value={journeyGoalRequest(goal)} onFocus={event=>event.currentTarget.select()}/></details>}<p role="status">{status}</p><button type="button" onClick={close}>Close</button></dialog>}</div>;
}
