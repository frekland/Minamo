import {parseNoteTerminalPlacements,terminalDisplayText,type TerminalCapture} from './note-terminal';
/** Small, versioned Markdown codec. Original source remains authoritative; projection is deterministic visible text with LF line endings, including code, so server HTML parsing cannot change coordinates. */
export type NoteMarkdownRun={text:string;start:number;end:number;bold?:boolean;italic?:boolean;code?:boolean;href?:string};
export type NoteMarkdownTableRow={header:boolean;cells:NoteMarkdownRun[][]};
export type NoteMarkdownBlock={kind:'paragraph'|'heading'|'list-item'|'quote'|'code'|'terminal'|'table';capture?:TerminalCapture;level?:number;language?:string;text:string;start:number;end:number;runs:NoteMarkdownRun[];rows?:NoteMarkdownTableRow[]};
export function safeNoteLink(value:string){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:undefined}catch{return undefined}}
function inline(source:string,marks:Partial<NoteMarkdownRun>={},depth=0):Omit<NoteMarkdownRun,'start'|'end'>[]{
 const out:Omit<NoteMarkdownRun,'start'|'end'>[]=[];const push=(text:string,extra:Partial<NoteMarkdownRun>={})=>{if(text)out.push({text,...marks,...extra})};let plain='';const flush=()=>{push(plain);plain=''};
 for(let i=0;i<source.length;){if(source[i]==='\\'&&i+1<source.length){plain+=source[i+1];i+=2;continue}if(depth<6){const token=source.startsWith('**',i)?'**':source.startsWith('__',i)?'__':source[i]==='*'?'*':source[i]==='_'?'_':source[i]==='`'?'`':undefined;if(token){const end=source.indexOf(token,i+token.length);if(end>i+token.length){flush();const text=source.slice(i+token.length,end);if(token==='`')push(text,{code:true});else out.push(...inline(text,{...marks,...(token.length===2?{bold:true}:{italic:true})},depth+1));i=end+token.length;continue}}if(source[i]==='['){const close=source.indexOf('](',i+1),end=close>=0?source.indexOf(')',close+2):-1;if(close>i+1&&end>close+2){const href=safeNoteLink(source.slice(close+2,end));if(href){flush();out.push(...inline(source.slice(i+1,close),{...marks,href},depth+1));i=end+1;continue}}}}plain+=source[i++];}flush();return out;
}
/** A deliberately small, safe GFM-style table subset. No raw HTML and no
 * permissive parser dependency; unsupported syntax stays ordinary Note text. */
