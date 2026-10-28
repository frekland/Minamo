import type {CommandReceipt,Family,RecordLink,WorkspaceCommand,WorkspaceRecord} from './contracts';
import {buildAnchorLink,buildDisplayReturnLink,buildRecordLink} from './reading-links';
export const PERSONAL_FAMILIES=['note','annotation','flag','run'] as const;
export type WorkTab='all'|'note'|'annotation'|'flag'|'run'|'unlinked'|'trash';
export type WorkSort='updated'|'created'|'title'|'kind';
export const workKey=(record:Pick<WorkspaceRecord,'family'|'id'>)=>record.family+':'+record.id;
export function flagIsActive(record:WorkspaceRecord){return record.family!=='flag'||(record as WorkspaceRecord & {bookmark?:{active?:boolean}}).bookmark?.active!==false;}
export function contextReferences(record:WorkspaceRecord,known:WorkspaceRecord[]=[]):RecordLink[]{const values=[...record.links];if(record.anchor){values.push({family:record.anchor.recordFamily??'article',id:record.anchor.articleId});const display=record.anchor.displayReturn;if(display)values.push({family:display.recordFamily,id:display.id});}const bookmark=(record as WorkspaceRecord & {bookmark?:{target?:{kind:string;family?:Family;id?:string}}}).bookmark?.target;if(bookmark?.kind==='record'&&bookmark.family&&bookmark.id)values.push({family:bookmark.family,id:bookmark.id});const directKeys=new Set(values.map(workKey));for(const parent of known)if(!parent.trashedAt&&directKeys.has(workKey(parent)))values.push(...parent.links.filter(link=>link.family==='journey'||link.family==='area'));return [...new Map(values.map(ref=>[workKey(ref),{family:ref.family,id:ref.id}])).values()];}
export function workRefFromKey(key:string):RecordLink|undefined{const index=key.indexOf(':');if(index<1)return;const family=key.slice(0,index),id=key.slice(index+1);if(!['journey','investigation','article','area','note','annotation','flag','source','experiment','run'].includes(family)||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(id))return;return{family:family as Family,id};}
export function isUnlinked(record:WorkspaceRecord){return contextReferences(record).length===0;}
export function workRows(records:WorkspaceRecord[],{tab='all',text='',context,topic,sort='updated',contextRecords=[]}:{tab?:WorkTab;text?:string;context?:RecordLink;topic?:RecordLink;sort?:WorkSort;contextRecords?:WorkspaceRecord[]}={}){
 const needle=text.trim().toLocaleLowerCase();const personal=(record:WorkspaceRecord)=>(PERSONAL_FAMILIES as readonly string[]).includes(record.family);
 return records.filter(record=>tab==='trash'?!!record.trashedAt||(record.family==='flag'&&!flagIsActive(record)):personal(record)&&!record.trashedAt&&flagIsActive(record)&&(tab==='all'||tab==='unlinked'||record.family===tab)).filter(record=>tab!=='unlinked'||isUnlinked(record)).filter(record=>!needle||(record.title+'\n'+record.body+'\n'+(record.anchor?.quote??'')).toLocaleLowerCase().includes(needle)).filter(record=>!context||contextReferences(record,contextRecords).some(ref=>workKey(ref)===workKey(context))).filter(record=>!topic||record.links.some(ref=>workKey(ref)===workKey(topic))).sort((a,b)=>sort==='title'?a.title.localeCompare(b.title)||workKey(a).localeCompare(workKey(b)):sort==='kind'?a.family.localeCompare(b.family)||b.updatedAt.localeCompare(a.updatedAt):sort==='created'?b.createdAt.localeCompare(a.createdAt)||workKey(a).localeCompare(workKey(b)):b.updatedAt.localeCompare(a.updatedAt)||workKey(a).localeCompare(workKey(b)));
}
export function workReturnLinks(record:WorkspaceRecord){const own=buildRecordLink(record);if(record.anchor){const capture=record.family==='annotation'||record.family==='flag'?{family:record.family,id:record.id}:undefined;return{record:own,origin:buildAnchorLink(record.anchor,capture),display:buildDisplayReturnLink(record.anchor,capture)}}const bookmark=(record as WorkspaceRecord & {bookmark?:{target?:{kind:string;family?:Family;id?:string}}}).bookmark?.target;if(bookmark?.kind==='record'&&bookmark.family&&bookmark.id)return{record:own,origin:buildRecordLink({family:bookmark.family,id:bookmark.id}),display:undefined};const experiment=record.family==='run'?record.links.find(link=>link.family==='experiment'):undefined;return{record:own,origin:experiment?buildRecordLink(experiment):undefined,display:undefined};}
/** Ordinary annotation navigation preserves the captured edition, never guesses latest text. */
export function annotationDestination(record:WorkspaceRecord):{kind:'display'|'origin';href:string}|null{
 if(record.family!=='annotation'||record.trashedAt||!record.anchor?.quote)return null;
 const links=workReturnLinks(record);return links.display?{kind:'display',href:links.display}:links.origin?{kind:'origin',href:links.origin}:null;
}
export function organiserInitialTab(initialTrash:boolean,explicit?:WorkTab,stored?:WorkTab):WorkTab{
 if(initialTrash)return 'trash';if(explicit&&['all','note','annotation','flag','run','unlinked','trash'].includes(explicit))return explicit;
 return stored&&['all','note','annotation','flag','run','unlinked','trash'].includes(stored)?stored:'all';
}
export function disposalLabel(record:WorkspaceRecord){return record.family==='flag'?'Unflag':record.family==='annotation'?'Delete annotation':record.family==='note'?'Move Note to Trash':record.family==='run'?'Move Run to Trash':'Move to Trash';}
export type OrganiserTask={quick?:boolean;command:WorkspaceCommand;state:'ready'|'saving'|'committed'|'conflict'|'uncertain'|'rejected';message?:string};
/** One immutable command per selected record. Related records are never rewritten as a batch. */
export function relationTask(record:WorkspaceRecord,target:RecordLink,mode:'add'|'remove',operationId:string):OrganiserTask|null{
 if(record.trashedAt||!flagIsActive(record))throw Error('Restore this record before changing its connections.');if(workKey(record)===workKey(target))throw Error('A record cannot be connected to itself.');const matches=record.links.filter(link=>workKey(link)===workKey(target));if(matches.length>1)throw Error('Inspect this record’s duplicate connections individually before changing them.');if(mode==='add'&&matches.length||mode==='remove'&&!matches.length)return null;
 return{state:'ready',command:{operationId,action:'update',family:record.family,id:record.id,expectedRev:record.rev,data:{patch:mode==='add'?[{op:'upsertRelation',link:structuredClone(target)}]:[{op:'removeRelation',match:structuredClone(matches[0])}]}}};
}
export function disposalTask(record:WorkspaceRecord,operationId:string,restore=false):OrganiserTask{if(restore&&record.family==='flag')throw Error('Return to the original target to Flag it again.');return{state:'ready',command:{operationId,action:restore?'restore':'trash',family:record.family,id:record.id,expectedRev:record.rev}};}
export function taskReceipt(task:OrganiserTask,receipt:CommandReceipt):OrganiserTask{if(receipt.operationId!==task.command.operationId||!['committed','conflict'].includes(receipt.status)||receipt.recordRef&&(receipt.recordRef.family!==task.command.family||receipt.recordRef.id!==task.command.id)||receipt.record&&(receipt.record.family!==task.command.family||receipt.record.id!==task.command.id)||receipt.bookmark?.flagRef&&(receipt.bookmark.flagRef.family!==task.command.family||receipt.bookmark.flagRef.id!==task.command.id))throw Error('The receipt did not match this retained operation.');return{...task,state:receipt.status==='committed'?'committed':'conflict',message:receipt.status==='committed'?'Server acknowledged this record.':'Conflict confirmed. Review its current revision before preparing another change.'};}
/** Only independently authored Annotation prose may join a quick edit command.
 * Source quotations and other record content never enter this recovery payload. */
