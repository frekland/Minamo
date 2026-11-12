import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const result=await build({entryPoints:['lib/japanese-context.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {isJapaneseWorkspaceContext}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
const all={learningSpace:'all'};
const part={id:'jp-demo',language:'ja',kind:'paragraph',text:'日本語'};
const record=learningScope=>({family:'journey',learningScope,sections:[{id:'intro',title:'Intro',parts:[part]}]});

test('global furigana appears for Japanese material',()=>{
 assert.equal(isJapaneseWorkspaceContext(all,record({spaces:['languages'],languages:['ja']})),true);
 assert.equal(isJapaneseWorkspaceContext({learningSpace:'languages',language:'ja'},null),true);
 assert.equal(isJapaneseWorkspaceContext(all,record(undefined)),true);
});
test('an isolated Japanese demo does not put furigana in computing Project chrome',()=>{
 assert.equal(isJapaneseWorkspaceContext(all,record({spaces:['computing']})),false);
 assert.equal(isJapaneseWorkspaceContext({learningSpace:'computing'},record({spaces:['computing']})),false);
});
