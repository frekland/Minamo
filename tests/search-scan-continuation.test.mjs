import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:"export * from './lib/search-continuation.ts'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {continueSearchWindow,searchCoverageIncomplete,showCompletedSearchEmpty,SEARCH_AUTO_SCAN_LIMIT}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {async fetch(request,env){let queries=0;const db=env.DB;const scoped={...env,DB:{prepare(sql){queries++;return db.prepare(sql)},batch(items){return db.batch(items)},exec(sql){return db.exec(sql)}}};const response=await domainHandler(request,scoped);response.headers.set('X-Test-Prepared-Queries',String(queries));return response}}`;
const record=(id,family,body)=>({id,family,title:'TEST ONLY scan boundary '+id,body,links:[],rev:1,createdAt:'2026-10-25T10:00:00.000Z',updatedAt:'2026-10-25T10:00:00.000Z',trashedAt:null,actor:'user',synthetic:true,...(family==='note'?{bodyFormat:'markdown-v1'}:{})});
const insert=(f,owner,r)=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,1,?,NULL,?)').bind(owner,r.family,r.id,JSON.stringify(r),'TEST-ONLY-scan-seed').run();
const page=(extra={})=>({generation:'legacy@0',records:[],nextCursor:null,searchIncomplete:false,conceptMatches:[],...extra});
const run=(read,extra={})=>continueSearchWindow(read,{scope:'TEST-ONLY-search',signal:new AbortController().signal,isCurrent:()=>true,...extra});

test('older Article and Note beyond a two-MB no-match scan remain discoverable; browser burst skips the empty scan and retains exact evidence',async t=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-search-boundary'),needle='OldBoundaryCanary';
 const rows=[];for(let n=0;n<95;n++)rows.push(record('recent-'+String(n).padStart(3,'0'),'note','Unrelated ordinary material. '+'.'.repeat(23400)));
 // Article and Note have genuinely older saved dates, independent of family sort.
 const article={...record('old-article','article','An older '+needle+' Article.'),updatedAt:'2026-10-20T10:00:00.000Z'},note={...record('old-note','note','A short prediction. '+needle+' next intention.'),updatedAt:'2026-10-19T10:00:00.000Z'};
 rows.push(article,note);for(const r of rows)await insert(f,c.owner,r);
 const get=async cursor=>{const result=await c.request('/api/query?'+new URLSearchParams({q:needle,limit:'40',...(cursor?{cursor}:{})}));assert.equal(result.status,200,JSON.stringify(result.data));return result;};
 const start=performance.now(),first=await get();const firstMs=performance.now()-start;assert.deepEqual(first.data.records,[]);assert.equal(first.data.searchIncomplete,true);assert.equal(first.data.continuationKind,'scan');assert.ok(first.data.nextCursor);assert.ok(rows.reduce((n,r)=>n+Buffer.byteLength(JSON.stringify(r))+2048,0)>2000000);
 assert.equal(showCompletedSearchEmpty({records:0,concepts:0,loading:false,cursor:first.data.nextCursor,incomplete:searchCoverageIncomplete(first.data)}),false,'this was the confirmed misleading empty state');
 let reads=0;const preferred=await run(async cursor=>{reads++;return (await get(cursor)).data;});assert.equal(reads,1,'a useful ranked Library result stops automatic scanning');assert.equal(preferred.libraryMatches[0].id,article.id);assert.ok(preferred.nextCursor,'older saved work remains reachable');const actual=await run(async cursor=>{reads++;return (await get(cursor)).data;},{cursor:preferred.nextCursor});assert.equal(reads,2);assert.deepEqual(actual.records.map(r=>r.id),[article.id,note.id]);assert.equal(actual.nextCursor,null);assert.equal(actual.searchIncomplete,false);assert.equal(actual.matchEvidence.length,2);assert.ok(actual.matchEvidence.every(e=>e.matchedTerm===needle&&e.href.includes('rendition=')));
 // A deliberately narrow old SQL-style comparison is valid only for this ASCII independent title/body fixture, not source-rights admission.
 const sqlStart=performance.now(),legacy=await f.db.prepare("SELECT data FROM v2_records WHERE owner=? AND trashed_at IS NULL AND (instr(lower(json_extract(data,'$.body')),lower(?))>0 OR instr(lower(json_extract(data,'$.title')),lower(?))>0) ORDER BY json_extract(data,'$.updatedAt') DESC,family,id LIMIT 41").bind(c.owner,needle,needle).all();const legacyMs=performance.now()-sqlStart;
 assert.equal(legacy.results.length,2);const firstKey=JSON.parse(Buffer.from(first.data.nextCursor,'base64url').toString());const scanned=rows.filter(r=>r.updatedAt>=firstKey.updatedAt&&r.id<=firstKey.id);const rawBytes=scanned.reduce((n,r)=>n+Buffer.byteLength(JSON.stringify(r)),0);
 t.diagnostic('SEARCH_BOUNDARY_PERFORMANCE '+JSON.stringify({synthetic:true,hosted:false,recordCount:rows.length,firstRawWindowCandidates:scanned.length,estimatedRawJsonBytes:rawBytes,firstPreparedQueries:Number(first.headers.get('X-Test-Prepared-Queries')),firstScanElapsedMs:Math.round(firstMs),oldSqlCandidateRows:legacy.results.length,oldSqlReturnedJsonBytes:legacy.results.reduce((n,r)=>n+Buffer.byteLength(r.data),0),oldSqlElapsedMs:Math.round(legacyMs),automaticReads:reads,maxAutomaticReads:SEARCH_AUTO_SCAN_LIMIT,meaning:'Local stress comparison; old SQL prefilters this ASCII fixture, while rights-safe projections do more CPU/materialization. No hosted latency or universal performance claim.'}));
 const foreign=await f.client('TEST-ONLY-other-owner').request('/api/query?'+new URLSearchParams({q:needle,limit:'40',cursor:first.data.nextCursor}));assert.equal(foreign.status,400);
 await insert(f,c.owner,record('changed-after-cursor','note','Independent change'));const stale=await c.request('/api/query?'+new URLSearchParams({q:needle,limit:'40',cursor:first.data.nextCursor}));assert.equal(stale.status,409,'version-scoped cursor must not survive a corpus change');
 }finally{await f.dispose()}
});

