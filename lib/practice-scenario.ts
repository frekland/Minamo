import {z} from 'zod';
const key=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/),text=z.string().min(1).max(2000);
const source=z.object({family:z.enum(['journey','investigation','article','area','note','source','experiment','run']),id:z.string().min(1).max(160),rendition:z.string().min(1).max(240),sectionId:z.string().min(1).max(160).optional(),partId:z.string().min(1).max(160).optional()}).strict().refine(x=>!x.partId||!!x.sectionId,'A part needs its exact section.');
const base={contract:z.literal('minamo.scenario.v1'),id:key,version:z.number().int().min(1).max(9999),language:z.enum(['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']),title:z.string().min(1).max(200),introduction:text,provenance:z.literal('original-authored-scenario')};
const choice=z.object({id:key,label:text,next:key,feedback:text,registerNote:z.string().max(1000).optional()}).strict();
const dialogue=z.object({...base,family:z.literal('dialogue'),initialState:key,states:z.array(z.object({id:key,prompt:text,translation:z.string().max(2000).optional(),choices:z.array(choice).max(12),terminal:z.boolean().optional()}).strict()).min(2).max(40)}).strict();
const cell=z.number().int().min(0).max(5);
const spatial=z.object({...base,family:z.literal('spatial'),referenceFrame:z.literal('screen-grid'),columns:z.number().int().min(2).max(6),rows:z.number().int().min(2).max(6),instruction:text,translation:z.string().max(2000).optional(),objects:z.array(z.object({id:key,label:z.string().min(1).max(100),x:cell,y:cell}).strict()).min(1).max(8),targets:z.array(z.object({objectId:key,x:cell,y:cell}).strict()).min(1).max(8),success:text,retry:text}).strict();
export const scenarioDataSchema=z.discriminatedUnion('family',[dialogue,spatial]).superRefine((s,c)=>{
 if(s.family==='dialogue'){const ids=new Set(s.states.map(x=>x.id));if(ids.size!==s.states.length||!ids.has(s.initialState))c.addIssue({code:z.ZodIssueCode.custom,path:['states'],message:'Use unique states and an existing initial state.'});for(const [i,state] of s.states.entries()){if(new Set(state.choices.map(x=>x.id)).size!==state.choices.length)c.addIssue({code:z.ZodIssueCode.custom,path:['states',i,'choices'],message:'Choice IDs must be unique in a state.'});if(!state.terminal&&!state.choices.length)c.addIssue({code:z.ZodIssueCode.custom,path:['states',i],message:'A nonterminal state needs a usable choice.'});for(const ch of state.choices)if(!ids.has(ch.next))c.addIssue({code:z.ZodIssueCode.custom,path:['states',i,'choices'],message:'Every choice must lead to an existing state.'});}}
 else {const ids=new Set(s.objects.map(x=>x.id));if(ids.size!==s.objects.length||new Set(s.targets.map(x=>x.objectId)).size!==s.targets.length)c.addIssue({code:z.ZodIssueCode.custom,path:['objects'],message:'Object and target identities must be unique.'});for(const x of [...s.objects,...s.targets])if(x.x>=s.columns||x.y>=s.rows)c.addIssue({code:z.ZodIssueCode.custom,path:['objects'],message:'Object and target cells must be inside the declared grid.'});for(const x of s.targets)if(!ids.has(x.objectId))c.addIssue({code:z.ZodIssueCode.custom,path:['targets'],message:'Every target names an existing object.'});}
});
export const scenarioBlockSchema=z.object({id:key,kind:z.literal('scenario'),scenario:scenarioDataSchema,source:source.optional()}).strict();
export type ScenarioBlock=z.infer<typeof scenarioBlockSchema>;
export type Scenario=z.infer<typeof scenarioDataSchema>;
export type ScenarioEvent={type:string;value?:string};
export type ScenarioSnapshot={version:1;scenarioId:string;scenarioVersion:number;state:string;positions:Record<string,{x:number;y:number}>;events:ScenarioEvent[];feedback:string;complete:boolean};
export function scenarioSourceRefs(block:ScenarioBlock){return block.source?[block.source]:[];}
export function initialScenario(s:Scenario):ScenarioSnapshot{return {version:1,scenarioId:s.id,scenarioVersion:s.version,state:s.family==='dialogue'?s.initialState:'spatial',positions:s.family==='spatial'?Object.fromEntries(s.objects.map(o=>[o.id,{x:o.x,y:o.y}])):{},events:[],feedback:'',complete:false};}
export function advanceScenario(s:Scenario,snapshot:ScenarioSnapshot,event:ScenarioEvent):ScenarioSnapshot{
 if(snapshot.scenarioId!==s.id||snapshot.scenarioVersion!==s.version||snapshot.version!==1)throw Error('This saved scenario belongs to a different edition. Restart deliberately to use the new one.');
 if(event.type==='restart')return initialScenario(s);
 if(snapshot.events.length>=128)throw Error('This scenario trace has reached its 128-event limit. Save or restart.');
 const next={...snapshot,positions:{...snapshot.positions},events:[...snapshot.events,event]};
 if(s.family==='dialogue'){
  if(event.type!=='choose')throw Error('Choose an authored reply.');
  const state=s.states.find(x=>x.id===snapshot.state),ch=state?.choices.find(x=>x.id===event.value);if(!ch||snapshot.complete)throw Error('That reply is unavailable at this point.');
  next.state=ch.next;next.feedback=ch.feedback+(ch.registerNote?' '+ch.registerNote:'');next.complete=!!s.states.find(x=>x.id===ch.next)?.terminal;
 }else{
  if(event.type==='move'){const [id,dx,dy]=(event.value??'').split(':');if(!s.objects.some(x=>x.id===id)||!['-1','0','1'].includes(dx)||!['-1','0','1'].includes(dy)||Math.abs(Number(dx))+Math.abs(Number(dy))!==1)throw Error('Move an existing object one grid cell.');const p=snapshot.positions[id],x=p.x+Number(dx),y=p.y+Number(dy);if(x<0||x>=s.columns||y<0||y>=s.rows)throw Error('That move leaves the grid.');next.positions[id]={x,y};next.complete=false;next.feedback='Position changed. Check when ready.';}
  else if(event.type==='check'){next.complete=s.targets.every(t=>next.positions[t.objectId]?.x===t.x&&next.positions[t.objectId]?.y===t.y);next.feedback=next.complete?s.success:s.retry;}
  else throw Error('Use a move or explicit check.');
 }
 return next;
}
/** Replay validates each action against the exact finite edition. Payload snapshots are never authority. */
export function replayScenario(s:Scenario,events:ScenarioEvent[]):ScenarioSnapshot {if(events.length>128)throw Error('Scenario event budget exceeded.');return events.reduce((state,event)=>advanceScenario(s,state,event),initialScenario(s));}
