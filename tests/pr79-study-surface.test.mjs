import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import StudyApp from './app/study/study-app.tsx';export{studyHref,studyExactHref,WorkOrientation,WorkComparison}from'./app/study/study-app.tsx';export const render=props=>renderToStaticMarkup(React.createElement(StudyApp,props));export const renderPart=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'error'});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
const {render,renderPart,studyHref,studyExactHref,WorkOrientation,WorkComparison}=mod.exports;
const now='2026-11-02T10:00:00.000Z';
const record=(family,id,title,body,extra={})=>({family,id,title,body,links:[],rev:1,rendition:'edition-'+id,actor:'user',synthetic:false,createdAt:now,updatedAt:now,trashedAt:null,...extra});
const article=record('article','reading','Why saved writing changes', 'This is the full original introduction.',{sections:[{id:'why',title:'What happens',parts:[{id:'first',kind:'paragraph',text:'An actual paragraph of explanatory text about retaining a thought.'}]}]});
const note=record('note','thought','My original thought','I wondered what was durable.',{links:[{family:'work',id:'my-work',relation:'related',reason:'I chose to connect this Note to this Work.'}]});
const work=record('work','my-work','Test a persistent idea','I want to compare two observations.',{workMeta:{version:1}});
const activity=record('experiment','activity','Try an experiment','A deliberate test.',{activity:{contract:'minamo.activity.v1',blocks:[]}});
const props={authenticated:true,draftScope:'test-only-study',generation:'legacy@0',initialLearningScope:{learningSpace:'all'},initialRecords:[],initialRelated:[]};

test('Study first viewport leads with a learning choice and no old administrative shell',()=>{
 const html=render(props);
 assert.match(html,/What would you like to explore\?/);
 assert.match(html,/Find something to learn/);
 assert.match(html,/Write a Note/);
 assert.match(html,/Pick up or begin longer Work/);
 assert.match(html,/no copying between apps is needed/);
 assert.doesNotMatch(html.match(/<nav aria-label="Study navigation">([\s\S]*?)<\/nav>/)?.[1]??'',/>Work<\/a>/);
 assert.doesNotMatch(html,/class="v2-sidebar|class="nw-desktop-bar|ProjectsIndex|coverage\.notice|Source receipt|Complete Step|Journey roadmap/);
 assert.equal((html.match(/<header class="study-header"/g)??[]).length,1);
});

