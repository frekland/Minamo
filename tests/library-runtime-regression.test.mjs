import {test} from 'node:test';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {privateStorageFixture} from './private-storage-fixture.mjs';

// Local isolated D1/R2 only. Timing is diagnostic, never a hosted latency claim.
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {async fetch(request,env){let count=0;const db=env.DB,started=performance.now();const response=await domainHandler(request,{...env,DB:{prepare(sql){count++;return db.prepare(sql)},batch(items){return db.batch(items)},exec(sql){return db.exec(sql)}}});response.headers.set('X-Test-Queries',String(count));response.headers.set('X-Test-Worker-Ms',String(performance.now()-started));return response;}};`;
const stamp='2026-10-27T05:00:00.000Z';
const localRecord=(id,family,extra={})=>({id,family,title:'SYNTHETIC LOCAL '+id,body:'Independent complete explanation. '.repeat(8),links:[],rev:1,rendition:'TEST-only-edition-'+id,createdAt:stamp,updatedAt:stamp,trashedAt:null,actor:'system',synthetic:true,...extra});
const insert=(fixture,owner,record)=>fixture.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(owner,record.family,record.id,record.rev,JSON.stringify(record),record.trashedAt,'TEST-only-library-runtime').run();
const ok=reply=>{assert.equal(reply.status,200,JSON.stringify(reply.data));return reply.data;};

test('Library local Worker baseline reports cold/repeat cost with a bounded larger corpus and no owner reuse',async t=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('TEST-only-library-perf-owner');
  for(let i=0;i<3;i++)await insert(fixture,client.owner,localRecord('subject-'+i,'area'));
  for(let i=0;i<70;i++)await insert(fixture,client.owner,localRecord('article-'+String(i).padStart(3,'0'),'article',{links:[{family:'area',id:'subject-'+i%3}]}));
  await insert(fixture,client.owner,localRecord('references','article',{links:[{family:'area',id:'subject-0'}],sections:[{id:'commands',title:'Git commands',parts:[{id:'description',kind:'paragraph',text:'git inspects repository state.'}]}],concepts:Array.from({length:18},(_,i)=>({id:'git-'+i,term:'git',aliases:[],caseSensitive:true,kind:'shell-command',definition:'An independent command explanation.',sectionId:'commands',partId:'description'}))}));
  for(const endpoint of ['/api/library?facet=areas&limit=30','/api/library?facet=topics&limit=30','/api/library?facet=references&q=git&limit=24','/api/library?facet=search&q=absent-canary&limit=30']){
   const samples=[];
   for(let n=0;n<3;n++){const started=performance.now(),reply=await client.request(endpoint);ok(reply);const queries=Number(reply.headers.get('X-Test-Queries'));assert.ok(queries<30,`query count bounded for ${endpoint}: ${queries}`);samples.push({queries,workerMs:+Number(reply.headers.get('X-Test-Worker-Ms')).toFixed(2),roundTripMs:+(performance.now()-started).toFixed(2),items:reply.data.items.length});}
   t.diagnostic(JSON.stringify({endpoint,samples}));
  }
  const foreign=ok(await fixture.client('TEST-only-library-perf-foreign').request('/api/library?facet=topics&limit=30'));assert.deepEqual(foreign.items,[]);
 }finally{await fixture.dispose();}
});

test('Library exact reading links and cursors remain principal/query/epoch fenced across current Source revocation',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('TEST-only-library-rights-owner');
  const create=async(family,id,data)=>ok(await client.command({action:'create',family,id,data:{title:'SYNTHETIC LOCAL '+id,body:'Independent original prose.',synthetic:true,...data}})).record;
  const text='TEST_ONLY_SOURCE_RESTRICTION_CANARY';
  let source=await create('source','source',{source:{url:'https://example.invalid/local-only',attribution:'Synthetic authored fixture',rights:'permitted-excerpt',excerpt:{id:'excerpt',text,locator:'Local paragraph',edition:'Local edition',basis:'owner-authored',permissionNote:'Only an isolated test author attests this local text.',ownerAttested:true,state:'permitted',exportAllowed:true}}});
  const article=await create('article','with-source',{sections:[{id:'s',title:'Bounded explanation',parts:[{id:'excerpt',kind:'excerpt',text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:text.length}},{id:'own',kind:'paragraph',text:'Independent explanation remains eligible.'}]}],concepts:[{id:'restricted',term:'restricted-local-command',aliases:[],definition:'Source-bound local destination.',sectionId:'s',partId:'excerpt'}]});
  await create('article','second',{sections:[{id:'s',title:'Another explanation',parts:[{id:'p',kind:'paragraph',text:'An independent second explanation.'}]}]});
  const endpoint='/api/library?facet=references&q=restricted-local-command&limit=1',first=ok(await client.request(endpoint));assert.equal(first.items.length,1);
  const item=first.items[0],href=new URL(item.href,'https://local.invalid');assert.equal(href.searchParams.get('rendition'),article.rendition);assert.equal(href.searchParams.get('section'),'s');assert.equal(href.searchParams.get('part'),'excerpt');
  const exact=ok(await client.context('article',article.id,href.searchParams.get('rendition')));assert.equal(exact.record.sections[0].parts[0].text,text);
  const page=ok(await client.request('/api/library?facet=topics&limit=1'));assert.ok(page.nextCursor);
  const cursor=encodeURIComponent(page.nextCursor);assert.equal((await client.request('/api/library?facet=topics&limit=1&q=changed&cursor='+cursor)).status,409);
  assert.equal((await fixture.client('TEST-only-library-rights-other').request('/api/library?facet=topics&limit=1&cursor='+cursor)).status,409);
  source=ok(await client.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}})).record;
  assert.equal(source.source.excerpt.unavailable,true);
  assert.equal((await client.request('/api/library?facet=topics&limit=1&cursor='+cursor)).status,409,'current corpus/rights mutation invalidates a prior keyset');
  const after=ok(await client.request(endpoint));assert.deepEqual(after.items,[],'the same endpoint cannot reuse a formerly eligible reference');assert.ok(!JSON.stringify(after).includes(text));
  const retained=ok(await client.context('article',article.id,article.rendition));assert.deepEqual(retained.record.sections[0].parts[0],{id:'excerpt',kind:'excerpt',text:'',unavailable:true});assert.equal(retained.record.sections[0].parts[1].text,'Independent explanation remains eligible.');
  const other=ok(await fixture.client('TEST-only-library-rights-other').request(endpoint));assert.deepEqual(other.items,[]);
 }finally{await fixture.dispose();}
});

test('authored subject order paginates beyond ten positions without admitting contextual-only, foreign, trashed or cross-language members',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('TEST-only-library-order-owner'),foreign=fixture.client('TEST-only-library-order-foreign');
  const japanese={version:1,spaces:['languages'],languages:['ja'],provenance:'authored'},computing={version:1,spaces:['computing'],provenance:'authored'};
  const ids=Array.from({length:18},(_,i)=>'topic-'+String(i).padStart(2,'0'));
  for(const [i,id] of ids.entries())await insert(fixture,client.owner,localRecord(id,'article',{title:'Title '+String(18-i).padStart(2,'0'),updatedAt:'2026-10-'+String(i+1).padStart(2,'0')+'T05:00:00.000Z',learningScope:japanese}));
  await insert(fixture,client.owner,localRecord('context-only','article',{learningScope:japanese}));
  await insert(fixture,client.owner,localRecord('removed','article',{learningScope:japanese,trashedAt:stamp}));
  await insert(fixture,client.owner,localRecord('computing-only','article',{learningScope:computing}));
  await insert(fixture,foreign.owner,localRecord('foreign-only','article',{learningScope:japanese}));
  const expected=['topic-12','topic-05','topic-17',...ids.filter(id=>!['topic-12','topic-05','topic-17'].includes(id))];
  const area=localRecord('japanese','area',{learningScope:japanese,links:[{family:'article',id:'context-only',sourceContext:{sectionId:'group'}},{family:'article',id:'topic-02',rendition:'TEST-only-edition-topic-02',sectionId:'s'},{family:'article',id:'missing'},{family:'article',id:'foreign-only'},{family:'article',id:'removed'},{family:'article',id:'computing-only'},...expected.map(id=>({family:'article',id}))]});
  await insert(fixture,client.owner,area);
  const query={facet:'topics',areaId:area.id,sort:'authored',learningSpace:'languages',language:'ja',limit:'3'},read=async extra=>ok(await client.request('/api/library?'+new URLSearchParams({...query,...extra})));
  const all=[];let cursor,firstCursor;
  do{const page=await read(cursor?{cursor}:{});assert.equal(page.order.kind,'authored');assert.equal(page.order.authoredAvailable,true);assert.equal(page.totalCount,null);all.push(...page.items);cursor=page.nextCursor;if(!firstCursor)firstCursor=cursor;assert.ok(all.length<=18,'keyset must advance without duplicate pages');}while(cursor);
  assert.deepEqual(all.map(item=>item.id),expected);assert.equal(new Set(all.map(item=>item.id)).size,18);
  assert.ok(all.every(item=>new URL(item.href,'https://local.invalid').searchParams.get('rendition')===item.rendition));
  assert.equal((await client.request('/api/library?'+new URLSearchParams({...query,sort:'title',cursor:firstCursor}))).status,409,'sort is part of cursor identity');
  const byTitle=[],byUpdated=[];for(const [sort,target] of [['title',byTitle],['updated',byUpdated]]){let next;do{const page=await read({sort,...(next?{cursor:next}:{})});target.push(...page.items.map(item=>item.id));next=page.nextCursor;}while(next);}
  assert.deepEqual(byTitle,[...ids].reverse());assert.deepEqual(byUpdated,[...ids].reverse());
  assert.deepEqual(ok(await client.request('/api/library?'+new URLSearchParams({facet:'topics',areaId:area.id,sort:'authored',learningSpace:'computing',limit:'3'}))).items,[],'wrong-space parent cannot grant article membership');
  const raw=JSON.parse((await fixture.db.prepare('SELECT data FROM v2_records WHERE owner=? AND family=? AND id=?').bind(client.owner,'area',area.id).first()).data);assert.deepEqual(raw,area,'presentation sorting never reorders authored canonical links');
 }finally{await fixture.dispose();}
});
