import {FAMILIES} from '../contracts';
import {ATLAS_LENSES,type AtlasFocus,type AtlasLens,type AtlasNode} from './types';
export type AtlasNavigation={lens:AtlasLens;focus?:AtlasFocus;kind:string;relation:string;expanded:string[]};
/** Bounded URL presentation state. No source text, labels, evidence, or authority. */
export function readAtlasNavigation(search:string,fallback:AtlasLens='route'):AtlasNavigation{
 const q=new URLSearchParams(search),lens=q.get('atlasLens'),family=q.get('atlasFamily'),id=q.get('atlasId'),kind=q.get('atlasKind')??'all',relation=q.get('atlasRelation')??'all';
 return {lens:ATLAS_LENSES.includes(lens as AtlasLens)?lens as AtlasLens:fallback,...(FAMILIES.includes(family as typeof FAMILIES[number])&&id&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(id)?{focus:{family:family as AtlasFocus['family'],id}}:{}),kind:/^[a-z-]{1,40}$/.test(kind)?kind:'all',relation:/^[a-z-]{1,80}$/.test(relation)?relation:'all',expanded:(q.get('atlasExpanded')??'').split(',').filter(value=>/^[A-Za-z0-9_.:-]{1,180}$/.test(value)).slice(0,24)};
}
export function writeAtlasNavigation(search:string,value:Partial<AtlasNavigation>):string{
 const q=new URLSearchParams(search),keys={lens:'atlasLens',kind:'atlasKind',relation:'atlasRelation'} as const;
 for(const [key,param]of Object.entries(keys))if(key in value){const entry=value[key as keyof typeof keys];if(entry&&entry!=='all')q.set(param,entry);else q.delete(param);}
 if('focus'in value){if(value.focus){q.set('atlasFamily',value.focus.family);q.set('atlasId',value.focus.id);}else{q.delete('atlasFamily');q.delete('atlasId');}}
 if('expanded'in value){if(value.expanded?.length)q.set('atlasExpanded',value.expanded.slice(0,24).join(','));else q.delete('atlasExpanded');}return '?'+q.toString();
}
export function atlasGroupKey(node:AtlasNode){return node.kind==='journey'||node.kind==='stage'?'journey:'+node.destination.id:'kind:'+node.kind;}
export function atlasOverviewGroups(nodes:AtlasNode[]){const groups=new Map<string,{id:string;title:string;nodes:AtlasNode[]}>();for(const node of nodes){const id=atlasGroupKey(node),group=groups.get(id)??{id,title:node.kind==='journey'?node.title:node.kind==='stage'?'Journey stages':node.kind.replaceAll('-',' '),nodes:[]};group.nodes.push(node);if(node.kind==='journey')group.title=node.title;groups.set(id,group);}return [...groups.values()];}
