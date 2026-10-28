import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export {compileManuscript} from "./lib/manuscript.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {compileManuscript}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const request=markdown=>({purpose:'TEST ONLY explicit stage metadata',operationId:'metadata-fixture',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'A synthetic practical stage with deliberately authored instructional metadata.',documents:[{key:'route',role:'journey',markdown}]}});
const markdown='# TEST ONLY metadata route\n\n## Inspect values\n\n- **Intent:** Understand returned values.\n- **Outcome:** Predict which value is returned.\n\n### Checkpoint\n\nExplain the return value using the observed call.\n\n```javascript\nfunction twice(n) { return n * 2; }\nconsole.log(twice(3));\n```\n\nThe expected output is an illustration, never a learner execution claim.';

test('explicit rich stage declarations compile into metadata without author-side schema assembly or changing source',async()=>{
 const started=performance.now(),result=await compileManuscript(request(markdown)),stage=result.pkg.records[0].data.learningShape.stages[0];
 assert.equal(stage.intent,'Understand returned values.');assert.equal(stage.outcome,'Predict which value is returned.');assert.equal(stage.checkpoint,'Explain the return value using the observed call.');
 assert.equal(result.inspected.documents[0].source,markdown);assert.ok(result.pkg.records[0].data.sections[0].parts.some(p=>p.kind==='code'&&p.text.includes('console.log')));assert.ok(result.pkg.records[0].data.sections[0].parts.some(p=>p.text==='• Intent: Understand returned values.'));
 assert.ok(!result.warnings.some(w=>w.code==='missing_stage_metadata'));
 console.log('PR26 explicit-label compiler fixture',JSON.stringify({requestBytes:Buffer.byteLength(JSON.stringify(request(markdown))),compiledBytes:Buffer.byteLength(JSON.stringify(result.pkg)),elapsedMs:performance.now()-started,metadataFields:['intent','outcome','checkpoint'].filter(k=>stage[k]).length}));
});
test('plain, rich and multi-line declarations retain authored meaning; no label is guessed from teaching prose',async()=>{
 for(const source of ['**Intent:** Compare values.\n**Outcome:** Explain equality.\n**Checkpoint:** Predict before running.','1. Intent: Compare values.\n2. Outcome: Explain equality.\n3. Checkpoint: Predict before running.','### Intent\n\nCompare values.\n\n### Outcome:\n\nExplain equality.\n\n### Checkpoint\n\nPredict before running.']){
  const r=await compileManuscript(request('# Route\n\n## Stage\n\n'+source)),stage=r.pkg.records[0].data.learningShape.stages[0];assert.equal(stage.intent,'Compare values.');assert.equal(stage.outcome,'Explain equality.');assert.equal(stage.checkpoint,'Predict before running.');
 }
 const source='# Route\n\n## Stage\n\nThis explanation has an intended outcome, but no declaration.\n\n> Intent: A quoted example is not metadata.\n>\n> ### Checkpoint\n>\n> This also remains a quotation.\n\n```text\nOutcome: An example inside code is not metadata.\n```';const r=await compileManuscript(request(source)),stage=r.pkg.records[0].data.learningShape.stages[0];assert.equal(stage.intent,undefined);assert.equal(stage.outcome,undefined);assert.equal(stage.checkpoint,undefined);assert.ok(r.warnings.some(w=>w.code==='missing_stage_metadata'));assert.equal(r.inspected.documents[0].source,source);
});
test('ambiguous or oversized explicit declarations warn instead of silently choosing or truncating',async()=>{
 const source='# Route\n\n## Stage\n\nIntent: First meaning.\n\nIntent: Different meaning.\n\nOutcome: '+('x'.repeat(1001))+'\n\nCheckpoint: Predict next.\n\nCheckpoint: Predict next.';const r=await compileManuscript(request(source)),stage=r.pkg.records[0].data.learningShape.stages[0];assert.equal(stage.intent,undefined);assert.equal(stage.outcome,undefined);assert.equal(stage.checkpoint,'Predict next.');assert.ok(r.warnings.some(w=>w.code==='conflicting_stage_metadata'));assert.ok(r.warnings.some(w=>w.code==='invalid_stage_metadata'));assert.equal(r.inspected.documents[0].source,source);assert.ok(r.pkg.records[0].data.sections[0].parts.some(p=>p.text==='Outcome: '+('x'.repeat(1001))));
});

test('author quality diagnostics expose structural risks without enforcing length, code or media quotas',async()=>{
 const compile=documents=>compileManuscript({...request('unused'),manuscript:{version:1,brief:'An original fixture for checking helpful author feedback, not semantic certification.',documents}});
 const codeOnly=await compile([{key:'bare',role:'article',markdown:'# TEST ONLY code reference\n\n## Mechanism\n\n```javascript\nconsole.log(1);\n```'}]);assert.ok(codeOnly.warnings.some(w=>w.code==='reference_without_explanation'));assert.ok(codeOnly.warnings.some(w=>w.code==='code_without_explanation'));
 const directions='Discuss with GPT.\n\nDiscuss with GPT.';const mirrored=await compile([{key:'route',role:'journey',markdown:'# TEST ONLY route\n\n## Talk\n\n'+directions},{key:'reference',role:'article',markdown:'# TEST ONLY reference\n\n'+directions}]);for(const code of ['repeated_tutoring_scaffold','reference_only_tutoring_scaffold','reference_repeats_journey_section'])assert.ok(mirrored.warnings.some(w=>w.code===code),'missing '+code);
 for(const text of ['A cache is a stored answer whose eligibility is determined by its contract.','**A returned value belongs to the caller; a displayed message is a separate effect.**']){const short=await compile([{key:'concise',role:'article',markdown:'# TEST ONLY concise explanation\n\n'+text}]);assert.ok(!short.warnings.some(w=>['sparse_explanation','reference_without_explanation','code_without_explanation'].includes(w.code)));}
 const unsupported=await compile([{key:'diagram',role:'article',markdown:'# TEST ONLY unsupported diagram\n\nThe connection is an illustration of an abstract relation.\n\n```mermaid\nclassDiagram\nCat <|-- Kitten\n```'}]);assert.ok(unsupported.warnings.some(w=>w.code==='diagram_fallback'));assert.equal(unsupported.pkg.records[0].data.sections[0].parts.find(p=>p.kind==='code').text,'classDiagram\nCat <|-- Kitten');
});
