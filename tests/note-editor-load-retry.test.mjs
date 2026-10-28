import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export {createNoteEditorLoader} from './lib/note-editor-loader.ts'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {createNoteEditorLoader}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('a failed lazy editor import does not poison Retry or duplicate the retried import',async()=>{let attempts=0,complete;const module={EditorView:'synthetic editor'};const load=createNoteEditorLoader(()=>{attempts++;if(attempts===1)return Promise.reject(Error('Synthetic deployment chunk unavailable'));return new Promise(resolve=>complete=resolve)});await assert.rejects(load(),/chunk unavailable/);const retry=load(),samePending=load();assert.equal(attempts,2);assert.equal(retry,samePending);complete(module);assert.equal(await retry,module);assert.equal(await load(),module);assert.equal(attempts,2)});
