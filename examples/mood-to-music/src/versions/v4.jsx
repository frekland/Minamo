import React from 'react';
import {AsyncMoodCards,VersionShell} from '../shared.jsx';
/** Request identity, not completion order, now decides which result can be displayed. */
export default function V4(){
  return <VersionShell version="v4" change="Corrected stale-result handling with a request identity guard."><AsyncMoodCards guarded={true}/></VersionShell>;
}
