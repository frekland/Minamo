import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {isDomainPath,domainMethodAllowed} from '../lib/domain-routes.ts';

test('C3 route is registered in the production API dispatch allowlist',()=>{
 assert.equal(isDomainPath('/api/projects/changes'),true);
 assert.equal(domainMethodAllowed('/api/projects/changes','GET'),true);
 assert.equal(domainMethodAllowed('/api/projects/changes','POST'),false);
});

test('C3: owner-scoped exact Project changes, stable paging and historical readback',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const person=fixture.client('c3-owner'),other=fixture.client('c3-other'),id='c3-revision-reading';
  const first=[{id:'a',title:'Grammar',parts:[{id:'example',kind:'paragraph',text:'仕事です。'}]}];
  const changed=[{id:'a',title:'Grammar',parts:[{id:'example',kind:'paragraph',text:'仕事が終わりました。'},{id:'added',kind:'paragraph',text:'New example.'}]}];
  assert.equal((await person.command({action:'create',family:'journey',id,data:{title:'Grammar v1',body:'',sections:first}})).status,200);
  assert.equal((await person.command({action:'update',family:'journey',id,expectedRev:1,data:{title:'Grammar v2',sections:changed}})).status,200);
  assert.equal((await person.command({action:'update',family:'journey',id,expectedRev:2,data:{projectDescription:'Revised summary'}})).status,200);
  const mcp=await person.request('/mcp',{jsonrpc:'2.0',id:'read-changes',method:'tools/call',params:{name:'read_project_changes',arguments:{purpose:'Inspect the learner’s real saved changes',projectId:id,limit:2}}});
  assert.equal(mcp.status,200,JSON.stringify(mcp.data));
  const page=mcp.data.result.structuredContent;
  assert.equal(page.currentProjectRev,3);assert.deepEqual(page.revisions.map(item=>item.revision),[3,2]);
  assert.equal(page.revisions[0].descriptionChanged,true);assert.equal(page.revisions[1].titleChanged,true);
  assert.ok(page.revisions[1].changes.some(change=>change.partId==='example'&&change.change==='revised'));
  assert.ok(page.revisions[1].changes.some(change=>change.partId==='added'&&change.change==='added'));
  assert.deepEqual(page.revisions[1].sectionChanges,[{sectionId:'a',sectionTitle:'Grammar',added:1,revised:1,removed:0}]);
  assert.equal(page.revisions[1].changes.find(change=>change.partId==='example').textPreview,'仕事が終わりました。');
  assert.equal(page.revisions[1].changes.find(change=>change.partId==='added').textPreview,'New example.');
  assert.deepEqual(page.revisions[0].sectionChanges,[],'description-only revisions must not fabricate content changes');
  assert.deepEqual(page.revisions[1].exactRead,{tool:'get_project_composition',projectId:id,revision:2});
  assert.equal(page.nextBeforeRevision,1);
  const oldest=await person.request('/api/projects/changes?'+new URLSearchParams({projectId:id,beforeRevision:'1',limit:'2'}));
  assert.equal(oldest.status,200);assert.deepEqual(oldest.data.revisions.map(item=>item.revision),[1]);assert.equal(oldest.data.nextBeforeRevision,null);
  const history=await person.request('/api/projects/composition?'+new URLSearchParams({projectId:id,revision:'2'}));
  assert.equal(history.status,200);assert.equal(history.data.record.sections[0].parts[0].text,'仕事が終わりました。');
  const denied=await other.request('/api/projects/changes?projectId='+id);assert.equal(denied.status,404);
  for(const suffix of ['&limit=0','&limit=21','&beforeRevision=99','&beforeRevision=0']){
   const bad=await person.request('/api/projects/changes?projectId='+id+suffix);assert.equal(bad.status,400,suffix);
  }
 }finally{await fixture.dispose();}
});

