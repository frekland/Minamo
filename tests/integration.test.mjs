import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const wranglerRequire=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wranglerRequire('miniflare');
const {build}=wranglerRequire('esbuild');
const bundled=await build({stdin:{contents:'import {labHandler} from "./lib/lab-handler.ts"; export default {fetch: labHandler};',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('real handler with local D1/R2: private, durable, revision guarded and MCP read-only',async t=>{
 const mf=new Miniflare({modules:true,script:bundled.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
 const db=await mf.getD1Database('DB');
 for(const sql of readFileSync('drizzle/0000_narrow_forge.sql','utf8').split('--> statement-breakpoint'))await db.prepare(sql).run();
 const headers={'oai-authenticated-user-id':'synthetic-test-user-a','oai-authenticated-user-email':'synthetic-a@example.invalid','Content-Type':'application/json'};
 const call=(body,extra={},path='/api/lab')=>mf.dispatchFetch('https://lab.test'+path,{method:body?'POST':'GET',headers:{...headers,...extra},...(body?{body:JSON.stringify(body)}:{})});
 await t.test('anonymous read and write rejected',async()=>{for(const method of ['GET','POST']){const r=await mf.dispatchFetch('https://lab.test/api/lab',{method,...(method==='POST'?{headers:{'Content-Type':'application/json'},body:'{"operation":"initialize"}'}:{})});assert.equal(r.status,401)}});
 await t.test('cross-origin mutation rejected',async()=>assert.equal((await call({operation:'initialize'},{origin:'https://evil.invalid'})).status,403));
 await t.test('fresh reads create no records',async()=>assert.equal((await(await call()).json()).note,null));
 await t.test('explicit create persists investigation and R2',async()=>{const d=await(await call({operation:'initialize'})).json();assert.equal(d.note.revision,1);assert.equal(d.storage.r2,'object available');assert.equal(d.investigation.title,'How does a note become durable?')});
 await t.test('invalid mutation rejected with unchanged revision',async()=>{assert.equal((await call({operation:'save',body:'',revision:1})).status,400);assert.equal((await(await call()).json()).note.revision,1)});
 await t.test('save, reload and stale compare-and-set',async()=>{assert.equal((await call({operation:'save',body:'SYNTHETIC TEST ONLY — café 日本語 α → β',revision:1})).status,200);assert.equal((await(await call()).json()).note.revision,2);assert.equal((await call({operation:'save',body:'stale',revision:1})).status,409);assert.equal((await(await call()).json()).note.body,'SYNTHETIC TEST ONLY — café 日本語 α → β')});
 await t.test('concurrent writers: exactly one acknowledgement',async()=>{const result=await Promise.all([call({operation:'save',body:'SYNTHETIC TEST ONLY — concurrent A',revision:2}),call({operation:'save',body:'SYNTHETIC TEST ONLY — concurrent B',revision:2})]);assert.deepEqual(result.map(r=>r.status).sort(),[200,409])});
 await t.test('second principal cannot read or alter first records',async()=>{const h={'oai-authenticated-user-id':'synthetic-test-user-b'};assert.equal((await(await call(null,h)).json()).note,null);assert.equal((await call({operation:'save',body:'intrusion',revision:3},h)).status,409)});
 await t.test('R2 modify and readback persists',async()=>{assert.match(await(await call(null,{},'/api/lab/file')).text(),/α → β/);assert.equal((await call({}, {},'/api/lab/file')).status,200);assert.match(await(await call(null,{},'/api/lab/file')).text(),/β → γ/)});
 await t.test('MCP discovery, list and actual same-record invocation',async()=>{for(const method of ['server/discover','tools/list'])assert.ok((await(await call({jsonrpc:'2.0',id:1,method},{},'/mcp')).json()).result);const result=await(await call({jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'get_minamo_next_probe',arguments:{}}},{},'/mcp')).json();assert.equal(JSON.parse(result.result.content[0].text).note.revision,3);const denied=await mf.dispatchFetch('https://lab.test/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'get_minamo_next_probe'}})});assert.equal(denied.status,401)});
 }finally{await mf.dispose()}
});
