import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({entryPoints:['lib/note-sync.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {savedNoteDraft,noteDraftForOpening,editedNoteDraft,noteSaveCommand,reconcileNoteReceipt}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const worker="import{domainHandler}from'./lib/domain-handler.ts';export default{fetch:domainHandler}";
const ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
const body='TEST ONLY supplied Windows source\r\n\tconst home = "C:\\Users\\Learner\\Zombie Cat\\α 😺";\r\n\tconsole.log(home);\r\n';
const contexts={a:[{family:'investigation',id:'TEST-ONLY-linux'}],b:[{family:'journey',id:'TEST-ONLY-cat'}]};
async function seedContexts(c){for(const [name,links] of Object.entries(contexts))for(const link of links)ok(await c.command({operationId:'context-'+name,action:'create',family:link.family,id:link.id,data:{title:'TEST ONLY '+name+' task',body:'Isolated original task fixture.',synthetic:true}}));}

// These exercise the unchanged real save domain and client reconciliation. They
// deliberately do not pretend that a Node test operates a React layout switch.
test('multi-layout Notes contract: delayed acknowledgement and newer writing retain exact original Note context',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('TEST-ONLY-layout-delayed-ack');
  await seedContexts(c);
  const original=ok(await c.command({operationId:'create-a',action:'create',family:'note',id:'note-a',data:{title:'TEST ONLY Linux evidence',body:'Initial',links:contexts.a,synthetic:true}})).record;
  const other=ok(await c.command({operationId:'create-b',action:'create',family:'note',id:'note-b',data:{title:'TEST ONLY coding interpretation',body:'Independent B writing',links:contexts.b,synthetic:true}})).record;
  const sent=editedNoteDraft(savedNoteDraft(original),{body},1000),command=noteSaveCommand(sent,'note-a','save-a','unused');
  const flight={command,sequence:sent.sequence,sent:structuredClone(sent)};
  const receipt=ok(await c.command(command)); // Hold this real ACK in client memory.
  const newer=editedNoteDraft(sent,{body:body+'Unacknowledged interpretation 😄\r\n'},1200);
  const retained=JSON.parse(JSON.stringify({selected:'note-b',drafts:{'note-a':newer,'note-b':savedNoteDraft(other)},flights:{'note-a':flight}}));
  const result=reconcileNoteReceipt(retained.drafts['note-a'],retained.flights['note-a'],receipt);
  assert.equal(result.conflict,false);assert.equal(result.draft.baseRev,2);assert.equal(result.draft.dirty,true);
  assert.equal(result.draft.body,newer.body);assert.deepEqual(result.draft.links,contexts.a);
  assert.equal(retained.selected,'note-b');assert.equal(retained.drafts['note-b'].body,'Independent B writing');
  const next=ok(await c.command(noteSaveCommand(result.draft,'note-a','save-newer-a','unused')));
  assert.equal(next.record.body,newer.body);assert.deepEqual(next.record.links,contexts.a);
  assert.equal(ok(await c.context('note','note-b')).record.rev,1);
  assert.equal(ok(await c.context('note','note-a',original.rendition)).record.body,'Initial');
 }finally{await f.dispose();}
});

test('multi-layout Notes contract: lost ACK replay cannot adopt a competing head or wrong-project links',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('TEST-ONLY-layout-lost-ack');
  await seedContexts(c);
  const original=ok(await c.command({operationId:'create-a',action:'create',family:'note',id:'note-a',data:{title:'TEST ONLY original',body:'Before',links:contexts.a,synthetic:true}})).record;
  const sent=editedNoteDraft(savedNoteDraft(original),{body},1000),command=noteSaveCommand(sent,'note-a','uncertain-a','unused'),flight={command,sequence:sent.sequence,sent};
  ok(await c.command(command)); // Simulate loss only at the transport boundary.
  ok(await c.command({operationId:'competing-head',action:'update',family:'note',id:'note-a',expectedRev:2,data:{title:'TEST ONLY competing title',links:contexts.b}}));
  const newer=editedNoteDraft({...sent,paused:true,message:'Save not acknowledged; exact operation retained.'},{body:body+'Still writing\r\n'},1200);
  assert.equal(newer.paused,true);assert.match(newer.message,/not acknowledged/);
  const replay=ok(await c.command(command));assert.equal(replay.replayed,true);assert.equal(replay.recordRef.rev,2);
  // NotesPanel.receive obtains the eligible current head if immutable recovery
  // returns only a receipt; that current head must not become the ACK revision.
  const current=replay.record??ok(await c.context('note','note-a')).record;
  const result=reconcileNoteReceipt(newer,flight,{...replay,record:current});
  assert.equal(result.conflict,true);assert.equal(result.draft.baseRev,2);assert.equal(result.draft.paused,true);
  assert.equal(result.draft.body,newer.body);assert.deepEqual(result.draft.links,contexts.a);
  const stale=await c.command({...command,operationId:'new-stale-save'});assert.equal(stale.status,409);
  assert.equal(ok(await c.context('note','note-a')).record.rev,3);
  assert.deepEqual(ok(await c.context('note','note-a')).record.links,contexts.b);
  const changed=await c.command({...command,data:{...command.data,links:contexts.b}});assert.equal(changed.status,409);assert.equal(changed.data.code,'idempotency_mismatch');
 }finally{await f.dispose();}
});

