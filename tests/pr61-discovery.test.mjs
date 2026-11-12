import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// Faults exist only in this locally bundled worker, on request-scoped synthetic D1.
const worker=`import {domainHandler} from './lib/domain-handler.ts';import {executeCommand} from './lib/domain.ts';
export default {async fetch(request,env){
 const raw=env.DB,mode=request.headers.get('x-test-read-fault');let checks=0,scans=0,libraryReads=0;
 const statement=(sql,args=[])=>{const s=raw.prepare(sql).bind(...args);return new Proxy(s,{get(target,key){
  if(key==='bind')return (...values)=>statement(sql,values);
  if(key==='first')return async(...values)=>{const result=await target.first(...values);
   if(sql.includes('SELECT version FROM v2_namespace_versions')){checks++;
    if(mode==='once'&&checks===2)await executeCommand(env,args[0],{operationId:'TEST-ONLY-w7-interleaved-mark',action:'setFlag',target:{kind:'record',family:'investigation',id:'TEST-ONLY-w7-question'},active:true,expectedTargetRev:0},'user');
    if(mode==='churn'&&checks%3===2)await raw.prepare('UPDATE v2_namespace_versions SET version=version+1 WHERE owner=?').bind(args[0]).run();
    if(mode==='generation'&&checks===2)await raw.prepare("INSERT OR REPLACE INTO v2_generation_heads(owner,generation_id,revision,namespace) VALUES (?,'TEST-ONLY-other',1,?)").bind(args[0],args[0]+'-other').run();
   }return result;};
  if(key==='all')return async(...values)=>{if(sql.startsWith('WITH candidates AS (SELECT data,family,id'))scans++;if(sql.includes('v2_catalogue_'))libraryReads++;return target.all(...values);};
  const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;
 }});};
 const response=await domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:'1',DB:{prepare:statement,batch:raw.batch.bind(raw)}});
 response.headers.set('x-test-scans',String(scans));response.headers.set('x-test-library-reads',String(libraryReads));return response;
}}`;
const activity={contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'TEST ONLY inspect a bounded fixture',blocks:[{id:'task',kind:'instruction',text:'Predict before comparing the synthetic result.'}]};
async function seed(c){
 for(const record of [
  {family:'investigation',id:'TEST-ONLY-w7-question',data:{title:'TEST ONLY W7 Discovery',body:'Which read should be retried?',synthetic:true}},
  {family:'experiment',id:'TEST-ONLY-w7-activity',data:{title:'TEST ONLY W7 Discovery Activity',body:'A bounded original exercise.',synthetic:true,activity,links:[{family:'investigation',id:'TEST-ONLY-w7-question'}]}},
  {family:'note',id:'TEST-ONLY-w7-note',data:{title:'TEST ONLY later thought',body:'The linked thought need not repeat its project name.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-w7-question'}]}},
 ]){const r=await c.command({action:'create',...record});assert.equal(r.status,200,JSON.stringify(r.data));}
}
async function rpc(c,name,args,mode){const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY W7 read verification',...args}}},{headers:mode?{'x-test-read-fault':mode}:{}});assert.equal(r.status,200,JSON.stringify(r.data));return {...r,value:JSON.parse(r.data.result.content[0].text)};}
const natural={query:'TEST ONLY W7 Discovery',includeSynthetic:true};

test('W7 real MCP: records-only natural Activity recovery, one fresh retry and typed sustained-churn failure',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr61-discovery');await seed(c);
 const clean=await rpc(c,'get_minamo_activity_context',natural);assert.notEqual(clean.data.result.isError,true);assert.equal(clean.value.activities[0].id,'TEST-ONLY-w7-activity');assert.equal(clean.value.notes[0].id,'TEST-ONLY-w7-note');assert.equal(clean.headers.get('x-test-library-reads'),'0');
 const retry=await rpc(c,'get_minamo_activity_context',natural,'once');assert.notEqual(retry.data.result.isError,true,JSON.stringify(retry.value));assert.equal(retry.value.activities[0].id,'TEST-ONLY-w7-activity');assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_bookmarks WHERE owner=? AND active=1').bind(c.owner).first()).n,1,'a real guarded mark was committed between the read fences');
 const churn=await rpc(c,'get_minamo_activity_context',natural,'churn');assert.equal(churn.data.result.isError,true);assert.equal(churn.value.code,'query_changed');assert.equal(churn.value.category,'snapshot-changed');assert.equal(churn.value.retryable,true);assert.equal(churn.value.partialSnapshotReturned,false);assert.equal(churn.headers.get('x-test-scans'),'2','exactly two complete starts; no nested retry storm');assert.deepEqual(churn.data.result.structuredContent,churn.value);assert.equal(churn.value.activities,undefined);
 const global=await rpc(c,'query_minamo_records',{query:'W7'});assert.notEqual(global.data.result.isError,true);assert.ok(Object.hasOwn(global.value,'libraryMatches'),'ordinary global query still enriches Library');assert.ok(Number(global.headers.get('x-test-library-reads'))>0);
 }finally{await f.dispose();}
});

