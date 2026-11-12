import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/workspace-command-client.ts'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const ui=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const command=(id,extra={})=>({operationId:'op-'+id,action:'trash',family:'annotation',id,expectedRev:1,...extra});
const record=(id,rev=1,extra={})=>({id,family:'annotation',title:'TEST ONLY '+id,body:'Independent original writing',rev,createdAt:'2026-10-26T12:00:00Z',updatedAt:'2026-10-26T12:00:00Z',actor:'user',links:[],trashedAt:null,...extra});
test('independent saves finish out of order without a global lock; identical pending retries share one send',async()=>{
 const send=ui.createWorkspaceCommandFlights(),a=deferred(),b=deferred();let calls=0;
 const first=send('owner:legacy',command('a'),()=>{calls++;return a.promise}),retry=send('owner:legacy',command('a'),()=>{calls++;throw Error('duplicate request')});assert.equal(first,retry);
 const second=send('owner:legacy',command('b'),()=>{calls++;return b.promise});await Promise.resolve();assert.equal(calls,2);let firstDone=false;first.then(()=>firstDone=true);
 const receipt={operationId:'op-b',status:'committed',replayed:false,recordRef:{family:'annotation',id:'b',rev:2}};b.resolve(receipt);assert.equal(await second,receipt);assert.equal(firstDone,false,'other record remains independent of delayed ACK');a.resolve({...receipt,operationId:'op-a',recordRef:{family:'annotation',id:'a',rev:2}});await first;
});
test('scope/generation and immutable payload are part of in-flight identity; a failed send remains retryable',async()=>{
 const send=ui.createWorkspaceCommandFlights(),gate=deferred();const first=send('owner-a',command('a'),()=>gate.promise);
 await assert.rejects(send('owner-a',command('a',{expectedRev:2}),()=>Promise.resolve()),error=>error.code==='idempotency_mismatch');
 const other=send('owner-b',command('a'),()=>Promise.resolve({operationId:'op-a',status:'committed',replayed:false}));assert.equal((await other).status,'committed');gate.reject(Error('unknown transport'));await assert.rejects(first,/unknown/);
 const replay=await send('owner-a',command('a'),()=>Promise.resolve({operationId:'op-a',status:'committed',replayed:true}));assert.equal(replay.replayed,true);
});
test('receipt reconciliation preserves newer data and bookmark target clocks, and never fabricates a restore projection',()=>{
 const latest=record('a',4),other=record('b'),off={operationId:'op-a',status:'committed',replayed:true,recordRef:{family:'annotation',id:'a',rev:2}};
 assert.deepEqual(ui.reconcileWorkspaceReceipt([latest,other],command('a'),off),[latest,other]);
 const removed=ui.reconcileWorkspaceReceipt([record('a'),other],command('a'),off);assert.deepEqual(removed,[other]);
 assert.deepEqual(ui.reconcileWorkspaceReceipt([],command('a',{action:'restore'}),off),[]);
 const flag=record('flag',2,{family:'flag',bookmark:{active:true,targetRev:5,targetKey:'same',available:true}}),late={operationId:'op-flag',status:'committed',replayed:true,recordRef:{family:'flag',id:'flag',rev:2},bookmark:{active:false,targetRev:3,targetKey:'same',available:true}};
 assert.equal(ui.reconcileWorkspaceReceipt([flag],command('flag',{family:'flag'}),late)[0],flag);
 assert.deepEqual(ui.reconcileWorkspaceReceipt([latest],command('a'),{...off,operationId:'foreign'}),[latest]);
});
test('routine acknowledged actions have short content-free labels and personal writes skip workspace refresh',()=>{
 for(const family of ['note','annotation','flag','run'])for(const action of ['create','update','trash','restore'])assert.equal(ui.isQuickWorkspaceCommand(command('a',{family,action})),true);
 assert.equal(ui.isQuickWorkspaceCommand(command('a',{family:'source',action:'update'})),false);
 assert.equal(ui.workspaceActionMessage(command('a',{action:'update',data:{body:'DO NOT PUT PRIVATE WRITING IN A TOAST'}})),'Annotation saved');
 assert.equal(ui.workspaceActionMessage(command('a',{family:'note',action:'update'})),null);
});
test('real D1 unflag and annotation change complete independently while another acknowledgement is withheld',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler}");try{
 const c=f.client('TEST-ONLY-background-actions'),ok=async promise=>{const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
 const source=(await ok(c.command({action:'create',family:'article',id:'source',data:{title:'TEST ONLY source',body:'Original plain source.',synthetic:true}}))).record;
 const anchor={recordFamily:'article',articleId:source.id,rendition:source.rendition,sectionId:'__article',partId:'__body',start:0,end:8,quote:'Original'};
 const annotation=(await ok(c.command({action:'create',family:'annotation',id:'annotation-a',data:{title:'TEST ONLY own writing',body:'Retained independent thought.',anchor,synthetic:true}}))).record;
 const flagged=await ok(c.command({action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0}));
 const off={operationId:'background-unflag',action:'setFlag',target:{kind:'passage',anchor},active:false,expectedTargetRev:flagged.bookmark.targetRev};
 const edit={operationId:'background-edit',action:'update',family:'annotation',id:annotation.id,expectedRev:annotation.rev,data:{body:'Revised independent thought.'}};
 const send=ui.createWorkspaceCommandFlights(),ack=deferred(),saved=deferred();let unflagSends=0;
 const slow=send(c.owner,off,async()=>{unflagSends++;const receipt=await ok(c.command(off));saved.resolve();await ack.promise;return receipt});await saved.promise;
 const fast=await send(c.owner,edit,()=>ok(c.command(edit)));assert.equal(fast.record.body,edit.data.body);assert.equal(fast.record.rev,2);
 const retry=send(c.owner,off,()=>{throw Error('must share original send')});assert.equal(retry,slow);assert.equal(unflagSends,1);ack.resolve();const done=await slow;assert.equal(done.bookmark.active,false);
 const state=await ok(c.request('/api/bookmarks',{target:off.target}));assert.equal(state.active,false);assert.equal((await ok(c.context('annotation',annotation.id))).record.body,edit.data.body);
 const replay=await ok(c.command(off));assert.equal(replay.replayed,true);assert.equal(replay.bookmark.targetRev,done.bookmark.targetRev);assert.equal((await ok(c.context('article',source.id))).record.rendition,source.rendition);
 }finally{await f.dispose()}
});
