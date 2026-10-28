import {initializeLab,readLab,saveLabNote,readFile,writeFile,LabError} from "./lab";
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
export async function labHandler(request:Request,env:Cloudflare.Env):Promise<Response> {
 const url=new URL(request.url), isMcp=url.pathname==="/mcp";
 try {
 if(!["GET","POST"].includes(request.method)) return reply({error:"Method not allowed"},405);
 if(request.headers.get("sec-fetch-site")==="cross-site") return reply({error:"Cross-site request rejected"},403);
 if(request.method==="POST" && request.headers.get("origin") && request.headers.get("origin")!==url.origin) return reply({error:"Cross-origin request rejected"},403);
 let input:any;
 if(request.method==="POST") {
 if(!request.headers.get("content-type")?.startsWith("application/json"))throw new LabError(415,"JSON content type required");
 if(Number(request.headers.get("content-length"))>20000) throw new LabError(413,"Request too large");
 const raw=await request.text();if(raw.length>20000) throw new LabError(413,"Request too large");
 try{input=JSON.parse(raw)}catch{throw new LabError(400,"Invalid JSON")}
 }
 if(isMcp) {
 if(request.method!=="POST")return reply({error:"Use JSON-RPC POST"},405);
 if(!input || input.jsonrpc!=="2.0" || typeof input.method!=="string")return reply({jsonrpc:"2.0",id:null,error:{code:-32600,message:"Invalid request"}},400);
 const result=(value:unknown)=>reply({jsonrpc:"2.0",id:input.id??null,result:value});
 if(input.method==="server/discover")return result({supportedVersions:["2026-07-28"],capabilities:{tools:{}}});
 if(input.method==="initialize")return result({protocolVersion:"2025-03-26",capabilities:{tools:{}},serverInfo:{name:"minamo-v2-synthetic-probe",version:"1.0.0"}});
 if(input.method==="tools/list")return result({tools:[{name:"get_minamo_next_probe",description:"Read only SYNTHETIC TEST ONLY foundation record from the web app data layer. Requires caller identity. No production Minamo access.",inputSchema:{type:"object",properties:{},additionalProperties:false}}]});
 if(input.method==="notifications/initialized")return new Response(null,{status:204});
 const owner=request.headers.get("oai-authenticated-user-id");
 if(!owner || !request.headers.get("oai-authenticated-user-email"))return reply({jsonrpc:"2.0",id:input.id??null,error:{code:-32001,message:"Authenticated caller identity required"}},401);
 if(input.method==="tools/call" && input.params?.name==="get_minamo_next_probe") {
 if(input.params.arguments && Object.keys(input.params.arguments).length)return result({isError:true,content:[{type:"text",text:"This probe accepts no arguments."}]});
 return result({content:[{type:"text",text:JSON.stringify({synthetic:true,...await readLab(env,owner)})}]});
 }
 return reply({jsonrpc:"2.0",id:input.id??null,error:{code:-32601,message:"Method not found"}});
 }
 const owner=request.headers.get("oai-authenticated-user-id");
 if(!owner || !request.headers.get("oai-authenticated-user-email"))return reply({error:"Sign in with ChatGPT is required."},401);
 if(url.pathname==="/api/lab/file") {
 if(request.method==="POST")return reply(await writeFile(env,owner));
 return new Response(await readFile(env,owner),{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
 if(request.method==="GET")return reply(await readLab(env,owner));
 if(input?.operation==="initialize")return reply(await initializeLab(env,owner));
 if(input?.operation==="save")return reply({note:await saveLabNote(env,owner,input)});
 return reply({error:"Unknown operation"},400);
 }catch(e){return reply({error:e instanceof LabError ? e.message : "The server could not complete the request."},e instanceof LabError?e.status:503)}
}
