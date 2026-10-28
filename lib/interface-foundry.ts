import type {ActivityBlock, ActivityCartridge} from './activity/schema';
import {assertJsonBudget} from './foundry/platform';
import {z} from 'zod';
import {PRESENTATION_VIEWS,presentationViewMetadata,type PresentationViewId} from './interface-extension-catalogue';

/** Composition only. Source validation, rights, execution and saves stay with Activity/Foundry. */
export const PRESENTATION_CONTRACT = 'minamo.presentation.v1' as const;
export const PRESENTATION_SLOTS = ['task','source','explore','guidance','evidence','supporting'] as const;
export type PresentationSlot = typeof PRESENTATION_SLOTS[number];
export const PRESENTATION_ACTIONS = ['inspect-source','copy-source','open-locally','reveal-hint','open-note','activate-view'] as const;
export type PresentationAction = typeof PRESENTATION_ACTIONS[number];
export const PRESENTATION_PATTERNS = [
  {id:'read-and-annotate',label:'Read and annotate',focus:'source',description:'Canonical content with optional supporting context.'},
  {id:'activity-overview',label:'Overview and start locally',focus:'task',description:'Understand the original task and choose a deliberate next action.'},
  {id:'debug-and-repair',label:'Debug and repair',focus:'source',description:'Inspect exact starter files, supplied evidence and deliberate hints.'},
  {id:'build-and-iterate',label:'Build and iterate',focus:'source',description:'Inspect a real project and continue in a local development environment.'},
  {id:'predict-explore-compare',label:'Predict, explore and compare',focus:'task',description:'Keep provisional prediction separate from supplied observation.'},
  {id:'mathematics-science',label:'Mathematics and science',focus:'explore',description:'Give figures and formulas space while preserving exact source.'},
  {id:'language-reading',label:'Language Article',focus:'explore',description:'Readable source text and deliberate language decoration.'},
  {id:'data-detective',label:'Data detective',focus:'explore',description:'Inspect source-bound numeric values, charts and supplied traces.'},
  {id:'algorithm-game',label:'Algorithm and game lab',focus:'explore',description:'Explore a trusted finite visual with accessible source fallback.'},
  {id:'code-walkthrough',label:'Code walkthrough',focus:'source',description:'Follow original source without executing imported code.'},
  {id:'sound-lab',label:'Sound lab',focus:'explore',description:'Inspect audio data; playback requires a separate deliberate action.'},
] as const;
export type PresentationPattern = typeof PRESENTATION_PATTERNS[number]['id'];
export type PresentationRecipe = {
  contract:typeof PRESENTATION_CONTRACT;
  pattern:PresentationPattern;
  version:1;
  slots:Array<{slot:PresentationSlot;blockId:string;viewId?:PresentationViewId}>;
  preferredFocus:PresentationSlot;
  fallback:'accessible-source';
};
/** Finite schema also drives the real MCP tool's JSON Schema; cross-block checks follow parsing. */
export const presentationRecipeSchema=z.object({
  contract:z.literal(PRESENTATION_CONTRACT),
  pattern:z.enum(PRESENTATION_PATTERNS.map(pattern=>pattern.id) as [PresentationPattern,...PresentationPattern[]]),
  version:z.literal(1),
  slots:z.array(z.object({slot:z.enum(PRESENTATION_SLOTS),blockId:z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/),viewId:z.enum(PRESENTATION_VIEWS.map(view=>view.id) as [PresentationViewId,...PresentationViewId[]]).optional()}).strict()).min(1).max(24),
  preferredFocus:z.enum(PRESENTATION_SLOTS),fallback:z.literal('accessible-source'),
}).strict();
export class PresentationError extends Error {
  constructor(readonly path:string,message:string){super(message);this.name='PresentationError';}
}
const fail=(path:string,message:string):never=>{throw new PresentationError(path,message);};
const owns=(value:object,key:string)=>Object.prototype.hasOwnProperty.call(value,key);
function object(value:unknown,path:string):Record<string,unknown>{
  if(!value||typeof value!=='object'||Array.isArray(value))return fail(path,'Use an inert JSON object.');
  return value as Record<string,unknown>;
}
function keys(value:Record<string,unknown>,allowed:string[],path:string,required=allowed){
  for(const key of Object.keys(value))if(!allowed.includes(key))fail(path+'.'+key,'Unknown presentation field. No HTML, CSS, component names, URLs or callbacks are admitted.');
  for(const key of required)if(!owns(value,key))fail(path+'.'+key,'Required presentation field is missing.');
}
function immutable<T>(value:T):T{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))immutable(child);}return value;}

