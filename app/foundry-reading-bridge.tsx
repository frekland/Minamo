'use client';
import {useState} from 'react';
import Reader,{type ReadingDisplayAdapter} from './reader';
import NoteMarkdownView from './note-markdown-view';
import type {WorkspaceRecord,WorkspaceCommand,CommandReceipt} from '../lib/contracts';
import {languageDomSelection} from '../lib/foundry/language-dom';
import {FoundryAnnotatedText} from './foundry-language-demo';
import {japaneseLanguageFixture} from '../lib/foundry/language-fixtures';
import {admitMathExpression,MATH_CONTRACT} from '../lib/foundry/math';
import {MathExpressionView} from './foundry-math';

/** Lab binding is deliberately ephemeral; no new record family, queue, owner grant or persistent overlay. */
const TEXT=japaneseLanguageFixture.text,TEX='\\int_0^1 x^2\\,dx = \\frac{1}{3}';
export const FOUNDRY_READING_FIXTURE:WorkspaceRecord={family:'article',id:'TEST-ONLY-foundry-reading',title:'Synthetic retained Japanese and mathematical Article',body:'A display decoration leaves the original text, source and captures unchanged.',rev:1,rendition:'TEST-ONLY-foundry-r1',createdAt:'2026-10-25T00:00:00Z',updatedAt:'2026-10-25T00:00:00Z',trashedAt:null,actor:'user',synthetic:true,links:[],sections:[{id:'language',title:'Exact original characters',parts:[{id:'japanese',kind:'paragraph',text:TEXT,language:'ja'}]},{id:'math',title:'Exact mathematical source',parts:[{id:'integral',kind:'code',text:TEX,language:'minamo-math-source'}]}]};
export function foundryReadingAdapter(visible:boolean):ReadingDisplayAdapter{return({article,part,sectionId,common,renderRange})=>{
 if(article.id!==FOUNDRY_READING_FIXTURE.id||article.family!=='article'||article.rendition!==FOUNDRY_READING_FIXTURE.rendition||article.trashedAt||part.unavailable)return;
 if(sectionId==='language'&&part.id==='japanese'&&part.kind==='paragraph'&&part.text===TEXT)return <p lang="ja" onCopy={event=>{try{const selection=window.getSelection();if(!selection||selection.rangeCount!==1)return;const capture=languageDomSelection(event.currentTarget,japaneseLanguageFixture,selection.getRangeAt(0));event.clipboardData.setData("text/plain",capture.quote);event.preventDefault();}catch{event.preventDefault();}}} style={{fontSize:'1.55rem',lineHeight:2.8}}><FoundryAnnotatedText content={japaneseLanguageFixture} visible={visible} renderBase={(start,end)=><span {...common} data-canonical-start={start} data-canonical-end={end}>{renderRange(start,end)}</span>}/></p>;
 if(sectionId==='math'&&part.id==='integral'&&part.kind==='code'&&part.text===TEX)return <MathExpressionView expression={admitMathExpression({contract:MATH_CONTRACT,id:'integral',format:'tex',source:part.text,display:'block',description:'An authored integral equality; typesetting is separate from computation.'})} sourceAttributes={{...common,title:"Exact original TeX source"}}/>;
};}
export default function FoundryReadingBridge(){
 const [visible,setVisible]=useState(true),[enabled,setEnabled]=useState(true),[mode,setMode]=useState('classic'),[commands,setCommands]=useState<WorkspaceCommand[]>([]),[status,setStatus]=useState('No persistent command has been sent.');
 const onCommand=async(command:WorkspaceCommand):Promise<CommandReceipt>=>{setCommands(p=>[...p,command]);setStatus('Command captured for inspection only; no server acknowledgement or save.');throw Object.assign(new Error('Display-only fixture: use the isolated D1 integration test for actual save/readback.'),{status:400});};
 const note='Prediction: I expect the area to be near one third.\n\n```minamo-math-source\n'+TEX+'\n```\n\nThis is my illustrative Note, not learning progress.';
 return <section data-foundry-reading-mode={mode}><h2>Existing Reader and Notes integration</h2><p>These are the actual current components with optional display hooks. Original canonical parts remain unchanged. Capture prepares the existing command shape; this page cannot acknowledge a save.</p><label>Workspace presentation <select value={mode} onChange={e=>setMode(e.target.value)}><option value="classic">Classic fixture</option><option value="focus">Focus fixture</option><option value="task">Task fixture</option></select></label><button onClick={()=>setEnabled(!enabled)}>{enabled?'Disable':'Enable'} dormant display hooks</button><button onClick={()=>setVisible(!visible)}>{visible?'Hide':'Reveal' } pronunciations</button><Reader draftScope="TEST-ONLY-foundry-local@0" article={FOUNDRY_READING_FIXTURE} records={[]} onCommand={onCommand} displayAdapter={enabled?foundryReadingAdapter(visible):undefined}/><h3>Existing Markdown Note viewer</h3><NoteMarkdownView source={note} renderCodeDecoration={enabled?(language,source)=>language==='minamo-math-source'?<div data-foundry-decoration="true"><MathExpressionView expression={admitMathExpression({contract:MATH_CONTRACT,id:'note-equation',format:'tex',source,display:'block'})}/></div>:undefined:undefined}/><output role="status">{status}</output>{commands.length>0&&<pre>{JSON.stringify(commands,null,2)}</pre>}</section>;
}
