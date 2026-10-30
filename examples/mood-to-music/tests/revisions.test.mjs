import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TRACKS,selectTracks,addPersonalLabel} from '../src/catalog.mjs';
import {createRequestController} from '../src/request-controller.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
test('v1→v2 selectable fictional catalogue and immutable v5 personal feedback',()=>{
  assert.equal(TRACKS.length,4);
  assert.deepEqual(selectTracks('energetic').map(x=>x.id),['e01','e02']);
  const next=addPersonalLabel(TRACKS,'c01','calming for me');
  assert.deepEqual(TRACKS[0].personalLabels,[]);
  assert.deepEqual(next[0].personalLabels,['calming for me']);
  assert.strictEqual(next[1],TRACKS[1]);
  assert.strictEqual(addPersonalLabel(next,'c01','calming for me')[0].personalLabels.length,1);
});
async function race(guarded){
  const calm=deferred(),energetic=deferred(),c=createRequestController({guarded});
  const first=c.select('calm',calm.promise),second=c.select('energetic',energetic.promise);
  energetic.resolve(selectTracks('energetic'));await second;
  calm.resolve(selectTracks('calm'));await first;
  return c.state;
}
test('v3 bug is reproduced and v4 prevents stale response replacing current choice',async()=>{
  const bad=await race(false),fixed=await race(true);
  assert.equal(bad.mood,'energetic');
  assert.equal(bad.tracks[0].id,'c01');
  assert.equal(fixed.mood,'energetic');
  assert.deepEqual(fixed.tracks.map(x=>x.id),['e01','e02']);
});
test('v4 handles empty/error states and ignores stale rejection',async()=>{
  const c=createRequestController({guarded:true});
  await c.select('calm',Promise.resolve([]));assert.equal(c.state.status,'empty');
  await c.select('calm',Promise.reject(Error('offline')));assert.equal(c.state.status,'error');
  const late=deferred(),first=c.select('calm',late.promise);
  await c.select('energetic',Promise.resolve(selectTracks('energetic')));
  late.reject(Error('old failure'));await first;
  assert.equal(c.state.status,'ready');assert.equal(c.state.mood,'energetic');
});
