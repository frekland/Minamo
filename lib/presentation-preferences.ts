export type PresentationPreferences={version:1;experience?:'stable'|'explore'|'practice';theme:'dark'|'light'|'system';density:'comfortable'|'compact';size:'standard'|'larger'|'largest';width:'comfortable'|'narrow';spacing:'comfortable'|'compact';codeWrap:boolean;sidebar:'open'|'compact';motion:'system'|'reduce';showLegacyJourneys:boolean};
export const defaultPresentation:PresentationPreferences={version:1,experience:'stable',theme:'dark',density:'comfortable',size:'standard',width:'comfortable',spacing:'comfortable',codeWrap:false,sidebar:'open',motion:'system',showLegacyJourneys:false};
export function presentationPreferences(input:unknown):PresentationPreferences{
 const v=input&&typeof input==='object'?input as Record<string,unknown>:{};
 return {version:1,experience:v.experience==='explore'||v.experience==='practice'?v.experience:'stable',theme:['dark','light','system'].includes(String(v.theme))?v.theme as PresentationPreferences['theme']:'dark',density:v.density==='compact'?'compact':'comfortable',size:['standard','larger','largest'].includes(String(v.size))?v.size as PresentationPreferences['size']:'standard',width:v.width==='narrow'?'narrow':'comfortable',spacing:v.spacing==='compact'?'compact':'comfortable',codeWrap:v.codeWrap===true,sidebar:v.sidebar==='compact'?'compact':'open',motion:v.motion==='reduce'?'reduce':'system',showLegacyJourneys:v.showLegacyJourneys===true};
}
export const presentationKey=(owner:string)=>'minamo-presentation-v1:'+owner;
export function reduceMotion(){return typeof window!=='undefined'&&(document.querySelector('.v2-app')?.getAttribute('data-motion')==='reduce'||window.matchMedia('(prefers-reduced-motion: reduce)').matches);}
export const readingScrollBehavior=():ScrollBehavior=>reduceMotion()?'auto':'smooth';
