"use client";
import {useEffect,useId,useRef,useState,type KeyboardEvent,type ReactNode} from 'react';
import {AlignLeft,BookOpen,DatabaseBackup,Languages,MessagesSquare,Palette,PanelLeft,WrapText,X} from 'lucide-react';
import {closeOnDialogBackdrop} from '../lib/overlay-interactions';
import {returnDialogFocus} from './dialog-focus';
import {useFuriganaPreference} from './furigana-preference';
import type {PresentationPreferences} from '../lib/presentation-preferences';
import {defaultCollaborationPreferences,type CollaborationPreferences} from '../lib/collaboration-preferences';
import './settings-help.css';

type Category='appearance'|'reading'|'language'|'workspace'|'collaboration'|'data';
const categories=[
 {id:'appearance' as const,label:'Appearance',Icon:Palette},
 {id:'reading' as const,label:'Reading',Icon:BookOpen},
 {id:'language' as const,label:'Languages',Icon:Languages},
 {id:'workspace' as const,label:'Workspace',Icon:PanelLeft},
 {id:'collaboration' as const,label:'GPT & context',Icon:MessagesSquare},
 {id:'data' as const,label:'Data',Icon:DatabaseBackup},
];
export function settingTabKey(event:Pick<KeyboardEvent,'key'|'preventDefault'>,current:Category):Category|undefined{
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
 event.preventDefault();
 if(event.key==='Home')return categories[0].id;
 if(event.key==='End')return categories[categories.length-1].id;
 const index=categories.findIndex(category=>category.id===current);
 return categories[(index+(event.key==='ArrowRight'||event.key==='ArrowDown'?1:-1)+categories.length)%categories.length].id;
}
export function PreferenceChoice<T extends string>({label,description,value,options,onChange}:{label:string;description?:string;value:T;options:{value:T;label:string;sample?:ReactNode}[];onChange:(value:T)=>void}){
 const name=useId();
 return <fieldset className="sh-choice" aria-describedby={description?name+'-description':undefined}><legend>{label}</legend>{description&&<p className="sh-choice-description" id={name+'-description'}>{description}</p>}<div className="sh-choice-options">{options.map(option=><label key={option.value} className={value===option.value?'is-selected':''}><input type="radio" name={name} value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)}/>{option.sample&&<span className="sh-choice-sample" aria-hidden="true">{option.sample}</span>}<span>{option.label}</span></label>)}</div></fieldset>;
}
export function ReadingSettingsPreview({value}:{value:PresentationPreferences}){
 return <section className="sh-reading-preview" aria-label="Article preview" data-size={value.size} data-width={value.width} data-spacing={value.spacing}><small>Preview</small><div><h3>Sample Article</h3><p>This sample uses your Article text size and spacing. The available panel width may limit the line length.</p><p><ruby>日本語<rt>にほんご</rt></ruby> · 中文 · English</p></div><code data-wrap={value.codeWrap}>print("A code example uses your wrapping preference")</code></section>;
}
export default function PresentationSettings({value,onChange,onClose,error,layoutControls,serverReads=false,generation='legacy@0'}:{layoutControls?:ReactNode;value:PresentationPreferences;onChange:(value:PresentationPreferences)=>void;onClose:()=>void;error?:string;serverReads?:boolean;generation?:string}){
 const dialog=useRef<HTMLDialogElement>(null),tabs=useRef<HTMLDivElement>(null),id=useId(),[category,setCategory]=useState<Category>('appearance'),[feedback,setFeedback]=useState(''),[vertical,setVertical]=useState(true);
 const [collaboration,setCollaboration]=useState<CollaborationPreferences>(defaultCollaborationPreferences),[collaborationRevision,setCollaborationRevision]=useState(0),[collaborationState,setCollaborationState]=useState<'idle'|'loading'|'ready'|'saving'|'error'>('idle'),[collaborationError,setCollaborationError]=useState(''),[collaborationReload,setCollaborationReload]=useState(0);
 const {enabled:furiganaEnabled,setVisible:setFuriganaVisible}=useFuriganaPreference();
 useEffect(()=>{const media=window.matchMedia('(max-width:640px)'),update=()=>setVertical(!media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 useEffect(()=>{const previous=document.activeElement instanceof HTMLElement?document.activeElement:null,node=dialog.current;if(node&&!node.open)node.showModal();return()=>{node?.close();queueMicrotask(()=>{if(!document.querySelector('dialog[open]'))returnDialogFocus(previous);});}},[]);
 useEffect(()=>{if(!feedback)return;const timer=setTimeout(()=>setFeedback(''),3500);return()=>clearTimeout(timer);},[feedback,value]);
 useEffect(()=>{if(!serverReads||category!=='collaboration')return;const abort=new AbortController();setCollaborationState('loading');fetch('/api/collaboration-preferences',{headers:{'x-minamo-generation':generation},signal:abort.signal}).then(async response=>{const body=await response.json() as {error?:string;global:{values:CollaborationPreferences;revision:number}};if(!response.ok)throw Error(body.error||'Could not load collaboration settings.');return body;}).then(body=>{if(abort.signal.aborted)return;setCollaboration(body.global.values);setCollaborationRevision(body.global.revision);setCollaborationState('ready');setCollaborationError('');}).catch(reason=>{if(abort.signal.aborted)return;setCollaborationState('error');setCollaborationError(reason instanceof Error?reason.message:'Settings are unavailable.');});return()=>abort.abort();},[category,serverReads,generation,collaborationReload]);
 async function saveCollaboration(next:CollaborationPreferences){if(collaborationState!=='ready')return;setCollaborationState('saving');setCollaborationError('');try{const response=await fetch('/api/collaboration-preferences',{method:'POST',headers:{'content-type':'application/json','x-minamo-generation':generation},body:JSON.stringify({scope:'global',intent:'explicit-owner-preferences',values:{contextDepth:next.contextDepth,relatedMaterial:next.relatedMaterial,initiative:next.initiative,authoringDetail:next.authoringDetail,projectEditing:next.projectEditing,mcpTools:next.mcpTools},expectedRevision:collaborationRevision,expectedGeneration:generation,operationId:crypto.randomUUID()})});const body=await response.json() as {error?:string;revision:number};if(!response.ok)throw Error(body.error||'Could not save collaboration settings.');setCollaboration(next);setCollaborationRevision(body.revision);setCollaborationState('ready');window.dispatchEvent(new CustomEvent('minamo-collaboration-changed'));setFeedback('GPT & context settings saved to Minamo');}catch(reason){setCollaborationState('error');setCollaborationError(reason instanceof Error?reason.message:'Could not save; your previous settings remain unchanged.');}}
 function change(next:PresentationPreferences){onChange(next);setFeedback('Preferences updated on this device');}
 const tabKey=(event:KeyboardEvent<HTMLButtonElement>)=>{
  if(vertical&&['ArrowLeft','ArrowRight'].includes(event.key)||!vertical&&['ArrowUp','ArrowDown'].includes(event.key))return;
  const next=settingTabKey(event,category);
  if(next){setCategory(next);tabs.current?.querySelector<HTMLButtonElement>('[data-category="'+next+'"]')?.focus();}
 };
 return <dialog ref={dialog} className="v2-dialog wp-settings sh-settings" data-overlay-origin="top-right" onClick={event=>closeOnDialogBackdrop(event,onClose)} aria-labelledby={id+'-title'} onCancel={event=>{event.preventDefault();onClose();}}>
  <header className="v2-dialog-header sh-dialog-header"><h2 id={id+'-title'}>Settings</h2><button type="button" className="v2-icon" aria-label="Close settings" onClick={onClose}><X size={20}/></button></header>
  <div className="sh-settings-shell">
   <div ref={tabs} className="sh-category-tabs" role="tablist" aria-orientation={vertical?'vertical':'horizontal'} aria-label="Settings categories">{categories.map(({id:tab,label,Icon})=><button key={tab} type="button" role="tab" id={id+'-'+tab+'-tab'} aria-controls={category===tab?id+'-'+tab+'-panel':undefined} aria-selected={category===tab} tabIndex={category===tab?0:-1} data-category={tab} onClick={()=>setCategory(tab)} onKeyDown={tabKey}><Icon size={19}/><span>{label}</span></button>)}</div>
   <section key={category} className="sh-settings-panel sh-enter" role="tabpanel" id={id+'-'+category+'-panel'} aria-labelledby={id+'-'+category+'-tab'}>
    {category==='appearance'&&<>
     <h3 className="sh-panel-title">Appearance</h3>
     <PreferenceChoice label="Colour theme" value={value.theme} options={[{value:'dark',label:'Charcoal'},{value:'light',label:'Light'},{value:'system',label:'Follow device'}]} onChange={theme=>change({...value,theme})}/>
     <PreferenceChoice label="Interface density" value={value.density} options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]} onChange={density=>change({...value,density})}/>
     <div className="sh-appearance-preview" aria-label="Appearance preview" data-density={value.density}><span>Example card</span><strong>Continue learning</strong><p>Spacing adjusts in navigation and overview cards without shrinking your writing editor.</p></div>
    </>}
    {category==='reading'&&<>
     <h3 className="sh-panel-title">Reading</h3>
     <PreferenceChoice label="Text size" value={value.size} options={[{value:'standard',label:'Standard',sample:<span className="sh-type-standard">Aa</span>},{value:'larger',label:'Larger',sample:<span className="sh-type-larger">Aa</span>},{value:'largest',label:'Largest',sample:<span className="sh-type-largest">Aa</span>}]} onChange={size=>change({...value,size})}/>
     <PreferenceChoice label="Article width" value={value.width} options={[{value:'comfortable',label:'Comfortable',sample:<AlignLeft size={20}/>},{value:'narrow',label:'Narrow',sample:<AlignLeft size={20} className="sh-narrow-lines"/>}]} onChange={width=>change({...value,width})}/>
     <PreferenceChoice label="Paragraph spacing" value={value.spacing} options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]} onChange={spacing=>change({...value,spacing})}/>
     <label className="sh-switch-row"><WrapText size={20}/><span>Wrap code by default</span><input type="checkbox" role="switch" checked={value.codeWrap} onChange={event=>change({...value,codeWrap:event.target.checked})}/></label>
     <ReadingSettingsPreview value={value}/>
    </>}
    {category==='language'&&<>
     <h3 className="sh-panel-title">Languages</h3>
     <PreferenceChoice label="Japanese furigana" value={furiganaEnabled?'show':'hide'} options={[{value:'show',label:'Show above kanji'},{value:'hide',label:'Hide'}]} onChange={next=>{setFuriganaVisible(next==='show');setFeedback('Japanese reading display updated');}}/>
     <p className="sh-setting-description">The 漢 control in the top bar changes the same preference while you read Japanese. It is hidden in other learning spaces.</p>
     <div className="sh-settings-note"><strong>Speech</strong><p>Japanese uses the verified Piper Plus voice. Play and turtle controls are available beside the relevant sentences; other languages use their supported local voices.</p></div>
    </>}
    {category==='workspace'&&<>
     <h3 className="sh-panel-title">Workspace</h3>
     <PreferenceChoice label="Experimental experience" description="Try alternative ways to use your saved Japanese Projects. The current Minamo view is always available. Remembered on this device." value={value.experience??'stable'} options={[{value:'stable',label:'Stable Minamo'},{value:'explore',label:'Passage explorer'},{value:'practice',label:'Practice sequence'}]} onChange={experience=>change({...value,experience})}/>

     <PreferenceChoice label="Desktop sidebar" value={value.sidebar} options={[{value:'open',label:'Expanded',sample:<PanelLeft size={20}/>},{value:'compact',label:'Compact',sample:<PanelLeft size={20} className="sh-compact-sidebar"/>}]} onChange={sidebar=>change({...value,sidebar})}/>
     <PreferenceChoice label="Motion" value={value.motion} options={[{value:'system',label:'Follow device preference'},{value:'reduce',label:'Reduce motion'}]} onChange={motion=>change({...value,motion})}/>
     <p className="sh-setting-description">Notes can be moved and resized from their own menu. Your current Notes layout is retained separately on this device.</p>
    </>}
    {category==='collaboration'&&<>
     <h3 className="sh-panel-title">GPT & context</h3>
     <p className="sh-setting-description">Choose how much of your saved work Minamo returns when GPT asks for context. These choices are saved with your account and apply in new conversations too.</p>
     {!serverReads?<p className="sh-settings-note">Sign in to save collaboration settings with your workspace.</p>:collaborationState==='loading'||collaborationState==='idle'?<p className="sh-setting-description" role="status">Loading your settings…</p>:<>
      <fieldset disabled={collaborationState!=='ready'} className="sh-collaboration-controls">
       <PreferenceChoice label="Context detail" description="Changes how much source text and revision history each GPT context read returns." value={collaboration.contextDepth} options={[{value:'concise',label:'Concise'},{value:'balanced',label:'Balanced'},{value:'detailed',label:'Detailed'}]} onChange={contextDepth=>void saveCollaboration({...collaboration,contextDepth})}/>
       <PreferenceChoice label="Related material" description="Includes only saved relationships. Hiding links also removes related writing from focused GPT context." value={collaboration.relatedMaterial} options={[{value:'none',label:'Hide saved links'},{value:'saved',label:'Include saved links'}]} onChange={relatedMaterial=>void saveCollaboration({...collaboration,relatedMaterial})}/>
       <PreferenceChoice label="Suggestions in GPT" description="Guides whether GPT should offer connections; it never grants permission to save." value={collaboration.initiative} options={[{value:'requested',label:'Only when I ask'},{value:'offer',label:'May offer connections'}]} onChange={initiative=>void saveCollaboration({...collaboration,initiative})}/>
       <PreferenceChoice label="Project writing detail" description="Guides the length of GPT-authored Project material when you ask for it." value={collaboration.authoringDetail} options={[{value:'concise',label:'Focused'},{value:'balanced',label:'Balanced'},{value:'detailed',label:'In-depth'}]} onChange={authoringDetail=>void saveCollaboration({...collaboration,authoringDetail})}/>
       <PreferenceChoice label="GPT Project editing" description="Previews only blocks GPT Project saves. Notes and other material keep their separate permissions." value={collaboration.projectEditing} options={[{value:'direct',label:'May save when asked'},{value:'preview-only',label:'Previews only'}]} onChange={projectEditing=>void saveCollaboration({...collaboration,projectEditing})}/>
       <PreferenceChoice label="MCP tool access" description="Read and preview only blocks every MCP save, including tools cached by an older conversation. Website editing stays available." value={collaboration.mcpTools} options={[{value:'authoring',label:'Read and save when asked'},{value:'read-only',label:'Read and preview only'}]} onChange={mcpTools=>void saveCollaboration({...collaboration,mcpTools})}/>
      </fieldset>
      {collaborationState==='saving'&&<p className="sh-setting-description" role="status">Saving…</p>}
      {collaborationError&&<div role="alert" className="sh-setting-description sh-collaboration-error">{collaborationError} <button type="button" onClick={()=>setCollaborationReload(previous=>previous+1)}>Reload settings</button></div>}
      <details className="sh-settings-note"><summary>Permissions and connector refresh</summary><p>You can restore MCP saving here. ChatGPT may need a connector refresh to update its visible tool list; the server enforces the current setting on every call. These settings do not authorise an unrequested change or establish a learning outcome.</p></details>
     </>}
    </>}
    {category==='data'&&<>
     <h3 className="sh-panel-title">Data and recovery</h3>
     <p className="sh-setting-description">Appearance and reading settings are remembered in this browser. GPT & context preferences are saved to your account; your Projects, Library material and Notes are separate records.</p>
     {layoutControls??<p className="sh-setting-description">Data and recovery controls are available in the main workspace.</p>}
    </>}
   </section>
  </div>
  <footer className="sh-dialog-footer">{error?<p role="status" className="sh-settings-error">{error}</p>:<span className="sh-settings-saved" role="status">{feedback}</span>}<button type="button" className="v2-secondary" onClick={onClose}>Done</button></footer>
 </dialog>;
}
