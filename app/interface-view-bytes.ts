import type {InterfaceViewModule} from '../lib/interface-extension';
import {viewElement as element,viewAppend as append} from '../lib/interface-extension';
import {inspectTextEncoding,byteRows,encodeBase64,NOVEL_LIMITS} from '../lib/foundry/novel';

/** Exact-source, local-only inspector. It neither changes canonical text nor executes it. */
export const mount:InterfaceViewModule['mount']=(host,_payload,artefact)=>{
  const source=artefact.canonical.source,encoding=inspectTextEncoding(source);
  const root=element('section',undefined,'if-byte-view'),heading=element('h4','Source byte inspector');
  root.setAttribute('aria-label','Exact UTF-8 source byte inspector');
  const description=element('p',`${source.length} UTF-16 units · ${encoding.spans.length} Unicode characters · ${encoding.utf8.length} UTF-8 bytes. Derived locally from the exact source; no execution or learning assessment.`);
  const conversions=element('details'),conversionLabel=element('summary','Exact Base64, UTF-16 and normalization comparison');
  const base64=element('pre',encodeBase64(encoding.utf8)),utf16=element('pre',encoding.utf16.map(value=>value.toString(16).padStart(4,'0')).join(' '));
  for(const value of [base64,utf16]){value.tabIndex=0;value.style.whiteSpace='pre-wrap';value.style.overflowWrap='anywhere';value.style.maxHeight='12rem';value.style.overflowY='auto';}
  append(conversions,conversionLabel,element('h5','Base64 of exact UTF-8 bytes'),base64,element('h5','Exact UTF-16 units in hexadecimal'),utf16,element('p',`NFC ${source.normalize('NFC')===source?'matches':'differs from'} the exact source; NFD ${source.normalize('NFD')===source?'matches':'differs from'} the exact source. These comparisons never normalize, replace or re-anchor the stored text.`));
  const controls=element('div',undefined,'if-view-controls'),label=element('label','Bytes per row '),select=element('select');
  select.setAttribute('aria-label','Bytes per inspector row');for(const count of [8,16]){const option=element('option',String(count));option.value=String(count);append(select,option);}append(label,select);
  const previous=element('button','Previous rows'),next=element('button','Next rows');previous.type=next.type='button';
  const summary=element('p');summary.setAttribute('role','status');
  const region=element('div');region.tabIndex=0;region.setAttribute('role','region');region.setAttribute('aria-label','Source byte values; scroll horizontally if needed');region.style.overflowX='auto';region.style.maxWidth='100%';
  const table=element('table'),caption=element('caption','Exact source UTF-8 bytes. Offsets count bytes, not characters.'),thead=element('thead'),head=element('tr'),tbody=element('tbody');
  for(const text of ['Byte offset','Hexadecimal','ASCII equivalent']){const th=element('th',text);th.scope='col';append(head,th);}append(thead,head);append(table,caption,thead,tbody);append(region,table);
  const PAGE_ROWS=48;let page=0,disposed=false;
  function render(){if(disposed)return;const rows=byteRows(encoding.utf8,Number(select.value)||8),pages=Math.max(1,Math.ceil(rows.length/PAGE_ROWS));page=Math.max(0,Math.min(page,pages-1));tbody.replaceChildren();
    for(const row of rows.slice(page*PAGE_ROWS,(page+1)*PAGE_ROWS)){const tr=element('tr'),offset=element('th',row.offset.toString(16).padStart(6,'0'));offset.scope='row';append(tr,offset,element('td',row.hex),element('td',row.ascii));append(tbody,tr);}
    previous.disabled=page===0;next.disabled=page>=pages-1;summary.textContent=rows.length?`Rows ${page*PAGE_ROWS+1}–${Math.min((page+1)*PAGE_ROWS,rows.length)} of ${rows.length}; page ${page+1} of ${pages}.`:'The exact source is empty.';
  }
  const back=()=>{page--;render();},forward=()=>{page++;render();},resize=()=>{page=0;render();};
  previous.addEventListener('click',back);next.addEventListener('click',forward);select.addEventListener('change',resize);
  append(controls,label,previous,next);append(root,heading,description,conversions,controls,summary,region);host.replaceChildren(root);render();
  return()=>{disposed=true;previous.removeEventListener('click',back);next.removeEventListener('click',forward);select.removeEventListener('change',resize);root.replaceChildren();host.replaceChildren();};
};
export const byteViewLimits=Object.freeze({sourceUnits:NOVEL_LIMITS.textUnits,bytes:NOVEL_LIMITS.bytes,rowsPerPage:48});
