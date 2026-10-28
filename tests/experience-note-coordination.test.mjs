import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:"export * from './lib/note-sync.ts'; export {noteAttachmentUpdate} from './lib/note-attachments.ts';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {newNoteDraft,noteDraftForOpening,noteSaveCommand,editedNoteDraft,reconcileNoteReceipt,noteSavePresentation,noteAttachmentUpdate}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const reading={family:'article',id:'TEST-ONLY-reading',title:'TEST ONLY exact reading',body:'',links:[],rev:1,trashedAt:null,updatedAt:'2026-10-26T00:00:00Z'};
const readingLink={family:'article',id:reading.id,rendition:'reading-edition',sectionId:'one',partId:'two'};
const task={title:'TEST ONLY contextual task',link:{family:'journey',id:'TEST-ONLY-task',rendition:'task-edition',sectionId:'stage-two',relation:'supports'}};
test('general New Note is independent; reading creation freezes exact links and only offers the deliberate task addition',()=>{
 const standalone=newNoteDraft(null,undefined,undefined,task);assert.deepEqual(standalone.links,[]);assert.equal(standalone.optionalTaskLink,undefined);
 const exact=structuredClone(readingLink),candidate=structuredClone(task),draft=newNoteDraft(reading,exact,undefined,candidate);exact.partId='other';candidate.link.sectionId='other';candidate.title='Other task';
 assert.deepEqual(draft.links,[readingLink]);assert.deepEqual(draft.optionalTaskLink,task);assert.equal(draft.creationContext.title,reading.title);
 const flight={command:noteSaveCommand(editedNoteDraft(draft,{body:'First thought'}),'local','first','saved'),sequence:1,sent:{...draft,body:'First thought',dirty:true,sequence:1}};
 const newest=editedNoteDraft({...flight.sent},{title:'Renamed while saving',body:'Second thought',links:[readingLink,task.link]});
 const ack={operationId:'first',status:'committed',replayed:true,recordRef:{family:'note',id:'saved',rev:1}};
 const result=reconcileNoteReceipt(newest,flight,ack).draft;assert.equal(result.body,'Second thought');assert.equal(result.title,newest.title);assert.deepEqual(result.links,[readingLink,task.link]);assert.equal(result.dirty,true);assert.equal(noteSavePresentation(result,undefined,true),'Saving…');
 const next=noteSaveCommand(result,'saved','second','unused');assert.equal(next.expectedRev,1);assert.equal(next.action,'update');assert.deepEqual(next.data.links,[readingLink,task.link]);
});
test('all admissions reuse the same dirty buffer and pending operation; stale clean editors require comparison',()=>{
 const note={...reading,family:'note',id:'TEST-ONLY-note',body:'Saved',title:'Saved',rev:3};
 const retained=editedNoteDraft(noteDraftForOpening(note),{body:'Unsaved exact 😄 writing'});const flight={command:noteSaveCommand(retained,note.id,'pending','unused'),sequence:retained.sequence,sent:structuredClone(retained)};
 for(let i=0;i<4;i++)assert.equal(noteDraftForOpening({...note,rev:4},retained,flight),retained);
 const stale=noteDraftForOpening({...note,rev:4},noteDraftForOpening(note));assert.equal(stale.body,'Saved');assert.equal(stale.baseRev,3);assert.equal(stale.paused,true);
});
test('latest-buffer status distinguishes memory, durable local, network, uncertain, rejected and acknowledged states',()=>{
 const d=editedNoteDraft(newNoteDraft(),{body:'Unsaved'}),f={command:noteSaveCommand(d,'local','uncertain','n'),sequence:d.sequence,sent:d};
 assert.equal(noteSavePresentation(d,undefined,false),'In memory only');assert.equal(noteSavePresentation(d,undefined,true),'On this device');assert.equal(noteSavePresentation(d,f,true),'Saving…');
 assert.equal(noteSavePresentation({...d,paused:true},f,true),'Save unconfirmed');assert.equal(noteSavePresentation({...d,paused:true},f,true,true),'Saving…');assert.equal(noteSavePresentation({...d,paused:true},undefined,true),'Not saved online');
 const receipt={operationId:'uncertain',status:'committed',replayed:true,recordRef:{family:'note',id:'n',rev:1}};const confirmed=reconcileNoteReceipt(d,f,receipt).draft;assert.equal(noteSavePresentation(confirmed,undefined,false),'Saved');
 const newer=editedNoteDraft(d,{body:'Newer still'});assert.equal(reconcileNoteReceipt(newer,f,receipt).draft.dirty,true);
});

