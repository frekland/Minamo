import {z} from 'zod';
export const PYTHON_OUTPUT_LIMITS=Object.freeze({stream:20000,source:30000,outputs:8,pngBytes:2*1024*1024,totalBytes:6*1024*1024,rows:200,columns:30,pixels:4096*4096});
const scalar=z.union([z.string().max(1000),z.number().finite(),z.boolean(),z.null()]);
const table=z.object({kind:z.literal('table'),label:z.string().min(1).max(200),columns:z.array(z.string().max(100)).min(1).max(30),rows:z.array(z.array(scalar).max(30)).max(200)}).strict().superRefine((v,c)=>{if(v.rows.some(r=>r.length!==v.columns.length))c.addIssue({code:'custom',message:'Table rows must match columns'});});
const png=z.object({kind:z.literal('png'),label:z.string().min(1).max(200),base64:z.string().min(32).max(Math.ceil(PYTHON_OUTPUT_LIMITS.pngBytes*4/3)+4),width:z.number().int().min(1).max(4096),height:z.number().int().min(1).max(4096)}).strict();
export const pythonResultSchema=z.object({contract:z.literal('minamo.python-results.v1'),stdout:z.string().max(20000),stderr:z.string().max(20000),error:z.string().max(10000).nullable(),truncated:z.boolean(),outputs:z.array(z.union([table,png])).max(8),runtime:z.literal('Pyodide 0.28.3')}).strict();
export type PythonResult=z.infer<typeof pythonResultSchema>;
export type PythonLabRun={contract:'minamo.python-lab-run.v1';runId:string;status:'completed'|'error'|'interrupted';capturedCode:string;inputSha256:string;observedAt:string;durationMs:number;provenance:'local-lab-execution';result:PythonResult};
export function decodePngHeader(base64:string){
 if(!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))throw Error('Invalid PNG base64');
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 if(bytes.length>PYTHON_OUTPUT_LIMITS.pngBytes||bytes.length<33||[137,80,78,71,13,10,26,10].some((x,i)=>bytes[i]!==x)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw Error('Invalid PNG signature/header');
 const view=new DataView(bytes.buffer),width=view.getUint32(16),height=view.getUint32(20);
 if(!width||!height||width>4096||height>4096||width*height>PYTHON_OUTPUT_LIMITS.pixels)throw Error('PNG pixel budget exceeded');
 return {bytes:bytes.length,width,height};
}
/** Worker output is untrusted even when our runtime observed it. No HTML or SVG accepted. */
export function admitPythonResult(value:unknown):PythonResult{
 // Reject collection bombs before Zod constructs per-item issues (baseline Zod advisory).
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Expected bounded Python result');
 const raw=value as Record<string,unknown>;
 if(!Array.isArray(raw.outputs)||raw.outputs.length>8)throw Error('Output collection budget exceeded');
 for(const key of ['stdout','stderr','error'])if(typeof raw[key]==='string'&&(raw[key] as string).length>(key==='error'?10000:20000))throw Error('Output stream budget exceeded');
 for(const item of raw.outputs){if(!item||typeof item!=='object'||Array.isArray(item))throw Error('Invalid output item');const output=item as Record<string,unknown>;
  if(output.kind==='table'){if(!Array.isArray(output.columns)||output.columns.length>30||!Array.isArray(output.rows)||output.rows.length>200||output.rows.some(row=>!Array.isArray(row)||row.length>30))throw Error('Table collection budget exceeded');}
  if(output.kind==='png'&&typeof output.base64==='string'&&output.base64.length>Math.ceil(PYTHON_OUTPUT_LIMITS.pngBytes*4/3)+4)throw Error('PNG byte budget exceeded');
 }
 const parsed=pythonResultSchema.parse(value);let total=0;
 for(const output of parsed.outputs){
  if(output.kind==='png'){const h=decodePngHeader(output.base64);if(h.width!==output.width||h.height!==output.height)throw Error('PNG dimensions disagree with payload');total+=h.bytes;}
  else total+=new TextEncoder().encode(JSON.stringify(output)).length;
 }
 if(total>PYTHON_OUTPUT_LIMITS.totalBytes)throw Error('Combined output budget exceeded');
 return parsed;
}
export function pythonResultFallback(result:PythonResult){return [result.stdout,result.stderr&&'stderr:\n'+result.stderr,result.error&&'error:\n'+result.error,...result.outputs.map(o=>o.kind==='png'?`${o.label}: PNG ${o.width}×${o.height}`:[o.label,o.columns.join('\t'),...o.rows.map(r=>r.map(v=>v===null?'null':String(v)).join('\t'))].join('\n'))].filter(Boolean).join('\n');}
/** User/imported results cannot acquire an execution receipt by supplying a field. */
export function suppliedPythonOutput(value:unknown){return {provenance:'supplied-output' as const,result:admitPythonResult(value)};}
export function interruptedPythonResult(message='Execution deliberately interrupted; no automatic rerun.'):PythonResult{return {contract:'minamo.python-results.v1',stdout:'',stderr:'',error:message,truncated:false,outputs:[],runtime:'Pyodide 0.28.3'};}
