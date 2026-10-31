/** TEST ONLY, opt-in, owner-scoped evidence. These events are received at the
 * Minamo MCP boundary; they are not a ChatGPT/host-complete call transcript.
 * Canonical snapshots contain identities and revisions, never authored text. */
import {DomainError} from './domain-error';
import {generationContext,requireGeneration} from './generations';
import {requireScenarioOwner,scenarioState,visibleScenarioTool} from './scenario-control';
import {manifest} from '../tests/project-scenarios/mood-to-music/seed.mjs';
import sessionCases from '../tests/project-scenarios/mood-to-music/session-cases.json';
import {selectHostedFixture,fixtureForDbKey,sessionsForFixture,hostedSourcePin,type HostedFixture} from './hosted-scenario-registry';

type Env=Cloudflare.Env&{MINAMO_SCENARIO_SOURCE_SHA?:string};
type Input={action:'start'|'arm'|'pause'|'stop'|'capture'|'list'|'calls'|'snapshots'|'diff';purpose:string;
  scenarioId?:string;personaVariant?:string;runId?:string;sessionId?:string;expectedGeneration?:string;expectedRevision?:number;
  operationId?:string;checkpointId?:string;moment?:'before'|'after';offset?:number;limit?:number};
type ObservationRun={owner:string;scenario:string;run_id:string;generation:string;epoch:number;
  source_commit:string|null;status:string;session_id:string|null;revision:number;start_operation:string;
  last_operation:string;last_payload:string;created_at:string;updated_at:string};
type ScenarioRow={epoch:number;phase:string|null;revision:number;pending_json:string|null;generation:string};
type Snapshot={checkpoint_id:string;moment:string;session_id:string;phase:string;
  controller_revision:number;namespace_version:number;state_json:string;observed_at:string};
type StateEntry={key:string;rev?:number;rendition?:string|null;trashed?:boolean;withdrawn?:boolean;
  active?:boolean;status?:number};
const scenarioId=manifest.key,fixtureVersion=`${manifest.key}/${manifest.schemaVersion}`;
const sessions=sessionCases.sessions;
const idPattern=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/;
const MAX_CALLS=600,MAX_SNAPSHOTS=80,MAX_STATE_ROWS=256;
const db=(env:Env)=>{if(!env.DB)throw new DomainError(503,'storage_unavailable','Observation storage unavailable.');return env.DB!};
function fail(code:string,description:string,status=409):never{throw new DomainError(status,code,description)}
const validId=(value:unknown,max=120)=>typeof value==='string'&&value.length<=max&&idPattern.test(value);
const validRevision=(value:unknown)=>Number.isSafeInteger(value)&&Number(value)>=0;
const now=()=>new Date().toISOString();
const prefix=(fixture:HostedFixture,epoch:number)=>fixture.prefix(epoch)+'-';
const view=(run:ObservationRun)=>({schemaVersion:1,contract:'test-observation/1',
  scenarioId:fixtureForDbKey(run.scenario)?.scenarioId??run.scenario,
  personaVariant:fixtureForDbKey(run.scenario)?.personaVariant??null,runId:run.run_id,
  fixtureVersion:fixtureForDbKey(run.scenario)?.fixtureVersion??fixtureVersion,
  generation:run.generation,epoch:run.epoch,
  sourceCommit:fixtureForDbKey(run.scenario)?.legacy?run.source_commit:null,
  sourcePin:run.source_commit,
  sourceFiles:fixtureForDbKey(run.scenario)?.sourceFiles??[],sessionId:run.session_id,
  status:run.status,revision:run.revision,createdAt:run.created_at,updatedAt:run.updated_at,
  provenance:'server-observed only for qualifying, scoped MCP calls; not host-complete',
  retention:'Private D1 rows retain an owner-scoping key; public observation events exclude owner identity, tool inputs/outputs, prompt bodies and ordinary learner content.',
  coverage:{hostComplete:false,bestEffort:true,scope:'Registered current-epoch synthetic selectors and explicit synthetic discovery only.'}});
