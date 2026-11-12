import type {WorkspaceRecord} from './contracts';
import type {ProjectComposition,WorkThread} from './project-composition';

type Link=WorkThread['items'][number];
const find=(record:Pick<WorkspaceRecord,'sections'>|undefined,link:Link)=>record?.sections?.find(section=>section.id===link.sectionId)?.parts.find(part=>part.id===link.partId);
const key=(link:Link)=>`${link.sectionId}:${link.partId}:${link.revision??'current'}`;

/** Keep thread references attached to canonical parts, including after a save.
 * Never silently guess a replacement for removed or ambiguous material. */
export function reconcileWorkThreadReferences(next:WorkspaceRecord,prior:WorkspaceRecord|undefined,history:Map<number,WorkspaceRecord>):ProjectComposition{
 const composition=structuredClone(next.projectComposition!);
 const priorItems=prior?.projectComposition?.workThreads?.flatMap(thread=>thread.items)??[];
 for(const thread of composition.workThreads??[])for(const item of thread.items){
  const previous=priorItems.find(link=>key(link)===key(item));
  if(item.revision!==undefined){
   const revision=history.get(item.revision),exact=revision&&find(revision,item);
   if(!exact){if(!previous)throw Error(`Historical reference ${key(item)} does not identify retained material.`);item.unresolvedRef={reason:'historical-unavailable',lastSeenRevision:item.revision};}
   else delete item.unresolvedRef;
   continue;
  }
  const exact=find(next,item);
  if(exact){if(previous?.unresolvedRef)item.unresolvedRef=previous.unresolvedRef;else delete item.unresolvedRef;continue;}
  if(!previous)throw Error(`Work-thread reference ${key(item)} is not a current canonical part. Create or select an existing part first.`);
  const original=find(prior,previous),matches=(next.sections??[]).flatMap(section=>section.parts.filter(part=>part.id===item.partId).map(part=>({sectionId:section.id,part})));
  if(original&&matches.length===1&&JSON.stringify(matches[0].part)===JSON.stringify(original)&&!previous.unresolvedRef){item.sectionId=matches[0].sectionId;delete item.unresolvedRef;}
  else item.unresolvedRef={reason:matches.length?'identity-uncertain':'removed',lastSeenRevision:previous.unresolvedRef?.lastSeenRevision??prior?.rev};
 }
 return composition;
}
