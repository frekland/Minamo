import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {decodeBundleFixture,encodeBundleFixture} from './portable-bundle-fixture.mjs';

const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const target={kind:'investigation',investigationId:'TEST-ONLY-pr30-question'};
const base={intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1};
const input=(operationId,development,extra={})=>({...base,operationId,development,...extra});
async function ok(p){const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.status??'committed','committed',JSON.stringify(r.data));return r.data;}
async function seed(c,id=target.investigationId){return ok(c.command({action:'create',family:'investigation',id,data:{title:'TEST ONLY correction graph',body:'One synthetic question.',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Which exact evidence supports this correction?'}}}));}
const save=(c,id,data={summary:id},extra={})=>ok(c.request('/api/learning-developments',input(id,data,extra)));
const revise=(c,id,expectedRev,data,op,extra={})=>c.request('/api/learning-developments/revise',input(op,data,{id,expectedRev,...extra}));
async function context(c){const r=await c.request('/api/learning-context',{scope:'target',target,profile:'tutor'});assert.equal(r.status,200);return r.data;}
async function mcp(c,name,args){const r=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY shared MCP correction contract',...args}}});assert.equal(r.status,200);return {isError:r.data.result.isError,value:JSON.parse(r.data.result.content[0].text)};}

test('PR30 web and MCP reject self/cyclic corrections without altering active learning or histories',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr30-graph');await seed(c);await save(c,'A',{summary:'Initial hypothesis',nextAction:'An older action must not be borrowed.'});await save(c,'B',{summary:'Correction supported by a comparison',kind:'correction',supersedesId:'A',nextAction:'Inspect the original bytes.'});
 const before=await context(c),counts=async()=>Promise.all(['v2_learning_developments','v2_learning_development_revisions','v2_learning_perspectives','v2_operations'].map(t=>f.db.prepare('SELECT count(*) n FROM '+t+' WHERE owner=?').bind(c.owner).first().then(r=>r.n))),priorCounts=await counts();
 const cycle=await revise(c,'A',1,{summary:'Accidentally supersedes its correction',supersedesId:'B'},'cycle');assert.equal(cycle.status,409);assert.equal(cycle.data.code,'correction_cycle');
 const self=await mcp(c,'revise_minamo_learning_development',input('self',{summary:'Accidental self correction',supersedesId:'B'},{id:'B',expectedRev:1}));assert.equal(self.isError,true);assert.equal(self.value.code,'correction_cycle');
 const newSelf=await c.request('/api/learning-developments',input('new-self',{summary:'Accidental create self reference',supersedesId:'new-self'}));assert.equal(newSelf.status,409);assert.equal(newSelf.data.code,'correction_cycle');
 assert.deepEqual(await counts(),priorCounts,'rejected graph writes make no event, history, perspective or receipt');const after=await context(c);assert.deepEqual(after.resume,before.resume);assert.deepEqual(after.changedCheckpoints,before.changedCheckpoints);
 const ordinary=await mcp(c,'revise_minamo_learning_development',input('ordinary',{summary:'Correct the wording without prescribing an action',kind:'correction'},{id:'A',expectedRev:1}));assert.equal(ordinary.isError,false);assert.equal(ordinary.value.development.createdAt,(await f.db.prepare("SELECT json_extract(data,'$.createdAt') createdAt FROM v2_learning_development_revisions WHERE owner=? AND development_id='A' AND revision=1").bind(c.owner).first()).createdAt);assert.equal(ordinary.value.development.nextAction,undefined);
 }finally{await f.dispose();}
});

test('PR30 committed replay precedes new graph/target checks and preserves immutable payload mismatch',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr30-replay');await seed(c);await save(c,'A');const original=input('B',{summary:'B corrects A',kind:'correction',supersedesId:'A'});await ok(c.request('/api/learning-developments',original));
 await ok(c.request('/api/learning-developments/revise',{...base,operationId:'withdraw-B',id:'B',expectedRev:1,withdraw:true}));await ok(revise(c,'A',1,{summary:'Correct A while B is withdrawn',supersedesId:'B'},'A-after-withdrawal'));
 const restore=await revise(c,'B',2,{summary:'This would restore the cycle',supersedesId:'A'},'restore-cycle');assert.equal(restore.status,409);assert.equal(restore.data.code,'correction_cycle');
 const replay=await ok(c.request('/api/learning-developments',original));assert.equal(replay.replayed,true);assert.equal(replay.developmentRef.revision,1);assert.equal((await f.db.prepare("SELECT revision FROM v2_learning_developments WHERE owner=? AND id='B'").bind(c.owner).first()).revision,2);
 const mismatch=await c.request('/api/learning-developments',{...original,development:{summary:'A changed immutable payload'}});assert.equal(mismatch.status,409);assert.equal(mismatch.data.code,'idempotency_mismatch');
 await ok(c.command({action:'trash',family:'investigation',id:target.investigationId,expectedRev:1}));assert.equal((await ok(c.request('/api/learning-developments',original))).replayed,true,'receipt recovery remains available after target eligibility changes');
 }finally{await f.dispose();}
});

test('PR30 chain validation is bounded, exact-owner/target scoped, and batch identities cannot self-reference',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr30-bounds');await seed(c);await seed(c,'other');const otherTarget={kind:'investigation',investigationId:'other'};await ok(c.request('/api/learning-developments',input('other-event',{summary:'Other question'},{target:otherTarget})));const foreign=f.client('TEST-ONLY-pr30-foreign');await seed(foreign);await save(foreign,'foreign-event');
 for(const [op,ref] of [['wrong-target','other-event'],['wrong-owner','foreign-event'],['missing','not-saved']]){const r=await c.request('/api/learning-developments',input(op,{summary:'Invalid relation',supersedesId:ref}));assert.equal(r.status,409);assert.equal(r.data.code,'correction_target');}
 for(let i=0;i<=40;i++)await save(c,'chain-'+i,{summary:'Bounded correction '+i,...(i?{supersedesId:'chain-'+(i-1)}:{})});const beyond=await c.request('/api/learning-developments',input('chain-41',{summary:'Past bounded validation',supersedesId:'chain-40'}));assert.equal(beyond.status,409);assert.equal(beyond.data.code,'correction_chain_limit');assert.equal((await context(c)).resume.source.id,'chain-40');
 const operationId='batch-self',hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify({index:0,operationId}))),eventId='ld-'+Buffer.from(hash).toString('hex').slice(0,56);
 // Batch IDs derive from the same sorted immutable identity object as the domain.
 const batch=await c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',multiTargetRequested:true,operationId,developments:[{target,expectedTargetRev:1,development:{summary:'Batch self edge',supersedesId:eventId}}]});assert.equal(batch.status,409);assert.equal(batch.data.code,'correction_cycle');
 const valid=await ok(c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',multiTargetRequested:true,operationId:'batch-valid',developments:[{target,expectedTargetRev:1,development:{summary:'First target'}},{target:otherTarget,expectedTargetRev:1,development:{summary:'Second target',supersedesId:'other-event'}}]}));assert.equal(valid.developmentRefs.length,2);
 }finally{await f.dispose();}
});

