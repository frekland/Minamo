import {test} from 'node:test';
import assert from 'node:assert/strict';
import {plantScreamer} from './project-scenarios/automatic-plant-screamer/subject.mjs';
import {replaySubject,subjectPrefix} from './project-scenarios/shared/subject-replay.mjs';

const personaKey='breadboard',noteLeaf='note-quick-wiring';
test('breadboard has honest revisioned sensor/audio/social evidence in disposable D1',async()=>{
  const {session,prefix,snapshot}=await replaySubject(plantScreamer,personaKey,'K');
  try{
    assert.equal(prefix,subjectPrefix(plantScreamer,personaKey));
    assert.equal(snapshot.notes.length,7);
    assert.equal(snapshot.project.rev,4);
    assert.equal(snapshot.annotations,2);
    assert.equal(snapshot.questions.find(q=>q.id==='audio').rev,2);
    const original=(await session.client.context('note',prefix+'-'+noteLeaf)).data.record;
    assert.equal(original.rev,3);
    assert.match(original.body,/original firmware blame was premature/);
    const history=await session.fixture.db.prepare("SELECT revision,data FROM v2_revisions WHERE owner=? AND family='note' AND id=? ORDER BY revision")
      .bind(session.client.owner,original.id).all();
    assert.deepEqual(history.results.map(x=>x.revision),[1,2,3]);
    assert.match(JSON.parse(history.results[0].data).body,/FICTIONAL USER MATERIAL/);
    const article=(await session.client.context('article',prefix+'-reference')).data.record;
    const annotation=(await session.client.context('annotation',prefix+'-annotation-foundation')).data.record;
    const part=article.sections.find(s=>s.id===annotation.anchor.sectionId).parts.find(p=>p.id==='p');
    assert.equal(part.text.slice(annotation.anchor.start,annotation.anchor.end),annotation.anchor.quote);
    assert.equal(article.rendition,annotation.anchor.rendition);
    const stale=await session.client.command({operationId:prefix+'-stale-edit',action:'update',family:'note',
      id:original.id,expectedRev:1,data:{body:'unverified claim as fact'}});
    assert.equal(stale.status,409);
    assert.equal((await session.fixture.client('TEST-ONLY-plant-other').context('note',original.id)).status,404);
    const dev=await session.fixture.db.prepare('SELECT COUNT(*) AS n FROM v2_learning_developments WHERE owner=?')
      .bind(session.client.owner).first();
    assert.equal(dev.n,0,'no checkpoint invented by fixture');
  }finally{await session.fixture.dispose();}
});
test('breadboard F/H/K snapshots replay without future leakage',async()=>{
  for(const phase of ['F','H','K']){
    const first=await replaySubject(plantScreamer,personaKey,phase);
    try{
      const again=await replaySubject(plantScreamer,personaKey,phase);
      try{assert.deepEqual(first.snapshot,again.snapshot);}
      finally{await again.session.fixture.dispose();}
      if(phase==='F')assert.equal(first.snapshot.notes.length,5);
      if(phase==='K')assert.equal(first.snapshot.notes.length,7);
    }finally{await first.session.fixture.dispose();}
  }
});
