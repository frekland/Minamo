"use client";
import type {MouseEvent} from 'react';
import {ArrowRight,BookOpen,Bookmark,FolderOpen,NotebookPen,RefreshCw,MessageCircleQuestion} from 'lucide-react';
import {learningSpaceHref,learningSpaceLabel,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {sortHomeRecords,type HomeVisit} from '../lib/home-visits';
import {workspaceGenerationFromScope} from '../lib/workspace-generation';
import {recordDisplayTitle,savedConnectionPreview} from '../lib/record-display';
import type {WorkspaceRecord} from '../lib/contracts';
import type {Favourite,HomeData,HomeNote,FavouriteOperation} from './learning-home';
import './home-landing.css';

export type HomeBrowseRead={key:string;projects:WorkspaceRecord[];articles:WorkspaceRecord[];questions:WorkspaceRecord[];loading:boolean;error?:string};
type Props={selection:LearningSpaceSelection;scope:string;data?:HomeData;favouritesLoading:boolean;favouritesError?:string;notes:HomeNote[];notesLoading:boolean;notesError?:string;browse:HomeBrowseRead;visits:HomeVisit[];serverReads:boolean;operations:FavouriteOperation[];confirmation?:string|null;storageError?:string;onOpen:(event:MouseEvent<HTMLAnchorElement>,path:string)=>void;onRefresh:()=>void;onMoreFavourites:()=>void;onUnfavourite:(item:Favourite)=>void;onConfirmUnfavourite:(item:Favourite)=>void;onCancelUnfavourite:()=>void;onRetry:(id:string)=>void;onCheck:(id:string)=>void;onRefreshFavourite:(id:string)=>void};
const destination=(item:WorkspaceRecord)=>'/?'+new URLSearchParams({view:item.family==='article'?'library':item.family==='investigation'?'investigations':'journeys',family:item.family,id:item.id});
const trim=(value:string,max=175)=>value.length>max?value.slice(0,max).trimEnd()+'…':value;

function ProjectCover({record,scope}:{record:WorkspaceRecord;scope:string}){
 const cover=record.projectCover;
 return cover?<img src={'/api/assets/'+encodeURIComponent(cover.assetId)+'?generation='+encodeURIComponent(workspaceGenerationFromScope(scope))} style={{objectPosition:`${cover.focal?.x??50}% ${cover.focal?.y??50}%`}} loading="lazy" decoding="async" alt="" onError={event=>{event.currentTarget.hidden=true;event.currentTarget.parentElement?.classList.add('no-image')}}/>:<FolderOpen size={26} aria-hidden="true"/>;
}

export default function HomeLanding({selection,scope,data,favouritesLoading,favouritesError,notes,notesLoading,notesError,browse,visits,serverReads,operations,confirmation,storageError,onOpen,onRefresh,onMoreFavourites,onUnfavourite,onConfirmUnfavourite,onCancelUnfavourite,onRetry,onCheck,onRefreshFavourite}:Props){
 const projects=sortHomeRecords(browse.projects.filter(item=>item.family==='journey'&&!item.trashedAt),visits),articles=sortHomeRecords(browse.articles.filter(item=>item.family==='article'&&!item.trashedAt),visits);
 const questions=[...browse.questions].filter(item=>item.family==='investigation'&&!item.trashedAt).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,3);
 const recentlyOpenedProjects=projects.filter(item=>visits.some(v=>v.family==='journey'&&v.id===item.id));
 const recentlyOpenedArticles=articles.filter(item=>visits.some(v=>v.family==='article'&&v.id===item.id));
 // Visits order the shelves, but a single recent visit should not leave the rest of the row blank.
 const featured=projects.slice(0,3);
 const reading=articles.slice(0,3);
 const favourites=data?.favourites??[];
 const favouriteTitle=(item:Favourite)=>{const record=[...browse.projects,...browse.articles,...browse.questions].find(record=>record.id===item.target.id&&record.family===item.target.family);return recordDisplayTitle(item.title,record?.synthetic||item.target.id.startsWith('TEST-ONLY-'));};
 const browseLink=(view:'journeys'|'investigations'|'library'|'work',label:string)=><a className="home-landing-more" href={learningSpaceHref('/?view='+view,selection)} onClick={event=>onOpen(event,'/?view='+view)}>{label}<ArrowRight size={16}/></a>;
 const allSubjectsLink=(view:'journeys'|'investigations')=>selection.learningSpace==='all'?null:<a className="home-landing-all-subjects" href={learningSpaceHref('/?view='+view,{learningSpace:'all'})}>See all subjects <ArrowRight size={14}/></a>;
 return <div className="home-landing">
  <header className="home-landing-hero">
   <h1 className="home-landing-screen-reader">Home</h1>
   <div className="home-landing-hero-mark"><img src="/identity/minamo-desktop-logo.png" alt="Minamo" width={1472} height={1088}/></div>
   <div className="home-landing-hero-pattern" aria-hidden="true"><i/><i/><i/></div>
  </header>

  <section className="home-landing-projects" aria-labelledby="home-projects-heading">
   <div className="home-landing-section-heading"><div><span className="home-landing-eyebrow">PROJECTS · {learningSpaceLabel(selection)}</span><h2 id="home-projects-heading">{recentlyOpenedProjects.length?'Pick up where you left off':'Your Projects'}</h2></div>{browseLink('journeys','Browse all Projects')}</div>
   {browse.loading&&!projects.length?<div className="home-landing-project-grid" aria-label="Loading Projects" aria-busy="true"><div className="home-landing-skeleton"/><div className="home-landing-skeleton"/></div>:featured.length?<div className="home-landing-project-grid">{featured.map((item,index)=><a key={item.id} className="home-landing-project-card" style={{animationDelay:index*45+'ms'}} href={learningSpaceHref(destination(item),selection)} onClick={event=>onOpen(event,destination(item))}><div className="home-landing-project-cover"><ProjectCover record={item} scope={scope}/></div><div className="home-landing-project-copy"><span className="home-landing-type">{recentlyOpenedProjects.some(v=>v.id===item.id)?'RECENTLY OPENED':'PROJECT'}</span><h3>{recordDisplayTitle(item.title,item.synthetic)}</h3>{(item.projectDescription||item.body)&&<p>{trim(item.projectDescription||item.body||'')}</p>}<span className="home-landing-card-arrow"><ArrowRight size={18}/></span></div></a>)}</div>:<div className="home-landing-empty"><FolderOpen size={21}/><p>No Projects in {learningSpaceLabel(selection)} among the records checked.</p>{browseLink('journeys','Browse Projects')}{allSubjectsLink('journeys')}</div>}
   {browse.error&&<p role="status" className="home-landing-secondary-status">Projects could not be refreshed. {browse.error} <button className="v2-text-button" onClick={onRefresh}>Retry</button></p>}
  </section>

  <div className="home-landing-columns">
   <section className="home-landing-shelf" aria-labelledby="home-library-heading"><div className="home-landing-section-heading"><div><span className="home-landing-eyebrow">READING</span><h2 id="home-library-heading">Library</h2></div>{browseLink('library','Open Library')}</div>
    {reading.length?<div className="home-landing-list">{reading.map(item=><a className="home-landing-list-row" key={item.id} href={learningSpaceHref(destination(item),selection)} onClick={event=>onOpen(event,destination(item))}><span className="home-landing-row-icon"><BookOpen size={18}/></span><span className="home-landing-row-content"><strong>{recordDisplayTitle(item.title,item.synthetic)}</strong><small>{recentlyOpenedArticles.some(v=>v.id===item.id)?'Recently opened':'Article'}</small></span><ArrowRight size={16}/></a>)}</div>:browse.loading?<div className="home-landing-row-placeholder" aria-label="Loading Library" aria-busy="true"/>:<div className="home-landing-shelf-empty">Browse articles and reference material in the Library.</div>}
   </section>
   <section className="home-landing-shelf" aria-labelledby="home-notes-heading"><div className="home-landing-section-heading"><div><span className="home-landing-eyebrow">WRITING</span><h2 id="home-notes-heading">Recent Notes</h2></div>{browseLink('work','Your Work')}</div>
    {notes.length?<div className="home-landing-list">{notes.slice(0,3).map(item=><a className="home-landing-list-row" key={item.id} href={learningSpaceHref(item.destination,selection)} onClick={event=>onOpen(event,item.destination)}><span className="home-landing-row-icon"><NotebookPen size={18}/></span><span className="home-landing-row-content"><strong>{recordDisplayTitle(item.title,item.synthetic)}</strong>{item.text&&<small>{recordDisplayTitle(savedConnectionPreview(item.text,95),item.synthetic)}</small>}</span><ArrowRight size={16}/></a>)}</div>:notesLoading?<div className="home-landing-row-placeholder" aria-label="Loading Notes" aria-busy="true"/>:<div className="home-landing-shelf-empty">Your Notes and marked passages are collected in Your Work.</div>}
    {notesError&&<p role="status" className="home-landing-secondary-status">Recent Notes could not be checked. <button className="v2-text-button" onClick={onRefresh}>Retry</button></p>}
   </section>
   <section className="home-landing-shelf" aria-labelledby="home-questions-heading"><div className="home-landing-section-heading"><div><span className="home-landing-eyebrow">CURIOSITY</span><h2 id="home-questions-heading">Independent questions</h2></div>{browseLink('investigations','Explore questions')}</div>
    {questions.length?<div className="home-landing-list">{questions.map(item=><a className="home-landing-list-row" key={item.id} href={learningSpaceHref(destination(item),selection)} onClick={event=>onOpen(event,destination(item))}><span className="home-landing-row-icon"><MessageCircleQuestion size={18}/></span><span className="home-landing-row-content"><strong>{recordDisplayTitle(item.title,item.synthetic)}</strong><small>Question · No Project required</small></span><ArrowRight size={16}/></a>)}</div>:browse.loading?<div className="home-landing-row-placeholder" aria-label="Loading questions" aria-busy="true"/>:<div className="home-landing-shelf-empty">No questions found in this view. They can be explored independently of Projects. {allSubjectsLink('investigations')}</div>}
   </section>
  </div>

  {(favourites.length>0||operations.length>0)&&<section className="home-landing-favourites" aria-labelledby="home-favourites-heading"><div className="home-landing-section-heading"><div><span className="home-landing-eyebrow">KEPT CLOSE</span><h2 id="home-favourites-heading">Favourites</h2></div></div><div className="home-landing-favourite-grid">{favourites.map(item=>{const id=item.target.family+':'+item.target.id,operation=operations.find(operation=>operation.id===id);return <div className="home-landing-favourite" key={id}><a href={learningSpaceHref(item.destination,selection)} onClick={event=>onOpen(event,item.destination)}><Bookmark size={16}/><span>{favouriteTitle(item)}</span><ArrowRight size={15}/></a>{!operation&&<button className="home-landing-remove" onClick={()=>onUnfavourite(item)} aria-label={'Remove '+favouriteTitle(item)+' from Favourites'}>Remove</button>}{confirmation===id&&!operation&&<div className="home-landing-favourite-feedback" role="group" aria-label={'Confirm removing '+favouriteTitle(item)+' from Favourites'}><span>Remove favourite?</span><button onClick={()=>onConfirmUnfavourite(item)}>Yes</button><button onClick={onCancelUnfavourite}>No</button></div>}{operation&&<div className="home-landing-favourite-feedback" role="status"><span>{operation.state==='saving'?'Saving…':operation.message||'Change needs checking.'}</span>{operation.state==='uncertain'&&<><button onClick={()=>onCheck(id)}>Check</button><button onClick={()=>onRetry(id)}>Retry</button></>}{['conflict','rejected'].includes(operation.state)&&<button onClick={()=>onRefreshFavourite(id)}>Refresh</button>}</div>}</div>})}{operations.filter(operation=>!favourites.some(item=>item.target.family+':'+item.target.id===operation.id)).map(operation=><div className="home-landing-favourite home-landing-favourite-feedback" key={operation.id} role="status"><span>{operation.message||'Favourite change needs checking.'}</span>{operation.state==='uncertain'&&<><button onClick={()=>onCheck(operation.id)}>Check</button><button onClick={()=>onRetry(operation.id)}>Retry</button></>}{['conflict','rejected'].includes(operation.state)&&<button onClick={()=>onRefreshFavourite(operation.id)}>Refresh</button>}</div>)}</div>{data?.page?.favouritesCursor&&<button className="home-landing-more" disabled={favouritesLoading} onClick={onMoreFavourites}>More favourites <ArrowRight size={15}/></button>}{storageError&&<p role="alert" className="home-landing-secondary-status">{storageError}</p>}</section>}
  {favouritesError&&<p role="status" className="home-landing-secondary-status">Favourites could not be checked. <button className="v2-text-button" onClick={onRefresh}>Retry</button></p>}
  {!serverReads&&<p className="home-landing-secondary-status">Sign in to see your Projects, reading and Notes.</p>}
  <footer className="home-landing-footer"><button type="button" onClick={onRefresh} aria-label="Refresh Home"><RefreshCw size={15}/>Refresh Home</button></footer>
 </div>;
}
