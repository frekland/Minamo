"use client";
import {workspaceGenerationFromScope} from "../lib/workspace-generation";
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import ImageManagement from './image-management';
export type ReadingImageViewProps={assetId:string;ownerScope?:string;alt:string;caption?:string;width?:number;height?:number;description:ReactNode;captionContent?:ReactNode;onAvailability?:(available:boolean)=>void};
export function imageGeometry(width?:number,height?:number){return Number.isSafeInteger(width)&&Number.isSafeInteger(height)&&width!>0&&height!>0&&width!<=8192&&height!<=8192&&width!*height!<=33554432?{width:width!,height:height!}:null;}
/** Only a same-origin authenticated asset route; never an external URL or embedded bytes. */
export default function ReadingImageView({assetId,ownerScope,alt,caption,width,height,description,captionContent,onAvailability}:ReadingImageViewProps){
 const figure=useRef<HTMLElement>(null),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),headingId=useId();
 const availability=useRef(onAvailability);availability.current=onAvailability;
 const [retrying,setRetrying]=useState(false),[visible,setVisible]=useState(false),[loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[enlarged,setEnlarged]=useState(false);
 const geometry=imageGeometry(width,height),src='/api/assets/'+encodeURIComponent(assetId)+(ownerScope?'?generation='+encodeURIComponent(workspaceGenerationFromScope(ownerScope)):'');
 useEffect(()=>{const target=figure.current;if(!target)return;if(typeof IntersectionObserver==='undefined'){setVisible(true);return;}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'0px'});observer.observe(target);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(!enlarged)return;const node=dialog.current;node?.showModal();return()=>node?.close();},[enlarged]);
 useEffect(()=>{if(!ownerScope)return;const receive=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope:string;assetId:string}>).detail;if(detail?.ownerScope!==ownerScope||detail.assetId!==assetId)return;dialog.current?.close();setEnlarged(false);setFailed(true);setLoaded(false);setRetrying(false);availability.current?.(false);};window.addEventListener('minamo-image-unavailable',receive);return()=>window.removeEventListener('minamo-image-unavailable',receive);},[ownerScope,assetId]);
 function close(){dialog.current?.close();setEnlarged(false);queueMicrotask(()=>{if(trigger.current&&!trigger.current.disabled)trigger.current.focus();else figure.current?.focus();});}
 function unavailable(){close();setFailed(true);setLoaded(false);setRetrying(false);availability.current?.(false);if(ownerScope)window.dispatchEvent(new CustomEvent("minamo-image-unavailable",{detail:{ownerScope,assetId}}));}
 return <figure ref={figure} tabIndex={-1} className="rn-image-figure">
  {failed?<div className="rn-image-unavailable" role="status"><strong>Image unavailable</strong><p>The image could not be loaded. Access may have changed, or the request may have failed. Its image description and caption are hidden until availability is checked again.</p><button type="button" className="rn-subtle" disabled={retrying} onClick={()=>setRetrying(true)}>{retrying?"Checking image availability…":"Try loading again"}</button>{retrying&&<img className="rn-image-recheck" src={src} alt="" aria-hidden="true" onLoad={()=>{setRetrying(false);setFailed(false);setLoaded(true);setVisible(true);availability.current?.(true);}} onError={unavailable}/>}</div>:<>
   <div className="rn-image-stage" style={geometry?{aspectRatio:`${geometry.width} / ${geometry.height}`} :undefined}>{visible?<img src={src} alt={alt} width={geometry?.width} height={geometry?.height} loading="lazy" decoding="async" onLoad={()=>{setLoaded(true);onAvailability?.(true);}} onError={unavailable}/>:<span className="rn-image-loading">Image loads when it enters view</span>}</div>
   <div className="rn-image-actions"><span>{loaded?'Private image':'Waiting for image'}</span><button ref={trigger} type="button" className="rn-subtle" disabled={!loaded} onClick={()=>setEnlarged(true)} aria-haspopup="dialog">Enlarge image ↗</button></div>
   <div className="rn-image-description"><span>Image description</span>{description}</div>{caption&&<figcaption>{captionContent??caption}</figcaption>}
  </>}
  {ownerScope&&!failed&&<ImageManagement key={ownerScope+":"+assetId} assetId={assetId} ownerScope={ownerScope} onChanged={unavailable}/>}
  {enlarged&&!failed&&<dialog ref={dialog} className="rn-image-dialog" aria-labelledby={headingId} onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target===event.currentTarget)close();}}><div className="rn-image-dialog-header"><h2 id={headingId}>Enlarged image</h2><button type="button" className="rn-subtle" onClick={close} autoFocus>Close</button></div><img src={src} alt={alt} width={geometry?.width} height={geometry?.height} decoding="async" onError={unavailable}/>{caption&&<p>{caption}</p>}</dialog>}
 </figure>;
}
