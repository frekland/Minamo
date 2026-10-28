import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const purpose='TEST ONLY — fresh restricted-context synthetic exact source/Attempt continuity trial; no learning claim.';
const sha=text=>createHash('sha256').update(text,'utf8').digest('hex');
const source='TEST ONLY — original source edition one.\r\n\tA😀e\u0301: preserve CRLF, tab and Unicode.\r\n';
const terminal='TEST ONLY supplied invented terminal evidence; no command was executed.\r\ncommand: printf synthetic\r\nstdout:\t\u001b[32mA😀e\u0301\u001b[0m\r\nstderr:\t\u001b[31millustrative diagnostic\u001b[0m\r\n'+Array.from({length:72},(_,i)=>`stdout:\tfixture line ${i}: 😀 e\u0301\r\n`).join('')+'exit: supplied 0\r\n';
const nextIntention='Inspect the exact retained source before comparing its synthetic output; no observed execution or achievement is claimed.';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"});}}';

test('fresh Light typed local Activity/Attempt immutable source and terminal readback', {timeout:120000}, async t=>{
 t.diagnostic('fixture initialization started');
 const fixture=await privateStorageFixture(worker),owner=fixture.client('TEST-ONLY-readback-fresh'),foreign=fixture.client('TEST-ONLY-readback-foreign');
 let serial=0,calls=0;
 const rpc=async(client,method,params)=>client.request('/mcp',{jsonrpc:'2.0',id:++serial,method,...(params?{params}:{})});
 const raw=async(name,args={},client=owner)=>{calls++;return rpc(client,'tools/call',{name,arguments:{purpose,...args}});};
 const decode=response=>response.data.result?.content?.[0]?.text?JSON.parse(response.data.result.content[0].text):response.data;
 const call=async(name,args={},client=owner)=>{
  const response=await raw(name,args,client),value=decode(response);
  assert.equal(response.status,200,JSON.stringify(value));assert.ok(!response.data.error,JSON.stringify(value));assert.equal(response.data.result.isError,false,JSON.stringify(value));
  if(value.generation)client.setGeneration(value.generation);return value;
 };
 try{
  t.diagnostic('fixture initialized; discovering compiled tools/list');
  const listed=await rpc(owner,'tools/list');assert.equal(listed.status,200);const tools=listed.data.result.tools;
  for(const name of ['get_minamo_activity_capabilities','preview_minamo_activity_package','publish_minamo_activity_package','read_minamo_activity','record_minamo_activity_attempt','get_minamo_activity_context','read_minamo_record'])assert.ok(tools.some(tool=>tool.name===name),name);
  const schema=name=>tools.find(tool=>tool.name===name).inputSchema;
  assert.equal(schema('record_minamo_activity_attempt').additionalProperties,false);
  assert.equal(schema('record_minamo_activity_attempt').properties.expectedRev.type,'integer');
  assert.equal(schema('record_minamo_activity_attempt').properties.attempt.properties.activity.properties.rendition.type,'string');
  assert.ok(schema('read_minamo_record').properties.family.enum.includes('run'));
  const capabilities=await call('get_minamo_activity_capabilities');assert.equal(capabilities.enabled,true);
  const patterns=capabilities.presentation.patterns.map(pattern=>pattern.id);
  assert.ok(patterns.includes('read-and-annotate'));assert.ok(patterns.includes('predict-explore-compare'));
  const artefact=text=>({contract:'minamo.artefact.v1',kind:'text/plain-v1',canonical:{format:'text',source:text,sha256:sha(text)},provenance:{classification:'authored',execution:'not-executed'},payload:{text}});
  const activity={contract:'minamo.activity.v1',template:'predict-compare',authorship:'original-exercise',intent:'Compare exact original synthetic source editions while retaining a separately supplied Attempt.',blocks:[{id:'task',kind:'instruction',text:'TEST ONLY — inspect the literal source and label all supplied evidence.'},{id:'passage',kind:'foundry',artefact:artefact(source)},{id:'reflect',kind:'reflection',text:'Which exact Activity edition supports this supplied evidence?'}],presentation:{contract:'minamo.presentation.v1',version:1,pattern:'read-and-annotate',slots:[{slot:'task',blockId:'task'},{slot:'source',blockId:'passage'},{slot:'evidence',blockId:'reflect'}],preferredFocus:'source',fallback:'accessible-source'}};
  const originalInput={operationId:'readback-publish-original',expectedGeneration:owner.generation,id:'synthetic-readback-continuity',title:'TEST ONLY — Aurora literal continuity',synthetic:true,activity};
  const preview=await call('preview_minamo_activity_package',originalInput);assert.equal(preview.execution,'not-executed');
  const published=await call('publish_minamo_activity_package',originalInput);assert.equal(published.receipt.status,'committed');assert.equal(published.learningDevelopmentCreated,false);assert.equal(published.execution,'not-executed');
  const original=published.record;
  const suppliedAttempt={contract:'minamo.attempt.v1',activity:{family:'experiment',id:original.id,rendition:original.rendition},state:'submitted',prediction:'The exact supplied text will survive an Activity revision.',reflection:'TEST ONLY — invented supplied terminal text, not Minamo-observed execution or learner achievement.',nextIntention,hintsRevealed:[],evidence:[{classification:'supplied-terminal',text:terminal}]};
  const attemptInput={operationId:'readback-attempt-original',expectedGeneration:owner.generation,id:'TEST-ONLY-readback-attempt',title:'TEST ONLY — Aurora supplied Attempt',synthetic:true,attempt:suppliedAttempt};
  const saved=await call('record_minamo_activity_attempt',attemptInput);assert.equal(saved.receipt.status,'committed');assert.equal(saved.learningDevelopmentCreated,false);assert.equal(saved.record.evidence,'illustrative');assert.deepEqual(saved.record.attempt,suppliedAttempt);
  const replay=await call('record_minamo_activity_attempt',attemptInput);assert.equal(replay.receipt.operationId,saved.receipt.operationId);assert.equal(replay.receipt.replayed,true);assert.equal(replay.record.rendition,saved.record.rendition);
  const revisedActivity=structuredClone(activity);revisedActivity.blocks.find(b=>b.id==='passage').artefact=artefact('TEST ONLY — source edition TWO.\nThis must not replace the Attempt’s retained source.');revisedActivity.presentation.pattern='predict-explore-compare';revisedActivity.presentation.preferredFocus='task';
  const reviseInput={...originalInput,operationId:'readback-publish-revision',expectedGeneration:owner.generation,expectedRev:original.rev,activity:revisedActivity};
  await call('preview_minamo_activity_package',reviseInput);const revised=await call('publish_minamo_activity_package',reviseInput);assert.notEqual(revised.record.rendition,original.rendition);
  const latest=await call('read_minamo_activity',{id:original.id});assert.deepEqual(latest.record.activity,revisedActivity);
  const retained=await call('read_minamo_activity',{id:original.id,rendition:original.rendition});assert.deepEqual(retained.record.activity,activity);assert.equal(retained.record.activity.blocks.find(b=>b.id==='passage').artefact.canonical.source,source);assert.equal(retained.record.activity.blocks.find(b=>b.id==='passage').artefact.canonical.sha256,sha(source));
  const exact=await call('read_minamo_record',{family:'run',id:saved.record.id,rendition:saved.record.rendition});assert.deepEqual(exact.record.attempt,suppliedAttempt);assert.equal(exact.record.attempt.evidence[0].text,terminal);assert.deepEqual(Buffer.from(exact.record.attempt.evidence[0].text),Buffer.from(terminal));assert.equal(exact.record.attempt.activity.rendition,original.rendition);
  const context=await call('get_minamo_activity_context',{query:'Aurora literal continuity',includeSynthetic:true});
  const resumed=context.attempts.find(a=>a.id===saved.record.id);assert.ok(resumed,JSON.stringify(context));assert.equal(resumed.attempt.activity.rendition,original.rendition);assert.equal(resumed.attempt.nextIntention,nextIntention);assert.equal(resumed.attempt.evidence[0].classification,'supplied-terminal');
  assert.ok(resumed.exactRead,'SDK GAP: resumed Attempt must disclose exactRead for complete supplied-terminal evidence.');
  const reference=JSON.stringify(resumed.exactRead);assert.match(reference,/read_minamo_record/);assert.ok(reference.includes(saved.record.id));assert.ok(reference.includes(saved.record.rendition));assert.match(reference,/run/);
  assert.ok(terminal.length>1200);assert.equal(resumed.evidenceMayBeTruncated,true);assert.ok(resumed.attempt.evidence[0].text.length<terminal.length);assert.equal(resumed.attempt.evidence[0].text,terminal.slice(0,resumed.attempt.evidence[0].text.length));const {tool,...exactArgs}=resumed.exactRead;const fullEvidence=await call(tool,exactArgs);assert.equal(fullEvidence.record.attempt.evidence[0].text,terminal);assert.equal(fullEvidence.record.evidence,'illustrative');
  assert.equal(context.nextCursor,null);assert.equal(context.searchIncomplete,false);
  t.diagnostic('RESUME_EVIDENCE '+JSON.stringify(resumed));
  const updateInput={...attemptInput,operationId:'readback-attempt-update',expectedGeneration:owner.generation,expectedRev:saved.record.rev,attempt:{...suppliedAttempt,state:'revisited'}};
  const updated=await call('record_minamo_activity_attempt',updateInput);assert.equal(updated.record.rev,saved.record.rev+1);assert.equal(updated.record.attempt.activity.rendition,original.rendition);
  const updateReplay=await call('record_minamo_activity_attempt',updateInput);assert.equal(updateReplay.receipt.replayed,true);assert.equal(updateReplay.record.rendition,updated.record.rendition);
  const staleResponse=await raw('record_minamo_activity_attempt',{...updateInput,operationId:'readback-attempt-stale',attempt:{...suppliedAttempt,state:'editing'}});const stale=decode(staleResponse);assert.equal(staleResponse.status,200);assert.equal(stale.receipt.status,'conflict',JSON.stringify(stale));assert.equal(stale.record,null);assert.equal(stale.learningDevelopmentCreated,false);
  const currentAttempt=await call('read_minamo_record',{family:'run',id:saved.record.id});assert.equal(currentAttempt.record.rendition,updated.record.rendition);assert.equal(currentAttempt.record.attempt.state,'revisited');
  for(const [tool,args] of [['read_minamo_activity',{id:original.id,rendition:original.rendition}],['read_minamo_record',{family:'run',id:saved.record.id,rendition:saved.record.rendition}]]){
   const response=await raw(tool,args,foreign);assert.ok(response.status>=400||response.data.error||response.data.result?.isError,JSON.stringify(response));assert.ok(!JSON.stringify(response.data).includes(terminal));assert.ok(!JSON.stringify(response.data).includes(source));
  }
  const foreignContext=await call('get_minamo_activity_context',{query:'Aurora literal continuity',includeSynthetic:true},foreign);assert.deepEqual(foreignContext.activities,[]);assert.deepEqual(foreignContext.attempts,[]);
  const families=await fixture.db.prepare('SELECT family,count(*) AS n FROM v2_records GROUP BY family ORDER BY family').all();assert.deepEqual(families.results,[{family:'experiment',n:1},{family:'run',n:1}]);
  const checkpointTables=await fixture.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%checkpoint%' OR name LIKE '%development%')").all();for(const {name} of checkpointTables.results){const count=await fixture.db.prepare('SELECT count(*) AS n FROM "'+name.replaceAll('"','""')+'"').first();assert.equal(count.n,0,name);}
  t.diagnostic('READBACK_RECEIPT '+JSON.stringify({calls,originalRendition:original.rendition,revisedRendition:revised.record.rendition,attemptOriginalRendition:saved.record.rendition,attemptRevisedRendition:updated.record.rendition,sourceUtf8Bytes:Buffer.byteLength(source),sourceSha256:sha(source),terminalUtf8Bytes:Buffer.byteLength(terminal),terminalSha256:sha(terminal),families:families.results,checkpointTables:checkpointTables.results}));
 }finally{await fixture.dispose();t.diagnostic('owned synthetic D1/R2 fixture disposed');}
});
