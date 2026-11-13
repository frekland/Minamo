import type {ArticleSection} from './contracts';
import type {ProjectComposition} from './project-composition';

export type ProjectReadingTopic={id:string;layoutId:string;blockId:string;sectionId:string;partIds:string[];title:string;purpose?:string;provenance?:string;source?:{sectionId:string;partId:string};contextId?:string;contextTitle?:string;relations?:{kind:'explains'|'practises'|'corrects'|'continues'|'related';target:{sectionId:string;partId:string}}[];references?:{family:'article'|'investigation'|'source';id:string;rendition:string;sectionId?:string;partId?:string;relation:'related'|'explains'|'applies'|'contrasts'|'supports'|'extends'|'source'|'next';reason:string}[];continuation?:{target:{sectionId:string;partId:string};label?:string};kind:'content'|'reference'};

/** Only real Project identities: never infer a fixture name, language lesson or attempt. */
export function projectReadingTopics(composition:ProjectComposition,sections:ArticleSection[]=[],referenceTitles:Readonly<Record<string,string>>={}):ProjectReadingTopic[]{
 const content=new Map(sections.map(s=>[s.id,s]));
 const result:ProjectReadingTopic[]=[];
 const visibleLayouts=new Set(composition.sections.filter(section=>!section.hidden).map(section=>section.id));
 const seenBlocks=new Set<string>();
 // Traverse every placement once, including blocks whose origin layout is hidden.
 // A hidden origin only hides that origin surface; an explicitly routed page remains
 // available at a visible destination. Block.hidden still suppresses the material.
 for(const layout of composition.sections){
  const referenceNames=new Map<string,number>();
  for(const slot of layout.slots){
   for(const blockId of slot.blockIds){
    if(seenBlocks.has(blockId))continue;seenBlocks.add(blockId);
    const block=composition.blocks.find(b=>b.id===blockId);
    if(!block||block.hidden)continue;
    const section=block.sectionId?content.get(block.sectionId):undefined;
    if(block.ref&&!section){const name=referenceTitles[block.id]?.trim()||`Reference · ${block.ref.id.slice(0,24)}`;const occurrence=(referenceNames.get(name)??0)+1;referenceNames.set(name,occurrence);const title=occurrence===1?name:`${name} · ${occurrence}`;result.push({id:`${layout.id}:${block.id}:ref`,layoutId:layout.id,blockId:block.id,sectionId:block.id,partIds:[],title,kind:'reference'});continue;}
    if(!section)continue;
    if(block.readingPages){for(const page of block.readingPages){const destination=page.layoutId??layout.id;if(!visibleLayouts.has(destination))continue;const partIds=page.partIds.filter(id=>section.parts.some(p=>p.id===id&&!p.unavailable));if(partIds.length)result.push({id:`${destination}:${block.id}:${page.id}`,layoutId:destination,blockId:block.id,sectionId:section.id,partIds,title:page.title,purpose:page.purpose,provenance:page.provenance,source:page.source,contextId:page.contextId,contextTitle:page.contextTitle,relations:page.relations,references:page.references,continuation:page.continuation,kind:'content'});}continue;}
    if(!visibleLayouts.has(layout.id))continue;
    const parts=section.parts.filter(p=>!p.unavailable);
    // Native sections are the real topics. Do not invent navigation from random prose
    // inside a block. Only exceptionally long blocks are divided into numbered parts.
    const chunks=parts.length<=16?[parts]:Array.from({length:Math.ceil(parts.length/8)},(_,i)=>parts.slice(i*8,i*8+8));
    for(const [index,chunk] of chunks.entries()){if(!chunk.length)continue;
     const title=(section.title||layout.title||layout.pattern).trim();
     result.push({id:`${layout.id}:${block.id}:${chunk[0].id}`,layoutId:layout.id,blockId:block.id,sectionId:section.id,partIds:chunk.map(p=>p.id),title:chunks.length===1?title:`${title} · ${index+1}`,kind:'content'});
    }
   }
  }
 }
 // Destination order is authoritative for reading. Within each destination,
 // retain stable origin placement/page order from the traversal above.
 const destinationOrder=new Map(composition.sections.map((section,index)=>[section.id,index]));
 return result.sort((a,b)=>(destinationOrder.get(a.layoutId)??Number.MAX_SAFE_INTEGER)-(destinationOrder.get(b.layoutId)??Number.MAX_SAFE_INTEGER));
}
