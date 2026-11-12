import type {WorkspaceRecord} from './contracts';
import type {LearningSpaceSelection} from './learning-space-navigation';

const japanese=(tag:string|undefined)=>!!tag&&/^ja(?:-|$)/i.test(tag);
/** Show one workspace-wide control when the selected view contains Japanese material. */
export function isJapaneseWorkspaceContext(selection:LearningSpaceSelection,record:WorkspaceRecord|null|undefined):boolean{
 if(selection.learningSpace==='languages'&&japanese(selection.language))return true;
 if(!record)return false;
 // A computing Project can contain an isolated language demonstration in a
 // later section. Do not promote that hidden fixture into a workspace-wide
 // Japanese control while the learner is reading computing material.
 const spaces=record.learningScope?.spaces;
 if(spaces?.includes('computing')&&!spaces.includes('languages'))return false;
 if(record.learningScope?.languages?.some(japanese))return true;
 return !!record.sections?.some(section=>section.parts.some(part=>{
  if(japanese(part.language))return true;
  if(part.semantic?.kind==='ruby'&&japanese(part.semantic.language.language))return true;
  const interactive=part.interactive;
  if(!interactive)return false;
  if('language' in interactive&&japanese(interactive.language))return true;
  return interactive.type==='flashcards'&&interactive.cards.some(card=>japanese(card.language));
 }));
}
