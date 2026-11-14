import {readRecord} from './domain';
import {experienceEntries,findExperienceEntries,type ExperienceEntry} from './experience-discovery';
import {assertGenerationCurrent} from './generations';
import {DomainError} from './domain-error';
export function discoveryTerms(text:string){const terms=new Set<string>();for(const word of text.toLowerCase().match(/[a-z\u00c0-\u024f]+|[\u3040-\u30ff\u3400-\u9fff]+/g)??[]){if(/^[a-z\u00c0-\u024f]+$/.test(word))terms.add(word);else{const chars=[...word];for(let i=0;i<chars.length;i++){terms.add(chars[i]);if(i+1<chars.length)terms.add(chars[i]+chars[i+1]);}}}return [...terms].slice(0,5000);}
export async function ensureAccumulationIndex(env:Cloudflare.Env,owner:string){
 // Derived tables only; no canonical migrations. Idempotent, bounded request setup.
 await env.DB!.batch([
 env.DB!.prepare('CREATE TABLE IF NOT EXISTS v2_material_docs(owner TEXT NOT NULL,family TEXT NOT NULL,id TEXT NOT NULL,rev INTEGER NOT NULL,entry_key TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(owner,entry_key))'),
 env.DB!.prepare('CREATE TABLE IF NOT EXISTS v2_material_terms(owner TEXT NOT NULL,term TEXT NOT NULL,entry_key TEXT NOT NULL,PRIMARY KEY(owner,term,entry_key)) WITHOUT ROWID'),
 env.DB!.prepare('CREATE INDEX IF NOT EXISTS v2_material_terms_ref ON v2_material_terms(owner,entry_key)'),
 env.DB!.prepare('CREATE INDEX IF NOT EXISTS v2_material_docs_source ON v2_material_docs(owner,family,id)'),
 env.DB!.prepare('CREATE TABLE IF NOT EXISTS v2_material_heads(owner TEXT NOT NULL,family TEXT NOT NULL,id TEXT NOT NULL,rev INTEGER NOT NULL,PRIMARY KEY(owner,family,id))'),
 env.DB!.prepare('CREATE TABLE IF NOT EXISTS v2_material_dirty(owner TEXT NOT NULL,family TEXT NOT NULL,id TEXT NOT NULL,PRIMARY KEY(owner,family,id))'),
 ...['INSERT','UPDATE','DELETE'].map(action=>env.DB!.prepare(`CREATE TRIGGER IF NOT EXISTS v2_material_${action.toLowerCase()} AFTER ${action} ON v2_records BEGIN INSERT OR IGNORE INTO v2_material_dirty(owner,family,id) VALUES(${action==='DELETE'?'old':'new'}.owner,${action==='DELETE'?'old':'new'}.family,${action==='DELETE'?'old':'new'}.id); END`)),
 env.DB!.prepare("INSERT OR IGNORE INTO v2_material_dirty(owner,family,id) SELECT owner,family,id FROM v2_records r WHERE owner=? AND family IN ('journey','work','article','investigation') AND coalesce(json_extract(data,'$.synthetic'),0)=0 AND NOT EXISTS(SELECT 1 FROM v2_material_heads d WHERE d.owner=r.owner AND d.family=r.family AND d.id=r.id AND d.rev=r.rev) AND (json_array_length(json_extract(data,'$.sections'))>0)").bind(owner)
 ]);
}
export async function refreshAccumulationIndex(env:Cloudflare.Env,owner:string,budget=4){
 await ensureAccumulationIndex(env,owner);
 const dirty=await env.DB!.prepare("SELECT family,id FROM v2_material_dirty WHERE owner=? ORDER BY CASE WHEN id LIKE 'material-%' THEN 0 WHEN family='journey' THEN 1 WHEN family='work' THEN 2 ELSE 3 END,id LIMIT ?").bind(owner,budget).all<{family:'journey'|'work'|'article'|'investigation';id:string}>();
 for(const target of dirty.results){
  const record=await readRecord(env,owner,target.family,target.id);const entries=record&&!record.synthetic&&record.experience?.kind!=='arrangement'?experienceEntries([record]):[];
  const statements=[env.DB!.prepare('DELETE FROM v2_material_terms WHERE owner=? AND entry_key IN(SELECT entry_key FROM v2_material_docs WHERE owner=? AND family=? AND id=?)').bind(owner,owner,target.family,target.id),env.DB!.prepare('DELETE FROM v2_material_docs WHERE owner=? AND family=? AND id=?').bind(owner,target.family,target.id)];
  for(const entry of entries){statements.push(env.DB!.prepare('INSERT OR REPLACE INTO v2_material_docs(owner,family,id,rev,entry_key,payload) VALUES(?,?,?,?,?,?)').bind(owner,target.family,target.id,entry.sourceRevision,entry.key,JSON.stringify({...entry,text:entry.text.slice(0,12000)})));
   statements.push(env.DB!.prepare('INSERT OR IGNORE INTO v2_material_terms(owner,term,entry_key) SELECT ?,value,? FROM json_each(?)').bind(owner,entry.key,JSON.stringify(discoveryTerms(entry.heading+' '+entry.sourceTitle+' '+entry.text))));}
  // Bounded batches; dirty status remains visible until the source completes. Head joins suppress stale documents.
  for(let i=0;i<statements.length;i+=80)await env.DB!.batch(statements.slice(i,i+80));
  if(record)await env.DB!.prepare('INSERT OR REPLACE INTO v2_material_heads(owner,family,id,rev) VALUES(?,?,?,?)').bind(owner,target.family,target.id,record.rev).run();
  await env.DB!.prepare('DELETE FROM v2_material_dirty WHERE owner=? AND family=? AND id=? AND (? IS NULL OR EXISTS(SELECT 1 FROM v2_records WHERE owner=? AND family=? AND id=? AND rev=?))').bind(owner,target.family,target.id,record?.rev??null,owner,target.family,target.id,record?.rev??null).run();
 }
 return Number((await env.DB!.prepare('SELECT count(*) n FROM v2_material_dirty WHERE owner=?').bind(owner).first<{n:number}>())?.n??0);
}
export async function discoverMaterial(env:Cloudflare.Env,owner:string,input:{query?:string;offset?:number;limit?:number;language?:string;kind?:string}){
 const query=String(input.query??'').slice(0,240),offset=Number(input.offset??0),limit=Number(input.limit??16);
 if(!Number.isSafeInteger(offset)||offset<0||offset>100000||!Number.isSafeInteger(limit)||limit<1||limit>24)throw new DomainError(400,'discovery_budget','Use a bounded discovery page.');
 const remaining=await refreshAccumulationIndex(env,owner);const terms=discoveryTerms(query).slice(0,12);
 const termSQL=terms.length?`AND d.entry_key IN(SELECT entry_key FROM v2_material_terms WHERE owner=? AND term IN(${terms.map(()=>'?').join(',')}) GROUP BY entry_key HAVING count(DISTINCT term)=?)`:'';
 const rows=await env.DB!.prepare(`SELECT d.payload FROM v2_material_docs d JOIN v2_records r ON r.owner=d.owner AND r.family=d.family AND r.id=d.id AND r.rev=d.rev AND r.trashed_at IS NULL WHERE d.owner=? ${termSQL} ORDER BY json_extract(r.data,'$.updatedAt') DESC,d.entry_key LIMIT ? OFFSET ?`).bind(owner,...(terms.length?[owner,...terms,terms.length]:[]),limit+1,offset).all<{payload:string}>();
 const entries:ExperienceEntry[]=[];const records=new Map<string,Awaited<ReturnType<typeof readRecord>>>();
 for(const row of rows.results.slice(0,limit)){const entry=JSON.parse(row.payload) as ExperienceEntry;const key=entry.ref.family+':'+entry.ref.id;if(!records.has(key))records.set(key,await readRecord(env,owner,entry.ref.family,entry.ref.id));const record=records.get(key);if(!record||record.rev!==entry.sourceRevision||input.language&&!record.learningScope?.languages?.includes(input.language))continue;const eligible=experienceEntries([record]).find(e=>e.key===entry.key);if(eligible&&(!input.kind||input.kind==='all'||eligible.kind===input.kind)&&findExperienceEntries([eligible],query).length)entries.push({...eligible,text:eligible.text.slice(0,700)});}
 await assertGenerationCurrent(env);
 return {entries,nextOffset:rows.results.length>limit?offset+limit:null,indexingRemaining:remaining,indexComplete:remaining===0,notice:'Lexical discovery of current eligible sources. Continue paging when results are filtered. Index is derived; exact source rights are rechecked.'};
}
