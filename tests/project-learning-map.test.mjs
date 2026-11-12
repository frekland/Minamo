import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({
 stdin:{contents:"export {projectLearningMap,exactLearningTopics} from './lib/project-learning-map';export {validateComposition} from './lib/project-composition';",resolveDir:process.cwd()},
 bundle:true,platform:'node',format:'esm',write:false
});
const {projectLearningMap,exactLearningTopics,validateComposition}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const sections=[{id:'conversation',title:'Music and interests',parts:[
 {id:'original',kind:'paragraph',text:'I like music'},
 {id:'explain',kind:'paragraph',text:'Grammar'},
 {id:'repeat',kind:'paragraph',text:'Practise'}
]}];
const composition=()=>({version:1,sections:[
 {id:'messages',title:'Messages',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['music-block']}]},
 {id:'grammar',title:'Grammar',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:[]}]},
 {id:'practice',title:'Practice',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:[]}]}
],blocks:[{id:'music-block',sectionId:'conversation',readingPages:[
 {id:'original',title:'My reply',contextId:'music',contextTitle:'Music',purpose:'source',partIds:['original']},
 {id:'grammar',title:'How it works',layoutId:'grammar',contextId:'music',purpose:'explanation',partIds:['explain'],source:{sectionId:'conversation',partId:'original'},relations:[{kind:'explains',target:{sectionId:'conversation',partId:'original'}}]},
 {id:'practice',title:'Try again',layoutId:'practice',contextId:'music',purpose:'practice',partIds:['repeat'],relations:[{kind:'practises',target:{sectionId:'conversation',partId:'original'}}],continuation:{target:{sectionId:'conversation',partId:'repeat'},label:'Resume this activity'}}
]}]});
test('Shared map groups one context across visible task layouts without copying canonical content',()=>{
 const input=composition();validateComposition(input,{sections});
 const model=projectLearningMap(input,sections);
 assert.equal(model.contexts.length,1);
 assert.deepEqual(model.contexts[0].layoutIds,['messages','grammar','practice']);
 assert.equal(model.contexts[0].title,'Music');
 assert.equal(model.contexts[0].topicIds.length,3);
 assert.equal(model.indexes.find(x=>x.id==='practice').topicIds.length,1);
 assert.equal(model.contexts[0].continuation.partId,'repeat');
 assert.equal(model.coverage.explicitContexts,3);
 const page=exactLearningTopics(model,sections,[model.contexts[0].continuation.topicId]);
 assert.equal(page[0].parts[0],sections[0].parts[2]);
});
test('Old Projects remain browsable; no fake continuation is inferred',()=>{
 const legacy={version:1,sections:[{id:'one',title:'Read',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['b']}]}],blocks:[{id:'b',sectionId:'conversation'}]};
 const model=projectLearningMap(legacy,sections);
 assert.equal(model.contexts.length,1);
 assert.equal(model.contexts[0].continuation,undefined);
 assert.equal(model.contexts[0].title,'Music and interests');
 assert.equal(model.topics.length,1);
});
test('Relationship references are real and cannot point at missing or unavailable parts',()=>{
 const missing=composition();
 missing.blocks[0].readingPages[1].relations[0].target.partId='invented';
 assert.throws(()=>validateComposition(missing,{sections}),/relationship target/i);
 const unavailable=composition();
 unavailable.blocks[0].readingPages[2].continuation.target.partId='gone';
 assert.throws(()=>validateComposition(unavailable,{sections}),/relationship target/i);
 const duplicated=composition();
 duplicated.blocks[0].readingPages[1].relations.push(structuredClone(duplicated.blocks[0].readingPages[1].relations[0]));
 assert.throws(()=>validateComposition(duplicated,{sections}),/Repeated reading-page relationship/);
});
test('Hidden purpose views are not projected or silently rewritten',()=>{
 const hidden=composition();hidden.sections[2].hidden=true;
 const model=projectLearningMap(hidden,sections);
 assert.equal(model.indexes.some(x=>x.id==='practice'),false);
 assert.equal(model.contexts[0].continuation,undefined);
 assert.equal(sections[0].parts[0].text,'I like music');
});
