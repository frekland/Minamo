import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`export * from './lib/reading-action-flight.ts';export * from './lib/reading-action-ack.ts';export {bookmarkRecoveryPayload} from './app/bookmark-toggle.tsx';export {annotationDraftFromStorage} from './app/annotation-preview.tsx';`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false,loader:{'.css':'empty'}});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};

test('an unresolved mark does not block a second mark, and remount-style same-operation retries share the exact flight',async()=>{
 const first=deferred(),keyA=JSON.stringify(['owner:legacy@0','annotation','A']),keyB=JSON.stringify(['owner:legacy@0','annotation','B']);let sentA=0,sentB=0;
 const a=api.runReadingAction(keyA,'operation-A',()=>{sentA++;return first.promise});
 assert.equal(api.readingActionBusy(keyA),true);
 const remounted=api.runReadingAction(keyA,'operation-A',()=>{throw Error('must not resend')});assert.equal(remounted,a);
 await assert.rejects(api.runReadingAction(keyA,'different-operation',async()=>({status:'wrong'})),/awaiting acknowledgement/);
 const b=api.runReadingAction(keyB,'operation-B',async()=>{sentB++;return {operationId:'operation-B',status:'committed'}});
 assert.equal((await b).status,'committed');assert.equal(sentB,1);assert.equal(sentA,1);assert.equal(api.readingActionBusy(keyA),true);assert.equal(api.readingActionBusy(keyB),false);
 first.resolve({operationId:'operation-A',status:'committed'});assert.deepEqual(await a,await remounted);assert.equal(api.readingActionBusy(keyA),false);
});

test('owner/generation locks do not alias, and a failed flight permits only a later explicit retry rather than automatic draining',async()=>{
 const failure=deferred(),keyA=JSON.stringify(['owner:generation-1','bookmark','same-target']),keyB=JSON.stringify(['owner:generation-2','bookmark','same-target']);let calls=0;
 const first=api.runReadingAction(keyA,'original',()=>{calls++;return failure.promise});const caught=assert.rejects(first,/network uncertain/);
 assert.equal(await api.runReadingAction(keyB,'other-generation',async()=>42),42);
 failure.reject(Error('network uncertain'));await caught;assert.equal(calls,1);assert.equal(api.readingActionBusy(keyA),false);
 await Promise.resolve();assert.equal(calls,1,'settlement never invents a replacement write');
 assert.equal(await api.runReadingAction(keyA,'original',async()=>{calls++;return 'explicit same operation'}),'explicit same operation');assert.equal(calls,2);
});

test('bookmark acknowledgement supplies immediate exact state without a read and cannot roll a later target revision backwards',()=>{
 const known={targetKey:'target',targetRev:3,active:true,available:true},command={operationId:'unflag',action:'setFlag',active:false,expectedTargetRev:3},next={...known,targetRev:4,active:false};
 const receipt={operationId:command.operationId,status:'committed',bookmark:next};assert.equal(api.bookmarkAcknowledgement(known,command,receipt),next);
 const current={...known,targetRev:6,active:true};assert.equal(api.bookmarkAcknowledgement(current,command,{...receipt,replayed:true}),current);
 assert.throws(()=>api.bookmarkAcknowledgement(known,command,{...receipt,operationId:'foreign'}),/exact bookmark/);
 assert.throws(()=>api.bookmarkAcknowledgement(known,command,{...receipt,bookmark:{...next,targetKey:'foreign'}}),/exact bookmark/);
 assert.throws(()=>api.bookmarkAcknowledgement(known,command,{...receipt,bookmark:{...next,active:true}}),/exact bookmark/);
});

test('unknown statuses and unrelated conflict receipts cannot release the retained original change',()=>{
 for(const error of [Error('transport'),{status:404},{status:409},{status:503},{status:409,receipt:{operationId:'other',status:'conflict'}}])assert.equal(api.definitiveReadingRejection(error,'original'),false);
 assert.equal(api.definitiveReadingRejection({status:409,receipt:{operationId:'original',status:'conflict'}},'original'),true);
 for(const status of [400,422])assert.equal(api.definitiveReadingRejection({status},'original'),true);
});

test('late acknowledgements clear only their own retained command, never a newer draft or another operation',()=>{
 const values=new Map(),previous=globalThis.localStorage;globalThis.localStorage={getItem:key=>values.get(key)??null,removeItem:key=>values.delete(key),setItem:(key,value)=>values.set(key,value)};
 try{values.set('annotation',JSON.stringify({body:'Newer independent writing',pending:{operationId:'newer'}}));api.removeRetainedReadingAction('annotation','older');assert.ok(values.has('annotation'));assert.equal(api.retainReadingActionFailure('annotation','older',{body:'Must not overwrite newer writing'}),false);assert.match(values.get('annotation'),/Newer independent writing/);api.removeRetainedReadingAction('annotation','newer');assert.equal(values.has('annotation'),false);
 values.set('source',JSON.stringify({operationId:'source-original',statusOnly:true}));assert.equal(api.retainReadingActionFailure('source','source-original',{operationId:'source-original',statusOnly:true,message:'Not confirmed'}),true);api.removeRetainedReadingAction('source','different');assert.ok(values.has('source'));api.removeRetainedReadingAction('source','source-original');assert.equal(values.has('source'),false);
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});

test('closed annotation recovery keeps its exact draft, old CAS and unknown write, while Source bookmark storage remains content-free',()=>{
 const record={family:'annotation',id:'A',body:'Current writing',rev:9},pending={operationId:'original',action:'update',family:'annotation',id:'A',expectedRev:3,data:{body:'Retained writing'}};
 const recovered=api.annotationDraftFromStorage(record,JSON.stringify({body:'Retained writing',baseRev:3,pending,message:'Not confirmed. Retry keeps the same change.'}));assert.equal(recovered.body,'Retained writing');assert.equal(recovered.baseRev,3);assert.equal(recovered.pending.operationId,'original');assert.match(recovered.message,/Not confirmed/);
 const source={operationId:'source-original',action:'setFlag',target:{kind:'passage',anchor:{recordFamily:'source',partId:'__excerpt',quote:'PRIVATE IMPORTED WORDS'}},active:false};assert.deepEqual(api.bookmarkRecoveryPayload(source),{operationId:'source-original',statusOnly:true});assert.doesNotMatch(JSON.stringify(api.bookmarkRecoveryPayload(source)),/PRIVATE|quote|target/);
});
