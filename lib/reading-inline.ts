/** Styling only: offsets refer to the existing literal UTF-16 passage text. */
export type ReadingInline={start:number;end:number;kind:'strong'|'emphasis'|'code'|'link';url?:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
function boundary(text:string,offset:number){return Number.isSafeInteger(offset)&&offset>=0&&offset<=text.length&&!(offset>0&&offset<text.length&&/[\uD800-\uDBFF]/.test(text[offset-1])&&/[\uDC00-\uDFFF]/.test(text[offset]));}
export function readingInlineError(text:string,value:unknown):string|null{
 if(!Array.isArray(value)||value.length>200)return 'Use at most 200 exact inline spans per passage.';
 const seen=new Set<string>();
 for(const span of value){
  if(!object(span)||Object.keys(span).some(key=>!['start','end','kind','url'].includes(key))||!['strong','emphasis','code','link'].includes(String(span.kind))||typeof span.start!=='number'||typeof span.end!=='number'||!boundary(text,span.start)||!boundary(text,span.end)||span.end<=span.start)return 'Inline styling requires nonempty exact UTF-16 ranges without splitting a Unicode character.';
  if(span.kind==='link'){
   if(typeof span.url!=='string'||span.url.length>2048)return 'Inline links need a bounded HTTPS destination.';
   try{const url=new URL(span.url);if(url.protocol!=='https:'||url.username||url.password||/[\u0000-\u0020\u007F]/.test(span.url))return 'Inline links require HTTPS without credentials or controls.';}catch{return 'Inline links need a valid HTTPS destination.';}
  }else if(span.url!==undefined)return 'Only link styling may include a destination.';
  const key=JSON.stringify([span.start,span.end,span.kind,span.url]);if(seen.has(key))return 'Duplicate inline spans are unavailable.';seen.add(key);
 }
 return null;
}
/** Safe segmentation permits nested/crossing emphasis while never nesting anchors. */
export function inlineSegments(text:string,inline:ReadingInline[]|undefined,from=0,to=text.length,extraCuts:number[]=[]){
 const spans=inline&&!readingInlineError(text,inline)?inline:[];
 const cuts=[from,to,...spans.flatMap(s=>[s.start,s.end]),...extraCuts].filter(n=>n>=from&&n<=to).filter((n,i,a)=>a.indexOf(n)===i).sort((a,b)=>a-b);
 return cuts.slice(0,-1).map((start,i)=>({start,end:cuts[i+1],text:text.slice(start,cuts[i+1]),styles:spans.filter(s=>s.start<=start&&s.end>=cuts[i+1])}));
}
