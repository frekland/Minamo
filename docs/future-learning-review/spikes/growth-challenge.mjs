/** Read-only research diagnostic: current organiser filters loaded pages, not the complete corpus. */
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
const checkout=resolve(process.argv[2]??'.');
const require=createRequire(join(checkout,'package.json'));
const wr=createRequire(require.resolve('wrangler/package.json'));
const source="export {workRows} from './lib/personal-work-organiser.ts';";
const bundle=await wr('esbuild').build({stdin:{contents:source,resolveDir:checkout},bundle:true,format:'cjs',platform:'node',write:false});
const dir=mkdtempSync(join(tmpdir(),'pr27-growth-'));
try{
 const path=join(dir,'growth.cjs');writeFileSync(path,bundle.outputFiles[0].text);
 const {workRows}=require(path);
 const target={family:'article',id:'TEST-ONLY-reference'};
 const records=Array.from({length:100},(_,i)=>({id:'TEST-ONLY-note-'+String(i+1).padStart(3,'0'),family:'note',title:'Synthetic thought '+(i+1),body:'Original synthetic personal writing.',links:i===99?[target]:[],rev:1,createdAt:'2026-10-23T00:00:00Z',updatedAt:'2026-10-23T00:00:00Z',trashedAt:null,actor:'user',synthetic:true}));
 const options={tab:'note',context:target};
 const loaded=workRows(records.slice(0,30),options),complete=workRows(records,options);
 const result={kind:'synthetic-local-pure-function-only',corpus:100,loadedPage:30,linkedMatchesInLoadedPage:loaded.length,linkedMatchesInWholeFixture:complete.length,conclusion:'Current workRows context filtering sees only supplied/loaded rows. The current organiser HTTP requests do not send context/topic filters, so a matching older Note requires unrelated pages to be loaded first. This is not a hosted query or performance benchmark.'};
 if(loaded.length!==0||complete.length!==1)throw Error('Baseline changed: reassess current page-local filter behaviour.');
 console.log(JSON.stringify(result,null,2));
}finally{rmSync(dir,{recursive:true,force:true});}
