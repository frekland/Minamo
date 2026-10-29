import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const owner='TEST-ONLY-scenario-owner';
const other='TEST-ONLY-scenario-invited-account';
const scenarioId='mood-to-music';
const settings={MINAMO_OWNER_ID:owner,MINAMO_SITE_HOSTS:'storage.test',MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED:'1'};
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
test('owner gate, recovery preflight and exact scenario identifiers',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:{...settings,MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED:'0'}});
  try{
    const ownerClient=fixture.client(owner),invited=fixture.client(other);
    const ownerList=await listTools(ownerClient),invitedList=await listTools(invited);
    assert.ok(ownerList.data.result.tools.some(tool=>tool.name==='manage_minamo_test_scenario'));
    assert.ok(!invitedList.data.result.tools.some(tool=>tool.name==='manage_minamo_test_scenario'));
    const denied=await manage(invited,{purpose:'TEST ONLY',action:'list'});
    assert.equal(denied.data.code,'scenario_owner_required');
    const listed=await manage(ownerClient,{purpose:'TEST ONLY',action:'list'});
    assert.equal(listed.data.states.length,5);
    assert.equal(listed.data.libraryRecoveryVerified,false);
    const locked=await manage(ownerClient,args('load',0,{phase:'A'}));
    assert.equal(locked.data.code,'library_recovery_not_verified');
    const invalid=await manage(ownerClient,args('load',0,{scenarioId:'not-in-catalogue',phase:'A'}));
    assert.equal(invalid.data.code,'unknown_scenario');
    const malformed=await manage(ownerClient,args('load',0,{phase:'__prototype__'}));
    assert.equal(malformed.data.code,'unknown_scenario_phase');
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
