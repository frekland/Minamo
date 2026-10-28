import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const compiled=await build({entryPoints:['lib/layout-workspace.ts'],bundle:true,platform:'node',format:'esm',write:false});
const ui=await import('data:text/javascript;base64,'+Buffer.from(compiled.outputFiles[0].text).toString('base64'));
const linux={family:'investigation',id:'TEST-ONLY-linux',rendition:'r-linux-1'},rpg={family:'journey',id:'TEST-ONLY-rpg',stageId:'code-stage',rendition:'r-rpg-2'};
const reading={family:'article',id:'TEST-ONLY-tcp',rendition:'r-retained-1',sectionId:'deep',partId:'code'};
const anchor={section:'deep',part:'code',textOffset:43,offset:12.25,top:3456.75};

test('reading position storage remains owner and generation scoped',()=>{
 assert.notEqual(ui.layoutPositionKey('owner'),ui.layoutPositionKey('owner:generation:restored@1'));
});

test('task URL admission rejects malformed/unbounded selectors and round-trips exact valid identity',()=>{
 for(const task of [linux,rpg]){
  const params=new URLSearchParams('view=library&family=article&id=TEST-ONLY-tcp');ui.putTask(params,task);
  assert.deepEqual(ui.taskFromParams(params),task);assert.equal(params.get('id'),'TEST-ONLY-tcp');
  ui.putTask(params,null);assert.equal(ui.taskFromParams(params),null);assert.equal(params.get('id'),'TEST-ONLY-tcp');
 }
 for(const patch of [{taskId:'has space'},{taskId:'bad\u0000id'},{taskId:'x'.repeat(161)},{taskStage:'bad/stage'},{taskStage:'x'.repeat(161)},{taskRendition:'x'.repeat(241)},{taskRendition:'bad\nrevision'},{taskFamily:'note'}]){
  const params=new URLSearchParams({taskFamily:'journey',taskId:'TEST-ONLY-rpg',...patch});assert.equal(ui.taskFromParams(params),null,JSON.stringify(patch));
 }
});

test('semantic position storage preserves exact edition/stage while link destination remains Reader-owned',()=>{
 assert.equal(ui.readingPositionIdentity(reading),ui.readingPositionIdentity({...reading,sectionId:'other',partId:'__heading'}));
 assert.notEqual(ui.readingPositionIdentity(reading),ui.readingPositionIdentity({...reading,rendition:'r-current-2'}));
 assert.notEqual(ui.readingPositionIdentity(reading),ui.readingPositionIdentity({...reading,stageId:'another-stage'}));
 const key=ui.readingPositionIdentity(reading);assert.equal(ui.validResourceKey(key),true);
 const stored=ui.readingPositions([{resource:key,anchor:{...anchor,quote:'PRIVATE TEXT',source:'PRIVATE SOURCE',draft:'PRIVATE WRITING'},record:'PRIVATE RECORD'}]);
 assert.deepEqual(stored,[{resource:key,anchor}]);assert.equal(JSON.stringify(stored).includes('PRIVATE'),false);
 const heading={section:'__article',part:'__body-1',offset:-24.5,top:100};assert.deepEqual(ui.semanticReadingPosition(heading),heading);
});

test('corrupt or excessive session positions cannot create guessed edition/scroll targets',()=>{
 for(const invalid of [null,{},'345',[],{...anchor,offset:Infinity},{...anchor,top:-1},{...anchor,textOffset:1.5},{...anchor,textOffset:-1},{...anchor,textOffset:1e9},{...anchor,section:'bad/section'},{...anchor,part:'__body-1000'}])assert.equal(ui.semanticReadingPosition(invalid),null);
 for(const invalid of ['',JSON.stringify(['article','id']),JSON.stringify(['alien','id','r1','','','']),JSON.stringify(['article','bad id','r1','','','']),JSON.stringify(['article','id','r1','stage','s','bad/part'])])assert.equal(ui.validResourceKey(invalid),false);
 const key=ui.readingPositionIdentity(reading);assert.deepEqual(ui.readingPositions(Array.from({length:65},()=>({resource:key,anchor}))),[]);
 assert.deepEqual(ui.readingPositions([{resource:'bad',anchor},{resource:key,anchor},{resource:key,anchor:{...anchor,top:4000}}]),[{resource:key,anchor:{...anchor,top:4000}}]);
});