test('Study composes content-level engines without pulling in prior page shells',()=>{
 const source=readFileSync('app/study/study-app.tsx','utf8');
 assert.doesNotMatch(source,/import\s*\{?[^;]*\b(JourneyRoute|LearningHome|WorkingContextHost|ActivityStudio|ContinuityGptHandoff)\b[^;]*from/);
 assert.doesNotMatch(source,/import[^;]*from\s*['"][^'"]*(journey-route|learning-home|working-context|continuity-gpt-handoff)['"]/);
 assert.match(source,/import Reader from '..\/reader'/);
 assert.match(source,/import NotesPanel from '..\/notes-panel'/);
 assert.match(source,/import \{StudyActivityTask\} from '..\/activity-studio'/);
});

test('Reading is the actual original explanation, one title and a contextual Note action',()=>{
 const html=render({...props,initialRecords:[article],initialFamily:'article',initialId:article.id});
 assert.match(html,/Why saved writing changes/);
 assert.match(html,/This is the full original introduction/);
 assert.match(html,/An actual paragraph of explanatory text/);
 assert.match(html,/Note on this/);
 assert.match(html,/class="study-reader"/);
 assert.doesNotMatch(html,/class="v2-sidebar|Journey roadmap|Full Activity Studio|class="nw-desktop-bar/);
});

test('Work shows the actual linked Note, without invented completion or stage state',()=>{
 const html=render({...props,initialRecords:[work,note],initialRelated:[note],initialFamily:'work',initialId:work.id});
 assert.match(html,/Test a persistent idea/);
 assert.match(html,/My original thought/);
 assert.match(html,/Note on this Work/);
 assert.match(html,/How the work is taking shape/);
 assert.doesNotMatch(html,/Current understanding|Mastered|Step roadmap|Saved status/);
});

test('Find looks for reading, Activities and writing as one surface',()=>{
 const html=render({...props,initialTab:'find',initialQuery:'durable'});
 assert.match(html,/What are you curious about\?/);
 assert.match(html,/Search explanations, activities and your own writing together/);
 assert.match(html,/value="durable"/);
 assert.doesNotMatch(html,/class="v2-sidebar|class="nw-desktop-bar/);
});

test('Activity content is local and does not carry the old Studio page heading',()=>{
 const html=render({...props,initialRecords:[activity],initialFamily:'experiment',initialId:activity.id});
 assert.match(html,/Try an experiment/);
 assert.match(html,/Note on this/);
 assert.match(html,/aria-label="Activity task"/);
 assert.doesNotMatch(html,/Activity Studio|ACTIVITY · EDITION/);
});

test('Native exact links carry rendition, passage and capture without changing the saved record',()=>{
 const href=studyExactHref('article',article.id,{rendition:article.rendition,sectionId:'why',partId:'first',start:2,end:7,captureId:'original-capture',captureFamily:'annotation'});
 const params=new URLSearchParams(href.slice(2));
 assert.equal(params.get('view'),'study');assert.equal(params.get('family'),'article');assert.equal(params.get('id'),'reading');
 assert.equal(params.get('rendition'),'edition-reading');assert.equal(params.get('section'),'why');assert.equal(params.get('part'),'first');
 assert.equal(params.get('start'),'2');assert.equal(params.get('end'),'7');assert.equal(params.get('capture'),'original-capture');
 assert.equal(studyHref('journey','old'),'/?view=study&family=journey&id=old');
});

test('Returning Work orients from saved originals and explicit reasons, with competing open ideas',()=>{
 const source={family:'note',id:'original-note',rev:1};
 const update={id:'exact-correction',revision:1,author:'gpt',savedAt:now,summary:'Changed my first hypothesis.',partial:false,withdrawn:false,decisions:[],claimCorrections:[{accepted:true,reason:'The actual response contained only headers.',prior:{kind:'record-passage',family:'note',id:source.id,revision:1,sectionId:'__article',partId:'__body',start:0,end:4,quote:'HEAD'}}],nextQuestions:['How does this work on another server?'],nextAction:'Check a second endpoint.'};
 const another={...update,id:'other-strand',claimCorrections:[],nextQuestions:['Does caching change?'],nextAction:'Keep testing the cache.',savedAt:'2026-10-25T09:00:00.000Z'};
 const entry={source,title:'The first observation',kind:'note',savedAt:now,excerpt:'I expected HEAD to send a body.',updates:[update,another]};
 const second={source:{family:'note',id:'earlier-note',rev:1},title:'Earlier thought',kind:'note',savedAt:'2026-10-20T09:00:00.000Z',excerpt:'I thought the cache was different.',updates:[]};
 const read={work:{source:{family:'work',id:'w',rev:1},title:'My Work',body:'An evolving question.'},entries:[entry,second],directUpdates:[],coverage:{partial:false,notes:''},asOf:now};
 const html=renderPart(WorkOrientation,{read,onNote:()=>{}});
 assert.match(html,/PICK UP HERE/);
 assert.match(html,/I expected HEAD to send a body/);
 assert.match(html,/The actual response contained only headers/);
 assert.match(html,/Does caching change/);
 assert.match(html,/Check a second endpoint/);
 assert.match(html,/Keep testing the cache/);
 assert.match(html,/#study-update-exact-correction/);
 assert.doesNotMatch(html,/Mastered|Completed stage|Current progress/);
 const comparison=renderPart(WorkComparison,{notes:[entry,second],scope:'fictional-test'});
 assert.match(comparison,/Compare these entries/);
 assert.match(comparison,/First original/);
 assert.match(comparison,/Second original/);
 assert.match(comparison,/Minamo has not inferred a cause/);
});
