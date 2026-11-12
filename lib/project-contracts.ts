import type {Family,LearningWorkTarget,RecordLink} from './contracts';
/** Read-only learner projections. Wire/storage families and exact targets remain unchanged. */
export type ProjectProvenance={direction:'outgoing'|'incoming';sourceFamily:Family;sourceId:string;relation?:RecordLink['relation'];reason?:string;stageId?:string;sectionId?:string;questionId?:string};
export type ProjectCoverage={complete:boolean;nextCursor?:string};
export type ProjectIdentity={family:'journey';id:string;title:string;rev:number;rendition?:string;destination:string};
export type ProjectQuestion={family:'investigation';id:string;title:string;rev:number;rendition?:string;destination:string;provenance:ProjectProvenance[]};
export type ProjectStep={stageId:string;sectionId:string;title:string;intent?:string;optional:boolean;structured:boolean;destination:string;questions:ProjectQuestion[]};
export type ProjectContinuation={destination:string;title:string;basis:'checkpoint'|'recent-note'|'start';label:string;at?:string;target?:LearningWorkTarget;note?:{id:string;title:string;destination:string};checkpoint?:{id:string;at:string;destination?:string;title?:string}};
export type ProjectOutline={version:1;generation:string;project:ProjectIdentity;steps:ProjectStep[];projectQuestions:ProjectQuestion[];relationshipCoverage:ProjectCoverage;continuation?:ProjectContinuation;continuationCoverage?:ProjectCoverage};
export type ProjectResource={family:'article'|'area';id:string;title:string;rev:number;rendition?:string;sectionId?:string;partId?:string;destination:string;description?:string;provenance:ProjectProvenance[]};
export type ProjectResources={version:1;generation:string;project:ProjectIdentity;resources:ProjectResource[];relationshipCoverage:ProjectCoverage};
export type IndependentQuestions={version:1;generation:string;questions:ProjectQuestion[];relationshipCoverage:ProjectCoverage};
