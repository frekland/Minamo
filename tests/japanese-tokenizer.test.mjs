import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import vm from 'node:vm';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({entryPoints:['lib/japanese-token-readings.ts'],bundle:true,format:'esm',platform:'node',write:false});
const {tokenReadingRuns}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));

test('actual browser worker loads its local dictionary and reads compound/inflected examples',{timeout:60000},async()=>{
 const root=dirname(require.resolve('kuromoji/package.json')),urls=[];let resolve;
 const result=new Promise(r=>resolve=r);
 const context=vm.createContext({setTimeout,clearTimeout,console,Uint8Array,Int8Array,Int16Array,Int32Array,Uint16Array,Uint32Array,ArrayBuffer,DataView});
 context.self=context;
 context.XMLHttpRequest=class{open(method,url){assert.equal(method,'GET');assert.ok(url.startsWith('/runtime/kuromoji/dict/'));this.url=url;urls.push(url);}send(){const bytes=readFileSync(join(root,'dict',this.url.split('/').at(-1)));this.response=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);this.status=200;setTimeout(()=>this.onload(),0);}};
 context.importScripts=url=>{assert.equal(url,'/runtime/kuromoji/kuromoji.js');vm.runInContext(readFileSync(join(root,'build/kuromoji.js'),'utf8'),context);};
 context.postMessage=data=>resolve(data);
 vm.runInContext(readFileSync('public/japanese-tokenizer.worker.js','utf8'),context);
 const text='初めて会う人と話すのは緊張します。一人で旅行するのは大変です。写真を撮るのと編集するのは違います。';
 await context.onmessage({data:{id:1,text}});
 const response=await result;assert.equal(response.error,undefined,JSON.stringify(response));assert.ok(urls.length>=10);
 const runs=tokenReadingRuns(text,response.tokens);assert.equal(runs.map(r=>r.text).join(''),text);
 for(const [base,reading] of [['初','はじ'],['会','あ'],['緊張','きんちょう'],['一人','ひとり'],['旅行','りょこう'],['大変','たいへん'],['編集','へんしゅう']])assert.ok(runs.some(r=>r.text===base&&r.reading===reading),base+': '+JSON.stringify(runs));
});
test('unknown tokens and explicit readings stay literal, malformed token streams preserve canonical text',()=>{
 const text='日本語（にほんご）と未知';
 const runs=tokenReadingRuns(text,[{surface_form:'日本語',word_type:'KNOWN',reading:'ニホンゴ'},{surface_form:'（にほんご）と',word_type:'UNKNOWN'},{surface_form:'未知',word_type:'UNKNOWN',reading:'ミチ'}]);assert.equal(runs.some(r=>r.reading),false);assert.equal(runs.map(r=>r.text).join(''),text);
 assert.deepEqual(tokenReadingRuns('原文',[{surface_form:'別',word_type:'KNOWN',reading:'ベツ'}]),[{text:'原文'}]);
});
