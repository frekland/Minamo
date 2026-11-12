import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// Hold two independently planned requests immediately before their real D1
// transaction. Each request owns its timer; no cross-request Promise is awaited.
const worker=`import {domainHandler} from './lib/domain-handler.ts';const gates=new Map();export default {async fetch(request,env){const key=request.headers.get('x-independent-race');if(!key)return domainHandler(request,env);let gate=gates.get(key);if(!gate){gate={arrived:0};gates.set(key,gate);}const db=new Proxy(env.DB,{get(target,key){if(key==='batch')return async statements=>{gate.arrived++;const started=Date.now();while(gate.arrived<2){if(Date.now()-started>3000)throw Error('Independent barrier timed out');await new Promise(resolve=>setTimeout(resolve,1));}return target.batch(statements)};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});return domainHandler(request,{...env,DB:db});}}`;
const target={kind:'investigation',investigationId:'TEST-ONLY-independent-pr30'};
const base={intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1};
async function ok(p){const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
async function seed(c){await ok(c.command({action:'create',family:'investigation',id:target.investigationId,data:{title:'TEST ONLY independent PR30 challenge',body:'Synthetic local evidence only.',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Which boundary changed?'}}}));}
const create=(c,id,supersedesId)=>ok(c.request('/api/learning-developments',{...base,operationId:id,development:{summary:'TEST ONLY '+id,...(supersedesId?{supersedesId}:{})}}));

test('PR30 independent: a changed distant ancestor participates in transaction guards',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-independent-distant');await seed(c);await create(c,'C');await create(c,'B','C');await create(c,'A');
 const revision=(id,to)=>({...base,id,expectedRev:1,operationId:'race-'+id,development:{summary:'TEST ONLY distant ancestry revision',supersedesId:to}});
 const results=await Promise.all([
  c.request('/api/learning-developments/revise',revision('A','B'),{headers:{'x-independent-race':'distant'}}),
  c.request('/api/learning-developments/revise',revision('C','A'),{headers:{'x-independent-race':'distant'}}),
 ]);
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 const rows=(await f.db.prepare('SELECT id,revision,event_json FROM v2_learning_developments WHERE owner=?').bind(c.owner).all()).results;
 assert.equal(rows.filter(r=>r.revision===2).length,1,'only one planned revision commits');
 const edges=new Map(rows.map(r=>{const e=JSON.parse(r.event_json);return [r.id,e.supersedesId]}));
 for(const id of edges.keys()){let n=id;const seen=new Set();while(n){assert.equal(seen.has(n),false,'no active cycle survived the barrier');seen.add(n);n=edges.get(n);}}
 const context=await ok(c.request('/api/learning-context',{scope:'target',target,profile:'tutor'}));assert.ok(context.resume,'an active account remains visible');
 }finally{await f.dispose();}
});

test('PR30 independent: withdrawn ancestry stays inactive, restoration is checked, and committed recovery stays immutable',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-independent-withdrawn');await seed(c);await create(c,'A');const original={...base,operationId:'B',development:{summary:'TEST ONLY B',supersedesId:'A'}};const receipt=await ok(c.request('/api/learning-developments',original));
 await ok(c.request('/api/learning-developments/revise',{...base,operationId:'withdraw-B',id:'B',expectedRev:1,withdraw:true}));await create(c,'C','B');
 await ok(c.request('/api/learning-developments/revise',{...base,operationId:'A-to-C',id:'A',expectedRev:1,development:{summary:'TEST ONLY points to a withdrawn terminator',supersedesId:'C'}}));
 const restore=await c.request('/api/learning-developments/revise',{...base,operationId:'restore-B-cycle',id:'B',expectedRev:2,withdraw:false,development:{summary:'TEST ONLY invalid restoration',supersedesId:'A'}});assert.equal(restore.status,409);assert.equal(restore.data.code,'correction_cycle');
 const replay=await ok(c.request('/api/learning-developments',original));assert.equal(replay.replayed,true);assert.deepEqual(replay.developmentRef,receipt.developmentRef);
 const mismatch=await c.request('/api/learning-developments',{...original,development:{...original.development,summary:'TEST ONLY changed immutable payload'}});assert.equal(mismatch.status,409);assert.equal(mismatch.data.code,'idempotency_mismatch');
 assert.equal((await f.db.prepare("SELECT revision FROM v2_learning_developments WHERE owner=? AND id='B'").bind(c.owner).first()).revision,2);
 }finally{await f.dispose();}
});
