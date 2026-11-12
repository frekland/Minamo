import { unzipSync } from 'fflate';

export type ImportedRecord={family:'article'|'area'|'source';id:string;rev:number;[key:string]:unknown};
export type LibraryImportPlan={archiveDigest:string;records:ImportedRecord[];counts:{article:number;area:number;source:number;assets:number};collisions:string[];synthetic:string[];unresolvedLinks:number;warnings:string[]};
const te=new TextEncoder(),td=new TextDecoder('utf-8',{fatal:true}),format='minamo-library-archive@1';
const sha=async(b:Uint8Array)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(b).buffer as ArrayBuffer)),x=>x.toString(16).padStart(2,'0')).join('');
function safePath(path:string){return !!path&&path.length<600&&!path.startsWith('/')&&!path.includes('\\')&&path.split('/').every(p=>!!p&&p!=='.'&&p!=='..'&&/^[A-Za-z0-9._%-]+$/.test(p));}
function centralDirectory(b:Uint8Array){
 const v=new DataView(b.buffer,b.byteOffset,b.byteLength);let eocd=-1;
 for(let i=Math.max(0,b.length-65557);i<=b.length-22;i++)if(v.getUint32(i,true)===0x06054b50)eocd=i;
 if(eocd<0)throw Error('ZIP directory is missing.');
 const count=v.getUint16(eocd+10,true),size=v.getUint32(eocd+12,true),start=v.getUint32(eocd+16,true);
 if(count<2||count>2000||start+size>eocd||start+size!==eocd)throw Error('ZIP directory bounds are invalid.');
 let p=start,total=0;const names=new Set<string>();
 for(let n=0;n<count;n++){
  if(p+46>b.length||v.getUint32(p,true)!==0x02014b50)throw Error('Malformed ZIP directory entry.');
  const flags=v.getUint16(p+8,true),method=v.getUint16(p+10,true),compressed=v.getUint32(p+20,true),expanded=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),xl=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),external=v.getUint32(p+38,true);
  if(flags&1||![0,8].includes(method)||p+46+nl+xl+cl>b.length)throw Error('Encrypted or unsupported ZIP entry.');
  const name=td.decode(b.slice(p+46,p+46+nl));if(name.endsWith('/')){const dir=name.slice(0,-1);if(!safePath(dir)||names.has(name))throw Error('Unsafe ZIP directory.');names.add(name);}else{if(!safePath(name)||names.has(name))throw Error('Unsafe or duplicate ZIP path.');names.add(name);}
  const mode=external>>>16;if((mode&0xf000)===0xa000)throw Error('ZIP symlinks are not accepted.');
  if(expanded>32*1024*1024||compressed>32*1024*1024)throw Error('ZIP entry exceeds the 32 MiB limit.');
  total+=expanded;if(total>250*1024*1024)throw Error('ZIP expands beyond the 250 MiB limit.');
  p+=46+nl+xl+cl;
 }
 if(p!==start+size)throw Error('ZIP directory count does not match its size.');return names;
}
function jsonFile(files:Record<string,Uint8Array>,path:string){const b=files[path];if(!b)throw Error(`Archive file missing: ${path}`);return JSON.parse(td.decode(b));}
function safeRecord(value:unknown,family:string,id:string){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error(`Malformed ${family} record ${id}.`);
 const r=value as ImportedRecord;if(r.family!==family||r.id!==id||!Number.isSafeInteger(r.rev)||r.rev<1)throw Error(`Record identity or revision mismatch: ${family}/${id}.`);
 if(!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(r.id))throw Error('Invalid record ID.');
 if(typeof r.title!=='string'||r.title.length>180||typeof r.body!=='string'||r.body.length>24000||!Array.isArray(r.links))throw Error(`Unsupported record structure: ${family}/${id}.`);
 if(family==='article'||family==='area'){if(!Array.isArray(r.sections))throw Error(`Unsupported record structure: ${family}/${id}; sections are required.`);}
 else{
  if(r.sections!==undefined)throw Error(`Unsupported record structure: ${family}/${id}; Sources do not contain sections.`);
  const s=r.source as Record<string,unknown>|undefined;
  if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.url!=='string'||s.url.length>2000||typeof s.attribution!=='string'||s.attribution.length>500||!['link-only','original','permitted-excerpt'].includes(String(s.rights))||s.kind!==undefined&&!['documentation','repository','external'].includes(String(s.kind))||s.commit!==undefined&&(typeof s.commit!=='string'||s.commit.length>500)||s.path!==undefined&&(typeof s.path!=='string'||s.path.length>1000)||Object.keys(s).some(k=>!['url','attribution','rights','kind','commit','path','excerpt'].includes(k)))throw Error(`Unsupported Source metadata: ${family}/${id}.`);
  try{const u=new URL(s.url);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('bad URL');}catch{throw Error(`Unsupported Source URL: ${family}/${id}.`);}
 }
 if(te.encode(JSON.stringify(r)).length>2*1024*1024)throw Error('Record exceeds 2 MiB.');
 if(r.family==='source'&&r.source&&typeof r.source==='object'){
  const ex=(r.source as Record<string,unknown>).excerpt as Record<string,unknown>|undefined;
  if(ex&&(ex.exportAllowed!==true||ex.state!=='permitted'))throw Error('Archive contains a restricted Source excerpt.');
 }
 return r;
}
export async function inspectLibraryArchive(file:File,fetcher:typeof fetch,scope:string){
 if(file.size>50*1024*1024)throw Error('Choose a ZIP no larger than 50 MiB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),names=centralDirectory(bytes),digest=await sha(bytes),files=unzipSync(bytes);
 const fileNames=[...names].filter(n=>!n.endsWith('/'));if(Object.keys(files).filter(n=>!n.endsWith('/')).length!==fileNames.length||fileNames.some(n=>!files[n]))throw Error('ZIP entries did not decompress consistently.');
 if(fileNames.some(n=>!['manifest.json','README.txt'].includes(n)&&!/^records\/(article|area|source)\/[^/]+\/(current\.json|revisions\/[1-9][0-9]*\.json)$/.test(n)&&!/^assets\/(image|media)\//.test(n)))throw Error('Archive contains an unexpected entry.');
 const manifest=jsonFile(files,'manifest.json');if(manifest?.format!==format||manifest.complete!==true||manifest.includesHistory!==false||!Array.isArray(manifest.records)||!Array.isArray(manifest.assets)||!manifest.counts)throw Error('Unsupported or incomplete Library archive manifest.');
 if(manifest.records.length>10000||manifest.assets.length>2000||manifest.counts.records!==manifest.records.length||manifest.counts.assets!==manifest.assets.length)throw Error('Manifest counts exceed supported bounds.');
 const records:ImportedRecord[]=[],seen=new Set<string>(),expected=new Set(['manifest.json','README.txt']);
 for(const item of manifest.records){if(!item||!['article','area','source'].includes(item.family)||typeof item.id!=='string'||typeof item.path!=='string'||item.path!==`records/${item.family}/${encodeURIComponent(item.id)}/current.json`||!safePath(item.path)||! /^[a-f0-9]{64}$/.test(item.sha256))throw Error('Malformed record manifest entry.');
  const key=`${item.family}:${item.id}:${item.revision}`;if(seen.has(key))throw Error('Duplicate record identity in manifest.');seen.add(key);expected.add(item.path);
  const b=files[item.path];if(!b||await sha(b)!==item.sha256)throw Error(`Record digest mismatch: ${item.family}/${item.id}.`);
  const rec=safeRecord(JSON.parse(td.decode(b)),item.family,item.id);if(rec.rev!==item.revision)throw Error('Manifest revision mismatch.');
  if(item.path.endsWith('/current.json'))records.push(rec);
 }
 for(const a of manifest.assets){if(!a||typeof a.path!=='string'||!safePath(a.path)||!/^assets\/(image|media)\/(image|media)-[a-f0-9]{64}\.[a-z0-9]{2,5}$/.test(a.path)||!Number.isSafeInteger(a.bytes)||! /^[a-f0-9]{64}$/.test(a.sha256))throw Error('Malformed asset manifest entry.');expected.add(a.path);const b=files[a.path];if(!b||b.length!==a.bytes||await sha(b)!==a.sha256)throw Error('Asset size or digest mismatch.');}
 if(fileNames.length!==expected.size||fileNames.some(n=>!expected.has(n)))throw Error('Archive has unreferenced or unexpected entries.');
 if(records.length!==manifest.counts.records)throw Error('Current record count does not match manifest.');
 // One all-family query gives the same collision/link coverage without eleven
 // independent family requests. A route denial remains an ordinary preview
 // error; the page-level guard separately checks explicit identity evidence.
 const existing=new Set<string>();let cursor='';for(let p=0;p<500;p++){
  const params=new URLSearchParams({limit:'60',...(cursor?{cursor}:{})});
  const res=await fetcher('/api/query?'+params,{credentials:'same-origin',cache:'no-store',headers:{'x-minamo-generation':scope}});
  if(!res.ok)throw Error(`Current workspace inventory is unavailable (HTTP ${res.status}). No import was started.`);
  const data=await res.json() as {records?:Array<{family:string;id:string}>;nextCursor?:string|null};
  if(!Array.isArray(data.records))throw Error('Current workspace inventory response is malformed. No import was started.');
  for(const x of data.records){if(typeof x?.family!=='string'||typeof x?.id!=='string')throw Error('Current workspace inventory contains an invalid record identity. No import was started.');existing.add(`${x.family}:${x.id}`);}
  if(!data.nextCursor)break;cursor=data.nextCursor;if(p===499)throw Error('Current workspace is too large to safely inventory. No import was started.');
 }
 const ids=new Set([...records.map(r=>`${r.family}:${r.id}`),...existing]);
 let unresolvedLinks=0;for(const r of records)for(const link of r.links as Array<{family?:string;id?:string}>){if(!link||typeof link.family!=='string'||typeof link.id!=='string')throw Error('Malformed record relationship.');if(!ids.has(`${link.family}:${link.id}`))unresolvedLinks++;}
 const collisions=records.filter(r=>existing.has(`${r.family}:${r.id}`)).map(r=>`${r.family}:${r.id}`),synthetic=records.filter(r=>r.synthetic===true).map(r=>`${r.family}:${r.id}`);
 const catalogueWarnings=records.filter(r=>r.family==='article'&&r.catalogue&&typeof r.catalogue==='object'&&((r.catalogue as any).edition?.summary||(r.catalogue as any).edition?.classificationHints?.length)).map(r=>`Article ${r.id} has catalogue metadata. Supported references are retained through concepts and summaries are restored as a new native catalogue revision. Original revision numbers/history and classification hints are not recreated.`);
 return {plan:{archiveDigest:digest,records,counts:{article:records.filter(r=>r.family==='article').length,area:records.filter(r=>r.family==='area').length,source:records.filter(r=>r.family==='source').length,assets:manifest.assets.length},collisions,synthetic,unresolvedLinks,warnings:[...(manifest.warnings??[]),...catalogueWarnings,...(manifest.assets.length?['Asset upload is not yet supported by this importer; no records can be imported from an archive containing assets.']:[])]} satisfies LibraryImportPlan,existing};
}
export async function importLibraryPlan(plan:LibraryImportPlan,options:{fetcher:typeof fetch;generation:string;skipSynthetic:boolean;progress:(s:string)=>void}){
 if(plan.counts.assets)throw Error('This archive includes assets; the current importer does not upload media. No records were imported.');
 const collision=new Set(plan.collisions),synthetic=new Set(options.skipSynthetic?plan.synthetic:[]),candidate=plan.records.filter(r=>!collision.has(`${r.family}:${r.id}`)&&!synthetic.has(`${r.family}:${r.id}`));
 const created:string[]=[],failed:Array<{id:string;error:string}>=[];
 const ordered=[...candidate.filter(r=>r.family==='area'),...candidate.filter(r=>r.family==='source'),...candidate.filter(r=>r.family==='article')];
 for(let n=0;n<ordered.length;n++){
  const r=ordered[n],key=`${r.family}:${r.id}`;options.progress(`Importing ${n+1}/${ordered.length}: ${r.title}`);
  const links=r.links as Array<Record<string,unknown>>;
  const data:Record<string,unknown>={title:r.title,body:r.body,links,...(r.family!=='source'?{sections:r.sections}:{}),...(r.status?{status:r.status}:{}),...(r.concepts?{concepts:r.concepts}:{}),...(r.source?{source:r.source}:{}),...(r.learningShape?{learningShape:r.learningShape}:{}),...(r.learningScope?{learningScope:r.learningScope}:{})};
  if(r.synthetic===true)data.synthetic=true;
  const identityHash=await sha(te.encode(r.family+':'+r.id));const operationId=`library-import-${plan.archiveDigest.slice(0,16)}-${identityHash.slice(0,32)}`;
  try{const res=await options.fetcher('/api/commands',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','x-minamo-generation':options.generation},body:JSON.stringify({expectedGeneration:options.generation,operationId,action:'create',family:r.family,id:r.id,expectedRev:0,data})});const payload=await res.json().catch(()=>({})) as Record<string,unknown>;if(!res.ok)throw Error(String(payload.error??payload.code??`HTTP ${res.status}`));created.push(key);
   const summary=(r.catalogue as any)?.edition?.summary?.text;if(r.family==='article'&&typeof summary==='string'&&summary.length<=1000&&summary.trim()){
    const catalogueOperationId=`${operationId}-catalogue-summary`,catalogue=await options.fetcher('/api/commands',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','x-minamo-generation':options.generation},body:JSON.stringify({expectedGeneration:options.generation,operationId:catalogueOperationId,action:'update',family:'article',id:r.id,expectedRev:1,data:{catalogue:{expectedRev:1,summary}}})});const detail=await catalogue.json().catch(()=>({})) as Record<string,unknown>;if(!catalogue.ok)throw Error(`Record created; catalogue summary could not be restored (${String(detail.error??detail.code??`HTTP ${catalogue.status}`)}). Retry this same preview.`);
   }
  }
  catch(error){failed.push({id:key,error:error instanceof Error?error.message:'Import failed'});}
 }
 return {imported:created,skipped:[...collision,...synthetic],failed,unresolvedLinks:plan.unresolvedLinks,assets:plan.counts.assets};
}
