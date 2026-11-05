import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const scope={version:1,spaces:['computing'],provenance:'authored'};

test('ordinary independent-question discovery excludes owner-only synthetic fixture records',async()=>{
 const f=await privateStorageFixture(worker),c=f.client('scope-owner');
 try{
  const common={body:'A test question',learningScope:scope,learningShape:{version:2,kind:'investigation',question:'Why?'}};
  const real=await c.command({action:'create',family:'investigation',id:'real',data:{...common,title:'Real learner question',synthetic:false}});
  const synthetic=await c.command({action:'create',family:'investigation',id:'fixture',data:{...common,title:'PRIVATE SYNTHETIC QUESTION',synthetic:true}});
  assert.equal(real.status,200);assert.equal(synthetic.status,200);
  const view=await c.request('/api/project-context?'+new URLSearchParams({mode:'independent',learningSpace:'computing'}));
  assert.equal(view.status,200,JSON.stringify(view.data));
  assert.deepEqual(view.data.questions.map(q=>q.id),['real']);
  assert.doesNotMatch(JSON.stringify(view.data),/PRIVATE SYNTHETIC QUESTION/);
  const other=await f.client('different-owner').request('/api/project-context?'+new URLSearchParams({mode:'independent',learningSpace:'computing'}));
  assert.equal(other.status,200);assert.deepEqual(other.data.questions,[]);
 }finally{await f.dispose();}
});
