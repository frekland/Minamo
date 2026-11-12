import {activityCartridgeSchema,type ActivityBlock,type ActivityCartridge} from './schema';
import {deriveActivityPresentation,slotsForActivityBlock} from '../interface-foundry';
import {foundryAuthoringExamples} from './foundry-authoring-examples';

/** Data-only catalogue recipes. Reading/source permissions and execution are never implied. */
export function presentationAuthoringGuide(){
 const blocks:ActivityBlock[]=[
  {id:'task',kind:'instruction',text:'Inspect the supplied original example. State one prediction before comparing source; no result or achievement is claimed.'},
  {id:'predict',kind:'prediction',text:'What do you expect, and which exact source detail supports your prediction?'},
  {id:'source',kind:'foundry',artefact:structuredClone(foundryAuthoringExamples['text/plain-v1']) as Extract<ActivityBlock,{kind:'foundry'}>['artefact']},
  {id:'hints',kind:'hint-ladder',hints:[{id:'look-at-source',tier:'concept',text:'Keep the exact supplied source separate from your interpretation.'}]},
  {id:'reflect',kind:'reflection',text:'Compare your prediction with the supplied source. This response is not a formal checkpoint.'},
 ];
 const completePackages=Object.fromEntries(activityCartridgeSchema.shape.template.options.map(template=>{
  const activity:ActivityCartridge={contract:'minamo.activity.v1',template,intent:'Original source-inspection example; adapt its content to an authorised learner goal.',authorship:'original-exercise',blocks:structuredClone(blocks)};
  activity.presentation=deriveActivityPresentation(activity);
  return [template,{purpose:'TEST ONLY explicit Activity preflight',operationId:'example-'+template,id:'example-'+template,title:'TEST ONLY '+template+' presentation',synthetic:true,activity}];
 }));
 return {
  placement:'presentation belongs inside activity.presentation, never at request top level. Each block ID appears exactly once; hint-ladder belongs in guidance. Preview never writes.',
  generation:'Use the current exact expectedGeneration when required by the workspace. Replace example IDs with deliberate operation/record identities and keep the immutable request for uncertain-result recovery.',
  slotCompatibility:{instruction:slotsForActivityBlock(blocks[0]),prediction:slotsForActivityBlock(blocks[1]),reflection:slotsForActivityBlock(blocks[4]),foundryText:slotsForActivityBlock(blocks[2]),hintLadder:slotsForActivityBlock(blocks[3]),reading:['supporting'],sourceBrowser:['source'],suppliedTrace:['evidence','explore']},
  sources:'These original inert examples use exact canonical source and SHA-256. For custom source recompute the digest over exact UTF-8 text. A reading block needs an actually eligible exact family/id/rendition; no placeholder grants source rights. Author-run tests, learner reports and Minamo-observed Runs are distinct.',
  completePackages,
 };
}
