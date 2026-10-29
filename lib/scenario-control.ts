/** Owner-only, opt-in orchestration of the versioned TEST ONLY corpus.
 * This never runs against ordinary invited learners, and cannot touch
 * arbitrary records or import remote instructions. It deliberately uses
 * canonical domain HTTP commands, with their revision/idempotency receipts.
 */
import {DomainError} from './domain-error';
import {generationContext,requireGeneration} from './generations';
import {domainHandler} from './domain-handler';
import {scenarioForPrefix,manifest} from '../tests/project-scenarios/mood-to-music/seed.mjs';

type ScenarioEnv=Cloudflare.Env&{
  MINAMO_OWNER_ID?:string;
  MINAMO_SITE_HOSTS?:string;
  MINAMO_SCENARIO_CONTROL_ENABLED?:string;
  MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED?:string;
  MINAMO_SCENARIO_SOURCE_SHA?:string;
};
type Action='list'|'inspect'|'load'|'advance'|'reset';
type ScenarioInput={action:Action;purpose:string;scenarioId?:string;phase?:string;operationId?:string;expectedGeneration?:string;expectedRevision?:number};
type Pending={action:'load'|'advance'|'reset';operationId:string;payload:string;epoch:number;phase:string;previousEpoch:number;previousPhase:string|null};
type Row={owner:string;scenario:string;epoch:number;phase:string|null;revision:number;generation:string;pending_json:string|null;receipt_json:string|null};
const scenarioId=manifest.key;
const states=manifest.states.map(s=>s.id);
const fixtureVersion=`${manifest.key}/${manifest.schemaVersion}`;
const prefix=(epoch:number)=>`TEST-ONLY-m2m-r${epoch}`;
const error=(status:number,code:string,message:string):never=>{throw new DomainError(status,code,message)};
const db=(env:ScenarioEnv)=>{if(!env.DB)error(503,'storage_unavailable','Scenario storage is unavailable.');return env.DB!};
const validOperation=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/.test(value);
const parsePending=(row:Row):Pending|null=>row.pending_json?JSON.parse(row.pending_json) as Pending:null;
function ownerGate(env:ScenarioEnv,request:Request){
  if(env.MINAMO_SCENARIO_CONTROL_ENABLED!=='1')error(404,'scenario_control_disabled','Scenario control is not enabled.');
  const identity=request.headers.get('oai-authenticated-user-id');
  if(!env.MINAMO_OWNER_ID||!identity||identity!==env.MINAMO_OWNER_ID||!request.headers.get('oai-authenticated-user-email'))
    error(403,'scenario_owner_required','Only the configured Site owner can operate scenarios.');
  if(!env.MINAMO_SITE_HOSTS?.split(',').includes(new URL(request.url).hostname))
    error(403,'scenario_host_required','Scenario control requires the configured private Sites host.');
  const ctx=generationContext(env);
  if(!ctx||ctx.rootOwner!==identity)error(403,'scenario_identity_mismatch','Owner and workspace identity do not match.');
  return ctx!;
}
function validate(input:ScenarioInput){
  if(!input||typeof input!=='object'||!['list','inspect','load','advance','reset'].includes(input.action))
    error(400,'invalid_scenario_action','Choose list, inspect, load, advance or reset.');
  if(typeof input.purpose!=='string'||!input.purpose.trim()||input.purpose.length>500)error(400,'request_scope_required','Provide a short test purpose.');
  if(input.scenarioId!==undefined&&input.scenarioId!==scenarioId)error(400,'unknown_scenario','Choose a versioned scenario from list.');
  if(input.phase!==undefined&&!states.includes(input.phase))error(400,'unknown_scenario_phase','Choose a published phase from list.');
  if(['load','advance','reset'].includes(input.action)){
    if(input.scenarioId!==scenarioId||!validOperation(input.operationId))error(400,'invalid_scenario_operation','Provide the listed scenarioId and a stable operationId.');
    if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision!<0)error(400,'invalid_scenario_revision','Provide the exact nonnegative controller revision from inspect.');
    if(input.action==='load'&&!input.phase)error(400,'scenario_phase_required','Load requires an exact published phase.');
    if(input.action==='advance'&&input.phase!==undefined)error(400,'invalid_scenario_phase','Advance uses the next published phase; omit phase.');
    if(input.action==='reset'&&input.phase!==undefined)error(400,'invalid_scenario_phase','Reset returns to the first phase; omit phase.');
  }else if(input.phase!==undefined||input.operationId!==undefined||input.expectedRevision!==undefined)
    error(400,'invalid_scenario_read','Read operations do not accept mutation fields.');
}
async function rowFor(env:ScenarioEnv,owner:string):Promise<Row>{
  const now=new Date().toISOString();
  await db(env).prepare('INSERT OR IGNORE INTO v2_scenario_control(owner,scenario,epoch,phase,revision,generation,updated_at) VALUES(?,?,0,NULL,0,?,?)')
    .bind(owner,scenarioId,generationContext(env)!.generation,now).run();
  const row=await db(env).prepare('SELECT * FROM v2_scenario_control WHERE owner=? AND scenario=?').bind(owner,scenarioId).first<Row>();
  if(!row)error(503,'scenario_store_unavailable','Scenario row could not be read.');
  return row!;
}
/** A small canonical HTTP adapter, no worker-side Miniflare or direct learner-table writes. */
function client(env:ScenarioEnv,request:Request,owner:string,epoch:number){
  const context=generationContext(env)!;
  const headers=new Headers({'oai-authenticated-user-id':context.rootOwner,
    'oai-authenticated-user-email':request.headers.get('oai-authenticated-user-email')!,
    'x-minamo-generation':context.generation});
  const call=async(path:string,data?:unknown)=>{
    const url=new URL(path,request.url);
    const outgoing=new Headers(headers);
    if(data!==undefined)outgoing.set('Content-Type','application/json');
    const response=await domainHandler(new Request(url,{method:data===undefined?'GET':'POST',headers:outgoing,
      body:data===undefined?undefined:JSON.stringify(data)}),env);
    const parsed=await response.json() as any;
    return {status:response.status,data:parsed};
  };
  return {
    owner, generation:context.generation,scenarioPhase:'',
    request:call,
    command:(value:any)=>call('/api/commands',{expectedGeneration:context.generation,...value}),
    context:(family:string,id:string)=>call('/api/context?'+new URLSearchParams({family,id})),
    operation:async(operationId:string)=>{
      const r=await call('/api/operations?'+new URLSearchParams({operationId}));
      if(r.status===404)return false;
      if(r.status!==200||r.data.status!=='committed')error(409,'scenario_partial_operation','A fixture operation has no committed receipt; inspect before retrying.');
      return true;
    },
    epoch
  };
}
const recordLeaves:[string,string][]=[
  ...manifest.stableIds.annotations.map(id=>['annotation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.unrelatedQuestions.map(id=>['investigation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.notes.map(id=>['note',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.questions.map(id=>['investigation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ['article','reference'],['journey','project']
];
async function cleanup(c:ReturnType<typeof client>,env:ScenarioEnv,owner:string,epoch:number){
  if(epoch===0)return;
  const old=prefix(epoch);
  const permitted=new Set(recordLeaves.map(([family,leaf])=>family+':'+old+'-'+leaf));
  const active=async()=>db(env).prepare('SELECT family,id FROM v2_records WHERE owner=? AND id LIKE ? AND trashed_at IS NULL LIMIT 101')
    .bind(owner,old+'-%').all<{family:string;id:string}>();
  const before=await active();
  if(before.results.length>100||before.results.some(record=>!permitted.has(record.family+':'+record.id)))
    error(409,'fixture_cleanup_boundary','Unknown records exist under the old fixture prefix; cleanup requires review.');
  // The flag is a separate canonical record; unflag it before retiring its
  // exact synthetic Article. No other bookmark target is ever selected.
  const reference=await c.context('article',old+'-reference');
  if(reference.status===200){
    if(reference.data.record.synthetic!==true)error(409,'fixture_identity_collision','Fixture Article has non-synthetic content. Stop.');
    const {articleLeaf,...anchorShape}=manifest.cleanup.passageFlag;
    const target={kind:'passage',anchor:{...anchorShape,
      articleId:old+'-'+articleLeaf,recordFamily:'article',
      rendition:reference.data.record.rendition}};
    const bookmark=await c.request('/api/bookmarks',{target});
    if(bookmark.status!==200)error(409,'fixture_cleanup_blocked','Cannot inspect synthetic bookmark.');
    if(bookmark.data.active&&bookmark.data.flagRef){
      const flag=await c.context('flag',bookmark.data.flagRef.id);
      if(flag.status!==200||flag.data.record.anchor?.articleId!==old+'-reference')
        error(409,'fixture_flag_mismatch','Bookmark no longer refers to the synthetic Article.');
      const receipt=await c.command({operationId:old+'-cleanup-flag',action:'trash',family:'flag',
        id:bookmark.data.flagRef.id,expectedRev:flag.data.record.rev});
      if(receipt.status!==200)error(409,'fixture_cleanup_blocked','Synthetic Flag cleanup failed.');
    }
  }else if(reference.status!==404)error(409,'fixture_cleanup_blocked','Cannot inspect old synthetic reference.');
  for(const [family,leaf] of recordLeaves){
    const id=old+'-'+leaf,found=await c.context(family,id);
    if(found.status===404)continue;
    if(found.status!==200||found.data.record.synthetic!==true)error(409,'fixture_identity_collision','Cleanup stopped at a non-synthetic or unavailable record.');
    const result=await c.command({operationId:old+'-cleanup-'+leaf,action:'trash',family,id,expectedRev:found.data.record.rev});
    if(result.status!==200||result.data.status!=='committed')error(409,'fixture_cleanup_blocked','Synthetic cleanup stopped; retry the same scenario operation.');
  }
  if((await active()).results.length)error(409,'fixture_cleanup_incomplete','Some fixture records remain active; inspect before retrying.');
  // Learning-development receipts and retained revisions remain recoverable.
  // Their old Project is now trashed, so they are not the active fixture.
}
async function snapshot(c:ReturnType<typeof client>,epoch:number,phase:string){
  const id=scenarioForPrefix(prefix(epoch)).id;
  const project=await c.context('journey',id('project'));
  if(project.status!==200)error(409,'scenario_readback_failed','Active Project is not readable.');
  const outline=await c.request('/api/project-context?'+new URLSearchParams({projectId:id('project'),mode:'outline',learningSpace:'computing'}));
  if(outline.status!==200||outline.data.project?.id!==id('project'))error(409,'scenario_readback_failed','Project outline disagrees with the pinned identity.');
  const reference=await c.context('article',id('reference'));
  if(reference.status!==200)error(409,'scenario_readback_failed','Synthetic Library reference is unavailable.');
  const questions=[];
  for(const key of manifest.stableIds.questions){
    const found=await c.context('investigation',id(key.replace('TEST-ONLY-m2m-','')));
    if(found.status!==200)error(409,'scenario_readback_failed','A published Question is unavailable.');
    questions.push({id:found.data.record.id,rev:found.data.record.rev});
  }
  const notes=[] as {id:string;rev:number}[];
  for(const key of manifest.stableIds.notes){
    const record=await c.context('note',id(key.replace('TEST-ONLY-m2m-','')));
    if(record.status===200)notes.push({id:record.data.record.id,rev:record.data.record.rev});
    else if(record.status!==404)error(409,'scenario_readback_failed','Note readback failed.');
  }
  const checkpointIds=[] as string[];
  for(const stage of outline.data.steps.map((s:any)=>s.stageId)){
    const response=await c.request('/api/learning-context',{scope:'target',target:{kind:'journey-stage',journeyId:id('project'),stageId:stage},profile:'tutor',limit:10});
    if(response.status!==200)error(409,'scenario_readback_failed','Checkpoint context readback failed.');
    if(response.data.resume)checkpointIds.push(response.data.resume.source.id);
    for(const item of response.data.priorCheckpoints??[])checkpointIds.push(item.id);
  }
  const questionIds=[...new Set([...outline.data.projectQuestions,...outline.data.steps.flatMap((s:any)=>s.questions)].map((q:any)=>q.id))].sort();
  const annotation=await c.context('annotation',id('annotation-order'));
  if(annotation.status!==200&&annotation.status!==404)error(409,'scenario_readback_failed','Annotation readback failed.');
  const {articleLeaf,...anchorShape}=manifest.cleanup.passageFlag;
  const bookmark=await c.request('/api/bookmarks',{target:{kind:'passage',anchor:{...anchorShape,
    articleId:id(articleLeaf),recordFamily:'article',rendition:reference.data.record.rendition}}});
  if(bookmark.status!==200)error(409,'scenario_readback_failed','Flag readback failed.');
  const operationReceipts=[];
  for(const selected of states.slice(0,states.indexOf(phase)+1)){
    for(const key of (manifest.operationsByPhase as Record<string,string[]>)[selected]??[]){
      const operationId=id(key),found=await c.request('/api/operations?'+new URLSearchParams({operationId}));
      if(found.status!==200||found.data.status!=='committed')
        error(409,'scenario_receipt_missing','Canonical fixture operation receipt is missing.');
      operationReceipts.push({operationId,status:found.data.status,
        ...(found.data.recordRef?{recordRef:found.data.recordRef}:{}),
        ...(found.data.developmentRef?{developmentRef:found.data.developmentRef}:{}),
        ...(found.data.bookmark?{bookmark:found.data.bookmark}:{})});
    }
  }
  return {phase,authoredScenarioDate:manifest.states.find(s=>s.id===phase)?.date,project:{id:project.data.record.id,rev:project.data.record.rev},
    questionIds,questions,reference:{id:reference.data.record.id,rev:reference.data.record.rev,
      rendition:reference.data.record.rendition},
    annotation:annotation.status===200?{id:annotation.data.record.id,rev:annotation.data.record.rev}:null,
    bookmark:bookmark.data,operationReceipts,
    steps:outline.data.steps.map((s:any)=>s.stageId),notes,checkpointIds:[...new Set(checkpointIds)].sort()};
}
export function visibleScenarioTool(env:ScenarioEnv,request:Request){
  return env.MINAMO_SCENARIO_CONTROL_ENABLED==='1'&&!!env.MINAMO_OWNER_ID&&
    !!env.MINAMO_SITE_HOSTS?.split(',').includes(new URL(request.url).hostname)&&
    request.headers.get('oai-authenticated-user-id')===env.MINAMO_OWNER_ID&&
    !!request.headers.get('oai-authenticated-user-email');
}
export const scenarioTool={
  name:'manage_minamo_test_scenario',
  description:'Owner-only TEST ONLY scenario control for repeatable private Sites acceptance. Select published fixture states, inspect exact receipts and Project evidence; no arbitrary data reset. Mutations require explicit test intent, current generation/revision and verified Library recovery configuration. Do not use during ordinary learning.',
  inputSchema:{type:'object',properties:{
    purpose:{type:'string',minLength:1,maxLength:500},
    action:{enum:['list','load','advance','inspect','reset']},
    scenarioId:{enum:[scenarioId]},phase:{type:'string',description:'Exact phase identifier returned by list (load only).'},
    operationId:{type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$'},
    expectedGeneration:{type:'string',maxLength:160},expectedRevision:{type:'integer',minimum:0}
  },required:['purpose','action'],additionalProperties:false}
};
export async function manageScenario(env:ScenarioEnv,owner:string,request:Request,input:ScenarioInput){
  const ctx=ownerGate(env,request);
  validate(input);
  if(input.action!=='list')requireGeneration(ctx,input.expectedGeneration);
  const row=await rowFor(env,owner);
  if(row.generation!==ctx.generation)error(409,'scenario_generation_conflict','Scenario control belongs to a different workspace generation; review recovery before proceeding.');
  const base={scenarioId,fixtureVersion,generation:ctx.generation,sourceCommit:env.MINAMO_SCENARIO_SOURCE_SHA??null,
    libraryRecoveryVerified:env.MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED==='1'};
  if(input.action==='list')return {...base,states:manifest.states,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},pending:!!row.pending_json};
  if(input.action==='inspect'){
    if(parsePending(row))return {...base,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},pending:JSON.parse(row.pending_json!),retryRequired:true};
    return {...base,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},
      receipt:row.receipt_json?JSON.parse(row.receipt_json):null,
      snapshot:row.phase?await snapshot(client(env,request,owner,row.epoch),row.epoch,row.phase):null};
  }
  if(env.MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED!=='1')
    error(409,'library_recovery_not_verified','Verify a recoverable owner Library export before enabling hosted fixture mutation.');
  const payload=JSON.stringify({action:input.action,scenarioId,phase:input.phase??null,expectedGeneration:input.expectedGeneration,expectedRevision:input.expectedRevision});
  const oldReceipt=row.receipt_json?JSON.parse(row.receipt_json):null;
  if(!row.pending_json&&oldReceipt?.operationId===input.operationId){
    if(oldReceipt.payload!==payload)error(409,'scenario_idempotency_mismatch','Operation ID was already used for a different request.');
    return {...base,...oldReceipt,replayed:true};
  }
  const existing=parsePending(row);
  let pending:Pending;
  if(existing){
    if(existing.operationId!==input.operationId||existing.payload!==payload)error(409,'scenario_operation_pending','Complete or retry the pending scenario operation first.');
    pending=existing;
  }else{
    if(row.revision!==input.expectedRevision)error(409,'scenario_revision_conflict','Refresh inspect and pass its exact controller revision.');
    const index=states.indexOf(row.phase??'');
    if(input.action==='advance'&&index<0)error(409,'scenario_not_loaded','Load a published state first.');
    if(input.action==='advance'&&index===states.length-1)error(409,'scenario_complete','The fixture is at its final published phase.');
    if(input.action==='reset'&&!row.phase)error(409,'scenario_not_loaded','There is no active fixture to reset.');
    const phase=input.action==='advance'?states[index+1]:input.action==='reset'?states[0]:input.phase!;
    const epoch=input.action==='advance'?row.epoch:row.epoch+1;
    if(epoch>100)error(409,'scenario_run_limit','The bounded fixture run identity limit was reached; review retention before increasing it.');
    pending={action:input.action as Pending['action'],operationId:input.operationId!,payload,epoch,phase,
      previousEpoch:row.epoch,previousPhase:row.phase};
    const changed=await db(env).prepare('UPDATE v2_scenario_control SET pending_json=?,updated_at=? WHERE owner=? AND scenario=? AND revision=? AND pending_json IS NULL AND generation=?')
      .bind(JSON.stringify(pending),new Date().toISOString(),owner,scenarioId,row.revision,ctx.generation).run();
    if(changed.meta.changes!==1)error(409,'scenario_revision_conflict','Another scenario operation was claimed first.');
  }
  const c=client(env,request,owner,pending.epoch);
  try{
    if(pending.action!=='advance'){
      await cleanup(c,env,owner,pending.previousEpoch);
      const upto=states.indexOf(pending.phase);
      for(let i=0;i<=upto;i++)await scenarioForPrefix(prefix(pending.epoch)).applyState(c,states[i]);
    }else await scenarioForPrefix(prefix(pending.epoch)).applyState(c,pending.phase);
    const checked=await snapshot(c,pending.epoch,pending.phase);
    const receipt={status:'committed',operationId:pending.operationId,payload,phase:pending.phase,
      controllerRevision:(input.expectedRevision??0)+1,epoch:pending.epoch,snapshot:checked,
      retainedHistoricalRevisions:true,cleanedOnlySyntheticRecords:true};
    const commit=await db(env).prepare('UPDATE v2_scenario_control SET epoch=?,phase=?,revision=revision+1,pending_json=NULL,receipt_json=?,updated_at=? WHERE owner=? AND scenario=? AND revision=? AND pending_json=? AND generation=?')
      .bind(pending.epoch,pending.phase,JSON.stringify(receipt),new Date().toISOString(),owner,scenarioId,
        input.expectedRevision,JSON.stringify(pending),ctx.generation).run();
    if(commit.meta.changes!==1)error(409,'scenario_commit_conflict','Fixture operations may have committed, but controller acknowledgement did not. Inspect and retry the same operation ID.');
    return {...base,...receipt,replayed:false};
  }catch(e){
    // A multi-record canonical replay is not atomic. Preserve pending intent
    // and individual domain receipts; do NOT falsely claim a clean rollback.
    if(e instanceof DomainError)throw e;
    error(409,'scenario_partial_failure','Fixture transition stopped. Inspect pending state and retry the same operation ID; canonical receipts are preserved.');
  }
}
