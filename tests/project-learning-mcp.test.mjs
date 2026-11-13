import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const source=[{id:'source',title:'Original',parts:[{id:'original',kind:'paragraph',text:'Exact learner example'}]}];
const composition={version:1,sections:[
 {id:'messages',title:'Messages',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['b']}]},
 {id:'practice',title:'Practice',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:[]}]}
],blocks:[{id:'b',sectionId:'source',readingPages:[{id:'original',title:'Original',purpose:'source',partIds:['original']}]}]};
const invoke=(c,name,args)=>c.request('/mcp',{jsonrpc:'2.0',id:'learning-'+name,method:'tools/call',params:{name,arguments:{purpose:'Test an exact and owner-authorised Project learning operation',...args}}});
test('MCP outline/read and bounded append maintain canonical identities and retry-safe Project rights',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=f.client('learning-owner'),other=f.client('other-owner'),pid='learning-example';
  assert.equal((await owner.command({action:'create',family:'journey',id:pid,data:{title:'Music',body:'Reading',sections:source,projectComposition:composition}})).status,200);
  const outline=await invoke(owner,'get_project_learning_outline',{projectId:pid});
  const plan=outline.data.result?.structuredContent;
  assert.equal(plan?.project?.rev,1,JSON.stringify(outline.data));
  assert.equal(plan?.topics?.length,1);
  assert.ok(!JSON.stringify(plan).includes('Exact learner example'),'Outline must not duplicate full source text');
  const page=await invoke(owner,'get_project_learning_reading',{projectId:pid,topicIds:[plan.topics[0].id]});
  assert.equal(page.data.result?.structuredContent?.pages?.[0]?.parts?.[0]?.text,'Exact learner example');
  const missing=await invoke(other,'get_project_learning_outline',{projectId:pid});
  assert.ok(missing.data.result?.isError||missing.data.error||missing.data.result?.structuredContent?.code);
  const params={mode:'preview',projectId:pid,expectedGeneration:owner.generation,expectedProjectRev:1,
   operationId:'music-followup-new',layoutId:'messages',title:'Music follow-up',
   parts:[{id:'try',kind:'paragraph',text:'Play a new short phrase'}],
   pages:[{id:'try',title:'Short practice',layoutId:'practice',purpose:'practice',contextId:'music',
    contextTitle:'Music and interests',partIds:['try'],
    relations:[{kind:'practises',target:{sectionId:'source',partId:'original'}}],
    continuation:{target:{sectionId:'learning-music-followup-new',partId:'try'},label:'Try this next'}}]
  };
  const preview=await invoke(owner,'append_project_learning_material',params);
  assert.equal(preview.data.result?.structuredContent?.valid,true,JSON.stringify(preview.data));
  const unchanged=await owner.request('/api/projects/composition?projectId='+pid);
  assert.equal(unchanged.data.revision,1);
  const committed=await invoke(owner,'append_project_learning_material',{...params,mode:'apply'});
  assert.equal(committed.data.result?.structuredContent?.status,'committed',JSON.stringify(committed.data));
  const replay=await invoke(owner,'append_project_learning_material',{...params,mode:'apply'});
  assert.equal(replay.data.result?.structuredContent?.replayed,true,JSON.stringify(replay.data));
  const saved=await owner.request('/api/projects/composition?projectId='+pid);
  assert.equal(saved.data.revision,2);
  assert.deepEqual(saved.data.record.sections.find(s=>s.id==='source'),source[0]);
  assert.equal(saved.data.record.sections.find(s=>s.id==='learning-music-followup-new').parts[0].text,'Play a new short phrase');
  const again=await invoke(owner,'get_project_learning_outline',{projectId:pid});
  assert.equal(again.data.result?.structuredContent?.contexts.some(x=>x.id==='music'),true);
  const current=again.data.result.structuredContent;
  const context=await invoke(owner,'get_project_learning_reading',{projectId:pid,contextId:'music'});
  assert.equal(context.data.result?.structuredContent?.pages?.length,1);
  const stale=await invoke(owner,'append_project_learning_material',{...params,operationId:'stale-new',mode:'apply'});
  assert.ok(stale.data.result?.isError||stale.data.error||stale.data.result?.structuredContent?.code);
  const old=await invoke(owner,'get_project_learning_outline',{projectId:pid,revision:1});
  assert.equal(old.data.result?.structuredContent?.project.rev,1);
  const bad=await invoke(owner,'get_project_learning_reading',{projectId:pid,topicIds:['unknown:page']});
  assert.ok(bad.data.result?.isError||bad.data.error||bad.data.result?.structuredContent?.code);
 }finally{await f.dispose();}
});

