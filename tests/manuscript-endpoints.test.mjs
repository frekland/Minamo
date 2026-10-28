import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('manuscript endpoints retain authenticated owner/generation boundaries and small typed discovery',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET'],cf:false});
 try{
  const db=await mf.getD1Database('DB');
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'manuscript-endpoint-synthetic-owner','oai-authenticated-user-email':'test@example.invalid','Content-Type':'application/json','X-Minamo-Generation':'legacy@0'};
  const request=(path,body,extra={})=>mf.dispatchFetch('https://v2.test'+path,{method:body===undefined?'GET':'POST',headers:{...headers,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const input={purpose:'TEST ONLY manuscript endpoint acceptance',operationId:'manuscript-endpoint-test',expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'Explain the exact meaning of a Python list length.',documents:[{key:'length',role:'article',markdown:'# TEST ONLY — Counting top-level items\n\n`len(values)` counts top-level items. A nested list is still one item.\n\n```python\nvalues = [[1, 2], [3]]\nprint(len(values))\n```\n\nThis example displays 2 because the outer list contains two items; the lengths of the nested lists do not change that count.'}]}};
  await t.test('anonymous source, preview and publication cannot reach storage',async()=>{
   for(const path of ['/api/manuscripts/preview','/api/manuscripts/publish'])assert.equal((await mf.dispatchFetch('https://v2.test'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})).status,401);
   assert.equal((await mf.dispatchFetch('https://v2.test/api/manuscripts/source?operationId='+input.operationId)).status,401);
   assert.equal((await db.prepare('SELECT COUNT(*) n FROM v2_records').first()).n,0);
  });
  await t.test('cross-site and stale-generation publication reject without persistence',async()=>{
   assert.equal((await request('/api/manuscripts/publish',input,{origin:'https://other.invalid'})).status,403);
   assert.equal((await request('/api/manuscripts/publish',{...input,expectedGeneration:'stale@4'},{'X-Minamo-Generation':'stale@4'})).status,409);
   assert.equal((await db.prepare('SELECT COUNT(*) n FROM v2_records').first()).n,0);
  });
  await t.test('actual tools/list exposes original brief and Markdown instead of internal persistence fields',async()=>{
   const response=await request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});assert.equal(response.status,200);
   const tools=(await response.json()).result.tools;
   for(const name of ['publish_minamo_manuscript','preview_minamo_manuscript','read_minamo_manuscript_source'])assert.ok(tools.some(t=>t.name===name));
   const tool=tools.find(t=>t.name==='publish_minamo_manuscript'),schema=tool.inputSchema;
   assert.deepEqual(schema.required,['purpose','operationId','expectedGeneration','manuscript']);
   assert.equal(schema.properties.manuscript.properties.brief.maxLength,24000);
   assert.equal(schema.properties.manuscript.properties.documents.maxItems,16);
   assert.deepEqual(Object.keys(schema.properties.manuscript.properties.documents.items.properties),['learningScope','catalogue','key','role','title','markdown','target']);
   assert.equal(schema.properties.manuscript.properties.documents.items.properties.sections,undefined);
   const command=tools.find(t=>t.name==='apply_minamo_command').inputSchema.properties.command;
   assert.ok(command.oneOf[0].properties.data.properties.sections.items.properties.parts.items.properties.diagram.oneOf.some(d=>d.properties.format.const==='graph-v1'));
   assert.equal(command.oneOf[0].properties.data.properties.sections.items.properties.parts.items.properties.inline.maxItems,200);
  });
  await t.test('new MCP calls still require explicit current owner scope',async()=>{
   for(const name of ['publish_minamo_manuscript','preview_minamo_manuscript','read_minamo_manuscript_source']){
    const response=await request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name,arguments:{operationId:input.operationId}}});
    const result=(await response.json()).result;assert.equal(result.isError,true);assert.equal(JSON.parse(result.content[0].text).code,'request_scope_required');
   }
  });
  await t.test('MCP discovery reports actual manuscript server contract version',async()=>{
   const response=await request('/mcp',{jsonrpc:'2.0',id:3,method:'initialize'});
   assert.equal((await response.json()).result.serverInfo.version,'2026-10-27.1');
  });
  await t.test('Worker source explicitly routes manuscript HTTP and existing authoring endpoints to shared domain',()=>{
   const source=readFileSync('worker/index.ts','utf8');
   assert.match(source,/isDomainPath\(path\)\) return domainHandler/);
   const registry=readFileSync('lib/domain-routes.ts','utf8');
   for(const path of ['/api/manuscripts/source','/api/manuscripts/preview','/api/manuscripts/publish','/api/authoring/preview','/api/authoring/apply'])assert.ok(registry.includes("'"+path+"'"),path);
  });
 }finally{await mf.dispose()}
});
