/** Library articles explain a subject; learner tasks belong in owner-initiated work.
 * These narrow structural checks catch explicit task scaffolding, not every possible
 * semantic paraphrase. Ordinary subject questions, code and worked examples remain valid.
 */
type ReferenceInput={family?:string;title?:string;body?:string;sections?:Array<{title?:string;parts?:Array<{kind?:string;text?:string;callout?:{label?:string;tone?:string};diagram?:unknown;excerpt?:unknown;unavailable?:unknown}>}>};
export type LibraryReferenceFinding={severity:'block';code:'library_reference_only';path:string;message:string;remediation:string};
const taskHeading=/(?:^|\b)(?:exercises?|practice tasks?|practice questions?|self[- ](?:check|study|test)|your turn|try (?:it|this|for yourself)|questions? (?:to|for) (?:investigate|explore|consider|reflection)|reflection questions?|suggested investigations?|investigation prompts?)(?:\b|$)|^(?:questions|practice|optional practice|check your understanding)\s*$|^investigate(?:\s*[:—–-]|$)/i;
const taskPrompt= /^(?:(?:\d+[.)]\s*)?)(?:predict (?:which|what|whether|how)|try (?:it|this|for yourself)|your turn\b|(?:(?:optional|final)\s+)?(?:exercise|investigation|practice task|self[- ]check|reflection|reflection question|task)\s*[:—–-]|(?:can you|what do you think|how would you|what would happen|why do you think)\b|test (?:a small example|this yourself)|change one variable\b|on your own machine\b)/i;
const promptLabel=/^\s*(?:investigate|exercise|your turn|self[- ]check|practice|question|reflection)\s*$/i;
function containsTask(text:string){
 const prose=text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm,'');
 return prose.split(/\n\s*\n/).some(paragraph=>taskPrompt.test(paragraph.trim())||/^#{1,6}\s+/.test(paragraph.trim())&&taskHeading.test(paragraph.trim().replace(/^#{1,6}\s+/,'')));
}
export function libraryReferenceFindings(record:ReferenceInput):LibraryReferenceFinding[]{
 if(record.family!=='article')return [];
 const findings:LibraryReferenceFinding[]=[];
 const add=(path:string)=>findings.push({severity:'block',code:'library_reference_only',path,message:'Library Articles provide reference material. Remove the exercise, question or investigation prompt.',remediation:'Keep the worked explanation and its result. Put learner tasks only in a Journey, Investigation or Activity explicitly requested by the owner; do not create or move work automatically.'});
 if(taskHeading.test(record.title??''))add('title');
 if(containsTask(record.body??''))add('body');
 for(const [i,section] of (record.sections??[]).entries()){
  if(taskHeading.test(section.title??''))add(`sections[${i}].title`);
  for(const [j,part] of (section.parts??[]).entries()){
   if(part.excerpt||part.unavailable)continue;
   const path=`sections[${i}].parts[${j}]`;
   if(['paragraph','callout'].includes(part.kind??'')){
    if(part.callout?.tone==='question'||promptLabel.test(part.callout?.label??'')||containsTask(part.text??'')||part.kind==='callout'&&/^\s*(?:Investigate|Exercise|Your turn|Self-check)\b\s*(?:\n|:|—)/i.test(part.text??''))add(path);
   }
   if((part.diagram as {presentation?:{steps?:Array<{prediction?:unknown}>}}|undefined)?.presentation?.steps?.some(step=>step.prediction!==undefined))add(path+'.diagram.presentation.steps');
  }
 }
 return findings;
}
