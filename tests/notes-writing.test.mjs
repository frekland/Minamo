import {test} from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));const {build}=wr('esbuild');
async function module(path){const result=await build({entryPoints:[path],bundle:true,format:'esm',platform:'node',write:false,loader:{'.css':'empty'}});return import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'))}
const {parseNoteMarkdown,noteMarkdownText,noteFormatChange,safeNoteLink}=await module('lib/note-markdown.ts');
const {acknowledgeNoteIdentity,resizedNotesSize,clampNotesSize,escapePlainNoteForMarkdown}=await module('lib/notes-window.ts');
const {additionalNoteContexts,primaryNoteSourceLink}=await module('lib/note-sync.ts');
test('Note source is shown once; distinct contextual links remain available',()=>{
 const source={family:'journey',id:'japanese-live',sectionId:'dialogue',rendition:'v1'};
 const other={family:'article',id:'reading'};
 const differentSection={...source,sectionId:'grammar'};
 assert.deepEqual(additionalNoteContexts([source,other,differentSection],source),[other,differentSection]);
 assert.deepEqual(additionalNoteContexts([source],source),[]);
 assert.deepEqual(additionalNoteContexts([source],undefined),[source]);
});
test('a reopened Note finds its original source without browser-local creation metadata',()=>{
 const project={family:'journey',id:'japanese-live',sectionId:'read'};
 const other={family:'article',id:'grammar'};
 const anchor={articleId:'japanese-live',recordFamily:'journey',rendition:'one',sectionId:'read',partId:'p',start:0,end:2,quote:'本'};
 assert.equal(primaryNoteSourceLink([project],undefined,anchor),project);
 assert.equal(primaryNoteSourceLink([other,project],undefined,anchor),project);
 assert.equal(primaryNoteSourceLink([other,project]),undefined);
 assert.equal(primaryNoteSourceLink([other,project],other),other);
});
test('headings, emphasis, lists, quotes, code and links share one deterministic readable projection',()=>{const source='# A **useful** idea\n\nA *small* [reference](https://example.com) and `x`.\n\n- First\n- Second\n> Keep uncertainty\n```python\nprint("😄")\n```';assert.equal(noteMarkdownText(source),'A useful idea\nA small reference and x.\nFirst\nSecond\nKeep uncertainty\nprint("😄")\n');const text=noteMarkdownText(source);for(const block of parseNoteMarkdown(source))for(const run of block.runs)assert.equal(text.slice(run.start,run.end),run.text)});
test('canonical code normalises CRLF and CR to LF for SSR while authored source stays exact',()=>{const source='```python\r\nfirst\r\nα 😄 e\u0301\rthird\r\n```\r\n';assert.equal(noteMarkdownText(source),'first\nα 😄 e\u0301\nthird\n');assert.equal(source.includes('\r\n'),true);assert.equal(source.includes('e\u0301'),true);assert.equal(noteMarkdownText('```\n```'),'');});
test('unsafe URLs remain literal text and HTML is never an executable codec node',()=>{assert.equal(safeNoteLink('javascript:alert(1)'),undefined);assert.equal(safeNoteLink('https://user:pass@example.com'),undefined);assert.equal(noteMarkdownText('[bad](javascript:alert(1)) <script>x</script>'),'[bad](javascript:alert(1)) <script>x</script>');assert.equal(parseNoteMarkdown('<script>x</script>')[0].kind,'paragraph')});
test('safe Note tables preserve headers, distinct cells, inline marks and exact projection offsets',()=>{
 const source='Why this matters\n\n| Hypothesis | Evidence | Uncertainty |\n| :--- | ---: | --- |\n| **Depth** | [Article r2](https://example.org/source) | Not observed |\n| Contrast | `image | crop` | a \\| b |\n\nAfter the table.';
 const blocks=parseNoteMarkdown(source),table=blocks.find(block=>block.kind==='table');
 assert.ok(table);assert.equal(table.rows.length,3);assert.equal(table.rows[0].cells.length,3);
 assert.equal(table.rows[1].cells[0][0].bold,true);
 assert.equal(table.rows[1].cells[1][0].href,'https://example.org/source');
 assert.equal(table.rows[2].cells[1][0].text,'image | crop');
 assert.equal(table.rows[2].cells[2][0].text,'a | b');
 const visible=noteMarkdownText(source);assert.match(visible,/Hypothesis \| Evidence \| Uncertainty/);assert.match(visible,/Depth \| Article r2 \| Not observed/);
 assert.match(visible,/\| :--- \| ---: \| --- \|/,'legacy table divider remains in the canonical projection');
 assert.match(table.text,/^\| Hypothesis \| Evidence \| Uncertainty \|\n\| :---/,'exact saved text offsets include leading pipes and rule row');
 for(const block of blocks)for(const run of block.runs)assert.equal(visible.slice(run.start,run.end),run.text);
 for(const row of table.rows)for(const cell of row.cells)for(const run of cell)assert.equal(visible.slice(run.start,run.end),run.text);
 assert.equal(blocks.at(-1).text,'After the table.');
});
test('apparent tables without a valid delimiter, excessive width and code fences remain literal',()=>{
 assert.equal(parseNoteMarkdown('A | B\nnot | a divider')[0].kind,'paragraph');
 assert.equal(parseNoteMarkdown('```text\n| A | B |\n| --- | --- |\n```')[0].kind,'code');
 const large='| '+Array.from({length:13},(_,i)=>'H'+i).join(' | ')+' |\n| '+Array.from({length:13},()=> '---').join(' | ')+' |';
 assert.equal(parseNoteMarkdown(large)[0].kind,'paragraph');
});
test('formatting transactions keep exact selected occurrence and Unicode code untouched',()=>{const source='same same 😄';const change=noteFormatChange(source,5,9,'bold');assert.equal(source.slice(0,change.from)+change.insert+source.slice(change.to),'same **same** 😄');assert.equal(change.selectionFrom,7);assert.equal(change.selectionTo,11);const code=noteFormatChange('α 😄',0,5,'code','python');assert.equal(code.insert,'```python\nα 😄\n```\n');assert.throws(()=>noteFormatChange('text',0,4,'link','text','javascript:alert(1)'),/HTTPS/)});
test('late Note A acknowledgement preserves active Note B text, selection identity and closed tabs',()=>{const a={body:'A pending',dirty:true},b={body:'B still typing',dirty:true};const state={selected:'draft-b',tabs:['draft-b'],closedTabs:['draft-a'],drafts:{'draft-a':a,'draft-b':b}};const next=acknowledgeNoteIdentity(state,'draft-a','saved-a',{body:'A acknowledged',dirty:false});assert.equal(next.selected,'draft-b');assert.equal(next.drafts['draft-b'],b);assert.deepEqual(next.tabs,['draft-b']);assert.deepEqual(next.closedTabs,['saved-a']);assert.equal(next.drafts['draft-a'],undefined)});
test('first save renames its active tab once without creating another Note or losing other blanks',()=>{const state={selected:'draft-a',tabs:['draft-a','draft-b'],closedTabs:[],drafts:{'draft-a':'A','draft-b':''}};const next=acknowledgeNoteIdentity(state,'draft-a','saved-a','A saved');assert.equal(next.selected,'saved-a');assert.deepEqual(next.tabs,['saved-a','draft-b']);assert.equal(next.drafts['draft-b'],'')});
test('all four pointer resize directions grow toward reading and clamp to available viewport',()=>{const viewport={width:1200,height:900};assert.equal(resizedNotesSize('left',400,50,viewport),450);assert.equal(resizedNotesSize('right',400,-50,viewport),450);assert.equal(resizedNotesSize('top',400,50,viewport),450);assert.equal(resizedNotesSize('bottom',400,-50,viewport),450);assert.equal(clampNotesSize('right',5000,viewport),1152);assert.equal(clampNotesSize('top',-1,viewport),240)});
test('explicit plain-to-rich upgrade preserves existing punctuation and apparent Markdown literally',()=>{const plain='# literal *word* [name] and `code`';assert.equal(noteMarkdownText(escapePlainNoteForMarkdown(plain)),plain)});
test('actual CodeMirror formatting is undoable and separate Note EditorStates retain independent histories',async()=>{const {EditorState}=await import('@codemirror/state');const {history,undo}=await import('@codemirror/commands');let a=EditorState.create({doc:'same same 😄',extensions:[history()]});let b=EditorState.create({doc:'Other note',extensions:[history()]});const change=noteFormatChange(a.doc.toString(),5,9,'bold');a=a.update({changes:{from:change.from,to:change.to,insert:change.insert},selection:{anchor:change.selectionFrom,head:change.selectionTo},userEvent:'input.format'}).state;b=b.update({changes:{from:b.doc.length,insert:' stays'}}).state;assert.equal(a.doc.toString(),'same **same** 😄');assert.equal(a.sliceDoc(a.selection.main.from,a.selection.main.to),'same');const target={get state(){return a},dispatch(transaction){a=transaction.state}};assert.equal(undo(target),true);assert.equal(a.doc.toString(),'same same 😄');assert.equal(b.doc.toString(),'Other note stays');});
