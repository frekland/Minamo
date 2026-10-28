'use client';
import {useEffect,useState} from 'react';
import Workspace from './workspace';
import type {WorkspaceSnapshot} from '../lib/contracts';
/** Full ordinary Workspace, actual local D1 and MCP-published synthetic Activity. */
export default function ActivityPreview(){
 const [snapshot,setSnapshot]=useState<WorkspaceSnapshot|null>(null),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();fetch('/preview-activity/api?path='+encodeURIComponent('/api/workspace'),{signal:c.signal}).then(async r=>{const value=await r.json() as WorkspaceSnapshot & {error?:string};if(!r.ok)throw Error(value.error??'Preview unavailable.');setSnapshot(value);}).catch(e=>{if(!c.signal.aborted)setError(e.message);});return()=>c.abort();},[]);
 if(!snapshot)return <main style={{padding:30}}><h1>Activity Studio local acceptance</h1><p role="status">{error||'Publishing a synthetic challenge through actual MCP and local D1…'}</p></main>;
 return <Workspace initialRecords={snapshot.records} initialActivity={snapshot.activity} authenticated draftScope="TEST-ONLY-activity-browser" activityStudioEnabled initialView="tools" initialFamily="experiment" initialId="TEST-ONLY-tcp-activity" initialError="TEST ONLY · isolated local D1 and MCP. Browser emulation does not prove hosted or physical-device acceptance."/>;
}
