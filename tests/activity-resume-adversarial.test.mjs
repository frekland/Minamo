import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1",MINAMO_LEARNING_ATLAS:"1"});}}';
const purpose='TEST ONLY independent Activity continuity challenge; no genuine learner evidence';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const call=async(c,name,args)=>{const r=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose,...args}}}));assert.equal(r.result.isError,false,r.result.content[0].text);return JSON.parse(r.result.content[0].text);};
const cartridge={contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'Challenge fragmented stream assumptions using an original synthetic prompt.',blocks:[{id:'predict',kind:'prediction',text:'A peer closes after three chunks. Predict how many receives preserve its bytes.'}]};

test('fresh natural Journey name finds two nonlexical linked Notes, exact terminal and immutable Activity without writes', {timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-resume-owner'),other=f.client('TEST-ONLY-resume-other');
 try{
  const question=ok(await c.command({action:'create',family:'investigation',id:'framing-question',data:{title:'TEST ONLY How is the end signalled?',body:'Original synthetic question about finite streams.',synthetic:true}})).record;
  const journey=ok(await c.command({action:'create',family:'journey',id:'stream-lab',data:{title:'TEST ONLY Packet Postcard',body:'A synthetic project whose Notes do not repeat its name.',synthetic:true,links:[{family:'investigation',id:question.id}]}})).record;
  const activity=(await call(c,'publish_minamo_activity_package',{operationId:'resume-challenge',id:'bounded-receives',title:'TEST ONLY Three envelopes',synthetic:true,links:[{family:'investigation',id:question.id}],activity:cartridge})).record;
  // This Activity has no direct Journey link: the owned saved Investigation is the bridge.
  const terminal='$ python3 -m unittest -v\r\n\u001b[31mFAIL\u001b[0m\t日本語 😀\r\n'+('external supplied line\r\n'.repeat(150));
  const marker='[[minamo-terminal:v1:'+JSON.stringify({id:'external-stream',output:terminal,label:'Supplied test evidence'})+']]';
  const notes=[];
  for(const [i,body] of ['First provisional claim: the message may be fragmented.','Later intention: inspect the byte limit before changing code.\n\n'+marker].entries())notes.push(ok(await c.command({action:'create',family:'note',id:'short-thought-'+i,data:{title:'TEST ONLY '+(i?'A later intention':'An initial guess'),body,bodyFormat:'markdown-v1',synthetic:true,links:[{family:'investigation',id:question.id}]}})).record);
  const before=await f.db.prepare('SELECT count(*) n FROM v2_revisions').first();
  const resumed=await call(c,'get_minamo_activity_context',{query:journey.title,includeSynthetic:true});
  assert.equal(resumed.targets.length,1);
  assert.equal(resumed.targets[0].id,journey.id);
  assert.ok(resumed.activities.some(r=>r.id===activity.id),'Activity connected through the exact owned Investigation must be recovered.');
  assert.deepEqual(new Set(resumed.notes.map(r=>r.id)),new Set(notes.map(r=>r.id)));
  const later=resumed.notes.find(r=>r.id===notes[1].id);
  assert.match(later.body,/Later intention/);
  assert.doesNotMatch(later.body,/external supplied line/,'Continuity defers terminal transcripts rather than emitting a partial marker.');
  assert.equal(later.terminalCaptures[0].id,'external-stream');
  const {tool,...terminalArgs}=later.terminalCaptures[0].exactRead;
  const exact=await call(c,tool,terminalArgs);
  assert.equal(exact.capture.output,terminal,'CRLF/ANSI/tabs/emoji must survive exact MCP terminal readback.');
  assert.equal(exact.complete,true);
  const stranger=await call(other,'get_minamo_activity_context',{query:journey.title,includeSynthetic:true});
  assert.deepEqual(stranger.targets,[]);assert.deepEqual(stranger.notes,[]);assert.deepEqual(stranger.activities,[]);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_revisions').first()).n,before.n);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n,0);
  ok(await c.command({action:'trash',family:'note',id:notes[0].id,expectedRev:notes[0].rev}));
  const afterTrash=await call(c,'get_minamo_activity_context',{query:journey.title,includeSynthetic:true});
  assert.deepEqual(afterTrash.notes.map(r=>r.id),[notes[1].id]);
 }finally{await f.dispose();}
});

test('duplicate exact project names explicitly require selection instead of silently attributing combined context',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-ambiguous-resume');
 try{
  for(const id of ['first','second'])ok(await c.command({action:'create',family:'journey',id,data:{title:'TEST ONLY Duplicate Station',body:'Independent synthetic duplicate '+id,synthetic:true}}));
  const result=await call(c,'get_minamo_activity_context',{query:'TEST ONLY Duplicate Station',includeSynthetic:true});
  assert.equal(result.targets.length,2);assert.equal(result.ambiguousTargets,true);assert.match(result.selectionRequired,/Select an exact/);
 }finally{await f.dispose();}
});

