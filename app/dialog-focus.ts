/** Return a closed modal to its still-visible trigger or containing disclosure. */
export function returnDialogFocus(trigger:HTMLElement|null){
 if(!trigger)return;
 const visible=(node:HTMLElement)=>!!node.getClientRects().length&&!node.closest('[inert]');
 if(visible(trigger)){trigger.focus();return;}
 for(let parent=trigger.parentElement;parent;parent=parent.parentElement){
  if(parent.tagName!=='DETAILS'||parent.hasAttribute('open'))continue;
  const summary=parent.querySelector<HTMLElement>(':scope > summary');
  if(summary&&visible(summary)){summary.focus();return;}
 }
 const main=trigger.ownerDocument.getElementById('workspace-main');if(main&&visible(main))main.focus();
}
