/** Versioned browser Note keys shared by the writer and read-only recovery. */
export const NOTE_DRAFT_PREFIX='minamo-v2-notes-drafts-v3:';
export const LEGACY_NOTE_DRAFT_PREFIX='minamo-v2-notes-drafts-v2:';
export const noteDraftKey=(scope:string)=>NOTE_DRAFT_PREFIX+scope;
