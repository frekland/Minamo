/** Dormant mathematical source contract. Typesetting is never evidence of calculation. */
export const MATH_CONTRACT='minamo.math.v1' as const;
export type MathExpression={contract:typeof MATH_CONTRACT;id:string;format:'tex';source:string;display:'inline'|'block';description?:string};
export class MathInputError extends Error {constructor(readonly code:string,message:string){super(message);this.name='MathInputError';}}
const plain=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
function fields(x:Record<string,unknown>,allowed:string[]){for(const k of Object.keys(x))if(!allowed.includes(k))throw new MathInputError('unknown_field','Unsupported mathematical field: '+k);}
/** Deliberately prohibits user macro definitions and resource/HTML primitives in addition to trust:false. */
export function validateTex(source:string){
 if(typeof source!=='string'||!source.length||source.length>8192)throw new MathInputError('source_budget','Use 1–8192 exact TeX UTF-16 characters.');
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(source))throw new MathInputError('source_control','Mathematical source contains unsupported control characters.');
 if(/\\(?:def|gdef|edef|xdef|let|futurelet|global|newcommand|renewcommand|providecommand|csname|expandafter|noexpand|catcode|includegraphics|href|url|htmlClass|htmlId|htmlStyle|htmlData|input|include|write|openout|read|require|class|style)\b/i.test(source))throw new MathInputError('unsafe_command','User macros, HTML, links, includes and external resources are unavailable.');
 let depth=0,commands=0;
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(c==='\\'){commands++;if(source[i+1]==='{'||source[i+1]==='}'||source[i+1]==='%'||source[i+1]==='\\')i++;continue;}
  if(c==='%'){while(i<source.length&&source[i]!=='\n')i++;continue;}
  if(c==='{'){if(++depth>32)throw new MathInputError('nesting_budget','TeX grouping exceeds 32 levels.');}
  if(c==='}'&&--depth<0)throw new MathInputError('unbalanced_source','TeX braces are unbalanced.');
 }
 if(depth!==0)throw new MathInputError('unbalanced_source','TeX braces are unbalanced.');
 if(commands>512)throw new MathInputError('command_budget','TeX exceeds 512 command tokens.');
 return source;
}
export function admitMathExpression(input:unknown):MathExpression{
 if(!plain(input))throw new MathInputError('invalid_shape','Use a mathematical expression object.');
 fields(input,['contract','id','format','source','display','description']);
 if(input.contract!==MATH_CONTRACT)throw new MathInputError('unsupported_version','Expected minamo.math.v1.');
 if(typeof input.id!=='string'||! /^[A-Za-z0-9_-]{1,100}$/.test(input.id))throw new MathInputError('invalid_id','Use a bounded mathematical expression id.');
 if(input.format!=='tex'||!['inline','block'].includes(String(input.display)))throw new MathInputError('invalid_shape','Use format:tex and display:inline or block.');
 if(typeof input.source!=='string')throw new MathInputError('invalid_shape','Exact TeX source is required.');
 validateTex(input.source);
 if(input.description!==undefined&&(typeof input.description!=='string'||input.description.length>1000))throw new MathInputError('description_budget','Description must be at most 1000 characters.');
 return Object.freeze({contract:MATH_CONTRACT,id:input.id,format:'tex',source:input.source,display:input.display as 'inline'|'block',...(input.description!==undefined?{description:input.description as string}:{})});
}
export function mathFallback(expression:MathExpression){const e=admitMathExpression(expression);return (e.description?e.description+'\n':'')+e.source+'\n[Authored mathematical notation; not evaluated or proved.]';}
export function mathDeclaration(expression:MathExpression){return '```minamo-math\n'+JSON.stringify(admitMathExpression(expression))+'\n```';}
export type MathPlacement={expression:MathExpression;from:number;to:number;exactDeclaration:string};
/** Explicit opt-in compiler only. Dollar signs, shell/code fences and old prose are never reinterpreted. */
export function readMathDeclarations(source:string):MathPlacement[]{
 if(typeof source!=='string'||source.length>220000)throw new MathInputError('document_budget','Mathematical declaration document exceeds 220000 characters.');
 const lines=[...source.matchAll(/[^\r\n]*(?:\r\n|\r|\n|$)/g)].filter(m=>m[0].length),out:MathPlacement[]=[];
 let fence:{char:string;length:number;math:boolean;from:number;body:string[]}|undefined;
 for(const line of lines){
  const text=line[0].replace(/[\r\n]+$/,''),m=/^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text);
  if(!fence){if(m)fence={char:m[1][0],length:m[1].length,math:m[2].trim()==='minamo-math',from:line.index!,body:[]};continue;}
  if(m&&m[1][0]===fence.char&&m[1].length>=fence.length&&!m[2].trim()){
   if(fence.math){let input;try{input=JSON.parse(fence.body.join('\n'));}catch{throw new MathInputError('invalid_json','Use one JSON expression in each minamo-math fence.');}const expression=admitMathExpression(input),to=line.index!+text.length;if(out.some(p=>p.expression.id===expression.id))throw new MathInputError('duplicate_id','Mathematical ids must be distinct within a document.');out.push({expression,from:fence.from,to,exactDeclaration:source.slice(fence.from,to)});if(out.length>300)throw new MathInputError('expression_budget','Use at most 300 mathematical expressions per document.');}
   fence=undefined;
  }else if(fence.math)fence.body.push(text);
 }
 if(fence?.math)throw new MathInputError('unclosed_declaration','Close the explicit minamo-math fence.');
 return out;
}
export type MathSourceCapture={contract:'minamo.math-capture.v1';expressionId:string;format:'tex';source:string;start:0;end:number;classification:'authored-content';execution:'not-executed-by-minamo'};
/** Partial decorative DOM selections cannot be mapped faithfully; capture the entire literal expression. */
export function captureMathSource(expression:MathExpression):MathSourceCapture{const e=admitMathExpression(expression);return {contract:'minamo.math-capture.v1',expressionId:e.id,format:'tex',source:e.source,start:0,end:e.source.length,classification:'authored-content',execution:'not-executed-by-minamo'};}

