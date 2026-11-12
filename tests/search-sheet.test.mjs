import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({
  stdin:{
    contents:`import React from 'react';
      import {renderToStaticMarkup} from 'react-dom/server';
      import Search from './app/header-search.tsx';
      export const render=query=>renderToStaticMarkup(
        React.createElement(Search,{query,onQuery:()=>{},onClose:()=>{}},
          React.createElement('p',null,'Visible search result'))
      );`,
    resolveDir:process.cwd()
  },
  bundle:true,format:'cjs',platform:'node',write:false,
  loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}
});
const dir=mkdtempSync(join(tmpdir(),'minamo-search-sheet-'));
const file=join(dir,'search.cjs');writeFileSync(file,built.outputFiles[0].text);
const {render}=require(file);rmSync(dir,{recursive:true,force:true});

test('empty mobile search is just a compact input, not a middle-screen explainer',()=>{
  const html=render('');
  assert.match(html,/aria-labelledby="mobile-search-title"/);
  assert.match(html,/<h2 id="mobile-search-title">Search<\/h2>/);
  assert.match(html,/aria-label="Search in this learning space"/);
  assert.doesNotMatch(html,/Search names, explanations|Try a command, phrase or question/);
  assert.doesNotMatch(html,/Visible search result/);
});

test('typed search preserves shared result content and clear/close controls',()=>{
  const html=render('git');
  assert.match(html,/Visible search result/);
  assert.match(html,/aria-label="Clear search query"/);
  assert.match(html,/aria-label="Close search"/);
});

test('search sheet is top-aligned and independently scrollable on small screens',()=>{
  const styles=readFileSync('app/header-search.css','utf8');
  assert.match(styles,/\.ux-search-dialog\s*\{\s*position:fixed;/);
  assert.match(styles,/--ux-search-top-gap:clamp\(16px,6dvh,64px\)/);
  assert.match(styles,/\.ux-search-dialog-results\s*\{[^}]*overflow-y:auto/s);
  assert.match(styles,/@media\(max-width:700px\)\s*\{\s*\.ux-search-dialog\s*\{/);
  assert.match(styles,/\.ux-search-dialog-field>input:focus-visible\s*\{\s*outline:none!important/);
});
