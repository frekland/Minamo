import React,{useState} from 'react';
import {TRACKS,MoodButtons,TrackCards,VersionShell} from '../shared.jsx';
import {selectTracks} from '../catalog.mjs';
export default function V2(){
  const [mood,setMood]=useState('calm');
  return <VersionShell version="v2" change="Keyboard-operable mood selection and client-side filtered cards; still an illustrative local catalogue."><MoodButtons selected={mood} onSelect={setMood}/><p role="status">Showing {mood} mock suggestions</p><TrackCards tracks={selectTracks(mood,TRACKS)}/></VersionShell>;
}
