import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const worker=`import {domainHandler} from './lib/domain-handler.ts';export default{fetch:domainHandler};`;
const stamp='2026-10-22T00:00:00.000Z';
const hash=s=>'r-'+createHash('sha256').update(s).digest('hex');
test('cumulative 1500-topic and 256-save history streams a complete encrypted file and restores an older checkpoint with automatic backup',async()=>{
 const f=await privateStorageFixture(worker);try{
 const c=f.client('synthetic-pr19-cumulative'),ok=r=>{assert.equal(r.status,200,JSON.stringify(r.data));return r.data;};
 const first=ok(await c.command({action:'create',family:'note',id:'old-checkpoint-note',data:{title:'Synthetic earlier work',body:'The older checkpoint remains available.',synthetic:true}})).record;
 const older=ok(await c.recover('checkpoint',{operationId:'before-cumulative-history'})).archive;
 const statements=[];const flush=async()=>{if(statements.length){await f.db.batch(statements.splice(0));}};
 const record=(family,id,rev,body,sections)=>{const r={id,family,title:'SYNTHETIC '+id,body,links:[],rev,createdAt:stamp,updatedAt:stamp,actor:'user',synthetic:true,...(sections?{sections}:{})};r.rendition=hash(JSON.stringify(r));return r;};
 // Substantive bounded entries, not 1500 empty title-only rows. Retained article
 // readings and the exact old Note revisions/receipts are never discarded.
 const teaching=('An HTTP response consists of a status line, headers and an optional body. A header is protocol metadata; it is not evidence that application code ran. Predict the response before changing a flag, compare one variable, and preserve the observed output with its environment. ');
 for(let n=0;n<1500;n++){
  const id='topic-'+String(n).padStart(4,'0'),r=record('article',id,1,teaching.repeat(6),[{id:'explanation',title:'Inspect one response '+n,parts:[{id:'mechanism',kind:'paragraph',text:teaching.repeat(4)},{id:'example',kind:'code',text:'curl --include https://example.invalid/learning/'+n,language:'bash'}]}]),data=JSON.stringify(r);
  statements.push(f.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,1,NULL,?)').bind(c.owner,'article',id,data,'fixture-'+id),f.db.prepare('INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) VALUES(?,?,?,?,?,?)').bind(c.owner,'article',id,1,data,r.rendition));if(statements.length>=80)await flush();
 }
 let last;
 for(let rev=1;rev<=256;rev++){
  const r=record('note','sustained-writing',rev,('Synthetic reported observation '+rev+': '+teaching.repeat(64)).slice(0,16384)),data=JSON.stringify(r),operation='synthetic-autosave-'+rev;last=r;
  statements.push(f.db.prepare('INSERT INTO v2_revisions(owner,family,id,revision,data,rendition) VALUES(?,?,?,?,?,?)').bind(c.owner,'note',r.id,rev,data,r.rendition),f.db.prepare('INSERT INTO v2_operations(owner,id,hash,nonce,status,response) VALUES(?,?,?,?,?,?)').bind(c.owner,operation,'synthetic-'+rev,'nonce-'+rev,'committed',JSON.stringify({operationId:operation,status:'committed',record:r,replayed:false})));if(statements.length>=80)await flush();
 }
 statements.push(f.db.prepare('INSERT INTO v2_records(owner,family,id,data,rev,trashed_at,last_operation) VALUES(?,?,?,?,?,NULL,?)').bind(c.owner,'note',last.id,JSON.stringify(last),last.rev,'synthetic-autosave-256'));await flush();
 const before=performance.now(),checkpoint=ok(await c.recover('checkpoint',{operationId:'complete-cumulative'})).archive;
 assert.ok(checkpoint.bytes>8*1024*1024);assert.equal(checkpoint.counts.v2_records,1502);assert.equal(checkpoint.counts.v2_revisions,1757);assert.equal(checkpoint.counts.v2_operations,257);
 const indexRow=await f.db.prepare('SELECT manifest_key FROM v2_recovery_archives WHERE owner=? AND id=?').bind(c.owner,checkpoint.id).first(),index=JSON.parse(await(await f.bucket.get(indexRow.manifest_key)).text());assert.equal(index.format,'minamo-v2-checkpoint@2');assert.ok(index.pages.length>30);assert.ok(index.pages.every(p=>p.bytes<490000));assert.equal(index.tables.v2_revisions.length,0);assert.equal(ok(await c.recover('verify',{archiveId:checkpoint.id})).valid,true);
 // Complete encrypted transfer exercises actual Worker/D1/R2 and independent
 // authenticated framing; import stays invisible and does not replace live data.
 const passphrase='Synthetic-cumulative-recovery-password';const exported=await c.request('/api/recovery/export',{operationId:'cumulative-file',expectedGeneration:c.generation,passphrase});assert.equal(exported.status,200,JSON.stringify(exported.data));assert.ok(exported.data.length>8*1024*1024);
 const bytes=Buffer.from(exported.data),headerLength=bytes.readUInt32BE(8),header=JSON.parse(bytes.subarray(12,12+headerLength));assert.equal(header.format,'minamo-recovery-bundle@2');
 const metadata=Buffer.from(JSON.stringify({operationId:'cumulative-import',expectedGeneration:c.generation,passphrase})),prefix=Buffer.alloc(4);prefix.writeUInt32BE(metadata.length);const imported=ok(await c.request('/api/recovery/import',Buffer.concat([prefix,metadata,bytes]),{raw:true,headers:{'content-type':'application/octet-stream'}}));assert.equal(imported.staged.state,'ready');assert.equal(imported.archive.counts.v2_revisions,1757);
 const importedNamespace=(await f.db.prepare('SELECT namespace FROM v2_recovery_stages WHERE owner=? AND id=?').bind(c.owner,imported.staged.id).first()).namespace;
 assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_revisions WHERE owner=?').bind(importedNamespace).first()).n,1757);assert.equal((await f.db.prepare("SELECT data FROM v2_revisions WHERE owner=? AND family='note' AND id='sustained-writing' AND revision=1").bind(importedNamespace).first()).data.includes('observation 1:'),true);
 const staged=ok(await c.recover('stage',{archiveId:older.id,operationId:'restore-old-small'})).staged,activated=ok(await c.recover('activate',{stagedId:staged.id,operationId:'activate-old-after-history'}));c.setGeneration(activated.generation);
 assert.equal(ok(await c.context('note',first.id)).record.body,first.body);assert.equal((await c.context('article','topic-1499')).status,404);const backup=ok(await c.recover('verify',{archiveId:activated.backupArchiveId})).archive;assert.equal(backup.counts.v2_records,1502);assert.equal(backup.counts.v2_revisions,1757);
 // The automatic preactivation backup is itself restorable, including history.
 const rollback=ok(await c.recover('stage',{archiveId:backup.id,operationId:'rollback-cumulative'})).staged,back=ok(await c.recover('activate',{stagedId:rollback.id,operationId:'activate-cumulative-rollback'}));c.setGeneration(back.generation);assert.equal(ok(await c.context('note','sustained-writing')).record.rev,256);assert.equal(ok(await c.context('article','topic-1499')).record.title,'SYNTHETIC topic-1499');
 console.log(JSON.stringify({fixture:'isolated-Miniflare-D1-R2',topics:1500,noteSaves:256,checkpointBytes:checkpoint.bytes,pages:index.pages.length,encryptedBytes:bytes.length,totalMilliseconds:Math.round(performance.now()-before)}));
 }finally{await f.dispose();}
});
