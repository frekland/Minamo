import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/project-reading-topics.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {projectReadingTopics}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));

test('A5 topics use native sections and stable identities, not prose or fixture IDs',()=>{
 const paragraphs=n=>Array.from({length:n},(_,i)=>({id:'part-'+i,kind:'paragraph',text:'Unwieldy text about an example which is not a useful navigation title'}));
 const sections=[{id:'grammar',title:'Japanese grammar notes',parts:paragraphs(12)},{id:'code',title:'Python investigation',parts:paragraphs(2)},{id:'hidden-content',title:'Hidden draft',parts:paragraphs(1)}];
 const composition={version:1,sections:[{id:'first',title:'Notebook',pattern:'notebook',slots:[{id:'main',role:'primary',blockIds:['grammar-block','hidden-block']}]},{id:'second',title:'Workbench',pattern:'workbench',slots:[{id:'main',role:'primary',blockIds:['code-block']}]},{id:'third',title:'Hidden layout',pattern:'guide',hidden:true,slots:[{id:'main',role:'primary',blockIds:[]}]}],blocks:[{id:'grammar-block',sectionId:'grammar'},{id:'code-block',sectionId:'code'},{id:'hidden-block',sectionId:'hidden-content',hidden:true}]};
 const topics=projectReadingTopics(composition,sections);
 assert.deepEqual(topics.map(t=>t.title),['Japanese grammar notes','Python investigation']);
 assert.deepEqual(topics[0].partIds,paragraphs(12).map(p=>p.id));
 assert.equal(topics[0].sectionId,'grammar');
 assert.equal(topics[1].blockId,'code-block');
 assert.ok(!topics.some(t=>t.title.includes('Unwieldy')));
});

test('Very long native blocks split predictably without changing section identity',()=>{
 const parts=Array.from({length:19},(_,i)=>({id:'p'+i,kind:'paragraph',text:'Text '+i}));
 const composition={version:1,sections:[{id:'a',title:'Guide',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:['b']}]}],blocks:[{id:'b',sectionId:'s'}]};
 const topics=projectReadingTopics(composition,[{id:'s',title:'Part by part',parts}]);
 assert.deepEqual(topics.map(t=>t.title),['Part by part · 1','Part by part · 2','Part by part · 3']);
 assert.deepEqual(topics.map(t=>t.partIds.length),[8,8,3]);
 assert.deepEqual(new Set(topics.map(t=>t.sectionId)),new Set(['s']));
});

test('Linked topics use the target title and section, not repeated generic labels',()=>{
 const composition={version:1,sections:[{id:'reading',title:'Read and listen',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['linked-a','linked-b']}]}],blocks:[{id:'linked-a',ref:{family:'article',id:'n4-teiru',sectionId:'examples'}},{id:'linked-b',ref:{family:'article',id:'n4-desires'}}]};
 const topics=projectReadingTopics(composition,[],{'linked-a':'N4 — ている · Examples','linked-b':'N4 — Desires'});
 assert.deepEqual(topics.map(t=>t.title),['N4 — ている · Examples','N4 — Desires']);
 assert.deepEqual(topics.map(t=>t.kind),['reference','reference']);
 assert.equal(topics[0].id,'reading:linked-a:ref');
 assert.equal(projectReadingTopics(composition,[])[0].title,'Reference · n4-teiru');
});
