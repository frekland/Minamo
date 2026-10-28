"use client";
import {useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {externalVideoEmbedURL,externalVideoError,externalVideoWatchURL,type ExternalVideo} from '../lib/external-media';
import './external-video.css';
/** Validated provider players show their preview immediately; playback stays manual. */
export default function ExternalVideoCard({video,label,referenceUrl}:{video:ExternalVideo;label:string;referenceUrl:string}){
 const [failedIdentity,setFailedIdentity]=useState<string|null>(null);
 const error=externalVideoError(video,referenceUrl);if(error)return <p className="ev-unavailable">External video unavailable. The authored explanation and reference remain available.</p>;
 const identity=JSON.stringify([video.provider,video.id,video.transcriptUrl??'',referenceUrl]),provider=video.provider==='youtube'?'YouTube':'Vimeo';
 return <div className="ev-card" data-external-video={video.provider}><div className="ev-player"><iframe key={identity} src={externalVideoEmbedURL(video)} title={label+' · '+provider+' video player'} loading="lazy" sandbox="allow-scripts allow-same-origin allow-presentation" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={()=>setFailedIdentity(identity)}/></div>{failedIdentity===identity&&<p role="status">The player could not load. Open the original video below.</p>}<div className="ev-links"><a href={externalVideoWatchURL(video)} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} aria-hidden="true"/>Open on {provider}</a>{video.transcriptUrl&&<a href={video.transcriptUrl} target="_blank" rel="noopener noreferrer">Transcript or captions information ↗</a>}</div></div>;
}
