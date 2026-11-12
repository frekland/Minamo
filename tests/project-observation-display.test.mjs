import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({entryPoints:['lib/project-observation-display.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {isProjectObservationEvidencePart}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));

test('canvas result provenance is collapsible technical evidence, not a code contribution target',()=>{
 const id='observation-8e2779507fd34bb9b612ec7c5bb261be-inputs';
 assert.equal(isProjectObservationEvidencePart({id,kind:'code',language:'json'}),true);
 assert.equal(isProjectObservationEvidencePart({id,kind:'code',language:'python'}),false);
 assert.equal(isProjectObservationEvidencePart({id:'user-authored-json',kind:'code',language:'json'}),false);
 assert.equal(isProjectObservationEvidencePart({id:'observation-8e2779507fd34bb9b612ec7c5bb261be',kind:'callout'}),false);
 assert.equal(isProjectObservationEvidencePart({id:'observation-unsafe-inputs',kind:'code',language:'json'}),false);
});
