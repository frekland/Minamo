import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
test('free subject labels are independent searchable metadata with exact CAS, no content revision and no inherited claims',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('subject-owner'),other=f.client('subject-other');
 const project=(await ok(c.command({action:'create',family:'journey',id:'subject-project',data:{title:'Comparing alternative frames',body:'Hypotheses only.',synthetic:true}}))).record;
 const command={operationId:'subject-label-save',action:'update',family:'journey',id:project.id,expectedRev:project.rev,data:{classifyLearningScope:{expectedScopeRev:0,learningScope:{version:1,spaces:[],subjects:[' Photography ','Visual attention'],provenance:'classification'}}}};
 const receipt=await ok(c.command(command));assert.equal(receipt.learningScopeRev,1);assert.equal((await ok(c.command(command))).replayed,true);
 const after=(await ok(c.context('journey',project.id))).record;assert.equal(after.rev,project.rev);assert.equal(after.rendition,project.rendition);assert.deepEqual(after.learningScope.subjects,['Photography','Visual attention']);
 const query=await ok(c.request('/api/query?q=Photography&family=journey'));assert.equal(query.records[0].id,project.id);assert.equal(query.matchEvidence[0].field,'subject-label');assert.equal(query.matchEvidence[0].metadataOnly,true);assert.equal(query.matchEvidence[0].classificationRevision,1);assert.equal(new URL(query.matchEvidence[0].href,'https://test.invalid').searchParams.has('rendition'),false,'current organisation is not an immutable source edition');
 assert.equal((await ok(other.request('/api/query?q=Photography'))).records.length,0);
 assert.equal((await other.command({...command,operationId:'foreign-subject-save'})).status,409);
 assert.equal((await c.command({...command,operationId:'stale-subject-save'})).status,409);
 for(const subjects of [['Photography','photography'],['x'.repeat(65)],['invisible\nlabel']])assert.equal((await c.command({...command,operationId:crypto.randomUUID(),data:{classifyLearningScope:{expectedScopeRev:1,learningScope:{version:1,spaces:[],subjects,provenance:'classification'}}}})).status,400);
 const note=(await ok(c.command({action:'create',family:'note',id:'subject-independent-note',data:{title:'A linked open question',body:'No evidence of agreement.',links:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record;
 assert.equal((await ok(c.context('note',note.id))).record.learningScope?.subjects,undefined,'labels are not silently copied onto a linked Note');
 }finally{await f.dispose();}
});
