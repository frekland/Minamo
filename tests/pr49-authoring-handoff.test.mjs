import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:"1"})}}';
const scope=language=>({version:1,spaces:['languages'],languages:[language],provenance:'authored'});
test('PR49 existing-Area diagnostics, scoped language publication, selective Note handoff, replay and recoverable cleanup use actual Worker/D1',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-pr49-authoring');let serial=0;
 const call=async(name,args={})=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY PR49 authorised source/Note handoff acceptance',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text);};
 const counts=async()=>Object.fromEntries(await Promise.all(['v2_records','v2_revisions','v2_activity','v2_operations','v2_learning_developments'].map(async table=>[table,(await f.db.prepare('SELECT count(*) n FROM '+table).first()).n])));
 const publication=(operationId,documents,existing)=>({operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'TEST ONLY: publish original Japanese teaching with correct subject scope. Save no learner progress, audio or execution claim.',documents},...(existing?{existing}:{})});
 try{
 const before=await counts(),policy=await call('get_minamo_editorial_policy');
 assert.match(policy.sessionHandoff.authority,/zero writes/);assert.match(policy.sessionHandoff.liveVoice,/No assumed Live audio/);
 assert.deepEqual(await counts(),before,'ordinary read/discussion guidance produces zero writes');
 const areaReceipt=await call('publish_minamo_manuscript',publication('pr49-area',[{key:'area',role:'area',markdown:'# TEST ONLY Japanese grammar\n\nOriginal reusable grammar resources.',learningScope:scope('ja')}]));assert.equal(areaReceipt.status,'committed',JSON.stringify(areaReceipt));const area=areaReceipt.recordRefs[0];
 const doc=structuredClone(policy.existingAreaExample.document);doc.title='TEST ONLY Japanese topic';doc.catalogue.areas[0].ref=area.id;
 let rejected=await call('preview_minamo_manuscript',publication('pr49-area-bare',[doc]));assert.equal(rejected.code,'catalogue_area_unresolved');assert.match(rejected.error,/request.existing/);assert.match(rejected.path,/manuscript\.documents\[0\]\.catalogue\.areas\[0\]\.ref/);
 const existing=[{family:'area',id:area.id,rev:area.rev,purpose:'reuse'}];
 const complete=structuredClone(policy.existingAreaExample.request);complete.purpose='TEST ONLY complete copyable existing-Area recipe';complete.synthetic=true;complete.existing=existing;complete.manuscript.documents[0].catalogue.areas[0].ref='area:'+area.id;assert.equal((await call('preview_minamo_manuscript',complete)).valid,true,'full copyable current-Area request validates without schema retries');
 rejected=await call('preview_minamo_manuscript',publication('pr49-area-declared-bare',[doc],existing));assert.match(rejected.error,new RegExp('area:'+area.id));
 doc.catalogue.areas[0].ref='area:'+area.id;
 const input=publication('pr49-resource',[doc],existing),preview=await call('preview_minamo_manuscript',input);assert.equal(preview.valid,true,JSON.stringify(preview));
 assert.equal(preview.warnings.some(w=>w.code==='coverage_not_inspected'),false,'exact declared reuse binds inspected coverage');
 const published=await call('publish_minamo_manuscript',input);assert.equal(published.status,'committed',JSON.stringify(published));const resource=published.recordRefs[0],read=(await call('read_minamo_record',{family:'article',id:resource.id})).record;
 assert.deepEqual(read.learningScope,scope('ja'));assert.equal(read.links.some(l=>l.family==='area'&&l.id===area.id),true);
 const revised=await call('publish_minamo_manuscript',publication('pr49-revise-resource',[{...doc,learningScope:undefined,target:{family:'article',id:read.id,rev:read.rev},markdown:doc.markdown+'\n\nThis extra contrast is original editorial teaching, not a learner result.'}],[{family:'article',id:read.id,rev:read.rev,purpose:'targeted-update'},...existing]));assert.equal(revised.status,'committed',JSON.stringify(revised));
 const now=(await call('read_minamo_record',{family:'article',id:resource.id})).record;assert.deepEqual(now.learningScope,scope('ja'),'wording-only manuscript revision retains classification');
 const invalid=structuredClone(doc);invalid.learningScope.languages=['jp'];rejected=await call('preview_minamo_manuscript',publication('pr49-invalid-tag',[invalid],existing));assert.equal(rejected.code,'invalid_learning_language');assert.match(rejected.path,/learningScope.languages/);
 // Explicit synthetic analogue of “Save this Japanese session: resource + one Note, no progress”.
 const noteRequest={operationId:'pr49-note',expectedGeneration:'legacy@0',action:'create',family:'note',id:'pr49-personal-note',data:{title:'TEST ONLY Japanese session intention',body:'Learner-reported (supplied synthetic statement): I confused the topic particle reading.\n\nGPT interpretation: contrast the particle reading wa with a character reading; this is provisional.\n\nNext intention: try a new topic sentence.\n\nUnavailable: no audio recording or observed spoken performance.',bodyFormat:'markdown-v1',synthetic:true,learningScope:scope('ja'),links:[{family:'article',id:now.id,relation:'related',reason:'Exact resource discussed in this deliberately saved synthetic session.'}]}};
 const note=await call('apply_minamo_command',{command:noteRequest});assert.equal(note.status,'committed',JSON.stringify(note));
 const saved=(await call('read_minamo_record',{family:'note',id:'pr49-personal-note'})).record;assert.match(saved.body,/Learner-reported/);assert.match(saved.body,/GPT interpretation/);assert.deepEqual(saved.learningScope,scope('ja'));
 const afterSave=await counts(),replay=await call('apply_minamo_command',{command:noteRequest});assert.equal(replay.replayed,true);assert.deepEqual(await counts(),afterSave);assert.equal(afterSave.v2_learning_developments,0,'resource and Note save never creates checkpoint');
 const fresh=f.client('TEST-ONLY-pr49-authoring');const natural=await fresh.request('/api/query?'+new URLSearchParams({query:'Japanese',family:'note',learningSpace:'languages',language:'ja'}));assert.equal(natural.status,200);assert.ok(JSON.stringify(natural.data).includes('pr49-personal-note'));
 for(const r of [{family:'note',id:saved.id,rev:saved.rev},{family:'article',id:now.id,rev:now.rev},{family:'area',id:area.id,rev:area.rev}]){const result=await c.command({action:'trash',family:r.family,id:r.id,expectedRev:r.rev});assert.equal(result.status,200,JSON.stringify(result.data));}
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_records WHERE trashed_at IS NULL').first()).n,0);assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_records WHERE trashed_at IS NOT NULL').first()).n,3,'task-owned records remain recoverable');assert.equal((await counts()).v2_learning_developments,0);
 }finally{await f.dispose();}
});

