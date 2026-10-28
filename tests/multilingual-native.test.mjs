import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'export * from "./lib/foundry/language.ts";export * from "./lib/semantic-content.ts";export * from "./lib/foundry/language-fixtures.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const sdk=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const built=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {semanticReadingAdapter} from './app/semantic-reading.tsx';export function render(language){const part={id:'source',kind:'paragraph',text:language.text,semantic:{contract:'minamo.semantic.v1',kind:'ruby',language}};return renderToStaticMarkup(semanticReadingAdapter({part,sectionId:'source',article:{},common:{'data-reading-part':part.id,'data-section-id':'source'},renderRange:(start,end)=>part.text.slice(start,end)}));}`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,loader:{'.css':'empty'},packages:'external',platform:'node',format:'esm',write:false});
mkdirSync('.sites-runtime',{recursive:true});const path=process.cwd()+'/.sites-runtime/multilingual-native-'+process.pid+'.mjs';writeFileSync(path,built.outputFiles[0].text);const ui=await import(pathToFileURL(path).href);rmSync(path);

test('seven languages and Simplified/Traditional variants roundtrip native declarations without source normalization',()=>{
 assert.deepEqual(Object.keys(sdk.sevenLanguageFixtures),['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']);
 for(const [tag,source] of Object.entries(sdk.sevenLanguageFixtures)){
  const admitted=sdk.admitLanguageText(source);assert.equal(admitted.language,tag);assert.equal(admitted.text,source.text);
  assert.deepEqual(sdk.parseLanguageManuscriptBlock(sdk.languageManuscriptBlock(source)),source);
  const semantic=sdk.admitSemanticContent({contract:'minamo.semantic.v1',kind:'ruby',language:source},source.text);assert.equal(sdk.semanticCanonicalText(semantic),source.text);
  assert.ok(sdk.semanticSearchText(semantic).includes(source.translation.text));
  const html=ui.render(source);assert.ok(html.includes(`lang="${tag}"`));assert.match(html,/Show translation/);assert.match(html,/Authored translation/);
  const base=[...html.matchAll(/data-canonical-start="(\d+)" data-canonical-end="(\d+)">([^<]*)<\/span>/g)].map(m=>m[3]).join('');assert.equal(base,source.text);
  if(!source.spans.length){assert.doesNotMatch(html,/<ruby>|Hide pronunciations/);assert.match(html,/Pronunciation guidance/);assert.match(html,/Grammar:/);}
 }
});
test('contextual Mandarin phrases retain tone marks, neutral syllables, polyphony and script identities',()=>{
 const hans=sdk.mandarinContextualFixture,hant=sdk.mandarinTraditionalFixture;
 assert.equal(hans.spans[0].reading,'māma');assert.equal(hans.spans[1].reading,'yínháng');assert.match(hans.spans[1].grammar,/xíng/);
 assert.equal(hans.text,'妈妈在银行工作。');assert.equal(hant.text,'媽媽在銀行工作。');assert.equal(hant.language,'zh-Hant');
 assert.deepEqual(hant.spans.map(x=>x.base),['媽媽','銀行','工作']);
 const corrected=sdk.correctLanguageReading(hans,3,'yínháng','yínháng','Contextual review');assert.notEqual(corrected,hans);assert.equal(corrected.spans[1].source,'Contextual review');assert.throws(()=>sdk.correctLanguageReading(hans,3,'xíng','háng','stale'));
});
test('proposed readings are plainly provisional and safely escaped; no source coordinates on metadata',()=>{
 const source={...sdk.japaneseLanguageFixture,spans:[{...sdk.japaneseLanguageFixture.spans[0],origin:'machine-proposed',source:'Supplied test model <script>',reading:'こんにち'}]};
 const html=ui.render(source);assert.match(html,/Provisional pronunciation proposals/);assert.match(html,/Provisional machine proposal/);assert.match(html,/Supplied test model &lt;script&gt;/);assert.doesNotMatch(html,/<script/);
 assert.doesNotMatch(html,/<(?:rt|dd|dt)[^>]*data-reading-part/);
});
test('combining accents, kana voicing, astral characters and joiners cannot be split by annotations',()=>{
 for(const [text,offset] of [['e\u0301',1],['か\u3099',1],['🙂',1],['👩‍💻',2],['👩‍💻',3],['👍🏽',2]])assert.equal(sdk.languageBoundary(text,offset),false,`${text} at ${offset}`);
 for(const text of ['e\u0301','か\u3099','🙂','👩‍💻','👍🏽'])assert.deepEqual(sdk.languageQuote({version:1,text,language:'ja',direction:'ltr',spans:[]},0,text.length),{start:0,end:text.length,quote:text});
 assert.throws(()=>sdk.admitLanguageText({version:1,text:'e\u0301',language:'fr',direction:'ltr',spans:[{start:0,end:1,base:'e',reading:'e',origin:'author-verified'}]}));
 assert.throws(()=>sdk.admitLanguageText({version:1,text:'\ud83d',language:'ja',direction:'ltr',spans:[]}));
});
test('translation/grammar schemas reject invented fields, invalid tags and unbounded prose without changing originals',()=>{
 const j=sdk.sevenLanguageFixtures.ja;
 for(const patch of [{sourceScript:'Japanese'},{grammar:'x'.repeat(1201)},{translation:{...j.translation,provenance:'machine-certified'}},{translation:{...j.translation,language:'en-invalid-invalid'}},{translation:{...j.translation,html:'<script>'}}])assert.throws(()=>sdk.admitLanguageText({...j,...patch}));
 const admitted=sdk.admitLanguageText(j);admitted.translation.text='Changed';assert.equal(j.translation.text,'I study Japanese today.');
});

