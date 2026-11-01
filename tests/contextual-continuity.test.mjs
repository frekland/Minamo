import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async promise=>{const response=await promise;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const projectFocus=id=>({family:'journey',id});
const query=(c,{focus,...options}={})=>c.request('/api/learning-context?'+new URLSearchParams({scope:'evidence',...(focus?{focus:JSON.stringify(focus)}:{}),...options}));
const mcp=(c,input)=>c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'Read saved source receipts only',scope:'evidence',...input}}});

test('C-MOOD/C-MULTI: Project evidence retains Question and Stage, older checkpoint, multi-target Note and source receipts',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('continuity-focus-owner'),another=f.client('continuity-other');
  const project=(await ok(c.command({action:'create',family:'journey',id:'focus-proj',data:{title:'Focus project',body:'Project task',synthetic:false,sections:[{id:'intro',title:'First',parts:[{id:'p',kind:'paragraph',text:'A source passage.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'s1',sectionId:'intro',title:'Compare'}]}}}))).record;
  const question=(await ok(c.command({action:'create',family:'investigation',id:'focus-q',data:{title:'Connected Question',body:'What should be compared?',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition,sectionId:'intro'}]}}))).record;
  const otherQuestion=(await ok(c.command({action:'create',family:'investigation',id:'unrelated-q',data:{title:'Unrelated task',synthetic:false}}))).record;
  const note=(await ok(c.command({action:'create',family:'note',id:'multi-target',data:{title:'Latest observation',body:'Latest reading leaves this unresolved.',synthetic:false,links:[{family:'investigation',id:question.id},{family:'investigation',id:otherQuestion.id}]}}))).record;
  const independent=(await ok(c.command({action:'create',family:'note',id:'free-note',data:{title:'Independent note',body:'I observed something separate.',synthetic:false}}))).record;
  const checkpoint=await ok(c.request('/api/learning-developments',{operationId:'focus-checkpoint',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target:{kind:'journey-stage',journeyId:project.id,stageId:'s1'},expectedTargetRev:project.rev,development:{summary:'Earlier recorded uncertainty',nextAction:'Inspect the pinned source, do not assume success.'}}));
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const focused=await ok(query(c,{focus:projectFocus(project.id)}));
  assert.equal(focused.contract,'minamo.continuity-evidence.v1');
  assert.deepEqual(new Set(focused.items.map(x=>x.basis)),new Set(['authored-writing','saved-checkpoint']));
  assert.equal(focused.items.find(x=>x.source.id===note.id).title,'Latest observation','the UI receives the admitted exact record title rather than guessing from an opaque ID');
  assert.equal(focused.items.find(x=>x.checkpoint).title,'Focus project','the retained checkpoint identifies its admitted task without replacing its original edition');
  assert.deepEqual(new Set(focused.items.map(x=>x.checkpoint?.id??x.source.id)),new Set([note.id,checkpoint.development.id]));
  assert.equal(focused.items.find(x=>x.source.id===note.id).paths[0].target.investigationId,question.id);
  assert.equal(focused.items.find(x=>x.checkpoint).checkpoint.nextAction,'Inspect the pinned source, do not assume success.');
  assert.equal(focused.items.find(x=>x.checkpoint).checkpoint.target.stageId,'s1');
  assert.equal(focused.lastSeenByGpt,'unknown');
  assert.equal(focused.coverage.completeWithinScope,true);
  assert.equal(focused.items.some(x=>x.source.id===independent.id),false);
  const home=await ok(query(c));
  assert.equal(home.items.some(x=>x.source.id===independent.id),true,'Home includes independent writing without a Project');
  assert.deepEqual(new Set(home.items.find(x=>x.source.id===note.id).paths.map(path=>path.target.investigationId)),new Set([question.id,otherQuestion.id]),'a multi-target Note retains both admitted authored paths outside focus');
  const denied=await ok(query(another,{focus:undefined}));assert.equal(denied.items.length,0);assert.doesNotMatch(JSON.stringify(denied),/Latest observation|Earlier recorded uncertainty/);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before,'the evidence read cannot create receipts or links');
  const rpc=await ok(mcp(c,{focus:projectFocus(project.id)}));assert.equal(rpc.result.isError,false,JSON.stringify(rpc));
  assert.match(JSON.stringify(rpc),/minamo.continuity-evidence.v1/);
  const newer=(await ok(c.command({action:'update',family:'journey',id:project.id,expectedRev:project.rev,data:{body:'New editorial revision, not a new learner action.'}}))).record;
  const retained=await ok(query(c,{focus:projectFocus(project.id)}));
  assert.equal(retained.items.find(item=>item.checkpoint).source.rendition,project.rendition,'checkpoint retains its exact older Project edition');
  assert.notEqual(retained.items.find(item=>item.checkpoint).source.rendition,newer.rendition);
  assert.equal(retained.items.some(item=>item.source.id===note.id),true,'a valid older incoming Question link remains intact');
  await ok(c.command({action:'trash',family:'investigation',id:question.id,expectedRev:question.rev}));
  const revoked=await ok(query(c,{focus:projectFocus(project.id)}));
  assert.equal(revoked.items.some(item=>item.source.id===note.id),false,'a revoked Question path cannot leak the Note as Project evidence');
  assert.doesNotMatch(JSON.stringify(revoked),/Latest reading leaves this unresolved|Connected Question/);
 }finally{await f.dispose();}
});

test('C-CAP/C-EMPTY-PARTIAL: 80 unrelated newer identities cannot produce a false empty focused result',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('continuity-cap-owner');
  const q=(await ok(c.command({action:'create',family:'investigation',id:'cap-question',data:{title:'Cap calibration Question',body:'Inspect sparse readings.',synthetic:false}}))).record;
  const relevant=(await ok(c.command({action:'create',family:'note',id:'cap-relevant',data:{title:'Calibration restart note',body:'Restart the series only after checking the instance.',synthetic:false,links:[{family:'investigation',id:q.id}]}}))).record;
  await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.updatedAt','2020-01-01T00:00:00.000Z') WHERE owner=? AND family='note' AND id=?").bind(c.owner,relevant.id).run();
  for(let i=0;i<80;i++)await ok(c.command({action:'create',family:'note',id:'unrelated-cap-'+String(i).padStart(3,'0'),data:{title:'Other Note '+i,body:'Unrelated owner work '+i,synthetic:false}}));
  const first=await ok(query(c,{focus:{family:'investigation',id:q.id}}));
  assert.equal(first.items.length,0,'the first bounded candidate page is genuinely empty for this focus');
  assert.equal(first.coverage.completeWithinScope,false);
  assert.equal(first.coverage.moreAvailable,true);assert.ok(first.coverage.nextCursor);
  assert.ok(first.coverage.gaps.includes('records-deferred'));
  const second=await ok(query(c,{focus:{family:'investigation',id:q.id},cursor:first.coverage.nextCursor}));
  assert.deepEqual(second.items.map(item=>item.source.id),[relevant.id]);
  assert.equal(second.coverage.completeWithinScope,true);
 }finally{await f.dispose();}
});

test('C-PARTIAL/C-EMPTY/C-REV: bounded pages are honest, stale cursors rejected and later revisions retained',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('continuity-partial');
  const empty=await ok(query(c));assert.equal(empty.items.length,0);assert.equal(empty.coverage.completeWithinScope,true);assert.equal(empty.coverage.moreAvailable,false);
  for(let i=0;i<4;i++)await ok(c.command({action:'create',family:'note',id:'ordered-'+i,data:{title:'Note '+i,body:'Unique content '+i,synthetic:false}}));
  const first=await ok(query(c,{limit:'1'}));assert.equal(first.items.length,1);assert.equal(first.coverage.completeWithinScope,false);assert.equal(first.coverage.moreAvailable,true);assert.ok(first.coverage.nextCursor);assert.ok(first.coverage.gaps.includes('records-deferred'));
  const second=await ok(query(c,{limit:'1',cursor:first.coverage.nextCursor}));assert.notEqual(second.items[0].source.id,first.items[0].source.id);
  const firstRecord=(await ok(c.context('note',first.items[0].source.id))).record;
  await ok(c.command({action:'update',family:'note',id:firstRecord.id,expectedRev:firstRecord.rev,data:{body:'New revision does not rewrite older receipt.'}}));
  const stale=await query(c,{limit:'1',cursor:first.coverage.nextCursor});assert.equal(stale.status,409);assert.equal(stale.data.error?.code??stale.data.code,'stale_evidence_cursor');
  const current=await ok(query(c,{limit:'5'}));assert.ok(current.items.some(x=>x.source.id===firstRecord.id&&x.source.rev>firstRecord.rev));
  const wrongFocus=await query(c,{focus:{family:'journey',id:'not-here'}});assert.equal(wrongFocus.status,404);
  const invalid=await c.request('/api/learning-context?scope=evidence&focus='+encodeURIComponent(JSON.stringify({family:'article',id:'x'})));assert.equal(invalid.status,400);
 }finally{await f.dispose();}
});

