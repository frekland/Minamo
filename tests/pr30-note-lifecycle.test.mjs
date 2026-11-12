import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const result=await build({stdin:{contents:"export {default as NoteWritingEditor} from './app/note-writing-editor.tsx'; export {createElement} from 'react'; export {renderToStaticMarkup} from 'react-dom/server';",resolveDir:process.cwd(),loader:'tsx'},bundle:true,format:'cjs',platform:'node',write:false,jsx:'automatic',packages:'external',loader:{'.css':'empty'}});
const compiled={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(require,compiled,compiled.exports);
const {NoteWritingEditor,createElement,renderToStaticMarkup}=compiled.exports;
const props={scope:'TEST ONLY lifecycle',identity:'rich-note',value:'TEST ONLY source',enabled:true,disabled:false,onChange(){throw Error('render cannot write source')},onEnableRich(){},onComposing(){}};
const host=html=>html.match(/<div(?=[^>]*class="nw-editor-host")[^>]*>/g)??[];
test('rich editor owns exactly one persistent host in rich and plain layouts; plain only hides it',()=>{
 const rich=host(renderToStaticMarkup(createElement(NoteWritingEditor,{...props,format:'markdown-v1'})));
 const plain=host(renderToStaticMarkup(createElement(NoteWritingEditor,{...props,identity:'plain-note',format:undefined})));
 assert.equal(rich.length,1,'rich layout has one owned host');
 assert.equal(plain.length,1,'plain layout retains the same host position so an existing view cannot become detached');
 assert.doesNotMatch(rich[0],/\bhidden=/);
 assert.match(plain[0],/\bhidden=/);
});

test('image picker is a direct formatting toolbar action without a required metadata form',()=>{const html=renderToStaticMarkup(createElement(NoteWritingEditor,{...props,format:'markdown-v1',onInsertImage(){}}));const toolbar=html.slice(html.indexOf('role="toolbar"'),html.indexOf('<details class="nw-more-tools"'));assert.match(toolbar,/aria-label="Code block"/);assert.match(toolbar,/aria-label="Insert image"/);assert.match(html,/type="file"/);assert.doesNotMatch(html,/Upload and insert privately|What does this screenshot show|Add \/ drop image/)});