const snapshotView=(row:Snapshot)=>({checkpointId:row.checkpoint_id,moment:row.moment,
  sessionId:row.session_id,phase:row.phase,controllerRevision:row.controller_revision,
  namespaceVersion:row.namespace_version,observedAt:row.observed_at,
  state:JSON.parse(row.state_json) as StateEntry[],provenance:'canonical D1 metadata snapshot',
  limitation:'Revision changes are observed between two instants; causality and external execution are not attested.'});

export const observationTool={name:'manage_minamo_test_observation',
  description:'Owner-only TEST ONLY synthetic instrumentation, disabled until explicitly started for a registered transcript run. The session ID must match the current settled fixture phase even if an older S01-labelled transcript run spans later sessions. start/arm/pause/stop control bounded server-received MCP call/error/timing metadata; capture saves immutable canonical record/revision metadata before or after a named experiment; diff compares snapshots. No tool inputs/output bodies, ordinary Notes, personal telemetry or complete ChatGPT messages are collected in observation events. Private D1 uses an owner-scoping key for isolation. Only current-epoch synthetic selectors and explicit synthetic discovery qualify; opaque Flag IDs require canonical verification. This is not complete ChatGPT-host tracing and is separate from model-submitted transcripts.',
  inputSchema:{type:'object',properties:{
    purpose:{type:'string',minLength:1,maxLength:500},action:{enum:['start','arm','pause','stop','capture','list','calls','snapshots','diff']},
    scenarioId:{enum:['mood-to-music','retired-htb-cap','automatic-plant-screamer']},
    personaVariant:{type:'string',maxLength:80},
    runId:{type:'string',maxLength:80},sessionId:{enum:sessions.map(s=>s.id)},
    expectedGeneration:{type:'string'},expectedRevision:{type:'integer',minimum:0},
    operationId:{type:'string',maxLength:120},checkpointId:{type:'string',maxLength:120},
    moment:{enum:['before','after']},offset:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:50}
  },required:['purpose','action'],additionalProperties:false}};

