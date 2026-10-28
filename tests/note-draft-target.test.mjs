import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const compiled=await build({entryPoints:['lib/note-draft-target.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {eligibleNoteFromContext,resolveNoteDraftTarget}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
test('missing saved Note with legal draft- prefix remains unavailable, never new create',()=>{
 assert.deepEqual(resolveNoteDraftTarget({selectedId:'draft-legal',baseRev:7,saved:null}),{kind:'unavailable',id:'draft-legal'});
 assert.deepEqual(resolveNoteDraftTarget({selectedId:'ordinary-saved-note',baseRev:7,saved:null}),{kind:'unavailable',id:'ordinary-saved-note'});
});
test('absence from a bounded snapshot does not authorise recreation without a proven base revision',()=>{
 assert.equal(resolveNoteDraftTarget({selectedId:'draft-legal',baseRev:0,saved:null}).kind,'unavailable');
 assert.equal(resolveNoteDraftTarget({selectedId:'unknown-server-id',baseRev:0,saved:null}).kind,'unavailable');
});
test('explicit independent draft without a saved base revision creates a new Note',()=>{
 assert.deepEqual(resolveNoteDraftTarget({selectedId:'new',baseRev:0,saved:null}),{kind:'create'});
 assert.deepEqual(resolveNoteDraftTarget({selectedId:'local-composer-12',baseRev:0,createIntent:true,saved:null}),{kind:'create'});
});
test('eligible saved note updates its stable identity with retained CAS revision, not latest revision',()=>{
 assert.deepEqual(resolveNoteDraftTarget({selectedId:'draft-legal',baseRev:7,saved:{id:'draft-legal',rev:9}}),{kind:'update',id:'draft-legal',expectedRev:7});
 assert.equal(resolveNoteDraftTarget({selectedId:'draft-legal',baseRev:7,saved:{id:'other',rev:7}}).kind,'unavailable');
});
test('explicit create intent never erases proof of a missing prior saved revision',()=>{
 assert.equal(resolveNoteDraftTarget({selectedId:'draft-legal',baseRev:7,createIntent:true,saved:null}).kind,'unavailable');
 assert.equal(resolveNoteDraftTarget({selectedId:'new',baseRev:7,createIntent:true,saved:null}).kind,'unavailable');
});
test('uncertain original command remains immutable despite missing record or changed current draft',()=>{
 const original=Object.freeze({operationId:'original-op',action:'create',family:'note',id:'original-note',data:Object.freeze({title:'Original',body:'Original text'})});
 const before=JSON.stringify(original);
 const result=resolveNoteDraftTarget({selectedId:'different-composer',baseRev:0,createIntent:true,pending:original,saved:null});
 assert.equal(result.kind,'pending');assert.equal(result.command,original);assert.equal(result.command.operationId,'original-op');assert.equal(JSON.stringify(original),before);
});

test('targeted page-missing Note read merges only the same active family and exact ID',()=>{const note={id:'old-note',family:'note',title:'Saved',body:'Local prose',rev:3,links:[],trashedAt:null,updatedAt:'2026-10-21T12:00:00Z'};assert.equal(eligibleNoteFromContext({record:note},'old-note'),note);assert.equal(eligibleNoteFromContext({record:note},'different'),null);assert.equal(eligibleNoteFromContext({record:{...note,family:'article'}},'old-note'),null);assert.equal(eligibleNoteFromContext({record:{...note,trashedAt:'2026-10-21T12:01:00Z'}},'old-note'),null);assert.equal(eligibleNoteFromContext({record:{...note,rev:0}},'old-note'),null);assert.equal(eligibleNoteFromContext({record:null},'old-note'),null);});
