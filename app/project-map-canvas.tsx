"use client";
import {useMemo} from 'react';
import {ReactFlow,Controls,Background,MarkerType,type Node,type Edge} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {ProjectOutline,ProjectResource} from '../lib/project-contracts';
import type {ReaderProps} from './reader';
import {useLearningSpace} from './learning-space-ui';
import {learningSpaceHref} from '../lib/learning-space-navigation';
import {contextualProjectHref,openProjectDestination} from './project-navigation';

type MapPoint={id:string;title:string;kind:'project'|'step'|'question'|'resource';x:number;y:number;destination:string;stageId?:string};
/** Fixed readable node geometry; large maps scroll/pan instead of shrinking their labels. */
export function projectMapGeometry(outline:ProjectOutline,resources:ProjectResource[]=[]){
 const points:MapPoint[]=[{id:'project',title:outline.project.title,kind:'project',x:24,y:24,destination:outline.project.destination}],edges:{id:string;source:string;target:string;kind:'sequence'|'question'|'resource'}[]=[],questionPoints=new Map<string,MapPoint>(),stagePoints=new Map<string,MapPoint>();
 const height=(title:string)=>Math.max(82,44+Math.ceil(title.length/28)*20);
 let y=24+height(outline.project.title)+54,prior='project';
 for(const step of outline.steps){
  const point:MapPoint={id:'step:'+step.stageId,title:step.title,kind:'step',x:24,y,destination:step.destination,stageId:step.stageId};points.push(point);stagePoints.set(step.stageId,point);edges.push({id:prior+':'+point.id,source:prior,target:point.id,kind:'sequence'});prior=point.id;
  let questionY=y;
  for(const question of step.questions){let q=questionPoints.get(question.id);if(!q){q={id:'question:'+question.id,title:question.title,kind:'question',x:368,y:questionY,destination:question.destination,stageId:step.stageId};questionPoints.set(question.id,q);points.push(q);questionY+=height(question.title)+28;}edges.push({id:point.id+':'+q.id,source:point.id,target:q.id,kind:'question'});}
  y=Math.max(y+height(step.title)+54,questionY+30);
 }
 let projectQuestionY=24;
 for(const question of outline.projectQuestions){let q=questionPoints.get(question.id);if(!q){q={id:'question:'+question.id,title:question.title,kind:'question',x:368,y:Math.max(y,projectQuestionY),destination:question.destination};questionPoints.set(question.id,q);points.push(q);projectQuestionY=q.y+height(question.title)+28;}edges.push({id:'project:'+q.id,source:'project',target:q.id,kind:'question'});}
 let resourceY=24,omittedResources=0;
 for(const [index,resource] of resources.entries()){
  const sources=new Set<string>();for(const p of resource.provenance){const question=p.questionId?questionPoints.get(p.questionId):undefined;if(p.questionId&&!question)continue;const step=p.stageId?stagePoints.get(p.stageId):p.sectionId?outline.steps.find(item=>item.sectionId===p.sectionId):undefined;const stepPoint=step&&'id'in step?step:step?stagePoints.get(step.stageId):undefined;sources.add(question?.id??stepPoint?.id??'project');}
  if(!sources.size){omittedResources++;continue;}
  const point:MapPoint={id:'resource:'+index,title:resource.title,kind:'resource',x:712,y:resourceY,destination:resource.destination};points.push(point);resourceY+=height(resource.title)+28;
  for(const source of sources)edges.push({id:source+':'+point.id,source,target:point.id,kind:'resource'});
 }
 return {points,edges,omittedResources};
}
export default function ProjectMapCanvas({outline,resources,onNavigate,onClose}:{outline:ProjectOutline;resources:ProjectResource[];onNavigate?:ReaderProps['onNavigate'];onClose:()=>void}){
 const selection=useLearningSpace(),geometry=useMemo(()=>projectMapGeometry(outline,resources),[outline,resources]);
 const nodes:Node[]=geometry.points.map(point=>{const path=learningSpaceHref(contextualProjectHref(point.destination,outline.project.id,point.stageId),selection);return {id:point.id,position:{x:point.x,y:point.y},data:{label:<a className="project-map-node-link nodrag nopan" href={path} onClick={event=>{openProjectDestination(event,path,onNavigate);if(event.defaultPrevented)onClose();}}><small>{point.kind==='step'?'Step '+(outline.steps.findIndex(step=>step.stageId===point.stageId)+1):point.kind==='question'?'Question':point.kind==='resource'?'Library':'Project'}</small><strong>{point.title}</strong></a>},className:'project-map-node project-map-node-'+point.kind,style:{width:260,minHeight:74,padding:0,pointerEvents:'all'},draggable:false,selectable:false,focusable:false};});
 const edges:Edge[]=geometry.edges.map(edge=>({...edge,markerEnd:edge.kind==='sequence'?{type:MarkerType.ArrowClosed,width:15,height:15}:undefined,type:'smoothstep',animated:false,style:{stroke:edge.kind==='sequence'?'var(--mn-interactive)':'var(--mn-text-muted)',strokeWidth:edge.kind==='sequence'?1.7:1.1,...(edge.kind==='resource'?{strokeDasharray:'4 4'}:{})},ariaLabel:edge.kind==='sequence'?'Next step':edge.kind==='question'?'Explicit question link':'Linked Library resource'}));
 return <>{geometry.omittedResources>0&&<p className="project-map-key">Some resources link through questions that are not loaded here. They remain available in Outline.</p>}<div className="project-map-canvas" aria-label="Project path. Use Outline for a complete list of links."><ReactFlow nodes={nodes} edges={edges} defaultViewport={{x:24,y:18,zoom:.95}} minZoom={.2} maxZoom={1.8} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKeyCode={null} zoomOnScroll={false} zoomOnDoubleClick={false} preventScrolling={false} panOnScroll={false} panOnDrag={true} proOptions={{hideAttribution:false}} ariaLabelConfig={{'controls.zoomIn.ariaLabel':'Zoom in','controls.zoomOut.ariaLabel':'Zoom out','controls.fitView.ariaLabel':'Fit map'}}><Controls showInteractive={false}/><Background gap={24} size={.5}/></ReactFlow></div></>;
}
