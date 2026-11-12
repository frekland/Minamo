import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async pending=>{const response=await pending;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const working=(client,input={})=>client.request('/api/learning-context',{scope:'working',...input});
const mcp=(client,input={})=>client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'get_minamo_working_context',arguments:{purpose:'Inspect explicitly selected evidence',...input}}});

test('A-INBOUND: a saved Note page pin is discovered from its Project without an extra manually authored link',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('pin-only-owner'),other=f.client('pin-only-other');
  const project=(await ok(c.command({action:'create',family:'journey',id:'pin-only-project',data:{title:'An evolving resolver question',body:'Actual Project text.',sections:[{id:'intro',title:'Evidence',parts:[{id:'p1',kind:'paragraph',text:'An unchanged address did not reveal the cache layer.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage-intro',sectionId:'intro',title:'Evidence'}]}}}))).record;
  const note=(await ok(c.command({action:'create',family:'note',id:'pin-only-note',data:{title:'A question I want to keep',body:'Could the resolver have returned the same address through a different path?',pagePins:[{family:'journey',id:project.id,rendition:project.rendition,sectionId:'intro',partId:'p1'}]}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const context=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.equal(context.evidence.items.some(item=>item.source.id===note.id&&item.paths.some(path=>path.edges.some(edge=>edge.partId==='p1'))),true,'a precise saved Note pin is a first-class incoming relationship');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before,'read creates no relation or activity');
  assert.deepEqual((await ok(working(other))).evidence.items,[],'another owner cannot discover the Note');
  const currentOnly=(await ok(c.command({action:'create',family:'note',id:'pin-only-current',data:{title:'Current passage only',body:'A separate draft about the same part.',pagePins:[{family:'journey',id:project.id,sectionId:'intro',partId:'p1'}]}}))).record;
  const withUnpinned=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.ok(withUnpinned.evidence.items.some(item=>item.source.id===currentOnly.id));
  const broad=withUnpinned.relations.find(item=>item.direction==='incoming'&&item.to.id===currentOnly.id);
  assert.ok(broad,'a section-labelled but edition-unpinned Note is still discoverable');
  assert.equal(new URL(broad.citedDestination,'https://example.invalid').searchParams.has('section'),false,'an unpinned page reference must not masquerade as an exact selected passage');
  assert.equal(new URL(broad.citedDestination,'https://example.invalid').searchParams.has('rendition'),false);
  await ok(c.command({action:'update',family:'journey',id:project.id,expectedRev:project.rev,data:{sections:[{id:'intro',title:'Evidence',parts:[{id:'p2',kind:'paragraph',text:'The original observation was withdrawn; no substitute reading is asserted.'}]}]}}));
  const revised=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.ok(revised.evidence.items.some(item=>item.source.id===note.id&&item.paths.some(path=>path.edges[0].rendition===project.rendition)),'a pinned earlier edition survives an unrelated Project revision');
  assert.equal(revised.evidence.items.some(item=>item.source.id===currentOnly.id),false,'a stale current-section pin cannot silently point at different content');
 }finally{await f.dispose();}
});

test('A-PREVIEW: section-authored Projects orient a new GPT read even when their legacy body is blank',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('section-preview-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'section-preview',data:{title:'A DNS question',body:'',sections:[{id:'s1',title:'Why we started',parts:[{id:'p1',kind:'paragraph',text:'Identical replies do not reveal which cache served them.'}]},{id:'s2',title:'A controlled Python model',parts:[{id:'p2',kind:'code',language:'python',text:'assert True'}]},{id:'s3',title:'What remains unknown',parts:[{id:'p3',kind:'paragraph',text:'The real resolver path has not been measured.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage-1',sectionId:'s1',title:'Why we started'}]},synthetic:true}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const context=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  const preview=context.selected[0].preview;
  assert.match(preview.text,/Sections: Why we started · A controlled Python model · What remains unknown/);
  assert.match(preview.text,/Identical replies do not reveal which cache served them/);
  assert.equal(preview.complete,false,'bounded orientation is not the complete canonical Project');
  assert.ok(preview.text.length<=450);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before,'retrieval cannot create a record');
 }finally{await f.dispose();}
});

