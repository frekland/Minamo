import {generationFetch} from './workspace-generation';
import {experiencePart,type ExperienceRef} from './experience-discovery';
import type {WorkspaceRecord} from './contracts';
export async function readExperiencePage(scope:string,cursor?:string,signal?:AbortSignal){
 const params=new URLSearchParams({family:'journey',limit:'8',study:'1',learningSpace:'languages',language:'ja',...(cursor?{cursor}:{})});
 const response=await generationFetch(scope,'/api/query?'+params,{signal,cache:'no-store'});
 const body=await response.json() as {error?:string;records:WorkspaceRecord[];nextCursor?:string|null};
 if(!response.ok)throw Error(body.error??'Could not read saved material.');
 if(!Array.isArray(body.records))throw Error('Saved material response is incomplete.');
 return body;
}
export async function readExperienceSource(scope:string,ref:ExperienceRef,signal?:AbortSignal){
 const params=new URLSearchParams({family:ref.family,id:ref.id,rendition:ref.rendition});
 const response=await generationFetch(scope,'/api/context?'+params,{signal,cache:'no-store'});
 const body=await response.json() as {error?:string;record?:WorkspaceRecord};
 if(!response.ok)throw Error(body.error??'Source is unavailable.');
 if(!body.record||!experiencePart(body.record,ref))throw Error('This exact source passage is unavailable.');
 return body.record;
}
