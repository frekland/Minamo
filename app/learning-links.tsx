"use client";
import ProjectConnections from './project-connections';
import {ServerLibraryIndex,LibraryCatalogueView,localLibraryItems,libraryItemDestination,useLibraryEntry,type LibraryBrowseState,type LibraryPreviewDestination} from './library-browser';
import {useLearningSpace} from './learning-space-ui';
import {matchesLearningScope} from '../lib/learning-spaces';
import {learningConnectionVisible} from '../lib/scoped-learning-links';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import {useContextualHref} from './navigation-context';
import {routeDestination} from '../lib/navigation-origin';
import {recordOriginLabel} from '../lib/record-origin';
import {learnerFamilyLabel} from '../lib/learner-labels';
import './learning-links.css';
import {ConceptBrowser} from './concepts';
import {ArrowRight,BookOpen,ChevronRight,Compass,ExternalLink,FileText,Link2,NotebookPen} from 'lucide-react';
import type {Family,RecordLink,WorkspaceRecord} from '../lib/contracts';
import type {ReadingTarget} from './reader';
type Navigate=(view:string,id?:string,target?:ReadingTarget)=>void;
type ConnectionEntry={link:RecordLink;via?:string;incoming?:boolean;stageId?:string;contextLabel?:string};
const ordinaryClick=(event:import('react').MouseEvent<HTMLAnchorElement>)=>event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey;
export function groupConnectionEntries(entries:ConnectionEntry[]){const groups=new Map<string,ConnectionEntry[]>();for(const entry of entries){const id=entry.link.family+':'+entry.link.id;groups.set(id,[...(groups.get(id)??[]),entry]);}return Array.from(groups,([id,entries])=>({id,entries}));}
const viewFor=(family:Family)=>family==='journey'?'journeys':family==='investigation'?'investigations':family==='article'||family==='area'?'library':family==='source'?'sources':family==='experiment'?'tools':'work';
const relationLabels:Record<string,string>={related:'Related',explains:'Explanation',applies:'Application',contrasts:'Comparison',supports:'Supporting reference',extends:'Related Articles',source:'Source',next:'Next'};
const key=(record:{family:Family;id:string})=>`${record.family}:${record.id}`;
export const connectionIdentity=(link:RecordLink)=>link.relationId??JSON.stringify([link.family,link.id,link.relation,link.sourceContext,link.rendition,link.sectionId,link.partId,link.reason]);
/** Describe saved anchors without borrowing section names from a newer edition.
 * Different passages in the same retained rendition must not look identical. */
