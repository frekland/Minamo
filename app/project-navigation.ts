import type {MouseEvent} from 'react';
import type {ReaderProps,ReadingTarget} from './reader';
import {routeDestination} from '../lib/navigation-origin';

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
 const destination=routeDestination(path);if(!destination)return;
 event.preventDefault();
 onNavigate(destination.view,destination.id,destination.target);
}
