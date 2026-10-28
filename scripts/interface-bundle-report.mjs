import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {gzipSync} from 'node:zlib';
const roots=process.argv.slice(2);if(!roots.length)throw Error('Pass one or two completed dist/client directories.');
function inspect(root){
 root=resolve(root);const manifest=JSON.parse(readFileSync(resolve(root,'.vite/manifest.json'),'utf8'));
 function closure(entries){const visited=new Set(),files=new Set();function visit(key){if(visited.has(key))return;visited.add(key);const item=manifest[key];if(!item)throw Error('Manifest reference missing: '+key);files.add(item.file);for(const css of item.css??[])files.add(css);for(const imported of item.imports??[])visit(imported);}entries.filter(key=>manifest[key]).forEach(visit);const sizes=[...files].sort().map(file=>{const data=readFileSync(resolve(root,file));return{file,bytes:data.length,gzipBytes:gzipSync(data).length};});return{files:sizes.length,bytes:sizes.reduce((n,f)=>n+f.bytes,0),gzipBytes:sizes.reduce((n,f)=>n+f.gzipBytes,0),paths:sizes.map(f=>f.file)};}
 const defaultEager=closure(['virtual:vinext-app-browser-entry','app/workspace.tsx']),activity=closure(['app/activity-studio.tsx']),atlas=closure(['app/learning-atlas.tsx']);
 const all=[...new Set(Object.values(manifest).flatMap(value=>[value.file,...(value.css??[])]))];
 return{root,method:'Union of app browser entry + Workspace static import/CSS closures. Dynamic imports excluded; emitted transfer estimate, not network timing/INP.',defaultEager,activity,atlas,allEmittedBytes:all.reduce((n,file)=>n+statSync(resolve(root,file)).size,0),heavyInDefault:defaultEager.paths.filter(path=>/tldraw|pyodide|three|learning-atlas|activity-studio|foundry-python|interface-view-/.test(path))};
}
const reports=roots.map(inspect),delta=reports.length===2?{eagerBytes:reports[1].defaultEager.bytes-reports[0].defaultEager.bytes,eagerGzipBytes:reports[1].defaultEager.gzipBytes-reports[0].defaultEager.gzipBytes,eagerGzipPercent:100*(reports[1].defaultEager.gzipBytes/reports[0].defaultEager.gzipBytes-1)}:undefined;
console.log(JSON.stringify({reports,delta},null,2));
