"use client";
import {closeOnDialogBackdrop} from "../lib/overlay-interactions";
import {useEffect,useId,useRef,type ReactNode} from 'react';
import {X} from 'lucide-react';
import './project-overlays.css';

/** Native modality supplies focus containment, inert background and Escape semantics. */
export default function ProjectDialog({title,children,onClose,kind='sheet'}:{title:string;children:ReactNode;onClose:()=>void;kind?:'sheet'|'map'|'reading'}){
 const dialog=useRef<HTMLDialogElement>(null),heading=useId();
 useEffect(()=>{const opener=document.activeElement instanceof HTMLElement?document.activeElement:null,node=dialog.current;node?.showModal();return()=>{node?.close();if(opener?.isConnected)opener.focus();};},[]);
 return <dialog ref={dialog} className={'project-dialog project-dialog-'+kind} aria-labelledby={heading} onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{closeOnDialogBackdrop(event,onClose);}}><header className="project-dialog-header"><h2 id={heading}>{title}</h2><button type="button" className="v2-icon" aria-label={'Close '+title.toLowerCase()} onClick={onClose} autoFocus><X size={20}/></button></header><div className="project-dialog-body">{children}</div></dialog>;
}
