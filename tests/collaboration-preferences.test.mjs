import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const defaultValues={version:1,contextDepth:'balanced',relatedMaterial:'saved',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'};
const concise={contextDepth:'concise',relatedMaterial:'none',initiative:'offer',authoringDetail:'concise',projectEditing:'direct',mcpTools:'authoring'};
const write=(client,operationId,values,extras={})=>client.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'global',expectedGeneration:client.generation,expectedRevision:0,operationId,values,...extras});
const mcp=(client,name,args)=>client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'Owner-requested lab preference acceptance',...args}}});
const ok=async pending=>{const r=await pending;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};

test('owner-scoped global settings survive fresh reads, report revisions and reject stale or implicit writes',{timeout:90000},async()=>{
 const fixture=await privateStorageFixture(worker);try{
  const owner=fixture.client('prefs-owner'),other=fixture.client('prefs-neighbour');
  assert.deepEqual((await ok(owner.request('/api/collaboration-preferences'))).effective,defaultValues);
  assert.equal((await owner.request('/api/collaboration-preferences',{scope:'global',expectedRevision:0,operationId:'implicit',values:concise})).status,400);
  const saved=await ok(write(owner,'prefs-first',concise));
  assert.equal(saved.revision,1);assert.equal(saved.replayed,false);
  assert.deepEqual((await ok(owner.request('/api/collaboration-preferences'))).effective,{version:1,...concise});
  assert.deepEqual((await ok(fixture.client('prefs-owner').request('/api/collaboration-preferences'))).effective,{version:1,...concise},'new MCP/browser client with same owner inherits settings');
  assert.deepEqual((await ok(other.request('/api/collaboration-preferences'))).effective,defaultValues);
  const replay=await ok(write(owner,'prefs-first',concise));assert.equal(replay.replayed,true);assert.equal(replay.revision,1);
  assert.equal((await write(owner,'prefs-first',{...concise,initiative:'requested'})).status,409,'operation ID cannot change immutable payload');
  assert.equal((await write(owner,'prefs-stale',concise)).status,409,'a new operation with stale revision is denied');
  assert.equal((await other.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'global',expectedGeneration:other.generation,expectedRevision:0,operationId:'owner-two',values:{contextDepth:'detailed',relatedMaterial:'saved',initiative:'requested'}})).status,400,'new global writes require both authoring options');
  assert.equal((await other.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'global',expectedGeneration:other.generation,expectedRevision:0,operationId:'owner-two-valid',values:{contextDepth:'detailed',relatedMaterial:'saved',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'}})).status,200);
  assert.deepEqual((await ok(owner.request('/api/collaboration-preferences'))).effective,{version:1,...concise},'neighbour writes cannot leak');
  assert.equal((await owner.request('/api/collaboration-preferences',undefined,{headers:{'oai-authenticated-user-id':'','oai-authenticated-user-email':''}})).status,401);
 }finally{await fixture.dispose();}
});

test('project override is exact, scoped, revisioned and inherited only by that Project',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const client=f.client('prefs-project-owner'),other=f.client('prefs-project-other');
  await ok(write(client,'prefs-global',concise));
  const project=(await ok(client.command({action:'create',family:'journey',id:'prefs-project',data:{title:'A deep computing Project',body:'An ongoing question.',synthetic:false}}))).record;
  const writeProject=(operationId,revision,values)=>client.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'project',projectId:project.id,expectedGeneration:client.generation,expectedRevision:revision,operationId,values});
  assert.equal((await writeProject('bad-project',0,{contextDepth:'detailed',unknown:true})).status,400);
  const saved=await ok(writeProject('project-override',0,{contextDepth:'detailed',relatedMaterial:'saved'}));assert.equal(saved.revision,1);
  const settings=await ok(client.request('/api/collaboration-preferences?projectId='+project.id));
  assert.equal(settings.project.revision,1);assert.deepEqual(settings.project.overrides,{contextDepth:'detailed',relatedMaterial:'saved'});
  assert.deepEqual(settings.effective,{version:1,contextDepth:'detailed',relatedMaterial:'saved',initiative:'offer',authoringDetail:'concise',projectEditing:'direct',mcpTools:'authoring'},'global and Project preferences compose');
  assert.equal((await writeProject('bad-global-only',1,{mcpTools:'read-only'})).status,400,'an individual Project cannot alter the owner-global MCP catalogue');
  assert.equal((await other.request('/api/collaboration-preferences?projectId='+project.id)).status,404,'foreign Project override read denied');
  assert.equal((await other.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'project',projectId:project.id,expectedGeneration:other.generation,expectedRevision:0,operationId:'foreign-project',values:{contextDepth:'detailed'}})).status,404);
  assert.equal((await writeProject('project-stale',0,{contextDepth:'concise'})).status,409);
  assert.equal((await ok(client.request('/api/collaboration-preferences'))).effective.contextDepth,'concise','Project override does not rewrite global default');
 }finally{await f.dispose();}
});

