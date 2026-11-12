import {z} from 'zod';
import type {LearningGraph} from './types';
const point=z.number().finite().min(-100000).max(100000);
/** Snapshots retain identities and coordinates, never source titles, excerpts, URLs or rights. */
export const atlasCanvasSchema=z.object({contract:z.literal('minamo.atlas-layout.v1'),generation:z.string().min(1).max(180),cards:z.array(z.object({recordKey:z.string().min(1).max(400),x:point,y:point,w:z.number().finite().min(120).max(800),h:z.number().finite().min(60).max(800)}).strict()).max(120)}).strict();
export type AtlasCanvasSnapshot=z.infer<typeof atlasCanvasSchema>;
export function revalidateAtlasCanvas(input:unknown,graph:LearningGraph):AtlasCanvasSnapshot{
 const parsed=atlasCanvasSchema.parse(input);if(parsed.generation!==graph.scope.generation)throw Error('Canvas layout belongs to another workspace generation. Retain it separately.');
 const eligible=new Set(graph.nodes.map(n=>n.id)),seen=new Set<string>();
 return {...parsed,cards:parsed.cards.filter(card=>{if(!eligible.has(card.recordKey)||seen.has(card.recordKey))return false;seen.add(card.recordKey);return true;})};
}
