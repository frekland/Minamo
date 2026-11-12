import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export * from "./lib/listening-draft";export * from "./lib/terminal-drafts";export * from "./lib/retained-writing";export * from "./lib/note-draft-keys";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'v49-drafts-')),entry=join(dir,'module.cjs');writeFileSync(entry,built.outputFiles[0].text);const api=require(entry);rmSync(dir,{recursive:true,force:true});
function storage(){const data=new Map();let writes=0,fail=Infinity;return {data,get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,setItem(k,v){if(++writes===fail)throw Error('quota');data.set(k,v)},removeItem:k=>data.delete(k),failAtNext(n){fail=writes+n}}}
const scope='v2-'+'a'.repeat(64)+':generation:old@1';
const draft=(id,output)=>({identity:'temporary',scope,position:7,coordinateMode:'source',replaceId:'inserted-'+id,capture:{id,output},open:false});
test('listening answers follow stable segment IDs across switching, same selection, reload and legacy migration',()=>{
 let draft=api.readListeningDraft(null,['a','b']);draft=api.keepListeningAnswer(draft,'a','first 😄');assert.equal(api.chooseListeningSegment(draft,'a','first 😄','a'),draft);draft=api.chooseListeningSegment(draft,'a','first 😄','b');draft=api.keepListeningAnswer(draft,'b','second');draft=api.chooseListeningSegment(draft,'b','second','a');assert.equal(draft.answers[draft.selected],'first 😄');assert.deepEqual(api.readListeningDraft(JSON.stringify(draft),['a','b']),draft);assert.deepEqual(api.readListeningDraft(JSON.stringify({answer:'legacy',segment:1}),['a','b']).answers,{b:'legacy'});assert.deepEqual(api.readListeningDraft(JSON.stringify(draft),['new']).answers,{});
});
test('first-save terminal migration retains all captures, positions and replacement identity after reopen',()=>{
 const local=storage();api.persistTerminalDraft(local,draft('a','exact\r\ntext'));api.persistTerminalDraft(local,draft('b','second'));api.migrateTerminalDrafts(local,scope,'temporary','persisted');const reopened=api.readTerminalDrafts(local,scope,'persisted');assert.deepEqual(reopened.map(d=>[d.capture.id,d.capture.output,d.position,d.replaceId]),[['a','exact\r\ntext',7,'inserted-a'],['b','second',7,'inserted-b']]);assert.deepEqual(api.readTerminalDrafts(local,scope,'temporary'),[]);api.migrateTerminalDrafts(local,scope,'temporary','persisted');assert.equal(api.readTerminalDrafts(local,scope,'persisted').length,2);assert.deepEqual(api.readTerminalDrafts(local,scope+'x','persisted'),[]);
});
test('partial migration failure preserves every origin and retry completes without losing captures',()=>{
 const local=storage();api.persistTerminalDraft(local,draft('a','first'));api.persistTerminalDraft(local,draft('b','second'));local.failAtNext(4);assert.throws(()=>api.migrateTerminalDrafts(local,scope,'temporary','persisted'),/quota/);assert.equal(api.readTerminalDrafts(local,scope,'temporary').length,2);api.migrateTerminalDrafts(local,scope,'temporary','persisted');assert.equal(api.readTerminalDrafts(local,scope,'persisted').length,2);
});
test('v3 producer base/writer recovery deduplicates identical copies and retains divergent edits read-only',()=>{
 const local=storage(),base=api.noteDraftKey(scope);local.setItem(base,JSON.stringify({drafts:{one:{body:'same'}}}));local.setItem(base+':writer:tab-a',JSON.stringify({drafts:{one:{body:'same'}}}));local.setItem(base+':writer:tab-b',JSON.stringify({drafts:{one:{body:'divergent'}}}));local.setItem(api.noteDraftKey(scope.replace('old@1','current@2')),JSON.stringify({drafts:{one:{body:'current'}}}));const before=JSON.stringify([...local.data]),review=api.reviewRetainedWriting(local,scope.replace('old@1','current@2'));assert.deepEqual(review.items.map(i=>i.text),['same','divergent']);assert.equal(JSON.stringify([...local.data]),before);assert.equal(api.retainedWritingKey(base+':writer:',scope.replace('old@1','current@2')),null);
});

test('divergent destination terminal edits survive migration retry with origin explicitly retained',()=>{
 const local=storage();api.persistTerminalDraft(local,draft('a','origin'));api.persistTerminalDraft(local,{...draft('a','new destination'),identity:'persisted'});assert.throws(()=>api.migrateTerminalDrafts(local,scope,'temporary','persisted'),/conflict/);assert.equal(api.readTerminalDrafts(local,scope,'persisted')[0].capture.output,'new destination');assert.equal(api.readTerminalDrafts(local,scope,'temporary')[0].capture.output,'origin');
});
test('v3 legacy per-writer draft is recognized and malformed/other-owner copies are excluded',()=>{
 const owner=scope.split(':generation:')[0],current=scope.replace('old@1','current@2'),base=api.noteDraftKey(owner);const local=storage();local.setItem(base+':writer:tab-a',JSON.stringify({drafts:{one:{body:'legacy writer'}}}));local.setItem(base+':writer:',JSON.stringify({drafts:{one:{body:'invalid'}}}));local.setItem(base.replace('a'.repeat(64),'b'.repeat(64))+':writer:tab-a',JSON.stringify({drafts:{one:{body:'other owner'}}}));assert.deepEqual(api.reviewRetainedWriting(local,current).items.map(i=>i.text),['legacy writer']);
});
