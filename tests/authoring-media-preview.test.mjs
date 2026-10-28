import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'import React from "react";import{renderToStaticMarkup}from"react-dom/server";import{RichSectionsEditor}from"./app/rich-authoring";import{ProposedReading,LocalReadingPreview}from"./app/authoring-preview";import ReadingMedia from "./app/reading-media";export function editor(sections,ownerScope){return renderToStaticMarkup(React.createElement(RichSectionsEditor,{sections,ownerScope,onChange:()=>{}}));}export function preview(record,ownerScope){return renderToStaticMarkup(React.createElement(ProposedReading,{record,ownerScope}));}export function local(sections,ownerScope){return renderToStaticMarkup(React.createElement(LocalReadingPreview,{sections,ownerScope}));}export function media(media,ownerScope,readOnly){return renderToStaticMarkup(React.createElement(ReadingMedia,{media,ownerScope,readOnly,children:"Authored metadata"}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'authoring-media-preview-')),entry=join(dir,'preview.cjs');writeFileSync(entry,built.outputFiles[0].text);const {editor,preview,local,media}=require(entry);rmSync(dir,{recursive:true,force:true});
const ownerScope='TEST-ONLY-media-preview:generation:restored@3';
const attachment={assetId:'media-'+'a'.repeat(64),kind:'audio',description:'Licensed synthetic greeting specimen.',caption:'Original speaker credited in the source.',transcript:'こんにちは'};
const part={id:'new-audio',kind:'media',media:attachment,text:attachment.description+'\n'+attachment.caption+'\n'+attachment.transcript};
const base=[{id:'speech',title:'Greeting source',parts:[{id:'text',kind:'paragraph',text:'こんにちは'}]}];
const proposed=sections=>({id:'synthetic-proposed',family:'article',title:'TEST ONLY staged attachment',body:'',sections,links:[],rev:1,createdAt:'',updatedAt:'',trashedAt:null,actor:'user',synthetic:true});

test('adding a staged media proposal to actual rich editor renders closed preview without a workspace-scope crash',()=>{
 assert.doesNotThrow(()=>editor(base,ownerScope));
 const next=base.map(section=>({...section,parts:[...section.parts,part]}));
 const html=editor(next,ownerScope);assert.match(html,/Preview layout/);assert.match(html,/Draft audio attachment/);assert.match(html,/metadata only/);assert.match(html,/こんにちは/);assert.doesNotMatch(html,/src="\/api\/media|>Load audio<|Private media details|Stop display permanently/);
 assert.equal(next[0].parts[1].media.assetId,attachment.assetId,'Rendering must retain the original staged attachment identity.');
});

test('attached preview uses the supplied restored scope while retaining current-read checks and excluding management writes',()=>{
 const attached={...part,mediaDisplay:{mime:'audio/wav',kind:'audio',bytes:29030,details:{format:'16-bit PCM WAV',durationSeconds:.90475}}};
 const html=preview(proposed([{...base[0],parts:[attached]}]),ownerScope);assert.match(html,/>Load audio<\/button>/);assert.doesNotMatch(html,/disabled=""[^>]*>Load audio|Private media details|Stop display permanently|<audio\b|src=/);
 assert.throws(()=>preview(proposed([{...base[0],parts:[attached]}]),'bad\u0000scope'),/bounded authenticated workspace scope/,'An attached read must use the supplied scope, never a fabricated replacement.');
});

test('scope-free proposals and newly staged images stay metadata-only; unavailable metadata is withheld',()=>{
 const image={id:'new-image',kind:'image',image:{assetId:'image-synthetic',alt:'A new private image.',caption:'Draft caption.'},text:'A new private image.\nDraft caption.'};
 const html=local([{...base[0],parts:[part,image]}]);assert.match(html,/Draft audio attachment/);assert.match(html,/Draft image attachment/);assert.doesNotMatch(html,/<(?:audio|video|img)\b|\/api\/assets|\/api\/media/);
 const hidden=preview(proposed([{...base[0],parts:[{...part,unavailable:true}]}]),ownerScope);assert.match(hidden,/Attachment unavailable/);assert.doesNotMatch(hidden,/Licensed synthetic greeting|Original speaker|こんにちは/);
});

test('read-only media preview suppresses mutation controls without changing ordinary canonical media management',()=>{
 assert.doesNotMatch(media(attachment,ownerScope,true),/Private media details|Stop display permanently|Check current attachment/);
 assert.match(media(attachment,ownerScope,false),/Private media details/);
});
