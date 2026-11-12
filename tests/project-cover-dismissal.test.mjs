import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import React from 'react';
import {create,act} from 'react-test-renderer';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['app/project-cover.tsx'],bundle:true,format:'cjs',platform:'node',jsx:'automatic',loader:{'.css':'empty'},external:['react','react/jsx-runtime','lucide-react'],write:false,logLevel:'silent'});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
const ProjectCover=mod.exports.default;
test('Project image dialog dismisses during a pending save and background completion does not steal focus',async()=>{
 const oldFetch=globalThis.fetch,oldStorage=globalThis.sessionStorage,oldAct=globalThis.IS_REACT_ACT_ENVIRONMENT;
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const storage=new Map();globalThis.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 const record={id:'synthetic-cover',family:'journey',title:'Synthetic cover dismissal',body:'',links:[],rev:1,createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-27T00:00:00Z',trashedAt:null,actor:'user',synthetic:true,projectCover:{assetId:'image-synthetic',decorative:true}};
 let resolveSave,focuses=0,closes=0;const saved=new Promise(resolve=>{resolveSave=resolve;});
 const nativeDialog={open:false,showModal(){this.open=true;},close(){this.open=false;closes++;}};
 globalThis.fetch=async()=>Response.json({record:{...record,rev:2,projectCover:null}});
 let tree;
 try{
  await act(async()=>{tree=create(React.createElement(ProjectCover,{record,scope:'synthetic-cover-scope',onCommand:()=>saved}),{createNodeMock:element=>element.type==='dialog'?nativeDialog:element.type==='button'&&element.props.className?.includes('project-cover-trigger')?{focus(){focuses++;}}:null});});
  const button=name=>tree.root.findAllByType('button').find(node=>node.props['aria-label']===name||node.children.includes(name)||node.findAllByType('span').some(span=>span.children.includes(name)));
  await act(async()=>{button('Change image').props.onClick();});assert.equal(nativeDialog.open,true);
  await act(async()=>{void button('Remove image').props.onClick();});assert.equal(button('Remove image').props.disabled,true);
  assert.notEqual(button('Close Project image').props.disabled,true,'dismissal must stay available while a save is pending');
  await act(async()=>{button('Close Project image').props.onClick();});assert.equal(nativeDialog.open,false);assert.ok(closes>0);assert.equal(storage.size,1,'pending command remains retained after dismissal');
  const afterDismissal=focuses;
  await act(async()=>{resolveSave({operationId:'synthetic',status:'committed',replayed:false});await saved;});
  assert.equal(nativeDialog.open,false);assert.equal(focuses,afterDismissal,'background save cannot pull focus away from the learner');assert.equal(storage.size,0,'successful readback clears only the retained cover command');
 }finally{if(tree)await act(async()=>tree.unmount());globalThis.fetch=oldFetch;globalThis.sessionStorage=oldStorage;globalThis.IS_REACT_ACT_ENVIRONMENT=oldAct;}
});
