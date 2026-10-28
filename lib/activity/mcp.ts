import {z} from 'zod';
import {publishActivitySchema,recordAttemptSchema,readActivitySchema} from './domain';
const purpose={type:'string',minLength:1,maxLength:500},id={type:'string',pattern:'^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$'},rendition={type:'string',maxLength:240};
/** Small deterministic converter for this finite public schema, tested against every used Zod constructor. */
export function activityJsonSchema(schema:z.ZodTypeAny):Record<string,unknown>{const d=schema._def as any;switch(d.typeName){
 case 'ZodObject':{const shape=d.shape(),properties:Record<string,unknown>={},required:string[]=[];for(const [key,value] of Object.entries(shape)){const item=value as z.ZodTypeAny;properties[key]=activityJsonSchema(item);if(!item.isOptional())required.push(key);}return {type:'object',properties,required,additionalProperties:d.unknownKeys!=='strict'};}
 case 'ZodArray':return {type:'array',items:activityJsonSchema(d.type),...(d.minLength?{minItems:d.minLength.value}:{}),...(d.maxLength?{maxItems:d.maxLength.value}:{})};
 case 'ZodDiscriminatedUnion':return {oneOf:[...d.options.values()].map(activityJsonSchema)};
 case 'ZodUnion':return {oneOf:d.options.map(activityJsonSchema)};
 case 'ZodLiteral':return {const:d.value};
 case 'ZodEnum':return {type:'string',enum:d.values};
 case 'ZodString':{const result:Record<string,unknown>={type:'string'};for(const c of d.checks){if(c.kind==='min')result.minLength=c.value;if(c.kind==='max')result.maxLength=c.value;if(c.kind==='regex')result.pattern=c.regex.source;}return result;}
 case 'ZodNumber':{const result:Record<string,unknown>={type:d.checks.some((c:any)=>c.kind==='int')?'integer':'number'};for(const c of d.checks){if(c.kind==='min')result.minimum=c.value;if(c.kind==='max')result.maximum=c.value;}return result;}
 case 'ZodBoolean':return {type:'boolean'};
 case 'ZodTuple':return {type:'array',prefixItems:d.items.map(activityJsonSchema),minItems:d.items.length,maxItems:d.items.length};
 case 'ZodRecord':return {type:'object',additionalProperties:activityJsonSchema(d.valueType)};
 case 'ZodNullable':return {anyOf:[activityJsonSchema(d.innerType),{type:'null'}]};
 case 'ZodNull':return {type:'null'};
 case 'ZodOptional':case 'ZodDefault':return activityJsonSchema(d.innerType);
 case 'ZodEffects':return activityJsonSchema(d.schema);
 case 'ZodUnknown':return {type:'object',description:'Inert format-specific payload. The selected trusted Foundry adapter validates its complete exact structure; unknown kinds and arbitrary code are rejected.'};
 default:throw new Error('Unsupported public Activity schema '+d.typeName);
}}
const small=(properties:Record<string,unknown>,required:string[])=>({type:'object',properties:{purpose,...properties},required:['purpose',...required],additionalProperties:false});
export const activityTools=[
 {name:'get_minamo_activity_capabilities',description:'Read actual typed Activity templates, limits, evidence boundary and dormant feature status. Use detail:summary for compact discovery; omit detail or choose full for complete examples. Server catalogue availability does not prove installed-client refresh.',inputSchema:small({detail:{enum:['summary','full']}},[])},
 {name:'preview_minamo_activity_package',description:'Validate a complete original inert Activity cartridge, exact context and file hashes without writing. Actionable field paths; no code execution or learning achievement.',inputSchema:activityJsonSchema(publishActivitySchema)},
 {name:'publish_minamo_activity_package',description:'Publish or CAS-revise one owner-requested original Activity in one guarded call. Reuse exact operation payload after uncertain response. Existing experiment/history/Trash/recovery authority. Hints and complete authored practice answers remain withheld on ordinary reads; separate deliberate reveals. No arbitrary runtime or checkpoints.',inputSchema:activityJsonSchema(publishActivitySchema)},
 {name:'read_minamo_activity',description:'Read exact current or retained Activity edition under current owner/source permissions. Hint text withheld, code is inert, outputs are supplied unless separately attested.',inputSchema:activityJsonSchema(readActivitySchema.extend({purpose:z.string().min(1).max(500)}))},
 {name:'reveal_minamo_activity_hint',description:'Deliberately reveal one concept/strategy/mechanic hint, or complete authored practice answer with hintId answer:<blockId> from one retained Activity. Complete answer reveal is distinct from incremental hints and never claims correctness; does not auto-save an attempt.',inputSchema:small({id,rendition,hintId:id},['id','hintId'])},
 {name:'record_minamo_activity_attempt',description:'Explicitly save or CAS-revise an Attempt pinned to an immutable Activity edition. Preserve prediction, reflection, next intention, immutable practice response revisions, exact-target provisional feedback, retained/disputed corrections, optional review events and labelled supplied evidence; never manufacture an observed Run or Development. For a deferred GPT return append feedback {id,responseId,responseRevision,basis:gpt-provisional,verdict,explanation}; verdict is exactly accepted, different, pending or uncertain (not acceptable). Read the current Attempt first, preserve all prior responses/feedback/corrections/reviewEvents/interactions and its Activity edition, and use current expectedRev. Feedback targets the selected immutable responseId+responseRevision, never merely the latest answer.',inputSchema:activityJsonSchema(recordAttemptSchema)},
 {name:'get_minamo_activity_context',description:'Resume by natural project name through saved Journey/Investigation links. Returns Activities, immutable Attempts and recent linked short Notes even when they omit the project name; terminal transcripts are deferred with exact terminalId reads. Duplicate exact names require explicit target selection. Follow search and related continuations before claiming absence; never treat newer Notes as checkpoints or infer achievement. First-page snapshot changes restart the whole read at most once; persistent changes return typed retryability. Stale continuations require a fresh first page and are never automatically replayed. No writes.',inputSchema:small({learningSpace:{enum:['all','computing','languages','unclassified']},language:{enum:['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']},query:{type:'string',minLength:1,maxLength:200},limit:{type:'integer',minimum:1,maximum:20},includeSynthetic:{type:'boolean'},cursor:{type:'string',maxLength:1200}},['query'])},
];
