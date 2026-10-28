import type {AtlasLens,AtlasNode,LearningGraph} from './types';
export type AtlasPosition={x:number;y:number};
/** Deterministic presentation only. No force simulation, clock, randomness or learning writes. */
export function atlasLayout(graph:Pick<LearningGraph,'nodes'|'edges'>,lens:AtlasLens):Map<string,AtlasPosition>{
 const nodes=[...graph.nodes].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),positions=new Map<string,AtlasPosition>();
 if(lens==='river'){
  nodes.sort((a,b)=>a.updatedAt<b.updatedAt?-1:a.updatedAt>b.updatedAt?1:a.id<b.id?-1:1);
  nodes.forEach((n,i)=>positions.set(n.id,{x:(i%2)*330,y:Math.floor(i/2)*155}));return positions;
 }
 if(lens==='constellation'||lens==='galaxy'){
  const priority=lens==='galaxy'?['journey','activity','attempt','investigation','note','run','article','source']:['area','article','concept','investigation','source'];
  const groups=new Map<string,AtlasNode[]>();for(const n of nodes){const bucket=groups.get(n.kind)??[];bucket.push(n);groups.set(n.kind,bucket);}
  const kinds=[...groups.keys()].sort((a,b)=>priority.indexOf(a)-priority.indexOf(b)||a.localeCompare(b));
  kinds.forEach((kind,k)=>{const group=groups.get(kind)!;group.forEach((n,i)=>{const angle=2*Math.PI*k/Math.max(kinds.length,1),radius=240+(i%3)*160;positions.set(n.id,{x:400+Math.cos(angle)*radius+(Math.floor(i/3)*40),y:350+Math.sin(angle)*radius+Math.floor(i/3)*145});});});return positions;
 }
 const rank=new Map<string,number>(nodes.map(n=>[n.id,n.kind==='journey'?0:n.kind==='stage'?1:n.kind==='investigation'?2:3]));
 const columns=new Map<number,number>();for(const n of nodes){const r=rank.get(n.id)!,i=columns.get(r)??0;positions.set(n.id,{x:r*340,y:i*145});columns.set(r,i+1);}return positions;
}
