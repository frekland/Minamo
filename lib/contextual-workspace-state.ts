import type {SelectedContextRef} from './contracts';

/** A view choice, never a second workspace or a saved learner relationship. */
export type WorkspaceExperience='classic'|'context';
export function experienceFromParams(params:URLSearchParams):WorkspaceExperience{
 return params.get('workspace')==='context'?'context':'classic';
}
export function carryWorkspaceExperience(next:URLSearchParams,prior:URLSearchParams){
 if(experienceFromParams(prior)==='context')next.set('workspace','context');
 return next;
}
/** Native new-tab links retain the reversible experience without changing source selectors. */
export function contextHref(href:string){
 if(!href.startsWith('/?'))return href;
 const params=new URLSearchParams(href.slice(2));params.set('workspace','context');return '/?'+params;
}
export type ContextReturn={view:string;id?:string;target?:{recordFamily?:string;rendition?:string;sectionId?:string;partId?:string;stageId?:string;start?:number;end?:number;segments?:unknown}};
export function extendContextReturn(stack:ContextReturn[],from:ContextReturn,to:ContextReturn):ContextReturn[]{
 if(JSON.stringify(from)===JSON.stringify(to)||from.view==='trash'||from.view==='tools')return stack;
 const last=stack.at(-1);
 return [...(last&&JSON.stringify(last)===JSON.stringify(from)?stack.slice(0,-1):stack),from].slice(-8);
}
export function explicitContextSelection(active:SelectedContextRef|undefined,comparison:SelectedContextRef[]):SelectedContextRef[]{
 const result:SelectedContextRef[]=[],seen=new Set<string>();
 for(const item of [active,...comparison]){
  if(!item||!item.family||!item.id)continue;
  const key=JSON.stringify([item.family,item.id,item.rendition??null,item.selection??null]);
  if(seen.has(key))continue;
  seen.add(key);result.push(item);
  if(result.length===6)break;
 }
 return result;
}
export function workingContextReadKey(scope:string,space:string,selection:SelectedContextRef[],focus?:{family:'journey'|'investigation';id:string}){
 return JSON.stringify([scope,space,selection,focus??null]);
}