test('context preferences change admitted working-context evidence without changing the authoring-mode MCP catalogue',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('prefs-context-owner');
  const target=(await ok(c.command({action:'create',family:'note',id:'prefs-target',data:{title:'Target Note',body:'A saved reason.',synthetic:false}}))).record;
  const hub=(await ok(c.command({action:'create',family:'note',id:'prefs-hub',data:{title:'Hub Note',body:'An initial claim with some description.',links:[{family:'note',id:target.id}],synthetic:false}}))).record;
  const tools=await ok(c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/list'}));
  const names=tools.result.tools.map(t=>t.name);
  for(const name of ['get_minamo_collaboration_preferences','set_minamo_collaboration_preferences','get_minamo_working_context'])assert.ok(names.includes(name));
  const first=await ok(mcp(c,'get_minamo_working_context',{selectedRefs:[{family:'note',id:hub.id}]}));
  assert.equal(first.result.isError,false);assert.equal(first.result.structuredContent.collaboration.evidenceLimit,12);
  assert.ok(first.result.structuredContent.relations.some(edge=>edge.to.id===target.id));
  const saved=await ok(mcp(c,'set_minamo_collaboration_preferences',{scope:'global',intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:0,operationId:'mcp-preferences',values:concise}));
  assert.equal(saved.result.isError,false);
  const fromMcp=await ok(mcp(c,'get_minamo_collaboration_preferences',{}));
  assert.deepEqual(fromMcp.result.structuredContent.effective,{version:1,...concise});
  const next=await ok(mcp(c,'get_minamo_working_context',{selectedRefs:[{family:'note',id:hub.id}],limit:20}));
  assert.equal(next.result.structuredContent.collaboration.evidenceLimit,5,'preference limits even an explicit larger page request');
  assert.deepEqual(next.result.structuredContent.relations,[],'explicit selected Note remains visible while optional links are suppressed');
  assert.equal(next.result.structuredContent.selected[0].status,'available');
  assert.ok(next.result.structuredContent.coverage.gaps.includes('related-material-disabled-by-preference'));
  assert.deepEqual((await ok(c.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/list'}))).result.tools.map(t=>t.name),names,'preferences never silently hide tools before client refresh');
  const blocked=await ok(mcp(c,'set_minamo_collaboration_preferences',{scope:'global',expectedGeneration:c.generation,expectedRevision:1,operationId:'implicit-write',values:concise}));
  assert.equal(blocked.result.isError,true,'an MCP write without explicit intent fails');
 }finally{await f.dispose();}
});

test('a Project focused MCP read with saved links hidden withholds inbound writing, not the explicitly selected Project',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('prefs-focused-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'prefs-focused-project',data:{title:'Resolver questions',body:'Only the saved Project text is explicitly requested.',synthetic:false}}))).record;
  const note=(await ok(c.command({action:'create',family:'note',id:'prefs-linked-note',data:{title:'Why the answer was ambiguous',body:'Private inbound writing that should be hidden by the related-material setting.',synthetic:false,pagePins:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record;
  const focus={family:'journey',id:project.id};
  const prior=await ok(mcp(c,'get_minamo_working_context',{focus}));
  assert.equal(prior.result.isError,false);
  assert.ok(prior.result.structuredContent.evidence.items.some(item=>item.source.id===note.id),'the saved inbound Note is normally admitted');
  await ok(write(c,'prefs-hide-inbound',{contextDepth:'balanced',relatedMaterial:'none',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'}));
  const hidden=await ok(mcp(c,'get_minamo_working_context',{focus}));
  assert.equal(hidden.result.isError,false);
  const page=hidden.result.structuredContent;
  assert.equal(page.selected[0].source.id,project.id);
  assert.deepEqual(page.relations,[]);
  assert.deepEqual(page.evidence.items,[],'focused linked evidence is not an alternate path around a hidden-relationships preference');
  assert.equal(page.coverage.completeWithinScope,false,'a preference-limited read is not complete evidence');
  assert.ok(page.coverage.gaps.includes('related-material-disabled-by-preference'));
  assert.doesNotMatch(JSON.stringify(page),/Private inbound writing that should be hidden/);
  const direct=await ok(mcp(c,'get_minamo_working_context',{focus,selectedRefs:[{family:'note',id:note.id}]}));
  assert.equal(direct.result.structuredContent.selected[0].source.id,note.id,'a deliberate exact selection is distinct from discovery of related material');
  assert.deepEqual(direct.result.structuredContent.evidence.items,[]);
  assert.equal((await mcp(c,'get_minamo_working_context',{focus,cursor:'invalid-under-hidden-policy'})).data.result.isError,true,'hidden evidence cursors cannot bypass the policy');
  await ok(c.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'global',expectedGeneration:c.generation,expectedRevision:1,operationId:'prefs-restore-global',values:{contextDepth:'balanced',relatedMaterial:'saved',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'}}));
  await ok(c.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'project',projectId:project.id,expectedGeneration:c.generation,expectedRevision:0,operationId:'prefs-hide-project-only',values:{relatedMaterial:'none'}}));
  const projectOnly=await ok(mcp(c,'get_minamo_working_context',{focus}));
  assert.deepEqual(projectOnly.result.structuredContent.evidence.items,[],'the per-Project override also governs the focused MCP evidence feed');
  assert.equal((await ok(mcp(c,'get_minamo_working_context',{selectedRefs:[{family:'note',id:note.id}]}))).result.structuredContent.collaboration.effective.relatedMaterial,'saved','outside that Project, global retrieval policy remains in force');
 }finally{await f.dispose();}
});

test('Project authoring preferences guide context and enforce previews-only without blocking website edits',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('prefs-edit-owner'),other=f.client('prefs-edit-neighbour');
  const base={projectId:'prefs-edit-project',expectedGeneration:c.generation};
  const first=await ok(mcp(c,'apply_project_update',{...base,operationId:'edit-create',expectedProjectRev:0,title:'An unresolved DNS investigation',body:'A question about why the resolver differs across networks.'}));
  assert.equal(first.result.structuredContent.status,'committed');
  const pause={contextDepth:'balanced',relatedMaterial:'saved',initiative:'requested',authoringDetail:'detailed',projectEditing:'preview-only',mcpTools:'authoring'};
  await ok(write(c,'prefs-preview-only',pause));
  const settings=(await ok(mcp(c,'get_minamo_collaboration_preferences',{projectId:base.projectId}))).result.structuredContent;
  assert.equal(settings.effective.authoringDetail,'detailed');
  assert.equal(settings.effective.projectEditing,'preview-only');
  assert.match(settings.authoring.detail,/substantive explanations/);
  const editorial=await ok(mcp(c,'get_minamo_editorial_policy',{detail:'summary',projectId:base.projectId}));
  assert.equal(editorial.result.structuredContent.collaboration.effective.projectEditing,'preview-only','editorial guidance also respects the exact Project preference');
  const context=(await ok(mcp(c,'get_minamo_working_context',{focus:{family:'journey',id:base.projectId}}))).result.structuredContent;
  assert.equal(context.collaboration.authoring.projectEditing.includes('decline GPT Project saves'),true);
  const revise={...base,operationId:'edit-revise-denied',expectedProjectRev:1,body:'New draft that must not commit.'};
  const preview=await ok(mcp(c,'preview_project_update',revise));assert.equal(preview.result.isError,false,'read-only proposal still works');
  const denied=await ok(mcp(c,'apply_project_update',revise));assert.equal(denied.result.isError,true);
  assert.equal(denied.result.structuredContent.code,'project_preview_only');
  assert.equal((await ok(c.context('journey',base.projectId))).record.rev,1);
  const originalReplay=await ok(mcp(c,'apply_project_update',{...base,operationId:'edit-create',expectedProjectRev:0,title:'An unresolved DNS investigation',body:'A question about why the resolver differs across networks.'}));
  assert.equal(originalReplay.result.structuredContent.replayed,true,'historical operation receipt remains recoverable');
  const browserEdit=await ok(c.command({action:'update',family:'journey',id:base.projectId,expectedRev:1,data:{body:'Owner website edit remains available.'}}));
  assert.equal(browserEdit.record.rev,2,'website authoring is not silently blocked by a GPT preference');
  assert.equal((await other.request('/api/collaboration-preferences?projectId='+base.projectId)).status,404);
  await ok(c.request('/api/collaboration-preferences',{scope:'project',projectId:base.projectId,intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:0,operationId:'edit-project-allow',values:{projectEditing:'direct',authoringDetail:'concise'}}));
  const guidance=(await ok(mcp(c,'get_minamo_working_context',{focus:{family:'journey',id:base.projectId}}))).result.structuredContent.collaboration.authoring;
  assert.match(guidance.detail,/economical/);
  const allowed=await ok(mcp(c,'apply_project_update',{...base,operationId:'edit-allowed',expectedProjectRev:2,title:'An unresolved DNS investigation — revised title'}));
  assert.equal(allowed.result.structuredContent.status,'committed',JSON.stringify(allowed.result.structuredContent));
  const blockedNew=await ok(mcp(c,'apply_project_update',{projectId:'prefs-new-project',expectedGeneration:c.generation,operationId:'edit-new-blocked',expectedProjectRev:0,title:'A new Project'}));
  assert.equal(blockedNew.result.structuredContent.code,'project_preview_only','new Projects inherit the global restriction');
 }finally{await f.dispose();}
});

test('older saved global preference rows read with safe defaults before their first new write',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const owner='prefs-legacy-owner',c=f.client(owner),legacy={contextDepth:'detailed',relatedMaterial:'none',initiative:'requested'};
  await f.db.prepare('INSERT INTO v2_collaboration_preferences(owner,namespace,scope,target_id,revision,data,updated_at,last_operation) VALUES(?,?,?,?,?,?,?,?)').bind(owner,'*','global','*',3,JSON.stringify(legacy),'2026-11-09T00:00:00.000Z','old-save').run();
  const read=await ok(c.request('/api/collaboration-preferences'));
  assert.equal(read.global.revision,3);
  assert.deepEqual(read.effective,{version:1,...legacy,authoringDetail:'balanced',projectEditing:'direct',mcpTools:'authoring'});
  const changed=await ok(c.request('/api/collaboration-preferences',{scope:'global',intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:3,operationId:'legacy-modernise',values:{...legacy,authoringDetail:'concise',projectEditing:'preview-only',mcpTools:'authoring'}}));
  assert.equal(changed.revision,4);
  assert.equal((await ok(c.request('/api/collaboration-preferences'))).effective.projectEditing,'preview-only');
  const previousOwner='prefs-five-field-owner',previous=f.client(previousOwner),five={contextDepth:'concise',relatedMaterial:'saved',initiative:'requested',authoringDetail:'detailed',projectEditing:'preview-only'};
  await f.db.prepare('INSERT INTO v2_collaboration_preferences(owner,namespace,scope,target_id,revision,data,updated_at,last_operation) VALUES(?,?,?,?,?,?,?,?)').bind(previousOwner,'*','global','*',7,JSON.stringify(five),'2026-11-11T00:00:00.000Z','previous-lab-version').run();
  assert.deepEqual((await ok(previous.request('/api/collaboration-preferences'))).effective,{version:1,...five,mcpTools:'authoring'},'the actual five-field V144 preference format gains a safe default without migration');
 }finally{await f.dispose();}
});

test('owner-global read-only MCP access changes discovery, blocks cached saves, allows previews and website edits, and restores cleanly',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('prefs-mcp-read-owner'),neighbour=f.client('prefs-mcp-read-neighbour');
  const original=(await ok(c.command({action:'create',family:'note',id:'mcp-read-lab-note',operationId:'before-mcp-freeze',data:{title:'Question about the river',body:'Initial explanation, not yet verified.',synthetic:true}}))).record;
  await ok(c.command({action:'create',family:'investigation',id:'mcp-read-lab-question',data:{title:'Question about the river',body:'Does the water level change after rain?',synthetic:true}}));
  const catalogue=async client=>(await ok(client.request('/mcp',{jsonrpc:'2.0',id:4,method:'tools/list'}))).result.tools.map(tool=>tool.name);
  const authoring=await catalogue(c);
  for(const name of ['apply_minamo_command','set_minamo_collaboration_preferences','apply_project_update','read_minamo_record','preview_minamo_command','read_minamo_operation'])assert.ok(authoring.includes(name),name+' is available by default');
  await ok(c.request('/api/collaboration-preferences',{scope:'global',intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:0,operationId:'mcp-freeze',values:{...concise,mcpTools:'read-only'}}));
  const restricted=await catalogue(c);
  const mutations=['upload_minamo_project_image','manage_minamo_test_run','review_project_contribution','apply_project_update','set_note_page_pin','set_minamo_collaboration_preferences','confirm_minamo_relationship','record_minamo_learning_update','publish_minamo_manuscript','apply_minamo_authoring_package','manage_minamo_recovery','apply_minamo_command'];
  for(const name of mutations)assert.equal(restricted.includes(name),false,name+' is no longer advertised');
  for(const name of ['read_minamo_record','read_minamo_record_changes','get_minamo_working_context','get_minamo_collaboration_preferences','preview_minamo_command','preview_project_update','read_minamo_operation'])assert.ok(restricted.includes(name),name+' remains readable');
  assert.ok((await catalogue(neighbour)).includes('apply_minamo_command'),'other owners keep their own MCP access');
  const cachedWrite=await ok(mcp(c,'apply_minamo_command',{command:{operationId:'must-not-write',action:'update',family:'note',id:original.id,expectedRev:1,data:{body:'Unrequested overwrite'}}}));
  assert.equal(cachedWrite.result.isError,true);
  assert.equal(cachedWrite.result.structuredContent.code,'mcp_read_only','cached clients cannot sidestep the server fence');
  const cachedSetting=await ok(mcp(c,'set_minamo_collaboration_preferences',{scope:'global',intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:1,operationId:'no-mcp-restore',values:concise}));
  assert.equal(cachedSetting.result.structuredContent.code,'mcp_read_only','read-only policy itself cannot be silently reversed by cached GPT tools');
  const preview=await ok(mcp(c,'preview_minamo_command',{command:{operationId:'preview-only',action:'update',family:'investigation',id:'mcp-read-lab-question',expectedRev:1,data:{body:'A proposed refinement, not a saved change.'}}}));
  assert.equal(preview.result.isError,false,'a read-only Question proposal still works');
  const directRead=await ok(mcp(c,'read_minamo_record',{family:'note',id:original.id}));
  assert.equal(directRead.result.isError,false);
  const receipt=await ok(mcp(c,'read_minamo_operation',{operationId:'before-mcp-freeze'}));
  assert.equal(receipt.result.isError,false,'operation receipt recovery remains available');
  assert.equal((await ok(c.context('note',original.id))).record.rev,1,'no cached write committed');
  const websiteEdit=await ok(c.command({action:'update',family:'note',id:original.id,expectedRev:1,data:{body:'Owner website edit stays available.'}}));
  assert.equal(websiteEdit.record.rev,2);
  const readPolicy=await ok(mcp(c,'get_minamo_collaboration_preferences',{}));
  assert.equal(readPolicy.result.structuredContent.effective.mcpTools,'read-only');
  assert.match(readPolicy.result.structuredContent.authoring.projectEditing,/read-only/);
  await ok(c.request('/api/collaboration-preferences',{scope:'global',intent:'explicit-owner-preferences',expectedGeneration:c.generation,expectedRevision:1,operationId:'mcp-restore-website',values:concise}));
  assert.ok((await catalogue(c)).includes('apply_minamo_command'),'site Settings can restore authoring catalogue');
  const saved=await ok(mcp(c,'apply_minamo_command',{command:{operationId:'after-restore-question',action:'update',family:'investigation',id:'mcp-read-lab-question',expectedRev:1,data:{body:'A deliberate Question update after owner restoration.'}}}));
  assert.equal(saved.result.isError,false,'restored authoring may update a permitted Question');
  assert.equal((await ok(c.context('investigation','mcp-read-lab-question'))).record.rev,2);
  const noteWrite=await ok(mcp(c,'apply_minamo_command',{command:{operationId:'after-restore-note-denied',action:'update',family:'note',id:original.id,expectedRev:2,data:{body:'GPT must still not overwrite the Note.'}}}));
  assert.equal(noteWrite.result.isError,true);
  assert.equal(noteWrite.result.structuredContent.code,'gpt_note_authoring_forbidden');
  assert.equal((await ok(c.context('note',original.id))).record.rev,2);
 }finally{await f.dispose();}
});
