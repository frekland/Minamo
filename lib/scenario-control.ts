/** Owner-only, opt-in orchestration of the versioned TEST ONLY corpus.
 * This never runs against ordinary invited learners, and cannot touch
 * arbitrary records or import remote instructions. It deliberately uses
 * canonical domain HTTP commands, with their revision/idempotency receipts.
 */
import {DomainError} from './domain-error';
import {assertGenerationCurrent,generationContext,requireGeneration} from './generations';
import {domainHandler} from './domain-handler';
import {readRecord} from './domain';
import {resolveProjectContinuation} from './project-context';
import type {RegisteredFixtureContinuation} from './project-context';
import {scenarioForPrefix,manifest} from '../tests/project-scenarios/mood-to-music/seed.mjs';
import {selectHostedFixture,hostedSelectorList,hostedSourcePin,type HostedFixture} from './hosted-scenario-registry';

type ScenarioEnv=Cloudflare.Env&{
  MINAMO_OWNER_ID?:string;
  MINAMO_SITE_HOSTS?:string;
  MINAMO_SCENARIO_CONTROL_ENABLED?:string;
  MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED?:string;
  MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER?:string;
  MINAMO_SCENARIO_SOURCE_SHA?:string;
};
type Action='list'|'inspect'|'compare-continuation'|'load'|'advance'|'reset';
type ScenarioInput={action:Action;purpose:string;scenarioId?:string;personaVariant?:string;phase?:string;operationId?:string;expectedGeneration?:string;expectedRevision?:number};
type Pending={action:'load'|'advance'|'reset';operationId:string;payload:string;epoch:number;phase:string;previousEpoch:number;previousPhase:string|null};
type Row={owner:string;scenario:string;epoch:number;phase:string|null;revision:number;generation:string;pending_json:string|null;receipt_json:string|null};
const scenarioId=manifest.key;
const states=manifest.states.map(s=>s.id);
const fixtureVersion=`${manifest.key}/${manifest.schemaVersion}`;
const prefix=(epoch:number)=>`TEST-ONLY-m2m-r${epoch}`;
// S03 of the first live V3 transcript used the literal reserved-output ID
// advertised by the manifest, before the run prefix requirement was clear.
// This is an exact historical alias, not permission for unscoped checkpoints.
const legacyC01={run:prefix(3),id:'TEST-ONLY-m2m-save-c01',
  targetId:'TEST-ONLY-m2m-r3-question-storage'};
const checkpointIdsForRun=(run:string)=>[
  ...manifest.stableIds.checkpoints.map(id=>run+'-'+id.replace('TEST-ONLY-m2m-','')),
  ...(run===legacyC01.run?[legacyC01.id]:[])
];
const questionIdsForRun=(run:string)=>new Set(manifest.stableIds.questions.map(id=>
  run+'-'+id.replace('TEST-ONLY-m2m-','')));
