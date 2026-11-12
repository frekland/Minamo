'use client';
import {lazy,Suspense,useState} from 'react';
import './foundry-gallery.css';
import 'katex/dist/katex.min.css';
const modules={
 platform:lazy(()=>import('./foundry-platform-demo')),
 language:lazy(()=>import('./foundry-language-demo').then(m=>({default:m.FoundryLanguageDemo}))),
 math:lazy(()=>import('./foundry-math')),
 python:lazy(()=>import('./foundry-python-demo')),
 visual:lazy(()=>import('./foundry-visual')),
 data:lazy(()=>import('./foundry-data-demo')),
 audio:lazy(()=>import('./foundry-audio-demo')),
 reading:lazy(()=>import('./foundry-reading-bridge')),
 novel:lazy(()=>import('./foundry-novel')),
};
type Track=keyof typeof modules;
export default function FoundryGallery(){const [track,setTrack]=useState<Track|null>(null);const Active=track?modules[track]:null;return <main className="foundry-gallery"><header><p className="foundry-kicker">MINAMO · CAPABILITY FOUNDRY</p><h1>Small experiments, reusable foundations.</h1><p>A developer-only laboratory. Choose a track to load its trusted modules. Computation and audio require separate deliberate controls; no learner record or checkpoint is written here.</p><p className="foundry-badge">SYNTHETIC LOCAL RESEARCH · DEFAULT OFF · NO PRODUCTION RELEASE</p></header><nav aria-label="Foundry tracks">{(Object.keys(modules) as Track[]).map(key=><button key={key} data-testid={'foundry-track-'+key} aria-pressed={track===key} onClick={()=>setTrack(key)}>{({platform:'Shared platform',language:'Languages',math:'Mathematics',python:'Scientific Python',visual:'Graphics & simulations',data:'Data & traces',audio:'Audio & music',reading:'Reader & Notes',novel:'Bytes, diffs & colour'})[key]}</button>)}<button onClick={()=>setTrack(null)}>Unload track</button></nav>{Active?<Suspense fallback={<p role="status">Loading this track…</p>}><Active key={track}/></Suspense>:<section><h2>Explore deliberately</h2><p>Language preserves original characters. Mathematics retains exact source. Python executes in a separate host. Visual and audio tools use fixed, bounded engines. Supplied files remain supplied evidence.</p><p>Switching tracks unmounts the previous module. The production workspace does not register these adapters or expose this route.</p></section>}<footer><p>Browser viewport checks are not physical Pixel, TalkBack, NVDA or authenticated production acceptance. Inspect each capability’s activation dossier before integration.</p></footer></main>}
