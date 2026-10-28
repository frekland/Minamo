import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeBundleFixture,encodeBundleFixture} from './portable-bundle-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {Miniflare}=wr('miniflare'),{build}=wr('esbuild');
const script=`import {createCheckpoint,loadManifest,stageCheckpoint,snapshotRows} from './lib/recovery.ts';import {resolveGeneration} from './lib/generations.ts';import {recoveryBundleHandler} from './lib/recovery-bundle.ts';export default {async fetch(r,e){const u=new URL(r.url),owner=u.searchParams.get('owner')??'synthetic-owner';const current=await resolveGeneration(e,owner);try{const action=u.pathname;if(action.startsWith('/api/recovery/'))return await recoveryBundleHandler(r,e,owner,current);const result=action==='/snapshot'?await snapshotRows(e,owner):action==='/create'?await createCheckpoint(e,owner,'synthetic-checkpoint',current):action==='/load'?await loadManifest(e,owner,u.searchParams.get('archive')):await stageCheckpoint(e,owner,u.searchParams.get('archive'),'synthetic-stage',current);return Response.json(result)}catch(error){return Response.json({code:error.code,message:error.message},{status:error.status??500})}}}`;
const built=await build({stdin:{contents:script,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false});
const stable=v=>Array.isArray(v)?'['+v.map(stable).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}':JSON.stringify(v);
const source={version:1,brief:'Synthetic complete original brief. '.repeat(35),documents:[{key:'reference',role:'article',markdown:'# UTF-16 🐈\r\n\r\n**Original** source and `literal` syntax.\r\n'}]};
const refs=[{key:'reference',family:'article',id:'synthetic-article',rev:1,rendition:'r-'+'a'.repeat(64)}];
const digest=createHash('sha256').update(stable({version:1,manuscript:source,refs})).digest('hex');
test('manuscript source editions are immutable, owner scoped and survive real D1/R2 checkpoint staging',async t=>{
 const mf=new Miniflare({modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-05-15',cf:false,d1Databases:['DB'],r2Buckets:['BUCKET']});
 try{
  const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql).run();
  const row={owner:'synthetic-owner',id:'synthetic-manuscript',digest,source:JSON.stringify(source),refs:JSON.stringify(refs),created_at:'2026-10-22T00:00:00.000Z'};
  await db.prepare('INSERT INTO v2_manuscript_editions(owner,id,digest,source,refs,created_at) VALUES(?,?,?,?,?,?)').bind(...Object.values(row)).run();
  const call=async path=>{const r=await mf.dispatchFetch('https://synthetic.test'+path);return {status:r.status,data:await r.json()}};
  await t.test('insert updates namespace watermark and update/delete cannot rewrite source history',async()=>{
   assert.equal((await db.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(row.owner).first()).version,1);
   await assert.rejects(db.prepare('UPDATE v2_manuscript_editions SET source=? WHERE owner=?').bind('{}',row.owner).run(),/immutable manuscript/);
   await assert.rejects(db.prepare('DELETE FROM v2_manuscript_editions WHERE owner=?').bind(row.owner).run(),/immutable manuscript/);
   assert.equal((await db.prepare('SELECT source FROM v2_manuscript_editions WHERE owner=?').bind(row.owner).first()).source,row.source);
  });
  await t.test('snapshot and checkpoint bind original source, full brief and exact refs',async()=>{
   const snapshot=await call('/snapshot');assert.equal(snapshot.status,200);assert.deepEqual(snapshot.data.tables.v2_manuscript_editions,[row]);
   assert.deepEqual((await call('/snapshot?owner=foreign-owner')).data.tables.v2_manuscript_editions,[]);
   const checkpoint=await call('/create');assert.equal(checkpoint.status,200,JSON.stringify(checkpoint));assert.equal(checkpoint.data.counts.v2_manuscript_editions,1);
   const archive=checkpoint.data.id,loaded=await call('/load?archive='+archive);assert.equal(loaded.status,200,JSON.stringify(loaded));assert.deepEqual(loaded.data.manifest.tables.v2_manuscript_editions,[row]);
   const staged=await call('/stage?archive='+archive);assert.equal(staged.status,200,JSON.stringify(staged));
   const target=await db.prepare('SELECT namespace FROM v2_recovery_stages WHERE owner=? AND id=?').bind(row.owner,staged.data.id).first();
   const restored=await db.prepare('SELECT * FROM v2_manuscript_editions WHERE owner=? AND id=?').bind(target.namespace,row.id).first();assert.deepEqual(restored,{...row,owner:target.namespace});
   assert.equal((await call('/load?owner=foreign-owner&archive='+archive)).status,404);
  });
  await t.test('encrypted export/import preserves editions and accepts older files with no edition table',async()=>{
   const passphrase='Synthetic-manuscript-recovery-password',headers={'content-type':'application/json','x-minamo-generation':'legacy@0'};
   const response=await mf.dispatchFetch('https://synthetic.test/api/recovery/export',{method:'POST',headers,body:JSON.stringify({operationId:'synthetic-source-export',expectedGeneration:'legacy@0',passphrase})});
   assert.equal(response.status,200);const file=Buffer.from(await response.arrayBuffer());const decoded=decodeBundleFixture(file,passphrase);assert.equal(decoded.manifest.tables.v2_manuscript_editions[0].source,row.source);
   const upload=async(operationId,input)=>{const metadata=Buffer.from(JSON.stringify({operationId,expectedGeneration:'legacy@0',passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);const r=await mf.dispatchFetch('https://synthetic.test/api/recovery/import',{method:'POST',headers:{'content-type':'application/octet-stream','x-minamo-generation':'legacy@0'},body:Buffer.concat([prefix,metadata,input])});return {status:r.status,data:await r.json()}};
   const imported=await upload('synthetic-source-import',file);assert.equal(imported.status,200,JSON.stringify(imported));
   const stagedOwner=(await db.prepare('SELECT namespace FROM v2_recovery_stages WHERE owner=? AND id=?').bind(row.owner,imported.data.staged.id).first()).namespace;
   assert.equal((await db.prepare('SELECT source FROM v2_manuscript_editions WHERE owner=?').bind(stagedOwner).first()).source,row.source);
   const hostile=structuredClone(decoded);hostile.manifest.tables.v2_manuscript_editions[0].source+=' ';
   // JSON whitespace itself preserves the original admitted manuscript. Changing a value must fail its bound digest.
   hostile.manifest.tables.v2_manuscript_editions[0].refs=JSON.stringify([{...refs[0],rev:99}]);
   assert.equal((await upload('synthetic-tampered-import',encodeBundleFixture(hostile,passphrase))).status,400);
   const old=structuredClone(decoded);delete old.manifest.tables.v2_manuscript_editions;const compatible=await upload('synthetic-old-import',encodeBundleFixture(old,passphrase));assert.equal(compatible.status,200,JSON.stringify(compatible));assert.equal(compatible.data.archive.counts.v2_manuscript_editions,0);
  });
 }finally{await mf.dispose();}
});

test('edition digest validates exact original source and target revisions without Source permission grants',async()=>{
 const built=await build({stdin:{contents:'export * from "./lib/manuscript-source.ts"',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
 const {validManuscriptEditionRow,manuscriptEditionDigest}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
 const row={owner:'synthetic-owner',id:'synthetic-manuscript',digest,source:JSON.stringify(source),refs:JSON.stringify(refs),created_at:'2026-10-22T00:00:00.000Z'};
 assert.equal(await manuscriptEditionDigest(source,refs),digest);assert.equal(await validManuscriptEditionRow(row),true);
 assert.equal(await validManuscriptEditionRow({...row,source:JSON.stringify({...source,brief:source.brief+' changed'})}),false);
 assert.equal(await validManuscriptEditionRow({...row,refs:JSON.stringify([{...refs[0],rev:2}])}),false);
 const permission={...source,source:{rights:'permitted-excerpt'}};assert.equal(await validManuscriptEditionRow({...row,source:JSON.stringify(permission),digest:await manuscriptEditionDigest(permission,refs)}),false);
 const scoped={...source,documents:source.documents.map(d=>({...d,learningScope:{version:1,spaces:['languages'],languages:['ja'],provenance:'authored'}}))};
 const scopedRow={...row,source:JSON.stringify(scoped),digest:await manuscriptEditionDigest(scoped,refs)};
 assert.equal(await validManuscriptEditionRow(scopedRow),true,'Normal language-scoped manuscripts must remain recoverable with their exact source digest.');
 assert.equal(await validManuscriptEditionRow({...scopedRow,digest:row.digest}),false,'Admitting scope metadata must not bypass its digest.');
 const invalid={...scoped,documents:scoped.documents.map(d=>({...d,learningScope:{...d.learningScope,languages:['invalid-language']}}))};
 assert.equal(await validManuscriptEditionRow({...row,source:JSON.stringify(invalid),digest:await manuscriptEditionDigest(invalid,refs)}),false,'Malformed scopes remain rejected even with a recomputed digest.');
});