test('A-CANONICAL: focused Project automatically exposes exact composition artefacts and older editions without duplicate links',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('composition-relations-owner'),other=f.client('composition-relations-other');
  const work=(await ok(c.command({action:'create',family:'work',id:'dns-work',data:{title:'A Python resolver script',body:'Supplied source, not an observed Run.',synthetic:false}}))).record;
  const composition={version:1,sections:[{id:'materials',title:'Source files',pattern:'workbench',slots:[{id:'primary',role:'primary',blockIds:['resolver']}]}],blocks:[{id:'resolver',ref:{family:'work',id:work.id,rendition:work.rendition}}]};
  const project=(await ok(c.command({action:'create',family:'journey',id:'dns-project',data:{title:'Investigating DNS responses',body:'No external execution has been verified.',sections:[{id:'intro',title:'Investigation',parts:[{id:'p',kind:'paragraph',text:'Compare source and output without assuming a successful run.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'s1',sectionId:'intro',title:'Investigation'}]},projectComposition:composition,synthetic:false}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const focused=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.deepEqual(focused.selected.map(s=>s.source?.id),[project.id]);
  assert.ok(focused.relations.some(edge=>edge.to.id===work.id&&edge.quality==='exact-edition'));
  assert.equal(focused.relations.find(edge=>edge.to.id===work.id).newerEdition,undefined,'no phantom newer edition');
  const updated=(await ok(c.command({action:'update',family:'work',id:work.id,expectedRev:work.rev,data:{body:'Revised code source; still not executed.'}}))).record;
  const after=await ok(mcp(c,{focus:{family:'journey',id:project.id}}));
  assert.equal(after.result.isError,false);
  const older=after.result.structuredContent.relations.find(edge=>edge.to.id===work.id);
  assert.equal(older.quality,'older-edition');assert.equal(older.to.rendition,work.rendition);
  assert.notEqual(updated.rendition,work.rendition);
  assert.deepEqual(older.newerEdition.source,{family:'work',id:work.id,rev:updated.rev,rendition:updated.rendition},'MCP returns an exact, separately admitted current edition without rewriting the saved citation');
  assert.match(older.newerEdition.destination,/work/);
  const compositionRead=await ok(c.request('/api/projects/composition?projectId='+project.id));
  assert.equal(compositionRead.references[0].record.rendition,work.rendition,'the original reference remains pinned');
  assert.equal(compositionRead.references[0].newerEdition.rev,updated.rev,'browser Project reads expose the newer edition');
  assert.equal((await other.request('/api/projects/composition?projectId='+project.id)).status,404,'a foreign owner cannot inspect the newer linked source');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before+1,'context reads create no records');
 }finally{await f.dispose();}
});

test('A-RICH-SOURCES: diagram citations and exact excerpts connect creative/research Projects to admitted Library editions without invented relationships',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('rich-citation-owner'),other=f.client('rich-citation-other');
  const article=(await ok(c.command({action:'create',family:'article',id:'frame-reference',data:{title:'Light and visual attention',body:'An authored reference, not independent verification.',synthetic:true}}))).record;
  const source=(await ok(c.command({action:'create',family:'source',id:'frame-excerpt',data:{title:'An admitted excerpt',body:'',synthetic:true,source:{url:'https://example.invalid/composition',attribution:'Synthetic source',rights:'permitted-excerpt',excerpt:{id:'ex',text:'Contrast can draw attention.',locator:'Synthetic section',edition:'1',basis:'owner-authored',permissionNote:'Local synthetic example',ownerAttested:true,state:'permitted',exportAllowed:true}}}}))).record;
  const unrelated=(await ok(c.command({action:'create',family:'article',id:'same-words-not-linked',data:{title:'Light and visual attention',body:'Same title; no saved citation.',synthetic:true}}))).record;
  const diagram={format:'graph-v1',nodes:[{id:'contrast',label:'High contrast',reference:{family:'article',id:article.id,rendition:article.rendition}},{id:'attention',label:'Attention'}],edges:[{from:'contrast',to:'attention',label:'proposed, unverified',reference:{family:'article',id:article.id,rendition:article.rendition}}]};
  const sections=[{id:'framing',title:'Framing and attention',parts:[{id:'figure',kind:'diagram',diagram},{id:'excerpt',kind:'excerpt',text:source.source.excerpt.text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:source.source.excerpt.text.length}}]}];
  const project=(await ok(c.command({action:'create',family:'journey',id:'creative-rich-citations',data:{title:'An unresolved composition question',body:'Proposals only; no photographs or viewer observations.',synthetic:true,sections}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const page=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.deepEqual(new Set(page.relations.map(item=>item.to.id)),new Set([article.id,source.id]),'authored exact references are recognised without duplicate link commands');
  assert.equal(page.relations.filter(item=>item.to.id===article.id).length,1,'repeated citations to one exact edition do not create noisy duplicates');
  assert.equal(page.relations.some(item=>item.to.id===unrelated.id),false,'shared titles do not establish links');
  assert.equal(page.relations.find(item=>item.to.id===article.id).title,article.title,'source title is returned for human and GPT orientation');
  assert.match(page.relations.find(item=>item.to.id===article.id).reason,/Authored diagram citation from node/);
  assert.match(page.relations.find(item=>item.to.id===source.id).reason,/Exact Source edition quoted/);
  assert.deepEqual((await ok(working(other,{selectedRefs:[{family:'journey',id:project.id}]}))).selected.map(item=>item.status),['unavailable']);
  const revised=(await ok(c.command({action:'update',family:'article',id:article.id,expectedRev:article.rev,data:{body:'A revised interpretation, still not an independent test.'}}))).record;
  const older=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  const citation=older.relations.find(item=>item.to.id===article.id);
  assert.equal(citation.quality,'older-edition');assert.equal(citation.to.rendition,article.rendition);
  assert.equal(citation.newerEdition.source.rendition,revised.rendition,'a newer source is separately admitted; citation remains pinned');
  const revoked=(await ok(c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}}))).record;
  const rights=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  assert.equal(rights.relations.some(item=>item.to.id===source.id),false,'revoked source content is not returned through the old Project citation');
  assert.ok(revoked.rev>source.rev);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before+2,'all context reads are non-mutating');
 }finally{await f.dispose();}
});

test('A-INBOUND-LIBRARY: Project context discovers explicit incoming Article/Note citations, preserving original editions and rejecting lexical guesses',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('incoming-owner'),other=f.client('incoming-foreign');
  const project=(await ok(c.command({action:'create',family:'journey',id:'incoming-project',data:{title:'Comparing a garden pond model',body:'No biological outcome has been observed.',synthetic:true,sections:[{id:'hypothesis',title:'Possible influences',parts:[{id:'candidate',kind:'paragraph',text:'A rainfall timing hypothesis, not a field observation.'}]}]}}))).record;
  const original={family:'journey',id:project.id,rendition:project.rendition,sectionId:'hypothesis',partId:'candidate'};
  const article=(await ok(c.command({action:'create',family:'article',id:'incoming-article',data:{title:'Rainfall and measurement design',body:'A synthetic interpretation guide, not pond data.',synthetic:true,links:[original]}}))).record;
  const note=(await ok(c.command({action:'create',family:'note',id:'incoming-note',data:{title:'A provisional field question',body:'An unverified possibility.',synthetic:true,pagePins:[original]}}))).record;
  await ok(c.command({action:'create',family:'article',id:'incoming-unrelated',data:{title:'Comparing a garden pond model',body:'A title collision without a citation.',synthetic:true}}));
  const count=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const page=await ok(working(c,{focus:{family:'journey',id:project.id}}));
  const incoming=page.relations.filter(r=>r.direction==='incoming');
  assert.deepEqual(new Set(incoming.map(r=>r.to.id)),new Set([article.id,note.id]));
  assert.equal(incoming.every(r=>r.quality==='saved-inbound-record-link'&&r.citedProject?.rendition===project.rendition),true);
  assert.equal(incoming.every(r=>new URL(r.destination,'https://example.invalid').searchParams.get('rendition')===r.to.rendition),true,'an inbound source opens the exact admitted edition, not a mutable latest URL');
  assert.equal(page.relations.some(r=>r.to.id==='incoming-unrelated'),false,'name matching never establishes a relationship');
  assert.ok(incoming.find(r=>r.to.id===article.id).destination.includes('view=library'));
  assert.ok(page.evidence.items.some(r=>r.source.id===note.id),'existing Note evidence remains independently available');
  const later=(await ok(c.command({action:'update',family:'journey',id:project.id,expectedRev:project.rev,data:{sections:[{id:'hypothesis',title:'Possible influences',parts:[{id:'revised',kind:'paragraph',text:'The original proposed explanation has been withdrawn pending evidence.'}]}]}}))).record;
  const still=await ok(working(c,{focus:{family:'journey',id:later.id}}));
  assert.ok(still.relations.some(r=>r.to.id===article.id&&r.citedProject?.rendition===project.rendition),'inbound citation remains attached to the original retained Project edition');
  assert.equal(still.relations.some(r=>r.to.id===article.id&&r.citedProject?.rendition===later.rendition),false,'old citation does not silently become the new edition');
  assert.equal((await ok(working(other,{selectedRefs:[{family:'journey',id:project.id}]}))).relations.length,0,'no foreign owner link disclosure');
  await ok(c.command({action:'trash',family:'article',id:article.id,expectedRev:article.rev}));
  assert.equal((await ok(working(c,{focus:{family:'journey',id:later.id}}))).relations.some(r=>r.to.id===article.id),false,'trashed incoming source disappears');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,count+2,'relationship reads do not write operations');
 }finally{await f.dispose();}
});

