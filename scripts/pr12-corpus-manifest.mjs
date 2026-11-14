import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const dir='tests/corpus/pr12/';
const sources=['making-friends-japanese-20261112','japanese-speaking-practice-20261113'].map(id=>{
 const file=id+'.json',bytes=readFileSync(dir+file),record=JSON.parse(bytes).record,parts=record.sections.flatMap(s=>s.parts);
 return {file,id,family:record.family,title:record.title,rev:record.rev,rendition:record.rendition,sha256:createHash('sha256').update(bytes).digest('hex'),sections:record.sections.length,parts:parts.length,cards:parts.reduce((n,p)=>n+(p.interactive?.cards?.length??0),0),turns:parts.reduce((n,p)=>n+(p.interactive?.turns?.length??0),0)};
});
writeFileSync(dir+'manifest.json',JSON.stringify({version:1,extractedAt:'2026-11-13T23:50:00Z',method:'Connected Minamo query_minamo_records then read_minamo_record; structuredContent saved verbatim as JSON; timestamp rounded to extraction minute',sources,completeness:'Complete current owner-eligible canonical record projections including Project compositions and all returned rich parts. Numeric revision and rendition are as returned, not invented.',omissions:['No historical editions requested in snapshot v1; only current saved revisions available in these files.','No unsaved conversation transcripts, inferred dates or inferred per-part authors.','No external media bytes or learner contributions stored separately from Project records were extracted.','Snapshot contains owner-authorised personal learning exchanges; no remote licensed article or credentials included.']},null,2)+'\n');
console.log(JSON.stringify(sources));
