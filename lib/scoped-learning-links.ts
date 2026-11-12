import type {RecordLink,WorkspaceRecord} from './contracts';
import {matchesLearningScope,type LearningScopeQuery} from './learning-spaces';
/** A link's authored reason is content too. A selected subject only shows a
 * connection when its known current target belongs there. All keeps incomplete
 * explicit links discoverable; classification is never guessed from prose. */
export function learningConnectionVisible(link:Pick<RecordLink,'family'|'id'>,records:WorkspaceRecord[],selection:LearningScopeQuery):boolean{
 const target=records.find(record=>record.family===link.family&&record.id===link.id&&!record.trashedAt);
 return target?matchesLearningScope(target,selection):(!selection.learningSpace||selection.learningSpace==='all')&&!selection.language;
}
