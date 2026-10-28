import type {WorkspaceRecord,ConceptMatch} from './contracts';
import type {LibraryItem} from './catalogue';
import type {SearchEvidence} from './search-evidence';
import {workspaceGenerationFromScope,WorkspaceGenerationChanged} from './workspace-generation';

export type SearchPage={libraryMatches?:LibraryItem[];libraryMatchesTruncated?:boolean;libraryMatchesCursor?:string|null;records:WorkspaceRecord[];matchEvidence?:SearchEvidence[];nextCursor?:string|null;searchIncomplete?:boolean;continuationKind?:'scan'|'matches'|null;truncated?:boolean;error?:string;generation?:string;conceptMatches?:ConceptMatch[];conceptMatchesTruncated?:boolean};
export const SEARCH_AUTO_SCAN_LIMIT=3;
export function searchCoverageIncomplete(page:Pick<SearchPage,'nextCursor'|'searchIncomplete'|'continuationKind'>){return !!page.nextCursor&&(page.searchIncomplete===true||page.continuationKind==='scan');}
/** A finite burst skips empty scan windows, not arbitrary result pages. Each
 * server call retains its existing two-MB work bound and exact fenced cursor. */
export async function continueSearchWindow(read:(cursor?:string)=>Promise<SearchPage>,options:{scope:string;signal:AbortSignal;isCurrent:()=>boolean;cursor?:string}){
 const expected=workspaceGenerationFromScope(options.scope),seen=new Set<string>();let cursor=options.cursor,first:SearchPage|undefined,last:SearchPage|undefined,calls=0;
 const current=()=>{options.signal.throwIfAborted();if(!options.isCurrent())throw new DOMException('Search was replaced.','AbortError');};
 for(let index=0;index<SEARCH_AUTO_SCAN_LIMIT;index++){
  current();const page=await read(cursor);current();
  if(page.generation!==expected)throw new WorkspaceGenerationChanged();
  if(!Array.isArray(page.records))throw Error('Search returned an invalid page. Retry the search.');
  first??=page;last=page;calls++;
  if(page.records.length||((first.conceptMatches?.length??0)+(first.libraryMatches?.length??0))>0||!searchCoverageIncomplete(page))break;
  const next=page.nextCursor!;if(seen.has(next)||next===cursor)throw Error('Search continuation did not advance. Retry the search.');seen.add(next);cursor=next;
 }
 return {...last!,libraryMatches:first?.libraryMatches??[],libraryMatchesTruncated:!!first?.libraryMatchesTruncated,libraryMatchesCursor:first?.libraryMatchesCursor,conceptMatches:first?.conceptMatches??[],conceptMatchesTruncated:!!first?.conceptMatchesTruncated,autoScanCalls:calls};
}
export function showCompletedSearchEmpty(input:{records:number;concepts:number;loading:boolean;error?:string;cursor?:string|null;incomplete:boolean}){return !input.records&&!input.concepts&&!input.loading&&!input.error&&!input.cursor&&!input.incomplete;}
