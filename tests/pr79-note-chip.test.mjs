import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export{newNoteDraft,savedNoteDraft,clearNoteCreationContext,noteCreationSourceState,noteLinkStatus,noteSaveCommand,editedNoteDraft,reconcileNoteReceipt}from"./lib/note-sync.ts"',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,logLevel:'error'});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
const {newNoteDraft,savedNoteDraft,clearNoteCreationContext,noteCreationSourceState,noteLinkStatus,noteSaveCommand,editedNoteDraft,reconcileNoteReceipt}=mod.exports;

test('Study Note source chip is explicitly selected, removable and frozen into one ordinary Note operation',()=>{
 const context={family:'article',id:'reading',title:'An explanation',rev:3,rendition:'edition-3'},selected={family:'article',id:'reading',rendition:'edition-3',sectionId:'why',partId:'paragraph'},other={family:'work',id:'optional-work',relation:'related'};
 let draft=newNoteDraft(context,selected,[selected,other]);
 context.title='Different navigation';selected.partId='a-different-passage';
 assert.equal(draft.creationContext.title,'An explanation');assert.equal(draft.creationContext.link.partId,'paragraph');
 draft=editedNoteDraft(draft,{title:'My question',body:'I wonder whether these results agree.'},100);
 const frozen=noteSaveCommand(draft,'draft-1','frozen-save','saved-note');
 assert.equal(frozen.data.links[0].partId,'paragraph');assert.equal(frozen.data.links[1].family,'work');
 const cleared=clearNoteCreationContext(draft,120);
 assert.equal(cleared.body,draft.body);assert.equal(cleared.creationContext,undefined);assert.deepEqual(cleared.links,[other]);
 assert.equal(cleared.dirty,true);assert.ok(cleared.sequence>draft.sequence);
 const standalone=noteSaveCommand(cleared,'draft-1','source-cleared-save','another-note');
 assert.equal(standalone.data.links.length,1);assert.equal(standalone.data.links[0].family,'work');
 assert.equal(frozen.data.links[0].id,'reading','the in-flight frozen command must never be rewritten');
});

test('an in-flight source removal stays pending until a distinct guarded follow-up save confirms it',()=>{
 const source={family:'article',id:'real-reading',title:'Exact passage',rev:2,rendition:'r2'};
 const link={family:'article',id:'real-reading',rendition:'r2',sectionId:'section',partId:'paragraph'};
 let draft=editedNoteDraft(newNoteDraft(source,link),{title:'My Note',body:'My question about the passage'},10);
 assert.equal(noteCreationSourceState(draft,undefined,null).status,'pending');
 const command=noteSaveCommand(draft,'local-draft','flight-with-source','new-note');
 const flight={command,sequence:draft.sequence,sent:structuredClone(draft)};
 assert.equal(noteCreationSourceState(draft,flight,null).status,'saving');
 draft=clearNoteCreationContext(draft,20);
 assert.equal(noteCreationSourceState(draft,flight,null).status,'removal-pending');
 assert.equal(command.data.links.length,1,'the original flight is immutable even after removal intent');
 const committed={family:'note',id:'new-note',title:'My Note',body:'My question about the passage',links:[link],rev:1};
 const receipt={operationId:'flight-with-source',status:'committed',recordRef:{family:'note',id:'new-note',rev:1},record:committed};
 const first=reconcileNoteReceipt(draft,flight,receipt);
 assert.equal(first.conflict,false);assert.equal(first.draft.dirty,true);assert.equal(first.draft.baseRev,1);
 assert.equal(noteCreationSourceState(first.draft,undefined,committed).status,'removal-pending');
 const nextCommand=noteSaveCommand(first.draft,'new-note','flight-remove-source','ignored');
 assert.equal(nextCommand.action,'update');assert.equal(nextCommand.expectedRev,1);assert.deepEqual(nextCommand.data.links,[]);
 const followUp={command:nextCommand,sequence:first.draft.sequence,sent:structuredClone(first.draft)};
 const finalRecord={...committed,links:[],rev:2};
 const second=reconcileNoteReceipt(first.draft,followUp,{operationId:'flight-remove-source',status:'committed',recordRef:{family:'note',id:'new-note',rev:2},record:finalRecord});
 assert.equal(second.conflict,false);assert.equal(second.draft.dirty,false);assert.equal(second.draft.removedCreationContext,undefined);
 assert.equal(noteCreationSourceState(second.draft,undefined,finalRecord),null);
});

