import type {PassagePart} from './contracts';
/** Use in current/retained/export projections; unavailable nested metadata never leaves the permission boundary. */
export function projectInteractiveAssets(p:PassagePart,allowed:(id:string,kind:'image'|'media')=>boolean):PassagePart{
 const d=p.interactive;if(!d)return p;if(d.type==='flashcards')return{...p,interactive:{...d,cards:d.cards.map(c=>({...c,front:{...c.front,...(c.front.image&&!allowed(c.front.image.assetId,'image')?{image:undefined}:{})},back:{...c.back,...(c.back.image&&!allowed(c.back.image.assetId,'image')?{image:undefined}:{})}}))}};
 if(d.type==='pygbag'&&!allowed(d.assetId,'media'))return{id:p.id,kind:'interactive',text:'',unavailable:true};return p;
}
