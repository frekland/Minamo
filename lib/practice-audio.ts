import {z} from 'zod';
import {canonicalReadingParts,type WorkspaceRecord} from './contracts';

const identity=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const passageIdentity=z.string().regex(/^(?:[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}|__[A-Za-z0-9_-]{1,159})$/);
export const listeningBlockSchema=z.object({
 id:identity,kind:z.literal('listening'),version:z.literal(1),language:z.enum(['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']),
 media:z.object({assetId:identity,revision:z.number().int().min(1),digest:z.string().regex(/^[a-f0-9]{64}$/),durationSeconds:z.number().positive().max(3600)}).strict(),
 transcript:z.object({ref:z.object({family:z.enum(['article','source','journey','investigation','note','experiment','run','area']),id:identity,rendition:z.string().min(1).max(240),sectionId:passageIdentity,partId:passageIdentity}).strict(),text:z.string().min(1).max(12000)}).strict(),
 segments:z.array(z.object({id:identity,start:z.number().min(0),end:z.number().positive(),textStart:z.number().int().min(0),textEnd:z.number().int().positive(),translation:z.string().max(2000).optional()}).strict()).min(1).max(128),
 provenance:z.enum(['authored-reference','supplied-recording','synthesized-reference'])
}).strict();
export type ListeningBlock=z.infer<typeof listeningBlockSchema>;
export const RECORDING_LIMITS={seconds:60,bytes:12*1024*1024,samples:60*48000,sampleRate:48000} as const;
const splitSurrogate=(text:string,offset:number)=>offset>0&&offset<text.length&&/[\uD800-\uDBFF]/.test(text[offset-1])&&/[\uDC00-\uDFFF]/.test(text[offset]);
/** The map is independently authored. A transcript range does not invent timing. */
export function validateListeningBlock(input:unknown):ListeningBlock{
 const block=listeningBlockSchema.parse(input);for(const scalar of block.transcript.text){const n=scalar.codePointAt(0)!;if(n>=0xd800&&n<=0xdfff)throw Error('Listening transcript must preserve well-formed Unicode.');}let previousEnd=0;const ids=new Set<string>();
 for(const [i,s] of block.segments.entries()){
  if(ids.has(s.id)||s.start<previousEnd||s.end<=s.start||s.end>block.media.durationSeconds||s.textEnd<=s.textStart||s.textEnd>block.transcript.text.length||splitSurrogate(block.transcript.text,s.textStart)||splitSurrogate(block.transcript.text,s.textEnd))throw Error(`listening.segments.${i}: use unique IDs, nonoverlapping finite audio times and exact Unicode transcript ranges within this edition.`);
  ids.add(s.id);previousEnd=s.end;
 }return block;
}
/** Encode only bounded mono PCM. This is browser recording conversion, never pronunciation analysis. */
export function recordingWav(samples:Float32Array,sampleRate:number):Uint8Array{
 if(!(samples instanceof Float32Array)||!samples.length||samples.length>RECORDING_LIMITS.samples||!Number.isInteger(sampleRate)||sampleRate<8000||sampleRate>48000||samples.length/sampleRate>RECORDING_LIMITS.seconds||samples.some(v=>!Number.isFinite(v)||Math.abs(v)>1))throw Error('Recording exceeds the 60-second mono PCM budget or contains invalid samples.');
 const bytes=new Uint8Array(44+samples.length*2),view=new DataView(bytes.buffer);const tag=(at:number,s:string)=>{for(let i=0;i<s.length;i++)bytes[at+i]=s.charCodeAt(i);};
 tag(0,'RIFF');view.setUint32(4,bytes.length-8,true);tag(8,'WAVE');tag(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);tag(36,'data');view.setUint32(40,samples.length*2,true);
 samples.forEach((v,i)=>view.setInt16(44+i*2,Math.round(v*(v<0?32768:32767)),true));return bytes;
}
/** Deterministic channel average and bounded resampling after native decoder admission. */
export function recordingPcm(channels:Float32Array[],sampleRate:number):{samples:Float32Array;sampleRate:number}{
 if(!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000||!Array.isArray(channels)||!channels.length||channels.length>2||!channels[0].length||channels[0].length/sampleRate>RECORDING_LIMITS.seconds||channels.some(c=>!(c instanceof Float32Array)||c.length!==channels[0].length||c.some(v=>!Number.isFinite(v)||Math.abs(v)>1)))throw Error('Use at most 60 seconds of mono or stereo decoded audio.');
 const rate=Math.min(48000,sampleRate),length=Math.floor(channels[0].length*rate/sampleRate);if(length>RECORDING_LIMITS.samples)throw Error('Recording sample budget exceeded.');
 const samples=Float32Array.from({length},(_,i)=>{const index=Math.min(channels[0].length-1,Math.floor(i*sampleRate/rate));return channels.reduce((sum,c)=>sum+c[index],0)/channels.length;});return{samples,sampleRate:rate};
}
export function dictationDifference(actual:string,expected:string){return {actual,expected,exact:actual===expected,nfcEquivalent:actual.normalize('NFC')===expected.normalize('NFC'),notice:'Text comparison only. Original input is preserved; this is not a pronunciation or proficiency assessment.'};}

/** Saved events describe a submitted draft state, never authenticated microphone/performance evidence. */
export function validateListeningInteraction(block:ListeningBlock,events:{type:string;value?:string}[]){
 const allowed=new Set(['segment','dictation-input','transcript-revealed','compared']);
 if(!Array.isArray(events)||events.length!==4||new Set(events.map(e=>e.type)).size!==4||events.some(e=>!allowed.has(e.type)||typeof e.value!=='string'||e.value.length>2000))throw Error('A listening interaction needs one segment, exact dictation-input, transcript-revealed and compared state.');
 const selected=events.find(e=>e.type==='segment');if(!block.segments.some(segment=>segment.id===selected?.value))throw Error('The saved listening segment must belong to this exact block edition.');
 for(const event of events)if(['transcript-revealed','compared'].includes(event.type)&&!['true','false'].includes(event.value!))throw Error('Listening disclosure/comparison state must be true or false.');
 const answer=events.find(e=>e.type==='dictation-input')!.value!;for(const scalar of answer){const n=scalar.codePointAt(0)!;if(n>=0xd800&&n<=0xdfff)throw Error('Preserve well-formed Unicode in the exact dictation input.');}
 return events;
}

export function validateListeningTranscript(block:ListeningBlock,record:WorkspaceRecord|null){
 const ref=block.transcript.ref;
 if(!record||record.trashedAt||record.id!==ref.id||record.family!==ref.family||record.rendition!==ref.rendition)throw Error('The exact listening transcript edition is unavailable.');
 const part=canonicalReadingParts(record).find(p=>p.sectionId===ref.sectionId&&p.part.id===ref.partId&&!p.part.unavailable);
 if(!part||part.part.text!==block.transcript.text)throw Error('Listening transcript text must exactly match the selected retained source part.');
}
