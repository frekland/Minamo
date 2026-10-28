import type {Family,RecordLink,LearningWorkTarget} from '../contracts';
export const ATLAS_LENSES=['route','constellation','river','galaxy'] as const;
export type AtlasLens=typeof ATLAS_LENSES[number];
export type AtlasFocus=Pick<RecordLink,'family'|'id'>;
export type AtlasProposal={id:string;from:AtlasFocus;to:AtlasFocus;reason:string;basis:'gpt-proposal';evidence:(AtlasFocus & {rev:number})[]};
export type AtlasQuery=import('../learning-spaces').LearningScopeQuery & {proposals?:AtlasProposal[];lens?:AtlasLens;focus?:AtlasFocus;limit?:number;cursor?:string;includeSynthetic?:boolean};
export type AtlasNode={id:string;kind:Family|'stage'|'concept'|'activity'|'attempt'|'development'|'correction';title:string;destination:RecordLink;href:string;rev:number;updatedAt:string;basis:'saved-record'|'authored-stage'|'canonical-concept'|'saved-checkpoint'|'saved-correction';developmentRead?:{scope:'target';target:LearningWorkTarget;developmentId:string};status?:{basis:'authored';value:string};evidence?:string;synthetic:boolean};
export type AtlasEdge={id:string;from:string;to:string;relation:string;basis:'authored-link'|'authored-stage'|'canonical-concept'|'saved-anchor'|'gpt-proposal'|'saved-checkpoint'|'saved-correction';accepted:boolean;reason:string;evidence?:(AtlasFocus & {rev:number})[];source:{family:Family;id:string;rev:number;rendition?:string};destination:RecordLink;href:string;historical:boolean};
export type LearningGraph={contract:'minamo.learning-graph.v1';lens:AtlasLens;scope:import('../learning-spaces').LearningScopeQuery & {generation:string;version:number;focus:AtlasFocus|null;includeSynthetic:boolean};nodes:AtlasNode[];edges:AtlasEdge[];truncated:boolean;nextCursor:string|null;limits:{records:number;nodes:number;edges:number};notice:string};
