import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const failingTraceWorker=[
  "import {domainHandler} from './lib/domain-handler.ts';",
  "export default {fetch(request,env,ctx){",
  " const original=env.DB;",
  " const failing=new Proxy(original,{get(target,key){",
  "  if(key==='prepare')return sql=>sql.includes('INSERT INTO v2_test_observed_calls')?",
  "   {bind(){return {run:async()=>{throw Error('TEST ONLY injected trace insert failure')}}}}:",
  "   target.prepare(sql);",
  "  const value=target[key];return typeof value==='function'?value.bind(target):value;",
  " }});",
  " return domainHandler(request,{...env,DB:failing},ctx);",
  "}}"
].join('\n');
const OWNER='TEST-ONLY-observation-adversarial-owner';
const SCENARIO='mood-to-music',RUN='M2M-OBS-ADVERSARIAL';
const bindings={MINAMO_OWNER_ID:OWNER,MINAMO_SITE_HOSTS:'storage.test',
  MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'1',
  MINAMO_SCENARIO_SOURCE_SHA:'TEST-ONLY-observation-adversarial-source'};
const purpose='Owner-authorised isolated TEST ONLY adversarial observer acceptance';
async function rpc(client,name,args){
  const response=await client.request('/mcp',{jsonrpc:'2.0',id:12,method:'tools/call',
    params:{name,arguments:{purpose,...args}}});
  assert.equal(response.status,200);
  return {...response.data.result.structuredContent,error:response.data.result.isError===true};
}
const observe=(client,args)=>rpc(client,'manage_minamo_test_observation',
  {scenarioId:SCENARIO,runId:RUN,...args});
async function setup(client){
  const loaded=await rpc(client,'manage_minamo_test_scenario',
    {action:'load',scenarioId:SCENARIO,phase:'F',expectedGeneration:'legacy@0',
      expectedRevision:0,operationId:'test-observer-adversarial-load-f'});
  assert.equal(loaded.error,false,JSON.stringify(loaded));
  const transcript=await rpc(client,'append_minamo_test_transcript',
    {action:'start',scenarioId:SCENARIO,runId:RUN,expectedGeneration:'legacy@0',
      epoch:1,fixtureVersion:'mood-to-music/3',operationId:'test-observer-adversarial-transcript'});
  assert.equal(transcript.error,false,JSON.stringify(transcript));
  const armed=await observe(client,{action:'start',sessionId:'S01',expectedGeneration:'legacy@0',
    operationId:'test-observer-adversarial-start'});
  assert.equal(armed.error,false,JSON.stringify(armed));
  assert.equal(armed.status,'armed');
}

test('exact synthetic selectors, opaque Flag readbacks, owner privacy and direct D1 columns',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const client=fixture.client(OWNER);
    await setup(client);
    const canary='PRIVATE-LEARNER-CANARY-DO-NOT-STORE';
    const ordinary=await client.command({action:'create',family:'article',id:'ordinary-observation-canary',
      data:{title:'TEST ONLY unrelated owner Article',body:canary,synthetic:false}});
    assert.equal(ordinary.status,200,JSON.stringify(ordinary.data));
    const ordinaryRead=await rpc(client,'read_minamo_record',
      {family:'article',id:'ordinary-observation-canary'});
    assert.equal(ordinaryRead.error,false);
    const spoofed=await rpc(client,'preview_minamo_command',
      {command:{action:'setFlag',target:{kind:'record',family:'article',id:'ordinary-observation-canary'},
        active:true,expectedTargetRev:0,expectedGeneration:'legacy@0',
        operationId:'TEST-ONLY-m2m-r1-spoofed-key'}});
    assert.equal(spoofed.error,false,JSON.stringify(spoofed));
    await rpc(client,'read_minamo_record',{family:'note',id:'TEST-ONLY-m2m-r2-absent'});
    assert.equal((await observe(client,{action:'calls'})).total,0,
      'ordinary targets and wrong-epoch IDs must not become traceable via synthetic operation keys');

    const article='TEST-ONLY-m2m-r1-reference';
    assert.equal((await rpc(client,'read_minamo_record',{family:'article',id:article})).error,false);
    const activation=await rpc(client,'apply_minamo_command',
      {command:{action:'setFlag',target:{kind:'record',family:'article',id:article},
        active:true,expectedTargetRev:0,expectedGeneration:'legacy@0',
        operationId:'TEST-ONLY-m2m-r1-adversarial-flag-on'}});
    assert.equal(activation.error,false,JSON.stringify(activation));
    assert.equal(activation.status,'committed');
    const flagId=activation.recordRef.id;
    assert.match(flagId,/^flag-[a-f0-9]{64}$/);
    assert.equal((await rpc(client,'read_minamo_record',{family:'flag',id:flagId})).error,false);
    assert.equal((await rpc(client,'read_minamo_operation',
      {operationId:'TEST-ONLY-m2m-r1-adversarial-flag-on'})).error,false);
    const missing=await rpc(client,'read_minamo_operation',
      {operationId:'TEST-ONLY-m2m-r1-adversarial-absent'});
    assert.equal(missing.code,'operation_unknown');

    const before=await observe(client,{action:'capture',checkpointId:'privacy-canary',moment:'before'});
    assert.equal(before.error,false,JSON.stringify(before));
    const after=await observe(client,{action:'capture',checkpointId:'privacy-canary',moment:'after'});
    assert.equal(after.error,false,JSON.stringify(after));
    const observed=await observe(client,{action:'calls'});
    assert.equal(observed.total,5,JSON.stringify(observed));
    assert.equal(observed.events.filter(x=>x.outcome==='error').length,1);
    assert.ok(observed.events.some(x=>x.tool==='read_minamo_record'&&x.outcome==='success'));
    assert.ok(observed.events.some(x=>x.tool==='read_minamo_operation'&&x.errorCode==='operation_unknown'));
    assert.equal(observed.run.coverage.hostComplete,false);
    assert.equal(observed.run.coverage.bestEffort,true);
    assert.match(observed.run.retention,/owner-scoping key/);
    assert.doesNotMatch(JSON.stringify(observed),new RegExp(OWNER));

    const stored=await fixture.db.prepare('SELECT * FROM v2_test_observed_calls WHERE owner=?')
      .bind(OWNER).all();
    assert.equal(stored.results.length,5);
    assert.ok(stored.results.every(row=>row.owner===OWNER),
      'private D1 uses owner keys for isolation, despite excluding them from observed event responses');
    assert.deepEqual(Object.keys(stored.results[0]).sort(),
      ['owner','scenario','run_id','call_id','session_id','phase','tool_name',
        'outcome','error_code','elapsed_ms','received_at'].sort());
    const snapshots=await fixture.db.prepare('SELECT state_json FROM v2_test_state_snapshots WHERE owner=?')
      .bind(OWNER).all();
    assert.equal(snapshots.results.length,2);
    for(const row of snapshots.results){
      const entries=JSON.parse(row.state_json);
      assert.ok(Array.isArray(entries)&&entries.length>0);
      assert.ok(entries.every(item=>!('body' in item)&&!('prompt' in item)&&!('arguments' in item)));
    }
    assert.doesNotMatch(JSON.stringify({calls:stored.results,snapshots:snapshots.results}),new RegExp(canary));
  }finally{await fixture.dispose();}
});

