'use client';
import {useState} from 'react';
import {Download,LoaderCircle} from 'lucide-react';
import {downloadLibraryBackup} from '../lib/library-backup-client';
/** Backup is an explicit, owner-initiated local download; no server mutations. */
export default function LibraryBackupButton({generation}:{generation?:string}={}){
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const go=async()=>{
  if(busy||!window.confirm('Download a personal Library backup? It includes private content and media and is NOT encrypted. Store the ZIP securely.'))return;
  setBusy(true);setMessage('Preparing Library backup…');
  try{
   const result=await downloadLibraryBackup({origin:window.location.origin+'/',fetcher:fetch.bind(window),...(generation?{generation}:{}),
    history:true,includeSources:true,progress:setMessage});
   setMessage(result.complete?`Downloaded ${result.counts.records} Library records and ${result.counts.assets} files.`:
    `Partial backup downloaded (${result.warnings.length} missing files). Keep this ZIP, but do not treat it as complete; inspect manifest.json.`);
  }catch(error){setMessage(`Backup failed: ${error instanceof Error?error.message:'Unknown error'}. No records were changed.`);}
  finally{setBusy(false);}
 };
 return <span style={{display:'inline-flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
   <button className="v2-secondary" type="button" onClick={()=>void go()} disabled={busy} aria-label="Download Library backup">
    {busy?<LoaderCircle size={15} aria-hidden="true"/>:<Download size={15} aria-hidden="true"/>} <span>{busy?'Preparing…':'Export Library'}</span>
   </button>
   {message&&<small role="status" style={{maxWidth:260,textAlign:'right'}}>{message}</small>}
  </span>;
}
