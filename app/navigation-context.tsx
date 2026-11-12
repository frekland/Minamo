'use client';
import {createContext,useContext} from 'react';
import {parsePracticeReturn} from '../lib/practice-return';
import {withLibraryReturn} from '../lib/library-return';
import {withProjectReturn,type ProjectReturnContext} from '../lib/project-return-context';
import {learningSpaceHref,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {extendViewOrigin,withViewOrigin,type RouteReading,type ViewOrigin} from '../lib/navigation-origin';
export type NavigationContextValue={selection?:LearningSpaceSelection;practice?:string;library?:string|null;project?:ProjectReturnContext;current?:Omit<RouteReading,'rendition'>&{rendition?:string};origin?:ViewOrigin};
export const NavigationContext=createContext<NavigationContextValue>({});
/** Secondary native links receive the same bounded context as ordinary Workspace navigation. */
export function useContextualHref(){const context=useContext(NavigationContext),selection=context.selection;return (path:string)=>{
 if(!path.startsWith('/?'))return path;
 const href=withViewOrigin(withLibraryReturn(withProjectReturn(selection?learningSpaceHref(path,selection):path,context.project),context.library),context.current?extendViewOrigin(context.origin,context.current,context.project):context.origin),practice=parsePracticeReturn(context.practice);if(!practice)return href;const p=new URLSearchParams(href.slice(2));p.set('returnPractice',practice);if(p.get('family')==='experiment'){p.set('view','practice');for(const [key,value] of new URLSearchParams(practice))if(key.startsWith('practice'))p.set(key,value);}return '/?'+p;
};}
