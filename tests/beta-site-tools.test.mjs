import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const bundle=await build({entryPoints:['lib/beta-site-tools.ts'],bundle:true,platform:'node',format:'esm',write:false});const {registerMinamoSiteTools}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
test('Site Tools use real current actions, validate runtime input, review rather than auto-save, abort lifecycle',async()=>{
 const entries=new Map(),calls=[],controller=new AbortController();
 const registry={registerTool(tool,{signal}){entries.set(tool.name,tool);signal.addEventListener('abort',()=>entries.delete(tool.name));}};
 await registerMinamoSiteTools(registry,controller.signal,async input=>{calls.push(input);return {record:'synthetic'};},async input=>{calls.push(input);return {saved:false};},async()=>({status:'awaiting_learner_confirmation',saved:false}));
 assert.equal(entries.size,5);assert.deepEqual(await entries.get('minamo_publish_learning_material').execute({}),{status:'awaiting_learner_confirmation',saved:false});assert.equal(calls.length,0);
 await entries.get('minamo_search_my_library').execute({query:'Bash'});assert.deepEqual(calls[0],{kind:'search',query:'Bash'});
 for(const input of [{query:'x',owner:'A'},{query:12},{query:''}])await assert.rejects(()=>entries.get('minamo_search_my_library').execute(input));
 await assert.rejects(()=>entries.get('minamo_read_my_record').execute({family:'note',id:'hidden'}));
 const old=entries.get('minamo_get_my_workspace');controller.abort();assert.equal(entries.size,0);await assert.rejects(()=>old.execute({}));
});
