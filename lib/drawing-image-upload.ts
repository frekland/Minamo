/** Only a server-confirmed raster-container rejection permits tldraw's JPEG fallback.
 * Auth, generation, quota, timeout and storage failures must never trigger it.
 */
export function shouldReencodeDrawingJpeg(file:Pick<Blob,'type'>,error:unknown):boolean{
 return file.type==='image/jpeg'&&error instanceof Error&&error.name==='ImageStageError'&&(error as Error&{status?:number}).status===400&&(error as Error&{code?:string}).code==='invalid_image';
}

/** Browser-decoded photo -> ordinary JPEG for cameras with unsupported JPEG metadata.
 * This is an explicitly derived drawing copy; other Minamo uploads retain originals.
 */
export async function reencodeDrawingJpeg(file:Blob):Promise<Blob>{
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();image.src=url;
  await image.decode();
  const width=image.naturalWidth,height=image.naturalHeight;
  if(!width||!height)throw new Error('The selected photo has no usable dimensions.');
  const scale=Math.min(1,4096/Math.max(width,height),Math.sqrt(16_000_000/(width*height)));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));
  const context=canvas.getContext('2d');if(!context)throw new Error('The browser cannot prepare this photo for drawing.');
  context.drawImage(image,0,0,canvas.width,canvas.height);
  const converted=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('The browser could not convert this photo.')),'image/jpeg',0.9));
  if(converted.type!=='image/jpeg'||converted.size<1||converted.size>8*1024*1024)throw new Error('Converted photo is too large or has an unsupported format.');
  return converted;
 }finally{URL.revokeObjectURL(url);}
}
