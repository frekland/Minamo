import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),wr=createRequire(require.resolve('wrangler/package.json'));
const {build}=wr('esbuild');
const bundled=await build({entryPoints:['lib/source-reference.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {resolveSourceReference}=await import('data:text/javascript;base64,'+Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const sha='a'.repeat(40),other='b'.repeat(40);
test('full pinned GitHub blob URL retains exact path, query and line fragment',()=>{
 const url=`https://github.com/example/repo/blob/${sha}/src/file.ts?plain=1#L12-L24`;
 const result=resolveSourceReference({url,commit:sha});assert.equal(result.kind,'immutable-github-url');assert.equal(result.href,url);assert.equal(result.urlCommit,sha);assert.deepEqual(result.lines,{start:12,end:24});
});
test('commit can be established from a full SHA already in the URL, without invented metadata',()=>{
 const result=resolveSourceReference({url:`https://github.com/example/repo/blob/${sha}/file.ts#L2`});assert.equal(result.kind,'immutable-github-url');assert.equal(result.declaredCommit,undefined);assert.deepEqual(result.lines,{start:2,end:2});
});
test('mutable and slash-branch URLs are retained unchanged instead of guessing source paths',()=>{
 for(const path of ['main/src/file.ts','feature/long/name/src/file.ts','feature%2Flong%2Fname/src/file.ts']){
 const url=`https://github.com/example/repo/blob/${path}#L5`;const result=resolveSourceReference({url,commit:sha});assert.equal(result.kind,'original-reference');assert.equal(result.href,url);assert.equal(result.declaredCommit,sha);assert.equal(result.reason,'mutable-or-ambiguous-github-reference');
 }
});
test('declared commit mismatch is visible and never relabels the original URL as the declared revision',()=>{
 const result=resolveSourceReference({url:`https://github.com/example/repo/blob/${sha}/file.ts`,commit:other});assert.equal(result.kind,'original-reference');assert.equal(result.reason,'declared-commit-mismatch');assert.equal(result.urlCommit,sha);assert.equal(result.declaredCommit,other);
});
test('a commit appearing in a filename, query, fragment or directory URL is not a pinned code link',()=>{
 for(const url of [`https://github.com/example/repo/blob/main/${sha}/file.ts`,`https://github.com/example/repo/blob/main/file.ts?commit=${sha}`,`https://github.com/example/repo/blob/main/file.ts#${sha}`,`https://github.com/example/repo/tree/${sha}/src`])assert.equal(resolveSourceReference({url,commit:sha}).kind,'original-reference');
});
test('GitHub-like hosts, encoded separators, short hashes and malformed line ranges make no extra claims',()=>{
 for(const url of [`https://github.com.evil.invalid/example/repo/blob/${sha}/file.ts`,`https://github.com/example/repo/blob/${sha}/src%2Ffile.ts`,`https://github.com/example/repo/blob/abcdef1/file.ts`])assert.equal(resolveSourceReference({url}).kind,'original-reference');
 const reversed=resolveSourceReference({url:`https://github.com/example/repo/blob/${sha}/file.ts#L20-L4`});assert.equal(reversed.kind,'immutable-github-url');assert.equal(reversed.lines,undefined);assert.ok(reversed.href.endsWith('#L20-L4'));
});
test('unsafe schemes and credential-bearing URLs are never rendered as links',()=>{
 for(const url of ['javascript:alert(1)','data:text/html,hello','http://github.com/example/repo','https://user:password@github.com/example/repo','not a URL'])assert.deepEqual(resolveSourceReference({url}),{kind:'invalid',href:null,reason:'unsafe-url'});
});
test('invalid declared commit metadata remains a fallback rather than an immutable claim',()=>{
 const result=resolveSourceReference({url:`https://github.com/example/repo/blob/${sha}/file.ts`,commit:'abc123'});assert.equal(result.kind,'original-reference');assert.equal(result.reason,'invalid-declared-commit');assert.equal(result.declaredCommit,'abc123');
});
