import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=enabled=>'import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:'+JSON.stringify(enabled?'1':'0')+'})}}';
const cartridge=(reading,hint='PRIVATE NONSPOILER HINT CANARY')=>({contract:'minamo.activity.v1',template:'debugging',intent:'Investigate explicit source and test evidence; no learning claim.',authorship:'original-exercise',blocks:[{id:'predict',kind:'prediction',text:'What do you expect?'},...(reading?[{id:'reading',kind:'reading',ref:reading}]:[]),{id:'hints',kind:'hint-ladder',hints:[{id:'h1',tier:'concept',text:hint}]}]});
const ok=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};

test('independent feature-off generic command attack cannot persist a new activity',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker(false)),c=f.client('security-disabled');
 try{
  const rejected=await c.command({action:'create',family:'experiment',id:'security-disabled-act',data:{title:'TEST ONLY disabled',synthetic:true,activity:cartridge()}});
  assert.equal(rejected.status,404);assert.equal(rejected.data.code,'activity_disabled');
  const rows=await f.db.prepare("SELECT COUNT(*) n FROM v2_records WHERE id='security-disabled-act'").first();assert.equal(rows.n,0);
 }finally{await f.dispose();}
});

test('independent Activity concurrency and uncertain-result replay cannot lose a definition',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker(true)),c=f.client('security-concurrency');
 try{
  const first=ok(await c.command({action:'create',family:'experiment',id:'security-race',data:{title:'TEST ONLY concurrency',synthetic:true,activity:cartridge()}})).record;
  const commands=['one','two'].map((label,index)=>({operationId:'security-race-'+label,action:'update',family:'experiment',id:first.id,expectedRev:first.rev,data:{activity:cartridge(undefined,'Hint version '+index)}}));
  const outcomes=await Promise.all(commands.map(command=>c.command(command)));assert.equal(outcomes.filter(r=>r.status===200&&r.data.status==='committed').length,1);assert.equal(outcomes.filter(r=>r.status===409||r.data.status==='conflict').length,1);
  const winner=outcomes.findIndex(r=>r.status===200&&r.data.status==='committed'),saved=ok(await c.context('experiment',first.id)).record;assert.equal(saved.rev,2);
  const replay=ok(await c.command(commands[winner]));assert.equal(replay.replayed,true);assert.equal(replay.recordRef.rev,saved.rev);
  const changed=await c.command({...commands[winner],data:{activity:cartridge(undefined,'Different payload for used operation')}});assert.equal(changed.status,409);assert.equal(changed.data.code,'idempotency_mismatch');
  const history=await f.db.prepare("SELECT COUNT(*) n FROM v2_revisions WHERE owner=? AND family='experiment' AND id=?").bind(c.owner,first.id).first();assert.equal(history.n,2);
 }finally{await f.dispose();}
});

test('independent retained source, hint and edition attacks use current rights and exact immutable activity',{timeout:30000},async()=>{
 const f=await privateStorageFixture(worker(true)),c=f.client('security-lifecycle'),other=f.client('security-foreign');
 try{
  let source=ok(await c.command({action:'create',family:'source',id:'security-source',data:{title:'TEST ONLY source',body:'Original authored source.',synthetic:true,source:{url:'https://example.invalid/security',attribution:'Synthetic author',rights:'permitted-excerpt',excerpt:{id:'security-excerpt',text:'Original source canary.',locator:'Synthetic paragraph',edition:'Original synthetic edition',basis:'owner-authored',permissionNote:'Explicit original synthetic author permission.',ownerAttested:true,state:'permitted',exportAllowed:true}}}})).record;
  const ref={family:'source',id:source.id,rendition:source.rendition,sectionId:'__article',partId:'__excerpt'};
  const request={operationId:'security-publish-act',action:'create',family:'experiment',id:'security-act',data:{title:'TEST ONLY linked activity',body:'Authored challenge.',synthetic:true,activity:cartridge(ref)}};
  const first=ok(await c.command(request)).record;assert.ok(first.activity);assert.doesNotMatch(JSON.stringify(first),/PRIVATE NONSPOILER HINT CANARY/);
  for(const response of [await c.context('experiment',first.id),await c.context('experiment',first.id,first.rendition),await c.request('/api/workspace'),await c.request('/api/query?query=linked')])assert.doesNotMatch(JSON.stringify(ok(response)),/PRIVATE NONSPOILER HINT CANARY/);
  const replay=ok(await c.command(request));assert.equal(replay.replayed,true);assert.doesNotMatch(JSON.stringify(replay),/PRIVATE NONSPOILER HINT CANARY/);
  const newer=ok(await c.command({action:'update',family:'experiment',id:first.id,expectedRev:first.rev,data:{activity:cartridge(ref,'SECOND PRIVATE HINT')}})).record;
  assert.notEqual(newer.rendition,first.rendition,'Activity definition metadata is part of immutable rendition identity.');
  const old=ok(await c.context('experiment',first.id,first.rendition)).record;assert.equal(old.rev,first.rev);assert.equal(old.rendition,first.rendition);
  const attempt={contract:'minamo.attempt.v1',activity:{family:'experiment',id:first.id,rendition:first.rendition},state:'editing',prediction:'Supplied provisional prediction.',evidence:[{classification:'supplied-terminal',text:'TEST ONLY supplied, never executed.'}],hintsRevealed:[]};
  const savedAttempt=ok(await c.command({action:'create',family:'run',id:'security-attempt',data:{title:'TEST ONLY attempt',synthetic:true,evidence:'illustrative',attempt}})).record;
  const promotion=await c.command({action:'update',family:'run',id:savedAttempt.id,expectedRev:savedAttempt.rev,data:{evidence:'observed'}});assert.equal(promotion.status,400,'An evidence-only update cannot relabel an existing supplied Attempt as observed.');
  const retarget=await c.command({action:'update',family:'run',id:savedAttempt.id,expectedRev:savedAttempt.rev,data:{attempt:{...attempt,activity:{...attempt.activity,rendition:newer.rendition}}}});assert.equal(retarget.status,409,'Attempt target edition is immutable.');
  assert.equal((await other.context('experiment',first.id,first.rendition)).status,404);
  source=ok(await c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}})).record;
  for(const rendition of [undefined,first.rendition,newer.rendition]){
   const record=ok(await c.context('experiment',first.id,rendition)).record;assert.equal(record.activity.blocks.find(b=>b.id==='reading').kind,'instruction');assert.doesNotMatch(JSON.stringify(record.activity),/security-excerpt|Original source canary/);
  }
  const forbidden=await c.command({action:'create',family:'experiment',id:'security-reuse-revoked',data:{title:'TEST ONLY revoked reuse',synthetic:true,activity:cartridge(ref)}});assert.ok([400,409].includes(forbidden.status));
  const learning=await f.db.prepare('SELECT COUNT(*) n FROM v2_learning_developments').first();assert.equal(learning.n,0);
 }finally{await f.dispose();}
});
