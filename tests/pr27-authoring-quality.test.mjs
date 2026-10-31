import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {benchmarkDocuments,benchmarkRequest,conciseArticle,wrongArticle,parseCode} from './fixtures/pr27/authoring-benchmark.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:"import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Reader from './app/reader.tsx';export {compileManuscript} from './lib/manuscript.ts';export const render=article=>renderToStaticMarkup(React.createElement(Reader,{article,records:[],draftScope:'TEST-ONLY-render',onCommand:()=>Promise.reject(Error('Render only')),onNavigate:()=>{}}));",resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},write:false});
const bundleDir=mkdtempSync(join(tmpdir(),'pr27-authoring-render-'));let imported;
try{const bundlePath=join(bundleDir,'reader.cjs');writeFileSync(bundlePath,compiled.outputFiles[0].text);imported=require(bundlePath);}finally{rmSync(bundleDir,{recursive:true,force:true});}

test('original examples verify boundary reasoning rather than treating publication as learner execution',async()=>{
 const cliDir=mkdtempSync(join(tmpdir(),'pr27-cli-example-'));
 try{const file=join(cliDir,'count.mjs');writeFileSync(file,parseCode);assert.equal(execFileSync(process.execPath,['count.mjs'],{cwd:cliDir,encoding:'utf8',timeout:2000}).trim(),'3');}finally{rmSync(cliDir,{recursive:true,force:true});}
 const logs=[];const readCount=new Function('console',parseCode+'\nreturn readCount;')({log:value=>logs.push(value)});
 assert.deepEqual(logs,[3]);assert.equal(readCount('{"count":0}'),0);
 for(const value of ['null','[]','{"count":"3"}','{"count":-1}','{"count":1.5}','{}'])assert.throws(()=>readCount(value));
 assert.throws(()=>readCount('{count:3}'),SyntaxError);
 const loadCount=async(url,fetcher)=>{const response=await fetcher(url);if(!response.ok)throw new Error('HTTP '+response.status);return readCount(await response.text());};
 assert.equal(await loadCount('/fixture',async()=>new Response('{"count":3}',{status:200})),3);
 await assert.rejects(loadCount('/fixture',async()=>new Response('{"count":3}',{status:404})),/HTTP 404/);
 await assert.rejects(loadCount('/fixture',async()=>new Response('not JSON',{status:200})),SyntaxError);
 await assert.rejects(loadCount('/fixture',async()=>new Response('{"count":-1}',{status:200})),/non-negative integer/);
 assert.deepEqual([2,10,1].sort(),[1,10,2]);assert.deepEqual([2,10,1].sort((a,b)=>a-b),[1,2,10]);
});

