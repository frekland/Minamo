import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'export * from "./lib/reading-cue-compiler.ts";export {compileManuscript} from "./lib/manuscript.ts"',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {compileReadingCues,ReadingCueError,compileManuscript}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const base={version:1,text:'😀 今日、今日の本を読む。',language:'ja',direction:'ltr'};
test('contextual compiler resolves exact repeated compound/UTF16 identity without modifying source',()=>{
 const input={...base,cues:[{expression:'今日',reading:'きょう',occurrence:2},{expression:'読む',reading:'よむ',before:'本を'}]},saved=JSON.stringify(input);
 const result=compileReadingCues(input);assert.equal(result.language.text,base.text);assert.equal(result.resolved,2);assert.equal(result.language.spans[0].start,6);assert.equal(result.language.spans[0].base,'今日');assert.equal(JSON.stringify(input),saved);
 const selected=compileReadingCues({...base,cues:[{expression:'今日',reading:'きょう',after:'の本'}]});assert.equal(selected.language.spans[0].start,6);
});
test('ambiguity/missing/stale coordinates and overlapping cues are actionable and never guessed',()=>{
 for(const [cue,code] of [[{expression:'今日',reading:'きょう'},'cue_ambiguous'],[{expression:'今日',reading:'きょう',occurrence:3},'cue_missing'],[{expression:'今日',reading:'きょう',occurrence:1,expectedStart:0},'cue_mismatch'],[{expression:'不存在',reading:'x'},'cue_missing']]){
  assert.throws(()=>compileReadingCues({...base,cues:[cue]}),e=>e instanceof ReadingCueError&&e.diagnostics[0].code===code&&e.diagnostics[0].path==='language.cues[0]');
 }
 assert.throws(()=>compileReadingCues({...base,cues:[{expression:'今日',reading:'きょう',occurrence:1},{expression:'今日',reading:'きょう',occurrence:1}]}),e=>e.diagnostics[0].code==='cue_overlap');
});
test('grapheme boundaries, exact canonical Unicode and untrusted shapes survive bounded compilation',()=>{
 for(const input of [{...base,cues:[{expression:'今日',reading:'x',callback:'alert(1)'}]},{...base,cues:Array.from({length:257},()=>({expression:'今日',reading:'x'}))},{...base,cues:[{expression:'今日',reading:'x',origin:'machine-proposed'}]},{...base,text:'e\u0301',cues:[{expression:'e',reading:'x'}]}])assert.throws(()=>compileReadingCues(input));
 const t='e\u0301';assert.equal(compileReadingCues({...base,text:t,cues:[{expression:t,reading:'é'}]}).language.text,t);
 assert.equal(compileReadingCues({...base,text:'银行行走',language:'zh-Hans',cues:[{expression:'银行',reading:'yínháng'},{expression:'行走',reading:'xíngzǒu'}]}).language.spans[1].reading,'xíngzǒu');
 assert.throws(()=>compileReadingCues({...base,text:'日'.repeat(24000),cues:[{expression:'日',reading:'ひ'}]}),e=>e.diagnostics[0].candidateCount===24000&&e.diagnostics[0].candidates.length===4&&JSON.stringify(e.diagnostics).length<2000);
});
test('normal manuscript fence compiles contextual cues while ambiguity retains literal source and useful diagnostics',async()=>{
 const make=language=>({purpose:'TEST ONLY cue compiler',operationId:'cue-compiler',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Exact contextual readings on original synthetic examples.',documents:[{key:'test',role:'article',markdown:'# TEST ONLY source\n\n```minamo-language\n'+JSON.stringify(language)+'\n```'}]}});
 const source={...base,cues:[{expression:'今日',reading:'きょう',occurrence:2}]},c=await compileManuscript(make(source)),part=c.pkg.records[0].data.sections[0].parts[0];
 assert.equal(part.text,base.text);assert.equal(part.semantic.language.spans[0].start,6);assert.ok(!c.warnings.some(x=>x.code==='semantic_fallback'));
 const ambiguous=await compileManuscript(make({...base,cues:[{expression:'今日',reading:'きょう'}]}));assert.ok(ambiguous.warnings.some(w=>w.code==='cue_ambiguous'&&w.message.includes('Candidates')));assert.match(ambiguous.pkg.records[0].data.sections[0].parts[0].text,/"cues"/);
});