const reservedOutputsForEpoch=(epoch:number)=>({...manifest.reservedOutputs,
  // The manifest lists stable ID leaves, not writable global identities.
  conversationalCheckpoint:prefix(epoch)+'-save-c01',
  additionalCheckpointIds:manifest.reservedOutputs.additionalCheckpointIds.map(id=>
    prefix(epoch)+'-'+id.replace('TEST-ONLY-m2m-','')),
  checkpointOperationPattern:'TEST-ONLY-m2m-rN-save-c0N',
  ...(epoch===3?{historicalC01Alias:legacyC01.id}:{}),
  manuscriptOperationPattern:'TEST-ONLY-m2m-rN-'+manifest.reservedOutputs.manuscriptOperationLeaf
});
const error=(status:number,code:string,message:string):never=>{throw new DomainError(status,code,message)};
const db=(env:ScenarioEnv)=>{if(!env.DB)error(503,'storage_unavailable','Scenario storage is unavailable.');return env.DB!};
const validOperation=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/.test(value);
// A full scenario snapshot can require dozens of independent canonical
// readbacks. Bound concurrency to avoid a long serial MCP/Worker request while
// retaining deterministic ordering and the existing per-record validation.
async function readBatched<T,R>(items:readonly T[],read:(item:T)=>Promise<R>,batchSize=6):Promise<R[]>{
  const result:R[]=[];
  for(let offset=0;offset<items.length;offset+=batchSize)
    result.push(...await Promise.all(items.slice(offset,offset+batchSize).map(read)));
  return result;
}
const parsePending=(row:Row):Pending|null=>row.pending_json?JSON.parse(row.pending_json) as Pending:null;
export function requireScenarioOwner(env:ScenarioEnv,request:Request){
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
  if(!input||typeof input!=='object'||!['list','inspect','compare-continuation','load','advance','reset'].includes(input.action))
    error(400,'invalid_scenario_action','Choose list, inspect, compare-continuation, load, advance or reset.');
  if(typeof input.purpose!=='string'||!input.purpose.trim()||input.purpose.length>500)error(400,'request_scope_required','Provide a short test purpose.');
  try{selectHostedFixture({scenarioId:input.scenarioId??scenarioId,personaVariant:input.personaVariant})}
  catch{error(400,'unknown_scenario','Choose a registered scenario and persona variant from list.');}
  if(input.phase!==undefined&&!states.includes(input.phase))error(400,'unknown_scenario_phase','Choose a published phase from list.');
  if(['load','advance','reset'].includes(input.action)){
    if(!input.scenarioId||!validOperation(input.operationId))error(400,'invalid_scenario_operation','Provide the listed scenarioId and a stable operationId.');
    if(!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision!<0)error(400,'invalid_scenario_revision','Provide the exact nonnegative controller revision from inspect.');
    if(input.action==='load'&&!input.phase)error(400,'scenario_phase_required','Load requires an exact published phase.');
    if(input.action==='advance'&&input.phase!==undefined)error(400,'invalid_scenario_phase','Advance uses the next published phase; omit phase.');
    if(input.action==='reset'&&input.phase!==undefined)error(400,'invalid_scenario_phase','Reset returns to the first phase; omit phase.');
  }else if(input.phase!==undefined||input.operationId!==undefined||input.expectedRevision!==undefined)
    error(400,'invalid_scenario_read','Read operations do not accept mutation fields.');
}
export async function scenarioState(env:ScenarioEnv,owner:string,selected:HostedFixture=selectHostedFixture({scenarioId})):Promise<Row>{
  const now=new Date().toISOString();
  await db(env).prepare('INSERT OR IGNORE INTO v2_scenario_control(owner,scenario,epoch,phase,revision,generation,updated_at) VALUES(?,?,0,NULL,0,?,?)')
    .bind(owner,selected.dbKey,generationContext(env)!.generation,now).run();
  const row=await db(env).prepare('SELECT * FROM v2_scenario_control WHERE owner=? AND scenario=?').bind(owner,selected.dbKey).first<Row>();
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
  ...manifest.stableIds.requestedArticles.map(id=>['article',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ['article','reference'],['journey','project']
];
/** A run must never adopt a genuine record, even when someone has reused a
 * fixture-shaped ID. Check before cleanup so a collision cannot cause a
 * partial transition of an unrelated run. Retries admit only known synthetic
 * records from the current manifest.
 */
async function assertSyntheticRunBoundary(env:ScenarioEnv,owner:string,epoch:number){
  const run=prefix(epoch);
  const allowed=new Set(recordLeaves.map(([family,leaf])=>family+':'+run+'-'+leaf));
  const published=await manuscriptOutputsForRun(env,owner,run);
  const possibleLibraryTargets=new Set([
    ...manifest.stableIds.requestedArticles.map(id=>run+'-'+id.replace('TEST-ONLY-m2m-','')),
    ...published.map(item=>item.id)
  ]);
  const rows=await db(env).prepare('SELECT family,id,data FROM v2_records WHERE owner=? AND instr(id,?)=1 LIMIT 101')
    .bind(owner,run+'-').all<{family:string;id:string;data:string}>();
  if(rows.results.length>100)error(409,'fixture_identity_collision','Too many records under the reserved fixture identity.');
  for(const record of rows.results){
    let data:unknown;
    try{data=JSON.parse(record.data)}catch{error(409,'fixture_identity_collision','Fixture identity contains unreadable record data.');}
    if(!allowed.has(record.family+':'+record.id)||!data||typeof data!=='object'||(data as {synthetic?:boolean}).synthetic!==true)
      error(409,'fixture_identity_collision','A reserved fixture identity contains an unknown or non-synthetic record.');
    if(record.id.startsWith(run+'-annotation-')){
      const isOutputAnnotation=[run+'-annotation-library',run+'-annotation-privacy-library'].includes(record.id);
      const expectedArticle=isOutputAnnotation?possibleLibraryTargets:new Set([run+'-reference']);
      if(record.family!=='annotation'||!expectedArticle.has((data as any).anchor?.articleId)||
         (data as any).anchor?.recordFamily!=='article')
        error(409,'fixture_identity_collision','An annotation must anchor to its exact registered synthetic Article.');
    }
  }
  await assertCheckpointBoundary(env,owner,run);
}
async function assertCheckpointBoundary(env:ScenarioEnv,owner:string,run:string){
  const allowed=new Set(checkpointIdsForRun(run));
  // Inspect checkpoint heads attached to exact synthetic Projects or Questions,
  // even if a GPT used an operation ID outside the TEST-ONLY namespace.
  const rows=await db(env).prepare(`SELECT id,event_json FROM v2_learning_developments WHERE owner=? AND withdrawn=0 AND
    (json_extract(event_json,'$.primaryTarget.journeyId')=? OR
     json_extract(event_json,'$.primaryTarget.investigationId') LIKE ?) LIMIT 101`)
    .bind(owner,run+'-project',run+'-question-%').all<{id:string;event_json:string}>();
  if(rows.results.length>100)error(409,'fixture_checkpoint_mismatch','Too many checkpoint heads linked to this synthetic Project.');
  for(const item of rows.results){
    let event:any;
    try{event=JSON.parse(item.event_json)}catch{error(409,'fixture_checkpoint_mismatch','A synthetic Project checkpoint is unreadable.');}
    const legacy=item.id===legacyC01.id;
    if(!allowed.has(item.id)||event.synthetic!==true||!(event.primaryTarget?.journeyId===run+'-project'||
      event.primaryTarget?.investigationId?.startsWith(run+'-question-'))||
      (legacy&&(run!==legacyC01.run||event.primaryTarget?.kind!=='investigation'||
        event.primaryTarget.investigationId!==legacyC01.targetId)))
      error(409,'fixture_checkpoint_mismatch','A synthetic Project has an unregistered checkpoint; inspect before reset.');
  }
}
/** The ordinary GPT publisher derives ms-* IDs. Each optional slot must
 * have its own exact canonical receipt; no prefix-wide manuscript deletion.
 */
async function manuscriptOutputsForRun(env:ScenarioEnv,owner:string,run:string):Promise<{id:string;operationLeaf:string}[]>{
  const outputs=[] as {id:string;operationLeaf:string}[];
  for(const slot of manifest.reservedOutputs.manuscriptSlots){
    const row=await db(env).prepare('SELECT status,response FROM v2_operations WHERE owner=? AND id=?')
      .bind(owner,run+'-'+slot.operationLeaf).first<{status:number;response:string}>();
    if(!row)continue;
    if(row.status!==200)error(409,'fixture_manuscript_mismatch','A registered Library manuscript operation did not commit.');
    let receipt:any;
    try{receipt=JSON.parse(row.response)}catch{error(409,'fixture_manuscript_mismatch','A Library manuscript receipt is unreadable.');}
    const refs=receipt.recordRefs;
    if(receipt.kind!=='manuscript-v1'||!Array.isArray(refs)||refs.length!==1||
      refs[0].key!==slot.documentKey||refs[0].family!=='article'||
      !(refs[0].id===run+'-reference'||/^ms-[0-9a-f]{40}$/.test(refs[0].id)))
      error(409,'fixture_manuscript_mismatch','A Library manuscript published an unregistered output shape.');
    const id=refs[0].id;
    const record=await db(env).prepare("SELECT data FROM v2_records WHERE owner=? AND family='article' AND id=?")
      .bind(owner,id).first<{data:string}>();
    let data:any;
    try{data=record&&JSON.parse(record.data)}catch{error(409,'fixture_manuscript_mismatch','A generated Article is unreadable.');}
    if(!data||data.synthetic!==true||data.id!==id)
      error(409,'fixture_manuscript_mismatch','A generated Article is not verified as the synthetic publication.');
    outputs.push({id,operationLeaf:slot.operationLeaf});
  }
  return outputs;
}
async function cleanup(c:ReturnType<typeof client>,env:ScenarioEnv,owner:string,epoch:number){
  if(epoch===0)return;
  const old=prefix(epoch);
  const permitted=new Set(recordLeaves.map(([family,leaf])=>family+':'+old+'-'+leaf));
  const active=async()=>db(env).prepare('SELECT family,id FROM v2_records WHERE owner=? AND id LIKE ? AND trashed_at IS NULL LIMIT 101')
    .bind(owner,old+'-%').all<{family:string;id:string}>();
  const before=await active();
  if(before.results.length>100||before.results.some(record=>!permitted.has(record.family+':'+record.id)))
    error(409,'fixture_cleanup_boundary','Unknown records exist under the old fixture prefix; cleanup requires review.');
  await assertSyntheticRunBoundary(env,owner,epoch);
  const manuscriptOutputs=await manuscriptOutputsForRun(env,owner,old);
  // Withdraw only exact synthetic fixture checkpoints through the ordinary
  // revisioned learning-development contract, before their Project is trashed.
  // The immutable earlier editions are intentionally retained for recovery.
  for(const checkpointId of checkpointIdsForRun(old)){
    const leaf=checkpointId.startsWith(old+'-')?checkpointId.slice(old.length+1):'legacy-save-c01';
    const row=await db(env).prepare('SELECT revision,event_json,withdrawn FROM v2_learning_developments WHERE owner=? AND id=?')
      .bind(owner,checkpointId).first<{revision:number;event_json:string;withdrawn:number}>();
    if(!row||row.withdrawn)continue;
    const event=JSON.parse(row.event_json);
    const target=event.primaryTarget;
    const isStage=target?.kind==='journey-stage'&&target.journeyId===old+'-project';
    const isQuestion=target?.kind==='investigation'&&questionIdsForRun(old).has(target.investigationId);
    const isLegacy=checkpointId===legacyC01.id;
    if(event.synthetic!==true||!(isStage||isQuestion)||
      (isLegacy&&(old!==legacyC01.run||!isQuestion||target.investigationId!==legacyC01.targetId)))
      error(409,'fixture_checkpoint_mismatch','A checkpoint no longer belongs to the exact synthetic Project.');
    const current=await c.context(isStage?'journey':'investigation',isStage?old+'-project':target.investigationId);
    if(current.status!==200||current.data.record.synthetic!==true)error(409,'fixture_cleanup_blocked','Cannot verify the synthetic checkpoint target before withdrawal.');
    const revised=await c.request('/api/learning-developments/revise',{
      purpose:'TEST ONLY deterministic fixture retirement',intent:'explicit-user-checkpoint',
      expectedGeneration:c.generation,operationId:old+'-cleanup-'+leaf,id:checkpointId,
      expectedRev:row.revision,target,expectedTargetRev:current.data.record.rev,withdraw:true
    });
    if(revised.status!==200||revised.data.status!=='committed')
      error(409,'fixture_cleanup_blocked','Synthetic checkpoint withdrawal failed; retry the same operation ID.');
  }
  // Inspect only Flags on registered Articles, including older renditions.
  const outputIds=[old+'-reference',...manifest.stableIds.requestedArticles.map(id=>old+'-'+id.replace('TEST-ONLY-m2m-','')),
    ...manuscriptOutputs.map(item=>item.id)];
  const flags=[] as {id:string;data:string;outputId:string}[];
  for(const outputId of new Set(outputIds)){
    const found=await db(env).prepare(`SELECT id,data FROM v2_records WHERE owner=? AND family='flag' AND trashed_at IS NULL
      AND (json_extract(data,'$.flagTarget.anchor.articleId')=? OR
           (json_extract(data,'$.flagTarget.kind')='record' AND json_extract(data,'$.flagTarget.family')='article' AND json_extract(data,'$.flagTarget.id')=?))
      ORDER BY id LIMIT 21`).bind(owner,outputId,outputId).all<{id:string;data:string}>();
    if(found.results.length>20)error(409,'fixture_cleanup_boundary','Too many active Flags on a synthetic Article.');
    flags.push(...found.results.map(row=>({...row,outputId})));
  }
  for(const row of flags){
    const record=JSON.parse(row.data);
    const target=record.flagTarget;
    if(record.synthetic!==true||!target||!(target.kind==='passage'&&target.anchor?.articleId===row.outputId&&
      (target.anchor.recordFamily===undefined||target.anchor.recordFamily==='article')||
      target.kind==='record'&&target.family==='article'&&target.id===row.outputId))
      error(409,'fixture_flag_mismatch','A Flag is not proved to belong to a registered synthetic Article.');
    const found=await c.context('flag',row.id);
    if(found.status!==200||found.data.record.rev!==record.rev)error(409,'fixture_flag_mismatch','Synthetic Flag changed during cleanup.');
    const receipt=await c.command({operationId:old+'-cleanup-'+row.id,action:'trash',family:'flag',id:row.id,expectedRev:record.rev});
    if(receipt.status!==200)error(409,'fixture_cleanup_blocked','Generated-Article Flag cleanup failed.');
  }
  for(const item of manuscriptOutputs.filter(item=>item.id!==old+'-reference')){
    const article=await c.context('article',item.id);
    if(article.status===200){
      if(article.data.record.synthetic!==true)error(409,'fixture_manuscript_mismatch','The manuscript Article changed authority.');
      const result=await c.command({operationId:old+'-cleanup-'+item.operationLeaf,action:'trash',family:'article',
        id:item.id,expectedRev:article.data.record.rev});
      if(result.status!==200)error(409,'fixture_cleanup_blocked','Registered manuscript Article cleanup failed.');
    }else if(article.status!==404)error(409,'fixture_cleanup_blocked','Cannot inspect the generated Article.');
  }
  for(const [family,leaf] of recordLeaves){
    const id=old+'-'+leaf,found=await c.context(family,id);
    if(found.status===404)continue;
    if(found.status!==200||found.data.record.synthetic!==true)error(409,'fixture_identity_collision','Cleanup stopped at a non-synthetic or unavailable record.');
    const result=await c.command({operationId:old+'-cleanup-'+leaf,action:'trash',family,id,expectedRev:found.data.record.rev});
    if(result.status!==200||result.data.status!=='committed')error(409,'fixture_cleanup_blocked','Synthetic cleanup stopped; retry the same scenario operation.');
  }
  if((await active()).results.length)error(409,'fixture_cleanup_incomplete','Some fixture records remain active; inspect before retrying.');
  // Retained revisions remain recoverable, while old checkpoint heads are
  // withdrawn and old Project/Notes/Article are no longer active.
}
async function snapshot(c:ReturnType<typeof client>,env:ScenarioEnv,epoch:number,phase:string){
  const id=scenarioForPrefix(prefix(epoch)).id;
  const [project,outline,reference]=await Promise.all([
    c.context('journey',id('project')),
    c.request('/api/project-context?'+new URLSearchParams({projectId:id('project'),mode:'outline',learningSpace:'computing'})),
    c.context('article',id('reference'))
  ]);
  if(project.status!==200)error(409,'scenario_readback_failed','Active Project is not readable.');
  if(outline.status!==200||outline.data.project?.id!==id('project'))error(409,'scenario_readback_failed','Project outline disagrees with the pinned identity.');
  if(reference.status!==200)error(409,'scenario_readback_failed','Synthetic Library reference is unavailable.');
  const questionReadbacks=await readBatched(manifest.stableIds.questions,async key=>{
    const found=await c.context('investigation',id(key.replace('TEST-ONLY-m2m-','')));
    if(key.endsWith('-question-storage')&&found.status===404&&states.indexOf(phase)<states.indexOf('F'))return null;
    if(found.status!==200)error(409,'scenario_readback_failed','A published Question is unavailable.');
    return {id:found.data.record.id as string,rev:found.data.record.rev as number};
  });
  const questions=questionReadbacks.filter((value):value is {id:string;rev:number}=>value!==null);
  const noteReadbacks=await readBatched(manifest.stableIds.notes,async key=>{
    const record=await c.context('note',id(key.replace('TEST-ONLY-m2m-','')));
    if(record.status===200)return {id:record.data.record.id as string,rev:record.data.record.rev as number};
    if(record.status!==404)error(409,'scenario_readback_failed','Note readback failed.');
    return null;
  });
  const notes=noteReadbacks.filter((value):value is {id:string;rev:number}=>value!==null);
  const stageCheckpointIds=await readBatched(outline.data.steps.map((s:any)=>s.stageId as string),async stage=>{
    const response=await c.request('/api/learning-context',{scope:'target',target:{kind:'journey-stage',journeyId:id('project'),stageId:stage},profile:'tutor',limit:10});
    if(response.status!==200)error(409,'scenario_readback_failed','Checkpoint context readback failed.');
    return [...(response.data.resume?[response.data.resume.source.id as string]:[]),
      ...(response.data.priorCheckpoints??[]).map((item:any)=>item.id as string)];
  });
  // A conversational checkpoint may be attached to a Question rather than a
  // Project Stage. Keep it visible in controller readback and recovery checks.
  const questionCheckpointIds=await readBatched(questions,async question=>{
    const response=await c.request('/api/learning-context',{scope:'target',
      target:{kind:'investigation',investigationId:question.id},profile:'tutor',limit:10});
    if(response.status!==200)error(409,'scenario_readback_failed','Question checkpoint context readback failed.');
    return [...(response.data.resume?[response.data.resume.source.id as string]:[]),
      ...(response.data.priorCheckpoints??[]).map((item:any)=>item.id as string)];
  });
  const checkpointIds=[...stageCheckpointIds.flat(),...questionCheckpointIds.flat()];
  const questionIds=[...new Set([...outline.data.projectQuestions,...outline.data.steps.flatMap((s:any)=>s.questions)].map((q:any)=>q.id))].sort();
  const annotation=await c.context('annotation',id('annotation-order'));
  if(annotation.status!==200&&annotation.status!==404)error(409,'scenario_readback_failed','Annotation readback failed.');
  const annotationReadbacks=await readBatched(manifest.stableIds.annotations,async stableId=>{
    const response=await c.context('annotation',id(stableId.replace('TEST-ONLY-m2m-','')));
    if(response.status===200)return {id:response.data.record.id as string,
      rev:response.data.record.rev as number,body:response.data.record.body as string};
    if(response.status!==404)error(409,'scenario_readback_failed','Annotation readback failed.');
    return null;
  });
  const annotations=annotationReadbacks.filter((value):value is {id:string;rev:number;body:string}=>value!==null);
  const manuscriptOutputs=await manuscriptOutputsForRun(env,c.owner,prefix(epoch));
  const publishedIds=[...new Set([...manifest.stableIds.requestedArticles.map(key=>id(key.replace('TEST-ONLY-m2m-',''))),
    ...manuscriptOutputs.map(item=>item.id)])];
  const requestedArticleReadbacks=await readBatched(publishedIds,async publishedId=>{
    const response=await c.context('article',publishedId);
    if(response.status===200)return {id:response.data.record.id as string,
      rev:response.data.record.rev as number,rendition:response.data.record.rendition as string};
    if(response.status!==404)error(409,'scenario_readback_failed','Generated Library Article readback failed.');
    return null;
  });
  const requestedArticles=requestedArticleReadbacks.filter((value):value is {id:string;rev:number;rendition:string}=>value!==null);
  const requestedAnnotationReadbacks=await readBatched(['annotation-library','annotation-privacy-library'],async key=>{
    const response=await c.context('annotation',id(key));
    if(response.status===200)return {id:response.data.record.id as string,rev:response.data.record.rev as number};
    if(response.status!==404)error(409,'scenario_readback_failed','Optional Library annotation readback failed.');
    return null;
  });
  const requestedAnnotations=requestedAnnotationReadbacks.filter((value):value is {id:string;rev:number}=>value!==null);
  const flagRefsByArticle=await readBatched([...new Set([id('reference'),...publishedIds])],async articleId=>{
    const flags=await db(env).prepare(`SELECT id FROM v2_records WHERE owner=? AND family='flag' AND trashed_at IS NULL
      AND (json_extract(data,'$.flagTarget.anchor.articleId')=? OR
           (json_extract(data,'$.flagTarget.kind')='record' AND json_extract(data,'$.flagTarget.family')='article' AND json_extract(data,'$.flagTarget.id')=?))
      LIMIT 101`).bind(c.owner,articleId,articleId).all<{id:string}>();
    if(flags.results.length>100)error(409,'scenario_readback_failed','Too many Flags on one synthetic Article.');
    return flags.results.map(item=>item.id);
  });
  const flagRefs=flagRefsByArticle.flat();
  const {articleLeaf,...anchorShape}=manifest.cleanup.passageFlag;
  const bookmark=await c.request('/api/bookmarks',{target:{kind:'passage',anchor:{...anchorShape,
    articleId:id(articleLeaf),recordFamily:'article',rendition:reference.data.record.rendition}}});
  if(bookmark.status!==200)error(409,'scenario_readback_failed','Flag readback failed.');
  const operationIds=states.slice(0,states.indexOf(phase)+1)
    .flatMap(selected=>(manifest.operationsByPhase as Record<string,string[]>)[selected]??[]).map(id);
  const operationReceipts=await readBatched(operationIds,async operationId=>{
    const found=await c.request('/api/operations?'+new URLSearchParams({operationId}));
    if(found.status!==200||found.data.status!=='committed')
      error(409,'scenario_receipt_missing','Canonical fixture operation receipt is missing.');
    return {operationId,status:found.data.status,
      ...(found.data.recordRef?{recordRef:found.data.recordRef}:{}),
      ...(found.data.developmentRef?{developmentRef:found.data.developmentRef}:{}),
      ...(found.data.bookmark?{bookmark:found.data.bookmark}:{})};
  });
  return {phase,authoredScenarioDate:manifest.states.find(s=>s.id===phase)?.date,project:{id:project.data.record.id,rev:project.data.record.rev},
    questionIds,questions,reference:{id:reference.data.record.id,rev:reference.data.record.rev,
      rendition:reference.data.record.rendition},
    annotation:annotation.status===200?{id:annotation.data.record.id,rev:annotation.data.record.rev}:null,
    annotations,flagRefs:[...new Set(flagRefs)].sort(),
    requestedArticle:requestedArticles.find(item=>item.id===manuscriptOutputs.find(out=>out.operationLeaf===manifest.reservedOutputs.manuscriptOperationLeaf)?.id)??
      requestedArticles.find(item=>item.id===id('requested-label-storage'))??null,
    requestedArticles,
    requestedAnnotation:requestedAnnotations.find(item=>item.id===id('annotation-library'))??null,
    requestedAnnotations,
    bookmark:bookmark.data,operationReceipts,
    steps:outline.data.steps.map((s:any)=>s.stageId),notes,checkpointIds:[...new Set(checkpointIds)].sort()};
}
/** Read-only comparison of the same continuation resolver under ordinary and
 * manifest-scoped synthetic admission. Never alters Home/GPT projections.
 * Only the owner-gated scenario tool can reach this path. */
async function compareContinuation(env:ScenarioEnv,owner:string,row:Row){
 if(!row.phase||row.epoch<1)error(409,'scenario_not_loaded','Load a registered synthetic fixture before comparing continuation.');
 if(parsePending(row))error(409,'scenario_operation_pending','Complete the pending fixture transition before comparing continuation.');
 const run=prefix(row.epoch),projectId=run+'-project';
 await assertSyntheticRunBoundary(env,owner,row.epoch);
 const before=Number((await db(env).prepare('SELECT version FROM v2_namespace_versions WHERE owner=?')
  .bind(owner).first<{version:number}>())?.version??0);
 const project=await readRecord(env,owner,'journey',projectId);
 if(!project||project.synthetic!==true)
  throw new DomainError(409,'fixture_identity_collision','The registered synthetic Project is unavailable.');
 const questionIds=questionIdsForRun(run);
 if(project.links.some(link=>link.family==='investigation'&&!questionIds.has(link.id)))
  error(409,'fixture_identity_collision','The synthetic Project links an unregistered Question.');
 const fixture:RegisteredFixtureContinuation={
  projectId,
  checkpointIds:checkpointIdsForRun(run),
  noteIds:manifest.stableIds.notes.map(id=>run+'-'+id.replace('TEST-ONLY-m2m-',''))
 };
 const scope={learningSpace:'computing' as const};
 const [ordinary,registeredFixture]=await Promise.all([
  resolveProjectContinuation(env,owner,project,scope),
  resolveProjectContinuation(env,owner,project,scope,new Map(),fixture)
 ]);
 // Fail closed on mixed real/synthetic work rather than returning an owner's
 // genuine linked Note through a synthetic comparison.
 if(ordinary.continuation?.basis!=='start')
  error(409,'fixture_mixed_provenance','An ordinary non-synthetic continuation is linked to this fixture; inspect privately.');
 const selected=registeredFixture.continuation;
 if((selected?.note&&!fixture.noteIds.includes(selected.note.id))||
    (selected?.checkpoint&&!fixture.checkpointIds.includes(selected.checkpoint.id))||
    (selected?.target?.kind==='journey-stage'&&selected.target.journeyId!==projectId)||
    (selected?.target?.kind==='investigation'&&!questionIds.has(selected.target.investigationId)))
  error(409,'fixture_identity_collision','Continuation selected an unregistered fixture target.');
 await assertGenerationCurrent(env);
 const [after,latest]=await Promise.all([
  db(env).prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>(),
  db(env).prepare('SELECT phase,epoch,revision,pending_json FROM v2_scenario_control WHERE owner=? AND scenario=?')
   .bind(owner,scenarioId).first<Pick<Row,'phase'|'epoch'|'revision'|'pending_json'>>()
 ]);
 if(Number(after?.version??0)!==before||!latest||latest.phase!==row.phase||
    latest.epoch!==row.epoch||latest.revision!==row.revision||latest.pending_json)
  error(409,'scenario_snapshot_changed','Fixture or learning state changed during comparison; inspect and retry.');
 return {phase:row.phase,epoch:row.epoch,controllerRevision:row.revision,project:{id:project.id,rev:project.rev},
  semantics:'same-resolver-different-admission',scope:'owner-only registered synthetic fixture',
  ordinary,registeredFixture,
  basisDiffers:ordinary.continuation?.basis!==registeredFixture.continuation?.basis,
  notice:'The ordinary Home/Project/GPT paths still exclude synthetic history. This read-only comparison admits only exact synthetic manifest Notes and checkpoint IDs; it is not a temporal synthesis or passive MCP trace.'};
}
export function visibleScenarioTool(env:ScenarioEnv,request:Request){
  return env.MINAMO_SCENARIO_CONTROL_ENABLED==='1'&&!!env.MINAMO_OWNER_ID&&
    !!env.MINAMO_SITE_HOSTS?.split(',').includes(new URL(request.url).hostname)&&
    request.headers.get('oai-authenticated-user-id')===env.MINAMO_OWNER_ID&&
    !!request.headers.get('oai-authenticated-user-email');
}
export const scenarioTool={
  name:'manage_minamo_test_scenario',
  description:'Owner-only TEST ONLY hosted 3x3 scenario selector. List registered fictional Projects/personas, load/inspect/advance/reset an exact isolated variant and compare manifest-scoped continuation. Legacy Mood-to-Music remains separately pinned. Revision, synthetic owner identity, source and cleanup safeguards apply; do not use for real learning.',
  inputSchema:{type:'object',properties:{
    purpose:{type:'string',minLength:1,maxLength:500},
    action:{enum:['list','load','advance','inspect','compare-continuation','reset']},
    scenarioId:{enum:['mood-to-music','retired-htb-cap','automatic-plant-screamer']},
    personaVariant:{type:'string',description:'Exact registered fictional variant from list; omit for the preserved legacy Mood-to-Music scenario.'},
    phase:{type:'string',description:'Exact phase identifier returned by list (load only).'},
    operationId:{type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$'},
    expectedGeneration:{type:'string',maxLength:160},expectedRevision:{type:'integer',minimum:0}
  },required:['purpose','action'],additionalProperties:false}
};
export async function manageScenario(env:ScenarioEnv,owner:string,request:Request,input:ScenarioInput){
  const ctx=requireScenarioOwner(env,request);
  validate(input);
  const selected=selectHostedFixture({scenarioId:input.scenarioId??scenarioId,personaVariant:input.personaVariant});
  if(!selected.legacy)return manageHostedVariant(env,owner,request,input,selected);
  if(input.action!=='list')requireGeneration(ctx,input.expectedGeneration);
  const row=await scenarioState(env,owner);
  if(row.generation!==ctx.generation)error(409,'scenario_generation_conflict','Scenario control belongs to a different workspace generation; review recovery before proceeding.');
  const base={scenarioId,fixtureVersion,generation:ctx.generation,sourceCommit:env.MINAMO_SCENARIO_SOURCE_SHA??null,
    libraryRecoveryVerified:env.MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED==='1',
    syntheticOnlyWaiver:env.MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER==='1',
    reservedOutputs:reservedOutputsForEpoch(Math.max(1,row.epoch))};
  if(input.action==='list')return {...base,states:manifest.states,availableVariants:hostedSelectorList(),
    active:{phase:row.phase,revision:row.revision,epoch:row.epoch},pending:!!row.pending_json};
  if(input.action==='compare-continuation')
    return {...base,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},
      continuationComparison:await compareContinuation(env,owner,row)};
  if(input.action==='inspect'){
    if(parsePending(row))return {...base,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},pending:JSON.parse(row.pending_json!),retryRequired:true};
    return {...base,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},
      receipt:row.receipt_json?JSON.parse(row.receipt_json):null,
      snapshot:row.phase?await snapshot(client(env,request,owner,row.epoch),env,row.epoch,row.phase):null};
  }
  if(!base.libraryRecoveryVerified&&!base.syntheticOnlyWaiver)
    error(409,'scenario_mutation_not_authorized','Enable verified Library recovery or the explicit owner-approved synthetic-only waiver before mutating fixtures.');
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
    await assertSyntheticRunBoundary(env,owner,pending.epoch);
    if(pending.action!=='advance'){
      await cleanup(c,env,owner,pending.previousEpoch);
      const upto=states.indexOf(pending.phase);
      for(let i=0;i<=upto;i++)await scenarioForPrefix(prefix(pending.epoch)).applyState(c,states[i]);
    }else await scenarioForPrefix(prefix(pending.epoch)).applyState(c,pending.phase);
    const checked=await snapshot(c,env,pending.epoch,pending.phase);
    const receipt={status:'committed',operationId:pending.operationId,payload,phase:pending.phase,
      controllerRevision:(input.expectedRevision??0)+1,epoch:pending.epoch,snapshot:checked,
      retainedHistoricalRevisions:true,cleanedOnlySyntheticRecords:true};
    const commit=await db(env).prepare('UPDATE v2_scenario_control SET epoch=?,phase=?,revision=revision+1,pending_json=NULL,receipt_json=?,updated_at=? WHERE owner=? AND scenario=? AND revision=? AND pending_json=? AND generation=?')
      .bind(pending.epoch,pending.phase,JSON.stringify(receipt),new Date().toISOString(),owner,scenarioId,
        input.expectedRevision,JSON.stringify(pending),ctx.generation).run();
    if(commit.meta.changes!==1)error(409,'scenario_commit_conflict','Fixture operations may have committed, but controller acknowledgement did not. Inspect and retry the same operation ID.');
    return {...base,...receipt,reservedOutputs:reservedOutputsForEpoch(pending.epoch),replayed:false};
  }catch(e){
    // A multi-record canonical replay is not atomic. Preserve pending intent
    // and individual domain receipts; do NOT falsely claim a clean rollback.
    if(e instanceof DomainError)throw e;
    error(409,'scenario_partial_failure','Fixture transition stopped. Inspect pending state and retry the same operation ID; canonical receipts are preserved.');
  }
}

