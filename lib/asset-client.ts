import {generationFetch} from "./workspace-generation";
/** Browser-only transport for the authenticated owner-private image stage route.
 * A staged asset is attached/finalized by the existing parent record command, never a second queue.
 */
export const IMAGE_UPLOAD_LIMITS=Object.freeze({maxBytes:8*1024*1024,maxDimension:8192,maxPixels:32*1024*1024});
export type ImageMime='image/png'|'image/jpeg'|'image/webp';
export type PrivateImageAsset={assetId:string;mime:ImageMime;bytes:number;width:number;height:number;digest:string;revision:number;state:'staged'|'attached';expiresAt?:string|null};
export type ImageAttachmentProposal={assetId:string;alt:string;caption?:string};
const MIME_TYPES:readonly string[]=['image/png','image/jpeg','image/webp'];
export function imageAttachmentProposal(assetId:string,alt:string,caption=''):ImageAttachmentProposal{
 if(typeof assetId!=='string'||!assetId||assetId.length>240||/[\u0000-\u0020/\\?#]/.test(assetId))throw new Error('The uploaded image is unavailable.');
 if(typeof alt!=='string'||!alt.trim()||alt.length>2000)throw new Error('Add an image description of at most 2000 characters.');
 if(typeof caption!=='string'||caption.length>1000)throw new Error('Use a caption of at most 1000 characters.');
 return{assetId,alt:alt.trim(),...(caption.trim()?{caption:caption.trim()}:{})};
}
export function validateImageEnvelope(file:Pick<Blob,'size'|'type'>){
 if(!MIME_TYPES.includes(file.type))throw new Error('Choose a PNG, JPEG or WebP image. SVG, HTML and other file types are not supported.');
 if(!Number.isSafeInteger(file.size)||file.size<=0||file.size>IMAGE_UPLOAD_LIMITS.maxBytes)throw new Error('Choose a nonempty image of at most 8 MiB.');
}
export function validateImageDimensions(width:number,height:number){if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width>IMAGE_UPLOAD_LIMITS.maxDimension||height>IMAGE_UPLOAD_LIMITS.maxDimension||width*height>IMAGE_UPLOAD_LIMITS.maxPixels)throw new Error('Image dimensions must be at most 8192 pixels on either side and 32 Mi pixels in total.');}
/** Decode only the local selected bytes; no upload, transformation or third-party request. */
export async function validateImageFile(file:Blob):Promise<void>{
 validateImageEnvelope(file);
 const url=URL.createObjectURL(file);
 try{await new Promise<void>((resolve,reject)=>{const image=new Image();const timeout=setTimeout(()=>{image.src='';reject(new Error('Local image preview timed out. Choose another image.'));},10000);image.onload=()=>{clearTimeout(timeout);try{validateImageDimensions(image.naturalWidth,image.naturalHeight);resolve();}catch(error){reject(error)}};image.onerror=()=>{clearTimeout(timeout);reject(new Error('The browser could not decode this image. Choose another PNG, JPEG or WebP.'));};image.src=url;});}finally{URL.revokeObjectURL(url);}
}
export function parseStagedImage(value:unknown,expectedFile:Pick<Blob,'size'|'type'>):PrivateImageAsset{
 if(!value||typeof value!=='object')throw new Error('The server did not acknowledge an image. Your local selection is retained.');
 const candidate=value as Record<string,unknown>;
 validateImageDimensions(candidate.width as number,candidate.height as number);
 if(typeof candidate.assetId!=='string'||candidate.assetId.length<1||candidate.assetId.length>240||/[\u0000-\u0020/\\?#]/.test(candidate.assetId)||candidate.mime!==expectedFile.type||candidate.bytes!==expectedFile.size||typeof candidate.digest!=='string'||!/^[a-f0-9]{64}$/.test(candidate.digest)||!Number.isSafeInteger(candidate.revision)||(candidate.revision as number)<1||(candidate.state!=='staged'&&candidate.state!=='attached'))throw new Error('The image acknowledgement did not match the selected original. Your local selection is retained.');
 return {assetId:candidate.assetId,mime:candidate.mime as ImageMime,bytes:candidate.bytes as number,width:candidate.width as number,height:candidate.height as number,digest:candidate.digest,revision:candidate.revision as number,state:candidate.state,...(typeof candidate.expiresAt==='string'?{expiresAt:candidate.expiresAt}:{})};
}
/** Call only after explicit upload. Retain uploadId and the exact original File for uncertain retries. */
export async function stageImage(file:Blob,uploadId:string,signal?:AbortSignal,ownerScope="legacy-image-client"):Promise<PrivateImageAsset>{
 validateImageEnvelope(file);if(!/^[a-zA-Z0-9_-]{8,128}$/.test(uploadId))throw new Error('Upload retry identity is invalid.');
 const abort=new AbortController(),forwardAbort=()=>abort.abort();if(signal?.aborted)abort.abort();else signal?.addEventListener('abort',forwardAbort,{once:true});const timeout=setTimeout(()=>abort.abort(),30000);
 try{
 const response=await generationFetch(ownerScope,'/api/assets/stage?'+new URLSearchParams({uploadId}),{method:'POST',credentials:'same-origin',cache:'no-store',redirect:'error',headers:{'Content-Type':file.type},body:file,signal:abort.signal});
 let result:unknown;try{result=await response.json();}catch{throw new Error('Image acknowledgement could not be read. Retry the same original image.');}
 if(!response.ok){const message=result&&typeof result==='object'&&(result as {error?:unknown}).error;throw new Error(typeof message==='string'?message.slice(0,1000):'Image upload was not acknowledged. Retry the same original image.');}
 return parseStagedImage(result&&typeof result==='object'?(result as {asset?:unknown}).asset:null,file);
 }finally{clearTimeout(timeout);signal?.removeEventListener('abort',forwardAbort);}
}
