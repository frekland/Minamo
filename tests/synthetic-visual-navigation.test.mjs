import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Workspace from './app/workspace.tsx';export const render=props=>renderToStaticMarkup(React.createElement(Workspace,props));",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const mod={exports:{}};
new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
const {render}=mod.exports;

const project={family:'journey',id:'TEST-ONLY-m2m-r3-project',title:'TEST ONLY Mood-to-Music',body:'A fictional project for continuation acceptance.',links:[],rev:5,rendition:'r-test-project',actor:'user',synthetic:true,createdAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-31T00:00:00Z',sections:[]};
const testScenario={projectId:project.id,title:project.title,phase:'K',epoch:3};
const props={initialRecords:[project],initialView:'journeys',authenticated:true,draftScope:'test-only-visual-navigation'};

test('owner-confirmed test context adds an ordinary-app Project entry and unmistakable label',()=>{
 const html=render({...props,initialTestScenario:testScenario});
 assert.match(html,/Owner-only synthetic test Project/);
 assert.match(html,/Phase K · epoch 3/);
 assert.match(html,/Open test Project/);
 assert.match(html,/projects-index-test-label">TEST ONLY/);
 assert.match(html,/TEST ONLY Mood-to-Music/);
});

test('without server-confirmed owner context, Projects are still browsable but no privileged fixture entry appears',()=>{
 const html=render(props);
 assert.doesNotMatch(html,/Owner-only synthetic test Project/);
 assert.match(html,/projects-index-test-label">TEST ONLY/);
});

test('signed-out UI never renders a privileged fixture entry even if given one',()=>{
 const html=render({...props,authenticated:false,initialTestScenario:testScenario});
 assert.doesNotMatch(html,/Owner-only synthetic test Project/);
 assert.match(html,/Sign in with ChatGPT/);
});

test('ordinary Projects are not falsely labeled as synthetic',()=>{
 const html=render({...props,initialRecords:[{...project,id:'ordinary-project',title:'Real Project',synthetic:false}]});
 assert.doesNotMatch(html,/projects-index-test-label/);
 assert.match(html,/Real Project/);
});