export function annotationEditTask(record:WorkspaceRecord,body:string,operationId:string):OrganiserTask{
 if(record.family!=='annotation'||record.trashedAt||!body.trim()||body.length>4000)throw Error('Use a nonempty annotation of up to 4,000 characters.');
 return {quick:true,state:'ready',command:{operationId,action:'update',family:'annotation',id:record.id,expectedRev:record.rev,data:{body}}};
}
export function taskBlocksRecord(task:OrganiserTask,record:Pick<WorkspaceRecord,'family'|'id'>){return workKey(task.command as Pick<WorkspaceRecord,'family'|'id'>)===workKey(record)&&['ready','saving','uncertain'].includes(task.state);}
/** New independent rows never replace another in-flight operation. Only old,
 * resolved receipts can be pruned to keep the existing 30-operation budget. */
export function appendOrganiserTask(tasks:OrganiserTask[],task:OrganiserTask){
 if(tasks.some(old=>taskBlocksRecord(old,task.command as Pick<WorkspaceRecord,'family'|'id'>)))throw Error('This record already has a retained change. Check its result first.');
 const unsettled=tasks.filter(old=>['ready','saving','uncertain'].includes(old.state)),resolved=tasks.filter(old=>!['ready','saving','uncertain'].includes(old.state));
 if(unsettled.length>=30)throw Error('Check a pending change before starting another.');
 return [...resolved.slice(-Math.max(0,29-unsettled.length)),...unsettled,task].slice(-30);
}
/** Apply only a matching acknowledged action to already-loaded rows. A newer
 * rights-filtered current projection always wins over an old replay receipt. */
