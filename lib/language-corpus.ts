import {canonicalReadingParts,type WorkspaceRecord} from './contracts';
import {admitLanguageText,languageLexicalIdentity,type LanguageText,type LanguageSpan} from './foundry/language';
import {buildRecordLink} from './reading-links';

export type LanguageOccurrence={key:string;title:string;family:WorkspaceRecord['family'];id:string;rendition:string;sectionId:string;partId:string;start:number;end:number;quote:string;context:string;reading:string;gloss?:string;lemma?:string;senseId?:string;language:string;script?:string;href:string};
/** Consumes current-rights server projections only. No substring inference of a lexical sense. */
export function languageOccurrences(records:WorkspaceRecord[],content:LanguageText,span:LanguageSpan):LanguageOccurrence[]{
 const identity=languageLexicalIdentity(content,span),found:LanguageOccurrence[]=[];
 for(const record of records){
  if(record.trashedAt||!record.rendition||record.family==='source'||record.family==='note'||record.family==='run')continue;
  for(const {sectionId,part} of canonicalReadingParts(record)){
   if(part.unavailable||part.kind==='excerpt'||part.semantic?.kind!=='ruby')continue;
   let language:LanguageText;try{language=admitLanguageText(part.semantic.language);if(language.text!==part.text)continue;}catch{continue;}
   for(const candidate of language.spans){
    if(languageLexicalIdentity(language,candidate)!==identity)continue;
    const key=JSON.stringify([record.family,record.id,record.rendition,sectionId,part.id,candidate.start]);
    found.push({key,title:record.title,family:record.family,id:record.id,rendition:record.rendition,sectionId,partId:part.id,start:candidate.start,end:candidate.end,quote:candidate.base,context:language.text,reading:candidate.reading,...(candidate.gloss?{gloss:candidate.gloss}:{}),...(candidate.lemma?{lemma:candidate.lemma}:{}),...(candidate.senseId?{senseId:candidate.senseId}:{}),language:language.language,...(language.sourceScript?{script:language.sourceScript}:{}),href:buildRecordLink(record,{rendition:record.rendition,selection:{sectionId,partId:part.id,start:candidate.start,end:candidate.end}})});
    if(found.length===128)return found;
   }
  }
 }
 return found;
}
