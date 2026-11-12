import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const OWNER='TEST-ONLY-transcript-owner',OTHER='TEST-ONLY-invited-reader',SCENARIO='mood-to-music';
const bindings={MINAMO_OWNER_ID:OWNER,MINAMO_SITE_HOSTS:'storage.test',MINAMO_SCENARIO_CONTROL_ENABLED:'1',
  MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'1',MINAMO_SCENARIO_SOURCE_SHA:'TEST-ONLY-source-pin'};
const purpose='Owner authorised TEST ONLY Mood-to-Music transcript acceptance';
async function rpc(client,name,args){
  const r=await client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}});
  assert.equal(r.status,200);
  return {error:r.data.result.isError===true,...r.data.result.structuredContent};
}
const scenario=(c,input)=>rpc(c,'manage_minamo_test_scenario',{purpose,scenarioId:SCENARIO,...input});
const append=(c,input)=>rpc(c,'append_minamo_test_transcript',{purpose,scenarioId:SCENARIO,runId:'M2M-V3-R001',epoch:1,
  expectedGeneration:'legacy@0',...input});
const read=(c,input)=>rpc(c,'read_minamo_test_transcript',{purpose,scenarioId:SCENARIO,...input});
const start=c=>append(c,{action:'start',operationId:'test-start-r001',fixtureVersion:'mood-to-music/3',modelLabel:'test-harness-not-a-real-model'});
const segment=(sequence,kind,other={})=>({action:'append',expectedRevision:sequence-1,sequence,
  operationId:`test-log-${sequence}`,entryId:`e${sequence}`,sessionId:'S01',eventKind:kind,...other});
async function loaded(c){
  const r=await scenario(c,{action:'load',phase:'F',expectedGeneration:'legacy@0',expectedRevision:0,operationId:'test-load-f'});
  assert.equal(r.error,false,JSON.stringify(r));assert.equal(r.phase,'F');return r;
}
test('test-only MCP tools hidden when disabled and denied to non-owners even when enabled',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings:{MINAMO_OWNER_ID:OWNER,MINAMO_SITE_HOSTS:'storage.test'}});
  try{
    const c=fixture.client(OWNER);
    const listed=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
    assert.ok(!listed.data.result.tools.some(t=>t.name.includes('_test_transcript')));
    assert.equal((await read(c,{action:'list'})).code,'scenario_control_disabled');
  }finally{await fixture.dispose();}
  const enabled=await privateStorageFixture(worker,{bindings});
  try{
    const owner=enabled.client(OWNER),invited=enabled.client(OTHER);
    const ownerList=await owner.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
    const otherList=await invited.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});
    assert.ok(ownerList.data.result.tools.some(t=>t.name==='append_minamo_test_transcript'));
    assert.ok(!otherList.data.result.tools.some(t=>t.name==='read_minamo_test_transcript'));
    assert.equal((await read(invited,{action:'list'})).code,'scenario_owner_required');
    assert.equal((await append(invited,{action:'start',fixtureVersion:'mood-to-music/3',operationId:'nonowner'})).code,'scenario_owner_required');
  }finally{await enabled.dispose();}
});

