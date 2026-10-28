export type ListeningDraft={version:2;selected:string;answers:Record<string,string>};
export function readListeningDraft(raw:string|null,segmentIds:string[]):ListeningDraft{
 const empty:ListeningDraft={version:2,selected:segmentIds[0]??'',answers:{}};if(!raw)return empty;if(raw.length>280000)throw Error('Listening draft exceeds its budget.');
 const value=JSON.parse(raw),answers:Record<string,string>={};
 if(value?.version===2&&value.answers&&typeof value.answers==='object'&&!Array.isArray(value.answers))for(const id of segmentIds){const answer=value.answers[id];if(typeof answer==='string'&&answer.length<=2000)answers[id]=answer;}
 else if(Number.isInteger(value?.segment)&&segmentIds[value.segment]&&typeof value.answer==='string'&&value.answer.length<=2000)answers[segmentIds[value.segment]]=value.answer;
 return {version:2,selected:segmentIds.includes(value?.selected)?value.selected:Number.isInteger(value?.segment)&&segmentIds[value.segment]?segmentIds[value.segment]:empty.selected,answers};
}
export function keepListeningAnswer(draft:ListeningDraft,id:string,answer:string):ListeningDraft{return{version:2,selected:id,answers:{...draft.answers,[id]:answer}};}
export function chooseListeningSegment(draft:ListeningDraft,outgoingId:string,answer:string,incomingId:string):ListeningDraft{return incomingId===outgoingId?draft:{...keepListeningAnswer(draft,outgoingId,answer),selected:incomingId};}
