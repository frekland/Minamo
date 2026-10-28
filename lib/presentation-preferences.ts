export type PresentationPreferences={version:1;size:'standard'|'larger'|'largest';width:'comfortable'|'narrow';spacing:'comfortable'|'compact';codeWrap:boolean;sidebar:'open'|'compact';motion:'system'|'reduce'};
export const defaultPresentation:PresentationPreferences={version:1,size:'standard',width:'comfortable',spacing:'comfortable',codeWrap:false,sidebar:'open',motion:'system'};
export function presentationPreferences(input:unknown):PresentationPreferences{
 const v=input&&typeof input==='object'?input as Record<string,unknown>:{};
 return {version:1,size:['standard','larger','largest'].includes(String(v.size))?v.size as PresentationPreferences['size']:'standard',width:v.width==='narrow'?'narrow':'comfortable',spacing:v.spacing==='compact'?'compact':'comfortable',codeWrap:v.codeWrap===true,sidebar:v.sidebar==='compact'?'compact':'open',motion:v.motion==='reduce'?'reduce':'system'};
}
export const presentationKey=(owner:string)=>'minamo-presentation-v1:'+owner;
export function reduceMotion(){return typeof window!=='undefined'&&(document.querySelector('.v2-app')?.getAttribute('data-motion')==='reduce'||window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
export const readingScrollBehavior=():ScrollBehavior=>reduceMotion()?'auto':'smooth';