test('incremental append, exact retry, immutable chronology, cold-reader discovery and canonical receipts',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const first=fixture.client(OWNER);await loaded(first);
    const scripted=await read(first,{action:'turn',sessionId:'S01'});
    assert.equal(scripted.phase,'F');assert.match(scripted.prompt,/React labels surviving mood changes/);
    const begun=await start(first);assert.equal(begun.error,false);assert.equal(begun.transcriptRevision,0);
    const retriedStart=await start(first);assert.equal(retriedStart.replayed,true);
    const prompt=await append(first,segment(1,'fixture.user-turn'));
    assert.equal(prompt.error,false);assert.equal(prompt.event.provenance,'fixture-defined');
    assert.equal(prompt.event.markdown,scripted.prompt);
    const partial=await read(first,{action:'read',runId:'M2M-V3-R001'});
    assert.equal(partial.coverage.sessions[0].incomplete,true,'missing assistant text must be visibly incomplete');
    assert.equal((await append(first,segment(2,'fixture.user-turn'))).code,'test_turn_duplicate');
    const receipt='TEST-ONLY-m2m-r1-save-e';
    const toolReport='TEST HARNESS ONLY: a placeholder tool-attempt summary, not a claimed actual ChatGPT call.';
    const report=await append(first,segment(2,'model.transcript',{segmentType:'tool-attempt',markdown:toolReport,
      links:[{kind:'operation',id:receipt}]}));
    assert.equal(report.error,false);assert.equal(report.run.transcriptRevision,2);
    const testResponse='TEST HARNESS ONLY: placeholder response bytes for persistence verification; NO real GPT output was generated.';
    const response=await append(first,segment(3,'model.transcript',{segmentType:'assistant-response',markdown:testResponse}));
    assert.equal(response.error,false);
    assert.equal((await append(first,segment(3,'model.transcript',{segmentType:'assistant-response',markdown:testResponse}))).replayed,true);
    assert.equal((await append(first,segment(3,'model.transcript',{segmentType:'assistant-response',markdown:'CHANGED'}))).code,'test_idempotency_mismatch');
    assert.equal((await append(first,segment(5,'model.transcript',{expectedRevision:3,segmentType:'session-note',markdown:'gap'}))).code,'test_sequence_conflict');
    assert.equal((await append(first,segment(4,'model.transcript',{expectedRevision:1,segmentType:'session-note',markdown:'stale'}))).code,'test_revision_conflict');
    assert.equal((await append(first,segment(4,'model.transcript',{segmentType:'session-note',markdown:'not a real record',
      links:[{kind:'record',family:'note',id:'private-user-note'}]}))).code,'invalid_test_links');
    // A distinct client (stand-in for a cold ChatGPT connection) can discover
    // the entire ordered ledger without receiving its contents from first.
    const second=fixture.client(OWNER),listed=await read(second,{action:'list'});
    assert.equal(listed.runs.length,1);assert.equal(listed.runs[0].transcriptRevision,3);
    const p1=await read(second,{action:'read',runId:'M2M-V3-R001',limit:2});
    assert.deepEqual(p1.events.map(e=>e.sequence),[1,2]);assert.equal(p1.nextAfterSequence,2);
    const p2=await read(second,{action:'read',runId:'M2M-V3-R001',afterSequence:2});
    assert.deepEqual(p2.events.map(e=>e.sequence),[3]);assert.equal(p2.nextAfterSequence,null);
    assert.equal(p2.coverage.hostTranscriptAttested,false);assert.deepEqual(p2.coverage.missingSequences,[]);
    assert.deepEqual(p1.events[1].links,[{kind:'operation',id:receipt}]);
    assert.equal(p2.coverage.sessions[0].incomplete,false);
    const canonical=await rpc(second,'read_minamo_operation',{purpose,operationId:receipt});
    assert.equal(canonical.error,false);assert.equal(canonical.status,'committed');
    const project=await rpc(second,'read_minamo_record',{purpose,family:'journey',id:'TEST-ONLY-m2m-r1-project'});
    assert.equal(project.record.synthetic,true);
    assert.equal((await read(second,{action:'read',runId:'not-a-run'})).code,'test_run_unknown');
  }finally{await fixture.dispose();}
});

test('epoch, phase, sealing, concurrent append conflict, scope and reset/replay isolation',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER);await loaded(c);await start(c);
    assert.equal((await append(c,segment(1,'fixture.user-turn',{expectedGeneration:'legacy@42'}))).code,'generation_conflict');
    assert.equal((await append(c,segment(1,'fixture.user-turn',{sessionId:'S02'}))).code,'test_phase_conflict');
    assert.equal((await append(c,segment(1,'fixture.user-turn',{markdown:'Forged fixture content'}))).code,'invalid_fixture_turn');
    assert.equal((await append(c,{action:'start',runId:'second-run',operationId:'test-other-start',fixtureVersion:'mood-to-music/3'})).code,'test_run_conflict');
    await append(c,segment(1,'fixture.user-turn'));
    const candidates=[segment(2,'model.transcript',{segmentType:'tool-result',markdown:'TEST HARNESS ONLY: candidate A'}),
      segment(2,'model.transcript',{operationId:'test-log-2-b',entryId:'e2-b',segmentType:'tool-result',markdown:'TEST HARNESS ONLY: candidate B'})];
    const concurrent=await Promise.all(candidates.map(payload=>append(c,payload)));
    assert.equal(concurrent.filter(result=>!result.error).length,1);
    assert.equal(concurrent.filter(result=>result.error).length,1);
    assert.equal((await read(c,{action:'read',runId:'M2M-V3-R001'})).events.length,2);
    assert.equal((await append(c,segment(3,'model.transcript',{segmentType:'assistant-response',markdown:'x'.repeat(17_000)}))).code,'test_entry_too_large');
    assert.equal((await append(c,{action:'seal',expectedRevision:1})).code,'test_revision_conflict');
    assert.equal((await append(c,{action:'seal',expectedRevision:2})).status,'sealed');
    assert.equal((await append(c,{action:'seal',expectedRevision:2})).replayed,true);
    assert.equal((await append(c,segment(3,'model.transcript',{segmentType:'session-note',markdown:'late'}))).code,'test_run_sealed');
    const reset=await scenario(c,{action:'reset',expectedGeneration:'legacy@0',expectedRevision:1,operationId:'test-reset-epoch2'});
    assert.equal(reset.error,false,JSON.stringify(reset));assert.equal(reset.epoch,2);
    const retired=await read(c,{action:'read',runId:'M2M-V3-R001'});
    assert.equal(retired.run.status,'retired');assert.equal(retired.events.length,2);
    assert.equal((await append(c,segment(3,'model.transcript',{segmentType:'session-note',markdown:'old epoch'}))).code,'test_epoch_conflict');
    const second=await scenario(c,{action:'load',phase:'F',expectedGeneration:'legacy@0',expectedRevision:2,operationId:'test-load-epoch3-f'});
    assert.equal(second.error,false,JSON.stringify(second));
    const next=await append(c,{action:'start',runId:'M2M-V3-R002',epoch:3,fixtureVersion:'mood-to-music/3',operationId:'test-start-r002',personaVariant:'fictional-repeat'});
    assert.equal(next.error,false);assert.equal(next.transcriptRevision,0);
    const runs=await read(c,{action:'list'});assert.equal(runs.runs.length,2);
    assert.notEqual(runs.runs[0].epoch,runs.runs[1].epoch);
    assert.equal((await read(c,{action:'read',runId:'M2M-V3-R002'})).events.length,0);
  }finally{await fixture.dispose();}
});

