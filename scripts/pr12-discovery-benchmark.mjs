import {createRequire} from 'node:module';
import {performance} from 'node:perf_hooks';
import {writeFileSync} from 'node:fs';
import {corpusRecords} from '../tests/pr12-corpus-fixture.mjs';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const built=await build({entryPoints:['lib/experience-discovery.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {experienceEntries,findExperienceEntries}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const base=experienceEntries(corpusRecords());
const tokenize=text=>[...new Set((text.toLowerCase().match(/[a-z]+|[\u3040-\u30ff\u3400-\u9fff]{2}/gu)??[]))];
const rows=[];
for(const size of [100,1000,10000,50000]){
 // Deterministic repetitions preserve rich source refs but have separate fixture keys.
 // Repetition is a worst-case ranking test, never a claim of new learner attempts.
 const entries=Array.from({length:size},(_,i)=>({...base[i%base.length],key:'TEST-ONLY-growth-'+i,text:base[i%base.length].text+(i%31===0?' Python network observation':'')}));
 const start=performance.now(),index=new Map();
 for(let i=0;i<entries.length;i++)for(const term of tokenize(entries[i].heading+' '+entries[i].sourceTitle+' '+entries[i].text)){let list=index.get(term);if(!list)index.set(term,list=[]);list.push(i)}
 const buildMs=performance.now()-start;
 const scan=performance.now(),baseline=findExperienceEntries(entries,'coffee').slice(0,12),scanMs=performance.now()-scan;
 const lookup=performance.now(),candidates=(index.get('coffee')??[]).slice(0,12).map(i=>entries[i]),lookupMs=performance.now()-lookup;
 if(JSON.stringify(baseline.map(e=>e.key))!==JSON.stringify(candidates.map(e=>e.key)))throw Error('Candidate fidelity mismatch');
 const revoked=new Set([candidates[0]?.ref.id]);const eligible=candidates.filter(e=>!revoked.has(e.ref.id));
 rows.push({size,buildMs,scanMs,lookupMs,terms:index.size,postingCount:[...index.values()].reduce((n,a)=>n+a.length,0),returned:candidates.length,returnedTextBytes:Buffer.byteLength(JSON.stringify(candidates)).valueOf(),withheldAfterSourceRevocation:candidates.length-eligible.length});
}
const report={version:1,source:'Versioned PR12 corpus',method:'Deterministic repeated rich-item growth, lexical postings prototype vs current in-browser literal scan. Candidate output bounded to 12. CPU timings are single-run engineering samples, not production latency. Rights resolved separately; index is never authority.',limitations:['In-memory postings prototype only; no live index deployed.','English token + Japanese paired-character tokenization needs overlap and recall work before production.','These repetitions test cost and compatibility, not improved semantic relevance or a faithful two-year event history.','Shifting relevance, real revisions, independent capture and saved arrangements need additional scenarios.'],rows};
writeFileSync('docs/rfcs/PR12-DISCOVERY-BENCHMARK.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(rows,null,2));
