import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const compiled=await build({stdin:{contents:'import React from "react";import {renderToStaticMarkup} from "react-dom/server";import {RichReadingPart,anchorValid,readerRelatedRecords} from "./app/reader.tsx";import {readingTableMap,extendCanonicalSegment} from "./lib/reader-table-map.ts";import {imageGeometry} from "./app/reading-image.tsx";export {readingTableMap,extendCanonicalSegment,anchorValid,readerRelatedRecords,imageGeometry};export function render(part,article,captures=[]){return renderToStaticMarkup(React.createElement(RichReadingPart,{part,sectionId:"explanation",article,captures}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'v2-rich-reader-')),entry=join(dir,'reader.cjs');writeFileSync(entry,compiled.outputFiles[0].text);const {readingTableMap,extendCanonicalSegment,anchorValid,readerRelatedRecords,imageGeometry,render}=require(entry);rmSync(dir,{recursive:true,force:true});
const table={headers:['Representation','Example'],rows:[['UTF-16','😄'],['Escaped & safe','<tag>']],caption:'A comparison, not a learner result'};
const text=[table.headers,...table.rows].map(r=>r.join('\t')).join('\n');
const part={id:'comparison',kind:'table',text,table};
const article={id:'reading-1',family:'article',rendition:'rich-reading-r1',title:'Representations',body:'Original explanation',sections:[{id:'explanation',title:'Compare what you measure',parts:[part]}],links:[],rev:1,createdAt:'2026-10-21',updatedAt:'2026-10-21',trashedAt:null,actor:'gpt',synthetic:true};
const decode=s=>s.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'");
test('semantic table cells retain literal UTF16 canonical slices independent of visual layout',()=>{
 const map=readingTableMap(part);assert.ok(map);const html=render(part,article);assert.match(html,/<table/);assert.match(html,/<th scope="col"/);assert.match(html,/<figcaption[^>]*>A comparison/);
 const cells=[...html.matchAll(/<span([^>]*data-reading-part="comparison"[^>]*)>([\s\S]*?)<\/span>/g)].map(m=>({start:Number(m[1].match(/data-canonical-start="(\d+)"/)[1]),end:Number(m[1].match(/data-canonical-end="(\d+)"/)[1]),text:decode(m[2])}));
 assert.equal(cells.length,6);for(const cell of cells)assert.equal(cell.text,text.slice(cell.start,cell.end));assert.equal(cells[3].text,'😄');assert.equal(cells[3].end-cells[3].start,2);assert.equal(cells[5].text,'<tag>');assert.doesNotMatch(html,/<tag>/);assert.doesNotMatch(html,/Inspect exact table text|rn-table-source|<details/);
});
test('adjacent cell range adapter derives exact stored TSV, never guessed spaces',()=>{
 const map=readingTableMap(part);const left=map.rows[1].cells[0],right=map.rows[2].cells[1];let merged={start:left.start,end:left.end};for(const cell of [...map.rows[1].cells.slice(1),...map.rows[2].cells])merged=extendCanonicalSegment(text,merged,cell);assert.ok(merged);assert.equal(text.slice(merged.start,merged.end),'UTF-16\t😄\nEscaped & safe\t<tag>');
 const target={articleId:article.id,rendition:article.rendition,sectionId:'explanation',partId:'comparison',...merged,quote:text.slice(merged.start,merged.end)};assert.equal(anchorValid(target,article),true);assert.equal(extendCanonicalSegment('cell unselected content cell',{start:0,end:4},{start:24,end:28}),null);
});
test('mismatched structured table falls back to exact authored text instead of fabricated cells',()=>{
 const broken={...part,text:'A retained textual representation'};assert.equal(readingTableMap(broken),null);const html=render(broken,article);assert.doesNotMatch(html,/<table/);assert.match(html,/Structured table unavailable/);assert.match(html,/A retained textual representation/);
});
test('callout label and graphic chrome stay outside exact mapped explanation',()=>{
 const callout={id:'question',kind:'callout',text:'What would the evidence prove? 😄',callout:{tone:'question',label:'Pause and predict'}};const html=render(callout,article);assert.match(html,/rn-callout-question/);assert.match(html,/Pause and predict/);const mapped=html.match(/<p[^>]*data-reading-part="question"[^>]*>([\s\S]*?)<\/p>/)[1];assert.equal(decode(mapped),callout.text);assert.doesNotMatch(mapped,/Pause and predict/);
});
test('reference cards preserve explanation and rights without automatic file or media loading',()=>{
 const reference={id:'evidence',kind:'reference',text:'Compare this authentic artefact with the explanation.',reference:{url:'https://github.com/owner/learning/blob/'+'a'.repeat(40)+'/telemetry.py#L2-L9',label:'Telemetry source',rights:'link-only',commit:'a'.repeat(40),path:'python/telemetry.py',alt:'A small source file supplied by the learner'}};const html=render(reference,article);assert.match(html,/View on GitHub/);assert.match(html,/Link only/);assert.doesNotMatch(html,/No file or media has been imported or loaded automatically/);assert.doesNotMatch(html,/<(?:img|video|audio|iframe|object|embed)\b/);const mapped=html.match(/<p[^>]*data-reading-part="evidence"[^>]*>([\s\S]*?)<\/p>/)[1];assert.equal(decode(mapped),reference.text);assert.doesNotMatch(mapped,/Telemetry source/);
});

test('GPT related options use typed direct/reverse links and captures, never title similarity',()=>{
 const record=(family,id,extra={})=>({...article,family,id,links:[],...extra});
 const source=record('source','same'),investigation=record('investigation','same'),note=record('note','linked-note',{links:[{family:'article',id:article.id}]}),capture=record('annotation','capture',{anchor:{articleId:article.id}}),wrongFamily=record('flag','wrong-family',{anchor:{recordFamily:'journey',articleId:article.id}}),unrelated=record('note','unrelated',{title:article.title}),trashed=record('note','trashed',{links:[{family:'article',id:article.id}],trashedAt:'2026-10-21'});
 const target={...article,links:[{family:'investigation',id:'same'},{family:'source',id:'same'}]};
 assert.deepEqual(readerRelatedRecords(target,[article,source,investigation,note,capture,wrongFamily,unrelated,trashed]).map(record=>[record.family,record.id]),[['investigation','same'],['source','same'],['note','linked-note'],['annotation','capture']]);
});

test('private image reserves validated geometry and maps authored description then caption exactly',()=>{
 const image={assetId:'private-image-1',alt:'A terminal shows café and 😄.',caption:'Illustrative terminal, not observed Kali work.'};const part={id:'terminal',kind:'image',image,text:image.alt+'\n'+image.caption,imageDisplay:{width:640,height:320,mime:'image/png'}};const record={...article,sections:[{id:'explanation',title:'Inspect the image',parts:[part]}]};const html=render(part,record);assert.match(html,/aspect-ratio:640 \/ 320/);assert.doesNotMatch(html,/<img|src=|private-image-1/);assert.match(html,/Image loads when it enters view/);
 const mapped=[...html.matchAll(/<(?:p|span)([^>]*data-reading-part="terminal"[^>]*)>([\s\S]*?)<\/(?:p|span)>/g)].map(match=>({start:Number(match[1].match(/data-canonical-start="(\d+)"/)[1]),end:Number(match[1].match(/data-canonical-end="(\d+)"/)[1]),text:decode(match[2])}));assert.equal(mapped.length,2);for(const range of mapped)assert.equal(range.text,part.text.slice(range.start,range.end));assert.equal(mapped[1].start,image.alt.length+1);
 const merged=extendCanonicalSegment(part.text,mapped[0],mapped[1]);assert.ok(merged);const anchor={articleId:record.id,rendition:record.rendition,sectionId:'explanation',partId:part.id,...merged,quote:part.text};assert.equal(anchorValid(anchor,record),true);assert.equal(anchorValid({...anchor,start:image.alt.length+1,quote:image.caption},record),true);
});
test('redacted image renders honest unavailable state without identity, description or caption',()=>{
 const part={id:'terminal',kind:'image',text:'',unavailable:true};const html=render(part,article);assert.match(html,/Image unavailable/);assert.doesNotMatch(html,/data-reading-part|<img|src=|figcaption/);
 assert.equal(imageGeometry(640,320)?.height,320);for(const pair of [[0,1],[9000,1],[8192,8192],[NaN,5],[3.5,2]])assert.equal(imageGeometry(...pair),null);
});

test('declared diagram geometry leaves exact authored source mapped; legacy and invalid diagrams stay textual',()=>{
 const diagram={format:'flow-v1',nodes:[{id:'question',label:'Inspect 😄'},{id:'bytes',label:'UTF-8 bytes'},{id:'units',label:'UTF-16 units'}],edges:[{from:'question',to:'bytes',label:'Encode'},{from:'question',to:'units',label:'JavaScript'}]};const text='Nodes\nquestion: Inspect 😄\nbytes: UTF-8 bytes\nunits: UTF-16 units\n\nConnections\nquestion → bytes: Encode\nquestion → units: JavaScript';const part={id:'flow',kind:'diagram',diagram,text};const record={...article,sections:[{id:'explanation',title:'Two representations',parts:[part]}]};const html=render(part,record);assert.match(html,/<svg/);assert.equal([...html.matchAll(/data-flow-from=/g)].length,2);const mapped=html.match(/<code[^>]*data-reading-part="flow"[^>]*>([\s\S]*?)<\/code>/)[1];assert.equal(decode(mapped),text);const quote='question → units: JavaScript',start=text.indexOf(quote);assert.equal(anchorValid({articleId:record.id,rendition:record.rendition,sectionId:'explanation',partId:'flow',start,end:start+quote.length,quote},record),true);
 const legacy={id:'legacy-flow',kind:'diagram',text:'A → B\r\n  ↳ C → D'};assert.doesNotMatch(render(legacy,record),/<svg/);const invalid=render({...part,diagram:{...diagram,format:'unknown'}},record);assert.doesNotMatch(invalid,/<svg/);assert.match(invalid,/unsupported or invalid/);assert.match(invalid,/question → units: JavaScript/);
});
