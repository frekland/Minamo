import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import ProjectSections from './app/project-sections.tsx';export const render=(props)=>renderToStaticMarkup(React.createElement(ProjectSections,props));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"','import.meta.env.DEV':'false'}});
const dir=mkdtempSync(join(tmpdir(),'minamo-project-management-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const {render}=require(file);rmSync(dir,{recursive:true,force:true});
const record={family:'journey',id:'project',title:'A cross-domain Project',body:'An independent thought.',rev:1,rendition:'r-project',sections:[{id:'s',title:'One thought',parts:[{id:'p',kind:'paragraph',text:'An independent thought.'}]}],links:[],updatedAt:'2026-11-11T00:00:00Z'};

test('native Project options expose the shared management dialog without adding a compulsory workflow',()=>{
 const props={article:record,records:[record],draftScope:'owner:generation',onCommand:async()=>({status:'committed'}),onManage:()=>{}};
 const html=render(props);
 assert.match(html,/Manage Project/);
 assert.match(html,/GPT context for this Project/);
 assert.match(html,/Edit Project details/);
 assert.doesNotMatch(render({...props,onManage:undefined}),/Manage Project/);
 const synthetic={...record,title:'A cross-domain Project (TEST ONLY)',synthetic:true};
 assert.match(render({...props,article:synthetic}),/<h1>A cross-domain Project<\/h1>/);
 assert.equal(synthetic.title,'A cross-domain Project (TEST ONLY)');
});
