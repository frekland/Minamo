import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1",MINAMO_LEARNING_ATLAS:"1"});}}';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const call=async(c,name,args)=>{const r=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY scoped continuity acceptance',...((name==='get_minamo_learning_context'&&args.scope==='resume')||name==='query_minamo_records'?{includeSynthetic:true}:{}),...args}}}));assert.equal(r.result.isError,false,r.result.content[0].text);return JSON.parse(r.result.content[0].text);};
const scope=language=>({version:1,spaces:['languages'],languages:[language],provenance:'authored'});
const computing={version:1,spaces:['computing'],provenance:'authored'};
const create=async(c,family,id,title,learningScope,extra={})=>ok(await c.command({action:'create',family,id,data:{title,body:'Original TEST ONLY bounded fixture.',synthetic:true,learningScope,...extra}})).record;

test('scoped MCP title resolution preserves Phase I and prefers dedicated phase over repeated master stages',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-phase-resolution');try{
  const phase=await create(c,'journey','phase-one','TEST ONLY Bandit Phase I · shell foundations',computing,{sections:[{id:'s1',title:'Login',parts:[{id:'p1',kind:'paragraph',text:'Original login orientation.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'login',sectionId:'s1',title:'Login'}]}});
  await create(c,'journey','phase-two','TEST ONLY Bandit Phase II · network reasoning',computing);
  await create(c,'journey','master','TEST ONLY OverTheWire Bandit · complete route',computing,{sections:[{id:'s1',title:'Phase I',parts:[{id:'p1',kind:'paragraph',text:'Open the explicit first phase.'}]},{id:'s2',title:'Phase II',parts:[{id:'p2',kind:'paragraph',text:'Open the explicit second phase.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'one',sectionId:'s1',title:'Bandit Phase I'},{id:'two',sectionId:'s2',title:'Bandit Phase II'}]},links:[{family:'journey',id:phase.id,reason:'Explicit child phase.'}]});
  const result=await call(c,'get_minamo_learning_context',{scope:'resume',query:'Bandit Phase I',learningSpace:'computing'});
  assert.equal(result.resolution.status,'resolved');assert.equal(result.resolution.candidates.length,1);assert.equal(result.journey.id,phase.id);
  const master=await call(c,'get_minamo_learning_context',{scope:'resume',query:'TEST ONLY OverTheWire Bandit · complete route',learningSpace:'computing'});
  assert.ok(master.hierarchy.nodes.some(n=>n.id===phase.id&&n.kind==='journey'));assert.ok(master.hierarchy.edges.some(e=>e.to.id===phase.id&&e.reason==='Explicit child phase.'));
 }finally{await f.dispose();}
});

test('ordinary phase resumption excludes reciprocal parent and sibling hierarchies; a deliberate overview remains available',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-phase-hierarchy-isolation');try{
  const first=await create(c,'journey','phase-one','TEST ONLY Bandit Phase I · shell foundations',computing,{sections:[{id:'login',title:'First login',parts:[{id:'p',kind:'paragraph',text:'Original first-phase fixture.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'login',sectionId:'login',title:'First login'}]}});
  const second=await create(c,'journey','phase-two','TEST ONLY Bandit Phase II · network reasoning',computing);
  const question=await create(c,'investigation','phase-two-question','TEST ONLY What does a TCP observation prove?',computing,{links:[{family:'journey',id:second.id}]});
  const master=await create(c,'journey','master','TEST ONLY OverTheWire Bandit complete route',computing,{links:[{family:'journey',id:first.id},{family:'journey',id:second.id},{family:'investigation',id:question.id}]});
  ok(await c.command({action:'update',family:'journey',id:first.id,expectedRev:first.rev,data:{links:[{family:'journey',id:master.id,reason:'Return to the broader route.'}]}}));
  ok(await c.command({action:'update',family:'journey',id:second.id,expectedRev:second.rev,data:{links:[{family:'journey',id:master.id},{family:'investigation',id:question.id}]}}));
  const activity=(await call(c,'publish_minamo_activity_package',{operationId:'phase-one-activity',id:'shell-activity',title:'TEST ONLY Shell argument comparison',learningScope:computing,synthetic:true,links:[{family:'journey',id:first.id}],activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'Inspect an original synthetic shell argument fixture.',blocks:[{id:'predict',kind:'prediction',text:'Distinguish quoted argument boundaries.'}]}})).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_revisions').first()).n;
  const resumed=await call(c,'get_minamo_learning_context',{scope:'resume',query:'Bandit Phase I',learningSpace:'computing'});
  assert.equal(resumed.journey.id,first.id);assert.equal(resumed.contextBreadth,'focused-journey');assert.equal(resumed.broaderContext.deliberate,true);assert.ok(resumed.hierarchy.nodes.some(n=>n.id===activity.id));assert.ok(!resumed.hierarchy.nodes.some(n=>[master.id,second.id,question.id].includes(n.id)),'An ordinary exact phase request must not automatically traverse its parent into sibling phases.');
  const focused=await call(c,'get_minamo_learning_context',{scope:'resume',query:'Bandit Phase I First login',learningSpace:'computing'});assert.equal(focused.target.stageId,'login');assert.equal(focused.currentTask.id,first.id);assert.equal(focused.hierarchy,undefined);
  const explicit=await call(c,'get_minamo_learning_context',{scope:'journey',journeyId:first.id,learningSpace:'computing'});assert.ok(explicit.hierarchy.nodes.some(n=>n.id===second.id),'A deliberate whole-Journey hierarchy read preserves wider saved context.');
  const overview=await call(c,'get_minamo_learning_context',{scope:'resume',query:'TEST ONLY OverTheWire Bandit complete route',learningSpace:'computing'});assert.equal(overview.contextBreadth,'whole-journey-overview');assert.ok(overview.hierarchy.nodes.some(n=>n.id===first.id));assert.ok(overview.hierarchy.nodes.some(n=>n.id===second.id));
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_revisions').first()).n,before,'All scope comparisons are read-only.');
 }finally{await f.dispose();}
});

test('identical names stay ambiguous in All but resolve by exact language; cursors cannot cross scope',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-language-resolution');try{
  const ja=await create(c,'journey','ja-conversation','TEST ONLY First conversation',scope('ja'));
  await create(c,'journey','fr-conversation','TEST ONLY First conversation',scope('fr'));
  const all=await call(c,'get_minamo_learning_context',{scope:'resume',query:ja.title});assert.equal(all.resolution.status,'ambiguous');assert.equal(all.resolution.candidates.length,2);assert.deepEqual(new Set(all.resolution.candidates.flatMap(c=>c.learningScope.languages)),new Set(['ja','fr']));
  const chosen=await call(c,'get_minamo_learning_context',{scope:'resume',query:ja.title,language:'ja'});assert.equal(chosen.journey.id,ja.id);assert.equal(chosen.resolution.status,'resolved');
  await create(c,'journey','ja-more','TEST ONLY Another conversation',scope('ja'));
  const page=await call(c,'query_minamo_records',{family:'journey',language:'ja',limit:1});assert.equal(page.records.length,1);assert.ok(page.nextCursor);
  const mismatch=await c.request('/api/query?'+new URLSearchParams({family:'journey',language:'fr',limit:'1',cursor:page.nextCursor}));assert.equal(mismatch.status,400);assert.equal(mismatch.data.code,'cursor_scope_mismatch');
  const stranger=await call(f.client('TEST-ONLY-other-owner'),'get_minamo_learning_context',{scope:'resume',query:ja.title,language:'ja'});assert.equal(stranger.resolution.status,'not-found');
  const japanese=await create(c,'journey','ja-script-title','日本語の会話を始める',scope('ja'));
  const native=await call(c,'get_minamo_learning_context',{scope:'resume',query:'日本語',language:'ja'});assert.equal(native.journey.id,japanese.id);
  const french=await create(c,'journey','fr-accent-title','Écouter ensemble',scope('fr'));
  const decomposed=await call(c,'get_minamo_learning_context',{scope:'resume',query:'E\u0301couter',language:'fr'});assert.equal(decomposed.journey.id,french.id);
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n,0);
 }finally{await f.dispose();}
});

test('full project phrase discovers nonlexical Activity through saved child edges without writes',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-full-project-context');try{
  const question=await create(c,'investigation','tcp-question','TEST ONLY Which close ends the stream?',computing);
  const phase=await create(c,'journey','network-phase','TEST ONLY Bandit Phase II',computing,{links:[{family:'investigation',id:question.id,reason:'Explicit network question.'}]});
  const master=await create(c,'journey','bandit-route','TEST ONLY OverTheWire Bandit complete route',computing,{links:[{family:'journey',id:phase.id,reason:'Explicit phase.'}]});
  const activity=(await call(c,'publish_minamo_activity_package',{operationId:'full-project-activity',id:'bounded-stream',title:'TEST ONLY Three messages',learningScope:computing,synthetic:true,links:[{family:'investigation',id:question.id}],activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:'Interpret supplied finite stream data.',blocks:[{id:'predict',kind:'prediction',text:'What does the close event establish?'}]}})).record;
  const before=(await f.db.prepare('SELECT count(*) n FROM v2_revisions').first()).n;
  const context=await call(c,'get_minamo_activity_context',{query:'OverTheWire Bandit',learningSpace:'computing',includeSynthetic:true,limit:20});
  assert.ok(context.targets.some(r=>r.id===master.id));assert.ok(context.activities.some(r=>r.id===activity.id));
  assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_revisions').first()).n,before);
 }finally{await f.dispose();}
});

test('Home, Favourites, inherited Notes and Atlas apply language scope before pagination; sidecars preserve readings',{timeout:60000},async()=>{
 const f=await privateStorageFixture(worker),c=f.client('TEST-ONLY-home-scope');try{
  const ja=await create(c,'investigation','ja-question','TEST ONLY Japanese question',scope('ja'),{synthetic:false,learningShape:{version:2,kind:'investigation',question:'Which authored reading fits this sentence?'}});
  const fr=await create(c,'investigation','fr-question','TEST ONLY French question',scope('fr'),{synthetic:false,learningShape:{version:2,kind:'investigation',question:'Which authored agreement fits this sentence?'}});
  // Synthetic checkpoint fixtures test retrieval only; no genuine learner accomplishment is asserted.
  for(const record of [ja,fr]){
   ok(await c.request('/api/learning-developments',{intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',operationId:'checkpoint-'+record.id,target:{kind:'investigation',investigationId:record.id},expectedTargetRev:record.rev,development:{summary:'TEST ONLY supplied learner statement for '+record.id,facts:[{role:'open-question',basis:'learner-reported',text:'TEST ONLY what should be compared next?'}]}}));
   ok(await c.command({action:'setFlag',target:{kind:'record',family:'investigation',id:record.id},active:true,expectedTargetRev:0}));
  }
  const home=await call(c,'get_minamo_learning_context',{scope:'home',language:'ja',limit:1});
  assert.deepEqual(home.recent.map(item=>item.target.investigationId),[ja.id]);assert.deepEqual(home.favourites.map(item=>item.target.id),[ja.id]);assert.equal(home.cursor,undefined);assert.equal(home.favouritesCursor,undefined);
  const note=ok(await c.command({action:'create',family:'note',id:'inherited-note',data:{title:'TEST ONLY Later thought',body:'Keep uncertainty explicit.',synthetic:true,links:[{family:'investigation',id:ja.id}]}})).record;
  const notes=await call(c,'query_minamo_records',{personal:true,family:'note',language:'ja',limit:1});assert.deepEqual(notes.records.map(r=>r.id),[note.id]);assert.deepEqual(notes.records[0].learningScope.languages,['ja']);
  const graph=await call(c,'get_minamo_learning_graph',{language:'ja',lens:'galaxy',includeSynthetic:true,limit:20});assert.ok(graph.nodes.some(n=>n.destination.id===ja.id));assert.ok(!graph.nodes.some(n=>n.destination.id===fr.id));
  const legacy=ok(await c.command({action:'create',family:'journey',id:'legacy-unclassified',data:{title:'TEST ONLY Older saved route',body:'Exact historical bytes stay the same.',synthetic:true}})).record;
  const classified=ok(await c.command({action:'update',family:'journey',id:legacy.id,expectedRev:legacy.rev,data:{classifyLearningScope:{expectedScopeRev:0,learningScope:computing}}}));assert.equal(classified.status,'committed');
  const exact=(await call(c,'read_minamo_record',{family:'journey',id:legacy.id})).record;assert.equal(exact.rev,legacy.rev);assert.equal(exact.rendition,legacy.rendition);assert.equal(exact.learningScopeRev,1);
  const resumed=await call(c,'get_minamo_learning_context',{scope:'resume',query:legacy.title,learningSpace:'computing'});assert.equal(resumed.journey.id,legacy.id);
 }finally{await f.dispose();}
});
