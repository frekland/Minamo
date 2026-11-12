import {test} from 'node:test';
import assert from 'node:assert/strict';
import {privateStorageFixture} from './private-storage-fixture.mjs';

const worker='import {domainHandler} from "./lib/domain-handler.ts";export default {fetch:domainHandler}';
const ok=async pending=>{const response=await pending;assert.equal(response.status,200,JSON.stringify(response.data));return response.data;};

test('a fresh focused context carries exact language and creative revision differences, without inferred sessions or links',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const owner=f.client('fresh-project-owner'),foreign=f.client('fresh-project-foreign');
  for(const [id,base,revised,kind] of [
   ['language-continuity','うん。遅すぎました。','うん、着くのが遅すぎました。','paragraph'],
   ['creative-continuity','Bright foreground might create rhythm.','Bright foreground might compete with the subject.','callout'],
   ['science-continuity','The sampling period spans a constructed six-month comparison. '.repeat(8)+'The phosphate signal is stable.','The sampling period spans a constructed six-month comparison. '.repeat(8)+'The phosphate signal is uncertain.','paragraph']
  ]){
   const part=text=>({id:'idea',kind,text,...(kind==='callout'?{callout:{tone:'question',label:'Design possibility'}}:{})});
   const project=(await ok(owner.command({action:'create',family:'journey',id,data:{title:id,body:'A constructed comparison, not a measured outcome.',synthetic:true,sections:[{id:'question',title:'A developing question',parts:[part(base)]}]}}))).record;
   const changed=(await ok(owner.command({action:'update',family:'journey',id,expectedRev:project.rev,data:{sections:[{id:'question',title:'A developing question',parts:[part(revised)]}]}}))).record;
   const count=(await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n;
   const context=await ok(owner.request('/api/learning-context',{scope:'working',focus:{family:'journey',id}}));
   assert.equal(context.selected[0].source.rev,2);
   assert.equal(context.projectChanges.currentRevision,2);
   const recent=context.projectChanges.entries[0];
   assert.equal(recent.revision,2);assert.equal(recent.rendition,changed.rendition);
   if(id==='science-continuity'){
    assert.match(recent.changes[0].literalDifference[0].before,/phosphate signal is stable/);
    assert.match(recent.changes[0].literalDifference[0].after,/phosphate signal is uncertain/);
    assert.notEqual(recent.changes[0].literalDifference[0].before,recent.changes[0].literalDifference[0].after);
    assert.ok(recent.changes[0].literalDifference[0].before.length<150,'keep excerpts bounded');
   }else{
    assert.equal(recent.changes[0].literalDifference[0].before,base);
    assert.equal(recent.changes[0].literalDifference[0].after,revised);
   }
   assert.equal(recent.actor,'user','preserve the saved actor; do not relabel as GPT');
   assert.equal(context.projectChanges.entries[1].revision,1);
   assert.equal(context.projectChanges.entries[1].rendition,project.rendition);
   assert.equal(context.relations.length,0,'matching titles and a revision never invent saved links');
   assert.equal((await f.db.prepare('SELECT count(*) n FROM v2_operations').first()).n,count,'read-only orientation cannot write');
   const denied=await foreign.request('/api/learning-context',{scope:'working',focus:{family:'journey',id}});
   assert.equal(denied.status,404,'foreign focus fails closed without a change projection');
   assert.equal(JSON.stringify(denied.data).includes(revised),false);
  }
 }finally{await f.dispose();}
});

test('revision orientation admits exact historical editions without upgrading an old Note citation',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('pinned-history-owner');
  const project=(await ok(c.command({action:'create',family:'journey',id:'retained-language',data:{title:'Sentence sequence',body:'Synthetic examples',synthetic:true,sections:[{id:'grammar',title:'Grammar',parts:[{id:'p',kind:'paragraph',text:'Old explanatory wording.'}]}]}}))).record;
  const note=(await ok(c.command({action:'create',family:'note',id:'retained-note',data:{title:'Earlier discussion',body:'The first version was still tentative.',synthetic:true,pagePins:[{family:'journey',id:project.id,rendition:project.rendition,sectionId:'grammar',partId:'p'},{family:'journey',id:project.id,rendition:project.rendition,sectionId:'grammar'}]}}))).record;
  const updated=(await ok(c.command({action:'update',family:'journey',id:project.id,expectedRev:project.rev,data:{sections:[{id:'grammar',title:'Grammar',parts:[{id:'p',kind:'paragraph',text:'Revised grammar explanation.'}]}]}}))).record;
  const page=await ok(c.request('/api/learning-context',{scope:'working',focus:{family:'journey',id:project.id}}));
  assert.equal(page.projectChanges.entries[0].rendition,updated.rendition);
  assert.equal(page.projectChanges.entries[1].rendition,project.rendition);
  const noteReferences=page.relations.filter(rel=>rel.direction==='incoming'&&rel.to.id===note.id);
  assert.equal(noteReferences.length,2,'distinct page pins in the same older edition remain visible to a fresh read');
  assert.deepEqual(new Set(noteReferences.map(rel=>new URL(rel.citedDestination,'https://example.invalid').searchParams.get('part'))),new Set(['p',null]));
  assert.ok(noteReferences.every(rel=>rel.citedProject.rev===1&&rel.citedProject.rendition===project.rendition));
  assert.ok(noteReferences.every(rel=>rel.to.rendition===note.rendition&&rel.to.rev===1));
  assert.equal(page.relations.some(rel=>rel.direction==='incoming'&&rel.citedProject.rendition===updated.rendition),false);
  const foreign=f.client('pinned-history-foreign');
  const hidden=await foreign.request('/api/learning-context',{scope:'working',focus:{family:'journey',id:project.id}});
  assert.equal(hidden.status,404,'a foreign owner cannot read the Project or its pinned Note citations');
 }finally{await f.dispose();}
});

test('exact Project revision read distinguishes saves even when their rendered rendition is shared',{timeout:120000},async()=>{
 const f=await privateStorageFixture(worker);try{
  const c=f.client('same-rendition-owner');
  const section={id:'context',title:'Original question',parts:[{id:'p',kind:'paragraph',text:'Keep the source and the question intact.'}]};
  const first=(await ok(c.command({action:'create',family:'journey',id:'same-content-project',data:{title:'Same rendered material',body:'Constructed version identity test.',synthetic:true,sections:[section]}}))).record;
  const second=(await ok(c.command({action:'update',family:'journey',id:first.id,expectedRev:first.rev,data:{sections:[section]}}))).record;
  assert.equal(second.rev,2);
  assert.equal(second.rendition,first.rendition,'a new save can preserve the same content rendition');
  const old=await ok(c.request('/api/projects/composition?projectId='+first.id+'&revision=1'));
  const latest=await ok(c.request('/api/projects/composition?projectId='+first.id+'&revision=2'));
  assert.equal(old.record.rev,1);assert.equal(latest.record.rev,2);
  assert.equal(old.record.rendition,latest.record.rendition);
  assert.equal(old.currentProjectRev,2);assert.equal(latest.currentProjectRev,2);
  const foreign=f.client('same-rendition-foreign');
  assert.equal((await foreign.request('/api/projects/composition?projectId='+first.id+'&revision=1')).status,404);
 }finally{await f.dispose();}
});