test('W7 real MCP: stale continuation, caller shape and generation failure have separate nonretry semantics',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr61-cursor');await seed(c);
 const first=await rpc(c,'get_minamo_activity_context',{...natural,limit:1});assert.ok(first.value.nextCursor);
 await c.command({action:'create',family:'note',id:'TEST-ONLY-w7-change',data:{title:'TEST ONLY a changed namespace',body:'Synthetic changed work.',synthetic:true}});
 const stale=await rpc(c,'get_minamo_activity_context',{...natural,limit:1,cursor:first.value.nextCursor});assert.equal(stale.value.code,'stale_cursor');assert.equal(stale.value.retryable,false);assert.equal(stale.value.recovery,'restart-first-page-without-cursor');assert.equal(stale.headers.get('x-test-scans'),'0');
 for(const [principal,args] of [[c,{...natural,limit:1,query:'Different project'}],[c,{...natural,limit:2}],[f.client('TEST-ONLY-w7-foreign-cursor'),{...natural,limit:1}]]){const mismatch=await rpc(principal,'get_minamo_activity_context',{...args,cursor:first.value.nextCursor});assert.equal(mismatch.value.code,'cursor_scope_mismatch','principal/query/page mismatch wins over an old snapshot version');assert.equal(mismatch.value.retryable,false);assert.equal(mismatch.headers.get('x-test-scans'),'0');}
 const invalid=await rpc(c,'get_minamo_activity_context',{...natural,limit:0});assert.equal(invalid.value.category,'validation');assert.equal(invalid.value.retryable,false);assert.ok(invalid.value.path);assert.equal(invalid.headers.get('x-test-scans'),'0');
 const generation=await rpc(c,'get_minamo_activity_context',natural,'generation');assert.equal(generation.value.code,'generation_conflict');assert.equal(generation.value.category,'authority-unavailable');assert.equal(generation.value.retryable,false);assert.equal(generation.headers.get('x-test-scans'),'1');assert.equal(generation.value.activities,undefined);
 }finally{await f.dispose();}
});

test('W7 current source revocation stays fail-closed through actual natural discovery and exact MCP reads',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr61-rights');await seed(c);
 const source=await c.command({action:'create',family:'source',id:'TEST-ONLY-w7-source',data:{title:'TEST ONLY W7 source',synthetic:true,source:{url:'https://example.invalid/w7',attribution:'Synthetic owner',rights:'permitted-excerpt',excerpt:{id:'grant',text:'TEST_ONLY_W7_WITHHELD',locator:'Synthetic paragraph',edition:'one',basis:'owner-authored',permissionNote:'Synthetic original only',ownerAttested:true,state:'permitted',exportAllowed:true}}}});assert.equal(source.status,200);
 const published=await c.command({action:'create',family:'experiment',id:'TEST-ONLY-w7-source-activity',data:{title:'TEST ONLY W7 Discovery source practice',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-w7-question'}],activity:{...activity,blocks:[...activity.blocks,{id:'reading',kind:'reading',ref:{family:'source',id:source.data.record.id,rendition:source.data.record.rendition,sectionId:'__article',partId:'__excerpt'}}]}}});assert.equal(published.status,200,JSON.stringify(published.data));
 const edition=published.data.record.rendition;
 const revoke=await c.command({action:'update',family:'source',id:source.data.record.id,expectedRev:source.data.record.rev,data:{source:{excerpt:{state:'revoked'}}}});assert.equal(revoke.status,200);
 const discovery=await rpc(c,'get_minamo_activity_context',natural);assert.notEqual(discovery.data.result.isError,true);assert.doesNotMatch(JSON.stringify(discovery.value),/TEST_ONLY_W7_WITHHELD/);
 const exact=await rpc(c,'read_minamo_activity',{id:'TEST-ONLY-w7-source-activity',rendition:edition});assert.notEqual(exact.data.result.isError,true);assert.equal(exact.value.record.activity.blocks.some(b=>b.id==='reading'&&b.kind==='reading'),false);assert.doesNotMatch(JSON.stringify(exact.value),/TEST_ONLY_W7_WITHHELD/);
 const foreign=await rpc(f.client('TEST-ONLY-w7-foreign'),'read_minamo_activity',{id:'TEST-ONLY-w7-source-activity',rendition:edition});assert.equal(foreign.value.code,'activity_unavailable');assert.equal(foreign.value.retryable,false);assert.doesNotMatch(JSON.stringify(foreign.value),/TEST_ONLY_W7_WITHHELD/);
 const init=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'initialize'});assert.match(init.data.result.serverInfo.description,/Private learning workspace/);
 }finally{await f.dispose();}
});
