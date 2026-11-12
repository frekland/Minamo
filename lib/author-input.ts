import {admitSemanticContent,semanticCanonicalText} from './semantic-content';
import {DomainError} from './domain';
import {tableCanonicalText,imageCanonicalText,mediaCanonicalText} from './contracts';
import {diagramCanonicalText,diagramError} from './diagrams';
import {compileNoteContent} from './note-content';
/** Clone first: compilation never changes a caller's retained draft. Only structured codecs derive text. */
export function compileAuthorData(input:Record<string,unknown>){
 const data=structuredClone(input) as any;
 if(data.noteContent!==undefined){
  if(data.body!==undefined||data.bodyFormat!==undefined&&data.bodyFormat!=='markdown-v1')throw new DomainError(400,'invalid_note_content','Use data.noteContent without data.body; the compiler derives markdown-v1 without truncation.','data.noteContent');
  try{data.body=compileNoteContent(data.noteContent);data.bodyFormat='markdown-v1';delete data.noteContent;}catch(error){throw new DomainError(400,'invalid_note_content',(error as Error).message,'data.noteContent');}
 }
 if(!Array.isArray(data.sections))return data;
 for(let si=0;si<data.sections.length;si++){
  const section=data.sections[si];if(!section||!Array.isArray(section.parts))continue;
  for(let pi=0;pi<section.parts.length;pi++){
   const part=section.parts[pi];if(!part||typeof part!=='object')continue;
   const path=`data.sections[${si}].parts[${pi}]`;
   try{
    let canonical:string|undefined;
    if(part.semantic!==undefined)canonical=semanticCanonicalText(admitSemanticContent(part.semantic));
    if(part.kind==='table'&&part.table&&Array.isArray(part.table.headers)&&Array.isArray(part.table.rows)&&part.table.rows.every((r:unknown)=>Array.isArray(r)))canonical=tableCanonicalText(part.table);
    if(part.kind==='diagram'&&part.diagram){const error=diagramError(part.diagram);if(error)throw new DomainError(400,'invalid_diagram',error,path+'.diagram');canonical=diagramCanonicalText(part.diagram);}
    if(part.kind==='image'&&part.image&&typeof part.image.alt==='string')canonical=imageCanonicalText(part.image);
    if(part.kind==='media'&&part.media&&typeof part.media.description==='string')canonical=mediaCanonicalText(part.media);
    if(canonical!==undefined){if(part.text===undefined)part.text=canonical;else if(part.text!==canonical)throw new DomainError(400,'noncanonical_'+part.kind,'Explicit text must match the structured canonical projection.',path+'.text');}
   }catch(error){if(error instanceof DomainError)throw error;throw new DomainError(400,'invalid_part','Malformed structured content block.',path);}
  }
 }
 return data;
}