test('unconfirmed or conflicting first flight does not assert that a queued source removal committed',()=>{
 const source={family:'article',id:'reading',title:'Original',rev:1},link={family:'article',id:'reading'};
 const original=editedNoteDraft(newNoteDraft(source,link),{body:'A response'},3);
 const flight={command:noteSaveCommand(original,'draft','attempt-one','note'),sequence:original.sequence,sent:structuredClone(original)};
 const removed=clearNoteCreationContext(original,4);
 assert.equal(noteCreationSourceState({...removed,paused:true},flight,null).status,'removal-pending');
 const mismatch=reconcileNoteReceipt(removed,flight,{operationId:'unrelated',status:'committed',recordRef:{family:'note',id:'note',rev:1}});
 assert.equal(mismatch.conflict,true);assert.equal(mismatch.draft.removedCreationContext.title,'Original');
 const wrongRev=reconcileNoteReceipt(removed,flight,{operationId:'attempt-one',status:'committed',recordRef:{family:'note',id:'note',rev:2}});
 assert.equal(wrongRev.conflict,true);assert.equal(wrongRev.draft.removedCreationContext.title,'Original');
});

test('reopened saved Notes expose the actual saved links and require a guarded follow-up for removal',()=>{
 const link={family:'article',id:'reading',sectionId:'first',partId:'claim'};
 const saved={family:'note',id:'original',rev:5,title:'An old Note',body:'My writing',links:[link],createdAt:'2026-11-02T00:00:00.000Z',updatedAt:'2026-11-02T00:00:00.000Z'};
 const reopened=savedNoteDraft(saved);
 assert.equal(reopened.creationContext,undefined,'ephemeral creation context is not invented on reopening');
 assert.equal(noteLinkStatus(reopened,undefined,saved,link),'saved');
 const removed=editedNoteDraft(reopened,{links:[]});
 assert.equal(noteLinkStatus(removed,undefined,saved,link),'removal-pending');
 const command=noteSaveCommand(removed,saved.id,'reopened-guarded-removal','unused');
 assert.equal(command.expectedRev,5);assert.deepEqual(command.data.links,[]);
 const flight={command,sequence:removed.sequence,sent:structuredClone(removed)};
 assert.equal(noteLinkStatus(removed,flight,saved,link),'removal-pending');
 const next=reconcileNoteReceipt(removed,flight,{operationId:command.operationId,status:'committed',recordRef:{family:'note',id:'original',rev:6},record:{...saved,rev:6,links:[]}});
 assert.equal(next.conflict,false);assert.equal(noteLinkStatus(next.draft,undefined,{...saved,rev:6,links:[]},link),null);
});

test('D1 keeps one exact Note while a committed source relation is removed by guarded next revision',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};");
 try{
  const client=fixture.client('note-chip-owner');
  const articleResponse=await client.command({action:'create',family:'article',id:'chip-reading',data:{title:'Precise reading source',body:'A paragraph I am trying to understand.'}});
  assert.equal(articleResponse.status,200,JSON.stringify(articleResponse.data));const article=articleResponse.data.record;
  const link={family:'article',id:article.id,rendition:article.rendition,sectionId:'__article',partId:'__body'};
  let draft=editedNoteDraft(newNoteDraft(article,link),{title:'Question about this paragraph',body:'What does this paragraph mean?'},10);
  const original=await client.command(noteSaveCommand(draft,'draft-local','chip-first-save','chip-note'));
  assert.equal(original.status,200,JSON.stringify(original.data));assert.equal(original.data.record.rev,1);
  assert.deepEqual(original.data.record.links,[link]);
  draft=clearNoteCreationContext({...draft,intent:'update',baseRev:1,dirty:false},20);
  const removed=await client.command(noteSaveCommand(draft,'chip-note','chip-remove-next','unused'));
  assert.equal(removed.status,200,JSON.stringify(removed.data));assert.equal(removed.data.record.rev,2);assert.deepEqual(removed.data.record.links,[]);
  const after=await client.context('note','chip-note');assert.equal(after.status,200);assert.equal(after.data.record.body,'What does this paragraph mean?');assert.equal(after.data.record.rev,2);assert.deepEqual(after.data.record.links,[]);
  const source=await client.context('article',article.id);assert.equal(source.status,200);assert.equal(source.data.record.rev,article.rev);
  const replay=await client.command(noteSaveCommand(draft,'chip-note','chip-remove-next','unused'));assert.equal(replay.status,200);assert.equal(replay.data.replayed,true);
  const stale=await client.command({...noteSaveCommand(draft,'chip-note','chip-stale-remove','unused'),expectedRev:1});
  assert.notEqual(stale.data?.status,'committed','a stale follow-up cannot silently rewrite a newer Note');
 }finally{await fixture.dispose();}
});
