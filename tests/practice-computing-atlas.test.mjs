import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const compiled=await wr('esbuild').build({stdin:{contents:'export * from "./lib/challenge-exchange/scratch.ts";export * from "./lib/challenge-exchange/generators.ts";export * from "./lib/challenge-exchange/practice-exemplars.ts";export * from "./lib/atlas/navigation.ts";export * from "./lib/atlas/project.ts";',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const temp=mkdtempSync(join(tmpdir(),'practice-computing-')),built=join(temp,'sdk.cjs');writeFileSync(built,compiled.outputFiles[0].text);const api=require(built);rmSync(temp,{recursive:true,force:true});
test('scratch exact starter identity, submitted hashes, path cardinality and modified tests remain distinct',async()=>{
 const {project}=await api.generateChallenge('counterexample-max'),starter=project.files.find(f=>f.role==='editable-starter'),test=project.files.find(f=>f.role==='visible-test');
 const submission=await api.makeScratchSubmission('starter',project,{[starter.path]:starter.text+'\n# local scratch repair\n',[test.path]:test.text+'\n# altered visible oracle\n'});
 const comparison=await api.compareScratchSubmission(submission,project);assert.equal(submission.execution,'not-executed-by-minamo');assert.equal(comparison.find(c=>c.path===test.path).changed,true);assert.equal(project.files.find(f=>f.path===starter.path).text,starter.text);
 await assert.rejects(api.compareScratchSubmission({...submission,starterDigest:'0'.repeat(64)},project),/starterDigest/);
 await assert.rejects(api.compareScratchSubmission({...submission,files:submission.files.slice(1)},project),/every exact starter/);
 await assert.rejects(api.compareScratchSubmission({...submission,files:submission.files.map((f,i)=>i?f:{...f,text:'forged bytes'})},project),/bytes do not match/);
 await assert.rejects(api.validateScratchSubmission(submission,{blocks:[{id:'wrong',kind:'source-browser',bundle:project}]}),/blockId/);
 await api.validateScratchSubmission(submission,{blocks:[{id:'starter',kind:'source-browser',bundle:project}]});
 assert.deepEqual(api.readScratchDraft(JSON.stringify({[starter.path]:'α\r\nA😀',unknown:'ignored'}),project),{[starter.path]:'α\r\nA😀'});
});
test('Atlas presentation URL preserves outer navigation, exact focus, lens, filter and bounded group expansion',()=>{
 const search=api.writeAtlasNavigation('?view=atlas&learningSpace=languages',{lens:'constellation',focus:{family:'journey',id:'requests-ja'},kind:'stage',relation:'authored-stage',expanded:['journey:requests-ja']});
 assert.match(search,/view=atlas/);assert.match(search,/learningSpace=languages/);assert.deepEqual(api.readAtlasNavigation(search),{lens:'constellation',focus:{family:'journey',id:'requests-ja'},kind:'stage',relation:'authored-stage',expanded:['journey:requests-ja']});
 const noFocus=api.readAtlasNavigation(api.writeAtlasNavigation(search,{focus:undefined,kind:'all',expanded:[]}));assert.equal(noFocus.focus,undefined);assert.equal(noFocus.kind,'all');assert.deepEqual(noFocus.expanded,[]);
 assert.deepEqual(api.readAtlasNavigation('?atlasFamily=hostile&atlasId=x&atlasLens=script&atlasExpanded=%3Cscript%3E'),{lens:'route',kind:'all',relation:'all',expanded:[]});
});
test('overview groups keep authored stages with their actual Journey; three original source-bound computing families validate',async()=>{
 const destination={family:'journey',id:'j'};const groups=api.atlasOverviewGroups([{kind:'stage',title:'First',destination},{kind:'journey',title:'Actual Journey',destination},{kind:'note',title:'Observation',destination:{family:'note',id:'n'}}]);assert.equal(groups[0].title,'Actual Journey');assert.equal(groups[0].nodes.length,2);assert.equal(groups[1].id,'kind:note');
 const examples=await api.computingPracticeExemplars();assert.equal(examples.length,3);for(const example of examples){assert.equal(example.activity.authorship,'original-exercise');const project=example.activity.blocks.find(b=>b.kind==='source-browser'),binding=example.activity.blocks.find(b=>b.id==='source-binding'),trace=example.activity.blocks.find(b=>b.id==='reasoning');for(const file of project.bundle.files)assert.ok(binding.text.includes(file.sha256));assert.equal(trace.artefact.provenance.classification,'illustrative');assert.ok(trace.artefact.payload.events.length>=4);}
});

test('Atlas correction projection preserves explicit status/revision and typed exact practice sources',()=>{
 const source={family:'article',id:'source',rendition:'source-r1',sectionId:'use',partId:'text'},record={family:'experiment',id:'practice',rev:1,rendition:'activity-r1',title:'Practice',body:'',links:[],synthetic:true,updatedAt:'2026-10-26T12:00:00.000Z',activity:{blocks:[{id:'p',kind:'practice',exercise:{source}}]}},links=api.atlasRecordLinks(record);assert.equal(links[0].id,'source');assert.equal(links[0].rendition,'source-r1');assert.match(links[0].reason,/Exact authored source/);
 const attempt={family:'run',id:'return',rev:3,rendition:'attempt-r3',title:'Saved answer',body:'',links:[],synthetic:true,updatedAt:'2026-10-26T12:00:00.000Z',attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:'practice',rendition:'activity-r1'},practice:{corrections:[{id:'c',revision:2,responseId:'r',responseRevision:1,original:'supplied answer',corrected:'revised answer',status:'disputed',modality:'production'}]}}};
 const graph=api.projectLearningGraph([attempt],[],'river'),correction=graph.nodes.find(n=>n.kind==='correction');assert.equal(correction.rev,2);assert.match(correction.evidence,/disputed/);assert.match(correction.href,/rendition=attempt-r3.*#correction-c/);assert.equal(graph.edges[0].relation,'retained-correction');assert.match(graph.edges[0].reason,/not current teaching authority/);
});
