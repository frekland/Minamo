import {diagramError,flowDiagramError,type AuthoredDiagram,type FlowNode,type FlowEdge} from './diagrams';
/** Small, lossless Mermaid subset. Unsupported constructs stay original code at the caller. */
function statements(source:string):string[]|null{
 if(typeof source!=='string'||!source.trim()||source.length>12000)return null;
 const result:string[]=[];let current='',quoted=false,escaped=false,depth=0;
 for(const line of source.replace(/\r\n?/g,'\n').split('\n')){
  if(!quoted&&!depth&&/^\s*%%/.test(line))continue;
  for(const char of line){if(quoted){current+=char;if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;continue;}
   if(char==='"'){quoted=true;current+=char;continue;}if(char==='[')depth++;if(char===']')depth--;if(depth<0||depth>1)return null;
   if(char===';'&&!depth){if(current.trim())result.push(current.trim());current='';}else current+=char;
  }
  if(!quoted&&!depth){if(current.trim())result.push(current.trim());current='';}else return null;
 }
 if(quoted||depth||current.trim()||result.length>80)return null;return result;
}
const validLabel=(value:string)=>!!value.trim()&&value.length<=120&&!/[<>`\r\n\u0000-\u001f\u007f]|&(?:#\d+|#x[a-f0-9]+|[a-z]+);|#(?:[a-z][a-z0-9]+|[0-9]+);|\bfa(?:b|s|r|l|d)?:/i.test(value);
function label(raw:string):string|null{let value=raw.trim();if(value.startsWith('"')){try{value=JSON.parse(value)}catch{return null;}if(typeof value!=='string')return null;}else if(/["\[\]{}()|]/.test(value))return null;return validLabel(value)?value:null;}
type ParsedNode={id:string;label?:string;rest:string};
function node(source:string):ParsedNode|null{
 const m=/^\s*([A-Za-z][A-Za-z0-9_-]{0,39})(?![A-Za-z0-9_-])/.exec(source);if(!m)return null;const id=m[1];if(id==='end')return null;let rest=source.slice(m[0].length).trimStart();
 if(!rest.startsWith('['))return{id,rest};
 let quoted=false,escaped=false,end=-1;for(let i=1;i<rest.length;i++){const char=rest[i];if(quoted){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;}else if(char==='"')quoted=true;else if(char===']'){end=i;break;}else if(char==='[')return null;}
 if(end<0)return null;const text=label(rest.slice(1,end));return text===null?null:{id,label:text,rest:rest.slice(end+1).trimStart()};
}
export function compileMermaidSubset(source:string):AuthoredDiagram|null{
 const lines=statements(source);if(!lines?.length)return null;const header=lines.shift()!,state=header==='stateDiagram-v2';if(!state&&!/^(?:graph|flowchart)\s+(?:TD|TB|LR|RL|BT)$/.test(header))return null;
 const nodes:FlowNode[]=[],edges:FlowEdge[]=[],explicit=new Set<string>();let initial:string|undefined;
 function add(id:string,text?:string){const old=nodes.find(node=>node.id===id);if(old){if(text!==undefined&&explicit.has(id)&&old.label!==text)return false;if(text!==undefined){old.label=text;explicit.add(id);}return true;}nodes.push({id,label:text??id});if(text!==undefined)explicit.add(id);return nodes.length<=12;}
 for(const line of lines){
  if(state){
   const declaration=/^state\s+("(?:[^"\\]|\\.)*")\s+as\s+([A-Za-z][A-Za-z0-9_-]{0,39})$/.exec(line);
   if(declaration){const text=label(declaration[1]);if(text===null||!add(declaration[2],text))return null;continue;}
   const start=/^\[\*\]\s*-->\s*([A-Za-z][A-Za-z0-9_-]{0,39})$/.exec(line);if(start){if(initial||!add(start[1]))return null;initial=start[1];continue;}
   const transition=/^([A-Za-z][A-Za-z0-9_-]{0,39})\s*-->\s*([A-Za-z][A-Za-z0-9_-]{0,39})\s*:\s*(.+)$/.exec(line);
   if(transition){const text=label(transition[3]);if(text===null||!add(transition[1])||!add(transition[2]))return null;edges.push({from:transition[1],to:transition[2],label:text});}
   else if(/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(line)){if(!add(line))return null;}else return null;
  }else{
   const from=node(line);if(!from||!add(from.id,from.label))return null;if(!from.rest)continue;let tail=from.rest,edgeLabel:string|undefined;
   if(tail.startsWith('-->')){tail=tail.slice(3).trimStart();if(tail.startsWith('|')){const end=tail.indexOf('|',1);if(end<0)return null;const text=label(tail.slice(1,end));if(text===null)return null;edgeLabel=text;tail=tail.slice(end+1).trimStart();}}
   else{const edge=/^--\s+(.+?)\s+-->\s*/.exec(tail);if(!edge)return null;const text=label(edge[1]);if(text===null)return null;edgeLabel=text;tail=tail.slice(edge[0].length);}
   const to=node(tail);if(!to||to.rest||!add(to.id,to.label))return null;edges.push({from:from.id,to:to.id,...(edgeLabel!==undefined?{label:edgeLabel}:{})});
  }
  if(edges.length>20)return null;
 }
 if(state){const result:AuthoredDiagram={format:'state-v1',nodes,edges,...(initial?{initial}:{})};return diagramError(result)?null:result;}
 const presentation={version:1 as const,mode:'static' as const,orientation:(header.split(/\s+/)[1]==='TD'?'TB':header.split(/\s+/)[1]) as 'TB'|'BT'|'LR'|'RL'};
 const graph:AuthoredDiagram={format:'graph-v1',nodes,edges,presentation};if(diagramError(graph))return null;const flow:AuthoredDiagram={format:'flow-v1',nodes,edges,presentation};return flowDiagramError(flow)?graph:flow;
}
