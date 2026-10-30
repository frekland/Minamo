import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {privateStorageFixture} from '../../private-storage-fixture.mjs';
import {applyState,manifest,id,ok} from './seed.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const states=manifest.states.map(item=>item.id);
/** Always starts a fresh disposable D1/R2 instance, never a hosted or owner namespace. */
export async function seed({owner=manifest.fixtureOwner}={}){
  if(!owner.startsWith('TEST-ONLY-'))throw Error('Only TEST-ONLY synthetic principals are allowed');
  const fixture=await privateStorageFixture(worker);
  return {fixture,client:fixture.client(owner),completed:[]};
}
export async function advance(session,state){
  const expected=states[session.completed.length];
  assert.equal(state,expected,'Replay must advance in order, without skipping chronological operations');
  await applyState(session.client,state);
  session.completed.push(state);
  return inspect(session);
}
export async function inspect(session){
  const c=session.client;
  const project=await ok(c.context('journey',id('project')));
  const outline=await ok(c.request('/api/project-context?'+new URLSearchParams({projectId:id('project'),mode:'outline',learningSpace:'computing'})));
  const notes=[];
  for(const leaf of ['note-research','note-v1','note-v2','note-race','note-guard','note-pivot','note-unknown','note-return','note-terminal']){
    const response=await c.context('note',id(leaf));
    if(response.status===200)notes.push({id:response.data.record.id,rev:response.data.record.rev});
    else assert.equal(response.status,404);
  }
  const checkpoints=[];
  const availableStages=new Set(outline.steps.map(step=>step.stageId));
  for(const stage of ['provider','code','return','personal-labels']){
    if(!availableStages.has(stage))continue;
    const context=await ok(c.request('/api/learning-context',{
      scope:'target',target:{kind:'journey-stage',journeyId:id('project'),stageId:stage},profile:'tutor',limit:10
    }));
    if(context.resume)checkpoints.push(context.resume.source.id);
    for(const item of context.priorCheckpoints??[])checkpoints.push(item.id);
  }
  assert.equal(outline.project.id,project.record.id);
  const requested=await c.context('article',id('requested-label-storage'));
  assert.ok([200,404].includes(requested.status));
  return {
    state:session.completed.at(-1),authoredScenarioDate:manifest.states.find(item=>item.id===session.completed.at(-1))?.date,project:{id:project.record.id,rev:project.record.rev},
    questionIds:[...new Set([...outline.projectQuestions,...outline.steps.flatMap(step=>step.questions)].map(q=>q.id))].sort(),
    steps:outline.steps.map(step=>step.stageId),notes,checkpointIds:[...new Set(checkpoints)].sort(),
    requestedArticle:requested.status===200?{id:requested.data.record.id,rev:requested.data.record.rev}:null
  };
}
export async function replay(state='F'){
  assert.ok(states.includes(state),'Unknown scenario state');
  const session=await seed();
  try{
    let snapshot;
    for(const next of states){snapshot=await advance(session,next);if(next===state)break;}
    return {session,snapshot};
  }catch(error){await session.fixture.dispose();throw error;}
}
/** Reset is disposal and fresh logical reconstruction; there is no DELETE against owner data. */
export async function reset(session,state='A'){
  await session.fixture.dispose();
  return replay(state);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const requested=process.argv[2]??'F';
  if(requested==='reset'){
    const original=await replay('F');
    const before=original.snapshot;
    const restarted=await reset(original.session,'F');
    try{
      assert.deepEqual(restarted.snapshot,before);
      console.log(JSON.stringify({fixture:'synthetic-only',operation:'dispose + deterministic replay',resetVerified:true,snapshot:restarted.snapshot},null,2));
    }finally{await restarted.session.fixture.dispose();}
  }else{
    const {session,snapshot}=await replay(requested);
    try{
      console.log(JSON.stringify({fixture:'synthetic-only',runtime:'local Miniflare D1/R2',snapshot},null,2));
    }finally{await session.fixture.dispose();}
  }
}
