import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'import React from "react";import{renderToStaticMarkup}from"react-dom/server";import{PracticePanel,PracticeAttemptSummary}from"./app/practice-panel";export * from "./lib/practice-ui";export * from "./lib/practice";export function render(block){return renderToStaticMarkup(React.createElement(PracticePanel,{block,activity:{id:"synthetic",rendition:"r-exact",title:"TEST ONLY practice"},scope:"synthetic-owner"}));}export function saved(record,exercises){return renderToStaticMarkup(React.createElement(PracticeAttemptSummary,{record,exercises,scope:"synthetic-owner"}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const directory=mkdtempSync(join(tmpdir(),'practice-ux-')),file=join(directory,'ux.cjs');writeFileSync(file,built.outputFiles[0].text);const ui=require(file);rmSync(directory,{recursive:true,force:true});
const ordering={version:1,id:'order',kind:'ordering',language:'ja',prompt:'Put the two requests in order.',options:[{id:'first',label:'窓を開けてください。'},{id:'then',label:'それから、本を読んでください。'}],acceptedOrders:[['first','then']]};
const choice={version:1,id:'choice',kind:'choice',language:'ja',prompt:'Ask for repetition.',multiple:false,options:[{id:'repeat',label:'もう一度お願いします。'},{id:'understood',label:'わかりました。'}],correctIds:['repeat']};
const matching={version:1,id:'match',kind:'matching',language:'de',prompt:'Match each expression.',left:[{id:'one',label:'Guten Morgen'},{id:'two',label:'Gute Nacht'}],right:[{id:'morning',label:'Good morning'},{id:'night',label:'Good night'}],pairs:[{left:'one',right:'morning'},{left:'two',right:'night'}]};
const cloze={version:1,id:'text',kind:'cloze',language:'ja',prompt:'Complete 窓を＿＿。',accepted:['開けてください','あけてください'],comparison:{normalization:'NFC',trim:true,caseSensitive:true,pinyin:'literal'}};
const practice={version:1,responses:[{id:'answer-old',itemId:'text',revision:1,input:'old answer'}],feedback:[{id:'feedback-old',responseId:'answer-old',responseRevision:1,basis:'gpt-provisional',verdict:'uncertain',explanation:'Keep uncertainty.'}],corrections:[],reviewEvents:[],interactions:[]};
function record(overrides={}){return {family:'run',id:'saved',title:'TEST ONLY saved answer',body:'',links:[],createdAt:'2026-10-26T00:00:00.000Z',updatedAt:'2026-10-26T00:00:00.000Z',rev:4,rendition:'saved-r4',trashedAt:null,synthetic:true,actor:'user',attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:'synthetic',rendition:'r-exact'},state:'submitted',hintsRevealed:[],evidence:[],practice},...overrides};}
test('deliberately revealed choice/order/matching answers resolve exact public labels rather than internal tokens',()=>{
 assert.deepEqual(ui.presentPracticeAnswer(choice,['repeat']).groups,[['もう一度お願いします。']]);
 assert.deepEqual(ui.presentPracticeAnswer(ordering,[['first','then']]).groups,[['窓を開けてください。','それから、本を読んでください。']]);
 assert.deepEqual(ui.presentPracticeAnswer(matching,matching.pairs).groups,[['Guten Morgen → Good morning','Gute Nacht → Good night']]);
 assert.deepEqual(ui.presentPracticeAnswer(cloze,cloze.accepted).groups,[['開けてください'],['あけてください']]);
 assert.throws(()=>ui.presentPracticeAnswer(choice,['unknown']),/exact edition/);
});
test('fresh order is deterministically rotated, confirmation is deliberate, and retained answers are never shuffled',()=>{
 const original=structuredClone(ordering),initial=ui.initialPracticeInput(ordering);assert.deepEqual(initial,['then','first']);assert.deepEqual(ordering,original);
 assert.deepEqual(ui.initialPracticeInput(ordering),initial);assert.equal(ui.hasPracticeResponse(ordering,initial,false),false);assert.equal(ui.hasPracticeResponse(ordering,initial,true),true);
 assert.deepEqual(ui.restorePracticeInput(ordering,['first','then']),['first','then']);assert.equal(ui.restorePracticeInput(ordering,['first','first']),null);
});
test('blank and incomplete drafts cannot become checked or saved answers; local matching can remain unfinished',()=>{
 assert.equal(ui.hasPracticeResponse(cloze,' \n',true),false);assert.equal(ui.hasPracticeResponse(choice,[],true),false);assert.equal(ui.hasPracticeResponse(choice,'repeat',true),false);
 const initial=ui.initialPracticeInput(matching);assert.deepEqual(initial,[{left:'one',right:''},{left:'two',right:''}]);assert.deepEqual(ui.restorePracticeInput(matching,initial),initial);assert.equal(ui.hasPracticeResponse(matching,initial,true),false);assert.equal(ui.hasPracticeResponse(matching,matching.pairs,true),true);
 assert.equal(ui.restorePracticeInput(choice,['not-an-option']),null);
});
test('question rendering withholds complete answers and puts English controls outside target-language expressions',()=>{
 const html=ui.render({id:'q',kind:'practice',exercise:ui.publicExercise(cloze)});assert.match(html,/class="practice-panel" lang="en"/);assert.match(html,/<textarea lang="ja"/);assert.doesNotMatch(html,/開けてください|あけてください/);assert.match(html,/Enter or choose a response before checking or saving/);assert.match(html,/disabled=""[^>]*>Save answer/);
 const match=ui.render({id:'q',kind:'practice',exercise:ui.publicExercise(matching)});assert.match(match,/<option value="" lang="en" selected="">Choose a match/);
});
test('only a definitive operation result permits reconciliation; timeouts, absent receipts and generic HTTP409 stay frozen',()=>{
 for(const [receipt,status]of[[undefined,undefined],[undefined,404],[undefined,409],[undefined,503],[{status:'not-found'},undefined]])assert.equal(ui.mayReconcilePracticeWrite(ui.practiceWriteResolution(receipt,status)),false);
 assert.equal(ui.practiceWriteResolution({status:'committed'}),'committed');assert.equal(ui.mayReconcilePracticeWrite('committed'),false);
 assert.equal(ui.mayReconcilePracticeWrite(ui.practiceWriteResolution({status:'conflict'})),true);
 assert.equal(ui.mayReconcilePracticeWrite(ui.practiceWriteResolution(undefined,400)),true);assert.equal(ui.mayReconcilePracticeWrite(ui.practiceWriteResolution(undefined,422)),true);
});
test('reconciliation readback must retain Activity edition and current access',()=>{
 const saved=record();assert.equal(ui.matchesPracticeActivity(saved,{id:'synthetic',rendition:'r-exact'}),true);
 for(const modified of [record({trashedAt:'2026-10-26T00:00:01.000Z'}),record({family:'note'}),record({attempt:{...saved.attempt,activity:{...saved.attempt.activity,rendition:'different'}}})])assert.equal(ui.matchesPracticeActivity(modified,{id:'synthetic',rendition:'r-exact'}),false);
});
test('fresh answer revision appends on the same practice chronology and never moves old feedback',()=>{
 const original=structuredClone(practice),input=[{left:'one',right:'morning'}],next=ui.appendPracticeResponse(practice,'text',input,'answer-new');input[0].right='night';
 assert.deepEqual(practice,original);assert.equal(next.responses[1].revision,2);assert.equal(next.responses[1].id,'answer-new');assert.equal(next.responses[1].input[0].right,'morning');assert.deepEqual(next.feedback,original.feedback);assert.equal(next.feedback[0].responseId,'answer-old');assert.throws(()=>ui.appendPracticeResponse(practice,'text','x','answer-old'),/new identity/);
 ui.validatePracticeAttempt(ui.appendPracticeResponse(practice,'text','開けてください','answer-new'),[cloze],practice);
});
test('saved structured answers display labels and every retained answer has an explicit review/revision target',()=>{
 const saved=record({attempt:{...record().attempt,practice:{...practice,responses:[{id:'order-response',itemId:'order',revision:1,input:['first','then']}],feedback:[]}}});
 const html=ui.saved(saved,[ordering]);assert.match(html,/窓を開けてください/);assert.match(html,/それから、本を読んでください/);assert.doesNotMatch(html,/\[&quot;first&quot;|\[\s*&quot;first&quot;/);assert.match(html,/Ask GPT to review this answer/);assert.match(html,/Revise this answer/);
});
