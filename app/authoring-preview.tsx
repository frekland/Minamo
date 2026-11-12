"use client";
import {useEffect,useState} from 'react';
import type {ArticleSection,PassagePart,WorkspaceRecord} from '../lib/contracts';
import {generationFetch} from '../lib/workspace-generation';
import {learnerFamilyLabel} from '../lib/learner-labels';
import {RichReadingPart} from './reader';
import ReadingMedia from './reading-media';
import './authoring-preview.css';

type Finding={code:string;message:string;path?:string;severity?:string};
type Preview={valid:boolean;policyVersion?:string;findings?:Finding[];proposedRecords?:WorkspaceRecord[];error?:string;message?:string};

/** Same safe reading blocks, without Reader's capture/navigation/write controls.
 * Proposed editions are deliberately absent, so no persistent passage is invented. */
export function ProposedReading({record,ownerScope}:{record:WorkspaceRecord;ownerScope?:string}){
 const proposed={...record,rendition:undefined};
 const [copyMessage,setCopyMessage]=useState('');
 async function copyCode(text:string){try{await navigator.clipboard.writeText(text);setCopyMessage('Original code copied. It has not been run.');}catch{setCopyMessage('Clipboard unavailable. Select the code and copy it manually.');}}
 return <article className="rn-reader ap-reading" aria-label={`Proposed ${learnerFamilyLabel(record.family,{lowercase:true})}: ${record.title}`}>
  <header className="rn-reading-header"><p className="rn-eyebrow">Proposed {learnerFamilyLabel(record.family,{lowercase:true})} · not saved</p><h2>{record.title}</h2>{record.body&&<p className="rn-reader-intro">{record.body}</p>}</header>
  {copyMessage&&<p role="status">{copyMessage}</p>}
  {record.sections?.map(section=><section className="rn-reading-section" key={section.id}><h3>{section.title}</h3>{section.parts.map(part=><div key={part.id}>{part.kind==='code'&&<button type="button" className="rn-subtle" onClick={()=>copyCode(part.text)}>Copy original code</button>}<ProposedPart sectionId={section.id} part={part} article={proposed} ownerScope={ownerScope}/></div>)}</section>)}
  {!!record.links.length&&<details className="ap-proposed-links"><summary>Proposed connections ({record.links.length})</summary><ul>{record.links.map((link,i)=><li key={link.relationId??`${link.family}:${link.id}:${i}`}><strong>{learnerFamilyLabel(link.family)}</strong> <code>{link.id}</code>{link.sectionId&&<> · section <code>{link.sectionId}</code></>}{link.sourceContext&&<> · from <code>{link.sourceContext.stageId??link.sourceContext.sectionId}</code></>}{link.reason&&<p>{link.reason}</p>}<small>Proposed destination; no saved link is created by this preview.</small></li>)}</ul></details>}
 </article>;
}

/** Newly staged files have no saved attachment authority. Preview their authored
 * metadata without constructing byte URLs or mounting privileged management. */
function ProposedPart({part,sectionId,article,ownerScope}:{part:PassagePart;sectionId:string;article:WorkspaceRecord;ownerScope?:string}){
 if(part.kind==='media'){
  if(part.unavailable||!part.media)return <aside className="rm-reading"><strong>Attachment unavailable</strong><p>The attachment and its authored metadata are withheld.</p></aside>;
  const metadata=<>{part.media.description&&<p>{part.media.description}</p>}{part.media.caption&&<p>{part.media.caption}</p>}{part.media.transcript&&<p>{part.media.transcript}</p>}</>;
  if(!ownerScope||!part.mediaDisplay)return <figure className="rm-reading"><figcaption>Draft {part.media.kind} attachment · metadata only</figcaption>{metadata}<small>Save this material to attach the staged file before loading its original bytes. This preview does not upload, play or change the attachment.</small></figure>;
  return <ReadingMedia key={ownerScope+':'+part.media.assetId} media={part.media} ownerScope={ownerScope} readOnly>{metadata}</ReadingMedia>;
 }
 if(part.kind==='image'){
  if(part.unavailable||!part.image)return <aside className="rn-image-unavailable"><strong>Attachment unavailable</strong><p>The image and its authored metadata are withheld.</p></aside>;
  return <figure className="rn-image-figure"><figcaption>Draft image attachment · metadata only</figcaption><p>{part.image.alt}</p>{part.image.caption&&<p>{part.image.caption}</p>}<small>Original image bytes remain in the private attachment workflow; this unsaved layout preview loads no image.</small></figure>;
 }
 return <RichReadingPart sectionId={sectionId} part={part} article={article} captures={[]} ownerScope={ownerScope}/>;
}

