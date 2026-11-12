/** TEST ONLY: fictional weekend-prototyper F–K events on the unchanged V3 A–E
 * foundation. Uses canonical domain commands in disposable local D1/R2 only.
 */
import {manifest} from '../seed.mjs';
import {replayOverlay} from './replay-overlay.mjs';

export const weekendVariant=Object.freeze({
  scenarioId:'mood-to-music',baseFixtureVersion:'mood-to-music/3',
  personaVariant:'intermittent-weekend-prototyper',overlayVersion:1,
  phases:['F','G','H','I','J','K'],
  provenance:'Fictional User reports and source pins; no independent runtime result is seeded.',
  scope:'Disposable local replay and owner-only hosted TEST-ONLY scenario selection; no real learner history.'
});
export function weekendPrefix(epoch=1){
  if(!Number.isSafeInteger(epoch)||epoch<1||epoch>999999)throw Error('Invalid weekend epoch');
  return `TEST-ONLY-m2m-weekend-v1-r${epoch}`;
}
const learningScope={version:1,spaces:['computing'],provenance:'authored'};
async function ok(promise){const r=await promise;if(r.status!==200)throw Error(`Synthetic domain failure ${r.status}: ${JSON.stringify(r.data)}`);return r.data;}
function sourcePin(version){
  const item=manifest.artifacts.find(a=>a.version===version);
  if(!item)throw Error('Source revision not in canonical fixture');
  return `SOURCE POINTER (not execution): ${item.path}\nPINNED SHA-256: ${item.sha256}`;
}

export async function applyWeekendPhase(c,phase,prefix=weekendPrefix()){
  if(!weekendVariant.phases.includes(phase))throw Error('Unknown weekend phase');
  const id=leaf=>`${prefix}-${leaf}`;
  c.scenarioPhase=phase;
  const read=async(family,leaf)=>(await ok(c.context(family,id(leaf)))).record;
  const write=(leaf,command)=>ok(c.command({operationId:id(leaf),...command}));
  const create=async(family,leaf,data)=>{
    if(await c.operation?.(id('create-'+leaf)))return read(family,leaf);
    return (await write('create-'+leaf,{action:'create',family,id:id(leaf),data:{...data,synthetic:true}})).record;
  };
  const update=async(family,leaf,data)=>{
    if(await c.operation?.(id('update-'+leaf+'-'+phase)))return read(family,leaf);
    const prior=await read(family,leaf);
    return (await write('update-'+leaf+'-'+phase,{action:'update',family,id:prior.id,expectedRev:prior.rev,data})).record;
  };
  const projectLink=p=>({family:'journey',id:p.id,rendition:p.rendition,sectionId:'personal-labels'});
  const questionLink=q=>({family:'investigation',id:q.id,relation:'related'});
  const articleLink=a=>({family:'article',id:a.id,rendition:a.rendition,sectionId:'personal',partId:'p',relation:'supports'});

  if(phase==='F'){
    const project=await read('journey','project'),reference=await read('article','reference');
    const question=await create('investigation','question-storage',{
      title:'TEST ONLY Weekend question — will labels survive?',
      body:'FICTIONAL USER: I only have Saturdays to work on this; I have not tried a refresh.',
      learningScope,learningShape:{version:2,kind:'investigation',
        question:'Is switching moods the same as refreshing? What can I check in one short session?'},
      links:[projectLink(project),articleLink(reference)]
    });
    await create('note','note-weekend-log',{
      title:'TEST ONLY Weekend log — unfinished experiment',learningScope,
      body:'FICTIONAL USER NOTE, 28 October: I had 25 minutes after breakfast. I changed moods and labels stayed, but I did NOT refresh. I suspect persistence; it is still a prediction. No provider request or passing build was verified. Next Saturday: refresh and write down what disappears.\n'+sourcePin('v5'),
      links:[questionLink(question),projectLink(project),articleLink(reference)]
    });
    await update('journey','project',{links:[...project.links,
      {family:'investigation',id:question.id,sourceContext:{stageId:'personal-labels'}}]});
  }else if(phase==='G'){
    // A short reminder, not another forced long-form entry.
    const reference=await read('article','reference');
    const part=reference.sections.find(s=>s.id==='personal')?.parts.find(p=>p.id==='p');
    const quote='A personal label',start=part?.text?.indexOf(quote)??-1;
    if(start<0)throw Error('Source passage moved; no guessed anchor');
    await create('annotation','annotation-weekend-refresh',{
      title:'TEST ONLY weekend reminder',body:'Try reload next Saturday; switching is not proof.',learningScope,
      anchor:{articleId:reference.id,recordFamily:'article',rendition:reference.rendition,
        sectionId:'personal',partId:'p',start,end:start+quote.length,quote}
    });
  }else if(phase==='H'){
    await update('note','note-weekend-log',{
      body:'FICTIONAL USER REVISED NOTE, 4 November: Mood switching did not test persistence. I report that v5 lost a label after a refresh, but I saved no screenshot or execution log. The repository has v6 localStorage source; I have not shown my browser ran those bytes. Separate my report, source and a verified test.\n'+sourcePin('v6')
    });
  }else if(phase==='I'){
    const question=await read('investigation','question-storage');
    await create('note','note-weekend-privacy',{
      title:'TEST ONLY Weekend interruption — shared browser',learningScope,
      body:'FICTIONAL USER NOTE, 9 November: Missed my planned coding time. On a shared family laptop, retaining preferences automatically might be surprising. This is a design preference and an uncertainty, not proof of an exploit. No new browser trace.',
      links:[questionLink(question)]
    });
  }else if(phase==='J'){
    const question=await read('investigation','question-storage');
    await update('investigation','question-storage',{
      learningShape:{...question.learningShape,
        question:'Should labels be temporary by default, and how can I verify v7 Remember/clear behaviour?'}
    });
    await create('note','note-weekend-v7',{
      title:'TEST ONLY Weekend v7 — source seen, test open',learningScope,
      body:'FICTIONAL USER NOTE, 13 November: I found the v7 opt-in example after my shared-browser concern. Temporary labels seem preferable unless I choose Remember. I have NOT run the complete disable-and-refresh check or saved terminal output. The file existing does not establish execution.\n'+sourcePin('v7'),
      links:[questionLink(question),{family:'note',id:id('note-weekend-privacy'),relation:'related'}]
    });
  }else if(phase==='K'){
    await update('note','note-weekend-log',{
      body:'FICTIONAL USER REVISED NOTE, 23 November: After another gap, I remember thinking mood switches proved persistence, then reporting v5 refresh removed labels. I later preferred v7 opt-in for the shared browser, but still have no independent v7 clear-and-reload result. Next: identify exact source, predict the result, run one check and keep its receipt. Preserve my earlier Note editions.'
    });
  }
}

/** Replay the shared A–E foundation, then the actual variant-specific F–K events. */
export async function replayWeekend(target='K',{epoch=1,owner='TEST-ONLY-m2m-weekend-principal'}={}){
  return replayOverlay(target,{epoch,owner,prefixForEpoch:weekendPrefix,
    phases:weekendVariant.phases,applyPhase:applyWeekendPhase,
    inspectLeaves:{notes:['note-weekend-log','note-weekend-privacy','note-weekend-v7'],
      question:'question-storage',annotation:'annotation-weekend-refresh'}});
}