export function preferOrganiserRecord(previous:WorkspaceRecord,next:WorkspaceRecord){
 if(next.rev!==previous.rev)return next.rev>previous.rev;
 if(previous.family!=='flag')return true;
 const old=(previous as WorkspaceRecord&{bookmark?:{targetRev?:number}}).bookmark?.targetRev,value=(next as WorkspaceRecord&{bookmark?:{targetRev?:number}}).bookmark?.targetRev;
 return old===undefined||value!==undefined&&value>=old;
}
export function applyOrganiserReceipt(rows:WorkspaceRecord[],command:WorkspaceCommand,receipt:CommandReceipt):WorkspaceRecord[]{
 if(receipt.status!=='committed'||receipt.operationId!==command.operationId||!command.family||!command.id||receipt.recordRef&&(receipt.recordRef.family!==command.family||receipt.recordRef.id!==command.id))return rows;
 const actual=[receipt.record,...(receipt.records??[])].find(record=>!!record&&record.family===command.family&&record.id===command.id);
 const ref=receipt.recordRef?.family===command.family&&receipt.recordRef.id===command.id?receipt.recordRef:receipt.recordRefs?.find(ref=>ref.family===command.family&&ref.id===command.id);
 const committedRev=ref?.rev??(typeof command.expectedRev==='number'?command.expectedRev+1:undefined);
 return rows.map(record=>{
  if(record.family!==command.family||record.id!==command.id)return record;
  if(actual)return preferOrganiserRecord(record,actual)?actual:record;
  const currentBookmark=(record as WorkspaceRecord&{bookmark?:{targetKey?:string;targetRev?:number}}).bookmark;if(record.family==='flag'&&receipt.bookmark&&((currentBookmark?.targetKey&&currentBookmark.targetKey!==receipt.bookmark.targetKey)||(currentBookmark?.targetRev??-1)>receipt.bookmark.targetRev))return record;
  if(committedRev===undefined||record.rev>committedRev)return record;
  // This ephemeral tombstone is a known acknowledged action, not an invented
  // server reading or new personal prose; subsequent exact reads replace it.
  if(command.action==='trash')return {...record,rev:committedRev,...(record.family==='flag'?{bookmark:{...(record as WorkspaceRecord&{bookmark?:object}).bookmark,...receipt.bookmark,active:false}}:{trashedAt:record.trashedAt??'acknowledged'})} as WorkspaceRecord;
  if(command.action==='restore')return {...record,rev:committedRev,trashedAt:null};
  if(command.action==='update'&&record.family==='annotation'&&typeof command.data?.body==='string')return {...record,rev:committedRev,body:command.data.body};
  return record;
 });
}
/** Recovery contains relationship/Trash identities and explicit Annotation edits,
 * never imported quotation, arbitrary Note bodies or broad record snapshots. */
