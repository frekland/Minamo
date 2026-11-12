import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retiredCap} from './project-scenarios/retired-htb-cap/subject.mjs';
import {PHASES,replaySubject,replayInto,subjectPrefix} from './project-scenarios/shared/subject-replay.mjs';

test('Cap fixture is a distinct versioned authorised-lab subject with exactly three personas',()=>{
  assert.equal(retiredCap.baseFixtureVersion,'retired-htb-cap/1');
  assert.deepEqual(Object.keys(retiredCap.personas).sort(),['command-log','packet-model','sparse-return']);
  assert.deepEqual(PHASES,['A','B','C','D','E','F','G','H','I','J','K']);
  assert.throws(()=>subjectPrefix(retiredCap,'unknown'),/Unregistered/);
  assert.throws(()=>subjectPrefix(retiredCap,'command-log',0),/Invalid synthetic epoch/);
});
test('A–E base is reproducible and preserves the initial false service assumption',async()=>{
  const first=await replaySubject(retiredCap,'command-log','E');
  try{
    assert.equal(first.snapshot.phase,'E');
    assert.equal(first.snapshot.project.rev,3);
    assert.equal(first.snapshot.notes.length,4);
    assert.equal(first.snapshot.annotations,1);
    const initial=(await first.session.client.context('note',first.prefix+'-note-cli-first')).data.record;
    assert.match(initial.body,/open HTTP meant/);
    const project=(await first.session.client.context('journey',first.prefix+'-project')).data.record;
    assert.match(project.body,/not evidence of exploitability/);
    const another=await replaySubject(retiredCap,'command-log','E');
    try{assert.deepEqual(first.snapshot,another.snapshot);}
    finally{await another.session.fixture.dispose();}
  }finally{await first.session.fixture.dispose();}
});
test('two Cap persona histories remain isolated under one synthetic owner',async()=>{
  const first=await replaySubject(retiredCap,'command-log','K',{owner:'TEST-ONLY-htb-shared'});
  try{
    const packet=await replayInto(first.session,retiredCap,'packet-model','K');
    assert.notEqual(packet.prefix,first.prefix);
    assert.equal(packet.snapshot.notes.length,7);
    assert.equal(first.snapshot.notes.length,7);
    assert.equal((await first.session.client.context('note',packet.prefix+'-note-cmd-return')).status,404);
    assert.equal((await first.session.client.context('note',first.prefix+'-note-model')).status,404);
    assert.equal((await first.session.client.context('note',packet.prefix+'-note-model')).data.record.rev,3);
  }finally{await first.session.fixture.dispose();}
});
