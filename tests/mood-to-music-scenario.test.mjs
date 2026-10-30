import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {seed,advance,replay,reset} from './project-scenarios/mood-to-music/replay.mjs';
import {manifest,id} from './project-scenarios/mood-to-music/seed.mjs';
const names=manifest.states.map(x=>x.id);
test('six-session acceptance describes cumulative cold/warm returns without pre-seeded GPT answers',()=>{
  const sessions=JSON.parse(readFileSync('tests/project-scenarios/mood-to-music/session-cases.json','utf8'));
  const cases=JSON.parse(readFileSync('tests/project-scenarios/mood-to-music/task-cases.json','utf8'));
  assert.equal(sessions.fixture,`mood-to-music/${manifest.schemaVersion}`);
  assert.deepEqual(sessions.orderedPhases,['F','G','H','I','J','K']);
  assert.deepEqual(sessions.sessions.map(item=>item.phase),sessions.orderedPhases);
  assert.equal(sessions.sessions.filter(item=>item.conversation==='cold').length,4);
  assert.equal(new Set(sessions.sessions.map(item=>item.id)).size,6);
  assert.ok(sessions.sessions.every(item=>item.simulatedUserPrompt.length>150&&item.checks.length>=4));
  assert.equal(cases.fixture,sessions.fixture);
  assert.equal(cases.cases.find(item=>item.id==='LIB-01').phase,'F');
  assert.equal(cases.cases.find(item=>item.id==='LIB-04').phase,'I');
  assert.equal(manifest.evaluation.generatedLibraryAnswerSeeded,false);
});
test('all seven React revision modules and shared source dependencies match the pinned scenario manifest',()=>{
  for(const {path,sha256} of manifest.artifacts){
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),sha256,path);
  }
  for(const [path,sha256] of Object.entries(manifest.supportFiles)){
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),sha256,path);
  }
});

