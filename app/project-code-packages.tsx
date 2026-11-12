'use client';
import {useState} from 'react';
import {Download,FileCode2} from 'lucide-react';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ProjectSourceFile} from '../lib/project-code-package';
import {generationFetch} from '../lib/workspace-generation';
import './project-code-packages.css';

export type CodePackageInventory=Array<{
 id:string;title:string;runtime:'python';sourceRevision:number;downloadable:boolean;totalBytes:number;
 files:ProjectSourceFile[];
}>;
export default function ProjectCodePackages({record,scope,inventory,canEdit,onEditSource}:{record:WorkspaceRecord;scope:string;inventory:CodePackageInventory|null;canEdit?:boolean;onEditSource?:(sectionId:string,partId:string)=>void}){
 const [busy,setBusy]=useState<string|null>(null),[error,setError]=useState('');
 const [opened,setOpened]=useState<{packageId:string;path:string}|null>(null);
 const packages=record.projectComposition?.codePackages??[];
 if(!packages.length)return null;
 async function download(id:string){
  if(busy)return;setBusy(id);setError('');
  try{
   const response=await generationFetch(scope,'/api/projects/code-package?'+new URLSearchParams({projectId:record.id,packageId:id,revision:String(record.rev)}));
   if(!response.ok){const result=await response.json() as {error?:string};throw Error(result.error??'This saved source package is unavailable.');}
   const url=URL.createObjectURL(new Blob([await response.arrayBuffer()],{type:'application/zip'}));
   const a=document.createElement('a');a.href=url;a.download=record.id.toLowerCase().replace(/[^a-z0-9_-]/g,'-').slice(0,80)+'-r'+record.rev+'.zip';a.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),3000);
  }catch(cause){setError((cause as Error).message);}finally{setBusy(null);}
 }
 return <section className="pc-code-packages" aria-label="Project source packages">
  {packages.map(pkg=>{
   const ready=inventory?.find(item=>item.id===pkg.id&&item.sourceRevision===record.rev);
   const selected=opened?.packageId===pkg.id?pkg.files.find(file=>file.path===opened.path):undefined;
   const selectedStatus=selected&&ready?.files.find(file=>file.path===selected.path);
   const part=selected&&record.sections?.find(section=>section.id===selected.sectionId)?.parts.find(part=>part.id===selected.partId);
   const code=part?.kind==='code'&&!part.unavailable&&selectedStatus?.status==='available'?part.text:null;
   return <div className="pc-code-package" key={pkg.id}>
    <FileCode2 size={18} aria-hidden="true"/>
    <div className="pc-code-package-body"><strong>{pkg.title}</strong><small>{pkg.files.length} exact files · Project revision {record.rev}</small>
     <details><summary>File paths</summary><ul>{(ready?.files??pkg.files).map(file=><li key={file.path}><button type="button" className="pc-source-file-button" aria-pressed={opened?.packageId===pkg.id&&opened.path===file.path} onClick={()=>setOpened(value=>value?.packageId===pkg.id&&value.path===file.path?null:{packageId:pkg.id,path:file.path})}><code>{file.path}</code></button>{'status'in file&&typeof file.status==='string'&&file.status!=='available'&&<span> · {file.status}</span>}</li>)}</ul></details>
     {selected&&<div className="pc-source-inspection">
      <div className="pc-source-inspection-header"><code>{selected.path}</code>{code!==null&&canEdit&&onEditSource&&<button type="button" className="v2-secondary" onClick={()=>onEditSource(selected.sectionId,selected.partId)}>Edit this file</button>}</div>
      {code!==null?<pre tabIndex={0}><code>{code}</code></pre>:<p>Exact source is unavailable in this saved edition.</p>}
     </div>}
    </div>
    <button type="button" className="v2-secondary" disabled={busy!==null||!ready?.downloadable} onClick={()=>void download(pkg.id)}><Download size={15} aria-hidden="true"/>{busy===pkg.id?'Preparing…':'Download ZIP'}</button>
   </div>;
  })}
  {error&&<p role="alert">{error}</p>}
  {inventory?.some(pkg=>!pkg.downloadable)&&<small>Some exact source parts are missing, blocked or over the byte limit. The package cannot substitute other content.</small>}
 </section>;
}