function tableCells(line:string):string[]{
 const value=line.trim().replace(/^\|/,'').replace(/(?<!\\)\|$/,'');
 const cells:string[]=[],parts:string[]=[];let code=false;
 for(let i=0;i<value.length;i++){
  const c=value[i];if(c==='`'&&(i===0||value[i-1]!=='\\'))code=!code;
  if(c==='|'&&!code&&(i===0||value[i-1]!=='\\')){cells.push(parts.join('').trim());parts.length=0;}else parts.push(c);
 }
 cells.push(parts.join('').trim());return cells;
}
function isTableHeader(header:string,divider:string){const columns=tableCells(header),rules=tableCells(divider);return columns.length>=2&&columns.length<=12&&rules.length===columns.length&&rules.every(rule=>/^:?-{3,}:?$/.test(rule));}
export function parseNoteMarkdown(source:string):NoteMarkdownBlock[]{
 const lines=[...source.matchAll(/([^\r\n]*)(\r\n|\r|\n|$)/g)].filter(match=>match[0].length>0);const raw:{capture?:TerminalCapture;kind:NoteMarkdownBlock['kind'];level?:number;language?:string;source:string;table?:string[][]}[]=[];let paragraph:string[]=[];const flush=()=>{if(paragraph.length){raw.push({kind:'paragraph',source:paragraph.join('\n')});paragraph=[]}};
 const terminals=new Map(parseNoteTerminalPlacements(source).map(p=>[p.from,p.capture]));
 for(let i=0;i<lines.length;i++){const capture=terminals.get(lines[i].index!);if(capture){flush();raw.push({kind:'terminal',capture,source:terminalDisplayText(capture.output)});continue}const text=lines[i][1],fence=/^\s*```([^`]*)$/.exec(text);if(fence){flush();let code='';while(++i<lines.length&&!/^\s*```\s*$/.test(lines[i][1]))code+=lines[i][1]+(lines[i][2]?'\n':'');raw.push({kind:'code',source:code,...(fence[1].trim()?{language:fence[1].trim().slice(0,40)}:{})});continue}if(!text.trim()){flush();continue}if(i+1<lines.length&&isTableHeader(text,lines[i+1][1])){flush();const columnCount=tableCells(text).length,rows=[tableCells(text)],sourceLines=[text,lines[i+1][1]];i++;while(i+1<lines.length&&rows.length<81&&lines[i+1][1].includes('|')&&lines[i+1][1].trim()){const cells=tableCells(lines[i+1][1]);if(cells.length!==columnCount)break;rows.push(cells);sourceLines.push(lines[i+1][1]);i++;}raw.push({kind:'table',source:sourceLines.join('\n'),table:rows});continue}const heading=/^(#{1,6})\s+(.+)$/.exec(text);if(heading){flush();raw.push({kind:'heading',level:heading[1].length,source:heading[2]});continue}const bullet=/^\s*[-*+]\s+(.+)$/.exec(text);if(bullet){flush();raw.push({kind:'list-item',source:bullet[1]});continue}const quote=/^>\s?(.*)$/.exec(text);if(quote){flush();raw.push({kind:'quote',source:quote[1]});continue}paragraph.push(text)}flush();
 let offset=0;return raw.map((block,index)=>{if(index)offset++;const start=offset;
  if(block.kind==='table'&&block.table){
   // The canonical projection is EXACTLY what the original paragraph parser
   // produced: include every pipe and delimiter line. Existing passage offsets
   // and retained renditions cannot be rewritten just to improve presentation.
   const runs=inline(block.source).map(run=>{const start=offset;offset+=run.text.length;return {...run,start,end:offset}}),text=runs.map(run=>run.text).join(''),rows:NoteMarkdownTableRow[]=[];
   let cursor=0;
   for(const [rowIndex,cells] of block.table.entries()){
    const mapped=cells.map(cell=>{const visible=inline(cell).map(run=>run.text).join('');if(!visible)return [];
     const found=text.indexOf(visible,cursor);if(found<0)return [];cursor=found+visible.length;
     const from=start+found,to=from+visible.length;
     return runs.flatMap(run=>{const a=Math.max(from,run.start),b=Math.min(to,run.end);return b>a?[{...run,text:run.text.slice(a-run.start,b-run.start),start:a,end:b}]:[]});
    });rows.push({header:rowIndex===0,cells:mapped});
   }
   return {kind:'table' as const,text,start,end:offset,runs,rows};
  }
  const runs=((block.kind==='code'||block.kind==='terminal')?[{text:block.source,code:true}]:inline(block.source)).map(run=>{const start=offset;offset+=run.text.length;return {...run,start,end:offset}});return {...block,text:runs.map(run=>run.text).join(''),start,end:offset,runs};
 });
}
export function noteMarkdownText(source:string){return parseNoteMarkdown(source).map(block=>block.text).join('\n')}
export type NoteFormatAction='bold'|'italic'|'heading'|'bullet'|'quote'|'code'|'link';
/** Exact source syntax at the selection, used by accessible toolbar toggles. */
export function noteFormatActive(source:string,from:number,to:number,action:NoteFormatAction){
 if(action==='bold'||action==='italic'){const token=action==='bold'?'**':'*',selected=source.slice(from,to),before=/\*+$/.exec(source.slice(0,from))?.[0].length??0,after=/^\*+/.exec(source.slice(to))?.[0].length??0,leading=/^\*+/.exec(selected)?.[0].length??0,trailing=/\*+$/.exec(selected)?.[0].length??0;const paired=(left:number,right:number)=>action==='bold'?left>=2&&right>=2:left%2===1&&right%2===1;return paired(before,after)||(selected.length>token.length*2&&paired(leading,trailing));}
 const lineStart=source.lastIndexOf('\n',Math.max(0,from-1))+1,lineEnd=source.indexOf('\n',to);const lines=source.slice(lineStart,lineEnd<0?source.length:lineEnd).split('\n');const prefix=action==='heading'?'## ':action==='bullet'?'- ':action==='quote'?'> ':null;return !!prefix&&lines.every(line=>line.startsWith(prefix));
}
/** Selection-relative transaction, applied by CodeMirror as one undoable user command. */
export function noteFormatChange(source:string,from:number,to:number,action:NoteFormatAction,language='text',href='https://'){
 const selected=source.slice(from,to);if((action==='bold'||action==='italic')&&noteFormatActive(source,from,to,action)){const token=action==='bold'?'**':'*';const around=from>=token.length&&source.slice(from-token.length,from)===token&&source.slice(to,to+token.length)===token;const start=around?from-token.length:from,end=around?to+token.length:to,insert=around?selected:selected.slice(token.length,-token.length);return {from:start,to:end,insert,selectionFrom:start,selectionTo:start+insert.length};}if(['heading','bullet','quote'].includes(action)&&noteFormatActive(source,from,to,action)){const start=source.lastIndexOf('\n',Math.max(0,from-1))+1,next=source.indexOf('\n',to),end=next<0?source.length:next,prefix=action==='heading'?'## ':action==='bullet'?'- ':'> ',insert=source.slice(start,end).split('\n').map(line=>line.slice(prefix.length)).join('\n');return {from:start,to:end,insert,selectionFrom:start,selectionTo:start+insert.length};}const placeholder=selected||({heading:'Heading',bullet:'List item',quote:'Quote',code:'Your code',link:'Link text',bold:'bold text',italic:'italic text'})[action];let insert='',selectionFrom=from,selectionTo=to;
 if(action==='bold'||action==='italic'){const token=action==='bold'?'**':'*';insert=token+placeholder+token;selectionFrom=from+token.length;selectionTo=selectionFrom+placeholder.length}
 else if(action==='link'){if(!safeNoteLink(href))throw Error('Use an HTTPS link without credentials.');insert='['+placeholder+']('+href+')';selectionFrom=from+1;selectionTo=selectionFrom+placeholder.length}
 else if(action==='code'){const prefix=(from>0&&source[from-1]!=='\n'?'\n':'')+'```'+language.replace(/[^\w.+-]/g,'').slice(0,40)+'\n';insert=prefix+placeholder+(placeholder.endsWith('\n')?'':'\n')+'```\n';selectionFrom=from+prefix.length;selectionTo=selectionFrom+placeholder.length}
 else{const prefix=action==='heading'?'## ':action==='bullet'?'- ':'> ';insert=(from>0&&source[from-1]!=='\n'?'\n':'')+placeholder.split('\n').map(line=>prefix+line).join('\n');selectionFrom=from;selectionTo=from+insert.length}
 return {from,to,insert,selectionFrom,selectionTo};
}