export function connectionAnchorLabel(link:RecordLink,record?:Pick<WorkspaceRecord,'rendition'|'sections'>){
 const sectionId=link.sectionId&&!link.sectionId.startsWith('__')?link.sectionId:undefined;
 const partId=link.partId&&!link.partId.startsWith('__')?link.partId:undefined;
 const exact=!!link.rendition&&record?.rendition===link.rendition;
 const section=exact&&sectionId?record?.sections?.find(item=>item.id===sectionId):undefined;
 return [link.rendition&&!exact?(record?'Earlier edition':'Saved edition'):undefined,sectionId?'Section: '+(section?.title||sectionId):undefined,partId?'Part: '+partId:undefined].filter(Boolean).join(' · ');
}
function href(link:RecordLink){const params=new URLSearchParams({view:viewFor(link.family),family:link.family,id:link.id});if(link.sectionId)params.set('section',link.sectionId);if(link.partId)params.set('part',link.partId);if(link.rendition)params.set('rendition',link.rendition);return '/?'+params.toString()}
function destination(link:RecordLink,records:WorkspaceRecord[]){return records.find(record=>record.family===link.family&&record.id===link.id&&!record.trashedAt)}
function Connection({link,records,onNavigate,via,incoming=false,stageId,contextLabel,compact=false}:{link:RecordLink;records:WorkspaceRecord[];onNavigate:Navigate;via?:string;incoming?:boolean;stageId?:string;contextLabel?:string;compact?:boolean}){
 const contextualHref=useContextualHref(),selection=useLearningSpace(),record=destination(link,records);
 const path=learningSpaceHref(contextualHref(href(link)+(stageId?'&stage='+encodeURIComponent(stageId):'')),selection);
 const relation=incoming?'Linked from':relationLabels[link.relation??'related']??'Related';
 const anchor=connectionAnchorLabel(link,record),source=[record&&recordOriginLabel(record)||learnerFamilyLabel(link.family),anchor].filter(Boolean).join(' · ');
 return <a href={path} className="v2-connection" aria-label={`${record?.title??learnerFamilyLabel(link.family)}${anchor?' — '+anchor:''}${link.reason?' — '+link.reason:''}`} onClick={event=>{if(!ordinaryClick(event))return;const parsed=routeDestination(path);if(!parsed)return;event.preventDefault();onNavigate(parsed.view,parsed.id,parsed.target)}}><span className="v2-connection-kind">{record?.family==='source'?<Link2 size={16}/>:record?.family==='journey'?<Compass size={16}/>:<BookOpen size={16}/>}<span>{relation}</span></span>{!compact&&<strong>{record?.title??`Open linked ${learnerFamilyLabel(link.family,{lowercase:true})}`}</strong>}{link.reason?<p>{link.reason}</p>:!compact&&record?.body?<p>{record.body.length>145?record.body.slice(0,145)+'…':record.body}</p>:null}{via&&<small className="v2-via">In {via}</small>}{contextLabel&&<small className="v2-via">{contextLabel}</small>}<span className="v2-connection-foot"><small>{source}</small><ArrowRight size={14}/></span></a>
}
function ConnectionGroup({entries,records,onNavigate}:{entries:ConnectionEntry[];records:WorkspaceRecord[];onNavigate:Navigate}){
 if(entries.length===1)return <Connection {...entries[0]} records={records} onNavigate={onNavigate}/>;
 const record=destination(entries[0].link,records);return <section className="v2-connection-group"><h3>{record?.title??`Linked ${learnerFamilyLabel(entries[0].link.family,{lowercase:true})}`}</h3><small>{entries.length} saved references</small>{entries.map(entry=><Connection key={connectionIdentity(entry.link)} {...entry} compact records={records} onNavigate={onNavigate}/>)}</section>;
}
export default function LearningConnections({record,records,onNavigate,includeIncoming=true,scope,serverReads=false,exact=false}:{record:WorkspaceRecord;records:WorkspaceRecord[];onNavigate:Navigate;includeIncoming?:boolean;scope?:string;serverReads?:boolean;exact?:boolean}){
 const selection=useLearningSpace(),scopedRecords=records.filter(item=>!item.trashedAt&&matchesLearningScope(item,selection));
 const entries=new Map<string,ConnectionEntry>();
 for(const link of record.links.filter(link=>learningConnectionVisible(link,records,selection))){const stage=record.learningShape?.kind==='journey'?record.learningShape.stages.find(stage=>stage.id===link.sourceContext?.stageId):undefined;const sourceSection=record.sections?.find(section=>section.id===link.sourceContext?.sectionId);entries.set(connectionIdentity(link),{link,contextLabel:[link.sourceContext?.stageId&&('From stage '+(stage?.title??link.sourceContext.stageId)),link.sourceContext?.sectionId&&('From section '+(sourceSection?.title??link.sourceContext.sectionId))].filter(Boolean).join(' · ')});}
 if(includeIncoming)for(const source of scopedRecords){if(source.trashedAt||source.family===record.family&&source.id===record.id)continue;for(const incoming of source.links.filter(link=>link.family===record.family&&link.id===record.id)){const identity='incoming:'+key(source)+':'+connectionIdentity(incoming);entries.set(identity,{link:{family:source.family,id:source.id,relationId:identity,...(incoming.reason?{reason:incoming.reason}:{}),relation:incoming.relation??'related',...(incoming.sourceContext?.sectionId?{sectionId:incoming.sourceContext.sectionId,rendition:source.rendition}:{})},incoming:true,contextLabel:[incoming.relation&&('Relation: '+incoming.relation),incoming.rendition&&('Target edition '+incoming.rendition.slice(0,12)),incoming.sectionId&&('Target section '+incoming.sectionId),incoming.partId&&('Target part '+incoming.partId)].filter(Boolean).join(' · '),stageId:incoming.sourceContext?.stageId,via:incoming.sourceContext?.sectionId?source.sections?.find(section=>section.id===incoming.sourceContext?.sectionId)?.title:undefined});}}
 if(record.family==='journey')for(const question of scopedRecords.filter(item=>item.family==='investigation'&&entries.has(key(item))))for(const link of question.links.filter(item=>item.family==='article'&&learningConnectionVisible(item,records,selection)))if(!entries.has(key(link)))entries.set(key(link),{link,via:question.title});
 if(serverReads&&scope)return <ProjectConnections key={record.family+':'+record.id+':'+record.rev} record={record} records={records} scope={scope} exact={exact} onNavigate={onNavigate}/>;
 const reading=Array.from(entries.values()).filter(({link})=>['journey','investigation','article','area','source'].includes(link.family));
 const work=Array.from(entries.values()).filter(({link})=>!['journey','investigation','article','area','source'].includes(link.family));
 if(!reading.length&&!work.length)return null;
 return <section className="v2-learning-connections" aria-label="Related content"><div className="v2-section-heading"><h2>Related content</h2></div><div className="v2-connection-grid">{groupConnectionEntries(reading).map(group=><ConnectionGroup key={group.id} entries={group.entries} records={records} onNavigate={onNavigate}/>)}</div>{work.length>0&&<details className="v2-supporting-work"><summary><NotebookPen size={14}/>Your work <span>{work.length}</span></summary><div className="v2-connection-grid">{groupConnectionEntries(work).map(group=><ConnectionGroup key={group.id} entries={group.entries} records={records} onNavigate={onNavigate}/>)}</div></details>}</section>
}
export function LibraryIndex({records,onNavigate,onSearch,draftScope,serverReads,initialAreaId,initialAreaTitle,areaRecord,onPreview}:{records:WorkspaceRecord[];onNavigate:Navigate;onSearch?:(query:string)=>void;draftScope?:string;serverReads?:boolean;initialAreaId?:string;initialAreaTitle?:string;areaRecord?:WorkspaceRecord;onPreview?:(target:LibraryPreviewDestination)=>void}){
 if(serverReads&&draftScope)return <ServerLibraryIndex draftScope={draftScope} onNavigate={onNavigate} initialAreaId={initialAreaId} initialAreaTitle={initialAreaTitle} areaRecord={areaRecord} records={records} onPreview={onPreview}/>;
 return <LocalLibraryIndex records={records} onNavigate={onNavigate} initialAreaId={initialAreaId} initialAreaTitle={initialAreaTitle} draftScope={draftScope} areaRecord={areaRecord} onPreview={onPreview}/>;
}
function LocalLibraryIndex({records,onNavigate,initialAreaId,initialAreaTitle,draftScope,areaRecord,onPreview}:{records:WorkspaceRecord[];onNavigate:Navigate;initialAreaId?:string;initialAreaTitle?:string;draftScope?:string;areaRecord?:WorkspaceRecord;onPreview?:(target:LibraryPreviewDestination)=>void}){
 const defaults:LibraryBrowseState={facet:initialAreaId?'topics':'areas',query:'',kind:'',areaId:initialAreaId??'',areaTitle:initialAreaTitle??''};
 const {browse,change,savePosition}=useLibraryEntry(draftScope??'synthetic-library',defaults);
 const items=localLibraryItems(records,browse);
 const open=(item:import('./library-browser').LibraryItem)=>{savePosition();const target=libraryItemDestination(item);onNavigate('library',target.id,{recordFamily:target.family,rendition:target.rendition,sectionId:target.sectionId,partId:target.partId,start:target.start,end:target.end})};
 return <LibraryCatalogueView browse={browse} page={{items}} loading={false} error="" onChange={change} onOpen={open} onArea={(id)=>{savePosition();onNavigate('library',id,{recordFamily:'area'})}} onRoot={()=>{savePosition();onNavigate('library')}} onPreview={onPreview?item=>{savePosition();onPreview(libraryItemDestination(item))}:undefined} areaRecord={areaRecord??records.find(record=>record.family==='area'&&record.id===browse.areaId&&!record.trashedAt)} records={records} onMore={()=>{}} onRetry={()=>{}}/>;
}
export function FeaturedReading({records,onNavigate}:{records:WorkspaceRecord[];onNavigate:Navigate}){const selection=useLearningSpace(),articles=records.filter(record=>record.family==='article'&&!record.trashedAt).slice(0,2);if(!articles.length)return null;return <section className="v2-featured-reading"><div className="v2-section-heading"><h2>Related Articles</h2><button className="v2-text-button" onClick={()=>onNavigate('library')}>Explore the Library <ArrowRight size={13}/></button></div><div className="v2-featured-grid">{articles.map(article=>{const kinds=new Set(article.sections?.flatMap(section=>section.parts.map(part=>part.kind))??[]);return <a key={article.id} className="v2-featured-article" href={learningSpaceHref(href({family:'article',id:article.id}),selection)} onClick={event=>{if(ordinaryClick(event)){event.preventDefault();onNavigate('library',article.id,{recordFamily:'article'})}}}><div className="v2-featured-article-top"><BookOpen size={20}/><span>LIBRARY ARTICLE</span></div><h3>{article.title}</h3><p>{article.body}</p><div className="v2-featured-article-bottom"><span>{article.sections?.length?`${article.sections.length} sections`:'Short Article'}{kinds.has('code')?' · Code examples':''}{kinds.has('diagram')?' · Diagrams':''}{kinds.has('table')?' · Comparisons':''}</span><ArrowRight size={16}/></div></a>})}</div></section>}
