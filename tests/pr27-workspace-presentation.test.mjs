import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Preview from './app/reference-preview.tsx';import Reader from './app/reader.tsx';export{previewParts}from'./app/reference-preview.tsx';export*from'./lib/workspace-presentation.ts';export*from'./lib/presentation-preferences.ts';export{recordSummary}from'./lib/record-summary.ts';export const render=(article,target)=>renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(Reader,{article,records:[],draftScope:'test',onCommand:async()=>({}),onNavigate:()=>{}}),React.createElement(Preview,{localRecord:article,target,scope:'test',onClose:()=>{},onOpen:()=>{},onNote:()=>{}})));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'pr27-presentation-')),path=join(dir,'bundle.cjs');writeFileSync(path,result.outputFiles[0].text);const ui=require(path);rmSync(dir,{recursive:true,force:true});
const record={family:'article',id:'TEST-ONLY-ref',title:'Function values',body:'Independent opening.',rendition:'edition-1',rev:1,actor:'gpt',synthetic:true,links:[],createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z',sections:[{id:'s1',title:'Trace a return',parts:[{id:'p1',kind:'paragraph',text:'A return passes a value to the caller.'},{id:'c1',kind:'code',language:'javascript',text:'const word = "🙂";\nconsole.log(word);'},{id:'restricted',kind:'excerpt',text:'WITHHELD_CANARY',unavailable:true},{id:'oversize',kind:'paragraph',text:'x'.repeat(7100)}]}]};
test('reference URLs preserve exact valid identities and add no prose, including long renditions',()=>{
 const long='r'+'x'.repeat(238),target={family:'article',id:record.id,rendition:long,sectionId:'s1',partId:'p1'};
 const url=ui.referenceUrl(new URL('https://example.test/?view=journeys&id=route&stage=stable'),target);assert.deepEqual(ui.referenceFromUrl(new URL(url,'https://example.test').searchParams),target);assert.match(url,/stage=stable/);assert.equal(ui.referenceFromUrl(new URLSearchParams('refFamily=article&refId=bad%20id')),null);assert.equal(ui.referenceFromUrl(new URLSearchParams('refFamily=note&refId=secret')),null);
 const closed=ui.referenceUrl(new URL(url,'https://example.test'),null);assert.doesNotMatch(closed,/refId/);assert.match(closed,/stage=stable/);
 assert.deepEqual(ui.referenceFromUrl(new URLSearchParams('refFamily=article&refId=test&refSection=__article&refPart=__body')),{family:'article',id:'test',sectionId:'__article',partId:'__body'});
});
test('passive preview does not duplicate canonical IDs/hooks and preserves code bytes without hidden text',()=>{
 const target={family:'article',id:record.id,rendition:record.rendition,sectionId:'s1'};const projected=ui.previewParts(record,target);assert.equal(projected.omitted,true);assert.deepEqual(projected.parts.map(p=>p.id),['p1','c1']);const html=ui.render({...record,sections:[{...record.sections[0],parts:record.sections[0].parts.slice(0,3)}]},target);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);assert.equal(ids.length,new Set(ids).size);const preview=html.slice(html.indexOf('<aside class="wp-reference"'));assert.doesNotMatch(preview,/data-reading-part|id="passage-|WITHHELD_CANARY/);assert.match(preview,/console.log\(word\);/);assert.match(preview,/Open exact Article/);assert.match(preview,/partial preview/i);
 const missing=ui.previewParts(record,{...target,partId:'not-present'});assert.equal(missing.missing,true);const missingHtml=ui.render(record,{...target,partId:'not-present'});assert.match(missingHtml,/No similar passage has been substituted/);assert.match(missingHtml,/disabled=""[^>]*>.*Note on this reference/);
 const huge=ui.previewParts(record,{...target,partId:'oversize'});assert.deepEqual(huge.parts,[]);assert.equal(huge.omitted,true);
});
test('device settings whitelist and scope cannot carry arbitrary state or learning authority',()=>{
 assert.deepEqual(ui.presentationPreferences({version:900,size:'largest',width:'wrong',codeWrap:true,motion:'reduce',drafts:{secret:'no'},owner:'no'}),{version:1,size:'largest',width:'comfortable',spacing:'comfortable',codeWrap:true,sidebar:'open',motion:'reduce'});assert.notEqual(ui.presentationKey('owner-A'),ui.presentationKey('owner-B'));assert.deepEqual(ui.presentationPreferences(null),ui.defaultPresentation);assert.equal(ui.workspaceEntry({minamoWorkspace:{scope:'other',mainScroll:200}},'owner'),null);
 const link=ui.readingContextLink({...record,family:'journey',learningShape:{kind:'journey',version:1,stages:[{id:'stage-1',sectionId:'s1'}]}},'stage-1');assert.deepEqual(link,{family:'journey',id:record.id,rendition:'edition-1',sectionId:'s1'});
 assert.deepEqual(ui.recordSummary({...record,body:''},100),{text:'A return passes a value to the caller.',origin:'canonical-excerpt'});
});
