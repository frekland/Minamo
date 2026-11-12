import {StateEffect,StateField,type Extension} from '@codemirror/state';
import {invertedEffects} from '@codemirror/commands';
export type PendingNoteImageIntent={uploadId:string;position:number}|null;
/** Pending placement participates in CodeMirror's own history, with no text marker to autosave. */
export function noteImageHistory(){
 const effect=StateEffect.define<PendingNoteImageIntent>({map:(value,changes)=>value?{...value,position:changes.mapPos(value.position,1)}:null});
 const field=StateField.define<PendingNoteImageIntent>({create:()=>null,update:(value,tr)=>{let next=value?{...value,position:tr.changes.mapPos(value.position,1)}:null;for(const item of tr.effects)if(item.is(effect))next=item.value;return next;}});
 const extension:Extension=[field,invertedEffects.of(tr=>tr.effects.some(item=>item.is(effect))?[effect.of(tr.startState.field(field))]:[])];
 return {effect,field,extension};
}
