import {test} from 'node:test';
import assert from 'node:assert/strict';
import {listLocalCorpus,replayLocalCorpus} from './project-scenarios/corpus-registry.mjs';
import {retiredCap} from './project-scenarios/retired-htb-cap/subject.mjs';
import {plantScreamer} from './project-scenarios/automatic-plant-screamer/subject.mjs';
import {replayInto} from './project-scenarios/shared/subject-replay.mjs';

test('exact three-subject three-variant local corpus selection is explicit and fail-closed',async()=>{
  const cases=listLocalCorpus();
  assert.equal(cases.length,9);
  assert.deepEqual([...new Set(cases.map(x=>x.fixtureVersion))].sort(),
    ['automatic-plant-screamer/1','mood-to-music/3','retired-htb-cap/1']);
  assert.equal(cases.every(x=>x.evidence.includes('no hosted')),true);
  await assert.rejects(()=>replayLocalCorpus({fixtureVersion:'unknown',personaVariant:'privacy-led-interface-reviser'}),/Unregistered/);
  await assert.rejects(()=>replayLocalCorpus({fixtureVersion:'mood-to-music/3',personaVariant:'unregistered'}),/Unregistered/);
});
test('selected canonical snapshots preserve distinct source and revision histories',async()=>{
  for(const [fixtureVersion,personaVariant] of [
    ['mood-to-music/3','privacy-led-interface-reviser'],
    ['retired-htb-cap/1','command-log-investigator'],
    ['automatic-plant-screamer/1','careful-calibrator']
  ]){
    const run=await replayLocalCorpus({fixtureVersion,personaVariant,phase:'K'});
    try{
      assert.equal(run.snapshot.phase,'K');
      assert.ok(run.snapshot.project.rev>=4);
      assert.ok(run.snapshot.notes.length>=3);
      assert.equal(run.snapshot.generatedArticleSeeded??false,false);
    }finally{await run.session.fixture.dispose();}
  }
});
test('all three Project subjects coexist without cross-subject read leakage for one synthetic owner',async()=>{
  const owner='TEST-ONLY-three-by-three-shared-principal';
  const m=await replayLocalCorpus({fixtureVersion:'mood-to-music/3',personaVariant:'privacy-led-interface-reviser',owner});
  try{
    const h=await replayInto(m.session,retiredCap,'packet-model','K');
    const p=await replayInto(m.session,plantScreamer,'shared-space','K');
    assert.equal((await m.session.client.context('note',m.prefix+'-note-privacy-assumption')).data.record.rev,3);
    assert.equal((await m.session.client.context('note',h.prefix+'-note-model')).data.record.rev,3);
    assert.equal((await m.session.client.context('note',p.prefix+'-note-noise')).data.record.rev,3);
    assert.equal((await m.session.client.context('note',h.prefix+'-note-noise')).status,404);
    assert.equal((await m.session.client.context('note',p.prefix+'-note-model')).status,404);
    assert.equal((await m.session.client.context('note',m.prefix+'-note-model')).status,404);
    assert.equal((await m.session.fixture.client('TEST-ONLY-foreign-principal').context('note',h.prefix+'-note-model')).status,404);
  }finally{await m.session.fixture.dispose();}
});
