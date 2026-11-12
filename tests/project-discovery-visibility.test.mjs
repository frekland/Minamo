import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import HomeLanding from './app/home-landing';
import ProjectsIndex,{sortProjectRecords} from './app/projects-index';
import {homeRecentNotes} from './app/learning-home';
import {LearningSpaceContext} from './app/learning-space-ui';
export {sortProjectRecords,homeRecentNotes};
export const renderHome=({projects,articles=[],questions=[],notes=[],selection={learningSpace:'all'},visits=[]})=>renderToStaticMarkup(React.createElement(HomeLanding,{selection,scope:'owner:fixture',browse:{key:'fixture',projects,articles,questions,loading:false},notes,notesLoading:false,visits,serverReads:true,operations:[],favouritesLoading:false,onOpen:()=>{},onRefresh:()=>{},onMoreFavourites:()=>{},onUnfavourite:()=>{},onConfirmUnfavourite:()=>{},onCancelUnfavourite:()=>{},onRetry:()=>{},onCheck:()=>{},onRefreshFavourite:()=>{}}));
export const renderCatalogue=({records,selection={learningSpace:'all'}})=>renderToStaticMarkup(React.createElement(LearningSpaceContext.Provider,{value:selection},React.createElement(ProjectsIndex,{records,scope:'owner:fixture',serverReads:false,onNavigate:()=>{},onCreate:()=>{}})));
`,resolveDir:root},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const module={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(module,module.exports,require);
const {sortProjectRecords,homeRecentNotes,renderHome,renderCatalogue}=module.exports;
const record=(id,synthetic=false,family='journey',updatedAt='2026-11-09T00:00:00Z')=>({family,id,title:id,body:'A substantial example with retained revisions.',updatedAt,rev:2,actor:'user',synthetic});

test('all accessible Projects, including constructed examples, remain in the catalogue; Trash stays out',()=>{
 const result=sortProjectRecords([record('science'),record('radio-island',true),{...record('old',true),trashedAt:'2026-11-10'},record('reading',true,'article')]);
 assert.deepEqual(result.map(item=>item.id),['radio-island','science']);
 const html=renderCatalogue({records:result});
 assert.match(html,/radio-island/);
 assert.doesNotMatch(html,/Constructed example/,'Lab catalogue can be assessed without repeated synthetic badges');
 assert.match(html,/science/);
 assert.doesNotMatch(html,/<h2>old<\/h2>/);
});

test('Home may show a short Project shelf, but it includes recent constructed examples and a full-directory route',()=>{
 const projects=[record('creative-framing',true),record('radio-island',true),record('science'),record('japanese',true)];
 const visits=[{family:'journey',id:'japanese',at:'2026-11-10T10:00:00Z'}];
 const html=renderHome({projects,visits});
 assert.match(html,/Pick up where you left off/);
 assert.match(html,/japanese/);
 assert.doesNotMatch(html,/CONSTRUCTED EXAMPLE/,'Lab Home retains constructed records without intrusive badges');
 assert.match(html,/Browse all Projects/);
 assert.equal((html.match(/home-landing-project-card/g)??[]).length,3);
 assert.doesNotMatch(html,/<h3>science<\/h3>/,'only three featured cards belong on Home');
});

test('Home Library and Notes retain constructed examples without repeating provenance labels in the Lab chrome',()=>{
 const notes=homeRecentNotes([record('real',false,'note'),record('constructed',true,'note','2026-11-10T10:00:00Z')]);
 assert.equal(notes.length,2);
 assert.equal(notes[0].synthetic,true);
 const html=renderHome({projects:[record('science')],articles:[record('photo-method',true,'article')],notes});
 assert.match(html,/photo-method/);
 assert.match(html,/constructed/);
 assert.doesNotMatch(html,/Constructed example/);
});

test('Project catalogue issues family-filtered, cursor-aware server reads independent of the workspace record page',()=>{
 const source=readFileSync(resolve(root,'app/projects-index.tsx'),'utf8');
 assert.match(source,/family:'journey',limit:'40'/);
 assert.match(source,/cursor,\.\.\.learningSpaceParams\(selection\)/);
 assert.match(source,/Search older Projects/);
 assert.match(source,/livePageKey\.current!==requestedKey/,'discard stale pages after scope or search changes');
});
test('Lab detail pages do not place an acceptance warning above the content',()=>{
 const workspace=readFileSync(resolve(root,'app/workspace.tsx'),'utf8');
 assert.doesNotMatch(workspace,/TEST ONLY · synthetic record\. This content is for visual acceptance/);
 assert.doesNotMatch(workspace,/wp-test-record-label/);
});

test('changing learning space stays on a collection overview rather than throwing the user back Home',()=>{
 const workspace=readFileSync(resolve(root,'app/workspace.tsx'),'utf8');
 assert.match(workspace,/navigate\(!selectedId&&\['home','journeys','library','work','sources','investigations'\]\.includes\(view\)\?view:'home'\)/);
 const catalogue=readFileSync(resolve(root,'app/projects-index.tsx'),'utf8');
 assert.match(catalogue,/Projects without an assigned subject/);
 assert.match(catalogue,/Choose All learning to see every Project/);
});