export type MathMLNode={tag:'mi'|'mn'|'mo'|'mtext';text:string}|{tag:'mrow'|'mfrac'|'msqrt'|'msup'|'msub'|'msubsup'|'munder'|'mover'|'munderover'|'mtable'|'mtr'|'mtd';children:MathMLNode[]};
const leaves=new Set(['mi','mn','mo','mtext']),arity:Record<string,number>={mfrac:2,msup:2,msub:2,msubsup:3,munder:2,mover:2,munderover:3};
/** Native MathML accepts a finite AST, never arbitrary XML, attributes, URLs or annotation-xml. */
export function admitMathML(input:unknown):MathMLNode{
 let count=0;
 const visit=(x:unknown,depth:number):MathMLNode=>{
  if(++count>512||depth>24)throw new MathInputError('mathml_budget','MathML exceeds 512 nodes or 24 levels.');
  if(!plain(x)||typeof x.tag!=='string')throw new MathInputError('invalid_mathml','Use a finite MathML node.');
  if(leaves.has(x.tag)){fields(x,['tag','text']);if(typeof x.text!=='string'||x.text.length>256||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(x.text))throw new MathInputError('invalid_mathml','MathML token text exceeds its limit.');return {tag:x.tag as 'mi',text:x.text};}
  if(!['mrow','mfrac','msqrt','msup','msub','msubsup','munder','mover','munderover','mtable','mtr','mtd'].includes(x.tag))throw new MathInputError('invalid_mathml','Unsupported MathML element.');
  fields(x,['tag','children']);if(!Array.isArray(x.children)||x.children.length<1||x.children.length>64||(arity[x.tag]&&x.children.length!==arity[x.tag]))throw new MathInputError('invalid_mathml','MathML children do not match element arity.');
  const children=x.children.map(c=>visit(c,depth+1));
  if(x.tag==='mtable'&&children.some(c=>c.tag!=='mtr')||x.tag==='mtr'&&children.some(c=>c.tag!=='mtd'))throw new MathInputError('invalid_mathml','MathML tables require row/cell structure.');
  return {tag:x.tag as 'mrow',children};
 };return visit(input,0);
}
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function serializeMathML(input:unknown,display:'inline'|'block'='block'){const n=admitMathML(input);const node=(x:MathMLNode):string=>'<'+x.tag+'>'+('text'in x?escape(x.text):x.children.map(node).join(''))+'</'+x.tag+'>';return '<math xmlns="http://www.w3.org/1998/Math/MathML" display="'+(display==='inline'?'inline':'block')+'">'+node(n)+'</math>';}
export const MATH_EXAMPLES:MathExpression[]=[
 {contract:MATH_CONTRACT,id:'integral',format:'tex',source:'\\int_0^1 x^2\\,dx = \\frac{1}{3}',display:'block',description:'Integral of x squared from zero to one equals one third. Authored statement, not a computed proof.'},
 {contract:MATH_CONTRACT,id:'euler',format:'tex',source:'e^{i\\pi}+1=0',display:'inline'},
 {contract:MATH_CONTRACT,id:'matrix',format:'tex',source:'\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\begin{bmatrix}x\\\\y\\end{bmatrix}',display:'block'},
 {contract:MATH_CONTRACT,id:'probability',format:'tex',source:'P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}',display:'block'},
 {contract:MATH_CONTRACT,id:'vector',format:'tex',source:'\\nabla\\cdot\\mathbf{E}=\\frac{\\rho}{\\varepsilon_0}',display:'block'},
 {contract:MATH_CONTRACT,id:'piecewise',format:'tex',source:'f(x)=\\begin{cases}x^2&x\\geq0\\\\-x&x<0\\end{cases}',display:'block'}
];
