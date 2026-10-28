import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/global-search-history.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {globalSearchHistoryState:save,globalSearchHistoryQuery:restore}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const scope='v2-TEST-ONLY-owner:generation-1',computing={learningSpace:'computing'},japanese={learningSpace:'languages',language:'ja'};
test('Back/Forward search state retains only bounded query under the exact owner, generation and learning selection',()=>{
 const prior={minamoWorkspace:{scope,mainScroll:275},otherRouterState:'retained'},state=save(prior,scope,computing,'  Rust ownership  ');
 assert.equal(restore(state,scope,computing),'Rust ownership');assert.deepEqual(state.minamoWorkspace,prior.minamoWorkspace);assert.equal(state.otherRouterState,'retained');assert.equal(prior.minamoGlobalSearch,undefined);
 for(const [owner,selection] of [['v2-other-owner:generation-1',computing],['v2-TEST-ONLY-owner:generation-2',computing],[scope,{learningSpace:'all'}],[scope,japanese]])assert.equal(restore(state,owner,selection),'');
 const language=save({},scope,japanese,'猫');assert.equal(restore(language,scope,japanese),'猫');assert.equal(restore(language,scope,{learningSpace:'languages',language:'fr'}),'');
});
test('cleared, malformed and oversized search histories cannot resurrect terms or cross scope',()=>{
 const state=save({},scope,computing,'Rust');assert.equal(restore(save(state,scope,computing,''),scope,computing),'');
 for(const query of [' '.repeat(3),'x'.repeat(201),'unsafe\nterm','unsafe\0term'])assert.equal(restore(save(state,scope,computing,query),scope,computing),'');
 for(const value of [null,[],{minamoGlobalSearch:{version:2,scope,selection:computing,query:'Rust'}},{minamoGlobalSearch:{version:1,scope,selection:{learningSpace:'invalid'},query:'Rust'}},{minamoGlobalSearch:{version:1,scope,selection:{learningSpace:'computing',language:'ja'},query:'Rust'}}])assert.equal(restore(value,scope,computing),'');
});
