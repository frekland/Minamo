import type {Family,RecordLink,SelectedContextRef,WorkspaceRecord} from './contracts';
import {DomainError,readRecord,readRendition} from './domain';
import {atlasRecordLinks} from './atlas/project';
import {matchesLearningScope,type LearningScopeQuery} from './learning-spaces';
import {buildLinkedReadingLink,buildRecordLink} from './reading-links';

export type RelationshipReceipt={family:Family;id:string;rev:number;rendition?:string;actor?:WorkspaceRecord['actor'];synthetic?:boolean};
export type SavedRelationship={from:RelationshipReceipt;to:RelationshipReceipt;title:string;synthetic:boolean;actor:WorkspaceRecord['actor'];quality:'saved-record-link'|'exact-edition'|'older-edition'|'saved-inbound-record-link'|'derived-bounded-path';direction?:'incoming';path:RecordLink[];reason:string;destination:string;opensCurrentSource:boolean;citedTarget?:RelationshipReceipt;citedProject?:RelationshipReceipt;citedDestination?:string;newerEdition?:{source:RelationshipReceipt;destination:string}};
type Position={root:number;phase:'outgoing'|'incoming';after:string;offset:number};
type Cursor={version:1;owner:string;snapshot:number;selection:string;position:Position};
const BUDGET=24,PAGE=12;
const receipt=(r:WorkspaceRecord):RelationshipReceipt=>({family:r.family,id:r.id,rev:r.rev,...(r.rendition?{rendition:r.rendition}:{})});
const unavailable=(r:WorkspaceRecord)=>!!r.trashedAt||r.family==='flag'&&r.bookmark?.active===false||!!r.source?.excerpt?.unavailable||!!r.sections?.some(s=>s.parts.some(p=>p.unavailable));
export function savedReferenceLinks(record:WorkspaceRecord){const links=atlasRecordLinks(record);if(record.anchor)links.push({family:record.anchor.recordFamily??'article',id:record.anchor.articleId,rendition:record.anchor.rendition,sectionId:record.anchor.sectionId,partId:record.anchor.partId});return links;}
function exactLocation(record:WorkspaceRecord,link:RecordLink){if(!link.sectionId)return !link.partId;const section=record.sections?.find(s=>s.id===link.sectionId);return !!section&&(!link.partId||section.parts.some(p=>p.id===link.partId&&!p.unavailable));}
function decode(raw:string):Cursor{try{const c=JSON.parse(atob(raw.slice(5)));if(c.version!==1||typeof c.owner!=='string'||!Number.isSafeInteger(c.snapshot)||typeof c.selection!=='string'||!Number.isSafeInteger(c.position?.root)||c.position.root<0||!['outgoing','incoming'].includes(c.position.phase)||typeof c.position.after!=='string'||!Number.isSafeInteger(c.position.offset)||c.position.offset<0)throw Error();return c;}catch{throw new DomainError(400,'invalid_relationship_cursor','Restart the saved relationship read.');}}
/** One read-side projection of intentional saved references. SQL only shortlists
 * identities; current ownership, Source rights, exact editions and locations are
 * independently admitted before any title or citation leaves this service. */
