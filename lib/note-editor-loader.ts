/** Share a pending editor import, but never retain a rejected chunk request.
 * A temporary deployment/network failure must be retryable without closing a Note.
 */
export function createNoteEditorLoader<T>(load:()=>Promise<T>){
 let pending:Promise<T>|undefined;
 return ()=>pending??(pending=load().catch(error=>{pending=undefined;throw error}));
}
