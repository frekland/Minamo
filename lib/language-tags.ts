import {DomainError} from './domain-error';

/** Canonical organisation tags, not proof that any voice or curriculum exists. */
export function canonicalLanguageTag(value:unknown):string{
 if(typeof value!=='string'||value.length<2||value.length>48||!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(value))throw new DomainError(400,'invalid_learning_language','Use a valid BCP 47 source-language tag (for example ja, fr, tet, ar or zh-Hans).');
 try{const tags=Intl.getCanonicalLocales(value);if(tags.length===1)return tags[0];}catch{}
 throw new DomainError(400,'invalid_learning_language','Use a valid BCP 47 source-language tag (for example ja, fr, tet, ar or zh-Hans).');
}
export function tryLanguageTag(value:unknown):string|undefined{try{return canonicalLanguageTag(value);}catch{return undefined;}}
export function languageName(tag:string):string{
 try{return new Intl.DisplayNames(['en'],{type:'language'}).of(tag)??tag;}catch{return tag;}
}
