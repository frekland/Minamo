import {z} from 'zod';

const key=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/);
const exactSource=z.object({family:z.enum(['journey','investigation','article','area','note','source','experiment','run']),id:z.string().min(1).max(160),rendition:z.string().min(1).max(240),sectionId:z.string().min(1).max(160).optional(),partId:z.string().min(1).max(160).optional()}).strict().refine(x=>!x.partId||!!x.sectionId,'A part needs its exact section.');
/** Only numeric SVG path geometry is accepted. No markup, attributes, URL or SVG document is rendered. */
export function safeCharacterPath(path:string):boolean {
 if(!path||path.length>8192)return false;
 const tokens=path.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g);
 if(!tokens||tokens.length>2048||!/[Mm]/.test(tokens[0])||path.replace(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g,'').replace(/[\s,]/g,''))return false;
 if(!tokens.every(t=>/^[A-Za-z]$/.test(t)||(Number.isFinite(Number(t))&&Math.abs(Number(t))<=4096)))return false;
 const counts:Record<string,number>={m:2,l:2,h:1,v:1,c:6,s:4,q:4,t:2,a:7,z:0};
 for(let i=0;i<tokens.length;){const command=tokens[i++].toLowerCase(),count=counts[command];if(count===undefined)return false;const values:number[]=[];while(i<tokens.length&&!/^[A-Za-z]$/.test(tokens[i]))values.push(Number(tokens[i++]));if(count===0){if(values.length)return false;}else if(!values.length||values.length%count)return false;if(command==='a')for(let j=0;j<values.length;j+=7)if(values[j]<0||values[j+1]<0||![0,1].includes(values[j+3])||![0,1].includes(values[j+4]))return false;}
 return true;
}
const webUrl=z.string().url().max(1000).refine(x=>x.startsWith('https://'),'Use an HTTPS provenance link.');
const point=z.tuple([z.number().finite().min(-1024).max(2048),z.number().finite().min(-1024).max(2048)]);
export const characterDataSchema=z.object({contract:z.literal('minamo.character.v1'),character:z.string().min(1).max(4).refine(x=>Array.from(x).length===1,'Use one Unicode character.'),language:z.enum(['ja','zh-Hans','zh-Hant']),script:z.enum(['Hani','Hira','Kana','Hans','Hant']),coordinateSystem:z.enum(['kanjivg-109','hanzi-1024']),provenance:z.object({dataset:z.string().min(1).max(200),source:webUrl,sourceBlob:z.string().regex(/^[a-f0-9]{40,64}$/),license:z.string().min(1).max(100),licenseUrl:webUrl,attribution:z.string().min(1).max(1000),updatePolicy:z.string().min(1).max(500)}).strict(),strokes:z.array(z.object({path:z.string().max(8192).refine(safeCharacterPath,'Use bounded numeric SVG path data, never SVG markup.'),description:z.string().min(1).max(500),component:z.string().max(100).optional(),median:z.array(point).min(2).max(128).optional()}).strict()).min(1).max(64),explanation:z.string().min(1).max(2000)}).strict().superRefine((x,c)=>{if(x.strokes.reduce((n,s)=>n+s.path.length,0)>64000)c.addIssue({code:z.ZodIssueCode.custom,path:['strokes'],message:'Combined path budget is 64,000 characters.'});if(x.language==='ja'&&['Hans','Hant'].includes(x.script)||x.language!=='ja'&&['Hira','Kana'].includes(x.script))c.addIssue({code:z.ZodIssueCode.custom,path:['script'],message:'Keep Japanese kana and Mandarin script lanes distinct.'});});
export const characterBlockSchema=z.object({id:key,kind:z.literal('character'),title:z.string().min(1).max(200),data:characterDataSchema,source:exactSource.optional(),contrasts:z.array(z.object({character:z.string().min(1).max(4),note:z.string().min(1).max(500)}).strict()).max(8).optional()}).strict();
export type CharacterBlock=z.infer<typeof characterBlockSchema>;
export type CharacterData=z.infer<typeof characterDataSchema>;
export type PracticeInteraction={blockId:string;kind:'character'|'scenario';edition:string;events:Array<{type:string;value?:string}>};
export function characterSourceRefs(block:CharacterBlock){return block.source?[block.source]:[];}
export function admitCharacterData(input:unknown):CharacterData{return characterDataSchema.parse(input);}
/** Quantised bounded input, not a handwriting assessment. Cancelled strokes never call this. */
export function characterStroke(points:ReadonlyArray<readonly [number,number]>):string {
 if(points.length<2||points.length>64)throw Error('A retained stroke needs 2–64 points.');
 return JSON.stringify(points.map(([x,y])=>{if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<0||y>100)throw Error('Tracing points must be inside the drawing area.');return [Math.round(x),Math.round(y)];}));
}
export function validateCharacterInteraction(block:CharacterBlock,events:Array<{type:string;value?:string}>):void{
 if(events.length>128)throw Error('Character interaction budget is 128 events.');
 for(const event of events){
  if(event.type==='stroke'){let points:unknown;try{points=JSON.parse(event.value??'');}catch{throw Error('A stroke needs bounded point data.');}if(!Array.isArray(points)||points.some(p=>!Array.isArray(p)||p.length!==2))throw Error('A stroke needs numeric point pairs.');characterStroke(points as Array<[number,number]>);}
  else if(event.type==='model-replay'||event.type==='model-reveal'){if(event.value!=='all')throw Error('Use an explicit model reveal.');}
  else if(event.type==='model-step'||event.type==='keyboard-recall'){const n=Number(event.value);if(!Number.isInteger(n)||n<1||n>block.data.strokes.length)throw Error('Recall must name an existing stroke.');}
  else if(event.type==='recall-begin'){if(event.value!=='unassisted')throw Error('Declare the recall assistance state.');}
  else if(event.type==='guides'){if(!['true','false'].includes(event.value??''))throw Error('Declare guide visibility.');}
  else throw Error('Unknown character interaction.');
 }
}
