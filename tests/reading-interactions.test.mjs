import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:'import React from "react";import {renderToStaticMarkup} from "react-dom/server";import Reader from "./app/reader.tsx";import AnnotationPreview from "./app/annotation-preview.tsx";export {pointerSelectionDismissal,parkReadingDraft,readingCapture,captureDraftForStorage,selectionCompletionKey,readingSelectionIdentity,readerMayHandleKeyboard} from "./app/reader.tsx";export {placeReadingInteraction} from "./app/reading-position.ts";export {bookmarkRecoveryPayload} from "./app/bookmark-toggle.tsx";export {annotationDraftFromStorage,annotationAcknowledgement} from "./app/annotation-preview.tsx";export const renderAnnotation=(record)=>renderToStaticMarkup(React.createElement(AnnotationPreview,{record,scope:"synthetic-owner",onCommand:()=>Promise.reject(new Error("fixture")),onClose:()=>{}}));export function render(article,records){return renderToStaticMarkup(React.createElement(Reader,{article,records,draftScope:"synthetic-owner",onCommand:()=>Promise.reject(new Error("fixture"))}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'v2-reading-ui-')),entry=join(dir,'ui.cjs');writeFileSync(entry,compiled.outputFiles[0].text);const {placeReadingInteraction,bookmarkRecoveryPayload,annotationDraftFromStorage,annotationAcknowledgement,parkReadingDraft,readingCapture,captureDraftForStorage,selectionCompletionKey,readingSelectionIdentity,readerMayHandleKeyboard,pointerSelectionDismissal,renderAnnotation,render}=require(entry);rmSync(dir,{recursive:true,force:true});
const rect=(left,top,width,height)=>({left,top,width,height,right:left+width,bottom:top+height});
test('anchored actions stay inside visual viewport including Android keyboard offsets and narrow reflow',()=>{
 for(const viewport of [{left:0,top:0,width:1440,height:900},{left:0,top:0,width:320,height:600},{left:0,top:260,width:390,height:280},{left:140,top:160,width:320,height:240}])for(const anchor of [rect(5,10,20,20),rect(270,510,80,30),rect(-100,1000,800,40)]){const position=placeReadingInteraction(anchor,410,220,viewport);assert.ok(position.left>=viewport.left+8);assert.ok(position.left+position.width<=viewport.left+viewport.width-8);assert.ok(position.top>=viewport.top+8);assert.ok(position.top+position.maxHeight<=viewport.top+viewport.height-8);}
 const below=placeReadingInteraction(rect(200,100,100,20),230,50,{left:0,top:0,width:1000,height:700});assert.equal(below.top,130);const above=placeReadingInteraction(rect(200,650,100,20),230,80,{left:0,top:0,width:1000,height:700});assert.equal(above.top,560);
});
test('Source bookmark pending recovery excludes imported quote and immutable command payload',()=>{
 const anchor={recordFamily:'source',articleId:'source-1',rendition:'source-edition',sectionId:'__article',partId:'__excerpt',start:2,end:20,quote:'IMPORTED PRIVATE TEXT',displayReturn:{recordFamily:'article',id:'reading-1',rendition:'reading-edition',sectionId:'s',partId:'p',start:0,end:18}};const command={operationId:'bookmark-operation',action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:3};assert.deepEqual(bookmarkRecoveryPayload(command),{operationId:'bookmark-operation',statusOnly:true});assert.doesNotMatch(JSON.stringify(bookmarkRecoveryPayload(command)),/IMPORTED|quote|displayReturn|target/);const record={...command,target:{kind:'record',family:'article',id:'reading-1'}};assert.equal(bookmarkRecoveryPayload(record).command,record);
});
test('inline annotation recovery preserves old CAS revision and freezes only its own command',()=>{
 const record={id:'annotation-1',family:'annotation',body:'Current server text',rev:9};const pending={operationId:'operation-1',action:'update',family:'annotation',id:record.id,expectedRev:4,data:{body:'My retained writing'}};const recovered=annotationDraftFromStorage(record,JSON.stringify({body:'My retained writing',baseRev:4,pending}));assert.equal(recovered.baseRev,4);assert.deepEqual(recovered.pending,pending);assert.equal(recovered.body,'My retained writing');assert.equal(annotationDraftFromStorage(record,JSON.stringify({body:'Retained',pending:{...pending,id:'other-annotation'}})).pending,null);assert.equal(annotationDraftFromStorage(record,JSON.stringify({pending:{...pending,data:{anchor:{quote:'not allowed'}}}})).pending,null);
});
test('saved annotations expose exact words through stable logical controls outside canonical prose',()=>{
 const article={id:'reading-1',family:'article',title:'Synthetic reading',body:'Independent introduction',links:[],sections:[{id:'s',title:'A passage',parts:[{id:'p',kind:'paragraph',text:'Repeated 😄 precise passage.'}]}],rendition:'edition-1',rev:1,createdAt:'2026-10-21',updatedAt:'2026-10-21',trashedAt:null,actor:'system',synthetic:true};const annotation={...article,id:'annotation-1',family:'annotation',body:'PERSONAL ANNOTATION ONLY IN PREVIEW',anchor:{articleId:article.id,rendition:article.rendition,sectionId:'s',partId:'p',start:9,end:11,quote:'😄'}};const html=render(article,[article,annotation]);assert.match(html,/rn-annotation-mark/);assert.doesNotMatch(html,/ri-mark-trigger|Reading options|GPT-authored reading/);assert.match(html,/data-logical-mark-trigger="true" data-anchor-records="annotation-1" aria-haspopup="dialog" aria-label="😄 — Annotated. Open saved marks"/);assert.doesNotMatch(html,/PERSONAL ANNOTATION ONLY IN PREVIEW|rn-inline-annotation|Selected passage/);assert.match(html,/aria-label="Add to Favourites"/);
});

