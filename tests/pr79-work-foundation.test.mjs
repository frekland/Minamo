import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('PR79 D0: Stage-free Work identity and filtered legacy discovery preserve exact originals',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB');
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())
   for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'pr79-foundation','oai-authenticated-user-email':'synthetic@example.invalid','Content-Type':'application/json'};
  const request=async(path,body)=>{const r=await mf.dispatchFetch('https://pr79.test'+path,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
  const save=async(operationId,action,family,id,data,expectedRev)=>request('/api/commands',{operationId,action,family,id,...(data?{data}:{}),...(expectedRev?{expectedRev}:{})});
  const legacy=(await save('pr79-legacy','create','journey','old-learning',{title:'SYNTHETIC earlier project',body:'A retained start',synthetic:true,sections:[{id:'phase',title:'A retained stage',parts:[{id:'text',kind:'paragraph',text:'Earlier stage text'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage',sectionId:'phase',title:'Earlier plan'}]}})).data.record;
  assert.ok(legacy?.rendition);
  const created=await save('pr79-work','create','work','new-work',{title:'SYNTHETIC evolving app',body:'I want to explore an idea',synthetic:true});
  assert.equal(created.status,200,JSON.stringify(created));
  assert.equal(created.data.record.family,'work');
  assert.deepEqual(created.data.record.workMeta,{version:1});
  assert.equal(created.data.record.learningShape,undefined);
  let work=created.data.record;
  await t.test('Work links original Notes without requiring a Stage or changing the originals',async()=>{
   const note=await save('pr79-note','create','note','independent-note',{title:'SYNTHETIC independent thought',body:'A test of the queue assumption',synthetic:true,links:[{family:'work',id:work.id,relation:'related',reason:'Learner explicitly linked this note to the evolving app'}]});
   assert.equal(note.status,200,JSON.stringify(note));
   const workRead=await request('/api/context?family=work&id='+work.id);
   assert.equal(workRead.status,200);
   const noteRead=await request('/api/context?family=note&id=independent-note');
   assert.equal(noteRead.data.record.links[0].family,'work');
   assert.equal((await request('/api/context?family=journey&id=old-learning&rendition='+legacy.rendition)).data.record.learningShape.stages[0].id,'stage');
  });
  await t.test('Archive and rename are guarded canonical revisions, not deletion or a Stage status',async()=>{
   const updated=await save('pr79-work-archive','update','work',work.id,{title:'SYNTHETIC revised direction',workMeta:{version:1,archivedAt:'2026-11-02T14:00:00.000Z'}},work.rev);
   assert.equal(updated.status,200,JSON.stringify(updated));work=updated.data.record;
   assert.equal(work.workMeta.archivedAt,'2026-11-02T14:00:00.000Z');
   assert.equal((await request('/api/context?family=note&id=independent-note')).data.record.body,'A test of the queue assumption');
   const replay=await save('pr79-work-archive','update','work',work.id,{title:'SYNTHETIC revised direction',workMeta:{version:1,archivedAt:'2026-11-02T14:00:00.000Z'}},work.rev-1);
   assert.equal(replay.data.replayed,true);
  });
  await t.test('Pre-pagination legacy visibility is cursor-bound, explicit old links and independent MCP are unaffected',async()=>{
   const study=await request('/api/query?study=1&q=SYNTHETIC&limit=1&includeLegacyJourneys=0');
   assert.equal(study.status,200);assert.ok(study.data.records.every(record=>!record.synthetic&&record.family!=='journey'),'Study omits synthetic fixtures at the server read boundary');
   const hidden=await request('/api/query?q=SYNTHETIC&limit=1&includeLegacyJourneys=0');
   assert.equal(hidden.status,200,JSON.stringify(hidden));assert.ok(hidden.data.records.every(record=>record.family!=='journey'));
   const shown=await request('/api/query?q=SYNTHETIC&limit=1&includeLegacyJourneys=1');
   assert.equal(shown.status,200);assert.ok(shown.data.nextCursor);
   const mismatch=await request('/api/query?q=SYNTHETIC&limit=1&includeLegacyJourneys=0&cursor='+encodeURIComponent(shown.data.nextCursor));
   assert.equal(mismatch.status,400);
   const exact=await request('/api/context?family=journey&id=old-learning&rendition='+legacy.rendition);
   assert.equal(exact.status,200);
   const mcp=await request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'query_minamo_records',arguments:{purpose:'Read explicitly selected original work',query:'earlier project',family:'journey'}}});
   assert.equal(mcp.data.result.isError,false,JSON.stringify(mcp));
  });
  await t.test('Work refuses the old Stage shape and foreign metadata',async()=>{
   const bad=await save('pr79-bad-stage','create','work','bad-stage',{title:'Bad Stage',body:'no',learningShape:{version:1,kind:'journey',stages:[]}});
   assert.equal(bad.status,400);assert.equal(bad.data.code,'work_stage_free');
   const foreign=await save('pr79-bad-meta','create','note','bad-meta',{title:'No',body:'No',workMeta:{version:1}});
   assert.equal(foreign.status,400);
  });
 }finally{await mf.dispose();}
});
