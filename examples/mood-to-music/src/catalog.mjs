/** Fictional, credential-free catalogue. Names and affective tags are illustrative, not Spotify data. */
export const MOODS=Object.freeze(['calm','energetic','reflective']);
export const TRACKS=Object.freeze([
  {id:'c01',title:'Harbour at Dawn',artist:'Fixture Ensemble',tags:['calm','reflective'],personalLabels:[]},
  {id:'e01',title:'Copper Sparks',artist:'Fixture Ensemble',tags:['energetic'],personalLabels:[]},
  {id:'r01',title:'Rain on Glass',artist:'Fixture Ensemble',tags:['reflective','calm'],personalLabels:[]},
  {id:'e02',title:'Saturday Circuit',artist:'Fixture Ensemble',tags:['energetic'],personalLabels:[]},
]);
export function selectTracks(mood,tracks=TRACKS){
  return tracks.filter(track=>track.tags.includes(mood));
}
export function addPersonalLabel(tracks,id,label){
  const clean=label.trim();
  if(!clean)return tracks;
  return tracks.map(track=>track.id!==id?track:{...track,personalLabels:[...new Set([...track.personalLabels,clean])]});
}
/** Deliberately different latencies make v3's stale-response bug easy to explore. */
export function mockSearch(mood,{latencies={calm:500,energetic:40,reflective:120}}={}){
  return new Promise(resolve=>setTimeout(()=>resolve(selectTracks(mood)),latencies[mood]??0));
}
