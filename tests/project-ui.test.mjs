import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup}from'react-dom/server';export {mergeProjectOutline,mergeProjectResources}from'./app/project-context-client';export{contextualProjectHref,openProjectDestination}from'./app/project-navigation';export{projectContinueChoice,projectContinuationContext,ProjectQuestionLinks,ProjectIntroductionReading,ContextualLearningLinks}from'./app/journey-route';export{ProjectMapOutline,ProjectMapDialog,ProjectResourcesSheet,projectResourceOrigins}from'./app/project-overlays';export{projectMapGeometry,default as ProjectMapCanvas}from'./app/project-map-canvas';import JourneyRoute from './app/journey-route';export{JourneyRoute};export const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'project-ui-')),entry=join(dir,'ui.cjs');writeFileSync(entry,built.outputFiles[0].text);const ui=require(entry);rmSync(dir,{recursive:true,force:true});
const provenance={direction:'outgoing',sourceFamily:'journey',sourceId:'project',stageId:'stable-one'},reverse={direction:'incoming',sourceFamily:'investigation',sourceId:'question',sectionId:'source-one'};
const question={family:'investigation',id:'question',title:'Why does the output change?',rev:1,rendition:'question-edition',destination:'/?view=investigations&family=investigation&id=question&rendition=question-edition',provenance:[provenance]};
const project={family:'journey',id:'project',rev:2,title:'Synthetic project',rendition:'project-edition',destination:'/?view=journeys&family=journey&id=project&rendition=project-edition'};
const step={stageId:'stable-one',sectionId:'source-one',title:'Read and inspect',optional:false,structured:true,destination:project.destination+'&stage=stable-one',questions:[question]};
const outline={version:1,generation:'legacy@0',project,steps:[step],projectQuestions:[],relationshipCoverage:{complete:false,nextCursor:'next'}};
const record={...project,body:'An exact authored purpose.',links:[],sections:[{id:'source-one',title:'Read and inspect',parts:[{id:'paragraph',kind:'paragraph',text:'Original reading.'}]}],learningShape:{version:1,kind:'journey',stages:[{id:'stable-one',sectionId:'source-one',title:'Read and inspect'}]},createdAt:'2026-10-27T10:00:00Z',updatedAt:'2026-10-27T11:00:00Z',actor:'gpt',trashedAt:null};
const resource={family:'article',id:'reference',title:'Input streams',rev:3,rendition:'reference-edition',sectionId:'streams',partId:'stdout',destination:'/?view=library&family=article&id=reference&rendition=reference-edition&section=streams&part=stdout',description:'Exact canonical excerpt.',provenance:[provenance]};
test('paged outline and resources preserve all exact relationship provenance without duplicate records',()=>{
 const next={...outline,steps:[{...step,questions:[{...question,provenance:[reverse]}]}],relationshipCoverage:{complete:true}};
 const merged=ui.mergeProjectOutline(outline,next);assert.equal(merged.steps[0].questions.length,1);assert.deepEqual(merged.steps[0].questions[0].provenance,[provenance,reverse]);assert.equal(merged.relationshipCoverage.complete,true);
 const first={version:1,generation:'legacy@0',project,resources:[resource],relationshipCoverage:{complete:false,nextCursor:'next'}},last={...first,resources:[{...resource,provenance:[reverse]}],relationshipCoverage:{complete:true}};
 assert.deepEqual(ui.mergeProjectResources(first,last).resources[0].provenance,[provenance,reverse]);
 assert.throws(()=>ui.mergeProjectOutline(outline,{...next,generation:'restore@1'}),/changed/);assert.throws(()=>ui.mergeProjectResources(first,{...last,project:{...project,rev:4}}),/changed/);
});
test('saved work outranks local reading memory and editorial timestamps never imply progress',()=>{
 assert.equal(ui.projectContinueChoice(undefined,record).label,'Start first step');assert.equal(ui.projectContinueChoice(undefined,record,'stable-one',false),undefined,'Incomplete saved-work coverage must not fall back to a guessed start or device position');assert.equal(ui.projectContinueChoice(undefined,record,'removed-id').label,'Start first step');
 const recent={basis:'recent-note',destination:question.destination,title:question.title,label:'Continue',at:'2026-10-26T10:00:00Z'};
 assert.deepEqual(ui.projectContinueChoice(recent,record,'stable-one'),{destination:question.destination,title:question.title,label:'Continue',basis:'Recent Note'});
 const checkpoint={...recent,basis:'checkpoint'};assert.equal(ui.projectContinueChoice(checkpoint,record).basis,'Latest saved checkpoint');
 const remembered=ui.projectContinueChoice({basis:'start',destination:step.destination,title:step.title,label:'Start first step'},record,'stable-one');assert.equal(remembered.basis,'Last opened on this device');
 assert.equal(ui.projectContinueChoice(undefined,{...record,learningShape:{version:1,kind:'journey',stages:[]}}),undefined);
});
test('Project links retain exact edition/section/part and entry parent through UI and new tab paths',()=>{
 const href=ui.contextualProjectHref(resource.destination,'project','stable-one'),p=new URL(href,'https://minamo.invalid').searchParams;
 for(const [key,value]of Object.entries({rendition:'reference-edition',section:'streams',part:'stdout',returnJourney:'project',returnStage:'stable-one'}))assert.equal(p.get(key),value);
 let called;const event={button:0,preventDefault(){this.defaultPrevented=true;}};ui.openProjectDestination(event,href,(...args)=>{called=args;});assert.equal(event.defaultPrevented,true);assert.equal(called[2].returnStage,'stable-one');assert.equal(called[2].partId,'stdout');
 const newTab={button:0,ctrlKey:true,preventDefault(){throw Error('Native new tab must remain native');}};ui.openProjectDestination(newTab,href,()=>{throw Error('Must not route modified click');});
 const html=ui.render(ui.ProjectQuestionLinks,{questions:[question],projectId:'project',stageId:'stable-one'});assert.match(html,/Why does the output change/);assert.match(html,/returnJourney=project/);assert.match(html,/returnStage=stable-one/);assert.doesNotMatch(html,/completed|mastered|progress|Investigation/);
});
test('map uses one underlying multi-linked Question, honest edges, readable positions and equivalent outline destinations',()=>{
 const many={...outline,steps:Array.from({length:24},(_,i)=>({...step,stageId:'stable-'+i,sectionId:'source-'+i,title:'A deliberately long authored step title '.repeat(4)+i,destination:project.destination+'&stage=stable-'+i,questions:i<2?[question]:[]})),projectQuestions:[{...question,id:'whole-project',title:'Whole-project question',destination:question.destination.replace('id=question','id=whole-project')}],relationshipCoverage:{complete:true}};
 const geometry=ui.projectMapGeometry(many,[resource]);assert.equal(geometry.points.filter(point=>point.id==='question:question').length,1);assert.equal(geometry.edges.filter(edge=>edge.target==='question:question').length,2);assert.equal(geometry.edges.filter(edge=>edge.kind==='sequence').length,24);assert.ok(geometry.points.some(point=>point.kind==='resource'));
 const spine=geometry.points.filter(point=>point.kind==='step');for(let i=1;i<spine.length;i++)assert.ok(spine[i].y-spine[i-1].y>150);assert.ok(spine.every(point=>point.x===24));const deferred=ui.projectMapGeometry(outline,[{...resource,provenance:[{...provenance,questionId:'not-loaded'}]}]);assert.equal(deferred.omittedResources,1);assert.equal(deferred.edges.some(edge=>edge.kind==='resource'),false,'A missing question must never be replaced by a fabricated Project edge');
 const html=ui.render(ui.ProjectMapOutline,{outline:many,resources:[resource],onClose:()=>{}});assert.match(html,/Project map outline/);assert.match(html,/whole-project/);assert.match(html,/Open in Library/);assert.match(html,/section=streams/);assert.equal((html.match(/stable-23/g)||[]).length>0,true);
});
test('Project overview keeps map and resource payloads closed and does not claim saved progress before read',()=>{
 const html=ui.render(ui.JourneyRoute,{article:record,records:[record],draftScope:'synthetic-project-ui',onCommand:async()=>{throw Error('No SSR writes');},onStage:()=>{}});
 assert.match(html,/Checking saved work/);assert.match(html,/>Steps</);assert.match(html,/>Resources</);assert.match(html,/>Project map</);assert.doesNotMatch(html,/react-flow|Project resources|Journey recent thinking|<details|completed|mastered/);assert.match(html,/Original reading|Read and inspect/);
});

