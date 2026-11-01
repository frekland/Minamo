import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup}from'react-dom/server';import {LearningHomeView,currentHomeRead,homeHistory,homeRecentNotes}from'./app/learning-home.tsx';import {JourneyThinkingOverview,visibleThinkingGroups}from'./app/learning-activity.tsx';import JourneyRoute,{journeyStageDestination} from './app/journey-route.tsx';import {investigationQuestionIsInReading} from './app/investigation-workspace.tsx';export{currentHomeRead,homeHistory,homeRecentNotes,visibleThinkingGroups,investigationQuestionIsInReading,journeyStageDestination};const noop=()=>{};export const home=(state,selection={learningSpace:'languages',language:'ja'},notes)=>renderToStaticMarkup(React.createElement(LearningHomeView,{state,selection,notes,serverReads:true,onOpen:noop,onRefresh:noop,onMore:noop,onMoreFavourites:noop,onUnfavourite:noop}));export const thinking=props=>renderToStaticMarkup(React.createElement(JourneyThinkingOverview,props));export const route=(article,serverRead=false)=>renderToStaticMarkup(React.createElement(JourneyRoute,{article,records:[],draftScope:'TEST-ONLY-owner:legacy@0',onStage:noop,...(serverRead?{currentHead:article}:{})}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'ux-home-journey-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const target={kind:'journey-stage',journeyId:'TEST-ONLY-route',stageId:'first'},at='2026-10-26T12:00:00.000Z';
const current={target,title:'TEST ONLY current stage',lastMeaningfulAt:at,shortSummary:'Retained current account',nextAction:'Inspect one harmless boundary.',destination:'/?view=journeys&family=journey&id=TEST-ONLY-route&stage=first&rendition=exact-current',lastDevelopmentId:'current',basisLabels:['learner-reported'],readingChangedSinceCheckpoint:true};
const earlier={...current,title:'TEST ONLY earlier account',shortSummary:'Keep this earlier uncertainty distinct.',lastDevelopmentId:'earlier',nextAction:undefined};
const data={asOf:at,continue:[current],recent:[current,earlier],favourites:[]};

test('Home hides a previous owner/scope payload and never reports an empty collection during initial loading',()=>{
 const previous={key:'owner-a:computing',data,error:'old scope failure',loading:false};
 const next=ui.currentHomeRead(previous,'owner-a:languages:ja');assert.deepEqual(next,{key:'owner-a:languages:ja',loading:true});
 const html=ui.home(next);assert.match(html,/role="status">Loading saved learning/);assert.doesNotMatch(html,/Retained current account|old scope failure|No learning checkpoints|Favourite a Journey/);
 assert.deepEqual(ui.currentHomeRead(previous,previous.key,false),{key:previous.key,loading:false},'unavailable authenticated reads never expose a prior payload');
});

test('Home provides exact scoped study entry points before any checkpoint or saved result',()=>{
 const html=ui.home({key:'empty',loading:false,data:{asOf:at,continue:[],recent:[],favourites:[]}});
 for(const view of ['practice','library','journeys'])assert.match(html,new RegExp('href="/\\?view='+view+'&amp;learningSpace=languages&amp;language=ja"'));
 assert.match(html,/Practise and review/);assert.match(html,/No recent work yet/);assert.doesNotMatch(html,/Record a checkpoint|mark.*complete|Earlier saved learning/);
});

test('Continue retains its exact next step and provenance while compact history excludes only the same account',()=>{
 assert.deepEqual(ui.homeHistory(data).map(item=>item.lastDevelopmentId),['earlier']);
 const html=ui.home({key:'ready',data,loading:false});assert.equal((html.match(/Retained current account/g)||[]).length,1);assert.match(html,/Keep this earlier uncertainty distinct/);assert.match(html,/Inspect one harmless boundary/);assert.match(html,/Project updated since this checkpoint/);assert.match(html,/your report/);assert.match(html,/rendition=exact-current/);assert.match(html,/Earlier work/);
 const cursorOnly=ui.home({key:'ready',loading:false,data:{...data,recent:[current],page:{recentCursor:'bounded-next-page'}}});assert.match(cursorOnly,/Earlier checkpoints/);assert.doesNotMatch(cursorOnly,/Keep this earlier uncertainty/);
});

const emptyGroup={title:'TEST ONLY untouched stage',destination:'/?view=journeys&id=route&stage=one&rendition=old-exact',connectionReason:'Exact authored stage.',target,activity:{items:[],moreAvailable:false}};
const note={family:'note',id:'TEST-ONLY-note',title:'TEST ONLY latest intention',rev:2,updatedAt:at,actor:'user',text:'Keep the unsolved question distinct.',textComplete:true,afterCheckpoint:null,connectionReason:'Exact stage Note.',destination:'/?view=work&family=note&id=TEST-ONLY-note&rendition=note-exact'};
const useful={...emptyGroup,title:'TEST ONLY stage with thinking',activity:{items:[note],moreAvailable:false}};
test('Journey overview removes authored empty activity rows but preserves useful thinking and exact task links',()=>{
 assert.deepEqual(ui.visibleThinkingGroups([emptyGroup,useful]).map(group=>group.title),[useful.title]);
 const html=ui.thinking({groups:[emptyGroup,useful],deferred:true});assert.doesNotMatch(html,/TEST ONLY untouched stage|0 recent items/);assert.match(html,/1 recent item/);assert.match(html,/Keep the unsolved question distinct/);assert.match(html,/rendition=old-exact/);assert.match(html,/More linked work/);assert.doesNotMatch(html,/<details[^>]*\sopen(?:[ =>])/);
 const more={...emptyGroup,activity:{items:[],moreAvailable:true}};assert.equal(ui.visibleThinkingGroups([more]).length,1,'a deferred page must not be hidden as an empty task');
});

test('Project overview keeps one honest pending continuation and closed optional panels without changing canonical text',()=>{
 const article={family:'journey',id:'TEST-ONLY-route',title:'TEST ONLY two-stage route',body:'',links:[],rev:1,rendition:'TEST-ONLY-reading',createdAt:at,updatedAt:at,actor:'user',synthetic:true,trashedAt:null,sections:[{id:'intro',title:'Original introduction',parts:[{id:'intro-p',kind:'paragraph',text:'Exact unchanged authored orientation.'}]},{id:'one',title:'First authored stage',parts:[{id:'p',kind:'paragraph',text:'First exact task.'}]},{id:'two',title:'Second authored stage',parts:[{id:'p',kind:'paragraph',text:'Second exact task.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'first',sectionId:'one',title:'First authored stage'},{id:'second',sectionId:'two',title:'Second authored stage'}]}};
 const canonicalBefore=JSON.stringify(article),html=ui.route(article);assert.ok(html.indexOf('First authored stage')<html.indexOf('Second authored stage'));assert.match(html,/le-roadmap project-step-list/);assert.match(html,/>Steps<\/h2>/);assert.match(html,/Checking saved work/);assert.equal((html.match(/class="v2-primary"/g)||[]).length,1);assert.match(html,/>Resources<\/button>/);assert.match(html,/>Project map<\/button>/);assert.match(html,/>Read introduction<\/button>/);assert.doesNotMatch(html,/Journey recent thinking|About this Journey|Exact unchanged authored orientation\.|react-flow|project-dialog-body/);assert.equal(JSON.stringify(article),canonicalBefore,'overview presentation never rewrites immutable authored reading');
});

test('admitted Project overview leads with recorded evidence; single-checkpoint Continue is only an unavailable-read fallback',()=>{
 const article={family:'journey',id:'TEST-ONLY-live-project',title:'TEST ONLY live project',body:'Authored purpose',links:[],rev:1,rendition:'edition-one',createdAt:at,updatedAt:at,actor:'user',synthetic:false,trashedAt:null,sections:[{id:'s-one',title:'A stage',parts:[{id:'p',kind:'paragraph',text:'A deliberate guide'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'one',sectionId:'s-one',title:'A stage'}]}};
 const html=ui.route(article,true);
 assert.match(html,/Recorded work in this Project/);assert.match(html,/Checking recorded sources/);
 assert.doesNotMatch(html,/class="project-continue"|Start first step|Latest saved checkpoint/);
 assert.match(html,/Project map/);assert.match(html,/>Steps<\/h2>/);
});


test('Note-only continuation retains one latest genuine Note with exact excerpt and no invented next action',()=>{
 const record={family:'note',id:'TEST-ONLY-note',title:'TEST ONLY open question',rev:1,updatedAt:at,body:'Which result would disprove this?',synthetic:false,trashedAt:null};
 const records=[record,{...record,rev:3,body:'Exact latest uncertainty.',actor:'gpt'},{...record,id:'TEST-ONLY-synthetic',title:'Synthetic must not displace',synthetic:true,updatedAt:'2026-10-27T00:00:00Z'},{...record,id:'TEST-ONLY-trash',trashedAt:at}];
 const items=ui.homeRecentNotes(records);assert.equal(items.length,1);assert.equal(items[0].rev,3);assert.equal(items[0].text,'Exact latest uncertainty.');
 const html=ui.home({key:'ready',loading:false,data:{asOf:at,continue:[],recent:[],favourites:[]}},undefined,{items,loading:false});
 assert.equal((html.match(/Exact latest uncertainty\./g)||[]).length,1);assert.ok(html.indexOf('id="continue-title"')<html.indexOf('Choose something to study'));assert.match(html,/family=note&amp;id=TEST-ONLY-note/);assert.match(html,/learningSpace=languages&amp;language=ja/);assert.doesNotMatch(html,/Next useful action|Record a checkpoint|Synthetic must not displace|Find activities and your saved answers/);
});

test('Incomplete or failed Note read is never an empty Home or a full empty chooser',()=>{
 const state={key:'partial',loading:false,data:{asOf:at,continue:[],recent:[],favourites:[]}};
 for(const notes of [{items:[],loading:true},{items:[],loading:false,error:'TEST ONLY Note read failed'},{items:[],loading:false,moreAvailable:true}]){
  const html=ui.home(state,undefined,notes);assert.doesNotMatch(html,/Choose something to study above|Find activities and your saved answers/);assert.match(html,/learning-home-start-compact/);
 }
 assert.match(ui.home(state,undefined,{items:[],loading:false,error:'TEST ONLY Note read failed'}),/Retry Notes/);
 assert.match(ui.home(state,undefined,{items:[],loading:false,moreAvailable:true}),/More Notes in Your work/);
});


test('Investigation framing suppresses only exact canonical question repetition',()=>{
 const question='What survives the boundary?',record={title:'Durability lab',body:'',sections:[{id:'question',title:'Question',parts:[{id:'p',kind:'paragraph',text:question}]}]};
 assert.equal(ui.investigationQuestionIsInReading(record,question),true);
 assert.equal(ui.investigationQuestionIsInReading({...record,sections:[]},question),false);
 assert.equal(ui.investigationQuestionIsInReading({...record,title:question,sections:[]},question),true);
 assert.equal(ui.investigationQuestionIsInReading({...record,sections:[{id:'different',title:'A different question',parts:[]}]},question),false);
});

test('Journey linked-work loading and errors remain visible without expanding its disclosure',()=>{
 assert.match(ui.thinking({loading:true}),/<details open=""/);
 const failed=ui.thinking({error:'TEST ONLY recent work unavailable'});assert.match(failed,/<details open=""/);assert.match(failed,/Retry/);
});


test('Journey native destinations retain exact stage and edition; Home never relabels supplied evidence as observed',()=>{
 const destination=ui.journeyStageDestination({id:'TEST-ONLY-route',rendition:'TEST-ONLY-exact-edition'},'independent');
 const params=new URL(destination,'https://minamo.invalid').searchParams;assert.equal(params.get('family'),'journey');assert.equal(params.get('rendition'),'TEST-ONLY-exact-edition');assert.equal(params.get('stage'),'independent');
 const html=ui.home({key:'ready',loading:false,data:{...data,continue:[{...current,basisLabels:['supplied-artifact','illustrative']}],recent:[]}});assert.match(html,/supplied evidence, illustrative example/);assert.doesNotMatch(html,/observed result/);
});
