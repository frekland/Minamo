import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:'export * from "./lib/ux-navigation.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'ux-navigation-')),file=join(dir,'sdk.cjs');writeFileSync(file,compiled.outputFiles[0].text);const api=require(file);rmSync(dir,{recursive:true,force:true});
const task={family:'journey',id:'task',stageId:'stage-1',rendition:'exact-r1'};
const record={family:'journey',id:'task',title:'Route',links:[],body:'',learningScope:{version:1,spaces:['computing'],provenance:'authored'}};
test('explicit scope changes retain compatible task identity and withhold unknown or foreign context',()=>{
 assert.deepEqual(api.taskInLearningSpace(task,record,{learningSpace:'computing'}),task);
 assert.deepEqual(api.taskInLearningSpace(task,record,{learningSpace:'all'}),task);
 assert.equal(api.taskInLearningSpace(task,record,{learningSpace:'languages',language:'ja'}),null);
 assert.equal(api.taskInLearningSpace(task,null,{learningSpace:'computing'}),null);
 assert.equal(api.taskInLearningSpace(task,{...record,id:'different'},{learningSpace:'computing'}),null);
 const japanese={...record,learningScope:{version:1,spaces:['languages'],languages:['ja'],provenance:'authored'}};
 assert.deepEqual(api.taskInLearningSpace(task,japanese,{learningSpace:'languages',language:'ja'}),task);
 assert.equal(api.taskInLearningSpace(task,japanese,{learningSpace:'languages',language:'de'}),null);
});
test('numbered route collection displays natural phase and numeric title order without changing authored stage identity',()=>{
 const rows=['Bandit Phase IV · Advanced','Bandit Phase II · Bytes','Bandit Phase I · Terminal','Bandit Phase III · Systems'].map(title=>({title}));
 assert.deepEqual(rows.sort(api.compareLearningTitles).map(r=>r.title.match(/Phase (\w+)/)[1]),['I','II','III','IV']);
 assert.deepEqual([{title:'Project 10'},{title:'Project 2'}].sort(api.compareLearningTitles).map(r=>r.title),['Project 2','Project 10']);
});
test('native save review is bound to exact impact token and ordinary tool navigation clears stale selected article',()=>{
 const source=readFileSync('app/workspace.tsx','utf8');
 assert.match(source,/reviewedEditToken===currentEditToken/);
 assert.match(source,/originalSections=\{record\?\.sections\?\?\[\]\}/);
 assert.match(source,/onEditReviewChange=\{setEditReviewed\}/);
 assert.match(source,/event\.preventDefault\(\);navigate\('tools'\)/);
 assert.doesNotMatch(source,/navigate\('tools',current\?\.id/);
});
