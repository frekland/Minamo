import React,{useState} from 'react';
import {TRACKS,MoodButtons,TrackCards,VersionShell} from '../shared.jsx';
import {addPersonalLabel,selectTracks} from '../catalog.mjs';
import {applySavedLabels,browserStorage,clearSavedLabels,readSavedLabels,saveLabels} from '../label-storage.mjs';

/** Fictional User experiment: automatic localStorage, later rejected on shared-device privacy grounds. */
export default function V6(){
  const storage=browserStorage();
  const [mood,setMood]=useState('calm');
  const [tracks,setTracks]=useState(()=>applySavedLabels(TRACKS,readSavedLabels(storage)));
  const [label,setLabel]=useState('');
  const visible=selectTracks(mood,tracks);
  const first=visible[0];
  const add=event=>{
    event.preventDefault();
    if(!first)return;
    setTracks(previous=>{const next=addPersonalLabel(previous,first.id,label);saveLabels(storage,next);return next;});
    setLabel('');
  };
  return <VersionShell version="v6" change="Experiment: labels automatically persist in this browser. This may be inappropriate on a shared device.">
    <MoodButtons selected={mood} onSelect={setMood}/><TrackCards tracks={visible}/>
    <form onSubmit={add}><label htmlFor="label-input">A label for {first?.title??'the selected track'}</label>
      <input id="label-input" value={label} onChange={event=>setLabel(event.target.value)} placeholder="calming for me"/>
      <button type="submit" disabled={!first||!label.trim()}>Add personal label</button>
    </form>
    <button type="button" onClick={()=>{clearSavedLabels(storage);setTracks(TRACKS);}}>Clear stored labels</button>
  </VersionShell>;
}
