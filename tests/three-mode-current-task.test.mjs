import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
// Expose only the real internal presentation boundary to this test bundle.
// Production source and exports are unchanged; full Workspace cases run below.
const built=await wr('esbuild').build({stdin:{contents:"import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Workspace,{LearningReading}from'./app/workspace.tsx';export const workspace=props=>renderToStaticMarkup(React.createElement(Workspace,props));export const reading=props=>renderToStaticMarkup(React.createElement(LearningReading,props));",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'\"production\"'},plugins:[{name:'expose-real-reading-boundary',setup(build){build.onLoad({filter:/\/app\/workspace\.tsx$/},args=>({contents:readFileSync(args.path,'utf8')+'\nexport {LearningReading};',loader:'tsx'}));}}]});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const ui=mod.exports;
const base={title:'TEST ONLY task',body:'Exact original task opening.',links:[],rev:2,rendition:'current-task-edition',actor:'system',synthetic:true,createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z',sections:[{id:'guide',title:'Guide section',parts:[{id:'p',kind:'paragraph',text:'Exact original task guidance.'}]}]};
const reference={...base,family:'article',id:'TEST-ONLY-task-reference',title:'TEST ONLY linked reference',rendition:'reference-edition'};
const investigation={...base,family:'investigation',id:'TEST-ONLY-current-investigation',links:[{family:'article',id:reference.id,relation:'related',reason:'Reusable original reference.'}],learningShape:{version:1,kind:'investigation',question:'TEST ONLY investigation question',intent:'Inspect an original synthetic question.'}};
const journey={...base,family:'journey',id:'TEST-ONLY-current-journey',learningShape:{version:1,kind:'journey',stages:[{id:'stage-guide',sectionId:'guide',title:'TEST ONLY exact stage',intent:'Inspect the stage.',outcome:'An intended result, not observed execution.',checkpoint:'Retain only explicit evidence.'}]}};
const props=record=>({initialRecords:[record,reference],initialView:record.family==='journey'?'journeys':'investigations',initialId:record.id,initialFamily:record.family,authenticated:true,draftScope:'TEST-ONLY-current-task-release',initialArticle:record,initialReadingTarget:{recordFamily:record.family,rendition:record.rendition,...(record.family==='journey'?{stageId:'stage-guide'}:{})}});
const readingProps=(record,currentHead=record,target={})=>({article:record,currentHead,records:[record,reference],draftScope:'TEST-ONLY-current-task-boundary',onNavigate:()=>{},onStage:()=>{},onCommand:async()=>({}),anchorTarget:{recordFamily:record.family,rendition:record.rendition,...target}});
function generic(html){assert.doesNotMatch(html,/class="le-investigation"|class="le-journey"|class="le-overview"|aria-label="My investigation work"|aria-label="Saved learning for this stage"/);assert.match(html,/Exact original task guidance\./);}

test('actual Workspace exact current Question retains guide, My work and linked Library affordances',()=>{
 const html=ui.workspace(props(investigation));
 assert.match(html,/class="le-investigation"/);assert.match(html,/aria-label="My work"/);assert.match(html,/aria-label="Question guide"/);assert.match(html,/Related Articles/);assert.match(html,/TEST ONLY linked reference/);assert.match(html,/>Preview<\/button>/);assert.doesNotMatch(html,/aria-label="Investigations"/);
 assert.equal((html.match(/data-reading-part="p"/g)??[]).length,1,'there is one canonical task reading owner');
 assert.match(html,/Note on this Question/);
});

test('Project overview Note action names its actual context',()=>{
 const html=ui.workspace({...props(journey),initialReadingTarget:{recordFamily:'journey'}});
 assert.match(html,/Note on this Project/);
});

test('actual Workspace exact current Project Step retains guide and saved-work workspace',()=>{
 const html=ui.workspace(props(journey));
 assert.match(html,/class="le-journey"/);assert.match(html,/aria-label="Choose a step"/);assert.match(html,/TEST ONLY exact stage/);assert.match(html,/aria-label="My work"/);assert.match(html,/aria-label="Step guide"/);assert.match(html,/Project overview/);
 assert.equal((html.match(/data-reading-part="p"/g)??[]).length,1);
});

test('actual Workspace older whole-task editions stay canonical exact readings without current task substitution',()=>{
 for(const current of [investigation,journey]){
  const retained={...current,rev:1,rendition:'older-task-edition',body:'RETAINED TASK OPENING',sections:[{id:'guide',title:'Guide section',parts:[{id:'p',kind:'paragraph',text:'RETAINED TASK GUIDANCE'}]}]};
  const html=ui.workspace({...props(current),initialArticle:retained,initialReadingTarget:{recordFamily:current.family,rendition:retained.rendition,...(current.family==='journey'?{stageId:'stage-guide'}:{})}});
  assert.doesNotMatch(html,/class="le-investigation"|class="le-journey"|Exact original task guidance\./);assert.match(html,/RETAINED TASK GUIDANCE/);
 }
});

test('exact section, part and capture views keep the generic Reader even when current task edition matches',()=>{
 for(const record of [investigation,journey])for(const target of [{sectionId:'guide'},{sectionId:'guide',partId:'p'},{captureId:'TEST-ONLY-exact-capture',captureFamily:'annotation',sectionId:'guide',partId:'p',start:0,end:5}]){
  generic(ui.reading(readingProps(record,record,target)));
 }
});

test('whole-task workspace admission requires an exact current head family, ID and rendition',()=>{
 for(const record of [investigation,journey])for(const currentHead of [null,{...record,id:'TEST-ONLY-other-task'},{...record,family:'article'},{...record,rendition:'different-current-edition'}]){
  generic(ui.reading(readingProps(record,currentHead,record.family==='journey'?{stageId:'stage-guide'}:{})));
 }
});
