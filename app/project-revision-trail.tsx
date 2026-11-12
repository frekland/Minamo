'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight,ChevronDown} from 'lucide-react';
import type {WorkspaceRecord} from '../lib/contracts';
import {generationFetch} from '../lib/workspace-generation';
import {routeDestination} from '../lib/navigation-origin';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import {useLearningSpace} from './learning-space-ui';
import type {NavigateReading} from './reader';
import './project-revision-trail.css';

type Change={sectionId:string;sectionTitle:string;partId:string;kind:string;change:'added'|'revised'|'removed';textPreview?:string;materialLabel?:string;fieldChanges?:{field:string;before:string;after:string}[];sourceFilesBefore?:{path:string}[];sourceFilesAfter?:{path:string}[]};
type SectionChange={sectionId:string;sectionTitle:string;added:number;revised:number;removed:number};
type Revision={revision:number;rendition?:string;at:string;synthetic:boolean;titleChanged:boolean;descriptionChanged:boolean;arrangementChanged:boolean;sectionChanges:SectionChange[];changes:Change[];changesTruncated:boolean;sourceMappingChanges?:{path:string;change:'linked'|'unlinked'}[]};
type Page={revisions:Revision[];nextBeforeRevision:number|null};
export const hasVisibleProjectDifference=(revision:Revision)=>revision.titleChanged||revision.descriptionChanged||revision.arrangementChanged||revision.changes.length>0||revision.sectionChanges.length>0||!!revision.sourceMappingChanges?.length;
export function exactProjectEditionHref(projectId:string,revision:Pick<Revision,'revision'|'rendition'>){return revision.rendition?'/?'+new URLSearchParams({view:'journeys',family:'journey',id:projectId,rendition:revision.rendition,revision:String(revision.revision)}):undefined;}

function changeLabel(change:SectionChange){
 return [change.added&&`${change.added} added`,change.revised&&`${change.revised} revised`,change.removed&&`${change.removed} removed`].filter(Boolean).join(' · ');
}

