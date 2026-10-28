import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const result=await wr('esbuild').build({stdin:{contents:"export * from './lib/note-content.ts';export * from './lib/note-terminal.ts';export * from './lib/search-evidence.ts';",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
test('a typed terminal block cannot be silently swallowed by an unclosed prose code fence',()=>{
 const submitted=[{kind:'markdown',text:'An example begins:\n\n```text'},{kind:'terminal',id:'external-proof',output:'FAIL\n  expected 1; got 2'}];
 assert.throws(()=>api.compileNoteContent(submitted),/fence|terminal|capture/i);
 assert.equal(submitted[1].output,'FAIL\n  expected 1; got 2');
 const repaired=api.compileNoteContent([{...submitted[0],text:submitted[0].text+'\nexample\n```'},submitted[1]]);
 assert.deepEqual(api.parseNoteTerminalPlacements(repaired).map(p=>p.capture.id),['external-proof']);
});
test('ordinary prose retains Unicode case-insensitive coverage while technical aliases retain their explicit case contract',()=>{
 const base={id:'TEST-ONLY-review',family:'note',title:'Independent note',body:'A café discussion and a δοκιμή.',links:[],rev:1,rendition:'r1',createdAt:'2026-10-25T11:00:00Z',updatedAt:'2026-10-25T11:00:00Z',trashedAt:null,actor:'user',synthetic:true};
 assert.equal(api.recordSearchEvidence(base,'CAFÉ')?.matchedTerm,'café');
 assert.equal(api.recordSearchEvidence(base,'ΔΟΚΙΜΉ')?.matchedTerm,'δοκιμή');
 const technical={...base,family:'article',body:'Independent text.',sections:[{id:'options',title:'Options',parts:[{id:'recursive',kind:'paragraph',text:'The lowercase option has its own meaning.'}]}],concepts:[{id:'r',term:'-r',aliases:[],caseSensitive:true,definition:'A lowercase technical option.',sectionId:'options',partId:'recursive'}]};
 assert.equal(api.recordSearchEvidence(technical,'-R'),undefined);
});
