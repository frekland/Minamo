import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const content=id=>({id,title:id,parts:[{id:'text-'+id,kind:'paragraph',text:'Original learner evidence'}]});
const composition={version:1,sections:[
 {id:'first',title:'First',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['first-block']}]},
 {id:'second',title:'Second',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:['second-block']}]}
],blocks:[{id:'first-block',sectionId:'first-content'},{id:'second-block',sectionId:'second-content'}]};

test('Project presentation operations are revisioned, idempotent and source-preserving',async()=>{
 const f=await privateStorageFixture(worker);const c=f.client('composition-owner');
 try{
  const base={operationId:'create',expectedGeneration:c.generation,projectId:'project',expectedProjectRev:0,title:'Study',body:'Original narrative',contentSections:[content('first-content'),content('second-content')],composition};
  const created=await c.request('/api/projects/update',base);assert.equal(created.status,200,JSON.stringify(created.data));
  const origin=created.data.record,update={operationId:'present',expectedGeneration:c.generation,projectId:'project',expectedProjectRev:origin.rev,changes:[
   {op:'setSection',id:'second',title:'Useful later',collapsed:true,index:0},
   {op:'setBlockPresentation',id:'first-block',pinned:true,width:'compact'},
   {op:'setFavourite',id:'second',favourite:true},
   {op:'setFavourite',id:'first-block',favourite:true}
  ]};
  const saved=await c.request('/api/projects/update',update);assert.equal(saved.status,200,JSON.stringify(saved.data));
  const record=saved.data.record;assert.equal(record.rev,origin.rev+1);assert.equal(record.rendition,origin.rendition);
  assert.equal(record.sections[0].parts[0].text,'Original learner evidence');
  const current=(await c.request('/api/projects/composition?projectId=project')).data.composition;
  assert.equal(current.sections[0].id,'second');assert.equal(current.sections[0].collapsed,true);
  assert.equal(current.blocks[0].pinned,true);assert.equal(current.blocks[0].width,'compact');
  assert.deepEqual(current.favourites,['second','first-block']);
  assert.equal((await c.request('/api/projects/update',update)).data.replayed,true);
  const bad=await c.request('/api/projects/update',{...update,operationId:'invalid-favourite',expectedProjectRev:record.rev,changes:[{op:'setFavourite',id:'missing',favourite:true}]});
  assert.equal(bad.status,400);assert.equal((await c.context('journey','project')).data.record.rev,record.rev);
  const stale=await c.request('/api/projects/update',{...update,operationId:'stale',expectedProjectRev:origin.rev});assert.equal(stale.status,409);
 }finally{await f.dispose();}
});
