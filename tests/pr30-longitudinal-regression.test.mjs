import {test} from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const baseline="import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}";
const target={kind:'investigation',investigationId:'TEST-ONLY-pr30-history'};
const base={intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1};
async function ok(p){const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
async function seed(c){await ok(c.command({action:'create',family:'investigation',id:target.investigationId,data:{title:'TEST ONLY PR30 longitudinal evidence',body:'Which boundary changes the synthetic telemetry?',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Which boundary changes the synthetic telemetry?'}}}));}
const save=(c,id,development,extra={})=>ok(c.request('/api/learning-developments',{...base,operationId:id,development,...extra}));
const read=(c,args={})=>ok(c.request('/api/learning-context',{scope:'target',target,profile:'tutor',...args}));
const revise=(c,id,expectedRev,development,operationId)=>c.request('/api/learning-developments/revise',{...base,id,expectedRev,operationId,development});
test('PR30 permanent regression: eight-revision budget, old rationale, exact Note editions, stale cursors and correction-only resume remain honest through a 12-session history',async()=>{
 const f=await privateStorageFixture(baseline);try{const c=f.client('TEST-ONLY-lab-long-history');await seed(c);const refs=[];
 for(let i=0;i<12;i++){const note=(await ok(c.command({action:'create',family:'note',id:'TEST-ONLY-lab-evidence-'+i,data:{title:'TEST ONLY telemetry capture '+i,body:'TEST_ONLY_NOTE_BODY_'+i+'; captured original bytes: 7b226f6b223a747275657d',synthetic:true}}))).record;refs.push({id:note.id,rev:1,purpose:'Inspect original capture '+i+' without substituting a newer Note.'});}
 const sessions=[
  {summary:'Use local captures, no live observatory probing.',decisions:[{choice:'Keep the investigation local.',reason:'OLD_REASON_AUTHORISED_SCOPE: the observatory is fictional; only supplied loopback fixtures are authorised.',basis:'illustrative',status:'established'}],nextAction:'Predict what a successful health response proves.'},
  {summary:'DNS was suspected after one lookup error.',facts:[{role:'misconception',text:'One lookup error proves DNS caused every failure.',basis:'illustrative'}]},
  {summary:'A later captured request resolved and reached HTTP.',facts:[{role:'correction',text:'DNS cannot explain corruption in that already-resolved response.',basis:'illustrative'}]},
  {summary:'TCP success is weaker than valid telemetry.',facts:[{role:'correction',text:'The health endpoint returned 200 while telemetry failed its content check.',basis:'illustrative'}]},
  {summary:'Offset timestamps were initially compared as if both were UTC.',facts:[{role:'misconception',text:'A one-hour gap proves transport latency.',basis:'illustrative'}]},
  {summary:'Normalising timestamp offsets removes the apparent one-hour latency.',facts:[{role:'correction',text:'Timestamp display offset is not measured transport duration.',basis:'illustrative'}]},
  {summary:'A CRC mismatch remains in one saved telemetry sample.',facts:[{role:'reported-observation',text:'The synthetic sample has mismatching payload and expected CRC.',basis:'illustrative'}]},
  {summary:'Preserve raw bytes before any text decoding or repair.',nextAction:'Compare bytes at the relay boundary.'},
  {summary:'A retry might reduce visible errors but its effect is untested.',facts:[{role:'interpretation',text:'Retrying may hide intermittent symptoms without explaining corruption.',basis:'provisional'}]},
  {summary:'Objective changed to a reproducible diagnostic report rather than a repair.',decisions:[{choice:'Document the boundary evidence.',reason:'A repair would be premature while corruption origin is uncertain.',basis:'illustrative',status:'established'}]},
  {summary:'The learner reports a relay comparison, but no execution record was supplied.',facts:[{role:'attempt',text:'Synthetic learner said they compared relay output; no output supplied.',basis:'learner-reported'}]},
  {summary:'Return after a long interruption with corruption origin still unresolved.',nextAction:'Predict and compare original bytes on both sides of the simulated relay; keep the original capture unchanged.',nextQuestions:['Which earliest boundary differs?']}
 ];
 for(let i=0;i<sessions.length;i++)await save(c,'session-'+String(i).padStart(2,'0'),{...sessions[i],noteRefs:[refs[i]]});
 const t0=performance.now(),economical=await read(c),t1=performance.now(),broader=await read(c,{limit:12}),t2=performance.now();
 assert.equal(economical.resume.source.id,'session-11');assert.equal(economical.priorCheckpoints.length,3);assert.equal(economical.historyCoverage.moreHistoryAvailable,true);assert.doesNotMatch(JSON.stringify(economical),/OLD_REASON_AUTHORISED_SCOPE|TEST_ONLY_NOTE_BODY_/);
 assert.equal(broader.evidenceDetailsTruncated,true);assert.equal(broader.deferredCheckpoints.length,4);assert.doesNotMatch(JSON.stringify(broader),/OLD_REASON_AUTHORISED_SCOPE/);
 const exact=await read(c,{developmentId:'session-00'});assert.match(exact.priorCheckpoints[0].decisions[0].reason,/OLD_REASON_AUTHORISED_SCOPE/);assert.equal(exact.resume,undefined);assert.equal(exact.priorCheckpoints[0].noteEvidence[0].rev,1);
 let cursor=economical.nextCursor,pages=1,historyIds=economical.priorCheckpoints.map(d=>d.id).concat(economical.resume.source.id),last;
 while(cursor){last=await read(c,{cursor});assert.equal(last.pageRole,'history');assert.equal(last.resume,undefined);historyIds.push(...last.priorCheckpoints.map(d=>d.id));cursor=last.nextCursor;pages++;}
 assert.equal(new Set(historyIds).size,12);assert.equal(pages,3);assert.match(JSON.stringify(last),/OLD_REASON_AUTHORISED_SCOPE/);
 await ok(c.command({action:'update',family:'note',id:refs[0].id,expectedRev:1,data:{body:'TEST ONLY corrected Note wording; must not replace original capture.'}}));
 assert.equal((await read(c,{developmentId:'session-00'})).priorCheckpoints[0].noteEvidence[0].rev,1);
 const stale=await c.request('/api/learning-context',{scope:'target',target,profile:'tutor',cursor:economical.nextCursor});assert.equal(stale.status,409);assert.equal(stale.data.code,'stale_cursor');
 const corrected=await ok(revise(c,'session-01',1,{kind:'correction',summary:'The earlier universal DNS diagnosis was unsupported.',facts:[{role:'correction',text:'DNS did not explain payload corruption after a successful captured HTTP response.',basis:'illustrative'}]},'old-correction'));
 const correctionContext=await read(c);assert.equal(correctionContext.resume.source.id,'session-01');assert.equal(correctionContext.resume.source.createdAt,corrected.development.createdAt);assert.ok(correctionContext.resume.source.revisedAt);assert.equal(correctionContext.resume.nextAction,undefined);assert.match(correctionContext.guidance,/not.*fill an absent nextAction/);
 await ok(c.command({action:'trash',family:'note',id:refs[11].id,expectedRev:1}));const unavailable=await read(c);assert.ok(unavailable.deferredCheckpoints.some(d=>d.id==='session-11'&&d.evidenceUnavailable));assert.doesNotMatch(JSON.stringify(unavailable),/TEST-ONLY-lab-evidence-11|original bytes on both sides/);
 await ok(c.command({action:'restore',family:'note',id:refs[11].id,expectedRev:2}));assert.ok((await read(c)).priorCheckpoints.some(d=>d.id==='session-11'));
 await ok(c.request('/api/learning-developments/revise',{...base,operationId:'withdraw-old-correction',id:'session-01',expectedRev:2,withdraw:true}));assert.equal((await read(c)).resume.source.id,'session-11');
 }finally{await f.dispose();}
});

