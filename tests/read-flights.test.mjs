import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/read-flights.ts'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {createReadFlights}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('concurrent same-authority reads share only their pending request; settled values are not reused',async()=>{
 const reads=createReadFlights();let calls=0,resolve;const wait=new Promise(r=>resolve=r),read=()=>{calls++;return wait};
 const a=reads.run('owner:generation:selection:epoch',read),b=reads.run('owner:generation:selection:epoch',read);assert.equal(a,b);await Promise.resolve();assert.equal(calls,1);resolve('current eligible reading');assert.equal(await b,'current eligible reading');
 assert.equal(await reads.run('owner:generation:selection:epoch',async()=>{calls++;return 'new current admission'}),'new current admission');assert.equal(calls,2);
});
test('owner, generation, selection and permission invalidations never share a pending read; failed reads can retry',async()=>{
 const reads=createReadFlights();let calls=0;
 await Promise.all(['owner-a:g1:computing:p1','owner-b:g1:computing:p1','owner-a:g2:computing:p1','owner-a:g1:languages:p1','owner-a:g1:computing:p2'].map(key=>reads.run(key,async()=>++calls)));assert.equal(calls,5);
 await assert.rejects(reads.run('same',async()=>{throw Error('denied')}),/denied/);assert.equal(await reads.run('same',async()=>42),42);
});
