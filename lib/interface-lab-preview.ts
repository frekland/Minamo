import {domainHandler} from './domain-handler';
import {readRecord} from './domain';
import {INTERFACE_LAB_BASE_RECORDS,INTERFACE_LAB_READING,INTERFACE_LAB_DATA_REVISION,interfaceLabDataIsCurrent,interfaceLabPublications} from './interface-lab-fixtures';
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
const owner='TEST-ONLY-interface-browser';
// A Worker request owns its pending D1 work. Never hand another request
// an in-flight initialization promise that can be cancelled with its origin.
let initialized=false;
function localEnv(env:Cloudflare.Env){return {...env,MINAMO_ACTIVITY_STUDIO:'1',MINAMO_LEARNING_ATLAS:'1'};}
async function forward(env:Cloudflare.Env,url:URL,path:string,method:string,body?:string){return domainHandler(new Request(new URL(path,url),{method,headers:{'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid','content-type':'application/json','x-minamo-generation':'legacy@0'},...(body?{body}:{})}),localEnv(env));}
async function init(env:Cloudflare.Env,url:URL){
 if(!env.DB)throw Error('Local preview D1 unavailable.');
 for(const migration of [migration0,migration1,migration2,migration3,migration4,migration5,migration6,migration7,migration8,migration9,migration10])for(const statement of migration.split('--> statement-breakpoint').filter(s=>s.trim()))await env.DB.prepare(statement.replace(/CREATE (UNIQUE )?(TABLE|INDEX|TRIGGER) (?!IF NOT EXISTS )/g,'CREATE $1$2 IF NOT EXISTS ')).run();
 for(const record of INTERFACE_LAB_BASE_RECORDS)if(!await readRecord(localEnv(env),owner,record.family,record.id)){const result=await forward(env,url,'/api/commands','POST',JSON.stringify({operationId:record.id+'-create',action:'create',...record}));if(!result.ok)throw Error(await result.text());}
 const reading=await readRecord(localEnv(env),owner,'article',INTERFACE_LAB_READING.id);if(!reading?.rendition)throw Error('Canonical lab content is unavailable.');
 for(const publication of await interfaceLabPublications(reading.rendition)){
  const existing=await readRecord(localEnv(env),owner,'experiment',publication.id),dataUpgrade=publication.id==='TEST-ONLY-interface-data'&&!interfaceLabDataIsCurrent(existing?.activity,publication.activity);if(existing?.activity?.presentation?.pattern===publication.activity.presentation.pattern&&!dataUpgrade)continue;
  const input=existing?{...publication,operationId:publication.operationId+'-'+(dataUpgrade?INTERFACE_LAB_DATA_REVISION:'presentation-v1'),expectedRev:existing.rev}:publication;
  const result=await forward(env,url,'/mcp','POST',JSON.stringify({jsonrpc:'2.0',id:publication.id,method:'tools/call',params:{name:'publish_minamo_activity_package',arguments:input}}));const envelope=await result.json() as {result?:{isError?:boolean;content?:unknown};error?:unknown};if(!result.ok||envelope.error||envelope.result?.isError)throw Error(JSON.stringify(envelope));
 }
}
/** Isolated local D1/MCP fixture owner. No real identity, external target or production registration. */
export async function interfaceLabPreviewHandler(request:Request,env:Cloudflare.Env){
 if(!import.meta.env.DEV)return new Response('Not found',{status:404});
 const url=new URL(request.url);if(!['GET','POST'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403});
 try{
  if(!initialized){await init(env,url);initialized=true;}
  const target=new URL(url.searchParams.get('path')??'/api/workspace',url);
  if(target.origin!==url.origin||!target.pathname.startsWith('/api/activities/')&&!['/mcp','/api/commands','/api/context','/api/operations','/api/workspace','/api/learning-graph','/api/bookmarks','/api/learning-context','/api/query','/api/library'].includes(target.pathname))return Response.json({error:'Unsupported isolated laboratory target.'},{status:400});
  const body=request.method==='POST'?await request.text():undefined;if(body&&new TextEncoder().encode(body).length>220000)return Response.json({error:'Payload too large.'},{status:413});
  return forward(env,url,target.pathname+target.search,request.method,body);
 }catch(error){return Response.json({error:(error as Error).message,synthetic:true},{status:503});}
}