export function retainableTasks(tasks:OrganiserTask[]){return {version:1,tasks:restoreOrganiserTasks({version:1,tasks:tasks.slice(0,30)}).map(task=>({command:task.command,state:task.state,...(task.quick?{quick:true}:{})}))};}
export function restoreOrganiserTasks(value:unknown):OrganiserTask[]{if(!value||typeof value!=='object'||(value as {version?:unknown}).version!==1||!Array.isArray((value as {tasks?:unknown}).tasks))return[];const tasks=(value as {tasks:unknown[]}).tasks;if(tasks.length>30)return[];const validId=(x:unknown)=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(x);return tasks.flatMap(item=>{if(!item||typeof item!=='object')return[];const entry=item as OrganiserTask,c=entry.command;if(!c||!validId(c.operationId)||!validId(c.id)||!['journey','investigation','article','area','note','annotation','flag','source','experiment','run'].includes(c.family??'')||!Number.isSafeInteger(c.expectedRev)||c.expectedRev!<1||!['update','trash','restore'].includes(c.action))return[];if(Object.keys(c).some(key=>!['operationId','action','family','id','expectedRev','data'].includes(key)))return[];if(c.action==='update'&&!(c.family==='annotation'&&c.data&&Object.keys(c.data).length===1&&typeof c.data.body==='string'&&!!c.data.body.trim()&&c.data.body.length<=4000)){if(!c.data||Object.keys(c.data).some(key=>key!=='patch')||!Array.isArray(c.data.patch)||c.data.patch.length!==1)return[];const patch=c.data.patch[0];if(!['upsertRelation','removeRelation'].includes(patch.op)||Object.keys(patch).some(key=>!(patch.op==='upsertRelation'?['op','link']:['op','match']).includes(key)))return[];const ref=patch.op==='upsertRelation'?patch.link:patch.op==='removeRelation'?patch.match:null;if(!ref||!validId(ref.id)||typeof ref.family!=='string'||!['journey','investigation','article','area','note','annotation','flag','source','experiment','run'].includes(ref.family)||Object.keys(ref).some(key=>!['family','id','relation','reason','sectionId','partId','rendition'].includes(key))||(ref.reason!==undefined&&(typeof ref.reason!=='string'||ref.reason.length>500))||['sectionId','partId','rendition','relation'].some(key=>(ref as Record<string,unknown>)[key]!==undefined&&typeof(ref as Record<string,unknown>)[key]!=='string'))return[];}else if(c.action!=='update'&&c.data!==undefined)return[];return[{...(entry.quick===true?{quick:true}:{}),command:structuredClone(c),state:['committed','conflict','rejected'].includes(entry.state)?entry.state:'uncertain',message:'Retained operation. Check its receipt before preparing a replacement.'} as OrganiserTask]});}

/** Search prose belongs in a POST body; navigation links carry only exact identities. */
export function personalWorkQuery({tab,text='',quote='',contextKey='',topicKey='',advanced=false,cursor}:{tab:WorkTab;text?:string;quote?:string;contextKey?:string;topicKey?:string;advanced?:boolean;cursor?:string}){
 const context=advanced?workRefFromKey(contextKey):undefined,topic=advanced?workRefFromKey(topicKey):undefined;
 return {query:text.trim(),limit:30,...(tab==='trash'?{includeTrash:true}:{personal:true}),...(['note','annotation','flag','run'].includes(tab)?{family:tab as Family}:{}),...(tab==='unlinked'?{unlinked:true}:{}),...(context?{context:{family:context.family,id:context.id}}:{}),...(topic?.family==='area'?{topic:{family:topic.family,id:topic.id}}:{}),...(advanced&&quote.trim()?{quote:quote.trim()}:{}),...(cursor?{cursor}:{})};
}
export function personalWorkRouteFilters(search:string){const params=new URLSearchParams(search),context=workRefFromKey(params.get('context')??''),topic=workRefFromKey(params.get('topic')??'');return {contextKey:context?workKey(context):'',topicKey:topic?.family==='area'?workKey(topic):''};}
