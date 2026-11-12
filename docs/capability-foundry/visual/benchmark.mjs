import {createRequire} from 'node:module';
import {gzipSync} from 'node:zlib';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({entryPoints:['lib/foundry/visual.ts'],bundle:true,format:'esm',platform:'node',write:false});
const v=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const samples={};
for(const [name,fn] of Object.entries({glbDecode:()=>v.decodeGeometryGlb(v.makeTriangleGlb()),dijkstra:()=>v.graphTrace(v.VISUAL_GRAPH,'A'),life100:()=>{let g=v.initialLife();for(let i=0;i<100;i++)g=v.lifeStep(g);},physics10000:()=>{let b=[{x:0.2,y:0.1,vx:0.2,vy:0}];for(let i=0;i<10000;i++)b=v.bounceStep(b);},mandelbrot:()=>v.mandelbrot(96,64,48),sudoku:()=>v.sudokuTrace(v.VISUAL_SUDOKU)})){
 fn();const values=[];for(let i=0;i<10;i++){const start=performance.now();fn();values.push(performance.now()-start);}values.sort((a,b)=>a-b);samples[name]={medianMs:values[5],minMs:values[0],maxMs:values[9],iterations:10};
}
const bundled=await build({entryPoints:['app/foundry-visual.tsx'],bundle:true,format:'esm',platform:'browser',splitting:true,write:false,outdir:'measure',minify:true,external:['react','react/jsx-runtime']});
const files=['lib/foundry/visual.ts','lib/foundry/visual-three.ts','lib/foundry/visual-platform.ts','app/foundry-visual.tsx','tests/foundry-visual.test.mjs','tests/foundry-visual-platform.test.mjs'];
const report={date:'2026-10-25',environment:{runtime:process.version,platform:process.platform,arch:process.arch,browser:false,physicalDevice:false},source:files.map(path=>({path,bytes:readFileSync(path).length,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')})),dependency:{name:'three',version:JSON.parse(readFileSync('node_modules/three/package.json')).version,license:'MIT',licenseSha256:createHash('sha256').update(readFileSync('node_modules/three/LICENSE')).digest('hex')},standaloneEsbuild:{scope:'Prototype splitting measurement; not a deployed Minamo bundle or network transfer',chunks:bundled.outputFiles.map(f=>({path:f.path.split('/').at(-1),bytes:f.contents.length,gzipBytes:gzipSync(f.contents).length}))},nodeSyntheticTimings:samples,glbFixtureBytes:v.makeTriangleGlb().length,notMeasured:['actual browser latency and GPU memory','real owner authenticated storage','physical Android','screen reader speech','cold/warm network transfers']};
writeFileSync('docs/capability-foundry/visual/MEASUREMENTS.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
