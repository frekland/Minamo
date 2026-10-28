import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
async function ok(promise){const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
async function seed(c){const id='TEST-ONLY-home-project',project=(await ok(c.command({action:'create',family:'journey',id,data:{title:'TEST ONLY home exact Project',body:'An authored purpose.',synthetic:false,sections:[{id:'one',title:'First reading',parts:[{id:'p1',kind:'paragraph',text:'First exact reading.'}]},{id:'two',title:'Second reading',parts:[{id:'p2',kind:'paragraph',text:'Second exact reading.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stable-first',sectionId:'one',title:'First step'},{id:'stable-second',sectionId:'two',title:'Second step'}]}}}))).record;
 const target={kind:'journey-stage',journeyId:id,stageId:'stable-first'};await ok(c.request('/api/learning-developments',{operationId:'TEST-ONLY-home-checkpoint',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:project.rev,development:{summary:'TEST ONLY checkpoint observation',nextAction:'Inspect the original exact boundary.'}}));return {project,target};}

test('Projects Home and GPT overview use the same newer Note destination without rewriting checkpoint intent',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-project-home'),{project,target}=await seed(c);const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-later-project-note',data:{title:'TEST ONLY later intention',body:'I want to inspect the second input boundary next.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition,sectionId:'two'}]}}))).record;
 await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.updatedAt','2099-10-27T10:00:00.000Z') WHERE owner=? AND family='note' AND id=?").bind(c.owner,note.id).run();
 const [home,outline,gpt]=await Promise.all([ok(c.request('/api/learning-context',{scope:'home'})),ok(c.request('/api/project-context?mode=outline&projectId='+project.id)),ok(c.request('/api/learning-context',{scope:'journey',journeyId:project.id}))]);
 assert.equal(home.continue[0].continuationBasis,'recent-note');assert.equal(home.continue[0].target.stageId,'stable-second');assert.equal(home.continue[0].destination,outline.continuation.destination);assert.equal(gpt.continuation.destination,outline.continuation.destination);assert.equal(home.continue[0].nextAction,undefined,'older checkpoint action is not presented as newer Note intention');assert.equal(home.projectRecency[0].basis,'recent-note');
 const targetRead=await ok(c.request('/api/learning-context',{scope:'target',target}));assert.equal(targetRead.resume.nextAction,'Inspect the original exact boundary.');assert.equal(targetRead.resume.source.id,'TEST-ONLY-home-checkpoint');assert.equal(Number((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n),1,'navigation does not save a checkpoint');
 const other=await ok(f.client('TEST-ONLY-project-home-other').request('/api/learning-context',{scope:'home'}));assert.equal(other.continue.length,0);assert.doesNotMatch(JSON.stringify(other),/later intention|home exact Project/);
 }finally{await f.dispose();}
});

test('a broad Project Note opens that exact Note; Home never invents a Step target',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-project-broad-note'),{project}=await seed(c);const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-broad-project-note',data:{title:'TEST ONLY broad intention',body:'Compare the whole approach before choosing a step.',synthetic:false,links:[{family:'journey',id:project.id}]}}))).record;
 await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.updatedAt','2099-10-27T11:00:00.000Z') WHERE owner=? AND family='note' AND id=?").bind(c.owner,note.id).run();const home=await ok(c.request('/api/learning-context',{scope:'home'})),url=new URL(home.continue[0].destination,'https://minamo.test');assert.equal(url.searchParams.get('family'),'note');assert.equal(url.searchParams.get('id'),note.id);assert.equal(url.searchParams.get('stage'),null);assert.equal(home.continue[0].target.kind,'note');assert.equal(home.continue[0].checkpoint.id,'TEST-ONLY-home-checkpoint');
 }finally{await f.dispose();}
});

test('more than forty newer GPT editorial Notes cannot hide a genuine Project continuation',async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('TEST-ONLY-editorial-note-flood'),{project}=await seed(c);
  const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-genuine-next-note',data:{title:'TEST ONLY genuine next intention',body:'I want to inspect the second exact boundary.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition,sectionId:'two'}]}}))).record;
  await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.updatedAt','2090-10-27T11:00:00.000Z') WHERE owner=? AND family='note' AND id=?").bind(c.owner,note.id).run();
  for(let i=0;i<13;i++)await ok(c.command({action:'create',family:'journey',id:'TEST-ONLY-editorial-project-'+i,data:{title:'TEST ONLY editorial Project '+i,body:'An authored overview with no learner work.',synthetic:false}}));
  for(let i=0;i<43;i++){
   const response=await ok(c.request('/mcp',{jsonrpc:'2.0',id:i+1,method:'tools/call',params:{name:'apply_minamo_command',arguments:{purpose:'TEST ONLY isolated GPT editorial Note flood regression',command:{operationId:'TEST-ONLY-editorial-note-op-'+i,expectedGeneration:'legacy@0',action:'create',family:'note',id:'TEST-ONLY-editorial-note-'+i,data:{title:'TEST ONLY GPT editorial Note '+i,body:'An editorial explanation, not the learner’s later intention.',synthetic:false,links:[{family:'journey',id:'TEST-ONLY-editorial-project-'+(i%13)}]}}}}}));
   assert.notEqual(response.result.isError,true,JSON.stringify(response));
  }
  await f.db.prepare("UPDATE v2_records SET data=json_set(data,'$.updatedAt','2099-10-27T11:00:00.000Z') WHERE owner=? AND family='note' AND json_extract(data,'$.actor')='gpt'").bind(c.owner).run();
  assert.equal(Number((await f.db.prepare("SELECT count(*) n FROM v2_records WHERE owner=? AND family='note' AND json_extract(data,'$.actor')='gpt'").bind(c.owner).first()).n),43);
  const home=await ok(c.request('/api/learning-context',{scope:'home'}));
  assert.equal(home.continue.length,1);assert.equal(home.continue[0].projectId,project.id);assert.equal(home.continue[0].continuationBasis,'recent-note');assert.equal(home.continue[0].target.stageId,'stable-second');assert.equal(home.continue[0].note.id,note.id);assert.equal(home.projectRecency.length,1);assert.equal(home.continueTruncated,false,'editorial Notes do not consume genuine saved-work discovery coverage');
  const overview=await ok(c.request('/api/learning-context',{scope:'journey',journeyId:project.id}));assert.equal(overview.continuation.destination,home.continue[0].destination);
 }finally{await f.dispose();}
});
