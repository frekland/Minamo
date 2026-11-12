/** Bounded, literal orientation to saved Project differences.
 * It deliberately cannot infer reasons, outcomes, sessions or a current task.
 * The full revision/rights read remains authoritative for exact material. */
type ChangedPart={change:'added'|'revised'|'removed';sectionId:string;partId:string;kind:string;sectionTitle:string;textPreview?:string;materialLabel?:string;fieldChanges?:{field:string;before:string;after:string}[];captureSource?:{classification:string;definitionMatchesSavedEdition:boolean};captureExcerpt?:string};
type ChangedRevision={revision:number;rendition?:string;at:string;actor?:string;synthetic:boolean;fictionalEvent?:unknown;titleChanged:boolean;descriptionChanged:boolean;arrangementChanged:boolean;sectionChanges:{sectionId:string;sectionTitle:string;added:number;revised:number;removed:number}[];changes:ChangedPart[];changesTruncated:boolean;sourceMappingChanges?:unknown[]};
export type ProjectChangePage={projectId:string;currentProjectRev:number;revisions:ChangedRevision[];nextBeforeRevision:number|null};

const excerpt=(value:string|undefined,length=115)=>value?.replace(/\s+/g,' ').trim().slice(0,length)||undefined;

export function compactProjectChanges(page:ProjectChangePage,maxEntries=5){
 const entries=page.revisions.filter(row=>row.titleChanged||row.descriptionChanged||row.arrangementChanged||row.changes.length>0||!!row.sourceMappingChanges?.length).slice(0,maxEntries).map(row=>({
  revision:row.revision,rendition:row.rendition,at:row.at,actor:row.actor??'unknown',synthetic:row.synthetic,
  titleChanged:row.titleChanged,descriptionChanged:row.descriptionChanged,arrangementChanged:row.arrangementChanged,
  sections:row.sectionChanges.slice(0,4).map(section=>({title:section.sectionTitle,added:section.added,revised:section.revised,removed:section.removed})),
  changes:row.changes.slice(0,3).map(change=>({
   action:change.change,sectionId:change.sectionId,partId:change.partId,kind:change.kind,
   label:excerpt(change.materialLabel,90)||change.sectionTitle,
   ...(change.fieldChanges?.length?{literalDifference:change.fieldChanges.slice(0,1).map(field=>({field:field.field,before:excerpt(field.before),after:excerpt(field.after)}))}:change.textPreview?{excerpt:excerpt(change.textPreview)}:{}),
   ...(change.captureSource?{suppliedCapture:{classification:change.captureSource.classification,definitionMatchesSavedEdition:change.captureSource.definitionMatchesSavedEdition}}:{})
  })),
  changesOmitted:row.changes.length>3||row.changesTruncated,
  sourceMappingChanged:!!row.sourceMappingChanges?.length
 }));
 return {contract:'minamo.project-change-orientation.v1' as const,projectId:page.projectId,currentRevision:page.currentProjectRev,entries,
  scannedRevisions:page.revisions.length,moreHistory:page.nextBeforeRevision!==null||page.revisions.filter(row=>row.titleChanged||row.descriptionChanged||row.arrangementChanged||row.changes.length>0||!!row.sourceMappingChanges?.length).length>entries.length,
  exactRead:{tool:'read_project_changes',projectId:page.projectId},
  notice:'Literal differences from retained Project editions, with actual save times and saved actor labels. Unchanged revisions are omitted; this is not a learning-session timeline, explanation of why something changed, independent execution report, or indication of progress. Open exact editions for complete material.'};
}
