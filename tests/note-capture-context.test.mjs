import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({stdin:{contents:"export * from './lib/note-capture-context.ts';export {buildLinkedReadingLink} from './lib/reading-links.ts'",resolveDir:process.cwd()},bundle:true,format:'esm',platform:'node',write:false});
const {noteCaptureLinks,optionalActivityNoteConnections,buildLinkedReadingLink}=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
test('reading capture freezes exact reading without silently attaching a contextual or pinned task',()=>{
 const taskRecord={family:'journey',id:'queue',rendition:'r1',trashedAt:null,learningShape:{kind:'journey',stages:[{id:'retry',sectionId:'retry-section',title:'Retries'}]}};
 const task={family:'journey',id:'queue',stageId:'retry',rendition:'r1'},reading={family:'article',id:'shared-queues',rendition:'a-old',sectionId:'ack',partId:'code'};
 const links=noteCaptureLinks(reading,task,taskRecord);assert.equal(links.length,1);assert.equal(links[0].partId,'code');assert.match(buildLinkedReadingLink(links[0]),/rendition=a-old&section=ack&part=code/);
 task.stageId='admission';reading.rendition='a-new';assert.equal(links[0].rendition,'a-old');
 assert.equal(noteCaptureLinks(undefined,task,taskRecord).length,0);
});
test('reading the task itself avoids duplicate context and never fabricates a missing stage',()=>{
 const record={family:'investigation',id:'retry',rendition:'r',trashedAt:null};assert.equal(noteCaptureLinks({family:'investigation',id:'retry',rendition:'r'},{family:'investigation',id:'retry'},record).length,1);
 assert.equal(noteCaptureLinks(undefined,{family:'journey',id:'queue',stageId:'missing'},{family:'journey',id:'queue',rendition:'r',learningShape:{kind:'journey',stages:[]}}).length,0);
});
test('Activity origin offers exact source and Step as explicit, reversible Note choices only with authorised corroboration',()=>{
 const source={family:'article',id:'honorifics',rendition:'e1',trashedAt:null,title:'Honorifics'};
 const step={family:'journey',id:'n4',rendition:'j1',trashedAt:null,title:'Japanese N4',learningShape:{kind:'journey',stages:[{id:'s10',sectionId:'section-s10'}]}};
 const activity={family:'experiment',id:'reading',rendition:'a1',links:[{family:'article',id:'honorifics',relation:'source'},{family:'journey',id:'n4',relation:'application'}]};
 const origin={v:1,source:{family:'article',id:'honorifics',rendition:'e1',sectionId:'s1',partId:'p1',start:0,end:21},task:{family:'journey',id:'n4',rendition:'j1',stageId:'s10'}};
 const options=optionalActivityNoteConnections(activity,origin,[source,step]);
 assert.equal(options.length,2);assert.match(options[0].title,/originating Article/);assert.equal(options[0].link.rendition,'e1');assert.equal(options[0].link.partId,'p1');assert.equal(options[1].link.sectionId,'section-s10');
 assert.deepEqual(optionalActivityNoteConnections(activity,origin,[step]),[{title:'originating Project Step',link:options[1].link}]);
 assert.deepEqual(optionalActivityNoteConnections(activity,{...origin,source:{...origin.source,rendition:'e2'},task:{...origin.task,stageId:'nonexistent'}},[source,step]),[]);
 assert.deepEqual(optionalActivityNoteConnections({...activity,links:[]},origin,[source,step]),[]);
 assert.deepEqual(optionalActivityNoteConnections(activity,origin,[{...source,trashedAt:'2026-11-01'},step]).map(x=>x.title),['originating Project Step']);
 assert.deepEqual(optionalActivityNoteConnections(activity,undefined,[source,step]),[]);
});