async function runFor(env:Env,owner:string,runId:string,fixture:HostedFixture){
  return db(env).prepare('SELECT * FROM v2_test_observation_runs WHERE owner=? AND scenario=? AND run_id=?')
    .bind(owner,fixture.dbKey,runId).first<ObservationRun>();
}
async function fixtureState(env:Env,owner:string,fixture:HostedFixture){
  const row=await scenarioState(env as any,owner,fixture);
  if(row.generation!==generationContext(env)!.generation)fail('test_generation_conflict','Fixture generation changed.');
  return row as ScenarioRow;
}
async function sameRun(env:Env,owner:string,runId:string,fixture:HostedFixture){
  const run=await runFor(env,owner,runId,fixture);
  if(!run)fail('observation_run_unknown','Start an observation for an exact transcript run first.',404);
  if(run.generation!==generationContext(env)!.generation)fail('test_generation_conflict','Observation belongs to another workspace generation.');
  return run;
}
async function namespaceVersion(env:Env,owner:string){
  const row=await db(env).prepare('SELECT version FROM v2_namespace_versions WHERE owner=?')
    .bind(owner).first<{version:number}>();
  return Number(row?.version??0);
}
async function projection(env:Env,owner:string,epoch:number,fixture:HostedFixture):Promise<StateEntry[]>{
  const marker=prefix(fixture,epoch);
  const entries:StateEntry[]=[];
  const records=await db(env).prepare(`SELECT family,id,rev,trashed_at,
      json_extract(data,'$.synthetic') AS synthetic,json_extract(data,'$.rendition') AS rendition
      FROM v2_records WHERE owner=? AND instr(id,?)=1 LIMIT ?`)
    .bind(owner,marker,MAX_STATE_ROWS+1).all<{family:string;id:string;rev:number;trashed_at:string|null;synthetic:number|null;rendition:string|null}>();
  if(records.results.length>MAX_STATE_ROWS)fail('observation_state_limit','Too many synthetic records for a bounded snapshot.');
  for(const record of records.results){
    if(record.synthetic!==1)fail('fixture_identity_collision','Fixture-prefix record is not marked synthetic.');
    entries.push({key:`record:${record.family}:${record.id}`,rev:record.rev,rendition:record.rendition,trashed:record.trashed_at!==null});
  }
  const developments=await db(env).prepare(`SELECT id,revision,withdrawn,target_key FROM v2_learning_developments
    WHERE owner=? AND (instr(id,?)=1 OR id=?) LIMIT ?`)
    .bind(owner,marker,fixture.legacy&&epoch===3?'TEST-ONLY-m2m-save-c01':'',MAX_STATE_ROWS+1)
    .all<{id:string;revision:number;withdrawn:number;target_key:string}>();
  if(developments.results.length>MAX_STATE_ROWS)fail('observation_state_limit','Too many synthetic developments.');
  for(const d of developments.results){
    if(!d.target_key.includes(marker))fail('fixture_identity_collision','A fixture-labelled development targets unscoped learning.');
    entries.push({key:`development:${d.id}`,rev:d.revision,withdrawn:d.withdrawn===1});
  }
  const perspectives=await db(env).prepare(`SELECT target_key,revision FROM v2_learning_perspectives
    WHERE owner=? AND instr(target_key,?)>0 LIMIT ?`)
    .bind(owner,marker,MAX_STATE_ROWS+1).all<{target_key:string;revision:number}>();
  if(perspectives.results.length>MAX_STATE_ROWS)fail('observation_state_limit','Too many synthetic perspectives.');
  for(const p of perspectives.results)entries.push({key:`perspective:${p.target_key}`,rev:p.revision});
  const operations=await db(env).prepare(`SELECT id,status FROM v2_operations WHERE owner=?
    AND (instr(id,?)=1 OR id=?) LIMIT ?`)
    .bind(owner,marker,fixture.legacy&&epoch===3?'TEST-ONLY-m2m-save-c01':'',MAX_STATE_ROWS+1)
    .all<{id:string;status:number}>();
  if(operations.results.length>MAX_STATE_ROWS)fail('observation_state_limit','Too many synthetic receipts.');
  for(const op of operations.results)entries.push({key:`operation:${op.id}`,status:op.status});
  const bookmarks=await db(env).prepare(`SELECT target_key,target_rev,active,target FROM v2_bookmarks
    WHERE owner=? AND instr(target,?)>0 LIMIT ?`)
    .bind(owner,marker,MAX_STATE_ROWS+1)
    .all<{target_key:string;target_rev:number;active:number;target:string}>();
  if(bookmarks.results.length>MAX_STATE_ROWS)fail('observation_state_limit','Too many synthetic bookmark heads.');
  for(const b of bookmarks.results)entries.push({key:`bookmark:${b.target_key}`,rev:b.target_rev,active:b.active===1});
  if(entries.length>MAX_STATE_ROWS)fail('observation_state_limit','Combined synthetic state exceeds the 256-entry snapshot budget.');
  return entries.sort((a,b)=>a.key.localeCompare(b.key));
}

