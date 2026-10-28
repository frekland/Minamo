import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/library-return.ts';",resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const module={exports:{}};new Function('module','exports',built.outputFiles[0].text)(module,module.exports);const ui=module.exports;
const subject=new URLSearchParams({learningSpace:'languages',language:'ja',view:'library',family:'area',id:'subject-japanese',returnJourney:'project-nihongo',returnStage:'step-grammar'});
const browse={areaId:'subject-japanese',areaTitle:'UNTRUSTED HISTORY TITLE',facet:'references',query:'particles',kind:'language-syntax',sort:'authored'};

test('opening material from a Subject captures that Subject and active query rather than its inherited Library-root return',()=>{
 subject.set('returnLibrary','learningSpace=languages&view=library');
 const query=ui.libraryReturnFromCatalogue(subject,browse),target=ui.parseLibraryReturn(query),p=new URLSearchParams(target.query);
 assert.equal(target.subjectId,'subject-japanese');assert.equal(p.get('libraryFacet'),'references');assert.equal(p.get('libraryQuery'),'particles');assert.equal(p.get('libraryKind'),'language-syntax');assert.equal(p.get('librarySort'),'authored');assert.equal(p.get('returnJourney'),'project-nihongo');assert.equal(p.get('returnStage'),'step-grammar');assert.doesNotMatch(query,/UNTRUSTED|returnLibrary/);
 assert.deepEqual(ui.parseLibraryReturn(target.href),target,'a reload/new tab needs no history object');
});

test('legacy learningSpace-first query order is accepted and safely canonicalised',()=>{
 const target=ui.parseLibraryReturn('learningSpace=languages&view=library&family=area&id=subject-japanese&language=ja');assert.equal(target.subjectId,'subject-japanese');assert.equal(target.selection.language,'ja');assert.match(target.query,/^view=library/);
 assert.equal(ui.parseLibraryReturn('view=library&libraryQuery=https://example.test/docs').query,'view=library&libraryQuery=https%3A%2F%2Fexample.test%2Fdocs');
});

test('unsafe redirects, Article loops, nested returns, malformed coordinates and title injection are rejected',()=>{
 for(const value of ['https://evil.test/?view=library','//evil.test/?view=library','/elsewhere?view=library','view=library&family=article&id=article-one','view=library&id=orphan','view=library&family=source&id=source-one','view=library&returnLibrary=view%3Dlibrary','view=library&view=library','view=library&family=area&id=../private','view=library&libraryQuery=%E0%A4','view=library&libraryQuery=%ZZ','view=library&areaTitle=PRIVATE_FAKE_TITLE','view=library&returnStage=step-without-project','view=library&librarySort=unsafe','view=library&language=ja&learningSpace=computing','view=library#outside'])assert.equal(ui.parseLibraryReturn(value),null,value);
 assert.equal(ui.parseLibraryReturn('view=library&libraryQuery='+encodeURIComponent('x'.repeat(201))),null);
 const material=new URLSearchParams({view:'library',family:'article',id:'one'});assert.equal(ui.libraryReturnFromCatalogue(material),null);assert.equal(ui.libraryReturnFromCatalogue(new URLSearchParams({view:'library',family:'area',id:'area',rendition:'exact'})),null,'a full Subject introduction is material, not its catalogue');
});

test('native material href retains exact rendition and selection while adding safe Subject and actual Project/Step return context',()=>{
 const query=ui.libraryReturnFromCatalogue(subject,browse),href='/?view=library&family=article&id=syntax&r=u-precise&rendition=edition-one&section=s-one&part=p-one&start=2&end=7#passage',result=ui.withLibraryReturn(href,query),p=new URL(result,'https://minamo.test').searchParams;
 for(const [key,value] of new URL(href,'https://minamo.test').searchParams)assert.equal(p.get(key),value,key);
 assert.equal(p.get('returnJourney'),'project-nihongo');assert.equal(p.get('returnStage'),'step-grammar');assert.equal(ui.parseLibraryReturn(p.get('returnLibrary')).subjectId,'subject-japanese');assert.match(result,/#passage$/);
 const own=ui.withLibraryReturn('/?view=library&family=article&id=syntax&returnJourney=other-project',query),op=new URL(own,'https://minamo.test').searchParams;assert.equal(op.get('returnJourney'),'other-project');assert.equal(op.get('returnStage'),null,'never mix a source Step with another explicit Project');
 assert.equal(ui.withLibraryReturn('https://evil.test/article',query),'https://evil.test/article');
});

test('Subject breadcrumb labels require currently admitted records, not URL/history titles or revoked sources',()=>{
 const target=ui.parseLibraryReturn(ui.libraryReturnFromCatalogue(subject,browse)),record={family:'area',id:'subject-japanese',title:'Japanese grammar',sections:[],links:[]};assert.equal(ui.libraryReturnSubject(target,[record]).title,'Japanese grammar');assert.equal(ui.libraryReturnSubject(target,[]),undefined);assert.equal(ui.libraryReturnSubject(target,[{...record,trashedAt:'now'}]),undefined);assert.equal(ui.libraryReturnSubject(target,[{...record,source:{excerpt:{unavailable:true}}}]),undefined);assert.equal(ui.libraryReturnSubject(target,[{...record,sections:[{id:'s',parts:[{id:'p',unavailable:true}]}]}]),undefined);assert.equal(ui.libraryReturnSubject(target,[{...record,id:'another-subject'}]),undefined);
});
