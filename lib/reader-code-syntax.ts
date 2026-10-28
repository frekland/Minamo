import {classHighlighter,highlightTree} from '@lezer/highlight';
export type CodeToken={from:number;to:number;className:string};
/** Parse the original literal string, never EditorState's newline-normalised document. */
export async function codeTokens(text:string,language?:string):Promise<CodeToken[]>{
 const name=(language??'').toLowerCase();let parser;
 if(['js','javascript','jsx','ts','typescript','tsx','json'].includes(name)){const {javascriptLanguage,jsxLanguage,typescriptLanguage,tsxLanguage}=await import('@codemirror/lang-javascript');parser=(name==='jsx'?jsxLanguage:name==='tsx'?tsxLanguage:['ts','typescript'].includes(name)?typescriptLanguage:javascriptLanguage).parser;}
 else if(['py','python'].includes(name)){parser=(await import('@codemirror/lang-python')).pythonLanguage.parser;}
 else if(['sql','sqlite'].includes(name)){parser=(await import('@codemirror/lang-sql')).StandardSQL.language.parser;}
 else if(['sh','shell','bash','zsh'].includes(name)){
  const {StreamLanguage}=await import('@codemirror/language');
  parser=StreamLanguage.define({token(stream){if(stream.eatSpace())return null;if(stream.peek()==='#'){stream.skipToEnd();return 'comment';}if(stream.match(/^(?:"(?:[^"\\]|\\.)*"|'[^']*')/))return 'string';if(stream.match(/^\$[A-Za-z_][\w]*|^\$\{[^}]*\}/))return 'variableName';if(stream.match(/^(?:if|then|else|fi|for|do|done|while|case|esac|function)\b/))return 'keyword';if(stream.match(/^\d+\b/))return 'number';if(stream.match(/^[|&;<>]+/))return 'operator';stream.next();return null;}}).parser;
 }
 else return [];
 const tokens:CodeToken[]=[];highlightTree(parser.parse(text),classHighlighter,(from,to,className)=>tokens.push({from,to,className}));return tokens;
}
