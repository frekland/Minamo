import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import NoteMarkdownView from './app/note-markdown-view.tsx';export {noteVideoReference} from './lib/note-video';export {noteMarkdownText} from './lib/note-markdown';export const render=source=>renderToStaticMarkup(React.createElement(NoteMarkdownView,{source,mapRange:(start,end)=>({'data-start':start,'data-end':end})}));`,resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'error'});
const dir=mkdtempSync(join(tmpdir(),'note-video-')),file=join(dir,'ui.cjs');writeFileSync(file,built.outputFiles[0].text);const api=require(file);rmSync(dir,{recursive:true,force:true});
const url='https://www.youtube.com/watch?v=c_ioEqX7NFE&pp=ugUEEgJlbg%3D%3D';
test('standalone pasted provider URLs and Markdown links resolve only exact validated video IDs',()=>{
 for(const source of [url,'['+url+']('+url.replace('&','\\&')+')','https://youtu.be/c_ioEqX7NFE','https://www.youtube.com/shorts/c_ioEqX7NFE','https://vimeo.com/76979871']){
  const result=api.noteVideoReference(source);assert.ok(result,source);assert.equal(result.video.embed,true);assert.match(result.referenceUrl,/^(https:\/\/www.youtube.com\/watch\?v=c_ioEqX7NFE|https:\/\/vimeo.com\/76979871)$/);
 }
 for(const source of ['See '+url,url+' extra','javascript:alert(1)','https://youtube.com.evil.test/watch?v=c_ioEqX7NFE','https://user:pass@youtube.com/watch?v=c_ioEqX7NFE','https://www.youtube.com/watch?v=c_ioEqX7NFE&v=otherVideo1','https://www.youtube.com/watch?v=c_ioEqX7NFE&list=123','https://www.youtube.com/channel/c_ioEqX7NFE','https://example.com/video.mp4'])assert.equal(api.noteVideoReference(source),null,source);
});
test('Note preview embeds a standalone video without changing canonical text ranges',()=>{
 for(const source of [url,'[Watch this explanation]('+url+')']){
  const html=api.render(source),text=api.noteMarkdownText(source);assert.match(html,/<iframe[^>]*src="https:\/\/www.youtube-nocookie.com\/embed\/c_ioEqX7NFE\?autoplay=0/);assert.match(html,new RegExp('data-start="0" data-end="'+text.length+'"'));assert.ok(html.includes(text.replaceAll('&','&amp;')));assert.doesNotMatch(html,/Load player|autoplay=1/);
 }
 assert.doesNotMatch(api.render('See '+url),/<iframe/);assert.doesNotMatch(api.render('```text\n'+url+'\n```'),/<iframe/);
});
