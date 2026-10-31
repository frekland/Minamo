/** TEST ONLY: reusable local subject/variant replay over real Worker/D1/R2 contracts.
 * No hosted controller import or production writes. Data is fictional User material.
 */
import {seed} from '../mood-to-music/replay.mjs';

export const PHASES=Object.freeze(['A','B','C','D','E','F','G','H','I','J','K']);
const scope={version:1,spaces:['computing'],provenance:'authored'};
const ok=async promise=>{
  const response=await promise;
  if(response.status!==200)throw Error('Synthetic domain '+response.status+': '+JSON.stringify(response.data));
  return response.data;
};
export function subjectPrefix(subject,personaKey,epoch=1){
  if(!/^[a-z][a-z0-9-]+$/.test(subject.namespace)||!Object.hasOwn(subject.personas,personaKey))
    throw Error('Unregistered synthetic subject/persona');
  if(!Number.isSafeInteger(epoch)||epoch<1||epoch>999999)throw Error('Invalid synthetic epoch');
  return 'TEST-ONLY-'+subject.namespace+'-'+personaKey+'-v1-r'+epoch;
}
function operator(client,prefix){
  const id=leaf=>prefix+'-'+leaf;
  const read=async(family,leaf)=>(await ok(client.context(family,id(leaf)))).record;
  const write=(leaf,command)=>ok(client.command({operationId:id(leaf),...command}));
  const create=async(family,leaf,data)=>(await write('create-'+leaf,{
    action:'create',family,id:id(leaf),data:{...data,synthetic:true}
  })).record;
  const update=async(family,leaf,phase,data)=>{
    const old=await read(family,leaf);
    return (await write('update-'+leaf+'-'+phase,{
      action:'update',family,id:old.id,expectedRev:old.rev,data
    })).record;
  };
  const link=async(token)=>{
    const [kind,leaf,sectionId]=token.split(':');
    const family={question:'investigation',article:'article',project:'journey',note:'note'}[kind];
    if(!family||!leaf)throw Error('Invalid fictional link '+token);
    const record=await read(family,kind==='question'?'question-'+leaf:leaf);
    if(kind==='project')return {family,id:record.id,rendition:record.rendition,sectionId:sectionId||'investigate'};
    if(kind==='article')return {family,id:record.id,rendition:record.rendition,
      sectionId:sectionId||'evidence',partId:'p',relation:'supports'};
    return {family,id:record.id,relation:'related'};
  };
  const links=async tokens=>Promise.all((tokens||[]).map(link));
  const anchor=async(sectionId,quote)=>{
    const article=await read('article','reference');
    const part=article.sections.find(s=>s.id===sectionId)?.parts.find(p=>p.id==='p');
    const start=part?.text?.indexOf(quote)??-1;
    if(start<0)throw Error('Quote absent from pinned synthetic reference: '+quote);
    return {articleId:article.id,recordFamily:'article',rendition:article.rendition,
      sectionId,partId:'p',start,end:start+quote.length,quote};
  };
  return {id,read,create,update,write,links,anchor,client};
}
async function note(o,event){
  return o.create('note',event.leaf,{
    title:'TEST ONLY '+event.title,
    body:'FICTIONAL USER MATERIAL (not independently observed):\n'+event.body,
    learningScope:scope,links:await o.links(event.links)
  });
}
async function question(o,q){
  return o.create('investigation','question-'+q.id,{
    title:'TEST ONLY '+q.title,body:'FICTIONAL USER investigation; no verified external outcome.',
    learningScope:scope,learningShape:{version:2,kind:'investigation',question:q.question},
    links:await o.links(['project:project:'+q.stage,'article:reference:'+q.section])
  });
}
async function applyFoundation(o,subject,phase){
  const f=subject.foundation;
  if(phase==='A'){
    await o.create('journey','project',{
      title:'TEST ONLY '+subject.title,body:subject.intent,
      learningScope:scope,sections:subject.sections.map(s=>({
        id:s.id,title:s.title,parts:[{id:'p',kind:'paragraph',text:s.text}]
      })),
      learningShape:{version:1,kind:'journey',stages:subject.sections.map(s=>({
        id:s.id,sectionId:s.id,title:s.title,intent:s.intent
      }))}
    });
    await o.create('article','reference',{
      title:'TEST ONLY '+subject.referenceTitle,
      body:'Original fictional engineering reference; not a licensed third-party excerpt.',
      learningScope:scope,sections:subject.referenceSections.map(s=>({
        id:s.id,title:s.title,parts:[{id:'p',kind:'paragraph',text:s.text}]
      }))
    });
    const questions=[];
    for(const q of subject.questions)questions.push(await question(o,q));
    const project=await o.read('journey','project'),reference=await o.read('article','reference');
    await o.update('journey','project',phase,{links:[
      ...questions.map((q,i)=>({family:'investigation',id:q.id,sourceContext:{stageId:subject.questions[i].stage}})),
      {family:'article',id:reference.id,relation:'supports',sourceContext:{stageId:subject.sections[0].id}}
    ]});
  }else if(phase==='B'){
    await note(o,f.B.note);
    const old=await o.read('investigation','question-'+f.B.questionId);
    await o.update('investigation','question-'+f.B.questionId,phase,{
      learningShape:{...old.learningShape,question:f.B.question}
    });
  }else if(phase==='C'){
    await note(o,f.C.note);
  }else if(phase==='D'){
    await note(o,f.D.note);
    await o.create('annotation','annotation-foundation',{
      title:'TEST ONLY source reminder',body:f.D.annotation.body,
      learningScope:scope,anchor:await o.anchor(f.D.annotation.section,f.D.annotation.quote)
    });
  }else if(phase==='E'){
    await o.update('journey','project',phase,{body:f.E.projectBody});
    await note(o,f.E.note);
    const old=await o.read('investigation','question-'+f.E.questionId);
    await o.update('investigation','question-'+f.E.questionId,phase,{
      learningShape:{...old.learningShape,question:f.E.question}
    });
  }else throw Error('Not a foundation phase');
}
async function applyEvent(o,phase,event){
  if(!event)throw Error('Unregistered fictional phase '+phase);
  for(const revised of event.reviseNotes||[])await o.update('note',revised.leaf,phase,{
    body:'FICTIONAL USER REVISION (earlier editions retained):\n'+revised.body
  });
  for(const revised of event.reviseQuestions||[]){
    const old=await o.read('investigation','question-'+revised.id);
    await o.update('investigation','question-'+revised.id,phase,{
      learningShape:{...old.learningShape,question:revised.question}
    });
  }
  if(event.projectBody)await o.update('journey','project',phase,{body:event.projectBody});
  for(const added of event.notes||[])await note(o,added);
  for(const marked of event.annotations||[])await o.create('annotation',marked.leaf,{
    title:'TEST ONLY contextual reminder',body:marked.body,learningScope:scope,
    anchor:await o.anchor(marked.section,marked.quote)
  });
}
async function inspect(o,subject,variant,phase){
  const project=await o.read('journey','project'),article=await o.read('article','reference');
  const notes=[];
  const leaves=[subject.foundation.B.note.leaf,subject.foundation.C.note.leaf,
    subject.foundation.D.note.leaf,subject.foundation.E.note.leaf,...variant.noteLeaves];
  for(const leaf of leaves){
    const response=await o.client.context('note',o.id(leaf));
    if(response.status===200)notes.push({leaf,rev:response.data.record.rev});
    else if(response.status!==404)throw Error('Unexpected Note read '+response.status);
  }
  const questions=[];
  for(const q of subject.questions){
    const record=await o.read('investigation','question-'+q.id);
    questions.push({id:q.id,rev:record.rev});
  }
  let annotations=0;
  for(const leaf of ['annotation-foundation',...(variant.annotationLeaves||[])]){
    const response=await o.client.context('annotation',o.id(leaf));
    if(response.status===200)annotations++;
    else if(response.status!==404)throw Error('Unexpected annotation status '+response.status);
  }
  return {phase,prefix:o.id('').slice(0,-1),project:{id:project.id,rev:project.rev},
    article:{id:article.id,rendition:article.rendition},
    notes,questions,annotations,generatedGPTNotes:0};
}
export async function replayInto(session,subject,personaKey,target='K',{epoch=1}={}){
  if(!PHASES.includes(target))throw Error('Invalid fictional phase');
  const variant=subject.personas[personaKey];
  const prefix=subjectPrefix(subject,personaKey,epoch);
  const o=operator(session.client,prefix),states=[];
  for(const phase of PHASES){
    session.client.scenarioPhase=phase;
    if('ABCDE'.includes(phase))await applyFoundation(o,subject,phase);
    else await applyEvent(o,phase,variant.events[phase]);
    states.push(phase);
    if(phase===target)break;
  }
  return {prefix,states,snapshot:await inspect(o,subject,variant,target)};
}
export async function replaySubject(subject,personaKey,target='K',{
  epoch=1,owner='TEST-ONLY-'+subject.namespace+'-principal'
}={}){
  if(typeof owner!=='string'||!owner.startsWith('TEST-ONLY-'))throw Error('Only TEST-ONLY principals');
  subjectPrefix(subject,personaKey,epoch);
  const session=await seed({owner});
  try{
    const run=await replayInto(session,subject,personaKey,target,{epoch});
    return {session,...run};
  }catch(error){await session.fixture.dispose();throw error;}
}
