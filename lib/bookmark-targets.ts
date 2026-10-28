import {isReadingFamily,type FlagTarget} from './contracts';
const identity=(x:unknown)=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(x);
const stable=(x:unknown):string=>Array.isArray(x)?'['+x.map(stable).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable((x as Record<string,unknown>)[k])).join(',')+'}':JSON.stringify(x);
/** Canonical bookmark identity excludes quoted content and presentation-only returns. */
export function canonicalFlagTarget(target:FlagTarget):unknown{
 if(!target||typeof target!=='object')throw Error('A bookmark target is required.');
 if(target.kind==='record'){if(!isReadingFamily(target.family)||!identity(target.id)||Object.keys(target).some(k=>!['kind','family','id'].includes(k)))throw Error('Choose an exact readable record.');return {kind:'record',family:target.family,id:target.id};}
 if(target.kind!=='passage'||Object.keys(target).some(k=>!['kind','anchor'].includes(k)))throw Error('Choose a record or exact passage bookmark.');const a=target.anchor;if(!a||!isReadingFamily(a.recordFamily??'article')||!identity(a.articleId)||typeof a.rendition!=='string'||!/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,239}$/.test(a.rendition)||Object.keys(a).some(k=>!['articleId','recordFamily','rendition','sectionId','partId','start','end','quote','segments','displayReturn'].includes(k)))throw Error('Choose a valid retained passage.');
 const segments=a.segments??[{sectionId:a.sectionId,partId:a.partId,start:a.start,end:a.end}];if(!segments.length||segments.length>40||segments.some(s=>!s||typeof s.sectionId!=='string'||typeof s.partId!=='string'||s.sectionId.length>160||s.partId.length>160||Object.keys(s).some(k=>!['sectionId','partId','start','end'].includes(k))||!Number.isSafeInteger(s.start)||!Number.isSafeInteger(s.end)||s.start<0||s.end<=s.start))throw Error('Choose bounded exact passage coordinates.');
 const first=segments[0];if(first.sectionId!==a.sectionId||first.partId!==a.partId||first.start!==a.start||first.end!==a.end)throw Error('Primary passage fields must match the first segment.');return {kind:'passage',family:a.recordFamily??'article',id:a.articleId,rendition:a.rendition,segments:segments.map(s=>({sectionId:s.sectionId,partId:s.partId,start:s.start,end:s.end}))};
}
export function flagTargetIdentity(target:FlagTarget){return stable(canonicalFlagTarget(target));}
export async function flagTargetKey(target:FlagTarget,owner?:string){return flagTargetKeyFromIdentity(flagTargetIdentity(target),owner);}
export async function flagTargetKeyFromIdentity(identity:string,owner?:string){return 'bookmark-'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode((owner?owner+'\0':'')+identity)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
