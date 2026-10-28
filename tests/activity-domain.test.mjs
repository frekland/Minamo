import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {decodeBundleFixture} from './portable-bundle-fixture.mjs';
const worker='import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1",MINAMO_LEARNING_ATLAS:"1"})}}';
const activity=(text='What can one receive guarantee?')=>({contract:'minamo.activity.v1',template:'debugging',intent:'Inspect exact source, predict, run locally and compare supplied evidence.',authorship:'original-exercise',blocks:[{id:'prompt',kind:'prediction',text},{id:'hints',kind:'hint-ladder',hints:[{id:'h1',tier:'concept',text:'PRIVATE CONCEPT HINT CANARY'},{id:'h2',tier:'strategy',text:'PRIVATE STRATEGY HINT CANARY'}]},{id:'reflection',kind:'reflection',text:'Which assumption changed and why?'}]});
const purpose='Synthetic Activity integration proof; no actual learner evidence or learning claim.';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const rpc=async(c,name,args)=>{const r=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...args}}}));assert.notEqual(r.result.isError,true,r.result.content[0].text);return JSON.parse(r.result.content[0].text);};

test('Activity typed MCP publication, explicit attempts and fresh natural-name continuity use existing durable domain',{timeout:60000},async t=>{
 const f=await privateStorageFixture(worker),c=f.client('synthetic-activity-owner'),other=f.client('synthetic-activity-foreign');let first,newer,attempt,request;
 try{
  const investigation=ok(await c.command({action:'create',family:'investigation',id:'activity-debug-question',data:{title:'TEST ONLY Stream Studio project',body:'Does one socket receive return the full logical message?',synthetic:true}})).record;
  request={purpose,operationId:'activity-publish-once',id:'activity-stream-quest',title:'TEST ONLY chunked-read debug quest',body:'Original authored programming challenge. No execution claimed.',synthetic:true,links:[{family:'investigation',id:investigation.id}],activity:activity()};
  await t.test('capability discovery is typed and preview writes neither record nor receipt',async()=>{
   const caps=await rpc(c,'get_minamo_activity_capabilities',{});assert.equal(caps.enabled,true);assert.ok(caps.templates.includes('debugging'));
   const preview=await rpc(c,'preview_minamo_activity_package',request);assert.equal(preview.valid,true);assert.equal(preview.execution,'not-executed');
   const row=await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first();assert.equal(row.n,0);
   assert.equal((await c.request('/api/operations?operationId=activity-publish-once')).status,404);
   const list=ok(await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/list'}));const publish=list.result.tools.find(x=>x.name==='publish_minamo_activity_package');assert.equal(publish.inputSchema.additionalProperties,false);assert.ok(publish.inputSchema.properties.activity.properties.blocks.items.oneOf.length>=7);
  });
  await t.test('one guarded publication saves exact edition and replay returns one operation',async()=>{
   const result=await rpc(c,'publish_minamo_activity_package',request);first=result.record;assert.equal(result.receipt.status,'committed');assert.equal(result.learningDevelopmentCreated,false);assert.match(result.deepLink,/family=experiment/);assert.equal(first.activity.blocks[1].hints[0].text,'');
   const replay=await rpc(c,'publish_minamo_activity_package',request);assert.equal(replay.receipt.replayed,true);assert.equal(replay.record.rev,1);
   const rows=await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first();assert.equal(rows.n,1);
   const collision=ok(await c.request('/mcp',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'publish_minamo_activity_package',arguments:{...request,title:'Changed input with old operation'}}}));assert.equal(collision.result.isError,true);assert.equal(JSON.parse(collision.result.content[0].text).code,'idempotency_mismatch');
  });
  await t.test('ordinary reads and uncertain receipt readback never disclose unopened hints',async()=>{
   for(const result of [await rpc(c,'read_minamo_activity',{id:first.id,rendition:first.rendition}),await rpc(c,'read_minamo_record',{family:'experiment',id:first.id}),ok(await c.request('/api/workspace')),ok(await c.request('/api/operations?operationId=activity-publish-once')),ok(await c.recover('export'))])assert.doesNotMatch(JSON.stringify(result),/PRIVATE (?:CONCEPT|STRATEGY) HINT CANARY/);
   const hint=await rpc(c,'reveal_minamo_activity_hint',{id:first.id,rendition:first.rendition,hintId:'h1'});assert.equal(hint.hint.text,'PRIVATE CONCEPT HINT CANARY');assert.equal(hint.saved,false);assert.doesNotMatch(JSON.stringify(hint),/PRIVATE STRATEGY/);
   assert.equal((await other.request('/api/activities/read',{id:first.id})).status,404);
  });
  await t.test('saved Attempt keeps supplied provenance and remains pinned after Activity revision',async()=>{
   const input={purpose,operationId:'activity-attempt-once',id:'activity-first-attempt',title:'TEST ONLY external test attempt',synthetic:true,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:first.id,rendition:first.rendition},state:'editing',prediction:'I expect one receive call may be partial.',nextIntention:'Run the deliberate red tests locally, then compare.',hintsRevealed:['h1'],evidence:[{classification:'supplied-terminal',text:'$ python3 -m unittest -v\nFAILED (failures=3)\nSupplied synthetic fixture; not execution by this test.'}]}};
   const saved=await rpc(c,'record_minamo_activity_attempt',input);attempt=saved.record;assert.equal(attempt.evidence,'illustrative');assert.equal(attempt.attempt.evidence[0].classification,'supplied-terminal');assert.equal(saved.learningDevelopmentCreated,false);
   const revised=await rpc(c,'publish_minamo_activity_package',{...request,operationId:'activity-revise',expectedRev:first.rev,activity:activity('What happens when the logical message arrives in chunks?')});newer=revised.record;assert.notEqual(first.rendition,newer.rendition);const replayOld=await rpc(c,'publish_minamo_activity_package',request);assert.equal(replayOld.record.rendition,first.rendition,'Uncertain old publication recovers its committed immutable edition, not the latest edit.');
   assert.equal((await rpc(c,'read_minamo_activity',{id:first.id,rendition:first.rendition})).record.rev,first.rev);
   const stale=await c.request('/api/activities/publish',{...request,operationId:'activity-stale-revision',expectedRev:first.rev});assert.equal(ok(stale).receipt.status,'conflict');
   const repin=await c.request('/api/activities/attempt',{...input,operationId:'activity-repin-denied',expectedRev:attempt.rev,attempt:{...input.attempt,activity:{...input.attempt.activity,rendition:newer.rendition}}});assert.equal(repin.status,409);
   const forged=await c.command({action:'update',family:'run',id:attempt.id,expectedRev:attempt.rev,data:{evidence:'observed'}});assert.equal(forged.status,400);
  });
  await t.test('fresh natural project query recovers linked cartridge and latest explicit intention without opaque IDs',async()=>{
   const recovered=await rpc(c,'get_minamo_activity_context',{query:'Stream Studio project',includeSynthetic:true});assert.equal(recovered.targets[0].id,investigation.id);assert.equal(recovered.activities[0].id,first.id);assert.equal(recovered.activities[0].deferredContent,true);assert.equal(recovered.attempts[0].attempt.activity.rendition,first.rendition);assert.match(recovered.attempts[0].attempt.nextIntention,/red tests locally/);assert.doesNotMatch(JSON.stringify(recovered),/PRIVATE (?:CONCEPT|STRATEGY)/);
   const counts=await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first();assert.equal(counts.n,0);
  });
  await t.test('encrypted export/import restores native metadata and immutable targets with generation fencing',async()=>{
   const passphrase='Synthetic-activity-recovery-only';const exported=await c.request('/api/recovery/export',{operationId:'activity-export',expectedGeneration:c.generation,passphrase});assert.equal(exported.status,200,JSON.stringify(exported.data));const decoded=decodeBundleFixture(Buffer.from(exported.data),passphrase);const row=decoded.manifest.tables.v2_records.find(r=>r.id===first.id);assert.equal(JSON.parse(row.data).activity.contract,'minamo.activity.v1');
   const metadata=Buffer.from(JSON.stringify({operationId:'activity-import',expectedGeneration:c.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);const staged=ok(await c.request('/api/recovery/import',Buffer.concat([prefix,metadata,Buffer.from(exported.data)]),{raw:true,headers:{'content-type':'application/octet-stream'}}));assert.equal(staged.staged.state,'ready');
   const activated=ok(await c.recover('activate',{operationId:'activity-activate',stagedId:staged.staged.id}));c.setGeneration(activated.generation);assert.notEqual(c.generation,'legacy@0');const restored=await rpc(c,'read_minamo_activity',{id:first.id,rendition:first.rendition});assert.equal(restored.record.rendition,first.rendition);assert.equal(ok(await c.context('run',attempt.id)).record.attempt.nextIntention,'Run the deliberate red tests locally, then compare.');
   const old=await c.request('/api/activities/publish',{...request,operationId:'activity-old-generation',expectedGeneration:'legacy@0'},{headers:{'x-minamo-generation':'legacy@0'}});assert.equal(old.status,409);assert.equal(old.data.code,'generation_conflict');
  });
 }finally{await f.dispose();}
});

