import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
async function load(path){const result=await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false,loader:{'.css':'empty'}});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}
const {personalWorkKindLabel,personalRunDescription,personalRunPreview}=await load('app/personal-work-organiser.tsx');
const {recoveryCountRows,recoveryOverviewRows,recoveryActivationProblem}=await load('app/recovery-panel.tsx');
const base={family:'run',id:'TEST-ONLY-attempt',title:'TEST ONLY retained response',body:'Generic durable envelope',rev:1,links:[],createdAt:'2026-10-26T12:00:00.000Z',updatedAt:'2026-10-26T12:00:00.000Z',synthetic:true,evidence:'illustrative'};
test('saved practice is identified as answers rather than tool execution',()=>{
 const record={...base,attempt:{practice:{responses:[{id:'r1',input:'Original'},{id:'r2',input:'Revised'}]},nextIntention:'Discuss the remaining uncertainty'}};
 assert.equal(personalWorkKindLabel(record),'Saved attempt');
 assert.equal(personalRunDescription(record),'Saved practice · 2 answer revisions');
 assert.equal(personalRunPreview(record),'Discuss the remaining uncertainty');
 assert.doesNotMatch(personalRunDescription(record),/Recorded tool|Illustrative result/);
});
test('code submissions, reflections and observed tool Runs keep distinct descriptions',()=>{
 assert.equal(personalRunDescription({...base,attempt:{submission:{}}}),'Saved code submission · supplied files');
 assert.match(personalRunDescription({...base,attempt:{prediction:'A hypothesis'}}),/supplied thinking/);
 assert.equal(personalRunPreview({...base,attempt:{prediction:'A hypothesis'}}),'A hypothesis');
 const tool={...base,engine:'python',evidence:'observed',output:'actual output'};
 assert.equal(personalWorkKindLabel(tool),'Run');assert.match(personalRunDescription(tool),/^python · Recorded tool output/);assert.equal(personalRunPreview(tool),'actual output');
});
test('recovery overview prioritises actual saved contents over classification metadata',()=>{
 const counts={v2_learning_scopes:73,v2_records:335,v2_revisions:824,v2_images:3,v2_media:2,v2_learning_developments:57,v2_catalogue_heads:83};
 assert.deepEqual(recoveryOverviewRows(counts),[{label:'saved records, including Trash',value:335},{label:'retained editions',value:824},{label:'image files',value:3},{label:'media and document files',value:2}]);
 assert.ok(recoveryCountRows(counts).some(row=>row.label==='learning-space classifications'&&row.value===73));
 assert.ok(recoveryCountRows(counts).every(row=>!row.label.startsWith('v2')));
 assert.deepEqual(recoveryOverviewRows({v2_records:-1,v2_media:NaN}),[]);
});
test('presentation grouping never relaxes restore completeness and confirmation gates',()=>{
 const stage={id:'staged',archiveId:'archive',state:'ready',baseGeneration:'legacy@0',counts:{v2_records:335},withheld:{sources:[],images:[],exportNarrowed:[]}};
 assert.match(recoveryActivationProblem(stage,'legacy@0',false),/Review/);
 assert.match(recoveryActivationProblem({...stage,counts:{}},'legacy@0',true),/contents/);
 assert.match(recoveryActivationProblem(stage,'next-generation',true),/changed/);
 assert.equal(recoveryActivationProblem(stage,'legacy@0',true),undefined);
});