test('saved-edition labels describe real non-code artefact definitions without inventing Work links',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('cross-domain-editions-owner'),id='cross-domain-editions';
  const first={title:'TEST ONLY — grammar and visual explanation',body:'Constructed example',synthetic:true,sections:[{id:'grammar',title:'Ways of explaining a sentence',parts:[
   {id:'table',kind:'table',text:'Japanese\tMeaning\n閉まる\tclose',table:{headers:['Japanese','Meaning'],rows:[['閉まる','close']]}},
   {id:'cards',kind:'interactive',text:'Flashcard examples',interactive:{version:1,type:'flashcards',cards:[{id:'one',front:{text:'開ける'},back:{text:'open something'}},{id:'two',front:{text:'開く'},back:{text:'something opens'}}]}},
   {id:'diagram',kind:'diagram',diagram:{format:'flow-v1',nodes:[{id:'cause',label:'Cause'},{id:'effect',label:'Effect'}],edges:[{from:'cause',to:'effect',label:'suggested'}]}}
  ]}]};
  const created=await owner.command({action:'create',family:'journey',id,data:first});assert.equal(created.status,200,JSON.stringify(created.data));
  const added={...first.sections[0],parts:[...first.sections[0].parts,{id:'new-reading',kind:'paragraph',text:'An additional constructed comparison, not an observation.'}]};
  const updated=await owner.request('/api/projects/update',{operationId:'cross-domain-content-only',expectedGeneration:owner.generation,projectId:id,expectedProjectRev:1,contentSections:[added]});
  assert.equal(updated.status,200,JSON.stringify(updated.data));
  const current=(await owner.request('/api/projects/composition?projectId='+id)).data.composition;
  const rearranged={...current,sections:current.sections.map((section,i)=>i===0?{...section,title:'Rearranged visual section'}:section)};
  const layoutEdit=await owner.request('/api/projects/update',{operationId:'cross-domain-layout-only',expectedGeneration:owner.generation,projectId:id,expectedProjectRev:2,composition:rearranged});
  assert.equal(layoutEdit.status,200,JSON.stringify(layoutEdit.data));
  const read=await owner.request('/api/projects/changes?projectId='+id+'&limit=3');assert.equal(read.status,200,JSON.stringify(read.data));
  assert.equal(read.data.revisions[1].arrangementChanged,false,'adding an empty protectedIds list during a content-only save must not pretend the reader layout changed');
  assert.equal(read.data.revisions[0].arrangementChanged,true,'a real reader section change must still be discoverable');
  const original=read.data.revisions.find(row=>row.revision===1);
  assert.deepEqual(original.sectionChanges,[{sectionId:'grammar',sectionTitle:'Ways of explaining a sentence',added:3,revised:0,removed:0}]);
  const labels=Object.fromEntries(original.changes.map(change=>[change.partId,change.materialLabel]));
  assert.equal(labels.table,'Columns: Japanese · Meaning');
  assert.equal(labels.cards,'Flashcards · 2 cards');
  assert.equal(labels.diagram,'Cause · Effect');
  assert.ok(original.changes.every(change=>change.linkedThreadIds.length===0&&change.textPreview===undefined),'derived labels must not assert work relationships or fabricated prose');
 }finally{await fixture.dispose();}
});

test('saved-edition comparisons expose exact changed language, prose and table cells without invented meaning',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('language-delta-owner'),other=fixture.client('language-delta-stranger'),id='language-delta-project';
  const dialogue={version:1,type:'language-dialogue',language:'ja',turns:[
   {id:'t1',speaker:'友達',source:{text:'何も買えなかったの？',translation:'So you could not buy anything?'}},
   {id:'t2',speaker:'私',source:{text:'うん。着いたのが遅かったからね。',translation:'No. I arrived too late.'}}
  ]};
  const first={title:'TEST ONLY — revision evidence',synthetic:true,body:'Constructed example',sections:[{id:'language',title:'Dialogue and interpretation',parts:[
   {id:'conversation',kind:'interactive',text:'Read the dialogue',interactive:dialogue},
   {id:'explanation',kind:'paragraph',text:'The state explains the event.'},
   {id:'comparison',kind:'table',text:'Form\tMeaning\nVたあとで\tAfter an action',table:{headers:['Form','Meaning'],rows:[['Vたあとで','After an action']]}}
  ]}]};
  const created=await owner.command({action:'create',family:'journey',id,data:first});assert.equal(created.status,200,JSON.stringify(created.data));
  const fixed=structuredClone(dialogue);fixed.turns[1].source.translation="That's right. I arrived too late.";
  const edited=await owner.command({action:'update',family:'journey',id,expectedRev:1,data:{patch:[
   {op:'patchBlock',sectionId:'language',partId:'conversation',changes:{interactive:fixed}},
   {op:'patchBlock',sectionId:'language',partId:'explanation',changes:{text:'The state is observed on arrival; the exact closing time remains unknown.'}},
   {op:'patchBlock',sectionId:'language',partId:'comparison',changes:{table:{rows:[['Vたあとで','After a completed action']]}}}
  ]}});assert.equal(edited.status,200,JSON.stringify(edited.data));
  const reading=await owner.request('/api/projects/changes?projectId='+id+'&limit=2');assert.equal(reading.status,200,JSON.stringify(reading.data));
  const diff=Object.fromEntries(reading.data.revisions[0].changes.map(change=>[change.partId,change]));
  assert.deepEqual(diff.conversation.fieldChanges,[{field:'Turn 2 · translation',before:'No. I arrived too late.',after:"That's right. I arrived too late."}]);
  assert.deepEqual(diff.explanation.fieldChanges,[{field:'Text',before:'The state explains the event.',after:'The state is observed on arrival; the exact closing time remains unknown.'}]);
  assert.deepEqual(diff.comparison.fieldChanges,[{field:'Row 1 · Meaning',before:'After an action',after:'After a completed action'}]);
  assert.ok(reading.data.revisions[0].changes.every(change=>change.linkedThreadIds.length===0),'textual differences must not imply a Work connection');
  assert.ok(reading.data.revisions[1].changes.every(change=>!change.fieldChanges),'additions lack a previous exact value');
  assert.equal((await other.request('/api/projects/changes?projectId='+id)).status,404,'exact diff remains owner scoped');
 }finally{await fixture.dispose();}
});

