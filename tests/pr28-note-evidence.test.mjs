import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const target={kind:'investigation',investigationId:'TEST-ONLY-pr28-question'};
const base={intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1};
async function ok(promise){const r=await promise;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
async function seed(c){await ok(c.command({action:'create',family:'investigation',id:target.investigationId,data:{title:'TEST ONLY inspect a decoding boundary',body:'Retain evidence without inferring learner execution.',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Which boundary explains this result?'}}}));}
const save=(c,id,development,extra={})=>ok(c.request('/api/learning-developments',{...base,operationId:id,development,...extra}));
const read=(c,args={})=>ok(c.request('/api/learning-context',{scope:'target',target,profile:'tutor',...args}));
async function mcp(c,args={}){const envelope=await ok(c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'TEST ONLY return to exact saved evidence',scope:'target',target,...args}}}));assert.notEqual(envelope.result.isError,true,JSON.stringify(envelope));return JSON.parse(envelope.result.content[0].text);}

test('PR28 default/explicit MCP tutor and exact detail discover compact cited Note editions across later writing, correction and withdrawal',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr28-note-identity');await seed(c);
 const body='TEST_ONLY_LONG_NOTE_BODY_NOT_TUTOR_CONTEXT '.repeat(90),note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-note-evidence',data:{title:'TEST ONLY diagnostic evidence',body,synthetic:true}}))).record;
 const ref={id:note.id,rev:1,purpose:'Inspect the exact supplied byte sample only when it changes the diagnosis.'};
 await save(c,'with-note',{summary:'A narrow decoding question remains open.',noteRefs:[ref],nextAction:'Predict which boundary fails first.'});
 const expected={...ref,rendition:note.rendition,destination:'/?view=work&family=note&id='+note.id+'&rendition='+note.rendition};
 const current=await mcp(c);assert.equal(current.profile,'tutor');assert.deepEqual(current.resume.noteEvidence,[expected]);assert.doesNotMatch(JSON.stringify(current),/TEST_ONLY_LONG_NOTE_BODY_NOT_TUTOR_CONTEXT/);assert.equal(current.evidenceDetailsTruncated,false);
 const compactGrowth=Buffer.byteLength(JSON.stringify(current.resume.noteEvidence));assert.ok(compactGrowth<800,'one reference adds bounded identity/purpose/destination, not Note prose');
 const explicit=await mcp(c,{profile:'tutor'});assert.deepEqual(explicit.resume.noteEvidence,[expected]);
 const updated=(await ok(c.command({action:'update',family:'note',id:note.id,expectedRev:1,data:{body:'TEST ONLY newer text must not replace the cited evidence.'}}))).record;assert.notEqual(updated.rendition,note.rendition);
 assert.deepEqual((await mcp(c)).resume.noteEvidence,[expected]);const exactNote=await ok(c.context('note',note.id,note.rendition));assert.equal(exactNote.record.body,body);
 await save(c,'later',{summary:'Keep the prototype narrow while provenance is unresolved.'});const later=await read(c);assert.equal(later.resume.source.id,'later');assert.equal(later.resume.noteEvidence,undefined);assert.deepEqual(later.priorCheckpoints.find(d=>d.id==='with-note').noteEvidence,[expected]);
 for(const args of [{profile:'tutor',developmentId:'with-note'},{developmentId:'with-note'}]){const detail=await mcp(c,args);assert.equal(detail.pageRole,'detail');assert.equal(detail.resume,undefined);const item=detail.priorCheckpoints?.[0]??detail.developments?.[0];assert.deepEqual(item.noteEvidence,[expected]);assert.doesNotMatch(JSON.stringify(detail),/TEST_ONLY_LONG_NOTE_BODY_NOT_TUTOR_CONTEXT/);}
 const correction=await ok(c.request('/api/learning-developments/revise',{...base,operationId:'correct-with-note',id:'with-note',expectedRev:1,development:{kind:'correction',summary:'The exact output does not identify the producer encoding.',noteRefs:[ref]}}));assert.equal(correction.development.revision,2);const corrected=await read(c);assert.equal(corrected.resume.source.kind,'correction');assert.equal(corrected.resume.nextAction,undefined);assert.deepEqual(corrected.resume.noteEvidence,[expected]);
 await ok(c.command({action:'trash',family:'note',id:note.id,expectedRev:2}));const unavailable=await mcp(c);assert.equal(unavailable.resume,undefined);assert.ok(unavailable.deferredCheckpoints.some(d=>d.id==='with-note'&&d.evidenceUnavailable));assert.doesNotMatch(JSON.stringify(unavailable),/TEST-ONLY-note-evidence|producer encoding/);
 await ok(c.command({action:'restore',family:'note',id:note.id,expectedRev:3}));assert.deepEqual((await mcp(c)).resume.noteEvidence,[expected]);
 await ok(c.request('/api/learning-developments/revise',{...base,operationId:'withdraw-with-note',id:'with-note',expectedRev:2,withdraw:true}));const withdrawn=await mcp(c);assert.equal(withdrawn.resume.source.id,'later');assert.doesNotMatch(JSON.stringify(withdrawn),/TEST-ONLY-note-evidence|producer encoding/);
 console.log('PR28 Note reference economy',JSON.stringify({referenceBytes:compactGrowth,noteBodyBytes:Buffer.byteLength(body),tutorBytes:Buffer.byteLength(JSON.stringify(current)),readCalls:1,hosted:false}));
 }finally{await f.dispose();}
});

