import type {ArticleSection} from './contracts';

export type ReadingEditImpact={sectionId:string;sectionTitle:string;partId:string;beforeText:string;afterText:string|null;inlineRemoved:number;linksRemoved:number;semanticRemoved:'language'|'math'|null;readingsRemoved:number;phrasesRemoved:number};

/** A review projection only. It never guesses offsets, rewrites source or changes an edition. */
export function readingEditImpacts(original:ArticleSection[],next:ArticleSection[]):ReadingEditImpact[]{
 const impacts:ReadingEditImpact[]=[];
 for(const section of original)for(const before of section.parts){
  if(before.unavailable)continue;
  const after=next.find(value=>value.id===section.id)?.parts.find(value=>value.id===before.id);
  const inlineRemoved=Math.max(0,(before.inline?.length??0)-(after?.inline?.length??0));
  const linksRemoved=Math.max(0,(before.inline?.filter(value=>value.kind==='link').length??0)-(after?.inline?.filter(value=>value.kind==='link').length??0));
  const semanticRemoved=before.semantic&&!after?.semantic?(before.semantic.kind==='ruby'?'language':'math'):null;
  if(!inlineRemoved&&!semanticRemoved)continue;
  impacts.push({sectionId:section.id,sectionTitle:section.title,partId:before.id,beforeText:before.text,afterText:after?.text??null,inlineRemoved,linksRemoved,semanticRemoved,readingsRemoved:semanticRemoved==='language'&&before.semantic?.kind==='ruby'?before.semantic.language.spans.length:0,phrasesRemoved:semanticRemoved==='language'&&before.semantic?.kind==='ruby'?(before.semantic.language.phrases?.length??0):0});
 }
 return impacts;
}

/** Any changed text/impact invalidates an earlier acknowledgement, including restored drafts. */
export function readingEditReviewToken(impacts:ReadingEditImpact[]):string{return JSON.stringify(impacts);}
