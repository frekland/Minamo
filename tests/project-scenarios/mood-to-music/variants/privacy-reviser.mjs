/** TEST ONLY: privacy-led interface reviser, distinct fictional F–K trajectory.
 * Opt-in local Miniflare replay only. No hosted controller registration.
 */
import {manifest} from '../seed.mjs';
import {replayOverlay} from './replay-overlay.mjs';

export const privacyVariant=Object.freeze({
  scenarioId:'mood-to-music',baseFixtureVersion:'mood-to-music/3',
  personaVariant:'privacy-led-interface-reviser',overlayVersion:1,
  phases:['F','G','H','I','J','K'],
  provenance:'Fictional User reports, pinned local React source and uncertain manual browser observations.',
  scope:'Disposable local Miniflare only; no Site data or hosted persona selector.'
});
export function privacyPrefix(epoch=1){
  if(!Number.isSafeInteger(epoch)||epoch<1||epoch>999999)throw Error('Invalid privacy epoch');
  return 'TEST-ONLY-m2m-privacy-v1-r'+epoch;
}
const learningScope={version:1,spaces:['computing'],provenance:'authored'};
async function ok(promise){
  const r=await promise;
  if(r.status!==200)throw Error('Synthetic domain failure '+r.status+': '+JSON.stringify(r.data));
  return r.data;
}
function sourcePin(version){
  const artifact=manifest.artifacts.find(item=>item.version===version);
  if(!artifact)throw Error('Missing canonical source revision');
  return 'LOCAL SOURCE POINTER, NOT A BROWSER EXECUTION: '+artifact.path+'\nPINNED SHA-256: '+artifact.sha256;
}
export async function applyPrivacyPhase(c,phase,prefix=privacyPrefix()){
  if(!privacyVariant.phases.includes(phase))throw Error('Unknown privacy phase');
  c.scenarioPhase=phase;
  const id=leaf=>prefix+'-'+leaf;
  const read=async(family,leaf)=>(await ok(c.context(family,id(leaf)))).record;
  const write=(leaf,command)=>ok(c.command({operationId:id(leaf),...command}));
  const create=async(family,leaf,data)=>(await write('create-'+leaf,{
    action:'create',family,id:id(leaf),data:{...data,synthetic:true}
  })).record;
  const update=async(family,leaf,data)=>{
    const prior=await read(family,leaf);
    return (await write('update-'+leaf+'-'+phase,{
      action:'update',family,id:prior.id,expectedRev:prior.rev,data
    })).record;
  };
  const questionLink=q=>({family:'investigation',id:q.id,relation:'related'});
  const projectLink=p=>({family:'journey',id:p.id,rendition:p.rendition,sectionId:'personal-labels'});
  const articleLink=a=>({family:'article',id:a.id,rendition:a.rendition,sectionId:'rights',partId:'p',relation:'supports'});
  if(phase==='F'){
    const project=await read('journey','project'),reference=await read('article','reference');
    const q=await create('investigation','question-consent',{
      title:'TEST ONLY Should the demo remember my labels?',
      body:'FICTIONAL USER: I want a simple demo and do not yet know whether browser refresh discards labels.',
      learningScope,learningShape:{version:2,kind:'investigation',
        question:'Do labels survive refresh, and should shared-browser memory be opt-in?'},
      links:[projectLink(project),articleLink(reference)]
    });
    await create('note','note-privacy-assumption',{
      title:'TEST ONLY Labels staying visible is not persistence proof',learningScope,
      body:'FICTIONAL USER, 28 October: I switched moods twice and the labels were still there. I initially wrote "saved" in my notebook, but I have NOT refreshed or inspected localStorage. This is a prediction about behaviour, not evidence that anything persisted.\n'+sourcePin('v5'),
      links:[questionLink(q),projectLink(project),articleLink(reference)]
    });
    await update('journey','project',{links:[...project.links,{
      family:'investigation',id:q.id,sourceContext:{stageId:'personal-labels'}
    }]});
  }else if(phase==='G'){
    const reference=await read('article','reference');
    const part=reference.sections.find(s=>s.id==='rights')?.parts.find(p=>p.id==='p');
    const quote='account and time',start=part?.text?.indexOf(quote)??-1;
    if(start<0)throw Error('Cannot anchor privacy reminder to an exact source rendition');
    await create('annotation','annotation-privacy-rights',{
      title:'TEST ONLY privacy reminder',body:'Shared-browser consent is a separate decision.',
      learningScope,anchor:{articleId:reference.id,recordFamily:'article',
        rendition:reference.rendition,sectionId:'rights',partId:'p',
        start,end:start+quote.length,quote}
    });
  }else if(phase==='H'){
    const q=await read('investigation','question-consent');
    await update('note','note-privacy-assumption',{
      body:'FICTIONAL USER CORRECTION, 4 November: I report a manual v5 refresh that removed the labels. I did not save a screen recording, browser version or execution log. A matching source file is independently inspectable, but it does not prove my reported run. v6 adds automatic localStorage; whether that is desirable is another question.\n'+sourcePin('v6')
    });
    await update('investigation','question-consent',{learningShape:{...q.learningShape,
      question:'What exactly does v6 store, and would automatically retaining labels be appropriate on a shared browser?'}});
  }else if(phase==='I'){
    const q=await read('investigation','question-consent');
    await create('note','note-shared-browser',{
      title:'TEST ONLY Shared device changes the requirement',learningScope,
      body:'FICTIONAL USER, 9 November: I use a shared family browser. After seeing v6 automatic persistence in source, I changed my preference: do not remember my labels unless I explicitly choose it. This is a product and consent decision, not evidence of an exploit or a completed browser privacy test.',
      links:[questionLink(q)]
    });
  }else if(phase==='J'){
    const project=await read('journey','project'),q=await read('investigation','question-consent');
    const updatedProject=await update('journey','project',{
      body:'Current synthetic scope: personally meaningful labels remain temporary by default. An explicit Remember action and clear behaviour may be offered; preserve earlier v5/v6 reasoning and unresolved observed-runtime checks. No provider or privacy certification is asserted.'
    });
    await update('investigation','question-consent',{learningShape:{...q.learningShape,
      question:'Does v7 really clear remembered labels when consent is disabled and the page is reloaded?'}});
    await create('note','note-opt-in-design',{
      title:'TEST ONLY Opt-in is the proposed interface revision',learningScope,
      body:'FICTIONAL USER, 13 November: I changed the design to keep labels temporary until Remember is chosen. v7 source contains opt-in/clear code, but I have not yet supplied a complete browser retest or independently verified execution receipt. A small local smoke check is the next step.\n'+sourcePin('v7'),
      links:[questionLink(q),projectLink(updatedProject),{family:'note',id:id('note-shared-browser'),relation:'related'}]
    });
  }else if(phase==='K'){
    await update('note','note-privacy-assumption',{
      body:'FICTIONAL USER RETURN, 23 November: After ten days I almost said labels had always been saved. Original revision 1 shows that I only switched moods, revision 2 reports a v5 refresh loss, and later Notes explain my v6-to-v7 privacy choice. I still need a timestamped v7 disable/clear/reload test. Preserve the false inference as history.'
    });
    await create('note','note-next-check',{
      title:'TEST ONLY Return — no inferred consent',learningScope,
      body:'FICTIONAL USER, 23 November: Find the precise source edition and help me plan one manual privacy check. Do not mark consent or safety as verified, and do not publish a checkpoint unless I explicitly request one.',
      links:[{family:'note',id:id('note-privacy-assumption'),relation:'related'}]
    });
  }
}
export async function replayPrivacy(target='K',{epoch=1,owner='TEST-ONLY-m2m-privacy-principal'}={}){
  return replayOverlay(target,{epoch,owner,prefixForEpoch:privacyPrefix,
    phases:privacyVariant.phases,applyPhase:applyPrivacyPhase,
    inspectLeaves:{notes:['note-privacy-assumption','note-shared-browser','note-opt-in-design','note-next-check'],
      question:'question-consent',annotation:'annotation-privacy-rights'}});
}