/** Hosted variants use the same canonical HTTP command path, while their
 * row keys, run prefixes and allowed record inventories are disjoint. This
 * branch deliberately does not alter the accepted legacy K controller. */
async function assertHostedBoundary(env:ScenarioEnv,owner:string,fixture:HostedFixture,epoch:number){
  if(epoch<1)error(400,'invalid_scenario_epoch','Synthetic epoch must be positive.');
  const run=fixture.prefix(epoch),known=new Set(fixture.recordLeaves.map(([family,leaf])=>family+':'+run+'-'+leaf));
  const rows=await db(env).prepare('SELECT family,id,data FROM v2_records WHERE owner=? AND instr(id,?)=1 LIMIT 101')
    .bind(owner,run+'-').all<{family:string;id:string;data:string}>();
  if(rows.results.length>100)error(409,'fixture_identity_collision','Synthetic record inventory exceeded its safety limit.');
  for(const row of rows.results){
    let value:any;
    try{value=JSON.parse(row.data)}catch{error(409,'fixture_identity_collision','Unreadable synthetic record.');}
    if(!known.has(row.family+':'+row.id)||value?.synthetic!==true||value.id!==row.id)
      error(409,'fixture_identity_collision','An unknown or non-synthetic identity occupies the selected persona namespace.');
  }
  const heads=await db(env).prepare(`SELECT id,event_json FROM v2_learning_developments WHERE owner=? AND withdrawn=0
    AND (json_extract(event_json,'$.primaryTarget.journeyId')=? OR
         instr(json_extract(event_json,'$.primaryTarget.investigationId'),?)=1) LIMIT 101`)
    .bind(owner,run+'-project',run+'-question-').all<{id:string;event_json:string}>();
  if(heads.results.length>100)error(409,'fixture_checkpoint_mismatch','Too many checkpoint heads.');
  const permitted=new Set(fixture.checkpointLeaves.map(leaf=>run+'-'+leaf));
  for(const item of heads.results){
    let event:any;
    try{event=JSON.parse(item.event_json)}catch{error(409,'fixture_checkpoint_mismatch','Unreadable checkpoint.');}
    if(!permitted.has(item.id)||event?.synthetic!==true||
      !(event.primaryTarget?.journeyId===run+'-project'||
        fixture.questions.some(q=>event.primaryTarget?.investigationId===run+'-'+q)))
      error(409,'fixture_checkpoint_mismatch','An unregistered checkpoint targets the selected fictional Project.');
  }
  // Opaque Flags are allowed only when their canonical target is the exact
  // selected synthetic Article, never a prefix coincidence in a command ID.
  const flags=await db(env).prepare(`SELECT id,data FROM v2_records WHERE owner=? AND family='flag'
    AND trashed_at IS NULL AND
      (json_extract(data,'$.flagTarget.anchor.articleId')=? OR
       (json_extract(data,'$.flagTarget.id')=?)) LIMIT 101`)
    .bind(owner,run+'-reference',run+'-reference').all<{id:string;data:string}>();
  if(flags.results.length>100)error(409,'fixture_flag_mismatch','Too many Flags on selected synthetic reference.');
  for(const flag of flags.results){
    let value:any;
    try{value=JSON.parse(flag.data)}catch{error(409,'fixture_flag_mismatch','Unreadable synthetic Flag.');}
    const target=value?.flagTarget;
    if(value?.synthetic!==true||!(target?.kind==='passage'&&target.anchor?.articleId===run+'-reference'&&
      (target.anchor.recordFamily===undefined||target.anchor.recordFamily==='article')||
      target?.kind==='record'&&target.family==='article'&&target.id===run+'-reference'))
      error(409,'fixture_flag_mismatch','Cannot prove Flag belongs to this synthetic Article.');
  }
  // The canonical Flag toggle also owns a bookmark head with a hashed ID.
  // Trashing only the Flag record would leave an active bookmark head behind.
  const bookmarks=await db(env).prepare(`SELECT target_key,target_rev,flag_id,target FROM v2_bookmarks
    WHERE owner=? AND active=1 AND json_extract(target,'$.family')='article'
      AND json_extract(target,'$.id')=? LIMIT 101`)
    .bind(owner,run+'-reference')
    .all<{target_key:string;target_rev:number;flag_id:string|null;target:string}>();
  if(bookmarks.results.length>100)error(409,'fixture_flag_mismatch','Too many synthetic bookmark heads.');
  for(const bookmark of bookmarks.results){
    if(!bookmark.flag_id||!flags.results.some(f=>f.id===bookmark.flag_id))
      error(409,'fixture_flag_mismatch','An active bookmark has no registered synthetic Flag record.');
    let target:any;
    try{target=JSON.parse(bookmark.target)}catch{error(409,'fixture_flag_mismatch','Unreadable synthetic bookmark target.');}
    if(!['record','passage'].includes(target.kind)||target.family!=='article'||target.id!==run+'-reference')
      error(409,'fixture_flag_mismatch','Bookmark source identity is not the selected synthetic reference.');
  }
  return {rows:rows.results,heads:heads.results,flags:flags.results,bookmarks:bookmarks.results};
}

