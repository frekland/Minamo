import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export {currentLibraryPage} from './app/library-browser.tsx'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false,loader:{'.css':'empty'}});
const {currentLibraryPage}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('a changed Library authority or browse identity cannot flash old cards or a false completed empty state before effects',()=>{
 const page={items:[{family:'article',id:'old-private-reading',title:'Old scoped source'}]};
 for(const current of ['owner-b:g1:computing:subjects','owner-a:g2:computing:subjects','owner-a:g1:languages:subjects','owner-a:g1:computing:query']){
  const shown=currentLibraryPage(page,'owner-a:g1:computing:subjects',current,false,'Old error');assert.deepEqual(shown,{page:{items:[]},loading:true,error:''});
 }
 assert.equal(currentLibraryPage(page,'current','current',false,'').page,page);
});
test('an admitted failure remains actionable and does not become an endless loading placeholder',()=>{
 assert.deepEqual(currentLibraryPage({items:[]},'current','current',false,'Permission denied'),{page:{items:[]},loading:false,error:'Permission denied'});
});
