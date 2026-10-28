import {DomainError} from './domain-error';
export type BetaPrincipal={id:string;role:'owner'|'learner';scope:string};
export type BetaEnv=Cloudflare.Env&{MINAMO_OWNER_ID?:string;MINAMO_SITE_HOSTS?:string;MINAMO_BETA_ENABLED?:string;MINAMO_BETA_KEY?:string};
export async function principalScope(id:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(id)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function siteIdentity(request:Request,env:BetaEnv){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
 if(!id||!email||id.length>200)throw new DomainError(401,'sign_in_required','Sign in with ChatGPT to continue.');
 const hosts=(env.MINAMO_SITE_HOSTS??'minamo.example').split(',');
 if(!hosts.includes(new URL(request.url).hostname))throw new DomainError(403,'host_denied','Open the invited Minamo Site.');
 return id;
}
export async function authorizeBeta(request:Request,env:BetaEnv):Promise<BetaPrincipal>{
 const id=siteIdentity(request,env);
 if(!env.MINAMO_OWNER_ID)throw new DomainError(503,'admission_unconfigured','Minamo admission is not configured.');
 const scope=await principalScope(id);
 if(id===env.MINAMO_OWNER_ID)return {id,role:'owner',scope};
 if(env.MINAMO_BETA_ENABLED!=='1')throw new DomainError(403,'invite_required','This account is not admitted to the private beta.');
 let row:{state:string}|null=null;
 try{row=await env.DB!.prepare('SELECT state FROM v2_beta_members WHERE principal=?').bind(id).first();}catch{}
 if(row?.state!=='accepted')throw new DomainError(403,'invite_required','This account is not admitted to the private beta.');
 return {id,role:'learner',scope};
}
export function betaHeaders(scope?:string){return {'Cache-Control':'private, no-store','Vary':'oai-authenticated-user-id','X-Content-Type-Options':'nosniff',...(scope?{'X-Minamo-Principal':scope}:{})};}
export function assertBetaOrigin(request:Request){if(request.headers.get('sec-fetch-site')==='cross-site'||request.method!=='GET'&&request.headers.get('origin')!==new URL(request.url).origin)throw new DomainError(403,'origin_rejected','Use this Minamo page to make the change.');}
