/** Lossless markdown-v1 extension. A standalone JSON marker is an atomic Note block,
 * never Markdown, HTML, shell code or a claim that Minamo executed anything. */
export type TerminalCapture={id:string;output:string;label?:string;command?:string;environment?:string};
export const TERMINAL_PROVENANCE='Learner-provided external terminal evidence';
export const NOTE_BODY_LIMIT=24000;
const prefix='[[minamo-terminal:v1:';
const identity=/^[A-Za-z0-9_-]{1,160}$/;
export function createTerminalCapture(input:TerminalCapture):TerminalCapture{
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('terminalCapture must be an object with id and output.');
 for(const key of Object.keys(input))if(!['id','output','label','command','environment'].includes(key))throw Error(`Unsupported terminalCapture.${key}; allowed fields: id, output, label, command, environment.`);
 if(typeof input.id!=='string'||!identity.test(input.id))throw Error('terminalCapture.id must be 1–160 letters, digits, underscores or hyphens.');
 if(typeof input.output!=='string'||!input.output.length)throw Error('terminalCapture.output must contain the supplied terminal text.');
 const result:TerminalCapture={id:input.id,output:input.output};
 for(const key of ['label','command','environment'] as const){const value=input[key],limit=key==='command'?1000:160;if(value!==undefined){if(typeof value!=='string'||value.length>limit)throw Error(`terminalCapture.${key} must be at most ${limit} characters.`);if(value)result[key]=value;}}
 return result;
}
export function terminalCaptureMarker(input:TerminalCapture){return prefix+JSON.stringify(createTerminalCapture(input))+']]';}
export function parseNoteTerminalPlacements(source:string){
 const out:{capture:TerminalCapture;from:number;to:number}[]=[];let fence:{character:string;length:number}|undefined;
 for(const line of source.matchAll(/[^\r\n]*(?:\r\n|\r|\n|$)/g)){const text=line[0].replace(/[\r\n]+$/,'');if(!line[0])continue;const match=/^\s*(`{3,}|~{3,})(.*)$/.exec(text);if(match){if(!fence)fence={character:match[1][0],length:match[1].length};else if(match[1][0]===fence.character&&match[1].length>=fence.length&&!match[2].trim())fence=undefined;continue;}if(fence||!text.startsWith(prefix)||!text.endsWith(']]'))continue;try{const capture=createTerminalCapture(JSON.parse(text.slice(prefix.length,-2)));out.push({capture,from:line.index!,to:line.index!+text.length})}catch{/* Invalid markers remain ordinary source; shared writes reject them. */}}
 return out;
}
export function validateNoteTerminalCaptures(source:string){const placements=parseNoteTerminalPlacements(source),ids=new Set<string>();for(const {capture} of placements){if(ids.has(capture.id))throw Error('Each terminal capture in a Note requires a distinct id.');ids.add(capture.id);}let markerCount=0,fence:{character:string;length:number}|undefined;for(const line of source.split(/\r\n|\r|\n/)){const match=/^\s*(`{3,}|~{3,})(.*)$/.exec(line);if(match){if(!fence)fence={character:match[1][0],length:match[1].length};else if(match[1][0]===fence.character&&match[1].length>=fence.length&&!match[2].trim())fence=undefined;continue}if(!fence&&line.startsWith(prefix))markerCount++;}if(markerCount!==placements.length)throw Error('Invalid terminal capture marker: use terminalCapture with id, output and optional label, command, environment.');return placements;}
/** Controls are visible text, not terminal escape interpretation. Original bytes remain in output/copy. */
export function terminalDisplayText(output:string){return output.replace(/\r\n/g,'\n').replace(/\r/g,'␍').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,value=>'\\u'+value.charCodeAt(0).toString(16).padStart(4,'0'));}
export function terminalLineCount(output:string){return output.split(/\r\n|\r|\n/).length;}
export function terminalCaptureSummaries(source:string){return parseNoteTerminalPlacements(source).map(({capture})=>({id:capture.id,...(capture.label?{label:capture.label}:{}),...(capture.environment?{environment:capture.environment}:{}),...(capture.command?{command:capture.command}:{}),lineCount:terminalLineCount(capture.output),preview:terminalDisplayText(capture.output).slice(0,180),provenance:TERMINAL_PROVENANCE,complete:false as const}));}
export function compactTerminalSource(source:string){let result='',offset=0;for(const placement of parseNoteTerminalPlacements(source)){result+=source.slice(offset,placement.from)+`[Terminal output ${placement.capture.id}: ${placement.capture.label||placement.capture.environment||'external evidence'}, ${terminalLineCount(placement.capture.output)} lines; exact output deferred]`;offset=placement.to;}return result+source.slice(offset);}

/** Reopening an edited capture keeps its unsaved replacement; opening another capture is explicit. */
export function terminalDraftForOpening(capture:TerminalCapture|undefined,retained:{capture:TerminalCapture;replaceId?:string}|null|undefined){if(capture){return {capture:retained?.replaceId===capture.id?retained.capture:capture,replaceId:capture.id};}return retained?{capture:retained.capture,...(retained.replaceId?{replaceId:retained.replaceId}:{})}:undefined;}
