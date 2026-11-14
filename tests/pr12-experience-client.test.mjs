import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
const compiled=await build({entryPoints:['lib/experience-client.ts'],bundle:true,platform:'node',format:'esm',write:false,define:{'import.meta.env.DEV':'false'}});
const {readExperiencePage,readExperienceSource}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
test('experience requests actual API paths with principal and generation headers; source is never substituted',async()=>{
 const oldFetch=globalThis.fetch,requests=[];let source={family:'journey',id:'j',rendition:'r-123',sections:[{id:'s',parts:[{id:'p',kind:'paragraph',text:'exact'}]}]};
 globalThis.fetch=async(url,init)=>{requests.push({url:String(url),headers:init.headers});return Response.json(String(url).startsWith('/api/query?')?{records:[source],nextCursor:'next'}:{record:source})};
 try{const scope='v2-'+'a'.repeat(64)+':generation:fixture@2',ref={family:'journey',id:'j',rendition:'r-123',sectionId:'s',partId:'p'};
 const page=await readExperiencePage(scope);assert.equal(page.records.length,1);assert.ok(requests[0].url.startsWith('/api/query?'));assert.equal(requests[0].headers.get('x-minamo-generation'),'fixture@2');assert.equal(requests[0].headers.get('X-Minamo-Workspace'),'a'.repeat(64));
 await readExperiencePage(scope,page.nextCursor);assert.equal(new URL(requests[1].url,'https://test').searchParams.get('cursor'),'next');
 assert.equal((await readExperienceSource(scope,ref)).rendition,ref.rendition);assert.ok(requests[2].url.startsWith('/api/context?'));assert.equal(new URL(requests[2].url,'https://test').searchParams.get('rendition'),'r-123');
 source={...source,rendition:'another'};await assert.rejects(()=>readExperienceSource(scope,ref),/exact source passage is unavailable/);
 globalThis.fetch=async()=>Response.json({error:'revoked'},{status:403});await assert.rejects(()=>readExperienceSource(scope,ref),/revoked/);
 }finally{globalThis.fetch=oldFetch}
});
