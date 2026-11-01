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