test('A-READ: a blank or projectless selection reads independent writing without creating an episode, link or operation',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-independent'),other=f.client('working-other');
  const note=(await ok(c.command({action:'create',family:'note',id:'capture-free',data:{title:'An independent observation',body:'An unresolved question.',synthetic:false}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const blank=await ok(working(c));
  assert.equal(blank.contract,'minamo.working-context.v1');assert.deepEqual(blank.selected,[]);assert.equal(blank.selectionIsSaved,false);
  assert.ok(blank.evidence.items.some(item=>item.source.id===note.id));assert.equal(blank.lastSeenByGpt,'unknown');
  const selected=await ok(working(c,{selectedRefs:[{family:'note',id:note.id}]}));
  assert.equal(selected.selected[0].title,note.title);assert.equal(selected.selected[0].source.rev,note.rev);
  assert.equal(selected.selected[0].status,'available');assert.deepEqual(selected.relations,[]);
  assert.deepEqual(selected.evidence.items,[],'a selected independent Note must not receive the global evidence feed');
  assert.match(selected.evidence.coverage.notice,/workspace-wide evidence feed was not searched/);
  const selectedMcp=await ok(mcp(c,{selectedRefs:[{family:'note',id:note.id}]}));
  assert.deepEqual(selectedMcp.result.structuredContent.evidence.items,[]);
  assert.equal((await working(c,{selectedRefs:[{family:'note',id:note.id}],origin:{v:1,task:{family:'investigation',id:'invented'}}})).status,400,'navigation metadata is not accepted as an authored graph relationship');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
  assert.equal((await ok(working(other))).selected.length,0);
  assert.deepEqual((await ok(working(other,{selectedRefs:[{family:'note',id:note.id}]}))).selected.map(item=>item.status),['unavailable']);
 }finally{await f.dispose();}
});

test('A-PATH: an admitted Project→Question→Note, two explicit Note targets and selected Note→Note→Question remain distinct',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-path-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'working-project',data:{title:'Optional Project guide',body:'Authored route.',synthetic:false,sections:[{id:'intro',title:'Stage',parts:[{id:'p',kind:'paragraph',text:'A stage.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage',sectionId:'intro',title:'Stage'}]}}}))).record;
  const q=(await ok(c.command({action:'create',family:'investigation',id:'working-question',data:{title:'Open task',body:'No settled answer.',synthetic:false,links:[{family:'journey',id:project.id,rendition:project.rendition}]}}))).record;
  const second=(await ok(c.command({action:'create',family:'note',id:'working-second',data:{title:'Second saved Note',body:'A later interpretation.',synthetic:false,links:[{family:'investigation',id:q.id}]}}))).record;
  const first=(await ok(c.command({action:'create',family:'note',id:'working-first',data:{title:'First saved Note',body:'A competing interpretation.',synthetic:false,links:[{family:'note',id:second.id},{family:'investigation',id:q.id}]}}))).record;
  const unrelated=(await ok(c.command({action:'create',family:'note',id:'working-unrelated',data:{title:'Not a relation',body:'Different notes.',synthetic:false}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const page=await ok(working(c,{focus:{family:'journey',id:project.id},selectedRefs:[{family:'note',id:first.id}]}));
  assert.deepEqual(new Set(page.evidence.items.map(item=>item.source.id)),new Set([first.id,second.id]));
  assert.deepEqual(new Set(page.evidence.items.find(item=>item.source.id===first.id).paths.map(path=>path.target.investigationId)),new Set([q.id]));
  assert.ok(page.relations.some(relation=>relation.to.id===second.id&&relation.path.length===1));
  assert.ok(page.relations.some(relation=>relation.to.id===q.id&&relation.path.length===2),'bounded Note→Note→Question is a verified path, not a guessed edge');
  assert.equal(page.relations.some(relation=>relation.to.id===unrelated.id),false);
  assert.equal(page.selectionIsSaved,false);assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
  const rpc=await ok(mcp(c,{focus:{family:'journey',id:project.id},selectedRefs:[{family:'note',id:first.id}]}));
  assert.equal(rpc.result.isError,false,JSON.stringify(rpc));assert.match(JSON.stringify(rpc),/minamo.working-context.v1/);
 }finally{await f.dispose();}
});

test('A-RIGHTS: pinned edition/selection, partial cursor, revised history and denied links fail closed',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('working-rights-owner'),other=f.client('working-rights-other');
  const e1=(await ok(c.command({action:'create',family:'article',id:'working-source',data:{title:'Edition source',body:'Edition one.',synthetic:false,sections:[{id:'s',title:'Reading',parts:[{id:'p',kind:'paragraph',text:'A 😀 retained statement.'}]}]}}))).record;
  const linked=(await ok(c.command({action:'create',family:'note',id:'working-linked',data:{title:'Saved exact relationship',body:'My interpretation.',synthetic:false,links:[{family:'article',id:e1.id,rendition:e1.rendition}]}}))).record;
  const e2=(await ok(c.command({action:'update',family:'article',id:e1.id,expectedRev:e1.rev,data:{body:'New edition.'}}))).record;
  await ok(c.command({action:'create',family:'note',id:'working-second-page',data:{title:'Another recorded Note',body:'This is not a link.',synthetic:false}}));
  const selectedRefs=[{family:'article',id:e1.id,rendition:e1.rendition,selection:{sectionId:'s',partId:'p',start:2,end:4}},{family:'article',id:e2.id,rendition:e2.rendition}];
  const page=await ok(working(c,{selectedRefs}));
  assert.equal(page.selected.length,2);assert.notEqual(page.selected[0].source.rendition,page.selected[1].source.rendition);
  assert.equal(page.selected[0].status,'available');assert.equal(page.selected[0].selection.start,2);
  assert.equal((await working(c,{selectedRefs:[{family:'article',id:e1.id,selection:selectedRefs[0].selection}]})).status,400);
  assert.equal((await working(c,{selectedRefs:[{family:'article',id:e1.id,rendition:e1.rendition,selection:{...selectedRefs[0].selection,start:3}}]})).status,409);
  assert.deepEqual((await ok(working(other,{selectedRefs}))).selected.map(x=>x.status),['unavailable','unavailable']);
  const start=await ok(working(c,{limit:1}));assert.ok(start.evidence.coverage.nextCursor);
  await ok(c.command({action:'trash',family:'article',id:e2.id,expectedRev:e2.rev}));
  assert.equal((await working(c,{limit:1,cursor:start.evidence.coverage.nextCursor})).status,409);
  const denied=await ok(working(c,{selectedRefs:[{family:'note',id:linked.id},{family:'article',id:e1.id,rendition:e1.rendition}]}));
  assert.equal(denied.selected[1].status,'unavailable');assert.equal(denied.relations.some(x=>x.to.id===e1.id),false);
  assert.doesNotMatch(JSON.stringify(denied),/A 😀 retained statement/);
 }finally{await f.dispose();}
});

