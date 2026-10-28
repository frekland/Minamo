import {z} from 'zod';
import {FoundryError,sha256Text,type Adapter,type Artefact} from './platform';
import {admitMathExpression,admitMathML,mathFallback,serializeMathML,type MathExpression,type MathMLNode} from './math';
const texSchema=z.unknown().transform((input,ctx)=>{try{return admitMathExpression(input)}catch(e){ctx.addIssue({code:z.ZodIssueCode.custom,message:e instanceof Error?e.message:'Invalid TeX'});return z.NEVER;}});
const nativeSchema=z.unknown().transform((input,ctx)=>{try{return admitMathML(input)}catch(e){ctx.addIssue({code:z.ZodIssueCode.custom,message:e instanceof Error?e.message:'Invalid MathML'});return z.NEVER;}});
function matchSource(artefact:Artefact,format:string,source:string){if(artefact.canonical.format!==format)throw new FoundryError('source_format','Expected canonical '+format+'.');if(artefact.canonical.source!==source)throw new FoundryError('source_mismatch','Mathematical display differs from exact canonical source.');}
const authored={classification:'authored',execution:'not-executed'} as const;
export const mathTexAdapter:Adapter<MathExpression>={
 kind:'math/tex-v1',schema:texSchema,
 fallback(payload,artefact){matchSource(artefact,'tex',payload.source);return mathFallback(payload);},
 async load(){const {renderMath}=await import('./math-render');return {async mount(host,payload){const result=await renderMath(payload,'mathml'),decoration=document.createElement('div'),source=document.createElement('pre');decoration.dataset.foundryDecoration='true';decoration.style.overflowX='auto';source.textContent=payload.source;if(result.status==='rendered')decoration.innerHTML=result.html;else decoration.textContent=result.error;const label=document.createElement('p');label.textContent=payload.description||'Authored notation; not evaluated or proved.';host.replaceChildren(decoration,label,source);return ()=>{host.replaceChildren();};}};},
};
export const mathNativeAdapter:Adapter<MathMLNode>={
 kind:'math/native-v1',schema:nativeSchema,
 fallback(payload,artefact){matchSource(artefact,'mathml',serializeMathML(payload));return artefact.canonical.source+'\n[Finite authored MathML notation; not evaluated or proved.]';},
 async load(){return {mount(host,payload){const decoration=document.createElement('div'),source=document.createElement('pre');decoration.dataset.foundryDecoration='true';decoration.style.overflowX='auto';decoration.innerHTML=serializeMathML(payload);source.textContent=serializeMathML(payload);host.replaceChildren(decoration,source);return ()=>{host.replaceChildren();};}};},
};
export async function mathTexArtefact(input:unknown):Promise<Artefact>{const payload=admitMathExpression(input),source=payload.source;return {contract:'minamo.artefact.v1',kind:'math/tex-v1',canonical:{format:'tex',source,sha256:await sha256Text(source)},provenance:authored,payload};}
export async function mathNativeArtefact(input:unknown):Promise<Artefact>{const payload=admitMathML(input),source=serializeMathML(payload);return {contract:'minamo.artefact.v1',kind:'math/native-v1',canonical:{format:'mathml',source,sha256:await sha256Text(source)},provenance:authored,payload};}
