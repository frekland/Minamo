'use client';
import {useState} from 'react';
import type {WorkspaceRecord,WorkspaceCommand,CommandReceipt} from '../lib/contracts';
import type {LearningScope} from '../lib/learning-spaces';
import {tryLanguageTag} from '../lib/language-tags';
import {recordSubject,subjectScope,subjectCommand,sameSubject,type RecordSubject} from '../lib/record-subject';
import './record-subject-control.css';

export default function RecordSubjectControl({record,onCommand,onSaved}:{record:WorkspaceRecord;onCommand:(command:WorkspaceCommand)=>Promise<CommandReceipt>;onSaved:(scope:LearningScope)=>void}){
 const [subject,setSubject]=useState<RecordSubject>(()=>recordSubject(record.learningScope));
 const [subjects,setSubjects]=useState(record.learningScope?.subjects?.join(', ')??'');
 const [tag,setTag]=useState(record.learningScope?.languages?.join(', ')??'');
 const [pending,setPending]=useState<WorkspaceCommand|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const languageEnabled=subject==='languages'||subject==='both',tags=tag.split(',').map(s=>s.trim()).filter(Boolean);
 const validTags=tags.map(tryLanguageTag),valid=tags.length<=8&&tags.every((_,i)=>!!validTags[i])&&new Set(validTags).size===validTags.length;
 const canonicalTags=valid?validTags as string[]:[];
 const scope=subjectScope(subject,languageEnabled&&canonicalTags.length===1?canonicalTags[0]:undefined);
 if(languageEnabled&&canonicalTags.length>1)scope.languages=canonicalTags;
 const subjectLabels=subjects.split(',').map(s=>s.trim()).filter(Boolean);
 if(subjectLabels.length)scope.subjects=subjectLabels;
 const validSubjects=subjectLabels.length<=8&&subjectLabels.every(s=>s.length<=64)&&new Set(subjectLabels.map(s=>s.normalize('NFC').toLocaleLowerCase())).size===subjectLabels.length;
 const unchanged=sameSubject(record,scope);
 async function save(){
  if(busy)return;
  if(!validSubjects){setError('Use up to eight distinct subject labels, each up to 64 characters.');return;}
  if(languageEnabled&&!valid){setError('Use up to eight distinct language tags, such as ja, tet or fr.');return;}
  const action=pending??subjectCommand(record,scope,crypto.randomUUID());
  setPending(action);setBusy(true);setError('');
  try{const receipt=await onCommand(action);if(receipt.status!=='committed')throw new Error('Classification was not confirmed.');setPending(null);onSaved(action.data!.classifyLearningScope!.learningScope)}
  catch(e){const failure=e as Error&{status?:number};if(failure.status&&failure.status>=400&&failure.status<500)setPending(null);setError((e as Error).message||'Change not confirmed. Retry the same change.');}
  finally{setBusy(false);}
 }
 return <section className="rs-control" aria-label="Organise this record">
  <div className="rs-control-title"><h3>Learning space</h3><span>Organise where this appears</span></div>
  <div className="rs-fields"><label>Show in
   <select value={subject} disabled={busy||!!pending} onChange={event=>{setSubject(event.target.value as RecordSubject);setError('')}} aria-label="Record learning space">
    <option value="unclassified">Other</option><option value="computing">Computing</option><option value="languages">Languages</option><option value="both">Computing and Languages</option>
   </select>
  </label>{languageEnabled&&<label>Language tags (optional)
   <input value={tag} disabled={busy||!!pending} onChange={event=>setTag(event.target.value)} placeholder="ja, tet, fr" aria-label="Record language tags"/>
  </label>}<label>Subjects (optional)<input value={subjects} disabled={busy||!!pending} onChange={event=>setSubjects(event.target.value)} placeholder="Photography, water quality, music…" aria-label="Record subject labels"/></label></div>
  <p>Changing this only changes where the record appears. Subject labels are your own words and can be searched across Minamo. Saved editions, citations and contents stay intact.</p>
  {error&&<p className="rs-error" role="alert">{error}</p>}
  <button type="button" className="v2-secondary" disabled={busy||(!pending&&(unchanged||!validSubjects||languageEnabled&&!valid))} onClick={()=>void save()}>{busy?'Saving…':pending?'Check or retry change':'Save organisation'}</button>
 </section>;
}
