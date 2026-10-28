import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(r,e){return domainHandler(r,{...e,MINAMO_ACTIVITY_STUDIO:r.headers.get("x-test-disabled")==="1"?"0":"1",MINAMO_LEARNING_ATLAS:"1"})}}';
const ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const cartridge=(blocks=[{id:'prompt',kind:'instruction',text:'Compare the exact original source.'}])=>({contract:'minamo.activity.v1',template:'walkthrough',intent:'Original synthetic integration exercise.',authorship:'original-exercise',blocks});

test('independent real D1 typed Activity/Attempt graph relationships retain exact editions without duplicated links',async t=>{
 const f=await privateStorageFixture(worker),c=f.client('independent-integration-owner');
 const graph=focus=>c.request('/api/learning-graph?'+new URLSearchParams({lens:'galaxy',includeSynthetic:'true',family:focus.family,id:focus.id}));
 try{
  const reference=ok(await c.command({action:'create',family:'note',id:'exact-native-reading',data:{title:'TEST ONLY native reading',body:'Original Unicode 😀 reference.',synthetic:true}})).record;
  const first=ok(await c.command({action:'create',family:'experiment',id:'typed-relationships',data:{title:'TEST ONLY typed relationships',synthetic:true,activity:cartridge([{id:'read',kind:'reading',ref:{family:'note',id:reference.id,rendition:reference.rendition,sectionId:'__article',partId:'__body'}}])}})).record;
  const target={family:'experiment',id:first.id,rendition:first.rendition};
  const attempt={contract:'minamo.attempt.v1',activity:target,state:'submitted',hintsRevealed:[],evidence:[],nextIntention:'Return to the exact earlier exercise.'};
  const legacy=ok(await c.command({action:'create',family:'run',id:'legacy-linked-attempt',data:{title:'TEST ONLY legacy Attempt',synthetic:true,evidence:'illustrative',links:[{family:'experiment',id:first.id}],attempt}})).record;
  const generic=ok(await c.command({action:'create',family:'run',id:'native-unlinked-attempt',data:{title:'TEST ONLY native Attempt',synthetic:true,evidence:'illustrative',attempt}})).record;
  const high=ok(await c.request('/api/activities/attempt',{purpose:'Independent exact-edition test.',operationId:'high-attempt',id:'high-level-attempt',title:'TEST ONLY high-level Attempt',synthetic:true,attempt})).record;
  const latest=ok(await c.command({action:'update',family:'experiment',id:first.id,expectedRev:first.rev,data:{activity:cartridge()}})).record;
  assert.notEqual(latest.rendition,first.rendition);
  await t.test('guarded high-level publication saves an exact Attempt relation',()=>assert.equal(high.links[0].rendition,first.rendition));
  await t.test('old saved links and native typed Attempts project the immutable target rather than latest',async()=>{
   for(const saved of [legacy,generic,high]){
    const g=ok(await graph(saved)),edge=g.edges.find(e=>e.from==='run:'+saved.id&&e.to==='experiment:'+first.id);
    assert.ok(edge,'Typed Attempt should have an edge without requiring duplicated links.');
    assert.equal(edge.destination.rendition,first.rendition);assert.equal(edge.historical,true);
    assert.equal(new URL(edge.href,'https://example.invalid').searchParams.get('rendition'),first.rendition);
   }
  });
  await t.test('reverse neighborhood discovers native typed Attempts and exact reading-only Activity links',async()=>{
   const g=ok(await graph(latest));assert.ok(g.nodes.some(n=>n.id==='run:'+generic.id));
   const next=ok(await c.command({action:'update',family:'experiment',id:first.id,expectedRev:latest.rev,data:{activity:first.activity}})).record;
   const fromReading=ok(await graph(reference)),edge=fromReading.edges.find(e=>e.from==='experiment:'+next.id&&e.to==='note:'+reference.id);
   assert.ok(edge);assert.equal(edge.destination.rendition,reference.rendition);assert.equal(edge.destination.partId,'__body');
   const before=await f.db.prepare('SELECT count(*) n FROM v2_records').first();await graph(next);assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_records').first()).n,before.n);
  });
  await t.test('old-client edits with Activity disabled preserve stored cartridge and exact Attempt metadata',async()=>{
   const existing=ok(await c.context('experiment',first.id)).record;
   const edit=ok(await c.request('/api/commands',{operationId:'disabled-old-client-edit',expectedGeneration:c.generation,action:'update',family:'experiment',id:first.id,expectedRev:existing.rev,data:{body:'Old-client plain editorial correction.'}},{headers:{'x-test-disabled':'1'}}));
   assert.equal(edit.record.activity,undefined);
   const visible=ok(await c.context('experiment',first.id)).record;assert.equal(visible.activity.contract,'minamo.activity.v1');
   const disabled=ok(await c.request('/api/context?family=run&id='+generic.id,undefined,{headers:{'x-test-disabled':'1'}}));assert.equal(disabled.record.attempt,undefined);
   const stored=JSON.parse((await f.db.prepare("SELECT data FROM v2_records WHERE owner=? AND family='run' AND id=?").bind(c.owner,generic.id).first()).data);assert.equal(stored.attempt.activity.rendition,first.rendition);
  });
  await t.test('revoked source suppresses typed reading relationships and invalidates the prior graph cursor',async()=>{
   const source=ok(await c.command({action:'create',family:'source',id:'graph-source',data:{title:'TEST ONLY graph source',synthetic:true,source:{url:'https://example.invalid/ref',attribution:'Synthetic owner',rights:'permitted-excerpt',excerpt:{id:'graph-grant',text:'PRIVATE SYNTHETIC SOURCE',locator:'Paragraph',edition:'1',basis:'owner-authored',permissionNote:'Original synthetic source',ownerAttested:true,state:'permitted',exportAllowed:true}}}})).record;
   const activity=ok(await c.command({action:'create',family:'experiment',id:'source-reading-activity',data:{title:'TEST ONLY source reading',synthetic:true,activity:cartridge([{id:'reading',kind:'reading',ref:{family:'source',id:source.id,rendition:source.rendition,sectionId:'__article',partId:'__excerpt'}}])}})).record;
   assert.equal(ok(await graph(activity)).edges.length,1);
   const page=ok(await c.request('/api/learning-graph?lens=galaxy&includeSynthetic=true&limit=1'));assert.ok(page.nextCursor);
   ok(await c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}}));
   const after=ok(await graph(activity));assert.equal(after.edges.length,0);assert.equal(after.nodes.some(n=>n.id==='source:'+source.id),false);assert.doesNotMatch(JSON.stringify(after),/PRIVATE SYNTHETIC SOURCE/);
   const stale=await c.request('/api/learning-graph?'+new URLSearchParams({lens:'galaxy',includeSynthetic:'true',limit:'1',cursor:page.nextCursor}));assert.equal(stale.status,409);assert.equal(stale.data.code,'graph_changed');
  });
 }finally{await f.dispose();}
});