test('independent challenge: exact Journey and Investigation title collision requires owner selection',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-cross-family-ambiguity');
 try{
  for(const family of ['journey','investigation'])ok(await c.command({action:'create',family,id:'same-id',data:{title:'TEST ONLY Shared Compass',body:'A separate saved '+family+' with a colliding name.',synthetic:true}}));
  const result=await call(c,'get_minamo_activity_context',{query:'TEST ONLY Shared Compass',includeSynthetic:true});
  assert.deepEqual(new Set(result.targets.map(r=>r.family)),new Set(['journey','investigation']));
  assert.equal(result.ambiguousTargets,true,'Two family-qualified exact matches cannot silently be treated as one target.');
  assert.match(result.selectionRequired,/Select an exact/);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n,0);
 }finally{await f.dispose();}
});

test('exact Journey stage and Phase I resumption exclude sibling phase Activities and Notes',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-stage-resume');
 try{
  const sections=[{id:'one',title:'Polite requests',parts:[{id:'p',kind:'paragraph',text:'Original request context.'}]},{id:'two',title:'Past events',parts:[{id:'p',kind:'paragraph',text:'Separate past event context.'}]}];
  const journey=ok(await c.command({action:'create',family:'journey',id:'railway',data:{title:'TEST ONLY Railway conversation',body:'Independent original study route.',synthetic:true,sections,learningShape:{version:1,kind:'journey',stages:[{id:'requests',sectionId:'one',title:'Polite requests'},{id:'past',sectionId:'two',title:'Past events'}]}}})).record;
  const tasks=[];for(const [id,sectionId]of [['requests-task','one'],['past-task','two']]){const q=ok(await c.command({action:'create',family:'investigation',id,data:{title:'TEST ONLY '+id,body:'Exact-stage question.',synthetic:true,links:[{family:'journey',id:journey.id,rendition:journey.rendition,sectionId}]}})).record;const a=(await call(c,'publish_minamo_activity_package',{operationId:'publish-'+id,id:'activity-'+id,title:'TEST ONLY '+id+' exercise',synthetic:true,links:[{family:'investigation',id:q.id}],activity:cartridge})).record;tasks.push(a);ok(await c.command({action:'create',family:'note',id:'note-'+id,data:{title:'TEST ONLY '+id+' intention',body:id==='requests-task'?'Review polite request register.':'PAST PHASE SHOULD BE DEFERRED',synthetic:true,links:[{family:'investigation',id:q.id}]}}));}
  for(const id of ['index-a','index-b'])ok(await c.command({action:'create',family:'article',id,data:{title:'TEST ONLY Railway Polite requests '+id,body:'A lexical match alone does not associate evidence with a stage.',synthetic:true}}));
  const first=await call(c,'get_minamo_activity_context',{query:'Railway Polite requests',includeSynthetic:true,limit:1});assert.ok(first.nextCursor);const continued=await call(c,'get_minamo_activity_context',{query:'Railway Polite requests',includeSynthetic:true,limit:1,cursor:first.nextCursor});assert.equal(continued.exactTarget.stageId,'requests');assert.deepEqual(continued.activities.map(r=>r.id),[tasks[0].id]);
  const resumed=await call(c,'get_minamo_activity_context',{query:'Railway Polite requests',includeSynthetic:true});assert.equal(resumed.exactTarget.stageId,'requests');assert.deepEqual(resumed.activities.map(r=>r.id),[tasks[0].id]);assert.doesNotMatch(JSON.stringify(resumed),/PAST PHASE SHOULD BE DEFERRED|activity-past-task/);assert.equal(resumed.broaderContext.deliberate,true);
  const phase=ok(await c.command({action:'create',family:'journey',id:'phase-one',data:{title:'TEST ONLY Bandit Phase I',body:'Independent first phase.',synthetic:true}})).record;
  ok(await c.command({action:'update',family:'journey',id:journey.id,expectedRev:journey.rev,data:{links:[{family:'journey',id:phase.id,reason:'Explicit child phase.'}]}}));
  const exact=await call(c,'get_minamo_activity_context',{query:phase.title,includeSynthetic:true});assert.deepEqual(exact.activities,[]);assert.deepEqual(exact.notes,[],'An unrelated parent Journey cannot pull sibling phase evidence into this exact phase.');
 }finally{await f.dispose();}
});
