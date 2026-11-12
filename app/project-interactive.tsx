"use client";
import {lazy,Suspense,useEffect,useState} from 'react';
import {motion} from 'motion/react';
import {validateInteractive,type Interactive} from '../lib/project-interactive';
import type {PassagePart} from '../lib/contracts';
import {workspaceGenerationFromScope} from '../lib/workspace-generation';
import {stageImage} from '../lib/asset-client';
import {stageMedia} from '../lib/media-client';
import {PYGBAG_MIME,PYGBAG_RUNTIME} from '../lib/pygbag-package';
import {clientId} from '../lib/client-id';
import {LanguageReveal,LanguagePattern,LanguageDialogue} from './project-language';
import {ProjectSpeech} from './project-speech';
import {JapaneseFuriganaText} from './japanese-furigana';
import {isTargetFlashcardFace} from '../lib/language-speech';
import LoadingSkeleton from './loading-skeleton';
import {useInterfaceMotion} from './use-interface-motion';
const Drawing=lazy(()=>import('./project-drawing')),Canvas=lazy(()=>import('./project-canvas')),Pygbag=lazy(()=>import('./project-pygbag'));
export function ProjectInteractive({definition,scope,identity,projectTarget}:{definition:Interactive;scope:string;identity:string;projectTarget?:{projectId:string;sectionId:string;partId:string}}){const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);if(!mounted)return <LoadingSkeleton kind="outline" label="Loading interactive material…"/>;return <div className="pi-host" data-reading-exclude="true"><Suspense fallback={<LoadingSkeleton kind="outline" label="Loading interactive material…"/>}>{definition.type==='flashcards'?<Flashcards d={definition} scope={scope}/>:definition.type==='language-reveal'?<LanguageReveal definition={definition}/>:definition.type==='language-pattern'?<LanguagePattern definition={definition}/>:definition.type==='language-dialogue'?<LanguageDialogue definition={definition}/>:definition.type==='drawing'?<Drawing key={scope+definition.noteId} noteId={definition.noteId} scope={scope}/>:definition.type==='pygbag'?<Pygbag key={definition.assetId+definition.digest} assetId={definition.assetId} digest={definition.digest} scope={scope}/>:<Canvas definition={definition} scope={scope} identity={identity} projectTarget={projectTarget}/>}</Suspense></div>;}
function Flashcards({d,scope}:{d:Extract<Interactive,{type:'flashcards'}>;scope:string}){
 const [order,setOrder]=useState(()=>d.cards.map(c=>c.id)),[at,setAt]=useState(0),[back,setBack]=useState(false),[reverse,setReverse]=useState(false),[clozeMode,setClozeMode]=useState(false);
 const animate=useInterfaceMotion();
 useEffect(()=>{setOrder(d.cards.map(c=>c.id));setAt(0);setBack(false);setReverse(false);setClozeMode(false);},[JSON.stringify(d)]);
 const card=d.cards.find(c=>c.id===order[at])??d.cards[0],canCloze=d.cards.some(c=>!!c.cloze),isCloze=clozeMode&&!!card.cloze;
 const question=isCloze?{text:card.cloze!.before+'______'+card.cloze!.after}:reverse?card.back:card.front;
 const answer=isCloze?{text:card.cloze!.before+card.cloze!.missing+card.cloze!.after}:reverse?card.front:card.back;
 const face=back?answer:question;
 // A card's language tag belongs to its authored front, not a translation on
 // the back or a cloze prompt containing blanks. Speak only complete target text.
 const targetLanguageVisible=!!card.language&&isTargetFlashcardFace(isCloze,back,reverse);
 function move(n:number){setAt((at+n+order.length)%order.length);setBack(false);}
 function showFace(side:'front'|'back'){
  const isAnswer=side==='back',content=isAnswer?answer:question;
  const speakable=!!card.language&&isTargetFlashcardFace(isCloze,isAnswer,reverse);
  return <span className={'pi-card-side pi-card-'+side} aria-hidden={back!==isAnswer}>
   <span className="pi-card-face">{isAnswer?'Answer':isCloze?'Fill the blank':'Question'}</span>
   <span className="pi-card-text" lang={speakable?card.language:undefined} dir="auto"><JapaneseFuriganaText text={content.text}/></span>
   {'image' in content&&content.image&&<CardImage key={card.id+side+content.image.assetId} image={content.image} scope={scope}/>}
   <span className="pi-card-hint">Tap to {isAnswer?'see the question':'reveal'}</span>
  </span>;
 }
 return <div className="pi-flashcards" tabIndex={0} aria-label="Flashcards" onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key===' '){e.preventDefault();setBack(v=>!v);}}}>
 <p aria-live="polite">Card {at+1} of {order.length} · {back?'Answer':'Question'}{isCloze?' · Complete the sentence':''}</p>
 <motion.div key={card.id+':'+at} className="pi-card-transition" initial={animate?{opacity:.5}:false} animate={{opacity:1}} transition={{duration:animate?.16:0,ease:'easeOut'}} drag={animate&&order.length>1?'x':false} dragConstraints={{left:0,right:0}} dragElastic={0.08} dragMomentum={false} onDragEnd={(_,info)=>{if(Math.abs(info.offset.x)>90||Math.abs(info.velocity.x)>750)move(info.offset.x<0||info.velocity.x< -750?1:-1);}} style={{touchAction:'pan-y'}}>
  <motion.button type="button" className={'pi-card pi-card-flip '+(back?'pi-card-answer':'')} aria-label={(back?'Answer. ':'Question. ')+face.text+'. '+(back?'Show question':'Reveal answer')} aria-pressed={back} onClick={()=>setBack(v=>!v)} initial={false} animate={{rotateY:back?180:0}} transition={{duration:animate?.3:0,ease:'easeInOut'}}>{showFace('front')}{showFace('back')}</motion.button>
  <div className="pi-card-speech-slot">{targetLanguageVisible&&<ProjectSpeech text={face.text} language={card.language}/>}</div>
 </motion.div>
 <div className="pi-toolbar"><button type="button" onClick={()=>move(-1)}>Previous</button><button type="button" aria-pressed={back} onClick={()=>setBack(v=>!v)}>{back?'Show question':'Reveal answer'}</button><button type="button" className="pi-card-next" onClick={()=>move(1)}>Next</button></div><details className="pi-card-options"><summary>Card options</summary><div className="pi-toolbar">{d.reversible&&<button type="button" aria-pressed={reverse} onClick={()=>{setReverse(v=>!v);setBack(false);}}>Reverse sides {reverse?'✓':''}</button>}{canCloze&&<button type="button" aria-pressed={clozeMode} onClick={()=>{setClozeMode(v=>!v);setBack(false);}}>Cloze mode {clozeMode?'✓':''}</button>}<button type="button" onClick={()=>{const next=[...order];for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]];}setOrder(next);setAt(0);setBack(false);}}>Shuffle</button><button type="button" onClick={()=>{setOrder(d.cards.map(c=>c.id));setAt(0);setBack(false);setReverse(false);setClozeMode(false);}}>Reset</button></div></details></div>;
}
function CardImage({image,scope}:{image:{assetId:string;alt:string;caption?:string};scope:string}){const [failed,setFailed]=useState(false);useEffect(()=>{const receive=(event:Event)=>{const d=(event as CustomEvent).detail;if(d?.ownerScope===scope&&d.assetId===image.assetId)setFailed(true);};window.addEventListener('minamo-image-unavailable',receive);return()=>window.removeEventListener('minamo-image-unavailable',receive);},[scope,image.assetId]);return failed?<span className="pi-card-media-fallback">Image unavailable</span>:<img className="pi-card-image" src={'/api/assets/'+encodeURIComponent(image.assetId)+'?generation='+encodeURIComponent(workspaceGenerationFromScope(scope))} alt={image.alt} onError={()=>setFailed(true)}/>;}
export function InteractiveEditor({part,scope,onChange}:{part:PassagePart;scope:string;onChange:(p:PassagePart)=>void}){const d=part.interactive!,[raw,setRaw]=useState(()=>JSON.stringify(d,null,2)),[error,setError]=useState('');useEffect(()=>setRaw(JSON.stringify(d,null,2)),[JSON.stringify(d)]);function replace(value:unknown){try{const next=validateInteractive(value);onChange({...part,interactive:next});setError('');}catch(e){setError((e as Error).message);}}
 async function image(cardId:string,side:'front'|'back',file:File|undefined){if(!file||d.type!=='flashcards')return;try{const a=await stageImage(file,clientId(),undefined,scope);replace({...d,cards:d.cards.map(c=>c.id===cardId?{...c,[side]:{...c[side],image:{assetId:a.assetId,alt:'Card image'}}}:c)});}catch(e){setError((e as Error).message);}}
 async function packageFile(file:File|undefined){if(!file||d.type!=='pygbag')return;try{const a=await stageMedia(new Blob([await file.arrayBuffer()],{type:PYGBAG_MIME}),clientId(),new AbortController().signal,scope);replace({...d,assetId:a.assetId,digest:a.digest,runtime:PYGBAG_RUNTIME});}catch(e){setError((e as Error).message);}}
 return <div className="pi-editor"><label>Explanation / accessible fallback<textarea value={part.text} onChange={e=>onChange({...part,text:e.target.value})}/></label>{d.type==='flashcards'&&<>{d.cards.map(card=><fieldset key={card.id}><legend>Card</legend>{(['front','back'] as const).map(side=><div key={side}><label>{side==='front'?'Question':'Answer'}<textarea value={card[side].text} onChange={e=>replace({...d,cards:d.cards.map(c=>c.id===card.id?{...c,[side]:{...c[side],text:e.target.value}}:c)})}/></label><label>Image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void image(card.id,side,e.target.files?.[0])}/></label>{card[side].image&&<><label>Image description<input value={card[side].image!.alt} onChange={e=>replace({...d,cards:d.cards.map(c=>c.id===card.id?{...c,[side]:{...c[side],image:{...c[side].image!,alt:e.target.value}}}:c)})}/></label><button type="button" onClick={()=>replace({...d,cards:d.cards.map(c=>c.id===card.id?{...c,[side]:{text:c[side].text}}:c)})}>Remove image</button></>}</div>)}<button type="button" disabled={d.cards.length===1} onClick={()=>replace({...d,cards:d.cards.filter(c=>c.id!==card.id)})}>Remove card</button></fieldset>)}<button type="button" onClick={()=>replace({...d,cards:[...d.cards,{id:clientId(),front:{text:'Question'},back:{text:'Answer'}}]})}>Add card</button></>}{d.type==='drawing'&&<label>Saved drawing Note ID<input value={d.noteId} onChange={e=>onChange({...part,interactive:{...d,noteId:e.target.value}})}/></label>}{d.type==='python-canvas'&&<label>Python<textarea rows={12} value={d.code} onChange={e=>onChange({...part,interactive:{...d,code:e.target.value}})}/></label>}{d.type==='pygbag'&&<label>Standalone Pygbag HTML<input type="file" accept=".html" onChange={e=>void packageFile(e.target.files?.[0])}/></label>}<details><summary>Definition settings</summary><textarea aria-label="Interactive definition JSON" rows={12} value={raw} onChange={e=>setRaw(e.target.value)}/><button type="button" onClick={()=>{try{replace(JSON.parse(raw));}catch(e){setError((e as Error).message);}}}>Apply definition settings</button></details>{error&&<p role="alert">{error}</p>}</div>;}
