import React from 'react';
import {TRACKS,TrackCards,VersionShell} from '../shared.jsx';
export default function V1(){
  return <VersionShell version="v1" change="First mock-track rendering; no selector, provider integration or measured emotional response."><TrackCards tracks={TRACKS.slice(0,3)}/></VersionShell>;
}
