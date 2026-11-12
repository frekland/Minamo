/** Presentation of actual saved receipts. No association is inferred here. */
export type RelationReceipt={
 from:{family:string;id:string;rev:number;rendition?:string};
 to:{family:string;id:string;rev:number;rendition?:string};
 title?:string;
 quality:'saved-record-link'|'exact-edition'|'older-edition'|'derived-bounded-path'|'saved-inbound-record-link';
 direction?:'incoming';
 citedTarget?:{family:string;id:string;rev:number;rendition?:string};
 citedProject?:{family:string;id:string;rev:number;rendition?:string};
 path?:Array<{rendition?:string;sectionId?:string;partId?:string}>;
 destination:string;
 citedDestination?:string;
 newerEdition?:{source:{rev:number};destination:string};
};

export const relationKind=(family:string)=>({journey:'Project',investigation:'Question',note:'Note',annotation:'Annotation',flag:'Bookmark',article:'Article',area:'Library topic',source:'Source',work:'Saved work',run:'Run result',experiment:'Activity'} as Record<string,string>)[family]??'Saved source';

export function relationTitle(relation:RelationReceipt,knownTitle?:string){
 return relation.title?.trim()||knownTitle?.trim()||`Linked ${relationKind(relation.to.family).toLowerCase()}`;
}

/** An unpinned reference cannot acquire edition authority from a later read. */
export function projectCitation(relation:RelationReceipt,projectId?:string){
 if(relation.quality!=='saved-inbound-record-link'||relation.direction!=='incoming'||!relation.citedProject||projectId&&relation.citedProject.id!==projectId)return undefined;
 return relation.path?.[0]?.rendition?`Cites Project r${relation.citedProject.rev}`:'References Project (edition not pinned)';
}

/** An incoming source may cite several locations in an older Project edition.
 * The label is deliberately based on saved identifiers, not current headings. */
export function projectCitationLocation(relation:RelationReceipt,projectId?:string){
 const citation=projectCitation(relation,projectId),ref=relation.path?.[0];
 if(!citation)return undefined;
 return [citation,...savedPageLocationParts(ref)].filter(Boolean).join(' · ');
}
export function savedPageLocationParts(ref?:{rendition?:string;sectionId?:string;partId?:string}){
 return [ref?.sectionId&&`Section: ${ref.sectionId}`,ref?.partId&&`Part: ${ref.partId}`].filter((item):item is string=>!!item);
}

export function relationDescription(relation:RelationReceipt,projectId?:string){
 const source=`${relationKind(relation.to.family)} · r${relation.to.rev}`;
 const citation=projectCitationLocation(relation,projectId);
 const target=relation.citedTarget;
 if(!citation&&relation.direction==='incoming'&&target)return `${source} · ${relation.path?.[0]?.rendition?`Cites ${relationKind(target.family)} r${target.rev}`:`References ${relationKind(target.family)} (edition not pinned)`}`;
 if(citation)return `${source} · ${citation}`;
 if(relation.quality==='older-edition')return `${source} · older retained edition`;
 if(relation.quality==='exact-edition')return `${source} · exact saved edition`;
 if(relation.quality==='derived-bounded-path')return `${source} · via two saved links`;
 return `${source} · saved reference (edition not pinned)`;
}

export function matchingIncomingCitation(relations:RelationReceipt[],family:string,id:string,rev:number,projectId:string){
 return relations.map(link=>link.to.family===family&&link.to.id===id&&link.to.rev===rev?projectCitation(link,projectId):undefined).find(Boolean);
}
export function matchingIncomingLocations(relations:RelationReceipt[],family:string,id:string,rev:number,projectId:string){
 return relations.filter(link=>link.to.family===family&&link.to.id===id&&link.to.rev===rev&&link.direction==='incoming'&&projectCitation(link,projectId));
}