test('linked Work changes follow exact current part identities without inventing relationships',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('thread-change-owner'),other=fixture.client('thread-change-other'),projectId='thread-change-project';
  const section={id:'source',title:'Current code',parts:[{id:'map',kind:'code',language:'python',text:'print("old")'},{id:'test',kind:'code',language:'python',text:'assert True'}]};
  const composition={version:1,sections:[{id:'main',title:'Code',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['source-block']}]}],blocks:[{id:'source-block',sectionId:'source'}]};
  const update=(op,rev,fields)=>owner.request('/api/projects/update',{operationId:op,expectedGeneration:owner.generation,projectId,expectedProjectRev:rev,...fields});
  assert.equal((await update('thread-change-create',0,{title:'A code investigation',contentSections:[section],composition})).status,200);
  const thread={id:'engine',title:'How is the map checked?',summary:'Older authored explanation',items:[{sectionId:'source',partId:'map',role:'working'},{sectionId:'source',partId:'test',role:'earlier',revision:1}]};
  assert.equal((await update('thread-change-link',1,{changes:[{op:'upsertWorkThread',thread}]})).status,200);
  assert.equal((await update('thread-change-code',2,{contentSections:[{...section,parts:[{...section.parts[0],text:'print("corrected")'},section.parts[1]]}]})).status,200);
  assert.equal((await update('thread-change-unlinked',3,{contentSections:[{...section,parts:[{...section.parts[0],text:'print("corrected")'},section.parts[1],{id:'observation',kind:'paragraph',text:'A new finding'}]}]})).status,200);
  const read=await owner.request('/api/projects/changes?projectId='+projectId+'&limit=5');
  assert.equal(read.status,200,JSON.stringify(read.data));
  const revised=read.data.revisions.find(item=>item.revision===3),added=read.data.revisions.find(item=>item.revision===4);
  assert.deepEqual(revised.changes.find(item=>item.partId==='map').linkedThreadIds,['engine']);
  assert.deepEqual(added.changes.find(item=>item.partId==='observation').linkedThreadIds,[]);
  assert.deepEqual(read.data.revisions[0].changes.filter(item=>item.partId==='test').flatMap(item=>item.linkedThreadIds),[]);
  assert.match(read.data.threadMatchBasis,/not automatically attributed/);
  const denied=await other.request('/api/projects/changes?projectId='+projectId);
  assert.equal(denied.status,404);
 }finally{await fixture.dispose();}
});

