import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/library-read-cache.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {createLibraryReadCache,LibraryReadFailure,libraryReadRequiresClear,bindLibraryCacheInvalidation}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done});return {promise,resolve}};
test('Library identical reads coalesce, fresh warm returns avoid another request and quiet revalidation has a finite age',async()=>{
 let time=1000,calls=0;const cache=createLibraryReadCache({now:()=>time}),pending=deferred();cache.activate('principal-a:legacy@0');
 const load=async()=>{calls++;return pending.promise};const a=cache.read('principal-a:legacy@0','computing:areas',load),b=cache.read('principal-a:legacy@0','computing:areas',load);assert.equal(a,b);await Promise.resolve();assert.equal(calls,1);
 const page={items:[{id:'synthetic-area',title:'Synthetic subject'}]};pending.resolve(page);assert.equal(await a,page);assert.equal(await b,page);
 assert.equal(await cache.read('principal-a:legacy@0','computing:areas',async()=>{calls++;return {items:[]}}),page);assert.equal(calls,1);
 time+=15001;const refreshed=await cache.read('principal-a:legacy@0','computing:areas',async()=>{calls++;return {items:[{id:'fresh'}]}});assert.equal(calls,2);assert.equal(refreshed.items[0].id,'fresh');
 assert.equal(cache.peek('principal-a:legacy@0','languages:areas'),undefined);assert.equal(cache.peek('principal-a:g2','computing:areas'),undefined);
});
test('Library permission invalidation aborts and rejects late responses, including while no Library component is mounted',async()=>{
 const cache=createLibraryReadCache(),events=new EventTarget();cache.activate('principal-a:legacy@0');const unbind=bindLibraryCacheInvalidation(cache,events),pending=deferred();let signal;
 cache.put('principal-a:legacy@0','admitted-cards',{title:'SOURCE_CANARY'});const flight=cache.read('principal-a:legacy@0','pending',async value=>{signal=value;return pending.promise});await Promise.resolve();
 events.dispatchEvent(Object.assign(new Event('minamo-source-unavailable'),{detail:{ownerScope:'principal-a:legacy@0'}}));assert.equal(signal.aborted,true);assert.equal(cache.peek('principal-a:legacy@0','admitted-cards'),undefined);
 pending.resolve({title:'LATE_SOURCE_CANARY'});await assert.rejects(flight,/authority changed/);assert.equal(cache.peek('principal-a:legacy@0','pending'),undefined);assert.equal(cache.stats().entries,0);
 cache.put('principal-a:legacy@0','cards',{title:'Synthetic independent metadata'});events.dispatchEvent(Object.assign(new Event('minamo-record-committed'),{detail:{ownerScope:'principal-a:legacy@0',command:{family:'note'}}}));assert.ok(cache.peek('principal-a:legacy@0','cards'),'an unrelated Note does not evict an admitted Library');events.dispatchEvent(Object.assign(new Event('minamo-record-committed'),{detail:{ownerScope:'principal-a:legacy@0',command:{family:'source'}}}));assert.equal(cache.peek('principal-a:legacy@0','cards'),undefined);unbind();
});
test('Library authority transitions dispose old metadata and late flights rather than adopting another principal or generation',async()=>{
 const cache=createLibraryReadCache(),pending=deferred();cache.activate('principal-a:legacy@0');cache.put('principal-a:legacy@0','computing:subject',{id:'private-a'});const a=cache.read('principal-a:legacy@0','read',()=>pending.promise);await Promise.resolve();cache.activate('principal-b:legacy@0');assert.equal(cache.peek('principal-a:legacy@0','computing:subject'),undefined);pending.resolve({id:'late-a'});await assert.rejects(a,/authority changed/);assert.equal(cache.stats().entries,0);
 cache.put('principal-b:legacy@0','computing:subject',{id:'private-b'});cache.activate('principal-b:restored@1');assert.equal(cache.stats().entries,0);
});
test('Library metadata cache has bounded LRU size and bytes, rejects oversized entries and expires old admissions',()=>{
 let time=100;const cache=createLibraryReadCache({now:()=>time,maxEntries:2,maxBytes:100,maxAgeMs:1000});cache.activate('principal');cache.put('principal','one',{id:'one'});cache.put('principal','two',{id:'two'});cache.peek('principal','one');cache.put('principal','three',{id:'three'});assert.equal(cache.peek('principal','two'),undefined);assert.equal(cache.stats().entries,2);cache.put('principal','oversized',{body:'x'.repeat(1000)});assert.equal(cache.peek('principal','oversized'),undefined);assert.ok(cache.stats().bytes<=100);time+=1001;assert.equal(cache.peek('principal','one'),undefined);assert.equal(cache.peek('principal','three'),undefined);assert.equal(cache.stats().entries,0);
});
test('Library distinguishes transient transport failures from known stale, denied or generation-invalid metadata',()=>{
 for(const status of [401,403,404,409])assert.equal(libraryReadRequiresClear(new LibraryReadFailure('Synthetic',status)),true);
 for(const code of ['generation_conflict','source_unavailable','library_authority_changed'])assert.equal(libraryReadRequiresClear(new LibraryReadFailure('Synthetic',503,code)),true);
 assert.equal(libraryReadRequiresClear(new LibraryReadFailure('Temporary unavailable',503)),false);assert.equal(libraryReadRequiresClear(new TypeError('Network unavailable')),false);
});
