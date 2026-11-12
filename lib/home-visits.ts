/** Device-local navigation recency. Never store titles, Notes or learner prose. */
export type HomeVisit={family:'journey'|'article';id:string;at:string};
export const homeVisitsKey=(scope:string)=>'minamo-home-visits-v1:'+scope;
const validId=(value:unknown)=>typeof value==='string'&&value.length>0&&value.length<=160&&/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/.test(value);

export function parseHomeVisits(value:unknown):HomeVisit[]{
 if(!Array.isArray(value))return [];
 const seen=new Set<string>(),visits:HomeVisit[]=[];
 for(const item of value.slice(0,80)){
  if(!item||(item.family!=='journey'&&item.family!=='article')||!validId(item.id)||typeof item.at!=='string'||!Number.isFinite(Date.parse(item.at)))continue;
  const key=item.family+':'+item.id;
  if(seen.has(key))continue;
  seen.add(key);visits.push({family:item.family,id:item.id,at:item.at});
  if(visits.length>=24)break;
 }
 return visits.sort((a,b)=>b.at.localeCompare(a.at));
}

export function rememberHomeVisit(storage:Pick<Storage,'getItem'|'setItem'>,scope:string,family:HomeVisit['family'],id:string,now=new Date()):void{
 if(!validId(id))return;
 const key=homeVisitsKey(scope);let previous:HomeVisit[]=[];
 try{previous=parseHomeVisits(JSON.parse(storage.getItem(key)??'[]'));}catch{}
 const next=[{family,id,at:now.toISOString()},...previous.filter(item=>!(item.family===family&&item.id===id))].slice(0,24);
 storage.setItem(key,JSON.stringify(next));
}

export function readHomeVisits(storage:Pick<Storage,'getItem'>,scope:string):HomeVisit[]{
 try{return parseHomeVisits(JSON.parse(storage.getItem(homeVisitsKey(scope))??'[]'));}catch{return [];}
}

export function sortHomeRecords<T extends {family:string;id:string;updatedAt:string;title:string}>(records:T[],visits:HomeVisit[]):T[]{
 const order=new Map(visits.map((item,index)=>[item.family+':'+item.id,index]));
 return [...records].sort((a,b)=>{
  const x=order.get(a.family+':'+a.id),y=order.get(b.family+':'+b.id);
  if(x!==undefined||y!==undefined)return x===undefined?1:y===undefined?-1:x-y;
  return b.updatedAt.localeCompare(a.updatedAt)||a.title.localeCompare(b.title);
 });
}

/** Merge freshly authorised point reads with a bounded catalogue page. Device visits
 * are only candidates; they never supply a title, rendition, or access authority. */
export function mergeHomeBrowseRecords<T extends {family:string;id:string;rev:number;trashedAt?:string|null}>(page:T[],verified:T[]):T[]{
 const byIdentity=new Map<string,T>();
 for(const record of [...page,...verified]){
  if(record.trashedAt)continue;
  const key=record.family+':'+record.id,existing=byIdentity.get(key);
  if(!existing||record.rev>existing.rev)byIdentity.set(key,record);
 }
 return [...byIdentity.values()];
}
