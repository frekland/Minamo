import type {ArticleSection,PassagePart} from './contracts';
/** Explicit revision-time repair, never a display-time change to source offsets.
 * Existing native styling, semantics, source excerpts and code are untouched. */
export function repairProjectEmphasis(sections:ArticleSection[]):ArticleSection[]{
 return sections.map(section=>({...section,parts:section.parts.map(part=>{
  if(!['paragraph','callout'].includes(part.kind)||part.inline?.length||part.semantic||part.unavailable)return part;
  const spans:NonNullable<PassagePart['inline']>=[];let text='',at=0;
  for(const match of part.text.matchAll(/\*\*([^*\n]+)\*\*/g)){
   text+=part.text.slice(at,match.index);const start=text.length;text+=match[1];spans.push({start,end:text.length,kind:'strong'});at=match.index+match[0].length;
  }
  return spans.length?{...part,text:text+part.text.slice(at),inline:spans}:part;
 })}));
}
