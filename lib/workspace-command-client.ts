import type {CommandReceipt,WorkspaceCommand,WorkspaceRecord} from './contracts';
/** Only simultaneous identical requests share transport. Completed projections are never cached across rights changes. */
export function createWorkspaceCommandFlights(){
 const pending=new Map<string,{payload:string;promise:Promise<CommandReceipt>}>();
 return (scope:string,command:WorkspaceCommand,send:()=>Promise<CommandReceipt>)=>{const key=JSON.stringify([scope,command.operationId]),payload=JSON.stringify(command),old=pending.get(key);if(old){if(old.payload!==payload)return Promise.reject(Object.assign(new Error('Keep the original pending save unchanged.'),{status:409,code:'idempotency_mismatch'}));return old.promise;}const promise=Promise.resolve().then(send).finally(()=>{if(pending.get(key)?.promise===promise)pending.delete(key)});pending.set(key,{payload,promise});return promise;};
}
export function isQuickWorkspaceCommand(command:WorkspaceCommand){return command.action==='setFlag'||(['note','annotation','flag','run'].includes(command.family??'')&&['create','update','trash','restore'].includes(command.action));}
/** Merge eligible server projections by revision, or remove an acknowledged tombstone.
 * Never manufacture new prose, a rendition, a restore projection or a server timestamp. */
export function reconcileWorkspaceReceipt(records:WorkspaceRecord[],command:WorkspaceCommand,receipt:CommandReceipt){
 if(receipt.operationId!==command.operationId||receipt.status!=='committed')return records;
 const map=new Map(records.map(record=>[record.family+':'+record.id,record]));
 for(const record of [...(receipt.records??[]),...(receipt.record?[receipt.record]:[])]){const key=record.family+':'+record.id,old=map.get(key);if(!old||record.rev>=old.rev&&!(old.family==='flag'&&old.bookmark&&record.bookmark&&old.bookmark.targetRev>record.bookmark.targetRev))map.set(key,record);}
 const ref=receipt.recordRef??receipt.bookmark?.flagRef;
 if(ref&&!receipt.record&&(command.action==='trash'||receipt.bookmark?.active===false)){const key=ref.family+':'+ref.id,old=map.get(key);if(old&&old.rev<=ref.rev&&!(old.family==='flag'&&old.bookmark&&receipt.bookmark&&old.bookmark.targetRev>receipt.bookmark.targetRev))map.delete(key);}
 return [...map.values()];
}
export function workspaceActionMessage(command:WorkspaceCommand){
 if(command.action==='setFlag'){const favourite=command.target?.kind==='record'&&['article','journey','investigation'].includes(command.target.family);return command.active?(favourite?'Favourite added':'Flagged'):(favourite?'Favourite removed':'Unflagged');}
 if(command.family==='annotation')return command.action==='trash'?'Annotation deleted':command.action==='restore'?'Annotation restored':'Annotation saved';
 if(command.family==='flag')return command.action==='trash'?'Unflagged':command.action==='restore'?'Flag restored':'Flag saved';
 if(command.action==='trash')return 'Moved to Trash';if(command.action==='restore')return 'Restored';return null;
}
/** A response admitted before a later rights event is an acknowledgement, not a current content grant. */
export function clientReceiptAtPermissionEpoch(receipt:CommandReceipt,started:number,current:number):CommandReceipt{
 if(started===current)return receipt;const {record,records,...metadata}=receipt;return {...metadata,...(!metadata.recordRef&&record?{recordRef:{family:record.family,id:record.id,rev:record.rev}}:{}),...(!metadata.recordRefs&&records?{recordRefs:records.map(record=>({family:record.family,id:record.id,rev:record.rev}))}:{})};
}
/** Ephemeral display redaction only; canonical revisions and independent writing stay intact. */
export function scrubSourceQuotes(records:WorkspaceRecord[],blocked:ReadonlySet<string>):WorkspaceRecord[]{return records.map(record=>{
 let next=record;
 if(record.anchor?.recordFamily==='source'&&blocked.has(record.anchor.articleId))next={...next,anchor:{...record.anchor,quote:''}};
 if(record.family==='source'&&blocked.has(record.id)&&record.source?.excerpt)next={...next,source:{...record.source,excerpt:{...record.source.excerpt,text:'',locator:'',edition:'',permissionNote:'',state:'revoked',exportAllowed:false,unavailable:true}}};
 if(record.sections?.some(section=>section.parts.some(part=>part.excerpt&&blocked.has(part.excerpt.sourceId))))next={...next,sections:record.sections.map(section=>({...section,parts:section.parts.map(part=>part.excerpt&&blocked.has(part.excerpt.sourceId)?{id:part.id,kind:'excerpt' as const,text:'',unavailable:true}:part)}))};
 return next;
})}
/** Metadata-only overlay prevents an earlier read page from resurrecting a later local ACK.
 * Fresh server-only rows and genuinely newer revisions remain discoverable. */
