"use client";
import {useState,type ReactNode} from 'react';
import {TERMINAL_PROVENANCE,terminalDisplayText,terminalLineCount,parseNoteTerminalPlacements,type TerminalCapture} from '../lib/note-terminal';
/** Reuse the semantic terminal view in organiser previews, including Trash. */
export function NoteBodyPreview({source}:{source:string}){
 const content:ReactNode[]=[];let offset=0;
 for(const placement of parseNoteTerminalPlacements(source)){
  if(placement.from>offset)content.push(<span key={'text-'+offset}>{source.slice(offset,placement.from)}</span>);
  content.push(<NoteTerminalView key={'terminal-'+placement.from} capture={placement.capture}/>);offset=placement.to;
 }
 if(offset<source.length)content.push(<span key={'text-'+offset}>{source.slice(offset)}</span>);
 return <>{content}</>;
}
export default function NoteTerminalView({capture,children}:{capture:TerminalCapture;children?:ReactNode}){
 const [copied,setCopied]=useState('');const display=terminalDisplayText(capture.output);
 return <section className="nw-terminal" aria-label={'Terminal evidence '+(capture.label||capture.id)} data-terminal-capture={capture.id}>
  <details><summary>Terminal output{capture.environment?' · '+capture.environment:''} · {terminalLineCount(capture.output)} lines{capture.label?' · '+capture.label:''}<span className="nw-terminal-disclosure">Expand / Collapse</span></summary>
   {capture.command&&<div className="nw-terminal-command">Command: <code>{terminalDisplayText(capture.command)}</code></div>}
   <pre tabIndex={0} aria-label="Saved terminal output"><code>{children??display}</code></pre>
  </details>
  <div className="nw-terminal-preview" aria-hidden="true">{display.split('\n').slice(0,2).join('\n').slice(0,180)}</div>
  <footer><small>{TERMINAL_PROVENANCE}. Display shows controls as escaped text; Copy preserves original text.</small><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(capture.output);setCopied('Output copied.')}catch{setCopied('Copy unavailable. Expand output to select text.')}}}>Copy output</button><span role="status">{copied}</span></footer>
 </section>;
}
