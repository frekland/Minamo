import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const owner='TEST-ONLY-scenario-owner';
const other='TEST-ONLY-scenario-invited-account';
const scenarioId='mood-to-music';
// Issue #10: the owner waived a fresh backup for narrowly bounded synthetic-only replay.
const settings={MINAMO_OWNER_ID:owner,MINAMO_SITE_HOSTS:'storage.test',MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'1'};
const args=(action,revision,extra={})=>({purpose:'Owner-authorised TEST ONLY Project scenario acceptance',action,scenarioId,
  expectedGeneration:'legacy@0',expectedRevision:revision,operationId:'test-'+action+'-'+revision,...extra});
async function rpc(c,name,input={}){
  const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:input}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  return r.data.result;
}
async function manage(c,input){
  const result=await rpc(c,'manage_minamo_test_scenario',input);
  return {error:result.isError??false,data:result.structuredContent};
}
const listTools=c=>c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
test('disabled by default: not advertised, no owner or non-owner call permitted',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:{MINAMO_OWNER_ID:owner,MINAMO_SITE_HOSTS:'storage.test'}});
  try{
    const c=fixture.client(owner);
    const listing=await listTools(c);
    assert.ok(!listing.data.result.tools.some(tool=>tool.name==='manage_minamo_test_scenario'));
    const unavailable=await manage(c,{purpose:'TEST ONLY',action:'list'});
    assert.equal(unavailable.error,true);
    assert.equal(unavailable.data.code,'scenario_control_disabled');
  }finally{await fixture.dispose();}
});
test('owner gate, explicit mutation authorization and exact scenario identifiers',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:{...settings,MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'0',MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED:'0'}});
  try{
    const ownerClient=fixture.client(owner),invited=fixture.client(other);
    const ownerList=await listTools(ownerClient),invitedList=await listTools(invited);
    assert.ok(ownerList.data.result.tools.some(tool=>tool.name==='manage_minamo_test_scenario'));
    assert.ok(!invitedList.data.result.tools.some(tool=>tool.name==='manage_minamo_test_scenario'));
    const denied=await manage(invited,{purpose:'TEST ONLY',action:'list'});
    assert.equal(denied.data.code,'scenario_owner_required');
    const listed=await manage(ownerClient,{purpose:'TEST ONLY',action:'list'});
    assert.equal(listed.data.states.length,11);
    assert.equal(listed.data.libraryRecoveryVerified,false);
    assert.equal(listed.data.syntheticOnlyWaiver,false);
    const locked=await manage(ownerClient,args('load',0,{phase:'A'}));
    assert.equal(locked.data.code,'scenario_mutation_not_authorized');
    const invalid=await manage(ownerClient,args('load',0,{scenarioId:'not-in-catalogue',phase:'A'}));
    assert.equal(invalid.data.code,'unknown_scenario');
    const malformed=await manage(ownerClient,args('load',0,{phase:'__prototype__'}));
    assert.equal(malformed.data.code,'unknown_scenario_phase');
  }finally{await fixture.dispose();}
});
test('synthetic-only waiver refuses a genuine record under a reserved fixture ID before any replay',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner);
    const collision=await c.command({operationId:'genuine-before-scenario',action:'create',family:'note',
      id:'TEST-ONLY-m2m-r1-note-research',data:{title:'Genuine record with reused ID',body:'Must survive intact',synthetic:false}});
    assert.equal(collision.status,200);
    const listed=await manage(c,{purpose:'TEST ONLY',action:'list'});
    assert.equal(listed.data.syntheticOnlyWaiver,true);
    const denied=await manage(c,args('load',0,{phase:'A'}));
    assert.equal(denied.error,true);
    assert.equal(denied.data.code,'fixture_identity_collision');
    const surviving=await c.context('note','TEST-ONLY-m2m-r1-note-research');
    assert.equal(surviving.status,200);
    assert.equal(surviving.data.record.body,'Must survive intact');
    assert.equal((await c.context('journey','TEST-ONLY-m2m-r1-project')).status,404);
  }finally{await fixture.dispose();}
});
test('canonical MCP replay, exact receipts, stale revisions, reset and unrelated Library preservation',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner);
    const unrelated=await c.command({operationId:'unrelated-article',action:'create',family:'article',id:'owner-reusable-reference',
      data:{title:'Unrelated Library sentinel',body:'Retain me across TEST ONLY fixture reset.',synthetic:false}});
    assert.equal(unrelated.status,200);
    const a=await manage(c,args('load',0,{phase:'A'}));
    assert.equal(a.error,false,JSON.stringify(a));
    assert.equal(a.data.phase,'A');
    assert.equal(a.data.snapshot.steps.length,4);
    const afterA=await manage(c,{purpose:'TEST ONLY',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(afterA.data.active.revision,1);
    assert.deepEqual(afterA.data.snapshot,a.data.snapshot);
    const replayA=await manage(c,args('load',0,{phase:'A'}));
    assert.equal(replayA.data.replayed,true);
    assert.deepEqual(replayA.data.snapshot,a.data.snapshot);
    const b=await manage(c,args('advance',1));
    assert.equal(b.error,false,JSON.stringify(b));
    assert.equal(b.data.phase,'B');
    assert.equal(b.data.snapshot.notes.length,1);
    const stale=await manage(c,args('advance',1,{operationId:'new-stale'}));
    assert.equal(stale.data.code,'scenario_revision_conflict');
    const wrongGeneration=await manage(c,args('advance',2,{expectedGeneration:'legacy@999'}));
    assert.equal(wrongGeneration.data.code,'generation_conflict');
    const bRetry=await manage(c,args('advance',1));
    assert.equal(bRetry.data.replayed,true);
    const e=await manage(c,args('load',2,{phase:'E'}));
    assert.equal(e.error,false,JSON.stringify(e));
    assert.equal(e.data.snapshot.steps.length,5);
    assert.deepEqual(e.data.snapshot.steps,['intent','provider','code','personal-labels','return']);
    assert.equal(e.data.snapshot.notes.length,7);
    assert.equal(e.data.snapshot.checkpointIds.length,4);
    assert.equal(e.data.snapshot.questions.length,3);
    assert.equal(e.data.snapshot.reference.id,'TEST-ONLY-m2m-r2-reference');
    assert.equal(e.data.snapshot.annotation.rev,1);
    assert.equal(e.data.snapshot.bookmark.active,true);
    assert.equal(e.data.snapshot.operationReceipts.length,25);
    assert.ok(e.data.snapshot.operationReceipts.some(item=>
      item.operationId==='TEST-ONLY-m2m-r2-save-e'&&item.developmentRef?.id));
    const reset=await manage(c,args('reset',3));
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal(reset.data.phase,'A');
    assert.equal(reset.data.snapshot.notes.length,0);
    const original=await c.context('article','owner-reusable-reference');
    assert.equal(original.status,200);
    assert.equal(original.data.record.rev,1);
    assert.equal(original.data.record.body,'Retain me across TEST ONLY fixture reset.');
    assert.equal((await c.context('journey',e.data.snapshot.project.id)).status,404,
      'Previous Project is in Trash, not duplicated as an active Project');
    const oldNote=await c.context('note',e.data.snapshot.notes[0].id);
    assert.equal(oldNote.status,404);
    const withdrawn=await fixture.db.prepare('SELECT withdrawn,revision FROM v2_learning_developments WHERE owner=? AND id=?')
      .bind(owner,'TEST-ONLY-m2m-r2-save-e').first();
    assert.deepEqual(withdrawn,{withdrawn:1,revision:2},
      'Former fixture checkpoint is withdrawn through canonical revision, with history preserved');
    const fresh=await manage(c,{purpose:'TEST ONLY',action:'inspect',expectedGeneration:'legacy@0'});
    assert.deepEqual(fresh.data.snapshot,reset.data.snapshot);
    assert.equal(fresh.data.active.revision,4);
    assert.notEqual(fresh.data.snapshot.project.id,e.data.snapshot.project.id);
  }finally{await fixture.dispose();}
});
test('pending interrupted transition resumes from canonical per-record receipts',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),input=args('load',0,{phase:'A'});
    const initial=await manage(c,input);
    assert.equal(initial.error,false);
    // Model the precise crash window after all canonical domain writes but
    // before controller acknowledgement. No real user records are changed.
    const pending={action:'load',operationId:input.operationId,
      payload:JSON.stringify({action:'load',scenarioId,phase:'A',expectedGeneration:'legacy@0',expectedRevision:0}),
      epoch:1,phase:'A',previousEpoch:0,previousPhase:null};
    await fixture.db.prepare('UPDATE v2_scenario_control SET phase=NULL,revision=0,epoch=0,receipt_json=NULL,pending_json=? WHERE owner=? AND scenario=?')
      .bind(JSON.stringify(pending),owner,scenarioId).run();
    const blocked=await manage(c,args('load',0,{phase:'A',operationId:'different-while-pending'}));
    assert.equal(blocked.data.code,'scenario_operation_pending');
    const resumed=await manage(c,input);
    assert.equal(resumed.error,false,JSON.stringify(resumed));
    assert.deepEqual(resumed.data.snapshot,initial.data.snapshot);
    assert.equal(resumed.data.controllerRevision,1);
    const seen=await manage(c,{purpose:'TEST ONLY',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(seen.data.active.revision,1);
    assert.equal(seen.data.pending,undefined);
  }finally{await fixture.dispose();}
});
test('cleanup fails closed on a newly introduced fixture-prefixed record not in manifest',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner);
    const loaded=await manage(c,args('load',0,{phase:'A'}));
    assert.equal(loaded.error,false);
    const unexpected=await c.command({operationId:'unexpected-test-record',action:'create',
      family:'note',id:'TEST-ONLY-m2m-r1-unregistered',data:{title:'TEST ONLY unexpected',body:'Do not silently purge',synthetic:true}});
    assert.equal(unexpected.status,200);
    const reset=await manage(c,args('reset',1));
    assert.equal(reset.error,true);
    assert.equal(reset.data.code,'fixture_cleanup_boundary');
    assert.equal((await c.context('note','TEST-ONLY-m2m-r1-unregistered')).status,200);
    const pending=await manage(c,{purpose:'TEST ONLY',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(pending.data.retryRequired,true);
  }finally{await fixture.dispose();}
});

