import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:'import React from "react";import {renderToStaticMarkup} from "react-dom/server";import Flow from "./app/flow-diagram.tsx";import DiagramEditor from "./app/diagram-authoring.tsx";import {RichReadingPart} from "./app/reader.tsx";import {LearningSpaceContext} from "./app/learning-space-ui.tsx";export * from "./lib/diagrams.ts";export * from "./lib/reading-inline.ts";export {readingCapture,anchorValid,inlineReadingDestination} from "./app/reader.tsx";export function diagramEditorHtml(diagram){return renderToStaticMarkup(React.createElement(DiagramEditor,{part:{id:"diagram",kind:"diagram",text:"Exact diagram source",diagram},onChange:()=>{}}));}export function graphHtml(diagram){return renderToStaticMarkup(React.createElement(Flow,{diagram}));}export function scopedPartHtml(part,article,scope){return renderToStaticMarkup(React.createElement(LearningSpaceContext.Provider,{value:scope},React.createElement(RichReadingPart,{part,sectionId:"section",article,captures:[]})));}export function partHtml(part,article,captures=[]){return renderToStaticMarkup(React.createElement(RichReadingPart,{part,sectionId:"section",article,captures}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'v2-manuscript-reader-')),entry=join(dir,'reader.cjs');writeFileSync(entry,compiled.outputFiles[0].text);const {graphDiagramError,stateDiagramError,flowDiagramError,diagramCanonicalText,graphHtml,diagramEditorHtml,readingInlineError,inlineSegments,partHtml,scopedPartHtml,readingCapture,anchorValid,inlineReadingDestination}=require(entry);rmSync(dir,{recursive:true,force:true});
const graph={format:'graph-v1',nodes:[{id:'a',label:'Kitchen 🐈'},{id:'b',label:'Hall'},{id:'c',label:'Unconnected attic'}],edges:[{from:'a',to:'b'},{from:'b',to:'a',label:'Return passage'},{from:'b',to:'b',label:'Look around'}]};
test('generic graph keeps bidirectional cycles, self loops and unconnected nodes without state semantics',()=>{
 assert.equal(graphDiagramError(graph),null);assert.ok(flowDiagramError({...graph,format:'flow-v1'}));assert.ok(stateDiagramError({...graph,format:'state-v1'}));
 const html=graphHtml(graph);assert.equal([...html.matchAll(/data-graph-node=/g)].length,3);assert.equal([...html.matchAll(/data-graph-from=/g)].length,3);assert.match(html,/edu-sr/);assert.doesNotMatch(html,/Text alternative:|Diagram details/);assert.match(html,/Unconnected attic/);assert.match(html,/Return passage/);assert.match(html,/data-graph-from="b" data-graph-to="a"/);assert.doesNotMatch(html,/Initial state|trigger/);
 assert.equal(diagramCanonicalText(graph),'Nodes\na: Kitchen 🐈\nb: Hall\nc: Unconnected attic\n\nConnections\na → b\nb → a: Return passage\nb → b: Look around');
});
test('generic graph rejects duplicate, missing, unsafe and over-budget declarations',()=>{
 for(const bad of [{...graph,edges:[...graph.edges,graph.edges[0]]},{...graph,edges:[{from:'missing',to:'a'}]},{...graph,initial:'a'},{...graph,nodes:[{id:'a',label:'line\nbreak'}]},{...graph,nodes:Array.from({length:13},(_,i)=>({id:'n'+i,label:'Node'}))}])assert.ok(graphDiagramError(bad));
});
const part={id:'p',kind:'paragraph',text:'A 🐈 reads bold code & <script> safely.',inline:[{start:11,end:20,kind:'strong'},{start:16,end:20,kind:'code'},{start:5,end:10,kind:'emphasis'},{start:5,end:10,kind:'link',url:'https://example.org/reference'}]};
const article={id:'article',family:'article',title:'Exact reader',body:'',links:[],sections:[{id:'section',title:'Rich reading',parts:[part]}],rev:1,rendition:'retained-rich',createdAt:'2026-10-22T00:00:00Z',updatedAt:'2026-10-22T00:00:00Z',trashedAt:null,actor:'gpt',synthetic:true};
test('inline styles retain exact literal UTF16 text and nested formatting around captures',()=>{
 assert.equal(readingInlineError(part.text,part.inline),null);assert.equal(inlineSegments(part.text,part.inline).map(s=>s.text).join(''),part.text);
 const selected=readingCapture(article,[{sectionId:'section',partId:'p',start:2,end:20}]);assert.equal(selected.anchor.quote,'🐈 reads bold code');assert.equal(anchorValid(selected.anchor,article),true);
 const html=partHtml(part,article,[{...article,id:'annotation',family:'annotation',anchor:selected.anchor}]);assert.match(html,/<strong><code class="rn-inline-code">code<\/code><\/strong>/);assert.match(html,/<em>reads<\/em>/);assert.match(html,/data-anchor-records="annotation"/);assert.match(html,/href="https:\/\/example.org\/reference"/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>/);
});
test('unsafe URL, duplicate, out-of-bounds and split-surrogate styles reject; corrupt legacy style falls back literally',()=>{
 for(const spans of [[{start:2,end:3,kind:'strong'}],[{start:0,end:999,kind:'emphasis'}],[{start:0,end:1,kind:'link',url:'javascript:alert(1)'}],[{start:0,end:1,kind:'link',url:'https://owner:secret@example.org'}],[{start:0,end:1,kind:'strong',url:'https://example.org'}],[part.inline[0],part.inline[0]]])assert.ok(readingInlineError(part.text,spans));
 const invalid=[{start:0,end:1,kind:'link',url:'javascript:alert(1)'}];assert.equal(inlineSegments(part.text,invalid).map(s=>s.text).join(''),part.text);assert.ok(inlineSegments(part.text,invalid).every(s=>s.styles.length===0));
});
test('table inline ranges preserve TSV coordinates across emoji and rich cell capture',()=>{
 const table={id:'table',kind:'table',text:'Term\tValue\ncat\t🐈 bold',table:{headers:['Term','Value'],rows:[['cat','🐈 bold']]},inline:[{start:18,end:22,kind:'strong'}]};
 assert.equal(readingInlineError(table.text,table.inline),null);const record={...article,sections:[{id:'section',title:'Table',parts:[table]}]},capture=readingCapture(record,[{sectionId:'section',partId:'table',start:15,end:22}]);assert.equal(capture.anchor.quote,'🐈 bold');assert.equal(anchorValid(capture.anchor,record),true);assert.match(partHtml(table,record),/<strong>bold<\/strong>/);
});

 test('canonical inline reading links retain native href but use same workspace navigation',()=>{
 const url='https://previous.minamo.example/?view=library&family=article&id=ref-1';assert.deepEqual(inlineReadingDestination(url),{view:'library',id:'ref-1',target:{recordFamily:'article'}});
 assert.equal(inlineReadingDestination('https://example.org/?view=library&family=article&id=ref-1'),null);assert.equal(inlineReadingDestination(url.replace('previous.minamo.example','legacy.minamo.example')),null);assert.deepEqual(inlineReadingDestination(url.replace('previous.minamo.example','minamo.example')),inlineReadingDestination(url));assert.equal(inlineReadingDestination(url+'&part=p1'),null);assert.equal(inlineReadingDestination(url.replace('view=library','view=work')),null);
 const p={id:'p',kind:'paragraph',text:'Read reference',inline:[{start:5,end:14,kind:'link',url}]};const html=partHtml(p,article);assert.match(html,/href="https:\/\/minamo.example/);assert.equal(p.inline[0].url,url,'saved source URL remains byte-identical');assert.doesNotMatch(html,/target="_blank"/);
 });

 test('compiled generic graphs stay editable without conversion to state transitions',()=>{
 const html=diagramEditorHtml(graph);assert.doesNotMatch(html,/Unsupported diagram format|Initial state/);assert.match(html,/value="graph-v1" selected/);assert.match(html,/Generic connections may be cyclic or bidirectional/);assert.match(html,/Return passage/);assert.match(html,/Kitchen 🐈/);
 });

 test('native canonical inline href retains validated active learning scope and the exact ordinary navigation target',()=>{
 const url='https://minamo.example/?view=library&family=article&id=ref-1&rendition=edition-1&section=details&part=example';
 const part={id:'p',kind:'paragraph',text:'Read reference',inline:[{start:5,end:14,kind:'link',url}]};
 for(const scope of [{learningSpace:'computing'},{learningSpace:'languages',language:'ja'}]){
  const html=scopedPartHtml(part,article,scope),href=/href="([^"]+)"/.exec(html)[1].replaceAll('&amp;','&'),params=new URL(href).searchParams;
  assert.equal(params.get('learningSpace'),scope.learningSpace);assert.equal(params.get('language'),scope.language??null);assert.equal(params.get('rendition'),'edition-1');assert.equal(params.get('section'),'details');assert.equal(params.get('part'),'example');
  assert.deepEqual(inlineReadingDestination(href),inlineReadingDestination(url),'the host can intercept the scoped anchor without losing exact source coordinates');assert.doesNotMatch(html,/target="_blank"/);
 }
 for(const query of ['&learningSpace=invalid','&learningSpace=computing&language=ja','&learningSpace=languages&language=invalid','&taskId=untrusted','&learningSpace=computing&learningSpace=languages'])assert.equal(inlineReadingDestination(url+query),null,query);
 const external='https://example.org/reference?learningSpace=computing';const externalHtml=scopedPartHtml({...part,inline:[{...part.inline[0],url:external}]},article,{learningSpace:'languages',language:'ja'});assert.match(externalHtml,/href="https:\/\/example.org\/reference\?learningSpace=computing"/);assert.match(externalHtml,/target="_blank"/);assert.equal(part.inline[0].url,url,'scope decoration never rewrites canonical saved source');
 });