test('a blocked H-to-I advance can record S04 failure diagnostics without admitting fixture turns or learning writes',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER);await loaded(c);await start(c);
    for(const [index,phase] of ['G','H'].entries()){
      const stepped=await scenario(c,{action:'advance',expectedGeneration:'legacy@0',expectedRevision:index+1,
        operationId:'test-pending-'+phase});
      assert.equal(stepped.error,false,JSON.stringify(stepped));
    }
    const question=(await c.context('investigation','TEST-ONLY-m2m-r1-question-storage')).data.record;
    const unexpected=await c.request('/api/learning-developments',{
      intent:'explicit-user-checkpoint',operationId:'unexpected-S04-checkpoint',expectedGeneration:'legacy@0',
      target:{kind:'investigation',investigationId:question.id},expectedTargetRev:question.rev,
      development:{summary:'TEST HARNESS ONLY unexpected checkpoint must block controller.'}
    });
    assert.equal(unexpected.status,200);
    const blocked=await scenario(c,{action:'advance',expectedGeneration:'legacy@0',expectedRevision:3,
      operationId:'test-blocked-H-I'});
    assert.equal(blocked.code,'fixture_checkpoint_mismatch');
    assert.equal((await read(c,{action:'turn',sessionId:'S04'})).code,'test_turn_unavailable');
    assert.equal((await append(c,segment(1,'fixture.user-turn',{sessionId:'S04'}))).code,'test_scenario_pending');
    assert.equal((await append(c,segment(1,'model.transcript',{sessionId:'S04',segmentType:'assistant-response',
      markdown:'TEST HARNESS ONLY not a real response.'}))).code,'test_scenario_pending');
    assert.equal((await append(c,segment(1,'model.transcript',{sessionId:'S03',segmentType:'tool-attempt',
      markdown:'TEST HARNESS ONLY wrong session.'}))).code,'test_scenario_pending');
    assert.equal((await append(c,segment(1,'model.transcript',{sessionId:'S05',segmentType:'session-note',
      markdown:'TEST HARNESS ONLY future session.'}))).code,'test_scenario_pending');
    assert.equal((await append(c,{action:'seal',expectedRevision:0})).code,'test_scenario_pending');
    const diagnostic=segment(1,'model.transcript',{sessionId:'S04',segmentType:'tool-attempt',
      markdown:'TEST HARNESS ONLY: controller returned fixture_checkpoint_mismatch, no phase-I user turn.'});
    const saved=await append(c,diagnostic);
    assert.equal(saved.error,false,JSON.stringify(saved));
    assert.equal(saved.event.phase,'I');
    assert.equal(saved.event.provenance,'model-submitted');
    assert.equal((await append(c,diagnostic)).replayed,true);
    const summary=await append(c,segment(2,'model.transcript',{sessionId:'S04',
      segmentType:'session-note',markdown:'TEST HARNESS ONLY: recovery remains pending; no tutor reply.'}));
    assert.equal(summary.error,false,JSON.stringify(summary));
    const ledger=await read(c,{action:'read',runId:'M2M-V3-R001'});
    assert.deepEqual(ledger.events.map(e=>e.sequence),[1,2]);
    assert.equal(ledger.coverage.hostTranscriptAttested,false);
    const inspect=await scenario(c,{action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(inspect.active.phase,'H');assert.equal(inspect.active.revision,3);
    assert.equal(inspect.pending.operationId,'test-blocked-H-I');
    assert.equal((await c.context('investigation',question.id)).status,200);
  }finally{await fixture.dispose();}
});
