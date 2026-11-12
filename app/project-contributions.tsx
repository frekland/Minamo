'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {AlertTriangle,CheckCircle2,ChevronDown,Pencil,Plus,UserRound} from 'lucide-react';
import {generationFetch,workspaceGenerationFromScope} from '../lib/workspace-generation';
import {clientId} from '../lib/client-id';
import {ProjectSpeech} from './project-speech';
import './project-contributions.css';

type Kind='table'|'dialogue'|'code'|'example'|'observation';
type Target={projectId:string;sectionId:string;partId:string};
type Review={result:'accepted'|'suggestion'|'uncertain';revision:number;reviewedContributionRevision:number;explanation:string;basis:'gpt-provisional'};
type Entry={id:string;revision:number;kind:Kind;cells:string[];review:Review|null;deleted:boolean;updatedAt:string};
type Read={project:{revision:number};entries:Entry[];truncated:boolean;nextCursor:string|null;error?:string};

/** B1's separate owner-scoped D1 record; never a browser-only draft masquerading as a save. */
export default function ProjectContributions({target,kind,columns,scope,projectRev,language}:{target:Target;kind:Kind;columns:string[];scope:string;projectRev:number;language?:string}){
 const [entries,setEntries]=useState<Entry[]>([]),[expanded,setExpanded]=useState(false),[editing,setEditing]=useState<string|null>(null),[draft,setDraft]=useState<string[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[serverRev,setServerRev]=useState(projectRev),[more,setMore]=useState<string|null>(null),[feedbackOpen,setFeedbackOpen]=useState<string|null>(null);
 const retry=useRef<{id:string;change:string;payload:unknown}|null>(null);
 const query=new URLSearchParams(target).toString();
 async function read(cursor?:string){
  const response=await generationFetch(scope,'/api/projects/contributions?'+query+(cursor?'&cursor='+encodeURIComponent(cursor):''));
  const data=await response.json() as Read;
  if(!response.ok)throw Error(data.error??'Contributions could not be loaded.');
  return data;
 }
 useEffect(()=>{let active=true;setLoading(true);setError('');setEditing(null);setEntries([]);setExpanded(false);retry.current=null;
  void read().then(data=>{if(!active)return;setEntries(data.entries.filter(e=>!e.deleted));setServerRev(data.project.revision);setMore(data.nextCursor);setLoading(false);}).catch(cause=>{if(active){setError((cause as Error).message);setLoading(false);}});
  return()=>{active=false;};
 },[query,scope,projectRev]);
 const title=kind==='dialogue'?'Your responses':kind==='code'?'Your code variations':kind==='observation'?'Your observations':'Your examples';
 const noun=kind==='dialogue'?'response':kind==='code'?'code variation':kind==='observation'?'observation':'example';
 const japanese=/^ja(?:-|$)/i.test(language??'')||columns.some(c=>/Japanese|日本語/i.test(c));
 const japaneseCell=columns.findIndex(c=>/Japanese|日本語/i.test(c));
 function edit(id:string){if(busy||loading)return;retry.current=null;const old=entries.find(e=>e.id===id);setEditing(id);setDraft(old?[...old.cells]:columns.map(() =>''));setFeedbackOpen(null);setError('');setExpanded(true);}
 async function commit(action:'save'|'remove',id:string,cells?:string[],revision=0){
  const change=JSON.stringify({action,id,cells,revision});
  if(retry.current&&retry.current.change!==change){setError('A previous write is uncertain. Retry the same save or reload before changing it.');return;}
  setBusy(true);setError('');
  try{
   const payload=retry.current?.id===id?retry.current.payload:{operationId:clientId(),expectedGeneration:workspaceGenerationFromScope(scope),expectedProjectRev:serverRev,target,id,expectedRevision:revision,action,...(action==='save'?{kind,columns,cells}:{})};
   retry.current={id,change,payload};
   const response=await generationFetch(scope,'/api/projects/contributions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   const receipt=await response.json() as {status?:string;error?:string};
   if(!response.ok||receipt.status!=='committed'){if(response.status>=400&&response.status<500)retry.current=null;throw Error(receipt.error??'Save was not committed.');}
   const data=await read();setEntries(data.entries.filter(e=>!e.deleted));setMore(data.nextCursor);setServerRev(data.project.revision);
   retry.current=null;setEditing(null);setExpanded(true);
  }catch(cause){setError((cause as Error).message+' Your draft has been kept.');}finally{setBusy(false);}
 }
 function save(event:FormEvent<HTMLFormElement>){event.preventDefault();const cells=draft.map(s=>s.trim());if(!cells.some(Boolean)){setError('Write something before saving.');return;}
  const old=entries.find(e=>e.id===editing);void commit('save',old?.id??'learner-'+clientId(),cells,old?.revision??0);
 }
 return <section className={'pc-contributions pc-contributions-'+kind+(entries.length?' pc-contributions-has-entries':'')} aria-label={title}>
  <div className="pc-contribution-controls">
   {entries.length>0&&<button type="button" aria-expanded={expanded} className="pc-contribution-summary" onClick={()=>{setExpanded(v=>!v);setEditing(null);}}><UserRound size={15}/><span>{title}</span><small>{entries.length}{more?'+':''}</small><ChevronDown size={14} className={expanded?'open':''}/></button>}
   <button type="button" className="pc-contribution-add" disabled={busy||loading} title={'Add '+noun} onClick={()=>edit('new')}><Plus size={14}/> <span>Add {noun}</span></button>
   {loading&&<span role="status" className="pc-contribution-visually-hidden">Loading contributions…</span>}
  </div>
  {expanded&&<div className="pc-contribution-list">{entries.map(entry=>{const feedback=entry.review?.revision===entry.revision&&entry.review?.basis==='gpt-provisional'?entry.review:null;
   return <article key={entry.id} className="pc-contribution-entry"><div className="pc-contribution-entry-row"><span className="pc-contribution-author" title={'Your contribution · revision '+entry.revision+' · last updated '+entry.updatedAt}>You</span><div className="pc-contribution-entry-cells">{entry.cells.map((value,i)=><div className="pc-contribution-cell" key={i}><span className="pc-contribution-cell-label">{columns[i]??'Addition'}</span><div className="pc-contribution-cell-content" lang={japanese&&(i===japaneseCell||japaneseCell<0&&i===0)?'ja':undefined}>{kind==='code'&&i===0?<code>{value}</code>:value||'—'}{value&&japanese&&(i===japaneseCell||japaneseCell<0&&i===0)&&<ProjectSpeech text={value} language="ja" compact/>}</div></div>)}</div>
    {feedback&&<button type="button" className={'pc-contribution-icon pc-contribution-review-'+feedback.result} aria-label={(feedbackOpen===entry.id?'Hide':'Show')+' provisional GPT feedback ('+feedback.result+')'} title="Provisional GPT feedback" aria-expanded={feedbackOpen===entry.id} onClick={()=>setFeedbackOpen(v=>v===entry.id?null:entry.id)}>{feedback.result==='accepted'?<CheckCircle2 size={17}/>:<AlertTriangle size={17}/>}</button>}
    <button type="button" className="pc-contribution-icon" aria-label="Edit your contribution" title="Edit" onClick={()=>edit(entry.id)}><Pencil size={16}/></button></div>
    {feedback&&feedbackOpen===entry.id&&<aside className="pc-contribution-feedback"><strong>Provisional GPT feedback</strong><p>{feedback.explanation}</p><small>For your saved revision {feedback.reviewedContributionRevision}; a later edit clears this review.</small></aside>}
   </article>;})}
   {more&&<button type="button" className="pc-contribution-more" disabled={loading} onClick={()=>{setLoading(true);void read(more).then(data=>{setEntries(v=>[...v,...data.entries.filter(e=>!e.deleted)]);setMore(data.nextCursor);}).catch(cause=>setError((cause as Error).message)).finally(()=>setLoading(false));}}>Load more</button>}
  </div>}
  {editing&&<form className="pc-contribution-editor" onSubmit={save}><p>{editing==='new'?'Add '+noun:'Edit '+noun} <small>Saved separately from the Project content.</small></p><div className="pc-contribution-fields">{columns.map((column,i)=><label key={i}>{column}<textarea rows={kind==='code'&&i===0?6:2} spellCheck={kind!=='code'||i!==0} maxLength={kind==='code'&&i===0?8000:2000} value={draft[i]??''} onChange={event=>setDraft(old=>old.map((s,j)=>i===j?event.target.value:s))}/></label>)}</div><div className="pc-contribution-actions"><button type="submit" disabled={busy}>{busy?'Saving…':'Save'}</button><button type="button" disabled={busy} onClick={()=>setEditing(null)}>Cancel</button>{editing!=='new'&&<button type="button" disabled={busy} className="pc-contribution-remove" onClick={()=>{if(!window.confirm('Remove this contribution?'))return;const old=entries.find(e=>e.id===editing);if(old)void commit('remove',old.id,undefined,old.revision);}}>Remove</button>}</div></form>}
  {error&&<p role="alert" className="pc-contribution-error">{error} <button type="button" onClick={()=>{setLoading(true);void read().then(data=>{setEntries(data.entries.filter(e=>!e.deleted));setMore(data.nextCursor);setServerRev(data.project.revision);setError('');}).catch(cause=>setError((cause as Error).message)).finally(()=>setLoading(false));}}>Refresh</button></p>}
 </section>;
}
