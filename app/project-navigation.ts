import type {MouseEvent} from 'react';
import type {Family} from '../lib/contracts';
import type {ReaderProps,ReadingTarget} from './reader';

export function contextualProjectHref(path:string,projectId:string,stageId?:string){
 const url=new URL(path,'https://minamo.invalid');
 if(url.origin!=='https://minamo.invalid')return path;
 url.searchParams.set('returnJourney',projectId);
 if(stageId)url.searchParams.set('returnStage',stageId);else url.searchParams.delete('returnStage');
 return url.pathname+url.search+url.hash;
}
/** Preserve exact destinations for ordinary clicks and native new-tab navigation alike. */
export function openProjectDestination(event:MouseEvent<HTMLAnchorElement>,path:string,onNavigate?:ReaderProps['onNavigate']){
 if(!onNavigate||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const url=new URL(path,'https://minamo.invalid');if(url.origin!=='https://minamo.invalid')return;
 const p=url.searchParams,id=p.get('id');if(!id)return;
 event.preventDefault();
 const target:ReadingTarget&{returnJourney?:string;returnStage?:string}={recordFamily:(p.get('family')??undefined) as Family|undefined,rendition:p.get('rendition')??undefined,stageId:p.get('stage')??undefined,sectionId:p.get('section')??undefined,partId:p.get('part')??undefined,returnJourney:p.get('returnJourney')??undefined,returnStage:p.get('returnStage')??undefined};
 onNavigate(p.get('view')??'library',id,target);
}
