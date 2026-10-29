import React,{useState} from 'react';
import {TRACKS,MoodButtons,TrackCards,VersionShell} from '../shared.jsx';
import {addPersonalLabel,selectTracks} from '../catalog.mjs';
/** Product pivot: editable listener labels; no external data, persistence or objective scoring. */
export default function V5(){
  const [mood,setMood]=useState('calm');
  const [tracks,setTracks]=useState(TRACKS);
  const [label,setLabel]=useState('');
  const visible=selectTracks(mood,tracks);
  const first=visible[0];
  return <VersionShell version="v5" change="Direction changed: personally labelled favourites before external recommendation claims. Labels exist in this tab only."><MoodButtons selected={mood} onSelect={setMood}/><TrackCards tracks={visible}/><form onSubmit={event=>{event.preventDefault();if(first){setTracks(previous=>addPersonalLabel(previous,first.id,label));setLabel('');}}}><label htmlFor="label-input">A label for {first?.title??'the selected track'}</label><input id="label-input" value={label} onChange={event=>setLabel(event.target.value)} placeholder="calming for me" /><button disabled={!first||!label.trim()} type="submit">Add personal label</button></form></VersionShell>;
}
