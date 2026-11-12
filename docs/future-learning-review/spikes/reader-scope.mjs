/** Research only: render two CURRENT Readers with synthetic records; no browser, storage or network. */
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
const checkout=resolve(process.argv[2]??'.');
const require=createRequire(join(checkout,'package.json'));
const wr=createRequire(require.resolve('wrangler/package.json'));
const source=`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Reader from './app/reader.tsx';export function render(records){return renderToStaticMarkup(React.createElement('div',null,records.map(article=>React.createElement(Reader,{key:article.id,article,records:[],draftScope:'TEST-ONLY-PR27-READER',onCommand:()=>Promise.reject(Error('Research: no writes'))}))));}`;
const bundle=await wr('esbuild').build({stdin:{contents:source,resolveDir:checkout},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'pr27-reader-'));let result;
try{
 const path=join(dir,'reader.cjs');writeFileSync(path,bundle.outputFiles[0].text);
 const make=id=>({id,family:'article',title:'TEST ONLY '+id,body:'',links:[],rev:1,rendition:'TEST-ONLY-'+id,actor:'system',synthetic:true,sections:[{id:'s1',title:'A distinct record with common local IDs',parts:[{id:'p1',kind:'paragraph',text:'Synthetic source '+id}]}]});
 const html=require(path).render([make('first'),make('second')]);
 const counts=new Map();for(const [,id]of html.matchAll(/\sid="([^"]+)"/g))counts.set(id,(counts.get(id)??0)+1);
 result={kind:'synthetic-local-SSR-only',distinctRecords:2,duplicateDomIds:[...counts].filter(([,n])=>n>1).map(([id,count])=>({id,count})),conclusion:'Unchanged full Readers share canonical DOM IDs. This establishes a rendering collision; browser selection effects require separate testing. Use a noninteractive reference preview first, or scope the full Reader before two active instances.'};
 if(!result.duplicateDomIds.some(x=>x.id==='passage-s1-p1'))throw Error('Expected current baseline collision was not reproduced; reassess design.');
}finally{rmSync(dir,{recursive:true,force:true});}
console.log(JSON.stringify(result,null,2));
