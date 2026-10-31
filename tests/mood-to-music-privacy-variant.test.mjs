import {test} from 'node:test';
import assert from 'node:assert/strict';
import {manifest,scenarioForPrefix} from './project-scenarios/mood-to-music/seed.mjs';
import {privacyVariant,privacyPrefix,replayPrivacy,applyPrivacyPhase} from './project-scenarios/mood-to-music/variants/privacy-reviser.mjs';
import {weekendPrefix,applyWeekendPhase} from './project-scenarios/mood-to-music/variants/weekend-prototyper.mjs';
const id=(prefix,leaf)=>prefix+'-'+leaf;

test('privacy-led variant is versioned and available only in the local opt-in namespace',()=>{
  assert.equal(privacyVariant.baseFixtureVersion,'mood-to-music/'+manifest.schemaVersion);
  assert.equal(privacyVariant.personaVariant,'privacy-led-interface-reviser');
  assert.deepEqual(privacyVariant.phases,['F','G','H','I','J','K']);
  assert.equal(privacyPrefix(1),'TEST-ONLY-m2m-privacy-v1-r1');
  assert.throws(()=>privacyPrefix(0),/Invalid privacy epoch/);
  assert.throws(()=>privacyPrefix(1.5),/Invalid privacy epoch/);
  assert.throws(()=>scenarioForPrefix('TEST-ONLY-m2m-privacy-v2-r1'),/Unrecognised/);
  assert.ok(scenarioForPrefix(privacyPrefix()).applyState);
});
test('F–K privacy history retains the incorrect inference, revisioned correction and a provenance boundary',async()=>{
  const {session,prefix,states,snapshot}=await replayPrivacy();
  try{
    assert.deepEqual(states,manifest.states.map(s=>s.id));
    assert.equal(snapshot.project.rev,5);
    assert.deepEqual(snapshot.notes.map(n=>n.rev),[3,1,1,1]);
    assert.equal(snapshot.question.rev,3);
    assert.equal(snapshot.annotation.rev,1);
    assert.equal(snapshot.generatedArticleSeeded,false);
    assert.equal((await session.client.context('note',id(prefix,'note-return-later'))).status,404);
    const original=(await session.client.context('note',id(prefix,'note-privacy-assumption'))).data.record;
    assert.match(original.body,/Preserve the false inference/);
    const q=(await session.client.context('investigation',id(prefix,'question-consent'))).data.record;
    assert.match(q.learningShape.question,/clear remembered labels/);
    const decision=(await session.client.context('journey',id(prefix,'project'))).data.record;
    assert.match(decision.body,/temporary by default/);
    const reference=(await session.client.context('article',id(prefix,'reference'))).data.record;
    const annotation=(await session.client.context('annotation',id(prefix,'annotation-privacy-rights'))).data.record;
    const part=reference.sections.find(s=>s.id==='rights').parts.find(p=>p.id==='p');
    assert.equal(part.text.slice(annotation.anchor.start,annotation.anchor.end),annotation.anchor.quote);
    assert.equal(annotation.anchor.rendition,reference.rendition);
    const rows=await session.fixture.db.prepare("SELECT revision,data FROM v2_revisions WHERE owner=? AND family='note' AND id=? ORDER BY revision")
      .bind(session.client.owner,original.id).all();
    assert.deepEqual(rows.results.map(x=>x.revision),[1,2,3]);
    assert.match(JSON.parse(rows.results[0].data).body,/NOT refreshed/);
    assert.match(JSON.parse(rows.results[1].data).body,/report a manual v5 refresh/);
    const count=await session.fixture.db.prepare("SELECT COUNT(*) AS n FROM v2_records WHERE owner=? AND family='note' AND id LIKE ?")
      .bind(session.client.owner,prefix+'-%').first();
    assert.equal(count.n,11,'seven shared Notes plus four later persona Notes');
    const checkpoints=await session.fixture.db.prepare('SELECT COUNT(*) AS n FROM v2_learning_developments WHERE owner=?')
      .bind(session.client.owner).first();
    assert.equal(checkpoints.n,4,'no GPT checkpoint is manufactured');
    const stale=await session.client.command({operationId:id(prefix,'stale-edit'),action:'update',family:'note',
      id:original.id,expectedRev:1,data:{body:'silently overwrite'}}); 
    assert.equal(stale.status,409);
    assert.equal((await session.fixture.client('TEST-ONLY-foreign').context('note',original.id)).status,404);
  }finally{await session.fixture.dispose();}
});
test('privacy checkpoints reproduce cleanly and never preload later Notes',async()=>{
  for(const [phase,rev,count] of [['F',1,1],['H',2,1],['K',3,4]]){
    const first=await replayPrivacy(phase);
    try{
      assert.equal(first.snapshot.notes[0].rev,rev);
      assert.equal(first.snapshot.notes.length,count);
      const again=await replayPrivacy(phase);
      try{assert.deepEqual(first.snapshot,again.snapshot);}
      finally{await again.session.fixture.dispose();}
    }finally{await first.session.fixture.dispose();}
  }
});
test('privacy and weekend variants coexist for one owner without mixed records',async()=>{
  const first=await replayPrivacy('K',{owner:'TEST-ONLY-m2m-privacy-weekend-owner'});
  try{
    const secondPrefix=weekendPrefix(),base=scenarioForPrefix(secondPrefix);
    for(const phase of manifest.states.map(x=>x.id))
      if(privacyVariant.phases.includes(phase))await applyWeekendPhase(first.session.client,phase,secondPrefix);
      else await base.applyState(first.session.client,phase);
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-privacy-assumption'))).data.record.rev,3);
    assert.equal((await first.session.client.context('note',id(secondPrefix,'note-weekend-log'))).data.record.rev,3);
    assert.equal((await first.session.client.context('note',id(secondPrefix,'note-privacy-assumption'))).status,404);
    assert.equal((await first.session.client.context('note',id(first.prefix,'note-weekend-log'))).status,404);
  }finally{await first.session.fixture.dispose();}
});