export async function readSavedRelationships(env:Cloudflare.Env,owner:string,refs:SelectedContextRef[],scope:LearningScopeQuery,snapshot:number,cursor?:string,policyIdentity?:string){
 const selection=JSON.stringify([refs,scope,policyIdentity]);let position:Position={root:0,phase:'outgoing',after:'',offset:0};
 if(cursor){const c=decode(cursor);if(c.owner!==owner||c.snapshot!==snapshot||c.selection!==selection)throw new DomainError(409,'relationship_context_changed','Work, rights or the selected context changed. Restart the relationship read.');position=c.position;}
 const cache=new Map<string,Promise<WorkspaceRecord|null>>();
 async function admit(link:RecordLink){const key=JSON.stringify([link.family,link.id,link.rendition]);if(!cache.has(key))cache.set(key,(async()=>{const current=await readRecord(env,owner,link.family,link.id);if(!current||unavailable(current)||!matchesLearningScope(current,scope))return null;const exact=link.rendition?await readRendition(env,owner,link.id,link.rendition,link.family):current;return exact&&!unavailable(exact)&&matchesLearningScope(exact,scope)?exact:null;})());const record=await cache.get(key)!;return record&&exactLocation(record,link)?record:null;}
 const roots:{ref:SelectedContextRef;via?:RecordLink;origin?:WorkspaceRecord}[]=refs.map(ref=>({ref}));
 // Preserve the established two-reference Note path without turning it into
 // a new persisted edge. Direct incoming discovery remains one hop only.
 for(const ref of refs){const origin=await admit(ref);if(origin)for(const via of savedReferenceLinks(origin))if(via.family==='note')roots.push({ref:via,via,origin});}
 const relations:SavedRelationship[]=[];let checked=0;
 async function outgoing(root:WorkspaceRecord,link:RecordLink,via?:RecordLink,origin?:WorkspaceRecord){const target=await admit(link);if(!target)return;const current=link.rendition?await admit({family:link.family,id:link.id}):target;const pinned=!!link.rendition,isCurrent=current?.rendition===target.rendition;relations.push({from:receipt(origin??root),to:receipt(target),title:target.title,actor:target.actor,synthetic:target.synthetic,quality:via?'derived-bounded-path':!pinned?'saved-record-link':isCurrent?'exact-edition':'older-edition',path:via?[via,link]:[link],reason:via?'Two independently admitted saved references; no causal connection or endorsement is inferred.':link.reason||'Explicit saved reference; no agreement or observed result is inferred.',destination:pinned?buildLinkedReadingLink(link):buildRecordLink(link),opensCurrentSource:isCurrent,...(pinned&&current&&current.rev>target.rev?{newerEdition:{source:receipt(current),destination:buildRecordLink(current)}}:{})});}
 while(position.root<roots.length&&checked<BUDGET&&relations.length<PAGE){
  const {ref:requested,via,origin}=roots[position.root],root=await admit(requested);if(!root){position={root:position.root+1,phase:'outgoing',after:'',offset:0};continue;}
  if(position.phase==='outgoing'){
   const links=savedReferenceLinks(root);while(position.offset<links.length&&checked<BUDGET&&relations.length<PAGE){const link=links[position.offset++];checked++;await outgoing(root,link,via,origin);}
   if(position.offset<links.length)break;if(via){position={root:position.root+1,phase:'outgoing',after:'',offset:0};continue;}position={...position,phase:'incoming',after:'',offset:0};
  }
  if(checked>=BUDGET||relations.length>=PAGE)break;
  // json_tree recognises typed refs in diagrams, composition, pins and links;
  // excerpt and passage-anchor identities have their own explicit fields.
  const rows=(await env.DB!.prepare(`SELECT r.family,r.id FROM v2_records r WHERE r.owner=? AND r.trashed_at IS NULL AND (r.family||':'||r.id)>=? AND NOT(r.family=? AND r.id=?) AND (
   EXISTS(SELECT 1 FROM json_tree(r.data) j WHERE j.type='object' AND json_extract(j.value,'$.family')=? AND json_extract(j.value,'$.id')=?)
   OR (?='source' AND EXISTS(SELECT 1 FROM json_tree(r.data) j WHERE j.type='object' AND json_extract(j.value,'$.sourceId')=?))
   OR (COALESCE(json_extract(r.data,'$.anchor.recordFamily'),'article')=? AND json_extract(r.data,'$.anchor.articleId')=?)
  ) ORDER BY r.family,r.id LIMIT ?`).bind(owner,position.after,root.family,root.id,root.family,root.id,root.family,root.id,root.family,root.id,BUDGET+1).all<{family:Family;id:string}>()).results;
  let stopped=false;
  for(const row of rows){const identity=row.family+':'+row.id;if(identity===position.after&&position.offset===0)continue;
   if(checked>=BUDGET||relations.length>=PAGE){stopped=true;break;}checked++;
   const source=await admit(row);const links=source?savedReferenceLinks(source):[];const start=identity===position.after?position.offset:0;
   for(let i=start;i<links.length;i++){
    if(relations.length>=PAGE){position={...position,after:identity,offset:i};stopped=true;break;}
    const link=links[i];if(link.family!==root.family||link.id!==root.id||requested.rendition&&link.rendition&&requested.rendition!==link.rendition)continue;
    const cited=await admit(link);if(!cited)continue;
    // An unpinned incoming reference follows current material and cannot
    // masquerade as a citation of an explicitly selected historical edition.
    if(requested.rendition&&cited.rendition!==requested.rendition)continue;
    const citedTarget=receipt(cited);relations.push({from:receipt(cited),to:receipt(source!),title:source!.title,actor:source!.actor,synthetic:source!.synthetic,quality:'saved-inbound-record-link',direction:'incoming',citedTarget,...(root.family==='journey'?{citedProject:citedTarget}:{}),citedDestination:link.rendition?buildLinkedReadingLink(link):buildRecordLink(link),path:via?[via,link]:[link],reason:via?'Two independently admitted saved references; no causal connection or endorsement is inferred.':link.reason||'This source explicitly references the selected material; no endorsement is inferred.',destination:buildRecordLink(source!,{rendition:source!.rendition}),opensCurrentSource:true});
   }
   if(stopped)break;position={...position,after:identity,offset:0};
  }
  if(stopped)break;
  position={root:position.root+1,phase:'outgoing',after:'',offset:0};
 }
 const more=position.root<roots.length;
 return {relations,coverage:{complete:!more,checked,limit:PAGE,scanLimit:BUDGET,...(more?{nextCursor:'rel1.'+btoa(JSON.stringify({version:1,owner,snapshot,selection,position} satisfies Cursor))}:{}),notice:'Only intentional saved references are enumerated. Current rights apply to every edition; matching titles and co-visits create no relationship.'}};
}
