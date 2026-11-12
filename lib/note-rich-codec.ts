import {Schema,type Node as ProseNode} from 'prosemirror-model';
import {MarkdownParser,MarkdownSerializer,defaultMarkdownParser,defaultMarkdownSerializer,schema as markdownSchema} from 'prosemirror-markdown';
import {noteImageMarker,parseNoteImagePlacements} from './note-image-placement';
import {safeNoteLink,noteMarkdownText} from './note-markdown';
import {terminalCaptureMarker,parseNoteTerminalPlacements} from './note-terminal';

/** The persisted contract remains markdown-v1. Private image nodes contain only a typed part ID. */
export const noteRichSchema=new Schema({
 nodes:markdownSchema.spec.nodes.addBefore('horizontal_rule','terminal_capture',{group:'block',atom:true,draggable:true,selectable:true,attrs:{capture:{}},toDOM:node=>['figure',{'data-terminal-capture':node.attrs.capture.id},'Terminal output'],parseDOM:[]}).addBefore('horizontal_rule','private_image',{
  group:'block',atom:true,draggable:true,selectable:true,attrs:{partId:{}},
  toDOM:node=>['figure',{'data-private-note-image':node.attrs.partId},'Private image'],
  parseDOM:[{tag:'figure[data-private-note-image]',getAttrs:element=>({partId:(element as HTMLElement).getAttribute('data-private-note-image')})}],
 }),
 marks:markdownSchema.spec.marks.update('link',{
  ...markdownSchema.spec.marks.get('link')!,
  toDOM:mark=>['a',{...(safeNoteLink(mark.attrs.href)?{href:mark.attrs.href}:{}),rel:'noopener noreferrer',title:mark.attrs.title},0],
 }),
});
const parser=new MarkdownParser(noteRichSchema,defaultMarkdownParser.tokenizer,defaultMarkdownParser.tokens);
const serializer=new MarkdownSerializer({...defaultMarkdownSerializer.nodes,

 code_block:(state,node)=>{
  // Unlike the CommonMark default, bare code never becomes indentation that markdown-v1 cannot read.
  const fence='`'.repeat(Math.max(3,...(node.textContent.match(/^\s*`{3,}/gm)??[]).map(run=>run.trim().length+1)));
  state.write(fence+(node.attrs.params??'')+'\n');state.text(node.textContent,false);state.write('\n');state.write(fence);state.closeBlock(node);
 },
 terminal_capture:(state,node)=>{state.write(terminalCaptureMarker(node.attrs.capture));state.closeBlock(node)},
 private_image:(state,node)=>{state.write(noteImageMarker(node.attrs.partId));state.closeBlock(node)},
},defaultMarkdownSerializer.marks);
export function parseRichNote(source:string):ProseNode{
 const blocks:ProseNode[]=[];let offset=0;
 // CommonMark strips edge spaces from paragraphs. Rich typing can be saved
 // while the caret follows a space; reopening must preserve that exact text.
 const paragraphWhitespace=(node:ProseNode,chunk:string)=>{
  if(node.type!==noteRichSchema.nodes.paragraph)return node;
  const trimmed=chunk.replace(/^(?:\r\n|\r|\n)+/,'').replace(/(?:\r\n|\r|\n)+$/,''),leading=/^ {1,3}(?=\S)/.exec(trimmed)?.[0],trailing=/ +$/.exec(trimmed)?.[0];
  if(leading&&!node.textContent.startsWith(leading))node=node.type.create(node.attrs,node.content.addToStart(noteRichSchema.text(leading)));
  if(trailing&&!node.textContent.endsWith(trailing))node=node.type.create(node.attrs,node.content.addToEnd(noteRichSchema.text(trailing)));
  return node;
 };
 const append=(chunk:string)=>{
  const nodes:ProseNode[]=[];parser.parse(chunk).forEach(node=>nodes.push(node));
  const chunks=chunk.split(/(?:\r\n|\r|\n)[ \t]*(?:\r\n|\r|\n)+/).filter(value=>value.trim());
  if(chunks.length===nodes.length)for(let index=0;index<nodes.length;index++)nodes[index]=paragraphWhitespace(nodes[index],chunks[index]);
  else if(nodes.length){nodes[0]=paragraphWhitespace(nodes[0],chunk.replace(/ +$/,''));const last=nodes.length-1;nodes[last]=paragraphWhitespace(nodes[last],chunk.replace(/^ +/,''));}
  blocks.push(...nodes);
 };
 const placements=[...parseNoteImagePlacements(source).map(p=>({...p,kind:'image' as const})),...parseNoteTerminalPlacements(source).map(p=>({...p,kind:'terminal' as const}))].sort((a,b)=>a.from-b.from);
 for(const placement of placements){
  const before=source.slice(offset,placement.from);if(before.trim())append(before);
  blocks.push(placement.kind==='terminal'?noteRichSchema.nodes.terminal_capture.create({capture:placement.capture}):noteRichSchema.nodes.private_image.create({partId:placement.partId}));offset=placement.to;
 }
 const after=source.slice(offset);if(after.trim()||!blocks.length)append(after);
 return noteRichSchema.nodes.doc.create(null,blocks);
}
export function serializeRichNote(doc:ProseNode,originalSource?:string){
 const source=serializer.serialize(doc);if(!originalSource)return source;
 // Preserve a legacy Note's uniform line-ending convention, including code bytes, through rich edits.
 if(originalSource.includes('\r\n')&&!/(?<!\r)\n|\r(?!\n)/.test(originalSource))return source.replace(/\n/g,'\r\n');
 if(originalSource.includes('\r')&&!originalSource.includes('\n'))return source.replace(/\n/g,'\r');
 return source;
}
export function richNoteImages(doc:ProseNode){const ids:string[]=[];doc.descendants(node=>{if(node.type.name==='private_image')ids.push(node.attrs.partId)});return ids}
/** Never silently convert a legacy construct that the rich schema cannot faithfully edit. */
export function richNoteCompatibility(source:string):{supported:true}|{supported:false;reason:string}{
 if((source.includes('\r\n')&&/(?<!\r)\n|\r(?!\n)/.test(source))||(source.includes('\r')&&source.includes('\n')&&!source.includes('\r\n')))return {supported:false,reason:'This Note uses mixed line endings. Its original source editor preserves those exact code and text bytes.'};
 const withoutCode=source.replace(/^\s*```[^\n]*\n[\s\S]*?^\s*```\s*$/gm,'');
 if(/^\s*(?:`{4,}|~{3,})/m.test(source))return {supported:false,reason:'This Note contains a complex code fence. Its original source editor preserves that text without changing the markdown-v1 content contract.'};
 if(/(^|\n)\s*\|?.+\|.+\n\s*\|?\s*:?-{3,}/.test(withoutCode)||/(^|\n)\s*[-*+]\s+\[[ xX]\]\s/.test(withoutCode)||/~~[^\n]+~~/.test(withoutCode))return {supported:false,reason:'This Note contains a table, task list or strikethrough. Use its original source editor to preserve these constructs.'};
 try{const doc=parseRichNote(source),saved=serializeRichNote(doc);if(!doc.eq(parseRichNote(saved))||noteMarkdownText(source)!==noteMarkdownText(saved))return {supported:false,reason:'This Note contains source that needs its original source editor for a lossless edit.'};return {supported:true}}catch{return {supported:false,reason:'This Note needs its original source editor; its saved text has not been converted.'}}
}
