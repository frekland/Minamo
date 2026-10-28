import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const api=await import('data:text/javascript;base64,'+Buffer.from((await build({entryPoints:['lib/asset-client.ts'],bundle:true,platform:'node',format:'esm',write:false})).outputFiles[0].text).toString('base64'));
const original=new Blob([Uint8Array.from([137,80,78,71])],{type:'image/png'}),metadata={assetId:'image-immutable',mime:'image/png',bytes:4,width:4,height:2,digest:'a'.repeat(64),revision:1,state:'staged',inspection:{visualContentInspected:false}};
test('image limits reject unsupported, empty, oversized and excessive decoded dimensions before upload',()=>{
 for(const value of [{type:'image/svg+xml',size:4},{type:'text/html',size:4},{type:'image/png',size:0},{type:'image/png',size:8*1024*1024+1}])assert.throws(()=>api.validateImageEnvelope(value));
 for(const dims of [[8193,1],[8192,8192],[0,2],[1.2,4]])assert.throws(()=>api.validateImageDimensions(...dims));api.validateImageDimensions(8192,4096);
});
test('staged acknowledgement preserves immutable identity only for matching original metadata',()=>{
 assert.equal(api.parseStagedImage(metadata,original).assetId,metadata.assetId);
 for(const patch of [{bytes:3},{mime:'image/jpeg'},{digest:'not-digest'},{state:'revoked'},{assetId:'//evil.test'},{width:8193}])assert.throws(()=>api.parseStagedImage({...metadata,...patch},original));
 assert.equal('inspection' in api.parseStagedImage(metadata,original),false);
});
test('uncertain stage retry sends exact raw bytes and retained operation identity, without filename or prose',async()=>{
 const prior=globalThis.fetch,calls=[];globalThis.fetch=async(url,options)=>{calls.push({url,options});if(calls.length===1)throw Error('Lost acknowledgement');return Response.json({asset:metadata});};
 try{await assert.rejects(api.stageImage(original,'stable-upload-id'));const result=await api.stageImage(original,'stable-upload-id');assert.equal(result.assetId,metadata.assetId);assert.equal(calls.length,2);assert.equal(calls[0].url,calls[1].url);assert.equal(calls[1].url,'/api/assets/stage?uploadId=stable-upload-id');assert.equal(calls[0].options.body,original);assert.equal(calls[1].options.body,original);assert.equal(calls[1].options.credentials,'same-origin');assert.equal(calls[1].options.redirect,'error');assert.equal(new Headers(calls[1].options.headers).get('Content-Type'),'image/png');assert.equal(new Headers(calls[1].options.headers).get('x-minamo-generation'),'legacy@0');assert.equal(calls[1].options.method,'POST');}finally{globalThis.fetch=prior;}
});
test('denied or malformed server acknowledgements cannot become successful image proposals',async()=>{
 const prior=globalThis.fetch;try{globalThis.fetch=async()=>Response.json({error:'Owner access denied'},{status:403});await assert.rejects(api.stageImage(original,'stable-upload-id'),/Owner access denied/);globalThis.fetch=async()=>Response.json({asset:{...metadata,bytes:800}});await assert.rejects(api.stageImage(original,'stable-upload-id'),/did not match/);}finally{globalThis.fetch=prior;}
});
test('image proposal enforces shared description and caption bounds independently of native inputs',()=>{
 assert.deepEqual(api.imageAttachmentProposal('asset-original',' Meaningful description ',' Caption '),{assetId:'asset-original',alt:'Meaningful description',caption:'Caption'});
 for(const args of [['asset-original','',''],['asset-original','a'.repeat(2001),''],['asset-original','description','c'.repeat(1001)],['//invalid','description','']])assert.throws(()=>api.imageAttachmentProposal(...args));
 assert.equal(api.imageAttachmentProposal('asset-original','description','c'.repeat(1000)).caption.length,1000);
});