test('multi-layout Notes contract: rejected stale draft survives local serialization and remains independently resolvable',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('TEST-ONLY-layout-rejected');
  await seedContexts(c);
  const original=ok(await c.command({operationId:'create-a',action:'create',family:'note',id:'note-a',data:{title:'TEST ONLY rejection',body:'Saved head',links:contexts.a,synthetic:true}})).record;
  ok(await c.command({operationId:'other-writer',action:'update',family:'note',id:'note-a',expectedRev:1,data:{body:'Other writer'}}));
  const draft=editedNoteDraft(savedNoteDraft(original),{body},1000);
  assert.equal((await c.command(noteSaveCommand(draft,'note-a','rejected-a','unused'))).status,409);
  const paused=JSON.parse(JSON.stringify({...draft,paused:true,message:'Concurrent edit: compare the current Note before saving again.'}));
  const further=editedNoteDraft(paused,{body:paused.body+'Retained after rejection'},2000);
  assert.equal(further.paused,true);assert.equal(further.message,paused.message);assert.deepEqual(further.links,contexts.a);
  assert.equal(ok(await c.context('note','note-a')).record.body,'Other writer');
  const resolved=editedNoteDraft(further,{paused:false,baseRev:2},3000);
  const accepted=ok(await c.command(noteSaveCommand(resolved,'note-a','explicit-resolution','unused')));
  assert.equal(accepted.record.body,further.body);assert.deepEqual(accepted.record.links,contexts.a);assert.equal(accepted.record.rev,3);
 }finally{await f.dispose();}
});

