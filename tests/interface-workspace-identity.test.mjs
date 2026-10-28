import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
function observeActivityBoundary(source){
 const declaration=/const ActivityStudio=retryableFeature\(\(\)=>import\('\.\/activity-studio'\),'Activity Studio'\);/;
 assert.match(source,declaration,'Identity probe must replace the actual ActivityStudio child boundary');
 const tools=/const ToolsPanel=retryableFeature\(\(\)=>import\('\.\/tools-panel'\),'Practical tools'\);/;
 assert.match(source,tools,'Visibility probe must replace the actual ToolsPanel child boundary');
 return source.replace(declaration,'const ActivityStudio=({record})=><div data-studio-edition={record.rendition} data-studio-title={record.title}/>;').replace(tools,'const ToolsPanel=()=> <div data-tools-probe="true"/>;');
}
// Observe the actual Workspace's lazy-child props without pretending SSR is browser acceptance.
const built=await wr('esbuild').build({stdin:{contents:"import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Workspace from './app/workspace';export const render=props=>renderToStaticMarkup(React.createElement(Workspace,props));",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'},plugins:[{name:'observe-activity-boundary',setup(build){build.onLoad({filter:/\/app\/workspace\.tsx$/},args=>({contents:observeActivityBoundary(readFileSync(args.path,'utf8')),loader:'tsx'}));}}]});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const ui=mod.exports;
const base={family:'experiment',id:'synthetic-edition-activity',title:'CURRENT SYNTHETIC ACTIVITY',body:'Current independent source.',links:[],rev:2,rendition:'current-activity-edition',actor:'system',synthetic:true,createdAt:'2026-10-25T00:00:00Z',updatedAt:'2026-10-25T00:00:00Z',sections:[{id:'activity',title:'Exact source',parts:[{id:'task',kind:'paragraph',text:'CURRENT CANONICAL SOURCE'}]}],activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'Synthetic task',blocks:[{id:'task',kind:'instruction',text:'Current task'}]}};
const props={initialRecords:[base],initialView:'tools',initialId:base.id,initialFamily:'experiment',authenticated:true,activityStudioEnabled:true,draftScope:'synthetic-interface-identity'};
test('retained Activity uses exactly the Reader edition at the actual Workspace child boundary',()=>{
 const retained={...base,rev:1,rendition:'retained-activity-edition',title:'RETAINED SYNTHETIC ACTIVITY',sections:[{id:'activity',title:'Exact source',parts:[{id:'task',kind:'paragraph',text:'RETAINED CANONICAL SOURCE'}]}]};
 const html=ui.render({...props,initialArticle:retained,initialReadingTarget:{recordFamily:'experiment',rendition:retained.rendition,sectionId:'activity',partId:'task'}});
 assert.match(html,/data-studio-edition="retained-activity-edition"/);assert.doesNotMatch(html,/data-studio-edition="current-activity-edition"/);assert.match(html,/RETAINED CANONICAL SOURCE/);assert.match(html,/if-canonical-reading" open/);
});
test('unresolved, wrong-family and wrong-edition retained targets never mount current Studio',()=>{
 for(const initialArticle of [null,{...base,rendition:'wrong-edition'},{...base,family:'article',rendition:'requested-edition'}]){
  const html=ui.render({...props,initialArticle,initialReadingTarget:{recordFamily:'experiment',rendition:'requested-edition'}});assert.doesNotMatch(html,/data-studio-edition=/);
 }
});
test('ordinary Activity keeps canonical passages available without mounting the unrelated tool UI visibly',()=>{
 const html=ui.render(props);assert.match(html,/data-studio-edition="current-activity-edition"/);assert.match(html,/Read exact Activity passages/);assert.match(html,/<div hidden="" class="v2-persistent-tools"><div data-tools-probe="true"/);assert.equal((html.match(/class="v2-note-dock/g)||[]).length<=1,true);
});