test('automatic continuation is bounded and exposes unfinished coverage after three empty windows',async()=>{
 let calls=0;const result=await run(async()=>page({nextCursor:'scan-'+(++calls),searchIncomplete:true,continuationKind:'scan'}));assert.equal(calls,3);assert.equal(searchCoverageIncomplete(result),true);assert.equal(result.nextCursor,'scan-3');assert.equal(showCompletedSearchEmpty({records:0,concepts:0,loading:false,cursor:result.nextCursor,incomplete:true}),false);
 let requests=0;const complete=await run(async()=>{requests++;return page()});assert.equal(requests,1);assert.equal(showCompletedSearchEmpty({records:0,concepts:0,loading:false,cursor:complete.nextCursor,incomplete:searchCoverageIncomplete(complete)}),true);
});
test('result pages preserve exact order and concepts without scanning past useful results',async()=>{
 const item=record('found','note','A result'),concept={concept:{id:'alias'},deepLink:'exact'};let calls=0;const result=await run(async()=>{calls++;return page({records:[item],conceptMatches:[concept],nextCursor:'more-matches',continuationKind:'matches'})});assert.equal(calls,1);assert.deepEqual(result.records,[item]);assert.deepEqual(result.conceptMatches,[concept]);assert.equal(searchCoverageIncomplete(result),false);assert.equal(result.nextCursor,'more-matches');assert.equal(showCompletedSearchEmpty({records:0,concepts:0,loading:false,cursor:result.nextCursor,incomplete:false}),false);
});
test('query cancellation and stale query/account generations cannot publish delayed search pages',async()=>{
 const controller=new AbortController();let current=true,calls=0;await assert.rejects(run(async()=>{calls++;controller.abort();return page({records:[record('stale','note','old')]})},{signal:controller.signal}),e=>e.name==='AbortError');assert.equal(calls,1);
 await assert.rejects(run(async()=>{current=false;return page()},{isCurrent:()=>current}),e=>e.name==='AbortError');
 await assert.rejects(run(async()=>page({generation:'restored@2'})),e=>e.code==='workspace_generation_changed');
 const stopped=new AbortController();stopped.abort();await assert.rejects(run(async()=>{throw Error('must not request')},{signal:stopped.signal}),e=>e.name==='AbortError');
});
test('a failed or repeating continuation cannot become a completed empty search',async()=>{
 let calls=0;await assert.rejects(run(async()=>{calls++;if(calls===1)return page({nextCursor:'later',searchIncomplete:true});throw Error('network unavailable')}),/network unavailable/);assert.equal(calls,2);
 await assert.rejects(run(async()=>page({nextCursor:'same',searchIncomplete:true})),/did not advance/);
});

test('ranked Library matches stop an empty-record scan burst and survive returned continuation',async()=>{
 const library={family:'article',id:'canonical-nc',title:'Sockets',href:'/?view=library&family=article&id=canonical-nc&rendition=exact&section=nc',reference:{term:'nc'}};
 let calls=0;const result=await run(async()=>{calls++;return page({records:[],libraryMatches:[library],libraryMatchesTruncated:true,libraryMatchesCursor:'library-more',nextCursor:'older-work',searchIncomplete:true,continuationKind:'scan'});});
 assert.equal(calls,1);assert.deepEqual(result.libraryMatches,[library]);assert.equal(result.libraryMatchesTruncated,true);assert.equal(result.libraryMatchesCursor,'library-more');assert.equal(result.nextCursor,'older-work');
 assert.equal(showCompletedSearchEmpty({records:0,concepts:result.libraryMatches.length,loading:false,cursor:result.nextCursor,incomplete:true}),false);
});
