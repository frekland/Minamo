'use client';
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import type {Interactive} from '../lib/project-interactive';
import {ProjectSpeech} from './project-speech';
import {JapaneseFuriganaText} from './japanese-furigana';
import {readingScrollBehavior} from '../lib/presentation-preferences';
import {useInterfaceMotion} from './use-interface-motion';

type Reveal=Extract<Interactive,{type:'language-reveal'}>;
type Pattern=Extract<Interactive,{type:'language-pattern'}>;
type Dialogue=Extract<Interactive,{type:'language-dialogue'}>;

function RevealedDetail({children,enabled}:{children:ReactNode;enabled:boolean}){
 return <motion.div className="pi-detail-reveal" initial={enabled?{height:0,opacity:0}:false} animate={{height:'auto',opacity:1}} exit={enabled?{height:0,opacity:0}:{opacity:0}} transition={{duration:enabled?.2:0,ease:'easeOut'}}>{children}</motion.div>;
}

/** These views only reveal explicitly authored text. No translation, scores or learner records are generated. */
export function LanguageReveal({definition:d}:{definition:Reveal}){
 const [show,setShow]=useState({translation:false,gloss:false,note:false});
 const animate=useInterfaceMotion();
 useEffect(()=>setShow({translation:false,gloss:false,note:false}),[JSON.stringify(d)]);
 return <section className="pi-language" aria-label="Layered language reading">
  <div className="pi-language-line"><p className="pi-language-source" lang={d.source.language??d.language} dir="auto"><JapaneseFuriganaText text={d.source.text}/></p>
  <ProjectSpeech text={d.source.text} language={d.source.language??d.language}/></div>
  <div className="pi-toolbar">
   {d.source.translation&&<button type="button" aria-expanded={show.translation} onClick={()=>setShow(v=>({...v,translation:!v.translation}))}>{show.translation?'Hide':'Show'} translation</button>}
   {d.gloss&&<button type="button" aria-expanded={show.gloss} onClick={()=>setShow(v=>({...v,gloss:!v.gloss}))}>{show.gloss?'Hide':'Show'} word glosses</button>}
   {(d.explanation||d.source.note)&&<button type="button" aria-expanded={show.note} onClick={()=>setShow(v=>({...v,note:!v.note}))}>{show.note?'Hide':'Show'} explanation</button>}
  </div>
  <AnimatePresence initial={false}>{show.translation&&d.source.translation&&<RevealedDetail key="translation" enabled={animate}><p className="pi-language-detail" dir="auto"><strong>Translation</strong> {d.source.translation}</p></RevealedDetail>}</AnimatePresence>
  <AnimatePresence initial={false}>{show.gloss&&d.gloss&&<RevealedDetail key="gloss" enabled={animate}><p className="pi-language-detail" dir="auto"><strong>Glosses</strong> {d.gloss}</p></RevealedDetail>}</AnimatePresence>
  <AnimatePresence initial={false}>{show.note&&(d.explanation||d.source.note)&&<RevealedDetail key="note" enabled={animate}><p className="pi-language-detail" dir="auto"><strong>Context</strong> {[d.explanation,d.source.note].filter(Boolean).join('\n')}</p></RevealedDetail>}</AnimatePresence>
 </section>;
}

export function LanguagePattern({definition:d}:{definition:Pattern}){
 const [chosen,setChosen]=useState<Record<string,string>>(()=>d.examples[0]?.choices??{}),[notes,setNotes]=useState(false);
 useEffect(()=>{setChosen(d.examples[0]?.choices??{});setNotes(false);},[JSON.stringify(d)]);
 const result=d.examples.find(example=>d.slots.every(slot=>example.choices[slot.id]===chosen[slot.id]));
 return <section className="pi-language" aria-label="Authored sentence explorer">
  <div className="pi-language-slots">{d.slots.map(slot=><label key={slot.id}>{slot.label}<select value={chosen[slot.id]??''} onChange={event=>{setChosen(v=>({...v,[slot.id]:event.target.value}));setNotes(false);}}>{slot.choices.map(choice=><option key={choice.id} value={choice.id}>{choice.label}</option>)}</select></label>)}</div>
  {result?<>
   <div className="pi-language-line"><p className="pi-language-source" lang={result.source.language??d.language} dir="auto" aria-live="polite"><JapaneseFuriganaText text={result.source.text}/></p>
   <ProjectSpeech text={result.source.text} language={result.source.language??d.language}/></div>
   {result.source.translation&&<p className="pi-language-detail" dir="auto">{result.source.translation}</p>}
   {result.source.note&&<><button type="button" aria-expanded={notes} onClick={()=>setNotes(v=>!v)}>{notes?'Hide':'Show'} explanation</button>{notes&&<p className="pi-language-detail" dir="auto">{result.source.note}</p>}</>}
  </>:<p role="status">No authored example for this combination. Choose another option.</p>}
  <div className="pi-toolbar"><button type="button" onClick={()=>{setChosen(d.examples[0]?.choices??{});setNotes(false);}}>Reset</button></div>
 </section>;
}

