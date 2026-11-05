import {z} from 'zod';
import type {WorkspaceRecord,Family} from './contracts';
export const patterns=['dashboard','notebook','workbench','board','research','guide'] as const;
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
export const projectRefSchema=z.object({family:z.enum(['journey','article','area','source','note','run','experiment','investigation','annotation','flag']),id,rendition:z.string().max(240).optional(),sectionId:id.optional(),partId:id.optional()}).strict();
const slot=z.object({id,role:z.enum(['primary','secondary','sidebar','history','freeform']),blockIds:z.array(id).max(64)}).strict();
export const compositionSchema=z.object({version:z.literal(1),sections:z.array(z.object({id,title:z.string().max(180),pattern:z.enum(patterns),hidden:z.boolean().optional(),collapsed:z.boolean().optional(),slots:z.array(slot).min(1).max(8)}).strict()).max(32),blocks:z.array(z.object({id,sectionId:id.optional(),ref:projectRefSchema.optional(),hidden:z.boolean().optional(),pinned:z.boolean().optional(),width:z.enum(['full','split','compact']).optional(),layoutLock:z.enum(['position','content','both']).optional()}).strict()).max(128),favourites:z.array(id).max(160).optional(),protectedIds:z.array(z.string().max(180)).max(160).optional()}).strict();
export type ProjectComposition=z.infer<typeof compositionSchema>;
export type ProjectRef=z.infer<typeof projectRefSchema>;
export function validateComposition(value:unknown,record:Pick<WorkspaceRecord,'sections'>):ProjectComposition{
 const c=compositionSchema.parse(value);if(new TextEncoder().encode(JSON.stringify(c)).byteLength>64000)throw Error('Project layout exceeds 64 KB.');
 const ids=new Set<string>(),placed=new Set<string>();
 for(const b of c.blocks){if(ids.has(b.id)||!!b.sectionId===!!b.ref)throw Error('Each unique block needs one canonical section or exact record reference.');ids.add(b.id);if(b.sectionId&&!record.sections?.some(s=>s.id===b.sectionId))throw Error('A block section is missing.');}
 ids.clear();for(const s of c.sections){if(ids.has(s.id))throw Error('Duplicate layout section.');ids.add(s.id);const slots=new Set();for(const slot of s.slots){if(slots.has(slot.id))throw Error('Duplicate slot.');slots.add(slot.id);for(const block of slot.blockIds){if(placed.has(block)||!c.blocks.some(b=>b.id===block))throw Error('Each block must have one valid placement.');placed.add(block);}}}
 if(new Set(c.favourites??[]).size!==(c.favourites??[]).length||(c.favourites??[]).some(k=>!c.blocks.some(b=>b.id===k)&&!c.sections.some(s=>s.id===k)))throw Error('Favourites must name unique existing sections or blocks.');
 if(placed.size!==c.blocks.length)throw Error('Every block needs a placement.');return c;
}
/** Read-only compatibility adapter; original section and Stage identities survive. */
export function adaptedComposition(r:WorkspaceRecord):ProjectComposition{
 if(r.projectComposition)return r.projectComposition;
 const stages=r.learningShape?.kind==='journey'?r.learningShape.stages:[],all=r.sections??[],stageIds=new Set(stages.map(s=>s.sectionId));
 const intro=all.filter(s=>!stageIds.has(s.id)),guide=[...stages.flatMap(s=>all.find(a=>a.id===s.sectionId)??[])];
 const groups=[{id:'introduction',title:'',pattern:'notebook' as const,items:intro},{id:'guide',title:'',pattern:'guide' as const,items:guide}].filter(g=>g.items.length);
 const composition:ProjectComposition={version:1,sections:groups.map(g=>({id:g.id,title:g.title,pattern:g.pattern,slots:[{id:'primary',role:'primary',blockIds:g.items.map(s=>'content-'+s.id)}]})),blocks:groups.flatMap(g=>g.items.map(s=>({id:'content-'+s.id,sectionId:s.id})))};
 const refs=r.links.filter(link=>link.id!==r.id||link.family!==r.family).slice(0,32).map((link,i)=>({id:'linked-'+i,ref:{family:link.family,id:link.id,...(link.rendition?{rendition:link.rendition}:{}),...(link.sectionId?{sectionId:link.sectionId}:{}),...(link.partId?{partId:link.partId}:{})}}));
 if(refs.length){composition.blocks.push(...refs);composition.sections.push({id:'related-material',title:'Sources and related work',pattern:'research',slots:[{id:'sources',role:'primary',blockIds:refs.map(b=>b.id)}]});}return composition;

}
export function protectedSnapshot(r:WorkspaceRecord,c:ProjectComposition,key:string){
 if(key.startsWith('layout-section:'))return c.sections.find(s=>s.id===key.slice(15));
 if(key==='description')return r.projectDescription;
 if(key==='title')return r.title;
 if(key==='body')return r.body;
 const b=c.blocks.find(b=>b.id===key);if(!b)return null;
 const place=c.sections.flatMap(s=>s.slots.map(slot=>({s:s.id,slot:slot.id,ids:slot.blockIds}))).find(p=>p.ids.includes(key));
 // Relative order only among existing protected blocks: harmless insertions remain possible.
 return {block:b,content:b.sectionId?r.sections?.find(s=>s.id===b.sectionId):undefined,place:place&&{section:place.s,slot:place.slot,peers:place.ids.filter(v=>(c.protectedIds??[]).includes(v))}};
}
export const layoutCapabilities={imageUpload:{tool:'upload_minamo_project_image',maxBytes:120000,transport:'standard base64 in bounded JSON; larger original images use authenticated Site upload',association:'apply_project_update with current expectedProjectRev'},observations:{storage:'Ordinary adjacent callout and typed JSON parts in the same Project; no Note required',classification:'browser-reported; not server-observed execution'},version:1,patterns,slots:['primary','secondary','sidebar','history','freeform'],limits:{sections:32,blocks:128,layoutBytes:64000,updateBytes:220000},interactive:{version:1,types:['flashcards','drawing','python-canvas','parameter-explorer','pygbag'],drawing:'Ordinary state Note plus immutable snapshot/image attachments; noteChanges may create state Note atomically.',python:'Explicit Run in existing opaque iframe and terminable Worker; minamo_canvas finite drawing API, 120 frames/600 commands/20s. Controls do not execute Python until Run.',pygbag:'Owner-supplied standalone-html-v1 only; archive 0.9, explicit CPython 3.12 and stdout,gui loader attributes. Authenticated upload MIME application/vnd.minamo.pygbag+html; retain digest; no arbitrary ZIP/directory host.'},compositionFields:{sections:['hidden','collapsed'],blocks:['hidden','pinned','width'],widths:['full','split','compact'],favourites:'Project-local exact section/block shortcuts, never progress.'},testRuns:'manage_minamo_test_run creates immutable synthetic membership; no fixture matrix or automatic deletion.',content:'Canonical sections with rich paragraph/code/table/diagram/image/media parts; exact admitted record references render inline. No executable HTML.',images:{cover:'wide, calm composition; no text or progress claims',formats:['image/png','image/jpeg','image/webp'],maxBytes:8388608,transport:'Existing authenticated Site upload; no MCP file-byte upload is available.'},continuity:'Read exact current Project, use expectedProjectRev and a retry-stable operationId. Ordinary explicit Update Minamo applies directly. Preserve direct edits; explicitOverrideIds requires a specific owner request. Never infer execution or achievement.'};