test('full Project introduction renders exact canonical body after overview excerpt and only genuine opening sections',()=>{
 const body='Authored purpose.\n\n'+'Complete original paragraph with 日本語 and 😀. '.repeat(20)+'END-OF-ORIGINAL-BODY';
 const introRecord={...record,body,sections:[{id:'intro',title:'Authored introduction',parts:[{id:'opening',kind:'paragraph',text:'INTRO-SECTION-ONCE'}]},...record.sections]};
 const before=JSON.stringify(introRecord),html=ui.render(ui.ProjectIntroductionReading,{article:introRecord,records:[introRecord],draftScope:'synthetic-intro',onCommand:async()=>{throw Error('No SSR writes');},visibleSectionId:'source-one'});
 assert.match(html,/END-OF-ORIGINAL-BODY/);assert.match(html,/data-reading-part="__body"/);assert.match(html,/data-section-id="__article"/);assert.match(html,/日本語/);assert.match(html,/😀/);assert.equal((html.match(/INTRO-SECTION-ONCE/g)||[]).length,1);assert.doesNotMatch(html,/Original reading\./);assert.equal(JSON.stringify(introRecord),before);
});
test('Question Library links carry entry Project and Step on their actual native href',()=>{
 const html=ui.render(ui.ContextualLearningLinks,{links:[{family:'article',id:'reference',rendition:'reference-edition',sectionId:'streams',partId:'stdout'}],records:[{...record,...resource}],onNavigate:()=>{},returnContext:{id:'entry-project',stageId:'entry-step'}});
 const href=html.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'),p=new URL(href,'https://minamo.invalid').searchParams;
 for(const [key,value]of Object.entries({id:'reference',rendition:'reference-edition',section:'streams',part:'stdout',returnJourney:'entry-project',returnStage:'entry-step'}))assert.equal(p.get(key),value);
});

