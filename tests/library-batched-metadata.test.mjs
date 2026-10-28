import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker=`import {domainHandler} from './lib/domain-handler.ts';
export default {
  async fetch(request,env){
    let prepared=0;
    const db=env.DB;
    const scoped={...env,DB:{
      prepare(sql){prepared++;return db.prepare(sql)},
      batch(items){return db.batch(items)},
      exec(sql){return db.exec(sql)}
    }};
    const response=await domainHandler(request,scoped);
    response.headers.set('X-Test-Prepared-Queries',String(prepared));
    return response;
  }
};`;

const stamp='2026-10-27T05:00:00.000Z';
const record=(id,family,title,extra={})=>({
  id,family,title,body:'Independent synthetic example.',links:[],rev:1,
  rendition:'TEST-ONLY-edition-'+id,createdAt:stamp,updatedAt:stamp,
  trashedAt:null,actor:'system',synthetic:true,...extra
});
const insert=(fixture,owner,r)=>fixture.db
  .prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)')
  .bind(owner,r.family,r.id,r.rev,JSON.stringify(r),null,'TEST-ONLY-batch-metadata').run();

test('many matching references keep identical subject links without per-result database reads',async()=>{
  const fixture=await privateStorageFixture(worker);
  try{
    const client=fixture.client('TEST-ONLY-batch-owner');
    await insert(fixture,client.owner,record('tools','area','Tools'));
    const concepts=Array.from({length:18},(_,i)=>({
      id:'git-'+i,term:'git',aliases:[],caseSensitive:true,kind:'shell-command',
      definition:'A distinct reference for a synthetic Git command.',
      sectionId:'commands',partId:'description'
    }));
    await insert(fixture,client.owner,record('guide','article','Version control',{
      links:[{family:'area',id:'tools'}],
      sections:[{id:'commands',title:'Commands',parts:[{
        id:'description',kind:'paragraph',text:'Use git to inspect the repository.'
      }]}],
      concepts
    }));

    const read=async limit=>{
      const response=await client.request('/api/library?'+new URLSearchParams({
        facet:'references',q:'git',limit:String(limit)
      }));
      assert.equal(response.status,200,JSON.stringify(response.data));
      return response;
    };
    const one=await read(1);
    const all=await read(24);
    assert.equal(one.data.items.length,1);
    assert.equal(all.data.items.length,18);
    assert.deepEqual(all.data.items.map(item=>item.reference.id).sort(),concepts.map(c=>c.id).sort());
    assert.ok(all.data.items.every(item=>
      item.areas?.length===1&&item.areas[0].id==='tools'&&item.areas[0].title==='Tools'
    ),'each exact destination retains its correct subject membership');

    const firstQueries=Number(one.headers.get('X-Test-Prepared-Queries'));
    const allQueries=Number(all.headers.get('X-Test-Prepared-Queries'));
    assert.ok(Number.isFinite(firstQueries)&&Number.isFinite(allQueries));
    assert.ok(allQueries<=firstQueries+3,
      `18 references should share metadata reads, not add 17 SQL calls: ${firstQueries} vs ${allQueries}`);

    const foreign=await fixture.client('TEST-ONLY-other-batch-owner')
      .request('/api/library?facet=references&q=git');
    assert.equal(foreign.status,200);
    assert.deepEqual(foreign.data.items,[]);
  }finally{
    await fixture.dispose();
  }
});

test('full no-match scans batch article metadata and never reuse it across requests',async()=>{
  const fixture=await privateStorageFixture(worker);
  try{
    const client=fixture.client('TEST-ONLY-scan-batch-owner');
    for(let i=0;i<70;i++)await insert(fixture,client.owner,record('scan-'+i,'article','Independent article '+i));
    for(const endpoint of ['/api/query?q=no-match-canary','/api/library?facet=search&q=no-match-canary']){
      const result=await client.request(endpoint);
      assert.equal(result.status,200,JSON.stringify(result.data));
      assert.ok(Number(result.headers.get('X-Test-Prepared-Queries'))<25,'bounded scope/catalogue reads must not scale once per Article');
    }
    await insert(fixture,client.owner,record('new-match','article','Fresh no-match-canary'));
    const fresh=await client.request('/api/library?facet=search&q=no-match-canary');
    assert.equal(fresh.status,200);
    assert.ok(fresh.data.items.some(item=>item.id==='new-match'),'a subsequent request observes the new current corpus');
    const foreign=await fixture.client('TEST-ONLY-foreign-scan-owner').request('/api/query?q=no-match-canary');
    assert.deepEqual(foreign.data.records,[]);
  }finally{await fixture.dispose();}
});

test('workspace collection batches Articles without shortening their exact reading or leaking owners',async()=>{
 const fixture=await privateStorageFixture(worker);
 try{
  const client=fixture.client('TEST-ONLY-collection-batch');
  const body='Original synthetic complete reading. '.repeat(80);
  for(let i=0;i<70;i++)await insert(fixture,client.owner,record('complete-'+i,'article','Complete article '+i,{body}));
  const collection=await client.request('/api/workspace');assert.equal(collection.status,200);assert.equal(collection.data.records.length,70);assert.ok(Number(collection.headers.get('X-Test-Prepared-Queries'))<20);
  assert.ok(collection.data.records.every(r=>r.body===body),'collection optimisation preserves full source, not a teaser substituted for editing');
  const exact=await client.context('article','complete-0');assert.deepEqual(collection.data.records.find(r=>r.id==='complete-0'),exact.data.record);
  assert.equal((await fixture.client('TEST-ONLY-foreign-collection').request('/api/workspace')).data.records.length,0);
 }finally{await fixture.dispose();}
});
