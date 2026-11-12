import React,{useEffect,useState} from 'react';
import {TRACKS,MoodButtons,TrackCards,VersionShell} from '../shared.jsx';
import {addPersonalLabel,selectTracks} from '../catalog.mjs';
import {applySavedLabels,browserStorage,clearSavedLabels,readConsent,readSavedLabels,saveLabels,setConsent} from '../label-storage.mjs';

/** Fictional User revision: tab-only labels unless persistence is explicitly selected. */
export default function V7(){
  const storage=browserStorage();
  const [remember,setRemember]=useState(()=>readConsent(storage));
  const [mood,setMood]=useState('calm');
  const [tracks,setTracks]=useState(()=>readConsent(storage)?applySavedLabels(TRACKS,readSavedLabels(storage)):TRACKS);
  const [label,setLabel]=useState('');
  useEffect(()=>{if(!remember)clearSavedLabels(storage);},[]);
  const visible=selectTracks(mood,tracks),first=visible[0];
  const changeRemember=checked=>{
    setRemember(checked);
    setConsent(storage,checked);
    if(checked)saveLabels(storage,tracks);
    else clearSavedLabels(storage);
  };
  const add=event=>{
    event.preventDefault();
    if(!first)return;
    setTracks(previous=>{const next=addPersonalLabel(previous,first.id,label);if(remember)saveLabels(storage,next);return next;});
    setLabel('');
  };
  return <VersionShell version="v7" change="Privacy revision: labels stay in this tab unless you explicitly choose to remember them on this browser.">
    <MoodButtons selected={mood} onSelect={setMood}/><TrackCards tracks={visible}/>
    <form onSubmit={add}><label htmlFor="label-input">A label for {first?.title??'the selected track'}</label>
      <input id="label-input" value={label} onChange={event=>setLabel(event.target.value)} placeholder="calming for me"/>
      <button type="submit" disabled={!first||!label.trim()}>Add personal label</button>
    </form>
    <label><input type="checkbox" checked={remember} onChange={event=>changeRemember(event.target.checked)}/> Remember labels on this browser</label>
    <button type="button" onClick={()=>{clearSavedLabels(storage);setConsent(storage,false);setRemember(false);setTracks(TRACKS);}}>Clear all my labels</button>
  </VersionShell>;
}
