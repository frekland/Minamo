import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {privateStorageFixture} from './private-storage-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"import React from 'react';import{renderToStaticMarkup}from'react-dom/server';import Handoff from './app/gpt-handoff.tsx';export{readingDiscussionSelection}from'./app/reader.tsx';export{buildGptContextBrief}from'./lib/gpt-context.ts';export{seedSourceFixture}from'./tests/acceptance/source-fixture.ts';export const render=props=>renderToStaticMarkup(React.createElement(Handoff,props));",resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);const ui=mod.exports;
const article={family:'article',id:'TEST-ONLY-gpt-focus',title:'TEST ONLY exact discussion',body:'Original isolated prose.',rendition:'retained-one',links:[],sections:[{id:'s',title:'Literal source',parts:[{id:'code',kind:'code',text:'const cat = "😺";\r\n\tC:\\Work\\α.js\r\n'},{id:'prose',kind:'paragraph',text:'Independent explanation.'}]}],rev:1,synthetic:true,createdAt:'2026-10-24T00:00:00Z',updatedAt:'2026-10-24T00:00:00Z'};

test('discussion resolves retained UTF-16 focus and ordered ranges without copying words or replacing its edition',()=>{
 const text=article.sections[0].parts[0].text,start=text.indexOf('😺'),target={recordFamily:'article',rendition:'retained-one',sectionId:'s',partId:'code',start,end:start+2,quote:'😺',captureId:'TEST-ONLY-capture'};
 const result=ui.readingDiscussionSelection(article,target);assert.equal(result.error,undefined);assert.equal(result.selection.quote,'😺');
 const brief=ui.buildGptContextBrief({record:article,selection:result.selection});assert.equal(brief.arguments.rendition,'retained-one');assert.equal(brief.focus.start,start);assert.equal(brief.focus.end,start+2);assert.doesNotMatch(brief.text,/C:\\Work|😺|Independent explanation/);
 const multi={...target,start:0,end:text.length,quote:undefined,segments:[{sectionId:'s',partId:'code',start:0,end:text.length},{sectionId:'s',partId:'prose',start:0,end:article.sections[0].parts[1].text.length}]};
 const selected=ui.readingDiscussionSelection(article,multi);assert.equal(selected.error,undefined);assert.deepEqual(selected.selection.segments,multi.segments);assert.equal(selected.selection.quote,text+'\nIndependent explanation.');
 const section=ui.readingDiscussionSelection(article,{sectionId:'s'});assert.equal(section.error,undefined);assert.equal(section.selection.segments.length,3,'section focus includes canonical heading and its contiguous parts');
 assert.deepEqual(ui.readingDiscussionSelection(article),{});assert.deepEqual(ui.readingDiscussionSelection(article,{stageId:'a-stage'}),{});
});

test('invalid explicit focus blocks discussion instead of silently broadening to whole or current reading',()=>{
 const text=article.sections[0].parts[0].text,start=text.indexOf('😺');
 for(const target of [{sectionId:'missing'},{sectionId:'s',partId:'missing'},{partId:'code'},{captureId:'unresolved-capture'},{rendition:'current-two',sectionId:'s'},{recordFamily:'note',sectionId:'s'},{sectionId:'s',partId:'code',start:start+1,end:start+2},{sectionId:'s',partId:'code',start:0},{sectionId:'s',partId:'code',start:0,end:5,quote:'wrong'},{sectionId:'s',partId:'code',start:0,end:5,segments:[{sectionId:'s',partId:'prose',start:0,end:5}]}]){
  const result=ui.readingDiscussionSelection(article,target);assert.equal(result.selection,undefined,JSON.stringify(target));assert.ok(result.error,JSON.stringify(target));
  const html=ui.render({record:article,label:'Discuss this reading with GPT',selectionError:result.error});assert.match(html,/disabled=""/);assert.match(html,/role="status"/);
 }
 const unavailable={...article,sections:[{...article.sections[0],parts:[{...article.sections[0].parts[0],unavailable:{reason:'source-revoked'}}]}]};
 assert.ok(ui.readingDiscussionSelection(unavailable,{sectionId:'s',partId:'code'}).error);
});

test('actual eligible Source display maps discussion to visible Article coordinates; revocation withholds exact focus',async()=>{
 const fixture=await privateStorageFixture("import{domainHandler}from'./lib/domain-handler.ts';export default{fetch:domainHandler}");try{
  const client=fixture.client('TEST-ONLY-gpt-source-focus');
  const send=async(path,data)=>{const result=await client.request(path,data);return new Response(JSON.stringify(result.data),{status:result.status,headers:{'content-type':'application/json'}})};
  await ui.seedSourceFixture(send);
  const context=await client.context('article','TEST-ONLY-ml-excerpt');assert.equal(context.status,200);const record=context.data.record;
  const target={recordFamily:'article',rendition:record.rendition,sectionId:'source-context',partId:'owned-quote',start:24,end:27};
  // Select the literal A + surrogate pair, without borrowing Source absolute offsets.
  const quote=record.sections[0].parts.find(part=>part.id==='owned-quote').text,at=quote.indexOf('A🧠');target.start=at;target.end=at+3;
  const selected=ui.readingDiscussionSelection(record,target);assert.equal(selected.error,undefined);assert.equal(selected.selection.recordFamily,'article');assert.equal(selected.selection.articleId,record.id);assert.equal(selected.selection.quote,'A🧠');
  const brief=ui.buildGptContextBrief({record,selection:selected.selection});assert.equal(brief.arguments.family,'article');assert.equal(brief.focus.partId,'owned-quote');assert.equal(brief.focus.start,at);assert.doesNotMatch(brief.text,/A🧠|owned excerpt/);
  const source=await client.context('source','TEST-ONLY-ml-source');assert.equal(source.status,200);
  const revoked=await client.command({action:'update',family:'source',id:source.data.record.id,expectedRev:source.data.record.rev,data:{source:{excerpt:{state:'revoked'}}}});assert.equal(revoked.status,200);
  const retained=await client.context('article',record.id,record.rendition);assert.equal(retained.status,200);assert.equal(retained.data.record.rendition,record.rendition);
  const blocked=ui.readingDiscussionSelection(retained.data.record,target);assert.equal(blocked.selection,undefined);assert.ok(blocked.error);
 }finally{await fixture.dispose();}
});
