import type {WorkspaceRecord,WorkspaceCommand} from './contracts';
import type {LearningScope} from './learning-spaces';

export type RecordSubject='unclassified'|'computing'|'languages'|'both';
export function recordSubject(scope?:LearningScope):RecordSubject{
 if(scope?.spaces.includes('computing')&&scope.spaces.includes('languages'))return 'both';
 if(scope?.spaces.includes('computing'))return 'computing';
 if(scope?.spaces.includes('languages'))return 'languages';
 return 'unclassified';
}
export function subjectScope(subject:RecordSubject,language?:string):LearningScope{
 const spaces=subject==='both'?['computing','languages']:subject==='computing'?['computing']:subject==='languages'?['languages']:[];
 return {version:1,spaces:spaces as LearningScope['spaces'],...(spaces.includes('languages')&&language?{languages:[language]}:{}),provenance:'classification'};
}
/** Exclusive sidecar CAS, deliberately separate from an authored revision. */
export function subjectCommand(record:WorkspaceRecord,scope:LearningScope,operationId:string):WorkspaceCommand{
 return {operationId,action:'update',family:record.family,id:record.id,expectedRev:record.rev,data:{classifyLearningScope:{expectedScopeRev:record.learningScopeRev??0,learningScope:scope}}};
}
export function sameSubject(record:WorkspaceRecord,scope:LearningScope):boolean{
 const current=record.learningScope;
 return JSON.stringify([...(current?.subjects??[])].sort())===JSON.stringify([...(scope.subjects??[])].sort())&&recordSubject(current)===recordSubject(scope)&&JSON.stringify([...current?.languages??[]].sort())===JSON.stringify([...scope.languages??[]].sort());
}
