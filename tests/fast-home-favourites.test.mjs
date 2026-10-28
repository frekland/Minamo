import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {LearningHomeView} from './app/learning-home.tsx';export {createHomeFavouriteQueue,restoreHomeFavouriteOperations,applyHomeBookmarkUpdates,homeFavouriteStorageKey} from './app/learning-home.tsx';export const render=(props)=>renderToStaticMarkup(React.createElement(LearningHomeView,{selection:{learningSpace:'computing'},serverReads:true,onOpen:()=>{},onRefresh:()=>{},onMore:()=>{},onMoreFavourites:()=>{},onUnfavourite:()=>{},...props}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'fast-home-')),path=join(dir,'ui.cjs');writeFileSync(path,built.outputFiles[0].text);const ui=require(path);rmSync(dir,{recursive:true,force:true});
const memory=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>map.delete(key),map};};
const item=(id,rev=1)=>({target:{family:'article',id},title:'TEST ONLY '+id,destination:'/?view=library&family=article&id='+id,bookmarkTargetRev:rev});
const data=()=>({asOf:'2026-10-26T18:00:00Z',continue:[],recent:[],favourites:[item('one'),item('two')]});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject};};
const ack=(operation,rev=operation.command.expectedTargetRev+1)=>({operationId:operation.command.operationId,status:'committed',replayed:false,bookmark:{targetKey:operation.id,targetRev:rev,active:false,available:true}});

test('two unrelated Favourite removals dispatch independently and an exact duplicate shares its original flight',async()=>{
 const storage=memory(),queue=ui.createHomeFavouriteQueue('TEST-ONLY-home',storage),one=queue.retain(item('one'),'computing'),two=queue.retain(item('two'),'computing'),a=deferred(),b=deferred(),sent=[];
 const first=queue.run(one.id,command=>{sent.push(command);return a.promise;}),second=queue.run(two.id,command=>{sent.push(command);return b.promise;});
 assert.equal(queue.run(one.id,()=>{throw Error('must not send twice')}),first);await Promise.resolve();assert.equal(sent.length,2,'second dispatch never waits for the first acknowledgement');
 b.resolve(ack(two));await second;assert.deepEqual(ui.applyHomeBookmarkUpdates(data(),queue.getSnapshot().updates).favourites.map(x=>x.target.id),['one']);assert.equal(queue.getSnapshot().operations[0].state,'saving');
 a.resolve(ack(one));await first;assert.deepEqual(ui.applyHomeBookmarkUpdates(data(),queue.getSnapshot().updates).favourites,[]);assert.deepEqual(queue.getSnapshot().operations,[]);
});
test('lost acknowledgement survives remount with metadata-only original scope/payload and retries the same operation',async()=>{
 const storage=memory(),scope='TEST-ONLY-home:generation:restored@2',queue=ui.createHomeFavouriteQueue(scope,storage),operation=queue.retain(item('one'),'computing'),original=JSON.stringify(operation.command);
 await assert.rejects(queue.run(operation.id,async()=>{throw Object.assign(Error('uncertain transport'),{status:409});}));
 const raw=storage.map.get(ui.homeFavouriteStorageKey(scope));assert.doesNotMatch(raw,/TEST ONLY one|destination|title|body|quote/);assert.equal(JSON.parse(raw).operations[0].state,'uncertain');
 const remounted=ui.createHomeFavouriteQueue(scope,storage);assert.equal(JSON.stringify(remounted.getSnapshot().operations[0].command),original);assert.equal(remounted.getSnapshot().operations[0].command.expectedGeneration,'restored@2');
 let retry;await remounted.run(operation.id,async command=>{retry=command;return ack(operation);});assert.equal(JSON.stringify(retry),original);
 assert.deepEqual(ui.restoreHomeFavouriteOperations(JSON.parse(raw),'TEST-ONLY-home:generation:other@3'),[],'an old generation cannot enter a later operation namespace');
});
test('late unknown status cannot resurrect a change already confirmed by the scoped committed event',async()=>{
 const queue=ui.createHomeFavouriteQueue('TEST-ONLY-home',memory()),operation=queue.retain(item('one'),'computing'),status=deferred();
 const checking=queue.check(operation.id,()=>status.promise);queue.observe(operation.command,ack(operation));status.resolve(null);await checking;
 assert.deepEqual(queue.getSnapshot().operations,[]);assert.deepEqual(ui.applyHomeBookmarkUpdates(data(),queue.getSnapshot().updates).favourites.map(x=>x.target.id),['two']);
});
test('older acknowledgements cannot remove a newer re-Favourited target from a concurrent page read',()=>{
 const original=data();original.favourites[0]=item('one',5);
 const next=ui.applyHomeBookmarkUpdates(original,[{target:{family:'article',id:'one'},bookmark:{targetKey:'one',targetRev:4,active:false,available:true}}]);assert.deepEqual(next.favourites,original.favourites);
});
test('only the pending Favourite is locked; the other card stays editable and removal uses Yes/No',()=>{
 const queue=ui.createHomeFavouriteQueue('TEST-ONLY-home',memory()),operation=queue.retain(item('one'),'computing');operation.state='saving';
 const html=ui.render({state:{key:'read',data:data(),loading:false},operations:[operation],confirmation:'article:two'});
 assert.match(html,/Saving…/);assert.match(html,/aria-label="Remove TEST ONLY two from Favourites"/);assert.doesNotMatch(html,/disabled=""[^>]*aria-label="Remove TEST ONLY two/);assert.match(html,/Confirm removing TEST ONLY two from Favourites/);assert.match(html,/>Yes<\/button>/);assert.match(html,/>No<\/button>/);assert.doesNotMatch(html,/I reviewed these individual changes/);
});
test('definitive immutable conflict releases the operation for deliberate refresh; bare HTTP409 does not',async()=>{
 const queue=ui.createHomeFavouriteQueue('TEST-ONLY-home',memory()),operation=queue.retain(item('one'),'computing');
 await queue.run(operation.id,async()=>({...ack(operation),status:'conflict'}));assert.equal(queue.getSnapshot().operations[0].state,'conflict');queue.forget(operation.id);assert.equal(queue.getSnapshot().operations.length,0);
 const unknown=queue.retain(item('one'),'computing');await assert.rejects(queue.run(unknown.id,async()=>{throw Object.assign(Error('Unknown proxy conflict'),{status:409});}));queue.forget(unknown.id);assert.equal(queue.getSnapshot().operations[0].command.operationId,unknown.command.operationId);
});
