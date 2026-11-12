import {z} from 'zod';
import {assertJsonBudget,sha256Text} from '../foundry/platform';

export const PROJECT_LIMITS=Object.freeze({files:32,fileBytes:65536,totalBytes:196608,path:160});
export const PROJECT_RUNTIMES=['python','node','bash','sql','rust'] as const;
const safeId=z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const hash=z.string().regex(/^[a-f0-9]{64}$/);
const fileSchema=z.object({path:z.string().min(1).max(PROJECT_LIMITS.path),role:z.enum(['editable-starter','visible-test','teaching-only']),text:z.string().max(PROJECT_LIMITS.fileBytes),sha256:hash}).strict();
export const projectPackageSchema=z.object({contract:z.literal('minamo.project.v1'),id:safeId,title:z.string().min(1).max(180),runtime:z.enum(PROJECT_RUNTIMES),files:z.array(fileSchema).min(1).max(PROJECT_LIMITS.files),commands:z.object({kali:z.string().max(180),powershell:z.string().max(180)}).strict()}).strict();
export type ProjectPackage=z.infer<typeof projectPackageSchema>;
export type ProjectInput=Omit<ProjectPackage,'contract'|'files'|'commands'>&{files:Array<Omit<ProjectPackage['files'][number],'sha256'>>};
export class ProjectError extends Error{constructor(readonly code:string,readonly field:string,message:string){super(message);this.name='ProjectError';}}
const fail=(code:string,field:string,message:string):never=>{throw new ProjectError(code,field,message);};
const utf8=(s:string)=>new TextEncoder().encode(s);
const commands:Record<ProjectPackage['runtime'],ProjectPackage['commands']>={
 python:{kali:'python3 -m unittest -v',powershell:'py -3 -m unittest -v'},
 node:{kali:'node --test',powershell:'node --test'},
 bash:{kali:'bash test.sh',powershell:'wsl bash test.sh'},
 sql:{kali:'python3 -m unittest -v',powershell:'py -3 -m unittest -v'},
 rust:{kali:'cargo test --offline',powershell:'cargo test --offline'},
};
export function projectCommands(runtime:ProjectPackage['runtime']){return {...commands[runtime]};}
export function validateProjectPath(path:string):void{
 if(path.length>PROJECT_LIMITS.path||!path||path.includes('\\')||path.includes('\0')||path.includes(':')||path.startsWith('/')||path.normalize('NFC')!==path||!/^[A-Za-z0-9_./-]+$/.test(path))fail('unsafe_path','files.path','Use a bounded NFC ASCII relative path.');
 const pieces=path.split('/');
 if(pieces.some(p=>!p||p==='.'||p==='..'||p.startsWith('.')||p.endsWith('.')||p.endsWith(' ')||/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p)))fail('unsafe_path','files.path','Dot paths, Windows device paths and hidden configuration are excluded.');
 if(pieces.some(p=>/^(node_modules|target|vendor)$/i.test(p))||! /\.(py|mjs|js|json|md|txt|csv|sql|sh|rs|toml)$/.test(path))fail('unsupported_file','files.path','Only declared text source, tests and documentation files are supported.');
 if(/(^|\/)(?:package-lock\.json|npm-shrinkwrap\.json|build\.rs)$/i.test(path))fail('active_configuration','files.path','Install lockfiles and automatic build scripts are not admitted.');
 if(path.toLowerCase()==='minamo-manifest.json')fail('reserved_path','files.path','MINAMO-MANIFEST.json is reserved for the deterministic exporter.');
}
function validUnicode(text:string){for(const c of text){const n=c.codePointAt(0)!;if(n>=0xd800&&n<=0xdfff)return false;}return !text.includes('\0');}
export async function admitProjectPackage(value:unknown):Promise<ProjectPackage>{
 assertJsonBudget(value);const parsed=projectPackageSchema.safeParse(value);
 if(!parsed.success)return fail('invalid_project',parsed.error.issues[0]?.path.join('.')??'',parsed.error.issues[0]?.message??'Invalid project.');
 const pkg=parsed.data,paths=new Set<string>();let bytes=0;
 for(const [i,file] of pkg.files.entries()){
  validateProjectPath(file.path);const field=`files.${i}`;
  const key=file.path.toLowerCase();if(paths.has(key))fail('duplicate_path',field+'.path','Paths must also be unique on Windows.');if([...paths].some(p=>p.startsWith(key+'/')||key.startsWith(p+'/')))fail('path_collision',field+'.path','A path cannot be both a file and directory.');paths.add(key);
  const size=utf8(file.text).length;bytes+=size;
  if(size>PROJECT_LIMITS.fileBytes||bytes>PROJECT_LIMITS.totalBytes)fail('project_too_large',field+'.text','Project text exceeds byte budget.');
  if(!validUnicode(file.text))fail('invalid_unicode',field+'.text','Preserve valid Unicode text without NUL.');
  if(await sha256Text(file.text)!==file.sha256)fail('hash_mismatch',field+'.sha256','SHA-256 does not match the exact UTF-8 file bytes.');
  if(/-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b|\bAKIA[A-Z0-9]{16}\b/.test(file.text))fail('credential_detected',field+'.text','Credential-like content must never be distributed.');
  if(/(^|\/)package\.json$/i.test(file.path)){
   let config:unknown;try{config=JSON.parse(file.text);}catch{fail('invalid_config',field+'.text','package.json must be valid JSON.');}
   if(!config||typeof config!=='object'||Array.isArray(config))fail('invalid_config',field+'.text','Expected a package object.');
   const record=config as Record<string,unknown>;
   if(record.scripts||record.dependencies||record.devDependencies||record.optionalDependencies||record.workspaces)fail('active_configuration',field+'.text','This dependency-free interchange does not install dependencies or admit lifecycle scripts.');
  }
  if(file.path.toLowerCase().endsWith('.toml')&&(/^\s*(?:build|git|path)\s*=/m.test(file.text)||/^\s*\[[^\]\n]*(?:dependencies|workspace|patch|replace)[^\]\n]*\]/mi.test(file.text)))fail('active_configuration',field+'.text','The bounded offline lane excludes all dependency/workspace sections and Rust build hooks.');
 }
 if(!pkg.files.some(f=>f.role==='editable-starter')||!pkg.files.some(f=>f.role==='visible-test'))fail('missing_project_role','files','Include an editable starter and visible tests.');
 const expected=commands[pkg.runtime];if(pkg.commands.kali!==expected.kali||pkg.commands.powershell!==expected.powershell)fail('unsafe_command','commands','Use exact '+pkg.runtime+' commands: kali='+JSON.stringify(expected.kali)+', powershell='+JSON.stringify(expected.powershell)+'. Read get_minamo_activity_capabilities.project.commands; arbitrary shell scripts are not admitted.');
 return Object.freeze({...pkg,files:Object.freeze([...pkg.files].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0).map(f=>Object.freeze({...f}))),commands:Object.freeze({...pkg.commands})}) as unknown as ProjectPackage;
}
export async function buildProjectPackage(input:ProjectInput):Promise<ProjectPackage>{return admitProjectPackage({...input,contract:'minamo.project.v1',commands:projectCommands(input.runtime),files:await Promise.all(input.files.map(async f=>({...f,sha256:await sha256Text(f.text)})))});}
export async function projectDigest(pkg:ProjectPackage){const admitted=await admitProjectPackage(pkg);return sha256Text(JSON.stringify(admitted));}

