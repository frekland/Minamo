import type {WorkspaceRecord} from './contracts';
import {learningSpaceFromParams,type LearningSpaceSelection} from './learning-space-navigation';
export type LibraryReturn={query:string;href:string;subjectId?:string;selection:LearningSpaceSelection};
const identifier=(value:unknown):value is string=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
const facets=['search','areas','topics','references'],kinds=['','concept','python-function','shell-command','api','language-syntax','functions'],sorts=['title','updated','authored'];
const spaces=['all','computing','languages','unclassified'],languages=['ja','zh-Hans','zh-Hant','fr','es','el','de','sv'];
const allowed=new Set(['view','family','id','libraryFacet','libraryQuery','libraryKind','librarySort','learningSpace','language','returnJourney','returnStage']);
const text=(value:unknown):value is string=>typeof value==='string'&&value.length<=200&&value.isWellFormed()&&!/[\u0000-\u001f\u007f]/.test(value);
function canonical(params:URLSearchParams):LibraryReturn|null{
 if(params.get('view')!=='library')return null;const family=params.get('family'),id=params.get('id');
 if(family!==null&&family!=='area'||id!==null&&(family!=='area'||!identifier(id))||family==='area'&&!id)return null;
 const facet=params.get('libraryFacet'),query=params.get('libraryQuery'),kind=params.get('libraryKind'),sort=params.get('librarySort'),space=params.get('learningSpace'),language=params.get('language'),project=params.get('returnJourney'),step=params.get('returnStage');
 if(facet!==null&&!facets.includes(facet)||query!==null&&!text(query)||kind!==null&&!kinds.includes(kind)||sort!==null&&!sorts.includes(sort)||space!==null&&!spaces.includes(space)||language!==null&&(!languages.includes(language)||space!==null&&space!=='languages'&&space!=='all')||project!==null&&!identifier(project)||step!==null&&(!identifier(step)||!project))return null;
 const p=new URLSearchParams({view:'library'});if(id){p.set('family','area');p.set('id',id);}for(const key of ['libraryFacet','libraryQuery','libraryKind','librarySort','learningSpace','language','returnJourney','returnStage']){const value=params.get(key);if(value!==null)p.set(key,value);}
 if(language!==null&&space===null)p.set('learningSpace','languages');const value=p.toString();return {query:value,href:'/?'+value,...(id?{subjectId:id}:{}),selection:learningSpaceFromParams(p)};
}
/** A return target is only a bounded local catalogue query, never an Article, redirect or nested return chain. */
export function parseLibraryReturn(value:unknown):LibraryReturn|null{
 if(typeof value!=='string'||!value||value.length>6000||/[\u0000-\u001f\u007f#]/.test(value))return null;
 const raw=value.startsWith('/?')?value.slice(2):value.startsWith('?')?value.slice(1):value;if(raw.startsWith('/'))return null;
 try{for(const part of raw.split('&'))for(const item of part.split('='))decodeURIComponent(item.replaceAll('+',' '));}catch{return null;}
 const params=new URLSearchParams(raw);for(const key of params.keys())if(!allowed.has(key)||params.getAll(key).length!==1)return null;
 return canonical(params);
}
/** Capture the currently displayed catalogue before following an inherited return context. Titles never enter the URL. */
export function libraryReturnFromCatalogue(params:URLSearchParams,browse?:unknown):string|null{
 if(params.get('view')!=='library'||params.has('rendition')||params.has('section')||params.has('part'))return null;
 const p=new URLSearchParams();for(const key of allowed){const value=params.get(key);if(value!==null)p.set(key,value);}
 const value=browse&&typeof browse==='object'?browse as Record<string,unknown>:undefined;
 if(value){if(value.areaId!==undefined&&value.areaId!==(p.get('id')??''))return null;for(const [field,key] of [['facet','libraryFacet'],['query','libraryQuery'],['kind','libraryKind'],['sort','librarySort']] as const)if(typeof value[field]==='string')p.set(key,value[field] as string);}
 return canonical(p)?.query??null;
}
/** Append navigation context without altering the exact destination rendition/passage. */
export function withLibraryReturn(href:string,returnLibrary:string|null|undefined):string{
 const target=parseLibraryReturn(returnLibrary);if(!target||!href.startsWith('/')||href.startsWith('//'))return href;
 let url:URL;try{url=new URL(href,'https://minamo.invalid');}catch{return href;}if(url.origin!=='https://minamo.invalid')return href;
 url.searchParams.set('returnLibrary',target.query);const source=new URLSearchParams(target.query);if(!url.searchParams.has('returnJourney'))for(const key of ['returnJourney','returnStage'])if(source.has(key))url.searchParams.set(key,source.get(key)!);
 return url.pathname+url.search+url.hash;
}
/** Navigation labels come from eligible record projections, never a title supplied by a URL or history entry. */
export function libraryReturnSubject(target:LibraryReturn|null,records:WorkspaceRecord[]){return target?.subjectId?records.find(record=>record.family==='area'&&record.id===target.subjectId&&!record.trashedAt&&!record.source?.excerpt?.unavailable&&!record.sections?.some(section=>section.parts.some(part=>part.unavailable))):undefined;}