test('Activity strict admission rejects unknown solutions, source copies, computed claims, package traversal and observed Attempts',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('synthetic-activity-admission');try{
  const base={purpose,operationId:'bad',id:'bad',title:'TEST ONLY bad',synthetic:true,activity:activity()};
  for(const cartridge of [{...activity(),solution:'Hidden repaired solution'}, {...activity(),blocks:[{id:'bad',kind:'script',code:'while(true){}'}]}, {...activity(),blocks:[{id:'bad',kind:'hint-ladder',hints:[{id:'solution',tier:'solution',text:'No complete hidden solution accepted.'}]}]}, {...activity(),blocks:[{id:'bad',kind:'source-browser',bundle:{contract:'minamo.project.v1',id:'unsafe',title:'unsafe',runtime:'python',commands:{kali:'python3 -m unittest -v',powershell:'py -3 -m unittest -v'},files:[{path:'../escape.py',role:'editable-starter',text:'x',sha256:'a'.repeat(64)},{path:'test.py',role:'visible-test',text:'x',sha256:'a'.repeat(64)}]}}]}]){const rejected=await c.request('/api/activities/publish',{...base,activity:cartridge});assert.ok([400,409].includes(rejected.status),JSON.stringify(rejected.data));}
  const rows=await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE family='experiment'").first();assert.equal(rows.n,0);
 }finally{await f.dispose();}
});

