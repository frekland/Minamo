import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`;
const ok=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const input=(operationId,documents)=>({purpose:'TEST ONLY manuscript identity and source lifecycle regression',operationId,expectedGeneration:'legacy@0',synthetic:true,manuscript:{version:1,brief:'TEST ONLY source: SECRET_SHARED_BRIEF. Preserve exact independent document and stage identities.',documents}});
const route=stages=>'# TEST ONLY — Stable Journey\n\n'+stages.map(([title,body])=>'## '+title+'\n\nIntent: Inspect '+title+'.\n\n'+body).join('\n\n');
const stages=[['Inspect Alpha','Alpha is a stable original reading.'],['Compare Beta','Beta is a distinct stable original reading.']];

test('keyed and omitted-key targeted manuscripts retain checkpoint, Note and bookmark stage identities across edits',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{for(const keyed of [false,true]){
  const c=fixture.client('synthetic-identity-'+keyed),doc=(markdown,target)=>({...keyed?{key:'route'}:{},role:'journey',markdown,...target?{target}:{}});
  const call=async(name,args)=>{const response=ok(await c.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:{purpose:'TEST ONLY exact manuscript regression',...args}}}));const value=JSON.parse(response.result.content[0].text);assert.notEqual(response.result.isError,true,JSON.stringify(value));return value;};
  const created=await call('publish_minamo_manuscript',input('identity-create',[doc(route(stages))]));assert.equal(created.status,'committed');
  let current=ok(await c.context('journey',created.recordRefs[0].id)).record;
  const original=structuredClone(current),alpha=current.learningShape.stages.find(s=>s.title==='Inspect Alpha'),beta=current.learningShape.stages.find(s=>s.title==='Compare Beta');
  const target={kind:'journey-stage',journeyId:current.id,stageId:alpha.id};
  const section=current.sections.find(s=>s.id===alpha.sectionId),part=section.parts.find(p=>p.text.includes('Alpha is'));
  const anchor={articleId:current.id,recordFamily:'journey',rendition:current.rendition,sectionId:section.id,partId:part.id,start:0,end:part.text.length,quote:part.text};
  ok(await c.request('/api/learning-developments',{operationId:'identity-checkpoint',intent:'explicit-user-checkpoint',expectedGeneration:'legacy@0',target,expectedTargetRev:1,development:{summary:'TEST ONLY checkpoint belongs to Inspect Alpha.',kind:'learning-update',facts:[{role:'open-question',text:'TEST ONLY inspect Alpha.',basis:'provisional'}],nextQuestions:[]}}));
  ok(await c.command({action:'create',family:'note',id:'alpha-note',data:{title:'TEST ONLY Alpha Note',body:'TEST ONLY retained thought',synthetic:true,anchor}}));
  ok(await c.command({action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0}));
  const variants=[[[ 'Prepare Gamma','Gamma is a new reading.'],...stages],[stages[1],stages[0],['Prepare Gamma','Gamma is a new reading.']],[stages[1],['Inspect renamed Alpha',stages[0][1]]],[stages[1]]];
  for(const [index,next] of variants.entries()){
   const ref={family:'journey',id:current.id,rev:current.rev},update=input('identity-update-'+index,[doc(route(next).replace('Intent: Inspect Inspect renamed Alpha.','Intent: Inspect Inspect Alpha.'),ref)]);update.existing=[{...ref,purpose:'targeted-update'}];
   assert.equal((await call('publish_minamo_manuscript',update)).status,'committed');current=ok(await c.context('journey',current.id)).record;
   assert.equal(current.learningShape.stages.find(s=>s.title==='Compare Beta').id,beta.id);
   if(index<3){assert.equal(current.learningShape.stages.find(s=>s.title.includes('Alpha')).id,alpha.id);assert.notEqual(current.learningShape.stages.find(s=>s.title==='Prepare Gamma')?.id,alpha.id);
    const context=ok(await c.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)})));assert.match(context.developments[0].summary,/Inspect Alpha/);
   }else assert.equal((await c.request('/api/learning-context?'+new URLSearchParams({scope:'target',target:JSON.stringify(target)}))).status,404);
   assert.deepEqual(ok(await c.context('note','alpha-note')).record.anchor,anchor);
   assert.equal(ok(await c.context('journey',original.id,original.rendition)).record.sections.find(s=>s.id===section.id).parts.find(p=>p.id===part.id).text,part.text);
   assert.equal(ok(await c.request('/api/bookmarks',{target:{kind:'passage',anchor}})).active,true);
  }
 }}finally{await fixture.dispose();}
});

test('partial manuscript source excludes unavailable siblings and shared brief through Trash, restore and permanent purge',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{const c=fixture.client('synthetic-source-lifecycle'),p=input('source-lifecycle',[{role:'article',markdown:'# TEST ONLY — Deleted sibling\n\nSECRET_DELETED_SIBLING explains a removed independent mechanism.'},{role:'article',markdown:'# TEST ONLY — Surviving sibling\n\nThe retained independent explanation remains editable after sibling removal.'}]);
 const published=ok(await c.request('/api/manuscripts/publish',p));assert.equal(published.status,'committed');
 const deleted=published.recordRefs[0],survivor=published.recordRefs[1],source=()=>c.request('/api/manuscripts/source?operationId='+p.operationId);
 assert.equal(ok(await source()).sourceProjection.partial,false);
 const trashed=ok(await c.command({action:'trash',family:deleted.family,id:deleted.id,expectedRev:1}));
 const assertPartial=async()=>{const projected=ok(await source());assert.equal(projected.sourceProjection.partial,true);assert.equal(projected.sourceProjection.omittedDocumentCount,1);assert.equal(projected.sourceProjection.sharedBriefWithheld,true);assert.equal(projected.manuscript.documents.length,1);assert.equal(projected.manuscript.documents[0].key,'document-2');assert.doesNotMatch(JSON.stringify(projected),/SECRET_DELETED_SIBLING|SECRET_SHARED_BRIEF/);assert.equal(projected.recordRefs[0].id,survivor.id);return projected;};
 await assertPartial();
 const restored=ok(await c.command({action:'restore',family:deleted.family,id:deleted.id,expectedRev:trashed.record.rev}));assert.equal(ok(await source()).manuscript.brief,p.manuscript.brief);
 ok(await c.command({action:'trash',family:deleted.family,id:deleted.id,expectedRev:restored.record.rev}));
 const snapshot=ok(await c.request('/api/trash/empty')).snapshot;ok(await c.request('/api/trash/empty',{operationId:'source-purge',expectedGeneration:'legacy@0',snapshot}));
 const projected=await assertPartial();const record=ok(await c.context('article',survivor.id)).record,target={family:'article',id:record.id,rev:record.rev},update=input('survivor-edit',[{...projected.manuscript.documents[0],target,markdown:projected.manuscript.documents[0].markdown+'\n\nAn explicit retained-source revision.'}]);update.existing=[{...target,purpose:'targeted-update'}];assert.equal(ok(await c.request('/api/manuscripts/publish',update)).status,'committed');
 assert.equal((await fixture.client('other-owner').request('/api/manuscripts/source?operationId='+p.operationId)).status,404);
 }finally{await fixture.dispose();}
});
