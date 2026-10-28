import type {ProjectCover} from './contracts';
import {DomainError} from './domain-error';
/** Shared command/recovery validation; no URL or byte transport is implied. */
export function validateProjectCover(value:unknown):ProjectCover|null{
 if(value===null)return null;
 const invalid=()=>{throw new DomainError(400,'invalid_project_cover','Choose an owned image and mark it decorative or add a description.','data.projectCover');};
 if(!value||typeof value!=='object'||Array.isArray(value))return invalid();
 const cover=value as Record<string,unknown>;
 if(Object.keys(cover).some(key=>!['assetId','alt','decorative'].includes(key))||typeof cover.assetId!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(cover.assetId)||typeof cover.decorative!=='boolean'||(cover.alt!==undefined&&(typeof cover.alt!=='string'||cover.alt.length>2000||/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(cover.alt)))||(!cover.decorative&&(typeof cover.alt!=='string'||!cover.alt.trim())))return invalid();
 return{assetId:cover.assetId,decorative:cover.decorative,...(!cover.decorative?{alt:(cover.alt as string).trim()}: {})};
}
export function projectImagePrompt(title:string){return `Create an optional cover image for my Minamo Project, “${title}”. Use the title as inspiration; do not add text, UI, progress claims or personal information. Prefer a wide image with a clear subject and calm composition. Show me the image so I can review and save it. I will then choose the saved file in Minamo’s Project image control. Do not claim it has been attached or save learning checkpoints. If image generation is unavailable, tell me.`;}
