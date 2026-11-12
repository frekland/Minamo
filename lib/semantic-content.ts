import {admitLanguageText,type LanguageText} from './foundry/language';
import {admitMathExpression,type MathExpression} from './foundry/math';
import {assertJsonBudget} from './foundry/platform';

/** Optional authored metadata; canonical source remains the existing part.text. */
export type SemanticContent=
 | {contract:'minamo.semantic.v1';kind:'ruby';language:LanguageText}
 | {contract:'minamo.semantic.v1';kind:'math';expression:MathExpression};
export function admitSemanticContent(input:unknown,canonicalText?:string):SemanticContent{
 assertJsonBudget(input);
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('semantic must be a typed minamo.semantic.v1 object.');
 const value=input as Record<string,unknown>;
 if(value.contract!=='minamo.semantic.v1'||!['ruby','math'].includes(String(value.kind)))throw Error('semantic.contract must be minamo.semantic.v1 and kind must be ruby or math.');
 const allowed=value.kind==='ruby'?['contract','kind','language']:['contract','kind','expression'];
 if(Object.keys(value).some(key=>!allowed.includes(key)))throw Error('semantic contains an unsupported field.');
 const admitted:SemanticContent=value.kind==='ruby'?{contract:'minamo.semantic.v1',kind:'ruby',language:admitLanguageText(value.language)}:{contract:'minamo.semantic.v1',kind:'math',expression:admitMathExpression(value.expression)};
 if(canonicalText!==undefined&&semanticCanonicalText(admitted)!==canonicalText)throw Error('semantic source must match part.text exactly. Update text and semantic metadata together, or remove the decoration.');
 return admitted;
}
export function semanticCanonicalText(value:SemanticContent):string{return value.kind==='ruby'?value.language.text:value.expression.source;}
export function semanticSearchText(value:SemanticContent):string{const v=admitSemanticContent(value);return v.kind==='ruby'?[v.language.text,v.language.pronunciation??'',v.language.grammar??'',v.language.translation?.text??'',...v.language.spans.flatMap(span=>[span.reading,span.gloss??'',span.grammar??'',span.lemma??'',span.senseId??'']),...(v.language.phrases??[]).map(phrase=>phrase.explanation)].join('\n'):[v.expression.source,v.expression.description??''].join('\n');}
export const semanticContentJsonSchema={oneOf:[
 {type:'object',properties:{contract:{const:'minamo.semantic.v1'},kind:{const:'ruby'},language:{type:'object',properties:{version:{const:1},text:{type:'string',maxLength:24000},sourceScript:{type:'string',pattern:'^[A-Z][a-z]{3}$'},phrases:{type:'array',maxItems:128,items:{type:'object',properties:{start:{type:'integer',minimum:0},end:{type:'integer',minimum:1},base:{type:'string',maxLength:24000},explanation:{type:'string',minLength:1,maxLength:1200},targetStart:{type:'integer',minimum:0},targetEnd:{type:'integer',minimum:1},source:{type:'string',maxLength:600}},required:['start','end','base','explanation'],additionalProperties:false}},pronunciation:{type:'string',maxLength:1200},grammar:{type:'string',maxLength:1200},translation:{type:'object',properties:{text:{type:'string',maxLength:24000},language:{type:'string',maxLength:40},direction:{enum:['ltr','rtl']},provenance:{enum:['authored-translation','supplied-translation']},source:{type:'string',maxLength:600}},required:['text','language','direction','provenance'],additionalProperties:false},language:{type:'string',maxLength:40},direction:{enum:['ltr','rtl']},spans:{type:'array',maxItems:256,items:{type:'object',properties:{start:{type:'integer',minimum:0},end:{type:'integer',minimum:1},base:{type:'string',maxLength:24000},reading:{type:'string',maxLength:240},origin:{enum:['author-verified','machine-proposed']},lemma:{type:'string',maxLength:600},senseId:{type:'string',maxLength:600},gloss:{type:'string',maxLength:600},grammar:{type:'string',maxLength:600},source:{type:'string',maxLength:600}},required:['start','end','base','reading','origin'],additionalProperties:false}}},required:['version','text','language','direction','spans'],additionalProperties:false}},required:['contract','kind','language'],additionalProperties:false},
 {type:'object',properties:{contract:{const:'minamo.semantic.v1'},kind:{const:'math'},expression:{type:'object',properties:{contract:{const:'minamo.math.v1'},id:{type:'string',maxLength:100},format:{const:'tex'},source:{type:'string',maxLength:8192},display:{enum:['inline','block']},description:{type:'string',maxLength:1000}},required:['contract','id','format','source','display'],additionalProperties:false}},required:['contract','kind','expression'],additionalProperties:false}
]};
