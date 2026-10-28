import {parseNoteImagePlacements} from './note-image-placement';
import type {ArticleSection,ContentPatch,WorkspaceRecord} from './contracts';
/** Append only new original attachments; never serialize existing protected excerpt text. */
export function noteAttachmentUpdate(saved:WorkspaceRecord|undefined,sections:ArticleSection[],body?:string):{sections?:ArticleSection[];patch?:ContentPatch[]}{
 const parts=sections.flatMap(section=>section.parts);const keep=body===undefined?null:new Set(parseNoteImagePlacements(body).map(marker=>marker.partId));const removed=keep?saved?.sections?.flatMap(section=>section.parts.filter(part=>part.kind==='image'&&parseNoteImagePlacements(saved.body).some(marker=>marker.partId===part.id)&&!keep.has(part.id)).map(part=>({op:'removeBlock' as const,sectionId:section.id,partId:part.id})))??[]:[];if(!parts.length)return removed.length?{patch:removed}:{};
 if(parts.length>12||parts.some(part=>!['image','media'].includes(part.kind)||part.unavailable))throw Error('Notes accept at most 12 newly authored image/media attachments per save.');
 const old=saved?.sections??[];if(!old.length)return{sections};
 const target=old.find(section=>section.parts.length+parts.length<=40);if(!target)throw Error('These sections are full. Keep this attachment draft and use the full editor to add another section.');
 let after=target.parts.filter(part=>!removed.some(remove=>remove.sectionId===target.id&&remove.partId===part.id)).at(-1)?.id??null;const patch:ContentPatch[]=[...removed,...parts.map(block=>{const change:ContentPatch={op:'insertBlock',sectionId:target.id,afterPartId:after,block};after=block.id;return change;})];return{patch};
}
