import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordDisplayTitle,savedConnectionPreview,savedWorkCardPreview,syntheticPresentationIntro} from '../lib/record-display.ts';

test('synthetic acceptance labels are presentation-only, with exact titles preserved',()=>{
 const source='TEST — The Mystery of the Dying Garden Pond';
 assert.equal(recordDisplayTitle(source,true),'The Mystery of the Dying Garden Pond');
 assert.equal(source,'TEST — The Mystery of the Dying Garden Pond');
 assert.equal(recordDisplayTitle('TEST ONLY · Japanese Live (TEST ONLY)',true),'Japanese Live');
 assert.equal(recordDisplayTitle('Framing and attention (independent Note · TEST ONLY)',true),'Framing and attention (independent Note)');
 assert.equal(recordDisplayTitle('TEST — The Mystery',false),'TEST — The Mystery');
 assert.equal(recordDisplayTitle('A real test of framing',true),'A real test of framing');
});

test('connection snippets skip duplicate Markdown headings without inventing content',()=>{
 assert.equal(savedConnectionPreview('# Study (TEST ONLY)\n\n**Provenance.** GPT-authored reasoning.\n\nA second paragraph.'),'Provenance. GPT-authored reasoning.');
 assert.equal(savedConnectionPreview('This is a [link](https://example.test) and `name`.'),'This is a link and name.');
});

test('only explicit synthetic preambles are folded, preserving exact source prose',()=>{
 const body='TEST ONLY — Constructed conversation examples. No learner session is asserted.';
 assert.equal(syntheticPresentationIntro({synthetic:true,body}),true);
 assert.equal(syntheticPresentationIntro({synthetic:false,body}),false);
 assert.equal(syntheticPresentationIntro({synthetic:true,body:'A substantive hypothesis about competing frames.'}),false);
 assert.equal(syntheticPresentationIntro({synthetic:true,body:'TEST ONLY · synthetic record. This content is for visual acceptance, not genuine learner progress.'}),true);
});

test('personal work cards surface the inquiry without reprinting a synthetic provenance preamble',()=>{
 const markdown='# Framing and attention (TEST ONLY)\n\n**Provenance.** GPT-authored synthetic design reasoning; no photography observed.\n\n## A question worth keeping open\n\nImagine a portrait with a light strip entering from the left.\n\n## Revision\n\nThe strip might compete for attention.';
 assert.equal(savedWorkCardPreview(markdown,true),'Imagine a portrait with a light strip entering from the left.');
 assert.equal(savedWorkCardPreview(markdown,false),'Provenance. GPT-authored synthetic design reasoning; no photography observed.');
 const full=markdown; savedWorkCardPreview(full,true); assert.equal(markdown,full);
});
