import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export{newNoteDraft,clearNoteCreationContext,noteSaveCommand,editedNoteDraft}from"./lib/note-sync.ts"',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,logLevel:'error'});
const mod={exports:{}};new Function('require','module','exports',built.outputFiles[0].text)(require,mod,mod.exports);
const {newNoteDraft,clearNoteCreationContext,noteSaveCommand,editedNoteDraft}=mod.exports;

test('Study Note source chip is explicitly selected, removable and frozen into one ordinary Note operation',()=>{
 const context={family:'article',id:'reading',title:'An explanation',rev:3,rendition:'edition-3'},selected={family:'article',id:'reading',rendition:'edition-3',sectionId:'why',partId:'paragraph'},other={family:'work',id:'optional-work',relation:'related'};
 let draft=newNoteDraft(context,selected,[selected,other]);
 context.title='Different navigation';selected.partId='a-different-passage';
 assert.equal(draft.creationContext.title,'An explanation');assert.equal(draft.creationContext.link.partId,'paragraph');
 draft=editedNoteDraft(draft,{title:'My question',body:'I wonder whether these results agree.'},100);
 const frozen=noteSaveCommand(draft,'draft-1','frozen-save','saved-note');
 assert.equal(frozen.data.links[0].partId,'paragraph');assert.equal(frozen.data.links[1].family,'work');
 const cleared=clearNoteCreationContext(draft,120);
 assert.equal(cleared.body,draft.body);assert.equal(cleared.creationContext,undefined);assert.deepEqual(cleared.links,[other]);
 assert.equal(cleared.dirty,true);assert.ok(cleared.sequence>draft.sequence);
 const standalone=noteSaveCommand(cleared,'draft-1','source-cleared-save','another-note');
 assert.equal(standalone.data.links.length,1);assert.equal(standalone.data.links[0].family,'work');
 assert.equal(frozen.data.links[0].id,'reading','the in-flight frozen command must never be rewritten');
});
