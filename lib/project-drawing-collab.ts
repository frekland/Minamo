import {DomainError,readRecord} from './domain';
import {DRAWING_MIME,drawingDocument} from './drawing-document';
import {readImage} from './assets';
import {readMedia} from './media';

/** A drawing belongs to a Project only through an exact native interactive part. */
export async function drawingContext(env:Cloudflare.Env,owner:string,projectId:string,noteId:string){
 const project=await readRecord(env,owner,'journey',projectId);
 if(!project)throw new DomainError(404,'project_unavailable','Project unavailable.');
 const declared=project.sections?.some(s=>s.parts.some(p=>p.interactive?.type==='drawing'&&p.interactive.noteId===noteId));
 if(!declared)throw new DomainError(404,'drawing_unavailable','This drawing is not part of the selected Project.');
 const note=await readRecord(env,owner,'note',noteId);
 if(!note)throw new DomainError(404,'drawing_unavailable','The Project drawing Note is unavailable.');
 const parts=note.sections?.find(s=>s.id==='drawing-document')?.parts??[];
 const snapshot=parts.find(p=>p.id==='snapshot'&&p.kind==='media'&&p.media&&p.mediaDisplay?.mime===DRAWING_MIME);
 if(!snapshot?.media)throw new DomainError(404,'drawing_unavailable','No saved drawing snapshot is available.');
 const response=await readMedia(env,owner,snapshot.media.assetId,new Request('https://minamo.invalid/api/media/'+snapshot.media.assetId));
 const document=drawingDocument(await response.json());
 return{project,note,parts,document};
}

function readableText(value:unknown):string{
 if(!value||typeof value!=='object')return'';
 const node=value as Record<string,unknown>;
 if(node.type==='text'&&typeof node.text==='string')return node.text;
 if(Array.isArray(value))return value.map(readableText).join('');
 return Array.isArray(node.content)?node.content.map(readableText).join(node.type==='paragraph'?'\n':''):'';
}

/** Exact, bounded, non-inferential summary of persisted tldraw records. */
export function drawingShapePage(document:ReturnType<typeof drawingDocument>,offset=0,limit=60){
 const records=Object.values(document.store as Record<string,any>) as any[];
 const pages=records.filter(r=>r.typeName==='page').map(r=>({id:r.id,name:r.name??''}));
 const shapes=records.filter(r=>r.typeName==='shape').sort((a,b)=>a.id.localeCompare(b.id));
 const page=shapes.slice(offset,offset+limit).map(shape=>{
  const p=shape.props??{},text=typeof p.text==='string'?p.text:readableText(p.richText);
  const summary:any={id:shape.id,type:shape.type,parentId:shape.parentId,x:shape.x??0,y:shape.y??0,rotation:shape.rotation??0,index:shape.index??null};
  for(const key of ['w','h','geo','color','fill','size','dash','arrowheadStart','arrowheadEnd','start','end','assetId'])if(p[key]!==undefined)summary[key]=p[key];
  if(text)summary.text=text.slice(0,20000);
  if(shape.type==='draw'||shape.type==='highlight')summary.strokeSegments=Array.isArray(p.segments)?p.segments.map((s:any)=>({type:s.type,pointCount:s.points?.length??0})):[];
  return summary;
 });
 return {pages,shapes:page,totalShapes:shapes.length,offset,nextOffset:offset+limit<shapes.length?offset+limit:null,hasMore:offset+limit<shapes.length,assets:records.filter(r=>r.typeName==='asset').length,bindings:records.filter(r=>r.typeName==='binding').length,completeness:'Shape text and geometry are saved document data. Freehand points are summarized; use the optional rendered preview for visual interpretation.'};
}

/** Byte delivery is explicit and opt-in, owner-checked through the normal image route. */
export async function getProjectDrawing(env:Cloudflare.Env,owner:string,args:{projectId:string;noteId:string;offset?:number;limit?:number;includePreview?:boolean;expectedNoteRev?:number}){
 const {project,note,parts,document}=await drawingContext(env,owner,args.projectId,args.noteId);
 if(args.expectedNoteRev!==undefined&&note.rev!==args.expectedNoteRev)throw new DomainError(409,'revision_conflict','The drawing Note revision changed. Restart the read at its current revision.');
 const offset=args.offset??0,limit=args.limit??60;
 if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>100)throw new DomainError(400,'invalid_page','Use an offset of zero or more and a limit of 1–100.');
 const summary=drawingShapePage(document,offset,limit);
 const previewPart=parts.find(p=>p.id==='drawing-preview'&&p.kind==='image'&&p.image?.assetId);
 let previewStatus=previewPart?'available-on-request':'not-saved';let __mcpImage:undefined|{mimeType:string;data:string};
 if(args.includePreview){
  if(!previewPart?.image?.assetId)previewStatus='not-saved';
  else try{
   const response=await readImage(env,owner,previewPart.image.assetId),bytes=new Uint8Array(await response.arrayBuffer());
   if(bytes.length>900000)previewStatus='preview-too-large';
   else{let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));__mcpImage={mimeType:response.headers.get('Content-Type')??'image/png',data:btoa(binary)};previewStatus='included';}
  }catch{previewStatus='unavailable';}
 }
 return {projectId:project.id,noteId:note.id,noteRev:note.rev,rendition:note.rendition,updatedAt:note.updatedAt,synthetic:note.synthetic,previewStatus,previewProvenance:'Private browser-exported view when saved; it may omit a failed image render. It is not evidence of execution or achievement.',...summary,...(__mcpImage?{__mcpImage}:{})};
}
