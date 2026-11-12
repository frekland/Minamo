import type {ArticleSection,ContentPatch,PassagePart} from './contracts';
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
/** Plain canonical edits cannot keep offsets into a different text. Explicit new styling remains deliberate. */
export function editedReadingPart(before:PassagePart,after:PassagePart):PassagePart{
 if((before.text!==after.text||before.kind!==after.kind)&&before.semantic&&same(before.semantic,after.semantic)){const {semantic,...plain}=after;after=plain;}
 if((before.text!==after.text||before.kind!==after.kind)&&before.inline?.length&&same(before.inline,after.inline))return {...after,inline:[]};
 return after;
}
function authored(part:PassagePart):PassagePart{const {imageDisplay:_,unavailable:__,excerptDisplay:___,...value}=part as PassagePart & {excerptDisplay?:unknown};return value;}
/** Keep unchanged unavailable blocks on the server; never serialize a read redaction back as authored content. */
export function readingUpdate(original:ArticleSection[]|undefined,next:ArticleSection[]):{sections?:ArticleSection[];patch?:ContentPatch[]}{
 const before=original??[];
 next=next.map(section=>({...section,parts:section.parts.map(part=>{const prior=before.find(s=>s.id===section.id)?.parts.find(p=>p.id===part.id);return prior?editedReadingPart(prior,part):part;})}));
 if(same(before,next))return {};
 const replacement=()=>{
  if(next.some(section=>section.parts.some(part=>part.unavailable||!['paragraph','code','diagram','table','callout','reference','image','excerpt'].includes(part.kind))))throw new Error('This material contains unavailable or unsupported content. Keep its structure and edit an available block, or remove that block deliberately. Your draft is retained.');
  return {sections:next.map(section=>({...section,parts:section.parts.map(authored)}))};
 };
 if(!same(before.map(s=>[s.id,s.title]),next.map(s=>[s.id,s.title])))return replacement();
 const patch:ContentPatch[]=[];
 for(const section of next){const old=before.find(s=>s.id===section.id)!;
  const retained=old.parts.filter(p=>section.parts.some(n=>n.id===p.id)).map(p=>p.id),ordered=section.parts.filter(p=>old.parts.some(n=>n.id===p.id)).map(p=>p.id);
  if(!same(retained,ordered))return replacement();
  for(const part of old.parts)if(!section.parts.some(p=>p.id===part.id))patch.push({op:'removeBlock',sectionId:section.id,partId:part.id});
  for(let i=0;i<section.parts.length;i++){const part=section.parts[i],previous=old.parts.find(p=>p.id===part.id);
   if(!previous){if(part.unavailable)throw new Error('Unavailable content cannot be copied into a new block.');patch.push({op:'insertBlock',sectionId:section.id,afterPartId:i?section.parts[i-1].id:null,block:authored(part)});continue;}
   if(same(previous,part))continue;if(previous.kind!==part.kind){if(part.unavailable)throw new Error('Unavailable content cannot replace an authored block.');patch.push({op:'removeBlock',sectionId:section.id,partId:part.id},{op:'insertBlock',sectionId:section.id,afterPartId:i?section.parts[i-1].id:null,block:authored(part)});continue;}
   if(part.unavailable||previous.unavailable)throw new Error('This content is unavailable. Its original content is preserved; edit another block or remove it deliberately.');
   const a=authored(previous),b=authored(part);if(same(a,b))continue;
   const changes:Record<string,unknown>={};for(const key of Object.keys(b) as (keyof PassagePart)[]){if(key!=='id'&&key!=='kind'&&!same(a[key],b[key]))changes[key]=b[key];}
   if(Object.keys(a).some(key=>!(key in b))){patch.push({op:'removeBlock',sectionId:section.id,partId:part.id},{op:'insertBlock',sectionId:section.id,afterPartId:i?section.parts[i-1].id:null,block:b});continue;}
   patch.push({op:'patchBlock',sectionId:section.id,partId:part.id,changes});
  }
 }
 return patch.length>40?replacement():patch.length?{patch}:{};
}
