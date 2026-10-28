import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const load=async path=>import('data:text/javascript;base64,'+Buffer.from((await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false})).outputFiles[0].text).toString('base64'));
const task=await load('lib/layout-gpt-intents.ts'),reading=await load('lib/gpt-context.ts');
const journey={family:'journey',id:'TEST-ONLY-rpg',rendition:'r-retained',title:'PRIVATE_TITLE',body:'PRIVATE_BODY',learningShape:{version:1,kind:'journey',stages:[{id:'stage-code',sectionId:'code',title:'Illustrative coding stage'}]}};

test('current task default requires the displayed edition and never overrides an exact passage',()=>{
 assert.deepEqual(task.currentReadingTaskTarget(journey,journey,'stage-code'),{kind:'journey-stage',journeyId:journey.id,stageId:'stage-code'});
 for(const displayed of [null,{...journey,rendition:'older'},{...journey,id:'other'},{...journey,family:'article'}])assert.equal(task.currentReadingTaskTarget(journey,displayed,'stage-code'),null);
 assert.equal(task.currentReadingTaskTarget(journey,journey,'stage-code',true),null);
 assert.equal(task.currentReadingTaskTarget(null,journey,'stage-code'),null);
});

test('task intent uses one exact tutor read and retains selected authored edition only in return link',()=>{
 const before=JSON.stringify(journey),brief=task.buildTaskGptBrief({record:journey,stageId:'stage-code'});
 assert.equal(brief.tool,'get_minamo_learning_context');
 assert.deepEqual(brief.arguments,{purpose:'Continue the exact Minamo task I selected, using its current saved learning.',scope:'target',target:{kind:'journey-stage',journeyId:'TEST-ONLY-rpg',stageId:'stage-code'},profile:'tutor'});
 assert.equal(brief.arguments.rendition,undefined,'current saved task read must not invent a retained-edition argument');
 const returnTo=new URL(brief.returnTo);assert.equal(returnTo.searchParams.get('rendition'),'r-retained');assert.equal(returnTo.searchParams.get('stage'),'stage-code');
 assert.equal(JSON.stringify(journey),before);assert.doesNotMatch(brief.text,/PRIVATE_TITLE|PRIVATE_BODY/);
 assert.match(brief.text,/Do not checkpoint/);assert.match(brief.text,/no unsaved Note draft, pending attachment/);
});
test('task intent never guesses first Journey stage or accepts missing, removed, non-task or trashed targets',()=>{
 for(const [record,stageId] of [[journey,undefined],[journey,'removed'],[{...journey,family:'article'},'stage-code'],[{...journey,trashedAt:'2026-10-24T00:00:00Z'},'stage-code']]){
  assert.equal(task.exactTaskTarget(record,stageId),null);assert.throws(()=>task.buildTaskGptBrief({record,stageId}),/exact Question or Project Step/);
 }
 assert.deepEqual(task.exactTaskTarget({family:'investigation',id:'TEST-ONLY-linux'}),{kind:'investigation',investigationId:'TEST-ONLY-linux'});
});
test('discussing a retained reading and continuing its task preserve different explicit intentions',()=>{
 const selected={family:'article',id:'TEST-ONLY-tcp',rendition:'r-old'};
 const passage={recordFamily:'article',articleId:selected.id,rendition:'r-old',sectionId:'s',partId:'code',start:0,end:4,quote:'PRIVATE_QUOTE'};
 const discuss=reading.buildGptContextBrief({record:selected,selection:passage,relatedRefs:[{family:'note',id:'TEST-ONLY-selected-note'}]});
 const tutor=task.buildTaskGptBrief({record:{family:'investigation',id:'TEST-ONLY-linux',rendition:'r-question'}});
 assert.equal(discuss.tool,'get_minamo_context');assert.equal(discuss.arguments.rendition,'r-old');assert.deepEqual(discuss.focus,{sectionId:'s',partId:'code',start:0,end:4});assert.deepEqual(discuss.arguments.relatedRefs,[{family:'note',id:'TEST-ONLY-selected-note'}]);
 assert.equal(tutor.arguments.target.investigationId,'TEST-ONLY-linux');assert.equal(tutor.arguments.relatedRefs,undefined);assert.doesNotMatch(tutor.text,/TEST-ONLY-selected-note|TEST-ONLY-tcp|PRIVATE_QUOTE/);
 assert.doesNotMatch(discuss.text,/PRIVATE_QUOTE/);
});
test('malformed identifiers and unsafe return origins reject without a clipboard-ready request',()=>{
 for(const id of ['', 'bad\nidentifier'])assert.throws(()=>task.buildTaskGptBrief({record:{family:'investigation',id}}),/bounded/);
 for(const origin of ['http://example.com','javascript:alert(1)','https://user:pass@example.com','https://example.com/private'])assert.throws(()=>task.buildTaskGptBrief({record:{family:'investigation',id:'TEST-ONLY-linux'},siteOrigin:origin}));
});

test('task handoff uses renamed verified Minamo and rejects stale or arbitrary Host origins',()=>{
 const record={family:'investigation',id:'TEST-ONLY-renamed',rendition:'retained-one'};
 const brief=task.buildTaskGptBrief({record});
 assert.equal(new URL(brief.returnTo).origin,'https://minamo.example');
 assert.equal(new URL(brief.returnTo).searchParams.get('rendition'),'retained-one');
 assert.match(brief.text,/Use the Minamo plugin/);
 for(const siteOrigin of ['https://previous.minamo.example','https://legacy.minamo.example','https://untrusted.invalid'])assert.throws(()=>task.buildTaskGptBrief({record,siteOrigin}),/verified Minamo/);
});
