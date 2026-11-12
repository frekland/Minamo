import type {LearningWorkTarget,WorkspaceRecord} from './contracts';
import {withProjectReturn,type ProjectReturnContext} from './project-return-context';
import {absoluteReadingLink,buildRecordLink,MINAMO_V2_ORIGIN,stageReadingLink} from './reading-links';

/** Research presentation only. Eligibility is rechecked by the existing connected read. */
export function exactTaskTarget(record:Pick<WorkspaceRecord,'family'|'id'|'learningShape'|'trashedAt'>,stageId?:string):LearningWorkTarget|null{
 if(record.trashedAt)return null;
 if(record.family==='investigation')return {kind:'investigation',investigationId:record.id};
 if(record.family==='journey'&&stageId&&record.learningShape?.kind==='journey'&&record.learningShape.stages.some(stage=>stage.id===stageId))return {kind:'journey-stage',journeyId:record.id,stageId};
 return null;
}

/** A retained passage must keep its reading intent rather than silently becoming today's task. */
export function currentReadingTaskTarget(current:WorkspaceRecord|null,displayed:WorkspaceRecord|null,stageId?:string,passage=false):LearningWorkTarget|null{
 if(passage||!current||!displayed||current.family!==displayed.family||current.id!==displayed.id||current.rendition!==displayed.rendition)return null;
 return exactTaskTarget(current,stageId);
}

export function buildTaskGptBrief({record,stageId,siteOrigin=MINAMO_V2_ORIGIN,returnContext}:{record:Pick<WorkspaceRecord,'family'|'id'|'rendition'|'learningShape'|'trashedAt'>;stageId?:string;siteOrigin?:string;returnContext?:ProjectReturnContext}){
 const target=exactTaskTarget(record,stageId);
 if(!target)throw Error('Open an exact Question or Project Step before continuing with GPT.');
 const args={purpose:'Continue the exact Minamo task I selected, using its current saved learning.',scope:'target' as const,target,profile:'tutor' as const};
 const returnTo=absoluteReadingLink(withProjectReturn(stageReadingLink(buildRecordLink(record,{rendition:record.rendition}),target),returnContext),siteOrigin);
 const text='Use the Minamo plugin to continue this owner-selected task. Call get_minamo_learning_context with:\n'+JSON.stringify(args)
  +'\nUse the current saved continuation and recent linked Notes, Annotations, bookmarks and external evidence. A newer Note intention can guide our next step without being a checkpoint; inspect chronology and contradictions. Keep terminal evidence separate from its prediction and interpretation. Keep authored guidance, saved evidence, reported observations and browser-local writing distinct. Do not infer progress from reading, switching layouts or opening resources.'
  +'\nThis request includes no unsaved Note draft, pending attachment, browser working set or unsaved GPT conversation. Retrieve exact saved evidence or deliberately selected related material only when it helps the learning task; preserve revision and source-use limits. Do not revive withdrawn or superseded checkpoints.'
  +'\nReturn to the selected task: '+returnTo
  +'\nThe return link retains the selected authored edition; the tutor read checks current task eligibility and saved learning. If that edition matters to our discussion, read that exact family/id/rendition rather than substituting the current text.'
  +'\nDiscuss and teach naturally. Do not checkpoint, log a session, save conversation material or change records unless I separately ask.';
 return {tool:'get_minamo_learning_context' as const,arguments:args,returnTo,text};
}
