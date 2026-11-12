"use client";
import {Languages,Monitor,Grid2X2,Shapes} from 'lucide-react';
import type {LearningSpaceSelection} from '../lib/learning-space-navigation';
import './header-learning-space.css';
export default function HeaderLearningSpace({value,onChange}:{value:LearningSpaceSelection;onChange:(value:LearningSpaceSelection)=>void}){
 const scopes=['all','computing','languages','unclassified'] as const,labels=['All','Computing','Languages','Other'],at=scopes.indexOf(value.learningSpace),next=(at+1)%4,Icon=[Grid2X2,Monitor,Languages,Shapes][at]??Grid2X2;
 return <button type="button" className="v2-icon ux-space-icon" style={{minWidth:44,minHeight:44}} aria-label={`${labels[at]} scope. Switch to ${labels[next]}`} title={`${labels[at]} · switch to ${labels[next]}`} onClick={()=>onChange({learningSpace:scopes[next],...(scopes[next]==='languages'?{language:undefined}:{})})}><Icon size={20} aria-hidden="true"/><span className="ux-space-current">{labels[at]}</span></button>;
}
