import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const bundle=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";import {educationalFixture} from "./lib/educational-fixture.ts";export default {async fetch(request,env){if(new URL(request.url).pathname==="/fixture")return Response.json(await educationalFixture());return domainHandler(request,env);}}',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('substantial cross-project fixture passes actual shared policy/canonical preview, saves atomically, and preserves distinct reference roles',async()=>{
 const mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB']});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(name=>name.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'educational-fixture-owner','oai-authenticated-user-email':'educational-fixture@example.invalid','Content-Type':'application/json'};
  const request=(path,body)=>mf.dispatchFetch('https://fixture.test'+path,{headers,method:body===undefined?'GET':'POST',...(body===undefined?{}:{body:JSON.stringify(body)})});
  const records=await(await request('/fixture')).json();assert.equal(records.length,9);
  const roles={journey:'route',article:'canonical-reference',investigation:'open-question',area:'subject-area'};
  const pkg={operationId:'fixture-educational-package',expectedGeneration:'legacy@0',detail:true,records:records.map(record=>{const {id,family,title,body,sections,concepts,learningShape,links}=record;return{key:id,id,family,action:'create',expectedRev:0,data:{title,body,...(sections?{sections}:{}),...(concepts?{concepts}:{}),learningShape,links,synthetic:true}}}),editorial:{policyVersion:'minamo-editorial-2026-10-27.1',requestPurpose:'SYNTHETIC TEST ONLY — inspect a navigable project route and reusable technical reference without recording learner results.',coverage:{examined:[]},sourcePlan:'link-only-references',decisions:records.map(record=>({recordKey:record.id,role:roles[record.family],action:record.family==='investigation'?'suggest-investigation':'create-distinct',whyNotDuplicate:record.family==='article'?'Explains a reusable mechanism independently of project stages; this isolated synthetic namespace has no preceding reference content.':'Distinct route, optional open inquiry or cross-project subject organisation rather than another stage-shaped article.',distinctEducationalValue:record.body}))}};
  const preview=await request('/api/authoring/preview',pkg),p=await preview.json();assert.equal(preview.status,200,JSON.stringify(p));assert.equal(p.valid,true,JSON.stringify(p.findings));assert.equal(p.proposedRecords.length,9);
  assert.equal((await db.prepare('SELECT count(*) AS n FROM v2_records').first()).n,0);
  const saved=await request('/api/authoring/apply',pkg),receipt=await saved.json();assert.equal(saved.status,200,JSON.stringify(receipt));assert.equal(receipt.recordRefs.length,9);
  const sudoku=p.proposedRecords.find(record=>record.id==='edu-sudoku'),rpg=p.proposedRecords.find(record=>record.id==='edu-rpg');assert.ok(sudoku.links.some(link=>link.id==='edu-lists'));assert.ok(rpg.links.some(link=>link.id==='edu-lists'));
  assert.ok(sudoku.links.filter(link=>link.id==='edu-tkinter').length>1,'distinct stage contexts to the same reference remain represented');
  const list=p.proposedRecords.find(record=>record.id==='edu-lists');assert.ok(list.concepts.some(concept=>concept.term==='list.copy()'));assert.ok(list.sections.flatMap(section=>section.parts).some(part=>part.diagram?.nodes?.some(node=>node.id==='row')));
  for(const investigation of p.proposedRecords.filter(record=>record.family==='investigation')){assert.equal(investigation.learningShape.mode,'suggested');assert.equal(investigation.learningShape.provenance,'gpt-prompt');assert.equal(investigation.output,undefined);assert.equal(investigation.evidence,undefined);}
  const replay=await(await request('/api/authoring/apply',pkg)).json();assert.equal(replay.replayed,true);assert.equal((await db.prepare('SELECT count(*) AS n FROM v2_records').first()).n,9);
 }finally{await mf.dispose();}
});
