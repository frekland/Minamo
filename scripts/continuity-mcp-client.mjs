import {existsSync,mkdirSync,readFileSync,renameSync,unlinkSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
/** File transport is necessary because executor processes have separate loopback namespaces. */
const root=fileURLToPath(new URL('../.continuity-lab-transport/',import.meta.url));
const payload=JSON.parse(process.argv[2]??readFileSync(0,'utf8'));
mkdirSync(root+'inbox',{recursive:true});mkdirSync(root+'outbox',{recursive:true});
const name=randomUUID()+'.json';writeFileSync(root+'inbox/'+name+'.tmp',JSON.stringify(payload));renameSync(root+'inbox/'+name+'.tmp',root+'inbox/'+name);
const start=Date.now();while(!existsSync(root+'outbox/'+name)){if(Date.now()-start>30000)throw Error('The isolated MCP harness did not respond within 30 seconds.');await new Promise(resolve=>setTimeout(resolve,50));}
const result=JSON.parse(readFileSync(root+'outbox/'+name,'utf8'));unlinkSync(root+'outbox/'+name);console.log(JSON.stringify(result.data));if(result.status!==200)process.exitCode=1;
