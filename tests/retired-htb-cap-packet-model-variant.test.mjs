import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retiredCap} from './project-scenarios/retired-htb-cap/subject.mjs';
import {replaySubject,subjectPrefix} from './project-scenarios/shared/subject-replay.mjs';

const personaKey='packet-model',noteLeaf='note-model';
test('packet-model replays F–K with historical editions and source-bound uncertainty',async()=>{
  const run=await replaySubject(retiredCap,personaKey,'K');
  const {session,prefix,snapshot}=run;
  try{
    assert.equal(prefix,subjectPrefix(retiredCap,personaKey));
    assert.equal(snapshot.notes.length,7);
    assert.equal(snapshot.project.rev,4);
    assert.equal(snapshot.annotations,2);
    assert.deepEqual(snapshot.questions.find(q=>q.id==='capture').rev,2);
    const original=(await session.client.context('note',prefix+'-'+noteLeaf)).data.record;
    assert.equal(original.rev,3);
    assert.match(original.body,/first simplified HTTP/);
    const rows=await session.fixture.db.prepare("SELECT revision,data FROM v2_revisions WHERE owner=? AND family='note' AND id=? ORDER BY revision")
      .bind(session.client.owner,original.id).all();
    assert.deepEqual(rows.results.map(x=>x.revision),[1,2,3]);
    const firstBody=JSON.parse(rows.results[0].data).body;
    assert.match(firstBody,/FICTIONAL USER MATERIAL/);
    const reference=(await session.client.context('article',prefix+'-reference')).data.record;
    const annotation=(await session.client.context('annotation',prefix+'-annotation-foundation')).data.record;
    const part=reference.sections.find(x=>x.id===annotation.anchor.sectionId).parts.find(x=>x.id==='p');
    assert.equal(part.text.slice(annotation.anchor.start,annotation.anchor.end),annotation.anchor.quote);
    assert.equal(annotation.anchor.rendition,reference.rendition);
    const stale=await session.client.command({operationId:prefix+'-stale-edit',action:'update',family:'note',
      id:original.id,expectedRev:1,data:{body:'forged source fact'}});
    assert.equal(stale.status,409);
    assert.equal((await session.fixture.client('TEST-ONLY-other-owner').context('note',original.id)).status,404);
    const developments=await session.fixture.db.prepare('SELECT COUNT(*) AS n FROM v2_learning_developments WHERE owner=?')
      .bind(session.client.owner).first();
    assert.equal(developments.n,0,'a seeded learner Note is not an authorised GPT checkpoint');
  }finally{await session.fixture.dispose();}
});
test('packet-model F/H/K snapshots are deterministic and do not preload future Notes',async()=>{
  for(const phase of ['F','H','K']){
    const first=await replaySubject(retiredCap,personaKey,phase);
    try{
      const second=await replaySubject(retiredCap,personaKey,phase);
      try{assert.deepEqual(first.snapshot,second.snapshot);}
      finally{await second.session.fixture.dispose();}
      if(phase==='F')assert.equal(first.snapshot.notes.length,5);
      if(phase==='K')assert.equal(first.snapshot.notes.length,7);
    }finally{await first.session.fixture.dispose();}
  }
});
