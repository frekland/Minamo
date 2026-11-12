import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('PR79 corrected claim has an exact original identity without erasing other claims',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB');
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())
   for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers=owner=>({'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'fictional@example.invalid','Content-Type':'application/json'});
  const call=async(path,body,owner='learner-claims')=>{const r=await mf.dispatchFetch('https://pr79.test'+path,{method:body?'POST':'GET',headers:headers(owner),...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
  const original='A: I think HEAD always downloads the full response body.\nB: I predict this server sends different caching headers.';
  const request=(op,note,development)=>({purpose:'An explicit learner-reviewed learning change',intent:'explicit-user-update',expectedGeneration:'legacy@0',operationId:op,proposed:{note:{title:op,body:note},development}});
  const first=await call('/api/learning-updates',request('claim-before',original,{kind:'learning-update',summary:'Two claims, still open to testing',facts:[{role:'misconception',basis:'learner-reported',text:'HEAD always downloads the full response body.'},{role:'prediction',basis:'learner-reported',text:'The server sends different caching headers.'}]}));
  assert.equal(first.status,200,JSON.stringify(first));
  const originalRead=await call('/api/context?family=note&id='+first.data.note.id);
  const originalNote=originalRead.data.record;
  assert.equal(originalNote.body,original);
  const quote='HEAD always downloads the full response body.';
  const passage={kind:'record-passage',family:'note',id:originalNote.id,revision:1,...(originalNote.rendition?{rendition:originalNote.rendition}:{}),sectionId:'__article',partId:'__body',start:original.indexOf(quote),end:original.indexOf(quote)+quote.length,quote};
  const corrected=request('claim-corrected','The HEAD response does not include the response body. I have not yet checked the caching-header prediction.',{kind:'correction',summary:'The HEAD body claim is corrected; the caching-header prediction is still unresolved.',facts:[{role:'correction',basis:'learner-reported',text:'HEAD has no response body.'}],claimCorrections:[{prior:passage,accepted:true,reason:'I checked the response and distinguished headers from a response body.'}],nextQuestions:['Does this test server actually vary caching headers?']});
  await t.test('save, replay, exact independent read and preservation of separate assertion',async()=>{
   const saved=await call('/api/learning-updates',corrected);
   assert.equal(saved.status,200,JSON.stringify(saved));
   assert.equal(saved.data.status,'committed');
   const replay=await call('/api/learning-updates',corrected);
   assert.equal(replay.status,200);assert.equal(replay.data.replayed,true);
   const oldNote=await call('/api/context?family=note&id='+originalNote.id);
   assert.equal(oldNote.data.record.body,original);
   assert.match(oldNote.data.record.body,/B: I predict this server/);
   const target={kind:'record',family:'note',id:saved.data.note.id};
   const read=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)}));
   assert.equal(read.status,200,JSON.stringify(read));
   assert.equal(read.data.developments.length,1);
   assert.equal(read.data.developments[0].claimCorrections.length,1);
   assert.deepEqual(read.data.developments[0].claimCorrections[0].prior,passage);
   assert.deepEqual(read.data.developments[0].nextQuestions,['Does this test server actually vary caching headers?']);
   const other=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)}),undefined,'someone-else');
   assert.notEqual(other.status,200);
  });
  await t.test('malformed, missing, mismatched or foreign anchors are rejected with no partial Note',async()=>{
   const variants=[
    {...passage,quote:'Different text.'},
    {...passage,id:'not-owned'},
    {...passage,revision:44},
    {...passage,start:passage.start+1},
   ];
   for(const [i,prior] of variants.entries()){
    const bad=structuredClone(corrected);bad.operationId='claim-bad-'+i;bad.proposed.development.claimCorrections[0].prior=prior;
    const result=await call('/api/learning-updates',bad);assert.notEqual(result.status,200,JSON.stringify(result));
    assert.equal((await db.prepare('SELECT count(*) count FROM v2_records WHERE owner=? AND last_operation=?').bind('learner-claims',bad.operationId).first()).count,0);
   }
  });
  await t.test('exact prior Development fact may be corrected without replacing that whole Development',async()=>{
   const fact='The server sends different caching headers.';
   const anchor={kind:'development-fact',developmentId:first.data.developmentRef.id,revision:1,factIndex:1,quote:fact};
   const requestFact=request('claim-fact','I retested caching headers; that earlier prediction was incorrect.',{kind:'correction',summary:'Correction to the second specific prediction',facts:[],claimCorrections:[{prior:anchor,accepted:true,reason:'The observed headers were identical in the two calls.'}]});
   const result=await call('/api/learning-updates',requestFact);
   assert.equal(result.status,200,JSON.stringify(result));
   const read=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify({kind:'record',family:'note',id:result.data.note.id})}));
   assert.deepEqual(read.data.developments[0].claimCorrections[0].prior,anchor);
   assert.equal((await call('/api/context?family=note&id='+originalNote.id)).data.record.body,original);
  });
  await t.test('editing the source Note makes a stale selected passage fail closed',async()=>{
   const changed=await call('/api/commands',{operationId:'claim-change-source',action:'update',family:'note',id:originalNote.id,expectedRev:1,expectedGeneration:'legacy@0',data:{body:'New original wording changes the exact claim.'}});
   assert.equal(changed.status,200,JSON.stringify(changed));
   const stale=structuredClone(corrected);stale.operationId='claim-stale';
   assert.equal((await call('/api/learning-updates',stale)).status,409);
   const read=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify({kind:'record',family:'note',id:(await call('/api/learning-updates',corrected)).data.note.id})}));
   assert.equal(read.data.developments[0].claimCorrections.length,1,'Retained historical exact anchors remain readable while the owner still has the original revision.');
  });
  await t.test('unavailable original suppresses the correction quotation on independent reads',async()=>{
   const trashed=await call('/api/commands',{operationId:'claim-source-removed',action:'trash',family:'note',id:originalNote.id,expectedRev:2,expectedGeneration:'legacy@0'});
   assert.equal(trashed.status,200,JSON.stringify(trashed));
   const noteId=(await call('/api/learning-updates',corrected)).data.note.id;
   const read=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify({kind:'record',family:'note',id:noteId})}));
   assert.equal(read.status,200,JSON.stringify(read));
   assert.equal(read.data.developments[0].evidenceUnavailable,true);
   assert.deepEqual(read.data.developments[0].claimCorrections,[]);
   assert.doesNotMatch(JSON.stringify(read.data.developments),/HEAD always downloads the full response body/);
  });
 }finally{await mf.dispose();}
});
