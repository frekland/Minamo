'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import {LEARNING_SPACE_OPTIONS,STUDY_LANGUAGE_OPTIONS,type LearningSpaceSelection} from '../lib/learning-space-navigation';
import {tryLanguageTag} from '../lib/language-tags';
import './learning-spaces.css';
export const LearningSpaceContext=createContext<LearningSpaceSelection>({learningSpace:'all'});
export const useLearningSpace=()=>useContext(LearningSpaceContext);
export function LearningSpaceSelector({value,onChange,compact=false}:{value:LearningSpaceSelection;onChange:(selection:LearningSpaceSelection)=>void;compact?:boolean}){
 const [custom,setCustom]=useState(value.language??''),[error,setError]=useState('');
 const other=!!value.language&&!STUDY_LANGUAGE_OPTIONS.some(([key])=>key===value.language);
 useEffect(()=>{setCustom(value.language??'');setError('');},[value.language]);
 function applyCustom(){if(!custom.trim()){onChange({learningSpace:'languages'});setError('');return;}const language=tryLanguageTag(custom.trim());if(!language){setError('Enter a valid BCP 47 tag, such as tet or ar.');return;}onChange({learningSpace:'languages',language});setError('');}
 return <section className={`learning-space-selector${compact?' learning-space-selector-header':''}`} aria-label="Learning space"><label><span>Learning space</span><select aria-label="Learning space" value={value.learningSpace} onChange={event=>onChange({learningSpace:event.target.value as LearningSpaceSelection['learningSpace']})}>{LEARNING_SPACE_OPTIONS.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></label>{value.learningSpace==='languages'&&<><label><span>Study language</span><select aria-label="Study language" value={other?'other':value.language??''} onChange={event=>{if(event.target.value==='other')return;onChange({learningSpace:'languages',...(event.target.value?{language:event.target.value}:{})});}}><option value="">All languages</option>{STUDY_LANGUAGE_OPTIONS.map(([tag,label])=><option value={tag} key={tag}>{label}</option>)}<option value="other">Other language…</option></select></label><label><span>Other language tag</span><input aria-label="Other study language tag" placeholder="e.g. tet, ar, ko" value={custom} onChange={event=>setCustom(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();applyCustom();}}}/></label><button type="button" onClick={applyCustom}>Apply tag</button>{error&&<small role="alert">{error}</small>}</>}</section>;
}
