import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import LearningConnections from './app/learning-links.tsx';import ReferencePreview from './app/reference-preview.tsx';import {LearningSpaceContext} from './app/learning-space-ui.tsx';export * from './lib/note-learning-visibility.ts';export {eligibleReferencePreview} from './app/reference-preview.tsx';export const reference=(record,selection)=>renderToStaticMarkup(React.createElement(LearningSpaceContext.Provider,{value:selection},React.createElement(ReferencePreview,{target:{family:record.family,id:record.id,rendition:record.rendition},localRecord:record,scope:'TEST-ONLY-owner',onOpen:()=>{},onClose:()=>{},onNote:()=>{}})));export * from './lib/scoped-learning-links.ts';export {noteSaveCommand,savedNoteDraft,editedNoteDraft} from './lib/note-sync.ts';export const connections=(record,records,selection)=>renderToStaticMarkup(React.createElement(LearningSpaceContext.Provider,{value:selection},React.createElement(LearningConnections,{record,records,onNavigate:()=>{}})));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'space-notes-')),entry=join(dir,'ui.cjs');writeFileSync(entry,compiled.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const scope=space=>({version:1,spaces:[space],provenance:'authored'}),computing={learningSpace:'computing'},languages={learningSpace:'languages'};
const note=(id,space)=>({family:'note',id,title:'TEST ONLY '+id,body:'Independent retained writing '+id,rev:1,links:[],sections:[],learningScope:scope(space),trashedAt:null});
const draft=(overrides={})=>({title:'Retained draft',body:'Unsent original words',links:[],baseRev:0,dirty:true,intent:'create',bodyFormat:'markdown-v1',sequence:3,...overrides});

test('saved Note metadata wins over stale local draft scope without destroying original draft or operation',()=>{
 const local=draft({learningScope:scope('computing')}),saved=note('language-note','languages'),bytes=JSON.stringify(local);
 assert.equal(ui.noteVisibleInLearningSpace(local,saved,[saved],computing),false);
 assert.equal(ui.noteVisibleInLearningSpace(local,saved,[saved],languages),true);
 assert.equal(JSON.stringify(local),bytes);
 assert.equal(ui.noteVisibleInLearningSpace(local,{...saved,trashedAt:'now'},[saved],languages),false);
});
test('blank draft creation captures original subject so later saves cannot acquire the new subject',()=>{
 const local=draft({learningScope:ui.newNoteLearningScope(computing)});
 assert.equal(ui.noteVisibleInLearningSpace(local,undefined,[],computing),true);
 assert.equal(ui.noteVisibleInLearningSpace(local,undefined,[],languages),false);
 const command=ui.noteSaveCommand(local,'draft-original','same-operation','saved-original');
 assert.deepEqual(command.data.learningScope,scope('computing'));
 assert.equal(command.operationId,'same-operation');assert.equal(command.id,'saved-original');assert.equal(command.data.body,'Unsent original words');
 // Merely choosing Languages cannot reclassify an existing saved Note either.
 const saved=ui.savedNoteDraft(note('old-computing','computing')),updated=ui.noteSaveCommand(ui.editedNoteDraft(saved,{body:'Retained edit'}),'old-computing','update-operation','unused');
 assert.equal(updated.action,'update');assert.equal(updated.data.learningScope,undefined);
});
test('legacy context drafts inherit only exact known classifications; genuinely unclassified writing remains recoverable',()=>{
 const source={...note('source','computing'),family:'article'},legacy=draft({links:[{family:'article',id:'source'}]});
 assert.equal(ui.noteVisibleInLearningSpace(legacy,undefined,[source],computing),true);assert.equal(ui.noteVisibleInLearningSpace(legacy,undefined,[source],languages),false);
 assert.equal(ui.noteVisibleInLearningSpace(draft(),undefined,[],computing),false);assert.equal(ui.noteVisibleInLearningSpace(draft(),undefined,[],languages),false);
 assert.equal(ui.noteVisibleInLearningSpace(draft(),undefined,[],{learningSpace:'all'}),true);assert.equal(ui.noteVisibleInLearningSpace(draft(),undefined,[],{learningSpace:'unclassified'}),true);
 const japanese=ui.newNoteLearningScope({learningSpace:'languages',language:'ja'});assert.deepEqual(japanese,{...scope('languages'),languages:['ja']});
});
test('selected-space connections withhold foreign and unknown target reasons while All retains explicit navigation',()=>{
 const language={...note('language','languages'),family:'article'},computer={...note('computer','computing'),family:'article'},record={...language,links:[{family:'article',id:'computer',reason:'FOREIGN_COMPUTING_REASON'},{family:'article',id:'unknown',reason:'UNCLASSIFIED_REASON'}]};
 const html=ui.connections(record,[language,computer],languages);assert.doesNotMatch(html,/FOREIGN_COMPUTING_REASON|UNCLASSIFIED_REASON/);
 const all=ui.connections(record,[language,computer],{learningSpace:'all'});assert.match(all,/FOREIGN_COMPUTING_REASON/);assert.match(all,/UNCLASSIFIED_REASON/);
 assert.equal(ui.learningConnectionVisible({family:'article',id:'computer'},[computer],computing),true);
});


test('retained saved draft classification is not current metadata authority, while exact reference previews withhold foreign prose',()=>{
 const savedDraft=draft({baseRev:4,intent:'update',learningScope:scope('computing')});
 assert.equal(ui.noteVisibleInLearningSpace(savedDraft,undefined,[],computing),false);
 assert.equal(ui.noteVisibleInLearningSpace(savedDraft,undefined,[],{learningSpace:'all'}),true);
 const record={...note('computer-reference','computing'),family:'article',rendition:'exact-one',body:'FOREIGN_REFERENCE_PROSE'};
 assert.equal(ui.eligibleReferencePreview(record,{family:'article',id:record.id,rendition:'exact-one'},languages),false);
 const hidden=ui.reference(record,languages);assert.doesNotMatch(hidden,/FOREIGN_REFERENCE_PROSE|TEST ONLY computer-reference|Open exact Article/);assert.match(hidden,/outside the selected learning space/);
 const shown=ui.reference(record,computing);assert.match(shown,/FOREIGN_REFERENCE_PROSE/);assert.match(shown,/learningSpace=computing/);
});
