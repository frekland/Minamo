import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/record-navigation.ts'],bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'v2-record-nav-')),entry=join(dir,'navigation.cjs');writeFileSync(entry,built.outputFiles[0].text);const {planRecordNavigation}=require(entry);rmSync(dir,{recursive:true,force:true});
test('authenticated same-record overview, stage, passage and return navigation never await an effect whose dependencies did not change',()=>{
 const current={family:'journey',id:'saved-journey'},admitted={key:'journey:saved-journey',status:'ready'};let state=admitted;
 for(const destination of [{...current,stageId:'stage-3'},{...current,stageId:'stage-4'},{...current},{...current,sectionId:'s',partId:'p'}]){
  const plan=planRecordNavigation(current,destination,true);
  if(plan.needsRecordRead)state={key:plan.targetKey,status:'loading'};
  assert.equal(plan.recordChanged,false);assert.equal(plan.needsRecordRead,false);assert.strictEqual(state,admitted);
 }
});
test('authenticated navigation to another exact record enters loading with changed fetch dependencies',()=>{
 for(const next of [{family:'article',id:'reference'},{family:'article',id:'saved-journey'},{family:'journey',id:'other'}]){const plan=planRecordNavigation({family:'journey',id:'saved-journey'},next,true);assert.equal(plan.recordChanged,true);assert.equal(plan.needsRecordRead,true);assert.equal(plan.targetKey,`${next.family}:${next.id}`);}
});
test('collection and local preview navigation do not manufacture exact-record loading',()=>{
 assert.equal(planRecordNavigation({family:'journey',id:'saved-journey'},{},true).needsRecordRead,false);
 assert.equal(planRecordNavigation({family:'journey',id:'saved-journey'},{family:'article',id:'other'},false).needsRecordRead,false);
});