test('provisional current heads never enter presentation memory for requested retained editions',()=>{
 const current={...reading,rendition:'r-current-3'},retained={...reading};let state=ui.visitResource(ui.emptyLayoutSession(),'task',linux,linux);const before=structuredClone(state);
 for(const [record,requested,loading] of [[current,reading.rendition,true],[current,reading.rendition,false],[retained,reading.rendition,true],[null,reading.rendition,false]]){
  const admitted=ui.layoutReading(record,requested,loading);assert.equal(admitted,null);if(admitted)state=ui.visitResource(state,'focus',admitted,linux);
 }
 assert.deepEqual(state,before);const admitted=ui.layoutReading(retained,reading.rendition,false);assert.equal(admitted,retained);
 state=ui.visitResource(state,'focus',admitted,linux);assert.equal(state.resources.some(item=>item.rendition==='r-current-3'),false);
 assert.equal(ui.layoutReading(current,undefined,false),current);
});

test('explicit per-mode returns are exact-task qualified and switching does not mutate learning records',()=>{
 const original=Object.freeze({...reading}),task=Object.freeze({...linux});let state=ui.visitResource(ui.emptyLayoutSession(),'focus',original,task);
 assert.deepEqual(ui.rememberedResource(state,'focus'),reading);state=ui.visitResource(state,'task',{...reading,id:'TEST-ONLY-js'},rpg);
 assert.equal(ui.rememberedResource(state,'focus'),null);assert.deepEqual(state.task,rpg);assert.equal(state.resources.length,1);
 state=ui.visitResource(state,'classic',reading,{...rpg,rendition:'r-rpg-3'});assert.equal(ui.rememberedResource(state,'task'),null);
 assert.deepEqual(original,reading);assert.deepEqual(task,linux);assert.deepEqual(Object.keys(state).sort(),['last','resources','task']);
});

test('resource shelf deduplicates exact identity without silently evicting the oldest reference at its bound',()=>{
 let state=ui.emptyLayoutSession();for(let i=0;i<12;i++)state=ui.visitResource(state,'task',{...reading,id:'TEST-ONLY-'+i},linux);
 const before=structuredClone(state.resources);state=ui.visitResource(state,'focus',before[3],linux);assert.deepEqual(state.resources,before);
 state=ui.visitResource(state,'focus',{...reading,id:'TEST-ONLY-thirteenth'},linux);assert.deepEqual(state.resources,before);assert.equal(ui.rememberedResource(state,'focus').id,'TEST-ONLY-thirteenth');
});


