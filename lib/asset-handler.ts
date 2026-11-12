import {MEDIA_LIMITS} from './media-formats';
import {DomainError} from './domain';
import {resolveGeneration,withGeneration,requireGeneration} from './generations';
import {AssetError,stageImage,readImageUpload,readImage,readEligibleImageMetadata,revokeImage,expireStagedImages,IMAGE_BYTE_LIMIT,IMAGE_AXIS_LIMIT,IMAGE_PIXEL_LIMIT} from './assets';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'oai-authenticated-user-id'};
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers});
/** Sites supplies identity; URL/asset identity never grants read access. Binary bytes stay outside commands. */
export async function assetHandler(request:Request,env:Cloudflare.Env):Promise<Response>{
 let generationToken:string|undefined;const respond=(value:unknown,status=200)=>{const response=reply(value&&typeof value==='object'?{...value,generation:generationToken}:value,status);if(generationToken)response.headers.set('X-Minamo-Generation',generationToken);return response};
 try{
  const rootOwner=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
  if(!rootOwner||!email)throw new AssetError(401,'sign_in_required','Sign in with ChatGPT is required.');
  const url=new URL(request.url),origin=request.headers.get('origin');const current=await resolveGeneration(env,rootOwner!);generationToken=current.generation;requireGeneration(current,request.headers.get('x-minamo-generation')??url.searchParams.get('generation'));env=withGeneration(env,current);const owner=current.namespace;
  if(request.method!=='GET'&&origin&&origin!==url.origin)throw new AssetError(403,'origin_mismatch','Use the private Site to upload or change an image.');
  if(url.pathname==='/api/assets/capabilities'&&request.method==='GET')return respond({images:{formats:['image/png','image/jpeg','image/webp'],byteLimit:IMAGE_BYTE_LIMIT,axisLimit:IMAGE_AXIS_LIMIT,pixelLimit:IMAGE_PIXEL_LIMIT,animation:false,private:true,stagingHours:24,attachment:'Finalised atomically only when the containing record save is acknowledged.',inspection:'Container signatures and dimensions validated; browser decoding may still fail.',gptPixelsDelivered:false},mediaCapabilities:'/api/media/capabilities',audio:{formats:['audio/mpeg','audio/wav'],byteLimit:MEDIA_LIMITS.audio,endpoint:'/api/media'},video:{formats:['video/mp4','video/webm'],byteLimit:MEDIA_LIMITS.video,endpoint:'/api/media'},documents:{formats:['application/pdf','text/plain','text/markdown'],byteLimit:MEDIA_LIMITS.document,endpoint:'/api/media',downloadOnly:true}});
  if(url.pathname==='/api/assets/stage'&&request.method==='POST'){
   const mime=request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
   if(!mime||!['image/png','image/jpeg','image/webp'].includes(mime))throw new AssetError(415,'image_type','Choose a PNG, JPEG or WebP image.');
   const asset=await stageImage(env,owner,url.searchParams.get('uploadId')??'',await readImageUpload(request),mime);
   // Opportunistic bounded cleanup on an explicit mutation; never on render/read.
   // A cleanup failure does not change the acknowledged immutable upload.
   try{await expireStagedImages(env,owner,20)}catch{}
   return respond({asset});
  }
  const match=/^\/api\/assets\/(image-[a-f0-9]{64})(\/(?:revoke|metadata))?$/.exec(url.pathname);
  if(match&&match[2]==='/metadata'&&request.method==='GET')return respond({asset:await readEligibleImageMetadata(env,owner,match[1])});
  if(match&&!match[2]&&request.method==='GET'){const response=await readImage(env,owner,match[1]);response.headers.set('X-Minamo-Generation',current.generation);return response;}
  if(match&&match[2]==='/revoke'&&request.method==='POST'){
   if(!request.headers.get('content-type')?.startsWith('application/json'))throw new AssetError(415,'json_required','Use a JSON image revision.');
   const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});
   if(reader)while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>256){await reader.cancel();throw new AssetError(413,'payload_too_large','Use only the exact image revision.');}try{raw+=decoder.decode(next.value,{stream:true});}catch{await reader.cancel();throw new AssetError(400,'invalid_json','Use well-formed UTF-8 JSON.');}}try{raw+=decoder.decode();}catch{throw new AssetError(400,'invalid_json','Use well-formed UTF-8 JSON.');}
   let value:unknown;try{value=JSON.parse(raw)}catch{throw new AssetError(400,'invalid_json','Use the exact image revision.');}
   if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(key=>key!=='expectedRevision'))throw new AssetError(400,'invalid_shape','Use only the exact image revision.');
   return respond({asset:await revokeImage(env,owner,match[1],(value as {expectedRevision:number}).expectedRevision)});
  }
  return respond({error:'Image route unavailable.',code:'not_found'},404);
 }catch(error){return respond({error:(error instanceof AssetError||error instanceof DomainError)?error.message:'Private image storage could not complete this request. Retain the local file and upload identity.',code:(error instanceof AssetError||error instanceof DomainError)?error.code:'asset_storage_unavailable'},(error instanceof AssetError||error instanceof DomainError)?error.status:503);}
}
