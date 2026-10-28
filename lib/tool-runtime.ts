import {clientId} from "./client-id";
/** Browser-owned runtime manager. No user records or runtime instances are held in server globals. */
export type ToolEngine='regex'|'unicode'|'sql'|'python'|'web';
export type ToolInput={code:string;stdin?:string;text?:string;flags?:string;html?:string;css?:string};
export type ToolResult={output:string;runtime:string;fidelity:string;durationMs:number;status:'completed'|'error'|'interrupted';capturedInput:ToolInput;observedAt:string};
export const toolExamples:Record<ToolEngine,ToolInput>={
 regex:{code:'\\b[a-z]+\\b',text:'Predict → test → inspect. café',flags:'giu'},
 unicode:{code:'café 👩🏽‍💻 日本語\ne\u0301 ≠ é'},
 sql:{code:"CREATE TABLE readings (label TEXT, value REAL);\nINSERT INTO readings VALUES ('first', 12), ('second', 18), ('missing', NULL);\nSELECT label, value, AVG(value) OVER () AS mean FROM readings;"},
 python:{code:'values = [12, 18, 24]\nprint("Values:", values)\nprint("Mean:", sum(values) / len(values))\nprint("UTF-8 bytes:", "café".encode("utf-8"))',stdin:''},
 web:{code:'Fixed finite DOM event handler',html:'<main><h1>One event, one change</h1><p>Predict the effect before pressing the button.</p><button id="add" type="button">Add one</button><p>Count: <output id="count" aria-live="polite">0</output></p></main>',css:'main { max-width: 34rem; padding: 1.5rem; margin: auto; font: 1rem/1.6 system-ui; }\nbutton { padding: .7rem 1rem; }\n@media (max-width: 28rem) { button { width: 100%; } }'}
};
export function inspectUnicode(text:string){
 if(text.length>12000)throw Error('Unicode input is limited to 12,000 UTF-16 code units.');
 const bytes=new TextEncoder().encode(text);let offset=0;
 const points=Array.from(text).slice(0,256).map(character=>{const point=character.codePointAt(0)!;const row={character:character==='\n'?'↵':character===' '?'␠':character,codePoint:'U+'+point.toString(16).toUpperCase().padStart(4,'0'),utf16Start:offset,utf16Length:character.length,utf8:Array.from(new TextEncoder().encode(character)).map(b=>b.toString(16).padStart(2,'0')).join(' ')};offset+=character.length;return row;});
 return {utf16CodeUnits:text.length,codePoints:Array.from(text).length,utf8Bytes:bytes.length,NFC:text.normalize('NFC'),NFD:text.normalize('NFD'),points,truncated:Array.from(text).length>256};
}
const allowedTags=new Set('main section article header footer div span p h1 h2 h3 h4 ul ol li strong em b i small br hr button output label input pre code blockquote'.split(' '));
const allowedAttributes=new Set('id class title role type value name disabled checked for tabindex aria-label aria-live aria-describedby aria-labelledby'.split(' '));
/** Finite admitted Web mode ported from Minamo web-mode.mjs; not a general HTML sanitizer. */
export function validateWeb(input:ToolInput){
 const html=input.html??'',css=input.css??'';
 if(new TextEncoder().encode(html+css).length>16000)throw Error('Web input is limited to 16 KiB so the complete captured input can be saved.');
 let position=0;for(const match of html.matchAll(/<[^>]*>/g)){
 if(html.slice(position,match.index).includes('<'))throw Error('Unsupported HTML syntax.');position=match.index!+match[0].length;
 const parsed=/^<(\/)?([a-z][a-z0-9]*)(\s[^<>]*)?\s*(\/)?\s*>$/i.exec(match[0]);
 if(!parsed||!allowedTags.has(parsed[2].toLowerCase()))throw Error('Use text/layout elements, buttons and inputs. Scripts, frames and external content are unavailable.');
 let rest=(parsed[3]??'').trim();if(parsed[1]&&rest)throw Error('Closing tags cannot have attributes.');
 while(rest){const attribute=/^([a-z][a-z0-9-]*)(?:\s*=\s*("[^"<>]*"|'[^'<>]*'))?(?:\s+|$)/i.exec(rest);if(!attribute||!allowedAttributes.has(attribute[1].toLowerCase()))throw Error('Use quoted safe attributes. Event handlers, URLs and inline styles are unavailable.');rest=rest.slice(attribute[0].length).trim();}
 }
 if(html.slice(position).includes('<')||/url\s*\(|@import|expression\s*\(|[<>]/i.test(css))throw Error('Imports, URLs, embedded markup and unsupported HTML syntax are unavailable.');
 return {html,css};
}
let activeCancel:(()=>void)|null=null;
export function cancelToolExecution(){activeCancel?.();}
const result=(input:ToolInput,began:number,data:{output:string;runtime:string;fidelity:string;status?:ToolResult['status']}):ToolResult=>({...data,status:data.status??'completed',output:data.output.length>39000?data.output.slice(0,38900)+'\n[retained output truncated at 39,000 characters]':data.output,capturedInput:structuredClone(input),durationMs:Date.now()-began,observedAt:new Date().toISOString()});
let pythonAssets:Promise<Record<string,ArrayBuffer>>|null=null;
async function loadPythonAssets(){
 if(!pythonAssets)pythonAssets=Promise.all(['pyodide.js','pyodide.asm.js','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json','__controller'].map(async name=>{const r=await fetch(name==='__controller'?'/tools/python-isolate.js':'/runtime/pyodide/'+name);if(!r.ok)throw Error('Bundled Python asset unavailable: '+name);return [name,await r.arrayBuffer()] as const;})).then(Object.fromEntries).catch(e=>{pythonAssets=null;throw e;});
 return pythonAssets;
}
export async function executeTool(engine:Exclude<ToolEngine,'web'>,input:ToolInput,onPhase?:(phase:string)=>void):Promise<ToolResult>{
 if(typeof window==='undefined')throw Error('Tools run only in the browser.');
 if(activeCancel)throw Error('A tool is already running. Finish or cancel it first.');
 if(input.code.length>30000)throw Error('Code is limited to 30,000 characters.');
 const captured=structuredClone(input),began=Date.now();
 if(engine==='unicode')return result(captured,began,{output:JSON.stringify(inspectUnicode(captured.code),null,2),runtime:'Browser Unicode / UTF-8',fidelity:'Actual JavaScript Unicode normalization, code points, UTF-16 offsets and TextEncoder output. Not grapheme count or a terminal.'});
 if(engine==='python'){
 onPhase?.('Loading bundled Python runtime…');
 // Asset loading is bounded independently; execution only starts after this awaited preparation.
 const assets=await new Promise<Record<string,ArrayBuffer>>((resolve,reject)=>{let done=false;const finish=(value?:Record<string,ArrayBuffer>,error?:Error)=>{if(done)return;done=true;clearTimeout(timer);activeCancel=null;error?reject(error):resolve(value!);};const timer=setTimeout(()=>finish(undefined,Error('Python asset loading timed out. No code was executed.')),30000);activeCancel=()=>finish(undefined,Error('Python preparation cancelled. No code was executed.'));loadPythonAssets().then(value=>finish(value),error=>finish(undefined,error));});
 const frame=document.createElement('iframe');frame.sandbox.add('allow-scripts');frame.hidden=true;frame.title='Opaque-origin isolated Python runtime';
 const token=clientId();
 return new Promise((resolve,reject)=>{
 let done=false,sent=false;const finish=(value?:ToolResult,error?:Error)=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',receive);activeCancel=null;frame.remove();error?reject(error):resolve(value!);};
 const timer=setTimeout(()=>finish(result(captured,began,{output:'Execution interrupted: Python exceeded the 20 second limit. No automatic rerun.',runtime:'Pyodide 0.28.3',fidelity:'The opaque runtime frame and its Worker were removed.',status:'interrupted'})),20000);
 const receive=(event:MessageEvent)=>{if(event.source!==frame.contentWindow)return;if(event.data?.ready&&!sent){sent=true;frame.contentWindow!.postMessage({token,assets,input:captured},'*');return;}if(event.data?.token!==token)return;if(typeof event.data.phase==='string'){onPhase?.(event.data.phase);return;}if(event.data.error){finish(result(captured,began,{output:String(event.data.error),runtime:'Pyodide 0.28.3',fidelity:'Actual isolated runtime error.',status:'error'}));return;}if(event.data.result){const d=event.data.result;finish(result(captured,began,{output:[String(d.stdout??''),d.stderr?'stderr:\n'+String(d.stderr):'',d.error?'error:\n'+String(d.error):'',d.truncated?'[output truncated at 20,000 characters per stream]':''].filter(Boolean).join('\n')||'(no output)',runtime:String(d.runtime??'Pyodide 0.28.3'),fidelity:String(d.fidelity??''),status:d.error?'error':'completed'}));}};
 window.addEventListener('message',receive);activeCancel=()=>finish(result(captured,began,{output:'Execution deliberately cancelled. Captured input is retained; no automatic rerun.',runtime:'Pyodide 0.28.3',fidelity:'Opaque runtime removed.',status:'interrupted'}));
 const nonce=cspNonce(),controller=new TextDecoder().decode(assets.__controller).replace(/<\/script/gi,'<\\/script');
 frame.onload=()=>{if(!sent&&!done)onPhase?.('Opaque Python frame loaded; waiting for controller acknowledgement…');};
 onPhase?.('Starting opaque Python controller…');
 frame.srcdoc='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'nonce-'+nonce+'\' blob: \'unsafe-eval\' \'wasm-unsafe-eval\'; worker-src blob:; connect-src blob:; style-src \'none\'; frame-src \'none\'; form-action \'none\'; base-uri \'none\'"><title>Opaque Python runtime</title></head><body><script nonce="'+nonce+'">'+controller+'</script></body></html>';
 document.body.appendChild(frame);
 });
 }
 onPhase?.(engine==='sql'?'Initialising bundled SQLite…':'Running isolated regular expression…');
 return new Promise((resolve,reject)=>{
 const worker=new Worker('/tools/tool-worker.js');let done=false;
 const finish=(value?:ToolResult,error?:Error)=>{if(done)return;done=true;clearTimeout(timer);worker.terminate();activeCancel=null;error?reject(error):resolve(value!);};
 const timer=setTimeout(()=>finish(result(captured,began,{output:'Execution interrupted at the 10 second limit. Input retained; no automatic rerun.',runtime:engine==='sql'?'SQLite sql.js 1.13.0':'JavaScript RegExp',fidelity:'Dedicated Worker terminated.',status:'interrupted'})),10000);
 activeCancel=()=>finish(result(captured,began,{output:'Execution deliberately cancelled. Input retained.',runtime:engine==='sql'?'SQLite sql.js 1.13.0':'JavaScript RegExp',fidelity:'Dedicated Worker terminated.',status:'interrupted'}));
 worker.onmessage=event=>{if(event.data?.error)finish(result(captured,began,{output:String(event.data.error),runtime:engine==='sql'?'SQLite sql.js 1.13.0':'JavaScript RegExp',fidelity:'Actual runtime error.',status:'error'}));else if(event.data?.result)finish(result(captured,began,{...event.data.result,output:[event.data.result.error?'Error: '+String(event.data.result.error):'',JSON.stringify(event.data.result.rows??event.data.result.matches,null,2),event.data.result.truncated?'[retained output truncated at the stated bound]':''].filter(Boolean).join('\n'),status:event.data.result.error?'error':'completed'}));};
 worker.onerror=event=>finish(undefined,Error(event.message||'The isolated Worker could not start. Input retained.'));
 worker.postMessage({engine,input:captured});
 });
}
function cspNonce(){const bytes=crypto.getRandomValues(new Uint8Array(18));return btoa(String.fromCharCode(...bytes));}
export type WebSession={close:()=>void;capture:()=>Promise<ToolResult>};
/** Explicit neutral theme for the opaque preview; authored experiment CSS may override it. */
export function webPreviewThemeCss(values:Record<string,string>={}){
 const defaults:Record<string,string>={'canvas':'#1B1B1B','surface':'#252525','surface-secondary':'#2D2D2D','border-control':'#888888','text':'#F5F5F5','text-body':'#E2E2E2','text-muted':'#B1B1B1','interactive':'#8CAED1','interactive-hover':'#A3C1DF','on-accent':'#1B1B1B','focus':'#8CAED1','selected':'#2A3A4A','code-bg':'#202020'};
 const tokens=Object.entries(defaults).map(([role,fallback])=>`--mn-${role}:${/^#[0-9a-f]{6}$/i.test(values[role]?.trim()??'')?values[role].trim():fallback}`).join(';');
 return `:root{color-scheme:dark;${tokens}}html{background:var(--mn-canvas);color:var(--mn-text-body);font:16px/1.7 system-ui}body{margin:0}button,input{font:inherit}button{background:var(--mn-interactive);color:var(--mn-on-accent);border:1px solid transparent;border-radius:6px;min-height:44px;padding:.6rem 1rem;cursor:pointer}button:hover{background:var(--mn-interactive-hover)}input{background:var(--mn-surface);color:var(--mn-text);border:1px solid var(--mn-border-control);padding:.5rem}a{color:var(--mn-interactive)}pre,code{background:var(--mn-code-bg);color:var(--mn-text-body)}:focus-visible{outline:2px solid var(--mn-focus);outline-offset:3px}::selection{background:var(--mn-selected);color:var(--mn-text)}@media(forced-colors:active){:focus-visible{outline-color:Highlight}}`;
}
export function startWebSession(frame:HTMLIFrameElement,input:ToolInput,onResult:(value:ToolResult)=>void):WebSession{
 const computedTheme=getComputedStyle(document.documentElement);const previewTheme=webPreviewThemeCss(Object.fromEntries(['canvas','surface','surface-secondary','border-control','text','text-body','text-muted','interactive','interactive-hover','on-accent','focus','selected','code-bg'].map(role=>[role,computedTheme.getPropertyValue('--mn-'+role)])));
 const files=validateWeb(input),captured=structuredClone(input),began=Date.now(),token=clientId();let last:ToolResult|undefined;let pending:((result:ToolResult)=>void)|null=null;let closed=false;
 const receive=(event:MessageEvent)=>{if(closed||event.source!==frame.contentWindow||event.data?.token!==token)return;
 if(event.data.type==='ready'){frame.contentWindow?.postMessage({token,files},'*');return;}
 if(event.data.type==='observation'&&typeof event.data.text==='string'){
 last=result(captured,began,{output:JSON.stringify({text:event.data.text.slice(0,5000),console:Array.isArray(event.data.console)?event.data.console.slice(0,30):[],viewport:event.data.viewport,contentWidth:event.data.contentWidth},null,2),runtime:'Browser DOM / bounded event handler',fidelity:'Actual opaque-origin HTML/CSS and fixed Add one button event. No arbitrary JavaScript, network, owner APIs or embedded content. Not a hostile-code CPU sandbox.'});onResult(last);pending?.(last);pending=null;
 }};
 window.addEventListener('message',receive);frame.sandbox.value='allow-scripts';frame.name=token;
 void fetch('/tools/web-isolate.js').then(async response=>{if(!response.ok)throw Error('Trusted Web controller is unavailable.');const controller=('window.name='+JSON.stringify(token)+';\n'+await response.text()).replace(/<\/script/gi,'<\\/script');if(closed)return;const nonce=cspNonce();frame.srcdoc='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'nonce-'+nonce+'\'; style-src \'unsafe-inline\'; connect-src \'none\'; worker-src \'none\'; frame-src \'none\'; form-action \'none\'; base-uri \'none\'"><title>Bounded DOM experiment</title><style>'+previewTheme+'</style></head><body><script nonce="'+nonce+'">'+controller+'</script></body></html>';}).catch(error=>{if(!closed)onResult(result(captured,began,{output:String(error instanceof Error?error.message:error),runtime:'Browser DOM',fidelity:'Web preview startup failed; no DOM execution is claimed.',status:'error'}));});
 return {close(){closed=true;window.removeEventListener('message',receive);frame.removeAttribute('srcdoc');frame.src='about:blank';},capture(){return new Promise((resolve,reject)=>{if(closed)return reject(Error('Web preview closed.'));pending=resolve;frame.contentWindow?.postMessage({token,type:'capture'},'*');setTimeout(()=>{if(pending===resolve){pending=null;last?resolve(last):reject(Error('No Web observation was acknowledged.'));}},2000);});}};
}
