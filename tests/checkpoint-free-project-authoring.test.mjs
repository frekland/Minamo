import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const manuscript=(operationId,markdown,target)=>({
 purpose:'Publish or revise the same ordinary freeform Project without progress fields',
 operationId,expectedGeneration:'legacy@0',synthetic:true,
 manuscript:{version:1,brief:'A real code example with unresolved questions; this fixture does not claim external execution.',documents:[{key:'route',role:'journey',markdown,...(target?{target}:{})}]},
 ...(target?{existing:[{...target,purpose:'targeted-update'}]}:{})
});

test('freeform Project with code has no checkpoint warnings or metadata; exact revisions remain readable', {timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('freeform-project-owner');
  const source='# A small DNS resolver investigation\n\nA project can record evidence and revise an interpretation without tracking progress.\n\n## The resolver\n\n```python\nimport socket\nprint(socket.getaddrinfo("example.com", 443))\n```\n\nThe result depends on the resolver and machine; no output is claimed here.\n\n## What remains unresolved\n\nWhich answers came from a cache? The code alone cannot establish that.';
  const first=await c.request('/api/manuscripts/preview',manuscript('freeform-preview',source));
  assert.equal(first.status,200,JSON.stringify(first.data));
  assert.ok(!(first.data.warnings??[]).some(w=>/missing_stage_metadata|checkpoint/i.test(w.code)));
  const created=await c.request('/api/manuscripts/publish',manuscript('freeform-create',source));
  assert.equal(created.status,200,JSON.stringify(created.data));
  const ref=created.data.recordRefs[0],original=(await c.context('journey',ref.id)).data.record;
  assert.ok(original.sections.some(s=>s.parts.some(p=>p.kind==='code'&&p.text.includes('getaddrinfo'))));
  assert.ok(original.learningShape.stages.every(s=>!('checkpoint'in s)&&!('intent'in s)&&!('outcome'in s)));
  assert.deepEqual(original.projectComposition.sections.map(s=>s.title),original.sections.map(s=>s.title),'fresh Projects navigate by their authored headings, not synthetic Notebook/Guide groupings');
  assert.deepEqual(original.projectComposition.blocks.map(b=>b.sectionId),original.sections.map(s=>s.id));
  const target={family:'journey',id:ref.id,rev:original.rev};
  const revised=await c.request('/api/manuscripts/publish',manuscript('freeform-revise',source.replace('The code alone cannot establish that.','The code alone cannot establish that. An isolated resolver trace is still needed.'),target));
  assert.equal(revised.status,200,JSON.stringify(revised.data));
  const current=(await c.context('journey',ref.id)).data.record;
  assert.equal(current.rev,original.rev+1);
  assert.deepEqual(current.projectComposition,original.projectComposition,'a manuscript revision retains the existing Project arrangement');
  assert.ok(current.learningShape.stages.every(s=>!('checkpoint'in s)));
  assert.equal(current.learningShape.stages[1].id,original.learningShape.stages[1].id);
  const retained=(await c.context('journey',ref.id,original.rendition)).data.record;
  assert.match(retained.sections.at(-1).parts.at(-1).text,/cannot establish that\.$/);
  assert.match(current.sections.at(-1).parts.at(-1).text,/still needed\.$/);
  const extended=await c.request('/api/manuscripts/publish',manuscript('freeform-add-heading',source.replace('The code alone cannot establish that.','The code alone cannot establish that. An isolated resolver trace is still needed.')+'\n\n## A different possible explanation\n\nAn operating-system cache and a recursive resolver cache could be confused.',{family:'journey',id:ref.id,rev:current.rev}));
  assert.equal(extended.status,200,JSON.stringify(extended.data));
  const afterAddition=(await c.context('journey',ref.id)).data.record;
  assert.equal(afterAddition.projectComposition.sections.length,original.projectComposition.sections.length+1);
  assert.equal(afterAddition.projectComposition.sections.at(-1).title,'A different possible explanation');
  assert.deepEqual(afterAddition.projectComposition.sections.slice(0,-1),original.projectComposition.sections,'adding a new heading must not rewrite an existing arrangement');
  assert.equal(afterAddition.learningShape.stages.some(s=>'checkpoint'in s),false);
  const renamedSource=source.replace('## What remains unresolved','## Remaining uncertainties').replace('The code alone cannot establish that.','The code alone cannot establish that. An isolated resolver trace is still needed.')+'\n\n## A different possible explanation\n\nAn operating-system cache and a recursive resolver cache could be confused.';
  const renamed=await c.request('/api/manuscripts/publish',manuscript('freeform-rename-heading',renamedSource,{family:'journey',id:ref.id,rev:afterAddition.rev}));
  assert.equal(renamed.status,200,JSON.stringify(renamed.data));
  const afterRename=(await c.context('journey',ref.id)).data.record;
  assert.equal(afterRename.projectComposition.sections.find(s=>s.id==='layout-'+afterAddition.sections.at(-2).id)?.title,'Remaining uncertainties');
 }finally{await f.dispose();}
});
