import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const bundled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import ProjectSections from './app/project-sections';export const render=props=>renderToStaticMarkup(React.createElement(ProjectSections,props));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const directory=mkdtempSync(join(tmpdir(),'pr88-project-renderer-')),entry=join(directory,'renderer.cjs');
writeFileSync(entry,bundled.outputFiles[0].text);const {render}=require(entry);rmSync(directory,{recursive:true,force:true});

const record={family:'journey',id:'project-a',title:'Test layout',rev:3,rendition:'project-edition',body:'Authored introduction.',description:'',projectDescription:'',links:[],sections:[
 {id:'first',title:'First lesson',parts:[{id:'a',kind:'paragraph',text:'Visible first content.'}]},
 {id:'second',title:'Second lesson',parts:[{id:'b',kind:'paragraph',text:'Second lesson content.'}]},
 {id:'private',title:'Hidden lesson',parts:[{id:'c',kind:'paragraph',text:'Hidden content marker.'}]}
],createdAt:'2026-11-01T00:00:00Z',updatedAt:'2026-11-01T00:00:00Z',actor:'gpt',trashedAt:null};
const layout={version:1,sections:[
 {id:'intro',title:'Introduction',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['a','b']}]},
 {id:'concealed',title:'Concealed group',pattern:'guide',hidden:true,slots:[{id:'primary',role:'primary',blockIds:['c']}]}
],blocks:[{id:'a',sectionId:'first',width:'split',pinned:true},{id:'b',sectionId:'second',hidden:true},{id:'c',sectionId:'private'}],favourites:['intro','a']};
const props={article:{...record,projectComposition:layout},records:[record],draftScope:'test-pr88',onCommand:async()=>{throw Error('No writes in SSR');}};

test('Project renderer uses saved layout visibility, width, pinned and favourite destinations without leaking hidden content',()=>{
 const html=render(props);
 assert.match(html,/aria-label="Project contents"/);
 assert.match(html,/href="#pc-section-intro"/);
 assert.match(html,/href="#pc-block-a"/);
 assert.match(html,/pc-width-split pc-is-pinned/);
 assert.match(html,/Visible first content/);
 assert.doesNotMatch(html,/Second lesson content|Hidden content marker|Concealed group/);
});

test('Collapsed sections keep a labelled expansion control but do not display their block contents',()=>{
 const collapsed={...layout,sections:[{...layout.sections[0],collapsed:true},layout.sections[1]]};
 const html=render({...props,article:{...record,projectComposition:collapsed}});
 assert.match(html,/aria-label="Expand Introduction" aria-expanded="false"/);
 assert.doesNotMatch(html,/Visible first content/);
});
