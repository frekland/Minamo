import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';import {queryRecords} from './lib/domain.ts';import {resolveGeneration,withGeneration} from './lib/generations.ts';export default {async fetch(request,env){if(new URL(request.url).pathname==='/fixture-count-query'){let prepares=0;try{const measured={...env,DB:{prepare(sql){prepares++;return env.DB.prepare(sql)}}},generation=await resolveGeneration(measured,request.headers.get('oai-authenticated-user-id'));const result=await queryRecords(withGeneration(measured,generation),generation.namespace,await request.json());return Response.json({...result,testOnlyPreparedReads:prepares});}catch(e){return Response.json({code:e.code,error:e.message},{status:e.status??500})}}return domainHandler(request,env)}}`;
const note=(id,extra={})=>({id,family:'note',title:'TEST ONLY thought '+id,body:'Independent synthetic writing.',links:[],rev:1,createdAt:'2026-10-24T00:00:00.000Z',updatedAt:'2026-10-24T00:00:00.000Z',trashedAt:null,actor:'user',synthetic:true,...extra});
const insert=async(f,owner,record)=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(owner,record.family,record.id,record.rev,JSON.stringify(record),record.trashedAt,'TEST-ONLY-fixture').run();
test('complete personal context/topic search finds old direct and parent-linked thinking without loading unrelated pages',async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('TEST-ONLY-pr27-personal'),query=body=>c.request('/api/query',body);
 const area=await c.command({action:'create',family:'area',id:'TEST-ONLY-area',data:{title:'TEST ONLY subject',body:'Synthetic area.',synthetic:true}});assert.equal(area.status,200);
 const investigation=await c.command({action:'create',family:'investigation',id:'TEST-ONLY-question',data:{title:'TEST ONLY investigation',body:'Synthetic question.',links:[{family:'area',id:'TEST-ONLY-area'}],synthetic:true}});assert.equal(investigation.status,200);
 const rows=Array.from({length:125},(_,i)=>note('n'+String(i).padStart(3,'0'),{links:i===124?[{family:'investigation',id:'TEST-ONLY-question'}]:i===123?[{family:'area',id:'TEST-ONLY-area'}]:[]}));
 await f.db.batch(rows.map(record=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(c.owner,record.family,record.id,record.rev,JSON.stringify(record),null,'TEST-ONLY-fixture')));
 const direct=await query({personal:true,context:{family:'investigation',id:'TEST-ONLY-question'},limit:1});assert.equal(direct.status,200,JSON.stringify(direct.data));assert.deepEqual(direct.data.records.map(r=>r.id),['n124']);assert.equal(direct.data.nextCursor,null);
 const mcp=await c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'query_minamo_records',arguments:{purpose:'TEST ONLY retrieve older linked thinking',personal:true,context:{family:'investigation',id:'TEST-ONLY-question'},limit:1}}});assert.equal(mcp.status,200);const mcpPage=JSON.parse(mcp.data.result.content[0].text);assert.deepEqual(mcpPage.records.map(r=>r.id),['n124']);assert.equal(mcpPage.records[0].body,'Independent synthetic writing.');
 const get=await c.request('/api/query?'+new URLSearchParams({personal:'1',context:'investigation:TEST-ONLY-question',limit:'1'}));assert.equal(get.status,200);assert.deepEqual(get.data.records.map(r=>r.id),['n124']);
 const parent=await query({personal:true,context:{family:'area',id:'TEST-ONLY-area'},limit:1});assert.equal(parent.status,200,JSON.stringify(parent.data));assert.deepEqual(parent.data.records.map(r=>r.id),['n123']);assert.ok(parent.data.nextCursor);
 const second=await query({personal:true,context:{family:'area',id:'TEST-ONLY-area'},limit:1,cursor:parent.data.nextCursor});assert.equal(second.status,200);assert.deepEqual(second.data.records.map(r=>r.id),['n124']);
 const topic=await query({personal:true,topic:{family:'area',id:'TEST-ONLY-area'},limit:30});assert.deepEqual(topic.data.records.map(r=>r.id),['n123']);
 const mismatch=await query({personal:true,context:{family:'investigation',id:'TEST-ONLY-question'},limit:1,cursor:parent.data.nextCursor});assert.equal(mismatch.data.code,'cursor_scope_mismatch');
 const foreign=f.client('TEST-ONLY-other-owner');const cross=await foreign.request('/api/query',{personal:true,context:{family:'area',id:'TEST-ONLY-area'}});assert.deepEqual(cross.data.records,[]);
 const moved=await c.command({action:'update',family:'investigation',id:'TEST-ONLY-question',expectedRev:1,data:{links:[]}});assert.equal(moved.status,200);
 const stale=await query({personal:true,context:{family:'area',id:'TEST-ONLY-area'},limit:1,cursor:parent.data.nextCursor});assert.equal(stale.status,409);assert.equal(stale.data.code,'stale_cursor');
 const after=await query({personal:true,context:{family:'area',id:'TEST-ONLY-area'}});assert.deepEqual(after.data.records.map(r=>r.id),['n123']);
 // Same namespace with a newly activated generation still invalidates a retained cursor.
 const page=await query({personal:true,limit:1});assert.ok(page.data.nextCursor);
 await f.db.prepare('INSERT INTO v2_generation_heads(owner,generation_id,revision,namespace) VALUES(?,?,?,?)').bind(c.owner,'fixture-generation',1,c.owner).run();
 c.setGeneration('fixture-generation@1');
 const changedGeneration=await query({personal:true,limit:1,cursor:page.data.nextCursor});assert.equal(changedGeneration.status,409);assert.equal(changedGeneration.data.code,'generation_conflict');
 }finally{await f.dispose()}
});
test('quotation discovery projects current rights before matching while independent prose remains discoverable',async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('TEST-ONLY-pr27-quote'),query=body=>c.request('/api/query',body);
 const phrase='TEST_ONLY_QUOTATION_THAT_CAN_BE_REVOKED';
 const source=await c.command({action:'create',family:'source',id:'TEST-ONLY-source',data:{title:'TEST ONLY source',body:'Independent source context.',synthetic:true,source:{url:'https://example.invalid/owner-original',attribution:'Synthetic owner',rights:'permitted-excerpt',excerpt:{id:'TEST-ONLY-excerpt',text:phrase,locator:'Synthetic paragraph',edition:'Synthetic edition',basis:'owner-authored',permissionNote:'Synthetic owner-authored original excerpt for test only.',ownerAttested:true,state:'permitted',exportAllowed:true}}}});assert.equal(source.status,200,JSON.stringify(source.data));
 let anchor={recordFamily:'source',articleId:source.data.record.id,rendition:source.data.record.rendition,sectionId:'__article',partId:'__excerpt',start:0,end:phrase.length,quote:phrase};
 const area=await c.command({action:'create',family:'area',id:'TEST-ONLY-reading-area',data:{title:'TEST ONLY reading subject',body:'Original synthetic subject.',synthetic:true}});assert.equal(area.status,200);
 const display=await c.command({action:'create',family:'article',id:'TEST-ONLY-display',data:{title:'TEST ONLY containing explanation',body:'Independent explanation.',links:[{family:'area',id:'TEST-ONLY-reading-area'}],sections:[{id:'s',title:'Comparison',parts:[{id:'p',kind:'excerpt',text:phrase,excerpt:{sourceId:source.data.record.id,rendition:source.data.record.rendition,start:0,end:phrase.length}}]}],synthetic:true}});assert.equal(display.status,200,JSON.stringify(display.data));
 const selected=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_context',arguments:{purpose:'TEST ONLY exact source/display capture',family:'article',id:display.data.record.id,rendition:display.data.record.rendition,selection:{sectionId:'s',partId:'p',start:0,end:phrase.length}}}});assert.equal(selected.status,200);const selectedContext=JSON.parse(selected.data.result.content[0].text);assert.ok(selectedContext.selection,JSON.stringify(selectedContext));anchor=selectedContext.selection;
 const capture=await c.command({action:'create',family:'annotation',id:'TEST-ONLY-capture',data:{title:'My synthetic thought',body:'TEST_ONLY_INDEPENDENT_REASONING survives.',anchor,synthetic:true}});assert.equal(capture.status,200,JSON.stringify(capture.data));
 const inDisplay=await query({personal:true,context:{family:'article',id:'TEST-ONLY-display'}});assert.equal(inDisplay.data.records.length,1);const inParent=await query({personal:true,context:{family:'area',id:'TEST-ONLY-reading-area'}});assert.equal(inParent.data.records.length,1);
 const permitted=await query({personal:true,query:phrase});assert.equal(permitted.data.records.length,1);assert.equal(permitted.data.records[0].anchor.quote,phrase);
 const marked=await query({personal:true,quote:phrase});assert.equal(marked.data.records.length,1);
 const revoke=await c.command({action:'update',family:'source',id:'TEST-ONLY-source',expectedRev:source.data.record.rev,data:{source:{excerpt:{state:'revoked'}}}});assert.equal(revoke.status,200,JSON.stringify(revoke.data));
 const hidden=await query({personal:true,query:phrase});assert.deepEqual(hidden.data.records,[]);assert.equal(hidden.data.nextCursor,null);assert.equal(hidden.data.searchIncomplete,false);assert.ok(!JSON.stringify(hidden.data).includes(phrase));
 const hiddenMarked=await query({personal:true,quote:phrase});assert.deepEqual(hiddenMarked.data.records,[]);
 const mcpHidden=await c.request('/mcp',{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'query_minamo_records',arguments:{purpose:'TEST ONLY check current quotation eligibility',personal:true,quote:phrase}}});assert.equal(mcpHidden.status,200);const mcpHiddenPage=JSON.parse(mcpHidden.data.result.content[0].text);assert.deepEqual(mcpHiddenPage.records,[]);assert.ok(!JSON.stringify(mcpHiddenPage).includes(phrase));
 const independent=await query({personal:true,query:'TEST_ONLY_INDEPENDENT_REASONING'});assert.equal(independent.data.records.length,1);assert.equal(independent.data.records[0].anchor.quote,'');assert.match(independent.data.records[0].body,/survives/);
 assert.equal(JSON.parse((await f.db.prepare("SELECT data FROM v2_records WHERE owner=? AND family='annotation' AND id='TEST-ONLY-capture'").bind(c.owner).first()).data).anchor.quote,phrase,'the raw retained quote still exists, proving it was not used for matching');
 }finally{await f.dispose()}
});
test('bounded personal scans return honest continuation and never skip an older match',async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('TEST-ONLY-pr27-budget'),query=body=>c.request('/api/query',body);
 const rows=Array.from({length:625},(_,i)=>note('n'+String(i).padStart(3,'0'),{body:i===624?'TEST_ONLY_OLDER_MATCH':'Independent unrelated thought.'}));
 await f.db.batch(rows.map(record=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(c.owner,record.family,record.id,record.rev,JSON.stringify(record),null,'TEST-ONLY-fixture')));
 const first=await query({personal:true,query:'TEST_ONLY_OLDER_MATCH'});assert.equal(first.status,200,JSON.stringify(first.data));assert.deepEqual(first.data.records,[]);assert.equal(first.data.searchIncomplete,true);assert.ok(first.data.nextCursor);assert.equal(first.data.continuationKind,'scan');
 const next=await query({personal:true,query:'TEST_ONLY_OLDER_MATCH',cursor:first.data.nextCursor});assert.equal(next.status,200);assert.deepEqual(next.data.records.map(r=>r.id),['n624']);assert.equal(next.data.searchIncomplete,false);assert.equal(next.data.nextCursor,null);
 const unlinked=await query({personal:true,unlinked:true,limit:2});assert.equal(unlinked.data.records.length,2);
 const bad=await query({personal:true,context:{family:'article',id:'a',body:'not-an-identity'}});assert.equal(bad.data.code,'invalid_query_context');
 }finally{await f.dispose()}
});

