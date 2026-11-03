import {test} from 'node:test';import assert from 'node:assert/strict';import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const content=(id,text)=>({id,title:'Actual work',parts:[{id:'p-'+id,kind:'paragraph',text}]});
const composition={version:1,sections:[{id:'workspace',title:'',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['work']}]}],blocks:[{id:'work',sectionId:'work'}]};
async function setup(){const f=await privateStorageFixture(worker),c=f.client('project-owner');return {f,c,request:{operationId:'create-project',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:0,title:'TCP investigation',description:'Byte streams and connection failures',body:'An open investigation.',contentSections:[content('work','Learner-reported output; not independently verified.')],composition}};}
async function apply(c,r){return c.request('/api/projects/update',r);}
async function mcp(c,name,args){return c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Owner requested Project update',...args}}});}
function value(result){return result.data.result?.structuredContent??JSON.parse(result.data.result?.content?.find(c=>c.type==='text')?.text??'{}');}
test('Project MCP catalogue and real create/read/update loop; retry and mismatch; source editions unchanged by arrangement',async()=>{const {f,c,request}=await setup();try{
 const tools=await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'});assert.ok(tools.data.result.tools.some(t=>t.name==='apply_project_update'));
 const caps=value(await mcp(c,'get_layout_capabilities',{}));assert.equal(caps.patterns.length,6);
 const made=await mcp(c,'apply_project_update',request),receipt=value(made);assert.equal(receipt.status,'committed',JSON.stringify(made.data));assert.equal(receipt.record.sections[0].parts[0].text,request.contentSections[0].parts[0].text);
 const replay=value(await mcp(c,'apply_project_update',request));assert.equal(replay.replayed,true);
 const mismatch=await mcp(c,'apply_project_update',{...request,title:'Different'});assert.ok(mismatch.data.result.isError||mismatch.data.error);
 const initial=receipt.record,changed=await apply(c,{operationId:'arrange',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:1,composition:{...composition,sections:[{...composition.sections[0],pattern:'workbench'}]}});assert.equal(changed.data.record.rendition,initial.rendition);assert.equal(changed.data.record.rev,2);
 const context=await c.request('/api/projects/composition?projectId=tcp');assert.equal(context.status,200);assert.equal(context.data.composition.sections[0].pattern,'workbench');assert.deepEqual(context.data.history,[2,1]);
 const denied=await f.client('different-owner').request('/api/projects/composition?projectId=tcp');assert.equal(denied.status,404);
 const stale=await apply(c,{...request,operationId:'stale',expectedProjectRev:1});assert.equal(stale.status,409);assert.equal((await c.context('journey','tcp')).data.record.rev,2);
 }finally{await f.dispose();}});
test('Direct edits survive GPT updates; explicit targeted override; atomic rollback and exact historical arrangement restore',async()=>{const {f,c,request}=await setup();try{
 let record=(await apply(c,request)).data.record;
 const ordinary={operationId:'gpt-edit',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:record.rev,contentSections:[content('work','Replacement')]};
 // The native HTTP edit is user-authored and therefore protected.
 const refused=value(await mcp(c,'apply_project_update',ordinary));assert.equal(refused.code??refused.error?.code,'learner_edit_preserved',JSON.stringify(refused));
 const explicit=value(await mcp(c,'apply_project_update',{...ordinary,operationId:'explicit-edit',explicitOverrideIds:['work']}));assert.equal(explicit.status,'committed');assert.equal(explicit.record.sections[0].parts[0].text,'Replacement');
 await f.db.exec("CREATE TRIGGER fail_project_history BEFORE INSERT ON v2_revisions WHEN NEW.id='tcp' AND NEW.revision=3 BEGIN SELECT RAISE(ABORT,'late failure'); END");
 const failed=await apply(c,{operationId:'failing-edit',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:2,title:'Must roll back'});assert.ok(failed.status>=400);assert.equal((await c.context('journey','tcp')).data.record.rev,2);assert.equal(await f.db.prepare('SELECT id FROM v2_operations WHERE owner=? AND id=?').bind(c.owner,'failing-edit').first(),null);
 await f.db.exec('DROP TRIGGER fail_project_history');
 const restored=await apply(c,{operationId:'restore-layout',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:2,restoreRevision:1});assert.equal(restored.data.record.sections[0].parts[0].text,'Replacement');assert.equal(restored.data.record.rev,3);
 }finally{await f.dispose();}});
test('One Note pins to two pages, duplicate retry, one unpin, unchanged prose/rendition and exact retained reference admission',async()=>{const {f,c,request}=await setup();try{
 const project=(await apply(c,request)).data.record;let note=(await c.command({action:'create',family:'note',id:'notes',data:{title:'Working notes',body:'Keep this prose.'}})).data.record;
 const a={family:'journey',id:'tcp'},b={family:'journey',id:'tcp',rendition:project.rendition,sectionId:'work'};
 const pin={operationId:'pin-a',expectedGeneration:c.generation,noteId:note.id,expectedNoteRev:note.rev,target:a,pinned:true};
 let saved=await c.request('/api/notes/pin',pin);assert.equal(saved.data.status,'committed');note=saved.data.record;assert.equal(note.rendition,(await c.context('note','notes',note.rendition)).data.record.rendition);assert.equal((await c.request('/api/notes/pin',pin)).data.replayed,true);
 saved=await c.request('/api/notes/pin',{...pin,operationId:'pin-b',expectedNoteRev:note.rev,target:b});note=saved.data.record;assert.equal(note.pagePins.length,2);
 const pinned=await c.request('/api/notes/pins',{target:a});assert.equal(pinned.data.notes.length,1);
 saved=await c.request('/api/notes/pin',{...pin,operationId:'unpin-a',expectedNoteRev:note.rev,pinned:false});note=saved.data.record;assert.deepEqual(note.pagePins,[b]);assert.equal(note.body,'Keep this prose.');assert.equal((await c.request('/api/notes/pins',{target:a})).data.notes.length,0);
 const denied=await c.request('/api/notes/pin',{...pin,operationId:'denied-pin',expectedNoteRev:note.rev,target:{family:'note',id:'not-owned'}});assert.equal(denied.status,409);assert.equal((await c.context('note','notes')).data.record.rev,note.rev);
 }finally{await f.dispose();}});
test('Atomic Project plus Note content and late failure rollback, real MCP authoring and retained-source reads',async()=>{const {f,c,request}=await setup();try{
 const refComposition={...composition,blocks:[...composition.blocks,{id:'inline-note',ref:{family:'note',id:'new-note'}}],sections:[{...composition.sections[0],slots:[{id:'primary',role:'primary',blockIds:['work','inline-note']}]}]};
 const combined={...request,composition:refComposition,noteChanges:[{id:'new-note',expectedRev:0,title:'Investigation notes',body:'A reported observation, not a verified test.'}]};
 const receipt=value(await mcp(c,'apply_project_update',combined));assert.equal(receipt.status,'committed',JSON.stringify(receipt));assert.equal(receipt.recordRefs.length,2);
 const context=await c.request('/api/projects/composition?projectId=tcp');assert.equal(context.data.references[0].record.body,combined.noteChanges[0].body);
 assert.equal(value(await mcp(c,'apply_project_update',combined)).replayed,true);
 await f.db.exec("CREATE TRIGGER fail_combined_activity BEFORE INSERT ON v2_activity WHEN NEW.id LIKE 'combined-fail:%' BEGIN SELECT RAISE(ABORT,'late combined failure'); END");
 const failed=await apply(c,{operationId:'combined-fail',expectedGeneration:c.generation,projectId:'tcp',expectedProjectRev:1,title:'Must not persist',noteChanges:[{id:'new-note',expectedRev:1,title:'Also must not persist',body:'Changed'}]});assert.equal(failed.status,409,JSON.stringify(failed.data));assert.equal((await c.context('journey','tcp')).data.record.title,request.title);assert.equal((await c.context('note','new-note')).data.record.rev,1);assert.equal(await f.db.prepare('SELECT id FROM v2_operations WHERE owner=? AND id=?').bind(c.owner,'combined-fail').first(),null);
 }finally{await f.dispose();}});
test('Portable recovery round trip retains composition, description, edit protection and Note page pins',async()=>{const {f,c,request}=await setup();try{
 await apply(c,request);const note=(await c.command({action:'create',family:'note',id:'portable-note',data:{title:'Portable Note',body:'Preserved prose'}})).data.record;
 await c.request('/api/notes/pin',{operationId:'portable-pin',expectedGeneration:c.generation,noteId:note.id,expectedNoteRev:note.rev,target:{family:'journey',id:'tcp'},pinned:true});
 const passphrase='Synthetic-portable-passphrase',exported=await c.request('/api/recovery/export',{operationId:'export-project',expectedGeneration:c.generation,passphrase});assert.equal(exported.status,200,JSON.stringify(exported.data));
 const {decodeBundleFixture,encodeBundleFixture}=await import('./portable-bundle-fixture.mjs'),decoded=decodeBundleFixture(Buffer.from(exported.data),passphrase);
 const row=decoded.manifest.tables.v2_records.find(r=>r.family==='journey');assert.equal(JSON.parse(row.data).projectDescription,request.description);assert.equal(JSON.parse(row.data).projectComposition.version,1);
 const meta=Buffer.from(JSON.stringify({operationId:'import-project',expectedGeneration:c.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(meta.length);
 const imported=await c.request('/api/recovery/import',Buffer.concat([prefix,meta,encodeBundleFixture(decoded,passphrase)]),{raw:true,headers:{'content-type':'application/octet-stream'}});assert.equal(imported.status,200,JSON.stringify(imported.data));
 const namespace=(await f.db.prepare('SELECT namespace FROM v2_recovery_stages WHERE owner=? AND id=?').bind(c.owner,imported.data.staged.id).first()).namespace;const recovered=JSON.parse((await f.db.prepare("SELECT data FROM v2_records WHERE owner=? AND family='note' AND id='portable-note'").bind(namespace).first()).data);assert.equal(recovered.pagePins.length,1);assert.equal(recovered.body,'Preserved prose');
 }finally{await f.dispose();}});
