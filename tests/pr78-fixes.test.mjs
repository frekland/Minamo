import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {NavigationContext,useContextualHref} from './app/navigation-context';
import {experienceHref} from './lib/contextual-workspace-state';
import {sortProjectRecords} from './app/projects-index';
import {proposedEvidenceChoices} from './app/continuity-gpt-handoff';
import {prose} from './lib/continuity-evidence';
import {WorkingContextHost} from './app/working-context';
export {experienceHref,sortProjectRecords,proposedEvidenceChoices,prose};
function Link({href}) { const native=useContextualHref(); return React.createElement('a',{href:native(href)},'Source'); }
export const renderLink=(href,experience)=>renderToStaticMarkup(React.createElement(NavigationContext.Provider,{value:{experience,selection:{learningSpace:'computing'}}},React.createElement(Link,{href})));
export const renderSelected=()=>renderToStaticMarkup(React.createElement(WorkingContextHost,{scope:'test:1',selection:{learningSpace:'all'},serverReads:true,home:false,current:{family:'article',id:'tcp',title:'TCP reader',body:'Material',rev:1,links:[]},onStartNote:()=>{},onNavigate:()=>{}}));
`,resolveDir:root},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const module={exports:{}};new Function('module','exports','require',built.outputFiles[0].text)(module,module.exports,require);
const {experienceHref,sortProjectRecords,proposedEvidenceChoices,prose,renderLink,renderSelected}=module.exports;

test('F01: search and native links retain explicit contextual mode, selectors and exact edition on reload/new tab',()=>{
 const link='/?view=library&libraryFacet=search&libraryQuery=Python+sockets&learningSpace=computing&rendition=e1&start=5';
 const contextual=experienceHref(link,'context');
 assert.equal(new URL(contextual,'https://minamo.invalid').searchParams.get('workspace'),'context');
 assert.equal(new URL(contextual,'https://minamo.invalid').searchParams.get('rendition'),'e1');
 assert.equal(new URL(contextual,'https://minamo.invalid').searchParams.get('libraryQuery'),'Python sockets');
 assert.equal(experienceHref(contextual,'classic').includes('workspace=context'),false);
 assert.match(renderLink(link,'context'),/workspace=context/);
 assert.doesNotMatch(renderLink(link,'classic'),/workspace=context/);
 assert.equal(experienceHref('https://example.org/docs','context'),'https://example.org/docs');
 const workspace=readFileSync(resolve(root,'app/workspace.tsx'),'utf8');
 assert.match(workspace,/experienceHref\(learningSpaceHref\(librarySearchHref/,'all search-to-Library hrefs must carry the mode');
});

test('F02: ordinary Project discovery excludes synthetic records before sorting and ranking',()=>{
 const records=[{family:'journey',id:'fixture',title:'TEST ONLY — Plant Screamer',synthetic:true},
  {family:'journey',id:'real',title:'A project',synthetic:false},
  {family:'investigation',id:'question',title:'Question'},
  {family:'journey',id:'trashed',title:'Trashed',trashedAt:'2026-11-02'}];
 assert.deepEqual(sortProjectRecords(records).map(item=>item.id),['real']);
 const source=readFileSync(resolve(root,'lib/catalogue.ts'),'utf8');
 assert.match(source,/includeSynthetic:input\.includeSynthetic===true/,'server cursor scope separates explicit diagnostics from ordinary discovery');
 assert.match(source,/if\(input\.includeSynthetic!==true\)where\+=/,'normal SQL queries exclude fixtures');
 const project=readFileSync(resolve(root,'lib/project-context.ts'),'utf8');
 assert.match(project,/coalesce\(json_extract\(r\.data,'\$\.synthetic'\),0\)=0/,'independent Questions exclude fixtures server-side');
});

test('F03: selected material collapses the secondary connections panel with a discoverable button',()=>{
 const html=renderSelected();
 assert.match(html,/Connections &amp; history/);
 assert.match(html,/aria-expanded="false"/);
 assert.match(html,/id="wc-context-panel" hidden=""/);
 assert.match(html,/Source and saved connections/);
 const workspace=readFileSync(resolve(root,'app/workspace.tsx'),'utf8');
 assert.equal((workspace.match(/<NotesPanel /g)??[]).length,1,'one canonical Notes writer remains');
});

test('F04: compared exact editions are proposed in the handoff, never automatically prepared',()=>{
 const records=[
  {source:{family:'article',id:'tcp',rendition:'old',rev:1},at:'2026-11-01',title:'Old TCP'},
  {source:{family:'article',id:'tcp',rendition:'current',rev:2},at:'2026-11-02',title:'Current TCP'},
  {source:{family:'note',id:'n1',rev:4},at:'2026-11-02',title:'Saved note'}];
 const page={items:records};
 const proposed=proposedEvidenceChoices(page,[{family:'article',id:'tcp',rendition:'old'},{family:'note',id:'n1'}]);
 assert.equal(proposed.length,2);
 assert.deepEqual(proposed,records.filter((_,i)=>i!==1).map(item=>'record:'+JSON.stringify([item.source.family,item.source.id,item.source.rev,item.source.rendition??null])));
 assert.deepEqual(proposedEvidenceChoices(page,[{family:'article',id:'tcp',rendition:'revoked'}]),[]);
 const source=readFileSync(resolve(root,'app/continuity-gpt-handoff.tsx'),'utf8');
 assert.match(source,/generationFetch\(scope,/,'preparation must reread eligible sources under the owner generation');
 assert.match(source,/onClick=\{\(\)=>\{setChosen\(proposedEvidenceChoices/,'opening proposes choices, not a prepared brief');
});

test('F05: an Attempt with a canonical generic body gives useful bounded authorship, never execution claims',()=>{
 const base={family:'run',id:'attempt',body:'Explicit Activity attempt. Supplied evidence is not Minamo-observed execution.',attempt:{prediction:'Packets can be partial.',reflection:'I still need to test the timeout.',nextIntention:'Try sending a split frame.'}};
 const preview=prose(base);
 assert.match(preview.text,/Learner prediction \(not tested here\): Packets can be partial/);
 assert.match(preview.text,/Next intention recorded then: Try sending a split frame/);
 assert.match(preview.text,/no Minamo-observed execution/);
 assert.equal(preview.complete,false);assert.equal(preview.detailsDeferred,true);
 const missing=prose({...base,attempt:{}});
 assert.match(missing.text,/details not included — open the original/);
 const huge=prose({...base,attempt:{prediction:'x'.repeat(1800)}});
 assert.equal(huge.text.length,700);assert.equal(huge.complete,false);
});