test('many captures share eligibility reads within a request and revocation is rechecked on the next request',async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('TEST-ONLY-pr27-projection-cache'),phrase='TEST_ONLY_SHARED_PERMITTED_QUOTE';
 const source=await c.command({action:'create',family:'source',id:'TEST-ONLY-cache-source',data:{title:'TEST ONLY repeated source',body:'Synthetic source context.',synthetic:true,source:{url:'https://example.invalid/cache-source',attribution:'Synthetic owner',rights:'permitted-excerpt',excerpt:{id:'TEST-ONLY-cache-excerpt',text:phrase,locator:'Synthetic paragraph',edition:'Synthetic edition',basis:'owner-authored',permissionNote:'Synthetic owner-authored controlled excerpt.',ownerAttested:true,state:'permitted',exportAllowed:true}}}});assert.equal(source.status,200,JSON.stringify(source.data));
 const anchor={recordFamily:'source',articleId:source.data.record.id,rendition:source.data.record.rendition,sectionId:'__article',partId:'__excerpt',start:0,end:phrase.length,quote:phrase};
 const rows=Array.from({length:150},(_,i)=>note('capture-'+String(i).padStart(3,'0'),{family:'annotation',anchor}));
 await f.db.batch(rows.map(record=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(c.owner,record.family,record.id,record.rev,JSON.stringify(record),null,'TEST-ONLY-cache-fixture')));
 const measured=await c.request('/fixture-count-query',{personal:true,query:'TEST_ONLY_ABSENT_SEARCH'});assert.equal(measured.status,200,JSON.stringify(measured.data));assert.deepEqual(measured.data.records,[]);assert.equal(measured.data.searchIncomplete,false);assert.ok(measured.data.testOnlyPreparedReads<=12,JSON.stringify({reads:measured.data.testOnlyPreparedReads}));
 const permitted=await c.request('/api/query',{personal:true,quote:phrase,limit:60});assert.equal(permitted.data.records.length,60);assert.ok(permitted.data.records.every(r=>r.anchor.quote===phrase));
 const revoke=await c.command({action:'update',family:'source',id:'TEST-ONLY-cache-source',expectedRev:source.data.record.rev,data:{source:{excerpt:{state:'revoked'}}}});assert.equal(revoke.status,200,JSON.stringify(revoke.data));
 const after=await c.request('/fixture-count-query',{personal:true,quote:phrase});assert.equal(after.status,200,JSON.stringify(after.data));assert.deepEqual(after.data.records,[]);assert.equal(after.data.searchIncomplete,false);assert.ok(after.data.testOnlyPreparedReads<=12,JSON.stringify({reads:after.data.testOnlyPreparedReads}));assert.ok(!JSON.stringify(after.data).includes(phrase));
 }finally{await f.dispose()}
});
