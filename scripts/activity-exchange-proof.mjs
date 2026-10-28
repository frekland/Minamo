import {mkdtemp,writeFile,readFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
export async function exchangeSdk(){const b=await build({stdin:{contents:'export * from "./lib/challenge-exchange/package.ts";export * from "./lib/challenge-exchange/generators.ts";export * from "./lib/challenge-exchange/evidence.ts";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});return import('data:text/javascript;base64,'+Buffer.from(b.outputFiles[0].text).toString('base64'));}
const hash=s=>createHash('sha256').update(s).digest('hex');
/** Reference repair code stays in this engineering-only harness. Never imported by app/ or lib/. */
const repair={
 'tcp-chunks':{'chunked_reader.py':'def collect_message(recv_chunk,max_bytes=65536):\n    chunks=[]\n    size=0\n    while True:\n        chunk=recv_chunk(4)\n        if not chunk: return b"".join(chunks)\n        size+=len(chunk)\n        if size>max_bytes: raise ValueError("message exceeds limit")\n        chunks.append(chunk)\n'},
 'unicode-slice':{'main.mjs':'export function solve(text,count){return Array.from(text).slice(0,count).join("");}\n'},
 'async-order':{'main.mjs':'export async function solve(values){return Promise.all(values.map(async n=>n*2));}\n'},
 trapezoid:{'main.py':'def solve(points):\n    return sum((x2-x1)*(y1+y2)/2 for (x1,y1),(x2,y2) in zip(points,points[1:]))\n'},
 'sample-mean':{'main.py':'def solve(values):\n    if not values: raise ValueError("empty sample")\n    return sum(values)/len(values)\n'},
 'maze-wrap':{'main.mjs':'export function solve(position,delta,size){return ((position+delta)%size+size)%size;}\n'},
 'beat-clock':{'main.py':'def solve(bpm,count):\n    if bpm<=0 or count<0: raise ValueError("invalid pattern")\n    return [i*(60/bpm) for i in range(count)]\n'},
 'csv-detective':{'main.py':'import csv\ndef solve(line):\n    return next(csv.reader([line]))\n'},
 'utf8-fragments':{'main.py':'def solve(chunks):\n    return b"".join(chunks).decode("utf-8")\n'},
 'sql-missing-parent':{'query.sql':'SELECT p.id,COUNT(c.id) AS active_count FROM projects p LEFT JOIN children c ON c.project_id=p.id AND c.active=1 GROUP BY p.id ORDER BY p.id;\n'},
 'bash-space-log':{'main.sh':'#!/usr/bin/env bash\nwhile IFS= read -r line || [[ -n "$line" ]]; do printf "%s\\n" "$line"; done\n'},
 'counterexample-max':{'main.py':'def solve(values):\n    if not values: raise ValueError("empty")\n    best=values[0]\n    for value in values:\n        if value>best: best=value\n    return best\n'},
};
const execute=(cwd,runtime)=>{const [cmd,args]=runtime==='node'?['node',['--test']]:runtime==='bash'?['bash',['test.sh']]:['python3',['-B','-m','unittest','-v']];const env={...process.env,PYTHONDONTWRITEBYTECODE:'1'};delete env.NODE_TEST_CONTEXT;const r=spawnSync(cmd,args,{cwd,encoding:'utf8',timeout:10000,maxBuffer:128*1024,env});return {command:[cmd,...args],exitCode:r.status,signal:r.signal,stdout:r.stdout??'',stderr:r.stderr??'',...(r.error?{error:String(r.error)}:{})};};
const git=(cwd,args)=>{const r=spawnSync('git',args,{cwd,encoding:'utf8',timeout:10000,maxBuffer:128*1024,env:{...process.env,GIT_AUTHOR_NAME:'Synthetic Activity Test',GIT_AUTHOR_EMAIL:'test@example.invalid',GIT_COMMITTER_NAME:'Synthetic Activity Test',GIT_COMMITTER_EMAIL:'test@example.invalid',GIT_AUTHOR_DATE:'2026-10-25T12:00:00Z',GIT_COMMITTER_DATE:'2026-10-25T12:00:00Z'}});if(r.status!==0)throw Error(r.stderr||'git failed');return r.stdout.trim();};
export async function runExchangeProof({gitRoundTrip=true}={}){
 const sdk=await exchangeSdk(),results=[];let gitReceipt;
 for(const template of sdk.challengeTemplates){const {project}=await sdk.generateChallenge(template.id),dir=await mkdtemp(join(tmpdir(),'minamo-activity-proof-'));
  try{
   for(const file of project.files){await mkdir(dirname(join(dir,file.path)),{recursive:true});await writeFile(join(dir,file.path),file.text);}
   const baseline=execute(dir,template.runtime);if(baseline.exitCode===0||baseline.exitCode===null||baseline.error)throw Error(`Expected intended red ${template.id}: ${JSON.stringify(baseline)}`);
   if(/SyntaxError|ModuleNotFoundError|command not found/.test(baseline.stderr))throw Error('Baseline failed setup rather than intended assertion: '+template.id);
   if(template.id==='tcp-chunks'&&!/Ran 5 tests/.test(baseline.stderr)||template.id==='tcp-chunks'&&!/FAILED \(failures=3\)/.test(baseline.stderr))throw Error('TCP baseline must be exactly 3 failures in 5 tests.');
   let starterCommit;if(gitRoundTrip&&template.id==='tcp-chunks'){git(dir,['init','-q','--initial-branch=activity-proof']);git(dir,['add','.']);git(dir,['commit','-qm','Intentionally faulty synthetic starter']);starterCommit=git(dir,['rev-parse','HEAD']);}
   for(const [path,text] of Object.entries(repair[template.id]))await writeFile(join(dir,path),text);
   const repaired=execute(dir,template.runtime);if(repaired.exitCode!==0)throw Error(`Repair failed ${template.id}: ${JSON.stringify(repaired)}`);
   const zip=await sdk.deterministicProjectZip(project),entry={id:template.id,domain:template.domain,runtime:template.runtime,classification:'engineering-local-execution',learnerProgress:false,packageDigest:await sdk.projectDigest(project),zipSha256:hash(zip),files:project.files.map(f=>({path:f.path,sha256:f.sha256,role:f.role})),baseline,repaired};results.push(entry);
   if(starterCommit){git(dir,['add','.']);git(dir,['commit','-qm','Synthetic repaired submission']);const submissionCommit=git(dir,['rev-parse','HEAD']),diff=git(dir,['diff',starterCommit,submissionCommit]),paths=git(dir,['diff','--name-only',starterCommit,submissionCommit]).split('\n');
    const receipt=await sdk.fetchGitHubSubmission({contract:'minamo.github-submission.v1',repository:'synthetic/local-proof',starterCommit,submissionCommit,starterPackageDigest:entry.packageDigest,question:'The stream can arrive in fragments; what terminates a message?',nextIntention:'Explore length-prefixed framing next.'},{getCommit:async(repository,sha)=>({repository,sha,treeSha:git(dir,['rev-parse',sha+'^{tree}']),url:`https://github.com/${repository}/commit/${sha}`}),compare:async(repository,base,head)=>({repository,base,head,status:'ahead',files:paths.map(path=>({path,status:'modified'})),complete:true})});
    gitReceipt={classification:'isolated-local-git-not-github',providerAcceptance:false,starterCommit,submissionCommit,starterTree:git(dir,['rev-parse',starterCommit+'^{tree}']),submissionTree:git(dir,['rev-parse',submissionCommit+'^{tree}']),changedPaths:paths,diffSha256:hash(diff),providerContractSimulationDigest:receipt.receiptDigest,question:receipt.question,nextIntention:receipt.nextIntention,ci:'not-run'};
   }
  }finally{await rm(dir,{recursive:true,force:true});}
 }
 const commissionFixture=await runCommissionFixtureProof(),variants=await runVariantProof();
 return {contract:'minamo.exchange-proof.v1',environment:{node:process.version,python:spawnSync('python3',['--version'],{encoding:'utf8'}).stdout.trim(),platform:process.platform},classification:'synthetic-local-engineering-test',productionWrites:false,githubProviderAcceptance:false,commissionFixture,results,variants,gitReceipt};
}
export async function runVariantProof(){const sdk=await exchangeSdk(),results=[];for(const id of sdk.VARIANT_TEMPLATES)for(const seed of [0,7,65535]){const {project}=await sdk.generateChallengeVariant(id,seed),dir=await mkdtemp(join(tmpdir(),'minamo-variant-proof-'));try{for(const f of project.files)await writeFile(join(dir,f.path),f.text);const baseline=execute(dir,project.runtime);if(baseline.exitCode!==1||/SyntaxError|ModuleNotFoundError/.test(baseline.stderr))throw Error(`Variant baseline must fail its assertion: ${id}/${seed}: ${JSON.stringify(baseline)}`);for(const [path,text] of Object.entries(repair[id]))await writeFile(join(dir,path),text);const repaired=execute(dir,project.runtime);if(repaired.exitCode!==0)throw Error(`Variant oracle failed: ${id}/${seed}: ${JSON.stringify(repaired)}`);results.push({id:project.id,seed,packageDigest:await sdk.projectDigest(project),baseline,repaired});}finally{await rm(dir,{recursive:true,force:true});}}return results;}
export async function runCommissionFixtureProof(){
 const dir=await mkdtemp(join(tmpdir(),'minamo-commission-fixture-')),files=[];
 try{
  for(const path of ['chunked_reader.py','test_chunked_reader.py']){const bytes=await readFile(join(process.cwd(),'examples/activity-studio',path));await writeFile(join(dir,path),bytes);files.push({path,sha256:hash(bytes),gitBlob:createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex')});}
  const baseline=execute(dir,'python');if(baseline.exitCode!==1||!/Ran 5 tests/.test(baseline.stderr)||!/FAILED \(failures=3\)/.test(baseline.stderr))throw Error('Original commission fixture changed its 3-of-5 deliberate-failure contract.');
  await writeFile(join(dir,'chunked_reader.py'),repair['tcp-chunks']['chunked_reader.py']);const repaired=execute(dir,'python');if(repaired.exitCode!==0||!/Ran 5 tests/.test(repaired.stderr))throw Error('Original fixture repair failed.');
  return {sourceRef:'8d703ddb8f9894e1c771749d8106370b68f8d04b',files,baseline,repaired};
 }finally{await rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){const report=await runExchangeProof();const out=process.argv[2];if(out){await mkdir(dirname(out),{recursive:true});await writeFile(out,JSON.stringify(report,null,2)+'\n');}else process.stdout.write(JSON.stringify(report,null,2)+'\n');}
