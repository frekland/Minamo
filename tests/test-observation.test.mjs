import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const OWNER='TEST-ONLY-observation-owner',OTHER='TEST-ONLY-observation-invited';
const bindings={MINAMO_OWNER_ID:OWNER,MINAMO_SITE_HOSTS:'storage.test',MINAMO_SCENARIO_CONTROL_ENABLED:'1',
  MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'1',MINAMO_SCENARIO_SOURCE_SHA:'TEST-ONLY-observation-source'};
const purpose='Owner-authorised, isolated TEST ONLY observed MCP trace and metadata state diff';
const SCENARIO='mood-to-music',RUN='M2M-OBS-LOCAL';
async function rpc(client,name,args){
  const r=await client.request('/mcp',{jsonrpc:'2.0',id:9,method:'tools/call',params:{name,arguments:{purpose,...args}}});
  assert.equal(r.status,200);
  return {...r.data.result.structuredContent,error:r.data.result.isError===true};
}
const scenario=(c,extra)=>rpc(c,'manage_minamo_test_scenario',{scenarioId:SCENARIO,...extra});
const observation=(c,extra)=>rpc(c,'manage_minamo_test_observation',{scenarioId:SCENARIO,runId:RUN,...extra});
async function setup(c){
  const loaded=await scenario(c,{action:'load',phase:'F',expectedGeneration:'legacy@0',expectedRevision:0,operationId:'test-observation-load-f'});
  assert.equal(loaded.error,false,JSON.stringify(loaded));
  const transcript=await rpc(c,'append_minamo_test_transcript',{action:'start',scenarioId:SCENARIO,runId:RUN,
    expectedGeneration:'legacy@0',epoch:1,fixtureVersion:'mood-to-music/3',operationId:'test-observation-transcript-start'});
  assert.equal(transcript.error,false,JSON.stringify(transcript));
}
const start=c=>observation(c,{action:'start',expectedGeneration:'legacy@0',sessionId:'S01',
  operationId:'test-observation-arm-start'});

test('observation is hidden/denied without the exact owner and explicit trace activation',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:{...bindings,MINAMO_SCENARIO_CONTROL_ENABLED:'0'}});
  try{
    const owner=fixture.client(OWNER),other=fixture.client(OTHER);
    const listed=await owner.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
    assert.ok(!listed.data.result.tools.some(t=>t.name==='manage_minamo_test_observation'));
    assert.equal((await observation(owner,{action:'list'})).code,'scenario_control_disabled');
    assert.equal((await observation(other,{action:'list'})).code,'scenario_control_disabled');
  }finally{await fixture.dispose();}
  const enabled=await privateStorageFixture(worker,{bindings});
  try{
    const owner=enabled.client(OWNER),other=enabled.client(OTHER);
    const listed=await other.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
    assert.ok(!listed.data.result.tools.some(t=>t.name==='manage_minamo_test_observation'));
    assert.equal((await observation(other,{action:'list'})).code,'scenario_owner_required');
    assert.equal((await start(owner)).code,'observation_phase_conflict');
  }finally{await enabled.dispose();}
});

