'use client';
import {useEffect,useRef,useState} from 'react';
import {localVoiceFor, type SpeechPace} from '../lib/language-speech';

/** Text and generated audio never leave the browser; only published voice files are fetched. */
export function ProjectSpeech({text,language}:{text:string;language?:string}) {
  const voice = localVoiceFor(language);
  const [pace,setPace] = useState<SpeechPace>('normal');
  const [status,setStatus] = useState('');
  const [busy,setBusy] = useState(false);
  const [ready,setReady] = useState(false);
  const [playing,setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const url = useRef<string | null>(null);
  const generation = useRef(0);

  useEffect(() => {
    generation.current++;
    audio.current?.pause();
    audio.current?.removeAttribute('src');
    if (url.current) URL.revokeObjectURL(url.current);
    url.current=null;
    setReady(false);setPlaying(false);setStatus('');setBusy(false);
    return () => {
      generation.current++;
      audio.current?.pause();
      if (url.current) URL.revokeObjectURL(url.current);
      url.current=null;
    };
  },[text,language,pace]);

  if (!voice || !text.trim()) return null;
  async function play() {
    if (busy || !voice) return;
    if (ready && audio.current?.src) {
      audio.current.currentTime=0;
      try {await audio.current.play();setPlaying(true);setStatus('');}
      catch {setStatus('Audio ready. Tap Listen again to play.');}
      return;
    }
    const revision=++generation.current;
    setBusy(true);setStatus('Preparing local speech…');
    try {
      const {synthesizeLocalSpeech}=await import('../lib/language-speech-browser');
      const blob=await synthesizeLocalSpeech(voice,text,pace,message=>{if(generation.current===revision)setStatus(message);});
      if(generation.current!==revision)return;
      if(url.current)URL.revokeObjectURL(url.current);
      url.current=URL.createObjectURL(blob);
      if(audio.current){audio.current.src=url.current;audio.current.load();}
      setReady(true);setStatus('Audio ready.');
      try {await audio.current?.play();setPlaying(true);setStatus('');}
      catch {setStatus('Audio ready. Tap Listen again to play.');}
    } catch(error) {
      if(generation.current===revision)setStatus(`Speech unavailable: ${error instanceof Error?error.message:'Voice could not be loaded.'}`);
    } finally {if(generation.current===revision)setBusy(false);}
  }
  return <div className="pi-speech" aria-label={`Local speech · ${voice.label}`}>
    <button type="button" disabled={busy} onClick={()=>void play()} aria-label={`${ready?'Replay':'Listen to'} ${voice.label} speech`}>{busy?'Preparing…':ready?'↻ Replay':'▶ Listen'}</button>
    {voice.engine==='piper-plus'&&<select aria-label="Japanese speech speed" value={pace} onChange={event=>setPace(event.target.value as SpeechPace)} disabled={busy}><option value="normal">Normal</option><option value="slow">Slow</option></select>}
    {playing&&<button type="button" onClick={()=>{audio.current?.pause();setPlaying(false);}} aria-label="Stop speech">Stop</button>}
    <a href={voice.sourceUrl} className="pi-speech-credit" target="_blank" rel="noopener noreferrer" title="Voice source, model and dataset information">Voice info</a>
    <audio ref={audio} hidden preload="none" onEnded={()=>setPlaying(false)} onPause={()=>setPlaying(false)}/>
    {status&&<span role="status" className="pi-speech-status">{status}</span>}
  </div>;
}
