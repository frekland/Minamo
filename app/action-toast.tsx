'use client';
import {useEffect,useRef,useState} from 'react';
import {Check} from 'lucide-react';
import './action-toast.css';
export type ActionToast={scope:string;key:string;message:string};
export function notifyActionToast(toast:ActionToast){if(typeof window==='undefined'||!toast.scope||!toast.key||!toast.message)return;window.dispatchEvent(new CustomEvent<ActionToast>('minamo-action-toast',{detail:{...toast,message:toast.message.slice(0,100)}}));}
/** Acknowledgements only. Failed/uncertain writes keep their own persistent recovery controls. */
export default function ActionToastViewport({scope}:{scope:string}){
 const [items,setItems]=useState<ActionToast[]>([]),seen=useRef(new Set<string>());
 useEffect(()=>{setItems([]);seen.current.clear();const timers=new Set<ReturnType<typeof setTimeout>>();const add=(event:Event)=>{const value=(event as CustomEvent<ActionToast>).detail;if(!value||value.scope!==scope||seen.current.has(value.key))return;seen.current.add(value.key);if(seen.current.size>256)seen.current.delete(seen.current.values().next().value!);setItems(old=>[...old.slice(-2),value]);const timer=setTimeout(()=>{setItems(old=>old.filter(item=>item.key!==value.key));timers.delete(timer)},2400);timers.add(timer)};window.addEventListener('minamo-action-toast',add);return()=>{window.removeEventListener('minamo-action-toast',add);for(const timer of timers)clearTimeout(timer)}},[scope]);
 return <div className="mn-action-toasts" role="status" aria-live="polite" aria-atomic="false" aria-relevant="additions">{items.map(item=><div key={item.key} className="mn-action-toast"><Check size={16} aria-hidden="true"/><span>{item.message}</span></div>)}</div>;
}