test('ordinary requests create rich reusable resources, deepen current content and retain personal exact evidence',async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('TEST-ONLY-PR27-authoring');let serial=0;const trace=[];
  const call=async(name,args)=>{const start=performance.now();const response=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY PR27 future authoring benchmark',...args}}});assert.equal(response.status,200);const body=JSON.parse(response.data.result.content[0].text);trace.push({name,requestBytes:Buffer.byteLength(JSON.stringify(args)),responseBytes:Buffer.byteLength(JSON.stringify(body)),localMs:Math.round(performance.now()-start)});return body;};
  const read=async(ref,extra={})=>(await call('read_minamo_record',{family:ref.family,id:ref.id,...extra})).record;
  const all=benchmarkDocuments();
  const initial=all.filter(d=>d.key!=='http').map(d=>d.key==='area'?{...d,markdown:d.markdown.split('\n\n## Inspect a response')[0]}:d.key==='question'?{...d,markdown:d.markdown.replace(' and [the HTTP distinction](minamo:http)','')}:d);
  const created=await call('publish_minamo_manuscript',benchmarkRequest('pr27-cli-create',initial));assert.equal(created.status,'committed',JSON.stringify(created));assert.equal(serial,1,'one direct publication, no mandatory preview or guidance read');
  const refs=Object.fromEntries(created.recordRefs.map(r=>[r.key,r]));let article=await read(refs.data);const area=await read(refs.area);
  assert.equal(created.recordRefs.length,4);assert.equal(article.learningShape.reusableBeyondProject,true);assert.ok(article.sections.some(s=>s.parts.some(p=>p.kind==='diagram'&&p.diagram.edges.length===4)));assert.ok(article.sections.some(s=>s.parts.some(p=>p.kind==='table')));assert.ok(area.links.some(l=>l.sourceContext?.sectionId&&l.id===article.id));assert.ok(article.links.some(l=>!l.sourceContext&&l.id===area.id));
  const lookup=await call('query_minamo_library',{facet:'references',kind:'api',query:'JSON.parse',includeSynthetic:true});assert.ok(JSON.stringify(lookup).includes(article.id));
  const http={...all.find(d=>d.key==='http')};http.markdown=http.markdown.replace('(minamo:data)','(minamo:article:'+article.id+')');http.catalogue={...http.catalogue,areas:[{ref:'area:'+area.id,reason:'HTTP and application boundary failures.'}]};
  const diagnostic=await call('publish_minamo_manuscript',benchmarkRequest('pr27-http-diagnostic',[http],[{family:'article',id:article.id,rev:article.rev,purpose:'reuse'},{family:'area',id:area.id,rev:area.rev,purpose:'reuse'}]));assert.equal(diagnostic.status,'committed',JSON.stringify(diagnostic));
  const short=await call('publish_minamo_manuscript',benchmarkRequest('pr27-short-definition',[{key:'concise',role:'article',markdown:conciseArticle}]));assert.equal(short.status,'committed',JSON.stringify(short));assert.ok(!short.warnings.some(w=>w.code==='reference_without_explanation'||w.code==='code_without_explanation'));
  const second=await call('publish_minamo_manuscript',benchmarkRequest('pr27-cross-project-reuse',[{key:'settings',role:'journey',markdown:'# TEST ONLY — Read saved UI settings\n\n## Inspect a saved value\n\nIntent: Reuse data-boundary reasoning in a different project.\n\nOutcome: Distinguish parse success from a useful settings contract.\n\nCheckpoint: Save changed reasoning only on explicit request.\n\nRead [the existing JSON explanation](minamo:article:'+article.id+'). Propose a small settings object and explain the shape your program needs before reading a real file.'}],[{family:'article',id:article.id,rev:article.rev,purpose:'reuse'}]));assert.equal(second.status,'committed',JSON.stringify(second));assert.equal((await read(refs.data)).rev,article.rev);
  const section=article.sections[0],part=section.parts[0],anchor={articleId:article.id,recordFamily:'article',rendition:article.rendition,sectionId:section.id,partId:part.id,start:0,end:part.text.length,quote:part.text};
  const flag=await c.command({operationId:'pr27-authoring-flag',action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0});assert.equal(flag.status,200,JSON.stringify(flag.data));
  const annotation=await c.command({operationId:'pr27-authoring-annotation',action:'create',family:'annotation',id:'TEST-ONLY-PR27-annotation',data:{title:'TEST ONLY parser boundary thought',body:'I need to inspect grammar separately from shape.',synthetic:true,anchor}});assert.equal(annotation.status,200,JSON.stringify(annotation.data));
  const note=await c.command({operationId:'pr27-authoring-note',action:'create',family:'note',id:'TEST-ONLY-PR27-note',data:{title:'TEST ONLY prediction',body:'A string count may parse but fail the numeric contract. This is a synthetic prediction, not supplied execution.',synthetic:true,links:[{family:'article',id:article.id}]}});assert.equal(note.status,200,JSON.stringify(note.data));
  const catalogue=await c.command({operationId:'pr27-authoring-catalogue',action:'update',family:'article',id:article.id,expectedRev:article.rev,data:{catalogue:{expectedRev:article.catalogueRev,summary:'A concise, independently edited catalogue summary.'}}});assert.equal(catalogue.status,200,JSON.stringify(catalogue.data));assert.equal((await read(refs.data)).rendition,article.rendition,'catalogue-only changes leave canonical identity unchanged');
  const replacement=part.text+' This example checks the represented JavaScript number. If the application needs exact large counts, inspect the safe-integer range and choose a stronger numeric contract instead of assuming parse success preserves every numeric value exactly.';
  const correction=await call('apply_minamo_command',{command:{operationId:'pr27-targeted-correction',expectedGeneration:'legacy@0',action:'update',family:'article',id:article.id,expectedRev:article.rev,data:{patch:[{op:'patchBlock',sectionId:section.id,partId:part.id,changes:{text:replacement}}]}}});assert.equal(correction.status,'committed',JSON.stringify(correction));
  const current=await read(refs.data);assert.equal(current.rev,article.rev+1);assert.equal(current.sections[0].parts[0].id,part.id);assert.equal(current.sections[0].parts[0].text,replacement);assert.equal(current.sections.flatMap(s=>s.parts).filter(p=>p.kind==='code').length,1);assert.equal(current.catalogue.edition.summary.text,'A concise, independently edited catalogue summary.');
  const retained=await read(refs.data,{rendition:article.rendition});assert.equal(retained.sections[0].parts[0].text,part.text);
  assert.equal((await c.context('annotation','TEST-ONLY-PR27-annotation')).data.record.anchor.rendition,article.rendition);assert.equal((await c.context('note','TEST-ONLY-PR27-note')).data.record.rev,1);
  const archive=await call('read_minamo_manuscript_source',{operationId:'pr27-cli-create'});assert.equal(archive.recordRefs.find(r=>r.key==='data').stillCurrent,false);assert.ok(archive.manuscript.documents.find(d=>d.key==='data').markdown.includes('JSON is a text format'),'source is immutable, not the latest canonical editing base');
  const actualCounts=await f.db.prepare("SELECT count(*) n FROM v2_records WHERE owner=? AND family='article'").bind(c.owner).first();assert.equal(actualCounts.n,3,'second project reuses, rather than duplicating, the useful existing resource');
  const before=await f.db.prepare('SELECT count(*) n FROM v2_records WHERE owner=?').bind(c.owner).first();
  const wrong=await call('preview_minamo_manuscript',benchmarkRequest('pr27-deliberately-wrong',[{key:'wrong',role:'article',markdown:wrongArticle}]));assert.equal(wrong.valid,true,'a structurally plausible false statement is not semantically certified');assert.deepEqual(await f.db.prepare('SELECT count(*) n FROM v2_records WHERE owner=?').bind(c.owner).first(),before,'deliberately wrong educational material remains preview-only');
  const candidate=await call('preview_minamo_manuscript',benchmarkRequest('pr27-candidate-scope',[{key:'match',role:'article',title:article.title,markdown:'# '+article.title+'\n\nInspect candidates before deciding whether to duplicate an explanation.'}]));
  assert.equal(candidate.coverageCandidates[0].scope,'title-derived-literal-query');assert.ok(candidate.coverageCandidates[0].records.some(r=>r.id===current.id&&r.summary&&r.summaryOrigin==='canonical-excerpt'));
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments WHERE owner=?').bind(c.owner).first()).n,0,'publication, reading and optional questions create no learner continuity');
  console.log('PR27 authoring benchmark trace',JSON.stringify({syntheticLocal:true,cases:['CLI creation','HTTP diagnostic','concise definition','cross-project reuse','targeted clarification after personal captures/catalogue','polished wrong preview-only'],trace}));
 }finally{await f.dispose();}
});

test('representative rich content renders as code, diagram, table and optional reasoning without a new interaction schema',async()=>{
 const compiled=await imported.compileManuscript(benchmarkRequest('pr27-render-rich',benchmarkDocuments()));
 const data=compiled.pkg.records.find(r=>r.key==='data').data;
 const article={...data,id:'TEST-ONLY-render',family:'article',rev:1,rendition:'TEST-ONLY-render-edition',actor:'gpt',createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z'};
 const html=imported.render(article);
 assert.ok(html.includes('Predict before inspecting'));assert.ok(html.includes('Vary one condition'));assert.ok(html.includes('<table'));assert.ok(html.includes('Follow the boundaries'));assert.ok(html.includes('Copy code'));assert.ok(html.includes('Enlarge diagram'));assert.ok(!html.includes('type="radio"'),'authored reasoning does not add compulsory quiz controls');
});
