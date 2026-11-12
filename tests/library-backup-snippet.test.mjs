import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
const code=readFileSync(new URL('../scripts/legacy-library-backup-snippet.js',import.meta.url),'utf8');
function createHarness(host='minamo-legacy-2.jscymru.chatgpt.site'){
 const reads=[],clicked=[],alerts=[],log=[];let blob;
 class MockURL extends URL {static createObjectURL(value){blob=value;return 'blob:local-backup';}static revokeObjectURL(){}}
 const document={body:{append(){}},createElement(){return {style:{},click(){clicked.push(true);},remove(){}}}};
 const fetch=async(path,init)=>{
  const u=new URL(path);assert.equal(u.hostname,'minamo-legacy-2.jscymru.chatgpt.site');
  assert.equal(init?.credentials,'same-origin');
  assert.equal(init?.method??'GET','GET');
  reads.push(u.pathname+u.search);
  if(u.pathname==='/api/query')return new Response(JSON.stringify({records:[],nextCursor:null,truncated:false,generation:'legacy@0'}));
  throw Error('Unexpected request: '+u.pathname);
 };
 const globals={location:{hostname:host,origin:`https://${host}`},URL:MockURL,TextEncoder,TextDecoder,Blob,crypto:webcrypto,document,fetch,window:{fetch},confirm:()=>true,alert:x=>alerts.push(x),console:{info:(...xs)=>log.push(xs),error:(...xs)=>log.push(xs)},setTimeout:()=>{}};
 return {globals,reads,clicked,alerts,log,get blob(){return blob}};
}
test('console backup snippet runs on signed-in legacy origin, reads bounded records and downloads ZIP with no mutations',async()=>{
 const h=createHarness();await vm.runInNewContext(code,h.globals,{timeout:15000});
 assert.equal(h.clicked.length,1);assert.equal(h.reads.length,6);assert(h.reads.every(x=>x.startsWith('/api/query?')));
 assert(h.blob instanceof Blob);assert.equal(h.blob.type,'application/zip');
 assert.equal(new DataView(await h.blob.arrayBuffer()).getUint32(0,true),0x04034b50);
 assert.equal(h.log.some(row=>JSON.stringify(row).includes('Download started')),true);
});
test('console backup refuses to run against arbitrary pages',async()=>{
 const h=createHarness('example.org');await vm.runInNewContext(code,h.globals,{timeout:15000});
 assert.equal(h.reads.length,0);assert.equal(h.clicked.length,0);assert.equal(h.alerts.length,1);
});
