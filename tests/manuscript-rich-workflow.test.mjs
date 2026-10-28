import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const brief='TEST ONLY — Teach JavaScript return values through real small programs and reusable Library explanations. Keep fictional sample inputs and predicted output separate from learner evidence. Reuse this technical reference in independent Journeys. No program execution is claimed by this publication.';
const article=`# TEST ONLY — Return values and display output

## Values cross a function boundary

A function call is an expression. Its value is the value returned by the function. A parameter names an input inside that call; the caller chooses the argument. Calling a function and displaying a message are separate operations. This distinction matters in a command-line script, a React event handler, a price calculator and a test assertion.

\`return\` ends the current function call and supplies its value to the caller. If execution reaches the end without an explicit return, the call evaluates to \`undefined\`. Printing something with \`console.log\` does not turn that displayed text into the function's return value.

\`\`\`javascript
function double(value) {
  return value * 2;
}
const answer = double(3);
console.log(answer);
\`\`\`

The predicted display is 6. This is an illustrative prediction, not a learner execution record. The variable \`answer\` receives a number before the later display call. Changing the argument to 4 changes the predicted return value; changing only the display label does not.

\`\`\`mermaid
flowchart TD
A[Caller supplies 3] --> B[Function multiplies by 2]
B --> C[Return number 6]
C --> D[Caller stores answer]
\`\`\`

## A common missing-return bug

\`\`\`javascript
function displayDouble(value) {
  console.log(value * 2);
}
const answer = displayDouble(3);
console.log(answer);
\`\`\`

Predict two displayed lines: the inner display prints 6, while the outer display prints undefined. The first function has a useful return value; this second function performs a display effect and has no explicit return. Neither example has been executed for this record. To investigate in your own environment, save one version as a small file, predict each displayed line, run it and compare the actual output.

A useful debugging question is: which expression produced the value I am inspecting? Follow values one assignment at a time. Do not infer a returned value from a screenshot of a log message alone.

Reference: [MDN return statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return). This is an external link, not an imported excerpt.`;
const route=`# TEST ONLY — Inspect a tiny calculation

## Predict and inspect

- **Intent:** Follow a function call from argument to returned value.
- **Outcome:** Distinguish a returned number from a displayed message.
- **Checkpoint:** Explain which expression produced the saved result, using actual output if supplied.

Read [the return-value mechanism](minamo:values), then save the first example as a local file. Predict the displayed line, run it in your own environment and inspect the result. Change only the argument, predict again and compare. The source contains predictions; it does not record that the learner ran them.

Use [the open question](minamo:question) if a displayed line differs from the prediction. Keep that uncertainty separate from the reference explanation.`;
const question='# TEST ONLY — Which call produced undefined?\n\nCompare a function that returns a number with one that only displays it. Which expression supplies the value assigned to the caller? Use [the reusable explanation](minamo:values). Propose an inspection before collecting results; no learner result is claimed.';
const input=(operationId,documents,existing)=>({purpose:'TEST ONLY rich authoring and independent reuse',operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief,documents},...(existing?{existing}:{})});

