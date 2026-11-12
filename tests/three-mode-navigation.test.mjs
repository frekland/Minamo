import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Reader from './app/reader.tsx';import Preview from './app/reference-preview.tsx';import Workspace from './app/workspace.tsx';export const renderWorkspace=props=>renderToStaticMarkup(React.createElement(Workspace,props));export{captureReadForTarget}from'./lib/capture-return.ts';export{previewParts}from'./app/reference-preview.tsx';export{readingCapture,anchorValid}from'./app/reader.tsx';export{buildGptContextBrief}from'./lib/gpt-context.ts';export const render=(reading,preview,target,records=[],task=null)=>renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(Reader,{article:reading,records,draftScope:'TEST-ONLY-three-mode-review',onCommand:async()=>({}),onNavigate:()=>{}}),React.createElement(Preview,{localRecord:preview,target,task,scope:'TEST-ONLY-three-mode-review',onClose:()=>{},onOpen:()=>{},onNote:()=>{}})));`,resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const directory=mkdtempSync(join(tmpdir(),'three-mode-navigation-')),bundle=join(directory,'bundle.cjs');writeFileSync(bundle,built.outputFiles[0].text);const ui=require(bundle);rmSync(directory,{recursive:true,force:true});
const worker="import{domainHandler}from'./lib/domain-handler.ts';export default{fetch:domainHandler}";
const ok=result=>{assert.equal(result.status,200,JSON.stringify(result.data));return result.data;};
function assertSingleCanonicalOwner(html){
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);assert.equal(ids.length,new Set(ids).size,'main canonical reading and passive preview have unique DOM IDs');
 const preview=html.slice(html.indexOf('<aside class="wp-reference"'));
 assert.doesNotMatch(preview,/data-reading-part|data-reading-source-part|id="passage-|rn-reader|rn-selection|contenteditable/,'preview must never become a second canonical interactive owner');
 return preview;
}

test('real retained reading, passive same-record preview, UTF-16 capture and GPT focus stay exact after current head changes',async()=>{
 const fixture=await privateStorageFixture(worker);try{
  const c=fixture.client('TEST-ONLY-three-mode-exact-navigation');
  const text='const home = "C:\\Users\\Learner\\Zombie Cat\\α 😺";\r\n\tconsole.log(home);\r\n';
  const old=ok(await c.command({action:'create',family:'article',id:'TEST-ONLY-exact-reference',data:{title:'TEST ONLY retained reference',body:'An original synthetic explanation.',sections:[{id:'reading',title:'Exact source',parts:[{id:'code',kind:'code',language:'javascript',text}]}],synthetic:true}})).record;
  const start=text.indexOf('😺'),selection={sectionId:'reading',partId:'code',start,end:start+2};
  const mapped=ui.readingCapture(old,[selection]);assert.ok(mapped.anchor);assert.equal(mapped.anchor.quote,'😺');
  assert.ok('error' in ui.readingCapture(old,[{...selection,start:start+1}]),'split surrogate must be rejected');
  const annotation=ok(await c.command({action:'create',family:'annotation',id:'TEST-ONLY-exact-annotation',data:{title:'TEST ONLY exact annotation',body:'Independent interpretation.',anchor:mapped.anchor,synthetic:true}})).record;
  const current=ok(await c.command({action:'update',family:'article',id:old.id,expectedRev:old.rev,data:{sections:[{id:'reading',title:'Exact source',parts:[{id:'code',kind:'code',language:'javascript',text:'CURRENT EDITION ONLY\n'+text}]}]}})).record;
  assert.notEqual(current.rendition,old.rendition);
  const retained=ok(await c.context('article',old.id,old.rendition)).record;
  assert.equal(retained.rendition,old.rendition);assert.equal(retained.sections[0].parts[0].text,text);
  assert.equal(ui.anchorValid(annotation.anchor,retained),true);assert.equal(ui.anchorValid(annotation.anchor,current),false);
  const target={family:'article',id:old.id,rendition:old.rendition,sectionId:'reading',partId:'code'};
  const html=ui.render(retained,retained,target,[annotation]);
  const preview=assertSingleCanonicalOwner(html);assert.doesNotMatch(html,/CURRENT EDITION ONLY/);assert.match(html,/data-anchor-records="TEST-ONLY-exact-annotation"/);
  const destination=new URL(preview.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),'https://test.invalid');
  for(const [key,value] of Object.entries({family:'article',id:old.id,rendition:old.rendition,section:'reading',part:'code'}))assert.equal(destination.searchParams.get(key),value);
  const brief=ui.buildGptContextBrief({record:retained,selection:annotation.anchor});assert.equal(brief.arguments.rendition,old.rendition);assert.deepEqual(brief.focus,{...selection,segments:[selection]});assert.doesNotMatch(brief.text,/CURRENT EDITION ONLY|Zombie Cat|Independent interpretation/);
  const mismatch=assertSingleCanonicalOwner(ui.render(retained,current,target,[annotation]));assert.doesNotMatch(mismatch,/CURRENT EDITION ONLY|Open exact Article/,'a mismatched preview must not substitute current content');
  const capture=ok(await c.context('annotation',annotation.id));assert.equal(capture.anchor.state,'retained-revision');assert.equal(capture.record.anchor.rendition,old.rendition);
  ok(await c.command({action:'trash',family:'article',id:current.id,expectedRev:current.rev}));
  assert.equal((await c.context('article',old.id,old.rendition)).status,404,'retained URLs do not bypass current Trash eligibility');
  const remaining=ok(await c.context('annotation',annotation.id));assert.equal(remaining.record.body,'Independent interpretation.');
 }finally{await fixture.dispose();}
});

test('current source revocation masks an exact retained reading without replacing edition or independent prose',async()=>{
 const fixture=await privateStorageFixture(worker);try{
  const c=fixture.client('TEST-ONLY-three-mode-current-rights'),secret='TEST ONLY revocable quotation 🧠';
  const source=ok(await c.command({action:'create',family:'source',id:'TEST-ONLY-review-source',data:{title:'TEST ONLY source',body:'Independent catalogue context.',source:{url:'https://example.invalid/review-source',attribution:'Original synthetic author',rights:'permitted-excerpt',excerpt:{id:'TEST-ONLY-review-grant',text:secret,locator:'Synthetic paragraph',edition:'Synthetic edition',basis:'owner-authored',permissionNote:'Original synthetic test written for acceptance.',ownerAttested:true,state:'permitted',exportAllowed:false}},synthetic:true}})).record;
  const article=ok(await c.command({action:'create',family:'article',id:'TEST-ONLY-review-display',data:{title:'TEST ONLY source-aware reading',body:'Independent analysis remains.',sections:[{id:'s',title:'Compare',parts:[{id:'excerpt',kind:'excerpt',text:secret,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:secret.length}},{id:'independent',kind:'paragraph',text:'Independent explanation remains visible.'}]}],synthetic:true}})).record;
  ok(await c.command({action:'update',family:'article',id:article.id,expectedRev:article.rev,data:{body:'CURRENT BODY ONLY'}}));
  ok(await c.command({action:'update',family:'source',id:source.id,expectedRev:source.rev,data:{source:{excerpt:{state:'revoked'}}}}));
  const retained=ok(await c.context('article',article.id,article.rendition)).record;assert.equal(retained.rendition,article.rendition);assert.equal(retained.body,'Independent analysis remains.');assert.equal(retained.sections[0].parts[0].unavailable,true);assert.equal(retained.sections[0].parts[0].text,'');
  const preview=assertSingleCanonicalOwner(ui.render(retained,retained,{family:'article',id:article.id,rendition:article.rendition,sectionId:'s'}));
  assert.match(preview,/Independent explanation remains visible/);assert.doesNotMatch(preview,/TEST ONLY revocable quotation|Synthetic paragraph|Original synthetic test|CURRENT BODY ONLY/);
  const target=ui.previewParts(retained,{family:'article',id:article.id,rendition:article.rendition,sectionId:'s',partId:'excerpt'});assert.deepEqual(target.parts,[]);
  assert.ok('error' in ui.readingCapture(retained,[{sectionId:'s',partId:'excerpt',start:0,end:2}]),'unavailable source text cannot become a new capture');
 }finally{await fixture.dispose();}
});


test('production Workspace withholds canonical reading actions until the exact retained or captured target is resolved',()=>{
 const base={family:'article',id:'TEST-ONLY-ready-reference',title:'TEST ONLY current record',body:'CURRENT HEAD ONLY',links:[],rendition:'current-edition',rev:3,actor:'user',synthetic:true,createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z',sections:[{id:'s',title:'Source',parts:[{id:'p',kind:'paragraph',text:'CURRENT PART ONLY'}]}]};
 const exact={...base,body:'EXACT RETAINED BODY',rendition:'requested-edition',rev:1,sections:[{id:'s',title:'Source',parts:[{id:'p',kind:'paragraph',text:'EXACT RETAINED PART'}]}]};
 const props={initialRecords:[base],initialView:'library',initialId:base.id,initialFamily:'article',authenticated:true,draftScope:'TEST-ONLY-ready-actions'};
 for(const initialArticle of [null,{...exact,id:'TEST-ONLY-wrong-record'}, {...exact,rendition:'other-retained-edition'}, {...exact,family:'note'}]){
  const html=ui.renderWorkspace({...props,initialRendition:exact.rendition,initialArticle});
  assert.doesNotMatch(html,/Continue with GPT|Note on this Article|data-reading-part=|EXACT RETAINED BODY|EXACT RETAINED PART/,'unresolved/mismatched retained content must own neither canonical Reader nor reading actions');
 }
 const capture=ui.renderWorkspace({...props,initialReadingTarget:{recordFamily:'article',captureId:'TEST-ONLY-pending-capture',captureFamily:'annotation'}});
 assert.doesNotMatch(capture,/Continue with GPT|Note on this Article|data-reading-part=/,'pending capture resolution must not lend current reading authority');
 const ready=ui.renderWorkspace({...props,initialRendition:exact.rendition,initialArticle:exact});
 assert.match(ready,/Continue with GPT/);assert.match(ready,/Note on this Article/);assert.match(ready,/EXACT RETAINED PART/);assert.doesNotMatch(ready,/CURRENT PART ONLY/);
});

test('passive preview native exact link retains explicit task context for modifier/new-tab navigation',()=>{
 const reading={family:'article',id:'TEST-ONLY-native-reference',title:'TEST ONLY native destination',body:'Independent.',links:[],rendition:'reading-edition',rev:1,actor:'user',synthetic:true,sections:[]};
 const task={family:'journey',id:'TEST-ONLY-native-task',stageId:'stage-two',rendition:'task-edition'};
 const preview=assertSingleCanonicalOwner(ui.render(reading,reading,{family:'article',id:reading.id,rendition:reading.rendition},[],task));
 const destination=new URL(preview.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),'https://test.invalid');
 for(const [key,value] of Object.entries({family:'article',id:reading.id,rendition:reading.rendition,taskFamily:'journey',taskId:task.id,taskStage:task.stageId,taskRendition:task.rendition}))assert.equal(destination.searchParams.get(key),value);
});


test('a ready or unavailable prior capture cannot resolve a different capture on the same reading before effects run',()=>{
 const anchor={recordFamily:'article',articleId:'TEST-ONLY-same-reading',rendition:'old-edition',sectionId:'s',partId:'p',start:0,end:1,quote:'A'};
 const a={family:'annotation',id:'TEST-ONLY-capture-a',anchor},b={family:'annotation',id:'TEST-ONLY-capture-b',anchor:{...anchor,start:2,end:3,quote:'B'}};
 const request={captureId:b.id,captureFamily:'annotation'};
 for(const status of ['ready','unavailable']){
  const admitted=ui.captureReadForTarget({key:'annotation:'+a.id,status,record:a},request,[a,b]);
  assert.equal(admitted.record,undefined);assert.equal(admitted.pending,true,'previous capture state cannot complete a new exact target');
 }
 const exact=ui.captureReadForTarget({key:'annotation:'+b.id,status:'ready',record:b},request,[a,b]);assert.equal(exact.record,b);assert.equal(exact.pending,false);
 for(const record of [a,{...b,family:'flag'},{...b,trashedAt:'2026-10-24T00:00:00Z'},{...b,anchor:undefined}]){
  const invalid=ui.captureReadForTarget({key:'annotation:'+b.id,status:'ready',record},request,[a,b]);assert.equal(invalid.record,undefined);assert.equal(invalid.pending,false);
 }
 const unavailable=ui.captureReadForTarget({key:'annotation:'+b.id,status:'unavailable'},request,[a,b]);assert.equal(unavailable.record,undefined);assert.equal(unavailable.pending,false);
});

test('capture admission is family-qualified and never guesses an ambiguous or missing capture family',()=>{
 const anchor={recordFamily:'article',articleId:'TEST-ONLY-article',rendition:'edition',sectionId:'s',partId:'p',start:0,end:1,quote:'A'};
 const annotation={family:'annotation',id:'TEST-ONLY-colliding-capture',anchor},flag={family:'flag',id:annotation.id,anchor};
 const prior={key:'annotation:'+annotation.id,status:'ready',record:annotation};
 const changed=ui.captureReadForTarget(prior,{captureId:flag.id,captureFamily:'flag'},[annotation,flag]);assert.equal(changed.record,undefined);assert.equal(changed.pending,true);
 const ambiguous=ui.captureReadForTarget(prior,{captureId:annotation.id},[annotation,flag]);assert.equal(ambiguous.record,undefined);assert.equal(ambiguous.pending,false);
 const unique=ui.captureReadForTarget(prior,{captureId:annotation.id},[annotation]);assert.equal(unique.record,annotation);assert.equal(unique.pending,false);
 assert.equal(ui.captureReadForTarget(prior,{captureId:'TEST-ONLY-unknown'},[]).record,undefined);
 assert.equal(ui.captureReadForTarget(prior,undefined,[annotation]).record,undefined);
});