test('declared Python file paths follow exact Work source edits, renames and removals',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('source-path-owner'),stranger=fixture.client('source-path-stranger'),projectId='source-path-project';
  const source={id:'files',title:'Source',parts:[{id:'module',kind:'code',language:'python',text:'def run():\n    return 1'},{id:'suite',kind:'code',language:'python',text:'assert True'}]};
  const pkg={id:'code',title:'Source and checks',runtime:'python',entrypoint:'src/map.py',files:[{path:'src/map.py',sectionId:'files',partId:'module',role:'source'},{path:'tests/test_map.py',sectionId:'files',partId:'suite',role:'test'}]};
  const composition={version:1,sections:[{id:'main',title:'Code',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['source-block']}]}],blocks:[{id:'source-block',sectionId:'files'}],codePackages:[pkg]};
  const update=(op,rev,fields)=>owner.request('/api/projects/update',{operationId:op,expectedGeneration:owner.generation,projectId,expectedProjectRev:rev,...fields});
  assert.equal((await update('source-path-create',0,{title:'File continuity',contentSections:[source],composition})).status,200);
  const thread={id:'map-question',title:'What changes the map?',items:[{sectionId:'files',partId:'module',role:'working'}]};
  assert.equal((await update('source-path-thread',1,{changes:[{op:'upsertWorkThread',thread}]})).status,200);
  const changed={...source,parts:[{...source.parts[0],text:'def run():\n    return 2'},{...source.parts[1],text:'assert 1 + 1 == 2'}]};
  assert.equal((await update('source-path-edits',2,{contentSections:[changed]})).status,200);
  const renamed={...pkg,entrypoint:'src/game_map.py',files:[{...pkg.files[0],path:'src/game_map.py'},pkg.files[1]]};
  assert.equal((await update('source-path-rename',3,{composition:{...composition,workThreads:[thread],codePackages:[renamed]}})).status,200);
  assert.equal((await update('source-path-withdraw',4,{composition:{...composition,workThreads:[thread],codePackages:[{...renamed,entrypoint:undefined,files:[renamed.files[1]]}]}})).status,200);
  const read=await owner.request('/api/projects/changes?projectId='+projectId+'&limit=5');
  assert.equal(read.status,200,JSON.stringify(read.data));
  const revisions=Object.fromEntries(read.data.revisions.map(row=>[row.revision,row]));
  const moduleEdit=revisions[3].changes.find(change=>change.partId==='module');
  assert.deepEqual(moduleEdit.linkedThreadIds,['map-question']);
  assert.deepEqual(moduleEdit.sourceFilesAfter.map(file=>({path:file.path,role:file.role,sourceRevision:file.sourceRevision})),[{path:'src/map.py',role:'source',sourceRevision:3}]);
  assert.deepEqual(moduleEdit.sourceFilesBefore.map(file=>file.path),['src/map.py']);
  assert.deepEqual(revisions[3].changes.find(change=>change.partId==='suite').linkedThreadIds,[],'same Python package does not infer the test file belongs to this Work question');
  assert.equal(revisions[4].changes.length,0,'file rename does not pretend the Python text changed');
  assert.deepEqual(revisions[4].sourceMappingChanges.filter(change=>change.linkedThreadIds.includes('map-question')).map(change=>[change.change,change.path]),[['linked','src/game_map.py'],['unlinked','src/map.py']]);
  assert.deepEqual(revisions[5].sourceMappingChanges.filter(change=>change.linkedThreadIds.includes('map-question')).map(change=>[change.change,change.path]),[['unlinked','src/game_map.py']]);
  assert.deepEqual(revisions[5].sourceMappingChanges.filter(change=>change.partId==='suite'),[]);
  const viaMcp=await owner.request('/mcp',{jsonrpc:'2.0',id:'read-file-changes',method:'tools/call',params:{name:'read_project_changes',arguments:{purpose:'Read exact retained Python file mappings',projectId,limit:5}}});
  assert.equal(viaMcp.status,200);assert.deepEqual(viaMcp.data.result.structuredContent.revisions[1].sourceMappingChanges,revisions[4].sourceMappingChanges);
  assert.equal((await stranger.request('/api/projects/changes?projectId='+projectId)).status,404);
 }finally{await fixture.dispose();}
});

