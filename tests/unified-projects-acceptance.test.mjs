import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// These are synthetic HTTP acceptance checks, not hosted browser or real-account proof.
const worker=`import {domainHandler} from './lib/domain-handler.ts';import {isDomainPath} from './lib/domain-routes.ts';export default {fetch(request,env){return isDomainPath(new URL(request.url).pathname)?domainHandler(request,env):new Response('No production dispatch',{status:404});}}`;
const computing={version:1,spaces:['computing'],provenance:'authored'};
const languages={version:1,spaces:['languages'],languages:['ja'],provenance:'authored'};
const hrefParams=href=>new URL(href,'https://storage.test').searchParams;
test('Unified Projects actual HTTP projection preserves exact identities and read-only tenant boundaries',async t=>{
 const f=await privateStorageFixture(worker);
 try{
  const c=f.client('projects-acceptance-owner');
  const create=async(family,id,data)=>{const r=await c.command({action:'create',family,id,data:{synthetic:false,learningScope:computing,...data}});assert.equal(r.status,200,JSON.stringify(r.data));return r.data.record;};
  const sections=Array.from({length:25},(_,i)=>({id:'section-'+i,title:'Synthetic section '+i,parts:[{id:'text',kind:'paragraph',text:'CANONICAL_READING_ONLY_'+i}]}));
  const route=await create('journey','acceptance-project',{title:'Synthetic acceptance Project',body:'Authored brief.',sections,learningShape:{version:1,kind:'journey',stages:sections.map((s,i)=>({id:'stable-step-'+i,sectionId:s.id,title:'Step '+(i+1)}))}});
  const article=await create('article','acceptance-library',{title:'Synthetic reusable reference',body:'LIBRARY_FULL_MANUSCRIPT_MUST_STAY_LAZY',sections:[{id:'reference-section',title:'Reference',parts:[{id:'reference-part',kind:'paragraph',text:'Reusable detail.'}]}]});
  const independent=await create('investigation','acceptance-independent',{title:'Synthetic independent question',body:'Independent inquiry.',learningShape:{version:2,kind:'investigation',question:'How can I inspect this?'}});
  const exactLibrary={family:'article',id:article.id,rendition:article.rendition,sectionId:'reference-section',partId:'reference-part',relation:'supports'};
  for(let i=0;i<25;i++)await create('investigation','acceptance-question-'+i,{title:'Synthetic question '+(i+1),body:'QUESTION_FULL_MANUSCRIPT_'+i,learningShape:{version:2,kind:'investigation',question:'What changes in case '+(i+1)+'?'},links:[{family:'journey',id:route.id,rendition:route.rendition,sectionId:'section-'+i,relation:'related'},...(i===24?[exactLibrary]:[])]});
  await create('investigation','acceptance-whole-question',{title:'Synthetic whole Project question',body:'Whole Project scope.',links:[{family:'journey',id:route.id,relation:'related'}]});
  await create('investigation','acceptance-japanese',{title:'SYNTHETIC_JAPANESE_PRIVATE_TITLE',body:'Japanese.',learningScope:languages});
  const base='/api/project-context?'+new URLSearchParams({projectId:route.id,mode:'outline',learningSpace:'computing',limit:'7'});
  const fullOutline=async()=>{let cursor,final,steps=new Map(),questions=new Map(),pages=0;do{const r=await c.request(base+(cursor?'&cursor='+encodeURIComponent(cursor):''));assert.equal(r.status,200,JSON.stringify(r.data));final=r.data;pages++;for(const s of final.steps){const old=steps.get(s.stageId);steps.set(s.stageId,{...s,questions:[...new Map([...(old?.questions??[]),...s.questions].map(q=>[q.id,q])).values()]});}for(const q of final.projectQuestions)questions.set(q.id,q);cursor=final.relationshipCoverage.nextCursor;assert.ok(pages<20,'bounded cursor made progress');}while(cursor);return {...final,steps:[...steps.values()],projectQuestions:[...questions.values()],pages};};
  await t.test('protected production route exists, rejects writes and fences generation',async()=>{
   assert.equal((await f.mf.dispatchFetch('https://storage.test/api/project-context?mode=independent')).status,401);
   assert.equal((await c.request('/api/project-context',{mode:'independent'})).status,405);
   assert.equal((await c.request(base,undefined,{headers:{'x-minamo-generation':'stale@1'}})).status,409);
   assert.equal((await f.client('another-owner').request(base)).status,404);
  });
  await t.test('25 untouched linked Questions remain visible with true Step placement and complete paging',async()=>{
   const outline=await fullOutline();assert.equal(outline.steps.length,25);assert.equal(outline.relationshipCoverage.complete,true);
   for(let i=0;i<25;i++){const step=outline.steps[i];assert.equal(step.stageId,'stable-step-'+i);assert.ok(step.questions.some(q=>q.id==='acceptance-question-'+i));assert.equal(hrefParams(step.destination).get('stage'),step.stageId);assert.equal(hrefParams(step.destination).get('rendition'),route.rendition);}
   assert.deepEqual(outline.projectQuestions.map(q=>q.id),['acceptance-whole-question']);
   const wire=JSON.stringify(outline);assert.doesNotMatch(wire,/LIBRARY_FULL_MANUSCRIPT|QUESTION_FULL_MANUSCRIPT|CANONICAL_READING_ONLY|SYNTHETIC_JAPANESE_PRIVATE_TITLE/);
   assert.equal(outline.continuation?.basis,'start');assert.equal(hrefParams(outline.continuation.destination).get('stage'),'stable-step-0');
  });
  await t.test('independent discovery uses server relations beyond the first incoming page',async()=>{
   const ids=new Set();let cursor,pages=0;do{const r=await c.request('/api/project-context?'+new URLSearchParams({mode:'independent',learningSpace:'computing',limit:'5',...(cursor?{cursor}:{})}));assert.equal(r.status,200,JSON.stringify(r.data));for(const q of r.data.questions)ids.add(q.id);cursor=r.data.relationshipCoverage.nextCursor;assert.ok(++pages<30);}while(cursor);
   assert.ok(ids.has(independent.id));assert.ok(!ids.has('acceptance-question-24'));assert.ok(!ids.has('acceptance-whole-question'));assert.ok(!ids.has('acceptance-japanese'));
  });
  await t.test('Resources preserve exact edition and passage through a linked Question',async()=>{
   const found=[];let cursor,pages=0;do{const r=await c.request('/api/project-context?'+new URLSearchParams({projectId:route.id,mode:'resources',learningSpace:'computing',limit:'7',...(cursor?{cursor}:{})}));assert.equal(r.status,200,JSON.stringify(r.data));found.push(...r.data.resources);cursor=r.data.relationshipCoverage.nextCursor;assert.ok(++pages<30);}while(cursor);
   const resource=found.find(r=>r.id===article.id);assert.ok(resource,'Library linked through Step 25 question is discovered');const p=hrefParams(resource.destination);for(const [name,value]of Object.entries({family:'article',id:article.id,rendition:article.rendition,section:'reference-section',part:'reference-part'}))assert.equal(p.get(name),value);assert.ok(resource.provenance.some(p=>p.questionId==='acceptance-question-24'));
  });
  await t.test('same exact Library reading is one resource with whole-Project and Question origins',async()=>{
   const secondary=await create('journey','dedup-project',{title:'Synthetic resource dedup Project',body:'Authored purpose.',sections:[sections[0]],learningShape:{version:1,kind:'journey',stages:[{id:'dedup-step',sectionId:sections[0].id,title:'One step'}]},links:[exactLibrary]});
   const q=await create('investigation','dedup-question',{title:'Synthetic resource dedup question',body:'A separate inquiry.',links:[exactLibrary]});
   const revised=await c.command({action:'update',family:'journey',id:secondary.id,expectedRev:secondary.rev,data:{links:[exactLibrary,{family:'investigation',id:q.id,sourceContext:{stageId:'dedup-step'}}]}});assert.equal(revised.status,200,JSON.stringify(revised.data));
   const r=await c.request('/api/project-context?'+new URLSearchParams({projectId:secondary.id,mode:'resources',learningSpace:'computing'}));assert.equal(r.status,200,JSON.stringify(r.data));
   const matching=r.data.resources.filter(resource=>resource.id===article.id);assert.equal(matching.length,1,'navigation return context must not duplicate one canonical reading');assert.ok(matching[0].provenance.some(p=>p.sourceFamily==='journey'));assert.ok(matching[0].provenance.some(p=>p.questionId===q.id));
  });
  await t.test('incoming Question checkpoint and ambiguous later Note keep exact UI, Home and natural GPT continuation',async()=>{
   const target={kind:'investigation',investigationId:'acceptance-question-24'};
   const saved=await c.request('/api/learning-developments',{operationId:'acceptance-exact-question-checkpoint',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1,development:{summary:'Synthetic checkpoint on the original Question identity.',kind:'learning-update',facts:[{role:'reported-observation',text:'Synthetic learner report.',basis:'learner-reported'}],nextAction:'Inspect case 25 independently.',nextQuestions:[]}});assert.equal(saved.status,200,JSON.stringify(saved.data));
   // A later Note tied equally to two stable Steps must not silently pick one.
   await create('note','acceptance-ambiguous-note',{title:'Synthetic ambiguous Note',body:'I have not yet chosen between these two paths.',links:[{family:'journey',id:route.id,rendition:route.rendition,sectionId:'section-2'},{family:'journey',id:route.id,rendition:route.rendition,sectionId:'section-22'}]});
   const outline=await fullOutline();assert.equal(outline.continuation.basis,'checkpoint');assert.deepEqual(outline.continuation.target,target);assert.equal(hrefParams(outline.continuation.destination).get('id'),target.investigationId);
   const home=await c.request('/api/learning-context?scope=home&learningSpace=computing');assert.equal(home.status,200,JSON.stringify(home.data));assert.deepEqual(home.data.continue[0].target,target);assert.equal(hrefParams(home.data.continue[0].destination).get('id'),target.investigationId);
   const query='Continue my Synthetic acceptance Project';
   const resumed=await c.request('/api/learning-context?'+new URLSearchParams({scope:'resume',query,learningSpace:'computing'}));assert.equal(resumed.status,200,JSON.stringify(resumed.data));assert.equal(resumed.data.resolution.status,'resolved');assert.equal(resumed.data.continuation.destination,outline.continuation.destination);assert.deepEqual(resumed.data.continuation.target,target);
   const mcp=await c.request('/mcp',{jsonrpc:'2.0',id:92,method:'tools/call',params:{name:'get_minamo_learning_context',arguments:{purpose:'Synthetic acceptance of exact Project continuation',scope:'resume',query,learningSpace:'computing',includeSynthetic:true}}});assert.equal(mcp.status,200);const wire=JSON.parse(mcp.data.result.content[0].text);assert.equal(wire.continuation.destination,outline.continuation.destination);assert.deepEqual(wire.continuation.target,target);
   const original=await c.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)}));assert.equal(original.data.resume.nextAction,'Inspect case 25 independently.');assert.equal(original.data.developments[0].id,'acceptance-exact-question-checkpoint');
  });
  await t.test('a Question is still discoverable when its only reverse parent loses source eligibility',async()=>{
   const text='PRIVATE_PARENT_SOURCE';
   const source=await create('source','reverse-parent-source',{title:'Synthetic parent source',body:'',source:{url:'https://example.invalid/parent',attribution:'Synthetic test only',rights:'permitted-excerpt',excerpt:{id:'excerpt',text,locator:'One',edition:'One',basis:'owner-authored',permissionNote:'Synthetic test only',ownerAttested:true,state:'permitted',exportAllowed:true}}});
   const q=await create('investigation','question-with-unavailable-parent',{title:'Synthetic surviving Question',body:'Independent original inquiry.'});
   await create('journey','source-restricted-parent',{title:'PRIVATE_UNAVAILABLE_PARENT_TITLE',body:'',links:[{family:'investigation',id:q.id}],sections:[{id:'source',title:'Source',parts:[{id:'excerpt',kind:'excerpt',text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:text.length}}]}]});
   const revoked=await c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}});assert.equal(revoked.status,200,JSON.stringify(revoked.data));
   const parents=await c.request('/api/project-context?'+new URLSearchParams({mode:'question',questionId:q.id,learningSpace:'computing'}));assert.equal(parents.status,200);assert.equal(parents.data.parents.length,0);assert.doesNotMatch(JSON.stringify(parents.data),/PRIVATE_PARENT_SOURCE|PRIVATE_UNAVAILABLE_PARENT_TITLE/);
   const ids=new Set();let cursor;do{const r=await c.request('/api/project-context?'+new URLSearchParams({mode:'independent',learningSpace:'computing',limit:'50',...(cursor?{cursor}:{})}));assert.equal(r.status,200);for(const item of r.data.questions)ids.add(item.id);cursor=r.data.relationshipCoverage.nextCursor;}while(cursor);assert.ok(ids.has(q.id),'eligible Question must remain discoverable when all parents are unavailable');
  });
  await t.test('ordinary outline, resource and independent reads preserve canonical records, receipts and saved evidence',async()=>{
   const digest=async()=>JSON.stringify(await Promise.all(['SELECT owner,family,id,rev,data FROM v2_records ORDER BY owner,family,id','SELECT owner,id,hash,response FROM v2_operations ORDER BY owner,id','SELECT owner,id,revision,event_json FROM v2_learning_developments ORDER BY owner,id'].map(async sql=>(await f.db.prepare(sql).all()).results)));
   const before=await digest();await fullOutline();await c.request('/api/project-context?projectId='+route.id+'&mode=resources');await c.request('/api/project-context?mode=independent');assert.equal(await digest(),before);
   const retained=await c.context('journey',route.id,route.rendition);assert.equal(retained.status,200);assert.equal(retained.data.record.rendition,route.rendition);assert.equal(retained.data.record.sections[24].parts[0].text,'CANONICAL_READING_ONLY_24');
  });
 }finally{await f.dispose();}
});
