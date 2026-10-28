import {z} from 'zod';
import {admitProjectPackage,projectDigest,PROJECT_LIMITS,type ProjectPackage} from './package';
import {assertJsonBudget,sha256Text} from '../foundry/platform';

const digest=z.string().regex(/^[a-f0-9]{64}$/),commit=z.string().regex(/^[a-f0-9]{40}$/);
export const scratchSubmissionSchema=z.object({contract:z.literal('minamo.scratch-submission.v1'),blockId:z.string().min(1).max(64),starterDigest:digest,files:z.array(z.object({path:z.string().min(1).max(PROJECT_LIMITS.path),text:z.string().max(PROJECT_LIMITS.fileBytes),sha256:digest}).strict()).min(1).max(PROJECT_LIMITS.files),execution:z.literal('not-executed-by-minamo'),github:z.object({repository:z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),starterCommit:commit,submissionCommit:commit,classification:z.literal('supplied-unverified')}).strict().optional()}).strict();
export type ScratchSubmission=z.infer<typeof scratchSubmissionSchema>;
export type ScratchComparison={path:string;role:ProjectPackage['files'][number]['role'];changed:boolean;starterSha256:string;submissionSha256:string};
/** Exact text interchange, never imported code execution or a trusted provider receipt. */
export async function makeScratchSubmission(blockId:string,bundle:ProjectPackage,edits:Record<string,string>,github?:ScratchSubmission['github']):Promise<ScratchSubmission>{
 const starter=await admitProjectPackage(bundle);
 const files=await Promise.all(starter.files.map(async file=>{const text=edits[file.path]??file.text;return {path:file.path,text,sha256:await sha256Text(text)};}));
 const submission=scratchSubmissionSchema.parse({contract:'minamo.scratch-submission.v1',blockId,starterDigest:await projectDigest(starter),files,execution:'not-executed-by-minamo',...(github?{github}:{})});
 await compareScratchSubmission(submission,starter);return submission;
}
export async function compareScratchSubmission(value:unknown,bundle:ProjectPackage):Promise<ScratchComparison[]>{
 assertJsonBudget(value);const submission=scratchSubmissionSchema.parse(value),starter=await admitProjectPackage(bundle);
 if(submission.starterDigest!==await projectDigest(starter))throw Error('submission.starterDigest: the exact retained starter package does not match.');
 if(submission.files.length!==starter.files.length||new Set(submission.files.map(f=>f.path)).size!==submission.files.length)throw Error('submission.files: include every exact starter path once; additions/removals need a new project edition.');
 let bytes=0;const result:ScratchComparison[]=[];
 for(const file of submission.files){const original=starter.files.find(f=>f.path===file.path);if(!original)throw Error('submission.files: unknown starter path '+file.path);bytes+=new TextEncoder().encode(file.text).length;
  if(new TextEncoder().encode(file.text).length>PROJECT_LIMITS.fileBytes||bytes>PROJECT_LIMITS.totalBytes||file.text.includes('\0')||Array.from(file.text).some(c=>{const n=c.codePointAt(0)!;return n>=0xd800&&n<=0xdfff;}))throw Error('submission.files: invalid Unicode or byte budget exceeded.');
  if(await sha256Text(file.text)!==file.sha256)throw Error('submission.files.sha256: exact submitted bytes do not match.');
  if(/-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/.test(file.text))throw Error('submission.files: credential-like content cannot be retained in a challenge submission.');
  result.push({path:file.path,role:original.role,changed:file.sha256!==original.sha256,starterSha256:original.sha256,submissionSha256:file.sha256});
 }return result;
}
export async function validateScratchSubmission(value:unknown,cartridge:{blocks:Array<{id:string;kind:string;bundle?:unknown}>}):Promise<void>{const submission=scratchSubmissionSchema.parse(value),block=cartridge.blocks.find(b=>b.id===submission.blockId&&b.kind==='source-browser');if(!block?.bundle)throw Error('submission.blockId: source-browser block is unavailable in this exact Activity edition.');await compareScratchSubmission(submission,block.bundle as ProjectPackage);}
/** Local drafts are scoped by caller identity, generation, Activity edition and block. */
export function readScratchDraft(raw:string|null,bundle:ProjectPackage):Record<string,string>{
 if(!raw||raw.length>PROJECT_LIMITS.totalBytes*2)return {};try{const value=JSON.parse(raw),edits:Record<string,string>={};if(!value||typeof value!=='object'||Array.isArray(value))return {};let total=0;for(const file of bundle.files){const text=value[file.path];if(typeof text!=='string')continue;const size=new TextEncoder().encode(text).length;total+=size;if(size>PROJECT_LIMITS.fileBytes||total>PROJECT_LIMITS.totalBytes)return {};edits[file.path]=text;}return edits;}catch{return {};}
}
