/** Native dialog backdrop clicks are outside its rectangle; empty dialog padding is inside. */
export function closeOnDialogBackdrop(event:{target:EventTarget|null;currentTarget:HTMLDialogElement;clientX:number;clientY:number},close:()=>void){
 if(event.target!==event.currentTarget)return false;
 const rect=event.currentTarget.getBoundingClientRect();
 if(event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom)return false;
 close();return true;
}
/** Nested editors, composition and native modal dialogs retain keyboard ownership. */
export function overlayEscape(event:Pick<KeyboardEvent,'key'|'defaultPrevented'|'isComposing'>,nativeModalOpen=false){return event.key==='Escape'&&!event.defaultPrevented&&!event.isComposing&&!nativeModalOpen;}
export function cyclePopoverFocus(event:Pick<KeyboardEvent,'key'|'defaultPrevented'|'isComposing'|'shiftKey'|'preventDefault'>,panel:HTMLElement,opener:HTMLElement|null,active:Element|null){
 if(event.key!=='Tab'||event.defaultPrevented||event.isComposing)return false;
 const nodes=Array.from(panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(node=>!node.hidden&&!node.closest('[inert]')&&node.getClientRects().length>0);
 if(opener?.isConnected&&!opener.hidden&&!opener.closest('[inert]'))nodes.push(opener);
 const first=nodes[0],last=nodes.at(-1);if(!first||!last)return false;
 if(event.shiftKey&&(active===first||!nodes.includes(active as HTMLElement))){event.preventDefault();last.focus();return true;}
 if(!event.shiftKey&&(active===last||!nodes.includes(active as HTMLElement))){event.preventDefault();first.focus();return true;}
 return false;
}
