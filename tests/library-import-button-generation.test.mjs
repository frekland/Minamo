import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {zipSync} from 'fflate';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),React=require('react'),{create,act}=require('react-test-renderer');
const built=await wr('esbuild').build({stdin:{contents:"export {default} from './app/library-import-button.tsx'",resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,external:['react']});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
test('Library scope becomes an opaque generation token before preview inventory',async()=>{
 const previous={window:globalThis.window,fetch:globalThis.fetch,IS_REACT_ACT_ENVIRONMENT:globalThis.IS_REACT_ACT_ENVIRONMENT};let renderer;const calls=[];
 globalThis.window={};globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.fetch=async(url,init)=>{calls.push(init.headers['x-minamo-generation']);return Response.json({records:[],nextCursor:null});};
 const manifest={format:'minamo-library-archive@1',complete:true,includesHistory:false,counts:{records:0,assets:0},records:[],assets:[]},enc=new TextEncoder(),file=new File([zipSync({'manifest.json':enc.encode(JSON.stringify(manifest)),'README.txt':enc.encode('test')})],'test.zip');
 try{for(const [scope,token] of [['v2-'+ 'a'.repeat(64),'legacy@0'],['v2-'+ 'a'.repeat(64)+':generation:restored@2','restored@2']]){await act(async()=>{renderer=create(React.createElement(mod.exports.default,{generation:scope}));});await act(async()=>{await renderer.root.findByProps({'aria-label':'Choose a Minamo Library ZIP'}).props.onChange({currentTarget:{files:[file]}});await new Promise(r=>setTimeout(r,50));});assert.equal(calls.at(-1),token);await act(async()=>renderer.unmount());renderer=null;}}finally{if(renderer)await act(async()=>renderer.unmount());Object.assign(globalThis,previous);}
});
