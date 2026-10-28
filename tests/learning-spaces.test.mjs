import test from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler};`;
const scope=(language)=>({version:1,spaces:[language?'languages':'computing'],...(language?{languages:[language]}:{}),provenance:'authored'});
const query=async(c,params)=>c.request('/api/query?'+new URLSearchParams(params));
const ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};

test('learning classification sidecar preserves exact canonical identity with CAS, replay, namespace and owner fences',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-owner');
 const created=ok(await c.command({action:'create',family:'article',id:'legacy',data:{title:'Legacy Japanese reading',body:'An unclassified retained reading.',synthetic:true}})).record;
 const before=await f.db.prepare('SELECT data,rev,last_operation FROM v2_records WHERE owner=? AND id=?').bind(c.owner,'legacy').first();
 const input={operationId:'classify-legacy',expectedGeneration:'legacy@0',family:'article',id:'legacy',expectedRecordRev:1,expectedScopeRev:0,learningScope:scope('ja')};
 const saved=ok(await c.request('/api/learning-scopes',input));assert.equal(saved.status,'committed');assert.equal(saved.learningScopeRev,1);
 assert.deepEqual(await f.db.prepare('SELECT data,rev,last_operation FROM v2_records WHERE owner=? AND id=?').bind(c.owner,'legacy').first(),before);
 const read=ok(await c.context('article','legacy')).record;assert.equal(read.rendition,created.rendition);assert.equal(read.updatedAt,created.updatedAt);assert.equal(read.rev,1);assert.deepEqual(read.learningScope.languages,['ja']);
 assert.equal(ok(await c.request('/api/learning-scopes',input)).replayed,true);
 assert.equal((await c.request('/api/learning-scopes',{...input,learningScope:scope('fr')})).status,409);
 assert.equal((await c.request('/api/learning-scopes',{...input,operationId:'stale-classification'})).status,409);
 assert.equal((await f.client('other-owner').request('/api/learning-scopes',{...input,operationId:'other-classification'})).status,409);
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_learning_developments').first()).n,0);
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_revisions WHERE owner=?').bind(c.owner).first()).n,1);
 }finally{await f.dispose();}
});

test('space and language eligibility precedes pagination, cursor lookahead, inherited personal scope and activity metadata',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-pagination');
 for(const [id,language] of [['ja-1','ja'],['fr','fr'],['computing',null],['ja-2','ja'],['ja-3','ja']])ok(await c.command({action:'create',family:'article',id,data:{title:'Shared title',body:'Body for '+id,synthetic:true,learningScope:scope(language)}}));
 ok(await c.command({action:'create',family:'article',id:'unclassified',data:{title:'Bash-looking title is not classification',body:'No guessing.',synthetic:true}}));
 ok(await c.command({action:'create',family:'note',id:'linked-note',data:{title:'A personal correction',body:'Supplied observation, not a checkpoint.',synthetic:true,links:[{family:'article',id:'ja-1'}]}}));
 let page=ok(await query(c,{learningSpace:'languages',language:'ja',limit:'2'})),ids=[];const firstCursor=page.nextCursor;assert.ok(firstCursor);
 while(true){ids.push(...page.records.map(r=>r.id));if(!page.nextCursor)break;page=ok(await query(c,{learningSpace:'languages',language:'ja',limit:'2',cursor:page.nextCursor}));}
 assert.deepEqual(ids.sort(),['ja-1','ja-2','ja-3','linked-note']);
 assert.equal((await query(c,{learningSpace:'languages',language:'fr',limit:'2',cursor:firstCursor})).status,400);
 const personal=ok(await query(c,{learningSpace:'languages',language:'ja',personal:'1'}));assert.deepEqual(personal.records.map(r=>r.id),['linked-note']);assert.equal(personal.records[0].learningScopeInherited,true);
 assert.deepEqual(ok(await query(c,{learningSpace:'unclassified'})).records.map(r=>r.id),['unclassified']);
 const ws=ok(await c.request('/api/workspace?'+new URLSearchParams({learningSpace:'languages',language:'ja',limit:'2'})));assert.equal(ws.records.length,2);assert.ok(ws.activity.every(a=>['ja-1','ja-2','ja-3','linked-note'].includes(a.recordId)));
 assert.equal((await query(c,{learningSpace:'computing',language:'ja'})).status,400);assert.equal((await query(c,{language:'en'})).status,400);
 }finally{await f.dispose();}
});

test('Library references and area counts respect exact scope before SQL aggregation',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-library');
 ok(await c.command({action:'create',family:'area',id:'shared-area',data:{title:'Cross-disciplinary reference',body:'Shared.',synthetic:true,learningScope:{version:1,spaces:['computing','languages'],languages:['ja','fr'],provenance:'authored'}}}));
 for(const [id,language] of [['japanese','ja'],['french','fr'],['computing',null]])ok(await c.command({action:'create',family:'article',id,data:{title:id,body:'Body',synthetic:true,learningScope:scope(language),links:[{family:'area',id:'shared-area'}],concepts:[{id:'entry',term:'same',aliases:[],definition:'Definition',sectionId:'__article',partId:'__body'}]}}));
 const refs=ok(await c.request('/api/library?'+new URLSearchParams({facet:'references',learningSpace:'languages',language:'ja',q:'same'})));assert.deepEqual(refs.items.map(x=>x.id),['japanese']);
 const areas=ok(await c.request('/api/library?'+new URLSearchParams({facet:'areas',learningSpace:'languages',language:'ja'})));assert.equal(areas.items[0].topicCount,1);
 const aliases=ok(await query(c,{learningSpace:'languages',language:'ja',q:'same'}));assert.deepEqual(aliases.conceptMatches.map(x=>x.article.id),['japanese']);
 }finally{await f.dispose();}
});

test('classification sidecars survive complete recovery staging and activation without rewriting retained records',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-recovery');
 const original=ok(await c.command({action:'create',family:'article',id:'shared',data:{title:'Shared Unicode resource',body:'Original base text.',synthetic:true}})).record;
 ok(await c.request('/api/learning-scopes',{operationId:'classify-shared',expectedGeneration:'legacy@0',family:'article',id:'shared',expectedRecordRev:1,expectedScopeRev:0,learningScope:{version:1,spaces:['computing','languages'],languages:['ja','zh-Hans'],provenance:'classification'}}));
 const archive=ok(await c.recover('checkpoint',{operationId:'scope-checkpoint'})).archive;assert.equal(archive.counts.v2_learning_scopes,1);
 assert.equal(ok(await c.recover('verify',{archiveId:archive.id})).valid,true);
 const staged=ok(await c.recover('stage',{operationId:'scope-stage',archiveId:archive.id})).staged;assert.equal(staged.counts.v2_learning_scopes,1);
 const activated=ok(await c.recover('activate',{operationId:'scope-activate',stagedId:staged.id}));c.setGeneration(activated.generation);
 const read=ok(await c.context('article','shared',original.rendition)).record;assert.equal(read.rev,1);assert.equal(read.rendition,original.rendition);assert.deepEqual(read.learningScope.spaces,['computing','languages']);assert.equal(read.learningScopeRev,1);
 assert.equal(ok(await query(c,{learningSpace:'languages',language:'zh-Hans'})).records[0].id,'shared');
 }finally{await f.dispose();}
});

test('classification via existing update command preserves metadata and invalidates only classification-scoped workspace cursors',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-command');for(const id of ['a','b','c'])ok(await c.command({action:'create',family:'article',id,data:{title:id,body:'Base text.',synthetic:true}}));
 const page=ok(await c.request('/api/workspace?learningSpace=all&limit=1'));assert.ok(page.nextCursor);
 const command={operationId:'classify-via-command',action:'update',family:'article',id:'a',expectedRev:1,expectedGeneration:'legacy@0',data:{classifyLearningScope:{expectedScopeRev:0,learningScope:scope('ja')}}};
 const preview=ok(await c.request('/api/preview',command));assert.equal(preview.valid,true);
 const saved=ok(await c.command(command));assert.equal(saved.learningScopeRev,1);assert.equal(ok(await c.context('article','a')).record.rev,1);
 assert.equal((await c.request('/api/workspace?'+new URLSearchParams({learningSpace:'all',limit:'1',cursor:page.nextCursor}))).status,400);
 const epoch=(await f.db.prepare('SELECT version FROM v2_learning_scope_epochs WHERE owner=?').bind(c.owner).first()).version;
 assert.equal(ok(await c.command(command)).replayed,true);assert.equal((await f.db.prepare('SELECT version FROM v2_learning_scope_epochs WHERE owner=?').bind(c.owner).first()).version,epoch);
 assert.equal((await c.command({action:'update',family:'article',id:'a',expectedRev:1,data:{learningScope:scope('fr')}})).data.code,'scope_sidecar_authoritative');
 const second=ok(await c.request('/api/workspace?learningSpace=all&limit=1'));ok(await c.command({action:'trash',family:'article',id:'c',expectedRev:1}));assert.equal((await c.request('/api/workspace?'+new URLSearchParams({learningSpace:'all',limit:'1',cursor:second.nextCursor}))).status,200);
 for(const bad of [{learningSpace:['all']},{learningSpace:7},{learningSpace:null}])assert.equal((await c.request('/api/query',bad)).status,400);
 for(const provenance of [['authored'],7,null])assert.equal((await c.command({action:'create',family:'article',id:'invalid-'+String(provenance),data:{title:'Invalid scope',body:'',learningScope:{...scope('ja'),provenance}}})).status,400);
 }finally{await f.dispose();}
});

test('personal marks on reused Source passages inherit exact display Article organisation without classifying the Source',async()=>{
 const f=await privateStorageFixture(worker);try{const c=f.client('scope-display-return'),text='Original supplied source passage.';
 const source=ok(await c.command({action:'create',family:'source',id:'source',data:{title:'Unclassified source',body:'Description',synthetic:true,source:{url:'https://example.invalid/source',attribution:'Original synthetic fixture',rights:'permitted-excerpt',excerpt:{id:'grant',text,locator:'Original paragraph',edition:'Test edition',basis:'owner-authored',permissionNote:'Fixture author owns this text.',ownerAttested:true,state:'permitted',exportAllowed:true}}}})).record;
 const article=ok(await c.command({action:'create',family:'article',id:'display',data:{title:'Japanese comparison reading',body:'Independent explanation.',synthetic:true,learningScope:scope('ja'),sections:[{id:'reading',title:'Source',parts:[{id:'excerpt',kind:'excerpt',text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:text.length}}]}]}})).record;
 const anchor={articleId:source.id,recordFamily:'source',rendition:source.rendition,sectionId:'__article',partId:'__excerpt',start:0,end:text.length,quote:text,displayReturn:{recordFamily:'article',id:article.id,rendition:article.rendition,sectionId:'reading',partId:'excerpt',start:0,end:text.length}};
 ok(await c.command({action:'create',family:'annotation',id:'mark',data:{title:'Personal observation',body:'Reported commentary only.',synthetic:true,anchor}}));
 const personal=ok(await query(c,{learningSpace:'languages',language:'ja',personal:'1'}));assert.deepEqual(personal.records.map(r=>r.id),['mark']);assert.deepEqual(personal.records[0].learningScope.languages,['ja']);assert.equal(ok(await c.context('source','source')).record.learningScope,undefined);
 }finally{await f.dispose();}
});