const racingWorker=`import {domainHandler} from './lib/domain-handler.ts';const gates=new Map();export default {async fetch(request,env){const key=request.headers.get('x-pr30-race');if(!key)return domainHandler(request,env);let gate=gates.get(key);if(!gate){gate={arrived:0};gates.set(key,gate);}const db=new Proxy(env.DB,{get(target,key){if(key==='batch')return async statements=>{gate.arrived++;const started=Date.now();while(gate.arrived<2){if(Date.now()-started>3000)throw Error('Synthetic preflight barrier timed out');await new Promise(resolve=>setTimeout(resolve,1));}return target.batch(statements)};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});return domainHandler(request,{...env,DB:db});}}`;
test('PR30 transactional graph guards defeat simultaneous opposing revisions and withdrawn-head restoration races',async()=>{
 const f=await privateStorageFixture(racingWorker);try{const c=f.client('TEST-ONLY-pr30-race');await seed(c);await save(c,'A');await save(c,'B');
 const race=async(key,left,right)=>Promise.all([c.request('/api/learning-developments/revise',left,{headers:{'x-pr30-race':key}}),c.request('/api/learning-developments/revise',right,{headers:{'x-pr30-race':key}})]);
 const results=await race('opposing',input('race-A',{summary:'A corrects B',supersedesId:'B'},{id:'A',expectedRev:1}),input('race-B',{summary:'B corrects A',supersedesId:'A'},{id:'B',expectedRev:1}));assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.ok((await context(c)).resume);assert.equal((await f.db.prepare("SELECT count(*) n FROM v2_learning_developments WHERE owner=? AND revision=2").bind(c.owner).first()).n,1);
 await save(c,'C');await save(c,'D',{summary:'D initially corrects C',supersedesId:'C'});await ok(c.request('/api/learning-developments/revise',{...base,operationId:'withdraw-D',id:'D',expectedRev:1,withdraw:true}));
 const restoration=await race('withdrawn',input('race-C',{summary:'C points at withdrawn D',supersedesId:'D'},{id:'C',expectedRev:1}),input('restore-D',{summary:'D restored pointing at C',supersedesId:'C'},{id:'D',expectedRev:2}));assert.deepEqual(restoration.map(r=>r.status).sort(),[200,409]);assert.ok((await context(c)).resume);
 }finally{await f.dispose();}
});

