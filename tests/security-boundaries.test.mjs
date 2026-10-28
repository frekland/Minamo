import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
const wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare');
const {build}=wr('esbuild');
// A test-only adapter around actual domain functions; production uses domainHandler.
const bundle=await build({stdin:{contents:`
import { executeCommand, readRecord, readRendition, resolveAnchor, operationStatus, readContext } from './lib/domain.ts';
export default {async fetch(request,env){
 const {kind,owner,args,actor}=await request.json();
 try {
 let result;
 if(kind==='command')result=await executeCommand(env,owner,args,actor);
 else if(kind==='read')result=await readRecord(env,owner,args.family,args.id);
 else if(kind==='rendition')result=await readRendition(env,owner,args.articleId,args.rendition);
 else if(kind==='anchor')result=await resolveAnchor(env,owner,args);
 else if(kind==='status')result=await operationStatus(env,owner,args.operationId);
 else if(kind==='context')result=await readContext(env,owner,args.family,args.id,args.rendition);
 else throw Error('Invalid test kind');
 return Response.json(result);
 }catch(e){return Response.json({code:e.code,message:e.message},{status:e.status||500})}
}};`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('independent security/domain boundaries with actual local D1',async t=>{
 const mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB']});
 try {
 const db=await mf.getD1Database('DB');
 for(const migration of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+migration,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const owner='synthetic-security-owner';
 const request=async(kind,args,principal=owner,actor='user')=>{const r=await mf.dispatchFetch('https://test.invalid/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,owner:principal,args,actor})});return {status:r.status,data:await r.json()};};
 const command=async args=>request('command',args);
 const note={operationId:'security-note-create',action:'create',family:'note',id:'security-note',data:{title:'SYNTHETIC TEST ONLY',body:'private original text',synthetic:true}};
 await t.test('unknown caller-authorship fields cannot cross the command schema',async()=>{const r=await command({...note,actor:'system'});assert.equal(r.status,400);assert.equal(r.data.code,'invalid_shape');});
 await t.test('concurrent identical operation commits once, with one history and activity entry',async()=>{
 const results=await Promise.all([command(note),command(note)]);assert.deepEqual(results.map(r=>r.status),[200,200],JSON.stringify(results));
 const stored=await request('read',{family:'note',id:'security-note'});assert.equal(stored.data.rev,1);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM v2_revisions WHERE owner=? AND family='note' AND id='security-note'").bind(owner).first()).n,1);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM v2_activity WHERE owner=? AND record_id='security-note'").bind(owner).first()).n,1);
 });
 await t.test('operation identity cannot be reused with a different payload',async()=>{const r=await command({...note,data:{...note.data,body:'replacement'}});assert.equal(r.status,409);assert.equal(r.data.code,'idempotency_mismatch');assert.equal((await request('read',{family:'note',id:'security-note'})).data.body,'private original text');});
 await t.test('status and replay are metadata-only and owner-scoped',async()=>{
 const receipt=await request('status',{operationId:note.operationId});assert.equal(receipt.status,200);assert.equal(receipt.data.status,'committed');assert.ok(!JSON.stringify(receipt.data).includes('private original text'));
 const replay=await command(note);assert.equal(replay.data.replayed,true);assert.ok(!JSON.stringify(replay.data).includes('private original text'));
 assert.equal((await request('status',{operationId:note.operationId},'synthetic-other-owner')).data,null);
 });
 await t.test('Trash cannot leak record text through earlier receipts',async()=>{
 assert.equal((await command({operationId:'security-note-trash',action:'trash',family:'note',id:'security-note',expectedRev:1})).data.status,'committed');
 assert.equal((await request('read',{family:'note',id:'security-note'})).data,null);
 for(const r of [await command(note),await request('status',{operationId:note.operationId})])assert.ok(!JSON.stringify(r.data).includes('private original text'));
 });
 await t.test('GPT cannot relabel fabricated changes to a genuine observed Run by omitting evidence fields',async()=>{
 const initial=await command({operationId:'security-run-create',action:'create',family:'run',id:'security-run',data:{title:'Owner observed test',body:'Synthetic test of genuine classification guard',engine:'unicode',code:'a',output:'U+0061',evidence:'observed',synthetic:false}});assert.equal(initial.data.status,'committed');
 const r=await request('command',{operationId:'security-run-gpt-update',action:'update',family:'run',id:'security-run',expectedRev:1,data:{output:'invented result'}},owner,'gpt');assert.equal(r.status,400);assert.equal(r.data.code,'unattested_execution');assert.equal((await request('read',{family:'run',id:'security-run'})).data.output,'U+0061');
 });
 await t.test('source URLs and rights cannot masquerade as an admitted external excerpt',async()=>{
 for(const [id,source] of [['bad-protocol',{url:'javascript:alert(1)',attribution:'Test',rights:'link-only'}],['unadmitted-excerpt',{url:'https://example.invalid/source',attribution:'Test',rights:'permitted-excerpt'}]]){
 const r=await command({operationId:'security-source-'+id,action:'create',family:'source',id,data:{title:'SYNTHETIC TEST ONLY',body:'No third-party content imported',source,synthetic:true}});assert.equal(r.status,400);assert.equal(r.data.code,id==='bad-protocol'?'invalid_reference':'source_rights');
 }
 });
 await t.test('multi-part anchors must follow retained source order with exact canonical joins',async()=>{
 const article=(await command({operationId:'security-multipart-create',action:'create',family:'article',id:'security-multipart',data:{title:'SYNTHETIC TEST ONLY multipart',body:'',synthetic:true,sections:[{id:'s',title:'Parts',parts:[{id:'a',kind:'paragraph',text:'Alpha'},{id:'b',kind:'code',text:'Beta'},{id:'c',kind:'paragraph',text:'Gamma'}]}]}})).data.record;
 const segments=[{sectionId:'s',partId:'a',start:0,end:5},{sectionId:'s',partId:'b',start:0,end:4},{sectionId:'s',partId:'c',start:0,end:5}];
 const anchor={articleId:article.id,rendition:article.rendition,...segments[0],quote:'Alpha\nBeta\nGamma',segments};
 const valid=await command({operationId:'security-multipart-valid',action:'create',family:'flag',id:'security-multipart-flag',data:{title:'Test',body:'',anchor,synthetic:true}});assert.equal(valid.data.status,'committed');
 const skipped={...anchor,segments:[segments[0],segments[2]],quote:'Alpha\nGamma'};
 const invalid=await command({operationId:'security-multipart-skip',action:'create',family:'flag',id:'security-multipart-skip',data:{title:'Test',body:'',anchor:skipped,synthetic:true}});assert.equal(invalid.status,409);assert.equal(invalid.data.code,'passage_unavailable');
 });
 const articleCommand={operationId:'security-article-create',action:'create',family:'article',id:'security-article',data:{title:'SYNTHETIC TEST ONLY Unicode',body:'Original test prose',synthetic:true,sections:[{id:'s',title:'Representation',parts:[{id:'p',kind:'paragraph',text:'🧠 same phrase α'}]}]}};
 const article=(await command(articleCommand)).data.record;
 const anchor={articleId:article.id,rendition:article.rendition,sectionId:'s',partId:'p',start:0,end:2,quote:'🧠'};
 await t.test('normal title, introduction and section headings are canonical passage targets',async()=>{
 for(const [partId,sectionId,quote] of [['__title','__article',article.title],['__body','__article',article.body],['__heading','s',article.sections[0].title]]){
 const target={articleId:article.id,rendition:article.rendition,sectionId,partId,start:0,end:quote.length,quote};
 const r=await command({operationId:'security-canonical-'+partId,action:'create',family:'flag',id:'security-canonical-'+partId,data:{title:'Canonical passage',body:'',anchor:target,synthetic:true}});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.status,'committed');
 }
 });
 await t.test('UTF-16 anchor accepts exact surrogate-pair quote and rejects a mismatching quote',async()=>{
 const bad=await command({operationId:'security-bad-anchor',action:'create',family:'annotation',id:'bad-anchor',data:{title:'Test',body:'independent user prose',anchor:{...anchor,quote:'wrong'},synthetic:true}});assert.equal(bad.status,409);
 const good=await command({operationId:'security-good-anchor',action:'create',family:'annotation',id:'security-annotation',data:{title:'Test',body:'independent user prose',anchor,synthetic:true}});assert.equal(good.data.status,'committed');assert.equal(good.data.record.anchor.end,2);
 });
 await t.test('existing exact anchor cannot silently retarget to another passage',async()=>{
 const r=await command({operationId:'security-retarget',action:'update',family:'annotation',id:'security-annotation',expectedRev:1,data:{anchor:{...anchor,start:3,end:7,quote:'same'}}});assert.equal(r.status,400);assert.equal(r.data.code,'anchor_immutable');
 });
 await t.test('article edit retains old rendition and anchor, without guessing current coordinates',async()=>{
 const r=await command({operationId:'security-article-update',action:'update',family:'article',id:article.id,expectedRev:1,data:{sections:[{id:'s',title:'Representation',parts:[{id:'p',kind:'paragraph',text:'new prefix 🧠 same phrase α'}]}]}});assert.equal(r.data.status,'committed');assert.notEqual(r.data.record.rendition,anchor.rendition);
 const resolved=(await request('anchor',anchor)).data;assert.equal(resolved.state,'retained-revision');assert.equal(resolved.part.text.slice(anchor.start,anchor.end),anchor.quote);
 assert.equal((await request('rendition',{articleId:article.id,rendition:anchor.rendition})).data.sections[0].parts[0].text,'🧠 same phrase α');
 });
 await t.test('Trashed source makes retained passage unavailable while independent annotation prose survives',async()=>{
 await command({operationId:'security-article-trash',action:'trash',family:'article',id:article.id,expectedRev:2});
 assert.equal((await request('anchor',anchor)).data.state,'unavailable');
 assert.equal((await request('rendition',{articleId:article.id,rendition:anchor.rendition})).data,null);
 assert.equal((await request('read',{family:'annotation',id:'security-annotation'})).data.body,'independent user prose');
 });
 }finally{await mf.dispose()}
});
