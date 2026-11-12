"use client";
import {useEffect,useRef,useState} from 'react';
import {readingScrollBehavior} from '../lib/presentation-preferences';
import type {WorkspaceRecord} from '../lib/contracts';
/** One section state drives the desktop rail and compact-screen select. */
export default function ReadingNavigation({record}:{record:WorkspaceRecord}){
 const sections=record.sections??[],[current,setCurrent]=useState(sections[0]?.id??''),host=useRef<HTMLElement>(null);
 useEffect(()=>{setCurrent(sections[0]?.id??'');if(sections.length<2)return;const root=host.current?.closest('.v2-main')??null;
  const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(visible){const section=sections.find(item=>'section-'+encodeURIComponent(item.id)===visible.target.id);if(section)setCurrent(section.id);}},{root,rootMargin:'-70px 0px -65% 0px',threshold:0});
  for(const section of sections){const node=document.getElementById('section-'+encodeURIComponent(section.id));if(node)observer.observe(node);}return()=>observer.disconnect();
 },[record.id,record.rendition]);
 if(sections.length<2)return null;
 const go=(id:string)=>{setCurrent(id);const section=document.getElementById('section-'+encodeURIComponent(id));const disclosure=section?.closest('details');if(disclosure)disclosure.open=true;section?.scrollIntoView({block:'start',behavior:readingScrollBehavior()});};
 return <nav ref={host} className="le-reading-nav" aria-label="Move through this material"><label>Sections<select aria-label="Go to section" value={current} onChange={event=>go(event.target.value)}>{sections.map((section,index)=><option key={section.id} value={section.id}>{section.title}</option>)}</select></label><div className="le-section-links"><span>On this page</span>{sections.map(section=><a key={section.id} href={'#section-'+encodeURIComponent(section.id)} aria-current={current===section.id?'location':undefined} onClick={event=>{if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();go(section.id);}}>{section.title}</a>)}</div><button className="v2-text-button" onClick={()=>host.current?.closest('.v2-main')?.scrollTo({top:0,behavior:readingScrollBehavior()})}>Top</button></nav>;
}
