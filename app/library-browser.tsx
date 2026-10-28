'use client';
import {useEffect,useRef,useState,useSyncExternalStore,type MouseEvent} from 'react';
import {recordSearchEvidence,normaliseSearchQuery,referenceNameMatch,searchEvidenceRank,type SearchEvidence} from '../lib/search-evidence';
import SearchMatch from './search-match';
import {ArrowRight,BookOpen,ChevronRight,Search,X} from 'lucide-react';
import LoadingSkeleton from './loading-skeleton';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref,learningSpaceKey,learningSpaceParams} from '../lib/learning-space-navigation';
import {generationFetch,workspaceGenerationFromScope} from '../lib/workspace-generation';
import {subscribeForeground} from '../lib/foreground-session';
import {createLibraryReadCache,bindLibraryCacheInvalidation,LibraryReadFailure,libraryReadRequiresClear} from '../lib/library-read-cache';
import type {WorkspaceRecord} from '../lib/contracts';
import type {ReadingTarget} from './reader';
import {resultNavigationIntent,resultNavigationTarget} from '../lib/result-intent';
import './library-browser.css';
import {libraryReturnFromCatalogue,withLibraryReturn} from '../lib/library-return';
export type LibraryBrowseState={facet:'search'|'areas'|'topics'|'references';query:string;kind:string;areaId:string;areaTitle:string;sort?:'title'|'updated'|'authored'};
export function libraryQueryChange(browse:LibraryBrowseState,query:string):Partial<LibraryBrowseState>{return {query,...(browse.facet==='areas'?{facet:'search',kind:''}:{})};}
export function libraryFilterChange(browse:LibraryBrowseState,facet:LibraryBrowseState['facet'],kind=''):Partial<LibraryBrowseState>{return {facet,kind,query:browse.query};}
export function librarySearchFromParams(params:URLSearchParams,fallback:LibraryBrowseState):LibraryBrowseState{
 const exactArea=!!fallback.areaId&&params.get('family')==='area'&&params.get('id')===fallback.areaId;
 if(params.get('view')!=='library'||(fallback.areaId?!exactArea:!!params.get('id')))return fallback;
 const facet=params.get('libraryFacet'),query=params.get('libraryQuery'),kind=params.get('libraryKind'),sort=params.get('librarySort');
 if(facet!==null&&!['search','areas','topics','references'].includes(facet)||query!==null&&query.length>200||kind!==null&&!['','concept','python-function','shell-command','api','language-syntax','functions'].includes(kind)||sort!==null&&!['title','updated','authored'].includes(sort))return fallback;
 if(facet===null&&query===null&&kind===null&&sort===null)return fallback;
 return {...fallback,...(facet?{facet:(exactArea&&facet==='areas'?'topics':facet) as LibraryBrowseState['facet']}:{}),...(query!==null?{query}:{}),...(kind!==null?{kind}:facet?{kind:''}:{}),...(sort?{sort:sort as LibraryBrowseState['sort']}:{})};
}
export function librarySearchHref(query:string,facet:LibraryBrowseState['facet']='search'){return '/?'+new URLSearchParams({view:'library',libraryFacet:facet,libraryQuery:query.slice(0,200)});}
export type LibraryPreviewDestination={family:'article'|'area';id:string;rendition?:string;sectionId?:string;partId?:string;start?:number;end?:number};
export type LibraryItem={matchEvidence?:SearchEvidence;matchRank?:number;family:'article'|'area';id:string;title:string;href?:string;rendition?:string;summary?:string|{text:string;origin?:string};summaryOrigin?:string;destination?:LibraryPreviewDestination;reference?:{id:string;term:string;aliases?:string[];definition:string;signature?:string;usage?:string;environment?:string;kind?:string;target:{rendition:string;sectionId:string;partId?:string}};concept?:any;topicCount?:number;areas?:{id:string;title:string}[]};
export type Page={items:LibraryItem[];nextCursor?:string|null;truncated?:boolean;searchIncomplete?:boolean;matchOrder?:string;order?:{kind:string;label:string;authoredAvailable:boolean};indexEpoch?:number;error?:string;message?:string};
type Navigate=(view:string,id?:string,target?:ReadingTarget)=>void;
/** A new owner/selection/query must never paint the previous page before effects run. */
export function currentLibraryPage(page:Page,admittedKey:string,currentKey:string,loading:boolean,error:string){
 return admittedKey===currentKey?{page,loading,error}:{page:{items:[]} as Page,loading:true,error:''};
}
const EMPTY_RECORDS:WorkspaceRecord[]=[];
type BrowseEntry={scope:string;browse:LibraryBrowseState;scrollTop:number;pages:number;focusKey?:string};
const kinds=[{label:'All references',kind:''},{label:'Concepts',kind:'concept'},{label:'Functions & APIs',kind:'functions'},{label:'Commands',kind:'shell-command'},{label:'Python functions',kind:'python-function'},{label:'APIs',kind:'api'},{label:'Language syntax',kind:'language-syntax'}];
export function restoreLibraryBrowse(value:unknown,fallback:LibraryBrowseState):LibraryBrowseState{
 if(!value||typeof value!=='object')return fallback;const v=value as Partial<LibraryBrowseState>;
 return {...fallback,...(['search','areas','topics','references'].includes(v.facet??'')?{facet:v.facet}:{}),...(typeof v.query==='string'&&v.query.length<=200?{query:v.query}:{}),...(['','concept','python-function','shell-command','api','language-syntax','functions'].includes(v.kind??'')?{kind:v.kind}:{}),...(typeof v.areaId==='string'&&/^[A-Za-z0-9_.:-]{0,160}$/.test(v.areaId)?{areaId:v.areaId}:{}),...(typeof v.areaTitle==='string'&&v.areaTitle.length<=180?{areaTitle:v.areaTitle}:{}),...(['title','updated','authored'].includes(v.sort??'')?{sort:v.sort}:{})} as LibraryBrowseState;
}
export function restoreLibraryEntry(value:unknown,scope:string,fallback:LibraryBrowseState):BrowseEntry{
 const defaults={scope,browse:fallback,scrollTop:0,pages:1};if(!value||typeof value!=='object')return defaults;const saved=value as Partial<BrowseEntry>;
 if(saved.scope!==scope)return defaults;const browse=restoreLibraryBrowse(saved.browse,fallback);if(browse.areaId!==fallback.areaId)return defaults;if(fallback.areaId&&browse.facet==='areas')browse.facet='topics';
 return {scope,browse,scrollTop:typeof saved.scrollTop==='number'&&Number.isFinite(saved.scrollTop)?Math.max(0,saved.scrollTop):0,pages:typeof saved.pages==='number'&&Number.isSafeInteger(saved.pages)?Math.min(20,Math.max(1,saved.pages)):1,...(typeof saved.focusKey==='string'&&/^[A-Za-z0-9_.:-]{1,400}$/.test(saved.focusKey)?{focusKey:saved.focusKey}:{})};
}
export function libraryItemDestination(item:LibraryItem):LibraryPreviewDestination{
 if(item.destination)return item.destination;if(item.matchEvidence){const target=resultNavigationTarget(resultNavigationIntent(item,item.matchEvidence));return {family:item.family,id:item.id,rendition:target.rendition,sectionId:target.sectionId,partId:target.partId,...(target.start!==undefined?{start:target.start,end:target.end}:{})};}const ref=item.reference??item.concept;
 return {family:item.family,id:item.id,rendition:ref?.target?.rendition??item.rendition,...(ref?{sectionId:ref.target?.sectionId??ref.sectionId,partId:ref.target?.partId??ref.partId}:{})};
}
export function libraryDestinationHref(target:LibraryPreviewDestination){const p=new URLSearchParams({view:'library',family:target.family,id:target.id});if(target.rendition)p.set('rendition',target.rendition);if(target.sectionId)p.set('section',target.sectionId);if(target.partId)p.set('part',target.partId);if(target.start!==undefined&&target.end!==undefined){p.set('start',String(target.start));p.set('end',String(target.end));}return '/?'+p;}
export function libraryItemHref(item:LibraryItem){return item.matchEvidence?resultNavigationIntent(item,item.matchEvidence).href:libraryDestinationHref(libraryItemDestination(item));}
const ordinaryClick=(e:MouseEvent<HTMLAnchorElement>)=>e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey;
function mainScroll(){const main=document.getElementById('workspace-main');return main&&main.scrollHeight>main.clientHeight?main.scrollTop:window.scrollY;}
function restoreScroll(top:number){const main=document.getElementById('workspace-main');if(main&&main.scrollHeight>main.clientHeight)main.scrollTo({top,behavior:'instant'});else window.scrollTo({top,behavior:'instant'});}
/** History retains identities/filters/position only, never stale eligible card bodies. */
export function useLibraryEntry(scope:string,defaults:LibraryBrowseState){
 const [storedBrowse,setBrowse]=useState(defaults),[admittedScope,setAdmittedScope]=useState('');const ready=admittedScope===scope,browse=ready?storedBrowse:defaults;const entry=useRef<BrowseEntry>({scope,browse:defaults,scrollTop:0,pages:1});
 const save=(next:BrowseEntry,push=false)=>{entry.current=next;try{const state={...(window.history.state??{}),minamoLibrary:next},query=libraryReturnFromCatalogue(new URLSearchParams(window.location.search),next.browse),href=query?(window.location.pathname??'/')+'?'+query+(window.location.hash??''):undefined;if(push)window.history.pushState(state,'',href);else window.history.replaceState(state,'',href);}catch{}};
 useEffect(()=>{const sync=()=>{const params=new URLSearchParams(window.location.search),parsed=librarySearchFromParams(params,defaults);entry.current=restoreLibraryEntry(window.history.state?.minamoLibrary,scope,parsed);if(['libraryFacet','libraryQuery','libraryKind','librarySort'].some(key=>params.has(key))&&JSON.stringify(entry.current.browse)!==JSON.stringify(parsed))entry.current={scope,browse:parsed,scrollTop:0,pages:1};setBrowse(entry.current.browse);setAdmittedScope(scope)};sync();window.addEventListener('popstate',sync);return()=>window.removeEventListener('popstate',sync)},[scope,defaults.areaId]);
 useEffect(()=>{if(!ready)return;let frame=0;const retain=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>save({...entry.current,browse,scrollTop:mainScroll()}));};window.addEventListener('scroll',retain,true);return()=>{window.removeEventListener('scroll',retain,true);cancelAnimationFrame(frame);};},[ready,browse,scope]);
 const change=(next:Partial<LibraryBrowseState>)=>{const value={...browse,...next};const onlyQuery=Object.keys(next).length===1&&'query' in next;save({...entry.current,browse,scrollTop:mainScroll()});save({scope,browse:value,scrollTop:0,pages:1},!onlyQuery);setBrowse(value);restoreScroll(0);};
 return {browse,ready,entry,change,savePosition:(pages=entry.current.pages,focusKey?:string)=>save({scope,browse,scrollTop:mainScroll(),pages,...(focusKey?{focusKey}:{})})};
}
/** A short-lived cache contains admitted display projections only; exact readings use their own protected route. */
const libraryReads=createLibraryReadCache();
let libraryCacheEventTarget:Window|undefined,unbindLibraryCacheEvents:(()=>void)|undefined;
function retainLibraryPermissionEvents(){if(typeof window==='undefined'||libraryCacheEventTarget===window)return;unbindLibraryCacheEvents?.();libraryCacheEventTarget=window;unbindLibraryCacheEvents=bindLibraryCacheInvalidation(libraryReads,window);}
type CachedLibraryPage={page:Page;depth:number};
type LibraryHub={record?:WorkspaceRecord;related:WorkspaceRecord[]};
export function libraryHubProjection(record:WorkspaceRecord,related:WorkspaceRecord[]=[]):LibraryHub{
 const project=(value:WorkspaceRecord):WorkspaceRecord=>({family:value.family,id:value.id,title:value.title,rev:value.rev,rendition:value.rendition,createdAt:value.createdAt,updatedAt:value.updatedAt,trashedAt:value.trashedAt,actor:value.actor,synthetic:value.synthetic,body:'',links:value.links.filter(link=>link.family==='area'&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId)});
 return {record:{...project(record),body:record.body.slice(0,1000),links:record.links,sections:(record.sections??[]).map(section=>({id:section.id,title:section.title,parts:section.parts.filter(part=>!part.unavailable&&!part.excerpt&&['paragraph','callout'].includes(part.kind)).slice(0,3).map(part=>({id:part.id,kind:part.kind,text:part.text.slice(0,1000)}))}))},related:related.slice(0,40).map(project)};
}
async function libraryResponse<T>(response:Response,scope:string):Promise<T>{
 let value:any;try{value=await response.json();}catch{throw new LibraryReadFailure('Library refresh could not complete.',response.status);}
 if(!response.ok)throw new LibraryReadFailure(value.message??value.error??'Library refresh could not complete.',response.status,String(value.code??''));
 const expected=workspaceGenerationFromScope(scope);if(value.generation!==expected||response.headers.get('X-Minamo-Generation')&&response.headers.get('X-Minamo-Generation')!==expected)throw new LibraryReadFailure('The workspace generation changed.',409,'generation_conflict');
 return value as T;
}
/** Server pagination covers the complete eligible catalogue, independently of loaded records. */
export function ServerLibraryIndex({draftScope,onNavigate,initialAreaId,initialAreaTitle,initialFacet='areas',areaRecord,records=EMPTY_RECORDS,onPreview}:{draftScope:string;onNavigate:Navigate;initialAreaId?:string;initialAreaTitle?:string;initialFacet?:LibraryBrowseState['facet'];areaRecord?:WorkspaceRecord;records?:WorkspaceRecord[];onPreview?:(target:LibraryPreviewDestination)=>void}){
 const learningSelection=useLearningSpace(),learningKey=learningSpaceKey(learningSelection);
 const defaults:LibraryBrowseState={facet:initialAreaId?'topics':initialFacet,query:'',kind:'',areaId:initialAreaId??'',areaTitle:initialAreaTitle??''};
 const {browse,ready,entry,change,savePosition}=useLibraryEntry(draftScope+':learning:'+learningKey,defaults);
 const [state,setState]=useState<{key:string;page:Page;loading:boolean;error:string}>({key:'',page:{items:[]},loading:true,error:''}),[retry,setRetry]=useState(0),[hardEpoch,setHardEpoch]=useState(0),[hubRefresh,setHubRefresh]=useState(0);
 const [hub,setHub]=useState<{key:string;value:LibraryHub;error:string}>({key:'',value:{related:[]},error:''});
 const sequence=useRef(0),hubSequence=useRef(0),depth=useRef(1),restoring=useRef(false),queryTyping=useRef(false),retrySeen=useRef(retry);
 const pageKey=JSON.stringify([draftScope,learningKey,browse.facet,browse.query,browse.kind,browse.areaId,browse.sort??'title']),hubKey=JSON.stringify([draftScope,learningKey,'subject-overview',browse.areaId]);
 const livePageKey=useRef(pageKey);livePageKey.current=pageKey;const liveHubKey=useRef(hubKey);liveHubKey.current=hubKey;const stateRef=useRef(state);stateRef.current=state;const loadRef=useRef<(cursor?:string,pages?:number,force?:boolean)=>Promise<void>>(async()=>{});
 const aggregateKey='view:'+pageKey,aggregate=ready?libraryReads.peek<CachedLibraryPage>(draftScope,aggregateKey):undefined;
 const changeBrowse=(next:Partial<LibraryBrowseState>,typing=false)=>{queryTyping.current=typing&&next.query!==undefined&&next.query!==browse.query;change(next)};
 async function load(cursor?:string,restorePages=1,force=false){
  const capturedKey=pageKey,seq=++sequence.current,hadPage=stateRef.current.key===capturedKey&&stateRef.current.page.items.length>0||!!aggregate;
  setState(old=>({key:capturedKey,page:old.key===capturedKey?old.page:aggregate?.value.page??{items:[]},loading:true,error:''}));
  try{
   let next=cursor,accumulated:LibraryItem[]=[],last:Page={items:[]},pagesRead=0;
   do{
    const params=new URLSearchParams({facet:browse.facet,q:browse.query,limit:'30',...learningSpaceParams(learningSelection)});if(browse.areaId&&browse.facet!=='areas')params.set('areaId',browse.areaId);if(browse.kind)params.set('kind',browse.kind);if(browse.sort)params.set('sort',browse.sort);if(next)params.set('cursor',next);
    const value=await libraryReads.read<Page>(draftScope,'request:'+params.toString(),async signal=>libraryResponse<Page>(await generationFetch(draftScope,'/api/library?'+params,{cache:'no-store',signal}),draftScope),{force});
    if(seq!==sequence.current||capturedKey!==livePageKey.current)return;
    last={...value,items:value.items??[]};accumulated.push(...last.items);pagesRead++;next=last.nextCursor??undefined;
    if(!cursor&&!hadPage&&pagesRead<restorePages&&next)setState({key:capturedKey,page:{...last,items:[...new Map(accumulated.map(item=>[item.family+':'+item.id+':'+(item.reference?.id??item.concept?.id??''),item])).values()]},loading:true,error:''});
   }while(next&&pagesRead<Math.min(20,Math.max(1,restorePages)));
   if(seq!==sequence.current||capturedKey!==livePageKey.current)return;
   const previous=stateRef.current.key===capturedKey?stateRef.current.page:aggregate?.value.page,changed=typeof previous?.indexEpoch==='number'&&typeof last.indexEpoch==='number'&&previous.indexEpoch!==last.indexEpoch;
   if(changed){libraryReads.invalidate(draftScope);setHub({key:'',value:{related:[]},error:''});setHubRefresh(value=>value+1);}
   depth.current=cursor?depth.current+pagesRead:pagesRead;entry.current.pages=depth.current;
   const admitted={...last,items:[...new Map([...(cursor?previous?.items??[]:[]),...accumulated].map(item=>[item.family+':'+item.id+':'+(item.reference?.id??item.concept?.id??''),item])).values()]};
   libraryReads.put(draftScope,aggregateKey,{page:admitted,depth:depth.current});setState({key:capturedKey,page:admitted,loading:false,error:''});
  }catch(error){
   if(seq!==sequence.current||capturedKey!==livePageKey.current)return;
   const clear=libraryReadRequiresClear(error),stale=error instanceof LibraryReadFailure&&error.status===409;
   if(clear||stale){libraryReads.invalidate(draftScope);if(clear){setHub({key:'',value:{related:[]},error:''});setHardEpoch(value=>value+1);}}
   setState(old=>({key:capturedKey,page:clear?{items:[]}:old.key===capturedKey?{...old.page,...(stale?{nextCursor:null}:{})}:aggregate?.value.page??{items:[]},loading:false,error:error instanceof Error?error.message:'Library refresh could not complete.'}));
  }
 }
 loadRef.current=load;
 useEffect(()=>{
  libraryReads.activate(draftScope);retainLibraryPermissionEvents();
  const invalidate=()=>{libraryReads.invalidate(draftScope);sequence.current++;hubSequence.current++;setState({key:'',page:{items:[]},loading:true,error:''});setHub({key:'',value:{related:[]},error:''});setHardEpoch(value=>value+1);setRetry(value=>value+1);};
  const permissions=(event:Event)=>{if((event as CustomEvent<{ownerScope?:string}>).detail?.ownerScope===draftScope)invalidate();};
  const committed=(event:Event)=>{const detail=(event as CustomEvent<{ownerScope?:string;command?:{family?:string}}>).detail;if(detail?.ownerScope===draftScope&&['article','area','source'].includes(detail.command?.family??''))invalidate();};
  const foreground=subscribeForeground(()=>{if(ready)void loadRef.current(undefined,depth.current);});
  window.addEventListener('minamo-source-unavailable',permissions);window.addEventListener('minamo-image-unavailable',permissions);window.addEventListener('minamo-record-committed',committed);
  return()=>{sequence.current++;hubSequence.current++;foreground();window.removeEventListener('minamo-source-unavailable',permissions);window.removeEventListener('minamo-image-unavailable',permissions);window.removeEventListener('minamo-record-committed',committed);};
 },[draftScope,ready]);
 useEffect(()=>{
  if(!ready)return;libraryReads.activate(draftScope);const warm=libraryReads.peek<CachedLibraryPage>(draftScope,aggregateKey),force=retrySeen.current!==retry;retrySeen.current=retry;restoring.current=true;depth.current=warm?.value.depth??1;
  if(warm)setState({key:pageKey,page:warm.value.page,loading:true,error:''});
  const pages=warm?.value.depth??entry.current.pages,delay=queryTyping.current?180:0;queryTyping.current=false;
  const timer=setTimeout(()=>void loadRef.current(undefined,pages,force),delay);
  return()=>{clearTimeout(timer);sequence.current++;};
 },[pageKey,retry,ready]);
 useEffect(()=>{
  if(!ready)return;if(!browse.areaId){setHub({key:hubKey,value:{related:[]},error:''});return;}
  libraryReads.activate(draftScope);let disposed=false;const seq=++hubSequence.current,warm=libraryReads.peek<LibraryHub>(draftScope,hubKey);
  if(warm)setHub({key:hubKey,value:warm.value,error:''});
  if(!retry&&!hardEpoch&&!hubRefresh&&areaRecord?.id===browse.areaId&&!areaRecord.trashedAt){const value=libraryHubProjection(areaRecord,records);libraryReads.put(draftScope,hubKey,value);setHub({key:hubKey,value,error:''});return;}
  if(warm&&Date.now()-warm.at<60000&&!retry&&!hardEpoch&&!hubRefresh)return;
  void libraryReads.read<LibraryHub>(draftScope,'request:'+hubKey,async signal=>{const value=await libraryResponse<{record?:WorkspaceRecord;related?:WorkspaceRecord[]}>(await generationFetch(draftScope,'/api/context?'+new URLSearchParams({family:'area',id:browse.areaId,...learningSpaceParams(learningSelection)}),{cache:'no-store',signal}),draftScope);if(value.record?.family!=='area'||value.record.id!==browse.areaId||value.record.trashedAt)throw new LibraryReadFailure('This subject is unavailable.',404);return libraryHubProjection(value.record,value.related??[]);},{reuseMs:60000,force:!!retry||!!hardEpoch||!!hubRefresh}).then(value=>{if(!disposed&&seq===hubSequence.current&&hubKey===liveHubKey.current){libraryReads.put(draftScope,hubKey,value);setHub({key:hubKey,value,error:''});}}).catch(error=>{if(!disposed&&seq===hubSequence.current&&hubKey===liveHubKey.current){const clear=libraryReadRequiresClear(error);if(clear)libraryReads.invalidate(draftScope);setHub(old=>({key:hubKey,value:!clear&&old.key===hubKey?old.value:{related:[]},error:error instanceof Error?error.message:'Subject refresh could not complete.'}));}});
  return()=>{disposed=true;};
 },[draftScope,learningKey,browse.areaId,ready,retry,hardEpoch,hubRefresh]);
 const fallback=aggregate?.value.page??{items:[]},visible=currentLibraryPage(state.key===pageKey?state.page:fallback,state.key===pageKey||aggregate?pageKey:'',pageKey,state.key===pageKey?state.loading:true,state.key===pageKey?state.error:'');
 useEffect(()=>{if(!visible.loading&&restoring.current){restoring.current=false;const frame=requestAnimationFrame(()=>{restoreScroll(entry.current.scrollTop);if(entry.current.focusKey)document.querySelector<HTMLElement>(`[data-library-key="${CSS.escape(entry.current.focusKey)}"]`)?.focus({preventScroll:true});});return()=>cancelAnimationFrame(frame);}},[visible.loading,visible.page]);
 const open=(item:LibraryItem)=>{savePosition(depth.current,item.family+':'+item.id+':'+(item.reference?.id??item.concept?.id??''));const target=libraryItemDestination(item);onNavigate('library',target.id,{recordFamily:target.family,rendition:target.rendition,sectionId:target.sectionId,partId:target.partId,start:target.start,end:target.end});};
 const area=(id:string,_title:string)=>{savePosition(depth.current,'area:'+id+':');onNavigate('library',id,{recordFamily:'area'});};
 const visibleHub=hub.key===hubKey?hub:{value:libraryReads.peek<LibraryHub>(draftScope,hubKey)?.value??{related:[]},error:''};
 return <LibraryCatalogueView browse={browse} page={visible.page} loading={visible.loading} error={visible.error} onChange={changeBrowse} onOpen={open} onArea={area} onRoot={()=>{savePosition(depth.current);onNavigate('library')}} onPreview={onPreview?item=>{savePosition(depth.current);onPreview(libraryItemDestination(item))}:undefined} areaRecord={visibleHub.value.record} records={visibleHub.value.related} hubError={visibleHub.error} onMore={()=>{if(visible.page.nextCursor)void load(visible.page.nextCursor);}} onRetry={()=>setRetry(value=>value+1)}/>;
}
export function areaHubModel(area:WorkspaceRecord,records:WorkspaceRecord[]=[]){
 const prose=(parts:NonNullable<WorkspaceRecord['sections']>[number]['parts'])=>parts.filter(part=>!part.unavailable&&!part.excerpt&&['paragraph','callout'].includes(part.kind)).map(part=>part.text).filter(Boolean);
 const introductorySection=(area.sections??[]).find(section=>!area.links.some(link=>link.family==='article'&&link.sourceContext?.sectionId===section.id));
 const intro=area.body||prose(introductorySection?.parts??[])[0]||'';
 const groups=(area.sections??[]).map(section=>({id:section.id,title:section.title,text:prose(section.parts).join('\n\n'),links:area.links.filter(link=>link.family==='article'&&link.sourceContext?.sectionId===section.id).map(link=>({link,title:records.find(record=>record.family===link.family&&record.id===link.id&&!record.trashedAt)?.title??'Article'}))})).filter(group=>group.links.length);
 return {intro,groups};
}
const shortExcerpt=(text:string,limit=220)=>text.length>limit?text.slice(0,limit).trimEnd()+'…':text;
const exactItemKey=(item:LibraryItem)=>libraryItemHref(item);
type PresentedLibraryItem=LibraryItem&{contextLabel?:string;relationReason?:string};
/** Only accepted source links group/order Articles. The current page keeps its server order otherwise. */
export function subjectLibraryPresentation(items:LibraryItem[],area:WorkspaceRecord,records:WorkspaceRecord[]=[],options:{grouped?:boolean}={grouped:true}){
 const model=areaHubModel(area,records),members=new Map(items.filter(item=>item.family==='article'&&!item.reference&&!item.concept).map(item=>[item.id,item])),usedMembers=new Set<string>(),usedTargets=new Set<string>();
 const eligibleRecords=records.filter(record=>record.family==='article'&&!record.trashedAt),eligible=new Map(eligibleRecords.map(record=>[record.id,record]));
 const member=(record:WorkspaceRecord)=>record.links.some(link=>link.family==='area'&&link.id===area.id&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId)||area.links.some(link=>link.family==='article'&&link.id===record.id&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId);
 const sourceItem=(record:WorkspaceRecord):LibraryItem=>{const text=[record.body,...(record.sections??[]).flatMap(section=>section.parts.filter(part=>!part.unavailable&&!part.excerpt&&part.kind==='paragraph').map(part=>part.text))].find(text=>text.trim());return {family:'article',id:record.id,title:record.title,rendition:record.rendition,summary:text?shortExcerpt(text):undefined,summaryOrigin:'canonical-excerpt',areas:records.filter(candidate=>candidate.family==='area'&&!candidate.trashedAt&&record.links.some(link=>link.family==='area'&&link.id===candidate.id&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId)).map(candidate=>({id:candidate.id,title:candidate.title}))};};
 const linkedItem=(base:LibraryItem,link:WorkspaceRecord['links'][number]):PresentedLibraryItem=>({...base,...(link.reason?{relationReason:link.reason}:{}),...(link.rendition&&link.rendition!==base.rendition?{summary:undefined,summaryOrigin:undefined}:{}),rendition:link.rendition??base.rendition,destination:{family:'article',id:base.id,rendition:link.rendition??base.rendition,sectionId:link.sectionId,partId:link.partId}});
 const related:PresentedLibraryItem[]=[],groups:{id:string;title:string;text:string;items:PresentedLibraryItem[]}[]=[];
 for(const group of model.groups){const entries:PresentedLibraryItem[]=[];for(const {link} of group.links){const base=members.get(link.id),record=eligible.get(link.id);if(base&&options.grouped!==false){const item=linkedItem(base,link),key=exactItemKey(item);usedMembers.add(item.id);if(!usedTargets.has(key)){usedTargets.add(key);entries.push(item);}}else if(record&&!member(record)){const item={...linkedItem(sourceItem(record),link),contextLabel:group.title},key=exactItemKey(item);if(!usedTargets.has(key)){usedTargets.add(key);related.push(item);}}}if(entries.length)groups.push({id:group.id,title:group.title,text:group.text,items:entries});}
 const articles:LibraryItem[]=[];for(const item of items){if(usedMembers.has(item.id))continue;if(item.family==='article'&&item.areas?.some(subject=>subject.id!==area.id)){const key=exactItemKey(item);if(!usedTargets.has(key)){usedTargets.add(key);related.push(item);}}else articles.push(item);}
 return {groups,articles,related};
}
export function AreaHub({area,records,onOpen,returnLibrary}:{area:WorkspaceRecord;records:WorkspaceRecord[];onOpen:(item:LibraryItem)=>void;returnLibrary?:string|null}){
 const selection=useLearningSpace(),model=areaHubModel(area,records),path=withLibraryReturn(learningSpaceHref(libraryDestinationHref({family:'area',id:area.id,rendition:area.rendition}),selection),returnLibrary);
 if(!model.intro&&!area.sections?.length)return null;
 return <section className="le-area-hub" aria-label="Subject overview">{model.intro&&<p className="le-area-introduction">{shortExcerpt(model.intro,240)}</p>}<a className="v2-text-button le-area-about" href={path} onClick={event=>{if(ordinaryClick(event)){event.preventDefault();onOpen({family:'area',id:area.id,title:area.title,rendition:area.rendition});}}}><BookOpen size={15}/>Full introduction<ArrowRight size={14}/></a></section>;
}
/** One Open action per entry; every native link retains the exact admitted destination. */
export function LibrarySearchResults({items,onOpen,onArea,onPreview,areaId='',areasOnly=false,busy=false,label='Library results',headingLevel=2,returnLibrary}:{items:LibraryItem[];onOpen:(item:LibraryItem)=>void;onArea?:(id:string,title:string)=>void;onPreview?:(item:LibraryItem)=>void;areaId?:string;areasOnly?:boolean;busy?:boolean;label?:string;headingLevel?:2|3;returnLibrary?:string|null}){
 const selection=useLearningSpace(),Heading=headingLevel===3?'h3':'h2';
 return <div className={areasOnly?'le-library-areas':'le-library-results'} role="list" aria-busy={busy} aria-label={label}>{items.map(item=>{
  const reference=item.reference??item.concept,summary=typeof item.summary==='string'?item.summary:item.summary?.text,target=libraryItemDestination(item),itemHref=withLibraryReturn(learningSpaceHref(libraryItemHref(item),selection),returnLibrary),guardedTitle=item.matchEvidence?.field==='title'&&new URLSearchParams(itemHref.slice(2)).get('resultIntent')==='current-title',subject=item.family==='area'&&!reference,scopeOnly=subject&&!item.matchEvidence,openHref=scopeOnly?learningSpaceHref(libraryDestinationHref({family:'area',id:item.id}),selection):itemHref,context=(item as PresentedLibraryItem).contextLabel,reason=(item as PresentedLibraryItem).relationReason;
  const open=(event:MouseEvent<HTMLAnchorElement>)=>{if(ordinaryClick(event)&&!guardedTitle){event.preventDefault();scopeOnly&&onArea?onArea(item.id,item.title):onOpen(item);}};
  return <article className={subject?'le-library-area':'le-library-result'} role="listitem" key={item.family+':'+item.id+':'+(reference?.id??'')+':'+libraryItemHref(item)}><div className="le-library-result-copy">{(reference||subject&&!areasOnly)&&<span className="le-library-kind">{reference?referenceLabel(reference.kind):'Subject'}</span>}<Heading><a href={openHref} onClick={open}>{reference?.term??item.title}</a></Heading>{reference?.signature&&<pre className="le-command-code"><code>{reference.signature}</code></pre>}{item.matchEvidence?<><SearchMatch match={item.matchEvidence}/>{reference?.definition&&<p className="le-library-summary">{reference.definition}</p>}</>:(reference?.definition??summary)?<p className="le-library-summary" data-summary-origin={item.summaryOrigin??(typeof item.summary==='object'?item.summary.origin:undefined)}>{shortExcerpt(reference?.definition??summary!,240)}</p>:null}{reference?.usage&&<p className="le-library-reference-usage">{reference.usage}</p>}{reference?.environment&&<small className="le-library-environment">{reference.environment}</small>}{reference&&<p className="le-library-in-article">In {item.title}</p>}{(reason||context)&&<p className="le-library-context">{reason?shortExcerpt(reason,160):'Linked in '+context}</p>}{item.areas?.some(area=>area.id!==areaId)&&<div className="le-library-memberships" role="group" aria-label="Other subjects"><span>Also in</span>{item.areas.filter(area=>area.id!==areaId).map(area=>{const path=learningSpaceHref(libraryDestinationHref({family:'area',id:area.id}),selection);return <a key={area.id} href={path} onClick={event=>{if(ordinaryClick(event)){event.preventDefault();onArea?onArea(area.id,area.title):onOpen({family:'area',id:area.id,title:area.title});}}}>{area.title}<ChevronRight size={12}/></a>;})}</div>}{item.topicCount!==undefined&&<p className="le-library-count">{item.topicCount} {item.topicCount===1?'article':'articles'}</p>}</div><div className="le-library-result-actions"><a href={openHref} className="v2-text-button le-library-open" data-library-key={item.family+':'+item.id+':'+(reference?.id??'')} aria-label={'Open '+(reference?.term??item.title)} onClick={open}>Open<ArrowRight size={15}/></a>{onPreview&&!subject&&<button type="button" className="v2-text-button le-library-preview" aria-label={'Preview '+(reference?.term??item.title)} onClick={()=>onPreview(item)}>Preview</button>}</div></article>;
 })}</div>;
}