test('PR28 Note evidence uses current source restrictions and does not leak referenced Notes or dependent prose after revocation',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr28-note-rights');await seed(c);
 const source=(await ok(c.command({action:'create',family:'source',id:'TEST-ONLY-source-evidence',data:{title:'TEST ONLY permitted source',body:'',synthetic:true,source:{url:'https://example.invalid/decoding',attribution:'Synthetic source',rights:'permitted-excerpt',excerpt:{id:'e',text:'TEST_ONLY_REVOKABLE_SOURCE_TEXT',locator:'Original test passage',edition:'one',basis:'owner-authored',permissionNote:'Disposable fixture',ownerAttested:true,state:'permitted',exportAllowed:true}}}}))).record;
 const text=source.source.excerpt.text,note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-restricted-note',data:{title:'TEST ONLY source-bearing Note',body:'Independent writing remains separate.',synthetic:true,sections:[{id:'s',title:'Exact supplied material',parts:[{id:'p',kind:'excerpt',text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:text.length}}]}]}}))).record;
 await save(c,'restricted',{summary:'TEST_ONLY_DEPENDENT_INTERPRETATION',noteRefs:[{id:note.id,rev:1,purpose:'TEST_ONLY_RESTRICTED_PURPOSE'}]},{expectedPerspectiveRev:0,perspective:{summary:'TEST_ONLY_DEPENDENT_ORIENTATION',dependencies:[{id:'restricted',revision:1}]}});
 assert.equal((await mcp(c)).resume.noteEvidence[0].id,note.id);
 await ok(c.command({action:'update',family:'source',id:source.id,expectedRev:1,data:{source:{excerpt:{state:'revoked'}}}}));
 for(const args of [{},{profile:'tutor'},{profile:'tutor',developmentId:'restricted'},{developmentId:'restricted'}]){const restricted=await mcp(c,args);assert.equal(restricted.resume,undefined);assert.doesNotMatch(JSON.stringify(restricted),/TEST-ONLY-restricted-note|TEST_ONLY_RESTRICTED_PURPOSE|TEST_ONLY_DEPENDENT_INTERPRETATION|TEST_ONLY_DEPENDENT_ORIENTATION|TEST_ONLY_REVOKABLE_SOURCE_TEXT/);if(restricted.perspective){assert.equal(restricted.perspective.stale,true);assert.equal(restricted.perspective.summary,'');}}
 }finally{await f.dispose();}
});

test('PR28 existing evidence budget defers whole Note references and focused detail resolves them without carrying bodies',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-pr28-note-budget');await seed(c);const refs=[];
 for(let i=0;i<9;i++){const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-budget-note-'+i,data:{title:'TEST ONLY evidence '+i,body:'TEST_ONLY_BUDGET_BODY_'+i,synthetic:true}}))).record;refs.push({id:note.id,rev:1,purpose:'Inspect exact fixture '+i});}
 await save(c,'eight-notes',{summary:'Keep this eight-Note artifact set together.',noteRefs:refs.slice(0,8)});await save(c,'latest-note',{summary:'One later fixture informs the current question.',noteRefs:refs.slice(8)});
 const bounded=await mcp(c);assert.equal(bounded.resume.noteEvidence.length,1);assert.equal(bounded.priorCheckpoints.length,0);assert.ok(bounded.deferredCheckpoints.some(d=>d.id==='eight-notes'&&d.detailsDeferred));assert.equal(bounded.evidenceDetailsTruncated,true);assert.doesNotMatch(JSON.stringify(bounded),/TEST_ONLY_BUDGET_BODY_|TEST-ONLY-budget-note-[0-7]/);
 const detail=await mcp(c,{profile:'tutor',developmentId:'eight-notes'});assert.equal(detail.priorCheckpoints[0].noteEvidence.length,8);assert.equal(detail.evidenceDetailsTruncated,false);assert.doesNotMatch(JSON.stringify(detail),/TEST_ONLY_BUDGET_BODY_/);
 }finally{await f.dispose();}
});