test('A-BOUND: selected relation fan-out stays within query/byte limits and never claims complete coverage',{timeout:120000},async()=>{
 const measured=`import {domainHandler} from './lib/domain-handler.ts';export default {async fetch(request,env){let count=0;const db=env.DB;const response=await domainHandler(request,{...env,DB:{prepare(sql){count++;return db.prepare(sql)},batch(statements){return db.batch(statements)},exec(sql){return db.exec(sql)}}});response.headers.set('X-Test-Queries',String(count));return response;}};`;
 const f=await privateStorageFixture(measured);try{
  const c=f.client('working-bounded-owner'),links=[];
  for(let i=0;i<13;i++){
   const item=(await ok(c.command({action:'create',family:'note',id:'bounded-target-'+i,data:{title:'Target '+i,body:'A distinct saved observation.',synthetic:false}}))).record;
   links.push({family:'note',id:item.id});
  }
  const hub=(await ok(c.command({action:'create',family:'note',id:'bounded-hub',data:{title:'Hub Note',body:'The learner has selected this exact Note.',synthetic:false,links}}))).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
  const response=await c.request('/api/learning-context',{scope:'working',selectedRefs:[{family:'note',id:hub.id}],limit:1});
  const page=await ok(Promise.resolve(response));
  assert.equal(page.relations.length,12);assert.equal(page.coverage.moreRelations,true);assert.equal(page.coverage.completeWithinScope,false);
  assert.ok(page.coverage.gaps.includes('relations-deferred'));
  assert.ok(Number(response.headers.get('X-Test-Queries'))<=250,'one bounded view cannot issue unbounded D1 reads');
  assert.ok(new TextEncoder().encode(JSON.stringify(page)).length<=65536,'combined response is byte bounded');
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before);
 }finally{await f.dispose();}
});
