/** Explicit, owner-only TEST-ONLY hosted selectors. A composite D1 scenario key
 * isolates each persona without changing the existing legacy Mood-to-Music row
 * or any historical transcript/observer receipt. No dynamic fixture import. */
import {manifest,scenarioForPrefix} from '../tests/project-scenarios/mood-to-music/seed.mjs';
import {weekendPrefix,applyWeekendPhase} from '../tests/project-scenarios/mood-to-music/variants/weekend-prototyper.mjs';
import {docsPrefix,applyDocumentationPhase} from '../tests/project-scenarios/mood-to-music/variants/documentation-sceptic.mjs';
import {privacyPrefix,applyPrivacyPhase} from '../tests/project-scenarios/mood-to-music/variants/privacy-reviser.mjs';
import {retiredCap} from '../tests/project-scenarios/retired-htb-cap/subject.mjs';
import {plantScreamer} from '../tests/project-scenarios/automatic-plant-screamer/subject.mjs';
import {subjectPrefix,applySubjectPhase} from '../tests/project-scenarios/shared/subject-replay.mjs';
import legacySessions from '../tests/project-scenarios/mood-to-music/session-cases.json';

export const HOSTED_PHASES=Object.freeze('ABCDEFGHIJK'.split(''));
export type HostedSelection={scenarioId:string;personaVariant?:string|null};
type FixtureClient={scenarioPhase:string;operation?:(id:string)=>Promise<boolean>;[key:string]:any};
export type HostedFixture={
  scenarioId:string;personaVariant:string|null;dbKey:string;fixtureVersion:string;
  sourceProvenance:string;sourceFiles:readonly {path:string;sha256:string}[];states:readonly string[];
  prefix:(epoch:number)=>string;apply:(c:FixtureClient,phase:string,epoch:number)=>Promise<void>;
  recordLeaves:readonly (readonly [string,string])[];checkpointLeaves:readonly string[];
  questions:readonly string[];notes:readonly string[];sessionPhases:readonly string[];
  legacy:boolean;
};
const baseLeaves:[string,string][]=[
  ...manifest.stableIds.annotations.map(id=>['annotation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.unrelatedQuestions.map(id=>['investigation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.notes.map(id=>['note',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.questions.map(id=>['investigation',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ...manifest.stableIds.requestedArticles.map(id=>['article',id.replace('TEST-ONLY-m2m-','')] as [string,string]),
  ['article','reference'],['journey','project']
];
const legacy:HostedFixture={
  scenarioId:'mood-to-music',personaVariant:null,dbKey:'mood-to-music',fixtureVersion:'mood-to-music/3',
  sourceProvenance:'canonical Mood-to-Music V3 pinned manifest; hosted source SHA from environment',
  sourceFiles:[{path:'tests/project-scenarios/mood-to-music/manifest.json',
    sha256:'080a58316bbd890d4640bae60f2374ecec6ace7968f111436c0ee80c78be5b23'},
    {path:'tests/project-scenarios/mood-to-music/seed.mjs',
      sha256:'bbf0ec873c555419f0c246590d120b106a305340fd416d88f9b558ffcfba0c5b'}],
  states:HOSTED_PHASES,legacy:true,prefix:epoch=>`TEST-ONLY-m2m-r${epoch}`,
  apply:async(c,phase,epoch)=>scenarioForPrefix(`TEST-ONLY-m2m-r${epoch}`).applyState(c,phase),
  recordLeaves:baseLeaves,checkpointLeaves:manifest.stableIds.checkpoints.map(id=>id.replace('TEST-ONLY-m2m-','')),
  questions:manifest.stableIds.questions.map(id=>id.replace('TEST-ONLY-m2m-','')),
  notes:manifest.stableIds.notes.map(id=>id.replace('TEST-ONLY-m2m-','')),
  sessionPhases:HOSTED_PHASES.slice(5)
};
const moodVariants=[
  {persona:'intermittent-weekend-prototyper',prefix:weekendPrefix,apply:applyWeekendPhase,
    path:'tests/project-scenarios/mood-to-music/variants/weekend-prototyper.mjs',
    sha256:'27e833ab910443ad4da039af4c3db056bc0691b98aa72da295229f03493271ef',
    extras:[['investigation','question-storage'],['note','note-weekend-log'],['annotation','annotation-weekend-refresh'],
      ['note','note-weekend-privacy'],['note','note-weekend-v7']]},
  {persona:'provider-documentation-sceptic',prefix:docsPrefix,apply:applyDocumentationPhase,
    path:'tests/project-scenarios/mood-to-music/variants/documentation-sceptic.mjs',
    sha256:'87e970a028ad1fbc3bbb3774899912a575182c08d1a030635d649d5c529267bb',
    extras:[['note','note-docs-audit'],['annotation','annotation-docs-rights'],['note','note-docs-questions'],
      ['note','note-docs-consent'],['note','note-docs-boundary'],['note','note-docs-return']]},
  {persona:'privacy-led-interface-reviser',prefix:privacyPrefix,apply:applyPrivacyPhase,
    path:'tests/project-scenarios/mood-to-music/variants/privacy-reviser.mjs',
    sha256:'82ecd181e563c20a7aef1c4ab47e10f6632566b45dd49bf7cedf22dff162facf',
    extras:[['investigation','question-consent'],['note','note-privacy-assumption'],['annotation','annotation-privacy-rights'],
      ['note','note-shared-browser'],['note','note-opt-in-design'],['note','note-next-check']]}
] as const;
const variants:HostedFixture[]=moodVariants.map(v=>({
  scenarioId:'mood-to-music',personaVariant:v.persona,dbKey:`mood-to-music#${v.persona}`,
  fixtureVersion:'mood-to-music/3',sourceProvenance:`Mood-to-Music V3 base and ${v.persona} version 1 overlay`,
  sourceFiles:[...legacy.sourceFiles,{path:v.path,sha256:v.sha256}],
  states:HOSTED_PHASES,legacy:false,prefix:v.prefix,
  apply:(c,phase,epoch)=>'ABCDE'.includes(phase)?
    scenarioForPrefix(v.prefix(epoch)).applyState(c,phase):v.apply(c,phase,v.prefix(epoch)),
  recordLeaves:[...baseLeaves,...v.extras] as [string,string][],
  checkpointLeaves:legacy.checkpointLeaves,questions:[...legacy.questions,...v.extras.filter(e=>e[0]==='investigation').map(e=>e[1])],
  notes:[...legacy.notes,...v.extras.filter(e=>e[0]==='note').map(e=>e[1])],
  sessionPhases:HOSTED_PHASES.slice(5)
}));
for(const [subject,personas] of [
  [retiredCap,[['command-log-investigator','command-log'],['packet-model-explainer','packet-model'],
    ['interrupted-sparse-recorder','sparse-return']]],
  [plantScreamer,[['breadboard-first-tinkerer','breadboard'],['careful-calibrator','calibrator'],
    ['shared-space-pragmatist','shared-space']]]
] as const){
  for(const [personaVariant,personaKey] of personas){
    const variant=(subject.personas as Record<string,{noteLeaves:string[];annotationLeaves?:string[]}>)[personaKey];
    const noteLeaves=[subject.foundation.B.note.leaf,subject.foundation.C.note.leaf,
      subject.foundation.D.note.leaf,subject.foundation.E.note.leaf,...variant.noteLeaves];
    const questionLeaves=subject.questions.map(q=>'question-'+q.id);
    const annotationLeaves=['annotation-foundation',...(variant.annotationLeaves??[])];
    variants.push({
      scenarioId:subject.baseFixtureVersion.split('/')[0],personaVariant,
      dbKey:`${subject.baseFixtureVersion.split('/')[0]}#${personaVariant}`,
      fixtureVersion:subject.baseFixtureVersion,sourceProvenance:`${subject.baseFixtureVersion} / ${personaKey} fictional source`,
      sourceFiles:[{path:'tests/project-scenarios/shared/subject-replay.mjs',
        sha256:'2436ad99ca346ff9d5df3802765d9c1a5349d2a89aaadd824c5c79b17840b384'},
      {path:subject===retiredCap?
        'tests/project-scenarios/retired-htb-cap/subject.mjs':
        'tests/project-scenarios/automatic-plant-screamer/subject.mjs',
        sha256:subject===retiredCap?
          '3ad961fe355b981515f7f3737d2e8985144404cf49d4b83c459070cc13781ca8':
          'fa155fbf34dbcda1c35568b16eefbbea0dad9788c724620c790dd8403c153096'},
      {path:`tests/project-scenarios/${subject===retiredCap?'retired-htb-cap':'automatic-plant-screamer'}/variants/${personaKey}.mjs`,
        sha256:({
          'command-log':'37059c10ae8ecae2fdb90f91e07ecc32eb3d5a790f2fd6994dd71650e2007bac',
          'packet-model':'bcd06b0a0320d0a28808d2123fb35007969ecdb78b16f3e653576b5448ab6b2b',
          'sparse-return':'4036b7f05ee5628d4e6a49f1527adc2cb21e56fb6b8c1b57076752021f7eae63',
          breadboard:'c15f88632aa730fa64857a0dd5aeed1eef6b7253422fb86aa9e85caf9e75f8f3',
          calibrator:'eb1d65dd2f4ed206d733ad31bb5c4d3cf79996e0ea583f388e68bce4b0f76ce0',
          'shared-space':'4777f05eac7d5e2218b15e400dc718107acf14f904a4529c07a96223955a5541'
        } as Record<string,string>)[personaKey]}],
      states:HOSTED_PHASES,legacy:false,prefix:epoch=>subjectPrefix(subject,personaKey,epoch),
      apply:(c,phase,epoch)=>applySubjectPhase(c,subject,personaKey,phase,{epoch}),
      recordLeaves:[['journey','project'],['article','reference'],
        ...noteLeaves.map(leaf=>['note',leaf] as [string,string]),
        ...questionLeaves.map(leaf=>['investigation',leaf] as [string,string]),
        ...annotationLeaves.map(leaf=>['annotation',leaf] as [string,string])],
      checkpointLeaves:[],questions:questionLeaves,notes:noteLeaves,
      sessionPhases:HOSTED_PHASES.slice(5)
    });
  }
}
export const hostedFixtures=Object.freeze([legacy,...variants]);
export function selectHostedFixture(selection:HostedSelection={} as HostedSelection):HostedFixture{
  const found=hostedFixtures.find(f=>f.scenarioId===selection.scenarioId&&f.personaVariant===(selection.personaVariant??null));
  if(!found)throw Error('unknown_scenario_variant');
  return found;
}
export function fixtureForDbKey(key:string):HostedFixture|undefined{
  return hostedFixtures.find(f=>f.dbKey===key);
}
export function hostedSelectorList(){
  return hostedFixtures.map(f=>({scenarioId:f.scenarioId,personaVariant:f.personaVariant,
    fixtureVersion:f.fixtureVersion,sourceProvenance:f.sourceProvenance,
    sourceFiles:f.sourceFiles,
    stateCount:f.states.length,legacy:f.legacy}));
}
/** A variant's source identity is its pinned foundation+overlay file digests.
 * The historical legacy controller preserves the environment's source SHA.
 * This composite is deliberately labelled a pin, not a Git commit. */
export function hostedSourcePin(fixture:HostedFixture,legacySource:string|undefined):string|null{
  return fixture.legacy?legacySource??null:
    'fixture-files/1:'+fixture.sourceFiles.map(file=>file.sha256).join(':');
}
export function sessionsForFixture(fixture:HostedFixture){
  if(fixture.legacy)return legacySessions.sessions;
  return fixture.sessionPhases.map((phase,index)=>{
    const sessionId='S0'+(index+1);
    const context=`${fixture.scenarioId}, fictional persona ${fixture.personaVariant}, phase ${phase}`;
    return {id:sessionId,phase,conversation:index===0||index===2||index===4?'cold':'fresh-or-return',
      simulatedUserPrompt:`FICTIONAL USER (${context}): Please reconstruct my current Project from canonical Minamo Notes, Questions, annotations and source revisions, preserving what I reported versus what is independently verified. Identify the decision that changed, an unresolved uncertainty, and one small next experiment. Do not rewrite Notes or save a checkpoint without a separate explicit request.`,
      requestedWrites:[],
      checks:['Canonical source and record provenance','Historical versus current Note editions',
        'No fabricated external experiment or automatic saved checkpoint',
        'Exact scenario/variant/run/phase identity and receipts']};
  });
}
