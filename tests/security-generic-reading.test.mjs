import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const bundle=await build({stdin:{contents:`
import {executeCommand,readRecord,readRendition,resolveAnchor,readContext} from './lib/domain.ts';
export default {async fetch(request,env){const {kind,owner,args}=await request.json();try{let value;
if(kind==='command')value=await executeCommand(env,owner,args);
else if(kind==='read')value=await readRecord(env,owner,args.family,args.id);
else if(kind==='rendition')value=await readRendition(env,owner,args.id,args.rendition,args.family);
else if(kind==='anchor')value=await resolveAnchor(env,owner,args);
else if(kind==='context')value=await readContext(env,owner,args.family,args.id,args.rendition);
else throw Error('Unknown test route');return Response.json(value);
}catch(e){return Response.json({code:e.code,error:e.message},{status:e.status||500})}}};`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});

test('generalised exact reading preserves family and retained history boundaries',async t=>{
 const mf=new Miniflare({modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB']});
 try{
 const db=await mf.getD1Database('DB');for(const name of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+name,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const owner='synthetic-generic-security';
 const call=async(kind,args,principal=owner)=>{const r=await mf.dispatchFetch('https://security.invalid/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,args,owner:principal})});return{status:r.status,data:await r.json()}};
 const command=args=>call('command',args);
 const records=new Map();
 for(const family of ['article','journey','investigation','area','note','source','experiment','run']){
 const data={title:'SYNTHETIC TEST ONLY same name',body:'A shared exact phrase 🧠',synthetic:true,...(family==='source'?{source:{url:'https://example.invalid/reference',attribution:'Test-only source metadata',rights:'link-only'}}:{}),...(['experiment','run'].includes(family)?{engine:'python',code:'print("café")\r\nprint(2)',...(family==='run'?{output:'café\r\n2',evidence:'observed'}:{})}:{})};
 const response=await command({operationId:'generic-create-'+family,action:'create',family,id:'shared-family-id',data});assert.equal(response.status,200,JSON.stringify(response.data));records.set(family,response.data.record);
 }
 const bodyAnchor=record=>({articleId:record.id,recordFamily:record.family,rendition:record.rendition,sectionId:'__article',partId:'__body',start:0,end:record.body.length,quote:record.body});
 await t.test('every supported reading family has its own valid exact retained body target',async()=>{
 for(const [family,record] of records){const target=bodyAnchor(record);const resolved=await call('anchor',target);assert.equal(resolved.data.state,'current',family);assert.equal(resolved.data.record.family,family);assert.equal(resolved.data.record.id,record.id);assert.equal((await command({operationId:'generic-flag-'+family,action:'create',family:'flag',id:'flag-'+family,data:{title:'Test exact family',body:'',anchor:target,synthetic:true}})).data.status,'committed');}
 });
 await t.test('same IDs and same text cannot alias across explicit family boundaries',async()=>{
 const article=records.get('article'),journey=records.get('journey');assert.notEqual(article.rendition,journey.rendition);
 const forged={...bodyAnchor(article),recordFamily:'journey'};assert.equal((await call('anchor',forged)).data.state,'unavailable');
 const rejected=await command({operationId:'generic-family-forgery',action:'create',family:'annotation',id:'wrong-family',data:{title:'Test',body:'Retain exact context',anchor:forged,synthetic:true}});assert.equal(rejected.status,409);
 const context=(await call('context',{family:'journey',id:journey.id})).data;assert.ok(context.related.some(r=>r.family==='flag'&&r.id==='flag-journey'));assert.ok(!context.related.some(r=>r.family==='flag'&&r.id==='flag-article'));
 });
 await t.test('legacy articleId-only anchors still mean article, never same-ID Journey',async()=>{
 const {recordFamily,...legacy}=bodyAnchor(records.get('article'));assert.equal((await call('anchor',legacy)).data.record.family,'article');
 const {recordFamily:other,...wrongLegacy}=bodyAnchor(records.get('journey'));assert.equal((await call('anchor',wrongLegacy)).data.state,'unavailable');
 });
 await t.test('saved Run code/output preserve literal CRLF, Unicode and exact part identity',async()=>{
 const run=records.get('run');for(const [partId,quote] of [['__code',run.code],['__output',run.output]]){const target={articleId:run.id,recordFamily:'run',rendition:run.rendition,sectionId:'__article',partId,start:0,end:quote.length,quote};assert.equal((await call('anchor',target)).data.state,'current');assert.equal((await command({operationId:'generic-run-'+partId,action:'create',family:'annotation',id:'run-'+partId,data:{title:'Observed output comment',body:'Independent prose',anchor:target,synthetic:true}})).data.status,'committed');}
 });
 await t.test('editing one same-ID family retains its edition without moving other-family captures',async()=>{
 const journey=records.get('journey');assert.equal((await command({operationId:'generic-journey-update',action:'update',family:'journey',id:journey.id,expectedRev:1,data:{body:'A revised Journey explanation'}})).data.status,'committed');
 const retained=await call('anchor',bodyAnchor(journey));assert.equal(retained.data.state,'retained-revision');assert.equal(retained.data.record.body,journey.body);assert.equal(retained.data.record.family,'journey');assert.equal((await call('anchor',bodyAnchor(records.get('article')))).data.state,'current');
 });
 await t.test('source Trash fences source history and anchors without hiding unrelated same-ID article or user annotation',async()=>{
 const source=records.get('source');const annotation=await command({operationId:'generic-source-annotation',action:'create',family:'annotation',id:'source-annotation',data:{title:'My test source thought',body:'Independent source observation remains',anchor:bodyAnchor(source),synthetic:true}});assert.equal(annotation.data.status,'committed');
 assert.equal((await command({operationId:'generic-source-trash',action:'trash',family:'source',id:source.id,expectedRev:1})).data.status,'committed');assert.equal((await call('anchor',bodyAnchor(source))).data.state,'unavailable');assert.equal((await call('rendition',{family:'source',id:source.id,rendition:source.rendition})).data,null);assert.equal((await call('anchor',bodyAnchor(records.get('article')))).data.state,'current');assert.equal((await call('read',{family:'annotation',id:'source-annotation'})).data.body,'Independent source observation remains');
 });
 await t.test('pre-generalisation rows with no rendition get read-only family-qualified exact legacy history IDs',async()=>{
 const now='2026-10-21T12:00:00.000Z';
 for(const family of ['article','journey']){
 const id='legacy-shared-id';const old={id,family,title:'Legacy test '+family,body:'Legacy body '+family,links:[],rev:1,createdAt:now,updatedAt:now,trashedAt:null,actor:'system',synthetic:true};const current={...old,body:'New legacy body '+family,rev:2};
 await db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,2,NULL,?)').bind(owner,family,id,JSON.stringify(current),'fixture-'+family).run();
 for(const r of [old,current])await db.prepare('INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) VALUES(?,?,?,?,?,NULL)').bind(owner,family,id,r.rev,JSON.stringify(r)).run();
 const fresh=await call('read',{family,id});assert.equal(fresh.data.rendition,'legacy-'+family+'-'+id+'-r2');
 const rendition='legacy-'+family+'-'+id+'-r1',historical=(await call('rendition',{family,id,rendition})).data;assert.equal(historical.body,old.body);assert.equal(historical.rendition,rendition);
 const target={recordFamily:family,articleId:id,rendition,sectionId:'__article',partId:'__body',start:0,end:old.body.length,quote:old.body};assert.equal((await call('anchor',target)).data.state,'retained-revision');assert.equal((await command({operationId:'legacy-capture-'+family,action:'create',family:'flag',id:'legacy-flag-'+family,data:{title:'Legacy capture',body:'',anchor:target,synthetic:true}})).data.status,'committed');
 assert.equal((await call('rendition',{family:family==='article'?'journey':'article',id,rendition})).data,null);
 const stored=await db.prepare('SELECT data FROM v2_records WHERE owner=? AND family=? AND id=?').bind(owner,family,id).first();assert.ok(!Object.hasOwn(JSON.parse(stored.data),'rendition'),'GET projection must not write a rendition into stored data');
 }
 });
 }finally{await mf.dispose()}
});
