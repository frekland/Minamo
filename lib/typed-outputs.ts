import {assertJsonBudget} from './foundry/platform';
import {foundryDigest} from './foundry/digest';
import type {ArticleSection} from './contracts';
/** Transported browser results are reported evidence; the server did not observe execution. */
export type TypedOutputBundle={contract:'minamo.outputs.v1';codeSha256:string;runtime:string;classification:'supplied-output'|'browser-reported-output';status:'completed'|'error'|'interrupted';stdout:string;stderr:string;error:string|null;outputs:(
 {kind:'table';id:string;label:string;columns:string[];rows:(string|number|boolean|null)[][]}
 | {kind:'image';id:string;label:string;sectionId:string;partId:string;mime:'image/png'}
 )[]};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const id=(v:unknown)=>typeof v==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(v);
const str=(v:unknown,n:number)=>typeof v==='string'&&v.length<=n;
const keys=(v:Record<string,unknown>,allowed:string[])=>Object.keys(v).every(k=>allowed.includes(k));
export function admitTypedOutputBundle(input:unknown):TypedOutputBundle{
 assertJsonBudget(input);
 if(!object(input)||!keys(input,['contract','codeSha256','runtime','classification','status','stdout','stderr','error','outputs'])||input.contract!=='minamo.outputs.v1'||!/^([a-f0-9]{64})$/.test(String(input.codeSha256))||!str(input.runtime,160)||!input.runtime||!['supplied-output','browser-reported-output'].includes(String(input.classification))||!['completed','error','interrupted'].includes(String(input.status))||!str(input.stdout,20000)||!str(input.stderr,20000)||(input.error!==null&&!str(input.error,10000))||!Array.isArray(input.outputs)||input.outputs.length>8)throw Error('Use bounded minamo.outputs.v1 with an exact codeSha256, runtime, supplied/browser-reported classification and outputs.');
 if(input.status==='interrupted'&&(input.outputs.length||input.stdout||input.stderr))throw Error('Interrupted results cannot retain earlier successful output.');
 if(input.status==='completed'&&input.error!==null)throw Error('Completed output cannot carry an execution error.');
 if(input.status==='error'&&(!input.error||input.outputs.length))throw Error('Failed runs need an explicit error and must not retain successful outputs.');
 const ids=new Set<string>();
 for(const output of input.outputs){
  if(!object(output)||!id(output.id)||ids.has(String(output.id))||!str(output.label,200)||!output.label)throw Error('Outputs need unique IDs and bounded labels.');ids.add(String(output.id));
  if(output.kind==='table'){
   if(!keys(output,['kind','id','label','columns','rows'])||!Array.isArray(output.columns)||!output.columns.length||output.columns.length>30||!output.columns.every(c=>str(c,100))||!Array.isArray(output.rows)||output.rows.length>200||!output.rows.every(r=>Array.isArray(r)&&r.length===(output.columns as unknown[]).length&&r.every(v=>v===null||typeof v==='boolean'||typeof v==='number'&&Number.isFinite(v)||str(v,1000))))throw Error('Tables need 1–30 columns, at most 200 rows and finite scalar cells.');
  }else if(output.kind==='image'){
   if(!keys(output,['kind','id','label','sectionId','partId','mime'])||!id(output.sectionId)||!id(output.partId)||output.mime!=='image/png')throw Error('PNG outputs reference an existing owned section/part attachment; inline image bytes and remote URLs are unavailable.');
  }else throw Error('Only typed tables and existing owned PNG image attachments are supported.');
 }
 if(new TextEncoder().encode(JSON.stringify(input)).length>96000)throw Error('Output metadata exceeds 96,000 bytes; use an owned image attachment for figure bytes.');
 return structuredClone(input) as TypedOutputBundle;
}
export async function validateTypedOutputBinding(bundle:TypedOutputBundle,code:string,sections:ArticleSection[]=[]){
 const value=admitTypedOutputBundle(bundle);
 if(await foundryDigest(new TextEncoder().encode(code))!==value.codeSha256)throw Error('Output codeSha256 must match the exact saved Run code.');
 for(const output of value.outputs)if(output.kind==='image'){
  const part=sections.find(s=>s.id===output.sectionId)?.parts.find(p=>p.id===output.partId);
  if(!part||part.kind!=='image'||!part.image||part.unavailable)throw Error('Each image output must reference an available image attachment in the same Run.');
 }
 return value;
}
/** Called after normal image/source projections; never retains metadata for a revoked picture. */
export function projectTypedOutputBundle(bundle:TypedOutputBundle|undefined,sections:ArticleSection[]|undefined):TypedOutputBundle|undefined{
 if(!bundle)return undefined;
 return {...bundle,outputs:bundle.outputs.filter(output=>output.kind!=='image'||!!sections?.find(s=>s.id===output.sectionId)?.parts.some(p=>p.id===output.partId&&p.kind==='image'&&p.image&&!p.unavailable))};
}
export function typedOutputText(bundle:TypedOutputBundle){const v=admitTypedOutputBundle(bundle);return ['Reported output · '+v.runtime,v.stdout,v.stderr&&'stderr:\n'+v.stderr,v.error&&'error:\n'+v.error,...v.outputs.map(o=>o.kind==='image'?o.label+' · owned PNG attachment':[o.label,o.columns.join('\t'),...o.rows.map(row=>row.map(cell=>cell===null?'null':String(cell)).join('\t'))].join('\n'))].filter(Boolean).join('\n');}
export const typedOutputJsonSchema={type:'object',description:'Bounded typed reported results. Images reference ordinary owned PNG sections; never accepts observed execution or raw HTML.',properties:{contract:{const:'minamo.outputs.v1'},codeSha256:{type:'string',pattern:'^[a-f0-9]{64}$'},runtime:{type:'string',maxLength:160},classification:{enum:['supplied-output','browser-reported-output']},status:{enum:['completed','error','interrupted']},stdout:{type:'string',maxLength:20000},stderr:{type:'string',maxLength:20000},error:{type:['string','null'],maxLength:10000},outputs:{type:'array',maxItems:8,items:{oneOf:[{type:'object',properties:{kind:{const:'table'},id:{type:'string'},label:{type:'string',maxLength:200},columns:{type:'array',minItems:1,maxItems:30,items:{type:'string',maxLength:100}},rows:{type:'array',maxItems:200,items:{type:'array',maxItems:30,items:{type:['string','number','boolean','null']}}}},required:['kind','id','label','columns','rows'],additionalProperties:false},{type:'object',properties:{kind:{const:'image'},id:{type:'string'},label:{type:'string',maxLength:200},sectionId:{type:'string'},partId:{type:'string'},mime:{const:'image/png'}},required:['kind','id','label','sectionId','partId','mime'],additionalProperties:false}]}}},required:['contract','codeSha256','runtime','classification','status','stdout','stderr','error','outputs'],additionalProperties:false};
