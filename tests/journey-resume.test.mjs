import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {seedJourneyResume} from './journey-resume-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
async function ok(promise){const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
const read=(c,args)=>ok(c.request('/api/learning-context',args));
const mcp=async(c,args)=>{const r=await ok(c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'TEST ONLY continue a naturally named project',...(args.scope==='resume'?{includeSynthetic:true}:{}),...args}}}));assert.notEqual(r.result.isError,true,JSON.stringify(r));return JSON.parse(r.result.content[0].text);};

test('natural project continuation groups ordinary short Notes, exact task evidence and post-checkpoint intention without a handover',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-resume-owner'),s=await seedJourneyResume(c);
 // Accelerated synthetic sessions span saved dates without waiting days or writing hosted records.
 for(const [id,at] of [['TEST-ONLY-queue-note-admit-before','2026-10-21T09:00:00.000Z'],['TEST-ONLY-queue-note-admit-after','2026-10-22T10:00:00.000Z'],['TEST-ONLY-queue-note-retry-before','2026-10-23T11:00:00.000Z']]){await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.createdAt',?,'$.updatedAt',?) WHERE owner=? AND family='note' AND id=?").bind(at,at,c.owner,id).run();await f.db.prepare("UPDATE v2_revisions SET data=json_set(data,'$.createdAt',?,'$.updatedAt',?) WHERE owner=? AND family='note' AND id=? AND revision=1").bind(at,at,c.owner,id).run();}
 const before=Number((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n);
 const context=await mcp(c,{scope:'resume',query:"Use minamo. Let's continue the queue project"});assert.equal(context.resolution.status,'resolved');assert.equal(context.pageRole,'journey-overview');assert.equal(context.journey.id,s.journey.id);assert.equal(context.lastSeenByGpt,'unknown');assert.equal(context.activityGroups.length,6);assert.match(JSON.stringify(context),/Next time I want to investigate the retry\/shutdown race/);assert.doesNotMatch(JSON.stringify(context),/TEST_ONLY_UNRELATED_GARDEN_SECRET/);
 const shutdown=await mcp(c,context.activityGroups.find(g=>g.target.investigationId===s.investigations[2].id).checkpointRead);assert.match(shutdown.resume.nextAction,/pausing a retry/);const latest=shutdown.activity.items.find(i=>i.id===s.intention.id);assert.equal(latest.afterCheckpoint,true);assert.equal(latest.rev,2);assert.equal(latest.textComplete,true);assert.equal(latest.lastSeenByGpt,'unknown');assert.match(shutdown.activity.checkpointComparison.label,/not last seen/);assert.match(latest.authority,/untrusted data/);
 const retry=await mcp(c,{scope:'target',target:{kind:'investigation',investigationId:s.investigations[1].id},activityLimit:12});const note=retry.activity.items.find(i=>i.id===s.evidence.id);assert.match(note.text,/Prediction: join/);assert.match(note.text,/Observation: only seven/);assert.match(note.text,/Interpretation: join counts/);assert.match(note.text,/Unsure/);assert.equal(note.detailsDeferred,true);assert.equal(note.terminalCaptures.length,1);assert.equal(note.terminalCaptures[0].id,'retry-test');assert.equal(note.exactRead.rendition,s.evidence.rendition);assert.doesNotMatch(note.text,/retained error/);assert.ok(JSON.stringify(retry).length<30000);
 const annotation=retry.activity.items.find(i=>i.family==='annotation');assert.match(annotation.authority,/untrusted/);assert.equal(annotation.origin.quote,'Acknowledgment');assert.equal(annotation.origin.rendition,s.article.rendition);assert.equal(annotation.origin.quoteComplete,true);assert.ok(retry.activity.items.some(i=>i.family==='flag'&&i.authority==='bookmark only'));
 const admission=await read(c,{scope:'target',target:{kind:'investigation',investigationId:s.investigations[0].id}});assert.doesNotMatch(JSON.stringify(admission.activity),/Prediction: join|Next time I want/,'shared reading never retargets a Note');
 assert.equal(Number((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n),before,'all resumption reads are read-only');
 const exact=await ok(c.context('note',s.evidence.id,s.evidence.rendition));assert.match(exact.record.body,/minamo-terminal/);assert.match(exact.record.body,/successes=7/);
 console.log('synthetic natural resumption',JSON.stringify({firstCall:'get_minamo_learning_context scope resume query queue project',overviewBytes:Buffer.byteLength(JSON.stringify(context)),exactTargetBytes:Buffer.byteLength(JSON.stringify(retry)),initialReadActions:1,taskFollowupActions:1,independentNotes:8,hosted:false}));
 }finally{await f.dispose();}
});

test('natural resolution preserves genuine ambiguity, whole-word lookup and owner isolation',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-resolve-ambiguity');await seedJourneyResume(c);
 await ok(c.command({action:'create',family:'journey',id:'TEST-ONLY-second-queue',data:{title:'TEST ONLY alternate queue project',body:'Separate project; do not merge evidence.',synthetic:true}}));
 const ambiguity=await mcp(c,{scope:'resume',query:'queue project'});assert.equal(ambiguity.resolution.status,'ambiguous');assert.equal(ambiguity.resolution.candidates.length,2);assert.equal(ambiguity.activityGroups,undefined);assert.equal(ambiguity.resume,undefined);assert.match(ambiguity.resolution.notice,/choose/);
 const other=await mcp(f.client('TEST-ONLY-different-owner'),{scope:'resume',query:'queue project'});assert.equal(other.resolution.status,'not-found');assert.doesNotMatch(JSON.stringify(other),/alternate queue|queue-note/);
 await ok(c.command({action:'create',family:'investigation',id:'TEST-ONLY-trust',data:{title:'TEST ONLY trust boundary',body:'Rust occurs only in body; title matching is honest.',synthetic:true}}));const rust=await mcp(c,{scope:'resume',query:'Rust'});assert.equal(rust.resolution.status,'not-found');
 const retry=await mcp(c,{scope:'resume',query:'Retry outcomes'});assert.equal(retry.resolution.status,'resolved');assert.equal(retry.target.kind,'investigation');assert.match(retry.currentTask.title,/Retry outcomes/);
 }finally{await f.dispose();}
});