test('best-effort observation insert failure never changes a successful canonical read or server error',async()=>{
  const fixture=await privateStorageFixture(failingTraceWorker,{bindings});
  try{
    const client=fixture.client(OWNER);
    await setup(client);
    const valid=await rpc(client,'read_minamo_record',
      {family:'article',id:'TEST-ONLY-m2m-r1-reference'});
    assert.equal(valid.error,false,JSON.stringify(valid));
    const invalid=await rpc(client,'read_minamo_record',
      {family:'note',id:'TEST-ONLY-m2m-r1-no-such-note'});
    assert.equal(invalid.error,true);
    assert.equal(invalid.code,'record_unavailable');
    const calls=await observe(client,{action:'calls'});
    assert.equal(calls.total,0,'failed trace writes are omissions, not fabricated successful captures');
    assert.equal(calls.recordingLimits.bestEffort,true);
    assert.equal((await observe(client,{action:'pause',expectedRevision:0,
      operationId:'test-observer-adversarial-failed-store-pause'})).status,'paused');
  }finally{await fixture.dispose();}
});

test('600-call quota, bounded paging, concurrent control CAS and idempotent retries',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const client=fixture.client(OWNER);
    await setup(client);
    // Seed only the isolated D1 fixture. This is deliberately not a hosted MCP
    // action and allows quota testing without hundreds of network calls.
    await fixture.db.prepare([
      'WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<598)',
      'INSERT INTO v2_test_observed_calls',
      '(owner,scenario,run_id,call_id,session_id,phase,tool_name,outcome,error_code,elapsed_ms,received_at)',
      "SELECT ?,?,?,'quota-seed-'||printf('%04d',n),'S01','F','read_minamo_record','success',NULL,1,",
      "'2026-10-31T01:00:00.000Z' FROM seq"
    ].join(' ')).bind(OWNER,SCENARIO,RUN).run();
    const results=await Promise.all(Array.from({length:6},()=>rpc(client,'read_minamo_record',
      {family:'article',id:'TEST-ONLY-m2m-r1-reference'})));
    assert.ok(results.every(x=>x.error===false));
    const calls=await observe(client,{action:'calls',offset:0,limit:50});
    assert.equal(calls.total,600,'atomic quota guard must never store more than 600 events');
    assert.equal(calls.events.length,50);
    assert.equal(calls.nextOffset,50);
    assert.equal(calls.recordingLimits.quotaReached,true);
    assert.equal((await observe(client,{action:'calls',offset:0,limit:51})).code,
      'invalid_observation_page');

    const [a,b]=await Promise.all([
      observe(client,{action:'pause',expectedRevision:0,operationId:'test-observer-adversarial-pause-a'}),
      observe(client,{action:'pause',expectedRevision:0,operationId:'test-observer-adversarial-pause-b'})
    ]);
    const succeeded=[a,b].filter(x=>x.status==='paused'&&!x.error);
    const rejected=[a,b].filter(x=>x.code==='observation_revision_conflict');
    assert.equal(succeeded.length,1,JSON.stringify([a,b]));
    assert.equal(rejected.length,1,JSON.stringify([a,b]));
    const winner=succeeded[0]===a?'test-observer-adversarial-pause-a':'test-observer-adversarial-pause-b';
    const replay=await observe(client,{action:'pause',expectedRevision:0,operationId:winner});
    assert.equal(replay.replayed,true);
    const mismatch=await observe(client,{action:'arm',expectedRevision:1,sessionId:'S01',
      operationId:winner});
    assert.equal(mismatch.code,'observation_idempotency_mismatch');
    await rpc(client,'read_minamo_record',{family:'article',id:'TEST-ONLY-m2m-r1-reference'});
    assert.equal((await observe(client,{action:'calls'})).total,600,
      'paused observer and maximum-call guard must both prevent further writes');
  }finally{await fixture.dispose();}
});
