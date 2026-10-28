import type {CodeToken} from './reader-code-syntax';
/** Linear merge of ordered CM6 syntax ranges and literal source lines. No newline conversion. */
export function codeLines(text:string,tokens:CodeToken[]){
 const lines=text.match(/[^\n]*\n|[^\n]+$/g)??[''];if(text.endsWith('\n'))lines.push('');
 let offset=0,index=0;
 return lines.map(line=>{const start=offset,end=start+line.length;offset=end;const ranges:{from:number;to:number;className?:string}[]=[];let cursor=start;
  while(index<tokens.length&&tokens[index].to<=start)index++;
  while(index<tokens.length&&tokens[index].from<end){const token=tokens[index],from=Math.max(cursor,token.from),to=Math.min(end,token.to);if(from>cursor)ranges.push({from:cursor,to:from});if(to>from)ranges.push({from,to,className:token.className});cursor=Math.max(cursor,to);if(token.to>end)break;index++;}
  if(cursor<end)ranges.push({from:cursor,to:end});return{start,end,ranges};
 });
}
