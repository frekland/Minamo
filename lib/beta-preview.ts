import {betaHandler} from './beta-handler';
import type {BetaEnv} from './beta-access';
/** Local preview only. Never an authentication substitute or hosted acceptance. */
export async function betaPreview(request:Request,env:Cloudflare.Env){
 const url=new URL(request.url),path=url.searchParams.get('path')??'/api/beta/session';
 if(!path.startsWith('/api/beta/')||path.includes('?'))return new Response(null,{status:404});
 const local={...env,MINAMO_OWNER_ID:'TEST-ONLY-beta-browser',MINAMO_SITE_HOSTS:url.hostname,MINAMO_BETA_ENABLED:'1',MINAMO_BETA_KEY:'local-preview-only'} as BetaEnv;
 const headers=new Headers(request.headers);headers.set('oai-authenticated-user-id','TEST-ONLY-beta-browser');headers.set('oai-authenticated-user-email','synthetic@example.invalid');headers.set('Origin',url.origin);
 await betaHandler(new Request(new URL('/api/beta/initialize',url),{method:'POST',headers:new Headers({...Object.fromEntries(headers),'Content-Type':'application/json'}),body:'{}'}),local);
 return betaHandler(new Request(new URL(path,url),{method:request.method,headers,...(request.method==='POST'?{body:request.body,duplex:'half'} as any:{})}),local);
}
