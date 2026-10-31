/** TEST ONLY: distinct provider-documentation sceptic, shared canonical V3 A–E.
 * All F–K actions are fictional User records in local disposable D1/R2.
 */
import {manifest} from '../seed.mjs';
import {replayOverlay} from './replay-overlay.mjs';

export const docsVariant=Object.freeze({
  scenarioId:'mood-to-music',baseFixtureVersion:'mood-to-music/3',
  personaVariant:'provider-documentation-sceptic',overlayVersion:1,
  phases:['F','G','H','I','J','K'],
  provenance:'Fictional User notes, exact local source pointers and an unverified external documentation URL. No live provider call.',
  scope:'Local disposable Miniflare only; not registered in the hosted controller.'
});
export function docsPrefix(epoch=1){
  if(!Number.isSafeInteger(epoch)||epoch<1||epoch>999999)throw Error('Invalid documentation epoch');
  return `TEST-ONLY-m2m-docs-v1-r${epoch}`;
}
const learningScope={version:1,spaces:['computing'],provenance:'authored'};
const docsPointer='https://developer.spotify.com/documentation/web-api';
async function ok(promise){const r=await promise;if(r.status!==200)throw Error(`Synthetic domain failure ${r.status}: ${JSON.stringify(r.data)}`);return r.data;}
function sourcePin(version){
  const artifact=manifest.artifacts.find(item=>item.version===version);
  if(!artifact)throw Error('Source version missing from canonical fixture');
  return `LOCAL SOURCE POINTER, NOT EXECUTION: ${artifact.path}\nPINNED SHA-256: ${artifact.sha256}`;
}

