import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const article=`# TEST ONLY — Working directories and relative paths

## A process carries a starting directory

A relative path is interpreted from a process's current working directory. The file's name alone does not identify its location. This mechanism matters in a shell, a build tool and a program opening a local file; it remains useful independently of any project route.

The terminal displays a shell. The shell is a process, and its working directory is part of its state. The command \`pwd\` displays that directory. The shell's \`cd\` command changes its own working directory; a later command started by that shell inherits the changed directory.

## Inspect one change

\`\`\`sh
pwd
cd ..
pwd
\`\`\`

The first line reports the current directory. The second asks the shell to change to its parent. If that change succeeds, the final line reports the parent directory; at the filesystem root its parent is still the root. These are predicted relationships, not recorded learner output. Do not copy an example's absolute path as if it identified a directory on your own computer.

## Diagnose a missing file

Before changing a file-opening statement, inspect the process's working directory and compare it with the directory containing the file. A relative path such as \`data/sample.txt\` is resolved from the process's directory, rather than automatically from the script's location. A tool may deliberately change its working directory, so inspect the process that actually performs the read.

If \`cd\` reports an error, the requested change did not succeed; check the path and access permissions before interpreting later output. Changing directories in a separate subshell does not change the parent shell's directory. This explains why a helper command can finish without moving the shell in which you are typing.

Reference: [POSIX pwd](https://pubs.opengroup.org/onlinepubs/9799919799/utilities/pwd.html). This is a link for further reading, not an imported excerpt.`;
const shortConcept='# TEST ONLY — Prediction and observation\n\nA prediction states what you expect before trying an action. An observation records what actually happened. Keep them distinct: a plausible expected line is not evidence that a learner ran a program. If actual output differs, retain both statements and inspect the mismatch rather than rewriting the prediction as a result.';
const request=(operationId,documents,existing)=>({purpose:'TEST ONLY independent ordinary authoring acceptance',operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Create a reusable explanation of working directories for a beginner. Include a concrete shell example and troubleshooting, organise it in a general command-line area, and link a short practical task to the reference. No learner action or result is claimed.',documents},...(existing?{existing}:{})});

test('independent fresh ordinary MCP authoring supports rich reference creation, stable revision and cross-route reuse',async()=>{
 const f=await privateStorageFixture(`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`);
 try{
  const c=f.client('independent-normal-authoring');let serial=0;
  const call=async(name,args)=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY independent authoring',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text)};
  const documents=[{key:'shell',role:'area',markdown:'# TEST ONLY — Command-line environments\n\nReusable shell process state, paths and command behaviour.'},{key:'paths',role:'article',markdown:article,catalogue:{summary:'Understand where relative paths begin and diagnose the wrong working directory.',areas:[{ref:'shell',reason:'Explains shell process state and command behaviour.'}],references:[{term:'pwd',kind:'shell-command',aliases:['working directory'],definition:'Displays the calling process current working directory.',environment:'POSIX shell',targetHeading:'Inspect one change',exampleCodeLabel:'sh'}]}},{key:'route',role:'journey',markdown:'# TEST ONLY — Inspect a file location\n\n## Inspect before editing\n\nIntent: Locate where a relative path begins.\n\nOutcome: Explain why the same path can identify different files.\n\nCheckpoint: Compare the actual working directory with the intended file location.\n\nRead [working directories](minamo:paths). Inspect your current directory, predict what moving to its parent will change, then compare the actual output. This is an instruction, not an execution record.'}];
  const created=await call('publish_minamo_manuscript',request('independent-cwd-create',documents));assert.equal(created.status,'committed',JSON.stringify(created));
  const refs=Object.fromEntries(created.recordRefs.map(r=>[r.key,r]));
  const read=async(ref,extra={})=>(await call('read_minamo_record',{family:ref.family,id:ref.id,...extra})).record;
  const original=await read(refs.paths),command=original.concepts.find(x=>x.term==='pwd');assert.ok(command);assert.ok(command.examplePartId);assert.ok(original.links.some(x=>x.id===refs.shell.id));
  const exact=await call('query_minamo_library',{facet:'references',kind:'shell-command',query:'pwd'});assert.ok(JSON.stringify(exact).includes(original.id));
  const changed=article.replace('## Inspect one change','## Relative does not mean local to the script\n\nA script and its current working directory can be in different directories. Establish the process state before resolving the path.\n\n## Inspect one change');
  const target={family:'article',id:original.id,rev:original.rev};
  const revised=await call('publish_minamo_manuscript',request('independent-cwd-revise',[{key:'paths',role:'article',target,markdown:changed}],[{...target,purpose:'targeted-update'}]));assert.equal(revised.status,'committed',JSON.stringify(revised));
  const current=await read(refs.paths),retained=current.concepts.find(x=>x.term==='pwd');assert.equal(current.rev,original.rev+1);assert.equal(retained.sectionId,command.sectionId);assert.equal(retained.examplePartId,command.examplePartId);assert.equal(current.concepts.length,original.concepts.length);assert.equal(current.links.filter(x=>x.id===refs.shell.id).length,1);assert.equal((await read(refs.paths,{rendition:original.rendition})).sections.length,original.sections.length);
  const reuse=await call('publish_minamo_manuscript',request('independent-cwd-reuse',[{key:'second',role:'journey',markdown:'# TEST ONLY — Diagnose a build path\n\n## Inspect the build process\n\nIntent: Reuse working-directory reasoning for a build command.\n\nOutcome: Identify the base used to resolve an input path.\n\nCheckpoint: Explain the actual path without assuming the script location.\n\nRead [the existing mechanism](minamo:article:'+current.id+'). Inspect where the build command runs before altering its input path.'}],[{family:'article',id:current.id,rev:current.rev,purpose:'reuse'}]));assert.equal(reuse.status,'committed',JSON.stringify(reuse));assert.equal((await read(refs.paths)).rev,current.rev);
  const thin=await call('preview_minamo_manuscript',request('independent-thin-preview',[{key:'thin',role:'article',markdown:'# TEST ONLY — pwd\n\n## Command\n\n```sh\npwd\n```'}]));
  const concise=await call('preview_minamo_manuscript',request('independent-concept-preview',[{key:'concept',role:'article',markdown:shortConcept}]));
  assert.equal(thin.valid,true,JSON.stringify(thin));assert.equal(concise.valid,true,JSON.stringify(concise));
  assert.ok(thin.warnings.some(w=>w.documentKey==='thin'&&w.code==='code_without_explanation'&&w.message.includes('Command')&&w.remediation.includes('Explain')&&w.path==='records[0].data.sections[0].parts'&&w.severity==='advisory'),'code-only reference identifies the exact section and a concrete nonblocking repair');
  assert.ok(!Object.hasOwn(thin,'proposedRecords')&&!Object.hasOwn(thin,'sourceMap'),'ordinary preview does not echo the entire canonical manuscript');
  const detail=await call('preview_minamo_manuscript',{...request('independent-thin-detail',[{key:'thin',role:'article',markdown:'# TEST ONLY — pwd\n\n## Command\n\n```sh\npwd\n```'}]),detail:true});assert.ok(detail.proposedRecords[0].sections[0].parts.some(p=>p.kind==='code'&&p.text==='pwd'));assert.ok(detail.sourceMap.thin.length);
  assert.ok(!concise.findings?.some(x=>x.severity==='block'),'a concise conceptual explanation is not rejected by code, source, diagram or length quotas');
  assert.ok(!concise.warnings.some(w=>w.code==='reference_without_explanation'||w.code==='code_without_explanation'));
  const counts=await f.db.prepare("SELECT count(*) n FROM v2_records WHERE owner=? AND family='article'").bind(c.owner).first();assert.equal(counts.n,1,'preview is read-only and reuse creates no duplicate reference');
  const conciseSave=await call('publish_minamo_manuscript',request('independent-concept-save',[{key:'concept',role:'article',markdown:shortConcept}]));assert.equal(conciseSave.status,'committed',JSON.stringify(conciseSave));
 }finally{await f.dispose()}
});
