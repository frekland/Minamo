import type {InterfaceViewModule} from '../lib/interface-extension';
import {viewElement as element,viewAppend as append} from '../lib/interface-extension';
import {admitTrace} from '../lib/foundry/data-core';

/** Banked finite event presentation factory for existing admitted trace/external-v1 only. */
export function finiteTraceView(title:string):InterfaceViewModule{
  if(!/^[A-Za-z][A-Za-z0-9 .-]{0,79}$/.test(title))throw Error('Use a short trusted static view title.');
  return {mount(host,payload,artefact){
    const trace=admitTrace(JSON.parse(artefact.canonical.source));
    if(JSON.stringify(trace)!==JSON.stringify(payload))throw Error('Trace display must match exact admitted source.');
    const root=element('section',undefined,'if-finite-view');root.setAttribute('aria-label',title);
    const heading=element('h4',title),notice=element('p','Supplied finite event trace. Stepping reveals existing data; it executes no code and records no progress.');
    const stage=element('div');stage.setAttribute('aria-label','Selected supplied event');stage.style.overflowWrap='anywhere';
    const controls=element('div',undefined,'if-view-controls'),previous=element('button','Previous event'),next=element('button','Next event'),reset=element('button','First event');previous.type=next.type=reset.type='button';
    const status=element('p');status.setAttribute('role','status');
    const fallback=element('details'),summary=element('summary','All supplied events as text'),source=element('pre',trace.events.map(event=>`${event.sequence} ${event.kind}: ${event.text}`).join('\n'));source.tabIndex=0;source.style.whiteSpace='pre-wrap';append(fallback,summary,source);
    let selected=0,disposed=false;
    function render(){if(disposed)return;const event=trace.events[selected];stage.replaceChildren();if(event){append(stage,element('strong',event.kind),element('pre',event.text));stage.querySelector('pre')!.style.whiteSpace='pre-wrap';}else append(stage,element('p','No supplied events.'));status.textContent=event?`Event ${selected+1} of ${trace.events.length}. Sequence ${event.sequence}; ${event.timeMs===null?'timing not supplied':String(event.timeMs)+' ms'}.`:'No supplied events.';previous.disabled=selected===0;next.disabled=selected>=trace.events.length-1;reset.disabled=selected===0;}
    const back=()=>{selected--;render();},forward=()=>{selected++;render();},first=()=>{selected=0;render();};previous.addEventListener('click',back);next.addEventListener('click',forward);reset.addEventListener('click',first);
    append(controls,previous,next,reset);append(root,heading,notice,stage,controls,status,fallback);host.replaceChildren(root);render();
    return()=>{disposed=true;previous.removeEventListener('click',back);next.removeEventListener('click',forward);reset.removeEventListener('click',first);root.replaceChildren();host.replaceChildren();};
  }};
}