test('server-observed successful/error calls and immutable canonical before/after metadata',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER);await setup(c);
    const begun=await start(c);
    assert.equal(begun.error,false,JSON.stringify(begun));
    assert.equal(begun.status,'armed');assert.equal(begun.revision,0);
    assert.equal((await start(c)).replayed,true);
    assert.equal((await observation(c,{action:'capture',checkpointId:'checkpoint-f1',moment:'before'})).error,false);
    const question='TEST-ONLY-m2m-r1-question-storage';
    const questionRead=await rpc(c,'read_minamo_record',{family:'investigation',id:question});
    assert.equal(questionRead.error,false);
    const missing=await rpc(c,'read_minamo_operation',{operationId:'TEST-ONLY-m2m-r1-missing'});
    assert.equal(missing.error,true);assert.equal(missing.code,'operation_unknown');
    // Ordinary non-test reads must never be counted just because a run is armed.
    const unrelated=await rpc(c,'read_minamo_record',{family:'note',id:'ordinary-real-id'});
    assert.equal(unrelated.error,true);
    const written=await rpc(c,'record_minamo_learning_development',{
      intent:'explicit-user-checkpoint',operationId:'TEST-ONLY-m2m-r1-observation-checkpoint',
      expectedGeneration:'legacy@0',target:{kind:'investigation',investigationId:question},
      expectedTargetRev:questionRead.record.rev,
      development:{summary:'TEST HARNESS ONLY: synthetic checkpoint for revision-diff integration.'}});
    assert.equal(written.error,false,JSON.stringify(written));
    const after=await observation(c,{action:'capture',checkpointId:'checkpoint-f1',moment:'after'});
    assert.equal(after.error,false,JSON.stringify(after));
    const replay=await observation(c,{action:'capture',checkpointId:'checkpoint-f1',moment:'before'});
    assert.equal(replay.replayed,true);
    const diff=await observation(c,{action:'diff',checkpointId:'checkpoint-f1'});
    assert.equal(diff.eventKind,'state.verified-diff');assert.equal(diff.error,false);
    assert.ok(diff.changes.some(c=>c.key.includes('observation-checkpoint')),
      JSON.stringify(diff.changes));
    assert.ok(diff.changes.every(c=>!JSON.stringify(c).includes('synthetic checkpoint for')),
      'no authored checkpoint text enters canonical snapshot');
    const calls=await observation(c,{action:'calls',limit:2});
    assert.equal(calls.total,3,JSON.stringify(calls));
    assert.equal(calls.events.length,2);assert.equal(calls.nextOffset,2);
    const page2=await observation(c,{action:'calls',offset:2});
    assert.equal(page2.events.length,1);
    const all=[...calls.events,...page2.events];
    assert.ok(all.some(c=>c.eventKind==='mcp.observed-error'&&c.errorCode==='operation_unknown'));
    assert.ok(all.some(c=>c.tool==='record_minamo_learning_development'&&c.outcome==='success'));
    assert.ok(all.every(c=>Number.isInteger(c.elapsedMs)&&c.elapsedMs>=0));
    assert.ok(all.every(c=>!('arguments' in c)&&!('response' in c)&&!('owner' in c)));
    assert.equal(diff.observedCallsBetween.count,3);
    assert.equal(diff.observedCallsBetween.byTool.read_minamo_record.calls,1);
    const paused=await observation(c,{action:'pause',expectedRevision:0,operationId:'test-observation-pause'});
    assert.equal(paused.status,'paused');
    await rpc(c,'read_minamo_record',{family:'investigation',id:question});
    assert.equal((await observation(c,{action:'calls'})).total,3);
    assert.equal((await observation(c,{action:'arm',sessionId:'S02',expectedRevision:1,
      operationId:'test-observation-wrong-phase'})).code,'observation_phase_conflict');
    assert.equal((await observation(c,{action:'arm',sessionId:'S01',expectedRevision:0,
      operationId:'test-observation-stale'})).code,'observation_revision_conflict');
    const armed=await observation(c,{action:'arm',sessionId:'S01',expectedRevision:1,
      operationId:'test-observation-rearm'});
    assert.equal(armed.status,'armed');
    const stopped=await observation(c,{action:'stop',expectedRevision:2,operationId:'test-observation-stop'});
    assert.equal(stopped.status,'sealed');
    assert.equal((await observation(c,{action:'stop',expectedRevision:2,operationId:'test-observation-stop'})).replayed,true);
    await rpc(c,'read_minamo_record',{family:'investigation',id:question});
    assert.equal((await observation(c,{action:'calls'})).total,3);
  }finally{await fixture.dispose();}
});

test('an observation is epoch-pinned; earlier evidence remains readable after fixture reset',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER);await setup(c);await start(c);
    await observation(c,{action:'capture',checkpointId:'empty-pair',moment:'before'});
    assert.equal((await observation(c,{action:'diff',checkpointId:'empty-pair'})).code,'observation_pair_incomplete');
    const reset=await scenario(c,{action:'reset',expectedGeneration:'legacy@0',expectedRevision:1,
      operationId:'test-observation-reset'});
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal((await observation(c,{action:'capture',checkpointId:'empty-pair',moment:'after'})).code,'observation_retired');
    const old=await observation(c,{action:'snapshots'});
    assert.equal(old.snapshots.length,1);assert.equal(old.snapshots[0].phase,'F');
    assert.equal((await observation(c,{action:'list'})).runs.length,1);
  }finally{await fixture.dispose();}
});

test('an armed session does not silently follow the fixture into the next fictional session',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER);await setup(c);await start(c);
    const moved=await scenario(c,{action:'advance',expectedGeneration:'legacy@0',expectedRevision:1,
      operationId:'test-observation-advance-g'});
    assert.equal(moved.error,false,JSON.stringify(moved));assert.equal(moved.phase,'G');
    const id='TEST-ONLY-m2m-r1-project';
    await rpc(c,'read_minamo_record',{family:'journey',id});
    assert.equal((await observation(c,{action:'calls'})).total,0,
      'S01 observer cannot silently collect S02 calls');
    assert.equal((await observation(c,{action:'capture',checkpointId:'g-before',moment:'before'})).code,
      'observation_phase_conflict');
    const rearmed=await observation(c,{action:'arm',sessionId:'S02',expectedRevision:0,
      operationId:'test-observation-arm-s02'});
    assert.equal(rearmed.error,false);assert.equal(rearmed.sessionId,'S02');
    await rpc(c,'read_minamo_record',{family:'journey',id});
    const calls=await observation(c,{action:'calls'});
    assert.equal(calls.total,1);assert.equal(calls.events[0].sessionId,'S02');
    const captured=await observation(c,{action:'capture',checkpointId:'g-before',moment:'before'});
    assert.equal(captured.error,false);assert.equal(captured.snapshot.phase,'G');
  }finally{await fixture.dispose();}
});
