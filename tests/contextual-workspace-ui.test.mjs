import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import{WorkingContextHost,admittedWorkingRead,failedWorkingRead,combineWorkingEvidence}from'./app/working-context.tsx';import{experienceFromParams,carryWorkspaceExperience,contextHref,extendContextReturn,explicitContextSelection,workingContextReadKey}from'./lib/contextual-workspace-state.ts';export{admittedWorkingRead,failedWorkingRead,combineWorkingEvidence,experienceFromParams,carryWorkspaceExperience,contextHref,extendContextReturn,explicitContextSelection,workingContextReadKey};export const render=(home=true)=>renderToStaticMarkup(React.createElement(WorkingContextHost,{scope:'test-owner:epoch',selection:{learningSpace:'all'},serverReads:true,home,onStartNote:()=>{},onNavigate:()=>{},...(home?{}:{current:{family:'note',id:'one',title:'A Note',body:'test',rev:1,links:[]},onOpenNote:()=>{}})}));`,resolveDir:root},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const ui={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(ui,ui.exports,require);
const {render,admittedWorkingRead,failedWorkingRead,combineWorkingEvidence,experienceFromParams,carryWorkspaceExperience,contextHref,extendContextReturn,explicitContextSelection,workingContextReadKey}=ui.exports;

const note={family:'note',id:'first',rendition:'edition-a'},article={family:'article',id:'library',rendition:'edition-b'};
test('context route is explicit, reversible, and does not create a separate data route',()=>{
 assert.equal(experienceFromParams(new URLSearchParams('workspace=context&view=library')),'context');
 assert.equal(experienceFromParams(new URLSearchParams('workspace=classic')),'classic');
 assert.equal(experienceFromParams(new URLSearchParams('workspace=untrusted')),'classic');
 assert.equal(carryWorkspaceExperience(new URLSearchParams('view=work&id=first'),new URLSearchParams('workspace=context')).get('workspace'),'context');
 assert.equal(carryWorkspaceExperience(new URLSearchParams('view=work'),new URLSearchParams('workspace=classic')).has('workspace'),false);
 assert.equal(contextHref('/?view=library&family=article&id=one&rendition=e1'),'/?view=library&family=article&id=one&rendition=e1&workspace=context');
 assert.equal(contextHref('https://example.com/'),'https://example.com/');
});
test('transient return stack is bounded, exact, and reversible without a saved link',()=>{
 const start={view:'home'},read={view:'library',id:'library',target:{recordFamily:'article',rendition:'edition-b',sectionId:'intro'}};
 let stack=extendContextReturn([],start,read);
 assert.deepEqual(stack,[start]);
 stack=extendContextReturn(stack,read,{view:'work',id:'first',target:{recordFamily:'note'}});
 assert.deepEqual(stack,[start,read]);
 assert.deepEqual(extendContextReturn(stack,read,read),stack);
 for(let i=0;i<20;i++)stack=extendContextReturn(stack,{view:'library',id:'item-'+i},{view:'work',id:'item-'+i});
 assert.equal(stack.length,8);
});
test('comparison selection is explicit, stable and bounded, including exact editions',()=>{
 assert.deepEqual(explicitContextSelection(note,[note,article]),[note,article]);
 const refs=Array.from({length:10},(_,i)=>({family:'note',id:'n-'+i}));
 assert.equal(explicitContextSelection(undefined,refs).length,6);
 assert.notEqual(workingContextReadKey('owner-a','computing',[note]),workingContextReadKey('owner-b','computing',[note]));
 assert.notEqual(workingContextReadKey('owner-a','computing',[note]),workingContextReadKey('owner-a','languages',[note]));
 assert.notEqual(workingContextReadKey('owner-a','computing',[note]),workingContextReadKey('owner-a','computing',[article]));
});
test('permission or generation failures never expose previous source excerpts',()=>{
 const previous={key:'owner-scope',loading:false,page:{selected:[{preview:{text:'private words'}}]}};
 assert.deepEqual(admittedWorkingRead(previous,'other-owner',true),{key:'other-owner',loading:true});
 assert.deepEqual(failedWorkingRead('owner-scope',Object.assign(new Error('Permission changed'),{status:403})),{key:'owner-scope',loading:false,error:'Permission changed'});
 assert.equal(failedWorkingRead('owner-scope',new Error('Generation changed')).page,undefined);
 assert.equal(admittedWorkingRead(previous,'owner-scope',false).page,undefined);
});
const page=(version,items,cursor)=>({contract:'minamo.working-context.v1',generation:'g-1',snapshotVersion:version,selectionIsSaved:false,selected:[{status:'available',requested:note}],relations:[],lastSeenByGpt:'unknown',coverage:{completeWithinScope:false},evidence:{contract:'minamo.continuity-evidence.v1',items,coverage:{nextCursor:cursor,moreAvailable:!!cursor}}});
const item=(id)=>({basis:'authored-writing',source:{family:'note',id,rev:1},title:id});
test('history pagination preserves only matching canonical snapshots',()=>{
 const merged=combineWorkingEvidence(page(5,[item('one')],'next'),page(5,[item('one'),item('two')],null));
 assert.deepEqual(merged.evidence.items.map(item=>item.source.id),['one','two']);
 assert.throws(()=>combineWorkingEvidence(page(5,[item('one')],'next'),page(6,[item('two')],null)),/Restart/);
 assert.throws(()=>combineWorkingEvidence(page(5,[item('one')],'next'),{...page(5,[item('two')],null),generation:'g-2'}),/Restart/);
});
test('capture-first landing is an action, not a second editor or status dashboard',()=>{
 const markup=render(true);
 assert.match(markup,/Start writing a Note/);
 assert.match(markup,/Resume from recorded work/);
 assert.match(markup,/Library sources/);
 assert.match(markup,/href="\/\?view=library&amp;learningSpace=all&amp;workspace=context"/,'native new-tab Explore links retain the exact contextual route');
 assert.doesNotMatch(markup,/Saved successfully|You completed|You mastered/);
 const active=render(false);
 assert.match(active,/Blank Note/);
 assert.match(active,/Edit this Note/);
 assert.match(active,/Source and saved connections/);
 const workspace=readFileSync(resolve(root,'app/workspace.tsx'),'utf8');
 assert.equal((workspace.match(/<NotesPanel /g)??[]).length,1,'the save coordinator must mount once');
 assert.match(workspace,/workspaceExperience==='context'/);
 assert.match(workspace,/readingTarget\.rendition/);
});
