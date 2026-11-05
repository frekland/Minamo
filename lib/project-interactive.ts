import {z} from 'zod';
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const finite=z.number().finite();
const image=z.object({assetId:id,alt:z.string().min(1).max(2000),caption:z.string().max(1000).optional()}).strict();
const face=z.object({text:z.string().max(4000),image:image.optional()}).strict();
export const parameterSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('slider'),id,label:z.string().min(1).max(100),unit:z.string().max(30).optional(),min:finite,max:finite,step:finite.positive(),value:finite}).strict(),
 z.object({kind:z.literal('toggle'),id,label:z.string().min(1).max(100),value:z.boolean()}).strict(),
 z.object({kind:z.literal('select'),id,label:z.string().min(1).max(100),options:z.array(z.string().min(1).max(80)).min(1).max(12),value:z.string().max(80)}).strict()
]);
const controls=z.array(parameterSchema).max(8);
const canvas={width:z.number().int().min(120).max(1200),height:z.number().int().min(100).max(900),seed:z.number().int().min(0).max(2147483647),code:z.string().min(1).max(20000)};
export const interactiveSchema=z.discriminatedUnion('type',[
 z.object({version:z.literal(1),type:z.literal('flashcards'),cards:z.array(z.object({id,front:face,back:face}).strict()).min(1).max(80)}).strict(),
 z.object({version:z.literal(1),type:z.literal('drawing'),noteId:id}).strict(),
 z.object({version:z.literal(1),type:z.literal('python-canvas'),...canvas,controls:controls.optional()}).strict(),
 z.object({version:z.literal(1),type:z.literal('parameter-explorer'),controls,target:z.discriminatedUnion('type',[
  z.object({type:z.literal('python-canvas'),...canvas}).strict(),
  z.object({type:z.literal('wave'),amplitude:id,frequency:id}).strict(),
  z.object({type:z.literal('trajectory'),speed:id,gravity:id}).strict()
 ])}).strict(),
 z.object({version:z.literal(1),type:z.literal('pygbag'),assetId:id,digest:z.string().regex(/^[a-f0-9]{64}$/),profile:z.literal('standalone-html-v1'),runtime:z.string().max(240)}).strict()
]);
export type Interactive=z.infer<typeof interactiveSchema>;
export function validateInteractive(value:unknown):Interactive{
 const d=interactiveSchema.parse(value);if(new TextEncoder().encode(JSON.stringify(d)).byteLength>100000)throw Error('Interactive definition exceeds 100 KB.');
 const cs='controls' in d?d.controls??[]:[];if(new Set(cs.map(p=>p.id)).size!==cs.length)throw Error('Parameter IDs must be unique.');
 for(const p of cs){if(p.kind==='slider'&&(p.max<=p.min||p.value<p.min||p.value>p.max||p.step>p.max-p.min))throw Error('Slider bounds/default are invalid.');if(p.kind==='select'&&!p.options.includes(p.value))throw Error('Select default must be an option.');}
 if(d.type==='flashcards'&&new Set(d.cards.map(c=>c.id)).size!==d.cards.length)throw Error('Card IDs must be unique.');
 if(d.type==='parameter-explorer'&&d.target.type!=='python-canvas')for(const k of (d.target.type==='wave'?[d.target.amplitude,d.target.frequency]:[d.target.speed,d.target.gravity]))if(!cs.some(c=>c.id===k&&c.kind==='slider'))throw Error('Native graph inputs must name numeric slider parameters.');
 return d;
}
export function interactiveImages(d:Interactive|undefined){return d?.type==='flashcards'?d.cards.flatMap(c=>[c.front.image,c.back.image].filter((v):v is NonNullable<typeof v>=>!!v)):[];}
