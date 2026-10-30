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
  MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER?:string;
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
export async function scenarioState(env:ScenarioEnv,owner:string):Promise<Row>{
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
  const rows=await db(env).prepare('SELECT family,id,data FROM v2_records WHERE owner=? AND id LIKE ? LIMIT 101')
    .bind(owner,run+'-%').all<{family:string;id:string;data:string}>();
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
  const project=await c.context('journey',id('project'));
  if(project.status!==200)error(409,'scenario_readback_failed','Active Project is not readable.');
  const outline=await c.request('/api/project-context?'+new URLSearchParams({projectId:id('project'),mode:'outline',learningSpace:'computing'}));
  if(outline.status!==200||outline.data.project?.id!==id('project'))error(409,'scenario_readback_failed','Project outline disagrees with the pinned identity.');
  const reference=await c.context('article',id('reference'));
  if(reference.status!==200)error(409,'scenario_readback_failed','Synthetic Library reference is unavailable.');
  const questions=[];
  for(const key of manifest.stableIds.questions){
    const found=await c.context('investigation',id(key.replace('TEST-ONLY-m2m-','')));
    if(key.endsWith('-question-storage')&&found.status===404&&states.indexOf(phase)<states.indexOf('F'))continue;
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
  // A conversational checkpoint may be attached to a Question rather than a
  // Project Stage. Keep it visible in controller readback and recovery checks.
  for(const question of questions){
    const response=await c.request('/api/learning-context',{scope:'target',
      target:{kind:'investigation',investigationId:question.id},profile:'tutor',limit:10});
    if(response.status!==200)error(409,'scenario_readback_failed','Question checkpoint context readback failed.');
    if(response.data.resume)checkpointIds.push(response.data.resume.source.id);
    for(const item of response.data.priorCheckpoints??[])checkpointIds.push(item.id);
  }
  const questionIds=[...new Set([...outline.data.projectQuestions,...outline.data.steps.flatMap((s:any)=>s.questions)].map((q:any)=>q.id))].sort();
  const annotation=await c.context('annotation',id('annotation-order'));
  if(annotation.status!==200&&annotation.status!==404)error(409,'scenario_readback_failed','Annotation readback failed.');
  const annotations=[] as {id:string;rev:number;body:string}[];
  for(const stableId of manifest.stableIds.annotations){
    const response=await c.context('annotation',id(stableId.replace('TEST-ONLY-m2m-','')));
    if(response.status===200)annotations.push({id:response.data.record.id,rev:response.data.record.rev,body:response.data.record.body});
    else if(response.status!==404)error(409,'scenario_readback_failed','Annotation readback failed.');
  }
  const manuscriptOutputs=await manuscriptOutputsForRun(env,c.owner,prefix(epoch));
  const publishedIds=[...new Set([...manifest.stableIds.requestedArticles.map(key=>id(key.replace('TEST-ONLY-m2m-',''))),
    ...manuscriptOutputs.map(item=>item.id)])];
  const requestedArticles=[] as {id:string;rev:number;rendition:string}[];
  for(const publishedId of publishedIds){
    const response=await c.context('article',publishedId);
    if(response.status===200)requestedArticles.push({id:response.data.record.id,rev:response.data.record.rev,
      rendition:response.data.record.rendition});
    else if(response.status!==404)error(409,'scenario_readback_failed','Generated Library Article readback failed.');
  }
  const requestedAnnotations=[] as {id:string;rev:number}[];
  for(const key of ['annotation-library','annotation-privacy-library']){
    const response=await c.context('annotation',id(key));
    if(response.status===200)requestedAnnotations.push({id:response.data.record.id,rev:response.data.record.rev});
    else if(response.status!==404)error(409,'scenario_readback_failed','Optional Library annotation readback failed.');
  }
  const flagRefs=[] as string[];
  for(const articleId of new Set([id('reference'),...publishedIds])){
    const flags=await db(env).prepare(`SELECT id FROM v2_records WHERE owner=? AND family='flag' AND trashed_at IS NULL
      AND (json_extract(data,'$.flagTarget.anchor.articleId')=? OR
           (json_extract(data,'$.flagTarget.kind')='record' AND json_extract(data,'$.flagTarget.family')='article' AND json_extract(data,'$.flagTarget.id')=?))
      LIMIT 101`).bind(c.owner,articleId,articleId).all<{id:string}>();
    if(flags.results.length>100)error(409,'scenario_readback_failed','Too many Flags on one synthetic Article.');
    flagRefs.push(...flags.results.map(item=>item.id));
  }
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
    annotations,flagRefs:[...new Set(flagRefs)].sort(),
    requestedArticle:requestedArticles.find(item=>item.id===manuscriptOutputs.find(out=>out.operationLeaf===manifest.reservedOutputs.manuscriptOperationLeaf)?.id)??
      requestedArticles.find(item=>item.id===id('requested-label-storage'))??null,
    requestedArticles,
    requestedAnnotation:requestedAnnotations.find(item=>item.id===id('annotation-library'))??null,
    requestedAnnotations,
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
  description:'Owner-only TEST ONLY scenario control for repeatable private Sites acceptance. Select published fixture states, inspect exact receipts and Project evidence; no arbitrary data reset. Mutations require explicit test intent, current generation/revision and an operator-approved recovery or synthetic-only waiver. Do not use during ordinary learning.',
  inputSchema:{type:'object',properties:{
    purpose:{type:'string',minLength:1,maxLength:500},
    action:{enum:['list','load','advance','inspect','reset']},
    scenarioId:{enum:[scenarioId]},phase:{type:'string',description:'Exact phase identifier returned by list (load only).'},
    operationId:{type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$'},
    expectedGeneration:{type:'string',maxLength:160},expectedRevision:{type:'integer',minimum:0}
  },required:['purpose','action'],additionalProperties:false}
};
export async function manageScenario(env:ScenarioEnv,owner:string,request:Request,input:ScenarioInput){
  const ctx=requireScenarioOwner(env,request);
  validate(input);
  if(input.action!=='list')requireGeneration(ctx,input.expectedGeneration);
  const row=await scenarioState(env,owner);
  if(row.generation!==ctx.generation)error(409,'scenario_generation_conflict','Scenario control belongs to a different workspace generation; review recovery before proceeding.');
  const base={scenarioId,fixtureVersion,generation:ctx.generation,sourceCommit:env.MINAMO_SCENARIO_SOURCE_SHA??null,
    libraryRecoveryVerified:env.MINAMO_SCENARIO_LIBRARY_RECOVERY_VERIFIED==='1',
    syntheticOnlyWaiver:env.MINAMO_SCENARIO_SYNTHETIC_ONLY_WAIVER==='1',
    reservedOutputs:reservedOutputsForEpoch(Math.max(1,row.epoch))};
  if(input.action==='list')return {...base,states:manifest.states,active:{phase:row.phase,revision:row.revision,epoch:row.epoch},pending:!!row.pending_json};
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
