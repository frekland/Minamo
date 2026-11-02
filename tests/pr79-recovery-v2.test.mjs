import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {decodeBundleFixture,encodeBundleFixture} from './portable-bundle-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};`;
test('PR79 v2 stage-free Note and Development survive actual private export, import and activation',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('pr79-portable-owner'),ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data};
  const work=ok(await client.command({action:'create',family:'work',id:'pr79-research',data:{title:'Compare two real examples',body:'I want to understand this difference.'}})).record;
  const saved=ok(await client.request('/api/learning-updates',{intent:'explicit-user-update',purpose:'Learner asked to save the explanation',operationId:'pr79-recovery-update',expectedGeneration:client.generation,proposed:{note:{title:'My changed assumption',body:'I thought the header was always absent. Now I will inspect both responses.'},development:{summary:'I revised an earlier guess.',facts:[{role:'misconception',text:'I assumed a response omitted headers.',basis:'learner-reported'}],nextAction:'Compare both complete responses.'},proposedRelations:[{to:{family:'work',id:work.id},accepted:true,relation:'related',reason:'I am comparing these results in my Work.'}]}}));
  const noteId=saved.note.id,devId=saved.developmentRef.id;
  const prior=ok(await client.context('note',noteId)).record;
  const earlierClaim='I thought the header was always absent.';
  const corrected=ok(await client.request('/api/learning-updates',{intent:'explicit-user-update',purpose:'Learner chose one exact previous claim to correct',operationId:'pr79-recovery-correction',expectedGeneration:client.generation,proposed:{note:{title:'Correct one claim',body:'I found that response headers were present; I still need to test the response body.'},development:{kind:'correction',summary:'The earlier header-absence claim was incorrect; body behavior is still an open question.',facts:[],claimCorrections:[{accepted:true,reason:'An actual header inspection showed the fields.',prior:{kind:'record-passage',family:'note',id:noteId,revision:1,sectionId:'__article',partId:'__body',start:0,end:earlierClaim.length,quote:earlierClaim}}],nextQuestions:['What about the response body?']},proposedRelations:[{to:{family:'work',id:work.id},accepted:true,relation:'related',reason:'Same investigation, but distinct source writing.'}]}}));
  const passphrase='PR79-fixture-passphrase-for-private-export';
  const exported=await client.request('/api/recovery/export',{operationId:'pr79-v2-export',expectedGeneration:client.generation,passphrase});assert.equal(exported.status,200);
  const decoded=decodeBundleFixture(Buffer.from(exported.data),passphrase),events=decoded.manifest.tables.v2_learning_developments;
  assert.equal(events.length,2);assert.ok(events.every(event=>JSON.parse(event.event_json).schemaVersion===2));
  const encoded=encodeBundleFixture(decoded,passphrase);
  const metadata=Buffer.from(JSON.stringify({operationId:'pr79-v2-portable',expectedGeneration:client.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);
  const imported=ok(await client.request('/api/recovery/import',Buffer.concat([prefix,metadata,encoded]),{raw:true,headers:{'content-type':'application/octet-stream'}}));
  const activated=ok(await client.recover('activate',{stagedId:imported.staged.id,operationId:'pr79-v2-activate'}));client.setGeneration(activated.generation);
  const note=ok(await client.context('note',noteId)).record;assert.match(note.body,/header was always absent/);assert.equal(note.links[0].id,work.id);
  const target={kind:'record',family:'note',id:noteId};const context=ok(await client.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)})));
  assert.equal(context.developments[0].id,devId);assert.equal(context.developments[0].schemaVersion,2);assert.equal(context.developments[0].nextAction,'Compare both complete responses.');
  const correctionTarget={kind:'record',family:'note',id:corrected.note.id};
  const correctedContext=ok(await client.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(correctionTarget)})));
  assert.equal(correctedContext.developments[0].claimCorrections[0].prior.quote,earlierClaim);
  assert.deepEqual(correctedContext.developments[0].nextQuestions,['What about the response body?']);
 }finally{await fixture.dispose();}
});
