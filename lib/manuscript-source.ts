import {inspectManuscriptSubmission} from './manuscript-intake';
import {validateLearningScope} from './learning-spaces';
/** Matches the domain's canonical object hash without depending on persistence. */
const stable=(value:unknown):string=>Array.isArray(value)?'['+value.map(stable).join(',')+']':value&&typeof value==='object'?'{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+stable((value as Record<string,unknown>)[key])).join(',')+'}':JSON.stringify(value);
export async function manuscriptEditionDigest(manuscript:unknown,refs:unknown):Promise<string>{
 const bytes=new TextEncoder().encode(stable({version:1,manuscript,refs}));
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
}
/** Imported original-writing editions grant no external Source/excerpt permission. */
export async function validManuscriptEditionRow(row:Record<string,string|number|null>):Promise<boolean>{
 try{
  const id=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
  if(!id(row.id)||typeof row.digest!=='string'||!/^[a-f0-9]{64}$/.test(row.digest)||typeof row.source!=='string'||typeof row.refs!=='string'||typeof row.created_at!=='string'||!Number.isFinite(Date.parse(row.created_at)))return false;
  const manuscript=JSON.parse(row.source),refs=JSON.parse(row.refs);const inspected=inspectManuscriptSubmission(manuscript);
  if(Object.keys(manuscript).some(k=>!['version','brief','documents'].includes(k))||manuscript.documents.some((d:Record<string,unknown>)=>Object.keys(d).some(k=>!['key','role','title','markdown','target','catalogue','learningScope'].includes(k))))return false;
  // Scope is admitted by the normal manuscript writer and covered by its exact
  // digest. Recovery must accept that same typed metadata, without converting
  // arbitrary source fields into permission or classification authority.
  for(const document of manuscript.documents)if(document.learningScope!==undefined)validateLearningScope(document.learningScope);
  if(!Array.isArray(refs)||refs.length<1||refs.length>16||refs.length!==manuscript.documents.length||refs.some(r=>!r||Object.keys(r).some(k=>!['key','family','id','rev','rendition','catalogueRev','referenceCount'].includes(k))||(r.catalogueRev!==undefined&&(!Number.isSafeInteger(r.catalogueRev)||r.catalogueRev<1))||(r.referenceCount!==undefined&&(!Number.isSafeInteger(r.referenceCount)||r.referenceCount<0||r.referenceCount>40))||!id(r.key)||!id(r.id)||!['journey','investigation','article','area'].includes(r.family)||!Number.isSafeInteger(r.rev)||r.rev<1||typeof r.rendition!=='string'||!/^r-[a-f0-9]{64}$/.test(r.rendition)))return false;
  if(new Set(refs.map(r=>r.key)).size!==refs.length||new Set(refs.map(r=>r.family+':'+r.id)).size!==refs.length||refs.some((r:any)=>!inspected.documents.some(d=>d.key===r.key&&d.role===r.family)))return false;
  return await manuscriptEditionDigest(manuscript,refs)===row.digest;
 }catch{return false;}
}
