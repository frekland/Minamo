import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));const {build}=wr('esbuild');
async function module(path){const result=await build({entryPoints:[path],bundle:true,format:'esm',platform:'node',write:false});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))}
const rich=await module('lib/note-rich-codec.ts');
const {noteSaveDelay,reconcileNoteReceipt,editedNoteDraft}=await module('lib/note-sync.ts');
const source='# My **working** idea\n\n- First\n  - Nested *reason*\n- Second\n\n> Provisional, not proved.\n\nA [reference](https://example.com) and `value`.\n\n```javascript\nconst mood = "😄";\nconsole.log(mood);\n```\n\n[[minamo-image:v1:image-example]]\n\nAfter the private image.';
test('rich document round-trips nested formatting, exact Unicode code and typed private image identity',()=>{const doc=rich.parseRichNote(source);const saved=rich.serializeRichNote(doc);assert.ok(doc.eq(rich.parseRichNote(saved)));assert.deepEqual(rich.richNoteImages(doc),['image-example']);let code;doc.descendants(node=>{if(node.type.name==='code_block')code=node});assert.equal(code.textContent,'const mood = "😄";\nconsole.log(mood);');assert.equal(code.attrs.params,'javascript');assert.match(saved,/\[\[minamo-image:v1:image-example\]\]/);assert.match(saved,/Nested \*reason\*/);});
test('image-like source inside code remains literal code rather than becoming an attachment',()=>{const doc=rich.parseRichNote('```text\n[[minamo-image:v1:code-only]]\n```');assert.deepEqual(rich.richNoteImages(doc),[]);assert.equal(doc.firstChild.type.name,'code_block');assert.match(rich.serializeRichNote(doc),/code-only/)});
test('remote images remain source nodes, not private asset claims',()=>{const doc=rich.parseRichNote('![remote](https://example.com/private.jpg)');assert.deepEqual(rich.richNoteImages(doc),[]);assert.equal(doc.firstChild.firstChild.type.name,'image');assert.equal(doc.firstChild.firstChild.attrs.src,'https://example.com/private.jpg')});
test('safe text edits preserve quoted literal Markdown, code fences and source content',()=>{const samples=['# literal \\*word\\* and \\`code\\`','```python\nprint("``` is data 😄")\n```','1. First\n2. Second\n\n---\n\n**bold *inside***','<script>alert(1)</script>','Line one\nLine two'];for(const source of samples){const doc=rich.parseRichNote(source),saved=rich.serializeRichNote(doc);assert.ok(doc.eq(rich.parseRichNote(saved)),saved)}});
test('autosave waits for a writing pause and bounds long typing without per-keystroke remote churn',()=>{assert.equal(noteSaveDelay({dirtySince:1000,editedAt:1000},1000),650);assert.equal(noteSaveDelay({dirtySince:1000,editedAt:3500},3500),650);assert.equal(noteSaveDelay({dirtySince:1000,editedAt:4900},4900),100);assert.equal(noteSaveDelay({dirtySince:1000,editedAt:5100},5100),0);assert.equal(noteSaveDelay({dirtySince:1000,editedAt:1000},1700),0)});
test('save acknowledgement preserves newer rich writing and revision conflicts',()=>{const sent={title:'Example',body:'**first**',baseRev:2,dirty:true,intent:'update',sequence:1,dirtySince:1000,editedAt:1000};const command={operationId:'op',action:'update',family:'note',id:'note',expectedRev:2};const local={...sent,body:'**first** and *newer*',sequence:2};const result=reconcileNoteReceipt(local,{command,sequence:1,sent},{operationId:'op',status:'committed',recordRef:{family:'note',id:'note',rev:3}});assert.equal(result.draft.body,local.body);assert.equal(result.draft.dirty,true);assert.equal(result.draft.baseRev,3);const bad=reconcileNoteReceipt(local,{command,sequence:1,sent},{operationId:'wrong',status:'committed',recordRef:{family:'note',id:'note',rev:3}});assert.equal(bad.draft.paused,true);assert.equal(bad.draft.body,local.body)});
const editor=await module('lib/note-rich-editor.ts');
test('real rich formatting, undo/redo and separate Note histories preserve content through the saved codec',()=>{let a=editor.richNoteState('A useful idea 😄'),b=editor.richNoteState('Other Note');const dispatch=tr=>{a=a.apply(tr)};a=a.apply(a.tr.setSelection(editor.TextSelection.create(a.doc,3,9)));assert.equal(editor.richNoteCommand('bold',a)(a,dispatch),true);assert.equal(editor.serializeRichNote(a.doc),'A **useful** idea 😄');assert.equal(editor.undo(a,dispatch),true);assert.equal(editor.serializeRichNote(a.doc),'A useful idea 😄');a=a.apply(a.tr.setSelection(editor.TextSelection.create(a.doc,1,1)));assert.equal(editor.redo(a,dispatch),true);assert.equal(editor.serializeRichNote(a.doc),'A **useful** idea 😄');assert.equal(editor.serializeRichNote(b.doc),'Other Note');assert.equal(editor.undo(a,dispatch),true);a=a.apply(a.tr.insertText('Changed ',1));assert.equal(editor.redo(a,dispatch),false);assert.match(editor.serializeRichNote(a.doc),/^Changed A useful/)});
test('rich source preserves nested list semantics and private image nodes across a code edit',()=>{let a=editor.richNoteState(source),codePos; a.doc.descendants((node,pos)=>{if(node.type.name==='code_block')codePos=pos});const tr=a.tr.insertText('// Actual edit\n',codePos+1);a=a.apply(tr);const saved=editor.serializeRichNote(a.doc);assert.deepEqual(rich.richNoteImages(rich.parseRichNote(saved)),['image-example']);assert.match(saved,/Nested \*reason\*/);assert.match(saved,/\/\/ Actual edit/);let restored=a;editor.undo(a,tr=>{restored=a.apply(tr)});assert.deepEqual(restored.doc.toJSON(),rich.parseRichNote(source).toJSON())});