export function LocalReadingPreview({sections,ownerScope}:{sections:ArticleSection[];ownerScope?:string}){
 const record:WorkspaceRecord={id:'uncommitted-preview',family:'article',title:'Material draft',body:'',sections,links:[],rev:0,createdAt:'',updatedAt:'',trashedAt:null,actor:'user',synthetic:false};
 return <details className="ap-local-preview"><summary>Preview layout</summary><p className="v2-input-hint">Read-only layout of your unsaved blocks. Captures become available only after a deliberate save.</p><ProposedReading record={record} ownerScope={ownerScope}/></details>;
}

/** Owner-private read-only preflight. It cannot apply or publish a package. */
export default function AuthoringPackagePreview({ownerScope}:{ownerScope:string}){
 const [source,setSource]=useState(''),[result,setResult]=useState<Preview|null>(null),[selected,setSelected]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const storageKey='minamo-authoring-package-draft:'+ownerScope;
 useEffect(()=>{try{setSource(localStorage.getItem(storageKey)??'')}catch{/* Draft remains in memory when browser storage is unavailable. */}setResult(null);setSelected(0);},[storageKey]);
 function edit(value:string){setSource(value);setResult(null);setError('');try{if(value)localStorage.setItem(storageKey,value);else localStorage.removeItem(storageKey)}catch{/* Do not discard an in-memory draft on storage failure. */}}
 async function preview(){
  setError('');setBusy(true);setResult(null);
  try{
   if(new TextEncoder().encode(source).length>220000)throw Error('Keep a package within 220 KB. Your draft is retained.');
   const input=JSON.parse(source);if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Use a package JSON object.');
   const response=await generationFetch(ownerScope,'/api/authoring/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...input,detail:true})});
   const data=await response.json() as Preview;
   if(!response.ok&&!data.findings)throw Error(data.message??data.error??'Preview could not be checked. Your draft is retained.');
   setResult(data);setSelected(0);
  }catch(cause){setError(cause instanceof SyntaxError?'The package is not valid JSON. Your draft is retained.':cause instanceof Error?cause.message:'Preview could not be checked. Your draft is retained.');}
  finally{setBusy(false)}
 }
 return <details className="ap-package"><summary>Review a learning package</summary><p className="v2-input-hint">Paste a proposed package to check its editorial decisions and read the compiled content before publication. This view never saves learning records.</p>
  <label>Proposed package JSON<textarea rows={9} spellCheck={false} value={source} onChange={event=>edit(event.target.value)} placeholder="Paste a policy-guided learning package"/></label>
  <div className="ap-actions"><button type="button" className="v2-secondary" disabled={busy||!source.trim()} onClick={preview}>{busy?'Checking proposal…':'Check and preview'}</button><button type="button" className="v2-text-button" disabled={busy||!source} onClick={()=>edit('')}>Clear this draft</button></div>
  {error&&<p role="alert">{error}</p>}
  {result&&<div className="ap-result"><p role="status">{result.valid?'Proposal passed the current preflight. It has not been saved.':'Revise this proposal before publication.'}{result.policyVersion&&<small>Policy {result.policyVersion}</small>}</p>
   {!!result.findings?.length&&<ul>{result.findings.map((finding,i)=><li key={i}><strong>{finding.code}</strong>{finding.path&&<> · <code>{finding.path}</code></>}<p>{finding.message}</p></li>)}</ul>}
   {!!result.proposedRecords?.length&&<><label>Read proposed item<select value={selected} onChange={event=>setSelected(Number(event.target.value))}>{result.proposedRecords.map((record,i)=><option value={i} key={record.family+':'+record.id}>{learnerFamilyLabel(record.family)} · {record.title}</option>)}</select></label><ProposedReading record={result.proposedRecords[Math.min(selected,result.proposedRecords.length-1)]} ownerScope={ownerScope}/></>}
  </div>}
 </details>;
}
