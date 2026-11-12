import {admitPythonResult,type PythonLabRun} from './foundry/python-results';
import {foundryDigest} from './foundry/digest';
import {admitTypedOutputBundle,validateTypedOutputBinding,type TypedOutputBundle} from './typed-outputs';
import type {ArticleSection} from './contracts';
export type OutputImageStager=(bytes:Uint8Array,uploadId:string)=>Promise<{assetId:string;mime:string}>;
/** Explicit save preparation, never automatic. Staged assets commit only with the normal Run CAS. */
export async function preparePythonOutputSave(run:PythonLabRun,stage:OutputImageStager){
 if(!run||run.contract!=='minamo.python-lab-run.v1'||!['completed','error','interrupted'].includes(run.status)||typeof run.runId!=='string'||!/^[A-Za-z0-9_-]{8,100}$/.test(run.runId)||typeof run.capturedCode!=='string'||run.capturedCode.length>30000)throw Error('Use one bounded actual local Python result, retaining its run identity for retries.');
 const codeSha256=await foundryDigest(new TextEncoder().encode(run.capturedCode));if(codeSha256!==run.inputSha256)throw Error('Captured Python source no longer matches its original digest.');
 const result=admitPythonResult(run.result),sections:ArticleSection[]=[],outputs:TypedOutputBundle['outputs']=[];
 if(run.status==='completed'&&result.error)throw Error('Failed Python output cannot be saved as completed.');
 if(run.status==='completed')for(const [index,output] of result.outputs.entries()){
  const id='output-'+index;
  if(output.kind==='table')outputs.push({...output,id});
  else{
   const bytes=Uint8Array.from(atob(output.base64),c=>c.charCodeAt(0)),image=await stage(bytes,'science-'+run.runId+'-'+index);
   if(image.mime!=='image/png')throw Error('Scientific figure acknowledgement must preserve PNG MIME.');
   sections.push({id,title:'Figure '+(index+1),parts:[{id:'figure',kind:'image',text:output.label,image:{assetId:image.assetId,alt:output.label}}]});
   outputs.push({kind:'image',id,label:output.label,sectionId:id,partId:'figure',mime:'image/png'});
  }
 }
 const outputBundle=admitTypedOutputBundle({contract:'minamo.outputs.v1',codeSha256,runtime:result.runtime,classification:'browser-reported-output',status:run.status,stdout:run.status==='interrupted'?'':result.stdout,stderr:run.status==='interrupted'?'':result.stderr,error:run.status==='completed'?null:(result.error??'Execution did not complete.'),outputs});
 await validateTypedOutputBinding(outputBundle,run.capturedCode,sections);
 return {engine:'python' as const,code:run.capturedCode,evidence:'illustrative' as const,output:'Browser-reported '+run.status+' result · '+result.runtime+'; this server did not observe execution.',outputBundle,sections};
}
