import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {CONTENT_PAGE_FORMAT,encodePortablePage,decodePortablePage,PortablePageError} from '../lib/portable-content-codec.ts';
if (!globalThis.crypto)globalThis.crypto=webcrypto;
const encoded = new TextEncoder();
const digest = async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
const project = () => ({
 header:{format:CONTENT_PAGE_FORMAT,kind:'project',exportId:'test-export',page:0,exportedAt:'2026-11-12T12:00:00.000Z',source:{application:'minamo',version:'V165'},recordCount:1,assetCount:0},
 records:[{family:'journey',id:'making-friends',revision:4,rendition:'r-stub',canonical:{id:'making-friends',family:'journey',title:'日本語',body:'Read a message',projectComposition:{sections:[],blocks:[]},sections:[{id:'intro',title:'実例',parts:[]}],links:[]}}],assets:[]
});
const fails = async (job,code)=>await assert.rejects(job,e=>e instanceof PortablePageError&&e.code===code);
test('an exact canonical Project with Unicode and layout details roundtrips without rewriting content',async()=>{
 const original=project(),bytes=await encodePortablePage(original),back=await decodePortablePage(bytes);
 assert.deepEqual(back,original);assert.deepEqual(back.records[0].canonical.projectComposition,{sections:[],blocks:[]});
});
test('a Library page carries multiple Articles and an Area but cannot carry Projects',async()=>{
 const input=project();input.header.kind='library';input.records=[{family:'article',id:'japanese-reference',revision:2,canonical:{family:'article',id:'japanese-reference',title:'日本語'}},{family:'area',id:'language',revision:1,canonical:{family:'area',id:'language',title:'Languages'}}];input.header.recordCount=2;
 assert.equal((await decodePortablePage(await encodePortablePage(input))).records.length,2);
 input.records.push(project().records[0]);input.header.recordCount=3;
 await fails(()=>encodePortablePage(input),'invalid_record');
});
test('corrupt, truncated and trailing data are rejected without partial acceptance',async()=>{
 const original=await encodePortablePage(project());
 await fails(()=>decodePortablePage(original.slice(0,-2)),'truncated');
 await fails(()=>decodePortablePage(new Uint8Array([...original,2])),'trailing_bytes');
 const corrupt=original.slice();corrupt[0]=1;
 await fails(()=>decodePortablePage(corrupt),'format');
 const recordCorrupt=original.slice();recordCorrupt[recordCorrupt.length-8]^=2;
 await fails(()=>decodePortablePage(recordCorrupt),'record_integrity');
});
test('assets must carry original byte integrity and remain immutable after decoding',async()=>{
 const bytes=encoded.encode('PNG-like stub—not a decoded photograph');
 const id='image-'+'a'.repeat(64),meta={kind:'image',id,mime:'image/png',bytes:bytes.length,sha256:await digest(bytes)};
 const input=project();input.assets=[{metadata:meta,bytes}];input.header.assetCount=1;
 const packed=await encodePortablePage(input),output=await decodePortablePage(packed);
 assert.deepEqual(output.assets[0].bytes,bytes);
 const modified=packed.slice();modified[modified.length-1]^=2;
 await fails(()=>decodePortablePage(modified),'asset_integrity');
 input.assets[0].bytes[0]^=1;
 await fails(()=>encodePortablePage(input),'asset_integrity');
});
test('strict inventory, unique identities, and no Note-family exports',async()=>{
 const input=project();input.header.recordCount=2;
 await fails(()=>encodePortablePage(input),'invalid_project_page');
 input.header.recordCount=1;input.records[0].family='note';input.records[0].canonical.family='note';
 await fails(()=>encodePortablePage(input),'invalid_record');
 const another=project();another.header.kind='library';another.records=[{family:'article',id:'same',revision:1,canonical:{id:'same',family:'article'}},{family:'article',id:'same',revision:2,canonical:{id:'same',family:'article'}}];another.header.recordCount=2;
 await fails(()=>encodePortablePage(another),'duplicate_record');
});
