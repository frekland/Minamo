import {admitLanguageText,languageBoundary,type LanguageText,type LanguageSpan} from './foundry/language';

/** Authoring-only coordinates. Readings are supplied by the author, never inferred. */
export type ReadingCue={expression:string;reading:string;occurrence?:number;before?:string;after?:string;expectedStart?:number;origin?:LanguageSpan['origin'];source?:string;gloss?:string;grammar?:string};
export type CueCandidate={start:number;end:number;before:string;after:string};
export type CueDiagnostic={code:'cue_missing'|'cue_ambiguous'|'cue_mismatch'|'cue_overlap'|'cue_invalid';path:string;message:string;candidates:CueCandidate[];candidateCount?:number};
export class ReadingCueError extends Error{constructor(readonly diagnostics:CueDiagnostic[]){super(diagnostics.map(d=>d.path+': '+d.message).join(' '));this.name='ReadingCueError';}}
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const allowed=['expression','reading','occurrence','before','after','expectedStart','origin','source','gloss','grammar'];
/** Exact UTF-16 matching with explicit repeated-occurrence/context disambiguation. */
export function compileReadingCues(input:unknown):{language:LanguageText;resolved:number}{
 if(!object(input))throw new ReadingCueError([{code:'cue_invalid',path:'language',message:'Use language metadata with exact text and a bounded cues array.',candidates:[]}]);
 if(input.cues===undefined)return {language:admitLanguageText(input),resolved:0};
 const {cues,...metadata}=input;
 if(!Array.isArray(cues)||cues.length>256)throw new ReadingCueError([{code:'cue_invalid',path:'language.cues',message:'Use at most 256 contextual cues for this exact passage.',candidates:[]}]);
 const language=admitLanguageText({...metadata,spans:metadata.spans??[]}),diagnostics:CueDiagnostic[]=[],spans=[...language.spans];
 for(const [i,value] of cues.entries()){
  const path='language.cues['+i+']',bad=(code:CueDiagnostic['code'],message:string,candidates:CueCandidate[]=[])=>diagnostics.push({code,path,message:message+(candidates.length>4?' Showing the first 4 of '+candidates.length+' matches; narrow the exact context.':''),candidates:candidates.slice(0,4),candidateCount:candidates.length});
  if(!object(value)||Object.keys(value).some(k=>!allowed.includes(k))||typeof value.expression!=='string'||!value.expression.length||value.expression.length>240||typeof value.reading!=='string'||!value.reading.length||value.reading.length>240||['before','after'].some(k=>value[k]!==undefined&&(typeof value[k]!=='string'||(value[k] as string).length>160))||value.occurrence!==undefined&&(!Number.isSafeInteger(value.occurrence)||Number(value.occurrence)<1)||value.expectedStart!==undefined&&(!Number.isSafeInteger(value.expectedStart)||Number(value.expectedStart)<0)){
   bad('cue_invalid','Use expression, supplied reading and optional 1-based occurrence or exact before/after context.');continue;
  }
  const cue=value as unknown as ReadingCue,all:CueCandidate[]=[];
  for(let at=language.text.indexOf(cue.expression);at!==-1;at=language.text.indexOf(cue.expression,at+1)){
   const end=at+cue.expression.length;
   if(languageBoundary(language.text,at)&&languageBoundary(language.text,end)){let from=Math.max(0,at-24),to=Math.min(language.text.length,end+24);while(from<at&&!languageBoundary(language.text,from))from++;while(to>end&&!languageBoundary(language.text,to))to--;all.push({start:at,end,before:language.text.slice(from,at),after:language.text.slice(end,to)});}
  }
  const contextual=all.filter(c=>(cue.before===undefined||language.text.slice(0,c.start).endsWith(cue.before))&&(cue.after===undefined||language.text.slice(c.end).startsWith(cue.after)));
  const candidates=cue.occurrence===undefined?contextual:contextual.slice(cue.occurrence-1,cue.occurrence);
  if(candidates.length!==1){bad(candidates.length?'cue_ambiguous':'cue_missing',candidates.length?'The expression occurs more than once. Supply 1-based occurrence within the matching context, or exact before/after text; no offset was guessed.':'No exact grapheme-safe occurrence matches this cue and context. Inspect the unchanged canonical text; no normalization or substring repair was performed.',contextual);continue;}
  const match=candidates[0];if(cue.expectedStart!==undefined&&cue.expectedStart!==match.start){bad('cue_mismatch','expectedStart disagrees with the resolved exact source. Read the edition and correct the explicit coordinate.',[match]);continue;}
  if(spans.some(s=>match.start<s.end&&match.end>s.start)){bad('cue_overlap','This cue overlaps an existing reading. Keep phrase/grammar layers separate or explicitly replace the old reading.',[match]);continue;}
  const {expression,occurrence,before,after,expectedStart,...annotation}=cue;
  spans.push({...annotation,start:match.start,end:match.end,base:expression,origin:cue.origin??'author-verified'});
 }
 if(diagnostics.length)throw new ReadingCueError(diagnostics);
 return {language:admitLanguageText({...language,spans:spans.sort((a,b)=>a.start-b.start)}),resolved:cues.length};
}