test('targeted Project authoring extends one exact existing context and keeps source and destination identities distinct',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=f.client('targeted-owner'),pid='targeted-context';
  const project={version:1,sections:[{id:'language-layout',title:'Grammar',pattern:'guide',slots:[{id:'primary',role:'primary',blockIds:['grammar-block']}]}],blocks:[{id:'grammar-block',sectionId:'grammar-source',readingPages:[{id:'grammar-page',title:'て-form',contextId:'te-form',contextTitle:'て-form',purpose:'explanation',partIds:['rule']}]}]};
  await owner.command({action:'create',family:'journey',id:pid,data:{title:'Japanese practice',body:'',sections:[{id:'grammar-source',title:'Grammar',parts:[{id:'rule',kind:'paragraph',text:'Connect actions with て-form.'}]}],projectComposition:project}});
  const article=(await owner.command({action:'create',family:'article',id:'te-form-resource',data:{title:'TEST ONLY · て-form reference',body:'Reusable grammar coverage.',synthetic:true,sections:[{id:'article-section',title:'Examples',parts:[{id:'example',kind:'paragraph',text:'ドアを開けてください。'}]}]}})).data.record;
  const before=(await owner.request('/api/projects/composition?projectId='+pid)).data.record;
  const args={mode:'preview',projectId:pid,expectedProjectRev:1,expectedGeneration:owner.generation,operationId:'extend-existing-te-form',source:{blockId:'grammar-block',pageId:'grammar-page',contextId:'te-form'},explicitOverrideIds:['grammar-block'],
   parts:[{id:'new-example',kind:'paragraph',text:'朝ご飯を食べて、学校へ行きます。'},{id:'new-activity',kind:'interactive',text:'Choose the correct connection',interactive:{version:1,type:'language-pattern',language:'ja',slots:[{id:'action',label:'Action',choices:[{id:'brush',label:'Brush my teeth'},{id:'eat',label:'Eat breakfast'}]}],examples:[{id:'brush-example',choices:{action:'brush'},source:{text:'歯を磨いて、寝ます。',translation:'I brush my teeth and go to bed.',language:'ja'}}]}}],
   relations:[{kind:'explains',target:{sectionId:'grammar-source',partId:'rule'}}],
   references:[{family:'article',id:article.id,rendition:article.rendition,sectionId:'article-section',partId:'example',relation:'explains',reason:'Reusable reference for the same grammar point.'}]};
  const preview=await invoke(owner,'update_project_learning_material',args);
  assert.equal(preview.data.result?.structuredContent?.valid,true,JSON.stringify(preview.data));
  assert.deepEqual((await owner.request('/api/projects/composition?projectId='+pid)).data.record,before,'preview must be read-only');
  const applied=await invoke(owner,'update_project_learning_material',{...args,mode:'apply'});
  assert.equal(applied.data.result?.structuredContent?.status,'committed',JSON.stringify(applied.data));
  const replay=await invoke(owner,'update_project_learning_material',{...args,mode:'apply'});
  assert.equal(replay.data.result?.structuredContent?.replayed,true,JSON.stringify(replay.data));
  const retained=(await owner.request('/api/projects/composition?projectId='+pid+'&revision=1')).data;
  assert.equal(retained.revision,1);
  assert.deepEqual(retained.record.sections.find(s=>s.id==='grammar-source').parts.map(part=>part.id),['rule']);
  assert.equal(retained.record.links.some(link=>link.id===article.id),false);
  const after=(await owner.request('/api/projects/composition?projectId='+pid)).data;
  assert.equal(after.revision,2);
  assert.equal(after.record.sections.find(s=>s.id==='grammar-source').parts.find(p=>p.id==='rule').text,'Connect actions with て-form.');
  assert.equal(after.record.sections.find(s=>s.id==='grammar-source').parts.find(p=>p.id==='new-example').text,'朝ご飯を食べて、学校へ行きます。');
  const activity=after.record.sections.find(s=>s.id==='grammar-source').parts.find(p=>p.id==='new-activity');
  assert.equal(activity.interactive.type,'language-pattern');
  const page=after.composition.blocks.find(b=>b.id==='grammar-block').readingPages[0];
  assert.deepEqual(page.partIds,['rule','new-example','new-activity']);
  assert.equal(page.contextId,'te-form');
  assert.deepEqual(page.relations,[{kind:'explains',target:{sectionId:'grammar-source',partId:'rule'}}]);
  assert.deepEqual(page.references,[{family:'article',id:article.id,rendition:article.rendition,sectionId:'article-section',partId:'example',relation:'explains',reason:'Reusable reference for the same grammar point.'}]);
  const link=after.record.links.find(value=>value.id===article.id);
  assert.equal(link.sourceContext.sectionId,'grammar-source');
  assert.deepEqual({family:link.family,id:link.id,rendition:link.rendition,sectionId:link.sectionId,partId:link.partId},{family:'article',id:article.id,rendition:article.rendition,sectionId:'article-section',partId:'example'});
  const outline=await invoke(owner,'get_project_learning_outline',{projectId:pid});
  assert.equal(outline.data.result?.structuredContent?.topics.find(t=>t.id.includes('grammar-page'))?.partIds.length,3);
  assert.deepEqual(outline.data.result?.structuredContent?.topics.find(t=>t.id.includes('grammar-page'))?.references?.[0],page.references[0]);
  const exact=await invoke(owner,'get_project_learning_reading',{projectId:pid,contextId:'te-form'});
  assert.equal(exact.data.result?.structuredContent?.pages[0]?.parts.length,3);
  const metadata=await invoke(owner,'apply_project_update',{operationId:'itemise-metadata',expectedGeneration:owner.generation,projectId:pid,expectedProjectRev:2,title:'Japanese practice · revised',description:'A metadata-only test revision.',explicitOverrideIds:['grammar-block','title','description'],changes:[{op:'setFavourite',id:'grammar-block',favourite:true},{op:'setLayoutLock',id:'grammar-block',lock:'content'},{op:'setSection',id:'language-layout',collapsed:true}]});
  assert.equal(metadata.data.result?.structuredContent?.status,'committed',JSON.stringify(metadata.data));
  const history=await invoke(owner,'read_project_changes',{projectId:pid,limit:5});
  const currentChanges=history.data.result?.structuredContent?.revisions?.find(item=>item.revision===3)?.metadataChanges??[];
  for(const field of ['title','description','favourites','layout-section','layout-block'])assert.ok(currentChanges.some(change=>change.field===field),`Missing exact ${field} history: ${JSON.stringify(currentChanges)}`);
  const contentChanges=history.data.result?.structuredContent?.revisions?.find(item=>item.revision===2)?.metadataChanges??[];
  assert.ok(contentChanges.some(change=>change.field==='reading-page'&&change.change==='updated'));
  assert.ok(contentChanges.some(change=>change.field==='record-relationships'&&change.linked?.some(link=>link.id===article.id&&link.rendition===article.rendition&&link.sectionId==='article-section'&&link.partId==='example')));
  const wrongPage=await invoke(owner,'update_project_learning_material',{...args,mode:'apply',expectedProjectRev:3,operationId:'wrong-topic',source:{blockId:'grammar-block',pageId:'not-that-page',contextId:'te-form'}});
  assert.ok(JSON.stringify(wrongPage.data).includes('project_source_context_unavailable'));
  assert.equal((await owner.request('/api/projects/composition?projectId='+pid)).data.revision,3);
 }finally{await f.dispose();}
});

