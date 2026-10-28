import {canonicalReadingParts,type WorkspaceRecord,type Family,type RecordLink} from './contracts';
import {buildRecordLink} from './reading-links';
import {admitTrace} from './foundry/data-core';
import {admitOutputBundle} from './foundry/platform';

/** Ephemeral explanation of a literal match in an already rights-filtered record.
 * This is never persisted, semantic relevance, a permission grant or a substitute
 * for an exact reading. Offsets refer to the named eligible field, in UTF-16. */
export type SearchEvidence={
 record:{family:Family;id:string;rev:number;rendition?:string};
 query:string;matchedTerm:string;field:'title'|'body'|'section-title'|'passage'|'code'|'output'|'captured-quote'|'catalogue-summary'|'concept-term'|'concept-alias';
 kind:'whole-token'|'substring'|'exact-term'|'exact-alias'|'name-match';
 excerpt:string;excerptStart:number;excerptEnd:number;matchStart:number;matchEnd:number;partial:boolean;complete:boolean;
 sectionId?:string;partId?:string;destination:RecordLink;href:string;
 /** Match offsets belong to this readable field, never to serialized source. */
 projection?:{kind:'activity';blockId:string;field:string;label:string;coordinates:'display'};
};
type Candidate={text:string;field:SearchEvidence['field'];sectionId?:string;partId?:string;caseSensitive?:boolean;exact?:boolean;projection?:SearchEvidence['projection']};
const word=(value:string)=>/[\p{L}\p{N}_]/u.test(value);
const fold=(value:string)=>value.replace(/[A-Z]/g,char=>char.toLowerCase());
/** Search syntax accepts a surrounding pair of quotes as a literal phrase,
 * while preserving punctuation inside technical names and source coordinates. */
export function normaliseSearchQuery(query:string){const text=query.trim();const pairs:Record<string,string>={'"':'"',"'":"'",'“':'”','‘':'’'};return text.length>1&&pairs[text[0]]===text.at(-1)?text.slice(1,-1).trim():text;}
export function referenceNameMatch(reference:{term:string;aliases:string[];caseSensitive?:boolean},query:string){
 const needle=normaliseSearchQuery(query);if(!needle)return;
 const exact=(value:string)=>reference.caseSensitive===false?fold(value)===fold(needle):value===needle;
 let match:'term'|'alias'=exact(reference.term)?'term':'alias',matchedTerm=match==='term'?reference.term:reference.aliases.find(exact);
 if(matchedTerm)return {match,matchedTerm,discovery:'exact' as const};
 // Plain-name discovery is deliberately distinct from technical equivalence.
 // Options, symbols and compound command invocations retain authored case.
 if(!/^[A-Za-z0-9_]+$/.test(needle))return;
 const same=(value:string)=>/^[A-Za-z0-9_]+$/.test(value)&&fold(value)===fold(needle);
 match=same(reference.term)?'term':'alias';matchedTerm=match==='term'?reference.term:reference.aliases.find(same);
 if(matchedTerm)return {match,matchedTerm,discovery:'case-folded' as const};
}
export function searchEvidenceRank(evidence:SearchEvidence){return evidence.kind==='exact-term'?0:evidence.kind==='exact-alias'?1:evidence.kind==='name-match'?2:evidence.field==='title'&&evidence.kind==='whole-token'?3:evidence.field==='section-title'&&evidence.kind==='whole-token'?4:evidence.kind==='whole-token'?5:6;}
function boundary(text:string,start:number,end:number,query:string){
 // Symbols/commands keep literal matching; token boundaries only constrain a
 // word edge. `-r`, `task_done()` and `curl -I` retain their punctuation.
 return (!word(query[0]??'')||start===0||!word(Array.from(text.slice(0,start)).at(-1)??''))&&(!word(Array.from(query).at(-1)??'')||end===text.length||!word(Array.from(text.slice(end))[0]??''));
}
/** Ordinary text retains Unicode lowercase discovery; a map restores exact
 * source UTF-16 offsets when case conversion expands a code point (e.g. İ).
 * Canonical aliases keep their separately declared ASCII-only case contract. */
function unicodeFold(value:string){
 const folded=value.toLocaleLowerCase(),starts:number[]=[],ends:number[]=[];let offset=0;
 for(const point of value){const width=point.toLocaleLowerCase().length;for(let i=0;i<width;i++){starts.push(offset);ends.push(offset+point.length);}offset+=point.length;}
 return {folded,starts,ends};
}
function occurrence(candidate:Candidate,query:string){
 if(candidate.exact){const value=candidate.caseSensitive?candidate.text:fold(candidate.text),term=candidate.caseSensitive?query:fold(query);return value===term?{at:0,end:candidate.text.length,whole:true}:null;}
 const mapped=unicodeFold(candidate.text),term=query.toLocaleLowerCase();let first:{at:number;end:number;whole:boolean}|undefined;
 for(let index=mapped.folded.indexOf(term);index!==-1;index=mapped.folded.indexOf(term,index+Math.max(1,term.length))){const at=mapped.starts[index],end=mapped.ends[index+term.length-1];if(at===undefined||end===undefined)continue;const hit={at,end,whole:boundary(candidate.text,at,end,query)};if(hit.whole)return hit;if(!first)first=hit;}
 return first??null;
}
/** Explicit public fields only. Unknown artefact payloads are not recursively
 * searched: configuration, answers and oracles cannot become discovery data.
 * Input must already have passed current source/media/Activity rights checks. */
