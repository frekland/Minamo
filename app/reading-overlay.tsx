"use client";
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {placeReadingInteraction,type ReadingRect} from './reading-position';
import {overlayEscape} from '../lib/overlay-interactions';
export default function ReadingOverlay({children,anchor,className='',label,onEscape,elementRef,onPointerEnter,onPointerLeave,onInteract}:{children:ReactNode;anchor:()=>ReadingRect|null;className?:string;label:string;onEscape:()=>void;elementRef?:RefObject<HTMLDivElement|null>;onPointerEnter?:()=>void;onPointerLeave?:()=>void;onInteract?:()=>void}){
 const own=useRef<HTMLDivElement>(null),ref=elementRef??own;const [position,setPosition]=useState<{left:number;top:number;width:number;maxHeight:number}|null>(null);
 const latest=useRef({anchor,onEscape});latest.current={anchor,onEscape};const requestPosition=useRef<()=>void>(()=>{});
 useLayoutEffect(()=>{
  let frame:number|null=null,disposed=false;
  const update=()=>{frame=null;if(disposed)return;const node=ref.current,rect=latest.current.anchor();if(!node||!rect||rect.width<=0&&rect.height<=0){setPosition(null);return;}const view=window.visualViewport,viewport={left:view?.offsetLeft??0,top:view?.offsetTop??0,width:view?.width??window.innerWidth,height:view?.height??window.innerHeight};const next=placeReadingInteraction(rect,Math.min(className.includes('toolbar')?230:410,viewport.width-16),node.offsetHeight||60,viewport);setPosition(old=>old&&old.left===next.left&&old.top===next.top&&old.width===next.width&&old.maxHeight===next.maxHeight?old:next);};
  const schedule=()=>{if(frame===null)frame=requestAnimationFrame(update);};requestPosition.current=schedule;
  const scroll=(event:Event)=>{if(event.target instanceof Node&&ref.current?.contains(event.target))return;schedule();};
  update();const observer=new ResizeObserver(schedule);if(ref.current)observer.observe(ref.current);window.addEventListener('resize',schedule);document.addEventListener('scroll',scroll,{capture:true,passive:true});window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
  return()=>{disposed=true;if(frame!==null)cancelAnimationFrame(frame);requestPosition.current=()=>{};observer.disconnect();window.removeEventListener('resize',schedule);document.removeEventListener('scroll',scroll,true);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);};
 },[className,ref]);
 useLayoutEffect(()=>{requestPosition.current();},[anchor]);
 useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(overlayEscape(event,!!document.querySelector('dialog[open]'))&&ref.current?.contains(document.activeElement)){event.preventDefault();latest.current.onEscape();}};document.addEventListener('keydown',escape);return()=>document.removeEventListener('keydown',escape);},[ref]);
 if(typeof document==='undefined')return null;return createPortal(<div ref={ref} className={'ri-overlay '+className} role="dialog" aria-label={label} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerDown={onInteract} style={{position:'fixed',left:position?.left??8,top:position?.top??8,width:position?.width??230,maxHeight:position?.maxHeight??'80dvh',visibility:position?'visible':'hidden'}}>{children}</div>,document.body);
}
