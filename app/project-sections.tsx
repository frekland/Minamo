'use client';
import {useEffect,useRef,useState,type ReactNode,type ReactElement} from 'react';
import {Pencil,Plus,Check,X,ChevronDown,ChevronUp,ArrowUp,ArrowDown,Star} from 'lucide-react';
import {tableCanonicalText,imageCanonicalText} from '../lib/contracts';
import type {WorkspaceRecord,ArticleSection} from '../lib/contracts';
import {adaptedComposition,patterns,type ProjectComposition} from '../lib/project-composition';
import {generationFetch,workspaceGenerationFromScope} from '../lib/workspace-generation';
import {stageImage} from '../lib/asset-client';
import {clientId} from '../lib/client-id';
import Reader,{RichReadingPart,type ReaderProps} from './reader';
import NoteMarkdownView from './note-markdown-view';
import ProjectCover from './project-cover';
import {InteractiveEditor} from './project-interactive';
import './project-sections.css';
export default function ProjectSections(props:ReaderProps){
 const [folds,setFolds]=useState<Record<string,boolean>>({}),[arranging,setArranging]=useState(false);
 const [record,setRecord]=useState(props.article),[editing,setEditing]=useState(false),[draft,setDraft]=useState(props.article),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[refs,setRefs]=useState<Record<string,WorkspaceRecord|null>>({});
 const pending=useRef<any>(null),scope=props.draftScope,key='minamo-project-draft:'+scope+':'+record.id;
 useEffect(()=>{setRecord(props.article);if(!editing)setDraft(props.article);},[props.article]);
 useEffect(()=>{let live=true;generationFetch(scope,'/api/projects/composition?projectId='+encodeURIComponent(record.id)).then(r=>r.json()).then((value:any)=>{if(live&&value.references)setRefs(Object.fromEntries(value.references.map((r:any)=>[r.blockId,r.record])));}).catch(()=>{});return()=>{live=false;};},[scope,record.id,record.rev]);
 useEffect(()=>{const receive=(event:Event)=>{const d=(event as CustomEvent).detail;if(d?.ownerScope===scope&&d.record?.family==='journey'&&d.record.id===record.id){setRecord(d.record);if(!editing)setDraft(d.record);else setMessage('The saved Project changed. Your draft is retained against its original revision.');}};window.addEventListener('minamo-record-committed',receive);return()=>window.removeEventListener('minamo-record-committed',receive);},[scope,record.id,editing]);
 function begin(){setArranging(false);let retained:WorkspaceRecord|undefined;try{const raw=localStorage.getItem(key);if(raw)retained=JSON.parse(raw);}catch{}try{const raw=localStorage.getItem(key+':operation');if(raw)pending.current=JSON.parse(raw);}catch{}setDraft(retained??record);setEditing(true);setMessage(retained?'Your unsaved edits were recovered.':'');}
 function update(next:WorkspaceRecord){setDraft(next);try{localStorage.setItem(key,JSON.stringify(next));}catch{setMessage('Keep this page open until your edits are saved.');}}
 async function save(){setBusy(true);setMessage('');try{const request=pending.current??{operationId:clientId(),expectedGeneration:workspaceGenerationFromScope(scope),projectId:record.id,expectedProjectRev:draft.rev,title:draft.title,description:draft.projectDescription??'',body:draft.body,contentSections:draft.sections??[],composition:adaptedComposition(draft)};pending.current=request;try{localStorage.setItem(key+':operation',JSON.stringify(request));}catch{}const response=await generationFetch(scope,'/api/projects/update',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)});const result=await response.json() as any;if(!response.ok||result.status!=='committed'){if(response.status>=400&&response.status<500){pending.current=null;try{localStorage.removeItem(key+':operation');}catch{}}throw Error(result.error??'This Project changed. Your edits are retained; reload the Project before saving again.');}const read=await generationFetch(scope,'/api/projects/composition?projectId='+encodeURIComponent(record.id)),saved=await read.json() as any;if(!read.ok||!saved.record)throw Error('Save receipt received; reading back the Project failed. Retry the same save.');setRecord(saved.record);setDraft(saved.record);pending.current=null;setEditing(false);setArranging(false);try{localStorage.removeItem(key);localStorage.removeItem(key+':operation');}catch{}window.dispatchEvent(new CustomEvent('minamo-record-committed',{detail:{ownerScope:scope,record:saved.record}}));setMessage('Saved.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 function add(pattern:typeof patterns[number]){const id='section-'+clientId(),content:ArticleSection={id,title:'New section',parts:[{id:'text-'+clientId(),kind:'paragraph',text:''}]};const c=structuredClone(adaptedComposition(draft));c.sections.push({id,title:'',pattern,slots:[{id:'primary',role:'primary',blockIds:[id]}]});c.blocks.push({id,sectionId:id});update({...draft,sections:[...(draft.sections??[]),content],projectComposition:c});}
 async function addImage(section:ArticleSection,file:File|undefined){if(!file||busy)return;setBusy(true);setMessage('');try{const asset=await stageImage(file,clientId(),new AbortController().signal,scope),image={assetId:asset.assetId,alt:'Project image'},part={id:'image-'+clientId(),kind:'image' as const,image,text:imageCanonicalText(image)};changeSection({...section,parts:[...section.parts,part]});setMessage('Image ready. Add its description, then save the Project.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 const current=editing?draft:record,composition=adaptedComposition(current);
 const changeSection=(section:ArticleSection)=>update({...draft,sections:draft.sections?.map(s=>s.id===section.id?section:s)});
 function changeLayout(change:(layout:ProjectComposition)=>void){
  const next=structuredClone(composition);
  change(next);
  update({...draft,projectComposition:next});
 }
 function moveSection(id:string,offset:number){
  changeLayout(layout=>{const index=layout.sections.findIndex(section=>section.id===id),target=index+offset;if(index<0||target<0||target>=layout.sections.length)return;const [section]=layout.sections.splice(index,1);layout.sections.splice(target,0,section);});
 }
 function moveBlock(id:string,slotId:string,sectionId:string,offset:number){
  changeLayout(layout=>{const ids=layout.sections.find(s=>s.id===sectionId)?.slots.find(s=>s.id===slotId)?.blockIds;if(!ids)return;const index=ids.indexOf(id),target=index+offset;if(index<0||target<0||target>=ids.length)return;ids.splice(target,0,...ids.splice(index,1));});
 }
 function toggleFavourite(id:string){
  changeLayout(layout=>{const favourites=layout.favourites??[];layout.favourites=favourites.includes(id)?favourites.filter(value=>value!==id):[...favourites,id];});
 }
 function reference(block:ProjectComposition['blocks'][number]){const target=refs[block.id],ref=block.ref!;const path='/?'+new URLSearchParams({view:ref.family==='journey'?'journeys':ref.family==='note'||ref.family==='run'?'work':ref.family==='source'?'sources':'library',family:ref.family,id:ref.id,...(ref.rendition?{rendition:ref.rendition}:{}),...(ref.sectionId?{section:ref.sectionId}:{}),...(ref.partId?{part:ref.partId}:{})});
  return target?<div className="pc-reference"><a className="pc-source" href={path}>{target.title} ↗</a>{target.family==='note'?<NoteMarkdownView source={target.body} imageParts={target.sections?.flatMap(s=>s.parts)} ownerScope={scope}/>:<>{target.body&&<p>{target.body}</p>}{target.sections?.filter(s=>!ref.sectionId||s.id===ref.sectionId).map(s=><div key={s.id}><h3>{s.title}</h3>{s.parts.filter(p=>!ref.partId||p.id===ref.partId).map(p=><RichReadingPart key={p.id} part={p} sectionId={'ref-'+block.id+'-'+s.id} article={target} captures={[]} ownerScope={scope}/>)}</div>)}{target.code&&<pre><code>{target.code}</code></pre>}{target.output&&<pre>{target.output}</pre>}</>}</div>:<p className="v2-muted">Referenced content is unavailable or has not loaded.</p>;
 }
 function renderBlockContent(block:ProjectComposition['blocks'][number],content:ArticleSection|undefined,byId:Map<ReactElement['key'],ReactNode>){
  if(block.ref)return reference(block);
  if(!content)return null;
  if(!editing)return byId.get(content.id);
  return <div className="pc-inline-editor">
   <label>Section title<input value={content.title} maxLength={180} onChange={e=>changeSection({...content,title:e.target.value})}/></label>
   {content.parts.map(part=><label key={part.id}>
    {part.kind==='code'?'Code':part.kind==='paragraph'?'Text':part.kind}
    {['paragraph','code','callout','reference'].includes(part.kind)&&!part.semantic?<textarea value={part.text} rows={part.kind==='code'?10:5} onChange={e=>changeSection({...content,parts:content.parts.map(p=>p.id===part.id?{...p,text:e.target.value}:p)})}/>
     :part.kind==='table'&&part.table?<div className="pc-table-editor"><input aria-label="Table columns, separated by tabs" value={part.table.headers.join('\t')} onChange={e=>{const table={...part.table!,headers:e.target.value.split('\t')};changeSection({...content,parts:content.parts.map(p=>p.id===part.id?{...p,table,text:tableCanonicalText(table)}:p)});}}/><textarea aria-label="Table rows, cells separated by tabs" value={part.table.rows.map(row=>row.join('\t')).join('\n')} onChange={e=>{const table={...part.table!,rows:e.target.value.split('\n').map(row=>row.split('\t'))};changeSection({...content,parts:content.parts.map(p=>p.id===part.id?{...p,table,text:tableCanonicalText(table)}:p)});}}/></div>
     :part.kind==='image'&&part.image?<div><RichReadingPart part={part} sectionId={content.id} article={current} captures={[]} ownerScope={scope}/><textarea aria-label="Image description" value={part.image.alt} onChange={e=>{const image={...part.image!,alt:e.target.value};changeSection({...content,parts:content.parts.map(p=>p.id===part.id?{...p,image,text:imageCanonicalText(image)}:p)});}}/><input aria-label="Image caption" value={part.image.caption??''} onChange={e=>{const image={...part.image!,caption:e.target.value};changeSection({...content,parts:content.parts.map(p=>p.id===part.id?{...p,image,text:imageCanonicalText(image)}:p)});}}/></div>
     :part.kind==='interactive'&&part.interactive?<InteractiveEditor part={part} scope={scope} onChange={next=>changeSection({...content,parts:content.parts.map(p=>p.id===part.id?next:p)})}/>
     :<><RichReadingPart part={part} sectionId={content.id} article={current} captures={[]} ownerScope={scope}/><small>Use its source editor or ask for a specific revision.</small></>}
   </label>)}
   <label className="pc-add-image">Add image<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={e=>void addImage(content,e.target.files?.[0])}/></label>
  </div>;
 }
 function arrange(nodes:ReactNode[]){
  const byId=new Map(nodes.map(node=>[(node as ReactElement).key,node]));
  const favouriteIds=new Set(composition.favourites??[]);
  const visibleSections=composition.sections.filter(s=>editing||!s.hidden);
  const favouriteBlocks=composition.blocks.filter(block=>favouriteIds.has(block.id)&&(editing||!block.hidden)&&visibleSections.some(section=>section.slots.some(slot=>slot.blockIds.includes(block.id))));
  return <div className="pc-composition">
   {(visibleSections.length>1||favouriteBlocks.length>0)&&<nav className="pc-outline" aria-label="Project contents"><span>Contents</span>{visibleSections.map(section=><a key={section.id} href={'#pc-section-'+section.id}>{section.title||section.pattern}{favouriteIds.has(section.id)&&<Star size={12} aria-label="Favourite" fill="currentColor"/>}</a>)}{favouriteBlocks.map(block=><a key={block.id} href={'#pc-block-'+block.id}><Star size={12} aria-hidden="true" fill="currentColor"/>{block.sectionId?current.sections?.find(s=>s.id===block.sectionId)?.title:refs[block.id]?.title??block.ref?.id}</a>)}</nav>}
   <div className="pc-sections">{visibleSections.map((section,sectionIndex)=>{
    const collapsed=folds[section.id]??!!section.collapsed;
    return <section className={'pc-section pc-'+section.pattern+(section.hidden?' pc-is-hidden':'')} key={section.id} id={'pc-section-'+section.id} aria-label={section.title||section.pattern}>
     <div className="pc-section-heading"><h2>{section.title||''}</h2>
      {(section.title||section.collapsed||editing)&&<button type="button" className="pc-icon-button" aria-label={(collapsed?'Expand ':'Collapse ')+(section.title||'section')} aria-expanded={!collapsed} onClick={()=>setFolds(previous=>({...previous,[section.id]:!collapsed}))}>{collapsed?<ChevronDown size={17}/>:<ChevronUp size={17}/>}</button>}
      {editing&&arranging&&<div className="pc-layout-controls" aria-label="Arrange section">
       <button type="button" aria-label="Move section up" disabled={sectionIndex===0} onClick={()=>moveSection(section.id,-1)}><ArrowUp size={16}/></button>
       <button type="button" aria-label="Move section down" disabled={sectionIndex===composition.sections.length-1} onClick={()=>moveSection(section.id,1)}><ArrowDown size={16}/></button>
       <button type="button" aria-pressed={!!section.hidden} onClick={()=>changeLayout(layout=>{const target=layout.sections.find(s=>s.id===section.id)!;target.hidden=!target.hidden;})}>{section.hidden?'Show':'Hide'}</button>
       <button type="button" aria-pressed={!!section.collapsed} onClick={()=>{setFolds(previous=>{const next={...previous};delete next[section.id];return next;});changeLayout(layout=>{const target=layout.sections.find(s=>s.id===section.id)!;target.collapsed=!target.collapsed;});}}>{section.collapsed?'Expand by default':'Collapse by default'}</button>
       <button type="button" aria-label="Favourite section" aria-pressed={favouriteIds.has(section.id)} onClick={()=>toggleFavourite(section.id)}><Star size={16} fill={favouriteIds.has(section.id)?'currentColor':'none'}/></button>
      </div>}
     </div>
     {!collapsed&&<div className="pc-slots">{section.slots.map(slot=><div className={'pc-slot pc-role-'+slot.role} key={slot.id}>
      {section.pattern==='board'&&<h3 className="pc-group-heading">{slot.id.replace(/[-_]/g,' ')}</h3>}
      {slot.blockIds.map((id,index)=>{const block=composition.blocks.find(b=>b.id===id);if(!block||(!editing&&block.hidden))return null;const content=current.sections?.find(s=>s.id===block.sectionId);
       return <div className={'pc-block pc-width-'+(block.width??'full')+(block.pinned?' pc-is-pinned':'')+(block.hidden?' pc-is-hidden':'')} id={'pc-block-'+id} key={id}>
        {editing&&arranging&&<div className="pc-layout-controls pc-block-controls" aria-label="Arrange block">
         <button type="button" aria-label="Move block up" disabled={index===0} onClick={()=>moveBlock(id,slot.id,section.id,-1)}><ArrowUp size={15}/></button>
         <button type="button" aria-label="Move block down" disabled={index===slot.blockIds.length-1} onClick={()=>moveBlock(id,slot.id,section.id,1)}><ArrowDown size={15}/></button>
         <button type="button" aria-pressed={!!block.hidden} onClick={()=>changeLayout(layout=>{const target=layout.blocks.find(b=>b.id===id)!;target.hidden=!target.hidden;})}>{block.hidden?'Show':'Hide'}</button>
         <button type="button" aria-pressed={!!block.pinned} onClick={()=>changeLayout(layout=>{const target=layout.blocks.find(b=>b.id===id)!;target.pinned=!target.pinned;})}>{block.pinned?'Unpin':'Pin'}</button>
         <label>Width<select aria-label="Block width" value={block.width??'full'} onChange={e=>changeLayout(layout=>{layout.blocks.find(b=>b.id===id)!.width=e.target.value as 'full'|'split'|'compact';})}><option value="full">Full</option><option value="split">Half</option><option value="compact">Compact</option></select></label>
         <button type="button" aria-label="Favourite block" aria-pressed={favouriteIds.has(id)} onClick={()=>toggleFavourite(id)}><Star size={15} fill={favouriteIds.has(id)?'currentColor':'none'}/></button>
        </div>}
        {renderBlockContent(block,content,byId)}
       </div>;
      })}
     </div>)}</div>}
    </section>;
   })}</div>
  </div>;
 }
 return <div className="pc-project"><header className="pc-heading">{editing?<div className="pc-title-editor"><label>Project title<input value={draft.title} maxLength={180} onChange={e=>update({...draft,title:e.target.value})}/></label><label>Short description<textarea value={draft.projectDescription??''} maxLength={600} rows={2} onChange={e=>update({...draft,projectDescription:e.target.value})}/></label><label>Introduction<textarea value={draft.body} maxLength={24000} rows={3} onChange={e=>update({...draft,body:e.target.value})}/></label></div>:<div><h1>{record.title}</h1>{record.projectDescription&&<p className="pc-description">{record.projectDescription}</p>}</div>}<div className="pc-actions">{editing?<><button className="v2-primary" disabled={busy} onClick={()=>void save()}><Check size={16}/>{busy?'Saving…':'Save'}</button><button className="v2-text-button" disabled={busy||!!pending.current} onClick={()=>{setEditing(false);setDraft(record);try{localStorage.removeItem(key);localStorage.removeItem(key+':operation');}catch{}}}><X size={16}/>Cancel</button></>:<button className="v2-text-button" onClick={begin}><Pencil size={15}/>Edit</button>}</div></header>{(editing||record.projectCover)&&<div className={editing?'':'pc-cover-view'}><ProjectCover record={record} scope={scope} onCommand={async command=>{const receipt=await props.onCommand(command);if(receipt.record){setRecord(receipt.record);setDraft(old=>({...old,rev:receipt.record!.rev,projectCover:receipt.record!.projectCover}));}return receipt;}}/></div>}{message&&<p role={message==='Saved.'?'status':'alert'}>{message}</p>}
 {editing&&<div className="pc-edit-toolbar"><button type="button" className="v2-secondary" aria-pressed={arranging} onClick={()=>setArranging(value=>!value)}>{arranging?'Done arranging':'Arrange sections and blocks'}</button><span>Changes are saved with the Project.</span></div>}
 <Reader {...props} article={current} compactHeader arrangeSections={arrange}/>{editing&&<details className="pc-add"><summary><Plus size={16}/>Add section</summary><div>{patterns.map(pattern=><button className="v2-secondary" type="button" key={pattern} onClick={()=>add(pattern)}>{pattern[0].toUpperCase()+pattern.slice(1)}</button>)}</div></details>}
 </div>;
}
