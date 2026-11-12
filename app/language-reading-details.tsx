'use client';
import type {LanguageText} from '../lib/foundry/language';
/** Teaching metadata is deliberately outside canonical source/capture containers. */
export function LanguageReadingDetails({content}:{content:LanguageText}){
 const proposals=content.spans.some(span=>span.origin==='machine-proposed');
 return <div data-language-decoration="true" data-foundry-decoration="true" className="minamo-language-details" style={{fontSize:'.9em',lineHeight:1.65,overflowWrap:'anywhere'}}>
  {proposals&&<p role="note"><strong>Provisional pronunciation proposals.</strong> Machine suggestions need contextual review; they are not verified pronunciations.</p>}
  {content.translation&&<details><summary>Show translation</summary><p lang={content.translation.language} dir={content.translation.direction} style={{whiteSpace:'pre-wrap',unicodeBidi:'isolate'}}>{content.translation.text}</p><small>{content.translation.provenance==='authored-translation'?'Authored translation':'Supplied translation'}{content.translation.source?` · ${content.translation.source}`:''}. Translation has independent text coordinates.</small></details>}
  {(content.pronunciation||content.grammar||content.spans.length>0)&&<details><summary>Pronunciation, grammar and provenance</summary>
   {content.pronunciation&&<p><strong>Pronunciation guidance:</strong> {content.pronunciation}</p>}
   {content.grammar&&<p><strong>Grammar:</strong> {content.grammar}</p>}
   {!!content.spans.length&&<dl>{content.spans.map(span=><div key={span.start} style={{marginBlock:'.7rem'}}><dt lang={content.language}><strong>{span.base}</strong> · {span.reading}</dt><dd style={{marginInlineStart:'1rem'}}>{span.gloss&&<span>{span.gloss}. </span>}{span.grammar&&<span>{span.grammar} </span>}<small>{span.origin==='machine-proposed'?'Provisional machine proposal':'Authored contextual pronunciation'}{span.source?` · ${span.source}`:''}; source range [{span.start}, {span.end}).</small></dd></div>)}</dl>}
  </details>}
 </div>;
}
