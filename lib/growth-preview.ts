import {domainHandler} from './domain-handler';
import {readRecord} from './domain';
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
const owner='TEST-ONLY-growth-browser-principal';
let initialized:Promise<void>|undefined;
const allowed=new Set(['/api/commands','/api/context','/api/operations','/api/workspace','/api/learning-context','/mcp']);
async function forward(env:Cloudflare.Env,url:URL,path:string,method:string,body?:string){const target=new URL(path,url);const headers={'oai-authenticated-user-id':owner,'oai-authenticated-user-email':'synthetic@example.invalid','content-type':'application/json','x-minamo-generation':'legacy@0'};return domainHandler(new Request(target,{method,headers,...(body?{body}:{})}),env);}
async function initialize(env:Cloudflare.Env,url:URL){
 if(!env.DB)throw Error('Local preview D1 is unavailable.');
 // All source migrations are CREATE statements. IF NOT EXISTS also supports an already migrated local preview.
 for(const migration of [migration0,migration1,migration2,migration3,migration4,migration5,migration6,migration7,migration8,migration9,migration10])for(const statement of migration.split('--> statement-breakpoint').filter(sql=>sql.trim()))await env.DB.prepare(statement.replace(/CREATE (UNIQUE )?(TABLE|INDEX|TRIGGER) (?!IF NOT EXISTS )/g,'CREATE $1$2 IF NOT EXISTS ')).run();
 if(!await readRecord(env,owner,'investigation','TEST-ONLY-growth-question')){
  const response=await forward(env,url,'/api/commands','POST',JSON.stringify({expectedGeneration:'legacy@0',operationId:'TEST-ONLY-growth-question-create',action:'create',family:'investigation',id:'TEST-ONLY-growth-question',data:{title:'TEST ONLY queue shutdown boundary',body:'External terminal work remains reported evidence. What happens when retry overlaps shutdown?',synthetic:true,learningShape:{version:2,kind:'investigation',question:'Does retry race with shutdown?'}}}));if(!response.ok)throw Error('Synthetic investigation creation failed.');
 }
 if(!await readRecord(env,owner,'note','TEST-ONLY-growth-browser-note')){
  const response=await forward(env,url,'/api/commands','POST',JSON.stringify({expectedGeneration:'legacy@0',operationId:'TEST-ONLY-growth-note-create',action:'create',family:'note',id:'TEST-ONLY-growth-browser-note',data:{title:'TEST ONLY browser terminal attempt',body:'Prediction: the local request should return 200.\n\nObservation and interpretation remain to be written after inspecting my output.',bodyFormat:'markdown-v1',links:[{family:'investigation',id:'TEST-ONLY-growth-question',relation:'supports'}],synthetic:true}}));if(!response.ok)throw Error('Synthetic Note creation failed.');
 }
}
/** Explicit development-only synthetic proxy. This code never supplies identity to the production API. */
export async function growthPreviewHandler(request:Request,env:Cloudflare.Env){
 if(!import.meta.env.DEV)return new Response('Not found',{status:404});
 const url=new URL(request.url);if(!['GET','POST'].includes(request.method))return new Response('Method not allowed',{status:405});
 if(request.headers.get('sec-fetch-site')==='cross-site'||request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return new Response('Origin rejected',{status:403});
 try{if(!initialized)initialized=initialize(env,url).catch(error=>{initialized=undefined;throw error});await initialized;const path=url.searchParams.get('path')??'/api/context?'+new URLSearchParams({family:'note',id:'TEST-ONLY-growth-browser-note'});const target=new URL(path,url);if(!allowed.has(target.pathname)||target.origin!==url.origin)return Response.json({error:'Unsupported synthetic preview path'},{status:400});const body=request.method==='POST'?await request.text():undefined;if(body&&body.length>220000)return Response.json({error:'Preview payload exceeds 220000 characters.'},{status:413});return forward(env,url,target.pathname+target.search,request.method,body);}catch(error){return Response.json({error:(error as Error).message,synthetic:true},{status:503});}
}
