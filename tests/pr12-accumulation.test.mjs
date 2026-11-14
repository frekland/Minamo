import test from 'node:test';
import assert from 'node:assert/strict';
import {pr12CorpusFixture,corpusRecords} from './pr12-corpus-fixture.mjs';
const purpose={requestPurpose:'Owner-authorised PR12 end-to-end isolated acceptance'};
const identity=(operationId,expectedRevision=0)=>({expectedGeneration:'legacy@0',operationId,expectedRevision});
async function mcp(client,name,args){const response=await client.request('/mcp',{jsonrpc:'2.0',id:'test',method:'tools/call',params:{name,arguments:{...purpose,...args}}});const rpc=response.data;if(rpc.error)return {error:rpc.error};const result=rpc.result;return result.structuredContent??JSON.parse(result.content.find(c=>c.type==='text').text)}
test('MCP complete retain → discover → arrange → evolve → history, immutable originals, CAS/retry and rights',async()=>{
 const f=await pr12CorpusFixture();try{
 const input={...identity('pr12-retain-real'),title:'Piano and listening',language:'ja',items:[{title:'Original supplied attempt',author:'user',role:'attempt',origin:{description:'Explicit fixture excerpt, not an invented chat'},parts:[{kind:'paragraph',text:'ピアノを聴くのが好きです。'}]},{title:'Correction',author:'gpt',role:'correction',parts:[{kind:'paragraph',text:'Playing is 弾く; listening is 聴く. This is a supplied correction, not observed mastery.'},{kind:'table',table:{headers:['Verb','Meaning'],rows:[['弾く','Play an instrument'],['聴く','Listen']]}},{kind:'interactive',text:'Supplied practice cards',interactive:{version:1,type:'flashcards',cards:[{id:'piano',front:{text:'Play piano'},back:{text:'ピアノを弾く'}}]}}]}]};
 const retained=await mcp(f.reader,'retain_minamo_material',input);assert.equal(retained.status,'committed',JSON.stringify(retained));const id=retained.materialId;
 const first=(await f.reader.context('work',id)).data.record;assert.equal(first.sections.length,2);assert.equal(first.experience.kind,'material');assert.equal(first.links.length,0);assert.equal(first.sections[1].parts[1].kind,'table');assert.equal(first.sections[1].parts[2].interactive.cards[0].id,'piano');
 const replay=await mcp(f.reader,'retain_minamo_material',input);assert.equal(replay.replayed,true,JSON.stringify(replay));assert.equal((await f.reader.context('work',id)).data.record.rev,1);
 const append={...identity('pr12-retain-append',1),materialId:id,title:first.title,items:[{title:'Later development',author:'user',role:'observation',parts:[{kind:'paragraph',text:'六か月後も音楽を聴いています。'}]}]};assert.equal((await mcp(f.reader,'retain_minamo_material',append)).status,'committed');
 assert.equal((await mcp(f.reader,'retain_minamo_material',{...append,operationId:'pr12-stale'})).status,'conflict');
 const updated=(await f.reader.context('work',id)).data.record;assert.deepEqual(updated.sections.slice(0,2),first.sections);
 const rewrite=await f.reader.command({action:'update',family:'work',id,expectedRev:2,data:{sections:[{...updated.sections[0],parts:[{id:updated.sections[0].parts[0].id,kind:'paragraph',text:'changed'}]},...updated.sections.slice(1)]}});assert.equal(rewrite.status,400);
 let found;for(let i=0;i<10;i++){found=await mcp(f.reader,'discover_minamo_material',{query:'piano',limit:24});if(found.indexComplete)break;}
 assert.ok(found.entries.some(e=>e.ref.id===id),JSON.stringify(found));assert.ok(found.entries.some(e=>e.ref.id!==id));
 const ref={family:'work',id,rendition:first.rendition,sectionId:first.sections[0].id,partId:first.sections[0].parts[0].id,sourceRevision:2,policy:'pin'};
 const other=corpusRecords()[0];const sourceRef={family:other.family,id:other.id,rendition:other.rendition,sectionId:other.sections[0].id,partId:other.sections[0].parts[0].id,sourceRevision:other.rev,policy:'follow'};
 const save={...identity('pr12-arrange'),title:'Practice with context',purpose:'Compare actual wording and a later correction',presentation:'compare',entries:[ref,sourceRef]};
 const composition=await mcp(f.reader,'save_minamo_arrangement',save);assert.equal(composition.status,'committed',JSON.stringify(composition));
 assert.equal((await mcp(f.reader,'save_minamo_arrangement',save)).replayed,true);
 const read=await mcp(f.reader,'read_minamo_arrangement',{id:composition.arrangementId});assert.equal(read.entries[0].part.text,first.sections[0].parts[0].text);assert.equal(read.entries[0].newerAvailable,true);assert.equal(read.entries[1].status,'available');
 const evolved=await mcp(f.reader,'save_minamo_arrangement',{...save,...identity('pr12-evolve',1),arrangementId:composition.arrangementId,presentation:'practice',entries:[sourceRef,ref]});assert.equal(evolved.status,'committed');
 const history=await mcp(f.reader,'read_minamo_arrangement',{id:composition.arrangementId,revision:1});assert.equal(history.record.experience.presentation,'compare');assert.equal(history.entries[0].ref.id,id);
 const denied=await mcp(f.client('TEST-ONLY-other'),'read_minamo_arrangement',{id:composition.arrangementId});assert.ok(denied.error);
 await f.db.prepare('UPDATE v2_records SET trashed_at=? WHERE owner=? AND family=? AND id=?').bind('2026-11-14',f.owner,'journey',other.id).run();
 const revoked=await mcp(f.reader,'read_minamo_arrangement',{id:composition.arrangementId});assert.equal(revoked.entries[0].status,'unavailable');assert.equal(revoked.entries[1].status,'available');
 assert.equal((await f.reader.context('work',id)).data.record.rev,2);
 const schema=await f.reader.request('/mcp',{jsonrpc:'2.0',id:'tools',method:'tools/list'});const retain=schema.data.result.tools.find(t=>t.name==='retain_minamo_material');assert.equal(retain.inputSchema.properties.items.items.properties.parts.items.anyOf.length,11);
 }finally{await f.dispose()}
});