test('a task absent from the bounded collection still replaces the prior project before its exact read completes',()=>{
 const params=new URLSearchParams('view=journeys&family=journey&id=TEST-ONLY-unloaded&stage=code-stage&rendition=r-exact-7');ui.putTask(params,linux);
 const selected=ui.primaryTaskFromParams(params,null);assert.deepEqual(selected,{family:'journey',id:'TEST-ONLY-unloaded',stageId:'code-stage',rendition:'r-exact-7'});
 const state=ui.visitResource(ui.visitResource(ui.emptyLayoutSession(),'focus',reading,linux),'task',{family:'journey',id:selected.id,rendition:selected.rendition,stageId:selected.stageId},selected);
 assert.deepEqual(state.task,selected);assert.equal(ui.rememberedResource(state,'focus'),null);assert.equal(state.resources.length,1);
 params.delete('rendition');const pending=ui.primaryTaskFromParams(params,null);assert.equal(pending.rendition,undefined);
 const resolved=ui.primaryTaskFromParams(params,{family:'journey',id:selected.id,rendition:'r-loaded-8'});assert.equal(resolved.rendition,'r-loaded-8');
 assert.equal(ui.primaryTaskFromParams(new URLSearchParams('family=article&id=TEST-ONLY-reference'),linux),null);
 assert.equal(ui.primaryTaskFromParams(new URLSearchParams('family=journey&id=bad/id')),null);
});

 test('context support requires an authored exact eligible relation and validates typed task stages',()=>{
 const task={family:'journey',id:'j',stageId:'s',rendition:'jr'};
 const record={family:'journey',id:'j',rendition:'jr',links:[{family:'article',id:'a',rendition:'ar',sourceContext:{stageId:'s'}}],learningShape:{kind:'journey',stages:[{id:'s'}]}};
 assert.equal(ui.validTaskRecord(task,record),true);assert.equal(ui.validTaskRecord({...task,stageId:'invented'},record),false);
 assert.equal(ui.validTaskRecord({...task,stageId:undefined},record),false);
 const reading={family:'article',id:'a',rendition:'ar',links:[]};assert.equal(ui.readingSupportsTask(task,record,reading),true);
 assert.equal(ui.readingSupportsTask({...task,stageId:'other'},record,reading),false);
 assert.equal(ui.readingSupportsTask(task,record,{...reading,rendition:'new'}),false);
 assert.equal(ui.readingSupportsTask(task,record,{...reading,id:'unrelated'}),false);
 assert.equal(ui.readingSupportsTask(task,{...record,trashedAt:'today'},reading),false);
 assert.equal(ui.readingSupportsTask(task,{...record,id:'wrong-task'},reading),false);
 });

test('bounded task lookup uses the exact current or fetched record and rejects a different edition',()=>{
 const record={family:'journey',id:rpg.id,rendition:rpg.rendition,rev:1,links:[],learningShape:{kind:'journey',stages:[{id:rpg.stageId}]}};
 assert.equal(ui.resolveTaskRecord(rpg,[],record),record);
 assert.equal(ui.resolveTaskRecord(rpg,[],null,record),record);
 assert.equal(ui.resolveTaskRecord(rpg,[{...record,rendition:'new'}],reading,record),record);
 assert.equal(ui.resolveTaskRecord(rpg,[{...record,rendition:'new'}],reading),null);
});

test('late task resolution keeps support outside the collection, verifies pending links and preserves deliberate pins',()=>{
 const record={family:'journey',id:rpg.id,rendition:rpg.rendition,rev:1,links:[{family:reading.family,id:reading.id}],learningShape:{kind:'journey',stages:[{id:rpg.stageId}]}},article={...reading,links:[]};
 const selected=ui.visitResource(ui.emptyLayoutSession(),'task',rpg,rpg);
 const pending=ui.reconcileReadingContext(selected,'task',reading,null,null,article);
 assert.deepEqual(pending.task,rpg,'loading the exact task does not discard its selected identity');
 const related=ui.reconcileReadingContext(pending,'task',reading,null,record,article);assert.deepEqual(related.task,rpg);
 const unrelated={...article,id:'TEST-ONLY-unrelated'};
 assert.equal(ui.reconcileReadingContext(pending,'task',unrelated,null,record,unrelated).task,null,'a resolved unrelated destination clears unpinned context');
 const pinned={...selected,pinned:true};
 const resolved=ui.reconcileReadingContext({...pinned,task:{...rpg,rendition:undefined}},'task',rpg,rpg,record,record);
 assert.equal(resolved.pinned,true,'first exact rendition resolution cannot undo the user pin');
 const another={family:'investigation',id:'another',rendition:'q1',links:[]};
 const switched=ui.reconcileReadingContext(pinned,'task',another,another,another,another);assert.equal(switched.task.id,'another');assert.equal(switched.pinned,false);
});

test('explicitly closed primary context survives URL readback until a fresh navigation',()=>{
 const params=new URLSearchParams('family=journey&id=TEST-ONLY-rpg&stage=code-stage&taskClosed=1');
 ui.putTask(params,rpg);assert.equal(ui.primaryTaskFromParams(params),null);assert.equal(ui.taskFromParams(params),null);
 params.delete('taskClosed');assert.equal(ui.primaryTaskFromParams(params).id,rpg.id);
});