test('R1 Project-target cursor exposes later linked Questions and their Notes without declaring first-frontier completion',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('continuity-target-pages'),other=f.client('another-target-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'large-target-project',data:{title:'Project with many questions',body:'Authored guidance',synthetic:false,sections:[{id:'intro',title:'Opening stage',parts:[{id:'p',kind:'paragraph',text:'The original task.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage-one',sectionId:'intro',title:'Stage one'}]}}}))).record;
  const questions=[];
  for(let i=0;i<16;i++)questions.push((await ok(c.command({action:'create',family:'investigation',id:'target-q-'+String(i).padStart(2,'0'),data:{title:'Question '+i,body:'Observe carefully.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record);
  const latest=(await ok(c.command({action:'create',family:'note',id:'later-linked-note',data:{title:'A later linked Note',body:'This source must remain findable after the target frontier.',synthetic:false,links:[{family:'investigation',id:questions.at(-1).id}]}}))).record;
  const first=await ok(query(c,{focus:projectFocus(project.id),limit:'8'}));
  assert.equal(first.coverage.completeWithinScope,false);assert.equal(first.coverage.moreTargetsAvailable,true);assert.ok(first.coverage.targetNextCursor);
  assert.ok(first.coverage.gaps.includes('targets-deferred'));assert.equal(first.items.some(item=>item.source.id===latest.id),false);
  const second=await ok(query(c,{focus:projectFocus(project.id),focusCursor:first.coverage.targetNextCursor,limit:'8'}));
  assert.equal(second.items.some(item=>item.source.id===latest.id),true,'later Question-linked writing is discoverable without synthetic relationship guesses');
  assert.equal(second.items.find(item=>item.source.id===latest.id).paths[0].target.investigationId,questions.at(-1).id);
  assert.equal(second.coverage.moreTargetsAvailable,false);assert.equal(second.coverage.completeWithinScope,true);
  const otherScope=await query(c,{focus:projectFocus(project.id),focusCursor:first.coverage.targetNextCursor,limit:'9'});
  assert.equal(otherScope.status,200,'target cursor has its own scope, independent of evidence-item page size');
  const wrongPrincipal=await query(other,{focus:projectFocus(project.id),focusCursor:first.coverage.targetNextCursor});assert.equal(wrongPrincipal.status,409);
  const notFocused=await query(c,{focusCursor:first.coverage.targetNextCursor});assert.equal(notFocused.status,400);
  await ok(c.command({action:'trash',family:'investigation',id:questions.at(-1).id,expectedRev:questions.at(-1).rev}));
  const stale=await query(c,{focus:projectFocus(project.id),focusCursor:first.coverage.targetNextCursor});assert.equal(stale.status,409);
 }finally{await f.dispose();}
});

test('R1 active bookmark index and saved Activity Attempt are distinct read-only Home receipts',{timeout:90000},async()=>{
 const enabled='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}';
 const f=await privateStorageFixture(enabled);try{
  const c=f.client('continuity-bookmark-attempt-owner');
  const source=(await ok(c.command({action:'create',family:'article',id:'attempt-linked-reading',data:{title:'Actual reading',body:'Source material.',synthetic:false,sections:[{id:'s',title:'Source',parts:[{id:'p',kind:'paragraph',text:'Only local synthetic content.'}]}]}}))).record;
  const flagged=await ok(c.command({action:'setFlag',target:{kind:'record',family:'article',id:source.id},active:true,expectedTargetRev:0}));
  const pub=await ok(c.request('/api/activities/publish',{purpose:'TEST ONLY independent saved Attempt fixture',operationId:'continuity-publish',id:'continuity-activity',title:'An authored Activity',synthetic:false,activity:{contract:'minamo.activity.v1',template:'predict-compare',intent:'Compare two possible explanations.',authorship:'original-exercise',blocks:[{id:'question',kind:'practice',exercise:{version:1,id:'question',kind:'open-response',prompt:'Explain one uncertainty.',rubric:'Retain uncertainty.',modelAnswer:'Not automatically disclosed.'}}]}}));
  const attempt=await ok(c.request('/api/activities/attempt',{purpose:'TEST ONLY independent Attempt fixture',operationId:'continuity-attempt',id:'continuity-run',title:'A supplied answer',synthetic:false,attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:pub.record.id,rendition:pub.record.rendition},state:'submitted',hintsRevealed:[],evidence:[],practice:{version:1,responses:[{id:'answer',itemId:'question',revision:1,input:'My independent answer'}],feedback:[],corrections:[],reviewEvents:[],interactions:[]}}}));
  const page=await ok(query(c));const bookmark=page.items.find(item=>item.basis==='bookmark'),run=page.items.find(item=>item.source.id===attempt.record.id);
  assert.ok(bookmark);assert.equal(bookmark.source.family,'flag');assert.equal(bookmark.paths[0].edges[0].id,source.id);
  assert.equal(run.basis,'supplied-attempt');assert.equal(run.source.family,'run');assert.equal(run.title,'A supplied answer');
  assert.equal(run.detailsDeferred,true,'response, feedback and trace remain in the exact retained Attempt');
  assert.doesNotMatch(run.preview.text,/My independent answer|Not automatically disclosed/);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_bookmarks WHERE active=1').first()).n,1);
  await ok(c.command({action:'setFlag',target:{kind:'record',family:'article',id:source.id},active:false,expectedTargetRev:flagged.bookmark.targetRev}));
  const after=await ok(query(c));assert.equal(after.items.some(item=>item.basis==='bookmark'),false,'the active bookmark is not reconstructed from a historical Flag');
  assert.equal(after.items.some(item=>item.source.id===attempt.record.id),true,'independent supplied Attempt survives an unrelated bookmark change');
 }finally{await f.dispose();}
});

test('R1 body-less rich Note remains eligible but an empty saved shell is not learner writing',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('continuity-rich-only-owner');
  const rich=(await ok(c.command({action:'create',family:'note',id:'rich-note',data:{title:'Structured observation',body:'',synthetic:false,sections:[{id:'s',title:'Code observation',parts:[{id:'sample',kind:'code',language:'text',text:'A substantive source-only observation'}]}]}}))).record;
  const empty=(await ok(c.command({action:'create',family:'note',id:'empty-shell',data:{title:'No writing yet',body:'',synthetic:false}}))).record;
  const page=await ok(query(c));const receipt=page.items.find(item=>item.source.id===rich.id);
  assert.ok(receipt,'a Note with authored sections is eligible without a plain-text body');
  assert.equal(receipt.detailsDeferred,true);assert.match(receipt.preview.text,/Saved rich content/);
  assert.equal(page.items.some(item=>item.source.id===empty.id),false,'an empty shell cannot be presented as learner work');
  assert.equal(page.coverage.completeWithinScope,true);
 }finally{await f.dispose();}
});

test('R1 UTF-8 response and query budgets page a larger multibyte corpus without losing records',{timeout:120000},async t=>{
 const measured=`import {domainHandler} from './lib/domain-handler.ts';export default {async fetch(request,env){let count=0;const db=env.DB,started=performance.now();const response=await domainHandler(request,{...env,DB:{prepare(sql){count++;return db.prepare(sql)},batch(statements){return db.batch(statements)},exec(sql){return db.exec(sql)}}});response.headers.set('X-Test-Queries',String(count));response.headers.set('X-Test-Worker-Ms',String(performance.now()-started));return response;}};`;
 const f=await privateStorageFixture(measured);try{
  const c=f.client('continuity-utf8-budget-owner');
  for(let i=0;i<24;i++)await ok(c.command({action:'create',family:'note',id:'multibyte-'+String(i).padStart(2,'0'),data:{title:'Multibyte source '+i,body:'🌿'.repeat(3000),synthetic:false}}));
  let cursor,seen=[],pages=0;const samples=[];
  do{
   const reply=await c.request('/api/learning-context?'+new URLSearchParams({scope:'evidence',limit:'20',...(cursor?{cursor}:{})}));
   const page=await ok(Promise.resolve(reply));const bytes=new TextEncoder().encode(JSON.stringify(page)).byteLength,queries=Number(reply.headers.get('X-Test-Queries'));
   assert.ok(bytes<=65536,'actual UTF-8 JSON envelope must stay under 64 KiB, not merely JS string length');
   assert.ok(queries<=250,'bounded read must not issue unbounded per-record D1 queries');
   seen.push(...page.items.map(item=>item.source.id));cursor=page.coverage.nextCursor;pages++;assert.ok(pages<=12,'cursor must advance');
   samples.push({bytes,queries,workerMs:+Number(reply.headers.get('X-Test-Worker-Ms')).toFixed(1),items:page.items.length});
   if(cursor)assert.equal(page.coverage.completeWithinScope,false);
  }while(cursor);
  assert.equal(new Set(seen).size,24);assert.equal(seen.length,24);t.diagnostic(JSON.stringify({kind:'isolated-D1-continuity-utf8',samples}));
 }finally{await f.dispose();}
});
