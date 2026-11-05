import {z} from 'zod';
const id=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const finite=z.number().finite();
const image=z.object({assetId:id,alt:z.string().min(1).max(2000),caption:z.string().max(1000).optional()}).strict();
const face=z.object({text:z.string().max(4000),image:image.optional()}).strict();
const languageTag=z.string().min(2).max(48).regex(/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/);
const utterance=z.object({text:z.string().min(1).max(4000),translation:z.string().max(4000).optional(),note:z.string().max(4000).optional(),language:languageTag.optional()}).strict();
const cloze=z.object({before:z.string().max(4000),missing:z.string().min(1).max(1000),after:z.string().max(4000)}).strict();
export const parameterSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('slider'),id,label:z.string().min(1).max(100),unit:z.string().max(30).optional(),min:finite,max:finite,step:finite.positive(),value:finite}).strict(),
 z.object({kind:z.literal('toggle'),id,label:z.string().min(1).max(100),value:z.boolean()}).strict(),
 z.object({kind:z.literal('select'),id,label:z.string().min(1).max(100),options:z.array(z.string().min(1).max(80)).min(1).max(12),value:z.string().max(80)}).strict()
]);
const controls=z.array(parameterSchema).max(8);
const canvas={width:z.number().int().min(120).max(1200),height:z.number().int().min(100).max(900),seed:z.number().int().min(0).max(2147483647),code:z.string().min(1).max(20000)};
export const interactiveSchema=z.discriminatedUnion('type',[
 z.object({version:z.literal(1),type:z.literal('flashcards'),reversible:z.boolean().optional(),cards:z.array(z.object({id,front:face,back:face,cloze:cloze.optional(),language:languageTag.optional()}).strict()).min(1).max(80)}).strict(),
 z.object({version:z.literal(1),type:z.literal('language-reveal'),language:languageTag,source:utterance,gloss:z.string().max(4000).optional(),explanation:z.string().max(4000).optional()}).strict(),
 z.object({version:z.literal(1),type:z.literal('language-pattern'),language:languageTag,slots:z.array(z.object({id,label:z.string().min(1).max(100),choices:z.array(z.object({id,label:z.string().min(1).max(100)}).strict()).min(1).max(12)}).strict()).min(1).max(5),examples:z.array(z.object({id,choices:z.record(id),source:utterance}).strict()).min(1).max(120)}).strict(),
 z.object({version:z.literal(1),type:z.literal('language-dialogue'),language:languageTag,turns:z.array(z.object({id,speaker:z.string().min(1).max(120),source:utterance,alternatives:z.array(z.string().min(1).max(2000)).max(4).optional()}).strict()).min(1).max(40)}).strict(),
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
 if(d.type==='language-pattern'){
  if(new Set(d.slots.map(s=>s.id)).size!==d.slots.length||d.slots.some(s=>new Set(s.choices.map(c=>c.id)).size!==s.choices.length))throw Error('Sentence slot/choice IDs must be unique.');
  const combinations=new Set<string>();for(const example of d.examples){const keys=Object.keys(example.choices);if(keys.length!==d.slots.length||d.slots.some(slot=>!slot.choices.some(choice=>choice.id===example.choices[slot.id])))throw Error('Each sentence must reference one known choice in every slot.');const key=d.slots.map(slot=>example.choices[slot.id]).join('\0');if(combinations.has(key))throw Error('Only one authored output is allowed for each choice combination.');combinations.add(key);}
  if(new Set(d.examples.map(e=>e.id)).size!==d.examples.length)throw Error('Sentence IDs must be unique.');
 }
 if(d.type==='language-dialogue'&&new Set(d.turns.map(t=>t.id)).size!==d.turns.length)throw Error('Dialogue turn IDs must be unique.');
 if(d.type==='parameter-explorer'&&d.target.type!=='python-canvas')for(const k of (d.target.type==='wave'?[d.target.amplitude,d.target.frequency]:[d.target.speed,d.target.gravity]))if(!cs.some(c=>c.id===k&&c.kind==='slider'))throw Error('Native graph inputs must name numeric slider parameters.');
 return d;
}
export function interactiveImages(d:Interactive|undefined){return d?.type==='flashcards'?d.cards.flatMap(c=>[c.front.image,c.back.image].filter((v):v is NonNullable<typeof v>=>!!v)):[];}
