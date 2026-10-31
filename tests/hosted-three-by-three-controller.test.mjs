/** V88 local integration gate. A Node harness is NOT a genuine cold-context
 * GPT conversation. Hosted MCP/model acceptance must be recorded separately. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const OWNER='TEST-ONLY-v88-owner',OTHER='TEST-ONLY-v88-other';
const bindings={MINAMO_OWNER_ID:OWNER,MINAMO_SITE_HOSTS:'storage.test',
  MINAMO_SCENARIO_CONTROL_ENABLED:'1',MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER:'1',
  MINAMO_SCENARIO_SOURCE_SHA:'TEST-ONLY-v88-local-source'};
const purpose='TEST ONLY V88 hosted 3x3 controller integration; disposable D1/R2';
const matrix=[
  ['mood-to-music','intermittent-weekend-prototyper','mood-to-music/3'],
  ['mood-to-music','provider-documentation-sceptic','mood-to-music/3'],
  ['mood-to-music','privacy-led-interface-reviser','mood-to-music/3'],
  ['retired-htb-cap','command-log-investigator','retired-htb-cap/1'],
  ['retired-htb-cap','packet-model-explainer','retired-htb-cap/1'],
  ['retired-htb-cap','interrupted-sparse-recorder','retired-htb-cap/1'],
  ['automatic-plant-screamer','breadboard-first-tinkerer','automatic-plant-screamer/1'],
  ['automatic-plant-screamer','careful-calibrator','automatic-plant-screamer/1'],
  ['automatic-plant-screamer','shared-space-pragmatist','automatic-plant-screamer/1']
];
const selection=([scenarioId,personaVariant])=>({scenarioId,
  ...(personaVariant?{personaVariant}:{})});
async function rpc(c,name,args={}){
  const response=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',
    params:{name,arguments:{purpose,...args}}});
  assert.equal(response.status,200,JSON.stringify(response.data));
  return {error:response.data.result.isError===true,...response.data.result.structuredContent};
}
const scenario=(c,p,args)=>rpc(c,'manage_minamo_test_scenario',{...selection(p),...args});
const transcript=(c,p,args)=>rpc(c,'append_minamo_test_transcript',{...selection(p),...args});
const observe=(c,p,args)=>rpc(c,'manage_minamo_test_observation',{...selection(p),...args});

test('representative alternate Project: canonical, transcript and observation layers remain aligned',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  const p=matrix[6],runId='TEST-ONLY-v88-plant-breadboard-run';
  try{
    const c=fixture.client(OWNER),wrong=fixture.client(OTHER);
    const beforeList=await scenario(c,p,{action:'list'});
    assert.equal(beforeList.error,false);
    assert.equal(beforeList.availableVariants.length,10,'nine variants plus preserved legacy');
    for(const source of beforeList.availableVariants.flatMap(v=>v.sourceFiles)){
      const actual=createHash('sha256').update(readFileSync(new URL('../'+source.path,import.meta.url))).digest('hex');
      assert.equal(source.sha256,actual,'Pinned source file drifted: '+source.path);
    }
    assert.equal((await scenario(wrong,p,{action:'list'})).code,'scenario_owner_required');
    const loaded=await scenario(c,p,{action:'load',phase:'F',expectedGeneration:'legacy@0',
      expectedRevision:0,operationId:'TEST-ONLY-v88-plant-load'});
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const runPrefix=loaded.runPrefix;
    assert.equal(loaded.snapshot.project.id,runPrefix+'-project');
    assert.equal(loaded.snapshot.provenance.personaVariant,p[1]);
    const started=await transcript(c,p,{action:'start',runId,epoch:1,expectedGeneration:'legacy@0',
      fixtureVersion:p[2],operationId:'TEST-ONLY-v88-plant-start'});
    assert.equal(started.error,false,JSON.stringify(started));
    const armed=await observe(c,p,{action:'start',runId,sessionId:'S01',
      expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-plant-observer-start'});
    assert.equal(armed.error,false,JSON.stringify(armed));
    const capture=(checkpointId,moment)=>observe(c,p,{action:'capture',runId,checkpointId,moment});
    let sequence=0;
    const append=async(segmentType,step,details)=>{
      sequence++;
      const item=await transcript(c,p,{action:'append',runId,epoch:1,expectedGeneration:'legacy@0',
        operationId:'TEST-ONLY-v88-plant-append-'+sequence,entryId:'TEST-ONLY-v88-plant-e'+sequence,
        expectedRevision:sequence-1,sequence,sessionId:'S01',eventKind:'model.transcript',
        segmentType,markdown:`TEST HARNESS ONLY ${step}: ${details}`});
      assert.equal(item.error,false,JSON.stringify(item));return item;
    };
    await capture('v88-read-only','before');
    await append('tool-attempt','A1','read synthetic Project, no mutation expected');
    const read=await rpc(c,'read_minamo_record',{family:'journey',id:runPrefix+'-project'});
    assert.equal(read.error,false,JSON.stringify(read));
    await append('tool-result','A1','canonical Project rev '+read.record.rev);
    await append('tool-attempt','A2','read exact current-epoch missing synthetic Note');
    const missing=await rpc(c,'read_minamo_record',{family:'note',id:runPrefix+'-note-absent'});
    assert.notEqual(missing.error,false);
    assert.equal(missing.code,'record_unavailable');
    await append('tool-result','A2','server error '+missing.code);
    await capture('v88-read-only','after');
    const noDiff=await observe(c,p,{action:'diff',runId,checkpointId:'v88-read-only'});
    assert.equal(noDiff.error,false);
    assert.deepEqual(noDiff.changes,[]);
    assert.equal(noDiff.observedCallsBetween.count,2);
    const articleId=runPrefix+'-reference';
    await capture('v88-flag-activation','before');
    await append('tool-attempt','B1','activate a synthetic Article record Flag');
    const activated=await rpc(c,'apply_minamo_command',{command:{
      action:'setFlag',target:{kind:'record',family:'article',id:articleId},active:true,
      expectedTargetRev:0,expectedGeneration:'legacy@0',operationId:runPrefix+'-v88-set-flag'}});
    assert.equal(activated.error,false,JSON.stringify(activated));
    await append('tool-result','B1','committed Flag active true');
    await capture('v88-flag-activation','after');
    const flagDiff=await observe(c,p,{action:'diff',runId,checkpointId:'v88-flag-activation'});
    assert.equal(flagDiff.error,false,JSON.stringify(flagDiff));
    assert.equal(flagDiff.changes.filter(ch=>ch.key.startsWith('bookmark:')).length,1);
    await capture('v88-flag-cleanup','before');
    await append('tool-attempt','C1','deactivate same synthetic Flag at exact new revision');
    const deactivated=await rpc(c,'apply_minamo_command',{command:{
      action:'setFlag',target:{kind:'record',family:'article',id:articleId},active:false,
      expectedTargetRev:1,expectedGeneration:'legacy@0',operationId:runPrefix+'-v88-clear-flag'}});
    assert.equal(deactivated.error,false,JSON.stringify(deactivated));
    await append('tool-result','C1','committed Flag inactive');
    await capture('v88-flag-cleanup','after');
    const cleanupDiff=await observe(c,p,{action:'diff',runId,checkpointId:'v88-flag-cleanup'});
    assert.equal(cleanupDiff.changes.filter(ch=>ch.key.startsWith('bookmark:')).length,1);
    const observed=await observe(c,p,{action:'calls',runId});
    assert.equal(observed.total,4,JSON.stringify(observed));
    assert.deepEqual(observed.events.map(e=>e.tool),
      ['read_minamo_record','read_minamo_record','apply_minamo_command','apply_minamo_command']);
    assert.ok(observed.events.every(e=>e.elapsedMs>=0));
    assert.equal(observed.events[1].errorCode,'record_unavailable');
    assert.equal(observed.events[1].outcome,'error');
    assert.equal((await transcript(c,p,{action:'append',runId,epoch:1,expectedGeneration:'legacy@0',
      operationId:'TEST-ONLY-v88-plant-extra',entryId:'TEST-ONLY-v88-plant-extra',
      expectedRevision:0,sequence:9,sessionId:'S01',eventKind:'model.transcript',
      segmentType:'session-note',markdown:'invalid revision'})).code,'test_revision_conflict');
    const paused=await observe(c,p,{action:'pause',runId,expectedRevision:0,
      operationId:'TEST-ONLY-v88-plant-pause'});
    assert.equal(paused.status,'paused');
    const final=await scenario(c,p,{action:'inspect',expectedGeneration:'legacy@0'});
    assert.equal(final.active.phase,'F');
    assert.equal(final.snapshot.project.id,runPrefix+'-project');
    const otherVariant=await scenario(c,matrix[7],{action:'list'});
    assert.equal(otherVariant.active.phase,null,'persona control row is independent');
    const legacy=await scenario(c,['mood-to-music',null],{action:'list'});
    assert.equal(legacy.active.phase,null,'legacy control row is independent');
  }finally{await fixture.dispose();}
});

test('all nine registered hosted variants load and read back F without cross-persona aliases',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER),allPrefixes=new Set();
    for(let i=0;i<matrix.length;i++){
      const p=matrix[i],listed=await scenario(c,p,{action:'list'});
      assert.equal(listed.error,false,JSON.stringify({p,listed}));
      assert.equal(listed.fixtureVersion,p[2]);
      const loaded=await scenario(c,p,{action:'load',phase:'F',expectedGeneration:'legacy@0',
        expectedRevision:0,operationId:'TEST-ONLY-v88-load-'+i});
      assert.equal(loaded.error,false,JSON.stringify({p,loaded}));
      assert.equal(loaded.phase,'F');
      assert.ok(!allPrefixes.has(loaded.runPrefix));
      allPrefixes.add(loaded.runPrefix);
      assert.equal(loaded.snapshot.project.id,loaded.runPrefix+'-project');
      assert.ok(loaded.snapshot.notes.length>0);
      const report=await rpc(c,'read_minamo_test_transcript',{...selection(p),action:'turn',sessionId:'S01'});
      assert.equal(report.error,false,JSON.stringify({p,report}));
      assert.equal(report.personaVariant,p[1]);
      assert.match(report.prompt,/FICTIONAL USER/);
      const runId='TEST-ONLY-v88-matrix-'+i;
      const started=await transcript(c,p,{action:'start',runId,epoch:1,expectedGeneration:'legacy@0',
        fixtureVersion:p[2],operationId:'TEST-ONLY-v88-matrix-start-'+i});
      assert.equal(started.error,false,JSON.stringify({p,started}));
      assert.equal(started.personaVariant,p[1]);
      const prompt=await transcript(c,p,{action:'append',runId,epoch:1,expectedGeneration:'legacy@0',
        expectedRevision:0,sequence:1,entryId:'TEST-ONLY-v88-matrix-entry-'+i,
        operationId:'TEST-ONLY-v88-matrix-append-'+i,sessionId:'S01',
        eventKind:'fixture.user-turn'});
      assert.equal(prompt.error,false,JSON.stringify({p,prompt}));
      assert.equal(prompt.event.markdown,report.prompt);
      const armed=await observe(c,p,{action:'start',runId,sessionId:'S01',
        expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-matrix-observe-'+i});
      assert.equal(armed.error,false,JSON.stringify({p,armed}));
      const checkpointId='TEST-ONLY-v88-matrix-read-'+i;
      await observe(c,p,{action:'capture',runId,checkpointId,moment:'before'});
      const record=await rpc(c,'read_minamo_record',{family:'journey',id:loaded.runPrefix+'-project'});
      assert.equal(record.error,false);
      await observe(c,p,{action:'capture',runId,checkpointId,moment:'after'});
      const diff=await observe(c,p,{action:'diff',runId,checkpointId});
      assert.equal(diff.error,false);assert.deepEqual(diff.changes,[]);
      assert.equal(diff.observedCallsBetween.count,1,JSON.stringify({p,diff}));
      const calls=await observe(c,p,{action:'calls',runId});
      assert.equal(calls.total,1);assert.equal(calls.events[0].phase,'F');
      assert.equal(calls.run.personaVariant,p[1]);
      const paused=await observe(c,p,{action:'pause',runId,expectedRevision:0,
        operationId:'TEST-ONLY-v88-matrix-pause-'+i});
      assert.equal(paused.status,'paused');
      const wrong=await scenario(c,p,{action:'inspect',expectedGeneration:'legacy@0'});
      assert.equal(wrong.snapshot.provenance.runPrefix,loaded.runPrefix);
    }
    assert.equal(allPrefixes.size,9);
    assert.equal((await scenario(c,['mood-to-music',null],{action:'list'})).active.phase,null);
    const other=fixture.client(OTHER);
    assert.equal((await scenario(other,matrix[1],{action:'inspect',expectedGeneration:'legacy@0'})).code,'scenario_owner_required');
  }finally{await fixture.dispose();}
});

test('variant reset retires only known synthetic records and rejects prefix collision',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  const p=matrix[0];
  try{
    const c=fixture.client(OWNER);
    const untouched=await c.command({operationId:'TEST-ONLY-v88-unrelated-create',
      action:'create',family:'article',id:'unrelated-v88-library',
      data:{title:'Unrelated owner Library material',body:'Preserve independently',synthetic:false}});
    assert.equal(untouched.status,200);
    const loaded=await scenario(c,p,{action:'load',phase:'F',expectedRevision:0,
      expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-weekend-load'});
    assert.equal(loaded.error,false,JSON.stringify(loaded));
    const oldPrefix=loaded.runPrefix;
    const flagTarget={kind:'record',family:'article',id:oldPrefix+'-reference'};
    const flag=await c.command({operationId:oldPrefix+'-temp-flag',action:'setFlag',target:flagTarget,
      active:true,expectedTargetRev:0});
    assert.equal(flag.status,200,JSON.stringify(flag));
    assert.equal(flag.data.bookmark.active,true);
    const reset=await scenario(c,p,{action:'reset',expectedRevision:1,
      expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-weekend-reset'});
    assert.equal(reset.error,false,JSON.stringify(reset));
    assert.equal(reset.phase,'A');assert.equal(reset.epoch,2);
    assert.equal((await c.context('journey',oldPrefix+'-project')).status,404);
    assert.equal((await c.context('article','unrelated-v88-library')).status,200);
    assert.equal((await c.context('journey',reset.runPrefix+'-project')).status,200);
    const flagAfter=await c.request('/api/bookmarks',{target:flagTarget});
    assert.equal(flagAfter.status,200);
    assert.equal(flagAfter.data.active,false,'reset must retire the opaque bookmark head as well as Flag record');
    const collisionId='TEST-ONLY-m2m-weekend-v1-r3-unknown-genuine';
    const injected=await c.command({operationId:'TEST-ONLY-v88-genuine-collision',
      action:'create',family:'note',id:collisionId,
      data:{title:'A genuine mistaken identity',body:'Must remain safe',synthetic:false}});
    assert.equal(injected.status,200);
    const blocked=await scenario(c,p,{action:'reset',expectedRevision:2,
      expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-weekend-blocked'});
    assert.equal(blocked.code,'fixture_identity_collision');
    assert.equal((await c.context('note',collisionId)).status,200);
    assert.equal((await c.context('journey',reset.runPrefix+'-project')).status,200);
  }finally{await fixture.dispose();}
});

test('simultaneously armed personas attribute only exact selectors, never ambiguous discovery',async()=>{
  const fixture=await privateStorageFixture(worker,{bindings});
  try{
    const c=fixture.client(OWNER),runs=[];
    for(let i=0;i<2;i++){
      const p=matrix[i],runId='TEST-ONLY-v88-parallel-'+i;
      const loaded=await scenario(c,p,{action:'load',phase:'F',expectedGeneration:'legacy@0',
        expectedRevision:0,operationId:'TEST-ONLY-v88-parallel-load-'+i});
      assert.equal(loaded.error,false,JSON.stringify(loaded));
      const started=await transcript(c,p,{action:'start',runId,epoch:1,expectedGeneration:'legacy@0',
        fixtureVersion:p[2],operationId:'TEST-ONLY-v88-parallel-transcript-'+i});
      assert.equal(started.error,false,JSON.stringify(started));
      const armed=await observe(c,p,{action:'start',runId,sessionId:'S01',
        expectedGeneration:'legacy@0',operationId:'TEST-ONLY-v88-parallel-observe-'+i});
      assert.equal(armed.error,false,JSON.stringify(armed));
      runs.push({p,runId,prefix:loaded.runPrefix});
    }
    const generic=await rpc(c,'query_minamo_records',{family:'journey',includeSynthetic:true,limit:10});
    assert.equal(generic.error,false,JSON.stringify(generic));
    const exact=await rpc(c,'read_minamo_record',{family:'journey',id:runs[0].prefix+'-project'});
    assert.equal(exact.error,false,JSON.stringify(exact));
    assert.equal((await observe(c,runs[0].p,{action:'calls',runId:runs[0].runId})).total,1);
    assert.equal((await observe(c,runs[1].p,{action:'calls',runId:runs[1].runId})).total,0);
  }finally{await fixture.dispose();}
});
