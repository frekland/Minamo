import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readerLogicalMarkFixture} from './reader-logical-marks-fixture.mjs';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Reader from './app/reader.tsx';import ReadingNavigation from './app/reading-navigation.tsx';export const render=(article,records,mode,withNavigation=true)=>renderToStaticMarkup(React.createElement('main',{className:'v2-main wp-workspace','data-layout':mode},React.createElement(Reader,{article,records,draftScope:'TEST-ONLY-composition',onCommand:()=>Promise.reject(Error('Synthetic fixture only')),readingNavigation:withNavigation?React.createElement(ReadingNavigation,{record:article}):undefined})));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'error'});
const dir=mkdtempSync(join(tmpdir(),'reading-composition-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const fixture=readerLogicalMarkFixture();fixture.article.sections.push({id:'second',title:'Another exact section',parts:[{id:'p',kind:'paragraph',text:'Exact synthetic second-section text.'}]});
for(const mode of ['classic','focus','task'])test(`${mode}: title and its canonical capture precede navigation; saved marks follow outside the header`,()=>{
 const {article,records}=fixture,before=JSON.stringify(fixture),html=ui.render(article,records,mode);
 const heading=html.indexOf('id="passage-__article-__title"'),favourite=html.indexOf('class="rn-reader-bookmark"'),headerEnd=html.indexOf('</header>'),navigation=html.indexOf('aria-label="Move through this material"'),marks=html.indexOf('class="rn-logical-marks"'),content=html.indexOf('class="rn-reading-layout"');
 assert.ok(heading>0&&heading<favourite,'Favourite does not push the primary heading down a separate row');
 assert.ok(headerEnd<marks&&marks<content&&content<navigation,'section rail shares the complete content row while saved marks remain before it');
 assert.match(html,/class="le-section-links"[\s\S]*href="#section-second"/);
 assert.equal((html.match(/aria-label="On this page"/g)||[]).length,0,'do not duplicate the section list');
 assert.match(html,/<h1[^>]*data-reading-part="__title"[^>]*data-section-id="__article"/);
 assert.equal((html.match(/aria-label="Move through this material"/g)||[]).length,1);
 assert.match(html,/data-anchor-records="TEST-ONLY-mark-a TEST-ONLY-mark-b"/);
 assert.match(html,/Exact synthetic second-section text\./);assert.equal(JSON.stringify(fixture),before);
});
test('Reader without a section-navigation slot keeps its independent contents and canonical mark controls',()=>{
 const html=ui.render(fixture.article,fixture.records,'classic',false);assert.doesNotMatch(html,/Move through this material/);assert.match(html,/aria-label="On this page"/);assert.match(html,/class="rn-logical-marks"/);
});
