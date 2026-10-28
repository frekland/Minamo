/** The Library has its own permission-filtered, paged catalogue. Its first paint
 * must not wait for, or immediately request, the unrelated workspace corpus. */
export function workspaceCollectionNeeded(view:string,management=false,editing=false){
 return view!=='library'||management||editing;
}
export function deferInitialWorkspaceCollection(view:string,explicitTarget:boolean){
 return explicitTarget||!workspaceCollectionNeeded(view);
}
