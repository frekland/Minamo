import {z} from 'zod';
import {foundryDigest} from './digest';

/** Dormant research SDK. Admission is format validation, never data-access authority. */
export const FOUNDRY_LIMITS=Object.freeze({bytes:262144,depth:18,nodes:20000,source:65536,outputs:16});
const id=z.string().min(1).max(160),digest=z.string().regex(/^[a-f0-9]{64}$/);
const sourceRef=z.object({family:z.enum(['article','area','journey','investigation','note','experiment','run','source']),id,rendition:id,sectionId:id,partId:id}).strict();
export const provenanceSchema=z.discriminatedUnion('classification',[
 z.object({classification:z.literal('authored'),execution:z.literal('not-executed')}).strict(),
 z.object({classification:z.literal('illustrative'),execution:z.literal('not-executed')}).strict(),
 z.object({classification:z.literal('supplied'),execution:z.literal('reported-externally'),description:z.string().min(1).max(1000)}).strict(),
 z.object({classification:z.literal('computed'),execution:z.literal('receipt-required'),runId:id,inputDigest:digest,engine:id,engineVersion:id}).strict(),
]);
export const artefactSchema=z.object({contract:z.literal('minamo.artefact.v1'),kind:z.string().regex(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*-v1$/).max(80),canonical:z.object({format:z.string().min(1).max(40),source:z.string().max(FOUNDRY_LIMITS.source).refine(s=>!Array.from(s).some(c=>{const n=c.codePointAt(0)!;return n>=0xd800&&n<=0xdfff;}),'Canonical source must contain valid Unicode; invalid UTF-16 remains a literal unsupported source, never silently rewritten.'),sha256:digest}).strict(),sourceRef:sourceRef.optional(),provenance:provenanceSchema,payload:z.unknown()}).strict();
export type Artefact=z.infer<typeof artefactSchema>;
export type SourceRef=z.infer<typeof sourceRef>;
export class FoundryError extends Error{constructor(readonly code:string,message:string){super(message);this.name='FoundryError';}}

/** Prewalk before schema recursion; rejects cycles, accessors, prototypes, NaN and active values. */
export function assertJsonBudget(value:unknown):void{
 const active=new Set<object>();let nodes=0,bytes=0;
 const add=(text:string)=>{bytes+=new TextEncoder().encode(text).length;if(bytes>FOUNDRY_LIMITS.bytes)throw new FoundryError('too_large','Artefact exceeds the byte budget.');};
 function walk(v:unknown,depth:number):void{
  if(++nodes>FOUNDRY_LIMITS.nodes||depth>FOUNDRY_LIMITS.depth)throw new FoundryError('too_complex','Artefact exceeds structural limits.');
  if(v===null||typeof v==='boolean'){add(String(v));return;}
  if(typeof v==='number'){if(!Number.isFinite(v))throw new FoundryError('invalid_json','Numbers must be finite.');add(String(v));return;}
  if(typeof v==='string'){add(JSON.stringify(v));return;}
  if(typeof v!=='object')throw new FoundryError('invalid_json','Only inert JSON values are admitted.');
  if(active.has(v))throw new FoundryError('invalid_json','Cyclic data is not JSON.');
  if(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)throw new FoundryError('invalid_json','Only plain JSON objects are admitted.');
  if(Array.isArray(v)&&(v.length>FOUNDRY_LIMITS.nodes||Object.keys(v).length!==v.length||Object.keys(v).some((key,i)=>key!==String(i))))throw new FoundryError('invalid_json','Sparse or extended arrays are not admitted.');
  active.add(v);add('{}');
  for(const key of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(key))throw new FoundryError('invalid_key','Unsafe object key.');const descriptor=Object.getOwnPropertyDescriptor(v,key);if(!descriptor||!('value'in descriptor))throw new FoundryError('invalid_json','Accessors are not JSON.');add(JSON.stringify(key));walk(descriptor.value,depth+1);}
  active.delete(v);
 }
 walk(value,0);
}
export async function sha256Text(text:string):Promise<string>{return foundryDigest(new TextEncoder().encode(text));}
function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}
export type Authority={
 /** Optional host lifetime fence; checked even when an artefact has no external sourceRef. */
 isCurrent?:()=>boolean|Promise<boolean>;
 /** Trusted current domain read; must recheck owner/generation/rights/Trash and exact retained rendition. */
 canRead:(ref:SourceRef)=>boolean|Promise<boolean>;
 /** Trusted saved-Run lookup, not a client supplied receipt or signature. */
 verifyRun:(claim:Extract<Artefact['provenance'],{classification:'computed'}>)=>boolean|Promise<boolean>;
};
export type Adapter<T=unknown>={kind:string;schema:z.ZodType<T,z.ZodTypeDef,unknown>;fallback:(payload:T,artefact:Artefact)=>string;load:()=>Promise<{mount:(host:HTMLElement,payload:T,artefact:Artefact)=>void|(()=>void)|Promise<void|(()=>void)>}>};
export type Admitted={readonly artefact:Artefact;readonly fallback:string};

