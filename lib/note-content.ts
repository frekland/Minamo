import {createTerminalCapture,terminalCaptureMarker,validateNoteTerminalCaptures,NOTE_BODY_LIMIT,type TerminalCapture} from './note-terminal';
/** Input convenience only. Durable authority remains the existing versioned Note body. */
export type NoteContentBlock={kind:'markdown';text:string}|({kind:'terminal'}&TerminalCapture);
export function compileNoteContent(input:unknown):string{
 if(!Array.isArray(input)||!input.length||input.length>40)throw Error('data.noteContent must contain 1–40 markdown or terminal blocks.');
 const parts=input.map((value,index)=>{
  const path=`data.noteContent[${index}]`;
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`${path} must be a markdown or terminal object.`);
  if(value.kind==='markdown'){
   if(Object.keys(value).some(key=>!['kind','text'].includes(key))||typeof value.text!=='string')throw Error(`${path} accepts only kind:"markdown" and text.`);
   return value.text;
  }
  if(value.kind==='terminal'){
   const {kind,...capture}=value;
   try{return terminalCaptureMarker(createTerminalCapture(capture));}catch(error){throw Error(`${path}: ${(error as Error).message}`);}
  }
  throw Error(`${path}.kind must be markdown or terminal.`);
 });
 const body=parts.join('\n\n');
 if(body.length>NOTE_BODY_LIMIT)throw Error(`data.noteContent encodes to ${body.length} characters; the Note limit is ${NOTE_BODY_LIMIT}. Keep the submitted content and choose a smaller excerpt or attach the full file. Nothing was truncated or saved.`);
 const captures=validateNoteTerminalCaptures(body),expected=input.filter(value=>value.kind==='terminal');
 if(expected.some(value=>!captures.some(({capture})=>capture.id===value.id&&capture.output===value.output)))throw Error('data.noteContent terminal blocks must be outside Markdown code fences. Close surrounding Markdown fences and retry with the retained content; no terminal capture was saved.');
 return body;
}
