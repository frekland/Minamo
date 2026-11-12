/** Bounded explicit authored diagrams. Legacy text is never parsed into an inferred graph. */
export type DiagramReference={family:'article'|'source'|'investigation'|'journey';id:string;rendition:string;sectionId?:string;partId?:string};
export type DiagramStep={id:string;title:string;explanation:string;activeNodes:string[];activeEdges:string[];visibleNodes?:string[];visibleEdges?:string[];nodeLabels?:Record<string,string>;prediction?:{question:string;answer:string}};
export type DiagramPresentation={version:1;orientation?:'auto'|'TB'|'BT'|'LR'|'RL';layout?:'layered'|'radial';mode:'static'|'explore'|'guided';description?:string;steps?:DiagramStep[];initialStep?:string};
export type FlowNode={id:string;label:string;description?:string;reference?:DiagramReference};
export type FlowEdge={from:string;to:string;label?:string;id?:string;description?:string;reference?:DiagramReference};
export type FlowDiagram={format:'flow-v1';nodes:FlowNode[];edges:FlowEdge[];presentation?:DiagramPresentation};
export type GraphDiagram={format:'graph-v1';nodes:FlowNode[];edges:FlowEdge[];presentation?:DiagramPresentation};
export type StateDiagram={format:'state-v1';nodes:FlowNode[];edges:FlowEdge[];initial?:string;presentation?:DiagramPresentation};
export type GridDiagram={format:'grid-v1';title:string;rowLabels:string[];columnLabels:string[];cells:string[][];highlights?:{row:number;column:number;label:string}[];regionRows?:number;regionColumns?:number};
export type AuthoredDiagram=FlowDiagram|StateDiagram|GridDiagram|GraphDiagram;
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const fields=(value:Record<string,unknown>,allowed:string[])=>Object.keys(value).every(key=>allowed.includes(key));
const label=(value:unknown)=>typeof value==='string'&&value.trim().length>0&&value.length<=120&&!/[\r\n\u0000-\u001f\u007f]/.test(value)&&!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(value);
export function flowDiagramError(value:unknown):string|null{
 if(!object(value)||!fields(value,['format','nodes','edges','presentation'])||value.format!=='flow-v1')return 'Unsupported diagram format. Use explicit flow-v1 metadata.';
 if(!Array.isArray(value.nodes)||value.nodes.length<1||value.nodes.length>12||!Array.isArray(value.edges)||value.edges.length>20)return 'A flow diagram requires 1–12 nodes and at most 20 connections.';
 const ids=new Set<string>();for(const node of value.nodes){if(!object(node)||!fields(node,['id','label','description','reference'])||typeof node.id!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(node.id)||!label(node.label)||ids.has(node.id))return 'Nodes need unique stable IDs and nonempty single-line labels of at most 120 characters.';ids.add(node.id);}
 const outgoing=new Map([...ids].map(id=>[id,[] as string[]])),pairs=new Set<string>();
 for(const edge of value.edges){if(!object(edge)||!fields(edge,['from','to','label','id','description','reference'])||typeof edge.from!=='string'||typeof edge.to!=='string'||!ids.has(edge.from)||!ids.has(edge.to)||edge.from===edge.to||(edge.label!==undefined&&!label(edge.label)))return 'Connections need known distinct endpoints and optional single-line labels of at most 120 characters.';const pair=edge.from+'\0'+edge.to;if(pairs.has(pair))return 'Duplicate connections are unavailable; use one labelled connection per ordered pair.';pairs.add(pair);outgoing.get(edge.from)!.push(edge.to);}
 const active=new Set<string>(),done=new Set<string>();function visit(id:string):boolean{if(active.has(id))return false;if(done.has(id))return true;active.add(id);for(const next of outgoing.get(id)!)if(!visit(next))return false;active.delete(id);done.add(id);return true;}
 for(const id of ids)if(!visit(id))return 'flow-v1 supports directed acyclic diagrams; use graph-v1 for generic cycles or state-v1 for trigger-labelled transitions.';
 return presentationError(value);
}
export function stateDiagramError(value:unknown):string|null{
 if(!object(value)||value.format!=='state-v1'||!fields(value,['format','nodes','edges','initial','presentation']))return 'Unsupported state metadata.';
 if(!Array.isArray(value.nodes)||value.nodes.length<1||value.nodes.length>12||!Array.isArray(value.edges)||value.edges.length>20)return 'A state diagram requires 1–12 states and at most 20 transitions.';
 const ids=new Set<string>();for(const node of value.nodes){if(!object(node)||!fields(node,['id','label','description','reference'])||typeof node.id!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(node.id)||!label(node.label)||ids.has(node.id))return 'States need unique stable IDs and bounded single-line labels.';ids.add(node.id);}
 if(value.initial!==undefined&&(typeof value.initial!=='string'||!ids.has(value.initial)))return 'Initial state must name an existing state.';
 const edges=new Set<string>();for(const edge of value.edges){if(!object(edge)||!fields(edge,['from','to','label','id','description','reference'])||typeof edge.from!=='string'||typeof edge.to!=='string'||!ids.has(edge.from)||!ids.has(edge.to)||!label(edge.label))return 'Transitions require known endpoints and an explicit trigger label.';const key=edge.from+'\0'+edge.to+'\0'+edge.label;if(edges.has(key))return 'Duplicate transitions are unavailable.';edges.add(key);}
 return presentationError(value);
}
/** Generic directed relationships admit cycles and self loops without inventing triggers. */
export function graphDiagramError(value:unknown):string|null{
 if(!object(value)||value.format!=='graph-v1'||!fields(value,['format','nodes','edges','presentation']))return 'Unsupported graph metadata.';
 if(!Array.isArray(value.nodes)||value.nodes.length<1||value.nodes.length>12||!Array.isArray(value.edges)||value.edges.length>20)return 'A graph requires 1–12 nodes and at most 20 connections.';
 const ids=new Set<string>();for(const node of value.nodes){if(!object(node)||!fields(node,['id','label','description','reference'])||typeof node.id!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(node.id)||!label(node.label)||ids.has(node.id))return 'Nodes need unique stable IDs and bounded single-line labels.';ids.add(node.id);}
 const edges=new Set<string>();for(const edge of value.edges){if(!object(edge)||!fields(edge,['from','to','label','id','description','reference'])||typeof edge.from!=='string'||typeof edge.to!=='string'||!ids.has(edge.from)||!ids.has(edge.to)||(edge.label!==undefined&&!label(edge.label)))return 'Connections require known endpoints and optional bounded labels.';const key=edge.from+'\0'+edge.to;if(edges.has(key))return 'Duplicate ordered connections are unavailable; combine their labels explicitly.';edges.add(key);}
 return presentationError(value);
}