export function activitySearchCandidates(record:WorkspaceRecord):Candidate[]{
 const candidates:Candidate[]=[];
 const add=(blockId:string,field:string,label:string,text:string,partId=blockId)=>{if(text)candidates.push({text,field:field==='source'?'code':field==='narrative'?'passage':'output',sectionId:'activity',partId,projection:{kind:'activity',blockId,field,label,coordinates:'display'}})};
 for(const block of record.activity?.blocks??[]){
  if(['instruction','prediction','reflection'].includes(block.kind))continue; // Canonical plain-text passages already cover these.
  if(block.kind==='foundry'){
   const artefact=block.artefact,payload=artefact.payload,partId=block.id+'-source';
   try{
    if(artefact.kind==='text/plain-v1'&&payload&&typeof payload==='object'&&'text'in payload&&typeof payload.text==='string'&&payload.text===artefact.canonical.source)add(block.id,'narrative','Activity text',payload.text,partId);
    if(artefact.kind==='trace/external-v1'){
     const trace=admitTrace(payload);if(JSON.stringify(trace)!==artefact.canonical.source)continue;
     for(const event of trace.events)add(block.id,'event-'+event.sequence,'Supplied '+(event.kind==='command'?'command':event.kind==='stdout'?'output':event.kind),event.text,partId);
    }
    if(artefact.kind==='run/output-bundle-v1'){
     const bundle=admitOutputBundle(payload);if(JSON.stringify(bundle)!==artefact.canonical.source)continue;
     for(const [index,output] of bundle.outputs.entries())add(block.id,'output-'+index,'Supplied output',output.kind==='image'?output.alt:'text'in output?output.text:[output.columns.join('\t'),...output.rows.map(row=>row.join('\t'))].join('\n'),partId);
    }
    // Plain code/TeX is inspectable source. Structured JSON/HTML envelopes have
    // no generic searchable projection; author an explicit narrative instead.
    if(['math/tex-v1'].includes(artefact.kind))add(block.id,'source','Activity source',artefact.canonical.source,partId);
   }catch{/* Invalid/unsupported display payloads cannot contribute a hit. */}
  }
 }
 // Saved attempt evidence is already owner-scoped and current-rights filtered.
 const attempt=record.attempt;
 if(attempt){
  const addAttempt=(field:string,label:string,text:string)=>{if(text)candidates.push({text,field:'output',projection:{kind:'activity',blockId:'attempt',field,label,coordinates:'display'}})};
  if(attempt.prediction)addAttempt('prediction','Saved prediction',attempt.prediction);
  if(attempt.reflection)addAttempt('reflection','Saved reflection',attempt.reflection);
  for(const [index,evidence] of attempt.evidence.entries())addAttempt('evidence-'+index,evidence.classification==='learner-report'?'Learner report':'Supplied evidence',evidence.classification==='github-commit'?evidence.description:evidence.text);
 }
 return candidates;
}
function sourceCandidates(record:WorkspaceRecord,summary?:string,includeSourceText=false):Candidate[]{
 const result:Candidate[]=[];
 // Exact canonical aliases retain their declared case contract and destination.
 for(const concept of record.concepts??[]){result.push({text:concept.term,field:'concept-term',sectionId:concept.sectionId,partId:concept.partId,caseSensitive:concept.caseSensitive!==false,exact:true});for(const alias of concept.aliases)result.push({text:alias,field:'concept-alias',sectionId:concept.sectionId,partId:concept.partId,caseSensitive:concept.caseSensitive!==false,exact:true});}
 for(const {sectionId,part} of canonicalReadingParts(record)){
  if(part.unavailable||!includeSourceText&&(part.id==='__excerpt'||['excerpt','image','media'].includes(part.kind)))continue;
  // A foundry canonical part may serialize an entire typed envelope. Its
  // authorised readable fields are projected separately below.
  if(sectionId==='activity'&&record.activity?.blocks.some(block=>block.kind==='foundry'&&part.id===block.id+'-source'))continue;
  result.push({text:part.text,sectionId,partId:part.id,field:part.id==='__title'?'title':part.id==='__heading'?'section-title':part.id.startsWith('__body')?'body':'passage'});
 }
 result.push(...activitySearchCandidates(record));
 if(record.code)result.push({text:record.code,field:'code'});
 if(record.output)result.push({text:record.output,field:'output'});
 if(includeSourceText&&record.anchor?.quote)result.push({text:record.anchor.quote,field:'captured-quote'});
 if(summary)result.push({text:summary,field:'catalogue-summary'});
 return result;
}
/** Prefer a whole-token occurrence to an embedded substring within a record;
 * preserve all literal results and stable corpus pagination across records. */
