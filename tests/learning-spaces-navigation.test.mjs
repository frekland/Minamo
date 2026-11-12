import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LearningSpaceSelector} from './app/learning-space-ui.tsx';export * from './lib/learning-space-navigation';export const render=value=>renderToStaticMarkup(React.createElement(LearningSpaceSelector,{value,onChange:()=>{}}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'}});
const dir=mkdtempSync(join(tmpdir(),'learning-space-ui-')),file=join(dir,'ui.cjs');writeFileSync(file,compiled.outputFiles[0].text);const api=require(file);rmSync(dir,{recursive:true,force:true});
test('space and source-language selectors expose seven languages and distinct Mandarin script variants with accessible labels',()=>{
 const html=api.render({learningSpace:'languages',language:'zh-Hant'});assert.match(html,/aria-label="Learning space"/);assert.match(html,/aria-label="Study language"/);for(const [tag,label] of api.STUDY_LANGUAGE_OPTIONS){assert.ok(html.includes(`value="${tag}"`),label);}assert.match(html,/value="zh-Hant" selected=""/);assert.doesNotMatch(api.render({learningSpace:'computing'}),/Study language/);
});
test('scope switches preserve exact rendition, passage, stage and return links while removing incompatible language',()=>{
 const params=new URLSearchParams({view:'library',family:'article',id:'exact',rendition:'r-stable',section:'s',part:'p',start:'2',end:'5',stage:'stable-stage',returnJourney:'j',learningSpace:'languages',language:'ja'});
 api.appendLearningSpace(params,{learningSpace:'computing'});assert.equal(params.get('language'),null);assert.deepEqual(api.learningSpaceFromParams(params),{learningSpace:'computing'});for(const [key,value] of Object.entries({id:'exact',rendition:'r-stable',part:'p',stage:'stable-stage',returnJourney:'j',start:'2',end:'5'}))assert.equal(params.get(key),value);
 api.appendLearningSpace(params,{learningSpace:'languages',language:'zh-Hans'});assert.deepEqual(api.learningSpaceFromParams(params),{learningSpace:'languages',language:'zh-Hans'});
});
test('invalid device preferences never become arbitrary server query parameters or UI locales',()=>{
 assert.deepEqual(api.learningSpaceSelection({learningSpace:'secret',language:'en-US'}),{learningSpace:'all'});assert.deepEqual(api.learningSpaceSelection({learningSpace:'computing',language:'ja'}),{learningSpace:'computing'});assert.notEqual(api.learningSpaceKey({learningSpace:'languages',language:'ja'}),api.learningSpaceKey({learningSpace:'languages',language:'fr'}));assert.notEqual(api.learningSpacePreferenceKey('owner-a'),api.learningSpacePreferenceKey('owner-b'));
});
test('discovery surfaces send explicit server scope while exact reading and Notes keep persistent owners',()=>{
 const workspace=readFileSync('app/workspace.tsx','utf8');assert.match(workspace,/readGeneration\.current\+\+;pageAbort\.current\?\.abort\(\);searchGeneration\.current\+\+/);assert.match(workspace,/setScopeRecordKeys\(new Set\(\)\)/);assert.match(workspace,/appendLearningSpace\(new URLSearchParams\(\{q:term/);assert.match(workspace,/Linked material outside selected space/);assert.doesNotMatch(workspace,/<NotesPanel key=\{learningKey\}/);
 for(const path of ['app/learning-home.tsx','app/library-browser.tsx','app/personal-work-organiser.tsx','app/notes-panel.tsx'])assert.match(readFileSync(path,'utf8'),/learningSpaceParams\(learningSelection\)/,path);
 const page=readFileSync('app/page.tsx','utf8');assert.match(page,/readWorkspace\(scopedEnv,owner!,\{includeTrash:params\?\.view==='trash',\.\.\.learningSelection\}\)/);
});

test('copied and new-tab navigation keeps URL-specific language independent of device defaults',()=>{
 const href=api.learningSpaceHref('/?view=library&family=article&id=exact&rendition=r-stable&part=p#passage',{learningSpace:'languages',language:'ja'});const url=new URL(href,'https://minamo.invalid');assert.equal(url.searchParams.get('language'),'ja');assert.equal(url.searchParams.get('learningSpace'),'languages');assert.equal(url.searchParams.get('rendition'),'r-stable');assert.equal(url.hash,'#passage');assert.equal(api.learningSpaceHref('//external.invalid/',{learningSpace:'computing'}),'//external.invalid/');
});
