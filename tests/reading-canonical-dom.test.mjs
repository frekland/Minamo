import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/reading-canonical-dom.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {canonicalDomText,canonicalDomRangeText,canonicalDomBoundary}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));

const word=text=>({nodeType:3,textContent:text,length:text.length,parentElement:null});
const element=(tagName,...childNodes)=>({nodeType:1,tagName,childNodes});

test('Furigana rt and rp never enter the canonical passage or clipboard',()=>{
 const node=element('P',word('私'),element('RUBY',word('友達'),element('RT',word('ともだち')),element('RP',word('('))),word('と話す。'));
 assert.equal(canonicalDomText(node),'私友達と話す。');
 assert.equal(canonicalDomRangeText({cloneContents:()=>node}),'私友達と話す。');
});

test('Restoring a canonical range skips furigana reading nodes',()=>{
 const first=word('友'),ruby=word('とも'),second=word('達'),last=word('です');
 ruby.parentElement={closest:()=>({tagName:'RT'})};
 const nodes=[first,ruby,second,last];let i=0;
 const parent={ownerDocument:{createTreeWalker:()=>({nextNode:()=>nodes[i++]??null})}};
 const previous=globalThis.NodeFilter;globalThis.NodeFilter={SHOW_TEXT:4};
 try{
  assert.deepEqual(canonicalDomBoundary(parent,2),{node:second,offset:1});
  i=0;assert.deepEqual(canonicalDomBoundary(parent,4),{node:last,offset:2});
 }finally{if(previous===undefined)delete globalThis.NodeFilter;else globalThis.NodeFilter=previous;}
});