export function recordSearchEvidence(record:WorkspaceRecord,query:string,options:{summary?:string;quoteOnly?:boolean;limit?:number;includeSourceText?:boolean}={}):SearchEvidence|undefined{
 const originalQuery=query;query=normaliseSearchQuery(query);if(!query)return;
 const candidates=options.quoteOnly?[{text:record.anchor?.quote??'',field:'captured-quote' as const}]:sourceCandidates(record,options.summary,options.includeSourceText);
 let selected:{candidate:Candidate;at:number;end:number;whole:boolean}|undefined;
 for(const candidate of candidates){const strict=occurrence(candidate,query);let found=strict;if(!found&&candidate.exact&&referenceNameMatch({term:candidate.text,aliases:[],caseSensitive:candidate.caseSensitive},query)?.discovery==='case-folded')found={at:0,end:candidate.text.length,whole:true};if(!found||!found.whole&&/^[A-Za-z0-9_]{1,3}$/.test(query))continue;const hit={candidate,...found};if(!selected||candidate.exact||found.whole&&!selected.whole)selected=hit;if(candidate.exact&&strict)break;}
 if(!selected)return;
 const {candidate,at,end:matchEnd,whole}=selected,limit=Math.max(query.length,Math.min(500,options.limit??280));let start=Math.max(0,at-Math.floor((limit-query.length)/3)),end=Math.min(candidate.text.length,start+limit);start=Math.max(0,Math.min(start,end-limit));
 // Avoid splitting a surrogate pair at the economical excerpt's boundaries.
 if(start>0&&/[\uDC00-\uDFFF]/.test(candidate.text[start]))start--;
 if(end<candidate.text.length&&/[\uD800-\uDBFF]/.test(candidate.text[end-1]))end++;
 const destination:RecordLink={family:record.family,id:record.id,...(record.rendition?{rendition:record.rendition}:{}),...(candidate.sectionId?{sectionId:candidate.sectionId}:{}),...(candidate.partId?{partId:candidate.partId}:{})};
 let href=buildRecordLink(destination,{...(record.rendition?{rendition:record.rendition}:{}),...(!candidate.exact&&!candidate.projection&&record.rendition&&candidate.sectionId&&candidate.partId?{selection:{sectionId:candidate.sectionId,partId:candidate.partId,start:at,end:matchEnd}}:{})});
 if(candidate.projection&&candidate.sectionId&&candidate.partId){const params=new URLSearchParams(href.slice(2));params.set('section',candidate.sectionId);params.set('part',candidate.partId);href='/?'+params;}
 if(candidate.sectionId&&candidate.exact){const params=new URLSearchParams(href.slice(2));params.set('section',candidate.sectionId);if(candidate.partId)params.set('part',candidate.partId);href='/?'+params;}
 const partial=start>0||end<candidate.text.length;
 return {record:{family:record.family,id:record.id,rev:record.rev,...(record.rendition?{rendition:record.rendition}:{})},query:originalQuery,matchedTerm:candidate.text.slice(at,matchEnd),field:candidate.field,kind:candidate.exact?(!occurrence(candidate,query)?'name-match':candidate.field==='concept-alias'?'exact-alias':'exact-term'):whole?'whole-token':'substring',excerpt:(start?'…':'')+candidate.text.slice(start,end)+(end<candidate.text.length?'…':''),excerptStart:start,excerptEnd:end,matchStart:at,matchEnd,partial,complete:!partial,...(candidate.projection?{projection:candidate.projection}:{}),...(candidate.sectionId?{sectionId:candidate.sectionId}:{}),...(candidate.partId?{partId:candidate.partId}:{}),destination,href};
}
const labels:Record<SearchEvidence['field'],string>={title:'title',body:'text',"section-title":'section title',passage:'passage',code:'code',output:'output',"captured-quote":'captured passage',"catalogue-summary":'catalogue summary',"concept-term":'canonical term',"concept-alias":'canonical alias'};
export function searchEvidenceLabel(evidence:SearchEvidence){return `${evidence.kind==='name-match'?'Name match (different case)':evidence.kind==='substring'?'Literal substring':evidence.kind==='exact-alias'?'Exact alias':evidence.kind==='exact-term'?'Exact term':'Whole-token match'} in ${evidence.projection?.label??labels[evidence.field]} · “${evidence.matchedTerm}”`;}