test('saved Canvas observations inherit an exact Work source link but unrelated edits do not',async()=>{
 const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=fixture.client('captured-change-owner'),stranger=fixture.client('captured-change-other'),projectId='captured-source-relationship';
  const definition={version:1,type:'python-canvas',width:640,height:360,seed:7,code:'from minamo_canvas import clear\nclear()'};
  const content={id:'lab',title:'Code and observations',parts:[{id:'canvas',kind:'interactive',text:'Canvas',interactive:definition},{id:'unrelated',kind:'paragraph',text:'Independent note'}]};
  const composition={version:1,sections:[{id:'main',title:'Lab',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['lab-block']}]}],blocks:[{id:'lab-block',sectionId:'lab'}]};
  const update=(op,rev,fields)=>owner.request('/api/projects/update',{operationId:op,expectedGeneration:owner.generation,projectId,expectedProjectRev:rev,...fields});
  assert.equal((await update('captured-create',0,{title:'Canvas work',contentSections:[content],composition})).status,200);
  const thread={id:'canvas-question',title:'What does this Canvas show?',summary:'Authored before this observation',items:[{sectionId:'lab',partId:'canvas',role:'working'}]};
  assert.equal((await update('captured-link',1,{changes:[{op:'upsertWorkThread',thread}]})).status,200);
  const observation={operationId:'captured-run-01',expectedGeneration:owner.generation,projectId,expectedProjectRev:2,sectionId:'lab',partId:'canvas',definitionDigest:createHash('sha256').update(JSON.stringify(definition)).digest('hex'),observedAt:'2026-11-10T12:00:00.000Z',inputs:{speed:2},seed:7,output:'Browser supplied output',description:'An observed trace, not independent execution.',classification:'browser-reported'};
  const saved=await owner.request('/api/projects/observation',observation);assert.equal(saved.status,200,JSON.stringify(saved.data));
  const changes=await owner.request('/api/projects/changes?projectId='+projectId+'&limit=5');assert.equal(changes.status,200);
  const added=changes.data.revisions.find(item=>item.revision===3).changes;
  const reported=added.filter(item=>item.partId.startsWith('observation-'));
  assert.equal(reported.length,2,'callout and exact captured inputs are both discoverable');
  for(const change of reported){
   assert.deepEqual(change.linkedThreadIds,['canvas-question']);
   assert.equal(change.linkBasis,'saved-capture-source');
   assert.deepEqual(change.captureSource,{sectionId:'lab',partId:'canvas',definitionMatchesSavedEdition:true,classification:'browser-reported'});
  }
  assert.equal(reported.find(change=>change.kind==='callout').captureExcerpt,'An observed trace, not independent execution.','the originating saved-edition observation text is available without generating an authored summary');
  assert.equal(reported.find(change=>change.kind==='code').captureExcerpt,undefined,'captured JSON remains available through exact edition, without duplicating its output in the change feed');
  assert.equal((await owner.request('/api/projects/observation',observation)).data.replayed,true);
  const original=(await owner.request('/api/projects/composition?projectId='+projectId)).data.record.sections[0];
  const further={...original,parts:[...original.parts,{id:'new-paragraph',kind:'paragraph',text:'Potentially related in theme, but no saved source relationship.'}]};
  assert.equal((await update('captured-unrelated',3,{contentSections:[further]})).status,200);
  const subsequent=await owner.request('/api/projects/changes?projectId='+projectId+'&limit=2');
  const unlinked=subsequent.data.revisions.find(item=>item.revision===4).changes.find(item=>item.partId==='new-paragraph');
  assert.deepEqual(unlinked.linkedThreadIds,[]);assert.equal(unlinked.linkBasis,'unlinked');
  assert.equal(unlinked.captureExcerpt,undefined);
  assert.match(subsequent.data.threadMatchBasis,/not independently observed execution/);
  const revisedDefinition={...definition,code:'from minamo_canvas import clear\nclear()\nprint(2)'};
  const changedSource={...further,parts:further.parts.map(part=>part.id==='canvas'?{...part,interactive:revisedDefinition}:part)};
  assert.equal((await update('captured-new-definition',4,{contentSections:[changedSource]})).status,200);
  const revisedCapture={...changedSource,parts:changedSource.parts.map(part=>part.kind==='callout'&&part.id.startsWith('observation-')?{...part,text:part.text+'\nClarified after source revision.'}:part)};
  assert.equal((await update('captured-clarify',5,{contentSections:[revisedCapture]})).status,200);
  const history=await owner.request('/api/projects/changes?projectId='+projectId+'&limit=2');
  const corrected=history.data.revisions.find(item=>item.revision===6).changes.find(item=>item.partId.startsWith('observation-'));
  assert.deepEqual(corrected.linkedThreadIds,['canvas-question']);
  assert.equal(corrected.captureSource.definitionMatchesSavedEdition,false,'capture remains tied to its original definition after source changes');
  assert.equal((await stranger.request('/api/projects/changes?projectId='+projectId)).status,404);
 }finally{await fixture.dispose();}
});
