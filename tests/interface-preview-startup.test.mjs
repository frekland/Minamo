import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild'),{Miniflare}=wr('miniflare');

test('concurrent isolated Interface lab startup and later requests complete with one replay-safe specimen set',{timeout:45000},async()=>{
 const built=await build({stdin:{contents:"import{interfaceLabPreviewHandler}from'./lib/interface-lab-preview.ts';export default{fetch:interfaceLabPreviewHandler}",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'neutral',write:false,loader:{'.sql':'text'},define:{'import.meta.env.DEV':'true'}});
 const mf=new Miniflare({modules:true,script:built.outputFiles[0].text,compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET']});
 const request=async()=>{const response=await mf.dispatchFetch('https://preview.test/preview-interface/api?path=%2Fapi%2Fworkspace');const body=await response.json();assert.equal(response.status,200,JSON.stringify(body));return body;};
 try{
  const controller=new AbortController();
  const abandoned=mf.dispatchFetch('https://preview.test/preview-interface/api?path=%2Fapi%2Fworkspace',{signal:controller.signal}).then(response=>response.arrayBuffer()).catch(()=>null);
  const cancel=setTimeout(()=>controller.abort(),20);
  const pages=await Promise.all([request(),request(),request()]);
  clearTimeout(cancel);await abandoned;
  const later=await request();
  for(const page of [...pages,later])assert.ok(page.records.some(record=>record.id==='TEST-ONLY-interface-debug'));
  const db=await mf.getD1Database('DB');
  assert.equal((await db.prepare("SELECT count(*) AS n FROM v2_records WHERE family='experiment' AND id LIKE 'TEST-ONLY-interface-%'").first()).n,11);
  assert.equal((await db.prepare("SELECT count(*) AS n FROM v2_records WHERE family='run'").first()).n,0,'Fixture startup never creates Runs or Attempts.');
 }finally{await mf.dispose();}
});