async function hostedSnapshot(c:ReturnType<typeof client>,env:ScenarioEnv,owner:string,
  fixture:HostedFixture,epoch:number,phase:string){
  const run=fixture.prefix(epoch);
  const boundary=await assertHostedBoundary(env,owner,fixture,epoch);
  const project=await c.context('journey',run+'-project'),reference=await c.context('article',run+'-reference');
  if(project.status!==200||project.data.record.synthetic!==true||
     reference.status!==200||reference.data.record.synthetic!==true)
    error(409,'scenario_readback_failed','Registered synthetic Project or reference could not be read.');
  const readEntries=async(family:string,leaves:readonly string[])=>{
    const results=await readBatched(leaves,async leaf=>{
      const found=await c.context(family,run+'-'+leaf);
      if(found.status===404)return null;
      if(found.status!==200||found.data.record.synthetic!==true)
        error(409,'scenario_readback_failed','Registered synthetic record readback failed.');
      return {id:found.data.record.id as string,rev:found.data.record.rev as number};
    });
    return results.filter((item):item is {id:string;rev:number}=>item!==null);
  };
  const [questions,notes,annotations]=await Promise.all([
    readEntries('investigation',fixture.questions),readEntries('note',fixture.notes),
    readEntries('annotation',fixture.recordLeaves.filter(([family])=>family==='annotation').map(([,leaf])=>leaf))
  ]);
  const receiptRows=await db(env).prepare('SELECT id,status FROM v2_operations WHERE owner=? AND instr(id,?)=1 LIMIT 201')
    .bind(owner,run+'-').all<{id:string;status:number}>();
  if(receiptRows.results.length>200)error(409,'scenario_receipt_limit','Too many selected synthetic receipts.');
  return {phase,project:{id:project.data.record.id,rev:project.data.record.rev},
    reference:{id:reference.data.record.id,rev:reference.data.record.rev,rendition:reference.data.record.rendition},
    questions,notes,annotations,registeredRecords:boundary.rows.length,
    syntheticFlagIds:boundary.flags.map(flag=>flag.id).sort(),
    activeBookmarkHeads:boundary.bookmarks.map(bookmark=>({targetKey:bookmark.target_key,rev:bookmark.target_rev})),
    checkpointIds:boundary.heads.map(head=>head.id).sort(),
    operationReceipts:receiptRows.results.map(r=>({operationId:r.id,status:r.status})).sort((a,b)=>a.operationId.localeCompare(b.operationId)),
    provenance:{fixtureVersion:fixture.fixtureVersion,personaVariant:fixture.personaVariant,runPrefix:run,
      source:fixture.sourceProvenance,sourceFiles:fixture.sourceFiles,
      authority:'canonical synthetic D1 readback'}};
}

