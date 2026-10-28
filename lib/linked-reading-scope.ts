import type {WorkspaceRecord} from './contracts';
import type {LearningSpaceSelection} from './learning-space-navigation';
/** Bounded organisational destinations only; exact read eligibility stays server controlled. */
export function linkedReadingScopes(record:Pick<WorkspaceRecord,'learningScope'>):LearningSpaceSelection[]{
 const scope=record.learningScope;if(!scope)return [{learningSpace:'unclassified'}];
 return scope.spaces.flatMap(space=>space==='languages'&&scope.languages?.length?scope.languages.map(language=>({learningSpace:'languages' as const,language})):[{learningSpace:space}]);
}
