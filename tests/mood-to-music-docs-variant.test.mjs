import {test} from 'node:test';
import assert from 'node:assert/strict';
import {manifest,scenarioForPrefix} from './project-scenarios/mood-to-music/seed.mjs';
import {docsPrefix,docsVariant,replayDocumentation} from './project-scenarios/mood-to-music/variants/documentation-sceptic.mjs';
import {applyWeekendPhase,weekendPrefix} from './project-scenarios/mood-to-music/variants/weekend-prototyper.mjs';

const id=(prefix,leaf)=>`${prefix}-${leaf}`;
test('documentation sceptic source and local namespace remain versioned and fail closed',()=>{
  assert.equal(docsVariant.baseFixtureVersion,`mood-to-music/${manifest.schemaVersion}`);
  assert.equal(docsVariant.personaVariant,'provider-documentation-sceptic');
  assert.deepEqual(docsVariant.phases,['F','G','H','I','J','K']);
  assert.equal(docsPrefix(1),'TEST-ONLY-m2m-docs-v1-r1');
  assert.throws(()=>docsPrefix(-1),/Invalid documentation epoch/);
  assert.throws(()=>docsPrefix(1.3),/Invalid documentation epoch/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-docs-v2-r1'),/Unrecognised/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-docs-v1-r1-forged'),/Unrecognised/);
  assert.ok(scenarioForPrefix(docsPrefix()).applyState);
});

test('sceptical F–K trajectory preserves revisioned original assumptions and honest source rights',async()=>{
  const {session,prefix,states,snapshot}=await replayDocumentation('K');
  try{
    assert.deepEqual(states,manifest.states.map(s=>s.id));
    assert.equal(snapshot.project.rev,4,'a real later Project decision, no reset of A–E shape');
    assert.deepEqual(snapshot.notes.map(n=>n.rev),[3,1,1,1,1]);
    assert.equal(snapshot.question.rev,5,'provider Question is revised three times after shared B');
    assert.equal(snapshot.annotation.rev,1);
    assert.equal(snapshot.generatedArticleSeeded,false);
    assert.equal((await session.client.context('note',id(prefix,'note-return-later'))).status,404);
    assert.equal((await session.client.context('note',id(prefix,'note-weekend-log'))).status,404);
    const project=(await session.client.context('journey',id(prefix,'project'))).data.record;
    assert.deepEqual(project.learningShape.stages.map(stage=>stage.id),['intent','provider','code','personal-labels','return']);
    assert.match(project.body,/External playback, recommendations and saving remain contingent/);
    const audit=(await session.client.context('note',id(prefix,'note-docs-audit'))).data.record;
    assert.match(audit.body,/No dated documentation capture/);
    assert.doesNotMatch(audit.body,/verified live provider access/i);
    const boundary=(await session.client.context('note',id(prefix,'note-docs-boundary'))).data.record;
    const source=manifest.artifacts.find(item=>item.version==='v5');
    assert.ok(boundary.body.includes(source.path));
    assert.ok(boundary.body.includes(source.sha256));
    assert.match(boundary.body,/file existing does not prove my browser ran it/);
    const record=(await session.client.context('article',id(prefix,'reference'))).data.record;
    const annotation=(await session.client.context('annotation',id(prefix,'annotation-docs-rights'))).data.record;
    const part=record.sections.find(s=>s.id==='rights').parts.find(p=>p.id==='p');
    assert.equal(annotation.anchor.rendition,record.rendition);
    assert.equal(part.text.slice(annotation.anchor.start,annotation.anchor.end),annotation.anchor.quote);
    assert.equal(annotation.anchor.quote,'Source access');
    const question=(await session.client.context('investigation',id(prefix,'question-provider'))).data.record;
    assert.match(question.learningShape.question,/without exposing credentials/);
    const revisions=await session.fixture.db.prepare(`SELECT revision,data FROM v2_revisions WHERE owner=? AND family='note' AND id=? ORDER BY revision`)
      .bind(session.client.owner,id(prefix,'note-docs-audit')).all();
    assert.deepEqual(revisions.results.map(row=>row.revision),[1,2,3]);
    assert.match(JSON.parse(revisions.results[0].data).body,/initially assumed/);
    assert.match(JSON.parse(revisions.results[1].data).body,/confused a publicly described endpoint/);
    assert.match(JSON.parse(revisions.results[2].data).body,/nearly repeated my original claim/);
    const count=await session.fixture.db.prepare(`SELECT COUNT(*) AS n FROM v2_records WHERE owner=? AND family='note' AND id LIKE ?`)
      .bind(session.client.owner,prefix+'-%').first();
    assert.equal(count.n,12,'seven shared A–E Notes plus five distinct later Notes');
    const developments=await session.fixture.db.prepare('SELECT COUNT(*) AS n FROM v2_learning_developments WHERE owner=?')
      .bind(session.client.owner).first();
    assert.equal(developments.n,4,'no fictional GPT checkpoint added in F–K');
    const stale=await session.client.command({operationId:id(prefix,'stale-provider-edit'),action:'update',family:'note',
      id:audit.id,expectedRev:1,data:{body:'overwrite old assumption'}});
    assert.equal(stale.status,409);
    const foreign=await session.fixture.client('TEST-ONLY-m2m-foreign-principal').context('note',audit.id);
    assert.equal(foreign.status,404);
  }finally{await session.fixture.dispose();}
});

test('two different persona overlays coexist in one owner without leaked late events',async()=>{
  const first=await replayDocumentation('K',{owner:'TEST-ONLY-m2m-shared-matrix-principal'});
  try{
    const weekend=weekendPrefix();
    const base=scenarioForPrefix(weekend);
    for(const phase of manifest.states.map(s=>s.id)){
      if(['F','G','H','I','J','K'].includes(phase))await applyWeekendPhase(first.session.client,phase,weekend);
      else await base.applyState(first.session.client,phase);
    }
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-docs-audit'))).data.record.rev,3);
    assert.equal((await first.session.client.context('note',id(weekend,'note-weekend-log'))).data.record.rev,3);
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-weekend-log'))).status,404);
    assert.equal((await first.session.client.context('note',id(weekend,'note-docs-audit'))).status,404);
    assert.equal((await first.session.client.context('investigation',id(first.prefix,'question-provider'))).data.record.rev,5);
    assert.equal((await first.session.client.context('investigation',id(weekend,'question-provider'))).data.record.rev,2);
  }finally{await first.session.fixture.dispose();}
});

test('sceptic F/H/K checkpoints reconstruct in clean disposable runs without future Notes',async()=>{
  for(const [phase,revision,notes] of [['F',1,1],['H',2,2],['K',3,5]]){
    const first=await replayDocumentation(phase);
    try{
      assert.equal(first.snapshot.notes[0].rev,revision);
      assert.equal(first.snapshot.notes.length,notes);
      assert.equal(first.snapshot.generatedArticleSeeded,false);
      if(phase!=='K')assert.equal((await first.session.client.context('note',id(first.prefix,'note-docs-return'))).status,404);
      const again=await replayDocumentation(phase);
      try{assert.deepEqual(again.snapshot,first.snapshot);}
      finally{await again.session.fixture.dispose();}
    }finally{await first.session.fixture.dispose();}
  }
});
