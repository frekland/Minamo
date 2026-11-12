import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:"export {localVoiceFor,localSynthesisOptions,isTargetFlashcardFace} from './lib/language-speech.ts';",resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'pr85-speech-')),file=join(dir,'module.cjs');
writeFileSync(file,result.outputFiles[0].text);
const {localVoiceFor,localSynthesisOptions,isTargetFlashcardFace}=require(file);
rmSync(dir,{recursive:true,force:true});

test('Japanese uses only Piper Plus and the two owner-tested synthesis presets',()=>{
 const voice=localVoiceFor('ja-JP');
 assert.equal(voice.engine,'piper-plus');
 assert.equal(voice.id,'css10');
 assert.deepEqual(localSynthesisOptions(voice,'normal'),{lengthScale:1.6,noiseW:0.2});
 assert.deepEqual(localSynthesisOptions(voice,'slow'),{lengthScale:2.4,noiseW:0.2});
});

test('known non-Japanese voices are original Piper, not multi-language CSS10',()=>{
 const known={en:'en_GB-alan-medium',de:'de_DE-thorsten-medium',fr:'fr_FR-siwis-medium',es:'es_ES-sharvard-medium',ar:'ar_JO-kareem-medium',zh:'zh_CN-huayan-medium',el:'el_GR-rapunzelina-low',sv:'sv_SE-nst-medium'};
 for(const [language,id] of Object.entries(known)){
  const voice=localVoiceFor(`${language}-XX`);
  assert.equal(voice.engine,'piper');
  assert.equal(voice.id,id);
  assert.equal(localSynthesisOptions(voice,'slow'),null);
 }
});

test('valid but unsupported language tags retain text-only Projects',()=>{
 assert.equal(localVoiceFor('tet'),null);
 assert.equal(localVoiceFor('ko-KR'),null);
 assert.equal(localVoiceFor(''),null);
 assert.equal(localVoiceFor('ja<script>'),null);
});

test('flashcards speak complete target-language text only, never translated answers or cloze blanks',()=>{
 assert.equal(isTargetFlashcardFace(false,false,false),true); // original target-language front
 assert.equal(isTargetFlashcardFace(false,true,false),false); // translated back
 assert.equal(isTargetFlashcardFace(false,false,true),false); // reverse: translation shown first
 assert.equal(isTargetFlashcardFace(false,true,true),true); // reverse: target text revealed
 assert.equal(isTargetFlashcardFace(true,false,false),false); // unfinished cloze prompt
 assert.equal(isTargetFlashcardFace(true,true,false),true); // complete cloze answer
 assert.equal(isTargetFlashcardFace(true,false,true),false); // cloze always starts with a blank
 assert.equal(isTargetFlashcardFace(true,true,true),true);
});
