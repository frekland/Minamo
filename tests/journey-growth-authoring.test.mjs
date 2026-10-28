import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {commonPackage,rustPackage,gamePackage,rustExpansion} from '../examples/journey-growth/learning-packages.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const code=await build({stdin:{contents:'export {journeyLocalStart} from "./lib/journey-authoring.ts";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {journeyLocalStart}=await import('data:text/javascript;base64,'+Buffer.from(code.outputFiles[0].text).toString('base64'));
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;

test('goal-first MCP publication prepares independent anticipatory shelves, exact reuse and complete local starters, then grows without replacing earlier work',async t=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('journey-growth-synthetic-owner');
  const mcp=async(name,args)=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY goal-first lifecycle',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text)};
  const read=async ref=>(await mcp('read_minamo_record',{family:ref.family,id:ref.id})).record;
  const count=async()=>Number((await f.db.prepare('SELECT COUNT(*) n FROM v2_records').first()).n);
  const before=await mcp('query_minamo_library',{query:'Rust',limit:12});assert.equal(before.code,undefined,JSON.stringify(before));assert.equal(before.articles?.length??before.records?.length??before.items?.length??0,0);
  const common=await mcp('publish_minamo_manuscript',commonPackage('growth-reuse-reading'));assert.equal(common.status,'committed',JSON.stringify(common));const reused=common.recordRefs[0];
  const inspected=await read(reused);assert.match(inspected.sections[0].parts[0].text,/prediction/i);
  let rust,game,rustRoute,gameRoute;
  await t.test('initial creation uses one guarded publish per coherent goal, no required preview',async()=>{
   rust=await mcp('publish_minamo_manuscript',rustPackage('growth-rust',reused));assert.equal(rust.status,'committed',JSON.stringify(rust));assert.equal(rust.recordRefs.length,10);
   game=await mcp('publish_minamo_manuscript',gamePackage('growth-game',reused));assert.equal(game.status,'committed',JSON.stringify(game));assert.equal(game.recordRefs.length,8);
   assert.equal((await read(reused)).rev,reused.rev,'reuse is not a rewrite');
   rustRoute=await read(rust.recordRefs.find(r=>r.key==='rust-route'));gameRoute=await read(game.recordRefs.find(r=>r.key==='game-route'));
   for(const [receipt,route,articleCount] of [[rust,rustRoute,6],[game,gameRoute,4]]){
    assert.equal(receipt.recordRefs.filter(r=>r.family==='article').length,articleCount);
    const local=journeyLocalStart(route);assert.equal(local.label,'Start working locally');assert.ok(local.destination.includes('stage='));assert.equal(local.execution,'external-not-verified');
    assert.ok(route.links.some(r=>r.family==='article'&&r.id===reused.id));
    for(const ref of receipt.recordRefs.filter(r=>r.family==='article')){const record=await read(ref);assert.equal(record.learningShape.kind,'library-topic');assert.equal(record.learningShape.reusableBeyondProject,true);assert.ok(record.sections.length>=2);assert.ok(record.links.some(link=>link.family==='area'));}
   }
   const rustStart=rustRoute.sections.find(s=>s.id===journeyLocalStart(rustRoute).sectionId);
   assert.equal(rustStart.parts.find(p=>p.kind==='code'&&p.language==='rust').text,readFileSync('examples/journey-growth/rust-log/src/main.rs','utf8').trimEnd());
   assert.equal(rustStart.parts.find(p=>p.kind==='code'&&p.language==='toml').text,readFileSync('examples/journey-growth/rust-log/Cargo.toml','utf8').trimEnd());
   assert.match(rustStart.parts.map(p=>p.text).join('\n'),/1\.85 or later/);assert.match(rustStart.parts.map(p=>p.text).join('\n'),/unverified/);
   const gameStart=gameRoute.sections.find(s=>s.id===journeyLocalStart(gameRoute).sectionId);
   assert.equal(gameStart.parts.find(p=>p.kind==='code'&&p.language==='html').text,readFileSync('examples/journey-growth/browser-game/index.html','utf8').trimEnd());
   assert.match(gameStart.parts.map(p=>p.text).join('\n'),/Reset, press Right once/);
   console.log('TEST ONLY goal packages',JSON.stringify({rustRecords:rust.recordRefs.length,gameRecords:game.recordRefs.length,rustRequestBytes:Buffer.byteLength(JSON.stringify(rustPackage('growth-rust',reused))),gameRequestBytes:Buffer.byteLength(JSON.stringify(gamePackage('growth-game',reused))),normalPublications:2,mandatoryPreviews:0,reusedArticleRev:reused.rev}));
  });
  await t.test('one later extension links exact prior references and leaves Journey and existing prose intact',async()=>{
   const priorRoute=structuredClone(rustRoute),before=await count();
   const extension=await mcp('publish_minamo_manuscript',rustExpansion('growth-rust-extension',rust.recordRefs));assert.equal(extension.status,'committed',JSON.stringify(extension));assert.equal(await count(),before+2);
   assert.deepEqual(await read({family:'journey',id:rustRoute.id}),priorRoute);
   const article=await read(extension.recordRefs.find(r=>r.family==='article'));assert.match(article.sections[0].parts.map(p=>p.text).join('\n'),/grapheme/);assert.ok(article.links.some(l=>l.id===rust.recordRefs.find(r=>r.key==='rust-streams').id));
   const source=await mcp('read_minamo_manuscript_source',{operationId:'growth-rust'});assert.equal(source.manuscript.documents.find(d=>d.key==='rust-route').markdown,rustPackage('growth-rust',reused).manuscript.documents.find(d=>d.key==='rust-route').markdown);
  });
  await t.test('targeted correction preserves source history, exact record identity and rejects a stale revision',async()=>{
   const ref=rust.recordRefs.find(r=>r.key==='rust-errors'),old=await read(ref),markdown=rustPackage('unused',reused).manuscript.documents.find(d=>d.key==='rust-errors').markdown;
   const corrected=markdown.replace('preserve case sensitivity deliberately.','preserve case sensitivity deliberately. A later case-insensitive policy needs new tests rather than silently changing this contract.');
   const request={purpose:'TEST ONLY targeted wording clarification',operationId:'growth-targeted-correction',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Clarify that case-insensitive parsing is a later explicit policy change, preserving existing structure and references.',documents:[{key:'rust-errors',role:'article',target:{family:'article',id:old.id,rev:old.rev},markdown:corrected}]},existing:[{family:'article',id:old.id,rev:old.rev,purpose:'targeted-update'}]};
   const updated=await mcp('publish_minamo_manuscript',request);assert.equal(updated.status,'committed',JSON.stringify(updated));assert.equal(updated.recordRefs[0].id,old.id);assert.equal(updated.recordRefs[0].rev,old.rev+1);
   const retained=await mcp('read_minamo_record',{family:'article',id:old.id,rendition:old.rendition});assert.deepEqual(retained.record.sections,old.sections);
   const stale=await mcp('publish_minamo_manuscript',{...request,operationId:'growth-stale-correction'});assert.equal(stale.code,'coverage_changed');
   const before=await count(),status=await mcp('read_minamo_operation',{operationId:request.operationId});assert.equal(status.status,'committed');assert.equal((await mcp('publish_minamo_manuscript',request)).replayed,true);assert.equal(await count(),before,'lost response recovery never duplicates');
  });
  await t.test('unsupported fields and brief bounds give actionable paths and leave full submitted content recoverable',async()=>{
   const baseline=await count(),unknown=commonPackage('growth-unknown');unknown.manuscript.documents[0].brief='wrong placement';const unchanged=JSON.stringify(unknown);
   const bad=await mcp('publish_minamo_manuscript',unknown);assert.equal(bad.code,'invalid_manuscript_shape');assert.match(bad.error,/manuscript\.documents\[0\]\.brief/);assert.match(bad.error,/Allowed fields/);assert.equal(JSON.stringify(unknown),unchanged);assert.equal(await count(),baseline);
   const oversized=commonPackage('growth-brief-bound');oversized.manuscript.brief='x'.repeat(24001);const tooLong=await mcp('publish_minamo_manuscript',oversized);assert.equal(tooLong.code,'invalid_text');assert.match(tooLong.error,/brief.*24001.*24000/);assert.equal(oversized.manuscript.brief.length,24001);assert.equal(await count(),baseline);
   const tooMany=commonPackage('growth-document-bound');tooMany.manuscript.documents=Array.from({length:17},(_,i)=>({key:'d'+i,role:'article',markdown:'# Independent test '+i+'\n\nA distinct bounded test source.'}));const tooLarge=await mcp('publish_minamo_manuscript',tooMany);assert.equal(tooLarge.code,'manuscript_document_budget');assert.match(tooLarge.error,/16/);assert.equal(await count(),baseline);
   const operation=await mcp('read_minamo_operation',{operationId:'growth-unknown'});assert.notEqual(operation.status,'committed');
  });
 }finally{await f.dispose()}
});

