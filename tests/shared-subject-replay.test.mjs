import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PHASES,subjectPrefix,replaySubject} from './project-scenarios/shared/subject-replay.mjs';
import {retiredCap} from './project-scenarios/retired-htb-cap/subject.mjs';

test('registered versioned namespace rejects unknown subjects, variants and epochs',()=>{
  assert.equal(PHASES.join(''),'ABCDEFGHIJK');
  assert.equal(subjectPrefix(retiredCap,'command-log',2),'TEST-ONLY-htb-cap-command-log-v1-r2');
  assert.throws(()=>subjectPrefix(retiredCap,'unknown',1),/Unregistered/);
  assert.throws(()=>subjectPrefix(retiredCap,'command-log',0),/Invalid synthetic epoch/);
  assert.throws(()=>subjectPrefix({...retiredCap,namespace:'../outside'},'command-log',1),/Unregistered/);
});
test('shared replay never invents future state on an A–E read',async()=>{
  const run=await replaySubject(retiredCap,'packet-model','E');
  try{
    assert.equal(run.snapshot.phase,'E');
    assert.equal(run.snapshot.notes.length,4);
    assert.equal((await run.session.client.context('note',run.prefix+'-note-model')).status,404);
    assert.equal((await run.session.client.context('journey',run.prefix+'-project')).status,200);
  }finally{await run.session.fixture.dispose();}
});