test('original seven-language manuscript compiles to canonical source and matching typed semantic schema',async()=>{
 const output=await build({entryPoints:['lib/manuscript.ts'],bundle:true,platform:'node',format:'esm',write:false});const m=await import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
 const markdown='# TEST ONLY seven-language teaching\n\n## Original study passages\n\n'+Object.values(sdk.sevenLanguageFixtures).map(source=>sdk.languageManuscriptBlock(source)).join('\n\n');
 const result=await m.compileManuscript({purpose:'Compile original synthetic seven-language resources without recording learning progress.',operationId:'multilingual-compile-test',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Original multilingual fixtures with exact source characters and separate authored translations.',documents:[{key:'multilingual',role:'article',markdown}]}});
 const parts=result.pkg.records[0].data.sections.flatMap(section=>section.parts).filter(part=>part.semantic);
 assert.equal(parts.length,8);assert.deepEqual(parts.map(part=>part.text),Object.values(sdk.sevenLanguageFixtures).map(source=>source.text));assert.equal(result.warnings.some(w=>w.code==='semantic_fallback'),false);
 const native=sdk.semanticContentJsonSchema.oneOf.find(x=>x.properties.kind.const==='ruby').properties.language;
 for(const key of ['sourceScript','grammar','pronunciation','translation'])assert.ok(native.properties[key]);assert.equal(native.properties.translation.additionalProperties,false);
});
test('real isolated D1/MCP persists all language metadata and exact marks, retains corrections, restores Trash and adds no checkpoint',async()=>{
 const {privateStorageFixture}=await import('./private-storage-fixture.mjs');
 const fixture=await privateStorageFixture('import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}');
 const client=fixture.client('synthetic-seven-language-owner'),other=fixture.client('synthetic-seven-language-other');
 const ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
 try{
  const sections=Object.entries(sdk.sevenLanguageFixtures).map(([tag,language])=>({id:tag,title:tag,parts:[{id:'source-'+tag,kind:'paragraph',semantic:{contract:'minamo.semantic.v1',kind:'ruby',language}}]}));
  const original=ok(await client.command({action:'create',family:'article',id:'synthetic-seven-languages',data:{title:'TEST ONLY native seven-language reading',body:'Original author-run acceptance fixture. No learner activity is claimed.',synthetic:true,sections}})).record;
  const request=ok(await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'read_minamo_record',arguments:{purpose:'Inspect original synthetic multilingual metadata with exact persisted identity.',family:'article',id:original.id}}}));assert.notEqual(request.result.isError,true,JSON.stringify(request));const read=JSON.parse(request.result.content[0].text).record;
  assert.deepEqual(read.sections,original.sections);assert.equal(read.rendition,original.rendition);
  for(const section of read.sections){const part=section.parts[0],language=part.semantic.language;assert.equal(part.text,language.text);const first=language.spans[0];const range=first?{start:first.start,end:first.end,quote:first.base}:{start:0,end:part.text.length,quote:part.text};
   const annotation=ok(await client.command({action:'create',family:'annotation',id:'synthetic-language-mark-'+section.id,data:{title:'TEST ONLY '+section.id+' exact passage',body:'Illustrative observation, not a learner checkpoint.',synthetic:true,anchor:{recordFamily:'article',articleId:original.id,rendition:original.rendition,sectionId:section.id,partId:part.id,...range}}})).record;assert.equal(annotation.anchor.quote,range.quote);
  }
  const next=structuredClone(original.sections);next[0].parts[0].semantic.language.translation.text='Today I study Japanese.';
  const updated=ok(await client.command({action:'update',family:'article',id:original.id,expectedRev:original.rev,data:{sections:next}})).record;assert.notEqual(updated.rendition,original.rendition);assert.equal(updated.sections[0].parts[0].text,original.sections[0].parts[0].text);assert.equal(ok(await client.context('article',original.id,original.rendition)).record.sections[0].parts[0].semantic.language.translation.text,'I study Japanese today.');
  assert.equal((await client.command({action:'update',family:'article',id:original.id,expectedRev:original.rev,data:{sections:next}})).status,409);assert.equal((await other.context('article',original.id)).status,404);
  const trashed=ok(await client.command({action:'trash',family:'article',id:updated.id,expectedRev:updated.rev})).record;assert.equal((await client.context('article',updated.id)).status,404);
  const restored=ok(await client.command({action:'restore',family:'article',id:updated.id,expectedRev:trashed.rev})).record;assert.equal(restored.sections[0].parts[0].text,original.sections[0].parts[0].text);
  const checkpoints=await fixture.db.prepare('SELECT COUNT(*) count FROM v2_learning_developments WHERE owner=?').bind(client.owner).first();assert.equal(checkpoints.count,0);
 }finally{await fixture.mf.dispose();}
});
test('JSON array/string coercions cannot forge scalar language direction or provenance',()=>{
 const j=sdk.sevenLanguageFixtures.ja;
 for(const patch of [{direction:['ltr']},{spans:[{...j.spans[0],origin:['author-verified']}]},{translation:{...j.translation,direction:['ltr']}},{translation:{...j.translation,provenance:['authored-translation']}}])assert.throws(()=>sdk.admitLanguageText({...j,...patch}));
 assert.throws(()=>sdk.admitParallelPassage({...sdk.parallelLanguageFixture,translation:{...sdk.parallelLanguageFixture.translation,direction:['ltr']}}));
});
test('optional original launch dataset compiles as fifteen scoped connected resources with source-exact examples',async()=>{
 const output=await build({stdin:{contents:'export {compileManuscript} from "./lib/manuscript.ts";export {languageLaunchManuscript} from "./lib/foundry/language-launch-resources.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});const path=process.cwd()+'/.sites-runtime/language-launch-compile-'+process.pid+'.mjs';writeFileSync(path,output.outputFiles[0].text);const m=await import(pathToFileURL(path).href);rmSync(path);
 const input=m.languageLaunchManuscript('legacy@0','original-language-launch-compilation');assert.equal(input.synthetic,undefined);assert.equal(input.manuscript.documents.length,15);const result=await m.compileManuscript(input);assert.equal(result.pkg.records.length,15);assert.equal(result.pkg.records.filter(r=>r.family==='article').length,7);assert.equal(result.pkg.records.filter(r=>r.family==='journey').length,7);assert.equal(result.warnings.some(w=>w.code==='semantic_fallback'),false);assert.ok(result.pkg.records.every(r=>r.data.learningScope.spaces.includes('languages')));assert.equal(result.pkg.records.flatMap(r=>r.data.sections??[]).flatMap(s=>s.parts).filter(p=>p.semantic?.kind==='ruby').length,8);
});
