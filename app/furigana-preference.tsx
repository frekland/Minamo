'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import './furigana-preference.css';

const key='minamo-reading-furigana-v1';
const Context=createContext<{enabled:boolean;toggle:()=>void;setVisible:(next:boolean)=>void}>({enabled:true,toggle:()=>{},setVisible:()=>{}});
export function useGlobalFurigana(){return useContext(Context).enabled;}
export function useFuriganaPreference(){return useContext(Context);}
export function FuriganaProvider({children}:{children:ReactNode}){
 const [enabled,setEnabled]=useState(true);
 useEffect(()=>{try{setEnabled(localStorage.getItem(key)!=='off');}catch{}},[]);
 function persist(next:boolean){setEnabled(next);try{localStorage.setItem(key,next?'on':'off');}catch{}}
 function toggle(){persist(!enabled);}
 return <Context.Provider value={{enabled,toggle,setVisible:persist}}><div className={enabled?'minamo-furigana-on':'minamo-furigana-off'}>{children}</div></Context.Provider>;
}
export function FuriganaControl({visible}:{visible:boolean}){
 const {enabled,toggle}=useContext(Context);
 if(!visible)return null;
 return <button className="v2-icon minamo-furigana-toggle" type="button" aria-label={enabled?'Hide furigana':'Show furigana'} aria-pressed={enabled} title={enabled?'Hide furigana':'Show furigana'} onClick={toggle}><span lang="ja" aria-hidden="true">{enabled?<ruby>漢<rt>かん</rt></ruby>:'漢'}</span></button>;
}
