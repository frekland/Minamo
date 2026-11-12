import {NOTE_CODE_LANGUAGES} from './note-code-languages';
export {NOTE_CODE_LANGUAGES} from './note-code-languages';
import {EditorState,TextSelection,NodeSelection,type Command,type Transaction} from 'prosemirror-state';
import {EditorView,type NodeView} from 'prosemirror-view';
import type {Node as ProseNode} from 'prosemirror-model';
import {baseKeymap,toggleMark,setBlockType,wrapIn,lift,exitCode} from 'prosemirror-commands';
import {wrapInList,splitListItem,sinkListItem,liftListItem} from 'prosemirror-schema-list';
import {history,undo,redo} from 'prosemirror-history';
import {keymap} from 'prosemirror-keymap';
import {inputRules,wrappingInputRule,textblockTypeInputRule,undoInputRule} from 'prosemirror-inputrules';
import {EditorView as CodeView,keymap as codeKeymap,lineNumbers,drawSelection} from '@codemirror/view';
import {EditorState as CodeState,Compartment} from '@codemirror/state';
import {defaultKeymap,indentWithTab} from '@codemirror/commands';
import {bracketMatching,indentOnInput,syntaxHighlighting,HighlightStyle} from '@codemirror/language';
import {tags} from '@lezer/highlight';
import {javascript} from '@codemirror/lang-javascript';
import {python} from '@codemirror/lang-python';
import {sql} from '@codemirror/lang-sql';
import {terminalDisplayText,terminalLineCount,TERMINAL_PROVENANCE,type TerminalCapture} from './note-terminal';
import {noteRichSchema,parseRichNote,serializeRichNote} from './note-rich-codec';
import {safeNoteLink,type NoteFormatAction} from './note-markdown';

