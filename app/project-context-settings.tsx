'use client';
import {useEffect,useState} from 'react';
import {X} from 'lucide-react';
import {generationFetch,workspaceGenerationFromScope} from '../lib/workspace-generation';
import {defaultCollaborationPreferences,type CollaborationOverrides,type CollaborationPreferences} from '../lib/collaboration-preferences';
import './project-context-settings.css';

type Field=keyof CollaborationOverrides;
type Read={global:{values:CollaborationPreferences};project:{revision:number;overrides:CollaborationOverrides};effective:CollaborationPreferences};
const options:{field:Field;label:string;values:{value:string;label:string}[]}[]=[
 {field:'contextDepth',label:'Context depth',values:[{value:'concise',label:'Concise'},{value:'balanced',label:'Balanced'},{value:'detailed',label:'Detailed'}]},
 {field:'relatedMaterial',label:'Saved connections',values:[{value:'none',label:'Hide'},{value:'saved',label:'Include'}]},
 {field:'initiative',label:'GPT suggestions',values:[{value:'requested',label:'Only on request'},{value:'offer',label:'May offer'}]},
 {field:'authoringDetail',label:'Writing detail',values:[{value:'concise',label:'Focused'},{value:'balanced',label:'Balanced'},{value:'detailed',label:'In-depth'}]},
 {field:'projectEditing',label:'GPT Project saves',values:[{value:'direct',label:'May save when asked'},{value:'preview-only',label:'Previews only'}]}
];

/** On-demand Project preferences. A restrictive editing choice blocks GPT
 * Project writes server-side; no preference grants writing authority. */
export default function ProjectContextSettings({projectId,scope,onClose}:{projectId:string;scope:string;onClose:()=>void}){
 const [read,setRead]=useState<Read|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState(''),[epoch,setEpoch]=useState(0);
 useEffect(()=>{const controller=new AbortController();setBusy(true);setError('');
  generationFetch(scope,'/api/collaboration-preferences?projectId='+encodeURIComponent(projectId),{signal:controller.signal,cache:'no-store'})
   .then(async response=>{const body=await response.json() as Read&{error?:string};if(!response.ok||!body.project)throw Error(body.error??'Project preferences are unavailable.');return body;})
   .then(value=>{if(!controller.signal.aborted){setRead(value);setBusy(false);}})
   .catch(reason=>{if(!controller.signal.aborted){setError(reason instanceof Error?reason.message:'Unable to read settings.');setBusy(false);}});
  return()=>controller.abort();
 },[projectId,scope,epoch]);
 async function save(field:Field,value:string){if(!read||busy)return;const overrides={...read.project.overrides} as Record<string,string>;if(value==='inherit')delete overrides[field];else overrides[field]=value;
  setBusy(true);setError('');setNotice('');
  try{const response=await generationFetch(scope,'/api/collaboration-preferences',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:'project',projectId,intent:'explicit-owner-preferences',expectedGeneration:workspaceGenerationFromScope(scope),expectedRevision:read.project.revision,operationId:crypto.randomUUID(),values:overrides})});
   const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error??'Settings changed elsewhere; reload before trying again.');
   window.dispatchEvent(new CustomEvent('minamo-collaboration-changed',{detail:{projectId}}));
   setNotice('Saved for this Project');setEpoch(n=>n+1);
  }catch(reason){setBusy(false);setError(reason instanceof Error?reason.message:'Could not save Project settings.');}
 }
 return <section className="pcs-panel" aria-label="GPT context for this Project">
  <header><div><h2>GPT for this Project</h2><p>These choices override your global settings only here.</p></div><button type="button" aria-label="Close Project GPT settings" onClick={onClose}><X size={18}/></button></header>
  {read&&<div className="pcs-fields">{options.map(({field,label,values})=><label key={field}>{label}<select disabled={busy} value={read.project.overrides[field]??'inherit'} onChange={event=>void save(field,event.target.value)}><option value="inherit">Use global ({values.find(option=>option.value===(read.global.values??defaultCollaborationPreferences)[field])?.label})</option>{values.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}</div>}
  {busy&&<p className="pcs-status" role="status">Loading or saving…</p>}
  {error&&<p className="pcs-status pcs-error" role="alert">{error} <button type="button" onClick={()=>setEpoch(n=>n+1)}>Reload</button></p>}
  {!busy&&notice&&<p className="pcs-status" role="status">{notice}</p>}
  <p className="pcs-hint">Previews only blocks GPT Project saves, while your own edits remain available. Other options guide retrieval and writing. GPT always needs your request to change saved work.</p>
 </section>;
}
