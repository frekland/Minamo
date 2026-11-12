import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {buildLibraryBackup,exportSafeRecord} from '../lib/library-backup-client.ts';
const origin='https://minamo-legacy-2.jscymru.chatgpt.site';
const binary=new TextEncoder().encode('image test bytes');
const aid='image-'+'a'.repeat(64);
const hash=buffer=>createHash('sha256').update(buffer).digest('hex');
function zipEntries(blob){return blob.arrayBuffer().then(array=>{
 const bytes=new Uint8Array(array),v=new DataView(bytes.buffer);let at=0;const result=new Map();
 while(at<bytes.length){const sig=v.getUint32(at,true);if(sig===0x02014b50||sig===0x06054b50)break;
  assert.equal(sig,0x04034b50);const length=v.getUint32(at+18,true),nameLen=v.getUint16(at+26,true),extraLen=v.getUint16(at+28,true);
  const name=new TextDecoder().decode(bytes.slice(at+30,at+30+nameLen));const start=at+30+nameLen+extraLen;
  result.set(name,bytes.slice(start,start+length));at=start+length;
 }
 return result;
 });}
function mockFetcher({assetDigest=hash(binary),changed=false,history=true}={}) {
 const calls=[];
 const old={family:'article',id:'learner-article',rev:1,title:'Earlier version',body:'Version 1',sections:[],links:[]};
 const article={...old,rev:2,title:'Japanese article',body:'Version 2',sections:[{id:'x',title:'Gallery',parts:[{id:'image',kind:'image',text:'',image:{assetId:aid,alt:'Picture'}}]}]};
 const area={family:'area',id:'lang',rev:1,title:'Languages',body:'A subject',sections:[],links:[]};
 const source={family:'source',id:'external',rev:1,title:'External excerpt',source:{url:'https://example.org',excerpt:{text:'NOT EXPORTABLE',state:'permitted',exportAllowed:false}},sections:[],links:[]};
 let articleCount=0;
 const fetcher=async(path,init)=>{
  const u=new URL(path);assert.equal(u.origin,origin);assert.equal(init?.credentials,'same-origin');assert.equal(init?.method??'GET','GET');calls.push(u.pathname+u.search);
  const response=(body,status=200)=>new Response(JSON.stringify({...body,generation:'legacy@0'}),{status,headers:{'content-type':'application/json'}});
  if(u.pathname==='/api/query'){
   const fam=u.searchParams.get('family');let records=fam==='article'?[article]:fam==='area'?[area]:fam==='source'?[source]:[];
   if(fam==='article'&&changed&&++articleCount>1)records=[{...article,rev:3}];
   return response({records,nextCursor:null,truncated:false});
  }
  if(u.pathname==='/api/context'){const key=u.searchParams.get('family');return response({record:key==='article'?article:key==='area'?area:source});}
  if(u.pathname==='/api/records/changes')return response({entries:history&&u.searchParams.get('family')==='article'?[{rev:2},{rev:1}]:[{rev:1}],nextBeforeRevision:null});
  if(u.pathname==='/api/records/revision')return response({record:old});
  if(u.pathname===`/api/assets/${aid}/metadata`)return response({asset:{assetId:aid,bytes:binary.length,mime:'image/png',digest:assetDigest}});
  if(u.pathname===`/api/assets/${aid}`)return new Response(binary);
  return response({error:'Not found'},404);
 };
 return {fetcher,calls};
}
test('real ZIP contains current articles, subject records, sources, retained editions and original image bytes',async()=>{
 const {fetcher,calls}=mockFetcher();const result=await buildLibraryBackup({origin,fetcher});
 assert.deepEqual(result.counts,{records:3,retainedEditions:1,assets:1,missingAssets:0,redactions:1});
 assert.equal(result.complete,true);assert.equal(result.file.type,'application/zip');
 const entries=await zipEntries(result.file);
 assert.equal(entries.has('records/article/learner-article/current.json'),true);
 assert.equal(entries.has('records/article/learner-article/revisions/1.json'),true);
 assert.equal(entries.has('records/area/lang/current.json'),true);
 assert.deepEqual(entries.get(`assets/image/${aid}.png`),binary);
 assert.equal(JSON.parse(new TextDecoder().decode(entries.get('records/source/external/current.json'))).source.excerpt,undefined);
 const manifest=JSON.parse(new TextDecoder().decode(entries.get('manifest.json')));
 assert.equal(manifest.complete,true);assert.equal(manifest.format,'minamo-library-archive@1');
 assert.equal(manifest.assets[0].sha256,hash(binary));
 assert.equal(calls.some(c=>c.startsWith('/api/recovery')),false);
 assert.equal(calls.every(c=>c.startsWith('/api/')),true);
});
test('missing or altered assets are flagged without pretending archive completeness',async()=>{
 const {fetcher}=mockFetcher({assetDigest:'b'.repeat(64)});const result=await buildLibraryBackup({origin,fetcher,history:false});
 assert.equal(result.complete,false);assert.equal(result.counts.missingAssets,1);assert.match(result.filename,/PARTIAL/);
 const entries=await zipEntries(result.file);assert.equal(entries.size,5);const manifest=JSON.parse(new TextDecoder().decode(entries.get('manifest.json')));
 assert.equal(manifest.complete,false);assert.match(manifest.warnings[0],/digest\/size mismatch/);
});
test('concurrent current-record changes abort export, rather than presenting inconsistent backup',async()=>{
 const {fetcher}=mockFetcher({changed:true});await assert.rejects(buildLibraryBackup({origin,fetcher,history:false}),/Library changed during export/);
});
test('non-exportable excerpts are removed in both Source records and reproduced reading parts',()=>{
 const testRecord={family:'article',id:'doc',rev:1,sections:[{id:'a',parts:[{kind:'excerpt',text:'restricted text',excerptDisplay:{exportAllowed:false}},{kind:'excerpt',text:'allowed text',excerptDisplay:{exportAllowed:true}}]}]};
 const {value,redactions}=exportSafeRecord(testRecord);assert.equal(redactions,1);assert.equal(value.sections[0].parts[0].text,'');assert.equal(value.sections[0].parts[0].unavailable,true);assert.equal(value.sections[0].parts[1].text,'allowed text');assert.equal(testRecord.sections[0].parts[0].text,'restricted text');
});