test('requested Library output is absent at F, survives readback and is removed by safe reset',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),listed=await manage(c,{purpose:'TEST ONLY inspect versioned Library request',action:'list'});
    assert.equal(listed.data.fixtureVersion,'mood-to-music/3');
    const initial=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(initial.error,false,JSON.stringify(initial));
    assert.equal(initial.data.snapshot.notes.length,9);
    assert.equal(initial.data.snapshot.questions.length,4);
    assert.equal(initial.data.snapshot.requestedArticle,null,'No canned answer may be seeded');
    const run='TEST-ONLY-m2m-r'+initial.data.epoch,output=run+'-requested-label-storage';
    const created=await c.command({operationId:run+'-lib-smoke-create',action:'create',family:'article',id:output,
      data:{title:'TEST ONLY mechanics-only Library output',body:'Test transport, not teaching quality.',synthetic:true,
        learningScope:{version:1,spaces:['computing'],provenance:'authored'},
        sections:[{id:'demo',title:'Smoke test',parts:[{id:'p',kind:'paragraph',text:'Mock result is not a pedagogical exemplar.'}]}],
        links:[{family:'journey',id:run+'-project',relation:'related'}]}});
    assert.equal(created.status,200,JSON.stringify(created.data));
    const article=created.data.record;
    const anchor={articleId:output,recordFamily:'article',rendition:article.rendition,sectionId:'demo',partId:'p',start:0,end:4,quote:'Mock'};
    const flagged=await c.command({operationId:run+'-lib-smoke-flag',action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0});
    assert.equal(flagged.status,200,JSON.stringify(flagged.data));
    const annotated=await c.command({operationId:run+'-lib-smoke-annotation',action:'create',family:'annotation',
      id:run+'-annotation-library',data:{title:'TEST ONLY passage feedback',body:'Needs an example.',anchor,synthetic:true}});
    assert.equal(annotated.status,200,JSON.stringify(annotated.data));
    const project=(await c.context('journey',run+'-project')).data.record;
    const checkpoint=await c.request('/api/learning-developments',{
      intent:'explicit-user-checkpoint',operationId:run+'-save-c01',expectedGeneration:'legacy@0',
      target:{kind:'journey-stage',journeyId:project.id,stageId:'personal-labels'},expectedTargetRev:project.rev,
      development:{summary:'TEST ONLY optional checkpoint cleanup probe; no actual dialogue assessed.'}
    });
    assert.equal(checkpoint.status,200,JSON.stringify(checkpoint.data));
    const after=await manage(c,{purpose:'TEST ONLY inspect generated output',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(after.data.snapshot.requestedArticle.rev,1);
    assert.equal(after.data.snapshot.requestedAnnotation.rev,1);
    assert.ok(after.data.snapshot.checkpointIds.includes(run+'-save-c01'));
    const reset=await manage(c,args('reset',1));
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal(reset.data.snapshot.requestedArticle,null);
    assert.equal((await c.context('article',output)).status,404);
    assert.equal((await c.context('annotation',run+'-annotation-library')).status,404);
    assert.equal((await c.context('flag',flagged.data.bookmark.flagRef.id)).status,404);
    const old=await fixture.db.prepare('SELECT withdrawn FROM v2_learning_developments WHERE owner=? AND id=?').bind(owner,run+'-save-c01').first();
    assert.equal(old?.withdrawn,1);
    const reloaded=await manage(c,args('load',2,{phase:'F'}));
    assert.equal(reloaded.error,false,JSON.stringify(reloaded));
    assert.equal(reloaded.data.snapshot.requestedArticle,null);
  }finally{await fixture.dispose();}
  // A completely empty D1, including a missing controller row, is sufficient.
  const empty=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=empty.client(owner);
    const blank=await manage(c,{purpose:'TEST ONLY inspect after clearing user data',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(blank.data.active.phase,null);
    const restored=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(restored.error,false,JSON.stringify(restored));
    assert.equal(restored.data.snapshot.requestedArticle,null);
    assert.equal(restored.data.snapshot.notes.length,9);
  }finally{await empty.dispose();}
});
test('unregistered conversational checkpoint blocks reset before deleting records',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),loaded=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const project=(await c.context('journey','TEST-ONLY-m2m-r1-project')).data.record;
    const unexpected=await c.request('/api/learning-developments',{
      intent:'explicit-user-checkpoint',operationId:'unexpected-conversation-save',expectedGeneration:'legacy@0',
      target:{kind:'journey-stage',journeyId:project.id,stageId:'personal-labels'},expectedTargetRev:project.rev,
      development:{summary:'TEST ONLY unregistered checkpoint must not be abandoned.'}
    });
    assert.equal(unexpected.status,200,JSON.stringify(unexpected.data));
    const denied=await manage(c,args('reset',1));
    assert.equal(denied.error,true);
    assert.equal(denied.data.code,'fixture_checkpoint_mismatch');
    assert.equal((await c.context('journey',project.id)).status,200);
    const row=await fixture.db.prepare('SELECT withdrawn FROM v2_learning_developments WHERE owner=? AND id=?')
      .bind(owner,'unexpected-conversation-save').first();
    assert.equal(row?.withdrawn,0);
  }finally{await fixture.dispose();}
});
test('real substantial manuscript publishing yields a derived ms-* Article and clean reset',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),loaded=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const run='TEST-ONLY-m2m-r'+loaded.data.epoch;
    const result=await rpc(c,'publish_minamo_manuscript',{
      purpose:'TEST ONLY explicit substantial Library publication lifecycle',
      operationId:run+'-lib01-manuscript',expectedGeneration:'legacy@0',synthetic:true,
      manuscript:{version:1,brief:'TEST ONLY User asked for a reference; content quality not evaluated in mechanics test.',
        documents:[{key:'storage',role:'article',title:'TEST ONLY manuscript transport probe',
          markdown:'## Local state\n\nA mock transport test, not an educational answer.\n\n## Persistence\n\nAnother section for readback.'}]}
    });
    assert.notEqual(result.isError,true,JSON.stringify(result));
    const receipt=result.structuredContent;
    assert.equal(receipt.kind,'manuscript-v1');
    assert.equal(receipt.recordRefs.length,1);
    const articleId=receipt.recordRefs[0].id;
    assert.match(articleId,/^ms-[0-9a-f]{40}$/);
    const published=await c.context('article',articleId);
    assert.equal(published.status,200);
    assert.equal(published.data.record.synthetic,true);
    const after=await manage(c,{purpose:'TEST ONLY inspect manuscript output',action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(after.data.snapshot.requestedArticle.id,articleId);
    const flag=await c.command({operationId:run+'-manuscript-flag',action:'setFlag',
      target:{kind:'record',family:'article',id:articleId},active:true,expectedTargetRev:0});
    assert.equal(flag.status,200,JSON.stringify(flag.data));
    const reset=await manage(c,args('reset',1));
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal((await c.context('article',articleId)).status,404);
    assert.equal((await c.context('flag',flag.data.bookmark.flagRef.id)).status,404);
    assert.equal(reset.data.snapshot.requestedArticle,null);
  }finally{await fixture.dispose();}
});
test('Article revision does not strand a Flag on an old retained passage rendition',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),loaded=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const oldFlag=loaded.data.snapshot.bookmark.flagRef.id;
    const id='TEST-ONLY-m2m-r1-reference',original=(await c.context('article',id)).data.record;
    const revised=await c.command({operationId:'TEST-ONLY-m2m-r1-reference-revision',action:'update',family:'article',id,
      expectedRev:original.rev,data:{body:original.body+'\nTEST ONLY later revision.'}});
    assert.equal(revised.status,200,JSON.stringify(revised.data));
    assert.notEqual(revised.data.record.rendition,original.rendition);
    const reset=await manage(c,args('reset',1));
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal((await c.context('flag',oldFlag)).status,404);
  }finally{await fixture.dispose();}
});