test('realistic rich teaching set publishes atomically, indexes reusable concepts, revises safely and reuses exact references',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('rich-authoring-fixture');let calls=0;
  const call=async(name,args)=>{calls++;const r=await c.request('/mcp',{jsonrpc:'2.0',id:calls,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY rich workflow',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text)};
  const documents=[{key:'js',role:'area',markdown:'# TEST ONLY — JavaScript values\n\nReusable value flow, expression evaluation and function boundaries.'},{key:'values',role:'article',markdown:article,catalogue:{summary:'Follow arguments, return values and display effects independently of a project.',areas:[{ref:'js',reason:'Explains JavaScript value flow and function boundaries.'}],references:[{term:'return',kind:'language-syntax',aliases:['return value'],definition:'Ends the current function call and supplies a value to its caller.',targetHeading:'Values cross a function boundary',exampleCodeLabel:'javascript',caseSensitive:true}]}},{key:'route',role:'journey',markdown:route},{key:'question',role:'investigation',markdown:question}];
  const publication=input('rich-resource-create',documents),started=performance.now(),receipt=await call('publish_minamo_manuscript',publication),elapsed=performance.now()-started;
  assert.equal(receipt.status,'committed',JSON.stringify(receipt));assert.equal(calls,1,'one guarded publish authors the complete connected set; no obligatory preview');assert.equal(receipt.recordRefs.length,4);assert.equal(receipt.sourceEdition.available,true);
  const refs=Object.fromEntries(receipt.recordRefs.map(r=>[r.key,r]));const read=async(ref,extra={})=>(await call('read_minamo_record',{family:ref.family,id:ref.id,...extra})).record;
  const old=await read(refs.values),journey=await read(refs.route),inquiry=await read(refs.question);assert.equal(old.learningShape.reusableBeyondProject,true);assert.ok(old.sections.some(s=>s.parts.some(p=>p.kind==='code'&&p.language==='javascript')));assert.ok(old.sections.some(s=>s.parts.some(p=>p.kind==='diagram'&&p.diagram.edges.length===3)));assert.ok(old.links.some(l=>l.family==='area'&&l.id===refs.js.id));assert.ok(journey.links.some(l=>l.id===old.id&&l.sourceContext.stageId===journey.learningShape.stages[0].id));assert.ok(inquiry.links.some(l=>l.id===old.id));assert.equal(journey.learningShape.stages[0].intent,'Follow a function call from argument to returned value.');
  const discovery=await call('query_minamo_library',{query:'return value',facet:'references'});assert.ok(JSON.stringify(discovery).includes(old.id));assert.ok(JSON.stringify(discovery).includes('return'));
  const section=old.sections[0],code=section.parts.find(p=>p.kind==='code'),paragraph=section.parts[0],target={family:'article',id:old.id,rev:old.rev};const changed=article.replace('A parameter names an input inside that call; the caller chooses the argument.','A parameter names an input inside that call; the caller chooses the argument. The same function can be called repeatedly with different arguments.');const revision=await call('publish_minamo_manuscript',input('rich-resource-revise',[{key:'values',role:'article',target,markdown:changed}],[{...target,purpose:'targeted-update'}]));assert.equal(revision.status,'committed',JSON.stringify(revision));
  const current=await read(refs.values);assert.equal(current.id,old.id);assert.equal(current.rev,old.rev+1);assert.equal(current.sections[0].id,section.id);assert.equal(current.sections[0].parts.find(p=>p.kind==='code').id,code.id);assert.equal(current.sections[0].parts[0].id,paragraph.id);assert.ok(current.links.some(l=>l.id===refs.js.id));assert.equal(current.concepts.length,old.concepts.length);assert.equal((await read(refs.values,{rendition:old.rendition})).sections[0].parts[0].text,paragraph.text);
  const questionTarget={family:'investigation',id:inquiry.id,rev:inquiry.rev};const inquiryEdit=question.replace('(minamo:values)','(minamo:article:'+current.id+')')+'\n\nCompare both call expressions before choosing an explanation.';const revisedQuestion=await call('publish_minamo_manuscript',input('rich-question-revise',[{key:'question',role:'investigation',target:questionTarget,markdown:inquiryEdit}],[{...questionTarget,purpose:'targeted-update'},{family:'article',id:current.id,rev:current.rev,purpose:'reuse'}]));assert.equal(revisedQuestion.status,'committed',JSON.stringify(revisedQuestion));assert.equal((await read(refs.question)).id,inquiry.id);
  const reuse=await call('publish_minamo_manuscript',input('rich-resource-reuse',[{key:'second-route',role:'journey',markdown:'# TEST ONLY — Inspect a price calculation\n\n## Compare value flow\n\nIntent: Reuse return-value reasoning in a different task.\n\nOutcome: Identify the value a caller receives.\n\nCheckpoint: Trace one argument and one return without claiming execution.\n\nRead [the existing value-flow explanation](minamo:article:'+current.id+'). Design a tiny price calculation and predict its return value before running it.'}],[{family:'article',id:current.id,rev:current.rev,purpose:'reuse'}]));assert.equal(reuse.status,'committed',JSON.stringify(reuse));assert.equal((await read(refs.values)).rev,current.rev,'reuse does not duplicate or mutate the independent article');
  const stale=await call('publish_minamo_manuscript',input('rich-resource-stale',[{key:'values',role:'article',target,markdown:changed}],[{...target,purpose:'targeted-update'}]));assert.equal(stale.code,'coverage_changed');
  const qualityPreview=await call('preview_minamo_manuscript',input('quality-risk-preview',[{key:'bare',role:'article',markdown:'# TEST ONLY return syntax\n\n## Example\n\n```javascript\nfunction sample() { return 3; }\n```'}]));assert.equal(qualityPreview.valid,true,'structural quality warnings guide judgement without an arbitrary publishing quota');const signal=qualityPreview.warnings.find(w=>w.code==='code_without_explanation');assert.ok(signal);assert.equal(signal.severity,'advisory');assert.ok(signal.path.includes('sections'));assert.ok(signal.remediation.includes('inputs'));assert.equal(qualityPreview.proposedRecords,undefined);
  const previewInput={...publication,operationId:'rich-preview-only'},compactStarted=performance.now(),compact=await call('preview_minamo_manuscript',previewInput),compactMs=performance.now()-compactStarted,detailStarted=performance.now(),detailed=await call('preview_minamo_manuscript',{...previewInput,detail:true}),detailMs=performance.now()-detailStarted;
  assert.equal(compact.valid,true,JSON.stringify(compact));assert.equal(detailed.valid,true,JSON.stringify(detailed));assert.equal(compact.proposedRecords,undefined);assert.equal(compact.sourceMap,undefined);assert.equal(compact.detailAvailable,true);assert.equal(detailed.proposedRecords.length,4);assert.ok(detailed.sourceMap.values.length);assert.deepEqual(compact.records,detailed.records);assert.deepEqual(compact.warnings,detailed.warnings);assert.ok(Buffer.byteLength(JSON.stringify(compact))<Buffer.byteLength(JSON.stringify(detailed)));
  console.log('PR26 equivalent preview response comparison',JSON.stringify({compactBytes:Buffer.byteLength(JSON.stringify(compact)),fullBytes:Buffer.byteLength(JSON.stringify(detailed)),compactMs,detailMs,identicalRefsAndWarnings:true}));
  const replayWithPreviewHint=await call('publish_minamo_manuscript',{...publication,detail:true});assert.equal(replayWithPreviewHint.replayed,true,'preview-only detail hint cannot alter publication identity');
  const archived=await call('read_minamo_manuscript_source',{operationId:publication.operationId});assert.equal(archived.manuscript.detail,undefined);assert.equal(archived.manuscript.documents.find(d=>d.key==='values').markdown,article);assert.equal(archived.recordRefs.find(r=>r.key==='values').stillCurrent,false);
  const counts=await f.db.prepare('SELECT family,count(*) n FROM v2_records WHERE owner=? GROUP BY family').bind(c.owner).all();assert.equal(counts.results.find(r=>r.family==='article').n,1,'independent reference identity remains unique');
  console.log('PR26 rich authoring local MCP fixture',JSON.stringify({publishCalls:1,publishRequestBytes:Buffer.byteLength(JSON.stringify(publication)),publishResponseBytes:Buffer.byteLength(JSON.stringify(receipt)),publishElapsedMs:elapsed,records:4,articleCodeBlocks:old.sections.flatMap(s=>s.parts).filter(p=>p.kind==='code').length,diagramEdges:3,referenceCount:old.concepts.length,totalTraceCalls:calls}));
 }finally{await f.dispose()}
});
