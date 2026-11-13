import {alignedJapaneseRuns,type AnnotatedRun} from './japanese-furigana';
export type JapaneseToken={surface_form:string;word_type:string;reading?:string};
export function tokenReadingRuns(text:string,tokens:JapaneseToken[]):AnnotatedRun[]{
 const explicit=[...text.matchAll(/[\p{Script=Han}\p{Script=Hiragana}]+[（(][\p{Script=Hiragana}\p{Script=Katakana}ー]+[）)]/gu)].map(m=>({start:m.index,end:m.index+m[0].length}));
 const runs:AnnotatedRun[]=[];let at=0;
 for(let index=0;index<tokens.length;index++){
  let token=tokens[index];
  // IPADIC splits irregular counters into misleading character readings.
  // Join only exact complete compounds, never fragments of a larger word.
  const position=text.indexOf(token.surface_form,at);
  for(const [base,reading] of [['一人','ひとり'],['二人','ふたり'],['大人','おとな'],['今朝','けさ']] as const){
   if(position<at||!text.startsWith(base,position)||/\p{Script=Han}/u.test(text[position-1]??'')||/\p{Script=Han}/u.test(text[position+base.length]??''))continue;
   let surface='',last=index;while(last<tokens.length&&surface.length<base.length){surface+=tokens[last].surface_form;last++;}
   if(surface===base){token={surface_form:base,word_type:'KNOWN',reading};index=last-1;break;}
  }
  const start=text.indexOf(token.surface_form,at);if(!token.surface_form||start<at)return [{text}];
  if(start>at)runs.push({text:text.slice(at,start)});const end=start+token.surface_form.length;
  const reading=token.reading?.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
  const known=token.word_type==='KNOWN'&&reading&&/^[ぁ-ゖー]+$/.test(reading)&&!explicit.some(range=>range.start<end&&range.end>start);
  runs.push(...(known?alignedJapaneseRuns(token.surface_form,reading):[{text:token.surface_form}]));at=end;
 }
 if(at<text.length)runs.push({text:text.slice(at)});
 return runs.map(run=>run.text).join('')===text?runs:[{text}];
}
