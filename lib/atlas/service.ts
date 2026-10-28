import {parseLearningScopeQuery,learningScopeSql,matchesLearningScope} from '../learning-spaces';
import {z} from 'zod';
import {FAMILIES,canonicalReadingParts,type WorkspaceRecord,type RecordLink} from '../contracts';
import {DomainError,readRecord,readRendition} from '../domain';
import {getLearningContext} from '../learning-work';
import type {LearningDevelopment,LearningWorkTarget} from '../contracts';
import {assertGenerationCurrent,generationContext} from '../generations';
import {buildLinkedReadingLink} from '../reading-links';
import {assertJsonBudget} from '../foundry/platform';
import {foundryDigest} from '../foundry/digest';
import {ATLAS_LENSES,type AtlasQuery,type LearningGraph} from './types';
import {atlasRecordEligible,atlasRecordLinks,projectLearningGraph,recordNodeId} from './project';
const identity=z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/);
const refSchema=z.object({family:z.enum(FAMILIES),id:identity}).strict();
export const atlasProposalSchema=z.object({id:identity,from:refSchema,to:refSchema,reason:z.string().min(1).max(500),basis:z.literal('gpt-proposal'),evidence:z.array(refSchema.extend({rev:z.number().int().min(1)})).min(1).max(4)}).strict();
export const atlasQuerySchema=z.object({learningSpace:z.enum(['all','computing','languages','unclassified']).optional(),language:z.enum(['ja','zh-Hans','zh-Hant','fr','es','el','de','sv']).optional(),proposals:z.array(atlasProposalSchema).max(16).refine(values=>new Set(values.map(v=>v.id)).size===values.length,'Proposal IDs must be unique.').optional(),lens:z.enum(ATLAS_LENSES).default('route'),focus:z.object({family:z.enum(FAMILIES),id:identity}).strict().optional(),limit:z.number().int().min(1).max(60).default(24),cursor:z.string().max(1200).optional(),includeSynthetic:z.boolean().default(false)}).strict();
const cursorSchema=z.object({v:z.literal(1),scope:z.string().regex(/^[a-f0-9]{64}$/),family:z.enum(FAMILIES),id:identity}).strict();
const fail=(status:number,code:string,message:string):never=>{throw new DomainError(status,code,message);};
const encode=(v:unknown)=>btoa(JSON.stringify(v)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const version=async(env:Cloudflare.Env,owner:string)=>Number((await env.DB!.prepare('SELECT version FROM v2_namespace_versions WHERE owner=?').bind(owner).first<{version:number}>())?.version??0);
/** Read-only: caller must supply Sites-authenticated, generation-scoped env and owner.
 * SQL selects bounded identities only; text and links come from current domain projections.
 * No entire-workspace loading, alternate graph database or user-provided authority. */
export async function getLearningGraph(env:Cloudflare.Env,owner:string,input:AtlasQuery|unknown={}):Promise<LearningGraph>{
 assertJsonBudget(input);const parsed=atlasQuerySchema.safeParse(input);if(!parsed.success)throw new DomainError(400,'invalid_graph_query',parsed.error.issues.map(i=>i.path.join('.')+': '+i.message).join('; '));
 const q=parsed.data,learningScope=parseLearningScopeQuery(q),startVersion=await version(env,owner),generation=generationContext(env)?.generation??'legacy@0';
 const scope=await foundryDigest(new TextEncoder().encode(JSON.stringify({owner,generation,learningScope,version:startVersion,lens:q.lens,focus:q.focus??null,limit:q.limit,includeSynthetic:q.includeSynthetic,proposals:q.proposals??[]})));
 let after:z.infer<typeof cursorSchema>|undefined;
 if(q.cursor){try{if(!/^[A-Za-z0-9_-]+$/.test(q.cursor))throw Error();after=cursorSchema.parse(JSON.parse(atob(q.cursor.replaceAll('-','+').replaceAll('_','/'))));}catch{fail(400,'invalid_graph_cursor','Use the exact bounded Atlas continuation cursor.');}if(after!.scope!==scope)fail(409,'graph_changed','Graph scope, rights, generation or saved records changed. Restart this read.');}
 const focus=q.focus?await readRecord(env,owner,q.focus.family,q.focus.id):null;
 if(q.focus&&(!focus||!matchesLearningScope(focus,learningScope)||!atlasRecordEligible(focus)||(!q.includeSynthetic&&focus.synthetic)))fail(404,'graph_focus_unavailable','The exact focus is unavailable in this graph scope.');
 const scopeSql=learningScopeSql('r',learningScope);const args:unknown[]=[owner,...scopeSql.args];let where='r.owner=? AND r.trashed_at IS NULL AND ('+scopeSql.sql+')';
 if(!q.includeSynthetic)where+=" AND coalesce(json_extract(r.data,'$.synthetic'),0)=0";
 if(focus){
  where+=" AND ((r.family=? AND r.id=?) OR EXISTS(SELECT 1 FROM json_each(?) link WHERE json_extract(link.value,'$.family')=r.family AND json_extract(link.value,'$.id')=r.id) OR EXISTS(SELECT 1 FROM json_each(r.data,'$.links') link WHERE json_extract(link.value,'$.family')=? AND json_extract(link.value,'$.id')=?) OR (coalesce(json_extract(r.data,'$.anchor.recordFamily'),'article')=? AND json_extract(r.data,'$.anchor.articleId')=?) OR (json_extract(r.data,'$.attempt.activity.family')=? AND json_extract(r.data,'$.attempt.activity.id')=?) OR EXISTS(SELECT 1 FROM json_each(r.data,'$.activity.blocks') block WHERE json_extract(block.value,'$.kind') IN ('reading','practice','character','listening') AND coalesce(json_extract(block.value,'$.ref.family'),json_extract(block.value,'$.exercise.source.family'),json_extract(block.value,'$.source.family'),json_extract(block.value,'$.transcript.ref.family'))=? AND coalesce(json_extract(block.value,'$.ref.id'),json_extract(block.value,'$.exercise.source.id'),json_extract(block.value,'$.source.id'),json_extract(block.value,'$.transcript.ref.id'))=?))";
  args.push(focus.family,focus.id,JSON.stringify(atlasRecordLinks(focus)),focus.family,focus.id,focus.family,focus.id,focus.family,focus.id,focus.family,focus.id);
 }else if(q.lens==='route')where+=" AND r.family IN ('journey','investigation','note')";
 else if(q.lens==='constellation')where+=" AND r.family IN ('area','article','investigation','source')";
 else if(q.lens==='river')where+=" AND r.family IN ('note','annotation','run','investigation')";
 if(after){where+=' AND (r.family>? OR (r.family=? AND r.id>?))';args.push(after.family,after.family,after.id);}
 args.push(q.limit+1);
 const rows=await env.DB!.prepare('SELECT r.family,r.id FROM v2_records r WHERE '+where+' ORDER BY r.family,r.id LIMIT ?').bind(...args).all<{family:WorkspaceRecord['family'];id:string}>();
 const selected=rows.results.slice(0,q.limit),records:WorkspaceRecord[]=[];
 if(focus)records.push(focus);
 for(const row of selected){if(records.some(r=>r.family===row.family&&r.id===row.id))continue;const record=await readRecord(env,owner,row.family,row.id);if(record&&atlasRecordEligible(record))records.push(record);}
 const byKey=new Map(records.map(r=>[recordNodeId(r),r])),links:{source:WorkspaceRecord;destination:RecordLink;target:WorkspaceRecord;index:number;anchor?:boolean}[]=[];
 const exactCache=new Map<string,WorkspaceRecord|null>();
 for(const source of records){
  const candidates=atlasRecordLinks(source).map((destination,index)=>({destination,index,anchor:false}));
  if(source.anchor?.quote)candidates.push({destination:{family:source.anchor.recordFamily??'article',id:source.anchor.articleId,rendition:source.anchor.rendition,sectionId:source.anchor.sectionId,partId:source.anchor.partId},index:-1,anchor:true});
  for(const item of candidates){const dest=item.destination,current=byKey.get(dest.family+':'+dest.id);if(!current)continue;
   const cacheKey=JSON.stringify([dest.family,dest.id,dest.rendition??null]);let target:WorkspaceRecord|null;
   if(exactCache.has(cacheKey))target=exactCache.get(cacheKey)!;else{target=dest.rendition?await readRendition(env,owner,dest.id,dest.rendition,dest.family):current;exactCache.set(cacheKey,target);}
   if(!target||!atlasRecordEligible(target))continue;
   if(dest.sectionId&&!canonicalReadingParts(target).some(p=>p.sectionId===dest.sectionId&&(!dest.partId||p.part.id===dest.partId)&&!p.part.unavailable))continue;
   const destination={...dest,...(dest.sectionId&&!dest.rendition&&target.rendition?{rendition:target.rendition}:{})};
   links.push({source,target,destination,index:item.index,anchor:item.anchor});
  }
 }
 await assertGenerationCurrent(env);if(await version(env,owner)!==startVersion)fail(409,'graph_changed','Saved records changed while projecting the graph. Retry a fresh read.');
 const projection=projectLearningGraph(records,links,q.lens);
 if(q.lens==='river'){
  const targets:LearningWorkTarget[]=records.filter(r=>r.family==='investigation').slice(0,4).map(r=>({kind:'investigation',investigationId:r.id}));
  if(focus?.family==='journey'&&focus.learningShape?.kind==='journey')for(const stage of focus.learningShape.stages.slice(0,4-targets.length))targets.push({kind:'journey-stage',journeyId:focus.id,stageId:stage.id});
  for(const target of targets){const context=await getLearningContext(env,owner,{...learningScope,scope:'target',target,limit:4,profile:'full',activityLimit:1});
   for(const event of (context.developments??[]) as LearningDevelopment[]){if(event.withdrawn||event.evidenceUnavailable||event.detailsDeferred||(!q.includeSynthetic&&event.synthetic)||projection.nodes.length>=120)continue;
    const family=event.primaryTarget.kind==='investigation'?'investigation':'journey',targetId=event.primaryTarget.kind==='investigation'?event.primaryTarget.investigationId:event.primaryTarget.journeyId,parent=byKey.get(family+':'+targetId);if(!parent)continue;
    const edition=await readRendition(env,owner,targetId,event.targetRenditionAtRecording,family);if(!edition||!atlasRecordEligible(edition))continue;
    const id='development:'+event.id;if(projection.nodes.some(n=>n.id===id))continue;
    const destination:RecordLink={family,id:targetId,rendition:event.targetRenditionAtRecording},href=buildLinkedReadingLink(destination)+(event.primaryTarget.kind==='journey-stage'?'&stage='+encodeURIComponent(event.primaryTarget.stageId):'');
    projection.nodes.push({id,kind:'development',title:'Checkpoint · '+event.summary.slice(0,140)+(event.summary.length>140?'…':''),destination,href,rev:event.revision,updatedAt:event.revisedAt??event.createdAt,basis:'saved-checkpoint',developmentRead:{scope:'target',target:event.primaryTarget,developmentId:event.id},evidence:'Explicit saved checkpoint; '+[...new Set(event.facts.map(f=>f.basis))].join(', '),synthetic:event.synthetic});
    if(projection.edges.length<240)projection.edges.push({id:id+':target',from:id,to:recordNodeId(parent),relation:'explicit-checkpoint-for',basis:'saved-checkpoint',accepted:true,reason:'Deliberately saved Development '+event.id+' revision '+event.revision+'. This is evidence of a saved statement, not proof of mastery.',source:{family,id:targetId,rev:event.targetRevAtRecording,rendition:event.targetRenditionAtRecording},destination,href,historical:parent.rendition!==event.targetRenditionAtRecording});
   }
  }
  projection.nodes.sort((a,b)=>a.updatedAt<b.updatedAt?-1:a.updatedAt>b.updatedAt?1:a.id<b.id?-1:1);
 }
 for(const proposal of q.proposals??[]){
  const from=byKey.get(proposal.from.family+':'+proposal.from.id),to=byKey.get(proposal.to.family+':'+proposal.to.id);if(!from||!to)continue;let valid=true;
  for(const ref of proposal.evidence){const saved=await readRecord(env,owner,ref.family,ref.id);if(!saved||!matchesLearningScope(saved,learningScope)||!atlasRecordEligible(saved)||saved.rev!==ref.rev||(!q.includeSynthetic&&saved.synthetic)){valid=false;break;}}
  if(valid&&projection.edges.length<240)projection.edges.push({id:'proposal:'+proposal.id,from:recordNodeId(from),to:recordNodeId(to),relation:'suggested-connection',basis:'gpt-proposal',accepted:false,reason:proposal.reason,evidence:proposal.evidence,source:{family:from.family,id:from.id,rev:from.rev,rendition:from.rendition},destination:{family:to.family,id:to.id,rendition:to.rendition},href:buildLinkedReadingLink({family:to.family,id:to.id,rendition:to.rendition}),historical:false});
 }
 await assertGenerationCurrent(env);if(await version(env,owner)!==startVersion)fail(409,'graph_changed','Evidence changed during proposal review. Restart this read.');
 const truncated=rows.results.length>q.limit,last=selected.at(-1);
 return {contract:'minamo.learning-graph.v1',lens:q.lens,scope:{...learningScope,generation,version:startVersion,focus:q.focus??null,includeSynthetic:q.includeSynthetic},...projection,truncated,nextCursor:truncated&&last?encode({v:1,scope,...last}):null,limits:{records:q.limit+1,nodes:120,edges:240},notice:'Read-only projection of saved records and explicit links. Chronology is not causation. Opening, tests, hints and graph position never imply mastery. Missing, revoked and out-of-page destinations have no speculative replacement. Revalidate before following exact links.'};
}