export async function manageObservation(env:Env,owner:string,request:Request,input:Input){
  const ctx=requireScenarioOwner(env as any,request);
  if(!input||typeof input.purpose!=='string'||!input.purpose.trim()||input.purpose.length>500)
    fail('test_scope_required','Provide the explicit owner-authorised synthetic observation purpose.',400);
  let fixture:HostedFixture;
  try{fixture=selectHostedFixture({scenarioId:input.scenarioId??scenarioId,personaVariant:input.personaVariant});}
  catch{fail('unknown_scenario','Unknown registered fixture/persona.',400);}
  const sessions=sessionsForFixture(fixture);
  if(input.expectedGeneration!==undefined)requireGeneration(ctx,input.expectedGeneration);
  if(input.action==='list'){
    const rows=await db(env).prepare('SELECT * FROM v2_test_observation_runs WHERE owner=? AND scenario=? ORDER BY created_at DESC LIMIT 50')
      .bind(owner,fixture.dbKey).all<ObservationRun>();
    return {runs:rows.results.filter(r=>r.generation===ctx.generation).map(view),truncated:rows.results.length===50};
  }
  if(!validId(input.runId,80))fail('invalid_observation_run','Provide the exact registered transcript run ID.',400);
  const runId=input.runId!;
  if(input.action==='start'){
    if(input.scenarioId!==fixture.scenarioId||!validId(input.operationId)||!input.expectedGeneration||
      !sessions.some(s=>s.id===input.sessionId))fail('invalid_observation_start','Start with exact scenario, generation, session and operation ID.',400);
    const state=await fixtureState(env,owner,fixture),session=sessions.find(s=>s.id===input.sessionId)!;
    if(!state.phase||state.pending_json||state.phase!==session.phase)
      fail('observation_phase_conflict','Start at the matching, settled fictional session phase.');
    const transcript=await db(env).prepare(`SELECT generation,epoch,fixture_version,source_commit FROM v2_test_transcript_runs
      WHERE owner=? AND scenario=? AND run_id=?`).bind(owner,fixture.dbKey,runId)
      .first<{generation:string;epoch:number;fixture_version:string;source_commit:string|null}>();
    if(!transcript||transcript.generation!==ctx.generation||transcript.epoch!==state.epoch||
      transcript.fixture_version!==fixture.fixtureVersion||
      transcript.source_commit!==hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA))
      fail('observation_transcript_conflict','Observation must attach to this exact registered synthetic transcript/source/epoch.');
    const at=now(),payload=JSON.stringify({action:'start',sessionId:input.sessionId,epoch:state.epoch});
    await db(env).prepare(`INSERT OR IGNORE INTO v2_test_observation_runs
      (owner,scenario,run_id,generation,epoch,source_commit,status,session_id,revision,start_operation,last_operation,last_payload,created_at,updated_at)
      VALUES(?,?,?,?,?,?,'armed',?,0,?,?,?,?,?)`)
      .bind(owner,fixture.dbKey,runId,ctx.generation,state.epoch,
        hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA),
        input.sessionId,input.operationId,input.operationId,payload,at,at).run();
    const started=(await sameRun(env,owner,runId,fixture));
    if(started.start_operation!==input.operationId||started.epoch!==state.epoch||
      started.session_id!==input.sessionId||started.last_payload!==payload||
      started.source_commit!==hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA))
      fail('observation_run_conflict','Run was started with another identity or source pin.');
    return {...view(started),replayed:started.created_at!==at};
  }
  const run=await sameRun(env,owner,runId,fixture);
  if(input.action==='calls'){
    const offset=input.offset??0,limit=input.limit??40;
    if(!validRevision(offset)||!Number.isSafeInteger(limit)||limit<1||limit>50||offset>MAX_CALLS)
      fail('invalid_observation_page','Use a bounded call offset and page size.',400);
    const [count,rows]=await Promise.all([
      db(env).prepare('SELECT COUNT(*) AS n FROM v2_test_observed_calls WHERE owner=? AND scenario=? AND run_id=?')
        .bind(owner,fixture.dbKey,runId).first<{n:number}>(),
      db(env).prepare(`SELECT call_id,session_id,phase,tool_name,outcome,error_code,elapsed_ms,received_at
        FROM v2_test_observed_calls WHERE owner=? AND scenario=? AND run_id=? ORDER BY received_at,call_id LIMIT ? OFFSET ?`)
        .bind(owner,fixture.dbKey,runId,limit,offset).all()
    ]);
    return {run:view(run),events:rows.results.map((r:any)=>({eventKind:r.outcome==='error'?'mcp.observed-error':'mcp.observed-call',
      provenance:'server-observed',callId:r.call_id,sessionId:r.session_id,phase:r.phase,tool:r.tool_name,
      outcome:r.outcome,errorCode:r.error_code,elapsedMs:r.elapsed_ms,receivedAt:r.received_at})),
      total:Number(count?.n??0),nextOffset:offset+rows.results.length<Number(count?.n??0)?offset+rows.results.length:null,
      recordingLimits:{maximumCalls:MAX_CALLS,quotaReached:Number(count?.n??0)>=MAX_CALLS,bestEffort:true,
        notice:'Only qualifying synthetic-scoped requests received by Minamo while armed are eligible. Storage failures, unscoped calls and host-side failures can leave gaps.'}};
  }
  if(input.action==='snapshots'){
    const rows=await db(env).prepare(`SELECT * FROM v2_test_state_snapshots WHERE owner=? AND scenario=? AND run_id=?
      ORDER BY observed_at,checkpoint_id,moment LIMIT ?`)
      .bind(owner,fixture.dbKey,runId,MAX_SNAPSHOTS+1).all<Snapshot>();
    return {run:view(run),snapshots:rows.results.map(snapshotView),truncated:rows.results.length>MAX_SNAPSHOTS};
  }
  if(input.action==='diff'){
    if(!validId(input.checkpointId))fail('observation_checkpoint_required','Select a named observation checkpoint.',400);
    const rows=await db(env).prepare(`SELECT * FROM v2_test_state_snapshots WHERE owner=? AND scenario=? AND run_id=?
      AND checkpoint_id=? ORDER BY moment`).bind(owner,fixture.dbKey,runId,input.checkpointId).all<Snapshot>();
    const before=rows.results.find(s=>s.moment==='before'),after=rows.results.find(s=>s.moment==='after');
    if(!before||!after)fail('observation_pair_incomplete','Both canonical before and after captures are required.');
    if(after.observed_at<before.observed_at)fail('observation_time_conflict','The after snapshot predates the before snapshot.');
    const b=new Map((JSON.parse(before.state_json) as StateEntry[]).map(s=>[s.key,s]));
    const a=new Map((JSON.parse(after.state_json) as StateEntry[]).map(s=>[s.key,s]));
    const changes=[...new Set([...b.keys(),...a.keys()])].sort().flatMap(key=>{
      const from=b.get(key),to=a.get(key);
      return JSON.stringify(from)===JSON.stringify(to)?[]:[{key,kind:!from?'added':!to?'removed':'changed',before:from??null,after:to??null}];
    });
    const callRows=await db(env).prepare(`SELECT tool_name,outcome,elapsed_ms FROM v2_test_observed_calls
      WHERE owner=? AND scenario=? AND run_id=? AND received_at>=? AND received_at<=?`)
      .bind(owner,fixture.dbKey,runId,before.observed_at,after.observed_at).all<{tool_name:string;outcome:string;elapsed_ms:number}>();
    const tools:Record<string,{calls:number;errors:number;totalMs:number}>={};
    for(const call of callRows.results){const tally=tools[call.tool_name]??={calls:0,errors:0,totalMs:0};
      tally.calls++;tally.errors+=Number(call.outcome==='error');tally.totalMs+=call.elapsed_ms;}
    return {eventKind:'state.verified-diff',provenance:'canonical D1 metadata at two verified instants',
      run:view(run),checkpointId:input.checkpointId,
      before:{observedAt:before.observed_at,sessionId:before.session_id,phase:before.phase,
        controllerRevision:before.controller_revision,namespaceVersion:before.namespace_version},
      after:{observedAt:after.observed_at,sessionId:after.session_id,phase:after.phase,
        controllerRevision:after.controller_revision,namespaceVersion:after.namespace_version},
      changes,unchanged:new Set([...b.keys(),...a.keys()]).size-changes.length,
      observedCallsBetween:{count:callRows.results.length,byTool:tools},
      notice:'Identity/revision changes are canonical, but this interval does not prove which tool caused them or that an external program ran.'};
  }
  if(!['arm','pause','stop','capture'].includes(input.action))fail('invalid_observation_action','Unknown observation action.',400);
  if(run.epoch!==(await fixtureState(env,owner,fixture)).epoch||
    run.source_commit!==hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA))
    fail('observation_retired','An observation cannot mutate after its epoch or source changes.');
  if(input.action==='capture'){
    if(run.status!=='armed'||!validId(input.checkpointId)||!['before','after'].includes(input.moment??''))
      fail('invalid_observation_capture','Arm the observation and provide a stable checkpoint ID and moment.',400);
    const state=await fixtureState(env,owner,fixture);
    if(state.pending_json||!state.phase||sessions.find(s=>s.id===run.session_id)?.phase!==state.phase)
      fail('observation_phase_conflict','Capture only in a settled, armed matching session.');
    const old=await db(env).prepare(`SELECT * FROM v2_test_state_snapshots WHERE owner=? AND scenario=? AND run_id=?
      AND checkpoint_id=? AND moment=?`).bind(owner,fixture.dbKey,runId,input.checkpointId,input.moment).first<Snapshot>();
    if(old)return {snapshot:snapshotView(old),replayed:true};
    const count=await db(env).prepare('SELECT COUNT(*) AS n FROM v2_test_state_snapshots WHERE owner=? AND scenario=? AND run_id=?')
      .bind(owner,fixture.dbKey,runId).first<{n:number}>();
    if(Number(count?.n??0)>=MAX_SNAPSHOTS)fail('observation_snapshot_limit','Snapshot quota reached.');
    const version=await namespaceVersion(env,owner),entries=await projection(env,owner,state.epoch,fixture);
    const [newVersion,newState]=await Promise.all([namespaceVersion(env,owner),fixtureState(env,owner,fixture)]);
    if(version!==newVersion||state.epoch!==newState.epoch||state.phase!==newState.phase||
      state.revision!==newState.revision||newState.pending_json)
      fail('observation_snapshot_changed','Canonical state moved during capture; retry with a fresh checkpoint ID.');
    const at=now();
    await db(env).prepare(`INSERT OR IGNORE INTO v2_test_state_snapshots
      (owner,scenario,run_id,checkpoint_id,moment,session_id,phase,controller_revision,namespace_version,state_json,observed_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM v2_test_state_snapshots
        WHERE owner=? AND scenario=? AND run_id=?)<?
      AND EXISTS(SELECT 1 FROM v2_test_observation_runs WHERE owner=? AND scenario=? AND run_id=?
        AND status='armed' AND session_id=? AND generation=? AND epoch=?)
      AND EXISTS(SELECT 1 FROM v2_scenario_control WHERE owner=? AND scenario=?
        AND epoch=? AND phase=? AND revision=? AND pending_json IS NULL)
      AND COALESCE((SELECT version FROM v2_namespace_versions WHERE owner=?),0)=?`)
      .bind(owner,fixture.dbKey,runId,input.checkpointId,input.moment,run.session_id,state.phase,state.revision,
        version,JSON.stringify(entries),at,owner,fixture.dbKey,runId,MAX_SNAPSHOTS,
        owner,fixture.dbKey,runId,run.session_id,ctx.generation,state.epoch,
        owner,fixture.dbKey,state.epoch,state.phase,state.revision,owner,version).run();
    const captured=await db(env).prepare(`SELECT * FROM v2_test_state_snapshots WHERE owner=? AND scenario=? AND run_id=?
      AND checkpoint_id=? AND moment=?`).bind(owner,fixture.dbKey,runId,input.checkpointId,input.moment).first<Snapshot>();
    if(!captured)fail('observation_snapshot_conflict','Canonical state, run control or snapshot quota changed during capture.');
    return {snapshot:snapshotView(captured),replayed:captured.observed_at!==at};
  }
  if(!validRevision(input.expectedRevision)||!validId(input.operationId))
    fail('invalid_observation_control','Control requires an exact revision and stable operation ID.',400);
  if(input.action==='arm'&&!sessions.some(s=>s.id===input.sessionId))
    fail('invalid_observation_session','Select a registered fictional session.',400);
  const payload=JSON.stringify({action:input.action,sessionId:input.action==='arm'?input.sessionId:null});
  if(run.last_operation===input.operationId){
    if(run.last_payload!==payload)fail('observation_idempotency_mismatch','Operation ID reused with different control input.');
    return {...view(run),replayed:true};
  }
  if(run.status==='sealed')fail('observation_sealed','Stopped observations cannot be rearmed.');
  if(run.revision!==input.expectedRevision)fail('observation_revision_conflict','Refresh the observation revision before control.');
  const state=await fixtureState(env,owner,fixture);
  if(input.action==='arm'&&(state.pending_json||sessions.find(s=>s.id===input.sessionId)?.phase!==state.phase))
    fail('observation_phase_conflict','Arm only for the matching settled scenario phase.');
  const status=input.action==='stop'?'sealed':input.action==='pause'?'paused':'armed';
  const sessionId=input.action==='arm'?input.sessionId!:run.session_id;
  const changed=await db(env).prepare(`UPDATE v2_test_observation_runs
    SET status=?,session_id=?,revision=revision+1,last_operation=?,last_payload=?,updated_at=?
    WHERE owner=? AND scenario=? AND run_id=? AND revision=? AND status!='sealed'`)
    .bind(status,sessionId,input.operationId,payload,now(),owner,fixture.dbKey,runId,run.revision).run();
  if(changed.meta.changes!==1)fail('observation_revision_conflict','Concurrent observer control; inspect before retry.');
  return {...view((await sameRun(env,owner,runId,fixture))),replayed:false};
}