test('one six-session run retains requested outputs across User actions and resets exact accumulated state',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:settings});
  try{
    const c=fixture.client(owner),loaded=await manage(c,args('load',0,{phase:'F'}));
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const run='TEST-ONLY-m2m-r'+loaded.data.epoch,articleId=run+'-requested-label-storage';
    const project=(await c.context('journey',run+'-project')).data.record;
    const article=await c.command({operationId:run+'-lib01-direct-create',action:'create',family:'article',id:articleId,
      data:{synthetic:true,title:'TEST ONLY prompted Library result',body:'Stub for output lifecycle testing, not a benchmark answer.',
        learningScope:{version:1,spaces:['computing'],provenance:'authored'},
        sections:[{id:'refresh',title:'Refresh',parts:[{id:'p',kind:'paragraph',text:'Browser storage differs from React state.'}]}],
        links:[{family:'journey',id:project.id,relation:'related'}]}});
    assert.equal(article.status,200,JSON.stringify(article.data));
    const published=await rpc(c,'publish_minamo_manuscript',{
      purpose:'TEST ONLY optional second Library publication during conversation',
      operationId:run+'-lib04-manuscript',expectedGeneration:'legacy@0',synthetic:true,
      manuscript:{version:1,brief:'TEST ONLY supplied request; actual learning value assessed later.',
        documents:[{key:'privacy',role:'article',title:'TEST ONLY second requested reference',
          markdown:'## Shared browser\n\nA mock output for lifecycle testing.\n\n## Choice\n\nOpt-in is explicit.'}]}
    });
    assert.notEqual(published.isError,true,JSON.stringify(published));
    const secondId=published.structuredContent.recordRefs[0].id;
    assert.match(secondId,/^ms-[0-9a-f]{40}$/);
    const second=(await c.context('article',secondId)).data.record;
    const part=second.sections.flatMap(section=>section.parts.map(part=>({...part,sectionId:section.id})))
      .find(part=>typeof part.text==='string'&&part.text.length>=6);
    assert.ok(part);
    const anchor={articleId:secondId,recordFamily:'article',rendition:second.rendition,
      sectionId:part.sectionId,partId:part.id,start:0,end:6,quote:part.text.slice(0,6)};
    const annotation=await c.command({operationId:run+'-lib04-quick-annotation',action:'create',family:'annotation',
      id:run+'-annotation-privacy-library',data:{title:'TEST ONLY quick reminder',body:'Shared device?',anchor,synthetic:true}});
    assert.equal(annotation.status,200,JSON.stringify(annotation.data));
    const flag=await c.command({operationId:run+'-lib04-flag',action:'setFlag',
      target:{kind:'record',family:'article',id:secondId},active:true,expectedTargetRev:0});
    assert.equal(flag.status,200,JSON.stringify(flag.data));
    const cp=await c.request('/api/learning-developments',{
      intent:'explicit-user-checkpoint',operationId:run+'-save-c02',expectedGeneration:'legacy@0',
      target:{kind:'journey-stage',journeyId:project.id,stageId:'personal-labels'},expectedTargetRev:project.rev,
      development:{summary:'TEST ONLY user-authorised optional return checkpoint.'}
    });
    assert.equal(cp.status,200,JSON.stringify(cp.data));

    let latest;
    for(const [index,phase] of ['G','H','I','J','K'].entries()){
      latest=await manage(c,args('advance',index+1));
      assert.equal(latest.error,false,`Advance ${phase}: ${JSON.stringify(latest)}`);
      assert.equal(latest.data.phase,phase);
      assert.equal(latest.data.snapshot.requestedArticles.length,2,'Generated material persists between fresh GPT chats');
    }
    assert.equal(latest.data.snapshot.notes.length,19);
    assert.equal(latest.data.snapshot.annotations.length,10,'Historical, short User and one requested-output annotation');
    assert.ok(latest.data.snapshot.flagRefs.length>=6);
    assert.ok(latest.data.snapshot.checkpointIds.includes(run+'-save-c02'));
    assert.equal((await c.context('note',run+'-note-plan')).data.record.rev,2);

    const reset=await manage(c,args('reset',6));
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal(reset.data.phase,'A');
    assert.equal((await c.context('article',articleId)).status,404);
    assert.equal((await c.context('article',secondId)).status,404);
    assert.equal((await c.context('annotation',run+'-annotation-privacy-library')).status,404);
    assert.equal((await c.context('flag',flag.data.bookmark.flagRef.id)).status,404);
    assert.equal((await c.context('note',run+'-note-return-later')).status,404);
    const withdrawn=await fixture.db.prepare('SELECT withdrawn FROM v2_learning_developments WHERE owner=? AND id=?')
      .bind(owner,run+'-save-c02').first();
    assert.equal(withdrawn?.withdrawn,1);
    const loadedAgain=await manage(c,args('load',7,{phase:'K'}));
    assert.equal(loadedAgain.error,false,JSON.stringify(loadedAgain));
    assert.equal(loadedAgain.data.snapshot.notes.length,19);
    assert.equal(loadedAgain.data.snapshot.requestedArticles.length,0,'Empty-store replay never seeds GPT output');
  }finally{await fixture.dispose();}
});