const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(bytes:Uint8Array){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
/** Store-only deterministic ZIP: no symlinks, timestamps, encryption, executable bit or hidden files. */
export async function deterministicProjectZip(input:ProjectPackage):Promise<Uint8Array>{
 const pkg=await admitProjectPackage(input),locals:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 const entries=[...pkg.files.map(f=>({path:f.path,text:f.text})),{path:'MINAMO-MANIFEST.json',text:JSON.stringify({contract:pkg.contract,id:pkg.id,title:pkg.title,runtime:pkg.runtime,commands:pkg.commands,files:pkg.files.map(({path,role,sha256,text})=>({path,role,sha256,bytes:utf8(text).length}))},null,2)+'\n'}];
 if(pkg.files.some(f=>f.path.toLowerCase()==='minamo-manifest.json'))fail('reserved_path','files.path','MINAMO-MANIFEST.json is generated by the exporter.');
 for(const file of entries){const name=utf8(file.path),body=utf8(file.text),crc=crc32(body),head=new Uint8Array(30+name.length),dv=new DataView(head.buffer);dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0x0800,true);dv.setUint16(12,0x21,true);dv.setUint32(14,crc,true);dv.setUint32(18,body.length,true);dv.setUint32(22,body.length,true);dv.setUint16(26,name.length,true);head.set(name,30);
  const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,0x0314,true);cv.setUint16(6,20,true);cv.setUint16(8,0x0800,true);cv.setUint16(14,0x21,true);cv.setUint32(16,crc,true);cv.setUint32(20,body.length,true);cv.setUint32(24,body.length,true);cv.setUint16(28,name.length,true);cv.setUint32(38,0x81a40000,true);cv.setUint32(42,offset,true);c.set(name,46);locals.push(head,body);central.push(c);offset+=head.length+body.length;
 }
 const cdSize=central.reduce((n,b)=>n+b.length,0),end=new Uint8Array(22),ed=new DataView(end.buffer);ed.setUint32(0,0x06054b50,true);ed.setUint16(8,entries.length,true);ed.setUint16(10,entries.length,true);ed.setUint32(12,cdSize,true);ed.setUint32(16,offset,true);const result=new Uint8Array(offset+cdSize+22);let pos=0;for(const b of [...locals,...central,end]){result.set(b,pos);pos+=b.length;}return result;
}
