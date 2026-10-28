import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:`
import {domainHandler} from './lib/domain-handler.ts';
import {publishManuscript} from './lib/manuscript.ts';
import {executeCommand} from './lib/domain.ts';
import {resolveGeneration,withGeneration} from './lib/generations.ts';
export default {async fetch(request,env){
 if(new URL(request.url).pathname!=='/test-manuscript-race')return domainHandler(request,env);
 const input=await request.json(),owner=request.headers.get('oai-authenticated-user-id'),generation=await resolveGeneration(env,owner);let injected=false;
 const scoped=withGeneration({...env,DB:{prepare:sql=>env.DB.prepare(sql),batch:async statements=>{
  injected=true;
  if(input.change)await executeCommand(env,owner,input.change,'user');
  if(input.swapGeneration)await env.DB.prepare("INSERT INTO v2_generation_heads(owner,generation_id,revision,namespace) VALUES(?,'manuscript-swap',1,?)").bind(owner,owner+'-swapped').run();
  return env.DB.batch(statements);
 }}},generation);
 try{return Response.json({receipt:await publishManuscript(scoped,owner,input.manuscript,'gpt'),injected})}
 catch(error){return Response.json({code:error.code,injected},{status:error.status??500})}
}}`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
const originalBrief=('Create substantial learning material from this original request. Keep the explanation, runnable isolated examples, optional unanswered inquiry and independent reference purpose intact. ').repeat(5);
const originalMarkdown='# TEST ONLY — Count arrivals 🐈\r\n\r\n## Keep first-seen order\r\n\r\nIntent: Compare membership with append order.\r\n\r\nOutcome: A deduplicated list that preserves the first arrival of each value.\r\n\r\nCheckpoint: Explain why sorting would answer a different question.\r\n\r\nUse **one *nested* emphasis** and `seen` to distinguish membership from output order. Read [the mechanism](minamo:reference).\r\n\r\n```python\r\nvalues = ["disk", "timeout", "disk"]\r\nseen = set()\r\nordered = []\r\nfor value in values:\r\n    if value not in seen:\r\n        seen.add(value)\r\n        ordered.append(value)\r\nprint(ordered)\r\n```\r\n\r\n| Item | Meaning |\r\n|---|---|\r\n| 🐈 | **Two UTF16 code units** |\r\n\r\n<script>globalThis.unsafe = true</script>\r\n\r\n```mermaid\r\ngraph LR\r\nA --> B\r\nB --> A\r\n```\r\n';
function manuscript(operationId,documents){return {purpose:'TEST ONLY full manuscript integration',operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:originalBrief,documents:documents??[
 {key:'route',role:'journey',markdown:originalMarkdown},
 {key:'reference',role:'article',markdown:'# TEST ONLY — Membership and ordering\n\nMembership asks whether a value is present. Ordering asks which value appears first. A set supports membership without promising an insertion-order reading contract; a separate list makes that output contract explicit. This explanation applies to message processing and deduplicating filenames as well as the Journey.\n\n[Python sets](https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset) is a link-only reference; its content was not imported.\n\n```graph-v1\n{"format":"graph-v1","nodes":[{"id":"A","label":"Kitchen"},{"id":"B","label":"Hall"}],"edges":[{"from":"A","to":"B"},{"from":"B","to":"A"}]}\n```'},
 {key:'inquiry',role:'investigation',markdown:'# TEST ONLY — When would arrival order stop being reliable?\n\nCompare two independently produced streams. Predict which ordering guarantees remain when network delay changes. Propose observations before writing any conclusions; no trial is claimed here.'},
 {key:'area',role:'area',markdown:'# TEST ONLY — Data representation\n\nA reusable grouping for collection semantics, independent of any one project.'}
]}}}