/** Never records payloads. A qualifying selector must explicitly identify the
 * current synthetic epoch, not merely mention a test string in authored text. */
const discoveryTools=new Set([
  'get_minamo_learning_context','get_minamo_workspace','query_minamo_records',
  'query_minamo_library','get_minamo_relationship_candidates','get_minamo_learning_graph'
]);
// Operation IDs alone cannot establish that a write targets the fictional
// fixture. An ordinary record mutation may use a TEST-ONLY-looking idempotency
// key; observing it would silently expand the privacy boundary.
const selectorKeys=['id','journeyId','investigationId','articleId','projectId','developmentId'];
function selectedObjects(args:any){return [args,args?.target,args?.command,args?.command?.target,
  args?.target?.anchor,args?.command?.target?.anchor,args?.learningTarget,args?.command?.data?.flagTarget]}
function selectedByPrefix(args:any,marker:string){
  return selectedObjects(args).some(object=>object&&typeof object==='object'&&
    selectorKeys.some(key=>typeof object[key]==='string'&&object[key].startsWith(marker)));
}
function syntheticOperationRead(name:unknown,args:any,marker:string){
  return name==='read_minamo_operation'&&typeof args?.operationId==='string'&&
    args.operationId.startsWith(marker);
}
function qualifies(name:unknown,args:any,marker:string){
  if(typeof name!=='string'||!args||typeof args!=='object'||
    ['manage_minamo_test_observation','append_minamo_test_transcript','read_minamo_test_transcript',
      'manage_minamo_test_scenario'].includes(name))return false;
  return (args.includeSynthetic===true&&discoveryTools.has(name))||
    selectedByPrefix(args,marker)||syntheticOperationRead(name,args,marker);
}
async function eligibleSyntheticFlagRead(env:Env,owner:string,name:unknown,args:any,marker:string){
  // Flag IDs are opaque hashes, so the prefix alone cannot identify their
  // synthetic target. Resolve an exact canonical Flag record privately.
  if(name!=='read_minamo_record'||args?.family!=='flag'||
    typeof args.id!=='string'||!/^flag-[a-f0-9]{64}$/.test(args.id))return false;
  const row=await db(env).prepare(`SELECT json_extract(data,'$.synthetic') AS synthetic,
    json_extract(data,'$.flagTarget') AS target
    FROM v2_records WHERE owner=? AND family='flag' AND id=?`)
    .bind(owner,args.id).first<{synthetic:number|null;target:string|null}>();
  if(row?.synthetic!==1||typeof row.target!=='string')return false;
  try{return selectedByPrefix({target:JSON.parse(row.target)},marker);}
  catch{return false;}
}
export async function beginObservedCall(env:Env,owner:string,request:Request,name:unknown,args:unknown){
  if(!visibleScenarioTool(env as any,request)||!env.DB)return null;
  // Ordinary owner MCP reads incur no observer D1 round-trip without a
  // synthetic selector, except opaque Flag IDs which need a private
  // eligibility check only after finding a matching armed observer.
  const requestArgs=args as any,anyEpochMarker='TEST-ONLY-';
  const candidateFlag=name==='read_minamo_record'&&requestArgs?.family==='flag'&&
    typeof requestArgs?.id==='string'&&/^flag-[a-f0-9]{64}$/.test(requestArgs.id);
  if(typeof name!=='string'||!args||typeof args!=='object'||
    !requestArgs.includeSynthetic&&!selectedByPrefix(args,anyEpochMarker)&&
    !syntheticOperationRead(name,args,anyEpochMarker)&&!candidateFlag)return null;
  try{
  const rows=await db(env).prepare(`SELECT r.scenario,r.run_id,r.session_id,r.source_commit,s.epoch,s.phase
    FROM v2_test_observation_runs r JOIN v2_scenario_control s
      ON s.owner=r.owner AND s.scenario=r.scenario AND s.generation=r.generation AND s.epoch=r.epoch
    WHERE r.owner=? AND r.generation=? AND r.status='armed'
      AND s.phase IS NOT NULL AND s.pending_json IS NULL LIMIT 12`)
    .bind(owner,generationContext(env)!.generation)
    .all<{scenario:string;run_id:string;session_id:string;source_commit:string|null;epoch:number;phase:string}>();
  if(rows.results.length>10)return null;
  const candidates=rows.results.filter(r=>{
    const fixture=fixtureForDbKey(r.scenario);
    return !!fixture&&r.source_commit===hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA)&&
      sessionsForFixture(fixture).some(s=>s.id===r.session_id&&s.phase===r.phase);
  });
  const targeted=[] as typeof candidates;
  for(const row of candidates){
    const fixture=fixtureForDbKey(row.scenario)!;
    const marker=prefix(fixture,row.epoch);
    if(selectedByPrefix(args,marker)||syntheticOperationRead(name,args,marker)||
      await eligibleSyntheticFlagRead(env,owner,name,args,marker))
      targeted.push(row);
  }
  // A generic includeSynthetic discovery has no persona selector. It can be
  // attributed only when precisely one observer is armed; never guess across
  // concurrently armed fictional runs.
  const chosen=targeted.length===1?targeted[0]:
    targeted.length===0&&candidates.length===1&&qualifies(name,args,prefix(fixtureForDbKey(candidates[0].scenario)!,candidates[0].epoch))
      ?candidates[0]:null;
  if(!chosen)return null;
  return {dbKey:chosen.scenario,runId:chosen.run_id,sessionId:chosen.session_id,phase:chosen.phase,epoch:chosen.epoch,
    name:name as string,receivedAt:now(),started:performance.now()};
  }catch{return null;}
}
export async function finishObservedCall(env:Env,owner:string,call:Awaited<ReturnType<typeof beginObservedCall>>,
  result?:any,error?:unknown){
  if(!call||!env.DB)return;
  const outcome=error||['conflict','error','rejected','failed'].includes(result?.receipt?.status??result?.status)?'error':'success';
  const code=error instanceof DomainError?error.code:
    outcome==='error'?typeof (result?.receipt?.code??result?.code)==='string'?(result?.receipt?.code??result?.code):'operation_rejected':null;
  const duration=Math.min(600000,Math.max(0,Math.round(performance.now()-call.started)));
  try{
    await db(env).prepare(`INSERT INTO v2_test_observed_calls
      (owner,scenario,run_id,call_id,session_id,phase,tool_name,outcome,error_code,elapsed_ms,received_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS
        (SELECT 1 FROM v2_test_observation_runs r JOIN v2_scenario_control s
         ON s.owner=r.owner AND s.scenario=r.scenario WHERE r.owner=? AND r.scenario=? AND r.run_id=?
         AND r.generation=? AND r.epoch=? AND r.status='armed' AND r.session_id=?
         AND s.epoch=? AND s.phase=? AND s.pending_json IS NULL)
      AND (SELECT COUNT(*) FROM v2_test_observed_calls WHERE owner=? AND scenario=? AND run_id=?)<?`)
      .bind(owner,call.dbKey,call.runId,crypto.randomUUID(),call.sessionId,call.phase,call.name,
        outcome,code,duration,call.receivedAt,owner,call.dbKey,call.runId,
        generationContext(env)!.generation,call.epoch,call.sessionId,call.epoch,call.phase,
        owner,call.dbKey,call.runId,MAX_CALLS).run();
  }catch{
    // Trace storage must never turn a successful learner operation into a failed
    // one. Readback explicitly documents best-effort coverage and bounded loss.
  }
}
