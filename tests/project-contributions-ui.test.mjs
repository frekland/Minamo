import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';

const require=createRequire(import.meta.url);
const React=require('react');
const {create,act}=require('react-test-renderer');
const wr=createRequire(require.resolve('wrangler/package.json'));
globalThis.IS_REACT_ACT_ENVIRONMENT=true;

const built=await wr('esbuild').build({
 stdin:{contents:`export {default} from './app/project-contributions.tsx'`,resolveDir:process.cwd()},
 bundle:true,format:'cjs',platform:'node',packages:'external',write:false,loader:{'.css':'empty'},
 plugins:[{name:'contribution-donors',setup(builder){
  builder.onResolve({filter:/^(\.\/project-speech|\.\.\/lib\/workspace-generation|\.\.\/lib\/client-id)$/},args=>({path:args.path,namespace:'contribution-donor'}));
  builder.onLoad({filter:/.*/,namespace:'contribution-donor'},args=>({
   contents:args.path.includes('workspace-generation')?`export const workspaceGenerationFromScope=()=> 'legacy@0';export const generationFetch=(scope,url,options)=>globalThis.__contributionFetch(scope,url,options)`:
    args.path.includes('client-id')?`export const clientId=()=> 'test-id'`:
    `import React from 'react';export function ProjectSpeech(){return React.createElement('button',{'aria-label':'Play contribution'});}`,
   loader:'js',resolveDir:process.cwd()
  }));
 }}]
});
mkdirSync('.sites-runtime',{recursive:true});
const bundle=resolve('.sites-runtime/project-contributions-ui.cjs');
writeFileSync(bundle,built.outputFiles[0].text);
const Contributions=require(bundle).default;
unlinkSync(bundle);

test('saved Japanese response is legible, correctly labelled and edited against exact revision',async()=>{
 let entry={id:'learner-example',revision:4,kind:'dialogue',cells:['この道をまっすぐ進んでください。','Go straight along this road.'],review:{result:'suggestion',revision:4,reviewedContributionRevision:4,explanation:'Check the direction.',basis:'gpt-provisional'},deleted:false,updatedAt:'2026-11-09T08:00:00Z'};
 const posts=[];
 globalThis.__contributionFetch=async (_scope,url,options)=>{
  if(!options)return {ok:true,json:async()=>({project:{revision:1},entries:[entry],truncated:false,nextCursor:null})};
  const payload=JSON.parse(options.body);posts.push(payload);
  entry={...entry,cells:payload.cells,revision:entry.revision+1,review:null};
  return {ok:true,json:async()=>({status:'committed'})};
 };
 let view;
 await act(async()=>{view=create(React.createElement(Contributions,{target:{projectId:'test',sectionId:'dialogue',partId:'turns'},kind:'dialogue',columns:['Japanese response','Translation / notes'],scope:'owner|legacy@0',projectRev:1,language:'ja'}));});
 const button=name=>view.root.findAllByType('button').find(b=>b.props['aria-label']===name||b.children.join('')===name);
 const summary=()=>view.root.findByProps({className:'pc-contribution-summary'});
 assert.equal(summary().props['aria-expanded'],false);
 await act(async()=>summary().props.onClick());
 assert.equal(view.root.findAllByProps({className:'pc-contribution-cell-label'}).map(n=>n.children.join('')).join('|'),'Japanese response|Translation / notes');
 assert.equal(view.root.findByProps({className:'pc-contribution-author'}).children.join(''),'You');
 assert.match(view.root.findByProps({className:'pc-contribution-author'}).props.title,/revision 4/);
 assert.ok(button('Show provisional GPT feedback (suggestion)'));
 await act(async()=>button('Edit your contribution').props.onClick());
 const field=view.root.findAllByType('textarea')[0];
 await act(async()=>field.props.onChange({target:{value:'この道をまっすぐ歩いてください。'}}));
 const form=view.root.findByType('form');
 await act(async()=>form.props.onSubmit({preventDefault(){}}));
 assert.equal(posts.length,1);
 assert.equal(posts[0].expectedRevision,4);
 assert.equal(posts[0].cells[0],'この道をまっすぐ歩いてください。');
 assert.equal(view.root.findAllByProps({className:'pc-contribution-cell-label'}).length,2);
 assert.equal(button('Show provisional GPT feedback (suggestion)'),undefined);
 await act(async()=>view.unmount());
});