test('GPT Note writes are denied across MCP paths while learner Note editing and GPT reading remain available',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
  const owner=f.client('note-boundary-owner'),pid='note-boundary-project',noteId='learner-note';
  await owner.command({action:'create',family:'journey',id:pid,data:{title:'TEST ONLY project',body:'Original Project text'}});
  const created=await owner.command({action:'create',family:'note',id:noteId,data:{title:'Learner Note',body:'My own words.',synthetic:true}});
  assert.equal(created.data.status,'committed');
  const pinned=await owner.request('/api/notes/pin',{operationId:'learner-pin',expectedGeneration:owner.generation,noteId,expectedNoteRev:1,target:{family:'journey',id:pid},pinned:true});
  assert.equal(pinned.data.status,'committed');
  const noteBefore=(await owner.request('/api/context?family=note&id='+noteId)).data.record;
  assert.deepEqual(noteBefore.pagePins,[{family:'journey',id:pid}]);
  const noteCommand={operationId:'gpt-note-create',action:'create',family:'note',id:'gpt-note',data:{title:'Forbidden',body:'GPT text'}};
  const rejectedCommand=await invoke(owner,'apply_minamo_command',{command:noteCommand});
  assert.ok(JSON.stringify(rejectedCommand.data).includes('gpt_note_authoring_forbidden'));
  const rejectedBatch=await invoke(owner,'apply_project_update',{operationId:'gpt-note-batch',expectedGeneration:owner.generation,projectId:pid,expectedProjectRev:1,noteChanges:[{id:'gpt-note',expectedRev:0,title:'Forbidden',body:'Fallback'}]});
  assert.ok(JSON.stringify(rejectedBatch.data).includes('gpt_note_authoring_forbidden'));
  const rejectedPin=await invoke(owner,'set_note_page_pin',{operationId:'gpt-note-pin',expectedGeneration:owner.generation,noteId,expectedNoteRev:2,target:{family:'journey',id:pid},pinned:false});
  assert.ok(JSON.stringify(rejectedPin.data).includes('gpt_note_authoring_forbidden'));
  const rejectedUpdate=await invoke(owner,'record_minamo_learning_update',{intent:'explicit-user-update',expectedGeneration:owner.generation,operationId:'gpt-note-update',proposed:{note:{title:'Forbidden',body:'GPT text'},development:{summary:'No write'}}});
  assert.ok(JSON.stringify(rejectedUpdate.data).includes('gpt_note_authoring_forbidden'));
  const read=await invoke(owner,'read_minamo_record',{family:'note',id:noteId});
  assert.equal(read.data.result?.structuredContent?.record?.body,'My own words.');
  const list=await owner.request('/mcp',{jsonrpc:'2.0',id:'note-tools-list',method:'tools/list'});
  const exposed=list.data.result.tools.map(tool=>tool.name);
  assert.ok(!exposed.includes('record_minamo_learning_update'));
  assert.ok(!exposed.includes('set_note_page_pin'));
  assert.ok(!(await owner.request('/api/context?family=note&id=gpt-note')).data.record);
  const noteAfter=(await owner.request('/api/context?family=note&id='+noteId)).data.record;
  assert.deepEqual(noteAfter.pagePins,[{family:'journey',id:pid}]);
  assert.equal(noteAfter.rev,2);
  const projectAfter=await owner.request('/api/projects/composition?projectId='+pid);
  assert.equal(projectAfter.data.revision,1);
  assert.equal((await owner.request('/api/notes/pin',{operationId:'learner-unpin',expectedGeneration:owner.generation,noteId,expectedNoteRev:2,target:{family:'journey',id:pid},pinned:false})).data.status,'committed');
  const changed=await owner.request('/api/commands',{operationId:'learner-note-update',expectedGeneration:owner.generation,action:'update',family:'note',id:noteId,expectedRev:3,data:{body:'I updated my own words.'}});
  assert.equal(changed.data.status,'committed');
  assert.equal((await owner.request('/api/context?family=note&id='+noteId)).data.record.body,'I updated my own words.');
 }finally{await f.dispose();}
});