test('PR30 encrypted recovery rejects current correction cycles but retains valid history and rechecks pre-release stages',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr30-recovery');await seed(c);await save(c,'A');await save(c,'B',{summary:'B corrects A',supersedesId:'A'});
 const passphrase='TEST-ONLY-private-recovery-phrase',exported=await c.request('/api/recovery/export',{operationId:'graph-export',expectedGeneration:c.generation,passphrase});assert.equal(exported.status,200);const decoded=decodeBundleFixture(Buffer.from(exported.data),passphrase);
 const transfer=async(bundle,operationId)=>{const metadata=Buffer.from(JSON.stringify({operationId,expectedGeneration:c.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);return c.request('/api/recovery/import',Buffer.concat([prefix,metadata,encodeBundleFixture(bundle,passphrase)]),{raw:true,headers:{'content-type':'application/octet-stream'}});};
 const bad=structuredClone(decoded),row=bad.manifest.tables.v2_learning_developments.find(r=>r.id==='A'),event=JSON.parse(row.event_json);event.supersedesId='B';row.event_json=JSON.stringify(event);const hostile=await transfer(bad,'cyclic-import');assert.equal(hostile.status,409);assert.equal(hostile.data.code,'correction_cycle');assert.equal(c.generation,'legacy@0');assert.ok((await context(c)).resume);
 const long=structuredClone(decoded),template=decoded.manifest.tables.v2_learning_developments.find(r=>r.id==='A'),historyTemplate=decoded.manifest.tables.v2_learning_development_revisions.find(r=>r.development_id==='A');
 for(let i=0;i<45;i++){const id='legacy-long-'+i,e={...JSON.parse(template.event_json),id,operationId:id,...(i?{supersedesId:'legacy-long-'+(i-1)}:{})};long.manifest.tables.v2_learning_developments.push({...template,id,last_operation:id,event_json:JSON.stringify(e)});long.manifest.tables.v2_learning_development_revisions.push({...historyTemplate,development_id:id,data:JSON.stringify(e)});}
 assert.equal((await transfer(long,'valid-legacy-long-chain')).status,200,'the live-write validation bound must not reject a valid long V23 recovery archive');
 const good=structuredClone(decoded),history=good.manifest.tables.v2_learning_development_revisions.find(r=>r.development_id==='A');history.data=JSON.stringify({...JSON.parse(history.data),supersedesId:'B'});const imported=await transfer(good,'valid-current-historical-mistake');assert.equal(imported.status,200,JSON.stringify(imported.data));
 const namespace=(await f.db.prepare('SELECT namespace FROM v2_recovery_stages WHERE owner=? AND id=?').bind(c.owner,imported.data.staged.id).first()).namespace;
 await f.db.prepare("UPDATE v2_learning_developments SET event_json=json_set(event_json,'$.supersedesId','B') WHERE owner=? AND id='A'").bind(namespace).run();const activated=await c.recover('activate',{stagedId:imported.data.staged.id,operationId:'invalid-old-stage'});assert.equal(activated.status,409);assert.equal(activated.data.code,'correction_cycle');assert.equal(await f.db.prepare('SELECT owner FROM v2_generation_heads WHERE owner=?').bind(c.owner).first(),null,'a pre-release invalid stage never becomes active');
 }finally{await f.dispose();}
});

