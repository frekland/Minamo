import type {WorkspaceRecord} from './contracts';
import {toolExamples,validateWeb,type ToolEngine,type ToolInput} from './tool-runtime';
export type LoadedExperiment={id:string;title:string;rev:number;engine:ToolEngine};
export type DraftCheckpoint={engine:ToolEngine;input:ToolInput;loaded?:LoadedExperiment;synthetic:boolean;retainedAt:string};
export type ExperimentDraft={engine:ToolEngine;input:ToolInput;source:LoadedExperiment;synthetic:boolean;inputNote:string};
export function isToolEngine(value:unknown):value is ToolEngine{return typeof value==='string'&&['python','sql','regex','unicode','web'].includes(value);}
export function validToolInput(value:unknown):value is ToolInput{
 if(!value||typeof value!=='object')return false;const input=value as Record<string,unknown>;
 return typeof input.code==='string'&&input.code.length<=30000&&['stdin','text','flags','html','css'].every(key=>input[key]===undefined||typeof input[key]==='string'&&(input[key] as string).length<=30000);
}
export function validLoadedExperiment(value:unknown):value is LoadedExperiment{if(!value||typeof value!=='object')return false;const x=value as Record<string,unknown>;return typeof x.id==='string'&&typeof x.title==='string'&&Number.isSafeInteger(x.rev)&&isToolEngine(x.engine);}
export function validDraftCheckpoint(value:unknown):value is DraftCheckpoint{if(!value||typeof value!=='object')return false;const x=value as Record<string,unknown>;return isToolEngine(x.engine)&&validToolInput(x.input)&&typeof x.synthetic==='boolean'&&typeof x.retainedAt==='string'&&(x.loaded===undefined||validLoadedExperiment(x.loaded));}
/** Pure preparation only. This function cannot create a runtime or execute code. */
export function experimentEditorDraft(record:WorkspaceRecord):ExperimentDraft{
 if(record.family!=='experiment'||!isToolEngine(record.engine)||typeof record.code!=='string'||!record.code.trim()||record.code.length>30000)throw Error('This Experiment needs a supported engine and saved code before it can be loaded.');
 const engine=record.engine,input={...structuredClone(toolExamples[engine]),code:record.code};
 let inputNote='Saved code loaded exactly. No execution has started.';
 if(engine==='regex')inputNote='Saved pattern loaded exactly. Sample text and flags use the visible built-in defaults because this Experiment has no saved auxiliary-input fields.';
 if(engine==='python')inputNote='Saved Python code loaded exactly. Standard input is the visible empty default; no execution has started.';
 if(engine==='web'){
 let files:unknown;try{files=JSON.parse(record.code)}catch{throw Error('Bounded Web Experiments must store code as JSON with html and css strings. Arbitrary JavaScript is not loaded or executed.');}
 if(!files||typeof files!=='object'||Array.isArray(files)||Object.keys(files).some(key=>!['html','css'].includes(key))||typeof (files as {html?:unknown}).html!=='string'||typeof (files as {css?:unknown}).css!=='string')throw Error('Bounded Web code needs exactly html and css strings; there is no arbitrary JavaScript field.');
 const safe=validateWeb({code:toolExamples.web.code,html:(files as {html:string}).html,css:(files as {css:string}).css});
 input.code=toolExamples.web.code;input.html=safe.html;input.css=safe.css;
 inputNote='Saved HTML and CSS loaded from the explicit JSON payload. The finite built-in event handler is unchanged; no preview has started.';
 }
 return {engine,input,source:{id:record.id,title:record.title,rev:record.rev,engine},synthetic:record.synthetic,inputNote};
}
/** One recoverable replacement checkpoint; restore swaps instead of discarding current text. */
export function replaceEditorDraft(previous:ToolInput,incoming:ToolInput,engine:ToolEngine,loaded:LoadedExperiment|undefined,synthetic:boolean,at:string):{input:ToolInput;checkpoint:DraftCheckpoint}{
 return {input:structuredClone(incoming),checkpoint:{engine,input:structuredClone(previous),...(loaded?{loaded:structuredClone(loaded)}:{}),synthetic,retainedAt:at}};
}
/** Activity Attempts share durable storage with Runs, but are never tool execution. */
export function isSavedToolRun(record:{family:string;engine?:unknown;attempt?:unknown;trashedAt?:string|null}){
 return record.family==='run'&&!record.trashedAt&&!record.attempt&&isToolEngine(record.engine);
}
