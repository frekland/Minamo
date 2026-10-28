import { isDomainPath } from '../lib/domain-routes';
import { domainHandler } from "../lib/domain-handler";
import { assetHandler } from "../lib/asset-handler";
import { mediaHandler } from "../lib/media-handler";
import { labHandler } from "../lib/lab-handler";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import {authorizeBeta,betaHeaders,type BetaEnv} from '../lib/beta-access';
import {betaHandler} from '../lib/beta-handler';
import {DomainError} from '../lib/domain-error';

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const path = new URL(request.url).pathname;
    if(import.meta.env.DEV&&path==='/preview-beta/api')return import('../lib/beta-preview').then(module=>module.betaPreview(request,env));
    if(!import.meta.env.DEV&&path.startsWith('/preview-'))return new Response(null,{status:404});
    if(path.startsWith('/api/beta/'))return betaHandler(request,env as BetaEnv);
    // Public immutable bundles contain no learner state. Every data/HTML path
    // passes admission, including legacy, MCP, recovery and binary surfaces.
    if(!(import.meta.env.DEV&&path.startsWith('/preview-'))&&!/^\/(?:assets\/|_next\/|favicon\.[^/]+$|(?:signin-with-chatgpt|signout-with-chatgpt|callback)$)/.test(path)){
      try{
        const principal=await authorizeBeta(request,env as BetaEnv);
        const expected=request.headers.get('X-Minamo-Workspace');
        if(expected&&expected!==principal.scope)return Response.json({code:'principal_changed',error:'The signed-in workspace changed. Reload before continuing.'},{status:409,headers:betaHeaders(principal.scope)});
        const response=await dispatch(request,env,ctx),headers=new Headers(response.headers);
        Object.entries(betaHeaders(principal.scope)).forEach(([key,value])=>headers.set(key,value));
        return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
      }catch(error){
        const status=path.startsWith('/diagnostics/')?404:error instanceof DomainError?error.status:503;
        if(path.startsWith('/api/')||path==='/mcp')return Response.json({code:error instanceof DomainError?error.code:'admission_unavailable',error:'This account cannot access this workspace.'},{status,headers:betaHeaders()});
        return new Response(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Minamo — private beta</title><style>body{font:18px system-ui;background:#17191d;color:#e3e7ed;max-width:38rem;margin:12vh auto;padding:24px}button,a{color:#8fd3e7}button{background:#252c35;border:1px solid #526573;padding:12px;border-radius:8px}p{line-height:1.6}</style><h1>Minamo private beta</h1><p>Use your own invited ChatGPT account. Your learning workspace stays separate.</p><p><a href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in</a> · <a href="/signout-with-chatgpt" target="_top">Switch account</a></p><button id="request">Request admission</button><p id="result" role="status"></p><script>document.getElementById('request').onclick=async()=>{try{const r=await fetch('/api/beta/request',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});const d=await r.json();document.getElementById('result').textContent=d.admissionCode?'Admission code: '+d.admissionCode+' — share this with the Site owner, then reload after approval.':d.error;}catch{document.getElementById('result').textContent='Admission could not be requested. Try again later.'}}</script></html>`,{status,headers:{...betaHeaders(),'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'self'"}});
      }
    }
    return dispatch(request,env,ctx);
  },
};
async function dispatch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>){
    const path = new URL(request.url).pathname;
    if(import.meta.env.DEV&&path==='/preview-interface/api')return import('../lib/interface-lab-preview').then(module=>module.interfaceLabPreviewHandler(request,env));
    if(import.meta.env.DEV&&path==='/preview-activity/api')return import('../lib/activity-preview').then(module=>module.activityPreviewHandler(request,env));
    if(import.meta.env.DEV&&path==='/preview-growth/api')return import('../lib/growth-preview').then(module=>module.growthPreviewHandler(request,env));
    if (path.startsWith('/api/assets/')) return assetHandler(request, env);
    if (path.startsWith('/api/media/')) return mediaHandler(request, env);
    if (isDomainPath(path)) return domainHandler(request, env);
    if (["/api/lab", "/api/lab/file"].includes(path)) return labHandler(request, env);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, async () => {const response=await handler.fetch(request,env,ctx);if(!response.headers.get('content-type')?.includes('text/html'))return response;const headers=new Headers(response.headers);const prior=headers.get('Content-Security-Policy');if(!prior)headers.set('Content-Security-Policy',"frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com; object-src 'none'; base-uri 'self'");return new Response(response.body,{status:response.status,statusText:response.statusText,headers});});
}

export default worker;