test('body-less rich Note edits plus queued media preserve protected and semantic sections through real D1, receipt loss and source revocation',async()=>{
 const worker="import {domainHandler} from './lib/domain-handler.ts';import {mediaHandler} from './lib/media-handler.ts';export default{fetch(r,e){return new URL(r.url).pathname.startsWith('/api/media/')?mediaHandler(r,e):domainHandler(r,e)}}";
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-commission-note-preservation'),ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data};
 const secret='TEST_ONLY_REVOCABLE_EXCERPT';const source=ok(await c.command({action:'create',family:'source',id:'TEST-ONLY-commission-source',data:{title:'TEST ONLY original source',body:'',synthetic:true,source:{url:'https://example.invalid/commission',attribution:'Synthetic owner',rights:'permitted-excerpt',excerpt:{id:'ex',text:secret,locator:'Test location',edition:'one',basis:'owner-authored',permissionNote:'Disposable local fixture',ownerAttested:true,state:'permitted',exportAllowed:true}}}})).record;
 const sections=[{id:'s',title:'Independent rich sections',parts:[{id:'source',kind:'excerpt',text:secret,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:secret.length}},{id:'code',kind:'code',language:'bash',text:'printf \"exact 😄\"\n'},{id:'diagram',kind:'diagram',text:'Nodes\na: Input\n\nConnections',diagram:{format:'flow-v1',nodes:[{id:'a',label:'Input'}],edges:[]}},{id:'language',kind:'paragraph',text:'日本語',semantic:{contract:'minamo.semantic.v1',kind:'ruby',language:{version:1,text:'日本語',language:'ja',direction:'ltr',spans:[{start:0,end:3,base:'日本語',reading:'にほんご',origin:'author-verified'}]}}}]}];
 const original=ok(await c.command({action:'create',family:'note',id:'TEST-ONLY-section-note',data:{title:'TEST ONLY body-less Note',body:'',sections,synthetic:true}})).record;
 const asset=ok(await c.request('/api/media/stage?uploadId=TEST-ONLY-pending-document',Buffer.from('Synthetic document bytes'),{raw:true,headers:{'content-type':'text/plain'}})).asset;
 const media={id:'new-document',kind:'media',text:'Original document label',media:{assetId:asset.assetId,kind:'document',description:'Original document label'}};
 const draft=editedNoteDraft(noteDraftForOpening(original),{title:'TEST ONLY renamed rich Note',body:'Personal writing 😄 remains separate.',attachmentSections:[{id:'queued',title:'Queued',parts:[media]}]});
 const attachment=noteAttachmentUpdate(original,draft.attachmentSections,draft.body),command=noteSaveCommand(draft,original.id,'TEST-ONLY-lost-response','unused',attachment);
 assert.equal(command.data.sections,undefined);assert.doesNotMatch(JSON.stringify(command),new RegExp(secret));
 const flight={command,sequence:draft.sequence,sent:structuredClone(draft)};await c.command(command); // Simulate a committed response that never reached the editor.
 const replay=ok(await c.command(command));assert.equal(replay.replayed,true);assert.equal(replay.recordRef.rev,2);
 const recovered=reconcileNoteReceipt(draft,flight,replay);assert.equal(recovered.draft.dirty,false);assert.equal(recovered.draft.baseRev,2);
 const saved=ok(await c.context('note',original.id)).record;assert.equal(saved.body,draft.body);assert.equal(saved.title,draft.title);assert.deepEqual(saved.sections[0].parts.slice(0,4),original.sections[0].parts);assert.equal(saved.sections[0].parts[4].media.assetId,asset.assetId);
 await c.command({action:'update',family:'source',id:source.id,expectedRev:1,data:{source:{excerpt:{state:'revoked'}}}});
 const restricted=ok(await c.context('note',original.id)).record;assert.doesNotMatch(JSON.stringify(restricted),new RegExp(secret));
 const later=editedNoteDraft(noteDraftForOpening(restricted),{body:'Still-independent prose after revocation.'});const result=ok(await c.command(noteSaveCommand(later,original.id,'TEST-ONLY-independent-save','unused'))).record;
 assert.equal(result.body,later.body);assert.equal(result.sections[0].parts[0].unavailable,true);assert.equal(result.sections[0].parts[1].text,sections[0].parts[1].text);assert.equal(result.sections[0].parts[4].media.assetId,asset.assetId);
 }finally{await f.dispose()}
});
