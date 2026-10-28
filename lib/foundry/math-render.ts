import {admitMathExpression,mathFallback,type MathExpression} from './math';
export type MathRendition={status:'rendered';html:string;source:string;engine:string;classification:'authored-content';execution:'not-executed-by-minamo'}|{status:'fallback';source:string;text:string;error:string;classification:'authored-content';execution:'not-executed-by-minamo'};
/** Call only for a deliberately opened renderer. No CDN, macros shared between calls, or network/resource trust. */
export async function renderMath(input:MathExpression,output:'htmlAndMathml'|'mathml'='htmlAndMathml'):Promise<MathRendition>{
 const e=admitMathExpression(input);
 try{
  const katex=await import('katex');
  const html=katex.renderToString(e.source,{displayMode:e.display==='block',output,throwOnError:true,strict:'error',trust:false,maxExpand:256,maxSize:10,macros:{},globalGroup:false});
  if(html.length>262144)throw Error('Rendered equation exceeds 256 KiB.');
  return {status:'rendered',html,source:e.source,engine:'KaTeX '+katex.version,classification:'authored-content',execution:'not-executed-by-minamo'};
 }catch(error){return {status:'fallback',source:e.source,text:mathFallback(e),error:error instanceof Error?error.message:'Mathematical renderer unavailable.',classification:'authored-content',execution:'not-executed-by-minamo'};}
}