test('local-start shortcut requires an unambiguous explicit authored stage, not inferred prose or code',()=>{
 const stage={id:'start',sectionId:'s',title:'Start working locally'},record={family:'journey',id:'route',links:[],sections:[{id:'s',parts:[{kind:'paragraph',text:'Use your editor.'}]}],learningShape:{kind:'journey',stages:[stage]}};
 assert.ok(journeyLocalStart(record));assert.equal(journeyLocalStart({...record,learningShape:{kind:'journey',stages:[stage,{...stage,id:'other'}]}}),undefined);assert.equal(journeyLocalStart({...record,learningShape:{kind:'journey',stages:[{...stage,title:'Imagine running code'}]}}),undefined);assert.equal(journeyLocalStart({...record,sections:[{id:'s',parts:[{text:'Hidden',unavailable:true}]}]}),undefined);
});

test('Rust local starter compilation is performed only when a genuine toolchain exists',t=>{
 const version=spawnSync('cargo',['--version'],{encoding:'utf8'});if(version.error){t.skip('Rust/Cargo unavailable: source is complete but remains uncompiled; no Python substitute is counted as Rust evidence.');return;}
 const path=mkdtempSync(join(tmpdir(),'minamo-rust-start-'));try{cpSync('examples/journey-growth/rust-log',path,{recursive:true});const tests=spawnSync('cargo',['test','--offline'],{cwd:path,encoding:'utf8'});assert.equal(tests.status,0,tests.stderr);const run=spawnSync('cargo',['run','--quiet','--offline'],{cwd:path,input:readFileSync(join(path,'sample.log'),'utf8'),encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.equal(run.stdout,'ERROR\t2\nINFO\t1\nWARN\t1\n');assert.match(run.stderr,/rejected\t1/);}finally{rmSync(path,{recursive:true,force:true})}
});
