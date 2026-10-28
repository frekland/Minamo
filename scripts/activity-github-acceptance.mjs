import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {exchangeSdk} from './activity-exchange-proof.mjs';
import {privateStorageFixture} from '../tests/private-storage-fixture.mjs';
const receipt=JSON.parse(await readFile('docs/activity-studio/GITHUB-EXCHANGE-RECEIPT.json','utf8'));
const sdk=await exchangeSdk(),{project,template}=await sdk.generateChallenge('tcp-chunks');
const dir=await mkdtemp(join(tmpdir(),'minamo-connector-readback-'));
const run=()=>{const r=spawnSync('python3',['-B','-m','unittest','-v'],{cwd:dir,encoding:'utf8',timeout:10000});return {command:'python3 -B -m unittest -v',exitCode:r.status,stdout:r.stdout,stderr:r.stderr};};
let baseline,repaired;
try{for(const file of project.files)await writeFile(join(dir,file.path),file.text);await writeFile(join(dir,'chunked_reader.py'),receipt.starterRead.content);baseline=run();if(baseline.exitCode===0||!/FAILED \(failures=3\)/.test(baseline.stderr))throw Error('Fetched GitHub starter not expected red');await writeFile(join(dir,'chunked_reader.py'),receipt.submissionRead.content);repaired=run();if(repaired.exitCode!==0||!/Ran 5 tests/.test(repaired.stderr))throw Error('Fetched GitHub submission not green');}finally{await rm(dir,{recursive:true,force:true});}
const f=await privateStorageFixture('import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(r,env){return domainHandler(r,{...env,MINAMO_ACTIVITY_STUDIO:"1"});}}');
let readback;
try{
 const client=f.client('TEST-ONLY-provider-exchange');
 const rpc=async(name,args)=>{const response=await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}});if(response.status!==200||response.data.result.isError)throw Error(JSON.stringify(response));return JSON.parse(response.data.result.content[0].text);};
 const p=await rpc('publish_minamo_activity_package',{purpose:'Synthetic immutable GitHub exchange integration',operationId:'provider-publish',id:'provider-stream',title:'TEST ONLY Provider Stream Detective',synthetic:true,activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:template.intent,blocks:sdk.challengeCartridgeBlocks(template,project)}});
 await rpc('record_minamo_activity_attempt',{purpose:'Explicit synthetic externally fetched submission, no attestation by Minamo',operationId:'provider-attempt',id:'provider-attempt',title:'TEST ONLY Provider Stream Detective return',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:p.record.id,rendition:p.record.rendition},state:'submitted',nextIntention:'Investigate persistent framing: why EOF cannot be every protocol boundary.',hintsRevealed:[],evidence:[{classification:'github-commit',repository:receipt.repository,commit:receipt.submissionCommit,verification:'supplied-unverified',description:'Engineering connector fetched exact commit and comparison; Minamo has no trusted GitHub binding, so server retains this as supplied-unverified.'},{classification:'supplied-terminal',text:'ENGINEERING-EXECUTED OUTSIDE MINAMO WORKER; supplied to this record.\n'+repaired.stderr}]}});
 readback=await rpc('get_minamo_activity_context',{purpose:'Fresh caller natural-name immutable submission recovery',query:'Provider Stream Detective',includeSynthetic:true});
 if(readback.attempts[0].attempt.evidence[0].commit!==receipt.submissionCommit)throw Error('Commit continuity failed');
 if(readback.attempts[0].evidence==='observed')throw Error('False attestation');
}finally{await f.dispose();}
const result={contract:'minamo.connector-readback-runtime-proof.v1',classification:'engineering-local-execution',sourceReceipt:'GITHUB-EXCHANGE-RECEIPT.json',starterCommit:receipt.starterCommit,submissionCommit:receipt.submissionCommit,starterSourceSha256:createHash('sha256').update(receipt.starterRead.content).digest('hex'),submissionSourceSha256:createHash('sha256').update(receipt.submissionRead.content).digest('hex'),baseline,repaired,continuity:{activities:readback.activities.length,attempts:readback.attempts.length,commit:readback.attempts[0].attempt.evidence[0].commit,verification:readback.attempts[0].attempt.evidence[0].verification,nextIntention:readback.attempts[0].attempt.nextIntention},githubCI:'No workflow runs found; no CI execution claim',hosted:false,learnerProgress:false};
await writeFile('docs/activity-studio/GITHUB-EXCHANGE-RUNTIME.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({baseline:baseline.exitCode,repaired:repaired.exitCode,continuity:result.continuity}));
