import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
async function coldSdk(){
 const built=await build({stdin:{contents:'export {generateChallenge,challengeCartridgeBlocks} from "./lib/challenge-exchange/generators.ts";export {deterministicProjectZip} from "./lib/challenge-exchange/package.ts";export {foundrySpecimens} from "./lib/foundry/specimens.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
 return import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
}
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1",MINAMO_LEARNING_ATLAS:"1"});}}';

test('cold public MCP schema supports two synthetic publications, exact editions, supplied Attempt and natural-name resume', {timeout:180000}, async t=>{
 const sdk=await coldSdk(),fixture=await privateStorageFixture(worker),client=fixture.client('TEST-ONLY-cold-handoff');
 const metrics={transportCalls:0,mcpCalls:0,inputBytes:0,outputBytes:0,tools:{}};
 let serial=0;
 const rpc=async(method,params)=>{
  const envelope={jsonrpc:'2.0',id:++serial,method,...(params?{params}:{})};
  metrics.transportCalls++;metrics.inputBytes+=Buffer.byteLength(JSON.stringify(envelope));
  const result=await client.request('/mcp',envelope);metrics.outputBytes+=Buffer.byteLength(JSON.stringify(result.data));
  assert.equal(result.status,200,JSON.stringify(result.data));assert.ok(!result.data.error,JSON.stringify(result.data));
  return result.data.result;
 };
 const call=async(name,args={})=>{
  metrics.mcpCalls++;metrics.tools[name]=(metrics.tools[name]??0)+1;
  const result=await rpc('tools/call',{name,arguments:{purpose:'Synthetic independent cold handoff acceptance',...args}});
  assert.equal(result.isError,false,JSON.stringify(result));const value=JSON.parse(result.content[0].text);
  if(value.generation)client.setGeneration(value.generation);return value;
 };
 try{
  // Discover the actual compiled JSON-RPC catalogue before composing requests.
  const catalogue=await rpc('tools/list');
  for(const name of ['get_minamo_activity_capabilities','preview_minamo_activity_package','publish_minamo_activity_package','read_minamo_activity','record_minamo_activity_attempt','get_minamo_activity_context'])assert.ok(catalogue.tools.some(tool=>tool.name===name),name);
  const publishSchema=catalogue.tools.find(tool=>tool.name==='publish_minamo_activity_package').inputSchema;
  assert.ok(publishSchema.required.includes('activity'));assert.equal(publishSchema.additionalProperties,false);
  const capabilities=await call('get_minamo_activity_capabilities');assert.equal(capabilities.enabled,true);assert.ok(capabilities.templates.includes('mathematics'));
  const {template,project}=await sdk.generateChallenge('tcp-chunks');
  const math=(await sdk.foundrySpecimens()).find(a=>a.kind==='math/native-v1');assert.ok(math);
  const packages=[
   {id:'TEST-ONLY-cold-tcp',title:'Synthetic TCP chunk boundary trial',activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:template.intent,blocks:sdk.challengeCartridgeBlocks(template,project)}},
   {id:'TEST-ONLY-cold-fractions',title:'Synthetic fraction addition trial',activity:{contract:'minamo.activity.v1',template:'mathematics',authorship:'original-exercise',intent:'Compare one third plus one sixth with one half using a common denominator.',blocks:[{id:'purpose',kind:'instruction',text:'The displayed expression is one third. Explain how to add one sixth using sixths.'},{id:'fraction',kind:'foundry',artefact:math},{id:'prediction',kind:'prediction',text:'Predict whether one third plus one sixth equals one half. Give a denominator argument.'},{id:'hints',kind:'hint-ladder',hints:[{id:'fraction-concept',tier:'concept',text:'Equivalent fractions preserve the represented amount.'},{id:'fraction-strategy',tier:'strategy',text:'Express each addend using the same denominator.'}]},{id:'reflection',kind:'reflection',text:'Explain why adding denominators would change the size of the parts.'}]}}
  ];
  const published=[];
  for(const [index,pkg] of packages.entries()){
   const input={...pkg,synthetic:true,operationId:'cold-publish-'+index,expectedGeneration:client.generation};
   const preview=await call('preview_minamo_activity_package',input);assert.equal(preview.classification,'authored-exercise');assert.equal(preview.execution,'not-executed');
   const result=await call('publish_minamo_activity_package',input);assert.equal(result.receipt.status,'committed');assert.equal(result.learningDevelopmentCreated,false);assert.equal(result.execution,'not-executed');assert.equal(result.record.synthetic,true);
   const exact=await call('read_minamo_activity',{id:result.record.id,rendition:result.record.rendition});
   assert.equal(exact.record.rendition,result.record.rendition);assert.equal(exact.record.id,pkg.id);assert.ok(exact.deepLink.includes(encodeURIComponent(result.record.rendition)));
   assert.equal(exact.record.activity.template,pkg.activity.template);
   for(const block of exact.record.activity.blocks.filter(b=>b.kind==='hint-ladder'))for(const hint of block.hints)assert.equal(hint.text,'');
   if(index===0){const files=exact.record.activity.blocks.find(b=>b.kind==='source-browser').bundle.files;assert.deepEqual(files,project.files);for(const file of files){assert.equal(createHash('sha256').update(file.text,'utf8').digest('hex'),file.sha256);}}
   else assert.deepEqual(exact.record.activity.blocks.find(b=>b.kind==='foundry').artefact,math);
   published.push(exact.record);
  }
  // Obtain the persisted exact-edition ZIP through the owner-authenticated download route.
  const tcp=published[0],download=await client.request('/api/activities/project?'+new URLSearchParams({id:tcp.id,rendition:tcp.rendition,blockId:'starter'}));
  metrics.transportCalls++;assert.equal(download.status,200);assert.deepEqual(download.data,await sdk.deterministicProjectZip(project));
  const dir=await mkdtemp(join(tmpdir(),'minamo-cold-baseline-'));
  let terminal;
  try{
   await writeFile(join(dir,'starter.zip'),download.data);
   const unpack=spawnSync('python3',['-c','import zipfile; zipfile.ZipFile("starter.zip").extractall(".")'],{cwd:dir,encoding:'utf8'});assert.equal(unpack.status,0,unpack.stderr);
   // This command is the admitted trusted template command, deliberately run only in synthetic scratch.
   const baseline=spawnSync(project.commands.kali,{cwd:dir,encoding:'utf8',shell:true});
   assert.notEqual(baseline.status,0);assert.match(baseline.stderr,/Ran 5 tests/);assert.match(baseline.stderr,/FAILED \(failures=3\)/);
   terminal=`Synthetic engineer-supplied local baseline; not Minamo-observed or learner achievement.\ncommand: ${project.commands.kali}\nexit: ${baseline.status}\n${baseline.stdout}${baseline.stderr}`;
  }finally{await rm(dir,{recursive:true,force:true});}
  const attemptInput={operationId:'cold-attempt-1',id:'TEST-ONLY-cold-attempt',title:'Synthetic TCP supplied baseline attempt',synthetic:true,expectedGeneration:client.generation,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:tcp.id,rendition:tcp.rendition},state:'submitted',prediction:'A single recv will lose later chunks.',reflection:'The intentional starter failed three visible assertions; this supplied run is not a claim of learner understanding.',nextIntention:'Inspect the EOF loop and byte limit before changing the starter.',hintsRevealed:[],evidence:[{classification:'supplied-terminal',text:terminal}]}};
  const attempt=await call('record_minamo_activity_attempt',attemptInput);assert.equal(attempt.receipt.status,'committed');assert.equal(attempt.learningDevelopmentCreated,false);assert.deepEqual(attempt.record.attempt,attemptInput.attempt);assert.equal(attempt.record.evidence,'illustrative');
  const attemptRead=await call('read_minamo_record',{family:'run',id:attempt.record.id,rendition:attempt.record.rendition});assert.deepEqual(attemptRead.record.attempt,attemptInput.attempt);
  for(const record of published){
   // Resume with a natural title only: no caller-supplied record ID or rendition.
   const context=await call('get_minamo_activity_context',{query:record.title,includeSynthetic:true});
   const resumed=context.activities.find(a=>a.title===record.title);assert.ok(resumed);assert.equal(resumed.rendition,record.rendition);assert.ok(resumed.deepLink);
   if(record.id===tcp.id){const resumedAttempt=context.attempts.find(a=>a.id===attempt.record.id);assert.ok(resumedAttempt);assert.equal(resumedAttempt.attempt.activity.rendition,tcp.rendition);assert.equal(resumedAttempt.attempt.nextIntention,attemptInput.attempt.nextIntention);assert.equal(resumedAttempt.attempt.evidence[0].classification,'supplied-terminal');}
   assert.equal(context.nextCursor,null);assert.equal(context.searchIncomplete,false);
  }
  const families=await fixture.db.prepare('SELECT family,count(*) AS n FROM v2_records GROUP BY family ORDER BY family').all();assert.deepEqual(families.results,[{family:'experiment',n:2},{family:'run',n:1}]);
  t.diagnostic('COLD_HANDOFF_METRICS '+JSON.stringify(metrics));
 }finally{await fixture.dispose();}
});
