export type NotesDock='left'|'right'|'top'|'bottom';
export type NotesMode=NotesDock|'focus'|'minimised'|'collapsed';
export type NotesDimensions=Record<NotesDock,number>;
export const DEFAULT_NOTES_DIMENSIONS:NotesDimensions={left:460,right:460,top:430,bottom:430};
export function isNotesDock(value:unknown):value is NotesDock{return ['left','right','top','bottom'].includes(String(value))}
export function notesSizeLimit(dock:NotesDock,viewport:{width:number;height:number}){return {min:dock==='left'||dock==='right'?300:240,max:Math.max(dock==='left'||dock==='right'?300:240,(dock==='left'||dock==='right'?viewport.width-48:viewport.height-150))}}
export function clampNotesSize(dock:NotesDock,size:number,viewport:{width:number;height:number}){const bounds=notesSizeLimit(dock,viewport);return Math.max(bounds.min,Math.min(bounds.max,Number.isFinite(size)?size:DEFAULT_NOTES_DIMENSIONS[dock]))}
export function resizedNotesSize(dock:NotesDock,initial:number,delta:number,viewport:{width:number;height:number}){return clampNotesSize(dock,initial+delta*(dock==='right'||dock==='bottom'?-1:1),viewport)}
export function escapePlainNoteForMarkdown(body:string){return body.replace(/([\\`*_{}\[\]<>#+.!-])/g,'\\$1')}
/** Native details menus are transient chrome, independent of retained Note/draft state. */
export function closeNotesMenus(menus:Iterable<{open:boolean}>){for(const menu of menus)if(menu.open)menu.open=false}
/** A late acknowledgement updates its originating tab only; another active writing session stays active. */
export function acknowledgeNoteIdentity<T>(state:{selected:string;tabs:string[];closedTabs:string[];drafts:Record<string,T>},origin:string,id:string,savedDraft:T){const drafts={...state.drafts,[id]:savedDraft};if(origin!==id)delete drafts[origin];return {selected:state.selected===origin?id:state.selected,tabs:[...new Set(state.tabs.map(tab=>tab===origin?id:tab))],closedTabs:[...new Set(state.closedTabs.map(tab=>tab===origin?id:tab))],drafts};}
