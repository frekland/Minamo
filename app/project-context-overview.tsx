'use client';
import {useState} from 'react';
import type {ProjectLearningMap} from '../lib/project-learning-map';
import './project-context-overview.css';

/** Optional content-first lens. No storage writes or inferred learner status. */
export default function ProjectContextOverview({map,onOpen}:{map:ProjectLearningMap;onOpen:(topicId:string)=>void}){
 const [lens,setLens]=useState<'subjects'|'purposes'>('subjects');
 const topicById=new Map(map.topics.map(t=>[t.id,t]));
 const contexts=map.contexts.filter(context=>context.topicIds.length);
 return <section className="pc-context-overview" aria-label="Explore Project material">
  <div className="pc-overview-heading">
   <div><h2>Explore this Project</h2><p>Open the original material or find its explanations and practice without making copies.</p></div>
   <div className="pc-overview-lenses" role="group" aria-label="Browse by">
    <button type="button" aria-pressed={lens==='subjects'} onClick={()=>setLens('subjects')}>Subjects</button>
    <button type="button" aria-pressed={lens==='purposes'} onClick={()=>setLens('purposes')}>By purpose</button>
   </div>
  </div>
  {lens==='subjects'?
    <div className="pc-overview-grid">{contexts.map(context=>{
     const first=context.topicIds.find(id=>topicById.get(id)?.purpose==='source')??context.topicIds[0];
     return <article className="pc-overview-card" key={context.id}>
      <div className="pc-overview-card-title"><h3>{context.title}</h3><span>{context.topicIds.length} {context.topicIds.length===1?'page':'pages'}</span></div>
      <div className="pc-overview-card-actions">
       <button type="button" onClick={()=>onOpen(first)}>Open</button>
       {context.continuation&&<button type="button" className="pc-overview-continue" onClick={()=>onOpen(context.continuation!.topicId)}>{context.continuation.label||'Continue from saved point'}</button>}
      </div>
      {context.topicIds.length>1&&<details><summary>See related pages</summary><ul>{context.topicIds.map(id=>{const topic=topicById.get(id);return topic?<li key={id}><button type="button" onClick={()=>onOpen(id)}>{topic.title}</button>{topic.purpose&&<span>{topic.purpose}</span>}</li>:null;})}</ul></details>}
     </article>;
    })}</div>:
    <div className="pc-overview-indexes">{map.indexes.map(index=><section key={index.id} className="pc-overview-index"><h3>{index.title}</h3><ul>{index.topicIds.map(id=>{const topic=topicById.get(id);return topic?<li key={id}><button type="button" onClick={()=>onOpen(id)}>{topic.title}</button></li>:null;})}</ul></section>)}</div>}
 </section>;
}
