import {test} from 'node:test';
import assert from 'node:assert/strict';
import {plantScreamer} from './project-scenarios/automatic-plant-screamer/subject.mjs';
import {PHASES,replaySubject,replayInto,subjectPrefix} from './project-scenarios/shared/subject-replay.mjs';
import {SYNTHETIC_TRACES,naiveTriggers,boundedTriggers} from './project-scenarios/automatic-plant-screamer/sensor-model.mjs';

test('Plant-Screamer model keeps raw ADC and human policy separate from physical evidence',()=>{
  assert.deepEqual(naiveTriggers(SYNTHETIC_TRACES.noisy),[1,3,5,7]);
  assert.deepEqual(boundedTriggers(SYNTHETIC_TRACES.noisy),[1,7]);
  assert.deepEqual(boundedTriggers(SYNTHETIC_TRACES.rearm),[1,4]);
  assert.deepEqual(boundedTriggers(SYNTHETIC_TRACES.quiet,{mutedIndices:[4]}),[1]);
  assert.throws(()=>boundedTriggers([5000]),/Invalid synthetic ADC/);
  assert.throws(()=>boundedTriggers([2800],{wetRearm:2900}),/Invalid synthetic ADC/);
});
test('Plant foundation A–E preserves wrong 15 percent assumption and true revision',async()=>{
  assert.equal(plantScreamer.baseFixtureVersion,'automatic-plant-screamer/1');
  assert.deepEqual(Object.keys(plantScreamer.personas).sort(),['breadboard','calibrator','shared-space']);
  assert.equal(PHASES.length,11);
  assert.throws(()=>subjectPrefix(plantScreamer,'unregistered'),/Unregistered/);
  const first=await replaySubject(plantScreamer,'breadboard','E');
  try{
    assert.equal(first.snapshot.notes.length,4);
    assert.equal(first.snapshot.project.rev,3);
    assert.equal(first.snapshot.annotations,1);
    const old=(await first.session.client.context('note',first.prefix+'-note-first-parts')).data.record;
    assert.match(old.body,/15%/);
    const project=(await first.session.client.context('journey',first.prefix+'-project')).data.record;
    assert.match(project.body,/stop displaying/);
    const second=await replaySubject(plantScreamer,'breadboard','E');
    try{assert.deepEqual(first.snapshot,second.snapshot);}
    finally{await second.session.fixture.dispose();}
  }finally{await first.session.fixture.dispose();}
});
test('Plant personas share a principal without Note contamination',async()=>{
  const first=await replaySubject(plantScreamer,'breadboard','K',{owner:'TEST-ONLY-plant-shared'});
  try{
    const other=await replayInto(first.session,plantScreamer,'calibrator','K');
    assert.equal(other.snapshot.notes.length,7);
    assert.equal((await first.session.client.context('note',other.prefix+'-note-quick-wiring')).status,404);
    assert.equal((await first.session.client.context('note',first.prefix+'-note-raw-series')).status,404);
    assert.equal((await first.session.client.context('note',other.prefix+'-note-raw-series')).data.record.rev,3);
  }finally{await first.session.fixture.dispose();}
});
