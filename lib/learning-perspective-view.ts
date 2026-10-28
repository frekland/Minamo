import type {EvidenceRef,LearningDevelopment,LearningFact,LearningWorkTarget} from './contracts';

export type ResumeFact=LearningFact & {developmentId:string;developmentRevision:number};
export type ResumeDecision={choice:string;reason:string;status:'provisional'|'established';basis:LearningFact['basis'];refs?:EvidenceRef[]};
export type LearningResume={
 source:{id:string;revision:number;primaryTarget:LearningWorkTarget;createdAt:string;revisedAt?:string;kind:LearningDevelopment['kind'];selectionBasis:'most-recently-revised-eligible-checkpoint'};
 summary:string;decisions:ResumeDecision[];nextAction?:string;
 attempts:ResumeFact[];observations:ResumeFact[];misconceptions:ResumeFact[];
 interpretations:ResumeFact[];predictions:ResumeFact[];corrections:ResumeFact[];openQuestions:string[];
 detailsDeferred?:boolean;
 noteEvidence?:LearningDevelopment['noteEvidence'];
};

/** A faithful view of the latest eligible checkpoint, never a semantic synthesis.
 * Earlier, potentially contradictory statements remain in the explicit history.
 * Callers must first apply owner, current-rights and exact evidence eligibility.
 */
export function projectLearningResume(developments:LearningDevelopment[],supersededIds:Iterable<string>=[]):LearningResume|undefined{
 const superseded=new Set(supersededIds);
 for(const item of developments)if(!item.withdrawn&&item.supersedesId)superseded.add(item.supersedesId);
 const latest=developments.filter(item=>!item.withdrawn&&!superseded.has(item.id))
  .sort((left,right)=>(right.revisedAt??right.createdAt).localeCompare(left.revisedAt??left.createdAt)||right.id.localeCompare(left.id))[0];
 if(!latest||latest.evidenceUnavailable)return;
 const enriched=(role:LearningFact['role'])=>latest.facts.filter(fact=>fact.role===role).map(fact=>({...fact,developmentId:latest.id,developmentRevision:latest.revision}));
 // New fields are optional so a retained pre-PR26 checkpoint remains truthful.
 const structured=latest as LearningDevelopment&{decisions?:ResumeDecision[];nextAction?:string};
 return {source:{id:latest.id,revision:latest.revision,primaryTarget:latest.primaryTarget,createdAt:latest.createdAt,...(latest.revisedAt?{revisedAt:latest.revisedAt}:{}),kind:latest.kind,selectionBasis:'most-recently-revised-eligible-checkpoint'},summary:latest.summary,
  decisions:structured.decisions??[],...(structured.nextAction?{nextAction:structured.nextAction}:{}),
  ...(latest.noteEvidence?.length?{noteEvidence:latest.noteEvidence}:{}),
  attempts:enriched('attempt'),observations:enriched('reported-observation'),misconceptions:enriched('misconception'),
  interpretations:enriched('interpretation'),predictions:enriched('prediction'),corrections:enriched('correction'),
  openQuestions:[...new Set([...enriched('open-question').map(fact=>fact.text),...latest.nextQuestions])],
  ...(latest.detailsDeferred?{detailsDeferred:true}:{})};
}

/** Evidence routes open the exact eligible source edition in the canonical Reader.
 * Checkpoint summaries themselves are never converted to unsafe passage anchors.
 */
export function learningEvidenceDestination(ref:EvidenceRef,returnTarget?:LearningWorkTarget):string|undefined{
 if(ref.kind==='repository')return ref.url;
 if(ref.kind!=='record')return;
 const params=new URLSearchParams({view:ref.family==='source'?'sources':ref.family==='article'?'library':'work',family:ref.family,id:ref.id});
 if(ref.rendition)params.set('rendition',ref.rendition);
 if(returnTarget?.kind==='journey-stage'){params.set('returnJourney',returnTarget.journeyId);params.set('returnStage',returnTarget.stageId);}
 return '/?'+params;
}