async function cleanupHostedVariant(c:ReturnType<typeof client>,env:ScenarioEnv,owner:string,
  fixture:HostedFixture,epoch:number){
  if(epoch<1)return;
  const run=fixture.prefix(epoch),boundary=await assertHostedBoundary(env,owner,fixture,epoch);
  // All risky identities are inventoried before the first cleanup mutation.
  for(const item of boundary.heads){
    const event=JSON.parse(item.event_json),target=event.primaryTarget;
    const row=await db(env).prepare('SELECT revision FROM v2_learning_developments WHERE owner=? AND id=?')
      .bind(owner,item.id).first<{revision:number}>();
    const family=target.kind==='investigation'?'investigation':'journey',
      targetId=target.investigationId??target.journeyId;
    const latest=await c.context(family,targetId);
    if(!row||latest.status!==200||latest.data.record.synthetic!==true)
      error(409,'fixture_cleanup_blocked','Checkpoint target is not safely readable.');
    const result=await c.request('/api/learning-developments/revise',{
      purpose:'TEST ONLY registered persona cleanup',intent:'explicit-user-checkpoint',
      expectedGeneration:c.generation,operationId:run+'-cleanup-checkpoint-'+item.id.slice(run.length+1),
      id:item.id,expectedRev:row!.revision,target,expectedTargetRev:latest.data.record.rev,withdraw:true});
    if(result.status!==200||result.data.status!=='committed')
      error(409,'fixture_cleanup_blocked','Synthetic checkpoint retirement failed.');
  }
  const cleanupIds=new Set<string>();
  for(const bookmark of boundary.bookmarks){
    const cleanupId=run+'-cleanup-bookmark-'+bookmark.target_key.slice(-32);
    if(cleanupIds.has(cleanupId))error(409,'fixture_flag_mismatch','Bookmark cleanup identities collide.');
    cleanupIds.add(cleanupId);
  }
  for(const bookmark of boundary.bookmarks){
    const record=boundary.flags.find(flag=>flag.id===bookmark.flag_id);
    if(!record)error(409,'fixture_flag_mismatch','Synthetic bookmark/Flag pairing changed.');
    const target=JSON.parse(record!.data).flagTarget;
    const receipt=await c.command({operationId:run+'-cleanup-bookmark-'+bookmark.target_key.slice(-32),
      action:'setFlag',target,active:false,expectedTargetRev:bookmark.target_rev});
    if(receipt.status!==200||receipt.data.status!=='committed'||receipt.data.bookmark?.active!==false)
      error(409,'fixture_cleanup_blocked','Synthetic bookmark deactivation failed.');
  }
  for(const item of boundary.flags){
    const current=await c.context('flag',item.id);
    // Canonical unflag already Trashed the paired Flag record above.
    if(current.status===404&&boundary.bookmarks.some(bookmark=>bookmark.flag_id===item.id))continue;
    if(current.status!==200||current.data.record.synthetic!==true)
      error(409,'fixture_cleanup_blocked','Cannot verify synthetic Flag before Trash.');
    const receipt=await c.command({operationId:run+'-cleanup-flag-'+item.id.slice(-32),
      action:'trash',family:'flag',id:item.id,expectedRev:current.data.record.rev});
    if(receipt.status!==200||receipt.data.status!=='committed')
      error(409,'fixture_cleanup_blocked','Synthetic Flag cleanup failed.');
  }
  for(const [family,leaf] of fixture.recordLeaves){
    const id=run+'-'+leaf,found=await c.context(family,id);
    if(found.status===404)continue;
    if(found.status!==200||found.data.record.synthetic!==true)
      error(409,'fixture_cleanup_blocked','Cannot prove record is synthetic before retirement.');
    const receipt=await c.command({operationId:run+'-cleanup-'+family+'-'+leaf,
      action:'trash',family,id,expectedRev:found.data.record.rev});
    if(receipt.status!==200||receipt.data.status!=='committed')
      error(409,'fixture_cleanup_blocked','Synthetic persona cleanup stopped with pending receipts.');
  }
  const remaining=await db(env).prepare('SELECT id FROM v2_records WHERE owner=? AND instr(id,?)=1 AND trashed_at IS NULL LIMIT 1')
    .bind(owner,run+'-').first();
  if(remaining)error(409,'fixture_cleanup_incomplete','Synthetic records remained active after cleanup.');
}

