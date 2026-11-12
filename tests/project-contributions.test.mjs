import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

test('B1: learner writes survive sessions, GPT reviews exact revisions, stale saves cannot win',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const person=fixture.client('b1-learner-one'),other=fixture.client('b1-learner-two');
  const projectId='b1-living-language',target={projectId,sectionId:'grammar',partId:'examples'};
  const create=await person.command({action:'create',family:'journey',id:projectId,data:{title:'Japanese conversations',body:'Practice building new examples.',sections:[{id:'grammar',title:'Grammar in context',parts:[{id:'examples',kind:'table',text:'Japanese\tEnglish\n買えました。\tI was able to buy it.',table:{headers:['Japanese','English'],rows:[['買えました。','I was able to buy it.']]}}]}]}});
  assert.equal(create.status,200,JSON.stringify(create.data));
  const first=await person.request('/api/projects/contributions?'+new URLSearchParams({projectId}));
  assert.equal(first.status,200);assert.deepEqual(first.data.entries,[]);
  const payload={operationId:'b1-save-1',expectedGeneration:person.generation,expectedProjectRev:1,target,id:'learner-example',expectedRevision:0,action:'save',kind:'table',columns:['Japanese','English'],cells:['何も買えませんでした。','I could not buy anything.']};
  const save=await person.request('/api/projects/contributions',payload);
  assert.equal(save.status,200,JSON.stringify(save.data));assert.equal(save.data.entry.revision,1);
  const repeat=await person.request('/api/projects/contributions',payload);assert.equal(repeat.data.replayed,true);
  const denied=await other.request('/api/projects/contributions?'+new URLSearchParams({projectId}));assert.equal(denied.status,404);
  const mcp=async(name,args)=>person.request('/mcp',{jsonrpc:'2.0',id:name,method:'tools/call',params:{name,arguments:{purpose:'Owner requested a review of my exact example',...args}}});
  const read=await mcp('read_project_contributions',{projectId});assert.equal(read.status,200);
  const current=read.data.result.structuredContent;
  assert.equal(current.entries[0].cells[0],'何も買えませんでした。');assert.equal(current.entries[0].review,null);
  const review=await mcp('review_project_contribution',{operationId:'b1-review-1',expectedGeneration:person.generation,expectedProjectRev:1,target,id:'learner-example',expectedRevision:1,action:'review',review:{result:'accepted',explanation:'Appropriate past negative potential for this meaning.'}});
  assert.equal(review.status,200);assert.equal(review.data.result.structuredContent.entry.revision,2);
  const reviewed=await person.request('/api/projects/contributions?'+new URLSearchParams(target));assert.equal(reviewed.data.entries[0].review.revision,2);
  const edit=await person.request('/api/projects/contributions',{operationId:'b1-edit-1',expectedGeneration:person.generation,expectedProjectRev:1,target,id:'learner-example',expectedRevision:2,action:'save',kind:'table',columns:['Japanese','English'],cells:['何も買えなかった。','I could not buy anything.']});
  assert.equal(edit.status,200);assert.equal(edit.data.entry.review,null);
  const stale=await person.request('/api/projects/contributions',{operationId:'b1-conflict-1',expectedGeneration:person.generation,expectedProjectRev:1,target,id:'learner-example',expectedRevision:2,action:'save',kind:'table',columns:['Japanese','English'],cells:['Wrong stale save','']});
  assert.equal(stale.status,409);assert.equal(stale.data.code,'revision_conflict');
  const after=await mcp('read_project_contributions',{projectId});assert.equal(after.data.result.structuredContent.entries[0].revision,3);
  const history=await fixture.db.prepare('SELECT revision FROM v2_project_contribution_revisions WHERE owner=? AND project_id=? AND id=? ORDER BY revision').bind(person.owner,projectId,'learner-example').all();
  assert.deepEqual(history.results.map(r=>r.revision),[1,2,3]);
 }finally{await fixture.dispose();}
});

test('A5/B1: a Japanese reading example is independent of canonical text and attempt rows',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const person=fixture.client('a5-japanese-reader'),projectId='a5-b1-generic-project',target={projectId,sectionId:'grammar',partId:'explanation'};
  const create=await person.command({action:'create',family:'journey',id:projectId,data:{title:'Generic Japanese practice',body:'',sections:[{id:'grammar',title:'Grammar explanation',parts:[{id:'explanation',kind:'paragraph',language:'ja',text:'仕事が終わった後で、帰りました。'}]}]}});
  assert.equal(create.status,200,JSON.stringify(create.data));
  const payload={operationId:'generic-example-1',expectedGeneration:person.generation,expectedProjectRev:1,target,id:'learner-example-1',expectedRevision:0,action:'save',kind:'example',columns:['Japanese example','Translation / notes'],cells:['本を読んだ後で寝ました。','After reading, I went to bed.']};
  const save=await person.request('/api/projects/contributions',payload);assert.equal(save.status,200,JSON.stringify(save.data));
  const wrong=await person.request('/api/projects/contributions',{...payload,operationId:'wrong-kind-1',id:'wrong-kind-1',kind:'code'});assert.equal(wrong.status,400);
  const canonical=await person.request('/api/projects/composition?projectId='+projectId);assert.equal(canonical.data.record.sections[0].parts[0].text,'仕事が終わった後で、帰りました。');assert.equal(canonical.data.record.rev,1);
  const attempts=await fixture.db.prepare("SELECT count(*) as total FROM v2_activity WHERE owner=? AND family='attempt'").bind(person.owner).first();assert.equal(attempts.total,0);
  const saved=await person.request('/api/projects/contributions?'+new URLSearchParams(target));assert.equal(saved.data.entries.length,1);assert.equal(saved.data.entries[0].cells[0],'本を読んだ後で寝ました。');
 }finally{await fixture.dispose();}
});
