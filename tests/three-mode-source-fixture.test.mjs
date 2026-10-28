import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const bundled=await build({entryPoints:['tests/acceptance/source-fixture.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {seedSourceFixture,qaSourceId,qaExcerptId}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
test('isolated QA Source fixture uses actual admission and current rights; reload never restores revoked text',async()=>{
 const f=await privateStorageFixture("import{domainHandler}from'./lib/domain-handler.ts';export default{fetch:domainHandler}");
 try{
  const client=f.client('TEST-ONLY-multi-layout-source-fixture');
  const send=async(path,data)=>{const result=await client.request(path,data);return Response.json(result.data,{status:result.status})};
  await seedSourceFixture(send);
  const source=(await client.context('source',qaSourceId)).data.record,article=(await client.context('article',qaExcerptId)).data.record;
  assert.equal(source.source.excerpt.ownerAttested,true);assert.equal(article.sections[0].parts[0].text,source.source.excerpt.text);
  assert.equal(article.sections[0].parts[0].excerpt.rendition,source.rendition);assert.match(article.sections[0].parts[0].text,/A🧠 café/);
  const revoke=await client.command({operationId:'TEST-ONLY-source-fixture-revoke',action:'update',family:'source',id:qaSourceId,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}});
  assert.equal(revoke.status,200);
  await seedSourceFixture(send);
  for(const rendition of [undefined,article.rendition]){
   const display=(await client.context('article',qaExcerptId,rendition)).data.record;
   assert.equal(display.sections[0].parts[0].unavailable,true);assert.equal(display.sections[0].parts[0].text,'');
   assert.match(display.sections[0].parts[1].text,/Independent synthetic interpretation/);
  }
  const current=(await client.context('source',qaSourceId)).data.record;
  assert.equal(current.rev,2);assert.equal(current.source.excerpt.state,'revoked');assert.equal(current.source.excerpt.text,'');
 }finally{await f.dispose()}
});
