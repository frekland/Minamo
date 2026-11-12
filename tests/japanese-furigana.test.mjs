import test from 'node:test';
import assert from 'node:assert/strict';
import {alignedJapaneseRuns,japaneseFuriganaRuns} from '../lib/japanese-furigana.ts';

test('C3: ruby annotates kanji rather than kana and retains literal source',()=>{
 const parts=alignedJapaneseRuns('終わった','おわった');
 assert.deepEqual(parts,[{text:'終',reading:'お'},{text:'わった'}]);
 const source='仕事が終わったあとで、日本語を勉強します。';
 const runs=japaneseFuriganaRuns(source);
 assert.equal(runs.map(run=>run.text).join(''),source);
 assert.ok(runs.some(run=>run.text==='仕事'&&run.reading==='しごと'));
 assert.ok(runs.every(run=>!run.reading||/[\p{Script=Han}]/u.test(run.text)));
 const dialogue=japaneseFuriganaRuns('いろいろな国の人と自然に話してみたいです。');
 assert.deepEqual(dialogue.filter(run=>run.reading),[{text:'国',reading:'くに'},{text:'人',reading:'ひと'},{text:'自然',reading:'しぜん'},{text:'話',reading:'はな'}]);
 assert.deepEqual(alignedJapaneseRuns('食べる','ちがいます'),[{text:'食べる'}]);
 assert.deepEqual(japaneseFuriganaRuns('未知の単語'),[{text:'未知の単語'}]);
});

test('contextual compounds and explicit readings never receive conflicting partial readings',()=>{
 assert.deepEqual(japaneseFuriganaRuns('今朝'),[{text:'今朝',reading:'けさ'}]);
 assert.deepEqual(japaneseFuriganaRuns('何時'),[{text:'何時',reading:'なんじ'}]);
 for(const text of ['日本語（にほんご）','今朝（けさ）','何時(なんじ)','朝日'])assert.equal(japaneseFuriganaRuns(text).some(run=>run.reading),false);
});