test('Activity original source files are native canonical passages with exact Unicode Flags and retained annotations',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('synthetic-activity-capture');
 try{
  const {createHash}=await import('node:crypto');const file=(path,role,text)=>({path,role,text,sha256:createHash('sha256').update(text).digest('hex')});const source='label = "😀"\nprint(label)\n';const bundle={contract:'minamo.project.v1',id:'capture-code',title:'Original source capture',runtime:'python',commands:{kali:'python3 -m unittest -v',powershell:'py -3 -m unittest -v'},files:[file('project.py','editable-starter',source),file('test_project.py','visible-test','import unittest\n')]};
  const req={purpose,operationId:'activity-capture-publish',id:'activity-capture',title:'TEST ONLY original code capture',synthetic:true,activity:{...activity(),blocks:[{id:'starter',kind:'source-browser',bundle}]}};
  const record=(await rpc(c,'publish_minamo_activity_package',req)).record;const start=source.indexOf('😀'),end=start+2,anchor={recordFamily:'experiment',articleId:record.id,rendition:record.rendition,sectionId:'activity',partId:'starter-file-0',start,end,quote:'😀'};
  const context=ok(await c.request('/api/context',{family:'experiment',id:record.id,rendition:record.rendition,selection:{sectionId:'activity',partId:'starter-file-0',start,end}}));assert.equal(context.selection.quote,'😀');
  const saved=ok(await c.command({action:'create',family:'annotation',id:'activity-code-annotation',data:{title:'TEST ONLY source reasoning',body:'Original supplied code contains a supplementary Unicode character.',synthetic:true,anchor}})).record;assert.equal(saved.anchor.quote,'😀');
  const bookmark=ok(await c.request('/api/bookmarks',{target:{kind:'passage',anchor}}));const flagged=ok(await c.command({action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:bookmark.targetRev}));assert.equal(flagged.bookmark.active,true);
  const bad=await c.command({action:'create',family:'annotation',id:'activity-code-bad-boundary',data:{title:'TEST ONLY invalid surrogate',body:'Must reject splitting a Unicode character.',synthetic:true,anchor:{...anchor,end:start+1,quote:source.slice(start,start+1)}}});assert.equal(bad.status,400);
  const nextSource=source.replace('print(label)','print(label * 2)');const changed=await rpc(c,'publish_minamo_activity_package',{...req,operationId:'activity-capture-revise',expectedRev:record.rev,activity:{...req.activity,blocks:[{id:'starter',kind:'source-browser',bundle:{...bundle,files:[file('project.py','editable-starter',nextSource),bundle.files[1]]}}]}});assert.notEqual(changed.record.rendition,record.rendition);
  const retained=ok(await c.context('annotation',saved.id));assert.equal(retained.anchor.state,'retained-revision');assert.equal(retained.anchor.record.activity.blocks[0].bundle.files[0].text,source);
  const download=await c.request('/api/activities/project?'+new URLSearchParams({id:record.id,rendition:record.rendition,blockId:'starter'}));assert.equal(download.status,200);assert.equal(download.headers.get('content-type'),'application/zip');assert.ok(download.data.byteLength>source.length);
 }finally{await f.dispose();}
});
