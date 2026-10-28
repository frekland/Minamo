import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'export {compileManuscript} from "./lib/manuscript.ts";export {validateData} from "./lib/domain.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {compileManuscript,validateData}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const input=markdown=>({purpose:'TEST ONLY independent compiler review',operationId:'independent-review',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'An unchanged synthetic brief for review probes.',documents:[{key:'route',role:'journey',markdown},{key:'reference',role:'article',markdown:'# Reusable explanation\n\nAn original reference independent of this review Journey.'}]}});
test('ordinary bold subsection headings do not duplicate invalid exact styling spans',async()=>{
 for(const heading of ['### **Bold**','### ***Nested***','### `Literal`','### Before **emphasis** after']){
  const compiled=await compileManuscript(input('# Review route\n\n'+heading+'\n\nRead this explanation.'));
  const record=compiled.pkg.records[0];assert.doesNotThrow(()=>validateData(record.data,record.family),heading);
  assert.ok(record.data.sections[0].parts[0].text.length>0);
 }
});
test('Journey references retain exact source stage identity for direct return from Library',async()=>{
 const compiled=await compileManuscript(input('# Review route\n\n## First stage\n\nRead [the mechanism](minamo:reference).\n\n## Second stage\n\nApply [that mechanism](minamo:reference).'));
 const record=compiled.pkg.records[0];assert.doesNotThrow(()=>validateData(record.data,record.family));
 assert.equal(record.data.links.length,2);
 for(const link of record.data.links){const stage=record.data.learningShape.stages.find(stage=>stage.sectionId===link.sourceContext.sectionId);assert.ok(stage);assert.equal(link.sourceContext.stageId,stage.id);}
});

 test('new inline manuscript links use the current verified Minamo origin',async()=>{
 const compiled=await compileManuscript(input('# TEST ONLY current origin\n\n## Read\n\nOpen [the reference](minamo:reference).'));
 const links=compiled.pkg.records.flatMap(r=>(r.data.sections??[]).flatMap(s=>s.parts.flatMap(p=>p.inline??[]))).filter(s=>s.kind==='link');
 assert.ok(links.length);for(const link of links)assert.equal(new URL(link.url).origin,'https://minamo.example');
 });