/** Metadata does not load a renderer. Only the existing Foundry registry activates these formats. */
export const PRESENTATION_FOUNDRY_KINDS = [
  'text/plain-v1','run/output-bundle-v1','language/ruby-v1','language/parallel-v1',
  'math/tex-v1','math/native-v1','scene/geometry-v1','data/table-v1','data/chart-v1',
  'data/notebook-v1','trace/external-v1','audio/pcm-v1',
] as const;
export function slotsForActivityBlock(block:ActivityBlock):readonly PresentationSlot[]{
  switch(block.kind){
    case 'instruction':return ['task','guidance','supporting'];
    case 'prediction':return ['task'];
    case 'reflection':return ['evidence'];
    case 'source-browser':return ['source'];
    case 'reading':return ['supporting'];
    case 'practice':return ['task','explore'];
    case 'listening':case 'character':case 'scenario':return ['explore','task'];
    case 'hint-ladder':return ['guidance'];
    case 'foundry':return block.artefact.kind==='run/output-bundle-v1'||block.artefact.kind==='trace/external-v1'?['evidence','explore']:['explore','source'];
  }
}
/** Accept references, never copied source or hint payloads. All existing blocks remain reachable exactly once. */
export function admitPresentationRecipe(input:unknown,activity:Pick<ActivityCartridge,'blocks'>):PresentationRecipe{
  try{assertJsonBudget(input);}catch(error){return fail('presentation',error instanceof Error?error.message:'Use bounded inert JSON.');}
  const raw=object(input,'presentation');const value=raw.pattern==='learning-atlas'?{...raw,pattern:'read-and-annotate'}:raw;
  keys(value,['contract','pattern','version','slots','preferredFocus','fallback'],'presentation');
  if(value.contract!==PRESENTATION_CONTRACT)fail('presentation.contract','Unsupported presentation contract; retain accessible source.');
  if(!PRESENTATION_PATTERNS.some(pattern=>pattern.id===value.pattern))fail('presentation.pattern','Choose a registered presentation pattern.');
  if(value.version!==1)fail('presentation.version','Unsupported pattern version; retain accessible source.');
  if(value.fallback!=='accessible-source')fail('presentation.fallback','The exact accessible source fallback is required.');
  if(!PRESENTATION_SLOTS.includes(value.preferredFocus as PresentationSlot))fail('presentation.preferredFocus','Choose a registered slot.');
  if(!Array.isArray(value.slots)||value.slots.length<1||value.slots.length>24)fail('presentation.slots','Use one to twenty-four existing block references.');
  const blocks=new Map(activity.blocks.map(block=>[block.id,block]));
  if(blocks.size!==activity.blocks.length||!blocks.size)fail('activity.blocks','The admitted Activity must have unique block IDs.');
  const seen=new Set<string>();
  const slots=(value.slots as unknown[]).map((raw,index)=>{
    const path='presentation.slots.'+index,item=object(raw,path);keys(item,['slot','blockId','viewId'],path,['slot','blockId']);
    if(!PRESENTATION_SLOTS.includes(item.slot as PresentationSlot))fail(path+'.slot','Choose a registered slot.');
    if(typeof item.blockId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/.test(item.blockId))fail(path+'.blockId','Use an exact existing block ID.');
    const block=blocks.get(item.blockId as string);if(!block)fail(path+'.blockId','The exact Activity block is unavailable.');
    if(seen.has(item.blockId as string))fail(path+'.blockId','A block can be mounted only once.');
    if(!slotsForActivityBlock(block!).includes(item.slot as PresentationSlot))fail(path+'.slot','Block '+block!.id+' ('+block!.kind+') cannot occupy '+String(item.slot)+'. Allowed slots: '+slotsForActivityBlock(block!).join(', ')+'. Keep the block and move its reference; every block remains reachable exactly once.');
    if(owns(item,'viewId')){
      const view=typeof item.viewId==='string'?presentationViewMetadata(item.viewId):undefined;
      if(!view)fail(path+'.viewId','Choose a known versioned trusted view ID, or omit it to retain the original renderer.');
      if(block!.kind!=='foundry'||view!.sourceKind!==block!.artefact.kind)fail(path+'.viewId','This view does not match the exact admitted Foundry source kind.');
      if(!view!.slots.some(slot=>slot===item.slot))fail(path+'.viewId','This view cannot occupy that presentation slot.');
    }
    seen.add(item.blockId as string);return {slot:item.slot as PresentationSlot,blockId:item.blockId as string,...(owns(item,'viewId')?{viewId:item.viewId as PresentationViewId}:{})};
  });
  if(seen.size!==blocks.size)fail('presentation.slots','Every Activity block must remain reachable exactly once.');
  if(!slots.some(item=>item.slot===value.preferredFocus))fail('presentation.preferredFocus','Preferred focus must refer to a populated slot.');
  return immutable({contract:PRESENTATION_CONTRACT,pattern:value.pattern as PresentationPattern,version:1,slots,preferredFocus:value.preferredFocus as PresentationSlot,fallback:'accessible-source'});
}
const templatePatterns:Record<ActivityCartridge['template'],PresentationPattern>={
  debugging:'debug-and-repair','fill-gap':'build-and-iterate','predict-compare':'predict-explore-compare',
  'code-archaeology':'code-walkthrough','test-mutation':'debug-and-repair',diagnostic:'debug-and-repair',
  walkthrough:'code-walkthrough',language:'language-reading',mathematics:'mathematics-science',
  data:'data-detective',game:'algorithm-game',music:'sound-lab',visual:'mathematics-science',
};
export function deriveActivityPresentation(activity:ActivityCartridge):PresentationRecipe{
  const pattern=templatePatterns[activity.template]??'activity-overview';
  const slots=activity.blocks.map(block=>({slot:slotsForActivityBlock(block)[0],blockId:block.id}));
  const wanted=PRESENTATION_PATTERNS.find(item=>item.id===pattern)!.focus;
  const preferredFocus=slots.some(item=>item.slot===wanted)?wanted:slots[0]?.slot;
  return admitPresentationRecipe({contract:PRESENTATION_CONTRACT,pattern,version:1,slots,preferredFocus,fallback:'accessible-source'},activity);
}
export const defaultPresentationRecipe=deriveActivityPresentation;
export type PresentationPane={slot:PresentationSlot;blockIds:string[]};
export type PresentationResolution={state:'ready'|'unavailable';pattern:PresentationPattern;layout:'single'|'split'|'wide';primary:PresentationSlot;panes:PresentationPane[];actions:PresentationAction[];fallback:'accessible-source'};
/** Width is the measured available container AFTER Notes docking, never viewport width. */
export function resolvePresentation(recipe:PresentationRecipe,activity:ActivityCartridge,context:{eligible:boolean;width:number;mode:'classic'|'focus'|'task';notesDock?:'left'|'right'|'top'|'bottom'|null}):PresentationResolution{
  if(!context.eligible)return {state:'unavailable',pattern:'activity-overview',layout:'single',primary:'task',panes:[],actions:[],fallback:'accessible-source'};
  const admitted=admitPresentationRecipe(recipe,activity);
  const width=Number.isFinite(context.width)&&context.width>0?context.width:0;
  const layout=width<720||context.mode==='focus'?'single':width<1120?'split':'wide';
  const panes=PRESENTATION_SLOTS.flatMap(slot=>{const blockIds=admitted.slots.filter(item=>item.slot===slot).map(item=>item.blockId);return blockIds.length?[{slot,blockIds}]:[];});
  const actions:PresentationAction[]=['inspect-source','copy-source','open-note'];
  if(activity.blocks.some(block=>block.kind==='source-browser'))actions.push('open-locally');
  if(activity.blocks.some(block=>block.kind==='hint-ladder'))actions.push('reveal-hint');
  if(activity.blocks.some(block=>block.kind==='foundry'&&PRESENTATION_FOUNDRY_KINDS.includes(block.artefact.kind as typeof PRESENTATION_FOUNDRY_KINDS[number])))actions.push('activate-view');
  return immutable({state:'ready',pattern:admitted.pattern,layout,primary:admitted.preferredFocus,panes,actions,fallback:'accessible-source'});
}
export function presentationStateKey(scope:string,id:string,rendition:string):string{
  if([scope,id,rendition].some(value=>typeof value!=='string'||!value||value.length>1000))return fail('presentation.identity','Use the exact workspace scope, Activity ID and edition.');
  return 'minamo:presentation:v1:'+JSON.stringify([scope,id,rendition]);
}