test('longitudinal Mood-to-Music seeds, advances and reads actual isolated domain data',async()=>{
  const s=await seed();
  try{
    const snapshots=[];
    for(const state of names)snapshots.push(await advance(s,state));
    assert.deepEqual(snapshots.map(x=>x.state),names);
    assert.deepEqual(snapshots.map(item=>item.steps.length),[4,4,4,4,5,5,5,5,5,5,5]);
    assert.deepEqual(snapshots[4].steps,['intent','provider','code','personal-labels','return']);
    assert.equal(snapshots[0].project.rev,2);
    assert.equal(snapshots[4].project.rev,3,'An actual revision of the Project occurs at the pivot');
    assert.deepEqual(snapshots.map(item=>item.authoredScenarioDate),manifest.states.map(item=>item.date));
    assert.equal(snapshots[0].notes.length,0);
    assert.equal(snapshots[1].notes.length,1);
    assert.equal(snapshots[2].notes.length,3);
    assert.equal(snapshots[3].notes.length,5);
    assert.equal(snapshots[4].notes.length,7);
    assert.equal(snapshots[5].notes.length,9);
    assert.deepEqual(snapshots.slice(6).map(item=>item.notes.length),[11,13,15,17,19]);
    assert.deepEqual(snapshots.slice(6).map(item=>item.annotations.length),[3,5,6,8,9]);
    assert.ok(snapshots[10].annotations.filter(item=>/-annotation-[ghijk]-/.test(item.id))
      .every(item=>item.body.length<=100),'New User annotations are quick reminders; the accepted historical D annotation is unchanged');
    assert.equal(snapshots[4].questionIds.length,3,'Unrelated sibling does not leak into Project');
    assert.equal(snapshots[5].questionIds.length,4);
    assert.deepEqual(snapshots.map(x=>x.checkpointIds.length),[0,1,2,3,4,4,4,4,4,4,4],
      'Scripted User events never manufacture GPT conversation checkpoints');
    assert.deepEqual(snapshots[4].checkpointIds,manifest.stableIds.checkpoints.slice(0,4).sort());
    assert.equal(snapshots[5].project.rev,4);
    assert.equal(snapshots[5].requestedArticle,null,'The generated Library article must not be seeded');
    assert.equal(snapshots[10].requestedArticle,null,'No GPT-authored article is pre-seeded in later phases either');
    assert.equal((await s.client.context('note',id('note-plan'))).data.record.rev,2,'The User revises an older Note without overwriting its first edition');
    const v6=(await s.client.context('note',id('note-v6'))).data.record;
    const v7=(await s.client.context('note',id('note-v7'))).data.record;
    assert.match(v6.body,/v6.jsx/);
    assert.match(v7.body,/v7.jsx/);
    assert.match(v6.body,/PINNED SHA-256/);
    assert.match(v7.body,/not a historical Git commit/);
    const returnNote=await s.client.context('note',id('note-return'));
    assert.match(returnNote.data.record.body,/have NOT refreshed/);
    assert.match(returnNote.data.record.body,/not permission for GPT/);
    const terminal=await s.client.request('/mcp',{jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'read_minamo_record',arguments:{purpose:'TEST ONLY inspect supplied terminal evidence',family:'note',id:id('note-terminal'),terminalId:'build-snippet'}}});
    assert.equal(terminal.status,200);
    assert.match(JSON.stringify(terminal.data),/No timestamp, complete log/);
    const currentProject=await s.client.context('journey',id('project'));
    assert.match(currentProject.data.record.body,/Revised Project direction/);
    assert.equal(currentProject.data.record.learningShape.stages.length,5);
    const pivotNote=await s.client.context('note',id('note-pivot'));
    assert.match(pivotNote.data.record.body,/PINNED SHA-256:/);
    assert.match(pivotNote.data.record.body,/v5.jsx/);
    const formerCodeNote=await s.client.context('note',id('note-v1'));
    assert.match(formerCodeNote.data.record.body,/v1.jsx/);
    const resources=await s.client.request('/api/project-context?'+new URLSearchParams({projectId:id('project'),mode:'resources',learningSpace:'computing'}));
    assert.equal(resources.status,200);
    assert.ok(resources.data.resources.some(resource=>resource.id===id('reference')));
    const changed=await s.client.context('note',id('note-research'));
    assert.equal(changed.data.record.rev,2);
    const older=await s.client.request('/api/learning-context',{
      scope:'target',profile:'tutor',target:{kind:'journey-stage',journeyId:id('project'),stageId:'provider'},developmentId:id('save-b')
    });
    assert.equal(older.status,200,JSON.stringify(older.data));
    assert.equal(older.data.priorCheckpoints[0].noteEvidence[0].rev,1,'Checkpoint pins original evidence Note edition');
    const race=await s.client.request('/api/learning-context',{
      scope:'target',profile:'tutor',target:{kind:'investigation',investigationId:id('question-race')},activityLimit:20
    });
    assert.equal(race.status,200,JSON.stringify(race.data));
    assert.ok(race.data.activity.items.some(item=>item.family==='annotation'));
    assert.ok(race.data.activity.items.some(item=>item.family==='flag'));
    const unrelated=await s.client.context('investigation',id('unrelated-garden'));
    assert.equal(unrelated.status,200);
    const outsider=await s.fixture.client('TEST-ONLY-m2m-other-principal').context('journey',id('project'));
    assert.equal(outsider.status,404,'No cross-principal data leakage');
    const stale=await s.client.command({operationId:id('stale-note'),action:'update',family:'note',id:id('note-research'),expectedRev:1,data:{body:'Stale edit'}});
    assert.equal(stale.status,409,'Normal CAS rejects an outdated Note revision');
    const mcp=await s.client.request('/mcp',{jsonrpc:'2.0',id:1,method:'tools/call',
      params:{name:'get_minamo_learning_context',arguments:{purpose:'TEST ONLY inspect saved Project evidence',scope:'target',target:{kind:'journey-stage',journeyId:id('project'),stageId:'personal-labels'}}}});
    assert.equal(mcp.status,200,JSON.stringify(mcp.data));
    assert.notEqual(mcp.data.result?.isError,true,JSON.stringify(mcp.data));
    assert.match(JSON.stringify(mcp.data),/TEST-ONLY-m2m-save-e/);
  }finally{await s.fixture.dispose();}
});

test('fresh independent reconstruction and reset retain stable identities without database wipe',async()=>{
  const a=await replay('D');
  try{
    const b=await replay('D');
    try{assert.deepEqual(a.snapshot,b.snapshot);}
    finally{await b.session.fixture.dispose();}
    const resetRun=await reset(a.session,'A');
    try{
      assert.equal(resetRun.snapshot.notes.length,0);
      assert.equal((await resetRun.session.client.context('note',id('note-race'))).status,404);
      for(const state of ['B','C','D','E','F','G','H','I','J','K'])await advance(resetRun.session,state);
      assert.equal((await resetRun.session.client.context('note',id('note-race'))).status,200);
      assert.equal((await resetRun.session.client.context('note',id('note-return-later'))).status,200);
      assert.equal((await resetRun.session.client.context('article',id('requested-label-storage'))).status,404);
    }finally{await resetRun.session.fixture.dispose();}
  }catch(error){await a.session.fixture.dispose().catch(()=>{});throw error;}
});

test('a fully cleared synthetic test-user store recreates the same later User-only K history',async()=>{
  const first=await replay('K');
  const baseline=first.snapshot;
  const second=await reset(first.session,'K');
  try{
    assert.deepEqual(second.snapshot,baseline,'Full longitudinal User history must be reproducible after a complete test-data clear');
    assert.equal(second.snapshot.notes.length,19);
    assert.equal(second.snapshot.annotations.length,9);
    assert.equal(second.snapshot.requestedArticle,null,'Replaying User events never manufactures GPT-authored Library output');
  }finally{await second.session.fixture.dispose();}
});
