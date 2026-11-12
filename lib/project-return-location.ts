/** Route-only Project reading location. It does not create a relationship or a work record. */
export type ProjectReturnLocation={id:string;rendition?:string;stageId?:string;sectionId?:string;partId?:string};

const id=/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/;

export function projectReturnLocationFromRoute(params:URLSearchParams):ProjectReturnLocation|undefined{
 const projectId=params.get('returnJourney'),rendition=params.get('returnRendition')??undefined,stageId=params.get('returnStage')??undefined,sectionId=params.get('returnSection')??undefined,partId=params.get('returnPart')??undefined;
 if(!projectId||![projectId,rendition,stageId,sectionId,partId].every(value=>value===undefined||id.test(value))||partId&&!sectionId||(sectionId||partId)&&!rendition)return;
 if(['returnJourney','returnRendition','returnStage','returnSection','returnPart'].some(key=>params.getAll(key).length>1))return;
 return {id:projectId,...(rendition?{rendition}:{}),...(stageId?{stageId}:{}),...(sectionId?{sectionId}:{}),...(partId?{partId}:{})};
}

export function withExactProjectReturn(href:string,project:ProjectReturnLocation):string{
 if(!href.startsWith('/?')||href.length>19000||!id.test(project.id))return href;
 const params=new URLSearchParams(href.slice(2));
 if(params.get('family')==='journey'&&params.get('id')===project.id)return href;
 params.set('returnJourney',project.id);
 for(const [field,value] of [['returnRendition',project.rendition],['returnStage',project.stageId],['returnSection',project.sectionId],['returnPart',project.partId]] as const){
  if(value&&id.test(value))params.set(field,value);else params.delete(field);
 }
 const result='/?'+params;
 return result.length<=20000&&projectReturnLocationFromRoute(params)?result:href;
}
