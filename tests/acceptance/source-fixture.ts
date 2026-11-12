/** Original synthetic acceptance material. Imported only by the external QA overlay. */
import type {WorkspaceRecord} from '../../lib/contracts';
type Send=(path:string,data?:unknown)=>Promise<Response>;
export const qaSourceId='TEST-ONLY-ml-source';
export const qaExcerptId='TEST-ONLY-ml-excerpt';
export async function seedSourceFixture(send:Send){
 const text='TEST ONLY owned excerpt: A🧠 café packet reaches the listener, while end-of-input and connection shutdown remain separate events.';
 const read=await send('/api/context?family=source&id='+qaSourceId);
 let source:WorkspaceRecord;
 if(read.ok){source=(await read.json() as {record:WorkspaceRecord}).record}
 else{
  const response=await send('/api/commands',{operationId:'TEST-ONLY-layout-source-admission',action:'create',family:'source',id:qaSourceId,data:{title:'TEST ONLY original Source — packet lifecycle',body:'Independent original context for a synthetic acceptance Source.',synthetic:true,source:{url:'https://example.invalid/minamo-owned-fixture',attribution:'Original synthetic acceptance author',rights:'permitted-excerpt',excerpt:{id:'TEST-ONLY-owned-excerpt',text,locator:'Original synthetic paragraph1',edition:'Fixture edition1',basis:'owner-authored',permissionNote:'The fixture author owns this original synthetic text; no third-party excerpt is included.',ownerAttested:true,state:'permitted',exportAllowed:true}}}});
  if(!response.ok)throw Error('QA Source admission failed: '+await response.text());
  source=(await response.json() as {record:WorkspaceRecord}).record;
 }
 const article=await send('/api/context?family=article&id='+qaExcerptId);
 if(!article.ok){
  // Once current Source permission is revoked, do not reseed a dependent display.
  if(source.source?.excerpt?.state!=='permitted')return;
  const response=await send('/api/commands',{operationId:'TEST-ONLY-layout-source-display',action:'create',family:'article',id:qaExcerptId,data:{title:'TEST ONLY retained Source reading',body:'Independent authored explanation remains available when an owned excerpt is withheld.',synthetic:true,links:[{family:'source',id:source.id,rendition:source.rendition,reason:'Original excerpt provenance'}],sections:[{id:'source-context',title:'Original source and interpretation',parts:[{id:'owned-quote',kind:'excerpt',text,excerpt:{sourceId:source.id,rendition:source.rendition,start:0,end:text.length}},{id:'independent-interpretation',kind:'paragraph',text:'Independent synthetic interpretation: delivery evidence does not by itself establish how input shutdown is signalled.'},{id:'source-reference',kind:'reference',text:'Compare the exact original Source',reference:{url:'https://example.invalid/minamo-owned-fixture',label:'Original synthetic Source',rights:'link-only',sourceId:source.id}}]}]}});
  if(!response.ok)throw Error('QA excerpt display admission failed: '+await response.text());
 }
}
