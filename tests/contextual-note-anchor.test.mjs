import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async promise=>{const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};

test('R2/R4: a deliberate Note-only anchor clear uses ordinary CAS/revision/immutable receipt, never a prose side effect',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('exact-note-anchor-owner');
  const article=(await ok(c.command({action:'create',family:'article',id:'anchor-source',data:{title:'Exact source e1',body:'Reading context.',synthetic:false,sections:[{id:'section',title:'Passage',parts:[{id:'part',kind:'paragraph',text:'😀 distinct meaning.'}]}]}}))).record;
  const anchor={recordFamily:'article',articleId:article.id,rendition:article.rendition,sectionId:'section',partId:'part',start:0,end:2,quote:'😀'};
  const note=(await ok(c.command({action:'create',family:'note',id:'anchored-note',data:{title:'Independent words',body:'My original interpretation.',synthetic:false,anchor,links:[{family:'article',id:article.id,rendition:article.rendition}]}}))).record;
  const ordinary=(await ok(c.command({action:'update',family:'note',id:note.id,expectedRev:note.rev,data:{body:'My revised interpretation remains independent.'}}))).record;
  assert.deepEqual(ordinary.anchor,anchor,'ordinary prose editing never drops an accepted passage');
  const incompatible=await c.command({action:'update',family:'note',id:note.id,expectedRev:ordinary.rev,data:{anchor:null}});assert.equal(incompatible.status,400,'null is not a hidden clear operation');
  const payload={operationId:'explicit-anchor-clear',expectedGeneration:'legacy@0',action:'update',family:'note',id:note.id,expectedRev:ordinary.rev,data:{body:'I retain my writing and choose to detach the passage.',patch:[{op:'clearNoteAnchor'}]}};
  const cleared=(await ok(c.request('/api/commands',payload))).record;
  assert.equal(cleared.anchor,undefined);assert.equal(cleared.rev,ordinary.rev+1);
  assert.equal(cleared.body,'I retain my writing and choose to detach the passage.');
  assert.deepEqual(cleared.links,ordinary.links,'anchor clear does not silently remove separate accepted reading links');
  const replay=await ok(c.request('/api/commands',payload));assert.equal(replay.replayed,true);assert.equal(replay.recordRef.rev,cleared.rev);
  const old=(await ok(c.context('note',note.id,ordinary.rendition))).record;assert.deepEqual(old.anchor,anchor,'retained earlier rendition has its original passage anchor');
  const current=(await ok(c.context('note',note.id))).record;assert.equal(current.anchor,undefined);
  const missing=await c.command({action:'update',family:'note',id:note.id,expectedRev:cleared.rev,data:{patch:[{op:'clearNoteAnchor'}]}});assert.equal(missing.status,409,'a second clear must be an explicit conflict');
  const stale=await c.command({action:'update',family:'note',id:note.id,expectedRev:ordinary.rev,data:{patch:[{op:'clearNoteAnchor'}]}});assert.equal(stale.status,409);
  const annotation=(await ok(c.command({action:'create',family:'annotation',id:'not-a-note',data:{title:'Exact annotation',body:'An exact annotation.',synthetic:false,anchor}}))).record;
  const rejected=await c.command({action:'update',family:'annotation',id:annotation.id,expectedRev:annotation.rev,data:{patch:[{op:'clearNoteAnchor'}]}});assert.equal(rejected.status,400);
  const ambiguous=await c.command({action:'update',family:'note',id:note.id,expectedRev:cleared.rev,data:{anchor,patch:[{op:'clearNoteAnchor'}]}});assert.equal(ambiguous.status,400);
  assert.equal((await f.db.prepare("SELECT count(*) n FROM v2_revisions WHERE owner=? AND family='note' AND id=?").bind(c.owner,note.id).first()).n,3,'only accepted create, prose update and deliberate clear create revisions');
  const other=await f.client('another-anchor-owner').context('note',note.id);assert.ok(other.data.record==null);
 }finally{await f.dispose();}
});