export const diagramEdgeId=(edge:FlowEdge,index:number)=>edge.id??'edge-'+index;
const stable=(v:unknown)=>typeof v==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(v);
const prose=(v:unknown)=>typeof v==='string'&&v.trim().length>0&&v.length<=2000&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v);
function referenceError(v:unknown):boolean{return !object(v)||!fields(v,['family','id','rendition','sectionId','partId'])||!['article','source','investigation','journey'].includes(String(v.family))||!['id','rendition'].every(k=>typeof v[k]==='string'&&/^[A-Za-z0-9_.:-]{1,180}$/.test(v[k] as string))||['sectionId','partId'].some(k=>v[k]!==undefined&&(typeof v[k]!=='string'||!/^[A-Za-z0-9_.:-]{1,180}$/.test(v[k] as string)))||!!(v.partId&&!v.sectionId);}
function presentationError(value:Record<string,unknown>):string|null{
 const nodes=value.nodes as FlowNode[],edges=value.edges as FlowEdge[];
 const edgeIds=edges.map(diagramEdgeId);if(new Set(edgeIds).size!==edgeIds.length)return 'Connection IDs must be unique, including generated edge-N identities.';
 for(const item of [...nodes,...edges]){if(item.description!==undefined&&!prose(item.description))return 'Descriptions must contain 1–2000 characters.';if(item.reference!==undefined&&referenceError(item.reference))return 'References need an exact family, record ID and rendition; partId also needs sectionId.';}
 if(edges.some(e=>e.id!==undefined&&!stable(e.id)))return 'Connection IDs must be stable identifiers of at most 40 characters.';
 const p=value.presentation;if(p===undefined)return null;
 if(!object(p)||!fields(p,['version','orientation','layout','mode','description','steps','initialStep'])||p.version!==1||!['static','explore','guided'].includes(String(p.mode)))return 'Use presentation version 1 and mode static, explore or guided; executable content and unsupported controls are not accepted.';
 if(p.orientation!==undefined&&!['auto','TB','BT','LR','RL'].includes(String(p.orientation)))return 'Orientation must be auto, TB, BT, LR or RL.';
 if(p.layout!==undefined&&!['layered','radial'].includes(String(p.layout)))return 'Layout must be layered or radial.';
 if(p.description!==undefined&&!prose(p.description))return 'Diagram description must contain 1–2000 characters.';
 if(p.mode!=='guided')return p.steps!==undefined||p.initialStep!==undefined?'Only guided diagrams accept steps and initialStep.':null;
 if(!Array.isArray(p.steps)||p.steps.length<2||p.steps.length>20)return 'Guided diagrams require 2–20 explicit steps.';
 const nodeIds=nodes.map(n=>n.id),steps=new Set<string>();
 const refs=(v:unknown,known:string[])=>Array.isArray(v)&&v.length<=known.length&&new Set(v).size===v.length&&v.every(x=>typeof x==='string'&&known.includes(x));
 for(const step of p.steps){
  if(!object(step)||!fields(step,['id','title','explanation','activeNodes','activeEdges','visibleNodes','visibleEdges','nodeLabels','prediction'])||!stable(step.id)||steps.has(String(step.id))||!label(step.title)||!prose(step.explanation))return 'Steps need unique stable IDs, a title and an explanation; only supported fields are accepted.';
  steps.add(String(step.id));
  if(!refs(step.activeNodes,nodeIds)||!refs(step.activeEdges,edgeIds)||step.visibleNodes!==undefined&&!refs(step.visibleNodes,nodeIds)||step.visibleEdges!==undefined&&!refs(step.visibleEdges,edgeIds))return 'Step node/edge references must be unique existing identities; use explicit edge IDs or edge-N (zero-based).';
  const visibleNodes=(step.visibleNodes??nodeIds) as string[],visibleEdges=(step.visibleEdges??edges.filter(e=>visibleNodes.includes(e.from)&&visibleNodes.includes(e.to)).map(e=>diagramEdgeId(e,edges.indexOf(e)))) as string[];
  if((step.activeNodes as string[]).some(id=>!visibleNodes.includes(id))||(step.activeEdges as string[]).some(id=>!visibleEdges.includes(id))||edges.some((e,i)=>visibleEdges.includes(diagramEdgeId(e,i))&&(!visibleNodes.includes(e.from)||!visibleNodes.includes(e.to))))return 'Active items must be visible; visible connections require both visible endpoints.';
  if(step.nodeLabels!==undefined&&(!object(step.nodeLabels)||Object.entries(step.nodeLabels).some(([id,text])=>!nodeIds.includes(id)||!label(text))))return 'Step nodeLabels may only label existing nodes with bounded text.';
  if(step.prediction!==undefined&&(!object(step.prediction)||!fields(step.prediction,['question','answer'])||!prose(step.prediction.question)||!prose(step.prediction.answer)))return 'A prediction needs a question and authored answer; it does not record an Attempt.';
 }
 if(p.initialStep!==undefined&&(typeof p.initialStep!=='string'||!steps.has(p.initialStep)))return 'initialStep must identify an authored step.';
 return null;
}

