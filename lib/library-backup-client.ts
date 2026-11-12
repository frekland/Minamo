/**
 * Owner-initiated, read-only Library rescue for authenticated Minamo Sites.
 * Uses ordinary bounded GETs rather than the monolithic recovery endpoint.
 * This is a PERSONAL ARCHIVE, not an import-ready workspace recovery file.
 * No data is sent to a third-party service. ZIP has no encryption.
 */
export const LIBRARY_BACKUP_FORMAT = 'minamo-library-archive@1';
export type BackupProgress = (message: string) => void;
export type BackupRecord = { family: 'article' | 'area' | 'source'; id: string; rev: number; [key: string]: unknown };
export type LibraryBackupOptions = {
  origin: string;
  fetcher: typeof fetch;
  progress?: BackupProgress;
  history?: boolean;
  includeSources?: boolean;
  /** Server-reported generation, when known (needed after a workspace restore). */
  generation?: string;
};
export type LibraryBackupResult = { file: Blob; filename: string; counts: Record<string, number>; warnings: string[]; complete: boolean };
const enc = new TextEncoder();
const LIMIT_RECORDS = 10000;
const LIMIT_HISTORY = 50000;
const LIMIT_ZIP_BYTES = 250 * 1024 * 1024;
const ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/;
const IMAGE_ID = /^image-[a-f0-9]{64}$/;
const MEDIA_ID = /^media-[a-f0-9]{64}$/;
const HEX = /^[a-f0-9]{64}$/;
const families = ['article', 'area', 'source'] as const;
const crcTable = Uint32Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(data:Uint8Array) {let c=0xffffffff;for(const n of data)c=crcTable[(c^n)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function sha256(data:Uint8Array) {return crypto.subtle.digest('SHA-256',data as Uint8Array<ArrayBuffer>).then(b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join(''));}
function bytesOf(value:unknown) {return enc.encode(JSON.stringify(value,null,2)+'\n');}
function safePath(family:string,id:string){if(!ID.test(id)||!families.includes(family as typeof families[number]))throw Error('Invalid returned record identity.');return `records/${family}/${encodeURIComponent(id)}`;}
function assertRecord(value:unknown,family:string): asserts value is BackupRecord {
 if (!value||typeof value!=='object'||Array.isArray(value))throw Error(`Malformed ${family} record.`);
 const r=value as Record<string,unknown>;
 if(r.family!==family||typeof r.id!=='string'||!ID.test(r.id)||!Number.isSafeInteger(r.rev)||(r.rev as number)<1)throw Error(`Incorrect ${family} record identity or revision.`);
}
/** Denied excerpts can be viewed on Site in some cases, but may not be exported. */
export function exportSafeRecord(record: BackupRecord): {value: BackupRecord; redactions: number} {
 const copy=structuredClone(record);let redactions=0;
 if(copy.family==='source') {
  const source=copy.source as Record<string,unknown>|undefined;
  const excerpt=source?.excerpt as Record<string,unknown>|undefined;
  if(excerpt&&(excerpt.exportAllowed!==true||excerpt.state!=='permitted')){delete source!.excerpt;redactions++;}
 }
 for(const section of (Array.isArray(copy.sections)?copy.sections:[]) as Array<{parts?:Array<Record<string,unknown>>}>)for(const part of section.parts??[]){
  if(part.kind==='excerpt'){
   const display=part.excerptDisplay as Record<string,unknown>|undefined;
   if(display?.exportAllowed!==true){part.text='';part.unavailable=true;delete part.excerptDisplay;redactions++;}
  }
 }
 return {value:copy,redactions};
}
function zip(files: Array<{name:string;data:Uint8Array}>): Blob {
 const pieces:BlobPart[]=[];const directory:Uint8Array[]=[];let offset=0,size=0;
 if(files.length>65000)throw Error('Too many files for a portable ZIP.');
 for(const file of files){
  const name=enc.encode(file.name);
  if(!name.length||name.length>500||file.name.startsWith('/')||file.name.split('/').some(x=>x==='..'||x==='')||file.name.includes('\\'))throw Error('Invalid backup ZIP path.');
  const data=file.data,crc=crc32(data);
  if(data.byteLength>0xffffffff||size+data.length>LIMIT_ZIP_BYTES)throw Error('Backup exceeds the 250 MiB browser archive limit.');
  const hdr=new Uint8Array(30+name.length),h=new DataView(hdr.buffer);
  h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);
  h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);hdr.set(name,30);
  pieces.push(hdr,data as Uint8Array<ArrayBuffer>);
  const central=new Uint8Array(46+name.length),c=new DataView(central.buffer);
  c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);
  c.setUint32(16,crc,true);c.setUint32(20,data.length,true);c.setUint32(24,data.length,true);c.setUint16(28,name.length,true);
  c.setUint32(42,offset,true);central.set(name,46);directory.push(central);
  offset+=hdr.length+data.length;size+=data.length;
 }
 const dirOffset=offset,dirSize=directory.reduce((n,d)=>n+d.length,0);
 const end=new Uint8Array(22),e=new DataView(end.buffer);
 e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);
 e.setUint32(12,dirSize,true);e.setUint32(16,dirOffset,true);
 return new Blob([...pieces,...directory,end].map(part=>part instanceof Uint8Array?new Uint8Array(part).buffer:part as BlobPart),{type:'application/zip'});
}
function assetIds(record:BackupRecord){const set=new Set<string>(),seen=new WeakSet<object>();
 const walk=(node:unknown)=>{if(!node||typeof node!=='object'||seen.has(node))return;seen.add(node);
  if(Array.isArray(node)){for(const v of node)walk(v);return;}
  const value=node as Record<string,unknown>;
  if(typeof value.assetId==='string'&&(IMAGE_ID.test(value.assetId)||MEDIA_ID.test(value.assetId))&&value.unavailable!==true)set.add(value.assetId);
  for(const [key,entry] of Object.entries(value))if(key!=='excerptDisplay'&&key!=='source')walk(entry);
 };walk(record);return set;
}
export async function buildLibraryBackup(options:LibraryBackupOptions):Promise<LibraryBackupResult> {
 const origin=new URL(options.origin);
 if(!['https:','http:'].includes(origin.protocol)||origin.pathname!=='/'||origin.search||origin.hash)throw Error('Invalid backup origin.');
 const tell=options.progress??(()=>{});const files:Array<{name:string;data:Uint8Array}>=[];
 const registry:Array<{family:string;id:string;revision:number;path:string;sha256:string}> = [];
 const assets:Array<{id:string;path:string;mime:string;bytes:number;sha256:string}> = [];
 const warnings:string[]=[], all=new Map<string,BackupRecord>();let generation=options.generation??null, redactions=0;
 const url=(path:string,params:Record<string,string>)=>{const u=new URL(path,origin);for(const [key,value]of Object.entries(params))u.searchParams.set(key,value);return u.toString();};
 async function request(path:string,params:Record<string,string>={}):Promise<{data:any;response:Response}> {
  const response=await options.fetcher(url(path,params),{credentials:'same-origin',cache:'no-store',headers:generation?{'x-minamo-generation':generation}:{}});
  if(!response.ok){const body=await response.json().catch(()=>({})) as Record<string,unknown>;throw Error(`${path}: ${response.status} ${body?.error??body?.code??'Request failed'}`);}
  const data=await response.json() as Record<string,any>;if(data?.generation){if(generation&&data.generation!==generation)throw Error('Workspace generation changed during backup. No mixed-generation archive was downloaded.');generation=data.generation;}
  return {data,response};
 }
 async function inventory(family:typeof families[number]):Promise<BackupRecord[]> {
  const results:BackupRecord[]=[],cursors=new Set<string>();let cursor='';
  for(let page=0;page<1500;page++){
   const {data}=await request('/api/query',{family,limit:'20',...(cursor?{cursor}:{})});
   if(!Array.isArray(data?.records))throw Error(`${family}: invalid Library page.`);
   for(const entry of data.records){assertRecord(entry,family);results.push(entry);if(results.length>LIMIT_RECORDS)throw Error('Too many records.');}
   if(!data.nextCursor){if(data.truncated)throw Error(`Incomplete ${family} pagination: server returned no continuation.`);return results;}
   if(typeof data.nextCursor!=='string'||cursors.has(data.nextCursor))throw Error(`Repeated ${family} continuation cursor.`);
   cursor=data.nextCursor;cursors.add(cursor);
  }
  throw Error(`Too many ${family} pages.`);
 }
 const included=options.includeSources===false?families.slice(0,2):families;
 for(const family of included){tell(`Listing ${family} records…`);for(const entry of await inventory(family)){
  const key=family+':'+entry.id;if(all.has(key))throw Error('Duplicate Library identity: '+key);all.set(key,entry);
  if(all.size>LIMIT_RECORDS)throw Error('Library record count exceeds bounded export limit.');
 }}
 const revisions:BackupRecord[]=[];
 async function addRecord(record:BackupRecord,path:string){
  const projected=exportSafeRecord(record);redactions+=projected.redactions;const data=bytesOf(projected.value);
  const digest=await sha256(data);files.push({name:path,data});registry.push({family:record.family,id:record.id,revision:record.rev,path,sha256:digest});revisions.push(projected.value);
 }
 for(const [index,entry] of [...all.values()].entries()){
  tell(`Reading record ${index+1}/${all.size}: ${entry.family} · ${entry.id}`);
  const result=await request('/api/context',{family:entry.family,id:entry.id});const head=result.data?.record;
  assertRecord(head,entry.family);
  if(head.id!==entry.id||head.rev!==entry.rev)throw Error(`Record ${entry.id} changed during export. Retry rather than mixing editions.`);
  const base=safePath(entry.family,entry.id);
  await addRecord(head,base+'/current.json');
  if(options.history!==false){
   let before='';const seen=new Set<number>();
   for(let part=0;part<500;part++){
    const {data}=await request('/api/records/changes',{family:entry.family,id:entry.id,limit:'20',...(before?{beforeRevision:before}:{})});
    if(!Array.isArray(data?.entries))throw Error(`History response is incomplete for ${entry.id}.`);
    for(const item of data.entries){
     const rev=item?.revision??item?.rev;
     if(!Number.isSafeInteger(rev)||rev<1||seen.has(rev))throw Error(`Invalid/duplicate revision for ${entry.id}.`);
     seen.add(rev);
     if(rev===head.rev)continue;
     const reply=await request('/api/records/revision',{family:entry.family,id:entry.id,revision:String(rev)});
     const old=reply.data?.record;assertRecord(old,entry.family);
     if(old.id!==entry.id||old.rev!==rev)throw Error(`Historical identity changed for ${entry.id}.`);
     await addRecord(old,base+`/revisions/${rev}.json`);
     if(revisions.length>LIMIT_HISTORY)throw Error('Too many retained editions in one backup.');
    }
    if(!data.nextBeforeRevision)break;
    if(!Number.isSafeInteger(data.nextBeforeRevision)||data.nextBeforeRevision<1||before===String(data.nextBeforeRevision))throw Error('Invalid history continuation.');
    before=String(data.nextBeforeRevision);
    if(part===499)throw Error('History pagination limit reached.');
   }
  }
 }
 const referenced=new Set<string>();for(const record of revisions)for(const id of assetIds(record))referenced.add(id);
 for(const [index,id] of [...referenced].entries()){
  const kind=IMAGE_ID.test(id)?'image':'media';tell(`Downloading ${kind} ${index+1}/${referenced.size}…`);
  try{
   const meta=(await request(`/api/${kind==='image'?'assets':'media'}/${id}/metadata`)).data?.asset;
   if(!meta||meta.assetId!==id||!Number.isSafeInteger(meta.bytes)||meta.bytes<1||meta.bytes>32*1024*1024||typeof meta.mime!=='string')throw Error('Invalid asset metadata.');
   const r=await options.fetcher(url(`/api/${kind==='image'?'assets':'media'}/${id}`,generation?{generation}:{}),{credentials:'same-origin',cache:'no-store',headers:generation?{'x-minamo-generation':generation}:{}});
   if(!r.ok)throw Error(`HTTP ${r.status}`);
   const binary=new Uint8Array(await r.arrayBuffer());const digest=await sha256(binary);
   if(binary.length!==meta.bytes||meta.digest&&meta.digest!==digest)throw Error('Asset digest/size mismatch.');
   const ext=kind==='image'?({ 'image/png':'png','image/jpeg':'jpg','image/webp':'webp'} as Record<string,string>)[meta.mime]:({'application/pdf':'pdf','text/plain':'txt','text/markdown':'md','audio/mpeg':'mp3','audio/wav':'wav','video/mp4':'mp4','video/webm':'webm'} as Record<string,string>)[meta.mime];
   if(!ext)throw Error('Unsupported asset MIME.');
   const path=`assets/${kind}/${id}.${ext}`;
   files.push({name:path,data:binary});assets.push({id,path,mime:meta.mime,bytes:binary.length,sha256:digest});
  }catch(error){warnings.push(`Unable to copy ${id}: ${error instanceof Error?error.message:String(error)}`);}
 }
 // Recheck current heads after collecting history/assets; never label a mixed-time backup complete.
 for(const family of included){tell(`Verifying current ${family} identities…`);const heads=await inventory(family);
  const before=[...all.values()].filter(r=>r.family===family).map(r=>`${r.id}@${r.rev}`).sort();
  const after=heads.map(r=>`${r.id}@${r.rev}`).sort();
  if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Library changed during export. Retain previous data and retry.');
 }
 const counts={records:all.size,retainedEditions:registry.length-all.size,assets:assets.length,missingAssets:warnings.length,redactions};
 const manifest={format:LIBRARY_BACKUP_FORMAT,exportedAt:new Date().toISOString(),sourceOrigin:origin.origin,
  scope:'current Library Articles, Areas, and Sources plus available retained record editions and referenced files',
  includesHistory:options.history!==false,includesSources:options.includeSources!==false,complete:warnings.length===0,
  counts,records:registry,assets,warnings,
  exclusions:['Notes, Projects, Questions, Run histories and other non-Library records',
   'Server-side operation receipts, legacy catalogue index/revisions, learning-work metadata and unattached assets',
   'External URLs are preserved as links; external page/file content is not copied',
   'Source excerpts disallowed for export are redacted even where viewable in Minamo'],
  compatibility:'Read-only personal content archive; not a Minamo encrypted recovery bundle or verified import package.'};
 const manifestBytes=bytesOf(manifest);files.push({name:'manifest.json',data:manifestBytes});
 files.push({name:'README.txt',data:enc.encode('Minamo Library personal archive\n\nThis ZIP contains the current eligible Library records, available retained editions and readable attached media. It is NOT a complete workspace recovery file and cannot yet be imported directly into Minamo. The contents are unencrypted private data: store the file securely. Check manifest.json for warnings, record counts and missing assets. Do not upload this archive to a public GitHub repository.\n')});
 tell('Creating local ZIP…');const file=zip(files);
 const date=new Date().toISOString().slice(0,10);
 return {file,filename:`minamo-library-${date}${warnings.length?'-PARTIAL':''}.zip`,counts,warnings,complete:warnings.length===0};
}
/** Only call inside an owner-controlled authenticated Minamo page after user action. */
export async function downloadLibraryBackup(options:LibraryBackupOptions):Promise<LibraryBackupResult>{
 const result=await buildLibraryBackup(options);const href=URL.createObjectURL(result.file);
 try{const anchor=document.createElement('a');anchor.href=href;anchor.download=result.filename;anchor.style.display='none';document.body.appendChild(anchor);anchor.click();anchor.remove();}finally{setTimeout(()=>URL.revokeObjectURL(href),10000);}
 return result;
}
