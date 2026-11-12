import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {logicalMarkCode,readerLogicalMarkFixture} from './reader-logical-marks-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const bundled=await wr('esbuild').build({stdin:{contents:'import React from "react";import {renderToStaticMarkup} from "react-dom/server";import Reader from "./app/reader.tsx";export {readingCapture} from "./app/reader.tsx";export {logicalMarkGroups} from "./lib/reader-logical-marks.ts";export {codeLines} from "./lib/reader-code-lines.ts";export {codeTokens} from "./lib/reader-code-syntax.ts";export const render=(article,records)=>renderToStaticMarkup(React.createElement(Reader,{article,records,draftScope:"TEST-ONLY-logical-marks",onCommand:()=>Promise.reject(Error("Synthetic fixture only"))}));',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'error'});
const dir=mkdtempSync(join(tmpdir(),'logical-marks-')),entry=join(dir,'bundle.cjs');writeFileSync(entry,bundled.outputFiles[0].text);const api=require(entry);rmSync(dir,{recursive:true,force:true});
test('logical choices preserve adjacent identities and every overlap combination, independent of repeated lines',()=>{
 const groups=api.logicalMarkGroups('ab cd\nef gh!',[{id:'a',start:0,end:11},{id:'b',start:3,end:8},{id:'c',start:11,end:12}]);
 assert.deepEqual(groups.map(group=>group.ids),[['a'],['a','b'],['c']]);
 assert.ok(groups.every(group=>group.snippet.trim()));
 assert.deepEqual(api.logicalMarkGroups('A \t B',[{id:'a',start:0,end:4},{id:'b',start:1,end:5}]).map(group=>group.ids),[['a'],['a','b'],['b']]);
});
test('one external keyboard representative per actual mark set and no nested mark/link interaction',()=>{
 const {article,records}=readerLogicalMarkFixture(),html=api.render(article,records);
 assert.equal([...html.matchAll(/data-logical-mark-trigger=/g)].length,5);
 assert.doesNotMatch(html,/<mark[^>]*(?:tabindex|role="button")/);
 assert.match(html,/<mark[^>]*>[\s\S]*?<a href="https:\/\/example.com\/reference"/);
 assert.match(html,/data-anchor-records="TEST-ONLY-mark-a TEST-ONLY-mark-b"/);
 assert.match(html,/data-anchor-records="TEST-ONLY-mark-c"/);
 assert.match(html,/data-anchor-records="TEST-ONLY-mark-d"/);
 // Controls live outside the canonical source, so their labels never enter offsets or copy.
 assert.doesNotMatch(html.match(/<code data-reading-part="code"[\s\S]*?<\/code>/)[0],/<button|data-logical-mark-trigger/);
});
test('syntax decoration and line partition retain every exact canonical UTF-16 unit',async()=>{
 const tokens=await api.codeTokens(logicalMarkCode,'javascript'),lines=api.codeLines(logicalMarkCode,tokens);
 assert.ok(tokens.length>5);
 assert.equal(lines.flatMap(line=>line.ranges.map(range=>logicalMarkCode.slice(range.from,range.to))).join(''),logicalMarkCode);
 const {article}=readerLogicalMarkFixture(),emoji=logicalMarkCode.indexOf('😄');
 for(const [start,end] of [[0,logicalMarkCode.length],[emoji,emoji+4],[logicalMarkCode.indexOf('\r\n'),logicalMarkCode.indexOf('console')+7]]){
  const capture=api.readingCapture(article,[{sectionId:'source',partId:'code',start,end}]);
  assert.equal(capture.anchor.quote,logicalMarkCode.slice(start,end));assert.equal(capture.anchor.start,start);assert.equal(capture.anchor.end,end);
 }
 assert.match(api.readingCapture(article,[{sectionId:'source',partId:'code',start:emoji+1,end:emoji+2}]).error,/exact range/i);
});
