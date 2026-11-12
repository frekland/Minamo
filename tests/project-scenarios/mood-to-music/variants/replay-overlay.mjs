/** TEST ONLY: common disposable A–E plus a fictional persona's F–K replay.
 * The hosted controller/transcript/observer do not import this helper.
 */
import {manifest,scenarioForPrefix} from '../seed.mjs';

async function inspect(client,prefix,phase,{notes,question,annotation}){
  const id=leaf=>`${prefix}-${leaf}`;
  const project=await client.context('journey',id('project'));
  if(project.status!==200)throw Error('Missing canonical persona Project');
  const noteRevs=[];
  for(const leaf of notes){
    const r=await client.context('note',id(leaf));
    if(r.status===200)noteRevs.push({id:r.data.record.id,rev:r.data.record.rev});
    else if(r.status!==404)throw Error('Unexpected persona Note status '+r.status);
  }
  const q=await client.context('investigation',id(question));
  const a=await client.context('annotation',id(annotation));
  const generated=await client.context('article',id('requested-label-storage'));
  if(![200,404].includes(q.status)||![200,404].includes(a.status)||generated.status!==404)
    throw Error('Persona canonical readback / no-generated-answer boundary failed');
  return {phase,project:{id:project.data.record.id,rev:project.data.record.rev},notes:noteRevs,
    question:q.status===200?{id:q.data.record.id,rev:q.data.record.rev}:null,
    annotation:a.status===200?{id:a.data.record.id,rev:a.data.record.rev}:null,
    generatedArticleSeeded:false};
}

export async function replayOverlay(target,{epoch,owner,prefixForEpoch,phases,applyPhase,inspectLeaves}){
  if(!manifest.states.some(s=>s.id===target))throw Error('Unknown persona replay state');
  if(typeof owner!=='string'||!owner.startsWith('TEST-ONLY-'))throw Error('Only synthetic principals are accepted');
  const prefix=prefixForEpoch(epoch),base=scenarioForPrefix(prefix);
  // Only local replay loads the Node test fixture; hosted phase actions never do.
  const localFixturePath='../replay.mjs';
  const {seed}=await import(localFixturePath);
  const session=await seed({owner}),states=[];
  try{
    for(const phase of manifest.states.map(s=>s.id)){
      if(phases.includes(phase))await applyPhase(session.client,phase,prefix);
      else await base.applyState(session.client,phase);
      states.push(phase);
      if(phase===target)break;
    }
    return {session,prefix,states,snapshot:await inspect(session.client,prefix,target,inspectLeaves)};
  }catch(error){await session.fixture.dispose();throw error;}
}
