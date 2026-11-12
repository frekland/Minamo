/** Browser-safe controls for explicit publication into the isolated DEV synthetic owner. */
export type LabPublicationInput={id:string;synthetic:true;activity:{authorship:'original-exercise'};[key:string]:unknown};
export function readLabPublicationInput(raw:string):LabPublicationInput{
 if(new TextEncoder().encode(raw).length>200000)throw Error('Keep the synthetic publication JSON within 200,000 UTF-8 bytes.');
 let value:unknown;try{value=JSON.parse(raw);}catch{throw Error('Enter a complete JSON object using the published Activity package schema.');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Enter one complete Activity package object.');
 const input=value as Record<string,unknown>;
 if(input.synthetic!==true)throw Error('This laboratory accepts only synthetic: true.');
 if(typeof input.id!=='string'||input.id.length>160||!/^(?:synthetic-|TEST-ONLY-)[A-Za-z0-9_.:-]+$/.test(input.id))throw Error('Use a bounded id beginning synthetic- or TEST-ONLY-.');
 if(!input.activity||typeof input.activity!=='object'||(input.activity as {authorship?:unknown}).authorship!=='original-exercise')throw Error('Use an original-exercise Activity. The real MCP validates its complete typed content.');
 return input as LabPublicationInput;
}
export function readLabMcpResult(envelope:unknown):Record<string,unknown>{
 if(!envelope||typeof envelope!=='object')throw Error('The local MCP returned no response object.');
 const response=envelope as {error?:unknown;result?:{isError?:boolean;content?:Array<{type?:string;text?:string}>}};
 if(response.error)throw Error('The local MCP returned an RPC error: '+JSON.stringify(response.error));
 const text=response.result?.content?.find(block=>block.type==='text')?.text;if(!text)throw Error('The local MCP returned no typed text result.');
 let value:unknown;try{value=JSON.parse(text);}catch{throw Error('The local MCP returned an unreadable typed result.');}
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('The local MCP returned no typed result object.');
 const result=value as Record<string,unknown>;
 if(response.result?.isError)throw Error(String(result.error??result.message??'The real MCP rejected this synthetic package.')+(result.path?' · '+String(result.path):''));
 return result;
}
export function labActivityDestination(id:string,rendition?:string){
 if(id.length>160||!/^(?:synthetic-|TEST-ONLY-)[A-Za-z0-9_.:-]+$/.test(id))throw Error('Only the isolated synthetic Activity target is allowed.');
 return '/preview-interface/workspace?'+new URLSearchParams({view:'tools',family:'experiment',id,...(rendition?{rendition}:{})});
}
