import test from 'node:test';
import assert from 'node:assert/strict';
import {pr12CorpusFixture,corpusRecords} from './pr12-corpus-fixture.mjs';
async function mcp(client,name,args){const r=await client.request('/mcp',{jsonrpc:'2.0',id:'presentation',method:'tools/call',params:{name,arguments:{requestPurpose:'Owner requested GPT workspace and inspection acceptance',...args}}});const v=r.data.result;return v?.structuredContent??v??r.data;}
test('GPT presentation plan, typed MCP, live observation consent/expiry/revocation and immutable refinement',async()=>{
 const f=await pr12CorpusFixture();try{
 const original=corpusRecords()[0],section=original.sections.find(s=>s.parts.length>1),refs=section.parts.slice(0,2).map(p=>({family:original.family,id:original.id,sectionId:section.id,partId:p.id,rendition:original.rendition,sourceRevision:original.rev,policy:'pin'}));
 const plan={version:1,eyebrow:'JAPANESE · CONVERSATION',introduction:'A purposeful return to saved material.',sections:[{id:'meaning',title:'Understand',layout:'contrast',blocks:[{type:'source',entry:0},{type:'source',entry:1},{type:'note',title:'Try it aloud',text:'GPT-authored connective guidance, not a learner attempt.'}]}]};
 const input={expectedGeneration:'legacy@0',expectedRevision:0,operationId:'pr12-presentation-create',title:'Conversation in context',purpose:'Revisit the genuine conversation',entries:refs,plan};
 const receipt=await mcp(f.reader,'compose_minamo_workspace',input);assert.equal(receipt.status,'committed',JSON.stringify(receipt));const id=receipt.arrangementId;
 assert.equal((await mcp(f.reader,'compose_minamo_workspace',input)).replayed,true);
 const webRead=await f.reader.request('/api/experiences?action=read&id='+id);assert.equal(webRead.data.entries.length,2);assert.equal(webRead.data.presentationInspection,undefined,'Website reading must not run the separate MCP inspection projection');
 const inspect=await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id,detail:'structure'});assert.equal(inspect.planned.revision,1);assert.equal(inspect.planned.hierarchy[0].blocks[0].status,'available');assert.equal(inspect.observed,null);
 const tools=(await f.reader.request('/mcp',{jsonrpc:'2.0',id:'tools',method:'tools/list'})).data.result.tools;const compose=tools.find(t=>t.name==='compose_minamo_workspace');assert.equal(compose.inputSchema.properties.plan.properties.sections.items.properties.layout.enum.length,4);assert.ok(tools.find(t=>t.name==='inspect_minamo_presentation'));
 const invalid=await mcp(f.reader,'compose_minamo_workspace',{...input,operationId:'invalid-plan',plan:{...plan,sections:[{...plan.sections[0],blocks:[{type:'source',entry:8}]}]}});assert.ok(invalid.error);
 const node={id:0,role:'heading1',name:'Conversation in context',bounds:{x:0,y:0,width:400,height:40},inViewport:true,fontSize:'30px',lineHeight:'36px',display:'block',gap:'normal',overflow:'visible',clipped:false};
 const shot={action:'capture',target:{view:'workspace',id,revision:1},deviceId:'TEST-ONLY-desktop',variant:'studio',build:'minamo-presentation-v1',route:'/?view=home&experienceId='+id,viewport:{width:1200,height:800,scrollX:0,scrollY:0,contentWidth:1200,contentHeight:1400,breakpoint:'desktop'},nodes:[node],truncated:false,sources:[]};
 assert.equal((await f.reader.request('/api/presentation',shot)).status,403);
 assert.equal((await f.reader.request('/api/presentation',{action:'consent',enabled:true})).status,200);
 assert.equal((await f.reader.request('/api/presentation',shot)).status,200);
 const observed=await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id,detail:'visual'});assert.equal(observed.observed.viewport.width,1200);assert.equal(observed.observed.screenshot.available,false);assert.equal(observed.observed.matchesRequestedRevision,true);assert.equal(observed.observed.nodes[0].name,node.name);
 const pixel={mimeType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==',width:1,height:1,method:'consented-current-tab-crop'};
 assert.equal((await f.reader.request('/api/presentation',{...shot,image:pixel})).status,200);
 assert.equal((await f.reader.request('/api/presentation',shot)).status,200);
 const pixels=await f.reader.request('/mcp',{jsonrpc:'2.0',id:'pixels',method:'tools/call',params:{name:'inspect_minamo_presentation',arguments:{view:'workspace',id,detail:'visual',requestPurpose:'Isolated PNG transport fidelity test; not browser acceptance'}}});
 assert.equal(pixels.data.result.content.find(c=>c.type==='image').data,pixel.data);assert.equal(pixels.data.result.structuredContent.observed.screenshot.available,true);
 const homeShot={...shot,target:{view:'home'},sources:[]};assert.equal((await f.reader.request('/api/presentation',homeShot)).status,200);
 assert.ok((await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id})).observed,'Per-view snapshots must survive another view capture on the same device');
 const foreign=await mcp(f.client('TEST-ONLY-foreign'),'inspect_minamo_presentation',{view:'workspace',id});assert.ok(foreign.error);
 const refined=await mcp(f.reader,'compose_minamo_workspace',{...input,arrangementId:id,expectedRevision:1,operationId:'refine-plan',plan:{...plan,sections:[{...plan.sections[0],title:'A quieter reading',layout:'reading'}]}});assert.equal(refined.status,'committed');
 const stale=await mcp(f.reader,'compose_minamo_workspace',{...input,arrangementId:id,expectedRevision:1,operationId:'stale-refinement'});assert.equal(stale.status,'conflict');
 assert.equal((await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id})).observed,null);
 const history=await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id,revision:1});assert.equal(history.planned.plan.sections[0].layout,'contrast');
 assert.equal((await f.reader.request('/api/presentation',shot)).status,200);
 const oldView=await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id});assert.equal(oldView.observed.target.revision,1);assert.equal(oldView.observed.matchesRequestedRevision,false,'An actually displayed older edition must not be called the current planned revision');
 assert.deepEqual((await f.reader.context(original.family,original.id)).data.record.sections,original.sections);
 const project=await mcp(f.reader,'inspect_minamo_presentation',{view:'project',id:original.id,detail:'structure'});assert.ok(project.planned.hierarchy);assert.equal(project.planned.kind,'planned');
 const home=await mcp(f.reader,'inspect_minamo_presentation',{view:'home',detail:'structure'});assert.equal(home.planned.hierarchy.length,4);
 await f.reader.request('/api/presentation',{...shot,target:{...shot.target,revision:2}});
 await f.db.prepare('UPDATE v2_presentation_snapshots SET captured_at=? WHERE owner=?').bind(Date.now()-601000,f.owner).run();assert.equal((await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id})).observed,null);
 assert.equal((await f.reader.request('/api/presentation',{...shot,target:{...shot.target,revision:2}})).status,200);
 await f.db.prepare('UPDATE v2_records SET trashed_at=? WHERE owner=? AND family=? AND id=?').bind('2026-11-14',f.owner,original.family,original.id).run();const revoked=await mcp(f.reader,'inspect_minamo_presentation',{view:'workspace',id});assert.equal(revoked.observed,null);assert.equal(revoked.planned.hierarchy[0].blocks[0].status,'unavailable');
 await f.reader.request('/api/presentation',{action:'consent',enabled:false});assert.equal((await f.db.prepare('SELECT COUNT(*) AS n FROM v2_presentation_snapshots WHERE owner=?').bind(f.owner).first()).n,0);
 }finally{await f.dispose()}
});