test('closing a retained annotation parks its exact draft and releases new passage Flag selection',()=>{
 const article={id:'reading-1',family:'article',title:'Synthetic reading',body:'First paragraph. Second paragraph.',links:[],rendition:'edition-1',rev:1};const first=readingCapture(article,[{sectionId:'__article',partId:'__body',start:0,end:15}]).anchor;const pending={operationId:'original-save',action:'create',family:'annotation',id:'annotation-1',data:{body:'My unfinished writing',anchor:first}};const parked=parkReadingDraft(first,'My unfinished writing',true,pending,null,null);assert.equal(parked.annotating,false);assert.equal(parked.pending,null);assert.equal(parked.prose,'');assert.equal(parked.selection,null);assert.equal(parked.retained.pending,pending);assert.equal(parked.retained.selection,first);assert.equal(parked.retained.prose,'My unfinished writing');
 const next=readingCapture(article,[{sectionId:'__article',partId:'__body',start:17,end:33}]);assert.ok(next.anchor);assert.equal(next.anchor.quote,'Second paragraph');const stored=captureDraftForStorage(parked.retained.selection,parked.retained.prose,true,parked.retained.pending);assert.equal(stored.selection.quote,first.quote);assert.equal(stored.prose,'My unfinished writing');assert.equal(stored.pending.operationId,'original-save');
});

test('Escape and toolbar activation keyup cannot recapture the dismissed unchanged selection',()=>{
 for(const key of ['Escape','Tab','Enter',' ','Control','Alt'])assert.equal(selectionCompletionKey(key),false,key);for(const key of ['Shift','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'])assert.equal(selectionCompletionKey(key),true,key);
 const anchor={recordFamily:'article',articleId:'reading-1',rendition:'edition-1',sectionId:'s',partId:'p',start:4,end:9,quote:'words'};const dismissed=readingSelectionIdentity(anchor);assert.equal(readingSelectionIdentity({...anchor}),dismissed);assert.equal(readingSelectionIdentity({...anchor,quote:'never used for gesture identity'}),dismissed);assert.notEqual(readingSelectionIdentity({...anchor,end:10}),dismissed);assert.notEqual(readingSelectionIdentity({...anchor,rendition:'edition-2'}),dismissed);
});

test('open native dialogs and previously handled keys retain keyboard ownership over Reader shortcuts',()=>{
 const modalButton={closest:selector=>selector==='dialog[open]'?{tagName:'DIALOG',open:true}:null};const readingButton={closest:()=>null};assert.equal(readerMayHandleKeyboard(false,modalButton),false);assert.equal(readerMayHandleKeyboard(true,readingButton),false);assert.equal(readerMayHandleKeyboard(true,null),false);assert.equal(readerMayHandleKeyboard(false,readingButton),true);assert.equal(readerMayHandleKeyboard(false,null),true);
});

