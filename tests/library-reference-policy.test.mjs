import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'export * from "./lib/library-reference-policy.ts"; export {editorialFindings, editorialPolicy, EDITORIAL_POLICY_VERSION} from "./lib/editorial-policy.ts";',resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,platform:'node',format:'esm'});
const {libraryReferenceFindings,editorialFindings,editorialPolicy}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const article=(title,part={kind:'paragraph',text:'A worked example explains the input, output and mechanism.'})=>({family:'article',title:'TCP streams',sections:[{title,parts:[part]}]});
test('Library rejects task scaffolding in headings, callouts, prose and diagram prediction metadata',()=>{
 for(const record of [article('A compact exercise: predict, try, inspect, revise'),article('Optional practice questions'),article('Reference',{kind:'callout',callout:{label:'Investigate',tone:'question'},text:'Which mechanism explains the observed difference?'}),article('Reference',{kind:'paragraph',text:'Predict which state occurs before the client connects.'}),article('Reference',{kind:'paragraph',text:'Final self-check: explain what the client did.'}),article('Reference',{kind:'paragraph',text:'Reflection: which result surprised you?'}),article('Reference',{kind:'diagram',diagram:{presentation:{steps:[{prediction:{question:'What happens next?',answer:'An ACK is sent.'}}]}}})])assert.ok(libraryReferenceFindings(record).some(f=>f.code==='library_reference_only'));
});
test('Worked references, domain questions, source excerpts and user-initiated work retain their meaning',()=>{
 const records=[article('Why does a TCP stream need framing?'),article('Question forms in French',{kind:'paragraph',text:'Où est la gare ? asks where the station is; est is the third-person singular form of être.'}),article('Function syntax',{kind:'code',text:'print("Your turn: what happens next?")'}),article('Worked example',{kind:'paragraph',text:'Changing the port changes the selected endpoint. A refused connection means no listener accepted it.'}),article('Quotation',{kind:'paragraph',text:'Predict which value appears.',excerpt:{sourceId:'synthetic-source'}}),{...article('Exercise: inspect the stream'),family:'journey'},{...article('Investigate'),family:'investigation'}];
 for(const record of records)assert.deepEqual(libraryReferenceFindings(record),[],JSON.stringify(record));
});
test('Publication findings block explicit Library tasks and policy no longer recommends optional study prompts',()=>{
 const data={...article('Self-check'),learningShape:{kind:'library-topic',reusableBeyondProject:true}},r={key:'ref',family:'article',action:'create',data};
 const findings=editorialFindings([r],{coverage:{examined:[]},decisions:[{recordKey:'ref',role:'canonical-reference',action:'create-distinct',whyNotDuplicate:'A synthetic independent reference used to test role-specific publication.'}]});
 assert.ok(findings.some(f=>f.code==='library_reference_only'&&f.severity==='block'&&f.path==='records[0].data.sections[0].title'));
 assert.match(editorialPolicy.resourceCreation.independentStudy,/reference Articles only/);
 assert.match(editorialPolicy.resourceCreation.investigation,/only when requested by the owner/);
});
