import {test} from 'node:test';
import assert from 'node:assert/strict';
import {manifest,scenarioForPrefix} from './project-scenarios/mood-to-music/seed.mjs';
import {replayWeekend,weekendPrefix,weekendVariant} from './project-scenarios/mood-to-music/variants/weekend-prototyper.mjs';

const id=(prefix,leaf)=>`${prefix}-${leaf}`;
test('weekend overlay is explicitly versioned; unexpected local namespaces fail closed',()=>{
  assert.equal(weekendVariant.baseFixtureVersion,`mood-to-music/${manifest.schemaVersion}`);
  assert.equal(weekendVariant.personaVariant,'intermittent-weekend-prototyper');
  assert.deepEqual(weekendVariant.phases,['F','G','H','I','J','K']);
  assert.equal(weekendPrefix(1),'TEST-ONLY-m2m-weekend-v1-r1');
  assert.throws(()=>weekendPrefix(0),/Invalid weekend epoch/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-weekend-v2-r1'),/Unrecognised/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-weekend-v1-r1-foreign'),/Unrecognised/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-r1-foreign'),/Unrecognised/);
  assert.ok(scenarioForPrefix(weekendPrefix()).applyState);
});

test('weekend User history uses canonical D1 records, retained Note editions and honest evidence',async()=>{
  const {session,snapshot,prefix,states}=await replayWeekend('K');
  try{
    assert.deepEqual(states,manifest.states.map(s=>s.id));
    assert.equal(snapshot.project.rev,4,'shared E pivot plus a real F Question link');
    assert.equal(snapshot.notes.length,3,'sparse F–K overlay, not copied default 19-Note sequence');
    assert.deepEqual(snapshot.notes.map(n=>n.rev),[3,1,1]);
    assert.equal(snapshot.question.rev,2,'privacy-led rephrasing is an actual Question revision');
    assert.equal(snapshot.annotation.rev,1);
    assert.equal(snapshot.generatedArticleSeeded,false);
    assert.equal((await session.client.context('note',id(prefix,'note-return-later'))).status,404,
      'default late-event Notes must not appear in weekend history');
    assert.equal((await session.client.context('note',id(prefix,'note-weekend-v7'))).status,200);
    const log=(await session.client.context('note',id(prefix,'note-weekend-log'))).data.record;
    assert.match(log.body,/no independent v7 clear-and-reload result/);
    const v7=(await session.client.context('note',id(prefix,'note-weekend-v7'))).data.record;
    assert.match(v7.body,/PINNED SHA-256:/);
    assert.match(v7.body,/NOT run the complete/);
    const storage=(await session.client.context('investigation',id(prefix,'question-storage'))).data.record;
    assert.match(storage.learningShape.question,/temporary by default/);
    const source=(await session.client.context('article',id(prefix,'reference'))).data.record;
    const annotation=(await session.client.context('annotation',id(prefix,'annotation-weekend-refresh'))).data.record;
    assert.equal(annotation.anchor.rendition,source.rendition);
    assert.equal(annotation.anchor.quote,'A personal label');
    assert.equal(annotation.anchor.end-annotation.anchor.start,annotation.anchor.quote.length);

    const rows=await session.fixture.db.prepare(`SELECT revision,data FROM v2_revisions WHERE owner=? AND family='note' AND id=? ORDER BY revision`)
      .bind(session.client.owner,id(prefix,'note-weekend-log')).all();
    assert.deepEqual(rows.results.map(r=>r.revision),[1,2,3]);
    assert.match(JSON.parse(rows.results[0].data).body,/did NOT refresh/);
    assert.match(JSON.parse(rows.results[1].data).body,/saved no screenshot/);
    assert.match(JSON.parse(rows.results[2].data).body,/After another gap/);
    const counts=await session.fixture.db.prepare(`SELECT COUNT(*) AS n FROM v2_records WHERE owner=? AND family='note' AND id LIKE ?`)
      .bind(session.client.owner,prefix+'-%').first();
    assert.equal(counts.n,10,'A–E contains seven shared Notes; sparse variant F–K adds three');
    const developments=await session.fixture.db.prepare('SELECT COUNT(*) AS n FROM v2_learning_developments WHERE owner=?').bind(session.client.owner).first();
    assert.equal(developments.n,4,'no GPT checkpoint was fabricated by variant replay');
    const stale=await session.client.command({operationId:id(prefix,'stale-weekend-edit'),action:'update',family:'note',
      id:log.id,expectedRev:1,data:{body:'stale overwrite'}});
    assert.equal(stale.status,409,'revision-safe writes must reject an old edition');
    const other=await session.fixture.client('TEST-ONLY-m2m-other-principal').context('note',log.id);
    assert.equal(other.status,404,'another principal cannot read this variant');
  }finally{await session.fixture.dispose();}
});

test('different local runs reproduce the same snapshot; weekend is isolated from default V3 in one owner',async()=>{
  const first=await replayWeekend('K');
  try{
    const second=await replayWeekend('K');
    try{assert.deepEqual(first.snapshot,second.snapshot);}
    finally{await second.session.fixture.dispose();}

    const standard=scenarioForPrefix('TEST-ONLY-m2m-r1');
    for(const phase of manifest.states.map(s=>s.id))await standard.applyState(first.session.client,phase);
    const defaultProject=(await first.session.client.context('journey','TEST-ONLY-m2m-r1-project')).data.record;
    const weekendProject=(await first.session.client.context('journey',id(first.prefix,'project'))).data.record;
    assert.equal(defaultProject.rev,4,'default local A–K seed includes no GPT-created Project update');
    assert.equal(weekendProject.rev,4);
    assert.equal((await first.session.client.context('note','TEST-ONLY-m2m-r1-note-return-later')).status,200);
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-return-later'))).status,404);
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-weekend-log'))).data.record.rev,3);
  }finally{await first.session.fixture.dispose();}
});

test('weekend F/H/K checkpoints are reproducible without manufacturing later events',async()=>{
  for(const [phase,rev,notes] of [['F',1,1],['H',2,1],['K',3,3]]){
    const result=await replayWeekend(phase);
    try{
      assert.equal(result.snapshot.phase,phase);
      assert.equal(result.snapshot.notes[0].rev,rev);
      assert.equal(result.snapshot.notes.length,notes);
      assert.equal(result.snapshot.generatedArticleSeeded,false);
      if(phase!=='K')assert.equal((await result.session.client.context('note',id(result.prefix,'note-weekend-v7'))).status,404);
    }finally{await result.session.fixture.dispose();}
  }
});