test('activity paging fences edits, keeps stage identity and retains old passage editions without exposing revoked source quotes',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-activity-rights'),s=await seedJourneyResume(c),target={kind:'investigation',investigationId:s.investigations[1].id};
 const first=await read(c,{scope:'target',target,activityLimit:2});assert.equal(first.activity.items.length,2);assert.ok(first.activity.nextCursor);const second=await read(c,{scope:'target',target,activityLimit:2,activityCursor:first.activity.nextCursor});assert.equal(second.activity.items.length,2);assert.ok(second.activity.items.every(x=>!first.activity.items.some(y=>x.id===y.id)));
 await ok(c.command({action:'update',family:'note',id:s.evidence.id,expectedRev:1,data:{title:'TEST ONLY updated capture title'}}));const stale=await c.request('/api/learning-context',{scope:'target',target,activityLimit:2,activityCursor:first.activity.nextCursor});assert.equal(stale.status,409);assert.equal(stale.data.code,'stale_activity_cursor');
 await ok(c.command({action:'update',family:'article',id:s.article.id,expectedRev:1,data:{sections:[{id:'ack',title:'Acknowledgment',parts:[{id:'ack-p',kind:'paragraph',text:'A revised explanation that preserves the old edition.'}]}]}}));const old=await read(c,{scope:'target',target,activityLimit:12});const annotation=old.activity.items.find(x=>x.family==='annotation');assert.equal(annotation.origin.state,'retained-revision');assert.equal(annotation.origin.rendition,s.article.rendition);assert.equal(annotation.origin.quote,'Acknowledgment');
 const source=(await ok(c.command({action:'create',family:'source',id:'TEST-ONLY-source-origin',data:{title:'TEST ONLY source',body:'',synthetic:true,source:{url:'https://example.invalid/queue',attribution:'Synthetic only',rights:'permitted-excerpt',excerpt:{id:'e',text:'REVOKABLE_SYNTHETIC_QUOTE',locator:'Fixture',edition:'one',basis:'owner-authored',permissionNote:'Own synthetic text',ownerAttested:true,state:'permitted',exportAllowed:true}}}}))).record;
 await ok(c.command({action:'create',family:'annotation',id:'TEST-ONLY-revoked-annotation',data:{title:'TEST ONLY independent comment',body:'Independent commentary survives.',synthetic:true,anchor:{recordFamily:'source',articleId:source.id,rendition:source.rendition,sectionId:'__article',partId:'__excerpt',start:0,end:25,quote:'REVOKABLE_SYNTHETIC_QUOTE'},links:[{family:'investigation',id:s.investigations[1].id}]}}));
 assert.match(JSON.stringify(await read(c,{scope:'target',target,activityLimit:12})),/REVOKABLE_SYNTHETIC_QUOTE/);
 await ok(c.command({action:'update',family:'source',id:source.id,expectedRev:1,data:{source:{excerpt:{state:'revoked'}}}}));const revoked=await read(c,{scope:'target',target,activityLimit:12});assert.doesNotMatch(JSON.stringify(revoked),/REVOKABLE_SYNTHETIC_QUOTE/);assert.equal(revoked.activity.items.find(x=>x.id==='TEST-ONLY-revoked-annotation').origin.state,'unavailable');assert.match(JSON.stringify(revoked),/Independent commentary survives/);
 await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-exact-stage-note',data:{title:'TEST ONLY exact stage',body:'Only the admission stage.',synthetic:true,links:[{family:'journey',id:s.journey.id,rendition:s.journey.rendition,sectionId:'admission'}]}}));const admitted=await read(c,{scope:'target',target:{kind:'journey-stage',journeyId:s.journey.id,stageId:'admit'}});assert.match(JSON.stringify(admitted.activity),/Only the admission stage/);const stopped=await read(c,{scope:'target',target:{kind:'journey-stage',journeyId:s.journey.id,stageId:'stop'}});assert.doesNotMatch(JSON.stringify(stopped.activity),/Only the admission stage/);
 }finally{await f.dispose();}
});