test('multi-layout Notes contract: a pending original image remains staged on conflict and attaches only to its originating Note',async()=>{
 const assetsWorker="import{domainHandler}from'./lib/domain-handler.ts';import{assetHandler}from'./lib/asset-handler.ts';export default{fetch(request,env){return new URL(request.url).pathname.startsWith('/api/assets/')?assetHandler(request,env):domainHandler(request,env)}}";
 const f=await privateStorageFixture(assetsWorker);try{
  const c=f.client('TEST-ONLY-layout-images');await seedContexts(c);
  const a=ok(await c.command({operationId:'image-note-a',action:'create',family:'note',id:'note-a',data:{title:'TEST ONLY image origin A',body:'Before image',bodyFormat:'markdown-v1',links:contexts.a,synthetic:true}})).record;
  const b=ok(await c.command({operationId:'image-note-b',action:'create',family:'note',id:'note-b',data:{title:'TEST ONLY active B',body:'Independent B',links:contexts.b,synthetic:true}})).record;
  const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAADCAIAAAA2iEnWAAAAFElEQVR4nGMUCWhiYGBgYmBgQFAAEPgA7OnJpxEAAAAASUVORK5CYII=','base64');
  const stage=()=>c.request('/api/assets/stage?uploadId=layout-image-origin-a',bytes,{raw:true,headers:{'content-type':'image/png'}});
  const asset=ok(await stage()).asset;assert.equal(ok(await stage()).asset.assetId,asset.assetId);
  const image={id:'image-origin-a',kind:'image',text:'TEST ONLY original screenshot',image:{assetId:asset.assetId,alt:'TEST ONLY original screenshot'}};
  const sent=editedNoteDraft(savedNoteDraft(a),{body:'Before image\n\n[[minamo-image:v1:image-origin-a]]\n\nAfter image',attachmentSections:[{id:'images',title:'Images',parts:[image]}]});
  const command=noteSaveCommand(sent,'note-a','attach-original-a','unused',{sections:sent.attachmentSections});
  ok(await c.command({operationId:'advance-original-a',action:'update',family:'note',id:'note-a',expectedRev:1,data:{title:'TEST ONLY A advanced'}}));
  assert.equal((await c.command(command)).status,409);
  assert.equal((await c.request('/api/assets/'+asset.assetId)).status,404);
  assert.equal((await f.db.prepare('SELECT state FROM v2_images WHERE id=?').bind(asset.assetId).first()).state,'staged');
  assert.equal(ok(await c.context('note','note-b')).record.rev,b.rev);
  const resolved=editedNoteDraft(sent,{baseRev:2,paused:false});
  const receipt=ok(await c.command(noteSaveCommand(resolved,'note-a','attach-resolved-a','unused',{sections:sent.attachmentSections})));
  assert.equal(receipt.record.id,'note-a');assert.deepEqual(receipt.record.links,contexts.a);
  assert.equal(receipt.record.sections[0].parts[0].image.assetId,asset.assetId);
  assert.equal((await c.request('/api/assets/'+asset.assetId)).status,200);
  assert.equal(ok(await c.context('note','note-b')).record.body,'Independent B');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_image_attachments WHERE asset_id=? AND record_id=?').bind(asset.assetId,'note-b').first()).n,0);
 }finally{await f.dispose();}
});


test('direct current Note opening retains independent editor state and requires comparison with a newer saved head',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('TEST-ONLY-layout-open-current');await seedContexts(c);
  const first=ok(await c.command({operationId:'open-create-a',action:'create',family:'note',id:'note-a',data:{title:'TEST ONLY retained editor',body,links:contexts.a,synthetic:true}})).record;
  const original=savedNoteDraft(first);
  const current=ok(await c.command({operationId:'open-advance-a',action:'update',family:'note',id:first.id,expectedRev:first.rev,data:{body:'New current saved edition',title:'TEST ONLY newer current',links:contexts.b}})).record;
  const retained=ok(await c.context('note',first.id,first.rendition)).record;
  assert.equal(retained.rendition,first.rendition);assert.equal(retained.body,body);
  assert.equal(current.rev,2);assert.equal(current.body,'New current saved edition');
  assert.equal(noteDraftForOpening(current).body,current.body,'first current opening uses actual eligible head');
  const stale=noteDraftForOpening(current,original);
  assert.equal(stale.paused,true);assert.match(stale.message,/revision 2.*revision 1/);
  assert.equal(stale.body,body);assert.deepEqual(stale.links,contexts.a);
  assert.equal(stale.dirty,false,'opening and comparison are not write intents');
  const typed=editedNoteDraft(stale,{body:body+'Still independent 😺\r\n'});
  assert.equal(typed.paused,true);assert.equal(typed.message,stale.message);
  assert.equal(ok(await c.context('note',first.id)).record.rev,2,'opening did not save');
  const paused={...typed,message:'A known rejected operation needs resolution'};
  assert.equal(noteDraftForOpening(current,paused),paused,'reopening cannot conceal rejection');
  const dirty=editedNoteDraft(original,{body:body+'Unsaved writing'});
  assert.equal(noteDraftForOpening(current,dirty),dirty,'dirty independent text and origin survive');
  const pending={command:noteSaveCommand(dirty,first.id,'original-operation','unused'),sequence:dirty.sequence,sent:structuredClone(dirty)};
  assert.equal(noteDraftForOpening(current,original,pending),original,'frozen flight remains the save authority');
  const equal=noteDraftForOpening(first,original);assert.equal(equal,original,'same revision keeps editor memory');
 }finally{await f.dispose();}
});
