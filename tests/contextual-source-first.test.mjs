import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import{ContinuitySourcesView,currentEvidenceRead,evidenceItemHref}from'./app/continuity-sources.tsx';import{LearningHomeView}from'./app/learning-home.tsx';import{buildContinuityGptBrief,evidenceChoiceKey}from'./lib/continuity-gpt-brief.ts';export{currentEvidenceRead,evidenceItemHref,buildContinuityGptBrief,evidenceChoiceKey};const noop=()=>{};export const render=(read,selection={learningSpace:'computing'})=>renderToStaticMarkup(React.createElement(ContinuitySourcesView,{read,selection,title:'Recorded work',emptyText:'No eligible sources',onRefresh:noop,onMore:noop}));export const home=(read,sourceFirstActive=true)=>renderToStaticMarkup(React.createElement(LearningHomeView,{selection:{learningSpace:'computing'},state:{key:'a',data:{asOf:'2026-11-01T12:00:00Z',continue:[{lastDevelopmentId:'old',title:'TEST ONLY stale Continue',lastMeaningfulAt:'2026-10-01T00:00:00Z',shortSummary:'Old guidance',destination:'/?view=journeys&family=journey&id=project-one'}],recent:[],favourites:[]},loading:false},notes:{items:[{id:'old-note',title:'TEST ONLY duplicated Note',rev:1,updatedAt:'2026-10-02T00:00:00Z',text:'Old duplicate',destination:'/?view=work&family=note&id=old-note'}],loading:false},serverReads:true,sourceFirstActive,continuity:React.createElement(ContinuitySourcesView,{read,selection:{learningSpace:'computing'},title:'Recorded work',emptyText:'No eligible sources',onRefresh:noop,onMore:noop}),onOpen:noop,onRefresh:noop,onMore:noop,onMoreFavourites:noop,onUnfavourite:noop}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'contextual-source-first-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const at='2026-11-01T12:00:00.000Z';
const note={title:'TEST ONLY new correction',source:{family:'note',id:'note-one',rev:3},author:'user',at,destination:'/?view=work&family=note&id=note-one',basis:'authored-writing',preview:{text:'The earlier explanation was not enough.',complete:true},paths:[],detailsDeferred:false};
const checkpoint={...note,title:'TEST ONLY earlier stage',source:{family:'journey',id:'project-one',rev:1,rendition:'edition-one'},destination:'/?view=journeys&family=journey&id=project-one&rendition=edition-one&stage=stage-one',basis:'saved-checkpoint',at:'2026-10-24T12:00:00Z',preview:{text:'Earlier uncertain reading.',complete:true},checkpoint:{id:'older-checkpoint',status:'active',nextAction:'Inspect one more source.'}};
const base={contract:'minamo.continuity-evidence.v1',asOf:at,items:[note,checkpoint],coverage:{completeWithinScope:true,moreAvailable:false,gaps:['external-unobserved'],notice:'Declared candidate scan complete.'}};

test('source-first Home displays newer independent writing before older checkpoint, without treating historical intention as current',()=>{
 const html=ui.home({key:'scope-a',loading:false,page:base});
 assert.ok(html.indexOf('TEST ONLY new correction')<html.indexOf('TEST ONLY earlier stage'));
 assert.doesNotMatch(html,/TEST ONLY stale Continue|TEST ONLY duplicated Note|id="continue-title"/,'the primary Home view has no competing stale Continue/Note ranking');
 assert.match(html,/Saved checkpoint/);assert.match(html,/Intention recorded then:/);assert.match(html,/Inspect one more source/);
 assert.match(html,/family=note&amp;id=note-one&amp;learningSpace=computing/);
 assert.match(html,/rendition=edition-one&amp;stage=stage-one&amp;learningSpace=computing/);
 assert.match(html,/External work, unsaved drafts and what GPT last saw remain unknown/);
 assert.doesNotMatch(html,/Suggested next step|you have completed|All caught up/);
});

test('a failed source-first read restores the old exact saved-work and Note entry points without pretending evidence is complete',()=>{
 const html=ui.home({key:'scope-a',loading:false,error:'Read unavailable'},false);
 assert.match(html,/Read unavailable/);assert.match(html,/TEST ONLY stale Continue/);assert.match(html,/TEST ONLY duplicated Note/);
 assert.match(html,/id="continue-title"/);
});

test('GPT continuation is an explicit six-source maximum selection with exact pins, not a copied Note summary or auto-saved intention',()=>{
 const page={...base,generation:'legacy@0',snapshotVersion:8,items:[{...note,preview:{text:'PRIVATE CANARY prose must not be copied.',complete:true}},checkpoint]};
 const html=ui.render({key:'owner-current',loading:false,page});assert.match(html,/Discuss selected sources with GPT/);
 const text=ui.buildContinuityGptBrief(page,{learningSpace:'computing'},[ui.evidenceChoiceKey(note),ui.evidenceChoiceKey(checkpoint)],{family:'journey',id:'project-one'});
 for(const needle of ['get_minamo_learning_context','scope:evidence','"id": "note-one"','"rendition": "edition-one"','"checkpointId": "older-checkpoint"','"generation": "legacy@0"','"snapshotVersion": 8','what GPT last saw'])assert.ok(text.includes(needle),needle);
 assert.doesNotMatch(text,/PRIVATE CANARY|The earlier explanation was not enough|TEST ONLY new correction|Old guidance/);
 assert.match(text,/Do not claim completion, mastery or observed execution/);
 assert.throws(()=>ui.buildContinuityGptBrief(page,{learningSpace:'computing'},[]),/Choose 1–6/);
 assert.throws(()=>ui.buildContinuityGptBrief(page,{learningSpace:'computing'},[ui.evidenceChoiceKey(note),ui.evidenceChoiceKey(note)]),/Choose 1–6 distinct/);
 assert.throws(()=>ui.buildContinuityGptBrief(page,{learningSpace:'computing'},['record:note:absent']),/chosen source has changed/);
});

test('partial GPT continuation remains explicit about unscanned work and rejects tampered source identity',()=>{
 const partial={...base,coverage:{...base.coverage,moreAvailable:true,completeWithinScope:false,gaps:['records-deferred','external-unobserved']}};
 const text=ui.buildContinuityGptBrief(partial,{learningSpace:'languages',language:'ja'},[ui.evidenceChoiceKey(note)]);
 assert.match(text,/"moreAvailable": true/);assert.match(text,/"language": "ja"/);
 const unsafe={...partial,items:[{...note,source:{...note.source,id:'bad/id'}}]};
 assert.throws(()=>ui.buildContinuityGptBrief(unsafe,{learningSpace:'all'},[ui.evidenceChoiceKey(unsafe.items[0])]),/chosen source has changed/);
});

test('empty bounded page never implies absence; later pages remain explicit and source links fail closed',()=>{
 const partial={...base,items:[],coverage:{...base.coverage,completeWithinScope:false,moreAvailable:true,nextCursor:'opaque-cursor',gaps:['records-deferred']}};
 const html=ui.render({key:'scope-a',loading:false,page:partial});
 assert.match(html,/No matching sources on this bounded page/);assert.match(html,/Check more recorded sources/);assert.match(html,/This view is partial/);
 const denied={...note,destination:'https://external.example/private'};
 assert.equal(ui.evidenceItemHref(denied,{learningSpace:'computing'}),undefined);
 assert.match(ui.render({key:'scope-a',loading:false,page:{...base,items:[denied]}}),/Cannot open original/);
});

test('a revoked edition or corrected checkpoint retains its status, but no stale or unverified destination',()=>{
 const unavailable={...checkpoint,destination:undefined,checkpoint:{...checkpoint.checkpoint,status:'unavailable'}};
 const html=ui.render({key:'scope-a',loading:false,page:{...base,items:[unavailable]}});
 assert.match(html,/Original edition unavailable/);assert.match(html,/Cannot open original/);assert.doesNotMatch(html,/Intention recorded then:/);
 const superseded={...checkpoint,checkpoint:{...checkpoint.checkpoint,status:'superseded'}};
 assert.match(ui.render({key:'scope-a',loading:false,page:{...base,items:[superseded]}}),/Superseded/);
 assert.doesNotMatch(ui.render({key:'scope-a',loading:false,page:{...base,items:[superseded]}}),/Intention recorded then:/);
});

test('changing owner, learning space or focus hides earlier source bodies even during loading or errors',()=>{
 const prior={key:'owner-a:project-one',loading:false,page:base,error:'old error'};
 assert.deepEqual(ui.currentEvidenceRead(prior,'owner-b:project-one',true),{key:'owner-b:project-one',loading:true});
 assert.deepEqual(ui.currentEvidenceRead(prior,prior.key,false),{key:prior.key,loading:false});
 const html=ui.render(ui.currentEvidenceRead(prior,'owner-b:project-one',true));
 assert.match(html,/Checking recorded sources/);assert.doesNotMatch(html,/TEST ONLY new correction|old error/);
});
