/** TEST ONLY: explicit local-only 3×3 corpus selector, not a hosted MCP registration.
 * Dispatching a case never touches the deployed scenario controller or owner data.
 */
import {replayWeekend} from './mood-to-music/variants/weekend-prototyper.mjs';
import {replayDocumentation} from './mood-to-music/variants/documentation-sceptic.mjs';
import {replayPrivacy} from './mood-to-music/variants/privacy-reviser.mjs';
import {retiredCap} from './retired-htb-cap/subject.mjs';
import {plantScreamer} from './automatic-plant-screamer/subject.mjs';
import {replaySubject} from './shared/subject-replay.mjs';

const matrix=Object.freeze({
  'mood-to-music/3':Object.freeze({
    'intermittent-weekend-prototyper':replayWeekend,
    'provider-documentation-sceptic':replayDocumentation,
    'privacy-led-interface-reviser':replayPrivacy
  }),
  'retired-htb-cap/1':Object.freeze({
    'command-log-investigator':(phase,options)=>replaySubject(retiredCap,'command-log',phase,options),
    'packet-model-explainer':(phase,options)=>replaySubject(retiredCap,'packet-model',phase,options),
    'interrupted-sparse-recorder':(phase,options)=>replaySubject(retiredCap,'sparse-return',phase,options)
  }),
  'automatic-plant-screamer/1':Object.freeze({
    'breadboard-first-tinkerer':(phase,options)=>replaySubject(plantScreamer,'breadboard',phase,options),
    'careful-calibrator':(phase,options)=>replaySubject(plantScreamer,'calibrator',phase,options),
    'shared-space-pragmatist':(phase,options)=>replaySubject(plantScreamer,'shared-space',phase,options)
  })
});
export function listLocalCorpus(){
  return Object.entries(matrix).flatMap(([fixtureVersion,variants])=>
    Object.keys(variants).map(personaVariant=>({fixtureVersion,personaVariant,
      evidence:'local synthetic domain replay; no hosted GPT/MCP/UI acceptance'})));
}
export async function replayLocalCorpus({fixtureVersion,personaVariant,phase='K',epoch=1,owner}){
  const select=Object.hasOwn(matrix,fixtureVersion)?matrix[fixtureVersion]:null;
  const run=select&&Object.hasOwn(select,personaVariant)?select[personaVariant]:null;
  if(!run)throw Error('Unregistered local 3x3 case');
  if(typeof phase!=='string'||phase.length!==1||!'ABCDEFGHIJK'.includes(phase))throw Error('Invalid 3x3 phase');
  return run(phase,{epoch,...(owner?{owner}:{})});
}