test('text-first manuscript actual Worker/MCP/D1 transaction and retained source guarantees',async t=>{
 const mf=new Miniflare({modules:true,script:compiled.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET'],cf:false});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const headers={'oai-authenticated-user-id':'manuscript-synthetic-owner','oai-authenticated-user-email':'test@example.invalid','Content-Type':'application/json','X-Minamo-Generation':'legacy@0'};
  const request=async(path,body,extra={})=>{const r=await mf.dispatchFetch('https://v2.test'+path,{method:body===undefined?'GET':'POST',headers:{...headers,...extra},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json()}};
  const mcp=async(name,args,extra={})=>{const r=await request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY manuscript integration',...args}}},extra);return JSON.parse(r.data.result.content[0].text)};
  const counts=async()=>Object.fromEntries(await Promise.all(['v2_records','v2_revisions','v2_activity','v2_operations','v2_manuscript_editions'].map(async table=>[table,(await db.prepare('SELECT COUNT(*) n FROM '+table).first()).n])));
  const valid=manuscript('manuscript-integration');let receipt,route,reference;
  await t.test('optional preview compiles all roles, explicit graph and rich inline without any persistence',async()=>{
   const before=await counts();const preview=await mcp('preview_minamo_manuscript',{...valid,detail:true});assert.equal(preview.valid,true,JSON.stringify(preview));assert.equal(preview.proposedRecords.length,4);assert.deepEqual(await counts(),before);
   const route=preview.proposedRecords.find(r=>r.family==='journey');assert.ok(route.sections.some(s=>s.parts.some(p=>p.inline?.some(s=>s.kind==='strong'))));
   assert.ok(route.sections.some(s=>s.parts.some(p=>p.kind==='diagram'&&p.diagram?.format==='graph-v1'&&p.diagram.edges.length===2)));assert.equal(preview.warnings.some(w=>w.code==='diagram_fallback'),false);assert.ok(preview.warnings.some(w=>w.code==='unsupported_block'));
  });
  await t.test('one friendly call commits four roles, links, immutable source and receipt',async()=>{
   receipt=await mcp('publish_minamo_manuscript',valid);assert.equal(receipt.status,'committed',JSON.stringify(receipt));assert.equal(receipt.kind,'manuscript-v1');assert.equal(receipt.recordRefs.length,4);assert.equal(receipt.sourceEdition.available,true);assert.match(receipt.sourceEdition.digest,/^[a-f0-9]{64}$/);
   route=(await mcp('read_minamo_record',{family:'journey',id:receipt.recordRefs.find(r=>r.key==='route').id})).record;
   reference=(await mcp('read_minamo_record',{family:'article',id:receipt.recordRefs.find(r=>r.key==='reference').id})).record;
   assert.equal(route.actor,'gpt');assert.equal(route.synthetic,true);assert.equal(route.links[0].id,reference.id);assert.ok(route.links[0].sourceContext.sectionId);
   assert.ok(reference.sections.some(s=>s.parts.some(p=>p.diagram?.format==='graph-v1'&&p.diagram.edges.length===2)));
   assert.equal((await counts()).v2_manuscript_editions,1);
   const source=await mcp('read_minamo_manuscript_source',{operationId:valid.operationId});assert.equal(source.manuscript.brief,originalBrief);assert.ok(originalBrief.length>500);assert.equal(source.manuscript.documents[0].markdown,originalMarkdown);assert.equal(source.digest,receipt.sourceEdition.digest);
  });
  await t.test('same input replays once; changed original brief rejects; operation status recovers source identity',async()=>{
   const before=await counts();assert.equal((await mcp('publish_minamo_manuscript',valid)).replayed,true);assert.deepEqual(await counts(),before);
   const changed=structuredClone(valid);changed.manuscript.brief+=' Changed intent.';assert.equal((await mcp('publish_minamo_manuscript',changed)).code,'idempotency_mismatch');
   const recovered=await mcp('read_minamo_operation',{operationId:valid.operationId});assert.equal(recovered.kind,'manuscript-v1');assert.equal(recovered.sourceEdition.digest,receipt.sourceEdition.digest);assert.equal(recovered.recordRefs.length,4);
  });
  await t.test('canonical edit preserves archived original source and retained historical text',async()=>{
   const part=reference.sections[0].parts.find(p=>p.kind==='paragraph');
   const edited=await request('/api/commands',{operationId:'manuscript-canonical-edit',action:'update',family:'article',id:reference.id,expectedRev:reference.rev,data:{patch:[{op:'patchBlock',sectionId:reference.sections[0].id,partId:part.id,changes:{text:'A revised independent explanation; the original authored edition remains historical.'}}]}});assert.equal(edited.status,200,JSON.stringify(edited));
   const source=await mcp('read_minamo_manuscript_source',{operationId:valid.operationId});assert.equal(source.manuscript.documents[1].markdown,valid.manuscript.documents[1].markdown);assert.equal(source.recordRefs.find(r=>r.key==='reference').stillCurrent,false);
   const retained=await mcp('read_minamo_record',{family:'article',id:reference.id,rendition:reference.rendition});assert.equal(retained.record.sections[0].parts.find(p=>p.id===part.id).text,part.text);
  });
  await t.test('other principal cannot read immutable source or records and generation mismatch writes nothing',async()=>{
   const other={'oai-authenticated-user-id':'another-synthetic-owner'};
   assert.equal((await mcp('read_minamo_manuscript_source',{operationId:valid.operationId},other)).code,'manuscript_source_unavailable');assert.equal((await mcp('read_minamo_record',{family:'journey',id:route.id},other)).code,'record_unavailable');
   const wrong=manuscript('wrong-generation');wrong.expectedGeneration='stale@5';const before=await counts();assert.equal((await mcp('publish_minamo_manuscript',wrong)).code,'generation_conflict');assert.deepEqual(await counts(),before);
  });
  await t.test('failure in member eleven rolls back records/history/activity/receipt/source edition',async()=>{
   const p=manuscript('manuscript-member-eleven',Array.from({length:12},(_,i)=>({key:'doc'+i,role:'article',markdown:'# TEST ONLY — Independent mechanism '+i+'\n\nA controlled original explanation of mechanism '+i+'. No learner execution is claimed.'})));
   const preview=await mcp('preview_minamo_manuscript',p);assert.equal(preview.valid,true,JSON.stringify(preview));const failing=preview.records[10].id;
   await db.prepare("CREATE TRIGGER manuscript_member_eleven BEFORE INSERT ON v2_records WHEN NEW.id='"+failing+"' BEGIN SELECT RAISE(ABORT,'TEST ONLY member eleven failure'); END").run();
   const before=await counts();assert.equal((await mcp('publish_minamo_manuscript',p)).code,'package_conflict');assert.deepEqual(await counts(),before);await db.prepare('DROP TRIGGER manuscript_member_eleven').run();
  });
  await t.test('source store failure cannot leave compiled records or receipt without an edition',async()=>{
   await db.prepare("CREATE TRIGGER manuscript_source_failure BEFORE INSERT ON v2_manuscript_editions WHEN NEW.id='manuscript-source-failure' BEGIN SELECT RAISE(ABORT,'TEST ONLY source insert failure'); END").run();
   const before=await counts();assert.equal((await mcp('publish_minamo_manuscript',manuscript('manuscript-source-failure'))).code,'package_conflict');assert.deepEqual(await counts(),before);await db.prepare('DROP TRIGGER manuscript_source_failure').run();
  });
  await t.test('concurrent identical publication converges to one edition and activity set',async()=>{
   const p=manuscript('manuscript-identical-race'),before=await counts();const results=await Promise.all([mcp('publish_minamo_manuscript',p),mcp('publish_minamo_manuscript',p)]);assert.ok(results.every(r=>r.status==='committed'),JSON.stringify(results));const after=await counts();assert.equal(after.v2_records-before.v2_records,4);assert.equal(after.v2_activity-before.v2_activity,4);assert.equal(after.v2_manuscript_editions-before.v2_manuscript_editions,1);assert.equal(after.v2_operations-before.v2_operations,1);
  });
  await t.test('declared existing reference resolves exact identity and guards its revision without mutation',async()=>{
   const existing=(await mcp('read_minamo_record',{family:'article',id:reference.id})).record;
   const p=manuscript('manuscript-existing-link',[{key:'new-question',role:'investigation',markdown:'# TEST ONLY — How should a stream be compared?\n\nRead [the inspected reference](minamo:article:'+existing.id+'). Propose a comparison without claiming any observed result.'}]);p.existing=[{family:'article',id:existing.id,rev:existing.rev,purpose:'reuse'}];
   const result=await mcp('publish_minamo_manuscript',p);assert.equal(result.status,'committed',JSON.stringify(result));const record=(await mcp('read_minamo_record',{family:'investigation',id:result.recordRefs[0].id})).record;assert.equal(record.links[0].id,existing.id);assert.equal((await mcp('read_minamo_record',{family:'article',id:existing.id})).record.rev,existing.rev);
   const stale=structuredClone(p);stale.operationId='manuscript-stale-existing';stale.existing[0].rev=1;assert.equal((await mcp('publish_minamo_manuscript',stale)).code,'coverage_changed');
  });
  await t.test('compiled Unicode and styled text retain exact passage capture through shared Flag and annotation commands',async()=>{
   const tableSection=route.sections.find(s=>s.parts.some(p=>p.kind==='table')),table=tableSection.parts.find(p=>p.kind==='table'),start=table.text.indexOf('🐈');
   const anchor={articleId:route.id,recordFamily:'journey',rendition:route.rendition,sectionId:tableSection.id,partId:table.id,start,end:start+2,quote:'🐈'};
   const captured=await mcp('apply_minamo_command',{command:{operationId:'manuscript-unicode-flag',action:'setFlag',expectedGeneration:'legacy@0',target:{kind:'passage',anchor},active:true,expectedTargetRev:0}});assert.equal(captured.status,'committed',JSON.stringify(captured));
   const styledSection=route.sections.find(s=>s.parts.some(p=>p.inline?.some(span=>span.kind==='strong'))),styled=styledSection.parts.find(p=>p.inline?.some(span=>span.kind==='strong')),strong=styled.inline.find(span=>span.kind==='strong');
   const annotation=await mcp('apply_minamo_command',{command:{operationId:'manuscript-styled-annotation',action:'create',family:'annotation',id:'manuscript-styled-annotation',expectedGeneration:'legacy@0',data:{title:'TEST ONLY exact styled capture',body:'Original personal thinking on the canonical styled phrase.',synthetic:true,anchor:{articleId:route.id,recordFamily:'journey',rendition:route.rendition,sectionId:styledSection.id,partId:styled.id,start:strong.start,end:strong.end,quote:styled.text.slice(strong.start,strong.end)}}}});assert.equal(annotation.status,'committed',JSON.stringify(annotation));
   const split=await mcp('apply_minamo_command',{command:{operationId:'manuscript-split-surrogate',action:'create',family:'annotation',id:'manuscript-split-surrogate',data:{title:'TEST ONLY reject split emoji',body:'Invalid range',synthetic:true,anchor:{...anchor,start:start+1,quote:table.text.slice(start+1,start+2)}}}});assert.equal(split.code,'invalid_anchor');
  });
  await t.test('archived source follows current eligibility and returns intact after recoverable member restore',async()=>{
   const ref=receipt.recordRefs.find(r=>r.key==='area');const record=(await mcp('read_minamo_record',{family:ref.family,id:ref.id})).record;
   const trash=await request('/api/commands',{operationId:'manuscript-trash-area',action:'trash',family:ref.family,id:ref.id,expectedRev:record.rev});assert.equal(trash.status,200);
   const partial=await mcp('read_minamo_manuscript_source',{operationId:valid.operationId});assert.equal(partial.sourceProjection.partial,true);assert.equal(partial.sourceProjection.omittedDocumentCount,1);assert.equal(partial.manuscript.documents.some(d=>d.key==='area'),false);assert.equal(partial.manuscript.documents[0].markdown,originalMarkdown);assert.notEqual(partial.manuscript.brief,originalBrief);
   const restore=await request('/api/commands',{operationId:'manuscript-restore-area',action:'restore',family:ref.family,id:ref.id,expectedRev:trash.data.record.rev});assert.equal(restore.status,200);
   const source=await request('/api/manuscripts/source?operationId='+valid.operationId);assert.equal(source.status,200);assert.equal(source.data.manuscript.documents[0].markdown,originalMarkdown);assert.equal(source.data.digest,receipt.sourceEdition.digest);
  });
  await t.test('explicit same-role manuscript replacement requires matching exact target and retains source editions and old captures',async()=>{
   const create=manuscript('manuscript-replace-create',[{key:'mechanism',role:'article',markdown:'# TEST ONLY — Stable replacement subject\n\nA **first edition** explains the original mechanism before any revision. It remains a historical reading after replacement.'}]);
   const first=await mcp('publish_minamo_manuscript',create);assert.equal(first.status,'committed',JSON.stringify(first));const oldRef=first.recordRefs[0];assert.equal(oldRef.rev,1);
   const old=(await mcp('read_minamo_record',{family:oldRef.family,id:oldRef.id})).record,section=old.sections[0],part=section.parts[0];
   const anchor={articleId:old.id,recordFamily:'article',rendition:old.rendition,sectionId:section.id,partId:part.id,start:0,end:part.text.length,quote:part.text};
   const annotation=await mcp('apply_minamo_command',{command:{operationId:'manuscript-replacement-capture',action:'create',family:'annotation',id:'manuscript-replacement-capture',data:{title:'TEST ONLY old source capture',body:'Thoughts on the original edition.',synthetic:true,anchor}}});assert.equal(annotation.status,'committed',JSON.stringify(annotation));
   const target={family:'article',id:old.id,rev:old.rev};
   const replacement=manuscript('manuscript-replace-update',[{key:'mechanism',role:'article',target,markdown:'# TEST ONLY — Stable replacement subject\n\nA **second edition** replaces the current explanation under an explicit exact target. Historical text is retained rather than rewritten.'}]);replacement.existing=[{...target,purpose:'targeted-update'}];
   const before=await counts();const updated=await mcp('publish_minamo_manuscript',replacement);assert.equal(updated.status,'committed',JSON.stringify(updated));assert.equal(updated.recordRefs[0].id,old.id);assert.equal(updated.recordRefs[0].rev,2);assert.notEqual(updated.recordRefs[0].rendition,old.rendition);assert.equal((await counts()).v2_records,before.v2_records);assert.equal((await counts()).v2_manuscript_editions,before.v2_manuscript_editions+1);
   const originalSource=await mcp('read_minamo_manuscript_source',{operationId:create.operationId});const newSource=await mcp('read_minamo_manuscript_source',{operationId:replacement.operationId});assert.equal(originalSource.manuscript.documents[0].markdown,create.manuscript.documents[0].markdown);assert.equal(originalSource.recordRefs[0].rev,1);assert.equal(originalSource.recordRefs[0].stillCurrent,false);assert.equal(newSource.recordRefs[0].rev,2);assert.equal(newSource.recordRefs[0].stillCurrent,true);assert.deepEqual(newSource.manuscript.documents[0].target,target);
   const historical=await mcp('read_minamo_record',{family:'article',id:old.id,rendition:old.rendition});assert.equal(historical.record.sections[0].parts[0].text,part.text);
   const retainedCapture=await mcp('read_minamo_record',{family:'annotation',id:'manuscript-replacement-capture'});assert.deepEqual(retainedCapture.record.anchor,anchor);
   const sourceCompiled=await build({stdin:{contents:"export {validManuscriptEditionRow} from './lib/manuscript-source.ts';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});const {validManuscriptEditionRow}=await import('data:text/javascript;base64,'+Buffer.from(sourceCompiled.outputFiles[0].text).toString('base64'));
   const row=await db.prepare('SELECT id,digest,source,refs,created_at FROM v2_manuscript_editions WHERE owner=? AND id=?').bind('manuscript-synthetic-owner',replacement.operationId).first();assert.equal(await validManuscriptEditionRow(row),true,'recovery validator accepts source edition with explicit target');const tampered={...row,source:row.source.replace('second edition','unattested change')};assert.equal(await validManuscriptEditionRow(tampered),false,'source digest detects replacement source corruption');
   const stale=structuredClone(replacement);stale.operationId='manuscript-replace-stale';const stableCounts=await counts();assert.equal((await mcp('publish_minamo_manuscript',stale)).code,'coverage_changed');assert.deepEqual(await counts(),stableCounts);
   const absent=structuredClone(replacement);absent.operationId='manuscript-replace-no-target';delete absent.manuscript.documents[0].target;assert.equal((await mcp('publish_minamo_manuscript',absent)).code,'explicit_update_required');
   const unconfirmed=structuredClone(replacement);unconfirmed.operationId='manuscript-replace-unconfirmed';delete unconfirmed.existing;assert.equal((await mcp('publish_minamo_manuscript',unconfirmed)).code,'explicit_update_required');
   const wrongRole=structuredClone(replacement);wrongRole.operationId='manuscript-replace-role';wrongRole.manuscript.documents[0].role='journey';assert.equal((await mcp('publish_minamo_manuscript',wrongRole)).code,'explicit_update_required');
  });
  await t.test('text patches clear inherited rich spans on shorter or same-length replacement and preserve explicit new styling',async()=>{
   const authored=manuscript('manuscript-inline-patch-create',[{key:'styling',role:'article',markdown:'# TEST ONLY — Inline patch continuity\n\nRead **the original explanation** before [the reference](https://docs.python.org/3/).'}]);
   const created=await mcp('publish_minamo_manuscript',authored);assert.equal(created.status,'committed',JSON.stringify(created));const original=(await mcp('read_minamo_record',{family:'article',id:created.recordRefs[0].id})).record,section=original.sections[0],part=section.parts[0],originalSpans=structuredClone(part.inline);assert.ok(originalSpans.some(s=>s.kind==='strong'));assert.ok(originalSpans.some(s=>s.kind==='link'));
   const patch=async(operationId,rev,changes)=>request('/api/commands',{operationId,action:'update',family:'article',id:original.id,expectedRev:rev,data:{patch:[{op:'patchBlock',sectionId:section.id,partId:part.id,changes}]}});
   const shortened=await patch('manuscript-inline-patch-short',original.rev,{text:'Short.'});assert.equal(shortened.status,200,JSON.stringify(shortened));assert.deepEqual(shortened.data.record.sections[0].parts[0].inline,[]);assert.equal(shortened.data.record.sections[0].parts[0].text,'Short.');
   const retained=await mcp('read_minamo_record',{family:'article',id:original.id,rendition:original.rendition});assert.equal(retained.record.sections[0].parts[0].text,part.text);assert.deepEqual(retained.record.sections[0].parts[0].inline,originalSpans);
   const freshSpans=[{start:0,end:5,kind:'strong'}];const explicit=await patch('manuscript-inline-patch-fresh',shortened.data.record.rev,{text:'Fresh',inline:freshSpans});assert.equal(explicit.status,200,JSON.stringify(explicit));assert.deepEqual(explicit.data.record.sections[0].parts[0].inline,freshSpans);
   const sameLength=await patch('manuscript-inline-patch-same-length',explicit.data.record.rev,{text:'Other'});assert.equal(sameLength.status,200,JSON.stringify(sameLength));assert.equal(sameLength.data.record.sections[0].parts[0].text.length,explicit.data.record.sections[0].parts[0].text.length);assert.deepEqual(sameLength.data.record.sections[0].parts[0].inline,[]);
   const explicitEdition=await mcp('read_minamo_record',{family:'article',id:original.id,rendition:explicit.data.record.rendition});assert.equal(explicitEdition.record.sections[0].parts[0].text,'Fresh');assert.deepEqual(explicitEdition.record.sections[0].parts[0].inline,freshSpans);
  });
  await t.test('target revision race after preparation rolls back every manuscript artefact',async()=>{
   const p=manuscript('manuscript-target-race');const current=(await mcp('read_minamo_record',{family:'article',id:reference.id})).record;p.existing=[{family:'article',id:current.id,rev:current.rev,purpose:'reuse'}];
   const before=await counts();const result=await request('/test-manuscript-race',{manuscript:p,change:{operationId:'manuscript-race-existing-edit',action:'update',family:'article',id:current.id,expectedRev:current.rev,data:{title:current.title+' revised'}}});assert.equal(result.data.injected,true);assert.equal(result.data.code,'package_conflict',JSON.stringify(result));const after=await counts();assert.equal(after.v2_records,before.v2_records);assert.equal(after.v2_manuscript_editions,before.v2_manuscript_editions);assert.equal(after.v2_operations,before.v2_operations+1);assert.equal((await db.prepare("SELECT COUNT(*) n FROM v2_operations WHERE id='manuscript-target-race'").first()).n,0);
  });
  await t.test('generation swap at D1 batch prevents all source/record/history/receipt writes',async()=>{
   const before=await counts();const result=await request('/test-manuscript-race',{manuscript:manuscript('manuscript-generation-race'),swapGeneration:true});assert.equal(result.data.injected,true);assert.equal(result.data.code,'generation_conflict',JSON.stringify(result));assert.deepEqual(await counts(),before);
  });
 }finally{await mf.dispose()}
});
