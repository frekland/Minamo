import {authorizeBeta,siteIdentity,principalScope,betaHeaders,assertBetaOrigin,type BetaEnv} from './beta-access';
import {DomainError} from './domain-error';
import {validateLearningScope} from './learning-spaces';
import {resolveGeneration,withGeneration,requireGeneration} from './generations';
import {previewManuscript,publishManuscript} from './manuscript';
import {readWorkspace,queryRecords,readContext,readRecord,operationStatus} from './domain';
import {buildRecordLink} from './reading-links';
import {sealProposal,openProposal} from './beta-proposal';
import {starterManuscript} from './beta-starter';
async function body(request:Request){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new DomainError(415,'json_required','Use JSON.');const reader=request.body?.getReader();let bytes=0;const chunks:Uint8Array[]=[];if(reader)while(true){const next=await reader.read();if(next.done)break;bytes+=next.value.length;if(bytes>600000){await reader.cancel();throw new DomainError(413,'too_large','Use a smaller proposal.');}chunks.push(next.value);}const joined=new Uint8Array(bytes);let at=0;for(const chunk of chunks){joined.set(chunk,at);at+=chunk.length;}try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined));}catch{throw new DomainError(400,'invalid_json','Use valid JSON.');}}
function shape(input:any,keys:string[]){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!keys.includes(k)))throw new DomainError(400,'invalid_input','Unexpected input fields.');}
function text(value:any,max:number){if(typeof value!=='string'||!value.trim()||value.length>max)throw new DomainError(400,'invalid_input','Use bounded, nonempty text.');return value.trim();}
/** A saved link must carry the record's own space, not a previous browser preference. */
async function receiptLinks(env:Cloudflare.Env,owner:string,receipt:any){
 if(!receipt)return receipt;
 const refs=receipt.records??receipt.recordRefs??[];
 const linked=await Promise.all(refs.map(async(ref:any)=>{const record=await readRecord(env,owner,ref.family,ref.id);if(!record)return ref;const url=new URL(ref.href??buildRecordLink(record,{rendition:ref.rendition??record.rendition}),'https://minamo.invalid');const spaces=record.learningScope?.spaces;url.searchParams.set('learningSpace',spaces?.length===1?spaces[0]:'all');const languages=record.learningScope?.languages;if(spaces?.includes('languages')&&languages?.length===1)url.searchParams.set('language',languages[0]);else url.searchParams.delete('language');return {...ref,href:url.pathname+url.search+url.hash};}));
 return {...receipt,records:linked,...(receipt.recordRefs?{recordRefs:linked}:{})};
}
export async function betaHandler(request:Request,env:BetaEnv):Promise<Response>{
 let scope:string|undefined;
 const respond=(value:unknown,status=200)=>Response.json(value,{status,headers:betaHeaders(scope)});
 try{
  assertBetaOrigin(request);const path=new URL(request.url).pathname;
  if(!['GET','POST'].includes(request.method))throw new DomainError(405,'method_denied','Use GET or POST.');
  if(path==='/api/beta/request'&&request.method==='POST'){
   const id=siteIdentity(request,env);scope=await principalScope(id);
   if(env.MINAMO_BETA_ENABLED!=='1')throw new DomainError(403,'beta_closed','Beta admission is closed.');
   const input=await body(request);shape(input,[]);const code=scope.slice(0,16),now=new Date().toISOString();
   await env.DB!.prepare("INSERT INTO v2_beta_members(principal,code,state,created_at,updated_at) VALUES(?,?,'invited',?,?) ON CONFLICT(principal) DO NOTHING").bind(id,code,now,now).run();
   return respond({admissionCode:code,message:'Give this admission code to the Site owner. A revoked invitation cannot request admission again.'});
  }
  const principal=await authorizeBeta(request,env);scope=principal.scope;
  if(request.headers.get('X-Minamo-Workspace')&&request.headers.get('X-Minamo-Workspace')!==scope)throw new DomainError(409,'principal_changed','The signed-in workspace changed. Reload before continuing.');
  if(path==='/api/beta/initialize'&&request.method==='POST'){
   if(principal.role!=='owner')throw new DomainError(403,'owner_required','Owner access required.');shape(await body(request),[]);
   await env.DB!.prepare('SELECT code FROM v2_beta_members LIMIT 1').all();return respond({ready:true});
  }
  const generation=await resolveGeneration(env,principal.id),scoped=withGeneration(env,generation),owner=generation.namespace;
  if(path==='/api/beta/session'&&request.method==='GET')return respond({scope,role:principal.role,generation:generation.generation});
  if(request.headers.has('X-Minamo-Generation'))requireGeneration(generation,request.headers.get('X-Minamo-Generation'));
  if(path==='/api/beta/members'){
   if(principal.role!=='owner')throw new DomainError(403,'owner_required','Owner access required.');
   if(request.method==='GET')return respond({members:(await env.DB!.prepare('SELECT code,state,created_at,updated_at FROM v2_beta_members ORDER BY created_at DESC LIMIT 50').all()).results});
   const input=await body(request);shape(input,['code','state']);if(!['accepted','revoked'].includes(input.state))throw new DomainError(400,'invalid_state','Choose accepted or revoked.');
   await env.DB!.prepare('UPDATE v2_beta_members SET state=?,updated_at=?,admin=? WHERE code=? AND principal<>?').bind(input.state,new Date().toISOString(),principal.id,text(input.code,16),principal.id).run();return respond({updated:true});
  }
  if(path==='/api/beta/feedback'){
   if(request.method==='GET'){if(principal.role!=='owner')throw new DomainError(403,'owner_required','Owner access required.');return respond({feedback:(await env.DB!.prepare('SELECT id,kind,body,route,state,created_at FROM v2_beta_feedback ORDER BY created_at DESC LIMIT 50').all()).results});}
   const input=await body(request);shape(input,['id','kind','body','route','state']);
   if(input.state!==undefined){if(principal.role!=='owner')throw new DomainError(403,'owner_required','Owner access required.');if(!['triaged','resolved','delete'].includes(input.state))throw new DomainError(400,'invalid_state','Invalid triage state.');const id=text(input.id,200);await (input.state==='delete'?env.DB!.prepare('DELETE FROM v2_beta_feedback WHERE id=?').bind(id):env.DB!.prepare('UPDATE v2_beta_feedback SET state=? WHERE id=?').bind(input.state,id)).run();return respond({updated:true});}
   if(!['confusing','broken','feature','praise'].includes(input.kind))throw new DomainError(400,'invalid_kind','Choose a feedback type.');
   const route=input.route===undefined?null:text(input.route,200);if(route&&(!route.startsWith('/')||/[?#]/.test(route)))throw new DomainError(400,'invalid_route','Share only a route without record identifiers.');
   const id=text(input.id,80),message=text(input.body,4000);await env.DB!.prepare('INSERT INTO v2_beta_feedback(id,principal,kind,body,route,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(principal.scope+':'+id,principal.id,input.kind,message,route,new Date().toISOString()).run();return respond({submitted:true});
  }
  if(path==='/api/beta/read'&&request.method==='POST'){
   const input=await body(request);shape(input,['kind','query','family','id','rendition']);
   if(input.kind==='workspace'){const data=await readWorkspace(scoped,owner,{limit:12});return respond({records:data.records.filter(r=>['journey','investigation','article'].includes(r.family)).map(({family,id,title,rev,rendition})=>({family,id,title,rev,rendition})),generation:generation.generation});}
   if(input.kind==='search'){const data=await queryRecords(scoped,owner,{family:'article',query:text(input.query,160),limit:8});return respond({records:data.records.map(({family,id,title,rev,rendition})=>({family,id,title,rev,rendition})),truncated:data.truncated});}
   if(input.kind==='record'){if(!['article','journey','investigation'].includes(input.family))throw new DomainError(400,'invalid_family','Read an Article, Journey or Investigation.');const result=await readContext(scoped,owner,input.family,text(input.id,160),input.rendition);return respond({record:result.record});}
   throw new DomainError(400,'invalid_kind','Choose a supported read.');
  }
  if(path==='/api/beta/preview'&&request.method==='POST'){
   const input=await body(request);shape(input,['role','markdown','learningSpace','language','starter','expectedGeneration']);requireGeneration(generation,input.expectedGeneration);
   const starter=input.starter===true;if(!starter&&!['article','journey','investigation'].includes(input.role))throw new DomainError(400,'invalid_role','Choose Article, Journey or Investigation.');
   if(!['computing','languages'].includes(input.learningSpace))throw new DomainError(400,'invalid_space','Choose Computing or Languages.');
   const learningScope=validateLearningScope({version:1,spaces:[input.learningSpace],provenance:'authored',...(input.learningSpace==='languages'?{languages:[input.language??'ja']}:{})});
   const operationId=starter?'beta-starter-v1':'beta-import-'+crypto.randomUUID();
   if(starter){const receipt=await operationStatus(scoped,owner,operationId);if(receipt?.status==='committed')return respond({alreadyImported:await receiptLinks(scoped,owner,receipt)});}
   const payload={purpose:starter?'Learner explicitly imports the original Minamo orientation templates.':'Learner reviews GPT-authored editorial material; no observed learning is asserted.',operationId,expectedGeneration:generation.generation,manuscript:starter?starterManuscript(learningScope):{version:1,brief:'Create a reusable explanation or proposed learning route from learner-selected Markdown; no achievement claimed.',documents:[{key:'gpt-draft',role:input.role,markdown:text(input.markdown,100000),learningScope}]}};
   const preview=await previewManuscript(scoped,owner,{...payload,detail:true},'user');
   const {token,expires}=await sealProposal(env,principal.id,generation.generation,payload);
   return respond({token,expires,preview,manuscript:payload.manuscript,notice:'Proposal only. Review in Minamo and confirm before publication.'});
  }
  if(path==='/api/beta/status'&&request.method==='POST'){
   const input=await body(request);shape(input,['token','expectedGeneration']);requireGeneration(generation,input.expectedGeneration);
   const payload=await openProposal(env,principal.id,generation.generation,text(input.token,300000),true);
   const result=await receiptLinks(scoped,owner,await operationStatus(scoped,owner,payload.operationId));return respond({result,status:result?.status??'unknown'});
  }
  if(path==='/api/beta/publish'&&request.method==='POST'){
   const input=await body(request);shape(input,['token','expectedGeneration']);requireGeneration(generation,input.expectedGeneration);
   const payload=await openProposal(env,principal.id,generation.generation,text(input.token,300000));
   const result=await receiptLinks(scoped,owner,await publishManuscript(scoped,owner,payload,'user'));return respond({result,generation:generation.generation});
  }
  throw new DomainError(404,'not_found','This beta action is unavailable.');
 }catch(error){return respond({code:error instanceof DomainError?error.code:'beta_unavailable',error:error instanceof DomainError?error.message:'This beta action could not complete. Keep your draft and retry the same save.'},error instanceof DomainError?error.status:503);}
}
