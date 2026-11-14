import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {pr12CorpusFixture} from '../tests/pr12-corpus-fixture.mjs';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const compiled=await build({entryPoints:['lib/accumulation-index.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {refreshAccumulationIndex,discoverMaterial}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const f=await pr12CorpusFixture(),env={DB:f.db,BUCKET:f.bucket};
const result=[];let previous=0;
try{
 for(const size of [100,1000,10000,50000]){
  const start=performance.now();
  // 50 independently addressable passages per record; exact native bounds.
  // Two years of explicitly fictional mixed activity, never reconstructed learner history.
  for(let base=previous;base<size;base+=50){
   const id='TEST-ONLY-growth-'+base,day=Math.floor(base/50)%730,at=new Date(Date.UTC(2024,10,14)+day*86400000).toISOString();
   const sections=Array.from({length:2},(_,s)=>({id:'s'+s,title:s?'Later context':'Original supplied context',parts:Array.from({length:Math.min(25,size-base-s*25)},(_,p)=>({id:'p'+(s*25+p),kind:'paragraph',text:(base%100===0?'Japanese music piano 聴く 弾く':'Python network bytes observations')+' · fictional ordered item '+(base+s*25+p)+(s?' · later correction remains separate':' · unknown origin is not inferred')}))})).filter(s=>s.parts.length);
   const record={id,family:'work',title:'Fictional accumulation '+day,body:'TEST ONLY growth scenario, not real learner activity.',sections,links:[],synthetic:false,actor:'gpt',rev:1,rendition:'r-growth-'+base,createdAt:at,updatedAt:at,trashedAt:null};
   await f.db.batch([f.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,?,NULL,?)').bind(f.owner,'work',id,JSON.stringify(record),1,'growth'),f.db.prepare('INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) VALUES(?,?,?,?,?,?)').bind(f.owner,'work',id,1,JSON.stringify(record),record.rendition)]);
  }
  let remaining;do{remaining=await refreshAccumulationIndex(env,f.owner,25)}while(remaining);
  const indexedMs=performance.now()-start,queryStart=performance.now(),found=await discoverMaterial(env,f.owner,{query:'Yann',limit:12}),queryMs=performance.now()-queryStart;
  if(!found.entries.some(e=>e.ref.id==='making-friends-japanese-20261112'))throw Error('Older authentic learner response lost under growth.');
  const docs=await f.db.prepare('SELECT count(*) n FROM v2_material_docs WHERE owner=?').bind(f.owner).first();
  result.push({syntheticPassages:size,actualIndexedEntries:docs.n,indexAndSeedMs:indexedMs,targetedQueryMs:queryMs,olderAuthenticResponseFound:true,returned:found.entries.length,payloadBytes:Buffer.byteLength(JSON.stringify(found))});console.log(result.at(-1));previous=size;
 }
 const target='TEST-ONLY-growth-0';await f.db.prepare('UPDATE v2_records SET trashed_at=? WHERE owner=? AND id=?').bind('2026-11-14',f.owner,target).run();const removed=await discoverMaterial(env,f.owner,{query:'fictional ordered item 0',limit:24});if(removed.entries.some(e=>e.ref.id===target))throw Error('Trashed source leaked');
 writeFileSync('docs/rfcs/PR12-D1-GROWTH.json',JSON.stringify({version:1,method:'Actual isolated D1 canonical records, derived term index, current-rights resolver and bounded production discovery service. Two-year fictional mixed-source shapes plus untouched real corpus. Numbers are local observations, not production latency guarantees.',rows:result,revocationWithheld:true,limits:'No claim to simulate human mastery or semantic ranking. External media performance and multi-owner concurrency are separate tests.'},null,2)+'\n');
}finally{await f.dispose()}
