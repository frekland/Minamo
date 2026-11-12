import {practiceInputSchema,type Exercise,type PracticeAttempt,type PracticeInput} from './practice';
import type {WorkspaceRecord} from './contracts';

/** Presentation defaults are deliberate drafts, never authored answers. */
export function initialPracticeInput(exercise:Exercise):PracticeInput{
 if(exercise.kind==='choice')return [];
 if(exercise.kind==='ordering'){const ids=exercise.options.map(option=>option.id);return [...ids.slice(1),ids[0]];}
 if(exercise.kind==='matching')return exercise.left.map(option=>({left:option.id,right:''}));
 return '';
}
export function restorePracticeInput(exercise:Exercise,value:unknown):PracticeInput|null{
 const parsed=practiceInputSchema.safeParse(value);
 if(exercise.kind==='choice'&&parsed.success&&Array.isArray(parsed.data)&&parsed.data.every(id=>typeof id==='string'&&exercise.options.some(option=>option.id===id)))return parsed.data;
 if(exercise.kind==='ordering'&&parsed.success&&Array.isArray(parsed.data)&&parsed.data.length===exercise.options.length&&new Set<unknown>(parsed.data).size===parsed.data.length&&parsed.data.every(id=>typeof id==='string'&&exercise.options.some(option=>option.id===id)))return parsed.data;
 if(!['choice','ordering','matching'].includes(exercise.kind)&&parsed.success&&typeof parsed.data==='string')return parsed.data;
 // An unfinished matching draft is allowed locally, but cannot be checked/saved.
 if(exercise.kind==='matching'&&Array.isArray(value)&&value.length===exercise.left.length&&value.every(pair=>pair&&typeof pair==='object'&&exercise.left.some(left=>left.id===pair.left)&&(pair.right===''||exercise.right.some(right=>right.id===pair.right)))&&new Set(value.map(pair=>pair.left)).size===value.length)return value;
 return null;
}
export function hasPracticeResponse(exercise:Exercise,input:PracticeInput,engaged:boolean){
 if(typeof input==='string')return !['choice','ordering','matching'].includes(exercise.kind)&&input.trim().length>0;
 if(exercise.kind==='choice')return input.length>0&&input.every(id=>typeof id==='string'&&exercise.options.some(option=>option.id===id));
 if(exercise.kind==='ordering')return engaged&&input.length===exercise.options.length&&new Set<unknown>(input).size===input.length&&input.every(id=>typeof id==='string'&&exercise.options.some(option=>option.id===id));
 if(exercise.kind==='matching')return input.length===exercise.left.length&&input.every(pair=>typeof pair==='object'&&exercise.left.some(left=>left.id===pair.left)&&exercise.right.some(right=>right.id===pair.right));
 return false;
}
export type PracticeAnswerView={groups:string[][];explanation:string};
/** Resolve identities only after the server has deliberately revealed an answer. */
export function presentPracticeAnswer(exercise:Exercise,answer:unknown,explanation=''):PracticeAnswerView{
 const label=(options:{id:string;label:string}[],id:unknown)=>{const option=options.find(option=>option.id===id);if(!option)throw Error('The revealed answer does not match this exercise. Reopen its exact edition.');return option.label;};
 let groups:string[][];
 if(exercise.kind==='choice'){if(!Array.isArray(answer))throw Error('The authored answer could not be displayed.');groups=[answer.map(id=>label(exercise.options,id))];}
 else if(exercise.kind==='ordering'){if(!Array.isArray(answer)||answer.some(order=>!Array.isArray(order)))throw Error('The authored order could not be displayed.');groups=answer.map(order=>order.map((id:unknown)=>label(exercise.options,id)));}
 else if(exercise.kind==='matching'){if(!Array.isArray(answer))throw Error('The authored matches could not be displayed.');groups=[answer.map(pair=>label(exercise.left,pair?.left)+' → '+label(exercise.right,pair?.right))];}
 else if(typeof answer==='string')groups=[[answer]];
 else if(Array.isArray(answer)&&answer.every(item=>typeof item==='string'))groups=answer.map(item=>[item]);
 else throw Error('The authored answer could not be displayed.');
 return {groups,explanation};
}
/** Saved identities are shown as the same public expressions the learner chose. */
export function presentPracticeResponse(exercise:Exercise,input:PracticeInput):string[]{
 if(typeof input==='string')return [input];
 return presentPracticeAnswer(exercise,exercise.kind==='ordering'?[input]:input).groups[0]??[];
}
export function appendPracticeResponse(practice:PracticeAttempt,itemId:string,input:PracticeInput,responseId:string):PracticeAttempt{
 if(practice.responses.some(response=>response.id===responseId))throw Error('Use a new identity for a revised answer.');
 const revision=1+Math.max(0,...practice.responses.filter(response=>response.itemId===itemId).map(response=>response.revision));
 return {...practice,responses:[...practice.responses,{id:responseId,itemId,revision,input:structuredClone(input)}]};
}
export type PracticeWriteResolution='unknown'|'committed'|'conflict'|'rejected';
/** A transport failure or missing receipt never authorizes a replacement write. */
export function practiceWriteResolution(value:unknown,httpStatus?:number):PracticeWriteResolution{
 if(value&&typeof value==='object'){const status=(value as {status?:unknown}).status;if(status==='committed'||status==='conflict')return status;}
 return httpStatus===400||httpStatus===422?'rejected':'unknown';
}
export function matchesPracticeActivity(record:WorkspaceRecord|undefined,activity:{id:string;rendition:string}){
 return !!record&&record.family==='run'&&!record.trashedAt&&record.attempt?.activity?.id===activity.id&&record.attempt.activity.rendition===activity.rendition;
}
export function mayReconcilePracticeWrite(resolution:PracticeWriteResolution){return resolution==='conflict'||resolution==='rejected';}
