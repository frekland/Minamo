import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {pygbagDiagnostics,isolatedPygbagDocument,PYGBAG_CSP,PYGBAG_LOADER,PYGBAG_LOADER_INTEGRITY} from '../lib/pygbag-package.ts';

test('isolated package reports load/runtime failures and a surface without weakening admission',()=>{
 const events=new Map(),messages=[];let changed,canvas=null,disconnected=false;
 const context={parent:{postMessage:m=>messages.push(m)},addEventListener:(type,handler)=>events.set(type,handler),document:{documentElement:{},querySelector:()=>canvas},window:{},MutationObserver:class{constructor(callback){changed=callback;}observe(){}disconnect(){disconnected=true;}}};
 vm.runInNewContext(pygbagDiagnostics('attempt-token'),context);
 assert.equal(messages[0].phase,'controller');
 assert.doesNotThrow(()=>context.window.custom_onload(),'an early upstream callback cannot dereference absent Module.config');
 events.get('error')({target:{tagName:'SCRIPT'}});assert.match(messages.at(-1).detail,/integrity/);assert.equal(messages.at(-1).minamoPygbag,'attempt-token');
 events.get('unhandledrejection')({reason:new Error('bounded runtime detail')});assert.equal(messages.at(-1).detail,'bounded runtime detail');
 events.get('load')({target:{tagName:'SCRIPT',src:PYGBAG_LOADER}});assert.equal(messages.at(-1).phase,'loader');
 canvas={};changed();assert.equal(messages.at(-1).phase,'surface');assert.equal(disconnected,true);const n=messages.length;changed();assert.equal(messages.length,n);
 const html=readFileSync('tests/pr83-pygbag-standalone.html','utf8'),doc=isolatedPygbagDocument(html,'attempt-token');
 assert.ok(doc.includes(PYGBAG_CSP));assert.ok(doc.includes('integrity="'+PYGBAG_LOADER_INTEGRITY+'"'));assert.match(doc,/crossorigin="anonymous"/);assert.ok(doc.includes(html.slice(html.indexOf('#<!--'))));
 assert.throws(()=>isolatedPygbagDocument('<script src="https://example.test/evil.js"></script>','attempt-token'));
});
