import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async p=>{const r=await p;assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
const read=(c,refs,cursor)=>c.request('/api/learning-context',{scope:'working',selectedRefs:refs,...(cursor?{cursor}:{})});
test('standalone Article incoming references paginate without omissions; exact editions, foreign owners and stale cursors fail closed',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('relationship-owner'),other=f.client('relationship-other');
 const article=(await ok(c.command({action:'create',family:'article',id:'attention-reference',data:{title:'Attention method',body:'A proposed method, not measured evidence.',synthetic:true}}))).record;
 const refs=[{family:'article',id:article.id}];
 for(let i=0;i<27;i++)await ok(c.command({action:'create',family:'note',id:'attention-note-'+String(i).padStart(2,'0'),data:{title:'Comparison '+i,body:'GPT-authored hypothetical alternative.',synthetic:true,links:[{family:'article',id:article.id,rendition:article.rendition,reason:'Method used to frame this proposed comparison.'}]}}));
 await ok(c.command({action:'create',family:'note',id:'unrelated',data:{title:'Attention method',body:'Same name; no reference.'}}));
 const before=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
 let page=await ok(read(c,refs)),firstCursor=page.coverage.relationships.nextCursor,ids=[],pages=0;
 while(true){pages++;ids.push(...page.relations.filter(r=>r.direction==='incoming').map(r=>r.to.id));for(const r of page.relations){assert.equal(r.actor,'user');assert.equal(r.synthetic,true);assert.equal(r.citedTarget.rendition,article.rendition);assert.match(r.citedDestination,/rendition=/);}
 const cursor=page.coverage.relationships.nextCursor;if(!cursor)break;assert.ok(pages<10);page=await ok(read(c,refs,cursor));}
 assert.equal(ids.length,27);assert.equal(new Set(ids).size,27);assert.equal(page.coverage.relationships.complete,true);
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,before,'reads never save relationships');
 assert.equal((await read(other,refs,firstCursor)).status,409);
 assert.deepEqual((await ok(read(other,refs))).relations,[]);
 const revised=(await ok(c.command({action:'update',family:'article',id:article.id,expectedRev:article.rev,data:{body:'Changed method.'}}))).record;
 assert.equal((await read(c,refs,firstCursor)).status,409,'a write invalidates continuation');
 const old=await ok(read(c,[{...refs[0],rendition:article.rendition}]));assert.ok(old.relations.length>0);assert.ok(old.relations.every(r=>r.citedTarget.rendition===article.rendition));
 const latest=await ok(read(c,[{...refs[0],rendition:revised.rendition}]));assert.equal(latest.relations.length,0,'old incoming citations do not become citations of a new edition');
 await ok(c.command({action:'trash',family:'article',id:article.id,expectedRev:revised.rev}));
 assert.equal((await ok(read(c,[{...refs[0],rendition:article.rendition}]))).selected[0].status,'unavailable');
 }finally{await f.dispose();}
});
test('incoming typed diagram references on standalone Questions are discovered without manual duplicate links',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('diagram-question-owner');
 const q=(await ok(c.command({action:'create',family:'investigation',id:'attention-question',data:{title:'What counts as attention?',body:'No viewer observation has been supplied.',synthetic:true}}))).record;
 const project=(await ok(c.command({action:'create',family:'journey',id:'attention-comparison',data:{title:'Comparing frames',body:'Proposed design only.',synthetic:true,sections:[{id:'alternatives',title:'Alternatives',parts:[{id:'diagram',kind:'diagram',diagram:{format:'graph-v1',nodes:[{id:'a',label:'Frame A',reference:{family:'investigation',id:q.id,rendition:q.rendition}},{id:'b',label:'Frame B'}],edges:[{from:'a',to:'b'}]}}]}]}}))).record;
 const result=await ok(read(c,[{family:'investigation',id:q.id}]));assert.ok(result.relations.some(r=>r.direction==='incoming'&&r.to.id===project.id));
 }finally{await f.dispose();}
});

test('whole-record bookmarks are intentional incoming relationships and disappear when unflagged',{timeout:90000},async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('bookmark-relationship-owner');
 const record=(await ok(c.command({action:'create',family:'note',id:'bookmark-standalone',data:{title:'A question worth keeping',body:'Independent thought.',synthetic:true}}))).record;
 const target={kind:'record',family:'note',id:record.id};
 const flag=await ok(c.command({action:'setFlag',target,active:true,expectedTargetRev:0}));
 const page=await ok(read(c,[{family:'note',id:record.id}]));
 assert.ok(page.relations.some(r=>r.direction==='incoming'&&r.to.family==='flag'&&r.to.id===flag.recordRef.id));
 await ok(c.command({action:'setFlag',target,active:false,expectedTargetRev:flag.bookmark.targetRev}));
 assert.equal((await ok(read(c,[{family:'note',id:record.id}]))).relations.some(r=>r.to.family==='flag'),false);
 }finally{await f.dispose();}
});
