'use client';

import {useEffect,useState} from 'react';
import {reduceMotion} from '../lib/presentation-preferences';

/** Honour both the device preference and Minamo's own presentation setting. */
export function useInterfaceMotion(){
 // Consistent server/client first render; enable motion once the user's preference is known.
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const workspace=document.querySelector('.v2-app');
  const update=()=>setEnabled(!reduceMotion());
  update();
  media.addEventListener('change',update);
  const observer=new MutationObserver(update);
  if(workspace)observer.observe(workspace,{attributes:true,attributeFilter:['data-motion']});
  return()=>{media.removeEventListener('change',update);observer.disconnect();};
 },[]);
 return enabled;
}
