import type {WorkspaceRecord} from './contracts';
import {buildRecordLink,stageReadingLink} from './reading-links';

/** An explicit author heading is a navigation hint, never inferred execution capability. */
export function journeyLocalStart(record:WorkspaceRecord){
 if(record.family!=='journey')return undefined;
 const stages=record.learningShape?.kind==='journey'?record.learningShape.stages:[];
 const matches=stages.filter(stage=>/^(?:start working locally|try this in your environment)$/i.test(stage.title.trim()));
 // Ambiguity stays visible in the route; never silently choose between two starters.
 if(matches.length!==1)return undefined;
 const stage=matches[0],section=record.sections?.find(section=>section.id===stage.sectionId);
 if(!section?.parts.some(part=>!part.unavailable&&part.text.trim()))return undefined;
 return {stageId:stage.id,sectionId:section.id,label:stage.title,
  destination:stageReadingLink(buildRecordLink(record),{kind:'journey-stage',journeyId:record.id,stageId:stage.id}),
  authority:'authored-local-work-guidance' as const,execution:'external-not-verified' as const};
}
