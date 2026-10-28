import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`export * from './lib/learner-labels';export * from './lib/journey-goal-request';export * from './lib/layout-gpt-intents';export * from './lib/gpt-context';export * from './lib/project-return-context';export * from './lib/beta-site-tools';`,resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
test('learner nouns do not change canonical wire identities',()=>{
 assert.equal(api.learnerFamilyLabel('journey'),'Project');assert.equal(api.learnerFamilyLabel('investigation',{plural:true}),'Questions');assert.equal(api.learnerRoleLabel('journey'),'Project');
 assert.equal(api.learnerFamilyLabel('article',{lowercase:true}),'article');
 const question={family:'investigation',id:'TEST-ONLY-label-question',rendition:'edition-old'};
 const brief=api.buildTaskGptBrief({record:question,returnContext:{journeyId:'TEST-ONLY-parent-B',stageId:'exact-step-B'}});
 assert.deepEqual(brief.arguments.target,{kind:'investigation',investigationId:question.id});
 const url=new URL(brief.returnTo);assert.equal(url.searchParams.get('family'),'investigation');assert.equal(url.searchParams.get('rendition'),'edition-old');assert.equal(url.searchParams.get('returnJourney'),'TEST-ONLY-parent-B');assert.equal(url.searchParams.get('returnStage'),'exact-step-B');
 assert.equal(brief.arguments.returnContext,undefined,'navigation parent cannot alter checkpoint authority');
});
test('discussion preserves exact selected range and entry context independently',()=>{
 const record={family:'article',id:'TEST-ONLY-reference',rendition:'exact-edition'},selection={recordFamily:'article',articleId:record.id,rendition:record.rendition,sectionId:'second',partId:'p',start:2,end:5,quote:'abc'};
 const brief=api.buildGptContextBrief({record,selection,returnContext:{journeyId:'TEST-ONLY-parent-A',stageId:'stable-A'}});
 const url=new URL(brief.returnTo);for(const [key,value] of Object.entries({family:'article',id:record.id,rendition:record.rendition,section:'second',part:'p',start:'2',end:'5',returnJourney:'TEST-ONLY-parent-A',returnStage:'stable-A'}))assert.equal(url.searchParams.get(key),value);
 assert.equal(brief.arguments.learningTarget,undefined);assert.throws(()=>api.withProjectReturn('/?id=x',{journeyId:'invalid\nparent'}),/exact Project return/);
});
test('Project authoring asks for one coherent route and optional justified Questions, with explicit images only',()=>{
 const text=api.journeyGoalRequest('Build a small Python CLI');
 assert.match(text,/Create a Project/);assert.match(text,/meaningful ordered Steps/);assert.match(text,/Add linked Questions only where a separate inquiry is useful/);assert.match(text,/do not create one for every Step/);assert.match(text,/canonical journey, investigation and article role codes/);assert.match(text,/generate one only if I explicitly ask/);assert.match(text,/Never claim an image is attached without readback/);assert.match(text,/Do not invent execution or achievement or create a learning checkpoint/);
 assert.doesNotMatch(text,/embark|unlock your|your next adventure|explore the magic/i);assert.throws(()=>api.journeyGoalRequest('  '));
});
test('beta Site Tool descriptions use Projects while actual runtime enums and learner confirmation remain unchanged',async()=>{
 const entries=new Map(),controller=new AbortController(),calls=[];
 await api.registerMinamoSiteTools({registerTool(tool){entries.set(tool.name,tool);}},controller.signal,async input=>{calls.push(input);return {};},async input=>{calls.push(input);return {saved:false};},async()=>({status:'awaiting_learner_confirmation',saved:false}));
 const preview=entries.get('minamo_preview_learning_material');assert.match(preview.description,/Project or Question/);assert.deepEqual(preview.inputSchema.properties.role.enum,['article','journey','investigation']);
 await preview.execute({role:'journey',markdown:'# TEST ONLY route',learningSpace:'computing'});assert.equal(calls[0].role,'journey');
 const result=await entries.get('minamo_publish_learning_material').execute({});assert.equal(result.saved,false);assert.equal(result.status,'awaiting_learner_confirmation');
});
