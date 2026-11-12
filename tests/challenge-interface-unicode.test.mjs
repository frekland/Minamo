import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const built=await wr('esbuild').build({stdin:{contents:'export {readActivityDraft} from "./app/activity-studio-state.ts";export {validateActivityAttempt} from "./lib/activity/schema.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const api=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));

test('recovered long multilingual drafts remain admissible without introducing a lone UTF-16 surrogate',()=>{
 const limits={prediction:4000,reflection:8000,nextIntention:2000,terminal:20000};
 const input=Object.fromEntries(Object.entries(limits).map(([field,limit])=>[field,'x'.repeat(limit-1)+'😀日本語']));
 const recovered=api.readActivityDraft(JSON.stringify(input));
 for(const [field,limit]of Object.entries(limits)){
  assert.ok(recovered[field].length<=limit,field+' remains bounded');
  assert.equal(recovered[field].isWellFormed(),true,field+' must not split the supplied emoji');
  assert.ok(input[field].startsWith(recovered[field]),field+' retains an exact prefix, without replacement characters');
 }
 const attempt=api.validateActivityAttempt({contract:'minamo.attempt.v1',activity:{family:'experiment',id:'TEST-only',rendition:'r-exact'},state:'submitted',prediction:recovered.prediction,reflection:recovered.reflection,nextIntention:recovered.nextIntention,evidence:[{classification:'supplied-terminal',text:recovered.terminal}],hintsRevealed:[]});
 assert.equal(attempt.evidence[0].text,recovered.terminal);
});

test('ordinary supplied CRLF, tabs, combining marks and emoji recover byte-for-byte as text within the supported limit',()=>{
 const terminal='$ printf supplied\r\n\tあ😀e\u0301\r\nnot observed execution\r\n';
 const recovered=api.readActivityDraft(JSON.stringify({terminal,prediction:'まだ分からない😀'}));
 assert.equal(recovered.terminal,terminal);assert.equal(recovered.prediction,'まだ分からない😀');
});