export function gridDiagramError(value:unknown):string|null{
 if(!object(value)||value.format!=='grid-v1'||!fields(value,['format','title','rowLabels','columnLabels','cells','highlights','regionRows','regionColumns'])||!label(value.title))return 'A grid requires a bounded title and supported grid-v1 metadata.';
 if(!Array.isArray(value.rowLabels)||!Array.isArray(value.columnLabels)||value.rowLabels.length<1||value.rowLabels.length>12||value.columnLabels.length<1||value.columnLabels.length>12||![...value.rowLabels,...value.columnLabels].every(label)||new Set(value.rowLabels).size!==value.rowLabels.length||new Set(value.columnLabels).size!==value.columnLabels.length)return 'Use 1–12 unique row and column labels.';
 const columnCount=value.columnLabels.length;
 if(!Array.isArray(value.cells)||value.cells.length!==value.rowLabels.length||!value.cells.every(row=>Array.isArray(row)&&row.length===columnCount&&row.every(cell=>cell===''||label(cell))))return 'Every grid row must match the column count with bounded single-line cell text.';
 for(const key of ['regionRows','regionColumns'])if(value[key]!==undefined&&(!Number.isInteger(value[key])||Number(value[key])<1||Number(value[key])>12))return 'Region dimensions must be integers from 1 to 12.';
 if(value.regionRows!==undefined&&value.rowLabels.length%Number(value.regionRows)!==0||value.regionColumns!==undefined&&value.columnLabels.length%Number(value.regionColumns)!==0)return 'Region dimensions must divide the grid dimensions.';
 if(value.highlights!==undefined){if(!Array.isArray(value.highlights)||value.highlights.length>144)return 'At most 144 highlighted cells are supported.';const seen=new Set<string>();for(const h of value.highlights){if(!object(h)||!fields(h,['row','column','label'])||!Number.isInteger(h.row)||!Number.isInteger(h.column)||Number(h.row)<0||Number(h.row)>=value.rowLabels.length||Number(h.column)<0||Number(h.column)>=value.columnLabels.length||!label(h.label)||seen.has(h.row+':'+h.column))return 'Highlights require unique in-range zero-based coordinates and a label.';seen.add(h.row+':'+h.column);}}
 return null;
}
export function diagramError(value:unknown):string|null{return object(value)&&value.format==='graph-v1'?graphDiagramError(value):object(value)&&value.format==='state-v1'?stateDiagramError(value):object(value)&&value.format==='grid-v1'?gridDiagramError(value):flowDiagramError(value);}
export function diagramCanonicalText(diagram:AuthoredDiagram):string{
 if(diagram.format==='grid-v1')return diagram.title+'\nColumns\t'+diagram.columnLabels.join('\t')+'\n'+diagram.cells.map((row,i)=>diagram.rowLabels[i]+'\t'+row.join('\t')).join('\n')+(diagram.regionRows||diagram.regionColumns?'\nRegions: '+(diagram.regionRows??1)+' rows × '+(diagram.regionColumns??1)+' columns':'')+(diagram.highlights?.length?'\nHighlights\n'+diagram.highlights.map(h=>diagram.rowLabels[h.row]+', '+diagram.columnLabels[h.column]+': '+h.label).join('\n'):'');
 if(diagram.format==='state-v1')return 'States\n'+diagram.nodes.map(node=>node.id+': '+node.label).join('\n')+(diagram.initial?'\nInitial: '+diagram.initial:'')+'\n\nTransitions'+(diagram.edges.length?'\n'+diagram.edges.map(edge=>edge.from+' → '+edge.to+': '+edge.label).join('\n'):'');
 return 'Nodes\n'+diagram.nodes.map(node=>node.id+': '+node.label).join('\n')+'\n\nConnections'+(diagram.edges.length?'\n'+diagram.edges.map(edge=>edge.from+' → '+edge.to+(edge.label!==undefined?': '+edge.label:'')).join('\n'):'');}