/** The SSR snapshot is canonical and content-free; hydration then admits the actual local route context. */
function subscribeLibraryLocation(changed:()=>void){window.addEventListener('popstate',changed);return()=>window.removeEventListener('popstate',changed);}
function useNativeLibraryReturn(browse:LibraryBrowseState,selection:ReturnType<typeof useLearningSpace>){
 const fallback=new URLSearchParams({view:'library',...learningSpaceParams(selection),...(browse.areaId?{family:'area',id:browse.areaId}:{})}),locationQuery=useSyncExternalStore(subscribeLibraryLocation,()=>window.location.search,()=>fallback.toString());
 return libraryReturnFromCatalogue(new URLSearchParams(locationQuery),browse)??libraryReturnFromCatalogue(fallback,browse);
}
/** The catalogue has one scoped search and one compact view filter. */
export function LibraryCatalogueView({browse,page,loading,error,onChange,onOpen,onMore,onRetry,onArea,onRoot,onPreview,areaRecord,records=EMPTY_RECORDS,hubError=''}:{browse:LibraryBrowseState;page:Page;loading:boolean;error:string;onChange:(next:Partial<LibraryBrowseState>,typing?:boolean)=>void;onOpen:(item:LibraryItem)=>void;onMore:()=>void;onRetry:()=>void;onArea?:(id:string,title:string)=>void;onRoot?:()=>void;onPreview?:(item:LibraryItem)=>void;areaRecord?:WorkspaceRecord;records?:WorkspaceRecord[];hubError?:string}){
 const selection=useLearningSpace(),languageLibrary=selection.learningSpace==='languages',references=browse.facet==='references',searching=browse.facet==='search',hasQuery=!!browse.query.trim(),subject=!!browse.areaId,scopeArea=(id:string,title:string)=>onArea?onArea(id,title):onChange({areaId:id,areaTitle:title,facet:'topics',kind:'',query:''});
 const root=()=>subject&&onRoot?onRoot():onChange({facet:'areas',kind:'',areaId:'',areaTitle:''}),showSubject=subject&&browse.facet==='topics'&&!hasQuery&&areaRecord?.id===browse.areaId,sortValue=page.order&&['title','updated','authored'].includes(page.order.kind)?page.order.kind:browse.sort==='authored'&&!page.order?.authoredAvailable?'title':browse.sort??'title',arranged=showSubject?subjectLibraryPresentation(page.items,areaRecord,records,{grouped:!page.order||sortValue==='authored'}):undefined;
 const returnLibrary=useNativeLibraryReturn(browse,selection);
 const viewOptions=[...(searching||hasQuery?[{value:'search',label:'All matches'}]:[]),...(!subject?[{value:'areas',label:'Subjects'}]:[]),{value:'topics',label:'Articles'},{value:'references',label:'Reference entries'}];
 const searchLabel=references?'Find a name or alias':subject?'Search this subject':browse.facet==='topics'?'Search Library articles':'Search the Library';
 return <section className="v2-library-browser" aria-label="Library catalogue"><header className="le-library-heading">{subject&&<nav className="le-library-location" aria-label="Library location"><a href={learningSpaceHref('/?view=library',selection)} onClick={event=>{if(ordinaryClick(event)){event.preventDefault();root();}}}>Library</a><ChevronRight size={13} aria-hidden="true"/><span aria-current="page">{browse.areaTitle||'Subject'}</span></nav>}<h1>{subject?browse.areaTitle||'Subject':'Library'}</h1>{showSubject&&<AreaHub area={areaRecord} records={records} onOpen={onOpen} returnLibrary={returnLibrary}/>}</header>
  <div className="le-library-toolbar"><label className="le-library-search"><span className="v2-sr-only">{searchLabel}</span><Search size={18} aria-hidden="true"/><input type="search" aria-label={searchLabel} maxLength={200} value={browse.query} onChange={event=>onChange(libraryQueryChange(browse,event.target.value),true)} placeholder={references?'Name or alias':subject?'Search this subject':'Search the Library'}/>{browse.query&&<button type="button" className="v2-icon" aria-label="Clear Library search" onClick={()=>onChange({query:''})}><X size={18}/></button>}</label><div className="le-library-filters"><label><span className="v2-sr-only">Show</span><select aria-label="Show Library entries" value={browse.facet} onChange={event=>onChange(libraryFilterChange(browse,event.target.value as LibraryBrowseState['facet']))}>{viewOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>{references&&<label><span className="v2-sr-only">Reference kind</span><select aria-label="Reference kind" value={browse.kind} onChange={event=>onChange(libraryFilterChange(browse,'references',event.target.value))}>{kinds.filter(kind=>!languageLibrary||['','concept','language-syntax'].includes(kind.kind)).map(kind=><option key={kind.kind} value={kind.kind}>{kind.label}</option>)}</select></label>}{!hasQuery&&!references&&!searching&&<label><span className="v2-sr-only">Order</span><select aria-label={browse.facet==='areas'?'Subject order':'Article order'} value={sortValue} onChange={event=>onChange({sort:event.target.value as LibraryBrowseState['sort']})}><option value="title">Title A–Z</option><option value="updated">Recently updated</option>{page.order?.authoredAvailable&&<option value="authored">Authored order</option>}</select></label>}</div></div>
  {(hasQuery||loading&&page.items.length>0)&&<div className="le-library-query-status" role="status">{loading&&page.items.length>0?'Refreshing…':loading?'Searching…':hasQuery?`${page.items.length} ${page.items.length===1?'match':'matches'} loaded${page.nextCursor?' · More results can be checked':''}`:''}{subject&&hasQuery&&<a href={learningSpaceHref(librarySearchHref(browse.query),selection)}>Search across the Library<ArrowRight size={13}/></a>}</div>}
  {hubError&&showSubject&&<div className="le-hub-unavailable" role="status"><p>The subject introduction could not be refreshed. Articles remain available.</p><button type="button" className="v2-text-button" onClick={onRetry}>Retry introduction</button></div>}
  {arranged?<>{arranged.groups.map(group=><section className="le-library-authored-group" key={group.id}><header><h2>{group.title}</h2>{group.text&&<p>{shortExcerpt(group.text,160)}</p>}</header><LibrarySearchResults items={group.items} headingLevel={3} onOpen={onOpen} onArea={scopeArea} onPreview={onPreview} returnLibrary={returnLibrary} areaId={browse.areaId} busy={loading} label={group.title+' articles'}/></section>)}{arranged.articles.length>0&&<section className="le-library-subject-articles">{arranged.groups.length>0&&<h2 className="le-library-group-heading">Articles</h2>}<LibrarySearchResults items={arranged.articles} onOpen={onOpen} onArea={scopeArea} onPreview={onPreview} returnLibrary={returnLibrary} areaId={browse.areaId} busy={loading} label="Subject articles"/></section>}{arranged.related.length>0&&<section className="le-library-related"><h2 className="le-library-group-heading">Related articles</h2><LibrarySearchResults items={arranged.related} headingLevel={3} onOpen={onOpen} onArea={scopeArea} onPreview={onPreview} returnLibrary={returnLibrary} areaId={browse.areaId} busy={loading} label="Related articles"/></section>}</>:<LibrarySearchResults items={page.items} onOpen={onOpen} onArea={scopeArea} onPreview={onPreview} returnLibrary={returnLibrary} areaId={browse.areaId} areasOnly={browse.facet==='areas'} busy={loading} label={hasQuery?'Library search matches':browse.facet==='areas'?'Subjects':'Library entries'}/>}
  {loading&&!page.items.length&&<LoadingSkeleton kind={browse.facet==='areas'?'cards':'outline'} label={hasQuery?'Searching the Library…':subject?'Loading articles…':'Loading Library…'}/>}
  {!loading&&!error&&!page.items.length&&!page.nextCursor&&!arranged?.related.length&&!arranged?.groups.length&&<div className="le-library-empty"><p>{references?'No reference entries match this search.':browse.facet==='areas'?'No subjects match this search.':hasQuery?'No articles match this search.':'No articles are available in this view.'}</p>{!hasQuery&&!subject&&<button type="button" className="v2-secondary" onClick={()=>window.dispatchEvent(new CustomEvent('minamo-beta-open',{detail:'exchange'}))}>Add material with GPT</button>}{hasQuery&&!searching&&<button type="button" className="v2-secondary" onClick={()=>onChange(libraryFilterChange(browse,'search'))}>Search all Library entries for “{browse.query}”</button>}{hasQuery&&<button type="button" className="v2-text-button" onClick={()=>onChange({query:'',kind:''})}>Clear search and filters</button>}</div>}
  {!loading&&!error&&page.nextCursor&&page.searchIncomplete&&<p className="le-library-status" role="status">{page.items.length?'More Library material remains to be searched.':'No matches in the material checked so far. More Library material remains to be searched.'}</p>}
  {error&&<div className="le-library-error" role="alert"><p>{page.items.length?'This list could not be refreshed. '+error:error}</p><button type="button" className="v2-secondary" onClick={onRetry}>Retry</button></div>}
  <p className="le-library-status">{page.items.length} loaded{page.nextCursor?' · more available':''}</p>{page.nextCursor&&<button type="button" disabled={loading} className="v2-secondary le-library-more" onClick={onMore}>{loading?'Loading…':page.searchIncomplete?'Search more Library material':`More ${searching?'results':references?'reference entries':browse.facet==='areas'?'subjects':'articles'}`}<ArrowRight size={15}/></button>}
 </section>;
}
function referenceLabel(kind?:string){return kind==='shell-command'?'Command':kind==='python-function'?'Function':kind==='api'?'API':kind==='language-syntax'?'Language syntax':'Concept';}

/** Preview-only corpus adapter. Production always uses the paged authenticated query. */
export function localLibraryItems(records:import('../lib/contracts').WorkspaceRecord[],browse:LibraryBrowseState):LibraryItem[]{
 const areas=records.filter(record=>record.family==='area'&&!record.trashedAt),articles=records.filter(record=>record.family==='article'&&!record.trashedAt);
 const membership=(article:typeof articles[number],area:typeof areas[number])=>article.links.some(link=>link.family==='area'&&link.id===area.id&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId)||area.links.some(link=>link.family==='article'&&link.id===article.id&&!link.sourceContext&&!link.rendition&&!link.sectionId&&!link.partId);
 const localSummary=(record:WorkspaceRecord)=>{const authored=(record as WorkspaceRecord&{catalogue?:{edition?:{summary?:{text:string;origin:string}}}}).catalogue?.edition?.summary;if(authored)return {summary:authored.text,summaryOrigin:authored.origin};const prose=[record.body,...(record.sections??[]).flatMap(section=>section.parts.filter(part=>!part.unavailable&&!part.excerpt&&part.kind==='paragraph').map(part=>part.text))].find(value=>value.trim());return {summary:prose?.slice(0,280),summaryOrigin:'canonical-excerpt'};};
 const query=normaliseSearchQuery(browse.query),rank=(items:LibraryItem[])=>items.sort((a,b)=>(a.matchEvidence?searchEvidenceRank(a.matchEvidence):9)-(b.matchEvidence?searchEvidenceRank(b.matchEvidence):9)||Number(!a.reference)-Number(!b.reference)||(a.family+':'+a.id+':'+(a.reference?.id??'')).localeCompare(b.family+':'+b.id+':'+(b.reference?.id??'')));
 const areaItems=()=>areas.filter(area=>(!browse.areaId||area.id===browse.areaId)&&(!query||!!recordSearchEvidence(area,browse.query))).map(area=>({...(query?{matchEvidence:recordSearchEvidence(area,browse.query)}:{}),family:'area' as const,id:area.id,title:area.title,...localSummary(area),rendition:area.rendition,topicCount:articles.filter(article=>membership(article,area)).length}));
 if(browse.facet==='areas')return rank(areaItems());
 const scoped=articles.filter(article=>!browse.areaId||areas.some(area=>area.id===browse.areaId&&membership(article,area)));
 const item=(article:typeof articles[number]):LibraryItem=>({...(query?{matchEvidence:recordSearchEvidence(article,browse.query)}:{}),family:'article',id:article.id,title:article.title,...localSummary(article),rendition:article.rendition,areas:areas.filter(area=>membership(article,area)).map(area=>({id:area.id,title:area.title}))});
 const topics=scoped.filter(article=>!query||!!recordSearchEvidence(article,browse.query)).map(item);
 if(browse.facet==='topics')return rank(topics);
 const references=scoped.flatMap(article=>(article.concepts??[]).filter(concept=>(!browse.kind||(browse.kind==='functions'?['python-function','api'].includes(concept.kind??'concept'):(concept.kind??'concept')===browse.kind))&&(!query||!!referenceNameMatch(concept,browse.query))).map(concept=>({...item(article),...(query?{matchEvidence:recordSearchEvidence({...article,concepts:[concept]},browse.query)}:{}),reference:{...concept,kind:concept.kind??'concept',target:{rendition:article.rendition!,sectionId:concept.sectionId,partId:concept.partId}}})));
 return rank(browse.facet==='search'?[...references,...topics,...areaItems()]:references);
}
