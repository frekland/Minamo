import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {exchangeSdk} from '../scripts/activity-exchange-proof.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wr('miniflare'),{unstable_getMiniflareWorkerOptions}=require('wrangler');

test('compiled product Activity/MCP/Atlas workflow with feature-on synthetic D1 and ordinary SSR',async t=>{
 const options=unstable_getMiniflareWorkerOptions('dist/server/wrangler.json'),root=resolve('dist/server'),files=readdirSync(root,{recursive:true}).filter(n=>n.endsWith('.js'));
 const mf=new Miniflare({...options.workerOptions,bindings:{...options.workerOptions.bindings,MINAMO_OWNER_ID:'TEST-ONLY-compiled-activity',MINAMO_SITE_HOSTS:'127.0.0.1,localhost',MINAMO_ACTIVITY_STUDIO:'1',MINAMO_LEARNING_ATLAS:'1'},modules:['index.js',...files.filter(n=>n!=='index.js')].map(n=>({type:'ESModule',path:resolve(root,n)})),modulesRoot:root,cf:false});
 try{
  const base=(await mf.ready).origin,db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const identity={'oai-authenticated-user-id':'TEST-ONLY-compiled-activity','oai-authenticated-user-email':'synthetic@example.invalid','x-minamo-generation':'legacy@0'};
  const send=(path,body,extra={})=>mf.dispatchFetch(base+path,{method:body?'POST':'GET',headers:{...identity,...(body?{'Content-Type':'application/json'}:{}),...extra},...(body?{body:JSON.stringify(body)}:{})});
  const rpc=async(name,args)=>{const r=await send('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}});assert.equal(r.status,200);const e=await r.json();assert.notEqual(e.result.isError,true,e.result.content[0].text);return JSON.parse(e.result.content[0].text);};
  let published;
  await t.test('discover and publish original multifile challenge through compiled MCP',async()=>{
   const caps=await rpc('get_minamo_activity_capabilities',{purpose:'Read supported synthetic Activity contract'});assert.equal(caps.enabled,true);
   const r=await send('/api/commands',{operationId:'compiled-question',action:'create',family:'investigation',id:'compiled-stream-question',data:{title:'TEST ONLY Stream Detective',body:'What guarantees a complete application message?',synthetic:true}});assert.equal(r.status,200,await r.clone().text());
   const sdk=await exchangeSdk(),{project,template}=await sdk.generateChallenge('tcp-chunks');
   const args={purpose:'Create synthetic compiled Activity acceptance',operationId:'compiled-activity',id:'compiled-activity',title:'TEST ONLY Stream Detective',synthetic:true,links:[{family:'investigation',id:'compiled-stream-question'}],activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:template.intent,blocks:sdk.challengeCartridgeBlocks(template,project)}};
   const preview=await rpc('preview_minamo_activity_package',args);assert.equal(preview.classification,'authored-exercise');
   assert.equal(Number((await db.prepare("SELECT count(*) n FROM v2_records WHERE family='experiment'").first()).n),0);
   published=await rpc('publish_minamo_activity_package',args);assert.equal(published.record.activity.contract,'minamo.activity.v1');assert.equal(published.learningDevelopmentCreated,false);
   const replay=await rpc('publish_minamo_activity_package',args);assert.equal(replay.receipt.replayed,true);assert.equal(replay.record.rendition,published.record.rendition);
  });
  await t.test('ordinary route SSR mounts product Activity with source and existing Notes shell',async()=>{
   const r=await send('/?view=tools&family=experiment&id=compiled-activity');assert.equal(r.status,200);const html=await r.text();assert.match(html,/TEST ONLY Stream Detective/);assert.match(html,/Activity Studio|Opening Activity Studio/);assert.match(html,/Notes|notes/);
   for(const path of ['/preview-activity','/preview-activity/api','/capability-foundry'])assert.equal((await send(path)).status,404);
  });
  await t.test('explicit supplied Attempt survives fresh MCP read and natural-name continuity',async()=>{
   const saved=await rpc('record_minamo_activity_attempt',{purpose:'Save synthetic supplied evidence and next intention',operationId:'compiled-attempt',id:'compiled-attempt',title:'TEST ONLY Stream Detective attempt',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:published.record.id,rendition:published.record.rendition},state:'submitted',prediction:'One recv might be sufficient.',nextIntention:'Inspect persistent framing rather than assuming EOF.',hintsRevealed:[],evidence:[{classification:'supplied-terminal',text:'SUPPLIED TEST OUTPUT; not executed by this product Worker.'}]}});
   assert.equal(saved.record.evidence,'illustrative');
   const fresh=await rpc('get_minamo_activity_context',{purpose:'Fresh synthetic tutor natural-name recovery',query:'Stream Detective',includeSynthetic:true});assert.equal(fresh.activities.length,1);assert.equal(fresh.attempts[0].attempt.nextIntention,'Inspect persistent framing rather than assuming EOF.');
   assert.equal((await send('/api/context?family=run&id=compiled-attempt',undefined,{'oai-authenticated-user-id':'other'})).status,403);
  });
  await t.test('graph endpoint uses same owned current records and creates no progress',async()=>{
   const r=await send('/api/learning-graph?lens=galaxy&includeSynthetic=true&limit=20');assert.equal(r.status,200);const graph=await r.json();assert.equal(graph.contract,'minamo.learning-graph.v1');assert.ok(graph.nodes.some(n=>n.record?.id==='compiled-activity'||n.id.includes('compiled-activity')));assert.ok(graph.edges.length>0);
   assert.equal(Number((await db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n),0);
  });
 }finally{await mf.dispose();}
});
