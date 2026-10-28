'use client';
import {Languages,Monitor} from 'lucide-react';
import {STUDY_LANGUAGE_OPTIONS,learningSpaceLabel,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import './header-learning-space.css';
/** One visible scope selector; the desktop icon also switches between the two main spaces. */
export default function HeaderLearningSpace({value,onChange}:{value:LearningSpaceSelection;onChange:(value:LearningSpaceSelection)=>void}){
 const languages=value.learningSpace==='languages',next=languages?'Computing':'Languages',Icon=languages?Languages:Monitor;
 return <div className="ux-space-icons" role="group" aria-label="Learning space"><button type="button" className="v2-icon ux-space-icon" aria-label={`${learningSpaceLabel(value)}. Switch to ${next}`} title={`Switch to ${next}`} onClick={()=>onChange({learningSpace:languages?'computing':'languages'})}><Icon size={20} aria-hidden="true"/></button><select aria-label="Learning space and study language" value={value.language?'languages:'+value.language:value.learningSpace} onChange={event=>{const [space,language]=event.target.value.split(':');onChange(space==='languages'?{learningSpace:'languages',language:language as LearningSpaceSelection['language']}:{learningSpace:space as LearningSpaceSelection['learningSpace']});}}><option value="computing">Computing</option><optgroup label="Languages"><option value="languages">Languages · all</option>{STUDY_LANGUAGE_OPTIONS.map(([tag,label])=><option key={tag} value={'languages:'+tag}>Languages · {label}</option>)}</optgroup><option value="unclassified">Unclassified</option><option value="all">All learning</option></select></div>;
}
