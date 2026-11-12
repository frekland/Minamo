import type {ArticleSection} from './contracts';
import type {ProjectComposition} from './project-composition';
import {projectReadingTopics,type ProjectReadingTopic} from './project-reading-topics';

export type LearningContext={
 id:string;title:string;topicIds:string[];layoutIds:string[];purposes:string[];
 continuation?:{topicId:string;sectionId:string;partId:string;label?:string};
};
export type LearningIndex={id:string;title:string;topicIds:string[]};
export type ProjectLearningMap={topics:ProjectReadingTopic[];contexts:LearningContext[];indexes:LearningIndex[];coverage:{topics:number;explicitContexts:number;explicitContinuations:number}};

const partKey=(sectionId:string,partId:string)=>JSON.stringify([sectionId,partId]);
/**
 * The same pure model drives the browser and owner-scoped MCP output.
 * Missing metadata is unknown: never infer progress, a next task or learning ability.
 * Every context and index refers to canonical topic/part identities, never copies prose.
 */
export function projectLearningMap(
 composition:ProjectComposition,
 sections:ArticleSection[]=[],
 referenceTitles:Readonly<Record<string,string>>={}
):ProjectLearningMap{
 const topics=projectReadingTopics(composition,sections,referenceTitles);
 const titleBySection=new Map(sections.map(section=>[section.id,section.title]));
 const byContext=new Map<string,LearningContext>();
 const partOwner=new Map<string,ProjectReadingTopic>();
 for(const topic of topics){
  for(const partId of topic.partIds)partOwner.set(partKey(topic.sectionId,partId),topic);
  const id=topic.contextId??topic.blockId;
  let context=byContext.get(id);
  if(!context){
   context={id,title:topic.contextTitle||titleBySection.get(topic.sectionId)||topic.title,topicIds:[],layoutIds:[],purposes:[]};
   byContext.set(id,context);
  }
  context.topicIds.push(topic.id);
  if(!context.layoutIds.includes(topic.layoutId))context.layoutIds.push(topic.layoutId);
  if(topic.purpose&&!context.purposes.includes(topic.purpose))context.purposes.push(topic.purpose);
 }
 let explicitContinuations=0;
 for(const topic of topics){
  if(!topic.continuation)continue;
  const target=topic.continuation.target,owner=partOwner.get(partKey(target.sectionId,target.partId));
  if(!owner)continue;
  const context=byContext.get(topic.contextId??topic.blockId);
  if(!context||context.continuation)continue;
  context.continuation={topicId:owner.id,sectionId:target.sectionId,partId:target.partId,label:topic.continuation.label};
  explicitContinuations++;
 }
 const purposes=['source','translation','explanation','practice','reference','overview'];
 const indexes=purposes.map(id=>({
   id,title:({source:'Original material',translation:'Translations',explanation:'Understand',practice:'Practise',reference:'Reference',overview:'Overview'} as Record<string,string>)[id],
   topicIds:topics.filter(topic=>topic.purpose===id).map(topic=>topic.id)
 })).filter(index=>index.topicIds.length);
 return {
  topics,contexts:[...byContext.values()],indexes,
  coverage:{topics:topics.length,explicitContexts:topics.filter(topic=>!!topic.contextId).length,explicitContinuations}
 };
}
/** Material for one exact saved topic. No fetch, no inferred source or hidden-part leaks. */
export function exactLearningTopics(map:ProjectLearningMap,sections:ArticleSection[],ids:string[]){
 const bySection=new Map(sections.map(section=>[section.id,section]));
 return ids.map(id=>{
  const topic=map.topics.find(t=>t.id===id);
  if(!topic)throw Error('Unknown or hidden Project reading topic.');
  const section=bySection.get(topic.sectionId);
  const parts=topic.kind==='content'?topic.partIds.map(partId=>section?.parts.find(p=>p.id===partId&&!p.unavailable)):undefined;
  if(topic.kind==='content'&&(!section||parts?.some(part=>!part)))throw Error('Reading topic refers to unavailable content.');
  return {topic,parts:parts??[]};
 });
}
