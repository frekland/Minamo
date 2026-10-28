import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler};`;
const stamp='2026-10-26T10:00:00.000Z';
const base=(id,family,title,body,extra={})=>({id,family,title,body,links:[],rev:1,rendition:'TEST-ONLY-edition-'+id,createdAt:stamp,updatedAt:stamp,trashedAt:null,actor:'system',synthetic:true,...extra});
const insert=(f,owner,r)=>f.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(owner,r.family,r.id,r.rev,JSON.stringify(r),r.trashedAt,'TEST-ONLY-search-ranking').run();
const get=async(c,path,params)=>{const result=await c.request(path+'?'+new URLSearchParams(params));assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};

test('NC, ss, git and quoted git discover canonical entries before prose and remain exact-reading links across HTTP and MCP',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-ranking-owner');
 const refs=['nc','ss','git'].map(term=>({id:term,term,aliases:term==='nc'?['netcat']:[],caseSensitive:true,kind:'shell-command',definition:'Synthetic original explanation of '+term,sectionId:'commands',partId:term}));
 const article=base('zz-canonical','article','Network and version-control commands','Independent examples and explanations.',{updatedAt:'2020-01-01T10:00:00.000Z',sections:[{id:'commands',title:'Useful commands',parts:refs.map(ref=>({id:ref.id,kind:'paragraph',text:'Use '+ref.term+' deliberately in an original bounded example.'}))}],concepts:refs});
 await insert(f,c.owner,article);
 // These recent records reproduced the old embedded-word noise and must not
 // outrank the canonical names or become short-token matches at all.
 for(let n=0;n<45;n++)await insert(f,c.owner,base('a-noise-'+n,'note','Classical evidence and references','The assembly and digital reference material is miscellaneous.'));
 await insert(f,c.owner,base('b-mentioned','article','A peripheral networking explanation','Use ss to inspect a connection. Discuss git later.'));
 await insert(f,c.owner,base('c-git-title','article','Git','A focused original explanation of repositories and snapshots.'));
 for(const [query,term] of [['NC','nc'],['ss','ss'],['git','git'],['"git"','git'],['“git”','git']]){
  const library=await get(c,'/api/library',{facet:'search',q:query,limit:'5'});assert.equal(library.items[0].reference.term,term);assert.equal(library.items[0].destination.rendition,article.rendition);assert.equal(library.items[0].destination.partId,term);assert.ok(library.items[0].matchEvidence);assert.equal(library.items[0].matchEvidence.kind,query==='NC'?'name-match':'exact-term');assert.ok(library.items.every(item=>!item.id.startsWith('a-noise')));
  const global=await get(c,'/api/query',{q:query,limit:'5'});assert.equal(global.conceptMatches[0].concept.term,term);assert.equal(global.conceptMatches[0].matchedTerm,term);assert.equal(global.conceptMatches[0].discovery,query==='NC'?'case-folded':'exact');assert.equal(global.libraryMatches[0].reference.term,term);assert.ok(global.records.every(record=>!record.id.startsWith('a-noise')));
 }
 const mcp=await c.request('/mcp',{jsonrpc:'2.0',id:'TEST-ONLY-ranking',method:'tools/call',params:{name:'query_minamo_library',arguments:{purpose:'TEST ONLY verify ordinary Library name lookup',facet:'search',query:'"git"',limit:5}}});assert.equal(mcp.status,200);const result=mcp.data.result.structuredContent??JSON.parse(mcp.data.result.content[0].text);assert.equal(result.items[0].reference.term,'git');assert.equal(result.items[0].destination.partId,'git');
 const isolated=await get(f.client('TEST-ONLY-foreign-ranking-owner'),'/api/library',{facet:'search',q:'git'});assert.deepEqual(isolated.items,[]);
 }finally{await f.dispose()}
});

test('rank-aware keysets preserve mixed results exactly once and keep options case-sensitive',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('TEST-ONLY-ranking-pages');
 const references=[{id:'lower',term:'-a'},{id:'upper',term:'-A'},{id:'git',term:'git'}].map(ref=>({...ref,aliases:[],caseSensitive:true,kind:'shell-command',definition:'Synthetic distinct option',sectionId:'s',partId:'p'}));
 await insert(f,c.owner,base('z-ref','article','A command reference','An original explanation of git.',{sections:[{id:'s',title:'Options',parts:[{id:'p',kind:'paragraph',text:'git and distinct options -a and -A'}]}],concepts:references}));
 for(const [id,family,title] of [['same','article','Git'],['same','area','Git'],['a-other','article','Git branches']])await insert(f,c.owner,base(id,family,title,'A useful original git explanation.'));
 let cursor,ids=[];do{const page=await get(c,'/api/library',{facet:'search',q:'git',limit:'1',...(cursor?{cursor}:{})});ids.push(...page.items.map(item=>item.family+':'+item.id+':'+(item.reference?.id??'')));cursor=page.nextCursor;}while(cursor);
 assert.equal(ids[0],'article:z-ref:git');assert.equal(ids.length,new Set(ids).size);assert.ok(ids.includes('area:same:'));assert.ok(ids.includes('article:same:'));assert.equal(ids.length,5);
 for(const [q,id] of [['-a','lower'],['-A','upper'],['"-a"','lower']]){const page=await get(c,'/api/library',{facet:'references',q});assert.deepEqual(page.items.map(item=>item.reference.id),[id]);}
 const first=await get(c,'/api/library',{facet:'search',q:'git',limit:'1'});const mismatch=await c.request('/api/library?'+new URLSearchParams({facet:'search',q:'ss',limit:'1',cursor:first.nextCursor}));assert.equal(mismatch.status,409);
 const foreign=await f.client('TEST-ONLY-other-ranking-pages').request('/api/library?'+new URLSearchParams({facet:'search',q:'git',limit:'1',cursor:first.nextCursor}));assert.equal(foreign.status,409);
 }finally{await f.dispose()}
});