export function richNoteState(source:string){const s=noteRichSchema;return EditorState.create({doc:parseRichNote(source),plugins:[history(),inputRules({rules:[
 wrappingInputRule(/^\s*>\s$/,s.nodes.blockquote),wrappingInputRule(/^\s*([-+*])\s$/,s.nodes.bullet_list),
 wrappingInputRule(/^(\d+)\.\s$/,s.nodes.ordered_list,match=>({order:+match[1]})),
 textblockTypeInputRule(/^(#{1,6})\s$/,s.nodes.heading,match=>({level:match[1].length})),
 textblockTypeInputRule(/^```([\w+-]*)\s$/,s.nodes.code_block,match=>({params:match[1]})),
]}),keymap({'Mod-z':undo,'Mod-y':redo,'Shift-Mod-z':redo,'Mod-b':toggleMark(s.marks.strong),'Mod-i':toggleMark(s.marks.em),'Mod-`':toggleMark(s.marks.code),'Enter':splitListItem(s.nodes.list_item),'Tab':sinkListItem(s.nodes.list_item),'Shift-Tab':liftListItem(s.nodes.list_item),'Backspace':undoInputRule}),keymap(baseKeymap)]})}
/** A create receipt changes the storage ID, not the active writing session.
 * Prefer its live state to a stale entry under the saved ID, retaining caret,
 * stored marks and undo history while the exact local source is unchanged. */
export function richNoteStateForIdentity(source:string,retained?:EditorState,live?:{state:EditorState;source:string;sameNote:boolean}):EditorState{
 if(live?.sameNote&&live.source===source)return live.state;
 if(retained&&retained.doc.eq(parseRichNote(source)))return retained;
 return richNoteState(source);
}
export function richNoteCommand(action:NoteFormatAction,state:EditorState,language='text',href='https://'):Command{
 const s=noteRichSchema;
 if(action==='bold'||action==='italic')return toggleMark(s.marks[action==='bold'?'strong':'em']);
 if(action==='heading')return setBlockType(state.selection.$from.parent.type===s.nodes.heading?s.nodes.paragraph:s.nodes.heading,{level:2});
 if(action==='code')return setBlockType(state.selection.$from.parent.type===s.nodes.code_block?s.nodes.paragraph:s.nodes.code_block,{params:language.replace(/[^\w.+-]/g,'').slice(0,40)});
 const ancestors=Array.from({length:state.selection.$from.depth},(_,i)=>state.selection.$from.node(i+1).type);
 if(action==='bullet')return ancestors.includes(s.nodes.bullet_list)?liftListItem(s.nodes.list_item):wrapInList(s.nodes.bullet_list);
 if(action==='quote')return ancestors.includes(s.nodes.blockquote)?lift:wrapIn(s.nodes.blockquote);
 if(!safeNoteLink(href))throw Error('Use an HTTPS link without credentials.');
 return toggleMark(s.marks.link,{href});
}
export function richNoteMarks(state:EditorState){const marks=state.storedMarks??state.selection.$from.marks(),active=(name:'strong'|'em'|'link')=>state.selection.empty?marks.some(mark=>mark.type===noteRichSchema.marks[name]):state.doc.rangeHasMark(state.selection.from,state.selection.to,noteRichSchema.marks[name]);return [
 ...(active('strong')?['bold']:[]),
 ...(active('em')?['italic']:[]),
 ...(active('link')?['link']:[]),
 ...(state.selection.$from.parent.type===noteRichSchema.nodes.heading?['heading']:[]),
 ...(state.selection.$from.parent.type===noteRichSchema.nodes.code_block?['code']:[]),
 ...Array.from({length:state.selection.$from.depth},(_,i)=>state.selection.$from.node(i+1).type.name).flatMap(name=>name==='bullet_list'?['bullet']:name==='blockquote'?['quote']:[]),
]}
function setCodeLanguageOptions(select:HTMLSelectElement,value:string){
 const selected=value||'text';select.replaceChildren();
 for(const language of NOTE_CODE_LANGUAGES){const option=document.createElement('option');option.value=language.value;option.textContent=language.label;select.appendChild(option);}
 // An older or externally authored language remains exact until deliberately changed.
 if(!NOTE_CODE_LANGUAGES.some(language=>language.value===selected)){const option=document.createElement('option');option.value=selected;option.textContent=selected;select.appendChild(option);}
 select.value=selected;
}
function codeLanguage(language:string){const name=language.trim().split(/\s/)[0].toLowerCase();return ['js','javascript','jsx','ts','typescript','tsx'].includes(name)?javascript({typescript:['ts','typescript','tsx'].includes(name),jsx:['jsx','tsx'].includes(name)}):['py','python'].includes(name)?python():['sql','sqlite'].includes(name)?sql():[]}
// Same accessible dark palette as canonical read-only code; CM's default palette targets a light canvas.
const noteCodeHighlightStyle=HighlightStyle.define([
 {tag:[tags.keyword,tags.modifier],color:'#ccadf5'},
 {tag:[tags.string,tags.special(tags.string)],color:'#a7d9ad'},
 {tag:[tags.number,tags.bool,tags.null],color:'#f1c28d'},
 {tag:tags.comment,color:'#a5b2ba',fontStyle:'italic'},
 {tag:[tags.function(tags.variableName),tags.typeName,tags.className],color:'#8dd8ef'},
 {tag:[tags.operator,tags.punctuation],color:'#c9d6df'},
 {tag:tags.propertyName,color:'#d8c69c'},
]);

/** Embedded editor changes become ProseMirror transactions, so one Note history owns text and code. */
export class NoteCodeView implements NodeView{
 dom:HTMLElement;cm:CodeView;node:ProseNode;updating=false;language=new Compartment();readOnly=new Compartment();label:HTMLSelectElement;wasReadOnly:boolean;
 constructor(node:ProseNode,readonly outer:EditorView,readonly getPos:()=>number|undefined){
  this.node=node;this.wasReadOnly=!outer.editable;this.dom=document.createElement('div');this.dom.className='nw-rich-code';
  const bar=document.createElement('div');bar.className='nw-rich-code-bar';const label=document.createElement('label');label.textContent='Code language ';this.label=document.createElement('select');setCodeLanguageOptions(this.label,node.attrs.params??'text');this.label.disabled=!outer.editable;this.label.setAttribute('aria-label','Code block language');this.label.onchange=()=>{const pos=this.getPos();if(pos!==undefined)this.outer.dispatch(this.outer.state.tr.setNodeMarkup(pos,undefined,{params:this.label.value.replace(/[^\w.+-]/g,'').slice(0,40)}))};label.appendChild(this.label);bar.appendChild(label);
  this.dom.appendChild(bar);
  this.cm=new CodeView({parent:this.dom,state:CodeState.create({doc:node.textContent,extensions:[lineNumbers(),drawSelection(),indentOnInput(),bracketMatching(),syntaxHighlighting(noteCodeHighlightStyle),this.language.of(codeLanguage(node.attrs.params??'')),this.readOnly.of(CodeState.readOnly.of(!outer.editable)),CodeView.lineWrapping,CodeView.contentAttributes.of({'aria-label':'Note code block editor',spellcheck:'false'}),codeKeymap.of([
   {key:'Mod-z',run:()=>{undo(outer.state,outer.dispatch);return true}},
   {key:'Mod-y',run:()=>{redo(outer.state,outer.dispatch);return true}},
   {key:'Mod-Shift-z',run:()=>{redo(outer.state,outer.dispatch);return true}},
   {key:'Mod-Enter',run:()=>{const pos=this.getPos();if(pos===undefined)return false;this.outer.dispatch(this.outer.state.tr.setSelection(TextSelection.create(this.outer.state.doc,pos+1+this.node.content.size)));exitCode(this.outer.state,this.outer.dispatch);this.outer.focus();return true}},indentWithTab,...defaultKeymap,
  ]),CodeView.updateListener.of(update=>{if(this.updating||!this.cm.hasFocus||(!update.docChanged&&!update.selectionSet))return;const pos=this.getPos();if(pos===undefined)return;const offset=pos+1,tr=outer.state.tr;
   update.changes.iterChanges((fromA,toA,fromB,toB,inserted)=>{tr.replaceWith(offset+fromB,offset+fromB+toA-fromA,inserted.length?noteRichSchema.text(inserted.toString()):[])});
   const selection=update.state.selection.main;tr.setSelection(TextSelection.create(tr.doc,offset+selection.anchor,offset+selection.head));outer.dispatch(tr);
  }),CodeView.theme({'&':{backgroundColor:'var(--mn-code-bg)',color:'var(--mn-code-text)',fontSize:'14px'},'.cm-content':{fontFamily:'ui-monospace,monospace',minHeight:'72px',padding:'10px 0'},'.cm-gutters':{backgroundColor:'var(--mn-code-bg)',color:'var(--mn-text-muted)',borderColor:'var(--mn-border)'},'.cm-scroller':{fontFamily:'ui-monospace,monospace'},'.cm-cursor':{borderLeftColor:'var(--mn-text)'},'.cm-selectionBackground,&.cm-focused .cm-selectionBackground':{backgroundColor:'var(--mn-selected)'}},{dark:true})]})});
 }
 update(node:ProseNode){if(node.type!==this.node.type)return false;this.updating=true;try{const effects=[];if(node.attrs.params!==this.node.attrs.params){setCodeLanguageOptions(this.label,node.attrs.params??'');effects.push(this.language.reconfigure(codeLanguage(node.attrs.params??'')))}if(this.wasReadOnly!==!this.outer.editable){this.wasReadOnly=!this.outer.editable;this.label.disabled=this.wasReadOnly;effects.push(this.readOnly.reconfigure(CodeState.readOnly.of(this.wasReadOnly)))}const text=node.textContent;const changes=text===this.cm.state.doc.toString()?undefined:{from:0,to:this.cm.state.doc.length,insert:text};if(changes||effects.length)this.cm.dispatch({...(changes?{changes}:{}),effects});this.node=node}finally{this.updating=false}return true}
 setSelection(anchor:number,head:number){this.updating=true;try{this.cm.focus();this.cm.dispatch({selection:{anchor,head}})}finally{this.updating=false}}
 stopEvent(){return true}ignoreMutation(){return true}destroy(){this.cm.destroy()}
}
/** Resolve from the current transaction, not a stale NodeView position after a fitted insert. */
export function continueAfterTerminal(tr:Transaction,captureId:string){let after:number|undefined;tr.doc.descendants((node,pos)=>{if(node.type.name==='terminal_capture'&&node.attrs.capture.id===captureId)after=pos+node.nodeSize});if(after===undefined)return tr;const following=tr.doc.nodeAt(after);if(!following?.isTextblock)tr.insert(after,noteRichSchema.nodes.paragraph.create());const position=Math.min(after+1,tr.doc.content.size);tr.setSelection(TextSelection.near(tr.doc.resolve(position),1));return tr;}
/** Atomic noneditable capture: folding/copying never becomes a document edit. */
export class NoteTerminalView implements NodeView{
 dom:HTMLElement;node:ProseNode;details:HTMLDetailsElement;
 constructor(node:ProseNode,readonly outer:EditorView,readonly getPos:()=>number|undefined,readonly edit:(capture:TerminalCapture,position:number)=>void){
  this.node=node;this.dom=document.createElement('section');this.dom.className='nw-terminal';this.dom.contentEditable='false';this.details=document.createElement('details');this.render();
 }
 render(){const capture=this.node.attrs.capture as TerminalCapture,wasOpen=this.details.open;this.dom.replaceChildren();this.dom.dataset.terminalCapture=capture.id;this.dom.setAttribute('aria-label','Terminal evidence '+(capture.label||capture.id));this.details=document.createElement('details');this.details.open=wasOpen;const summary=document.createElement('summary');summary.textContent='Terminal output'+(capture.environment?' · '+capture.environment:'')+' · '+terminalLineCount(capture.output)+' lines'+(capture.label?' · '+capture.label:'')+' · Expand / Collapse';this.details.appendChild(summary);
  if(capture.command){const command=document.createElement('div');command.className='nw-terminal-command';command.textContent='Command: '+terminalDisplayText(capture.command);this.details.appendChild(command)}
  const pre=document.createElement('pre');pre.tabIndex=0;pre.setAttribute('aria-label','Saved terminal output');pre.textContent=terminalDisplayText(capture.output);this.details.appendChild(pre);this.dom.appendChild(this.details);const preview=document.createElement('div');preview.className='nw-terminal-preview';preview.textContent=terminalDisplayText(capture.output).split('\n').slice(0,2).join('\n').slice(0,180);this.dom.appendChild(preview);const footer=document.createElement('footer'),provenance=document.createElement('small');provenance.textContent=TERMINAL_PROVENANCE+'. Display shows controls as escaped text; Copy preserves original text.';footer.appendChild(provenance);
  const status=document.createElement('span');status.setAttribute('role','status');const button=(text:string,action:()=>void,editable=false)=>{const el=document.createElement('button');el.type='button';el.textContent=text;el.disabled=editable&&!this.outer.editable;el.onclick=()=>{if(editable&&!this.outer.editable)return;action()};footer.appendChild(el);return el};
  button('Copy output',()=>{if(!navigator.clipboard?.writeText){status.textContent='Copy unavailable. Expand output to select text.';return}void navigator.clipboard.writeText(capture.output).then(()=>{status.textContent='Output copied.'},()=>{status.textContent='Copy unavailable. Expand output to select text.'})});
  button('Edit output',()=>{const pos=this.getPos();if(pos!==undefined)this.edit(capture,pos)},true);
  button('Remove output',()=>{const pos=this.getPos();if(pos!==undefined){this.outer.dispatch(this.outer.state.tr.delete(pos,pos+this.node.nodeSize));this.outer.focus()}},true);
  footer.appendChild(status);this.dom.appendChild(footer);
 }
 update(node:ProseNode){if(node.type!==this.node.type)return false;const changed=node!==this.node;this.node=node;if(changed)this.render();return true}
 stopEvent(){return true}ignoreMutation(){return true}
}
export {EditorView,TextSelection,NodeSelection,undo,redo,serializeRichNote};

// A single lazy entrypoint keeps the composing view and its codec on one module load.
export * from './note-rich-codec';
