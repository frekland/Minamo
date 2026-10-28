/** Saved-mark choices depend only on canonical ranges, never on syntax or wrapping. */
export type LogicalMarkRange={start:number;end:number;id:string};
export type LogicalMarkGroup={key:string;ids:string[];start:number;end:number;snippet:string};
export function logicalMarkGroups(text:string,ranges:LogicalMarkRange[]):LogicalMarkGroup[]{
 const events=new Map<number,{id:string;delta:number}[]>();
 for(const range of ranges){
  if(!Number.isSafeInteger(range.start)||!Number.isSafeInteger(range.end)||range.start<0||range.end>text.length||range.end<=range.start)continue;
  for(const [offset,delta] of [[range.start,1],[range.end,-1]]){const at=events.get(offset)??[];at.push({id:range.id,delta});events.set(offset,at);}
 }
 const boundaries=[...events.keys()].sort((a,b)=>a-b),groups=new Map<string,LogicalMarkGroup>(),active=new Map<string,number>();
 for(let index=0;index<boundaries.length-1;index++){
  const start=boundaries[index],end=boundaries[index+1];
  for(const {id,delta} of events.get(start)!){const count=(active.get(id)??0)+delta;if(count)active.set(id,count);else active.delete(id);}
  const ids=[...active.keys()].sort();
  if(!ids.length)continue;
  const key=JSON.stringify(ids);if(groups.has(key))continue;
  const exact=text.slice(start,end).replace(/\s+/g,' ').trim();
  // An overlap can consist of a separator alone; name its surrounding passage instead.
  const snippet=exact||text.slice(Math.max(0,start-35),Math.min(text.length,end+55)).replace(/\s+/g,' ').trim()||'Saved passage';
  const characters=Array.from(snippet);
  groups.set(key,{key,ids,start,end,snippet:characters.length>100?characters.slice(0,99).join('')+'…':snippet});
 }
 return [...groups.values()];
}