test('independent exact Activity reading target variants use the same current owner projections',async()=>{
 const f=await privateStorageFixture(worker),c=f.client('independent-target-variants');
 try{
  for(const family of ['journey','investigation','article','area','note','source','experiment','run']){
   const target=ok(await c.command({action:'create',family,id:'variant-'+family,data:{title:'TEST ONLY '+family,body:'Exact original 😀 base.',synthetic:true}})).record;
   const activity=ok(await c.command({action:'create',family:'experiment',id:'reads-'+family,data:{title:'TEST ONLY reads '+family,synthetic:true,activity:cartridge([{id:'reading',kind:'reading',ref:{family,id:target.id,rendition:target.rendition,sectionId:'__article',partId:'__body'}}])}})).record;
   const g=ok(await c.request('/api/learning-graph?'+new URLSearchParams({lens:'galaxy',includeSynthetic:'true',family:'experiment',id:activity.id})));
   assert.equal(g.edges.length,1,family);assert.equal(g.edges[0].destination.rendition,target.rendition,family);
   ok(await c.command({action:'trash',family,id:target.id,expectedRev:target.rev}));
   const recheck=ok(await c.request('/api/activities/read?id='+activity.id));assert.equal(recheck.record.activity.blocks[0].kind,'instruction',family);
  }
 }finally{await f.dispose();}
});
