/** Modal sidebar lifecycle, used only while the overlay is open. */
export function containNavigationFocus(panel:HTMLElement,opener:HTMLElement|null,onClose:()=>void,companions:(HTMLElement|null)[]=[]){
 const restored=new Map<HTMLElement,boolean>();
 // Keep the trigger's ancestor path interactive so the same hitbox can close
 // the drawer; inert only the other controls along that path.
 const inertBackground=(node:HTMLElement)=>{if(node===opener||companions.includes(node))return;if((opener&&node.contains(opener))||companions.some(control=>control&&node.contains(control))){for(const child of node.children)if(child instanceof HTMLElement)inertBackground(child);return;}restored.set(node,node.inert);node.inert=true;};
 let branch:HTMLElement=panel;
 while(branch.parentElement){for(const sibling of branch.parentElement.children){if(sibling instanceof HTMLElement&&sibling!==branch&&!sibling.matches('.v2-nav-scrim')){inertBackground(sibling);}}if(branch.parentElement.classList.contains('v2-app'))break;branch=branch.parentElement;}
 const focusable=()=>Array.from(panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]')).filter(node=>!node.hidden&&!node.closest('[inert]')&&(!node.getClientRects||node.getClientRects().length>0));
 const cycle=()=>{const nodes=focusable();if(opener?.isConnected&&!opener.hidden&&!opener.closest('[inert]'))nodes.push(opener);for(const control of companions)if(control?.isConnected&&!control.hidden&&!control.closest('[inert]')&&(!control.getClientRects||control.getClientRects().length>0))nodes.push(control);return nodes;};
 (focusable()[0]??panel).focus({preventScroll:true});
 const key=(event:KeyboardEvent)=>{if(document.querySelector('dialog[open]'))return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}else if(event.key==='Tab'){const nodes=cycle(),first=nodes[0]??panel,last=nodes.at(-1)??panel;if(event.shiftKey&&(document.activeElement===first||!nodes.includes(document.activeElement as HTMLElement))){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||!nodes.includes(document.activeElement as HTMLElement))){event.preventDefault();first.focus();}}};
 document.addEventListener('keydown',key,true);
 return ()=>{document.removeEventListener('keydown',key,true);for(const [node,inert] of restored)node.inert=inert;if(opener?.isConnected)opener.focus({preventScroll:true});};
}