test('annotation preview Flags its underlying exact passage with an accessible icon and withholds unavailable targets',()=>{
 const anchor={recordFamily:'article',articleId:'reading-1',rendition:'edition-1',sectionId:'s',partId:'p',start:0,end:5,quote:'exact'};
 const record={id:'annotation-1',family:'annotation',body:'My own thought',rev:1,anchor};const html=renderAnnotation(record);assert.match(html,/aria-label="Flag this passage"/);assert.match(html,/lucide-flag/);assert.match(html,/My own thought/);
 assert.doesNotMatch(renderAnnotation({...record,anchor:{...anchor,quote:''}}),/Flag this passage/);assert.doesNotMatch(renderAnnotation({...record,anchor:undefined}),/Flag this passage/);
});

test('annotation lost-ACK recovery keeps committed revision separate from later current text',()=>{
 const base={id:'annotation-1',family:'annotation',body:'Original thought',title:'Original title',rev:1},command={operationId:'ack-original',action:'update',family:'annotation',id:base.id,expectedRev:1,data:{body:'My saved correction'}},later={...base,body:'Another writer changed this',title:'Concurrent title',rev:3};
 const result=annotationAcknowledgement(base,command,{operationId:command.operationId,status:'committed',recordRef:{family:'annotation',id:base.id,rev:2},record:later,replayed:true});assert.equal(result.committed.rev,2);assert.equal(result.committed.body,'My saved correction');assert.equal(result.current.rev,3);assert.equal(result.current.title,'Concurrent title');
 assert.throws(()=>annotationAcknowledgement(base,command,{operationId:'wrong',status:'committed',recordRef:{family:'annotation',id:base.id,rev:2},record:later}),/exact committed/);
});


test('crossing Flag and Annotation ranges retain both visual states and exact record choices',()=>{
 const article={id:'reading-marks',family:'article',title:'Synthetic overlap',body:'A 😄 selected phrase with e\u0301.',links:[],rendition:'edition-1',rev:1};
 const make=(family,id,start,end)=>({...article,family,id,body:family==='annotation'?'Private thought':'',anchor:{recordFamily:'article',articleId:article.id,rendition:article.rendition,sectionId:'__article',partId:'__body',start,end,quote:article.body.slice(start,end)}});
 const html=render(article,[article,make('flag','flag-first',2,13),make('annotation','annotation-second',5,20)]);
 assert.match(html,/class="rn-annotation-mark rn-flag-mark" data-anchor-records="annotation-second flag-first"/);
 assert.match(html.replace(/<[^>]*>/g,''),/😄 selected/);assert.match(html,/Flagged. Annotated. Open saved marks/);
 assert.doesNotMatch(html,/ri-mark-trigger|Private thought|\d+ saved/);
 assert.doesNotMatch(html,/Select without dragging|Choose a passage|Flag or annotate a whole passage/);
});


test('ordinary post-popup taps cannot revive a stale range; deliberate collapsed or changed selection can reopen',()=>{
 const anchor={recordFamily:'article',articleId:'reading-1',rendition:'edition-1',sectionId:'s',partId:'p',start:2,end:7,quote:'words'},same=readingSelectionIdentity(anchor),different=readingSelectionIdentity({...anchor,start:3,end:7});
 // Android may retain the old noncollapsed native range after a plain tap.
 let dismissed=pointerSelectionDismissal(null,false,same);assert.equal(dismissed,same);
 // Another passive tap (no active React selection) must preserve that guard.
 dismissed=pointerSelectionDismissal(dismissed,false,null);assert.equal(dismissed,same);
 assert.notEqual(dismissed,different,'a deliberate changed text range is fresh');
 // A genuinely collapsed native selection proves the obsolete range is gone.
 // Reselecting exactly the same words is then a new, deliberate gesture.
 dismissed=pointerSelectionDismissal(dismissed,true,same);assert.equal(dismissed,null);
 assert.notEqual(dismissed,same);
 // Controls inside the popup do not remove dismissal while native text stays selected.
 assert.equal(pointerSelectionDismissal(same,false,null),same);
});

test('ordinary reading headings and paragraphs have no focus-selection role while genuine controls remain',()=>{
 const article={id:'plain-reading',family:'article',title:'A normal heading',body:'Plain introduction.',links:[],sections:[{id:'s',title:'A normal section',parts:[{id:'p',kind:'paragraph',text:'Select these words normally.'}]}],rendition:'edition-1',rev:1};
 const html=render(article,[article]);assert.doesNotMatch(html,/<(?:h[1-6]|p|article)[^>]*(?:tabindex|role="button"|onclick)/);assert.match(html,/<h1[^>]*>.*A normal heading/);assert.match(html,/<button[^>]+aria-label="Add to Favourites"/);assert.doesNotMatch(html,/Select without dragging|Choose a passage/);
});
