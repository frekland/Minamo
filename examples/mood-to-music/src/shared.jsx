import React,{useRef,useState} from 'react';
import {MOODS,TRACKS,mockSearch} from './catalog.mjs';

export function TrackCards({tracks}){
  return <ul className="cards">{tracks.map(track=><li key={track.id}><strong>{track.title}</strong><span>{track.artist}</span><small>{track.personalLabels.length?'My labels: '+track.personalLabels.join(', '):'Fictional catalogue · mood tags are suggestions'}</small></li>)}</ul>;
}
export function MoodButtons({selected,onSelect}){
  return <div className="moods" aria-label="Choose a mood">{MOODS.map(mood=><button type="button" key={mood} aria-pressed={selected===mood} onClick={()=>onSelect(mood)}>{mood}</button>)}</div>;
}
export function AsyncMoodCards({guarded=false,onResults}){
  const token=useRef(0);
  const [state,setState]=useState({mood:null,status:'idle',tracks:[]});
  const select=async mood=>{
    const current=++token.current;
    setState({mood,status:'loading',tracks:[]});
    try{
      const tracks=await mockSearch(mood);
      if(!guarded||current===token.current){
        setState(previous=>({...previous,status:tracks.length?'ready':'empty',tracks}));
        onResults?.(tracks,mood);
      }
    }catch(error){
      if(!guarded||current===token.current)setState(previous=>({...previous,status:'error',tracks:[],error:String(error)}));
    }
  };
  return <><MoodButtons selected={state.mood} onSelect={select}/><p role="status">{state.status==='idle'?'Choose a mood':state.status==='loading'?'Finding mock tracks…':state.status==='ready'?'Showing '+state.mood+' suggestions':state.status==='empty'?'No tracks found':'Mock lookup failed'}</p><TrackCards tracks={state.tracks}/></>;
}
export function VersionShell({version,change,children}){
  return <main><p className="eyebrow">TEST ONLY · synthetic engineering fixture</p><h1>Mood-to-Music</h1><p>{change}</p><nav aria-label="Source revision">{['v1','v2','v3','v4','v5'].map(item=><a key={item} href={'?revision='+item} aria-current={version===item?'page':undefined}>{item}</a>)}</nav>{children}<footer>No Spotify access, real listening inference or owner activity is claimed.</footer></main>;
}
export {TRACKS};
