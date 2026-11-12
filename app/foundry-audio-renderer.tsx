'use client';
import {createRoot} from 'react-dom/client';
import {FoundryPcmView} from './foundry-audio-demo';
import type {AudioAnalysis} from '../lib/foundry/audio-platform';
/** Explicit display mount only; audio playback still needs the owner's gesture. */
export function mountFoundryPcm(host:HTMLElement,payload:AudioAnalysis){const root=createRoot(host);root.render(<FoundryPcmView sampleRate={payload.sampleRate} samples={payload.samples} origin={payload.origin}/>);let disposed=false;return()=>{if(disposed)return;disposed=true;root.unmount();};}