export async function applyDocumentationPhase(c,phase,prefix=docsPrefix()){
  if(!docsVariant.phases.includes(phase))throw Error('Unknown documentation phase');
  c.scenarioPhase=phase;
  const id=leaf=>`${prefix}-${leaf}`;
  const read=async(family,leaf)=>(await ok(c.context(family,id(leaf)))).record;
  const write=(leaf,command)=>ok(c.command({operationId:id(leaf),...command}));
  const create=async(family,leaf,data)=>(await write('create-'+leaf,{action:'create',family,id:id(leaf),data:{...data,synthetic:true}})).record;
  const update=async(family,leaf,data)=>{
    const prior=await read(family,leaf);
    return (await write('update-'+leaf+'-'+phase,{action:'update',family,id:prior.id,expectedRev:prior.rev,data})).record;
  };
  const questionLink=q=>({family:'investigation',id:q.id,relation:'related'});
  const articleLink=a=>({family:'article',id:a.id,rendition:a.rendition,sectionId:'rights',partId:'p',relation:'supports'});
  const projectLink=p=>({family:'journey',id:p.id,rendition:p.rendition,sectionId:'provider'});

  if(phase==='F'){
    const question=await read('investigation','question-provider');
    const project=await read('journey','project'),reference=await read('article','reference');
    await update('investigation','question-provider',{learningShape:{...question.learningShape,
      question:'Which provider claims can I verify independently, and which require account-specific access or permission?'}});
    await create('note','note-docs-audit',{
      title:'TEST ONLY Provider claims — first assumption',learningScope,
      body:'FICTIONAL USER, 28 October: I found a public API documentation landing page and initially assumed that meant our app could use every endpoint. This is my assumption, not evidence of availability. I have no OAuth token, provider response, dated page snapshot or verified scope. I am keeping the offline example.\nUNVERIFIED WEB POINTER (not a captured source edition): '+docsPointer+'\n'+sourcePin('v5'),
      links:[questionLink(question),articleLink(reference),projectLink(project)]
    });
  }else if(phase==='G'){
    const question=await read('investigation','question-provider');
    const reference=await read('article','reference');
    const part=reference.sections.find(s=>s.id==='rights')?.parts.find(p=>p.id==='p');
    const quote='Source access',start=part?.text?.indexOf(quote)??-1;
    if(start<0)throw Error('Canonical source changed; do not guess anchor');
    await create('annotation','annotation-docs-rights',{
      title:'TEST ONLY source-rights reminder',learningScope,
      body:'Endpoint documented ≠ account authorised.',
      anchor:{articleId:reference.id,recordFamily:'article',rendition:reference.rendition,
        sectionId:'rights',partId:'p',start,end:start+quote.length,quote}
    });
    await create('note','note-docs-questions',{
      title:'TEST ONLY Three provider checks, none completed',learningScope,
      body:'FICTIONAL USER, 1 November: Separate (1) public endpoint description, (2) terms and feature eligibility for this client, and (3) an authorised test response for the intended scope. I have a URL for (1), not an archived document or an answer to (2) or (3). Next time I should check one narrow claim, not build a whole integration.',
      links:[questionLink(question),articleLink(reference)]
    });
  }else if(phase==='H'){
    const question=await read('investigation','question-provider');
    await update('note','note-docs-audit',{
      body:'FICTIONAL USER CORRECTION, 4 November: I confused a publicly described endpoint with permission to use it. I report skimming documentation, but captured neither page contents nor a response; my earlier assumption remains in Note revision 1. No provider capability is verified. For now the synthetic app should keep the offline adapter.\nUNVERIFIED WEB POINTER: '+docsPointer+'\n'+sourcePin('v5')
    });
    await update('investigation','question-provider',{learningShape:{...question.learningShape,
      question:'What exact client eligibility and permission evidence would justify an authorised small provider test?'}});
  }else if(phase==='I'){
    const question=await read('investigation','question-provider');
    await create('note','note-docs-consent',{
      title:'TEST ONLY Access is not consent',learningScope,
      body:'FICTIONAL USER, 9 November: Someone suggested copying an access token into a chat to test a scope. I declined: no credential should appear in a learner Note or shared transcript. Even if an endpoint were available, user consent and safe token handling would be separate requirements. This records a decision, not a successful security test.',
      links:[questionLink(question)]
    });
  }else if(phase==='J'){
    const project=await read('journey','project'),question=await read('investigation','question-provider');
    await update('investigation','question-provider',{learningShape:{...question.learningShape,
      question:'Can I document one permitted OAuth scope and verify one sandbox request without exposing credentials?'}});
    const updatedProject=await update('journey','project',{
      body:'After reviewing the provider assumption, keep the local personal-label prototype as current work. External playback, recommendations and saving remain contingent on dated documentation, eligibility, consent and a separately recorded authorised test. Preserve the earlier provider and race questions.'
    });
    await create('note','note-docs-boundary',{
      title:'TEST ONLY Decision — no external dependency yet',learningScope,
      body:'FICTIONAL USER, 13 November: I decided to leave OAuth and live provider calls out of the current mock. That is a provisional scope decision, not proof those features are impossible. v5 demonstrates only an offline personal-label direction; a local file existing does not prove my browser ran it.\n'+sourcePin('v5'),
      links:[questionLink(question),projectLink(updatedProject)]
    });
  }else if(phase==='K'){
    const question=await read('investigation','question-provider');
    await update('note','note-docs-audit',{
      body:'FICTIONAL USER REVISED RETURN, 23 November: After a ten-day gap I nearly repeated my original claim that public docs guarantee provider access. Earlier Note editions show why that was wrong. No dated documentation capture, eligibility approval, OAuth scope receipt or live test exists in my records. Keep the offline app; next time verify one narrow permission claim before coding a connection.'
    });
    await create('note','note-docs-return',{
      title:'TEST ONLY Return — source still unverified',learningScope,
      body:'FICTIONAL USER, 23 November: Please help me identify the current offline source and the earliest unsupported API assumption. I want one small evidence-gathering task, not a confident summary that implies we tested Spotify. Do not silently publish a GPT checkpoint from this request.',
      links:[questionLink(question),{family:'note',id:id('note-docs-audit'),relation:'related'}]
    });
  }
}

export async function replayDocumentation(target='K',{epoch=1,owner='TEST-ONLY-m2m-docs-principal'}={}){
  return replayOverlay(target,{epoch,owner,prefixForEpoch:docsPrefix,
    phases:docsVariant.phases,applyPhase:applyDocumentationPhase,
    inspectLeaves:{notes:['note-docs-audit','note-docs-questions','note-docs-consent','note-docs-boundary','note-docs-return'],
      question:'question-provider',annotation:'annotation-docs-rights'}});
}
