"use client";
import {mediaCanonicalText,type ArticleSection,type PassagePart} from '../lib/contracts';
import {clientId} from '../lib/client-id';
import MediaAttachment from './media-attachment';
/** Only newly authored attachments enter the Note draft; existing protected sections stay server-side. */
export default function NoteAttachments({sections,onChange,ownerScope,disabled,existingCount=0}:{sections:ArticleSection[];onChange:(sections:ArticleSection[])=>void;ownerScope:string;disabled:boolean;existingCount?:number}){
 const parts=sections.flatMap(section=>section.parts);function append(part:PassagePart){if(parts.length>=12)return;onChange([{id:sections[0]?.id??'attachments-'+clientId(),title:'Attachments',parts:[...parts,part]}]);}
 return <details className="nw-attachments"><summary>Other attachments {existingCount+parts.length>0&&`(${existingCount+parts.length})`}</summary>{existingCount>0&&<p>{existingCount} saved attachment(s).</p>}{parts.map(part=><div key={part.id}><p>{part.kind==='image'?'Image':'Private '+part.media?.kind} · {part.kind==='image'?part.image?.alt:part.media?.description}</p><button type="button" disabled={disabled} onClick={()=>onChange(sections.map(section=>({...section,parts:section.parts.filter(value=>value.id!==part.id)})))}>Remove this new attachment</button></div>)}<fieldset disabled={disabled||parts.length>=12}><details><summary>Document, audio or video</summary><MediaAttachment ownerScope={ownerScope} disabled={disabled||parts.length>=12} onAttach={media=>append({id:'part-'+clientId(),kind:'media',media,text:mediaCanonicalText(media)})}/></details></fieldset></details>;
}
