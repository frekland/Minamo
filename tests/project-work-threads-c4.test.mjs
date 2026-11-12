import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

test('C4: owner-scoped work threads retain history, follow exact moves, and expose ambiguous references',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('c4-owner'),stranger=fixture.client('c4-stranger'),projectId='c4-thread-continuity';
  const draft={id:'analysis',title:'Analysis',parts:[{id:'claim',kind:'paragraph',text:'First interpretation'},{id:'code',kind:'code',text:'print(1)'}]};
  const evidence={id:'evidence',title:'Evidence',parts:[{id:'data',kind:'paragraph',text:'Measured observation'}]};
  const composition={version:1,sections:[{id:'main',title:'Working',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['a','b']}]}],blocks:[{id:'a',sectionId:'analysis'},{id:'b',sectionId:'evidence'}]};
  const update=(op,rev,fields)=>owner.request('/api/projects/update',{operationId:op,expectedGeneration:owner.generation,projectId,expectedProjectRev:rev,...fields});
  const created=await update('c4-create',0,{title:'Engineering notes',contentSections:[draft,evidence],composition});
  assert.equal(created.status,200,JSON.stringify(created.data));
  const thread={id:'reliability',title:'What is reliable?',question:'Does code support the observation?',items:[{sectionId:'analysis',partId:'code',role:'working'},{sectionId:'evidence',partId:'data',role:'evidence'},{sectionId:'analysis',partId:'claim',role:'earlier',revision:1}]};
  const authored=await update('c4-author',1,{changes:[{op:'upsertWorkThread',thread}]});
  assert.equal(authored.status,200,JSON.stringify(authored.data));
  const replay=await update('c4-author',1,{changes:[{op:'upsertWorkThread',thread}]});
  assert.equal(replay.data.replayed,true);
  const moved=await update('c4-move',2,{contentSections:[{...draft,parts:[draft.parts[0]]},{...evidence,parts:[...evidence.parts,draft.parts[1]]}]});
  assert.equal(moved.status,200,JSON.stringify(moved.data));
  const read=await owner.request('/api/projects/composition?projectId='+projectId);
  assert.equal(read.data.composition.workThreads[0].items[0].sectionId,'evidence');
  assert.equal(read.data.workThreadReferenceIssues.length,0);
  const notOwned=await stranger.request('/api/projects/composition?projectId='+projectId);
  assert.equal(notOwned.status,404);
  const invalid=await update('c4-invalid',3,{changes:[{op:'upsertWorkThread',thread:{...thread,id:'bad',items:[{sectionId:'analysis',partId:'invented',role:'working'}]}}]});
  assert.equal(invalid.status,400);
  const gone=await update('c4-remove',3,{contentSections:[{...evidence,parts:[evidence.parts[0]]}]});
  assert.equal(gone.status,200,JSON.stringify(gone.data));
  const missing=await owner.request('/api/projects/composition?projectId='+projectId);
  assert.equal(missing.data.workThreadReferenceIssues[0].reason,'removed');
  const reused=await update('c4-reuse',4,{contentSections:[{...draft,parts:[...draft.parts] }]});
  assert.equal(reused.status,200,JSON.stringify(reused.data));
  const ambiguous=await owner.request('/api/projects/composition?projectId='+projectId);
  assert.equal(ambiguous.data.workThreadReferenceIssues[0].reason,'identity-uncertain');
  const retained=await owner.request('/api/projects/composition?projectId='+projectId+'&revision=1');
  assert.equal(retained.data.record.sections[0].parts[0].text,'First interpretation');
  const stale=await update('c4-stale',3,{changes:[{op:'removeWorkThread',id:'reliability'}]});
  assert.equal(stale.status,409);
 }finally{await fixture.dispose();}
});
