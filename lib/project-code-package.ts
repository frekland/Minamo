import {z} from 'zod';
import type {WorkspaceRecord} from './contracts';
import {deterministicTextZip} from './text-zip';

const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
export const CODE_PACKAGE_LIMITS={packages:3,files:24,sourceBytes:150000,path:160} as const;
const reserved='minamo-source-manifest.json';

/** Paths are declared by the author, never guessed from headings or code. */
export function validProjectSourcePath(path:string){
 if(path.length<1||path.length>CODE_PACKAGE_LIMITS.path||path.normalize('NFC')!==path||
   !/^[A-Za-z0-9_./-]+$/.test(path)||path.startsWith('/')||!/.(?:py|md|txt|json|csv)$/i.test(path))return false;
 const pieces=path.split('/');
 if(pieces.some(piece=>!piece||piece==='.'||piece==='..'||piece.startsWith('.')||piece.endsWith('.')||
   /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(piece)))return false;
 if(path.toLowerCase()===reserved||pieces.some(piece=>/^(?:node_modules|vendor|target)$/i.test(piece)))return false;
 return true;
}
export const projectCodePackageSchema=z.object({
 id,title:z.string().min(1).max(140),runtime:z.literal('python'),
 files:z.array(z.object({
  path:z.string().min(1).max(CODE_PACKAGE_LIMITS.path).refine(validProjectSourcePath,'Use a safe relative Python/source file path.'),
  sectionId:id,partId:id,role:z.enum(['source','test','documentation'])
 }).strict()).min(1).max(CODE_PACKAGE_LIMITS.files),
 entrypoint:z.string().max(CODE_PACKAGE_LIMITS.path).optional()
}).strict().superRefine((pkg,ctx)=>{
 const paths:string[]=[];
 for(const [index,file] of pkg.files.entries()){
  const key=file.path.toLowerCase();
  if(paths.includes(key)||paths.some(previous=>previous.startsWith(key+'/')||key.startsWith(previous+'/')))
   ctx.addIssue({code:'custom',path:['files',index,'path'],message:'File paths must be unique, without file/directory collisions (including Windows case).'});
  paths.push(key);
 }
 if(pkg.entrypoint&&(!pkg.files.some(file=>file.path===pkg.entrypoint)||!pkg.entrypoint.endsWith('.py')))
  ctx.addIssue({code:'custom',path:['entrypoint'],message:'The Python entrypoint must be an exact declared .py file.'});
});
export type ProjectCodePackage=z.infer<typeof projectCodePackageSchema>;
export class ProjectCodePackageError extends Error{
 readonly code:string;readonly status:number;
 constructor(code:string,status:number,message:string){super(message);this.name='ProjectCodePackageError';this.code=code;this.status=status;}
}
export type SourceFileStatus='available'|'missing'|'not-code'|'unavailable'|'export-blocked';
export type ProjectSourceFile=ProjectCodePackage['files'][number]&{status:SourceFileStatus;bytes?:number;sha256?:string};
function validText(text:string){
 if(text.includes('\0'))return false;
 for(const character of text){const n=character.codePointAt(0)!;if(n>=0xd800&&n<=0xdfff)return false;}
 return true;
}
function credentialLike(text:string){
 return /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b|\bAKIA[A-Z0-9]{16}\b/.test(text);
}
const encode=(text:string)=>new TextEncoder().encode(text);
async function sha256(bytes:Uint8Array){
 const hash=await crypto.subtle.digest('SHA-256',bytes as Uint8Array<ArrayBuffer>);
 return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function projectCodePackageInventory(record:WorkspaceRecord){
 const packages=record.projectComposition?.codePackages??[];
 return Promise.all(packages.map(async pkg=>{
  const files:ProjectSourceFile[]=await Promise.all(pkg.files.map(async file=>{
   const part=record.sections?.find(s=>s.id===file.sectionId)?.parts.find(p=>p.id===file.partId);
   if(!part)return {...file,status:'missing'};
   if(part.unavailable)return {...file,status:'unavailable'};
   if(part.kind!=='code')return {...file,status:'not-code'};
   if(!validText(part.text)||credentialLike(part.text))return {...file,status:'export-blocked'};
   const bytes=encode(part.text);
   return {...file,status:'available',bytes:bytes.length,sha256:await sha256(bytes)};
  }));
  const totalBytes=files.reduce((n,file)=>n+(file.bytes??0),0);
  return {id:pkg.id,title:pkg.title,runtime:pkg.runtime,entrypoint:pkg.entrypoint??null,files,
   downloadable:files.every(f=>f.status==='available')&&totalBytes<=CODE_PACKAGE_LIMITS.sourceBytes,
   totalBytes,sourceRevision:record.rev,sourceRendition:record.rendition??null};
 }));
}
/** A ZIP is a read of exact canonical Project source, never an execution. */
export async function projectCodePackageArchive(record:WorkspaceRecord,packageId:string){
 const pkg=record.projectComposition?.codePackages?.find(p=>p.id===packageId);
 if(!pkg)throw new ProjectCodePackageError('package_unavailable',404,'This Project has no package with that identity.');
 const inventory=(await projectCodePackageInventory(record)).find(p=>p.id===packageId)!;
 if(!inventory.downloadable)throw new ProjectCodePackageError('package_source_unavailable',409,
  'One or more exact source files are unavailable, not code, export-blocked or exceed the package byte limit. No replacement was inferred.');
 const entries=pkg.files.map(file=>({
  path:file.path,text:record.sections!.find(s=>s.id===file.sectionId)!.parts.find(p=>p.id===file.partId)!.text
 }));
 const manifest={
  contract:'minamo.project-source.v1',project:{id:record.id,title:record.title,revision:record.rev,rendition:record.rendition??null},
  codePackage:{id:pkg.id,title:pkg.title,runtime:pkg.runtime,entrypoint:pkg.entrypoint??null},
  files:inventory.files.map(({path,role,sectionId,partId,sha256,bytes})=>({path,role,sectionId,partId,sha256,bytes})),
  provenance:'Exact canonical code parts in this saved Project revision. No files or relationships were inferred.',
  execution:'Not executed or verified by Minamo during export.'
 };
 return deterministicTextZip([...entries,{path:'MINAMO-SOURCE-MANIFEST.json',text:JSON.stringify(manifest,null,2)+'\n'}]);
}
