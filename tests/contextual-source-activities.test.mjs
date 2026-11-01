import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:request.headers.get("x-disabled")==="1"?"0":"1"})}}';
const ok=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
const cartridge=blocks=>({contract:'minamo.activity.v1',template:'walkthrough',intent:'Compare an exact original source.',authorship:'original-exercise',blocks});
const sourcePath=(source,extra={})=>'/api/activities/browse?'+new URLSearchParams({kind:'activities',includeSynthetic:'true',sourceFamily:source.family,sourceId:source.id,sourceRendition:source.rendition,...extra});

test('A01/A03/A04/A05: source-qualified Activity discovery checks actual D1 rights, typed links, edition and partial coverage',{timeout:60000},async t=>{
 const fixture=await privateStorageFixture(worker),c=fixture.client('source-discovery-owner'),other=fixture.client('source-discovery-other');
 try{
  const source=ok(await c.command({action:'create',family:'article',id:'article-e1',data:{title:'TEST ONLY source e1',body:'Source 😀 e1.',synthetic:true,sections:[{id:'s',title:'Exact section',parts:[{id:'p',kind:'paragraph',text:'😀 A Japanese example.'}]},{id:'other',title:'Another passage',parts:[{id:'other-p',kind:'paragraph',text:'A separate part of the same Article.'}]}]}})).record;
  const typed=ok(await c.command({action:'create',family:'experiment',id:'typed-source',data:{title:'TEST ONLY typed linked Activity',synthetic:true,activity:cartridge([{id:'read',kind:'reading',ref:{family:'article',id:source.id,rendition:source.rendition,sectionId:'s',partId:'p'}}])}})).record;
  const generic=ok(await c.command({action:'create',family:'experiment',id:'generic-source',data:{title:'TEST ONLY generic linked Activity',synthetic:true,links:[{family:'article',id:source.id,rendition:source.rendition}],activity:cartridge([{id:'guide',kind:'instruction',text:'Original independent instructions.'}])}})).record;
  const edition2=ok(await c.command({action:'update',family:'article',id:source.id,expectedRev:source.rev,data:{body:'Source e2 has replaced e1.'}})).record;
  const newer=ok(await c.command({action:'create',family:'experiment',id:'new-source',data:{title:'TEST ONLY newer edition Activity',synthetic:true,activity:cartridge([{id:'read',kind:'reading',ref:{family:'article',id:source.id,rendition:edition2.rendition,sectionId:'s',partId:'p'}}])}})).record;
  await t.test('old retained source finds typed-only and generic-link Activities, never silently e2',async()=>{
   const page=ok(await c.request(sourcePath(source,{sourceSection:'s',sourcePart:'p'})));
   assert.deepEqual(new Set(page.items.map(item=>item.record.id)),new Set([typed.id,generic.id]));
   assert.equal(page.items.find(item=>item.record.id===typed.id).sourceMatch.scope,'exact-part');
   assert.equal(page.items.find(item=>item.record.id===generic.id).sourceMatch.scope,'edition');
   const anotherPassage=ok(await c.request(sourcePath(source,{sourceSection:'other',sourcePart:'other-p'})));
   assert.deepEqual(new Set(anotherPassage.items.map(item=>item.record.id)),new Set([typed.id,generic.id]));
   assert.equal(anotherPassage.items.find(item=>item.record.id===typed.id).sourceMatch.scope,'edition','a different passage must still reveal the Article-level Activity without claiming an exact match');
   assert.equal(page.source.rendition,source.rendition);assert.equal(page.nextCursor,null);
   assert.equal(JSON.stringify(page).includes('Source e2 has replaced'),false);
   const e2=ok(await c.request(sourcePath(edition2,{sourceSection:'s',sourcePart:'p'})));
   assert.deepEqual(e2.items.map(item=>item.record.id),[newer.id]);
   const selection={sectionId:'s',partId:'p',start:0,end:2},context=ok(await c.request('/api/context?'+new URLSearchParams({family:'article',id:source.id,rendition:source.rendition,selection:JSON.stringify(selection)})));
   assert.equal(context.record.rendition,source.rendition);assert.equal(context.selection.quote,'😀');
   assert.equal((await c.request('/api/context?'+new URLSearchParams({family:'article',id:source.id,rendition:source.rendition,selection:JSON.stringify({...selection,start:1})}))).status,409,'a split UTF-16 surrogate must not become a return cue');
  });
  await t.test('query is exact, scoped and feature-gated',async()=>{
   assert.equal((await c.request('/api/activities/browse?kind=activities&sourceId='+source.id)).status,400);
   assert.equal((await c.request(sourcePath(source,{sourceSection:'s',sourcePart:'no-such-part'}))).status,404);
   assert.equal((await c.request(sourcePath(source,{kind:'attempts'}))).status,400);
   assert.equal((await other.request(sourcePath(source))).status,404);
   assert.equal((await c.request(sourcePath(source),undefined,{headers:{'x-disabled':'1'}})).status,404);
   assert.equal((await c.request(sourcePath(source,{sourceSection:'another'}))).status,404,'invalid section must not be treated as complete empty');
  });
  await t.test('loss of source rights removes the qualified Activity result without exposing an old quote',async()=>{
   const countBefore=(await fixture.db.prepare('SELECT count(*) n FROM v2_records').first()).n;
   assert.equal(countBefore,4,'discovery is read-only');
   ok(await c.command({action:'trash',family:'article',id:source.id,expectedRev:edition2.rev}));
   const rejected=await c.request(sourcePath(source));assert.equal(rejected.status,404);
   assert.doesNotMatch(JSON.stringify(rejected.data),/Japanese example|source e1/);
  });
 }finally{await fixture.dispose();}
});
