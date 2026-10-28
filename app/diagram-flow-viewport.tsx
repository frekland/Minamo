"use client";
import {ReactFlow,Controls,Background} from '@xyflow/react';
import {useEffect,useRef} from 'react';
import type {FlowLayout} from '../lib/diagrams';
/** Optional viewport only: the trusted native SVG owns graph drawing and semantics. */
export default function DiagramFlowViewport({layout,children}:{layout:FlowLayout;children:React.ReactNode}){
 const instance=useRef<((options:{padding:number;duration:number})=>Promise<boolean>)|null>(null);
 useEffect(()=>{instance.current?.({padding:.08,duration:0});},[layout.width,layout.height]);
 return <div className="edu-flow-viewport"><ReactFlow nodes={[{id:'illustration',position:{x:0,y:0},width:layout.width,height:layout.height,style:{width:layout.width,height:layout.height,padding:0,border:0,background:'transparent'},data:{label:children},draggable:false,selectable:false,focusable:false}]} edges={[]} onInit={value=>{instance.current=options=>value.fitView(options)}} fitView fitViewOptions={{padding:.08}} minZoom={.15} maxZoom={2.5} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} deleteKeyCode={null} zoomOnScroll={false} zoomOnDoubleClick={false} preventScrolling={false} panOnDrag={true} panOnScroll={false} proOptions={{hideAttribution:false}} ariaLabelConfig={{'controls.zoomIn.ariaLabel':'Zoom in','controls.zoomOut.ariaLabel':'Zoom out','controls.fitView.ariaLabel':'Fit diagram'}}><Controls showInteractive={false}/><Background gap={24} size={.4}/></ReactFlow></div>;
}
