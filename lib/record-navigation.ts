import type {Family} from './contracts';
export type NavigationRecord={id?:string;family?:Family};
/** The exact-record fetch effect depends on family/id, not stage or passage position.
 * Only a changed record identity may enter its loading state. In-record navigation
 * keeps the admitted edition/context until an explicit refresh or server response.
 */
export function planRecordNavigation(current:NavigationRecord,next:NavigationRecord,serverReads:boolean){
 const recordChanged=current.id!==next.id||current.family!==next.family;
 return{recordChanged,needsRecordRead:serverReads&&!!next.id&&recordChanged,targetKey:next.id?`${next.family??'?'}:${next.id}`:''};
}
