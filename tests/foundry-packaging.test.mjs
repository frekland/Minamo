import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtempSync,mkdirSync,writeFileSync,existsSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {applyFoundryPackagePolicy} from '../scripts/foundry-package-policy.mjs';
test('default build excludes dormant science bytes even if stale local staging exists, preserving source and core assets',()=>{const root=mkdtempSync(join(tmpdir(),'foundry-package-'));try{for(const p of ['dist/client/runtime/foundry-python','public/runtime/foundry-python','dist/client/runtime/python'])mkdirSync(join(root,p),{recursive:true});for(const p of ['dist/client/runtime/foundry-python/manifest.json','public/runtime/foundry-python/manifest.json','dist/client/runtime/python/core.wasm','dist/client/foundry-python-isolate.js'])writeFileSync(join(root,p),'{}');assert.deepEqual(applyFoundryPackagePolicy(root,false),{scienceIncluded:false});assert.equal(existsSync(join(root,'dist/client/runtime/foundry-python')),false);assert.equal(existsSync(join(root,'dist/client/foundry-python-isolate.js')),false);assert.equal(existsSync(join(root,'public/runtime/foundry-python/manifest.json')),true);assert.equal(existsSync(join(root,'dist/client/runtime/python/core.wasm')),true);assert.throws(()=>applyFoundryPackagePolicy(root,true),/staged/);}finally{rmSync(root,{recursive:true,force:true});}});

test('optional controller is vendor-owned and explicit staging copies exact bytes; default preparation removes stale public inputs before framework copy',async()=>{
 const {readFileSync,cpSync}=await import('node:fs'),{stageScienceController}=await import('../scripts/foundry-python-assets.mjs'),{prepareFoundryPublicAssets}=await import('../scripts/foundry-package-policy.mjs');
 const source=readFileSync('vendor/foundry-python-isolate.js'),root=mkdtempSync(join(tmpdir(),'foundry-controller-stage-'));
 if(process.env.MINAMO_FOUNDRY_PACKAGE_SCIENCE!=='1')assert.equal(existsSync('public/foundry-python-isolate.js'),false,'Default build/source must not leave an optional executable in automatic public-copy inputs.');
 try{
  mkdirSync(join(root,'vendor'),{recursive:true});writeFileSync(join(root,'vendor/foundry-python-isolate.js'),source);
  assert.equal(existsSync(join(root,'public/foundry-python-isolate.js')),false,'An ordinary source tree has no optional executable in its automatic public-copy input.');
  assert.deepEqual(prepareFoundryPublicAssets(root,false),{scienceStaged:false});
  const receipt=await stageScienceController({root});
  assert.equal(receipt.bytes,source.length);assert.deepEqual(readFileSync(join(root,receipt.path)),source);
  mkdirSync(join(root,'public/runtime/foundry-python'),{recursive:true});writeFileSync(join(root,'public/runtime/foundry-python/manifest.json'),JSON.stringify({contract:'minamo.python-assets.v1'}));
  assert.deepEqual(prepareFoundryPublicAssets(root,true),{scienceStaged:true});
  writeFileSync(join(root,receipt.path),'stale or modified controller');assert.throws(()=>prepareFoundryPublicAssets(root,true),/exact vendor/);
  await stageScienceController({root});prepareFoundryPublicAssets(root,false);
  assert.equal(existsSync(join(root,'public/foundry-python-isolate.js')),false);
  assert.equal(existsSync(join(root,'public/runtime/foundry-python/manifest.json')),true,'Default preparation preserves expensive optional package staging.');
  // Model the framework's complete automatic public copy, not just post-build deletion.
  cpSync(join(root,'public'),join(root,'dist/client'),{recursive:true});applyFoundryPackagePolicy(root,false);
  assert.equal(existsSync(join(root,'dist/client/foundry-python-isolate.js')),false);
  assert.deepEqual(readFileSync(join(root,'vendor/foundry-python-isolate.js')),source,'Authored source survives default preparation.');
 }finally{rmSync(root,{recursive:true,force:true});}
});
