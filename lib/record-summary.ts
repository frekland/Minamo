import {compactTerminalSource} from './note-terminal';
import type {WorkspaceRecord} from './contracts';
/** Mechanical excerpt of an already eligible projection; no inferred purpose. */
export function recordSummary(record:WorkspaceRecord,limit=180){
 const opening=(record.family==='note'?compactTerminalSource(record.body):record.body)?.trim();
 const part=record.sections?.flatMap(section=>section.parts).find(part=>['paragraph','callout'].includes(part.kind)&&!part.unavailable&&!part.excerpt&&part.text.trim());
 const text=opening||part?.text||record.anchor?.quote||'';
 return {text:text.length>limit?text.slice(0,limit).trimEnd()+'…':text,origin:opening?'opening':part?'canonical-excerpt':record.anchor?.quote?'capture':'empty'} as const;
}