test('PR49 every template has complete nested presentation and precise supported hint placement',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-pr49-presentations');let serial=0;
 const call=async(name,args={})=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY PR49 presentation preflight',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text);};
 try{
 const capabilities=await call('get_minamo_activity_capabilities');assert.equal(Object.keys(capabilities.presentationAuthoring.completePackages).length,13);assert.deepEqual(capabilities.presentationAuthoring.slotCompatibility.hintLadder,['guidance']);
 for(const request of Object.values(capabilities.presentationAuthoring.completePackages)){const result=await call('preview_minamo_activity_package',request);assert.equal(result.valid,true,JSON.stringify(result));}
 const request=structuredClone(capabilities.presentationAuthoring.completePackages.language);request.presentation=request.activity.presentation;delete request.activity.presentation;let rejected=await call('preview_minamo_activity_package',request);assert.equal(rejected.code,'invalid_activity');assert.match(rejected.error,/activity.presentation/);assert.equal(rejected.path,'input.presentation');
 request.activity.presentation=request.presentation;delete request.presentation;request.activity.presentation.slots.find(s=>s.blockId==='hints').slot='supporting';rejected=await call('preview_minamo_activity_package',request);assert.equal(rejected.code,'invalid_activity');assert.match(rejected.error,/Allowed slots: guidance/);assert.match(rejected.path,/slots\.3\.slot/);
 for(const table of ['v2_records','v2_operations','v2_learning_developments'])assert.equal((await f.db.prepare('SELECT count(*) n FROM '+table).first()).n,0);
 }finally{await f.dispose();}
});

test('PR49 supplied language-authoring snippets compile as exact canonical source, never fallback code',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-pr49-language-examples');let serial=0;
 const call=async(name,args={})=>{const r=await c.request('/mcp',{jsonrpc:'2.0',id:++serial,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY original language example preflight',...args}}});assert.equal(r.status,200);return JSON.parse(r.data.result.content[0].text);};
 try{
 const policy=await call('get_minamo_editorial_policy'),documents=[['japanese','ja'],['mandarin','zh-Hans'],['french','fr']].map(([key,language])=>({key,role:'article',learningScope:scope(language),markdown:'# TEST ONLY '+key+' source\n\n## Original sentence\n\n'+policy.languageExamples[key]}));
 const result=await call('preview_minamo_manuscript',{operationId:'pr49-language-examples',expectedGeneration:'legacy@0',synthetic:true,detail:true,manuscript:{version:1,brief:'TEST ONLY exact original language-authoring examples, not translations imported from any external source and no learner results.',documents}});assert.equal(result.valid,true,JSON.stringify(result));assert.equal(result.warnings.some(w=>w.code==='semantic_fallback'),false,JSON.stringify(result.warnings));
 for(const record of result.proposedRecords){const parts=record.sections.flatMap(s=>s.parts);const semantic=parts.find(p=>p.semantic?.kind==='ruby');assert.ok(semantic,JSON.stringify(record));assert.equal(semantic.text,semantic.semantic.language.text);assert.equal(semantic.semantic.language.translation.provenance,'authored-translation');}
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_records').first()).n,0);
 }finally{await f.dispose();}
});
