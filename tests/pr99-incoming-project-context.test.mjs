import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const layout=(note)=>({version:1,sections:[{id:'related',title:'Related material',pattern:'research',slots:[{id:'primary',role:'primary',blockIds:['note']}]}],blocks:[{id:'note',ref:{family:'note',id:note.id,rendition:note.rendition}}]});

test('Your Work and exact context query discover incoming canonical Project references without rewriting the Note',async()=>{
 const f=await privateStorageFixture(worker);
 try{
  const owner=f.client('pr99-work-owner'),other=f.client('pr99-other-owner');
  const made=await owner.command({action:'create',family:'note',id:'pr99-note',data:{title:'Reproduced Python finding',body:'Independent evidence; not a learner achievement.'}});
  assert.equal(made.status,200,JSON.stringify(made.data));const note=made.data.record;
  const project=await owner.request('/api/projects/update',{operationId:'make-project',expectedGeneration:owner.generation,projectId:'pr99-project',expectedProjectRev:0,title:'Investigating replay uncertainty',body:'A Python question.',composition:layout(note)});
  assert.equal(project.status,200,JSON.stringify(project.data));
  const all=await owner.request('/api/query',{personal:true});
  assert.equal(all.status,200,JSON.stringify(all.data));
  assert.deepEqual(all.data.records.map(r=>r.id),[note.id]);
  assert.deepEqual(all.data.projectContexts,[{record:{family:'note',id:note.id},projects:[{family:'journey',id:'pr99-project',title:'Investigating replay uncertainty'}]}]);
  assert.deepEqual(all.data.records[0].links,[],'incoming relation never fabricates a Note outgoing link');
  const unlinked=await owner.request('/api/query',{personal:true,unlinked:true});
  assert.equal(unlinked.status,200,JSON.stringify(unlinked.data));assert.deepEqual(unlinked.data.records,[]);
  const byProject=await owner.request('/api/query',{personal:true,context:{family:'journey',id:'pr99-project'}});
  assert.deepEqual(byProject.data.records.map(r=>r.id),[note.id]);
  assert.deepEqual((await other.request('/api/query',{personal:true})).data.projectContexts,[]);
  const revised=await owner.command({action:'update',family:'note',id:note.id,expectedRev:1,data:{body:'A revised and independently retained interpretation.'}});
  assert.equal(revised.status,200);
  assert.equal((await owner.request('/api/query',{personal:true,unlinked:true})).data.records.length,0,'an exact old retained Note edition remains a legitimate Project relationship');
  const removed=await owner.request('/api/projects/update',{operationId:'remove-project-link',expectedGeneration:owner.generation,projectId:'pr99-project',expectedProjectRev:1,composition:{version:1,sections:[],blocks:[]}});
  assert.equal(removed.status,200,JSON.stringify(removed.data));
  const after=await owner.request('/api/query',{personal:true,unlinked:true});
  assert.deepEqual(after.data.records.map(r=>r.id),[note.id]);
  assert.deepEqual(after.data.projectContexts,[]);
 }finally{await f.dispose();}
});