export class ArtefactRegistry{
 #adapters=new Map<string,Adapter>();#admitted=new WeakSet<object>();
 register<T>(adapter:Adapter<T>):void{if(this.#adapters.has(adapter.kind))throw new FoundryError('duplicate_adapter','Adapter already registered.');this.#adapters.set(adapter.kind,adapter as Adapter);}
 async #eligible(a:Artefact,authority:Authority):Promise<boolean>{if(authority.isCurrent&&!await authority.isCurrent())return false;if(a.sourceRef&&!await authority.canRead(a.sourceRef))return false;return a.provenance.classification!=='computed'||await authority.verifyRun(a.provenance);}
 async admit(input:unknown,authority:Authority):Promise<Admitted>{
  assertJsonBudget(input);const parsed=artefactSchema.safeParse(input);if(!parsed.success)throw new FoundryError('invalid_shape',parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).slice(0,5).join('; '));
  const a=parsed.data,adapter=this.#adapters.get(a.kind);if(!adapter)throw new FoundryError('unsupported_kind','No trusted adapter is registered for this kind.');
  if(await sha256Text(a.canonical.source)!==a.canonical.sha256)throw new FoundryError('source_mismatch','Canonical source hash does not match.');
  if(!await this.#eligible(a,authority))throw new FoundryError('unavailable','Current source or execution receipt is unavailable.');
  const payload=adapter.schema.safeParse(a.payload);if(!payload.success)throw new FoundryError('invalid_payload',payload.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).slice(0,5).join('; '));
  // Snapshot caller-owned data so later mutation cannot change a validated specimen.
  const snapshot=JSON.parse(JSON.stringify({...a,payload:payload.data})) as Artefact;
  const admitted=freeze({artefact:snapshot,fallback:adapter.fallback(payload.data,snapshot)});this.#admitted.add(admitted);return admitted;
 }
 async activate(admitted:Admitted,host:HTMLElement,authority:Authority):Promise<{dispose:()=>void;revalidate:()=>Promise<boolean>}>{
  if(!this.#admitted.has(admitted))throw new FoundryError('not_admitted','Use this registry’s admission result.');
  let disposed=false,cleanup:void|(()=>void),mountHost:HTMLElement|undefined;const clear=()=>{if(disposed)return;disposed=true;try{
    // Detach our renderer-owned root before cleanup. React adapters may defer
    // unmount during a parent commit; they must never race a cleared host.
    if(mountHost&&mountHost!==host&&mountHost.parentNode===host)host.removeChild(mountHost);
    cleanup?.();
  }finally{host.replaceChildren();}};
  const eligible=async()=>this.#eligible(admitted.artefact,authority);
  if(!await eligible()){host.replaceChildren();throw new FoundryError('unavailable','Current source is unavailable.');}
  host.textContent=admitted.fallback;
  const adapter=this.#adapters.get(admitted.artefact.kind)!;
  try{const module=await adapter.load();if(!await eligible()){clear();throw new FoundryError('unavailable','Source permission changed during load.');}host.replaceChildren();mountHost=host.ownerDocument?host.ownerDocument.createElement('div'):host;if(mountHost!==host){mountHost.className='minamo-renderer-mount';host.appendChild(mountHost);}cleanup=await module.mount(mountHost,admitted.artefact.payload,admitted.artefact);if(!await eligible()){clear();throw new FoundryError('unavailable','Source permission changed during mount.');}}
  catch(error){let available=false;try{available=await eligible();}catch{/* Authority failures withhold all retained content. */}if(!disposed){clear();if(available)host.textContent=admitted.fallback;}throw error;}
  return {dispose:clear,revalidate:async()=>{if(disposed)return false;try{if(!await eligible()){clear();return false;}return true;}catch(error){clear();throw error;}}};
 }
}

const textOutput=z.object({kind:z.enum(['stdout','stderr','text']),text:z.string().max(65536)}).strict();
const tableOutput=z.object({kind:z.literal('table'),columns:z.array(z.string().max(120)).min(1).max(40),rows:z.array(z.array(z.union([z.string().max(2000),z.number().finite(),z.boolean(),z.null()])).max(40)).max(1000)}).strict().superRefine((v,c)=>{if(v.rows.some(r=>r.length!==v.columns.length))c.addIssue({code:'custom',message:'Rows must match declared columns.'});});
const imageOutput=z.object({kind:z.literal('image'),mime:z.literal('image/png'),assetId:id,sha256:digest,width:z.number().int().positive().max(4096),height:z.number().int().positive().max(4096),bytes:z.number().int().positive().max(4194304),alt:z.string().min(1).max(1000)}).strict();
export const outputBundleSchema=z.object({contract:z.literal('minamo.run-outputs.v1'),inputDigest:digest,status:z.enum(['completed','failed','cancelled','timed-out']),outputs:z.array(z.union([textOutput,tableOutput,imageOutput])).max(FOUNDRY_LIMITS.outputs)}).strict().superRefine((v,c)=>{if(v.status!=='completed'&&v.outputs.some(o=>o.kind==='image'||o.kind==='table'))c.addIssue({code:'custom',message:'Interrupted/failed runs cannot retain successful structured output.'});});
export type OutputBundle=z.infer<typeof outputBundleSchema>;
/** Encodes presentation metadata only; media staging and saved-Run admission remain existing authorities. */
export function admitOutputBundle(input:unknown):OutputBundle{assertJsonBudget(input);const p=outputBundleSchema.safeParse(input);if(!p.success)throw new FoundryError('invalid_outputs',p.error.issues.map(i=>i.message).join('; '));return freeze(p.data);}
