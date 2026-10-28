import type {WorkspaceRecord} from './contracts';
import type {NoteDraft} from './note-sync';
import {matchesLearningScope,type LearningScope,type LearningScopeQuery} from './learning-spaces';

/** Local draft classification is captured when writing begins, never inferred
 * from its prose or reassigned when the navigation changes. */
export function newNoteLearningScope(selection:LearningScopeQuery,context?:WorkspaceRecord|null):LearningScope|undefined{
 if(context?.learningScope)return structuredClone(context.learningScope);
 if(selection.learningSpace!=='computing'&&selection.learningSpace!=='languages')return;
 return {version:1,spaces:[selection.learningSpace],...(selection.language?{languages:[selection.language]}:{}),provenance:'authored'};
}
/** Visibility changes, retention and pending operation authority do not. Saved
 * metadata wins; unclassified legacy drafts remain in All/Unclassified. */
export function noteVisibleInLearningSpace(draft:NoteDraft|undefined,saved:WorkspaceRecord|undefined,records:WorkspaceRecord[],selection:LearningScopeQuery):boolean{
 if(saved)return !saved.trashedAt&&matchesLearningScope(saved,selection);
 if(draft?.baseRev)return (!selection.learningSpace||selection.learningSpace==='all')&&!selection.language;
 if(draft?.learningScope)return matchesLearningScope(draft,selection);
 const scopes=(draft?.links??[]).flatMap(link=>{const target=records.find(record=>record.family===link.family&&record.id===link.id&&!record.trashedAt);return target?.learningScope?[target.learningScope]:[];});
 if(scopes.length)return matchesLearningScope({learningScope:{version:1,spaces:[...new Set(scopes.flatMap(scope=>scope.spaces))],languages:[...new Set(scopes.flatMap(scope=>scope.languages??[]))],provenance:'classification'}},selection);
 return matchesLearningScope({},selection);
}
