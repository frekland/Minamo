import {createServer} from 'node:http';
import {mkdirSync,writeFileSync,readdirSync,readFileSync,unlinkSync,renameSync} from 'node:fs';
import {resolve} from 'node:path';
import {privateStorageFixture} from '../tests/private-storage-fixture.mjs';
import {seedJourneyResume} from '../tests/journey-resume-fixture.mjs';
/** Isolated local D1/R2 and the actual compiled MCP adapter. No hosted identity or data. */
const fixture=await privateStorageFixture("import {domainHandler} from './lib/domain-handler.ts';export default {fetch:domainHandler}");
const client=fixture.client('TEST-ONLY-cold-start-independent');
await seedJourneyResume(client);
if(process.argv.includes('--ambiguous')){const competing=await client.command({action:'create',family:'journey',id:'TEST-ONLY-competing-queue-project',data:{title:'TEST ONLY alternate queue project',body:'An independent synthetic project; keep its work separate.',synthetic:true}});if(competing.status!==200)throw Error(JSON.stringify(competing.data));}
const trace=[];
const out=new URL('../docs/journey-growth-commission/'+(process.argv.includes('--ambiguous')?'cold-start-tool-trace-ambiguous.json':'cold-start-tool-trace-primary.json'),import.meta.url);
mkdirSync(new URL('../docs/journey-growth-commission/',import.meta.url),{recursive:true});
const writeTrace=()=>writeFileSync(out,JSON.stringify({synthetic:true,hosted:false,adapter:'actual compiled domainHandler in isolated Miniflare D1/R2',events:trace},null,2)+'\n');
const readTools=new Set(['get_minamo_learning_context','get_minamo_context','get_minamo_workspace','read_minamo_record','query_minamo_records','query_minamo_library','read_minamo_operation']);
const dispatch=async payload=>{
 if(payload.method==='tools/call'&&!readTools.has(payload.params?.name))return {status:403,data:{error:'This synthetic continuation harness is read-only.'}};
 if(!['tools/list','tools/call','initialize','server/discover','notifications/initialized'].includes(payload.method))return {status:400,data:{error:'Unsupported MCP method.'}};
 const result=await client.request('/mcp',payload);
 trace.push({at:new Date().toISOString(),method:payload.method,...(payload.params?.name?{tool:payload.params.name,arguments:payload.params.arguments}:{}),status:result.status,responseBytes:Buffer.byteLength(JSON.stringify(result.data))});writeTrace();return result;
};
const transport=resolve('.continuity-lab-transport');mkdirSync(transport+'/inbox',{recursive:true});mkdirSync(transport+'/outbox',{recursive:true});
let busy=false;const transportTimer=setInterval(async()=>{if(busy)return;busy=true;try{for(const filename of readdirSync(transport+'/inbox').filter(name=>name.endsWith('.json'))){let result;try{const raw=readFileSync(transport+'/inbox/'+filename,'utf8');if(raw.length>220000)throw Error('Request too large');result=await dispatch(JSON.parse(raw));}catch(error){result={status:400,data:{error:String(error)}};}writeFileSync(transport+'/outbox/'+filename+'.tmp',JSON.stringify(result));renameSync(transport+'/outbox/'+filename+'.tmp',transport+'/outbox/'+filename);unlinkSync(transport+'/inbox/'+filename);}}finally{busy=false;}},50);
const server=createServer(async(request,response)=>{
 try{
  if(request.method!=='POST'||request.url!=='/mcp'){response.writeHead(404);response.end();return;}
  let raw='';for await(const chunk of request){raw+=chunk;if(raw.length>220000)throw Error('Request too large');}
  const result=await dispatch(JSON.parse(raw));response.writeHead(result.status,{'content-type':'application/json'});response.end(JSON.stringify(result.data));
 }catch(error){response.writeHead(400,{'content-type':'application/json'});response.end(JSON.stringify({error:String(error)}));}
});
server.listen(0,'127.0.0.1',()=>console.log(JSON.stringify({endpoint:'http://127.0.0.1:'+server.address().port+'/mcp',readOnly:true,synthetic:true})));
async function finish(){server.close();clearInterval(transportTimer);writeTrace();await fixture.dispose();process.exit(0);}
process.on('SIGTERM',finish);process.on('SIGINT',finish);
