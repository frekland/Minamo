/** Organisational navigation state. Authority always remains server-side. */
export const LEARNING_SPACE_OPTIONS=[['all','All learning'],['computing','Computing'],['languages','Languages'],['unclassified','Unclassified']] as const;
export const STUDY_LANGUAGE_OPTIONS=[['ja','Japanese'],['zh-Hans','Mandarin · Simplified'],['zh-Hant','Mandarin · Traditional'],['fr','French'],['es','Spanish'],['el','Modern Greek'],['de','German'],['sv','Swedish']] as const;
export type LearningSpaceSelection={learningSpace:'all'|'computing'|'languages'|'unclassified';language?:typeof STUDY_LANGUAGE_OPTIONS[number][0]};
export function learningSpaceSelection(value:unknown):LearningSpaceSelection{
 const data=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const learningSpace=LEARNING_SPACE_OPTIONS.some(([key])=>key===data.learningSpace)?data.learningSpace as LearningSpaceSelection['learningSpace']:'all';
 const language=learningSpace==='languages'&&STUDY_LANGUAGE_OPTIONS.some(([key])=>key===data.language)?data.language as LearningSpaceSelection['language']:undefined;
 return {learningSpace,...(language?{language}:{})};
}
export function learningSpaceFromParams(params:URLSearchParams){return learningSpaceSelection({learningSpace:params.get('learningSpace'),language:params.get('language')});}
export function learningSpaceKey(selection:LearningSpaceSelection){return selection.learningSpace+':'+(selection.language??'');}
export function learningSpaceParams(selection:LearningSpaceSelection){return {learningSpace:selection.learningSpace,...(selection.language?{language:selection.language}:{})};}
export function appendLearningSpace(params:URLSearchParams,selection:LearningSpaceSelection){params.set('learningSpace',selection.learningSpace);if(selection.language)params.set('language',selection.language);else params.delete('language');return params;}
export function learningSpaceLabel(selection:LearningSpaceSelection){return STUDY_LANGUAGE_OPTIONS.find(([key])=>key===selection.language)?.[1]??LEARNING_SPACE_OPTIONS.find(([key])=>key===selection.learningSpace)?.[1]??'All learning';}
export function learningSpacePreferenceKey(ownerScope:string){return 'minamo-learning-space-v1:'+ownerScope;}

/** Keep explicit scope in copied/new-tab local navigation; exact source coordinates remain unchanged. */
export function learningSpaceHref(path:string,selection:LearningSpaceSelection){if(!path.startsWith('/')||path.startsWith('//'))return path;const url=new URL(path,'https://minamo.invalid');appendLearningSpace(url.searchParams,selection);return url.pathname+url.search+url.hash;}
