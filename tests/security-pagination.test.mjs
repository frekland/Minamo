import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler};',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('pagination keeps principal, filter and eligibility boundaries across continuation',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
 const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const owner='synthetic-pagination-security-a',other='synthetic-pagination-security-b',stamp='2026-10-21T12:00:00.000Z';
 const headers=principal=>({'oai-authenticated-user-id':principal,'oai-authenticated-user-email':'synthetic@example.invalid','Content-Type':'application/json'});
 const get=async(path,principal=owner)=>{const response=await mf.dispatchFetch('https://security.invalid'+path,{headers:headers(principal)});return{status:response.status,data:await response.json()}};
 const post=async(path,body,principal=owner)=>{const response=await mf.dispatchFetch('https://security.invalid'+path,{method:'POST',headers:headers(principal),body:JSON.stringify(body)});return{status:response.status,data:await response.json()}};
 const expected=[];
 async function fixture(principal,family,id,body,updatedAt=stamp,trashedAt=null){const record={id,family,title:'SYNTHETIC TEST ONLY '+id,body,links:[],rev:1,createdAt:updatedAt,updatedAt,trashedAt,actor:'system',synthetic:true};await db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,1,?,?)').bind(principal,family,id,JSON.stringify(record),trashedAt,'fixture-'+id).run();return record;}
 for(const family of ['article','journey','note'])for(const id of ['same-id','tie-01','tie-02','tie-03']){await fixture(owner,family,id,'needle '+family+' '+id);expected.push(family+':'+id);}
 await fixture(other,'note','other-secret','needle OTHER PRINCIPAL SECRET');
 await fixture(owner,'note','trashed-secret','needle TRASHED SECRET',stamp,stamp);
 const first=(await get('/api/workspace?limit=2')).data;
 await t.test('stable timestamp ties continue by family and ID without duplicates or omissions',async()=>{
 const seen=[];let page=first;let pages=0;while(true){assert.ok(++pages<20);seen.push(...page.records.map(r=>r.family+':'+r.id));if(!page.nextCursor)break;const response=await get('/api/workspace?limit=2&cursor='+encodeURIComponent(page.nextCursor));assert.equal(response.status,200);page=response.data;}
 assert.deepEqual(seen,expected);assert.equal(new Set(seen).size,expected.length);
 });
 await t.test('cursor is bound to principal, read kind, filter and page size',async()=>{
 const cursor=first.nextCursor;assert.ok(cursor);
 for(const [path,principal] of [['/api/workspace?limit=2&cursor='+cursor,other],['/api/workspace?limit=3&cursor='+cursor,owner],['/api/workspace?limit=2&includeTrash=1&cursor='+cursor,owner],['/api/query?q=needle&limit=2&cursor='+cursor,owner]]){const response=await get(path,principal);assert.equal(response.status,400,JSON.stringify(response));assert.equal(response.data.code,'cursor_scope_mismatch');assert.ok(!JSON.stringify(response.data).includes('SECRET'));}
 const query=(await post('/api/query',{query:'needle',family:'note',limit:2})).data;assert.ok(query.nextCursor);
 for(const options of [{query:'other',family:'note',limit:2},{query:'needle',family:'journey',limit:2},{query:'needle',family:'note',limit:2,includeTrash:true}]){const response=await post('/api/query',{...options,cursor:query.nextCursor});assert.equal(response.status,400);assert.equal(response.data.code,'cursor_scope_mismatch');}
 });
 await t.test('malformed cursor keys fail closed; cursor is continuation state, never an authorisation token',async()=>{
 const payload=JSON.parse(Buffer.from(first.nextCursor,'base64url').toString());
 for(const mutate of [p=>({...p,v:99}),p=>({...p,updatedAt:'not-a-date'}),p=>({...p,family:'owner'}),p=>({...p,unexpected:'x'}),p=>({...p,id:'../private'})]){const bad=Buffer.from(JSON.stringify(mutate(payload))).toString('base64url');const response=await get('/api/workspace?limit=2&cursor='+bad);assert.equal(response.status,400);}
 const response=await mf.dispatchFetch('https://security.invalid/api/workspace?limit=2&cursor='+first.nextCursor);assert.equal(response.status,401);
 // The scope digest is not a cryptographic signature. A user may alter their own cutoff,
 // but the SQL owner and active-record predicates must still fence all returned content.
 const ownCutoff=Buffer.from(JSON.stringify({...payload,updatedAt:'9999-01-01T00:00:00.000Z',family:'article',id:'a'})).toString('base64url');const page=await get('/api/workspace?limit=2&cursor='+ownCutoff);assert.equal(page.status,200);assert.ok(page.data.records.every(r=>!r.body.includes('SECRET')));
 });
 await t.test('MCP enforces its exported page limit before computing a continuation cursor',async()=>{
 for(const name of ['get_minamo_workspace','query_minamo_records'])for(const limit of [41,300,'20']){
 const response=await post('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Synthetic pagination boundary verification',limit}}});assert.equal(response.status,200);assert.equal(response.data.result.isError,true);const error=JSON.parse(response.data.result.content[0].text);assert.equal(error.code,'invalid_limit');assert.ok(!Object.hasOwn(error,'nextCursor'));
 }
 });
 await t.test('records Trashed after page one cannot reappear from a valid active cursor',async()=>{
 const response=await post('/api/commands',{operationId:'security-pagination-trash',action:'trash',family:'journey',id:'tie-03',expectedRev:1});assert.equal(response.status,200);
 let cursor=first.nextCursor;const all=[];while(cursor){const response=await get('/api/workspace?limit=2&cursor='+cursor);assert.equal(response.status,200);all.push(...response.data.records);cursor=response.data.nextCursor;}
 assert.ok(!all.some(r=>r.family==='journey'&&r.id==='tie-03'));assert.ok(!all.some(r=>r.id==='trashed-secret'));
 });
 await t.test('an authenticated exact selection beyond the first page is independently readable and owner-fenced',async()=>{
 assert.ok(!first.records.some(r=>r.family==='note'&&r.id==='tie-03'));
 const exact=await get('/api/context?family=note&id=tie-03');assert.equal(exact.status,200);assert.equal(exact.data.record.family,'note');assert.equal(exact.data.record.id,'tie-03');assert.match(exact.data.record.body,/needle/);
 assert.equal((await get('/api/context?family=note&id=tie-03',other)).status,404);
 const before=(await db.prepare('SELECT COUNT(*) count FROM v2_records WHERE owner=?').bind(owner).first()).count;await get('/api/context?family=note&id=tie-03');const after=(await db.prepare('SELECT COUNT(*) count FROM v2_records WHERE owner=?').bind(owner).first()).count;assert.equal(before,after,'exact read must not recreate or mutate missing-page records');
 });
 await t.test('UTF-8 byte bound advances from the final returned key rather than skipping budget-excluded records',async()=>{
 const principal='synthetic-byte-budget';const ids=[];
 // Isolated robustness fixtures stress the stored-byte boundary independently of write admission.
 for(let n=0;n<12;n++){const id='large-'+String(n).padStart(2,'0');await fixture(principal,'note',id,'🧠'.repeat(45000));ids.push(id);}
 let page=(await get('/api/workspace?limit=12',principal)).data;assert.equal(page.truncated,true);assert.ok(page.records.length>0&&page.records.length<12);let seen=[];while(true){const storedBytes=page.records.reduce((sum,r)=>{const{rendition,...stored}=r;return sum+Buffer.byteLength(JSON.stringify(stored),'utf8')},0);assert.ok(storedBytes<=page.byteLimit);seen.push(...page.records.map(r=>r.id));if(!page.nextCursor)break;const response=await get('/api/workspace?limit=12&cursor='+page.nextCursor,principal);assert.equal(response.status,200);page=response.data;}
 assert.deepEqual(seen,ids);assert.equal(new Set(seen).size,ids.length);
 });
 }finally{await mf.dispose()}
});
