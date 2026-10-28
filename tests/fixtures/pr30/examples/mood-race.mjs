import assert from 'node:assert/strict';

// No external account, API request or React runtime: test the async mechanism.
function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return {promise, resolve};
}

function companion(guarded) {
  let request = 0;
  let state = {mood: null, status: 'idle', tracks: []};
  return {
    get state() { return state; },
    async select(mood, pending) {
      const id = ++request;
      state = {mood, status:'loading', tracks:[]};
      try {
        const tracks = await pending;
        if (!guarded || id === request) state = {mood:state.mood, status:tracks.length ? 'ready' : 'empty', tracks};
      } catch(error) {
        if (!guarded || id === request) state = {mood:state.mood,status:'error',tracks:[],message:String(error.message)};
      }
    }
  };
}

async function replay(guarded) {
  const calm = deferred(), energetic = deferred(), app = companion(guarded);
  const first = app.select('calm', calm.promise);
  const second = app.select('energetic', energetic.promise);
  energetic.resolve([{id:'e',tag:'energetic'}]);
  await second;
  calm.resolve([{id:'c',tag:'calm'}]);
  await first;
  return app.state;
}

const baseline = await replay(false), guarded = await replay(true);
assert.equal(baseline.mood, 'energetic');
assert.equal(baseline.tracks[0].tag, 'calm'); // Reproduced defect.
assert.equal(guarded.tracks[0].tag, guarded.mood);

const app = companion(true);
await app.select('calm', Promise.resolve([]));
assert.equal(app.state.status,'empty');
await app.select('calm', Promise.reject(new Error('fixture unavailable')));
assert.equal(app.state.status,'error');

function feedback(tracks, id, label) {
  return tracks.map(track => track.id === id ? {...track, labels:[...track.labels,label]} : track);
}
const tracks = [{id:'a',labels:[]},{id:'b',labels:['personal']}];
const revised = feedback(tracks,'a','calm for me');
assert.deepEqual(tracks[0].labels,[]);
assert.deepEqual(revised[0].labels,['calm for me']);
assert.equal(revised[1],tracks[1]);
console.log(JSON.stringify({synthetic:true,environment:'Node lab runner, no React/browser or external API',baseline,guarded,checks:8},null,2));
