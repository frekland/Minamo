import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:'import React from "react";import{renderToStaticMarkup}from"react-dom/server";export*from"./app/activity-studio.tsx";export*from"./app/activity-studio-state.ts";export{canonicalReadingParts}from"./lib/contracts.ts";export{buildProjectPackage}from"./lib/challenge-exchange/package.ts";export{default as ActivityReader}from"./app/reader.tsx";export function render(Component,props){return renderToStaticMarkup(React.createElement(Component,props));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'activity-ui-')),file=join(dir,'ui.cjs');writeFileSync(file,result.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
const bundle={contract:'minamo.project.v1',id:'hostile-source',title:'Original <script> source',runtime:'node',commands:{kali:'node --test',powershell:'node --test'},files:[{path:'starter.mjs',role:'editable-starter',text:'const tag = "<script>alert(1)</script>";\nconsole.log(tag);\n',sha256:'a'.repeat(64)},{path:'test.mjs',role:'visible-test',text:'import assert from "node:assert";\nassert.ok(false);\n',sha256:'b'.repeat(64)}]};
test('Activity source is escaped inert text, exact file boundary and trustworthy local handoff',()=>{
 const html=ui.render(ui.ActivitySourceBrowser,{bundle});
 assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
 assert.doesNotMatch(html,/<script|<iframe|srcdoc=|contenteditable|<audio|autoplay/i);
 assert.match(html,/Download starter ZIP/);assert.match(html,/node --test/);assert.match(html,/Minamo has not executed/);
 assert.match(html,/SHA-256 of exact UTF-8 source/);assert.match(html,/aria-label="Project files"/);assert.match(html,/aria-current="true"/);
 assert.doesNotMatch(html,/assert\.ok\(false\)/,'Unselected file source is not duplicated into the DOM.');
});
test('File selection shows the chosen exact test source and responsive native copy surface',()=>{
 const html=ui.render(ui.ActivitySourceBrowser,{bundle,selectedPath:'test.mjs'});
 assert.match(html,/assert\.ok\(false\)/);assert.doesNotMatch(html,/console\.log\(tag\)/);assert.match(html,/Exact source of test.mjs/);assert.match(html,/tabindex="0"/i);
});
test('Activity instructions keep untrusted prose inert and do not generate execution or progress UI',()=>{
 const html=ui.render(ui.ActivityInstructions,{block:{id:'predict',kind:'prediction',text:'<img src=x onerror=alert(1)> Predict the byte count 😀'}});
 assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img|<iframe|<script/);assert.match(html,/Before you try/);assert.doesNotMatch(html,/mastery|success|passed|completed/i);
});
test('Saved attempt readback preserves uncertainty, exact target edition and supplied provenance',()=>{
 const attempt={contract:'minamo.attempt.v1',activity:{family:'experiment',id:'activity-sockets',rendition:'retained-r1'},state:'submitted',prediction:'One read might be enough?',reflection:'The split test failed; I do not yet know the framing rule.',nextIntention:'Compare EOF with delimiter framing.',hintsRevealed:['hint-concept'],evidence:[{classification:'supplied-terminal',text:'FAIL: test_split\n<script>ignored</script>'},{classification:'github-commit',repository:'synthetic/example',commit:'a'.repeat(40),verification:'supplied-unverified',description:'Supplied ref; CI has not been checked.'}]};
 const html=ui.render(ui.ActivityAttemptSummary,{record:{id:'attempt',family:'run',rev:2,title:'Attempt',attempt}});
 assert.match(html,/retained-r1/);assert.match(html,/The split test failed/);assert.match(html,/Compare EOF/);assert.match(html,/Supplied terminal text/);assert.match(html,/Supplied GitHub commit · unverified/);assert.match(html,/CI has not been checked/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script|<iframe/);
 assert.match(html,/separate from formal learning checkpoints/);
});
test('Draft identity fences generation, owner and exact immutable Activity edition',()=>{
 const first=ui.activityDraftKey('owner-a','activity','r1');
 assert.notEqual(first,ui.activityDraftKey('owner-b','activity','r1'));
 assert.notEqual(first,ui.activityDraftKey('owner-a:generation:restored@1','activity','r1'));
 assert.notEqual(first,ui.activityDraftKey('owner-a','activity','r2'));
 const recovered=ui.readActivityDraft(JSON.stringify({prediction:'Japanese 😀\n',reflection:'uncertain',unknown:'ignored',terminal:'a'.repeat(25000)}));
 assert.equal(recovered.prediction,'Japanese 😀\n');assert.equal(recovered.terminal.length,20000);assert.equal(recovered.unknown,undefined);
 assert.deepEqual(ui.readActivityDraft('{'),ui.emptyActivityDraft());
});
test('Uncertain attempt retries preserve original payload despite changed drafts and reject cross-edition retry',()=>{
 const payload={operationId:'op-1',attempt:{prediction:'original',evidence:[{classification:'supplied-terminal',text:'FAIL'}]}};
 const pending=ui.makeActivityPending('owner-a','activity','r1','op-1',payload);payload.attempt.prediction='later';
 assert.equal(ui.retryActivityPayload(pending,'owner-a','activity','r1').attempt.prediction,'original');
 assert.throws(()=>ui.retryActivityPayload(pending,'owner-a','activity','r2'),/another workspace or Activity edition/);
 assert.throws(()=>ui.retryActivityPayload(pending,'owner-b','activity','r1'),/another workspace or Activity edition/);
 const restored=ui.readActivityPending(JSON.stringify(pending),'owner-a','activity','r1');assert.deepEqual(restored,pending);
 assert.equal(ui.readActivityPending(JSON.stringify(pending),'owner-a','activity','r2'),null);
 assert.equal(ui.readActivityPending(JSON.stringify({...pending,operationId:'different'}),'owner-a','activity','r1'),null);
});
test('Actual UI file destination resolves retained D1 source, Reader capture DOM and exact Flag/Annotation writes',{timeout:30000},async()=>{
 const fixture=await privateStorageFixture('import{domainHandler}from"./lib/domain-handler.ts";export default{fetch(request,env){return domainHandler(request,{...env,MINAMO_ACTIVITY_STUDIO:"1"})}}'),client=fixture.client('TEST-ONLY-ui-capture-owner');
 const okay=response=>{assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};
 try{
  const project=await ui.buildProjectPackage({id:'ui-capture-source',title:'TEST ONLY exact Japanese source',runtime:'node',files:[{path:'main.mjs',role:'editable-starter',text:'export const greeting = "あ😀";\n'},{path:'main.test.mjs',role:'visible-test',text:'// Visible test source supplied for capture; not executed.\n'}]});
  const publication={purpose:'Synthetic UI destination and native capture acceptance.',operationId:'ui-capture-publish',id:'ui-capture-activity',title:'TEST ONLY capture source',synthetic:true,activity:{contract:'minamo.activity.v1',template:'walkthrough',intent:'Read and capture original exact code without claiming execution.',authorship:'original-exercise',blocks:[{id:'prompt',kind:'prediction',text:'Which characters occupy more than one UTF-16 code unit?'},{id:'starter',kind:'source-browser',bundle:project}]}};
  const first=okay(await client.request('/api/activities/publish',publication)).record;
  const html=ui.render(ui.ActivitySourceBrowser,{bundle:project,selectedPath:'main.mjs',reading:{id:first.id,rendition:first.rendition,blockId:'starter'}});
  const href=html.match(/href="([^"]+)"[^>]*>Open this exact file in Reader/)[1].replaceAll('&amp;','&');
  const target=new URL(href,'https://synthetic.invalid').searchParams;
  assert.equal(target.get('family'),'experiment');assert.equal(target.get('section'),'activity');assert.equal(target.get('rendition'),first.rendition);
  // Follow the UI's actual exact destination using the same server context read as the Workspace.
  const opened=okay(await client.context(target.get('family'),target.get('id'),target.get('rendition'))).record;
  const part=ui.canonicalReadingParts(opened).find(entry=>entry.sectionId===target.get('section')&&entry.part.id===target.get('part')).part;
  assert.equal(part.text,project.files.find(file=>file.path==='main.mjs').text);
  const readerHtml=ui.render(ui.ActivityReader,{article:opened,records:[opened],draftScope:'TEST-ONLY-ui-capture-owner',onCommand:async()=>{throw Error('SSR must not mutate.');},anchorTarget:{recordFamily:'experiment',sectionId:'activity',partId:part.id,rendition:first.rendition}});
  assert.match(readerHtml,/Read exact Activity passages to Flag or annotate/);assert.match(readerHtml,/data-reading-part="starter-file-0" data-section-id="activity"/);assert.match(readerHtml,/あ😀/);
  const at=part.text.indexOf('あ'),anchor={recordFamily:'experiment',articleId:first.id,rendition:first.rendition,sectionId:'activity',partId:part.id,start:at,end:at+'あ😀'.length,quote:'あ😀'};
  const flag=okay(await client.command({operationId:'ui-native-flag',action:'setFlag',target:{kind:'passage',anchor},active:true,expectedTargetRev:0}));assert.equal(flag.status,'committed');
  const annotation=okay(await client.command({operationId:'ui-native-annotation',action:'create',family:'annotation',id:'ui-source-annotation',data:{title:'TEST ONLY source thought',body:'The emoji uses two UTF-16 code units; this is original supplied test prose.',anchor,synthetic:true}})).record;
  assert.equal(annotation.anchor.quote,'あ😀');assert.equal(annotation.anchor.rendition,first.rendition);
  const revised=okay(await client.request('/api/activities/publish',{...publication,operationId:'ui-capture-revise',expectedRev:first.rev,activity:{...publication.activity,intent:'An edited intention keeps the old exact source edition.'}})).record;assert.notEqual(revised.rendition,first.rendition);
  const retained=okay(await client.context('experiment',first.id,first.rendition)).record;assert.equal(ui.canonicalReadingParts(retained).find(entry=>entry.sectionId==='activity'&&entry.part.id===part.id).part.text,part.text);
 }finally{await fixture.dispose();}
});