export function createClientCommitOverlay(){
 type Mark={rev:number;removed:boolean;targetRev?:number};const marks=new Map<string,Mark>(),key=(record:{family:string;id:string})=>record.family+':'+record.id;
 const older=(record:WorkspaceRecord,mark:Mark)=>record.rev<mark.rev||record.family==='flag'&&mark.targetRev!==undefined&&(record.bookmark?.targetRev??-1)<mark.targetRev;
 const removed=(record:WorkspaceRecord,mark:Mark)=>mark.removed&&record.rev<=mark.rev&&!(record.family==='flag'&&mark.targetRev!==undefined&&(record.bookmark?.targetRev??-1)>mark.targetRev);
 return {
  clear(){marks.clear()},
  remember(command:WorkspaceCommand,receipt:CommandReceipt){if(receipt.operationId!==command.operationId||receipt.status!=='committed')return;const refs=[...(receipt.recordRefs??[]),...(receipt.recordRef?[receipt.recordRef]:[])];if(!refs.length&&receipt.record)refs.push({family:receipt.record.family,id:receipt.record.id,rev:receipt.record.rev});for(const ref of refs){const record=receipt.record?.family===ref.family&&receipt.record.id===ref.id?receipt.record:receipt.records?.find(record=>key(record)===key(ref)),mark:Mark={rev:Math.max(ref.rev,record?.rev??0),removed:record?!!record.trashedAt||record.family==='flag'&&record.bookmark?.active===false:command.action==='trash'||ref.family==='flag'&&receipt.bookmark?.active===false,...(ref.family==='flag'&&(record?.bookmark||receipt.bookmark)?{targetRev:record?.bookmark?.targetRev??receipt.bookmark?.targetRev}:{})},old=marks.get(key(ref));if(old&&(old.rev>mark.rev||ref.family==='flag'&&old.targetRev!==undefined&&mark.targetRev!==undefined&&old.targetRev>mark.targetRev))continue;marks.set(key(ref),mark);}},
  reconcilePage(incoming:WorkspaceRecord[],known:WorkspaceRecord[],options:{includeTrash?:boolean}={}){const current=new Map(known.map(record=>[key(record),record])),result=new Map<string,WorkspaceRecord>();for(const record of incoming){const k=key(record),mark=marks.get(k),live=current.get(k);if(mark&&removed(record,mark)&&!(options.includeTrash&&record.trashedAt&&!older(record,mark)))continue;if(mark&&older(record,mark)){if(live&&!older(live,mark)&&!removed(live,mark))result.set(k,live);continue;}const selected=live&&(live.rev>record.rev||live.family==='flag'&&live.bookmark&&record.bookmark&&live.bookmark.targetRev>record.bookmark.targetRev)?live:record;result.set(k,selected);}for(const [k,mark] of marks){const record=current.get(k);if(!result.has(k)&&record&&!record.trashedAt&&!older(record,mark)&&!removed(record,mark))result.set(k,record);}return [...result.values()].filter(record=>options.includeTrash||!record.trashedAt);}
 };
}
