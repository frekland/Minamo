import {externalVideoError,externalVideoWatchURL,type ExternalVideo} from './external-media';

export type NoteVideoReference={video:ExternalVideo;referenceUrl:string};
/** A standalone pasted URL/link may gain a player; surrounding prose stays prose. */
export function noteVideoReference(source:string):NoteVideoReference|null{
 let value=source.trim();
 const markdown=/^\[[^\]\r\n]+\]\((https:\/\/[^\s]+)\)$/.exec(value);
 if(markdown)value=markdown[1];
 if(value.startsWith('<')&&value.endsWith('>'))value=value.slice(1,-1);
 value=value.replace(/\\&/g,'&');
 if(value.length>2048||/[\u0000-\u0020\u007f]/.test(value))return null;
 let url:URL;try{url=new URL(value)}catch{return null}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.searchParams.has('list')||url.searchParams.has('h'))return null;
 let video:ExternalVideo|undefined;
 const host=url.hostname,path=url.pathname;
 if(host==='youtu.be'&&/^\/[A-Za-z0-9_-]{11}$/.test(path))video={provider:'youtube',id:path.slice(1),embed:true};
 else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
  if(path==='/watch'&&url.searchParams.getAll('v').length===1)video={provider:'youtube',id:url.searchParams.get('v')??'',embed:true};
  else if(/^\/(embed|shorts|live)\/[A-Za-z0-9_-]{11}$/.test(path))video={provider:'youtube',id:path.split('/')[2],embed:true};
 }else if(['vimeo.com','www.vimeo.com'].includes(host)&&/^\/[1-9][0-9]{0,11}$/.test(path))video={provider:'vimeo',id:path.slice(1),embed:true};
 else if(host==='player.vimeo.com'&&/^\/video\/[1-9][0-9]{0,11}$/.test(path))video={provider:'vimeo',id:path.slice(7),embed:true};
 if(!video||externalVideoError(video))return null;
 const referenceUrl=externalVideoWatchURL(video);
 return externalVideoError(video,referenceUrl)?null:{video,referenceUrl};
}
