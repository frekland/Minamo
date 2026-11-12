/** Navigation context is not parent ownership, eligibility or a checkpoint target. */
export type ProjectReturnContext={journeyId:string;stageId?:string};
export function withProjectReturn(relative:string,context?:ProjectReturnContext):string{
 if(!context)return relative;
 if(!relative.startsWith('/?')||relative.startsWith('//'))throw Error('Use an exact Minamo content link.');
 const bounded=(value:string)=>{if(typeof value!=='string'||!value||value.length>240||/[\u0000-\u001f\u007f]/.test(value))throw Error('Use an exact Project return identity.');return value;};
 const params=new URLSearchParams(relative.slice(2));params.set('returnJourney',bounded(context.journeyId));
 if(context.stageId)params.set('returnStage',bounded(context.stageId));else params.delete('returnStage');
 return '/?'+params;
}
