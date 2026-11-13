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

test('Japanese, computing and research projects retain their own source, purpose and evidence relationships',()=>{
 const specimens=[
  {title:'Japanese conversation',parts:[
   {id:'message',kind:'paragraph',text:'週末は家で本を読みました。'},
   {id:'reply',kind:'paragraph',text:'I read a book at home on the weekend.'},
   {id:'grammar',kind:'paragraph',text:'Place で after the location for an action.'},
   {id:'practice',kind:'interactive',text:'Make another sentence',interactive:{type:'language-reveal'}}
  ],pages:[
   {id:'message-page',title:'Original message',contextId:'weekend',purpose:'source',partIds:['message']},
   {id:'reply-page',title:'Reply and translation',contextId:'weekend',purpose:'translation',partIds:['reply']},
   {id:'grammar-page',title:'Location particle で',contextId:'weekend',purpose:'explanation',partIds:['grammar'],relations:[{kind:'explains',target:{sectionId:'s',partId:'message'}}]},
   {id:'practice-page',title:'Reuse it',contextId:'weekend',purpose:'practice',partIds:['practice'],relations:[{kind:'practises',target:{sectionId:'s',partId:'message'}}]}
  ]},
  {title:'Python file parser',parts:[
   {id:'source-code',kind:'code',text:'for line in stream:\n    parse(line)'},
   {id:'observation',kind:'callout',text:'The supplied run stopped at a malformed row.'},
   {id:'alternative',kind:'paragraph',text:'A generator can preserve streaming while returning typed records.'}
  ],pages:[
   {id:'code-page',title:'Current parser',contextId:'parser',purpose:'source',provenance:'user-reported',partIds:['source-code']},
   {id:'run-page',title:'Reported observation',contextId:'parser',purpose:'reference',provenance:'user-reported',partIds:['observation'],relations:[{kind:'related',target:{sectionId:'s',partId:'source-code'}}]},
   {id:'alternative-page',title:'Alternative design',contextId:'parser',purpose:'explanation',provenance:'gpt-authored',partIds:['alternative'],relations:[{kind:'corrects',target:{sectionId:'s',partId:'source-code'}}]}
  ]},
  {title:'Conflicting research interpretations',parts:[
   {id:'source-excerpt',kind:'excerpt',text:'The source describes a narrow association.'},
   {id:'interpretation-a',kind:'paragraph',text:'Interpretation A treats this as a direct causal claim.'},
   {id:'interpretation-b',kind:'paragraph',text:'Interpretation B treats the wording as observational and non-causal.'}
  ],pages:[
   {id:'evidence-page',title:'Source passage',contextId:'causality',purpose:'source',provenance:'source-excerpt',partIds:['source-excerpt']},
   {id:'interpretation-a-page',title:'Causal reading',contextId:'causality',purpose:'explanation',provenance:'gpt-authored',partIds:['interpretation-a'],relations:[{kind:'explains',target:{sectionId:'s',partId:'source-excerpt'}},{kind:'related',target:{sectionId:'s',partId:'interpretation-b'}}]},
   {id:'interpretation-b-page',title:'Observational reading',contextId:'causality',purpose:'explanation',provenance:'gpt-authored',partIds:['interpretation-b'],relations:[{kind:'explains',target:{sectionId:'s',partId:'source-excerpt'}},{kind:'related',target:{sectionId:'s',partId:'interpretation-a'}}]}
  ]}
 ];
 for(const specimen of specimens){
  const sections=[{id:'s',title:specimen.title,parts:specimen.parts}];
  const layouts=[...new Set(specimen.pages.map(page=>page.purpose))].map(purpose=>({id:purpose,title:purpose,pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:[]}]}));
  const block={id:'source-block',sectionId:'s',readingPages:specimen.pages.map(page=>({...page,layoutId:page.purpose}))};
  layouts[0].slots[0].blockIds.push(block.id);
  const model=projectLearningMap({version:1,sections:layouts,blocks:[block]},sections);
  assert.equal(model.topics.length,specimen.pages.length,specimen.title);
  assert.deepEqual(model.topics.map(topic=>topic.id.split(':').at(-1)),specimen.pages.map(page=>page.id),specimen.title);
  for(const topic of model.topics){const exact=exactLearningTopics(model,sections,[topic.id]);assert.deepEqual(exact[0].parts.map(part=>part.id),specimen.pages.find(page=>page.id===topic.id.split(':').at(-1)).partIds,specimen.title);}
 }
});

test('large Projects project the full named index within the explicit application bound',()=>{
 const parts=Array.from({length:1200},(_,index)=>({id:'p-'+index,kind:'paragraph',text:'Bounded synthetic passage '+index}));
 const pages=parts.map((part,index)=>({id:'page-'+index,title:'Topic '+index,contextId:'large-project',contextTitle:'Large project',purpose:'reference',partIds:[part.id]}));
 const input={version:1,sections:[{id:'layout',title:'References',pattern:'research',slots:[{id:'primary',role:'primary',blockIds:['large-block']}]}],blocks:[{id:'large-block',sectionId:'large-source',readingPages:pages}]};
 const model=projectLearningMap(input,[{id:'large-source',title:'References',parts}]);
 assert.equal(model.topics.length,1200);
 assert.equal(model.contexts[0].topicIds.length,1200);
 assert.equal(model.topics.at(-1).partIds[0],'p-1199');
});
