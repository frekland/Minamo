// Dedicated terminable Worker. User input is data for RegExp or SQLite, never executable JavaScript.
function regex({code,text='',flags='gu'}) {
 if(code.length>300||text.length>12000)throw Error('Regex bounds: 300 pattern and 12,000 input characters.');
 const expression=new RegExp(code,flags.includes('g')?flags:flags+'g'),matches=[];let match;
 while(matches.length<100&&(match=expression.exec(text))){matches.push({text:match[0],utf16Start:match.index,utf16End:match.index+match[0].length,groups:match.groups??null});if(!match[0].length){const at=expression.lastIndex;expression.lastIndex=at+((expression.unicode||expression.unicodeSets)&&text.codePointAt(at)>0xffff?2:1);}}
 return {matches,truncated:matches.length===100,runtime:'JavaScript RegExp',fidelity:'Actual JavaScript RegExp in a dedicated Worker with a 10 second watchdog. At most 100 matches; UTF-16 offsets. Not PCRE or Python regex.'};
}
async function sqlite({code}) {
 importScripts('/runtime/sql-wasm.js');
 const SQL=await initSqlJs({locateFile:file=>'/runtime/'+file}),db=new SQL.Database();const rows=[];let count=0,bytes=0,truncated=false;
 try{
 for(const statement of db.iterateStatements(code)){
 const names=statement.getColumnNames(),values=[];if(!names.length){while(statement.step()){}continue;}
 while(statement.step()){
 const raw=statement.get().map(v=>v instanceof Uint8Array?'BLOB '+Array.from(v).slice(0,32).map(x=>x.toString(16).padStart(2,'0')).join(' '):v),size=new TextEncoder().encode(JSON.stringify(raw)).length;
 if(count>=200||bytes+size>50000){truncated=true;break;}values.push(raw.slice(0,100));count++;bytes+=size;
 }
 rows.push({columns:names.slice(0,100),values});if(truncated)break;
 }
 return {rows,truncated,runtime:'SQLite sql.js 1.13.0',fidelity:'Real SQLite WebAssembly in a fresh in-memory database for each execution. At most 200 rows / 50 KiB retained output; later statements may not run after truncation. Not the app D1 database, PostgreSQL or Kali.'};
 }catch(e){return {rows,error:String(e.message),runtime:'SQLite sql.js 1.13.0',fidelity:'SQLite returned an actual execution error; partial prior result sets retained.'};}finally{db.close();}
}
self.onmessage=async event=>{try{const {engine,input}=event.data;if(typeof input?.code!=='string'||input.code.length>30000)throw Error('Invalid captured code');const result=engine==='regex'?regex(input):engine==='sql'?await sqlite(input):(()=>{throw Error('Unsupported Worker engine')})();self.postMessage({result});}catch(e){self.postMessage({error:String(e.message||e)});}};