test('resumption validates budgets and partial title matches cannot select a different technical project',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-partial-title');await ok(c.command({action:'create',family:'investigation',id:'TEST-ONLY-python-cli',data:{title:'Python CLI',body:'A Python project cannot silently substitute for Rust.',synthetic:true}}));
 const partial=await mcp(c,{scope:'resume',query:'Rust CLI'});assert.equal(partial.resolution.status,'ambiguous');assert.equal(partial.target,undefined);assert.match(partial.resolution.notice,/clarify/);
 for(const args of [{scope:'resume',query:'Python CLI',activityLimit:0},{scope:'resume',query:'Python CLI',limit:0},{scope:'home',activityCursor:'not-a-cursor'},{scope:'resume',query:'Python CLI',unsupported:'value'}]){const r=await c.request('/api/learning-context',args);assert.equal(r.status,400);assert.match(r.data.error,/1–20|1–40|belongs|Unsupported learning-work field unsupported/);}
 const s=await seedJourneyResume(c);const linked=await mcp(c,{scope:'resume',query:'Retry outcomes from my queue project.'});assert.equal(linked.resolution.status,'resolved');assert.equal(linked.target.investigationId,s.investigations[1].id);assert.match(linked.resolution.matchedBy,/explicitly linked parent/);
 const stage=await read(c,{scope:'target',target:{kind:'journey-stage',journeyId:s.journey.id,stageId:'retry'}});assert.match(JSON.stringify(stage.activity),/join counts completed attempts/);assert.doesNotMatch(JSON.stringify(stage.activity),/Pause a retry just before enqueue/);
 }finally{await f.dispose();}
});

test('large-scope natural discovery pages never claim absence or choose a last-page target',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-discovery-pages');
 for(let i=0;i<122;i++){const now=new Date(1800000000000+i).toISOString(),record={family:'investigation',id:'TEST-ONLY-page-'+i,title:i===0?'Unique queue':'Unrelated topic '+i,body:'Synthetic discovery only.',links:[],rev:1,createdAt:now,updatedAt:now,trashedAt:null,actor:'user',synthetic:true};await f.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,1,NULL,?)').bind(c.owner,record.family,record.id,JSON.stringify(record),'TEST-ONLY-insert-'+i).run();}
 const first=await mcp(c,{scope:'resume',query:'Unique queue'});assert.equal(first.resolution.status,'discovery-incomplete');assert.equal(first.resolution.candidates.length,0);assert.ok(first.resolution.nextCursor);
 const last=await mcp(c,{scope:'resume',query:'Unique queue',cursor:first.resolution.nextCursor});assert.equal(last.resolution.status,'discovery-page');assert.equal(last.resolution.candidates.length,1);assert.equal(last.target,undefined);assert.match(last.resolution.notice,/earlier pages/);
 }finally{await f.dispose();}
});

