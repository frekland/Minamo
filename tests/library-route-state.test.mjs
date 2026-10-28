import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export {librarySearchFromParams,restoreLibraryEntry,libraryHubProjection} from './app/library-browser.tsx';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false,loader:{'.css':'empty'}});
const ui=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('canonical Subject browse URL retains filter and sort only for its exact subject; independent history cannot override another context',()=>{
 const subject={facet:'topics',query:'',kind:'',areaId:'japanese',areaTitle:'Japanese'};
 const url=new URLSearchParams({view:'library',family:'area',id:'japanese',libraryFacet:'references',libraryQuery:'動詞',libraryKind:'language-syntax',librarySort:'updated'});
 assert.deepEqual(ui.librarySearchFromParams(url,subject),{...subject,facet:'references',query:'動詞',kind:'language-syntax',sort:'updated'});
 url.set('id','other-subject');assert.deepEqual(ui.librarySearchFromParams(url,subject),subject);
 url.set('id','japanese');url.set('librarySort','guessed-learning-sequence');assert.deepEqual(ui.librarySearchFromParams(url,subject),subject);
 const restored=ui.restoreLibraryEntry({scope:'principal:g1',browse:{...subject,facet:'areas'},scrollTop:48,pages:2},'principal:g1',subject);assert.equal(restored.browse.facet,'topics');assert.equal(restored.scrollTop,48);
});
test('warm Subject projection retains explicit membership metadata and bounded display prose without full manuscripts or admitted source text',()=>{
 const base={id:'subject',family:'area',title:'Subject',body:'x'.repeat(2000),rev:1,rendition:'exact-one',createdAt:'2026-10-27',updatedAt:'2026-10-27',actor:'user',synthetic:true,links:[],sections:[{id:'group',title:'Authored group',parts:[{id:'source',kind:'excerpt',text:'SOURCE_PRIVATE_CANARY',excerpt:{sourceId:'source'}},{id:'intro',kind:'paragraph',text:'An authored bounded explanation.'}]}]};
 const article={...base,id:'article',family:'article',body:'FULL_ARTICLE_CANARY',source:{excerpt:{text:'SOURCE_PRIVATE_CANARY'}},links:[{family:'area',id:'subject'},{family:'source',id:'private-source'},{family:'area',id:'related-subject',sourceContext:{sectionId:'group'}}]};
 const before=JSON.stringify([base,article]),hub=ui.libraryHubProjection(base,[article]);assert.equal(hub.record.body.length,1000);assert.equal(hub.related[0].body,'');assert.deepEqual(hub.related[0].links,[{family:'area',id:'subject'}]);assert.equal(hub.record.sections[0].parts.length,1);assert.doesNotMatch(JSON.stringify(hub),/SOURCE_PRIVATE_CANARY|FULL_ARTICLE_CANARY|private-source/);assert.equal(JSON.stringify([base,article]),before);
});
test('Title A–Z cursors carry multilingual titles across exact server pages without Latin-only encoding',async()=>{
 const {privateStorageFixture}=await import('./private-storage-fixture.mjs'),fixture=await privateStorageFixture(`import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}`);
 try{const client=fixture.client('TEST-only-multilingual-title-order');for(const [id,title] of [['three','うるう年'],['one','あいさつ'],['two','いろいろ']]){const record={id,family:'article',title,body:'Independent synthetic language explanation.',links:[],rev:1,rendition:'TEST-only-'+id,createdAt:'2026-10-27T00:00:00Z',updatedAt:'2026-10-27T00:00:00Z',trashedAt:null,actor:'system',synthetic:true};await fixture.db.prepare('INSERT INTO v2_records(owner,family,id,rev,data,trashed_at,last_operation) VALUES(?,?,?,?,?,?,?)').bind(client.owner,record.family,id,1,JSON.stringify(record),null,'TEST-only-multilingual-order').run();}let cursor,found=[];do{const page=await client.request('/api/library?'+new URLSearchParams({facet:'topics',limit:'1',...(cursor?{cursor}:{})}));assert.equal(page.status,200,JSON.stringify(page.data));found.push(...page.data.items.map(item=>item.id));cursor=page.data.nextCursor;}while(cursor);assert.deepEqual(found,['one','two','three']);}finally{await fixture.dispose();}
});
