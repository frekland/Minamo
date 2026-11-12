import {appendLearningSpace,learningSpaceFromParams} from './learning-space-navigation';
const allowed=new Set(['view','practiceKind','practiceQuery','practiceSynthetic','learningSpace','language']);
/** One bounded list location, never an arbitrary redirect, title, Note or nested return. */
export function parsePracticeReturn(raw:unknown):string|undefined{
 if(typeof raw!=='string'||raw.length>1500||/[\u0000-\u001f\u007f#]/.test(raw))return;
 const p=new URLSearchParams(raw);if(p.get('view')!=='practice')return;
 for(const key of p.keys())if(!allowed.has(key)||p.getAll(key).length!==1)return;
 const kind=p.get('practiceKind')??'activities',query=p.get('practiceQuery')??'';
 if(!['activities','attempts','reviews'].includes(kind)||query.length>200||!query.isWellFormed()||/[\u0000-\u001f\u007f]/.test(query))return;
 const next=appendLearningSpace(new URLSearchParams({view:'practice',practiceKind:kind}),learningSpaceFromParams(p));if(query)next.set('practiceQuery',query);if(p.get('practiceSynthetic')==='true')next.set('practiceSynthetic','true');return next.toString();
}
export function practiceListContext(p:URLSearchParams){if(p.get('view')!=='practice')return parsePracticeReturn(p.get('returnPractice'));const list=new URLSearchParams();for(const key of allowed){const value=p.get(key);if(value!==null)list.set(key,value);}return parsePracticeReturn(list.toString());}