test('legacy tables, task lists and strikethrough require explicit source editing rather than lossy conversion',()=>{for(const source of ['| A | B |\n| --- | --- |\n| x | y |','- [x] Complete','Do ~~not~~ change']){assert.equal(rich.richNoteCompatibility(source).supported,false)}assert.equal(rich.richNoteCompatibility('# Heading\n\nA **real** note.').supported,true)});

test('legacy uniform CRLF code bytes survive unrelated edits; mixed endings choose lossless source editing',()=>{const source='# Heading\r\n\r\n```javascript\r\nconst x = "😄";\r\nconsole.log(x);\r\n```\r\n';const doc=rich.parseRichNote(source);const saved=rich.serializeRichNote(doc,source);assert.match(saved,/```javascript\r\nconst x = "😄";\r\nconsole.log\(x\);\r\n```/);assert.equal(/(?<!\r)\n/.test(saved),false);assert.equal(rich.richNoteCompatibility(source).supported,true);assert.equal(rich.richNoteCompatibility(source+'\nMixed').supported,false)});

test('bare-language code stays fenced for the established canonical reader; complex fences use source fallback',()=>{const source='```\nprint(1)\n```';const doc=rich.parseRichNote(source),saved=rich.serializeRichNote(doc);assert.equal(saved,source);assert.equal(rich.richNoteCompatibility(source).supported,true);assert.equal(rich.richNoteCompatibility('````text\n```\n````').supported,false)});

test('typing after a rejected or uncertain save preserves the actionable pause reason until explicit resolution',()=>{const current={title:'Example',body:'old',baseRev:2,dirty:true,intent:'update',sequence:3,paused:true,message:'Save rejected: owner authentication required. Your draft is retained.'};const next=editedNoteDraft(current,{body:'new writing'},100);assert.equal(next.paused,true);assert.equal(next.message,current.message);assert.equal(next.body,'new writing');assert.equal(next.sequence,4);const resolved=editedNoteDraft(next,{paused:false,baseRev:3},200);assert.equal(resolved.paused,false);assert.match(resolved.message,/queued for autosave/);assert.doesNotMatch(resolved.message,/retained on this device/)});

test('code preserves trailing blank lines and inline backticks without introducing incompatible fences',()=>{for(const source of ['```text\nfirst\n\n```','```python\nprint("``` is data")\n```']){const doc=rich.parseRichNote(source),saved=rich.serializeRichNote(doc);assert.equal(saved,source);assert.equal(rich.richNoteCompatibility(source).supported,true)}});

const {closeNotesMenus}=await module('lib/notes-window.ts');
test('selecting or writing closes both native New Note menus without touching retained draft state',()=>{const bar={open:true},panel={open:true},unrelated={body:'retained writing',dirty:true};closeNotesMenus([bar,panel]);assert.equal(bar.open,false);assert.equal(panel.open,false);assert.deepEqual(unrelated,{body:'retained writing',dirty:true});closeNotesMenus([bar,panel]);assert.equal(panel.open,false)});

// Actual browser first-save regression: a caret after a typed space must not
// force a rich Note into source fallback when its temporary identity is saved.
test('ordinary typed paragraph edge spaces remain exact and rich-compatible across first save',()=>{
 for(const source of ['hello ','hello  ',' hello','A😀é 日本語. ','first \n\nsecond  ',' **bold** \n\nlast ']){
  const doc=rich.parseRichNote(source),saved=rich.serializeRichNote(doc);
  assert.equal(saved,source);assert.equal(rich.richNoteCompatibility(source).supported,true);
  assert.ok(doc.eq(rich.parseRichNote(saved)));
 }
});

test('first-save identity adoption preserves the live caret and undo history ahead of a stale saved-ID state',()=>{
 let live=editor.richNoteState('');live=live.apply(live.tr.insertText('TEST ONLY trailing space '));
 const source=editor.serializeRichNote(live.doc),stale=editor.richNoteState(source);
 assert.equal(stale.selection.from,1);assert.equal(live.selection.from,source.length+1);
 let adopted=editor.richNoteStateForIdentity(source,stale,{state:live,source,sameNote:true});
 assert.equal(adopted,live);adopted=adopted.apply(adopted.tr.insertText('NEXT'));
 assert.equal(editor.serializeRichNote(adopted.doc),source+'NEXT');
 const other=editor.richNoteStateForIdentity('Other Note',stale,{state:live,source,sameNote:false});
 assert.equal(editor.serializeRichNote(other.doc),'Other Note');
 const external=editor.richNoteStateForIdentity('External replacement',stale,{state:live,source,sameNote:true});
 assert.equal(editor.serializeRichNote(external.doc),'External replacement');
});

test('selected formatting at an unmarked boundary reports active toolbar state and toggles off',()=>{
 let state=editor.richNoteState('before after');
 state=state.apply(state.tr.setSelection(editor.TextSelection.create(state.doc,8,13)));
 assert.equal(editor.richNoteMarks(state).includes('bold'),false);
 editor.richNoteCommand('bold',state)(state,tr=>{state=state.apply(tr)});
 assert.equal(editor.serializeRichNote(state.doc),'before **after**');
 assert.equal(editor.richNoteMarks(state).includes('bold'),true);
 editor.richNoteCommand('bold',state)(state,tr=>{state=state.apply(tr)});
 assert.equal(editor.richNoteMarks(state).includes('bold'),false);
});
