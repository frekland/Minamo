import {tableCanonicalText} from './contracts';
import type {PassagePart} from './contracts';
export type ReadingCell={text:string;start:number;end:number};
export type ReadingTableMap={rows:{header:boolean;cells:ReadingCell[]}[];caption?:string};
/** Each semantic cell maps only its literal canonical slice; layout whitespace is never an offset. */
export function readingTableMap(part:PassagePart):ReadingTableMap|null{
 const table=part.table;if(part.kind!=='table'||!table||!Array.isArray(table.headers)||!Array.isArray(table.rows)||!table.headers.length||table.rows.some(row=>!Array.isArray(row)||row.length!==table.headers.length))return null;
 const lines=[table.headers,...table.rows];if(lines.some(row=>row.some(cell=>typeof cell!=='string'||/[\t\r\n]/.test(cell))))return null;
 if(tableCanonicalText(table)!==part.text)return null;
 let offset=0;const rows=lines.map((line,rowIndex)=>({header:rowIndex===0,cells:line.map((text,column)=>{const cell={text,start:offset,end:offset+text.length};offset=cell.end+(column<line.length-1?1:rowIndex<lines.length-1?1:0);return cell;})}));
 return offset===part.text.length?{rows,caption:table.caption}:null;
}
/** Merge mapped cell ranges using only explicit TSV delimiters, never visible table layout. */
export function extendCanonicalSegment(text:string,previous:{start:number;end:number},next:{start:number;end:number}):{start:number;end:number}|null{
 if(!Number.isSafeInteger(previous.start)||!Number.isSafeInteger(previous.end)||!Number.isSafeInteger(next.start)||!Number.isSafeInteger(next.end)||previous.start<0||previous.end<previous.start||next.start<previous.end||next.end<next.start||next.end>text.length)return null;
 const gap=text.slice(previous.end,next.start);if(gap&&!/^[\t\n]+$/.test(gap))return null;
 return{start:previous.start,end:next.end};
}
