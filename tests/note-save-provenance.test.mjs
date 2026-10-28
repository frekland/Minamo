import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({entryPoints:['lib/note-sync.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {noteSaveCommand,savedNoteDraft,editedNoteDraft}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const worker="import{domainHandler}from'./lib/domain-handler.ts';export default{fetch:domainHandler}";
test('browser Note saves preserve both synthetic and genuine classifications through real D1, CAS and replay',async()=>{
 const f=await privateStorageFixture(worker);try{const client=f.client('synthetic-note-save-owner');const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data};
 for(const synthetic of [true,false]){
  const id='note-'+synthetic;
  const original=ok(await client.command({operationId:'create-'+id,action:'create',family:'note',id,data:{title:'SYNTHETIC TEST ONLY classification fixture',body:'Original writing',bodyFormat:'markdown-v1',synthetic}})).record;
  const draft=editedNoteDraft(savedNoteDraft(original),{body:'**New writing** with unchanged classification'});
  const command=noteSaveCommand(draft,id,'browser-save-'+id,'unused-new-id');
  assert.equal(command.action,'update');assert.equal(command.expectedRev,1);assert.equal(Object.hasOwn(command.data,'synthetic'),false);
  const saved=ok(await client.command(command));assert.equal(saved.record.synthetic,synthetic);assert.equal(saved.record.body,draft.body);assert.equal(saved.record.rev,2);
  const replay=ok(await client.command(command));assert.equal(replay.replayed,true);assert.equal(replay.recordRef.rev,2);
  const stale=await client.command({...command,operationId:'stale-'+id});assert.equal(stale.status,409);assert.equal(ok(await client.context('note',id)).record.synthetic,synthetic);
  const attempt=await client.command({...command,operationId:'forged-reclassification-'+id,expectedRev:2,data:{...command.data,synthetic:!synthetic}});assert.equal(attempt.status,400);assert.equal(attempt.data.code,'evidence_immutable');
 }
 const blank={body:'Original browser-created prose',title:'',links:[],baseRev:0,dirty:true,intent:'create',sequence:1,bodyFormat:'markdown-v1'};
 const create=noteSaveCommand(blank,'local-draft','browser-create-normal','normal-created-note');assert.equal(create.data.synthetic,false);assert.equal(create.expectedRev,undefined);assert.equal(ok(await client.command(create)).record.synthetic,false);
 }finally{await f.dispose()}
});