export function LanguageDialogue({definition:d}:{definition:Dialogue}){
 const [count,setCount]=useState(1),[translations,setTranslations]=useState<string[]>([]),[notes,setNotes]=useState<string[]>([]);
 const animate=useInterfaceMotion();
 const toolbar=useRef<HTMLDivElement>(null),shouldFollow=useRef(false);
 useEffect(()=>{setCount(1);setTranslations([]);setNotes([]);},[JSON.stringify(d)]);
 useLayoutEffect(()=>{if(!shouldFollow.current)return;shouldFollow.current=false;const frame=requestAnimationFrame(()=>toolbar.current?.scrollIntoView({behavior:readingScrollBehavior(),block:'end'}));return()=>cancelAnimationFrame(frame);},[count]);
 function toggle(id:string,kind:'translation'|'note'){const setter=kind==='translation'?setTranslations:setNotes;setter(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);}
 return <section className="pi-language" aria-label="Dialogue rehearsal">
  <ol className="pi-dialogue"><AnimatePresence initial={false}>{d.turns.slice(0,count).map((turn,index)=><motion.li key={turn.id} initial={animate&&index>0?{opacity:0,y:8}:false} animate={{opacity:1,y:0}} exit={animate?{opacity:0,y:-4}:{opacity:0}} transition={{duration:animate?.2:0,ease:'easeOut'}}>
   <strong>{turn.speaker}</strong>
   <div className="pi-language-line"><p className="pi-language-source" lang={turn.source.language??d.language} dir="auto"><JapaneseFuriganaText text={turn.source.text}/></p>
   <ProjectSpeech text={turn.source.text} language={turn.source.language??d.language}/></div>
   <div className="pi-toolbar">
    {turn.source.translation&&<button type="button" aria-expanded={translations.includes(turn.id)} onClick={()=>toggle(turn.id,'translation')}>{translations.includes(turn.id)?'Hide':'Show'} translation</button>}
    {(turn.source.note||turn.alternatives?.length)&&<button type="button" aria-expanded={notes.includes(turn.id)} onClick={()=>toggle(turn.id,'note')}>{notes.includes(turn.id)?'Hide':'Show'} context</button>}
   </div>
   <AnimatePresence initial={false}>{translations.includes(turn.id)&&turn.source.translation&&<RevealedDetail key="translation" enabled={animate}><p className="pi-language-detail" dir="auto">{turn.source.translation}</p></RevealedDetail>}</AnimatePresence>
   <AnimatePresence initial={false}>{notes.includes(turn.id)&&<RevealedDetail key="note" enabled={animate}><div className="pi-language-detail">{turn.source.note&&<p>{turn.source.note}</p>}{turn.alternatives?.map((alternative,i)=><p key={i} lang={d.language} dir="auto">Alternative: <JapaneseFuriganaText text={alternative}/></p>)}</div></RevealedDetail>}</AnimatePresence>
  </motion.li>)}</AnimatePresence></ol>
  <div className="pi-toolbar pi-dialogue-actions" ref={toolbar}><button type="button" disabled={count>=d.turns.length} onClick={()=>{shouldFollow.current=true;setCount(n=>Math.min(d.turns.length,n+1));}}>Reveal next turn</button><button type="button" onClick={()=>{shouldFollow.current=false;setCount(1);setTranslations([]);setNotes([]);}}>Restart</button></div>
  <p aria-live="polite" className="pi-card-details">{count} of {d.turns.length} turns visible</p>
 </section>;
}
