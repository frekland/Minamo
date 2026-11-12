import {layoutFlowDiagram,type AuthoredDiagram,type FlowLayout,type FlowLayoutNode,type FlowLayoutEdge} from './diagrams';
type Graph=Exclude<AuthoredDiagram,{format:'grid-v1'}>;
export function wrapDiagramLabel(text:string,limit=24):string[]{const result:string[]=[];let rest=text;while(rest.length>limit){let end=rest.lastIndexOf(' ',limit);if(end<=0)end=limit;result.push(rest.slice(0,end));rest=rest.slice(end).trimStart();}return [...result,rest];}
/** Stable, bounded geometry. Cycles use an explicit ring, DAGs use topological layers. */
export function layoutEducationalDiagram(diagram:Graph,available=700):FlowLayout{
 const rank=new Map<string,number>();let cyclic=false;
 // Strong components keep reciprocal endpoints together; collapse them only for layout.
 const reachable=(start:string,target:string,seen=new Set<string>()):boolean=>{if(start===target)return true;if(seen.has(start))return false;seen.add(start);return diagram.edges.filter(e=>e.from===start).some(e=>reachable(e.to,target,seen));};
 const groups:string[][]=[];for(const n of diagram.nodes){if(groups.some(g=>g.includes(n.id)))continue;groups.push(diagram.nodes.filter(m=>reachable(n.id,m.id)&&reachable(m.id,n.id)).map(m=>m.id));}
 cyclic=groups.some(g=>g.length>1)||diagram.edges.some(e=>e.from===e.to);
 const owner=new Map(groups.flatMap((g,i)=>g.map(id=>[id,i] as const))),groupRank=new Map<number,number>();
 function visit(g:number):number{if(groupRank.has(g))return groupRank.get(g)!;const parents=[...new Set(diagram.edges.filter(e=>owner.get(e.to)===g&&owner.get(e.from)!==g).map(e=>owner.get(e.from)!))];const r=parents.length?Math.max(...parents.map(visit))+1:0;groupRank.set(g,r);return r;}
 groups.forEach((g,i)=>g.forEach(id=>rank.set(id,visit(i))));
 let direction=diagram.presentation?.orientation??'auto';if(direction==='auto')direction=available<520?'TB':'LR';
 const pairOnly=groups.length===1&&groups[0].length===2,radial=diagram.presentation?.layout==='radial'||cyclic&&diagram.presentation?.layout!=='layered'&&(groups.some(g=>g.length>2)||diagram.edges.some(e=>e.from===e.to));
 if(!radial&&!cyclic&&direction==='TB')return placeDiagramLabels(layoutFlowDiagram({...diagram,format:'flow-v1',presentation:undefined},available<520));
 // Reserve actual connection run between same-rank nodes, rather than bending
 // reciprocal edges into the former 24px gutter. Narrow nodes wrap to their real width.
 const peerLabels=diagram.edges.filter(e=>rank.get(e.from)===rank.get(e.to)&&e.from!==e.to).map(e=>e.label?Math.min(19,e.label.length)*7+16:0);
 const columnGap=Math.max(available<520?84:112,...peerLabels.map(w=>w+24)),nodeW=available<520?Math.max(80,Math.min(126,(available-32-columnGap)/2)):180,labelLimit=Math.max(8,Math.floor((nodeW-20)/7));
 const nodes:FlowLayoutNode[]=[],margin=34,nodeH=(label:string)=>Math.max(48,wrapDiagramLabel(label,labelLimit).length*18+22);
 let width=0,height=0;
 if(radial){const count=diagram.nodes.length,rx=Math.max(130, count*34),ry=Math.max(90,count*22);width=rx*2+nodeW+margin*2;height=ry*2+240;diagram.nodes.forEach((node,i)=>{const a=2*Math.PI*i/count-Math.PI/2,h=nodeH(node.label);nodes.push({node,x:width/2+rx*Math.cos(a)-nodeW/2,y:height/2+ry*Math.sin(a)-h/2,width:nodeW,height:h,lines:wrapDiagramLabel(node.label,labelLimit)});});}
 else{
  const alongX=direction==='LR'||direction==='RL',horizontal=pairOnly?!alongX:alongX,layers=Array.from({length:Math.max(...rank.values())+1},(_,r)=>diagram.nodes.filter(n=>rank.get(n.id)===r));
  // Stable barycentric ordering reduces crossings between adjacent layers.
  for(let r=1;r<layers.length;r++){const prior=layers[r-1],score=(id:string)=>{const parents=diagram.edges.filter(e=>e.to===id).map(e=>prior.findIndex(n=>n.id===e.from)).filter(i=>i>=0);return parents.length?parents.reduce((a,b)=>a+b,0)/parents.length:layers[r].findIndex(n=>n.id===id);};layers[r]=layers[r].map((n,i)=>({n,i,s:score(n.id)})).sort((a,b)=>a.s-b.s||a.i-b.i).map(x=>x.n);}
  const rankGap=diagram.edges.some(e=>e.label)?150:44;
  if(horizontal){width=layers.length*(nodeW+rankGap)-rankGap+margin*2;height=Math.max(...layers.map(l=>l.reduce((s,n)=>s+nodeH(n.label)+80,0)))+margin*2;layers.forEach((layer,r)=>{let y=margin+(height-margin*2-layer.reduce((s,n)=>s+nodeH(n.label)+80,0))/2;layer.forEach(node=>{const h=nodeH(node.label);nodes.push({node,x:margin+r*(nodeW+rankGap),y,width:nodeW,height:h,lines:wrapDiagramLabel(node.label,labelLimit)});y+=h+80;});});}
  else{width=Math.max(...layers.map(l=>l.length*nodeW+(l.length-1)*columnGap))+32;let y=34;layers.forEach(layer=>{const h=Math.max(...layer.map(n=>nodeH(n.label))),span=layer.length*nodeW+(layer.length-1)*columnGap;layer.forEach((node,i)=>nodes.push({node,x:(width-span)/2+i*(nodeW+columnGap),y,width:nodeW,height:h,lines:wrapDiagramLabel(node.label,labelLimit)}));y+=h+78;});height=y-44;}
  if(direction==='RL')nodes.forEach(n=>n.x=width-n.x-n.width);if(direction==='BT')nodes.forEach(n=>n.y=height-n.y-n.height);
 }
 const byId=new Map(nodes.map(n=>[n.node.id,n]));
 const edges:FlowLayoutEdge[]=diagram.edges.map((edge,i)=>{const a=byId.get(edge.from)!,b=byId.get(edge.to)!,ax=a.x+a.width/2,ay=a.y+a.height/2,bx=b.x+b.width/2,by=b.y+b.height/2;const dx=bx-ax,dy=by-ay,horizontal=Math.abs(dx)>Math.abs(dy);let x1=ax,y1=ay,x2=bx,y2=by;
  if(horizontal){x1+=Math.sign(dx)*a.width/2;x2-=Math.sign(dx)*b.width/2;}else{y1+=Math.sign(dy)*a.height/2;y2-=Math.sign(dy)*b.height/2;}
  const reciprocal=diagram.edges.some(e=>e.from===edge.to&&e.to===edge.from),bend=reciprocal?(horizontal?(dx>0?-32:32):(dy>0?-32:32)):0;
  const lines=edge.label?wrapDiagramLabel(edge.label,19):[],labelWidth=lines.length?Math.max(...lines.map(l=>l.length))*7+16:0,labelHeight=lines.length*18+8;
  const loopBottom=a.y<80,loopY=loopBottom?a.y+a.height:a.y;if(edge.from===edge.to&&loopBottom)height=Math.max(height,loopY+90);
  let path=edge.from===edge.to?(loopBottom?`M ${ax-35} ${loopY} C ${ax-105} ${loopY+70}, ${ax+105} ${loopY+70}, ${ax+35} ${loopY}`:`M ${ax+40} ${a.y} C ${ax+110} ${a.y-70}, ${ax-110} ${a.y-70}, ${ax-40} ${a.y}`):horizontal?`M ${x1} ${y1} C ${(x1+x2)/2} ${y1+bend}, ${(x1+x2)/2} ${y2+bend}, ${x2} ${y2}`:`M ${x1} ${y1} C ${x1+bend} ${(y1+y2)/2}, ${x2+bend} ${(y1+y2)/2}, ${x2} ${y2}`;
  let parallel=false;
  if(!radial&&edge.from!==edge.to&&(Math.abs(dy)<1||Math.abs(dx)<1)){
   parallel=true;
   if(Math.abs(dy)<1){const lane=reciprocal?(dx>0?-10:10):0;y1=ay+lane;y2=by+lane;}
   else{const lane=reciprocal?(dy>0?-10:10):0;x1=ax+lane;x2=bx+lane;}
   path=`M ${x1} ${y1} L ${x2} ${y2}`;
  }
  let routedLabel:{x:number;y:number}|undefined;
  // A same-rank skip edge must not pass through an intervening node.
  if(parallel){const obstacles=nodes.filter(n=>n!==a&&n!==b);
   if(horizontal&&obstacles.some(n=>n.x<x2&&n.x+n.width>x1&&y1>n.y&&y1<n.y+n.height||n.x<x1&&n.x+n.width>x2&&y1>n.y&&y1<n.y+n.height)){
    const laneY=Math.max(a.y+a.height,b.y+b.height)+30+(i%2)*18,lead=Math.sign(dx)*14;path=`M ${x1} ${y1} L ${x1+lead} ${y1} L ${x1+lead} ${laneY} L ${x2-lead} ${laneY} L ${x2-lead} ${y2} L ${x2} ${y2}`;routedLabel={x:(x1+x2)/2,y:laneY-6};height=Math.max(height,laneY+34);
   }else if(!horizontal&&obstacles.some(n=>n.y<Math.max(y1,y2)&&n.y+n.height>Math.min(y1,y2)&&x1>n.x&&x1<n.x+n.width)){
    const laneX=Math.max(a.x+a.width,b.x+b.width)+30+(i%2)*18,lead=Math.sign(dy)*14;path=`M ${x1} ${y1} L ${x1} ${y1+lead} L ${laneX} ${y1+lead} L ${laneX} ${y2-lead} L ${x2} ${y2-lead} L ${x2} ${y2}`;routedLabel={x:laneX+labelWidth/2+8,y:(y1+y2)/2};width=Math.max(width,laneX+labelWidth+28);
   }
  }
  if(radial&&edge.from!==edge.to){const len=Math.hypot(dx,dy)||1,cx=(ax+bx)/2-dy/len*(reciprocal?48:18),cy=(ay+by)/2+dx/len*(reciprocal?48:18);path=`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;}
  return{edge,path,labelX:routedLabel?.x??(edge.from===edge.to?ax:(x1+x2)/2+(parallel&&!horizontal&&reciprocal?(dx===0&&dy>0?-1:1)*(labelWidth/2+10):horizontal?0:bend*.75)),labelY:routedLabel?.y??(edge.from===edge.to?(loopBottom?loopY+38:a.y-38):(y1+y2)/2+(parallel&&horizontal?(dx>0?-18:24):horizontal?bend*.75:0)),labelWidth,labelHeight,lines};});
 return placeDiagramLabels({width,height,nodes,edges});
}

/** Place complete label boxes clear of nodes and one another; displaced labels retain a leader. */
export function placeDiagramLabels(layout:FlowLayout):FlowLayout{
 const boxes=layout.nodes.map(n=>({x:n.x-5,y:n.y-5,w:n.width+10,h:n.height+10}));
 const overlaps=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number})=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 let laneY=20;
 for(const e of layout.edges){if(!e.lines.length)continue;const oldX=e.labelX,oldY=e.labelY;let placed=false;
  const candidates=[{x:oldX,y:oldY}];for(let distance=24;distance<=192;distance+=24)for(const [dx,dy] of [[0,-distance],[0,distance],[-distance,0],[distance,0],[-distance,-distance],[distance,distance]])candidates.push({x:oldX+dx,y:oldY+dy});
  for(const c of candidates){const box={x:c.x-e.labelWidth/2,y:c.y-15,w:e.labelWidth+6,h:e.labelHeight+6};if(box.x<4||box.y<4||box.x+box.w>layout.width-4||box.y+box.h>layout.height-4||boxes.some(b=>overlaps(box,b)))continue;e.labelX=c.x;e.labelY=c.y;boxes.push(box);placed=true;break;}
  if(!placed){e.labelX=layout.width+e.labelWidth/2+20;e.labelY=laneY+15;boxes.push({x:layout.width+20,y:laneY,w:e.labelWidth,h:e.labelHeight});laneY+=e.labelHeight+14;}
  if(Math.hypot(oldX-e.labelX,oldY-e.labelY)>16)e.labelLinkPath=`M ${oldX} ${oldY} L ${e.labelX} ${e.labelY}`;
 }
 layout.width=Math.max(layout.width,...boxes.map(b=>b.x+b.w+10));layout.height=Math.max(layout.height,...boxes.map(b=>b.y+b.h+10));return layout;
}
