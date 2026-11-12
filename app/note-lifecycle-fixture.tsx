'use client';
import {useRef,useState} from 'react';
import {terminalCaptureMarker} from '../lib/note-terminal';
import NoteMarkdownView from './note-markdown-view';
import NoteWritingEditor,{type NoteEditorMemory} from './note-writing-editor';
import {escapePlainNoteForMarkdown} from '../lib/notes-window';
import type {PassagePart} from '../lib/contracts';
import './notes-workspace.css';

type Draft={body:string;format?:'markdown-v1'};
const initial:Record<string,Draft>={terminal:{body:'Prediction: curl should return 200.\n\n'+terminalCaptureMarker({id:'TEST-ONLY-curl',environment:'Kali · Bash',label:'Local shutdown response',command:'curl -i http://127.0.0.1:8080/jobs',output:'$ curl -i http://127.0.0.1:8080/jobs\r\nHTTP/1.1 503 Service Unavailable\r\n\t retry → pending 😄\r\n```text\r\n    error: shutdown began\r\n'})+'\n\nObservation: 503 contradicts my prediction. Interpretation: shutdown may reject admission; not proved. Next: compare retry during drain.',format:'markdown-v1'},rich:{body:'# TEST ONLY rich Note\n\nOriginal rich text, before any edit.\n\n```python\nprint("exact code 😄")\n```\n\n[[minamo-image:v1:TEST-ONLY-inline-image]]',format:'markdown-v1'},plain:{body:'TEST ONLY **literal** plain text and `ticks`.'},fallback:{body:'| TEST ONLY | Source |\n| --- | --- |\n| Original | preserved |',format:'markdown-v1'}};
/** Development-only actual component exercise. No account, storage or save request. */
export default function NoteLifecycleFixture(){
 const [drafts,setDrafts]=useState<Record<string,Draft>>(()=>structuredClone(initial)),[selected,setSelected]=useState('rich'),[mounted,setMounted]=useState(true),[enabled,setEnabled]=useState(true),[scope,setScope]=useState('TEST-ONLY-A'),[writes,setWrites]=useState<{identity:string;body:string}[]>([]),[composing,setComposing]=useState(false),[,refresh]=useState(0);
 const memory=useRef<NoteEditorMemory>({states:new Map(),scrolls:new Map(),sources:new Map()});
 const identity=scope+':'+selected,draft=drafts[selected];
 const change=(body:string)=>{setDrafts(old=>({...old,[selected]:{...old[selected],body}}));setWrites(old=>[...old,{identity,body}])};
 const imageParts:PassagePart[]=[]; // Missing typed metadata shows unavailable without fetching any asset.
 return <main style={{padding:24,maxWidth:1100,margin:'auto',height:'100dvh',overflow:'auto',color:'var(--text,#e4edf3)',background:'var(--bg,#1c2228)'}}>
  <h1>TEST ONLY · actual Note editor lifecycle</h1><p>This development-only fixture mounts the production NoteWritingEditor. Drafts and editor memory are in process; no account, durable save, network acknowledgement or learner achievement is represented. Use the actual workspace for autosave/operation acceptance.</p>
  <nav aria-label="Lifecycle fixture controls" style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   {['rich','plain','fallback','terminal'].map(id=><button key={id} onClick={()=>setSelected(id)}>Open {id} Note</button>)}
   <button onClick={()=>setMounted(!mounted)}>{mounted?'Navigate away from editor':'Reopen editor'}</button>
   <button onClick={()=>setEnabled(!enabled)}>{enabled?'Minimise fixture editor':'Restore fixture editor'}</button>
   <button onClick={()=>setScope(scope==='TEST-ONLY-A'?'TEST-ONLY-B':'TEST-ONLY-A')}>Change isolated scope</button>
   <button onClick={()=>refresh(n=>n+1)}>Inspect editor memory</button>
  </nav>
  <p>Selected: <strong>{selected}</strong> · scope: <strong>{scope}</strong> · writes: <strong>{writes.length}</strong> · composing: {String(composing)}</p>
  <section aria-label="Actual Note editor" hidden={!enabled} style={{border:'1px solid #7d949e',padding:16,margin:'16px 0'}}>
   {mounted&&<NoteWritingEditor memory={memory.current} scope={scope} identity={identity} value={draft.body} format={draft.format} enabled={enabled} disabled={false} imageParts={imageParts} onChange={change} onEnableRich={()=>setDrafts(old=>({...old,[selected]:{body:escapePlainNoteForMarkdown(old[selected].body),format:'markdown-v1'}}))} onComposing={setComposing}/>}
  </section>
  {draft.format&&<section aria-label="Saved Note representation"><h2>Saved Note representation · current fixture source</h2><NoteMarkdownView source={draft.body}/></section>}
  <details><summary>Exact fixture source and memory</summary><pre aria-label="Current exact draft source">{draft.body}</pre><pre aria-label="Editor memory receipt">{JSON.stringify([...memory.current.states].map(([id,state])=>({identity:id,selection:state.selection.toJSON(),scroll:memory.current.scrolls.get(id),text:state.doc.textContent,source:memory.current.sources?.get(id)})),null,2)}</pre><pre aria-label="Editor write receipts">{JSON.stringify(writes,null,2)}</pre></details>
 </main>;
}
