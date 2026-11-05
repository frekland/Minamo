import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compositionSchema,validateComposition,protectedSnapshot,layoutCapabilities} from '../lib/project-composition.ts';

const record={sections:[{id:'body',title:'Notes',parts:[]}],projectDescription:'Observed steps',title:'Lab',body:'Notes'};
const old={version:1,sections:[{id:'main',title:'',pattern:'notebook',slots:[{id:'primary',role:'primary',blockIds:['intro']}]}],blocks:[{id:'intro',sectionId:'body'}]};

test('V116 Project composition fields accept legacy shapes and validate current presentation metadata',()=>{
 assert.deepEqual(validateComposition(old,record),old);
 const current={...old,sections:[{...old.sections[0],hidden:false,collapsed:true}],blocks:[{...old.blocks[0],pinned:true,width:'split'}],favourites:['main','intro']};
 assert.deepEqual(validateComposition(current,record),current);
 assert.equal(protectedSnapshot(record,current,'layout-section:main').collapsed,true);
 assert.equal(layoutCapabilities.compositionFields.favourites.includes('never progress'),true);
 assert.throws(()=>validateComposition({...current,favourites:['intro','intro']},record),/Favourites/);
 assert.throws(()=>validateComposition({...current,favourites:['missing']},record),/Favourites/);
 assert.equal(compositionSchema.safeParse({...current,blocks:[{...current.blocks[0],width:'oversized'}]}).success,false);
});

test('Project composition limits measure encoded UTF-8 bytes, including non-Latin section names',()=>{
 const sections=Array.from({length:32},(_,i)=>({id:'s'+i,title:'界'.repeat(180),pattern:'notebook',slots:[{id:'slot'+i+'x'.repeat(100),role:'primary',blockIds:[]}]}));
 const blocks=Array.from({length:128},(_,i)=>({id:'b'+i+'x'.repeat(150),sectionId:'body'}));
 for(let i=0;i<blocks.length;i++)sections[i%sections.length].slots[0].blockIds.push(blocks[i].id);
 const candidate={version:1,sections,blocks,protectedIds:[]};
 let text=JSON.stringify(candidate);
 while(new TextEncoder().encode(text).byteLength<=64000&&candidate.protectedIds.length<160){candidate.protectedIds.push('界'.repeat(180));text=JSON.stringify(candidate);}
 assert.ok(text.length<=64000,'fixture must be under the historical JavaScript-length limit');
 assert.ok(new TextEncoder().encode(text).byteLength>64000,'fixture must exceed UTF-8 byte limit');
 assert.throws(()=>validateComposition(candidate,record),/64 KB/);
});
