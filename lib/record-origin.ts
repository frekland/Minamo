import type {WorkspaceRecord} from './contracts';
/** Origin is saved evidence classification, never inferred from family/title. */
export function recordOriginLabel(record:Pick<WorkspaceRecord,'family'|'evidence'|'attempt'|'outputBundle'|'activity'>):string|undefined{
 if(record.attempt)return 'Saved attempt · supplied evidence';
 if(record.outputBundle)return record.outputBundle.classification==='supplied-output'?'Supplied output':'Browser-reported output';
 if(record.evidence==='illustrative')return 'Example';
 if(record.family==='run')return record.evidence==='observed'?'Recorded run':'Saved run';
 if(record.activity)return 'Authored Activity · instructions';
 return undefined;
}
