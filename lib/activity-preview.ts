import {domainHandler} from './domain-handler';
import {readRecord} from './domain';
import {generateChallenge,challengeCartridgeBlocks} from './challenge-exchange/generators';
import migration0 from '../drizzle/0000_narrow_forge.sql?raw';
import migration1 from '../drizzle/0001_omniscient_freak.sql?raw';
import migration2 from '../drizzle/0002_mean_fenris.sql?raw';
import migration3 from '../drizzle/0003_complex_ben_parker.sql?raw';
import migration4 from '../drizzle/0004_adorable_red_skull.sql?raw';
import migration5 from '../drizzle/0005_pale_young_avengers.sql?raw';
import migration6 from '../drizzle/0006_serious_korvac.sql?raw';
import migration7 from '../drizzle/0007_manuscript_editions.sql?raw';
import migration8 from '../drizzle/0008_learning_continuity.sql?raw';
import migration9 from '../drizzle/0009_learning_spaces.sql?raw';
import migration10 from '../drizzle/0010_asset_deletions.sql?raw';
const owner='TEST-ONLY-activity-browser';
let ready:Promise<void>|undefined;
function localEnv(env:Cloudflare.Env){return {...env,MINAMO_ACTIVITY_STUDIO:'1',MINAMO_LEARNING_ATLAS:'1'};}
async function forward(env:Cloudflare.Env,url:URL,path:string,method:string,body?:string){return domainHandler(new Request(new URL(path,url),{method,headers:{'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid','content-type':'application/json','x-minamo-generation':'legacy@0'},...(body?{body}:{})}),localEnv(env));}
async function init(env:Cloudflare.Env,url:URL){
 if(!env.DB)throw Error('Local preview D1 unavailable.');
 for(const migration of [migration0,migration1,migration2,migration3,migration4,migration5,migration6,migration7,migration8,migration9,migration10])for(const statement of migration.split('--> statement-breakpoint').filter(s=>s.trim()))await env.DB.prepare(statement.replace(/CREATE (UNIQUE )?(TABLE|INDEX|TRIGGER) (?!IF NOT EXISTS )/g,'CREATE $1$2 IF NOT EXISTS ')).run();
 const commands=[
  {family:'investigation',id:'TEST-ONLY-stream-question',data:{title:'TEST ONLY · Where does a TCP message end?',body:'Compare finite EOF framing with a persistent connection. Keep contradictory evidence visible.',synthetic:true}},
  {family:'article',id:'TEST-ONLY-stream-reference',data:{title:'TEST ONLY · Bytes, chunks and boundaries',body:'TCP transports an ordered stream. A receive call can return fewer bytes than the complete application message.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-stream-question',relation:'explains',reason:'A byte stream has no implicit application message boundary.'}],sections:[{id:'boundary',title:'A chunk is not a message',parts:[{id:'stream',kind:'paragraph',text:'A receive call returns currently available bytes, subject to its maximum. Application framing defines the message boundary.'}]}]}},
  {family:'journey',id:'TEST-ONLY-stream-journey',data:{title:'TEST ONLY · Network detective',body:'Build a correct stream reader, inspect evidence, and retain the next question.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-stream-question',relation:'supports',reason:'Investigate the protocol boundary.'},{family:'article',id:'TEST-ONLY-stream-reference',relation:'related'}]}},
  {family:'note',id:'TEST-ONLY-stream-note',data:{title:'TEST ONLY · Latest intention after checkpoint',body:'I want to investigate persistent connections next. The finite EOF exercise does not establish that approach for every protocol.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-stream-question',relation:'supports'},{family:'journey',id:'TEST-ONLY-stream-journey',relation:'related'}]}},
 ];
 for(const c of commands)if(!await readRecord(localEnv(env),owner,c.family as 'article',c.id)){const r=await forward(env,url,'/api/commands','POST',JSON.stringify({operationId:c.id+'-create',action:'create',...c}));if(!r.ok)throw Error(await r.text());}
 if(!await readRecord(localEnv(env),owner,'experiment','TEST-ONLY-tcp-activity')){
  const {project,template}=await generateChallenge('tcp-chunks');
  const request={purpose:'Publish an original synthetic Activity through the actual MCP endpoint for local browser acceptance.',operationId:'TEST-ONLY-tcp-publish',id:'TEST-ONLY-tcp-activity',title:'TEST ONLY · The fragmented message',body:'A real deliberately buggy project. Inspect, predict, test locally, return with evidence.',synthetic:true,links:[{family:'investigation',id:'TEST-ONLY-stream-question',relation:'applies'},{family:'journey',id:'TEST-ONLY-stream-journey',relation:'related'}],activity:{contract:'minamo.activity.v1',template:'debugging',authorship:'original-exercise',intent:template.intent,blocks:challengeCartridgeBlocks(template,project)}};
  const r=await forward(env,url,'/mcp','POST',JSON.stringify({jsonrpc:'2.0',id:'TEST-ONLY-publish',method:'tools/call',params:{name:'publish_minamo_activity_package',arguments:request}}));const envelope=await r.json() as {result?:{isError?:boolean;content?:unknown};error?:unknown};if(!r.ok||envelope.error||envelope.result?.isError)throw Error(JSON.stringify(envelope));
 }
}
/** Dedicated DEV-only proxy: no real identity, no production registration, no arbitrary target URLs. */
export async function activityPreviewHandler(request:Request,env:Cloudflare.Env){
 if(!import.meta.env.DEV)return new Response('Not found',{status:404});
 const url=new URL(request.url);if(!['GET','POST'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403});
 try{
  if(!ready)ready=init(env,url).catch(e=>{ready=undefined;throw e;});await ready;
  const target=new URL(url.searchParams.get('path')??'/api/workspace',url);
  const allowed=target.origin===url.origin&&(target.pathname.startsWith('/api/activities/')||['/mcp','/api/commands','/api/context','/api/operations','/api/workspace','/api/learning-graph','/api/bookmarks','/api/learning-context'].includes(target.pathname));
  if(!allowed)return Response.json({error:'Unsupported isolated preview target.'},{status:400});
  const body=request.method==='POST'?await request.text():undefined;if(body&&new TextEncoder().encode(body).length>220000)return Response.json({error:'Payload too large.'},{status:413});
  return forward(env,url,target.pathname+target.search,request.method,body);
 }catch(error){return Response.json({error:(error as Error).message,synthetic:true},{status:503});}
}
