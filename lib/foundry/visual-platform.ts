import {z} from 'zod';
import {sha256Text,FoundryError,type Adapter,type Artefact} from './platform';
import {validateVisualScene,type VisualScene} from './visual';
const sceneSchema=z.unknown().transform((value,context)=>{try{return validateVisualScene(value);}catch(error){context.addIssue({code:z.ZodIssueCode.custom,message:error instanceof Error?error.message:'Invalid scene'});return z.NEVER;}});
/** Trusted SDK registration; validates source/payload identity before any lazy renderer runs. */
export const visualSceneAdapter:Adapter<VisualScene>={
 kind:'scene/geometry-v1',schema:sceneSchema,
 fallback(payload,artefact){
  if(artefact.canonical.format!=='scene-json')throw new FoundryError('source_format','Expected canonical scene-json.');
  let canonical:VisualScene;try{canonical=validateVisualScene(JSON.parse(artefact.canonical.source));}catch{throw new FoundryError('source_format','Canonical scene JSON failed admission.');}
  if(JSON.stringify(canonical)!==JSON.stringify(payload))throw new FoundryError('source_mismatch','Visible geometry differs from canonical source.');
  return `${payload.title}\n${payload.meshes.length} bounded mesh(es). Static source:\n${artefact.canonical.source}`;
 },
 async load(){const {mountVisualScene}=await import('./visual-three');return {mount(host,payload){const canvas=document.createElement('canvas');canvas.style.width='100%';canvas.style.height='280px';canvas.setAttribute('aria-label',payload.title);canvas.tabIndex=0;host.replaceChildren(canvas);try{const controller=mountVisualScene(canvas,payload);return ()=>controller.dispose();}catch(error){host.replaceChildren();throw error;}}};},
};
export async function visualSceneArtefact(input:unknown,provenance:Extract<Artefact['provenance'],{classification:'illustrative'|'supplied'}>={classification:'illustrative',execution:'not-executed'}):Promise<Artefact>{const payload=validateVisualScene(input),source=JSON.stringify(payload);return {contract:'minamo.artefact.v1',kind:'scene/geometry-v1',canonical:{format:'scene-json',source,sha256:await sha256Text(source)},provenance,payload};}
