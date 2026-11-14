import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {pr12CorpusFixture,corpusRecords} from './pr12-corpus-fixture.mjs';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const compiled=await build({entryPoints:['lib/experience-discovery.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {experienceEntries,findExperienceEntries,experiencePart}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
test('real snapshot hashes and nested payloads remain intact',()=>{
 const manifest=JSON.parse(readFileSync('tests/corpus/pr12/manifest.json'));
 for(const source of manifest.sources)assert.equal(createHash('sha256').update(readFileSync('tests/corpus/pr12/'+source.file)).digest('hex'),source.sha256);
 const records=corpusRecords(),entries=experienceEntries(records);
 assert.equal(entries.filter(e=>e.kind==='card').length,127);assert.equal(entries.filter(e=>e.kind==='turn').length,40);
 assert.equal(entries.filter(e=>!e.subItem).length,138);
 assert.ok(findExperienceEntries(entries,'coffee').some(e=>e.kind==='card'));
 for(const e of entries)assert.ok(experiencePart(records.find(r=>r.id===e.ref.id),e.ref));
 const first=entries[0];assert.equal(experiencePart({...records[0],rendition:'changed'},first.ref),null);
 assert.equal(experienceEntries([{...records[0],trashedAt:'2026-11-14'}]).length,0);
 assert.equal(experienceEntries([{...records[0],synthetic:true}]).length,0);
});
test('same corpus replays through actual D1/R2 domain reads; other owner and deleted sources fenced',async()=>{
 const fixture=await pr12CorpusFixture();try{
 for(const original of corpusRecords()){
  const result=await fixture.reader.context(original.family,original.id,original.rendition);assert.equal(result.status,200);assert.deepEqual(result.data.record.sections,original.sections);assert.equal(result.data.record.rendition,original.rendition);
  assert.equal((await fixture.client('TEST-ONLY-other-owner').context(original.family,original.id,original.rendition)).status,404);
  await fixture.db.prepare('UPDATE v2_records SET trashed_at=? WHERE owner=? AND family=? AND id=?').bind('2026-11-14',fixture.owner,original.family,original.id).run();
  assert.equal((await fixture.reader.context(original.family,original.id,original.rendition)).status,404);
 }
 }finally{await fixture.dispose()}
});
test('existing work supports independent rich capture without a Project; arrangements are refs, not ownership',async()=>{
 const fixture=await pr12CorpusFixture();try{
 const part=corpusRecords()[1].sections.flatMap(s=>s.parts).find(p=>p.interactive?.type==='flashcards');
 const created=await fixture.reader.command({action:'create',family:'work',id:'TEST-ONLY-independent-capture',data:{title:'TEST ONLY independent capture',body:'Local architecture rehearsal. Source snapshot, not a transcript reconstruction.',sections:[{id:'capture',title:'Ordered retained excerpt',parts:[part]}]}});
 assert.equal(created.status,200,JSON.stringify(created.data));
 const read=await fixture.reader.context('work','TEST-ONLY-independent-capture');assert.equal(read.status,200);assert.deepEqual(read.data.record.sections[0].parts,[part]);
 assert.equal(read.data.record.links.length,0);
 const pinned={family:'work',id:'TEST-ONLY-independent-capture',rendition:read.data.record.rendition,sectionId:'capture',partId:part.id};
 assert.ok(experiencePart(read.data.record,pinned));
 const arrangements=[{id:'TEST-ONLY-reading',refs:[pinned]},{id:'TEST-ONLY-speaking',refs:[pinned]}];assert.deepEqual(arrangements[0].refs,arrangements[1].refs);
 const original=corpusRecords()[1];await fixture.db.prepare('UPDATE v2_records SET trashed_at=? WHERE owner=? AND family=? AND id=?').bind('2026-11-14',fixture.owner,original.family,original.id).run();
 assert.equal((await fixture.reader.context('work',pinned.id,pinned.rendition)).status,200);
 }finally{await fixture.dispose()}
});
