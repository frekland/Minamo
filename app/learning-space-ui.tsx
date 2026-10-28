'use client';
import {createContext,useContext} from 'react';
import {LEARNING_SPACE_OPTIONS,STUDY_LANGUAGE_OPTIONS,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import './learning-spaces.css';
export const LearningSpaceContext=createContext<LearningSpaceSelection>({learningSpace:'all'});
export const useLearningSpace=()=>useContext(LearningSpaceContext);
export function LearningSpaceSelector({value,onChange,compact=false}:{value:LearningSpaceSelection;onChange:(selection:LearningSpaceSelection)=>void;compact?:boolean}){
 return <section className={`learning-space-selector${compact?' learning-space-selector-header':''}`} aria-label="Learning space"><label><span>Learning space</span><select aria-label="Learning space" value={value.learningSpace} onChange={event=>onChange({learningSpace:event.target.value as LearningSpaceSelection['learningSpace']})}>{LEARNING_SPACE_OPTIONS.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>{value.learningSpace==='languages'&&<label><span>Study language</span><select aria-label="Study language" value={value.language??''} onChange={event=>onChange({learningSpace:'languages',...(event.target.value?{language:event.target.value as LearningSpaceSelection['language']}:{})})}><option value="">All languages</option>{STUDY_LANGUAGE_OPTIONS.map(([tag,label])=><option value={tag} key={tag}>{label}</option>)}</select></label>}</section>;
}
