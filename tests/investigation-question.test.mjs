import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const bundle=await build({stdin:{contents:"export {compileManuscript} from './lib/manuscript.ts'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {compileManuscript}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const request=(operationId,markdown,target)=>({purpose:'TEST ONLY explicit question acceptance',operationId,expectedGeneration:'legacy@0',synthetic:true,...(target?{existing:[{...target,purpose:'targeted-update'}]}:{}),manuscript:{version:1,brief:'An original synthetic question and method, without a learner observation.',documents:[{key:'inquiry',role:'investigation',markdown,...(target?{target}:{})}]}});
const question=c=>c.pkg.records[0].data.learningShape.question;
const title='# TEST ONLY — Count differences';
const method='## Compare one difference\n\nChange letter case in a tiny invented input and predict the effect.';

test('only dedicated top-level introductory Question paragraphs declare metadata; full source survives',async()=>{
 const excluded=[
  '```text\nQuestion: Code is literal?\n```',
  '    Question: Indented code is literal?',
  '> Question: Quoted example?',
  '- Question: A list example?\n  - Question: Nested too?',
  '| Label | Value |\n| --- | --- |\n| Question: | A table example? |',
  'An example says Question: What happens?',
  '`Question: Inline code?`',
 ];
 for(const [i,example] of excluded.entries()){
  const markdown=title+'\n\n'+example+'\n\n'+method+'\n\nQuestion: A later example?';
  const c=await compileManuscript(request('excluded-'+i,markdown));
  assert.equal(question(c),'TEST ONLY — Count differences',example);
  assert.equal(c.input.manuscript.documents[0].markdown,markdown);
  assert.ok(!c.warnings.some(w=>w.code.includes('investigation_question')));
 }
 const markdown=title+'\n\nQuestion: Which differences in café / 😀 should the counter preserve?\n\n'+method;
 const c=await compileManuscript(request('one-question',markdown));
 assert.equal(question(c),'Which differences in café / 😀 should the counter preserve?');
 assert.equal(c.input.manuscript.documents[0].markdown,markdown);
 assert.ok(c.pkg.records[0].data.sections.flatMap(s=>s.parts).some(p=>p.text==='Question: '+question(c)));
 const formatted=await compileManuscript(request('visible-question',title+'\n\nQuestion: Why does **case** affect `A`?\n\n'+method));
 assert.equal(question(formatted),'Why does case affect A?','formatting projects visible authored text without rewriting prose');
});

test('identical repeats coalesce, while conflict, empty and over-limit declarations fall back with actionable locations',async()=>{
 const cases=[
  {body:'Question: Preserve case?\n\nQuestion: Preserve case?',expected:'Preserve case?',code:'repeated_investigation_question'},
  {body:'Question: Preserve case?\n\nQuestion: Ignore case?',code:'conflicting_investigation_question'},
  {body:'Question:',code:'invalid_investigation_question'},
  {body:'Question:\n\nA separate paragraph cannot supply the question.',code:'invalid_investigation_question'},
  {body:'Question: '+('x'.repeat(1001)),code:'invalid_investigation_question'},
  {body:'Question: Valid?\n\nQuestion:',code:'invalid_investigation_question'},
 ];
 for(const [i,{body,expected,code}] of cases.entries()){
  const markdown=title+'\n\n'+body+'\n\n'+method,c=await compileManuscript(request('question-fallback-'+i,markdown));
  assert.equal(question(c),expected??'TEST ONLY — Count differences');
  const warning=c.warnings.find(w=>w.code===code);assert.ok(warning,JSON.stringify(c.warnings));
  assert.equal(warning.path,'manuscript.documents[0].markdown');assert.equal(warning.severity,'advisory');
  assert.match(markdown.slice(warning.start,warning.end),/^Question:/);assert.ok(warning.remediation);
  assert.equal(c.input.manuscript.documents[0].markdown,markdown);
 }
 const limit=await compileManuscript(request('question-limit',title+'\n\nQuestion: '+('x'.repeat(1000))));assert.equal(question(limit).length,1000);
});

test('actual MCP preview/publish agree and unrelated guarded revision preserves deliberate question and exact identities',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const c=f.client('TEST-ONLY-question-owner');let serial=0;
  const call=async(name,args)=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:args}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text)};
  const markdown=title+'\n\nQuestion: Which differences should remain significant?\n\n'+method;
  const input=request('question-publish',markdown),preview=await call('preview_minamo_manuscript',{...input,detail:true});
  assert.equal(preview.valid,true,JSON.stringify(preview));
  const receipt=await call('publish_minamo_manuscript',input);assert.equal(receipt.status,'committed',JSON.stringify(receipt));
  const ref=receipt.recordRefs[0],read=async()=>{const r=await c.context(ref.family,ref.id);assert.equal(r.status,200);return r.data.record};
  const saved=await read();assert.equal(saved.learningShape.question,preview.proposedRecords[0].learningShape.question);
  const target={family:ref.family,id:ref.id,rev:saved.rev},changed=title+'\n\nA refined introductory explanation.\n\n'+method;
  const update=request('question-unrelated-update',changed,target),updatePreview=await call('preview_minamo_manuscript',{...update,detail:true});
  assert.equal(updatePreview.valid,true,JSON.stringify(updatePreview));assert.equal(updatePreview.proposedRecords[0].learningShape.question,saved.learningShape.question);
  assert.equal((await call('publish_minamo_manuscript',update)).status,'committed');
  const revised=await read();assert.equal(revised.learningShape.question,saved.learningShape.question);
  const before=saved.sections.find(s=>s.title==='Compare one difference'),after=revised.sections.find(s=>s.title==='Compare one difference');
  assert.equal(after.id,before.id);assert.equal(after.parts[0].id,before.parts[0].id);
  const explicit=request('question-intentional-update',changed.replace('A refined introductory explanation.','Question: Does a trailing space change the count?'),{...target,rev:revised.rev});
  assert.equal((await call('publish_minamo_manuscript',explicit)).status,'committed');assert.equal((await read()).learningShape.question,'Does a trailing space change the count?');
  const archived=await call('read_minamo_manuscript_source',{purpose:'TEST ONLY source retention',operationId:input.operationId});assert.equal(archived.manuscript.documents[0].markdown,markdown);
  const stale=await call('publish_minamo_manuscript',{...update,operationId:'question-stale-revision'});assert.equal(stale.code,'coverage_changed');
  const conflict=request('question-conflict-publish',title+'\n\nQuestion: Keep case?\n\nQuestion: Ignore case?\n\n'+method);
  const conflictPreview=await call('preview_minamo_manuscript',{...conflict,detail:true}),conflictReceipt=await call('publish_minamo_manuscript',conflict);
  assert.equal(conflictPreview.proposedRecords[0].learningShape.question,'TEST ONLY — Count differences');
  assert.equal(conflictReceipt.status,'committed',JSON.stringify(conflictReceipt));assert.ok(conflictReceipt.warnings.some(w=>w.code==='conflicting_investigation_question'));
  const fallback=await c.context('investigation',conflictReceipt.recordRefs[0].id);assert.equal(fallback.data.record.learningShape.question,conflictPreview.proposedRecords[0].learningShape.question);
 }finally{await f.dispose()}
});
