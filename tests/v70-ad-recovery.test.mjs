import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({entryPoints:['lib/recovery-operation.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {recoveryOperation,recoveryOperationKey,retainRecoveryOperation,readRecoveryOperation}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const store=()=>{const values=new Map();return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};};
test('durable recovery metadata is whitelist-only, root-owner bound and readable after a generation transition',()=>{
 const storage=store(),scope='TEST-ONLY-owner',request={action:'activate',operationId:'original-operation',expectedGeneration:'legacy@0',stagedId:'stage-one',passphrase:'SECRET MUST NOT SURVIVE',file:{bytes:[1,2]},token:'DO NOT KEEP',extra:'no'};
 retainRecoveryOperation(storage,scope,request);
 const raw=storage.getItem(recoveryOperationKey(scope));assert.deepEqual(Object.keys(JSON.parse(raw)),['action','operationId','expectedGeneration','stagedId']);assert.doesNotMatch(raw,/SECRET|bytes|token|extra/);
 assert.deepEqual(readRecoveryOperation(storage,scope+':generation:restored@1'),recoveryOperation(request));assert.equal(readRecoveryOperation(storage,'TEST-ONLY-other'),null);
 for(const value of [{...request,operationId:'../bad'},{...request,expectedGeneration:'invalid'},{...request,stagedId:''},{...request,action:'import'}])assert.equal(recoveryOperation(value),null);
 assert.throws(()=>retainRecoveryOperation({setItem(){throw Error('quota');}},scope,request),/quota/);
});
test('actual D1 activation commits but loses acknowledgement; browser reload resumes the original receipt without a second activation',{timeout:60000},async()=>{
 const worker=`import {domainHandler} from './lib/domain-handler.ts';import {recoveryHandler} from './lib/recovery-handler.ts';let activations=0;export default{async fetch(request,env){const url=new URL(request.url);if(url.pathname==='/test/activation-count')return Response.json({activations});if(url.pathname==='/api/recovery'){if(request.method==='POST'&&(await request.clone().json()).action==='activate'){activations++;const result=await recoveryHandler(request,env);if(result.ok)return Response.json({error:'SYNTHETIC acknowledgement lost after commit'},{status:503});return result;}return recoveryHandler(request,env);}return domainHandler(request,env);}}`;
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('TEST-ONLY-lost-ack-owner'),other=fixture.client('TEST-ONLY-lost-ack-foreign'),ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
  ok(await client.command({action:'create',family:'note',id:'original',data:{title:'TEST ONLY original',body:'Original exact writing 😄',synthetic:true}}));
  const archive=ok(await client.recover('checkpoint',{operationId:'backup'})).archive;
  ok(await client.command({action:'create',family:'note',id:'intervening',data:{title:'TEST ONLY intervening',body:'Must remain in pre-activation backup',synthetic:true}}));
  const stage=ok(await client.recover('stage',{operationId:'prepare',archiveId:archive.id})).staged;
  const storage=store(),request={action:'activate',operationId:'activate-once',expectedGeneration:'legacy@0',stagedId:stage.id};retainRecoveryOperation(storage,'TEST-ONLY-browser',request);
  assert.equal((await client.request('/api/recovery',request)).status,503);
  const reloaded=store();for(const [key,value] of storage.values)reloaded.setItem(key,value);
  const resumed=readRecoveryOperation(reloaded,'TEST-ONLY-browser');assert.equal(resumed.operationId,'activate-once');
  const receipt=ok(await client.request('/api/recovery?operationId='+resumed.operationId));assert.equal(receipt.status,'committed');assert.equal(receipt.result.activated,stage.id);assert.ok(receipt.result.backupArchiveId);assert.notEqual(receipt.result.generation,'legacy@0');
  assert.equal(ok(await client.request('/test/activation-count')).activations,1);
  assert.equal(ok(await other.request('/api/recovery?operationId='+resumed.operationId)).status,'unknown');
  client.setGeneration(receipt.result.generation);assert.equal(ok(await client.context('note','original')).record.body,'Original exact writing 😄');assert.equal((await client.context('note','intervening')).status,404);
  const backup=ok(await client.recover('verify',{archiveId:receipt.result.backupArchiveId}));assert.equal(backup.valid,true);
 }finally{await fixture.dispose();}
});
