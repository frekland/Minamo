import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:"export * from './lib/foreground-session.ts';",resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false});
const module={exports:{}};new Function('module','exports',built.outputFiles[0].text)(module,module.exports);const ui=module.exports;
const response=(data,status=200,principal='scope-A')=>Response.json(data,{status,headers:principal===null?{}:{'X-Minamo-Principal':principal}});
const identity={scope:'scope-A',generation:'legacy@0',role:'owner'};
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return{promise,resolve,reject};};

test('session transport failures preserve the current page and drafts, then retry without adopting another workspace',async()=>{
 let clock=0,fences=0,valid=0,calls=0;const states=[()=>Promise.resolve(response({error:'Temporary service failure'},503)),()=>Promise.reject(Error('Network offline')),()=>Promise.resolve(response(identity))];
 const monitor=ui.createSessionMonitor({expectedScope:identity.scope,expectedGeneration:identity.generation,now:()=>clock,read:()=>{calls++;return states.shift()();},onValid:()=>valid++,onFence:()=>fences++});
 assert.equal(await monitor.check(),'transient');assert.equal(fences,0);assert.equal(await monitor.check(),'skipped');clock=3000;assert.equal(await monitor.check(),'transient');assert.equal(fences,0);clock=6000;assert.equal(await monitor.check(),'valid');assert.equal(valid,1);assert.equal(fences,0);assert.equal(calls,3);assert.equal(await monitor.check(),'skipped');
});

test('focus, visibility and polling share one session request; confirmed loss fences once and late disposed results never fence',async()=>{
 let calls=0,fences=0,clock=0;const pending=deferred();const monitor=ui.createSessionMonitor({expectedScope:identity.scope,expectedGeneration:identity.generation,now:()=>clock,read:()=>{calls++;return pending.promise;},onValid:()=>{},onFence:()=>fences++});
 const first=monitor.check();assert.equal(monitor.check(),first);assert.equal(monitor.check(),first);await Promise.resolve();assert.equal(calls,1);pending.resolve(response({},401,null));assert.equal(await first,'fenced');assert.equal(await monitor.check(),'fenced');assert.equal(fences,1);
 const late=deferred(),disposed=ui.createSessionMonitor({expectedScope:identity.scope,expectedGeneration:identity.generation,read:()=>late.promise,onValid:()=>assert.fail('late identity must not publish'),onFence:()=>assert.fail('disposed session cannot redirect a new page')});const result=disposed.check();disposed.dispose();late.resolve(response({...identity,generation:'restored@1'}));assert.equal(await result,'disposed');
});

test('explicit principal/generation/auth loss fences, malformed and503 session replies remain transient',async()=>{
 for(const reply of [response(identity,200,'scope-B'),response({...identity,scope:'scope-B'}),response({...identity,generation:'restored@1'}),response({},401,null),response({},403,'scope-A'),response({code:'generation_conflict'},409),new Response('{}',{status:200,headers:{'X-Minamo-Generation':'restored@1'}})])assert.equal((await ui.sessionResponseDecision(reply,'scope-A','legacy@0')).state,'fenced');
 for(const reply of [response({},503),response({scope:'scope-A'}),new Response('<html>Unavailable</html>',{status:200})])assert.equal((await ui.sessionResponseDecision(reply,'scope-A','legacy@0')).state,'transient');
 assert.equal((await ui.sessionResponseDecision(response(identity),'scope-A','legacy@0')).state,'valid');
});

test('ordinary denied material does not discard the session; exact generation conflicts and wrong principals fence immediately',async()=>{
 assert.equal(await ui.workspaceResponseInvalidatesSession(response({error:'Material unavailable'},403),'scope-A','legacy@0'),false);
 assert.equal(await ui.workspaceResponseInvalidatesSession(response({error:'Storage offline'},503),'scope-A','legacy@0'),false);
 for(const reply of [response({},401,null),response({},403,null),response({},200,'scope-B'),response({code:'generation_conflict'},409),response({code:'principal_changed'},409)])assert.equal(await ui.workspaceResponseInvalidatesSession(reply,'scope-A','legacy@0'),true);
 const conflict=response({code:'revision_conflict'},409);assert.equal(await ui.workspaceResponseInvalidatesSession(conflict,'scope-A','legacy@0'),false);assert.deepEqual(await conflict.json(),{code:'revision_conflict'},'classification never consumes caller response body');
});

test('one foreground listener pair coalesces native event bursts, skips hidden tabs, respects cooldown and disposes cleanly',()=>{
 const target=new EventTarget(),visibilityTarget=new EventTarget();let clock=0,visible=true,next=0,calls=0;const timers=new Map();
 const coordinator=ui.createForegroundCoordinator({target,visibilityTarget,isVisible:()=>visible,now:()=>clock,setTimer:fn=>{timers.set(++next,fn);return next;},clearTimer:id=>timers.delete(id)}),unsubscribe=coordinator.subscribe(()=>calls++),flush=()=>{const pending=[...timers.values()];timers.clear();for(const run of pending)run();};
 clock=16000;target.dispatchEvent(new Event('focus'));visibilityTarget.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,1);flush();assert.equal(calls,1);
 target.dispatchEvent(new Event('focus'));flush();assert.equal(calls,1,'an immediate duplicate does not revalidate');
 visible=false;clock=32000;target.dispatchEvent(new Event('focus'));visibilityTarget.dispatchEvent(new Event('visibilitychange'));assert.equal(timers.size,0);visible=true;visibilityTarget.dispatchEvent(new Event('visibilitychange'));flush();assert.equal(calls,2);
 clock=48000;target.dispatchEvent(new Event('focus'));assert.equal(timers.size,1);unsubscribe();assert.equal(timers.size,0);target.dispatchEvent(new Event('focus'));flush();assert.equal(calls,2);
});

test('a transient material refresh retains only an exact admitted view; confirmed denial or mismatch drops it',()=>{
 for(const status of [undefined,0,408,429,500,503]){assert.equal(ui.retainContentAfterReadFailure(status,true),true);assert.equal(ui.retainContentAfterReadFailure(status,false),false);}
 for(const status of [200,400,401,403,404,409])assert.equal(ui.retainContentAfterReadFailure(status,true),false);
});

test('a stalled session read times out as unavailable, preserving the current page and allowing later revalidation',async()=>{
 let fences=0;const monitor=ui.createSessionMonitor({expectedScope:identity.scope,expectedGeneration:identity.generation,timeoutMs:5,read:signal=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('TEST ONLY stalled transport')),{once:true})),onValid:()=>assert.fail('a stalled request cannot adopt an identity'),onFence:()=>fences++});
 assert.equal(await monitor.check(),'transient');assert.equal(fences,0);assert.equal(await monitor.check(),'skipped');monitor.dispose();
});
