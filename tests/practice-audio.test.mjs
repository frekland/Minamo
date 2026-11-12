import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json')),{build}=wr('esbuild');
const built=await build({stdin:{contents:'import React from "react";import{renderToStaticMarkup}from"react-dom/server";import PracticeAudio from "./app/practice-audio";import PracticeRecorder from "./app/practice-recorder";export * from "./lib/practice-audio";export{inspectMedia}from"./lib/media-formats";export function render(block){return renderToStaticMarkup(React.createElement(PracticeAudio,{block,ownerScope:"synthetic-owner"}));}export function recorder(){return renderToStaticMarkup(React.createElement(PracticeRecorder,{onFile:()=>{}}));}',resolveDir:process.cwd()},bundle:true,format:'cjs',platform:'node',write:false,loader:{'.css':'empty'},define:{'process.env.NODE_ENV':'"production"'}});
const dir=mkdtempSync(join(tmpdir(),'practice-audio-')),entry=join(dir,'audio.cjs');writeFileSync(entry,built.outputFiles[0].text);const {validateListeningBlock,validateListeningTranscript,validateListeningInteraction,dictationDifference,recordingPcm,recordingWav,inspectMedia,render,recorder}=require(entry);rmSync(dir,{recursive:true,force:true});
const sample={id:'listen',kind:'listening',version:1,language:'ja',media:{assetId:'media-synthetic',revision:1,digest:'a'.repeat(64),durationSeconds:2},transcript:{ref:{family:'article',id:'source',rendition:'r-source',sectionId:'text',partId:'greeting'},text:'こんにちは😀'},segments:[{id:'greeting',start:0,end:2,textStart:0,textEnd:7,translation:'Hello.'}],provenance:'authored-reference'};

test('listening requires exact bounded audio times and intact transcript Unicode',()=>{
 assert.equal(validateListeningBlock(sample).transcript.text,'こんにちは😀');
 for(const segment of [{...sample.segments[0],start:2,end:1},{...sample.segments[0],end:3},{...sample.segments[0],textEnd:6},{...sample.segments[0],textEnd:100},{...sample.segments[0],start:NaN}])assert.throws(()=>validateListeningBlock({...sample,segments:[segment]}));
 assert.throws(()=>validateListeningBlock({...sample,segments:[sample.segments[0],{...sample.segments[0],start:1,end:2}]}));
 assert.throws(()=>validateListeningBlock({...sample,callback:'fetch credentials'}));
});

test('transcript edition/range source is an actual eligible source part',()=>{
 const record={id:'source',family:'article',rendition:'r-source',sections:[{id:'text',title:'Greeting',parts:[{id:'greeting',kind:'paragraph',text:'こんにちは😀'}]}],trashedAt:null};
 assert.doesNotThrow(()=>validateListeningTranscript(sample,record));
 for(const changed of [null,{...record,rendition:'new-edition'},{...record,trashedAt:'2026-10-26'}, {...record,sections:[{id:'text',parts:[{id:'greeting',kind:'paragraph',text:'こんにちは😀',unavailable:true}]}]},{...record,sections:[{id:'text',parts:[{id:'greeting',kind:'paragraph',text:'unrelated'}]}]}])assert.throws(()=>validateListeningTranscript(sample,changed));
});

test('initial listening and recorder renders do not auto-load bytes or reveal transcript',()=>{
 const html=render(sample);assert.match(html,/Play selected segment/);assert.match(html,/Your dictation/);assert.doesNotMatch(html,/こんにちは|Hello\.|src=|media-synthetic/);assert.match(html,/disabled=""[^>]*>Compare with transcript/);
 const capture=recorder();assert.match(capture,/Start local recording/);assert.match(capture,/60 seconds/);assert.doesNotMatch(capture,/<audio|src=/);
});

test('recording conversion yields server-admitted PCM WAV with bounded channels/duration',()=>{
 const input=[Float32Array.from([-.5,0,.5,1]),Float32Array.from([.5,0,.5,-1])],pcm=recordingPcm(input,16000);assert.deepEqual([...pcm.samples],[0,0,.5,0]);const wav=recordingWav(pcm.samples,pcm.sampleRate),result=inspectMedia(wav,'audio/wav');assert.equal(result.kind,'audio');assert.equal(result.details.channels,1);assert.equal(result.details.sampleRate,16000);assert.equal(result.details.durationSeconds,4/16000);
 assert.throws(()=>recordingPcm([],16000));assert.throws(()=>recordingPcm([Float32Array.of(NaN)],16000));assert.throws(()=>recordingPcm([new Float32Array(61*8000)],8000));assert.throws(()=>recordingWav(Float32Array.of(2),8000));assert.throws(()=>recordingWav(new Float32Array(61*8000),8000));
 assert.equal(recordingPcm([new Float32Array(96000)],96000).samples.length,48000);
});

test('dictation NFC comparison preserves Greek input and never flattens accents or Swedish letters',()=>{
 const actual='α\u0301';const result=dictationDifference(actual,'ά');assert.equal(result.actual,actual);assert.equal(result.exact,false);assert.equal(result.nfcEquivalent,true);assert.equal(dictationDifference('a','å').nfcEquivalent,false);assert.equal(dictationDifference('ou','où').exact,false);
});

test('saved listening facts name a real segment and retain exact bounded original input',()=>{
 const events=[{type:'segment',value:'greeting'},{type:'dictation-input',value:'こんいちは'},{type:'transcript-revealed',value:'false'},{type:'compared',value:'false'}];assert.deepEqual(validateListeningInteraction(sample,events),events);
 assert.throws(()=>validateListeningInteraction(sample,[...events,{type:'mastered',value:'true'}]));assert.throws(()=>validateListeningInteraction(sample,events.map(e=>e.type==='segment'?{...e,value:'foreign'}:e)));assert.throws(()=>validateListeningInteraction(sample,events.map(e=>e.type==='compared'?{...e,value:'guessed'}:e)));assert.throws(()=>validateListeningInteraction(sample,events.map(e=>e.type==='dictation-input'?{...e,value:'x'.repeat(2001)}:e)));
});

test('licensed human speech fixtures pin actual hashes, durations and transcript provenance',()=>{
 const manifest=JSON.parse(readFileSync('tests/fixtures/practice-audio/manifest.json','utf8'));assert.deepEqual(manifest.map(f=>f.transcript),['こんにちは','你好']);
 for(const fixture of manifest){const bytes=new Uint8Array(readFileSync('tests/fixtures/practice-audio/'+fixture.filename));assert.equal(createHash('sha256').update(bytes).digest('hex'),fixture.sha256);const inspected=inspectMedia(bytes,'audio/wav');assert.equal(inspected.details.durationSeconds,fixture.durationSeconds);assert.equal(fixture.license,'CC-BY-SA-3.0');assert.ok(fixture.author);assert.match(fixture.source,/commons\.wikimedia\.org/);assert.ok(bytes.length>1000);}
});