/** Read-only orientation to exact saved editions, independent of authored Work questions. */
export default function ProjectRevisionTrail({record,scope,onOpen,onNavigate}:{record:WorkspaceRecord;scope:string;onOpen:(sectionId:string,partId:string)=>void;onNavigate?:NavigateReading}){
 const [open,setOpen]=useState(false),[revisions,setRevisions]=useState<Revision[]>([]),[before,setBefore]=useState<number|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [showAll,setShowAll]=useState(false),selection=useLearningSpace();
 useEffect(()=>{
  let live=true;
  queueMicrotask(()=>{if(live){setRevisions([]);setBefore(null);setError('');}});
  if(!open)return()=>{live=false;};
  setBusy(true);
  generationFetch(scope,'/api/projects/changes?'+new URLSearchParams({projectId:record.id,beforeRevision:String(record.rev),limit:'8'}))
   .then(async response=>{const result=await response.json() as Page&{error?:string};if(!response.ok)throw Error(result.error??'Could not read the saved editions.');return result;})
   .then(page=>{if(live){setRevisions(page.revisions);setBefore(page.nextBeforeRevision);}})
   .catch(cause=>{if(live)setError((cause as Error).message);})
   .finally(()=>{if(live)setBusy(false);});
  return()=>{live=false;};
 },[open,record.id,record.rev,scope]);
 async function more(){
  if(before===null||busy)return;
  setBusy(true);setError('');
  try{
   const response=await generationFetch(scope,'/api/projects/changes?'+new URLSearchParams({projectId:record.id,beforeRevision:String(before),limit:'8'}));
   const page=await response.json() as Page&{error?:string};if(!response.ok)throw Error(page.error??'Could not read earlier editions.');
   setRevisions(rows=>[...rows,...page.revisions]);setBefore(page.nextBeforeRevision);
  }catch(cause){setError((cause as Error).message);}finally{setBusy(false);}
 }
 const currentParts=new Set((record.sections??[]).flatMap(section=>section.parts.map(part=>JSON.stringify([section.id,part.id]))));
 const shown=showAll?revisions:revisions.filter(hasVisibleProjectDifference),omitted=revisions.length-shown.length;
 return <details className="pc-revision-trail" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
  <summary><span>Saved editions</span><small>· revision {record.rev}</small><ChevronDown size={15} aria-hidden="true"/></summary>
  {open&&<div className="pc-revision-trail-body">
   <p className="pc-revision-caption">See what changed in saved material and open an exact earlier edition. Reasons for a change are only available where they were actually written down.</p>
   {error&&<p role="alert">{error}</p>}
   {revisions.length>0&&<div className="pc-revision-controls"><span>{shown.length} shown from {revisions.length} inspected{before!==null?' · earlier saves available':''}</span>{omitted>0||showAll?<button type="button" className="v2-text-button" aria-pressed={showAll} onClick={()=>setShowAll(value=>!value)}>{showAll?'Show content changes':'Show all saves'}</button>:null}</div>}
   {revisions.length>0&&!shown.length&&!busy&&<p className="pc-revision-caption">No content or arrangement difference appears in this page. Other kinds of save may have occurred; inspect all saves or load earlier editions.</p>}
   {shown.length>0&&<ol>{shown.map(row=>{
    const sections=row.sectionChanges??[],other=[row.titleChanged&&'Title',row.descriptionChanged&&'Description',row.arrangementChanged&&'Arrangement',...(row.sourceMappingChanges?.length?['Source-file links']:[])].filter(Boolean);
    const edition=exactProjectEditionHref(record.id,row),target=edition?routeDestination(edition):undefined;
    return <li key={row.revision}><details className="pc-revision-entry"><summary><span className="pc-revision-number">r{row.revision}</span><time dateTime={row.at}>{new Date(row.at).toLocaleDateString('en-GB')}</time><span className="pc-revision-label">{[...sections.slice(0,3).map(section=>section.sectionTitle),...other].join(' · ')||'Other saved changes'}{sections.length>3?` · +${sections.length-3} more`:''}</span><ChevronDown size={14} aria-hidden="true"/></summary><div>
     {edition&&<a className="pc-revision-edition-link" href={learningSpaceHref(edition,selection)} onClick={event=>{if(onNavigate&&target&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onNavigate(target.view,target.id,target.target);}}}>Open saved edition r{row.revision} <ArrowUpRight size={13}/></a>}
     {!hasVisibleProjectDifference(row)&&<p className="pc-revision-caption">No content, arrangement or source-file difference is exposed by this comparison. This does not establish that nothing else changed.</p>}
     {sections.map(section=><section key={section.sectionId}><h4>{section.sectionTitle} <small>{changeLabel(section)}</small></h4><ul>{row.changes.filter(change=>change.sectionId===section.sectionId).map(change=>{
      const exactStillPresent=currentParts.has(JSON.stringify([change.sectionId,change.partId]));
      const paths=[...(change.sourceFilesAfter?.length?change.sourceFilesAfter:change.sourceFilesBefore)??[]].map(file=>file.path);
      return <li key={change.partId}><span className="pc-revision-change-kind">{change.change} {change.kind}</span>{change.materialLabel&&<span className="pc-revision-material"> · {change.materialLabel}</span>}{paths.length>0&&<span> · {paths.join(', ')}</span>}{change.fieldChanges?.length? <ul className="pc-revision-exact-fields">{change.fieldChanges.map(field=><li key={field.field}><span className="pc-revision-field-name">{field.field}</span><span><small>Before</small> {field.before||'—'}</span><span><small>Now</small> {field.after||'—'}</span></li>)}</ul>:change.textPreview&&<p className="pc-revision-excerpt">{change.textPreview}</p>}{exactStillPresent&&<button type="button" onClick={()=>{onOpen(change.sectionId,change.partId);setOpen(false);}}>Open current part <ArrowUpRight size={13}/></button>}{!exactStillPresent&&<span className="pc-revision-absent">Not in current edition</span>}</li>;
     })}</ul>{row.changesTruncated&&<small>Additional changes exist in this edition; read the full saved revision for exact material.</small>}</section>)}
     {other.length>0&&<p className="pc-revision-other">Also changed: {other.join(', ')}</p>}
     <small>Exact revision {row.revision}. Changes shown here do not explain why they were made.</small>
    </div></details></li>;
   })}</ol>}
   {busy&&<p role="status">Reading saved editions…</p>}
   {before!==null&&!busy&&<button type="button" className="pc-revision-more" onClick={()=>void more()}>Earlier editions</button>}
  </div>}
 </details>;
}
