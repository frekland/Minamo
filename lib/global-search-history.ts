import {learningSpaceKey,learningSpaceSelection,type LearningSpaceSelection} from './learning-space-navigation';
type SearchEntry={version:1;scope:string;selection:LearningSpaceSelection;query:string};
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const queryText=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=200&&!/[\u0000-\u001f\u007f]/.test(value);
/** This browser history entry alone retains the search term. No URL, durable
 * browser storage, result bodies or learner prose are added to navigation. */
export function globalSearchHistoryState(state:unknown,scope:string,selection:LearningSpaceSelection,query:string):Record<string,unknown>{
 const next=object(state)?{...state}:{};delete next.minamoGlobalSearch;
 if(scope&&scope.length<=512&&queryText(query))next.minamoGlobalSearch={version:1,scope,selection:learningSpaceSelection(selection),query:query.trim()} satisfies SearchEntry;
 return next;
}
/** Scope includes the authenticated owner and active storage generation. */
export function globalSearchHistoryQuery(state:unknown,scope:string,selection:LearningSpaceSelection):string{
 const entry=object(state)&&object(state.minamoGlobalSearch)?state.minamoGlobalSearch:null;
 if(!entry||entry.version!==1||entry.scope!==scope||!queryText(entry.query)||!object(entry.selection))return '';
 const saved=learningSpaceSelection(entry.selection);
 if(saved.learningSpace!==entry.selection.learningSpace||saved.language!==entry.selection.language||learningSpaceKey(saved)!==learningSpaceKey(selection))return '';
 return entry.query.trim();
}