async function manageHostedVariant(env:ScenarioEnv,owner:string,request:Request,input:ScenarioInput,fixture:HostedFixture){
  const ctx=requireScenarioOwner(env,request);
  if(input.action!=='list')requireGeneration(ctx,input.expectedGeneration);
  const row=await scenarioState(env,owner,fixture);
  if(row.generation!==ctx.generation)error(409,'scenario_generation_conflict','This fixture belongs to another generation.');
  const sourcePin=hostedSourcePin(fixture,env.MINAMO_SCENARIO_SOURCE_SHA);
  const priorSource=row.receipt_json?JSON.parse(row.receipt_json).sourcePin:null;
  if(row.epoch>0&&priorSource!==null&&priorSource!==sourcePin)
    error(409,'scenario_source_conflict','Fixture source pins changed; review registered persona before further operations.');
  const base={scenarioId:fixture.scenarioId,personaVariant:fixture.personaVariant,
    fixtureVersion:fixture.fixtureVersion,fixtureSource:fixture.sourceProvenance,
    sourceFiles:fixture.sourceFiles,sourcePin,
    generation:ctx.generation,
    syntheticOnlyWaiver:env.MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER==='1',
    libraryRecoveryVerified:env.MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED==='1',
    runPrefix:fixture.prefix(Math.max(1,row.epoch))};
  const active={phase:row.phase,revision:row.revision,epoch:row.epoch};
  if(input.action==='list')return {...base,availableVariants:hostedSelectorList(),states:fixture.states.map(id=>({id})),
    active,pending:!!row.pending_json};
  if(input.action==='inspect'){
    if(parsePending(row))return {...base,active,pending:JSON.parse(row.pending_json!),retryRequired:true};
    return {...base,active,receipt:row.receipt_json?JSON.parse(row.receipt_json):null,
      snapshot:row.phase?await hostedSnapshot(client(env,request,owner,row.epoch),env,owner,fixture,row.epoch,row.phase):null};
  }
  if(input.action==='compare-continuation'){
    if(!row.phase||row.pending_json)error(409,'scenario_not_loaded','Load and settle the selected synthetic fixture.');
    const run=fixture.prefix(row.epoch),project=await readRecord(env,owner,'journey',run+'-project');
    await assertHostedBoundary(env,owner,fixture,row.epoch);
    if(!project||project.synthetic!==true)error(409,'fixture_identity_collision','Synthetic Project not readable.');
    const before=await db(env).prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>();
    const configured:RegisteredFixtureContinuation={projectId:project!.id,
      noteIds:fixture.notes.map(leaf=>run+'-'+leaf),checkpointIds:fixture.checkpointLeaves.map(leaf=>run+'-'+leaf)};
    const [ordinary,registeredFixture]=await Promise.all([
      resolveProjectContinuation(env,owner,project!,{learningSpace:'computing'}),
      resolveProjectContinuation(env,owner,project!,{learningSpace:'computing'},new Map(),configured)
    ]);
    const selected=registeredFixture.continuation;
    if((selected?.note&&!configured.noteIds.includes(selected.note.id))||
      (selected?.checkpoint&&!configured.checkpointIds.includes(selected.checkpoint.id))||
      (selected?.target?.kind==='journey-stage'&&selected.target.journeyId!==project!.id)||
      (selected?.target?.kind==='investigation'&&
        !new Set(fixture.questions.map(q=>run+'-'+q)).has(selected.target.investigationId)))
      error(409,'fixture_identity_collision','Synthetic continuation selected an unregistered identity.');
    const [after,current]=await Promise.all([
      db(env).prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>(),
      db(env).prepare('SELECT phase,epoch,revision,pending_json FROM v2_scenario_control WHERE owner=? AND scenario=?')
        .bind(owner,fixture.dbKey).first<Pick<Row,'phase'|'epoch'|'revision'|'pending_json'>>()
    ]);
    if(before?.version!==after?.version||current?.phase!==row.phase||current?.epoch!==row.epoch||
      current?.revision!==row.revision||current?.pending_json)
      error(409,'scenario_snapshot_changed','Canonical state or fixture revision moved during comparison.');
    if(ordinary.continuation?.basis!=='start')error(409,'fixture_mixed_provenance','Ordinary continuation admitted unexpected state.');
    return {...base,active,continuationComparison:{ordinary,registeredFixture,
      provenance:'same resolver; registered synthetic records admitted only for owner-gated comparison'}};
  }
  if(!base.syntheticOnlyWaiver&&!base.libraryRecoveryVerified)
    error(409,'scenario_mutation_not_authorized','Synthetic-only waiver or verified recovery is required.');
  const payload=JSON.stringify({action:input.action,scenarioId:fixture.scenarioId,personaVariant:fixture.personaVariant,sourcePin,
    phase:input.phase??null,expectedGeneration:input.expectedGeneration,expectedRevision:input.expectedRevision});
  const oldReceipt=row.receipt_json?JSON.parse(row.receipt_json):null;
  if(!row.pending_json&&oldReceipt?.operationId===input.operationId){
    if(oldReceipt.payload!==payload)error(409,'scenario_idempotency_mismatch','Operation ID already has another payload.');
    return {...base,...oldReceipt,replayed:true};
  }
  let pending=parsePending(row);
  if(pending){
    if(pending.operationId!==input.operationId||pending.payload!==payload)
      error(409,'scenario_operation_pending','Retry the exact pending operation; do not advance another persona.');
  }else{
    if(row.revision!==input.expectedRevision)error(409,'scenario_revision_conflict','Refresh selected persona revision.');
    const index=fixture.states.indexOf(row.phase??'');
    if(input.action==='advance'&&index<0)error(409,'scenario_not_loaded','Load this persona first.');
    if(input.action==='advance'&&index===fixture.states.length-1)error(409,'scenario_complete','Final phase reached.');
    if(input.action==='reset'&&!row.phase)error(409,'scenario_not_loaded','No current fixture to reset.');
    const phase=input.action==='advance'?fixture.states[index+1]:input.action==='reset'?fixture.states[0]:input.phase!;
    const epoch=input.action==='advance'?row.epoch:row.epoch+1;
    if(epoch>100)error(409,'scenario_run_limit','Fixture epoch limit reached.');
    pending={action:input.action as Pending['action'],operationId:input.operationId!,payload,
      epoch,phase,previousEpoch:row.epoch,previousPhase:row.phase};
    const claimed=await db(env).prepare(`UPDATE v2_scenario_control SET pending_json=?,updated_at=?
      WHERE owner=? AND scenario=? AND revision=? AND pending_json IS NULL AND generation=?`)
      .bind(JSON.stringify(pending),new Date().toISOString(),owner,fixture.dbKey,row.revision,ctx.generation).run();
    if(claimed.meta.changes!==1)error(409,'scenario_revision_conflict','Concurrent selection claimed revision.');
  }
  const c=client(env,request,owner,pending.epoch);
  try{
    await assertHostedBoundary(env,owner,fixture,pending.epoch);
    if(pending.action!=='advance'){
      await cleanupHostedVariant(c,env,owner,fixture,pending.previousEpoch);
      for(const phase of fixture.states.slice(0,fixture.states.indexOf(pending.phase)+1))
        await fixture.apply(c,phase,pending.epoch);
    }else await fixture.apply(c,pending.phase,pending.epoch);
    const checked=await hostedSnapshot(c,env,owner,fixture,pending.epoch,pending.phase);
    const receipt={status:'committed',operationId:pending.operationId,payload,sourcePin,phase:pending.phase,
      controllerRevision:row.revision+1,epoch:pending.epoch,snapshot:checked,
      retainedHistoricalRevisions:true,cleanedOnlySyntheticRecords:true};
    const committed=await db(env).prepare(`UPDATE v2_scenario_control SET epoch=?,phase=?,revision=revision+1,
      pending_json=NULL,receipt_json=?,updated_at=? WHERE owner=? AND scenario=? AND revision=?
      AND pending_json=? AND generation=?`)
      .bind(pending.epoch,pending.phase,JSON.stringify(receipt),new Date().toISOString(),
        owner,fixture.dbKey,row.revision,JSON.stringify(pending),ctx.generation).run();
    if(committed.meta.changes!==1)error(409,'scenario_commit_conflict','Canonical writes may have committed; inspect and retry.');
    return {...base,...receipt,runPrefix:fixture.prefix(pending.epoch),replayed:false};
  }catch(e){
    if(e instanceof DomainError)throw e;
    error(409,'scenario_partial_failure','Synthetic transition stopped; retain pending intent and retry exact operation identity.');
  }
}