test('a late intention in a revised long Note gets an accurately labelled recent-edit preview',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-late-intention');const question=(await ok(c.command({action:'create',family:'investigation',id:'TEST-ONLY-long-note-question',data:{title:'TEST ONLY retries',body:'Keep exact evidence accessible.',synthetic:true}}))).record;
 const opening='A prior experiment remains uncertain. '.repeat(45),body=opening+'I will repeat the initial attempt.';
 const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-long-note',data:{title:'TEST ONLY separate experiments',body,synthetic:true,links:[{family:'investigation',id:question.id}]}}))).record;
 await ok(c.command({action:'update',family:'note',id:note.id,expectedRev:1,data:{body:opening+'Next time I want to inspect the retry/shutdown race.'}}));
 const context=await read(c,{scope:'target',target:{kind:'investigation',investigationId:question.id},profile:'tutor'}),item=context.activity.items[0];assert.equal(item.textComplete,false);assert.equal(item.detailsDeferred,true);assert.doesNotMatch(item.text,/Next time/);assert.match(item.recentEdit.text,/Next time I want to inspect/);assert.equal(item.recentEdit.fromRevision,1);assert.equal(item.recentEdit.toRevision,2);assert.match(item.recentEdit.notice,/lexical edit preview/);assert.equal(item.lastSeenByGpt,'unknown');
 }finally{await f.dispose();}
});

test('Journey triage includes new thinking on an older seventeenth Investigation before newer authored empty tasks',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-many-contexts');const journey=(await ok(c.command({action:'create',family:'journey',id:'TEST-ONLY-large-journey',data:{title:'TEST ONLY large queue project',body:'Many independent questions.',synthetic:true}}))).record;
 for(let i=0;i<18;i++)await ok(c.command({action:'create',family:'investigation',id:'TEST-ONLY-many-question-'+i,data:{title:'TEST ONLY question '+i,body:'Independent branch.',synthetic:true,links:[{family:'journey',id:journey.id}]}}));
 const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-older-branch-note',data:{title:'TEST ONLY latest thought',body:'Investigate the retry/shutdown race on this older branch.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-many-question-0'}]}}))).record;
 const overview=await read(c,{scope:'journey',journeyId:journey.id});assert.equal(overview.groupsDeferred,true);assert.equal(overview.activityGroups[0].target.investigationId,'TEST-ONLY-many-question-0');assert.equal(overview.activityGroups[0].activity.items[0].id,note.id);assert.match(overview.selectionBasis,/Parent authoring time does not/);assert.match(JSON.stringify(overview),/retry\/shutdown race/);
 }finally{await f.dispose();}
});

test('late-stage thinking ranks through an outbound Journey-stage relationship without an inbound Investigation parent',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-outbound-stage');const question=(await ok(c.command({action:'create',family:'investigation',id:'TEST-ONLY-outbound-question',data:{title:'TEST ONLY late question',body:'Independent question connected by the Journey.',synthetic:true}}))).record;
 const stages=Array.from({length:18},(_,i)=>({id:'stage'+i,sectionId:'section'+i,title:'Stage '+i}));const journey=(await ok(c.command({action:'create',family:'journey',id:'TEST-ONLY-outbound-journey',data:{title:'TEST ONLY outbound queue project',body:'An optional broad route.',synthetic:true,learningShape:{version:1,kind:'journey',stages},sections:stages.map(stage=>({id:stage.sectionId,title:stage.title,parts:[{id:'p',kind:'paragraph',text:'Try one local variation.'}]})),links:[{family:'investigation',id:question.id,sourceContext:{stageId:'stage17'}}]}}))).record;
 const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-outbound-note',data:{title:'TEST ONLY latest late-stage thought',body:'I want to inspect the late shutdown boundary.',synthetic:true,links:[{family:'investigation',id:question.id}]}}))).record;
 const overview=await read(c,{scope:'journey',journeyId:journey.id});const late=overview.activityGroups.find(group=>group.target.stageId==='stage17');assert.ok(late,'newest thinking in stage18 survives the stage breadth bound');assert.ok(late.activity.items.some(item=>item.id===note.id));assert.equal(overview.groupsDeferred,true);
 }finally{await f.dispose();}
});