test('PR30 staged graph admission checks later metadata pages and cross-page ancestry',async()=>{
 const stagedWorker=`import {validateRecoverySupersessionGraph} from './lib/learning-work.ts';import {RECOVERY_LIMITS} from './lib/recovery.ts';export default {async fetch(request,env){try{await validateRecoverySupersessionGraph(env,request.headers.get('oai-authenticated-user-id'),RECOVERY_LIMITS.rows);return Response.json({valid:true});}catch(error){return Response.json({code:error.code},{status:error.status??500});}}}`;
 const f=await privateStorageFixture(stagedWorker);try{const c=f.client('TEST-ONLY-pr30-staged-pages'),rows=Array.from({length:129},(_,i)=>({id:'edge-'+String(i).padStart(3,'0'),target_key:'investigation:synthetic',revision:1,withdrawn:0,event_json:JSON.stringify({supersedesId:i===128?'edge-128':'root'}),created_at:'2026-10-24',updated_at:'2026-10-24',last_operation:'fixture'}));rows.push({id:'root',target_key:'investigation:synthetic',revision:1,withdrawn:0,event_json:'{}',created_at:'2026-10-24',updated_at:'2026-10-24',last_operation:'fixture'});
 await f.db.prepare("INSERT INTO v2_learning_developments(owner,id,target_key,revision,event_json,created_at,updated_at,withdrawn,last_operation) SELECT ?,json_extract(value,'$.id'),json_extract(value,'$.target_key'),json_extract(value,'$.revision'),json_extract(value,'$.event_json'),json_extract(value,'$.created_at'),json_extract(value,'$.updated_at'),json_extract(value,'$.withdrawn'),json_extract(value,'$.last_operation') FROM json_each(?)").bind(c.owner,JSON.stringify(rows)).run();
 const secondPage=await c.request('/validate');assert.equal(secondPage.status,409);assert.equal(secondPage.data.code,'correction_cycle','the 129th superseding head must not escape page validation');
 await f.db.prepare("UPDATE v2_learning_developments SET event_json=json_set(event_json,'$.supersedesId','root') WHERE owner=? AND id='edge-128'").bind(c.owner).run();assert.equal((await c.request('/validate')).status,200);
 await f.db.prepare("UPDATE v2_learning_developments SET event_json=json_set(event_json,'$.supersedesId','missing') WHERE owner=? AND id='edge-128'").bind(c.owner).run();assert.equal((await c.request('/validate')).data.code,'correction_target');
 await f.db.prepare("UPDATE v2_learning_developments SET target_key='investigation:another',event_json=json_remove(event_json,'$.supersedesId') WHERE owner=? AND id='edge-128'").bind(c.owner).run();await f.db.prepare("UPDATE v2_learning_developments SET event_json=json_set(event_json,'$.supersedesId','edge-128') WHERE owner=? AND id='root'").bind(c.owner).run();assert.equal((await c.request('/validate')).data.code,'correction_target');
 await f.db.prepare("UPDATE v2_learning_developments SET target_key='investigation:synthetic',event_json=json_set(event_json,'$.supersedesId','root') WHERE owner=? AND id='edge-128'").bind(c.owner).run();

 await f.db.prepare("UPDATE v2_learning_developments SET event_json=json_set(event_json,'$.supersedesId','edge-128') WHERE owner=? AND id='root'").bind(c.owner).run();const crossPage=await c.request('/validate');assert.equal(crossPage.status,409);assert.equal(crossPage.data.code,'correction_cycle','a metadata page is not assumed to contain the whole ancestry');
 }finally{await f.dispose();}
});