export function newInteractive(type:Interactive['type']):Interactive{
 if(type==='flashcards')return{version:1,type,reversible:true,cards:[{id:clientId(),front:{text:'Question'},back:{text:'Answer'}}]};
 if(type==='language-reveal')return{version:1,type,language:'ja',source:{text:'今日はいい天気です。',translation:'The weather is nice today.'},gloss:'今日 = today',explanation:'Replace this example with your own authored material.'};
 if(type==='language-pattern')return{version:1,type,language:'ja',slots:[{id:'speaker',label:'Subject',choices:[{id:'a',label:'I'},{id:'b',label:'You'}]}],examples:[{id:'a',choices:{speaker:'a'},source:{text:'私は勉強します。',translation:'I study.'}},{id:'b',choices:{speaker:'b'},source:{text:'あなたは勉強します。',translation:'You study.'}}]};
 if(type==='language-dialogue')return{version:1,type,language:'ja',turns:[{id:'one',speaker:'A',source:{text:'こんにちは。',translation:'Hello.'}},{id:'two',speaker:'B',source:{text:'こんにちは。お元気ですか。',translation:'Hello. How are you?'}}]};
 if(type==='drawing')return{version:1,type,noteId:'choose-state-note'};
 if(type==='python-canvas')return{version:1,type,width:640,height:360,seed:1,code:'from minamo_canvas import clear, frame\nclear()\nframe()'};
 if(type==='parameter-explorer')return{version:1,type,controls:[{id:'amplitude',kind:'slider',label:'Amplitude',min:0,max:160,step:1,value:80},{id:'frequency',kind:'slider',label:'Frequency',min:1,max:10,step:1,value:2}],target:{type:'wave',amplitude:'amplitude',frequency:'frequency'}};
 return{version:1,type,assetId:'choose-package',digest:'0'.repeat(64),profile:'standalone-html-v1',runtime:PYGBAG_RUNTIME};
}
