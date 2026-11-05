import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:`export {canonicalLanguageTag,validateLearningScope,parseLearningScopeQuery} from './lib/learning-spaces.ts';export {validateInteractive} from './lib/project-interactive.ts';`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'pr85-language-')),file=join(dir,'test.cjs');writeFileSync(file,result.outputFiles[0].text);
const {canonicalLanguageTag,validateLearningScope,parseLearningScopeQuery,validateInteractive}=require(file);rmSync(dir,{recursive:true,force:true});

const scope=languages=>({version:1,spaces:['languages'],languages,provenance:'authored'});
test('open BCP 47 classification accepts Tetum and canonicalises script/region without changing source',()=>{
 assert.equal(canonicalLanguageTag('TET'),'tet');
 assert.deepEqual(validateLearningScope(scope(['TET','zh-hans','ar-EG'])).languages,['tet','zh-Hans','ar-EG']);
 assert.deepEqual(parseLearningScopeQuery({language:'TET'}),{learningSpace:'languages',language:'tet'});
 assert.throws(()=>validateLearningScope(scope(['tet','TET'])),/unique/);
 for(const value of ['not--a-valid-language-tag','<script>','en--GB','f'.repeat(49)])assert.throws(()=>canonicalLanguageTag(value));
 assert.throws(()=>validateLearningScope({...scope(['tet']),spaces:['computing']}));
 assert.throws(()=>validateLearningScope(scope(Array.from({length:9},(_,i)=>`x${i}`))));
});

test('finite authored sentence choices, layered reading, dialogue and cloze cards retain strict inert definitions',()=>{
 const sentence={version:1,type:'language-pattern',language:'tet',slots:[{id:'subject',label:'Subject',choices:[{id:'hau',label:'Hau'},{id:'nia',label:'Nia'}]}],examples:[{id:'first',choices:{subject:'hau'},source:{text:'Hau aprende Tetun.',translation:'I learn Tetum.'}},{id:'second',choices:{subject:'nia'},source:{text:'Nia aprende Tetun.',translation:'They learn Tetum.'}}]};
 assert.equal(validateInteractive(sentence).examples.length,2);
 assert.throws(()=>validateInteractive({...sentence,examples:[...sentence.examples,{id:'bad',choices:{subject:'invented'},source:{text:'INVALID'}}]}),/known choice/);
 assert.throws(()=>validateInteractive({...sentence,examples:[...sentence.examples,{...sentence.examples[0],id:'repeat'}]}),/one authored/);
 assert.equal(validateInteractive({version:1,type:'language-reveal',language:'ar',source:{text:'مرحبا',translation:'Hello'},gloss:'Greeting'}).type,'language-reveal');
 assert.equal(validateInteractive({version:1,type:'language-dialogue',language:'tet',turns:[{id:'first',speaker:'A',source:{text:'Bondia!',translation:'Good morning.'}}]}).type,'language-dialogue');
 assert.equal(validateInteractive({version:1,type:'flashcards',reversible:true,cards:[{id:'one',front:{text:'English'},back:{text:'Tetun'},cloze:{before:'Hau ',missing:'aprende',after:' Tetun.'}}]}).cards.length,1);
});
