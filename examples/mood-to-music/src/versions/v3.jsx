import React from 'react';
import {AsyncMoodCards,VersionShell} from '../shared.jsx';
/** Intentionally vulnerable: a slow prior response can replace the selected mood's cards. */
export default function V3(){
  return <VersionShell version="v3" change="Async provider-adapter experiment. Known defect: choose calm then energetic quickly; the older calm response can win."><AsyncMoodCards guarded={false}/></VersionShell>;
}