export type FlowLayoutNode={node:FlowNode;x:number;y:number;width:number;height:number;lines:string[]};
export type FlowLayoutEdge={edge:FlowEdge;path:string;labelX:number;labelY:number;labelWidth:number;labelHeight:number;lines:string[];labelLinkPath?:string};
export type FlowLayout={width:number;height:number;nodes:FlowLayoutNode[];edges:FlowLayoutEdge[]};
function wrap(text:string,limit=27){const lines:string[]=[];let rest=text;while(rest.length>limit){let end=rest.lastIndexOf(' ',limit);if(end<=0)end=limit;lines.push(rest.slice(0,end));rest=rest.slice(end).replace(/^ /,'');}lines.push(rest);return lines;}
export function layoutFlowDiagram(diagram:FlowDiagram,compact=false):FlowLayout{
 const error=flowDiagramError(diagram);if(error)throw Error(error);
 const ranks=new Map<string,number>();function rank(id:string):number{if(ranks.has(id))return ranks.get(id)!;const parents=diagram.edges.filter(edge=>edge.to===id).map(edge=>rank(edge.from));const value=parents.length?Math.max(...parents)+1:0;ranks.set(id,value);return value;}
 for(const node of diagram.nodes)rank(node.id);const layers=Array.from({length:Math.max(...ranks.values())+1},(_,index)=>diagram.nodes.filter(node=>ranks.get(node.id)===index));
 const nodeWidth=compact?126:180,gap=24,margin=16,reserve=diagram.edges.some(e=>ranks.get(e.to)!-ranks.get(e.from)!>1)?80:0,width=Math.max(nodeWidth,...layers.map(layer=>layer.length*nodeWidth+(layer.length-1)*gap))+margin*2+reserve;const nodes:FlowLayoutNode[]=[];let y=margin;
 const edgeLines=diagram.edges.map(edge=>edge.label?wrap(edge.label,21):[]);
 const labelHeight=(index:number)=>edgeLines[index].length*19+10;
 const labelStack=(id:string)=>diagram.edges.reduce((height,edge,index)=>height+(edge.to===id&&edgeLines[index].length?labelHeight(index)+12:0),0);
 for(let rankIndex=0;rankIndex<layers.length;rankIndex++){const layer=layers[rankIndex],height=Math.max(...layer.map(node=>Math.max(48,wrap(node.label,compact?15:22).length*18+22))),layerWidth=layer.length*nodeWidth+(layer.length-1)*gap;layer.forEach((node,index)=>nodes.push({node,x:(width-reserve-layerWidth)/2+index*(nodeWidth+gap),y,width:nodeWidth,height,lines:wrap(node.label,compact?15:22)}));const next=layers[rankIndex+1];y+=height+Math.max(38,next?Math.max(...next.map(node=>labelStack(node.id)))+28:38);}
 const byId=new Map(nodes.map(node=>[node.node.id,node]));
 // Label boxes occupy separate slots immediately above their destination column.
 // Fork labels therefore cannot cover each other; fan-in labels receive additional
 // vertical space rather than painting over another label or either node row.
 const labelSlots=new Map<number,number>();for(const node of nodes){let top=node.y-labelStack(node.node.id)-20;diagram.edges.forEach((edge,index)=>{if(edge.to===node.node.id&&edgeLines[index].length){labelSlots.set(index,top+15);top+=labelHeight(index)+12;}});}
 const edges=diagram.edges.map((edge,index)=>{const from=byId.get(edge.from)!,to=byId.get(edge.to)!,x1=from.x+from.width/2,y1=from.y+from.height,x2=to.x+to.width/2,y2=to.y;const lane=(index%5-2)*12,lines=edgeLines[index],labelX=x2,labelY=labelSlots.get(index)??(y1+y2)/2;let path:string;
  if(ranks.get(edge.to)!-ranks.get(edge.from)!>1){const route=width-60+(index%4)*12,turn=lines.length?labelY-22:y2-30;path=`M ${x1} ${y1} L ${x1} ${y1+30} L ${route} ${y1+30} L ${route} ${turn} L ${x2} ${turn} L ${x2} ${y2}`;}
  else if(lines.length){const turn=labelY-22,middle=(y1+turn)/2;path=`M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${turn} L ${x2} ${y2}`;}
  else{const middle=(y1+y2)/2+lane;path=`M ${x1} ${y1} C ${x1} ${middle}, ${x2} ${middle}, ${x2} ${y2}`;}
  return{edge,path,labelX,labelY,labelWidth:170,labelHeight:lines.length?labelHeight(index):0,lines};});
 return{width,height:y-18,nodes,edges};
}

/** Readable recovery for explicitly authored commentary when a future renderer is unavailable. */
export function diagramTeachingFallback(value:unknown):string{
 if(!object(value))return '';const result:string[]=[];
 if(Array.isArray(value.nodes))for(const n of value.nodes.slice(0,12))if(object(n)&&typeof n.description==='string')result.push(String(n.label??n.id??'Node')+': '+n.description.slice(0,2000));
 if(Array.isArray(value.edges))for(const e of value.edges.slice(0,20))if(object(e)&&typeof e.description==='string')result.push(String(e.label??'Connection')+': '+e.description.slice(0,2000));
 const p=value.presentation;if(object(p)){if(typeof p.description==='string')result.unshift(p.description.slice(0,2000));if(Array.isArray(p.steps))for(const step of p.steps.slice(0,20))if(object(step)){if(typeof step.title==='string')result.push(step.title.slice(0,120));if(typeof step.explanation==='string')result.push(step.explanation.slice(0,2000));if(object(step.prediction)){if(typeof step.prediction.question==='string')result.push(step.prediction.question.slice(0,2000));if(typeof step.prediction.answer==='string')result.push(step.prediction.answer.slice(0,2000));}}}
 return result.join('\n\n');
}
