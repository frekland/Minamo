/** Deliberate external video references. These helpers never fetch remote content. */
export type ExternalVideo={provider:'youtube'|'vimeo';id:string;embed:true;transcriptUrl?:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
function safeHTTPS(value:unknown):URL|null{if(typeof value!=='string'||value.length>2048||/[\u0000-\u0020\u007f]/.test(value))return null;try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url:null}catch{return null}}
export function externalVideoError(value:unknown,referenceUrl?:string):string|null{
 if(!object(value)||Object.keys(value).some(key=>!['provider','id','embed','transcriptUrl'].includes(key))||value.embed!==true)return 'An external video requires an explicit embed:true declaration and bounded provider metadata.';
 if(value.provider!=='youtube'&&value.provider!=='vimeo')return 'Only deliberate YouTube or Vimeo video references can be embedded.';
 if(typeof value.id!=='string'||!(value.provider==='youtube'?/^[A-Za-z0-9_-]{11}$/:/^[1-9][0-9]{0,11}$/).test(value.id))return 'Use an exact video ID, not a URL, playlist, channel or HTML embed.';
 if(value.transcriptUrl!==undefined&&!safeHTTPS(value.transcriptUrl))return 'Transcript links require a well-formed HTTPS URL without credentials.';
 if(referenceUrl!==undefined){const url=safeHTTPS(referenceUrl);if(!url||url.port||url.searchParams.has('list')||url.searchParams.has('h'))return 'The video reference must use its HTTPS provider URL.';
  const host=url.hostname,path=url.pathname;let id:string|null=null;
  if(value.provider==='youtube'){
   if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)&&path==='/watch'&&url.searchParams.getAll('v').length===1)id=url.searchParams.get('v');
   else if(['youtube.com','www.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host)&&/^\/embed\/[A-Za-z0-9_-]{11}$/.test(path))id=path.slice(7);
   else if(host==='youtu.be'&&/^\/[A-Za-z0-9_-]{11}$/.test(path))id=path.slice(1);
  }else if(['vimeo.com','www.vimeo.com'].includes(host)&&/^\/[1-9][0-9]{0,11}$/.test(path))id=path.slice(1);else if(host==='player.vimeo.com'&&/^\/video\/[1-9][0-9]{0,11}$/.test(path))id=path.slice(7);
  if(id!==value.id)return 'The exact provider video ID must match the authored reference URL.';
 }
 return null;
}
export function externalVideoWatchURL(video:ExternalVideo):string{const error=externalVideoError(video);if(error)throw Error(error);return video.provider==='youtube'?'https://www.youtube.com/watch?v='+video.id:'https://vimeo.com/'+video.id;}
export function externalVideoEmbedURL(video:ExternalVideo):string{const error=externalVideoError(video);if(error)throw Error(error);return video.provider==='youtube'?'https://www.youtube-nocookie.com/embed/'+video.id+'?autoplay=0&playsinline=1&cc_load_policy=1':'https://player.vimeo.com/video/'+video.id+'?dnt=1&autoplay=0&playsinline=1&preload=none';}
export const EXTERNAL_VIDEO_FRAME_SOURCES='https://www.youtube-nocookie.com https://player.vimeo.com';
/** One-call manuscript codec, distinct from ordinary links which never auto-embed. */
export function externalVideoDeclaration(value:unknown):{text:string;reference:{url:string;label:string;rights:'link-only';externalVideo:ExternalVideo}}{
 if(!object(value)||Object.keys(value).some(key=>!['provider','id','embed','transcriptUrl','label','description'].includes(key))||typeof value.label!=='string'||!value.label.trim()||value.label.length>180||typeof value.description!=='string'||!value.description.trim()||value.description.length>20000)throw Error('Declare a video label and authored description with an exact provider, ID and embed:true.');
 const {label,description,...video}=value,error=externalVideoError(video);if(error)throw Error(error);return{text:description,reference:{url:externalVideoWatchURL(video as ExternalVideo),label,rights:'link-only',externalVideo:video as ExternalVideo}};
}
