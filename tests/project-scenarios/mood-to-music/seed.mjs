/** Versioned chronological seed through the real V2 HTTP/domain command contracts.
 * Every action is a fictional synthetic scenario, never evidence of an owner's work.
 */
import manifest from './manifest.json' with {type:'json'};
const id=key=>'TEST-ONLY-m2m-'+key;
const assert={
  equal:(actual,expected,message)=>{if(actual!==expected)throw Error(message??`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)},
  ok:(value,message)=>{if(!value)throw Error(message??'Expected a truthy value')}
};
const scope={version:1,spaces:['computing'],provenance:'authored'};
const plan={
  title:'TEST ONLY Mood-to-Music · evolving React investigation',
  body:'Synthetic engineering scenario: build a local mood-driven music companion, revise claims after research, and inspect actual source changes. No owner data or provider access.',
  learningScope:scope,synthetic:true,
  sections:[
    {id:'intent',title:'Intent and subjective mood',parts:[{id:'p',kind:'paragraph',text:'A mood label is a personal suggestion, not a measured property of an audio recording.'}]},
    {id:'provider',title:'Provider feasibility',parts:[{id:'p',kind:'paragraph',text:'Research availability and restrictions before promising OAuth, playback, recommendations or playlist saving.'}]},
    {id:'code',title:'Build and revise code',parts:[{id:'p',kind:'paragraph',text:'Versioned local React source demonstrates controls, asynchronous state and corrected request identity.'}]},
    {id:'return',title:'Return and revise objective',parts:[{id:'p',kind:'paragraph',text:'Preserve abandoned hypotheses and distinguish tested fixture behaviour from future features.'}]},
  ],
  learningShape:{version:1,kind:'journey',stages:[
    {id:'intent',sectionId:'intent',title:'Define subjective suggestions',intent:'Start with a falsifiable product question.'},
    {id:'provider',sectionId:'provider',title:'Check provider capabilities',intent:'Keep an offline adapter until current capabilities are verified.'},
    {id:'code',sectionId:'code',title:'Iterate React implementation',intent:'Compare five runnable source revisions.'},
    {id:'return',sectionId:'return',title:'Reflect and continue',intent:'Identify current direction and unresolved work.'},
  ]}
};
const article={
  title:'TEST ONLY · Mood, provider and async evidence boundaries',
  body:'A fictional locally authored technical reference, not third-party or licensed source material.',
  learningScope:scope,synthetic:true,
  sections:[
    {id:'rights',title:'Source uncertainty',parts:[{id:'p',kind:'paragraph',text:'Source access varies by account and time. An offline mock is the default until capability is independently verified.'}]},
    {id:'async',title:'Response order',parts:[{id:'p',kind:'paragraph',text:'Completion order is not intent order. Preserve the active request identity before applying asynchronous results.'}]},
    {id:'personal',title:'Personal labels',parts:[{id:'p',kind:'paragraph',text:'Listeners differ in emotional response. A personal label is not a verified objective audio feature.'}]},
  ]
};
const ok=async promise=>{const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
/** Reuse the same fixture in a bounded run-specific synthetic namespace. */
export function scenarioForPrefix(prefix='TEST-ONLY-m2m'){
// The opt-in weekend namespace is local-replay-only. The hosted controller
// still constructs only TEST-ONLY-m2m-rN and never accepts a persona selector.
if(!/^TEST-ONLY-m2m(?:-r[1-9][0-9]{0,5}|-(?:weekend|docs|privacy)-v1-r[1-9][0-9]{0,5})?$/.test(prefix))throw Error('Unrecognised synthetic scenario namespace');
const id=key=>prefix+'-'+key;
async function create(c,family,leaf,data){
  const operationId=id('create-'+leaf);
  if(await c.operation?.(operationId))return (await ok(c.context(family,id(leaf)))).record;
  const record=(await ok(c.command({operationId,action:'create',family,id:id(leaf),data:{...data,synthetic:true}}))).record;
  assert.equal(record.id,id(leaf));return record;
}
async function update(c,family,leaf,data){
  const operationId=id('update-'+leaf+'-'+c.scenarioPhase);
  if(await c.operation?.(operationId))return (await ok(c.context(family,id(leaf)))).record;
  const old=(await ok(c.context(family,id(leaf)))).record;
  return (await ok(c.command({operationId,action:'update',family,id:old.id,expectedRev:old.rev,data}))).record;
}
async function note(c,leaf,title,body,links){
  return create(c,'note',leaf,{title,body,links,learningScope:scope});
}
async function checkpoint(c,leaf,stage,development,noteRefs=[]){
  if(await c.operation?.(id(leaf)))return;
  const project=(await ok(c.context('journey',id('project')))).record;
  return ok(c.request('/api/learning-developments',{
    intent:'explicit-user-checkpoint',operationId:id(leaf),expectedGeneration:c.generation,
    target:{kind:'journey-stage',journeyId:project.id,stageId:stage},expectedTargetRev:project.rev,
    development:{...development,noteRefs:noteRefs.map(record=>({id:record.id,rev:record.rev,purpose:'Synthetic scripted evidence; exact Note edition'}))}
  }));
}
const question=(title,question,links)=>({title,body:'TEST ONLY synthetic discussion thread, open to revision.',learningShape:{version:2,kind:'investigation',question},links,learningScope:scope});
const projectLink=(project,sectionId)=>({family:'journey',id:project.id,rendition:project.rendition,sectionId});
const articleLink=(reference,sectionId,partId='p')=>({family:'article',id:reference.id,rendition:reference.rendition,sectionId,partId,relation:'supports'});
const noteLink=(question)=>({family:'investigation',id:question.id,relation:'related'});
const sourcePointer=version=>{
  const artifact=manifest.artifacts.find(item=>item.version===version);
  assert.ok(artifact,'Unknown source revision '+version);
  return `\nSOURCE EVIDENCE: ${artifact.path}\nPINNED SHA-256: ${artifact.sha256}\nProvenance: synthetic runnable source; execution claims require separate test receipts.`;
};
const anchored=(reference,sectionId,quote)=>{
  const part=reference.sections.find(section=>section.id===sectionId)?.parts.find(part=>part.id==='p');
  const start=part?.text?.indexOf(quote)??-1;
  assert.ok(start>=0,`The canonical ${sectionId} passage no longer contains ${quote}`);
  return {articleId:reference.id,recordFamily:'article',rendition:reference.rendition,
    sectionId,partId:'p',start,end:start+quote.length,quote};
};
async function quickReminder(c,reference,leaf,sectionId,quote,body){
  assert.ok(body.length<=100,'A User annotation is a short passage reminder, not a Note');
  return create(c,'annotation',leaf,{title:'TEST ONLY quick User reminder',body,
    anchor:anchored(reference,sectionId,quote),learningScope:scope});
}
async function flagPassage(c,reference,leaf,sectionId,quote){
  const operationId=id('flag-'+leaf);
  if(await c.operation?.(operationId))return;
  return ok(c.command({operationId,action:'setFlag',target:{kind:'passage',anchor:anchored(reference,sectionId,quote)},
    active:true,expectedTargetRev:0}));
}

async function applyState(c,state){
  c.scenarioPhase=state;
  if(state==='A'){
    const project=await create(c,'journey','project',plan);
    const reference=await create(c,'article','reference',article);
    const match=await create(c,'investigation','question-match',question('TEST ONLY Are moods objective?','What would a title or tag prove about how someone feels?',[projectLink(project,'intent'),articleLink(reference,'personal')]));
    const provider=await create(c,'investigation','question-provider',question('TEST ONLY Can the provider support this?','Which API capabilities and access rights are actually available?',[projectLink(project,'provider'),articleLink(reference,'rights')]));
    const race=await create(c,'investigation','question-race',question('TEST ONLY What if selection changes quickly?','How does a UI avoid showing stale asynchronous results?',[projectLink(project,'code'),articleLink(reference,'async')]));
    await update(c,'journey','project',{links:[{family:'investigation',id:match.id,sourceContext:{stageId:'intent'}},{family:'investigation',id:provider.id,sourceContext:{stageId:'provider'}},{family:'investigation',id:race.id,sourceContext:{stageId:'code'}},{family:'article',id:reference.id,relation:'supports',sourceContext:{stageId:'provider'}}]});
  } else if(state==='B'){
    const provider=(await ok(c.context('investigation',id('question-provider')))).record;
    const research=await note(c,'note-research','TEST ONLY provider study — hypothetical discussion',
      'SCRIPTED GPT: Could we depend on audio features?\nSCRIPTED LEARNER: I assumed so.\nSCRIPTED GPT: That access is unverified; no provider call was made. Keep an adapter and use fictional tracks.\nDECISION provisional: offline fallback. ABANDONED: make unrestricted API access a prerequisite.',[noteLink(provider)]);
    await update(c,'investigation','question-provider',{learningShape:{...provider.learningShape,question:'Which current provider capabilities must be checked before promising OAuth, playback or playlists?'}});
    await checkpoint(c,'save-b','provider',{summary:'Synthetic planning update: treat external audio-feature availability as unresolved, use mocked source.',facts:[{role:'correction',text:'An API name is not proof that a new application can access it.',basis:'illustrative'}],decisions:[{choice:'Use an offline catalogue adapter first.',reason:'Access rights and product restrictions are not verified.',status:'provisional',basis:'illustrative'}],nextAction:'Build a local React card and keyboard-usable mood control.'},[research]);
  } else if(state==='C'){
    const match=(await ok(c.context('investigation',id('question-match')))).record;
    const first=await note(c,'note-v1','TEST ONLY source v1 — static cards','SCRIPTED ENGINEERING: Created examples/mood-to-music/src/versions/v1.jsx, using fictional records. Static cards render but there is no mood interaction. This is a source pointer, not a claim that the owner wrote or ran it.'+sourcePointer('v1'),[noteLink(match),projectLink((await ok(c.context('journey',id('project')))).record,'code')]);
    const second=await note(c,'note-v2','TEST ONLY source v2 — selectable cards','SCRIPTED ENGINEERING: v2.jsx adds native mood buttons, aria-pressed and array filtering. The card contents remain local and unmeasured. Compare v1.jsx and v2.jsx; browser verification is separately reported in the PR.'+sourcePointer('v2'),[noteLink(match),projectLink((await ok(c.context('journey',id('project')))).record,'code')]);
    await checkpoint(c,'save-c','code',{summary:'Synthetic code update: local React mock cards evolved into a keyboard-operable mood selector.',decisions:[{choice:'Use deterministic local tracks for UI development.',reason:'Separates interaction bugs from volatile external capabilities.',basis:'illustrative',status:'established'}],nextAction:'Exercise two overlapping async requests and record their ordering.'},[first,second]);
  } else if(state==='D'){
    const race=(await ok(c.context('investigation',id('question-race')))).record;
    const reference=(await ok(c.context('article',id('reference')))).record;
    const bad=await note(c,'note-race','TEST ONLY source v3 — stale response fault','SCRIPTED ENGINEERING: v3.jsx allows a delayed calm result to overwrite the visible energetic choice. Repro schedule: choose calm, then energetic; resolve energetic before calm. The automated controller test reproduces this defect when actually run.'+sourcePointer('v3'),[noteLink(race),articleLink(reference,'async')]);
    const guard=await note(c,'note-guard','TEST ONLY source v4 — identity guard','SCRIPTED ENGINEERING: v4.jsx keeps a monotonically increasing request identity. Only the current request can publish ready, empty or error. Previous v3 fault remains visible for comparison; fix assertions are in revisions.test.mjs.'+sourcePointer('v4'),[noteLink(race),{family:'note',id:bad.id,relation:'contrasts'}]);
    await update(c,'investigation','question-race',{learningShape:{...race.learningShape,question:'What happens when an older response arrives after a new selection, including an old rejection?'}});
    const anchor={articleId:reference.id,recordFamily:'article',rendition:reference.rendition,sectionId:'async',partId:'p',start:0,end:16,quote:'Completion order'};
    await create(c,'annotation','annotation-order',{title:'TEST ONLY race annotation',body:'SCRIPTED NOTE: this source line explains why timing alone is not identity; it is not an instruction to GPT.',anchor,links:[noteLink(race)]});
    await ok(c.command({operationId:id('flag-async'),action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0}));
    await checkpoint(c,'save-d','code',{summary:'Synthetic debugging update: intentionally recreated stale-response defect in v3 and corrected it in v4.',facts:[{role:'correction',text:'The last response to resolve need not correspond to the latest selected mood.',basis:'illustrative'}],decisions:[{choice:'Guard writes by current request identity.',reason:'A delayed success or rejection must not overwrite newer intent.',basis:'illustrative',status:'established'}],nextAction:'Revisit the purpose of mood matching and retain prior code and limitations.'},[bad,guard]);
  } else if(state==='E'){
    // The opening four-stage plan is *actually revised*, rather than simply
    // describing a pivot in a Note while retaining a predetermined outline.
    if(!(await c.operation?.(id('update-project-E')))){
      const former=(await ok(c.context('journey',id('project')))).record;
      assert.equal(former.learningShape.stages.length,4);
      const oldReturn=former.learningShape.stages.find(step=>step.id==='return');
      assert.ok(oldReturn);
      await update(c,'journey','project',{
        body:'Revised Project direction: retain mock UI and debugging evidence, abandon objective mood scoring, and explore personal labels. Provider integration remains conditional on verified access.',
        sections:[...former.sections,{id:'personal-labels',title:'New direction: personally meaningful labels',parts:[{id:'p',kind:'paragraph',text:'The original plan did not include this work. Compare local listener labels without suggesting an objective emotional score.'}]}],
        learningShape:{...former.learningShape,stages:[...former.learningShape.stages.filter(step=>step.id!=='return'),{id:'personal-labels',sectionId:'personal-labels',title:'Develop personal labels',intent:'Explore an emergent, user-chosen direction while keeping the earlier Project history.'},oldReturn]}
      });
    }
    const match=(await ok(c.context('investigation',id('question-match')))).record;
    const pivot=await note(c,'note-pivot','TEST ONLY v5 — personally labelled favourites','SCRIPTED GPT: Is automatic emotional scoring still the point?\nSCRIPTED LEARNER: Prefer personal labels and honest suggestions.\nSCRIPTED GPT: Keep earlier API and race research; mark objective scoring abandoned, not erased.\nSOURCE v5.jsx adds immutable labels in tab memory; no persistence, Spotify save or audio scoring.'+sourcePointer('v5'),[noteLink(match),projectLink((await ok(c.context('journey',id('project')))).record,'personal-labels')]);
    await update(c,'investigation','question-match',{learningShape:{...match.learningShape,question:'How can personal, reversible mood labels help without claiming an objective emotional score?'}});
    await update(c,'note','note-research',{body:'SCRIPTED CORRECTION: earlier feasibility assumptions remain unverified; this is a revised Note edition. The Stage B checkpoint must still reference the original edition.'});
    const unknown=await note(c,'note-unknown','TEST ONLY unverified playlist capability','SCRIPTED CLAIM: perhaps saving a playlist could work. No credential, executed request, log, documentation receipt or implementation accompanies this claim.',[noteLink((await ok(c.context('investigation',id('question-provider')))).record)]);
    await checkpoint(c,'save-e','personal-labels',{summary:'Synthetic change of direction: prefer local personally labelled favourites; old objective-scoring proposal is abandoned.',facts:[{role:'interpretation',text:'Personal mood labels are subjective and may evolve with the listener.',basis:'illustrative'},{role:'open-question',text:'Could an appropriately authorised provider adapter support save/playback?',basis:'provisional'}],decisions:[{choice:'Do not build an objective emotional scoring feature.',reason:'The subjective feedback use case is more honest, and API feasibility is unverified.',basis:'illustrative',status:'established'}],nextAction:'Decide whether labels should persist locally, and verify external capabilities with dated source evidence.'},[pivot,unknown]);
    await create(c,'investigation','unrelated-garden',{title:'TEST ONLY garden journal',body:'UNRELATED_PRIVATE_GARDEN_SENTINEL; same owner but separate investigation',learningShape:{version:2,kind:'investigation',question:'Which seedlings need water?'}});
  } else if(state==='F'){
    // Version 2 continuation: the accepted A–E chronology remains unchanged.
    // Crucially, there is NO generated Library answer or conversational
    // correction in this starting state. Those are requested during tests.
    const project=(await ok(c.context('journey',id('project')))).record;
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=await create(c,'investigation','question-storage',question(
      'TEST ONLY Do personal labels survive refresh?',
      'I saw labels survive switching moods, but I have not checked a page refresh. Does this imply storage? What would changing that mean for a shared device?',
      [projectLink(project,'personal-labels'),articleLink(reference,'personal')]));
    await note(c,'note-return','TEST ONLY return after an interruption — fictional User Note',
      'FICTIONAL USER NOTE (written before a new GPT conversation): Back to this after a few days. I switched calm → energetic → calm and my labels were still there. I think that means they persist, but I have NOT refreshed the page. I might be mixing up React state and browser storage. I want to keep the demo simple for now. The current Library explanation looks a bit thin; at some point I would like to request a proper worked reference about labels, refresh and privacy. This Note is context, not permission for GPT to publish anything.',
      [noteLink(storage),projectLink(project,'personal-labels'),articleLink(reference,'personal')]);
    await create(c,'note','note-terminal',{
      title:'TEST ONLY supplied terminal capture — build claim is not verified',
      learningScope:scope,links:[noteLink(storage),projectLink(project,'code')],
      noteContent:[
        {kind:'markdown',text:'FICTIONAL USER: I copied this from my last attempt, but I did not save the full logs or a source commit. Prediction: the app should build. This supplied text alone does not prove an independent execution.'},
        {kind:'terminal',id:'build-snippet',label:'Partial local output (fictional)',environment:'Fictional laptop / local Vite app',command:'pnpm exec vite build --config examples/mood-to-music/vite.config.mjs',output:'TEST ONLY / SUPPLIED EXCERPT\n✓ built in 0.6s\nExit status reported by User: 0\nNo timestamp, complete log or independently verified commit recorded.'},
        {kind:'markdown',text:'Observation (reported): the partial output looked successful. A possible source file is https://github.com/frekland/Minamo/blob/395e44505d8686153ec0a44b4cb224e7e405d513/examples/mood-to-music/src/versions/v5.jsx — that immutable public file can be checked independently, but I did not record whether my alleged build used that checkout. Uncertainty: which exact code produced the output and whether refresh removes my labels.'}
      ]
    });
    await update(c,'journey','project',{links:[...project.links,{family:'investigation',id:storage.id,sourceContext:{stageId:'personal-labels'}}]});
  } else if(state==='G'){
    // Only fictional User actions are injected between GPT conversations;
    // no GPT-authored Library output, checkpoint or Question response is faked.
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=(await ok(c.context('investigation',id('question-storage')))).record;
    await note(c,'note-reading','TEST ONLY User thinking aloud after reading',
      'FICTIONAL USER NOTE: I read the old reference and may have a new Library explanation from GPT, but I still need to try the refresh experiment. I marked two passages for later because I cannot yet tell where the labels are held. Prediction: mood switching should not clear them, but a reload might. This is my question, not a verified result.',
      [noteLink(storage),articleLink(reference,'personal')]);
    await note(c,'note-plan','TEST ONLY User scratch plan for a small experiment',
      'FICTIONAL USER NOTE: Plan to add a label, switch calm → energetic → calm, then refresh. I want to inspect localStorage in the browser developer tools as well, without assuming it is used. I may ask GPT about the difference between render, remount and refresh later.',
      [noteLink(storage)]);
    await quickReminder(c,reference,'annotation-g-personal','personal','A personal label','Does this live only in React state?');
    await quickReminder(c,reference,'annotation-g-rights','rights','Source access','Check this before using the API.');
    await flagPassage(c,reference,'g-personal','personal','Listeners differ');
  } else if(state==='H'){
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=(await ok(c.context('investigation',id('question-storage')))).record;
    await create(c,'note','note-refresh-test',{
      title:'TEST ONLY User-reported refresh experiment — v5',learningScope:scope,
      links:[noteLink(storage),articleLink(reference,'personal')],
      noteContent:[
        {kind:'markdown',text:'FICTIONAL USER: My prediction was that labels might survive a reload. I typed a label in the v5 page, changed moods and returned; it stayed visible. Then I refreshed and it disappeared. These are my reported observations, not a browser test that Minamo or GPT independently ran. I now suspect component state rather than browser storage.'},
        {kind:'terminal',id:'refresh-supplied',label:'User typed observation, not an execution log',environment:'Fictional browser / local page',command:'manual: switch moods, then refresh',output:'Reported: label visible after mood switch\nReported: label gone after refresh\nNo captured browser trace or test-run receipt.'}
      ]
    });
    await note(c,'note-v6','TEST ONLY User source experiment — automatic local persistence',
      'FICTIONAL USER NOTE: I tried adding localStorage to the mock React version so my labels survive reload. The runnable v6 source exists in the public fixture, but this Note does not claim I committed it to a particular Git SHA or proved it worked. I need to check whether storage can be disabled and what might happen on a shared computer.'+sourcePointer('v6'),
      [noteLink(storage),projectLink((await ok(c.context('journey',id('project')))).record,'code')]);
    await quickReminder(c,reference,'annotation-h-personal','personal','objective audio feature','Not the same as persistence.');
    await quickReminder(c,reference,'annotation-h-async','async','request identity','Does refresh restart this too?');
    await flagPassage(c,reference,'h-rights','rights','An offline mock');
  } else if(state==='I'){
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=(await ok(c.context('investigation',id('question-storage')))).record;
    await note(c,'note-shared-device','TEST ONLY User reconsideration — shared browser',
      'FICTIONAL USER NOTE: I wanted labels to stick, then realised I sometimes use a shared family laptop. Automatically keeping personal preferences on that browser might surprise someone. I now prefer the default to be temporary, with a deliberate choice if I ever save locally. This is a design preference, not proof that storage is unsafe in every context.',
      [noteLink(storage),articleLink(reference,'rights')]);
    await note(c,'note-check','TEST ONLY User questions after interrupted testing',
      'FICTIONAL USER NOTE: Which revision am I actually running? I can see a v6 file but my last copied terminal output had no commit or timestamp. Small snippet to inspect later: `localStorage.getItem("TEST-ONLY-m2m-personal-labels-v1")`. I want GPT to distinguish code visible in the repository, browser results I reported, and actual tests that were executed. Also, I still need to check an old Flag about response order; that may be a separate problem.',
      [noteLink(storage),articleLink(reference,'async')]);
    await quickReminder(c,reference,'annotation-i-rights','rights','account and time','Would this matter on our shared laptop?');
    await flagPassage(c,reference,'i-async','async','intent order');
  } else if(state==='J'){
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=(await ok(c.context('investigation',id('question-storage')))).record;
    await note(c,'note-v7','TEST ONLY User source revision — opt-in persistence',
      'FICTIONAL USER NOTE: I changed the mock app again. v7 uses temporary labels unless the user selects Remember labels on this browser; turning it off clears saved labels. I wrote this because of the shared-device concern, not because GPT assessed my understanding. There is runnable source and a separate engineering test, but this paragraph alone is not a historical Git commit or an independent execution receipt.'+sourcePointer('v7'),
      [noteLink(storage),projectLink((await ok(c.context('journey',id('project')))).record,'code')]);
    await create(c,'note','note-retest',{
      title:'TEST ONLY User retest log — reported, incomplete',learningScope:scope,
      links:[noteLink(storage),articleLink(reference,'personal')],
      noteContent:[
        {kind:'markdown',text:'FICTIONAL USER: I think the new opt-in control works, though I only copied the short output below. My next manual check is to disable remembering and reload, then compare with the actual source/tests. I do not want GPT to rewrite this Note.'},
        {kind:'terminal',id:'v7-test-supplied',label:'Partial supplied test output',environment:'Fictional local JavaScript workspace',command:'node --test examples/mood-to-music/tests/revisions.test.mjs',output:'Reported: tests passed\nNo complete log, exact checkout or timestamp supplied.'}
      ]
    });
    await quickReminder(c,reference,'annotation-j-personal','personal','Listeners differ','Default should be private.');
    await quickReminder(c,reference,'annotation-j-async','async','Completion order','Different issue; revisit later.');
    await flagPassage(c,reference,'j-personal','personal','A personal label');
  } else if(state==='K'){
    const reference=(await ok(c.context('article',id('reference')))).record;
    const storage=(await ok(c.context('investigation',id('question-storage')))).record;
    await note(c,'note-return-later','TEST ONLY User return after ten days',
      'FICTIONAL USER NOTE: Back after ten days. I remember trying two different ways to keep labels, but I have forgotten which version is current and whether I finished the privacy check. The Library material was useful, though I left several little Flags and reminders. I would like GPT to help me resume from what is actually recorded, one manageable challenge at a time.',
      [noteLink(storage),articleLink(reference,'personal')]);
    await note(c,'note-next','TEST ONLY User loose ends before another fresh chat',
      'FICTIONAL USER NOTE: The provider question is still open. Maybe playlist saving becomes possible later, but I have no valid OAuth/test receipt. More immediately, I should check what happens after disabling Remember labels and refreshing, and maybe clean up the flags that no longer matter.',
      [noteLink((await ok(c.context('investigation',id('question-provider')))).record),noteLink(storage)]);
    // A genuine second User-authored edition; an earlier linked checkpoint,
    // if present, must retain its original source revision.
    await update(c,'note','note-plan',{body:'FICTIONAL USER REVISED NOTE: My original plan to test refresh is complete only as a reported v5 observation. The newer v7 opt-in/disable behaviour still needs careful retesting. Keep the old wording available as an earlier edition.'});
    await quickReminder(c,reference,'annotation-k-rights','rights','An offline mock','Recheck provider docs some day.');
    await flagPassage(c,reference,'k-rights','rights','Source access');
  } else throw Error('Unknown state '+state);
}
return {applyState,id};
}
const applyState=(c,state)=>scenarioForPrefix().applyState(c,state);
export {manifest,id,ok};
export {applyState};
