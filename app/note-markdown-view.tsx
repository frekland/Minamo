import {createElement} from 'react';
import type {HTMLAttributes,ReactNode} from 'react';
import NoteTerminalView from './note-terminal-view';
import ReadingImageView from './reading-image';
import {noteImageSegments} from '../lib/note-image-placement';
import type {PassagePart} from '../lib/contracts';
import {parseNoteMarkdown,type NoteMarkdownRun} from '../lib/note-markdown';
import {noteVideoReference} from '../lib/note-video';
import ExternalVideoCard from './external-video';
/** Mapped ranges are canonical VISIBLE-text coordinates, not Markdown-source indices. */
export default function NoteMarkdownView({source,mapRange,renderRange,imageParts,ownerScope,renderCodeDecoration,synthetic}:{renderCodeDecoration?:(language:string,source:string)=>ReactNode;source:string;imageParts?:PassagePart[];ownerScope?:string;renderRange?:(start:number,end:number,text:string)=>ReactNode;mapRange?:(start:number,end:number)=>HTMLAttributes<HTMLSpanElement>;synthetic?:boolean}){
 const segments=imageParts?noteImageSegments(source,imageParts):[];
 if(segments.some(segment=>segment.kind==='image'))return <div className="nw-markdown nw-inline-preview">{segments.map((segment,index)=>segment.kind==='text'?<NoteMarkdownView key={index} source={segment.source} renderCodeDecoration={renderCodeDecoration} synthetic={synthetic}/>:segment.part.image?<ReadingImageView key={segment.part.id} assetId={segment.part.image.assetId} ownerScope={ownerScope} alt={segment.part.image.alt} caption={segment.part.image.caption} description={segment.part.image.alt}/>:null)}</div>;
 const blocks=parseNoteMarkdown(source);
 // Only explicitly synthetic Lab frontmatter may move into a disclosure.
 // The original Markdown blocks and canonical text coordinates are untouched.
 const frontmatter=synthetic&&blocks[0]?.kind==='heading'&&/\bTEST ONLY\b/i.test(blocks[0].text)&&blocks[1]?.kind==='paragraph'&&/^Provenance\./i.test(blocks[1].text)?2:0;
 const renderRuns=(runs:NoteMarkdownRun[],codeBlock=false)=>runs.map((run,i)=>{let node:ReactNode=renderRange?renderRange(run.start,run.end,run.text):run.text;if(run.code&&!codeBlock)node=<code>{node}</code>;if(run.bold)node=<strong>{node}</strong>;if(run.italic)node=<em>{node}</em>;if(run.href)node=<a href={run.href} target="_blank" rel="noopener noreferrer">{node}</a>;return <span key={i} {...mapRange?.(run.start,run.end)}>{node}</span>});
 const rendered=blocks.map((block,index)=>{
  const standaloneLink=block.kind==='paragraph'&&block.runs.length&&block.runs.every(run=>run.href&&run.href===block.runs[0].href)?block.runs[0].href:undefined;
  const video=block.kind==='paragraph'?noteVideoReference(standaloneLink??block.text):null,content=renderRuns(block.runs,block.kind==='code');
  const table=block.kind==='table'&&block.rows?<div className="nw-md-table-scroll"><table><thead><tr>{block.rows[0].cells.map((cell,i)=><th scope="col" key={i}>{renderRuns(cell)}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row,i)=><tr key={i}>{row.cells.map((cell,j)=><td key={j}>{renderRuns(cell)}</td>)}</tr>)}</tbody></table></div>:null;
  return <div className={'nw-md-block nw-md-'+block.kind} key={index}>{table??(block.kind==='terminal'&&block.capture?<NoteTerminalView capture={block.capture}>{content}</NoteTerminalView>:block.kind==='heading'?createElement('h'+Math.min(6,(block.level??1)+1),{},content):block.kind==='code'?<>{renderCodeDecoration?.(block.language??'',block.runs.map(r=>r.text).join(''))}<span className="nw-code-language">{block.language||'Code'}</span><pre><code>{content}</code></pre></>:block.kind==='quote'?<blockquote>{content}</blockquote>:block.kind==='list-item'?<ul><li>{content}</li></ul>:<p>{content}</p>)}{video&&<ExternalVideoCard video={video.video} referenceUrl={video.referenceUrl} label="Note video"/>}{index<blocks.length-1&&mapRange?<span {...mapRange(block.end,block.end+1)}>{'\n'}</span>:null}</div>;
 });
 const disclosure=frontmatter>0?<details className="nw-synthetic-details"><summary>Source and provenance</summary>{rendered.slice(0,frontmatter)}</details>:null;
 // A mapped Reader must retain DOM/source order for cross-block selections.
 // Unmapped work-card previews can place the disclosure after the narrative.
 return <div className="nw-markdown">{mapRange&&disclosure}{rendered.slice(frontmatter)}{!mapRange&&disclosure}</div>;
}
