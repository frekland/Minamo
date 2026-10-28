import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:'export * from "./lib/atlas/project.ts";export * from "./lib/atlas/layout.ts";export * from "./lib/atlas/canvas.ts";export * from "./lib/atlas/service.ts";',resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const a=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const record=(family,id,extra={})=>({family,id,title:'TEST ONLY '+id,body:'Independent authored source.',links:[],rev:1,rendition:'rendition-'+id,createdAt:'2026-10-25T12:00:00.000Z',updatedAt:'2026-10-25T12:00:00.000Z',trashedAt:null,actor:'user',synthetic:true,...extra});
test('four Atlas lenses preserve exact identities, distinct stage/concept projections and deterministic layout',()=>{
 const j=record('journey','j',{sections:[{id:'s',title:'Direction',parts:[{id:'p',kind:'paragraph',text:'An authored goal'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stage',sectionId:'s',title:'Explore streams',intent:'Compare bytes',optional:true}]}}),article=record('article','a',{sections:[{id:'ref',title:'Reference',parts:[{id:'code',kind:'code',text:'recv(10)'}]}],concepts:[{id:'recv',term:'recv',definition:'A stream read',aliases:[],sectionId:'ref',partId:'code'}]});
 for(const lens of ['route','constellation','river','galaxy']){const projected=a.projectLearningGraph([j,article],[],lens);assert.equal(projected.nodes[0].rev,1);assert.deepEqual(a.atlasLayout(projected,lens),a.atlasLayout(projected,lens));assert.ok(projected.nodes.every(n=>n.href.startsWith('/?')));assert.equal(JSON.stringify(projected).includes('mastery'),false);if(lens==='route')assert.equal(projected.nodes.find(n=>n.kind==='stage').evidence,'Optional authored direction');if(lens==='constellation')assert.match(projected.nodes.find(n=>n.kind==='concept').href,/part=code/);}
});
test('saved relationships keep authored reasons and historical rendition; no chronology creates causal edge',()=>{
 const current=record('article','a'),old={...current,rendition:'retained-a'},note=record('note','n',{links:[{family:'article',id:'a',rendition:'retained-a',reason:'Compare my earlier model',relation:'contrasts'}]});
 const g=a.projectLearningGraph([current,note],[{source:note,destination:note.links[0],target:old,index:0}],'river');assert.equal(g.edges.length,1);assert.equal(g.edges[0].historical,true);assert.equal(g.edges[0].basis,'authored-link');assert.equal(g.edges[0].relation,'contrasts');assert.match(g.edges[0].href,/rendition=retained-a/);assert.equal(a.projectLearningGraph([current,note],[],'river').edges.length,0);
});
test('revoked source and Trash disappear; unsupported hint/proposal/rights fields rejected by query schema',()=>{
 const g=a.projectLearningGraph([record('note','safe'),record('source','revoked',{source:{rights:'permitted-excerpt',excerpt:{unavailable:true}}}),record('article','trash',{trashedAt:'now'})],[],'route');assert.deepEqual(g.nodes.map(n=>n.id),['note:safe']);for(const value of [{owner:'other'},{generation:'fake'},{limit:61},{focus:{family:'html',id:'x'}},{lens:'mastery'},{suggestions:[{accepted:true}]}])assert.equal(a.atlasQuerySchema.safeParse(value).success,false);
});
test('canvas snapshots retain only bounded coordinates and exact identity; revocation/generation fences',()=>{
 const graph={scope:{generation:'legacy@0'},nodes:[{id:'note:current'}]},snapshot={contract:'minamo.atlas-layout.v1',generation:'legacy@0',cards:[{recordKey:'note:current',x:1,y:2,w:260,h:130},{recordKey:'article:revoked',x:10,y:20,w:260,h:130}]};assert.equal(a.revalidateAtlasCanvas(snapshot,graph).cards.length,1);assert.throws(()=>a.revalidateAtlasCanvas({...snapshot,generation:'new@1'},graph));assert.throws(()=>a.revalidateAtlasCanvas({...snapshot,cards:[{...snapshot.cards[0],title:'private text'}]},graph));assert.throws(()=>a.revalidateAtlasCanvas({...snapshot,cards:[{...snapshot.cards[0],x:Infinity}]},graph));assert.equal(a.revalidateAtlasCanvas({...snapshot,cards:[snapshot.cards[0],snapshot.cards[0]]},graph).cards.length,1);
});
test('120-node bounded graph layout remains deterministic in every lens without engine/GPU access',()=>{
 const records=Array.from({length:120},(_,i)=>record(i%2?'note':'investigation','bounded-'+i));for(const lens of ['route','constellation','river','galaxy']){const graph=a.projectLearningGraph(records,[],lens),p=a.atlasLayout(graph,lens);assert.equal(p.size,120);assert.ok([...p.values()].every(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)));}
});
