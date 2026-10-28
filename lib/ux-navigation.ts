import type {WorkspaceRecord} from './contracts';
import type {LearningSpaceSelection} from './learning-space-navigation';
import type {LayoutTask} from './layout-workspace';
import {matchesLearningScope} from './learning-spaces';

/** Explicit scope changes end an incompatible task; exact readings and drafts stay open. */
export function taskInLearningSpace(task:LayoutTask|null,record:WorkspaceRecord|null,selection:LearningSpaceSelection):LayoutTask|null{
 if(!task)return null;
 return record&&record.id===task.id&&record.family===task.family&&matchesLearningScope(record,selection)?task:null;
}
const romanValues:Record<string,number>={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
function romanNumber(value:string){let total=0;for(let i=0;i<value.length;i++){const n=romanValues[value[i]]??0;total+=(romanValues[value[i+1]]??0)>n?-n:n;}return total;}
/** Authored numbered routes stay in their human sequence; unrelated titles sort naturally. */
export function compareLearningTitles(a:Pick<WorkspaceRecord,'title'>,b:Pick<WorkspaceRecord,'title'>){
 const pattern=/^(.*?)\bPhase\s+([IVXLCDM]+)\b/i,aa=a.title.match(pattern),bb=b.title.match(pattern);
 if(aa&&bb&&aa[1].localeCompare(bb[1],undefined,{sensitivity:'base'})===0){const difference=romanNumber(aa[2].toUpperCase())-romanNumber(bb[2].toUpperCase());if(difference)return difference;}
 return a.title.localeCompare(b.title,undefined,{numeric:true,sensitivity:'base'});
}
