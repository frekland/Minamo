/** Device-local display state only; never Activity evidence or a Notes draft. */
export function readWorkbenchFiles(raw:string|null):Record<string,string>{
 if(!raw||raw.length>12000)return {};
 try{const value=JSON.parse(raw);if(!value||typeof value!=='object'||Array.isArray(value))return {};const result:Record<string,string>={};for(const [key,path] of Object.entries(value).slice(0,24)){if(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,63}$/.test(key)&&typeof path==='string'&&path.length<=300&&path.isWellFormed())Object.defineProperty(result,key,{value:path,enumerable:true,writable:true,configurable:true});}return result;}catch{return {};}
}
export function retainWorkbenchFiles(current:Record<string,string>,blockId:string,path:string):Record<string,string>{
 return readWorkbenchFiles(JSON.stringify({...current,[blockId]:path}));
}
export type WorkbenchView={selected:'task'|'source'|'explore'|'guidance'|'evidence'|'supporting'|null;expanded:boolean};
export function readWorkbenchView(raw:string|null):WorkbenchView{
 const empty:WorkbenchView={selected:null,expanded:false};if(!raw||raw.length>200)return empty;
 try{const value=JSON.parse(raw);return {selected:['task','source','explore','guidance','evidence','supporting'].includes(value?.selected)?value.selected:null,expanded:value?.expanded===true};}catch{return empty;}
}
