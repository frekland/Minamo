import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';export {activityAttemptExperience,ActivityReflectionForm} from './app/activity-studio';import ActivityStudio from './app/activity-studio';export const studioElement=props=>ActivityStudio(props);export {savedPracticeCardTitle,savedPracticeHref,SavedPracticeCard} from './app/activity-saved-practice';export {InterfaceWorkbench} from './app/interface-workbench';export function render(Component,props){return renderToStaticMarkup(React.createElement(Component,props));}`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'import.meta.env':'{"DEV":false}','process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'ux-activity-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const ui=require(file);rmSync(dir,{recursive:true,force:true});
const language={contract:'minamo.activity.v1',template:'language',authorship:'original-exercise',intent:'Original source-backed response.',blocks:[{id:'answer',kind:'practice',exercise:{version:1,id:'question-one',kind:'cloze',language:'ja',prompt:'Complete the original request.',accepted:['あけてください']}}]};
const baseForm={id:'test-form',draft:{prediction:'',reflection:'',terminal:'',nextIntention:'',selectedPath:''},ready:true,pending:false,saving:false,available:true,onChange:()=>{throw Error('SSR cannot edit');},onSave:()=>{throw Error('SSR cannot save');},onReceipt:()=>{throw Error('SSR cannot fetch');}};
test('language attempt UI separates saved question answers from optional exploration without terminal form clutter',()=>{
 assert.deepEqual(ui.activityAttemptExperience(language),{answers:true,language:true,hasSource:false});
 const html=ui.render(ui.ActivityReflectionForm,{...baseForm,language:true});
 assert.match(html,/Exploration and reflection/);assert.match(html,/Save exploration and reflection/);assert.match(html,/Reflection or question/);assert.match(html,/Save question answers on their questions/);
 assert.doesNotMatch(html,/Prediction|terminal output|Save explicit attempt|checkpoint|proficiency/);
});
test('existing language prediction/terminal drafts remain exact and visible in a deliberate retained-writing disclosure',()=>{
 const html=ui.render(ui.ActivityReflectionForm,{...baseForm,language:true,draft:{...baseForm.draft,prediction:'I predicted あ😀',terminal:'SUPPLIED <script>inert</script>\n',reflection:'A useful distinction',nextIntention:'Ask about register'},pending:true});
 assert.match(html,/Earlier prediction or supplied-output draft/);assert.match(html,/I predicted あ😀/);assert.match(html,/SUPPLIED &lt;script&gt;inert&lt;\/script&gt;/);assert.match(html,/A useful distinction/);assert.match(html,/Ask about register/);assert.match(html,/Retry saved request/);assert.match(html,/Check save status/);assert.doesNotMatch(html,/<script/);
 assert.equal((html.match(/I predicted あ😀/g)||[]).length,1);
});
test('Computing source work retains prediction, supplied terminal capture and explicit evidence save',()=>{
 const computing={...language,template:'debugging',blocks:[{id:'source',kind:'source-browser',bundle:{}}]};assert.deepEqual(ui.activityAttemptExperience(computing),{answers:false,language:false,hasSource:true});
 const html=ui.render(ui.ActivityReflectionForm,{...baseForm,language:false});assert.match(html,/Prediction/);assert.match(html,/Add supplied terminal output/);assert.match(html,/Save explicit attempt/);assert.doesNotMatch(html,/Save exploration and reflection/);
});
function attemptRecord(edition='activity-edition-one'){return {family:'run',id:'test-attempt',rev:2,rendition:'run-edition-two',title:'Private answer title',attempt:{contract:'minamo.attempt.v1',activity:{family:'experiment',id:'test-activity',rendition:edition},state:'submitted',hintsRevealed:[],evidence:[],practice:{version:1,responses:[{id:'answer-one',itemId:'question-one',revision:1,input:'exact original input'}],feedback:[],corrections:[],reviewEvents:[],interactions:[]}}};}
test('saved-answer cards name the actual source question and preserve exact run/Activity editions',()=>{
 const record=attemptRecord();assert.equal(ui.savedPracticeCardTitle(record,language),'Complete the original request.');
 const html=ui.render(ui.SavedPracticeCard,{item:{record,pendingReviewCount:1,dueReviewCount:0},activity:language,edition:'activity-edition-two'});
 assert.match(html,/Earlier Activity edition · exact source retained/);assert.match(html,/Saved answers from an earlier edition/);assert.match(html,/1 saved answer revision/);assert.match(html,/1 answer is awaiting selected feedback/);assert.doesNotMatch(html,/Complete the original request/,'A retained answer must not inherit a current-edition prompt with a reused item ID.');
 assert.match(html,/rendition=run-edition-two/);assert.match(html,/rendition=activity-edition-one/);assert.doesNotMatch(html,/rendition=activity-edition-two|completed|mastery|Private answer title|exact original input/);
});
test('pending/optional-review wording reports declared counts without turning an answer into learning achievement',()=>{
 const html=ui.render(ui.SavedPracticeCard,{item:{record:attemptRecord(),pendingReviewCount:0,dueReviewCount:2},activity:language,edition:'activity-edition-one'});assert.match(html,/2 optional correction reviews are due/);assert.match(html,/This Activity edition/);assert.match(html,/Complete the original request/);assert.doesNotMatch(html,/awaiting selected feedback|mastery|success|passed/);
});
test('a practice evidence tab is named Saved answers while its durable presentation pane remains evidence',()=>{
 const html=ui.render(ui.InterfaceWorkbench,{activity:language,eligible:true,blocks:{answer:'Exact source-backed question'},evidence:'Saved answer index',evidenceLabel:'Saved answers',allowContextAside:false});
 assert.match(html,/>Saved answers<\/button>/);assert.match(html,/data-if-pane="evidence"/);assert.doesNotMatch(html,/>Your attempt<\/button>/);
});


test('switching saved Attempts or generation remounts answer authority while revisions retain the same draft owner',()=>{
 const attempt={contract:'minamo.attempt.v1',activity:{family:'experiment',id:'source',rendition:'source-edition'},state:'submitted',hintsRevealed:[],evidence:[]};
 const a={family:'run',id:'attempt-a',rev:10,title:'A',attempt},b={...a,id:'attempt-b',rev:1,title:'B'};
 const callback=()=>{};const first=ui.studioElement({record:a,scope:'owner:legacy@0',onRecordChange:callback}),second=ui.studioElement({record:b,scope:'owner:legacy@0',onRecordChange:callback}),revision=ui.studioElement({record:{...a,rev:11},scope:'owner:legacy@0'}),generation=ui.studioElement({record:a,scope:'owner:restored@1'});
 assert.notEqual(first.key,null,'stateful saved-answer authority must have an identity boundary');
 assert.notEqual(first.key,second.key,'a lower-revision different Attempt must never inherit prior answers or save target');
 assert.notEqual(first.key,generation.key,'restored owner generation must not inherit prior pending saves');
 assert.equal(first.key,revision.key,'same-Attempt updates retain their unfinished revision draft');
 assert.equal(second.props.record.id,'attempt-b');assert.equal(second.props.onRecordChange,callback);
 const tree=first.type(first.props),children=[];const walk=node=>{if(!node||typeof node!=='object')return;if(node.props?.record===a&&node.type?.name==='PracticeAttemptSummary')children.push(node);for(const child of Array.isArray(node.props?.children)?node.props.children:[node.props?.children])if(Array.isArray(child))child.forEach(walk);else walk(child);};walk(tree);
 assert.equal(children.length,1);assert.equal(children[0].props.onRecordChange,callback,'committed/reconciled answer changes must reach Workspace authority');
});
