import test from 'node:test';
import assert from 'node:assert/strict';
import {repairProjectEmphasis} from '../lib/project-presentation.ts';
import {privateStorageFixture} from './private-storage-fixture.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export {projectReadingTopics} from './lib/project-reading-topics';export {validateComposition} from './lib/project-composition';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {projectReadingTopics,validateComposition}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const sections=[{id:'source',title:'Long topic',parts:[{id:'message',kind:'paragraph',text:'Canonical message'},{id:'meaning',kind:'paragraph',text:'Translation'},{id:'exercise',kind:'paragraph',text:'Practice'}]}];
const composition={version:1,sections:[{id:'read',title:'Read',pattern:'notebook',slots:[{id:'main',role:'primary',blockIds:['block']}]}],blocks:[{id:'block',sectionId:'source'}],favourites:['block']};
const organised=()=>({...structuredClone(composition),blocks:[{id:'block',sectionId:'source',readingPages:[{id:'exchange',title:'Message and meaning',purpose:'source',partIds:['message','meaning']},{id:'practice',title:'Try the exchange',purpose:'practice',partIds:['exercise']}]}]});
test('named destinations preserve every part and reject omissions, duplicates and unknown parts',()=>{
 const c=organised();validateComposition(c,{sections});assert.deepEqual(projectReadingTopics(c,sections).map(t=>t.title),['Message and meaning','Try the exchange']);
 for(const ids of [['message'],['message','meaning','meaning'],['message','meaning','unknown']]){const bad=organised();bad.blocks[0].readingPages[0].partIds=ids;assert.throws(()=>validateComposition(bad,{sections}),/every canonical part/);}
});
test('global MCP organisation is owner scoped, revisioned, replayable, non-destructive and previewable',async()=>{
 const f=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
 try{
 const owner=f.client('structure-owner'),other=f.client('structure-other'),id='messy';
 assert.equal((await owner.command({action:'create',family:'journey',id,data:{title:'Messy',body:'Original',sections,projectComposition:composition}})).status,200);
 const invoke=(client,args)=>client.request('/mcp',{jsonrpc:'2.0',id:'structure',method:'tools/call',params:{name:'edit_project_globally',arguments:{purpose:'Reorganise this existing Project as requested by its owner',...args}}});
 const args={projectId:id,operationId:'global-organisation',expectedGeneration:owner.generation,expectedProjectRev:1,composition:organised(),explicitOverrideIds:['block'],mode:'preview'};
 const protectedEdit=await invoke(owner,{...args,explicitOverrideIds:undefined});assert.ok(protectedEdit.data.result?.isError);
 const preview=await invoke(owner,args);assert.equal(preview.data.result?.structuredContent?.valid,true,JSON.stringify(preview.data));
 const denied=await invoke(other,args);assert.ok(denied.data.result?.isError||denied.data.error,JSON.stringify(denied.data));
 const saved=await invoke(owner,{...args,mode:'apply'});assert.equal(saved.data.result?.structuredContent?.status,'committed',JSON.stringify(saved.data));
 const replay=await invoke(owner,{...args,mode:'apply'});assert.equal(replay.data.result?.structuredContent?.replayed,true,JSON.stringify(replay.data));
 const read=await owner.request('/api/projects/composition?projectId='+id);assert.equal(read.data.revision,2);assert.deepEqual(read.data.record.sections,sections);assert.deepEqual(read.data.composition.favourites,['block']);assert.equal(read.data.presentation.topics[1].title,'Try the exchange');
 const revised=await invoke(owner,{...args,expectedProjectRev:2,operationId:'repair-prose',mode:'apply',repairMarkdownEmphasis:true,contentSections:[{...sections[0],parts:[{...sections[0].parts[0],text:'**Canonical message**'},...sections[0].parts.slice(1)]}]});assert.equal(revised.data.result?.structuredContent?.status,'committed',JSON.stringify(revised.data));
 const current=await owner.request('/api/projects/composition?projectId='+id);assert.equal(current.data.record.sections[0].parts[0].text,'Canonical message');assert.deepEqual(current.data.record.sections[0].parts[0].inline,[{start:0,end:17,kind:'strong'}]);
 const old=await owner.request('/api/projects/composition?projectId='+id+'&revision=1');assert.deepEqual(old.data.record.sections,sections);
 const stale=await invoke(owner,{...args,mode:'apply',operationId:'stale'});assert.ok(stale.data.result?.isError||stale.data.error);
 const missing=organised();missing.blocks=[];missing.sections[0].slots[0].blockIds=[];
 const removed=await invoke(owner,{...args,composition:missing,expectedProjectRev:3,mode:'apply',operationId:'remove'});assert.ok(removed.data.result?.isError||removed.data.error);
 const prefs=await owner.request('/api/collaboration-preferences',{intent:'explicit-owner-preferences',scope:'global',expectedGeneration:owner.generation,expectedRevision:0,operationId:'readonly',values:{contextDepth:'detailed',relatedMaterial:'saved',initiative:'requested',authoringDetail:'balanced',projectEditing:'direct',mcpTools:'read-only'}});assert.equal(prefs.status,200);
 const readonly=await invoke(owner,{...args,expectedProjectRev:3,operationId:'readonly-edit',mode:'apply'});assert.equal(readonly.data.result?.structuredContent?.code,'mcp_read_only');
 const readonlyPreview=await invoke(owner,{...args,expectedProjectRev:3,operationId:'readonly-preview'});assert.equal(readonlyPreview.data.result?.structuredContent?.valid,true);
 }finally{await f.dispose();}
});

test('explicit formatting repair creates native spans without changing code or pre-existing semantics',()=>{
 const input=[{id:'a',title:'Text',parts:[{id:'p',kind:'paragraph',text:'A **日本語** example.'},{id:'code',kind:'code',text:'**literal**'},{id:'styled',kind:'paragraph',text:'**exact**',inline:[{start:0,end:9,kind:'code'}]}]}];
 const repaired=repairProjectEmphasis(input);assert.equal(repaired[0].parts[0].text,'A 日本語 example.');assert.deepEqual(repaired[0].parts[0].inline,[{start:2,end:5,kind:'strong'}]);assert.deepEqual(repaired[0].parts.slice(1),input[0].parts.slice(1));assert.equal(input[0].parts[0].text,'A **日本語** example.');assert.deepEqual(repairProjectEmphasis(repaired),repaired);
});