test('Project overview GPT request uses the same exact Continue destination and navigation context',()=>{const selected=ui.projectContinuationContext(question.destination+'&returnStage=stable-one',record,question.title);assert.deepEqual(selected.learningTarget,{kind:'investigation',investigationId:'question'});assert.equal(selected.record.id,'question');assert.equal(selected.record.rendition,'question-edition');assert.deepEqual(selected.returnContext,{journeyId:'project',stageId:'stable-one'});const step=ui.projectContinuationContext(project.destination+'&stage=stable-one',record,'Read and inspect');assert.deepEqual(step.learningTarget,{kind:'journey-stage',journeyId:'project',stageId:'stable-one'});assert.equal(ui.projectContinuationContext('https://other.test/?family=journey&id=project',record,''),undefined);assert.equal(ui.projectContinuationContext('/?family=journey&id=other&stage=stable-one',record,''),undefined);});

test('partial map emptiness stays honest and filter groups have explicit accessible names',()=>{
 const empty={...outline,steps:[],projectQuestions:[]},html=ui.render(ui.ProjectMapOutline,{outline:empty,onClose:()=>{}});assert.match(html,/No steps or questions in the links loaded so far/);assert.doesNotMatch(html,/No steps or questions are linked/);
 const complete=ui.render(ui.ProjectMapOutline,{outline:{...empty,relationshipCoverage:{complete:true}},onClose:()=>{}});assert.match(complete,/No steps or questions are linked to this project/);
 const map=ui.render(ui.ProjectMapDialog,{outline,scope:'synthetic-a11y',onClose:()=>{}});assert.match(map,/role="group" aria-label="Map view"/);
 const resources=ui.render(ui.ProjectResourcesSheet,{outline,scope:'synthetic-a11y',stageId:'stable-one',onClose:()=>{}});assert.match(resources,/role="group" aria-label="Filter resources"/);
});

// React Flow disables pointer events on nonselectable nodes unless explicitly restored.
test('actual React Flow map keeps native reading anchors interactive without enabling node dragging',()=>{
 const html=ui.render(ui.ProjectMapCanvas,{outline,resources:[],onClose:()=>{},onNavigate:()=>{}});
 assert.match(html,/pointer-events:all/);
 assert.match(html,/class="project-map-node-link nodrag nopan"/);
 assert.match(html,/returnJourney=project/);
 assert.match(html,/returnStage=stable-one/);
 assert.match(html,/Why does the output change/);
});
