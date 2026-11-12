import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
test('PR79 projectless natural-language updates are one guarded Note + Development commit',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB');
  for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())
   for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers=owner=>({'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'fictional@example.invalid','Content-Type':'application/json'});
  const call=async(path,body,owner='fictional-learner')=>{const r=await mf.dispatchFetch('https://pr79.test'+path,{method:body?'POST':'GET',headers:headers(owner),...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
  const make=(operationId,body='I now want to compare HEAD with GET.')=>({purpose:'Learner explicitly asked to update Minamo',intent:'explicit-user-update',expectedGeneration:'legacy@0',operationId,proposed:{note:{title:'HEAD and GET',body},development:{summary:'I changed my original assumption about -I.',facts:[{role:'misconception',text:'I had assumed -I fetched a response body.',basis:'learner-reported'}],nextAction:'Compare -I and -i against the same test server.'}}});
  const first=make('pr79-original-update');
  const saved=await call('/api/learning-updates',first);
  assert.equal(saved.status,200,JSON.stringify(saved));
  assert.equal(saved.data.status,'committed');
  const noteId=saved.data.note.id,devId=saved.data.developmentRef.id;
  await t.test('one original appears in exact reads and fresh independent learning-context reads',async()=>{
   const note=await call('/api/context?family=note&id='+noteId);
   assert.equal(note.status,200);assert.equal(note.data.record.body,first.proposed.note.body);
   const target={kind:'record',family:'note',id:noteId};
   const context=await call('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)}));
   assert.equal(context.status,200,JSON.stringify(context));
   assert.equal(context.data.developments.length,1);
   assert.equal(context.data.developments[0].id,devId);
   assert.equal(context.data.developments[0].primaryTarget.kind,'record');
   const mcp=await call('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'Continue the learner’s saved update',scope:'target',target}}});
   assert.equal(mcp.data.result.isError,false,JSON.stringify(mcp));
   assert.match(mcp.data.result.content[0].text,/I changed my original assumption/);
   assert.equal((await call('/api/context?family=note&id='+noteId,undefined,'other-owner')).status,404);
  });
  await t.test('lost acknowledgement retry preserves the same original and rejects different payload',async()=>{
   const replay=await call('/api/learning-updates',first);assert.equal(replay.status,200);assert.equal(replay.data.replayed,true);
   assert.equal(replay.data.note.id,noteId);
   const mismatch=await call('/api/learning-updates',make('pr79-original-update','Different words, forbidden operation reuse'));
   assert.equal(mismatch.status,409);assert.equal(mismatch.data.code,'idempotency_mismatch');
   const counts=await db.prepare('SELECT (SELECT count(*) FROM v2_records WHERE owner=? AND family=\'note\') notes,(SELECT count(*) FROM v2_learning_developments WHERE owner=?) developments').bind('fictional-learner','fictional-learner').first();
   assert.deepEqual([counts.notes,counts.developments],[1,1]);
  });
  await t.test('no phantom link or silent supersession can be smuggled into the approved save',async()=>{
   const rejected=make('pr79-bad-link');
   rejected.proposed.proposedRelations=[{accepted:true,to:{family:'work',id:'not-owned'},relation:'related'}];
   const result=await call('/api/learning-updates',rejected);
   assert.equal(result.status,409);
   const bad=make('pr79-bad-supersession');
   bad.proposed.development.supersedesId=devId;
   assert.equal((await call('/api/learning-updates',bad)).status,400);
  });
  await t.test('a failed middle SQL write rolls back the original, semantic event and receipt together',async()=>{
   await db.exec("CREATE TRIGGER pr79_block_update BEFORE INSERT ON v2_learning_developments WHEN NEW.last_operation='pr79-forced-fault' BEGIN SELECT RAISE(ABORT,'PR79 deliberate disposable fault'); END");
   const fault=await call('/api/learning-updates',make('pr79-forced-fault'));
   assert.notEqual(fault.status,200);
   assert.equal((await db.prepare("SELECT count(*) count FROM v2_records WHERE owner=? AND last_operation='pr79-forced-fault'").bind('fictional-learner').first()).count,0);
   assert.equal((await db.prepare("SELECT count(*) count FROM v2_operations WHERE owner=? AND id='pr79-forced-fault'").bind('fictional-learner').first()).count,0);
   await db.exec('DROP TRIGGER pr79_block_update');
  });
 }finally{await mf.dispose();}
});
