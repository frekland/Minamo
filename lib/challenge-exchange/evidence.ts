import {z} from 'zod';
import {assertJsonBudget,sha256Text} from '../foundry/platform';
import {admitProjectPackage,projectDigest,type ProjectPackage} from './package';

const sha=z.string().regex(/^[a-f0-9]{40}$/),digest=z.string().regex(/^[a-f0-9]{64}$/);
const repo=z.string().regex(/^[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,99})\/[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,99})$/);
export const submissionRequestSchema=z.object({contract:z.literal('minamo.github-submission.v1'),repository:repo,starterCommit:sha,submissionCommit:sha,starterPackageDigest:digest,question:z.string().max(2000),nextIntention:z.string().max(1000)}).strict();
export type SubmissionRequest=z.infer<typeof submissionRequestSchema>;
export type ProviderCommit={repository:string;sha:string;treeSha:string;url:string};
export type ProviderComparison={repository:string;base:string;head:string;status:'ahead'|'identical'|'diverged'|'behind';files:Array<{path:string;status:'added'|'modified'|'removed'|'renamed';sha256?:string;previousPath?:string}>;complete:boolean};
export type ProviderWorkflow={repository:string;headSha:string;id:string;url:string;status:'queued'|'in_progress'|'completed';conclusion:'success'|'failure'|'cancelled'|'neutral'|'skipped'|'timed_out'|null};
/** Trusted connector boundary. Never substitute this with user-supplied JSON. No tokens are stored. */
export type GitHubEvidenceProvider={getCommit:(repository:string,sha:string)=>Promise<ProviderCommit>;compare:(repository:string,base:string,head:string)=>Promise<ProviderComparison>;workflows?:(repository:string,head:string)=>Promise<ProviderWorkflow[]>;readTextFile?:(repository:string,sha:string,path:string)=>Promise<{repository:string;commit:string;path:string;text:string}>};
export type VisibleTestIntegrity={status:'not-verified'|'unchanged-visible-tests'|'visible-tests-modified';paths:string[];notice:string};
export type VerifiedSubmission={contract:'minamo.github-evidence.v1';classification:'connector-fetched-immutable';execution:'not-executed-by-minamo';repository:string;starterCommit:ProviderCommit;submissionCommit:ProviderCommit;comparison:ProviderComparison;workflows:ProviderWorkflow[];starterPackageDigest:string;starterPackageMatch:'not-verified'|'verified-file-hashes';visibleTestIntegrity:VisibleTestIntegrity;question:string;nextIntention:string;receiptDigest:string};
export class ExchangeEvidenceError extends Error{constructor(readonly code:string,message:string){super(message);this.name='ExchangeEvidenceError';}}
function fail(code:string,message:string):never{throw new ExchangeEvidenceError(code,message);}
function canonicalCommit(value:ProviderCommit,repository:string,commit:string):ProviderCommit{
 if(value.repository!==repository||value.sha!==commit||!sha.safeParse(value.sha).success||!sha.safeParse(value.treeSha).success||value.url!==`https://github.com/${repository}/commit/${commit}`)fail('provider_mismatch','Fetched immutable commit does not match the requested repository and SHA.');
 return {repository:value.repository,sha:value.sha,treeSha:value.treeSha,url:value.url};
}
/** Evidence is fetched, not asserted. A commit existing does not prove CI or local execution. */
export async function fetchGitHubSubmission(input:unknown,provider:GitHubEvidenceProvider,expectedProject?:ProjectPackage):Promise<VerifiedSubmission>{
 assertJsonBudget(input);const parsed=submissionRequestSchema.safeParse(input);if(!parsed.success)fail('invalid_submission',parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; '));const q=parsed.data;
 const starter=canonicalCommit(await provider.getCommit(q.repository,q.starterCommit),q.repository,q.starterCommit),submission=canonicalCommit(await provider.getCommit(q.repository,q.submissionCommit),q.repository,q.submissionCommit);
 let starterPackageMatch:'not-verified'|'verified-file-hashes'='not-verified',verifiedProject:ProjectPackage|undefined;
 if(expectedProject){
  const pkg=await admitProjectPackage(expectedProject);if(await projectDigest(pkg)!==q.starterPackageDigest||!provider.readTextFile)fail('starter_package_unverifiable','The exact starter package digest and trusted immutable file reader are required.');
  for(const file of pkg.files){const fetched=await provider.readTextFile!(q.repository,q.starterCommit,file.path);assertJsonBudget(fetched);if(fetched.repository!==q.repository||fetched.commit!==q.starterCommit||fetched.path!==file.path||typeof fetched.text!=='string'||await sha256Text(fetched.text)!==file.sha256)fail('starter_file_mismatch','Starter commit does not contain the exact admitted file bytes: '+file.path);}
  starterPackageMatch='verified-file-hashes';verifiedProject=pkg;
 }
 const raw=await provider.compare(q.repository,q.starterCommit,q.submissionCommit);assertJsonBudget(raw);
 if(raw.repository!==q.repository||raw.base!==q.starterCommit||raw.head!==q.submissionCommit||raw.complete!==true||!['ahead','identical'].includes(raw.status)||!Array.isArray(raw.files)||raw.files.length>64)fail('incomplete_comparison','Submission must be a complete exact comparison descended from its starter.');
 const seenPaths=new Set<string>();
 const validPath=(path:unknown):path is string=>typeof path==='string'&&path.length>0&&path.length<=1024&&!/[\0\r\n]/.test(path);
 const files=raw.files.map(file=>{
  if(!file||typeof file!=='object'||!validPath(file.path)||!['added','modified','removed','renamed'].includes(file.status)||file.sha256!==undefined&&!digest.safeParse(file.sha256).success||file.status==='renamed'&&!validPath(file.previousPath)||file.status!=='renamed'&&file.previousPath!==undefined||seenPaths.has(file.path))fail('invalid_provider_file','Provider comparison paths, rename metadata and hashes must be complete and unique.');
  seenPaths.add(file.path);
  return {path:file.path,status:file.status,...(file.sha256?{sha256:file.sha256}:{}),...(file.previousPath?{previousPath:file.previousPath}:{})};
 });
 if(raw.status==='identical'&&files.length)fail('incomplete_comparison','An identical comparison cannot contain changed files.');
 const testPaths=verifiedProject?.files.filter(file=>file.role==='visible-test').map(file=>file.path)??[];
 const changedTests=testPaths.filter(path=>files.some(file=>file.path===path||file.previousPath===path));
 const visibleTestIntegrity:VisibleTestIntegrity={status:verifiedProject?(changedTests.length?'visible-tests-modified':'unchanged-visible-tests'):'not-verified',paths:changedTests,notice:verifiedProject?'Based on the exact verified starter and complete immutable comparison. Unchanged visible tests are not a hidden oracle, sandbox or proof of execution. Modified, removed or renamed tests require independent review before interpreting any pass claim.':'No exact starter package was verified; test integrity is unknown.'};
 const comparison:ProviderComparison={repository:q.repository,base:q.starterCommit,head:q.submissionCommit,status:raw.status,files,complete:true};
 const workflowRows=await provider.workflows?.(q.repository,q.submissionCommit)??[];assertJsonBudget(workflowRows);if(!Array.isArray(workflowRows)||workflowRows.length>50)fail('workflow_budget','At most fifty exact workflow receipts are admitted.');
 const workflows=workflowRows.map(w=>{
  if(w.repository!==q.repository||w.headSha!==q.submissionCommit||!/^\d{1,30}$/.test(w.id)||w.url!==`https://github.com/${q.repository}/actions/runs/${w.id}`||!['queued','in_progress','completed'].includes(w.status)||![null,'success','failure','cancelled','neutral','skipped','timed_out'].includes(w.conclusion)||w.status!=='completed'&&w.conclusion!==null)fail('workflow_mismatch','Workflow evidence must match the exact submitted SHA and real provider state.');
  return {repository:w.repository,headSha:w.headSha,id:w.id,url:w.url,status:w.status,conclusion:w.conclusion};
 });
 const evidence={contract:'minamo.github-evidence.v1' as const,classification:'connector-fetched-immutable' as const,execution:'not-executed-by-minamo' as const,repository:q.repository,starterCommit:starter,submissionCommit:submission,comparison,workflows,starterPackageDigest:q.starterPackageDigest,starterPackageMatch,visibleTestIntegrity,question:q.question,nextIntention:q.nextIntention};
 return {...evidence,receiptDigest:await sha256Text(JSON.stringify(evidence))};
}
export const suppliedTerminalSchema=z.object({contract:z.literal('minamo.supplied-terminal.v1'),classification:z.literal('learner-supplied'),execution:z.literal('reported-externally'),text:z.string().max(20000),description:z.string().min(1).max(1000),commit:sha.optional()}).strict();
export function admitSuppliedTerminal(input:unknown){assertJsonBudget(input);return suppliedTerminalSchema.parse(input);}
