import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import{ContinuitySourcesView,currentEvidenceRead,evidenceItemHref}from'./app/continuity-sources.tsx';import{LearningHomeView}from'./app/learning-home.tsx';export{currentEvidenceRead,evidenceItemHref};const noop=()=>{};export const render=(read,selection={learningSpace:'computing'})=>renderToStaticMarkup(React.createElement(ContinuitySourcesView,{read,selection,title:'Recorded work',emptyText:'No eligible sources',onRefresh:noop,onMore:noop}));export const home=read=>renderToStaticMarkup(React.createElement(LearningHomeView,{selection:{learningSpace:'computing'},state:{key:'a',data:{asOf:'2026-11-01T12:00:00Z',continue:[],recent:[],favourites:[]},loading:false},notes:{items:[],loading:false},serverReads:true,continuity:React.createElement(ContinuitySourcesView,{read,selection:{learningSpace:'computing'},title:'Recorded work',emptyText:'No eligible sources',onRefresh:noop,onMore:noop}),onOpen:noop,onRefresh:noop,onMore:noop,onMoreFavourites:noop,onUnfavourite:noop}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'contextual-source-first-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const at='2026-11-01T12:00:00.000Z';
const note={title:'TEST ONLY new correction',source:{family:'note',id:'note-one',rev:3},author:'user',at,destination:'/?view=work&family=note&id=note-one',basis:'authored-writing',preview:{text:'The earlier explanation was not enough.',complete:true},paths:[],detailsDeferred:false};
const checkpoint={...note,title:'TEST ONLY earlier stage',source:{family:'journey',id:'project-one',rev:1,rendition:'edition-one'},destination:'/?view=journeys&family=journey&id=project-one&rendition=edition-one&stage=stage-one',basis:'saved-checkpoint',at:'2026-10-24T12:00:00Z',preview:{text:'Earlier uncertain reading.',complete:true},checkpoint:{id:'older-checkpoint',status:'active',nextAction:'Inspect one more source.'}};
const base={contract:'minamo.continuity-evidence.v1',asOf:at,items:[note,checkpoint],coverage:{completeWithinScope:true,moreAvailable:false,gaps:['external-unobserved'],notice:'Declared candidate scan complete.'}};

test('source-first Home displays newer independent writing before older checkpoint, without treating historical intention as current',()=>{
 const html=ui.home({key:'scope-a',loading:false,page:base});
 assert.ok(html.indexOf('TEST ONLY new correction')<html.indexOf('TEST ONLY earlier stage'));
 assert.ok(html.indexOf('Recorded work')<html.indexOf('id="continue-title"'),'read-only source evidence leads the old checkpoint Continue');
 assert.match(html,/Saved checkpoint/);assert.match(html,/Intention recorded then:/);assert.match(html,/Inspect one more source/);
 assert.match(html,/family=note&amp;id=note-one&amp;learningSpace=computing/);
 assert.match(html,/rendition=edition-one&amp;stage=stage-one&amp;learningSpace=computing/);
 assert.match(html,/External work, unsaved drafts and what GPT last saw remain unknown/);
 assert.doesNotMatch(html,/Suggested next step|you have completed|All caught up/);
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
